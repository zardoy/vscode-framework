import { resolve } from 'path'
import Debug from '@prisma/debug'
import { ManifestType } from 'vscode-manifest'
import { build as esbuildBuild } from 'esbuild'
import execa from 'execa'
import fsExtra from 'fs-extra'
import escapeStringRegexp from 'escape-string-regexp'
import { Config } from '../config'
import { launchVscode } from './launcher'

const debug = Debug('vscode-framework:esbuild')

export const runEsbuild = async ({
    mode,
    outDir,
    manifest,
    entryPoint = 'src/extension.ts',
    outfile = resolve(outDir, 'extension.js'),
    overrideBuildConfig: overrideBuildOptions = {},
    launchVscodeConfig,
}: {
    mode: 'development' | 'production'
    outDir: string
    manifest: Pick<ManifestType, 'name' | 'displayName' | 'extensionKind'>
    /** Config for handling vscode launch, pass `false` skip launching */
    launchVscodeConfig: Parameters<typeof launchVscode>[1] | false
    entryPoint?: string
    outfile?: string
    overrideBuildConfig?: Config['esbuildConfig']
}) => {
    await fsExtra.copy(require.resolve('../extensionBootstrap'), resolve(outDir, 'extensionBootstrap.js'))

    // TODO also detect other cases
    if (manifest.extensionKind?.length === 0)
        console.warn("Warning: extensionKind in manifest is set to [] which means your extension won't be launched")

    const { metafile } = await esbuildBuild({
        target: 'node14',
        bundle: true,
        watch: mode === 'development',
        minify: mode === 'production',
        entryPoints: [entryPoint],
        platform: 'node',
        outfile,
        ...overrideBuildOptions,
        external: ['vscode', ...(overrideBuildOptions.external ?? [])],
        logLevel: 'info',
        // sourcemap: true,
        define: {
            'process.env.NODE_ENV': `"${mode}"`,
            // TODO remove them
            'process.env.EXTENSION_ID_NAME': `"${manifest.name}"`,
            'process.env.EXTENSION_DISPLAY_NAME': `"${manifest.displayName}"`,
            'process.env.REVEAL_OUTPUT_PANEL_IN_DEVELOPMENT': 'true',
            'process.env.EXTENSION_BOOTSTRAP_CONFIG': `"${JSON.stringify(launchVscodeConfig)}"`,
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
                            await launchVscode(outDir, launchVscodeConfig)
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
