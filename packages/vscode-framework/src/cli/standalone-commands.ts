import { join } from 'path'
import { readDirectoryManifest } from 'vscode-manifest'
import globby from 'globby'
import { SuperCommander } from './commander'
import { launchVscode } from './launcher'
import { propsGenerators } from './manifest-generator/propsGenerators'

export const addStandaloneCommands = (commander: SuperCommander<any>) => {
    commander.command(
        'launch',
        // TODO update command
        'Launch VSCode on defined path without building',
        {
            loadConfig: true,
            arguments: ['[dir]'] as ['[dir]'],
        },
        ({}, { config, arguments: { dir = process.cwd() } }) => {
            launchVscode(dir, config)
        },
    )

    commander.command(
        'maintance',
        // TODO update command
        "Use where framework can't be used. Updates package.json checks or adds fields etc...",
        {},
        async () => {
            // writes esbuild-scripts review and rename yourself
            const manifest = await readDirectoryManifest()
            const { scripts } = manifest
            // TODO
            if (!scripts) throw new Error('no scripts field')
            const entryPoints = await globby(join(process.cwd(), 'src/index.{js,mjs,cjs,ts,mts}'))
            if (entryPoints.length !== 1) throw new Error(`no one entry point: ${entryPoints} `)
            const entryPoint = entryPoints[0]!
            const esbuildBaseCommand = `esbuild ${entryPoint} --bundle --platform=node --outfile=dist/extension.js --external:vscode`
            if (!scripts['esbuild-start']) scripts['esbuild-start'] = `${esbuildBaseCommand} --watch --sourcemap`

            if (!scripts['esbuild-build'])
                // warning about tsc
                scripts['esbuild-build'] = `${esbuildBaseCommand} --minify`
        },
    )

    commander.command(
        'update-manifest',
        'Updates original package.json of extension',
        {
            options: {
                '--normalize-ids': {
                    defaultValue: true,
                    description: '',
                },
                '--skip-validation': {
                    defaultValue: false,
                    description: '',
                },
                // '--cwd': {
                //     defaultValue: '<cwd>',
                //     description: 'Where package.json of extension living is'
                // }
            },
            loadConfig: true,
        },
        async ({ normalizeIds, skipValidation }) => {
            const manifest = await readDirectoryManifest({ throwIfInvalid: !skipValidation })
            const regeneratedManifest = propsGenerators
        },
    )
}
