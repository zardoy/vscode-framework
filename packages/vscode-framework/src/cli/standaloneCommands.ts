import fs from 'fs'
import { join, resolve } from 'path'
import globby from 'globby'
import { readDirectoryManifest } from 'vscode-manifest'
import { ensureDir } from 'fs-extra'
import { Config } from '../config'
import { SuperCommander } from './commander'
import { launchVscode } from './launcher'
import { manifestGenerators } from './manifest-generator/manifestGenerators'

export const addStandaloneCommands = (commander: SuperCommander<any>) => {
    commander.command(
        'launch',
        // TODO update desc
        'Launch VSCode on defined path without building',
        {
            // TODO disable config. move to options
            loadConfig: true,
            options: {
                '--cwd': {
                    defaultValue: process.cwd(),
                    description: 'cwd to launch',
                },
                '--web': {
                    defaultValue: false,
                    description: 'Launch in browser',
                },
                '--insiders': {
                    defaultValue: undefined as unknown as boolean,
                    description: 'Launch in insiders',
                },
            },
            // arguments: ['[dir]'] as ['[dir]'],
        },
        async ({ cwd, web, insiders }, { config }: { config: Config }) => {
            if (web && insiders) throw new Error(`--web and --insiders can't be used simultaneously`)
            if (insiders) config.development.executable = 'code-insiders'
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
            if (insiders === false) config.development.executable = 'code'
            await launchVscode(resolve(process.cwd(), cwd), {
                development: config.development,
                webOpen: web ? 'web' : undefined,
                target: web ? 'web' : 'desktop',
            })
        },
    )

    commander.command(
        'launch-config',
        '[for debugging] Adds <cwd>/.vscode/launch.json config for launching extension with other extension disabled',
        {},
        async () => {
            const launchConfigPath = '.vscode/launch.json'
            if (fs.existsSync(launchConfigPath)) throw new Error('Launch config already exists. Move or delete it first.')
            const launchJson = `
{
    "configurations": [
        {
            "name": "Launch Extension",
            "type": "extensionHost",
            "request": "launch",
            "args": [
                "--extensionDevelopmentPath=\${workspaceFolder}/out",
                "--disable-extensions"
            ],
            "outFiles": ["\${workspaceFolder}/out/**/*.js"]
        }
    ]
}
`
            await ensureDir(join(launchConfigPath, '..'))
            await fs.promises.writeFile(launchConfigPath, launchJson, 'utf-8')
        },
    )

    const disableNotReadyCommands = true
    if (disableNotReadyCommands) return

    commander.command(
        'maintance',
        // TODO update command
        "Use where framework can't be used. Updates package.json checks or adds fields etc...",
        {
            options: {
                '--prepend-ids': {
                    defaultValue: 'camelCase' as 'camelCase' | 'original' | 'disabled',
                    description: 'Values: camelCase (default), original (use name untouched), disabled',
                },
            },
        },
        async ({ prependIds }) => {
            // writes esbuild-scripts review and rename yourself
            const manifest = await readDirectoryManifest({
                prependIds: prependIds === 'disabled' ? false : { style: prependIds },
            })
            const { scripts } = manifest
            // TODO
            if (!scripts) throw new Error('no scripts field')
            const entryPoints = await globby(join(process.cwd(), 'src/index.{js,mjs,cjs,ts,mts}'))
            if (entryPoints.length !== 1) throw new Error(`There is no entry point from the list: ${entryPoints.toString()} `)
            const entryPoint = entryPoints[0]!
            const esbuildBaseCommand = `esbuild ${entryPoint} --bundle --platform=node --outfile=dist/extension-node.js --external:vscode`
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
            const regeneratedManifest = manifestGenerators
        },
    )

    commander.command(
        'make-demo-extension',
        'Make VSIS with minimal extension that can run one command. Entrypoint must have one export: commandInvoke',
        {
            arguments: ['<nameWithOptionalVersion>', '<pathToEntrypoint>'] as ['<nameWithOptionalVersion>', '<pathToEntrypoint>'],
        },
        // eslint-disable-next-line no-empty-pattern
        ({}, { arguments: { nameWithOptionalVersion, pathToEntrypoint } }) => {
            const match = /^(?<name>[^@]+)(?<version>@\S+)?$/.exec(nameWithOptionalVersion)
            const { name, version } = match!.groups!
            // const minimalManifest: ManifestType = {
            //     name,
            //     // TODO isn't vsix does this normaliztion
            //     displayName: name,
            //     publisher: '',
            //     version,
            //     activationEvents: ['onCommand'],
            //     contributes: {},
            //     categories: ['Other'],
            // }
            // TODO create esbuild bundle
        },
    )
}
