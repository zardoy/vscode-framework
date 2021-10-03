import { readDirectoryManifest } from 'vscode-manifest'
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
