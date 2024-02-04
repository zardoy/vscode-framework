/* eslint-disable no-await-in-loop */
import fs from 'fs'
import { join } from 'path'
import Debug from '@prisma/debug'
import { build as esbuildBuild, analyzeMetafile } from 'esbuild'
import filesize from 'filesize'
import kleur from 'kleur'
import { defaultsDeep, omit, partition } from 'lodash'
import { ManifestType } from 'vscode-manifest'
import { BuildTargetType, Config, getBootstrapFeature } from '../../config'
import { getHashFromString, MaybePromise } from '../../util'
import { clearConsole, logConsole } from '../logger'
import { ModeType, EXTENSION_ENTRYPOINTS } from '../commands/build'
import { esbuildDefineEnv } from './utils'

const debug = Debug('vscode-framework:esbuild')

/** Always injected for framework functionality */
const topLevelInjectedCode = `let __VSCODE_FRAMEWORK_CONTEXT;\n`

export const runEsbuild = async ({
    target,
    mode,
    outDir,
    afterSuccessfulBuild = () => {},
    defineEnv,
    resolvedManifest,
    injectConsole,
    config,
}: {
    target: BuildTargetType
    mode: ModeType
    outDir: string
    afterSuccessfulBuild?: (buildCount: number) => MaybePromise<void>
    defineEnv: Record<string, any>
    resolvedManifest: ManifestType
    injectConsole: boolean
    config: Config
}) => {
    const esbuildConfig: Config['esbuild'] = defaultsDeep(
        config.esbuild[mode] ?? {},
        omit(config.esbuild, ['development', 'production']),
    )
    const extensionEntryPoint = esbuildConfig.entryPoint
    const realEntryPoint = join(__dirname, '../../extensionBootstrap.ts')
    debug('Esbuild starting...')
    debug('Entry points', {
        real: realEntryPoint,
        extension: extensionEntryPoint,
    })
    debug({
        target,
        injectConsole,
        outDir,
        defineEnv,
    })
    const consoleInjectCode = injectConsole
        ? await fs.promises.readFile(join(__dirname, './consoleInject.js'), 'utf-8')
        : ''
    // lodash-marker
    const { metafile, stop } = await esbuildBuild({
        bundle: true,
        // latest is assumed if web
        target: target === 'desktop' ? 'node16' : undefined,
        watch: mode === 'development',
        minify: mode === 'production',
        platform: target === 'desktop' ? 'node' : 'browser',
        outfile: join(outDir, target === 'desktop' ? EXTENSION_ENTRYPOINTS.node : EXTENSION_ENTRYPOINTS.web),
        format: 'cjs',
        entryPoints: [realEntryPoint],
        mainFields: ['module', 'main'],
        metafile: true,
        ...omit(esbuildConfig, 'entryPoint', 'defineEnv'),
        write: false,
        // sourcemap: true,
        external: ['vscode', ...(esbuildConfig.external ?? [])],
        define: {
            ...esbuildDefineEnv({
                NODE_ENV: mode,
                // TODO remove them
                EXTENSION_ID_NAME: resolvedManifest.name,
                EXTENSION_DISPLAY_NAME: resolvedManifest.displayName,
                // 'REVEAL_OUTPUT_PANEL_IN_DEVELOPMENT': true,
                PLATFORM: target === 'desktop' ? 'node' : 'web',
                EXTENSION_ENTRYPOINT: join(process.cwd(), extensionEntryPoint),
                ...esbuildConfig.defineEnv,
                ...defineEnv,
            }),
            ...(mode === 'production'
                ? {
                      EXTENSION_BOOTSTRAP_CONFIG: null as any,
                  }
                : {}),
            ...esbuildConfig.define,
        },
        plugins: [
            {
                name: 'build-watcher',
                setup(build) {
                    let rebuildCount = 0
                    let date: number
                    let prevHashOutput: string | undefined
                    build.onStart(() => {
                        date = Date.now()
                        if (!debug.enabled) clearConsole(true, false)
                    })
                    build.onEnd(async ({ errors, outputFiles }) => {
                        if (errors.length > 0) {
                            console.log(kleur.bgRed().white(` BUILD ERRORS: ${errors.length} `))
                            return
                        }

                        const [sourceMaps, jsFiles] = partition(outputFiles, ({ path }) => path.endsWith('.map'))
                        const sourceMapsEnabled = sourceMaps.length > 0
                        for (const sourcemap of sourceMaps)
                            await fs.promises.writeFile(sourcemap.path, sourcemap.contents)

                        const outputFile = jsFiles[0]!
                        const newHashOutput = getHashFromString(outputFile.text)
                        // 1. Sometimes esbuild does rebulid when you change file outside src/ (suppose it's a bug)
                        // 2. Esbulid emits rebuild when you save file, but output size remains the same e.g. you if you format the file
                        // size isn't changed = code isn't changed so we don't need to emit reload
                        if (newHashOutput === prevHashOutput) {
                            // to reformat message
                            logConsole('log', 'No new changes')
                            return
                        }

                        prevHashOutput = newHashOutput
                        // investigate performance
                        let codeToInject = `${topLevelInjectedCode}${consoleInjectCode}\n`
                        if (sourceMapsEnabled) codeToInject = codeToInject.replace(/\n/g, '')
                        debug('Start writing with inject')
                        await fs.promises.writeFile(
                            outputFile.path,
                            // using this workaround as we can't use shim in esbuild: https://github.com/evanw/esbuild/issues/1557
                            `${codeToInject}${outputFile.text}`,
                            'utf-8',
                        )
                        debug('End writing with inject')

                        const reloadType = getBootstrapFeature(
                            config,
                            ({ autoReload }) => autoReload && autoReload.type,
                        )
                        logConsole(
                            'log',
                            kleur.green(
                                rebuildCount === 0
                                    ? 'build'
                                    : reloadType === 'forced'
                                    ? 'reload'
                                    : // : reloadType === 'hot'
                                      // ? 'hot-reload'
                                      'rebuild',
                            ),
                            kleur.gray(`${Date.now() - date}ms`),
                            // ...(reloadType === 'force'
                            //     ? [kleur.green('Reloading...')]
                            //     : reloadType === 'hot'
                            //     ? [kleur.dim().green('Hot reloading...')]
                            //     : []),
                        )
                        debug('afterSuccessfulBuild called')
                        await afterSuccessfulBuild(rebuildCount++)
                    })
                },
            },
            ...(esbuildConfig.plugins ?? []),
        ],
    })
    // TODO output packed file and this file sizes at prod
    if (mode === 'production' && metafile) {
        const outputSize = Object.entries(metafile.outputs)[0]![1]!.bytes
        console.log(await analyzeMetafile(metafile))
        // TODO output real size
        console.log('Production build size:', kleur.bold().cyan(filesize(outputSize)))
    }

    return { stop }
}
