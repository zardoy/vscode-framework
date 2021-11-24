/* eslint-disable zardoy-config/@typescript-eslint/dot-notation */
import fs from 'fs'
import { readPackageJsonFile } from 'typed-jsonfile'
import { Command } from 'commander'
import { cosmiconfig } from 'cosmiconfig'
import { defaultsDeep } from 'lodash'
import { Config, defaultConfig } from './config'
import { generateFile } from '.'

export const program = new Command()

for (const [name, defaultValue] of Object.entries(defaultConfig))
    program.option(`--${name}`, `Config setting ${name}`, defaultValue)

program
    .option(
        '--target',
        'Possible values: native (default) - for @types/vscode, framework - for vscode-framework, bare - types are only exported. no augmentation',
        'native',
    )
    .option('--manifest', "Path to package.json. Defaults to cwd. Doesn't affect --out path")

program.action(async ({ manifest: manifestPath = process.cwd(), ...cliConfig }) => {
    const isDir = (await fs.promises.stat(manifestPath)).isDirectory()
    const manifest = await readPackageJsonFile(isDir ? { dir: manifestPath } : manifestPath)
    if (manifest['postinstallGenerateTypes'] === false && process.env.INIT_CWD) return
    if (
        process.env.INIT_CWD &&
        [...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.devDependencies ?? {})].includes(
            'vscode-framework',
        )
    )
        return
    const configExplorer = cosmiconfig('typed-vscode')
    const userConfig = await configExplorer.search()
    const resolvedConfig: Config = defaultsDeep(cliConfig, userConfig?.config || {}, defaultConfig)
    await generateFile({
        contributionPoints: manifest['contributes'],
        config: resolvedConfig,
        outputPath: resolvedConfig.out,
        target: resolvedConfig.target,
    })
})
