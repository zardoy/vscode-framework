import fs from 'fs'
import { join } from 'path'
import { build as esbuildBuild } from 'esbuild'
import escapeStringRegexp from 'escape-string-regexp'
import kleur from 'kleur'
import { ManifestType } from 'vscode-manifest'
import Debug from '@prisma/debug'
import filesize from 'filesize'
import { BuildTargetType, Config } from '../../config'
import { clearConsole, logConsole } from '../logger'
import { EXTENSION_ENTRYPOINTS, ModeType } from '../buildExtension'
import { esbuildDefineEnv } from './utils'

type MaybePromise<T> = Promise<T> | T

const debug = Debug('vscode-framework:esbuild')

/** Always injected for framework functionality */
const injectedCode = `let __VSCODE_FRAMEWORK_CONTEXT\n`

export const runEsbuild = async ({
    target,
    mode,
    outDir,
    afterSuccessfulBuild = () => {},
    overrideBuildConfig = {},
    resolvedManifest,
    injectConsole,
}: {
    target: BuildTargetType
    mode: ModeType
    outDir: string
    afterSuccessfulBuild: (buildCount: number) => MaybePromise<void>
    overrideBuildConfig: Config['esbuildConfig']
    resolvedManifest: ManifestType
    injectConsole: boolean
}) => {
    const extensionEntryPoint = 'src/extension.ts'
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
        overrideBuildConfig,
    })
    const consoleInjectCode = injectConsole
        ? await fs.promises.readFile(join(__dirname, './consoleInject.js'), 'utf-8')
        : undefined
    // lodash-marker
    const { metafile, stop } = await esbuildBuild({
        bundle: true,
        // latest is assumed if web
        target: target === 'desktop' ? 'node14' : undefined,
        watch: mode === 'development',
        minify: mode === 'production',
        platform: target === 'desktop' ? 'node' : 'browser',
        outfile: join(outDir, target === 'desktop' ? EXTENSION_ENTRYPOINTS.node : EXTENSION_ENTRYPOINTS.web),
        format: 'cjs',
        entryPoints: [realEntryPoint],
        metafile: true,
        ...overrideBuildConfig,
        write: false,
        // sourcemap: true,
        external: ['vscode', '@hediet/node-reload', ...(overrideBuildConfig.external ?? [])],
        define: {
            ...esbuildDefineEnv({
                NODE_ENV: mode,
                // TODO remove them
                EXTENSION_ID_NAME: resolvedManifest.name,
                EXTENSION_DISPLAY_NAME: resolvedManifest.displayName,
                // 'REVEAL_OUTPUT_PANEL_IN_DEVELOPMENT': true,
                PLATFORM: target === 'desktop' ? 'node' : 'web',
                EXTENSION_ENTRYPOINT: join(process.cwd(), extensionEntryPoint),
                ...overrideBuildConfig.define,
            }),
        },
        plugins: [
            {
                name: 'build-watcher',
                setup(build) {
                    let rebuildCount = 0
                    let date: number
                    build.onStart(() => {
                        date = Date.now()
                        if (!debug.enabled) clearConsole(true, false)
                    })
                    build.onEnd(async ({ errors, outputFiles }) => {
                        if (errors.length > 0) {
                            console.log(kleur.bgRed().white(` BUILD ERRORS: ${errors.length} `))
                            return
                        }

                        // using this workaround as we can't use shim in esbuild: https://github.com/evanw/esbuild/issues/1557
                        const outputFile = outputFiles![0]!
                        // investigate performance
                        debug('Start writing with inject')
                        await fs.promises.writeFile(
                            outputFile.path,
                            `${injectedCode}${consoleInjectCode ?? ''}\n${outputFile.text}`,
                            'utf-8',
                        )
                        debug('End writing with inject')

                        // TODO no=rebuild / hot-reload / reload
                        const reloadType = ''
                        logConsole(
                            'log',
                            kleur.green(rebuildCount === 0 ? 'build' : 'rebuild'),
                            kleur.gray(`${Date.now() - date}ms`),
                        )
                        debug('afterSuccessfulBuild called')
                        await afterSuccessfulBuild(rebuildCount++)
                    })
                },
            },
            {
                // there must be cleaner solution
                name: 'esbuild-import-alias',
                setup(build) {
                    // not used for now, config option will be available
                    const aliasModule = (aliasName: string | RegExp, target: string) => {
                        const filter =
                            aliasModule instanceof RegExp
                                ? aliasModule
                                : new RegExp(`^${escapeStringRegexp(aliasName as string)}(\\/.*)?$`)
                        type PluginData = { resolveDir: string; aliasName: string }
                        const namespace = 'esbuild-import-alias'

                        build.onResolve({ filter }, async ({ resolveDir, path }) => {
                            if (resolveDir === '') return
                            return {
                                path,
                                namespace,
                                pluginData: {
                                    aliasName,
                                    resolveDir,
                                } as PluginData,
                            }
                        })
                        build.onLoad({ filter: /.*/, namespace }, async ({ path, pluginData: pluginDataUntyped }) => {
                            const { aliasName, resolveDir }: PluginData = pluginDataUntyped
                            const contents = [
                                `export * from '${path.replace(aliasName, target)}'`,
                                `export { default } from '${path.replace(aliasName, target)}';`,
                            ].join('\n')
                            return { contents, resolveDir }
                        })
                    }
                },
            },
            {
                name: 'esbuild-node-alias',
                setup(build) {
                    const namespace = 'esbuild-node-alias'
                    const filter = /^node:(.*)/
                    build.onResolve({ filter }, async ({ path, resolveDir }) => ({
                        path,
                        namespace,
                        pluginData: {
                            resolveDir,
                        },
                    }))
                    build.onLoad({ filter: /.*/, namespace }, async ({ path, pluginData: { resolveDir } }) => {
                        const target = path.replace(filter, '$1')
                        const contents = [`export * from '${target}'`, `export { default } from '${target}';`].join(
                            '\n',
                        )
                        return { resolveDir, contents }
                    })
                },
            },
        ],
        ...(overrideBuildConfig.plugins ?? []),
    })
    // TODO output packed file and this file sizes at prod
    if (mode === 'production') {
        const outputSize = Object.entries(metafile!.outputs)[0]![1]!.bytes
        // TODO output real size
        console.log('Production build size:', kleur.bold().cyan(filesize(outputSize)))
    }

    return { stop }
}
