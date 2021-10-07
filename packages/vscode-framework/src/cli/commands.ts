#!/usr/bin/env node
import Debug from '@prisma/debug'
import { Command } from 'commander'
import { cosmiconfig } from 'cosmiconfig'
import fsExtra from 'fs-extra'
import { defaultsDeep } from 'lodash'
import { join, resolve } from 'path'
import pkdDir from 'pkg-dir'
import { generateAndWriteManifest, runEsbuild } from '.'
import { Config, defaultConfig } from '../config'
import { SuperCommander } from './commander'
import { LaunchParams, launchVscode } from './launcher'
import { addStandaloneCommands } from './standalone-commands'
import { generateTypes } from './types-generator'

declare const __DEV__: boolean

const debug = Debug('vscode-framework:cli')

const program = new Command()

// and again, we lose type even here (config?)
const commander = new SuperCommander<Config>(program, async () => {
    const explorer = cosmiconfig('vscode-framework')
    const userConfig = await explorer.search()
    debug('load-config', userConfig)
    return defaultsDeep(userConfig?.config || {}, defaultConfig)
})

// validate command

// TODO split into generate -> manifest | types

// split into two commands
commander.command(
    'generate-manifest',
    'Generates package.json for extension. Use this command before consuming extension!',
    {
        options: {
            '--overwrite': {
                description: 'disabled to stop occasional overwriting of your package.json',
                defaultValue: false,
            },
        },
    },
    async ({ overwrite }) => {
        // TODO but should I?
        process.env.NODE_ENV = 'development'
        fsExtra.ensureDir(devExtensionPath)
        await generateAndWriteManifest({
            outputPath: join(devExtensionPath, 'package.json'),
            overwrite,
        })
    },
)

commander.command(
    'generate-types',
    'Generate TypeScript typings (from contribution points) and place them to nearest node_modules for working with framework',
    {},
    async ({}) => {
        await generateTypes({ nodeModulesDir: __DEV__ ? (await pkdDir(__dirname))! : process.cwd() })
    },
)

const useOutForDebugging = true
const relativePath = useOutForDebugging ? 'out' : 'node_modules/.vscode-extension'
const devExtensionPath = resolve(process.cwd(), relativePath)

const buildExtension = async (
    mode: Parameters<typeof runEsbuild>[0]['mode'],
    launchVscodeConfig: LaunchParams | false,
    { esbuildConfig }: Pick<Config, 'esbuildConfig'>,
    bulidPath = devExtensionPath,
) => {
    process.env.NODE_ENV = mode
    debug('Building extension', {
        mode,
        bulidPath,
    })
    fsExtra.ensureDir(bulidPath)
    // TODO extension entrypoint and in esbuild
    const manifest = await generateAndWriteManifest({
        outputPath: join(bulidPath, 'package.json'),
        overwrite: true,
    })
    await runEsbuild({
        mode,
        outDir: bulidPath,
        manifest: manifest!,
        launchVscodeConfig,
        overrideBuildConfig: esbuildConfig,
    })
}

commander.command(
    'start',
    'Launch VSCode extension development (no launch.json needed)',
    {
        options: {
            '--skip-launching': {
                defaultValue: false,
                description: 'Start esbuild watch, but do not launch VSCode',
            },
            '--path': {
                defaultValue: relativePath,
                // defaultValue: './node_modules/.vscode-extension/',
                description: 'Output path, in which package.json will be placed (or overrided!) for launching VSCode',
            },
        },
        loadConfig: true,
    },
    async ({ skipLaunching, path }, { config }) => {
        await buildExtension('development', skipLaunching ? false : config, config, join(process.cwd(), path))
    },
)

commander.command('build', 'Make a production-ready build', { loadConfig: true }, async ({}, { config }) => {
    await buildExtension('production', false, config)
})

addStandaloneCommands(commander)

commander.process()

// const packageCommand = program.command('package', 'Launch VSCode development with extension (no launch.json needed)');

// const migrateCommand = program.command('migrate [path to package.json]', 'Migrate from regular package.json in interactive way (cleans contribution points, adds config)');
