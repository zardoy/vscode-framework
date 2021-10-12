import fs from 'fs'
import { join, resolve } from 'path'
import Debug from '@prisma/debug'
import { build as esbuildBuild } from 'esbuild'
import escapeStringRegexp from 'escape-string-regexp'
import fsExtra from 'fs-extra'
import kleur from 'kleur'
import { defaultsDeep } from 'lodash'
import { nanoid } from 'nanoid'
import { ManifestType } from 'vscode-manifest'
import { BuildTargetType, Config } from '../config'
import { LauncherCLIParams, launchVscode } from './launcher'
import { generateAndWriteManifest } from './manifest-generator'

const debug = Debug('vscode-framework:esbuild')

/** for ipc. used in extensionBootstrap.ts */
export type BootstrapConfig = Exclude<Config['development']['extensionBootstrap'], false> & { serverIpcChannel: string }

type ModeType = 'development' | 'production'

/** does watch only in `development` mode actually */
export const buildExtensionAndWatch = async (params: Parameters<typeof buildExtension>[0]) => {
    const { mode, outDir } = params
    // TODO export two?
    // if (params.mode !== 'development') throw new Error('Watch is allowed only in development mode')
    debug('Building extension', {
        mode,
        outDir,
    })
    if (mode === 'production') {
        await buildExtension(params)
        return
    }

    let stopEsbuild: (() => void) | undefined
    const restartBuild = async () => {
        if (stopEsbuild) stopEsbuild()
        stopEsbuild = (await buildExtension(params)).stop
    }

    await restartBuild()
    let throttled = false
    const manifestPath = './package.json'
    // it would still restart esbuild on ctrl+s on file
    const manifestWatcher = fs.watch(manifestPath, async () => {
        if (throttled) return
        throttled = true
        setTimeout(() => {
            throttled = false
        }, 200)
        if (fs.existsSync(manifestPath)) {
            await restartBuild()
            // investigate clearing console here

            console.log('[vscode-framework] Manifest updated.')
        } else {
            console.log(kleur.red('[vscode-framework] Manifest is missing! Return it back.'))
        }
    })
    return {
        manifestWatcher,
        stopEsbuild,
    }
}

const buildExtension = async ({
    mode,
    target,
    config,
    outDir,
    launchVscodeParams,
}: {
    config: Config
    mode: ModeType
    target: BuildTargetType
    outDir: string
    /** Config for handling vscode launch, pass `false` to skip launching */
    launchVscodeParams: LauncherCLIParams | false
}) => {
    await fsExtra.ensureDir(outDir)

    // #region prepare bootstrap config
    const enableBootstrap = launchVscodeParams !== false && config.development.extensionBootstrap
    let serverIpcChannel: undefined | string
    if (enableBootstrap) {
        await fsExtra.copy(require.resolve('../extensionBootstrap'), resolve(outDir, 'extensionBootstrap.js'))
        serverIpcChannel = `vscode-framework:server_${nanoid(5)}`
    }
    // #endregion

    // -> MANIFEST
    const generatedManifest = await generateAndWriteManifest({
        outputPath: join(outDir, 'package.json'),
        overwrite: true,
        config:
            mode === 'development'
                ? {
                      ...config,
                      // TS is literally killing the target type!
                      target: { [target]: true } as any,
                  }
                : config,
    })
    if (!generatedManifest) throw new Error('Extension manifest (package.json) is missing.')

    // -> POST MANIFEST CHECKS
    if (generatedManifest.extensionKind?.length === 0)
        // TODO also detect other cases
        console.warn("Warning: extensionKind in manifest is set to [] which means your extension won't be launched")

    // -> ASSETS
    // TODO

    // -> EXTENSION ENTRYPOINT
    return runEsbuild({
        target,
        mode,
        outDir,
        resolvedManifest: generatedManifest,
        async afterSuccessfulBuild(rebuildCount) {
            if (mode !== 'development' || launchVscodeParams === false || rebuildCount > 0) return
            await launchVscode(outDir, {
                ...launchVscodeParams,
                // TS doesn't see target override ???
                // ...config,
                development: config.development,
                serverIpcChannel: serverIpcChannel ?? false,
            })
        },
        overrideBuildConfig: defaultsDeep(
            serverIpcChannel
                ? {
                      define: {
                          'process.env.EXTENSION_BOOTSTRAP_CONFIG': `"${JSON.stringify({
                              ...launchVscodeParams,
                              serverIpcChannel,
                          } as BootstrapConfig)}"`,
                      },
                  }
                : {},
            config.esbuildConfig,
        ),
    })
}

type MaybePromise<T> = Promise<T> | T

export const runEsbuild = async ({
    target,
    mode,
    outDir,
    afterSuccessfulBuild = () => {},
    overrideBuildConfig = {},
    resolvedManifest,
}: {
    target: BuildTargetType
    mode: ModeType
    outDir: string
    afterSuccessfulBuild: (buildCount: number) => MaybePromise<void>
    overrideBuildConfig: Config['esbuildConfig']
    resolvedManifest: ManifestType
}) => {
    // lodash-marker
    const { metafile, stop } = await esbuildBuild({
        // latest is assumed if web
        target: target === 'desktop' ? 'node14' : undefined,
        bundle: true,
        watch: mode === 'development',
        minify: mode === 'production',
        entryPoints: ['src/extension.ts'],
        platform: target === 'desktop' ? 'node' : 'browser',
        outfile: join(outDir, target === 'desktop' ? 'extension-node.js' : 'extension-web.js'),
        format: 'cjs',
        logLevel: 'info',
        ...overrideBuildConfig,
        // sourcemap: true,
        external: ['vscode', ...(overrideBuildConfig.external ?? [])],
        define: {
            'process.env.NODE_ENV': `"${mode}"`,
            // TODO remove them
            'process.env.EXTENSION_ID_NAME': `"${resolvedManifest.name}"`,
            'process.env.EXTENSION_DISPLAY_NAME': `"${resolvedManifest.displayName}"`,
            'process.env.REVEAL_OUTPUT_PANEL_IN_DEVELOPMENT': 'true',
        },
        plugins: [
            {
                name: 'build-watcher',
                setup(build) {
                    let rebuildCount = 0
                    build.onEnd(async ({ errors }) => {
                        if (errors.length > 0) return
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
    // const outputSize = Object.entries(metafile!.outputs)[0]![1]!.bytes
    return { stop }
}
