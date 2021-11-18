import { join, resolve } from 'path'
import { Command } from 'commander'
import { cosmiconfig } from 'cosmiconfig'
import fsExtra from 'fs-extra'
import { defaultsDeep } from 'lodash'
import Debug from '@prisma/debug'
import execa from 'execa'
import kleur from 'kleur'
import { BuildTargetType, Config, defaultConfig } from '../config'
import { buildExtension, startExtensionDevelopment } from './buildExtension'
import { SuperCommander } from './commander'
import { addStandaloneCommands } from './standaloneCommands'
import { generateContributesTypes } from './commands/generateTypes'
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
    'generate-types',
    'Generate TypeScript typings (from contribution points) into src/generated.ts for working with framework',
    {
        loadConfig: true,
    },
    async (_, { config }) => {
        await generateContributesTypes(undefined, config)
    },
)

const useOutForDebugging = true
const relativePath = useOutForDebugging ? 'out' : 'node_modules/.vscode-extension'
const devExtensionPath = resolve(process.cwd(), relativePath)

const commonBuildStartOptions = {
    '--path': {
        defaultValue: relativePath,
        description: 'Output path, in which package.json will be placed (or overrided!) for launching VSCode',
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
                description:
                    'If --web is present, you can launch web extension in desktop VSCode, instead of in browser',
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
                description: 'Forcefully enable sourcemap (needed for debugging)',
            },
            ...commonBuildStartOptions,
        },
        loadConfig: true,
    },
    async ({ skipLaunching, path, web, webDesktop, skipGeneratingTypes, sourcemap }, { config }) => {
        try {
            if (sourcemap) config = defaultsDeep({ esbuild: { sourcemap: true } }, config)
            const target: BuildTargetType = web ? 'web' : 'desktop'
            const { restartCommand } = (await startExtensionDevelopment({
                mode: 'development',
                config,
                launchVscodeParams: skipLaunching
                    ? false
                    : {
                          target,
                          webOpen: webDesktop ? 'desktop' : 'web',
                      },
                target,
                skipGeneratingTypes,
                outDir: join(process.cwd(), path),
            }))!
            process.stdin.setRawMode(true)
            process.stdin.on('data', async data => {
                let input = String(data)
                let ctrlKey = false

                // copied from `ink` module
                if (input <= '\u001A' && input !== '\r') {
                    input = String.fromCharCode(input.charCodeAt(0) + 'a'.charCodeAt(0) - 1)
                    ctrlKey = true
                }

                if (ctrlKey && input === 'c') process.exit()

                if (input === 'r') await restartCommand()
            })
        } catch (error) {
            // eslint-disable-next-line zardoy-config/unicorn/no-process-exit
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
    async ({ skipTypechecking, path }, { config }) => {
        // TODO apply same process.exit as above here

        // TODO build path
        // TODO move check to schema
        if (!config.target.desktop && !config.target.web)
            throw new Error('Both targets are disabled in config. Enable either desktop or wb')

        if (!skipTypechecking && fsExtra.existsSync('./tsconfig.json')) {
            const date = Date.now()
            console.log(kleur.green('Executing tsc for type-checking...'))
            // just for simplicity, don't see a reason for programmatic usage
            await execa('tsc', { stdio: 'inherit' })
            console.log(kleur.green('Type-checking done in '), `${Date.now() - date}ms`)
        }

        for (const [platform, enablement] of Object.entries(config.target)) {
            if (!enablement) continue
            // TODO does read manifest twice
            // eslint-disable-next-line no-await-in-loop
            await buildExtension({
                mode: 'production',
                config,
                target: platform,
                skipGeneratingTypes: true,
                outDir: join(process.cwd(), path),
            })
        }
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
    `
    await fsExtra.promises.appendFile('./.gitignore', contents, 'utf-8')
})

addStandaloneCommands(commander)

// const packageCommand = program.command('package', 'Launch VSCode development with extension (no launch.json needed)');

// const migrateCommand = program.command('migrate [path to package.json]', 'Migrate from regular package.json in interactive way (cleans contribution points, adds config)');
