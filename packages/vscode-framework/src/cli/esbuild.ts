import { resolve } from 'path'
import Debug from '@prisma/debug'
import { build as esbuildBuild } from 'esbuild'
import escapeStringRegexp from 'escape-string-regexp'
import fsExtra from 'fs-extra'
import { nanoid } from 'nanoid'
import { ManifestType } from 'vscode-manifest'
import { Except } from 'type-fest'
import { BuildTargetType, Config } from '../config'
import { launchVscode } from './launcher'

const debug = Debug('vscode-framework:esbuild')

export type BootstrapConfig = Exclude<Config['development']['extensionBootstrap'], false> & { serverIpcChannel: string }

export const runEsbuild = async ({
    mode,
    target,
    outDir,
    manifest,
    entryPoint = 'src/extension.ts',
    overrideBuildConfig: overrideBuildOptions = {},
    launchVscodeConfig,
}: {
    mode: 'development' | 'production'
    target: BuildTargetType
    manifest: Pick<ManifestType, 'name' | 'displayName' | 'extensionKind'>
    outDir: string
    /** Config for handling vscode launch, pass `false` to skip launching */
    launchVscodeConfig: Except<Parameters<typeof launchVscode>[1], 'serverIpcChannel'> | false
    entryPoint?: string
    overrideBuildConfig?: Config['esbuildConfig']
}) => {
    const enableBootstrap = launchVscodeConfig !== false && launchVscodeConfig.development.extensionBootstrap
    if (enableBootstrap)
        await fsExtra.copy(require.resolve('../extensionBootstrap'), resolve(outDir, 'extensionBootstrap.js'))

    // TODO also detect other cases
    if (manifest.extensionKind?.length === 0)
        console.warn("Warning: extensionKind in manifest is set to [] which means your extension won't be launched")

    let serverIpcChannel: undefined | string
    if (enableBootstrap) serverIpcChannel = `vscode-framework:server_${nanoid(5)}`

    const { metafile } = await esbuildBuild({
        // latest is assumed if web
        target: target === 'desktop' ? 'node14' : undefined,
        bundle: true,
        watch: mode === 'development',
        minify: mode === 'production',
        entryPoints: [entryPoint],
        platform: target === 'desktop' ? 'node' : 'browser',
        outfile: resolve(outDir, target === 'desktop' ? 'extension-node.js' : 'extension-web.js'),
        format: 'cjs',
        logLevel: 'info',
        ...overrideBuildOptions,
        external: ['vscode', ...(overrideBuildOptions.external ?? [])],
        // sourcemap: true,
        define: {
            'process.env.NODE_ENV': `"${mode}"`,
            // TODO remove them
            'process.env.EXTENSION_ID_NAME': `"${manifest.name}"`,
            'process.env.EXTENSION_DISPLAY_NAME': `"${manifest.displayName}"`,
            'process.env.REVEAL_OUTPUT_PANEL_IN_DEVELOPMENT': 'true',
            ...(serverIpcChannel
                ? {
                      'process.env.EXTENSION_BOOTSTRAP_CONFIG': `"${JSON.stringify({
                          ...launchVscodeConfig,
                          serverIpcChannel,
                      } as BootstrapConfig)}"`,
                  }
                : {}),
            ...(overrideBuildOptions.define ? overrideBuildOptions.define : {}),
        },
        plugins: [
            {
                name: 'build-wather',
                setup(build) {
                    if (mode !== 'development') return
                    let rebuildCount = 0
                    if (launchVscodeConfig !== false)
                        build.onEnd(async ({ errors }) => {
                            if (errors.length > 0) return
                            if (rebuildCount++ > 0) return
                            await launchVscode(outDir, {
                                ...launchVscodeConfig,
                                serverIpcChannel: serverIpcChannel ?? false,
                            })
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
    })
    // only in production
    // const outputSize = Object.entries(metafile!.outputs)[0]![1]!.bytes
}
