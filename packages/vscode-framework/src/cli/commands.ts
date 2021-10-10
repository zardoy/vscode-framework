#!/usr/bin/env node
import { join, resolve } from 'path'
import Debug from '@prisma/debug'
import { Command } from 'commander'
import { cosmiconfig } from 'cosmiconfig'
import fsExtra from 'fs-extra'
import { defaultsDeep } from 'lodash'
import pkdDir from 'pkg-dir'
import { BuildTargetType, Config, defaultConfig } from '../config'
import { SuperCommander } from './commander'
import { LauncherCLIParams, WebOpenType } from './launcher'
import { addStandaloneCommands } from './standaloneCommands'
import { generateTypes } from './typesGenerator'
import { generateAndWriteManifest, runEsbuild } from '.'

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
        loadConfig: true,
    },
    async ({ overwrite }, { config }) => {
        // TODO but should I?
        process.env.NODE_ENV = 'development'
        await fsExtra.ensureDir(devExtensionPath)
        await generateAndWriteManifest({
            config,
            outputPath: join(devExtensionPath, 'package.json'),
            overwrite,
        })
    },
)

commander.command(
    'generate-types',
    'Generate TypeScript typings (from contribution points) and place them to nearest node_modules for working with framework',
    {},
    async () => {
        await generateTypes({ nodeModulesDir: __DEV__ ? (await pkdDir(__dirname))! : process.cwd() })
    },
)

const useOutForDebugging = true
const relativePath = useOutForDebugging ? 'out' : 'node_modules/.vscode-extension'
const devExtensionPath = resolve(process.cwd(), relativePath)

const buildExtension = async ({
    mode,
    config,
    launcherParams,
    target,
    bulidPath = devExtensionPath,
}: {
    mode: Parameters<typeof runEsbuild>[0]['mode']
    config: Config
    launcherParams: LauncherCLIParams | false
    target: BuildTargetType
    bulidPath?: string
}) => {
    // TODO check for web absence of localizations, debuggers, terminal, typescriptServerPlugins in contributes
    process.env.NODE_ENV = mode
    debug('Building extension', {
        mode,
        bulidPath,
    })
    await fsExtra.ensureDir(bulidPath)
    const manifest = await generateAndWriteManifest({
        outputPath: join(bulidPath, 'package.json'),
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
    await runEsbuild({
        mode,
        target,
        outDir: bulidPath,
        manifest: manifest!,
        launchVscodeConfig: launcherParams ? { ...config, ...launcherParams } : false,
        overrideBuildConfig: config.esbuildConfig,
    })
}

commander.command(
    'start',
    'Launch VSCode extension development (no launch.json needed)',
    {
        options: {
            '--target': {
                // TODO use config's default
                defaultValue: 'desktop' as BuildTargetType,
                // reformat description
                description: 'Target for building and opt-out launching. Values: desktop (default), web',
            },
            '--web-open': {
                // TODO use config's default
                defaultValue: 'desktop' as WebOpenType,
                // reformat description
                description: 'If --target is web, specify where to launch vscode. Values: web (default), desktop',
            },
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
    async ({ skipLaunching, path, target, webOpen }, { config }) => {
        await buildExtension({
            mode: 'development',
            config,
            launcherParams: skipLaunching
                ? false
                : {
                      target,
                      webOpen,
                  },
            target,
            bulidPath: join(process.cwd(), path),
        })
    },
)

commander.command('build', 'Make a production-ready build', { loadConfig: true }, async (_, { config }) => {
    // TODO build path
    // TODO move check to schema
    if (!config.target.desktop && !config.target.web)
        throw new Error('Both targets are disabled in config. Enable either desktop or wb')
    // TODO! build web
    await buildExtension({ mode: 'production', config, launcherParams: false, target: 'desktop' })
})

addStandaloneCommands(commander)

commander.process()

// const packageCommand = program.command('package', 'Launch VSCode development with extension (no launch.json needed)');

// const migrateCommand = program.command('migrate [path to package.json]', 'Migrate from regular package.json in interactive way (cleans contribution points, adds config)');
