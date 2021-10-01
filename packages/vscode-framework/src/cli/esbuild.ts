import Debug from '@prisma/debug'
import { ManifestType } from 'vscode-manifest'
import { build as esbuildBuild, BuildOptions } from 'esbuild'
import execa from 'execa'
import fsExtra from 'fs-extra'
import { resolve } from 'path'
import { launchVscode } from './launcher'

const debug = Debug('vscode-framework:esbuild')

export const runEsbuild = async ({
    mode,
    outDir,
    manifest,
    entryPoint = 'src/extension.ts',
    outfile = resolve(outDir, 'extension.js'),
    overrideBuildOptions = {},
    launchVscodeConfig,
}: {
    mode: 'development' | 'production'
    outDir: string
    manifest: Pick<ManifestType, 'name' | 'displayName' | 'extensionKind'>
    /** Config for handling vscode launch, pass `false` skip launching */
    launchVscodeConfig: Parameters<typeof launchVscode>[1] | false
    entryPoint?: string
    outfile?: string
    overrideBuildOptions?: BuildOptions
}) => {
    await fsExtra.copy(require.resolve('../extensionBootstrap'), resolve(outDir, 'extensionBootstrap.js'))

    // TODO also detect other cases
    if (manifest.extensionKind?.length === 0)
        console.warn("Warning: extensionKind in manifest is set to [] which means your extension won't be launched")

    const { metafile } = await esbuildBuild({
        bundle: true,
        watch: mode === 'development',
        minify: mode === 'production',
        entryPoints: [entryPoint],
        external: ['vscode'],
        platform: 'node',
        outfile,
        ...overrideBuildOptions,
        define: {
            'process.env.NODE_ENV': `"${mode}"`,
            // TODO remove them
            'process.env.EXTENSION_ID_NAME': `"${manifest.name}"`,
            'process.env.EXTENSION_DISPLAY_NAME': `"${manifest.displayName}"`,
            'process.env.REVEAL_OUTPUT_PANEL_IN_DEVELOPMENT': 'true',
            ...(overrideBuildOptions.define ? overrideBuildOptions.define : {}),
        },
        plugins: [
            {
                name: 'build-wather',
                setup(build) {
                    if (mode !== 'development') return
                    let rebuildCount = 0
                    if (launchVscodeConfig !== false) {
                        let vscodeProcess: execa.ExecaChildProcess | undefined
                        build.onEnd(({ errors }) => {
                            if (errors.length > 0) return
                            rebuildCount++
                            if (!vscodeProcess) vscodeProcess = launchVscode(outDir, launchVscodeConfig).vscodeProcess
                        })
                    }
                },
            },
        ],
    })
    // only in production
    // const outputSize = Object.entries(metafile!.outputs)[0]![1]!.bytes
}
