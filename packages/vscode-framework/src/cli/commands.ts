import { join, resolve } from 'path'
import { Command } from 'commander'
import { cosmiconfig } from 'cosmiconfig'
import fsExtra from 'fs-extra'
import { defaultsDeep } from 'lodash'
import Debug from '@prisma/debug'
import { generateFile } from 'typed-vscode'
import { readDirectoryManifest } from 'vscode-manifest'
import { BuildTargetType, Config, defaultConfig } from '../config'
import { SuperCommander } from './commander'
import { addStandaloneCommands } from './standaloneCommands'
import { buildExtension } from './commands/build'
import { startExtensionDevelopment } from './commands/start'
import { configurationTypeFile } from './configurationFromType'
import { generateAndWriteManifest } from '.'

const debug = Debug('vscode-framework:cli')

const program = new Command()

// and again, we lose type even here (config?)
export const commander = new SuperCommander<Config>(program, async () => {
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
    'Generates package.json for extension in production mode. Use this command before consuming extension!',
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
        await fsExtra.ensureDir(devExtensionPath)
        await generateAndWriteManifest({
            config,
            propsGeneratorsMeta: { mode: 'production', target: config.target, config },
            outputPath: join(devExtensionPath, 'package.json'),
            overwrite,
        })
    },
)

commander.command(
    'generate',
    'Generate files with typings from contribution points of manifest',
    {
        loadConfig: true,
        options: {},
    },
    async (_, { config }) => {
        const manifest = await readDirectoryManifest({ prependIds: config.prependIds })
        await generateFile({
            config: { trimIds: config.prependIds !== false },
            contributionPoints: manifest.contributes,
            framework: {
                useConfigurationType: fsExtra.existsSync(configurationTypeFile),
            },
            // TODO
            outputPath: 'src/generated.ts',
        })
    },
)

const useOutForDebugging = true
const relativePath = useOutForDebugging ? 'out' : 'node_modules/.vscode-extension'
const devExtensionPath = resolve(process.cwd(), relativePath)

const commonBuildStartOptions = {
    '--out': {
        defaultValue: relativePath,
        description: 'Output directory, in which package.json will be placed (or overrided!) for launching/building VSCode extension',
    },
}

commander.command(
    'start',
    'Launch VSCode extension development (no launch.json needed)',
    {
        options: {
            '--web': {
                // TODO use config's default
                defaultValue: false,
                // reformat description
                description: 'Target web for building instead of desktop and opt-out launching.',
            },
            '--web-desktop': {
                // TODO use config's default
                defaultValue: false,
                // reformat description
                description: 'If --web is present, you can launch web extension in desktop VSCode, instead of in browser',
            },
            '--skip-launching': {
                defaultValue: false,
                description: 'Start esbuild watch, but do not launch VSCode',
            },
            '--skip-generating-types': {
                defaultValue: false,
                description: 'Do not generate types',
            },
            '--sourcemap': {
                defaultValue: false,
                description: 'Forcefully enable sourcemaps (needed for debugging)',
            },
            ...commonBuildStartOptions,
        },
        loadConfig: true,
    },
    async ({ skipLaunching, out, web, webDesktop, skipGeneratingTypes, sourcemap }, { config }) => {
        try {
            if (sourcemap) config = defaultsDeep({ esbuild: { sourcemap: true } }, config)
            const target: BuildTargetType = web ? 'web' : 'desktop'
            const { restartCommand, sendMessage } = (await startExtensionDevelopment({
                config,
                outDir: resolve(process.cwd(), out),
                launchVscodeParams: skipLaunching
                    ? false
                    : {
                          target,
                          webOpen: webDesktop ? 'desktop' : 'web',
                      },
                targets: target,
                participants: {
                    skipGeneratingTypes,
                    skipTypechecking: true,
                },
                defineEnv: {},
            }))!
            process.stdin.setRawMode(true)
            process.stdin.on('data', async data => {
                let input = String(data)
                let ctrlKey = false

                // copied from `ink` module
                if (input <= '\u001A' && input !== '\r') {
                    // eslint-disable-next-line unicorn/prefer-code-point
                    input = String.fromCodePoint(input.charCodeAt(0) + 'a'.charCodeAt(0) - 1)
                    ctrlKey = true
                }

                if (ctrlKey && input === 'c') process.exit()

                if (input === 'r') await restartCommand()
                if (input === 'c') sendMessage('action:close')
            })
        } catch (error) {
            if (error.message?.startsWith('Build failed with')) process.exit(1)
            throw error
        }
    },
)

commander.command(
    'build',
    'Make a production-ready build',
    {
        options: {
            '--skip-typechecking': {
                defaultValue: false,
                description: 'Will call tsc typecheck project if tsconfig.json is present',
            },
            '--skip-packaging': {
                defaultValue: false,
                description: 'Skip creating .vsix file',
            },
            ...commonBuildStartOptions,
        },
        loadConfig: true,
    },
    async ({ skipTypechecking, out }, { config }) => {
        await buildExtension({
            mode: 'production',
            outDir: resolve(process.cwd(), out),
            config,
            participants: { skipGeneratingTypes: false, skipTypechecking },
            targets: Object.entries(config.target)
                .filter(([, enablement]) => enablement)
                .map(([target]) => target),
            defineEnv: {},
        })
    },
)

commander.command('init-config', 'Create vscode-config.js', {}, async () => {
    const contents = `//@ts-check

/** @type{import('vscode-framework/build/config').UserConfig} */
const config = {
\t
}

module.exports = config
`
    await fsExtra.promises.writeFile('./vscode-framework.config.js', contents, 'utf-8')
})

commander.command('gitignore', 'Add ignore entries to .gitignore of cwd', {}, async () => {
    const contents = `
out
src/generated.ts
src/configurationTypeCache.jsonc
    `
    await fsExtra.promises.appendFile('./.gitignore', contents, 'utf-8')
})

addStandaloneCommands(commander)

// const migrateCommand = program.command('migrate [path to package.json]', 'Migrate from regular package.json in interactive way (cleans contribution points, adds config)');
