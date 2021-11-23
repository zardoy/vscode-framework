import fs from 'fs'
import { join } from 'path'
import { camelCase } from 'change-case'
import fsExtra from 'fs-extra'
import Debug from '@prisma/debug'
import { ManifestType } from 'vscode-manifest'
import { Except } from 'type-fest'
import kleur from 'kleur'
import execa from 'execa'
import del from 'del'
import { generateFile } from 'typed-vscode'
import { BuildTargetType, Config } from '../../config'
import { runEsbuild } from '../esbuild/esbuild'
import { generateAndWriteManifest } from '../manifest-generator'
import { configurationTypeFile } from '../configurationFromType'

const debug = Debug('vscode-framework:build')

/** run build participants and esbuild to output JS */
export const buildExtension = async (
    input: BasicInput & Pick<Parameters<typeof runEsbuild>[0], 'afterSuccessfulBuild' | 'defineEnv'>,
) => {
    // ensure always on top of function
    await fsExtra.ensureDir(input.outDir)
    debug('Building extension')
    debug(input)
    const { outDir, config, targets } = input
    // Cleanup directory with preserving user files
    await del(
        Object.values(EXTENSION_ENTRYPOINTS).flatMap(jsOut => [join(outDir, jsOut), join(outDir, `${jsOut}.map`)]),
    )

    // Run participants
    await buildParticipants.resourceAssets(input)
    const { generatedManifest, sourceManifest } = await buildParticipants.generateManifest(input)
    await buildParticipants.generateTypes(input, { sourceManifest, generatedManifest })
    await buildParticipants.typechecking(input)

    type RunEsbuildInput = Except<Parameters<typeof runEsbuild>[0], 'target'>
    const esbuildInput: RunEsbuildInput = {
        resolvedManifest: generatedManifest,
        // TODO handle other options
        injectConsole: config.consoleStatements !== false && config.consoleStatements.action === 'pipeToOutputChannel',
        ...input,
        defineEnv: {
            IDS_PREFIX: config.prependIds
                ? config.prependIds.style === 'camelCase'
                    ? camelCase(generatedManifest.name)
                    : generatedManifest.name
                : undefined,
            ...input.defineEnv,
        },
    }
    if (!Array.isArray(targets)) return runEsbuild({ ...esbuildInput, target: targets })

    // TODO check is ok in parallel
    for (const target of targets) await runEsbuild({ ...esbuildInput, target })
    return undefined
}

/** Build mode.
 * - development - started with `start` command
 * - production - started with `build` command
 */
export type ModeType = 'development' | 'production'

/** Input data for command and build participants */
interface BasicInput {
    config: Config
    mode: ModeType
    targets: BuildTargetType | BuildTargetType[]
    outDir: string
    participants: {
        skipGeneratingTypes: boolean
        skipTypechecking: boolean
    }
}

const makeBuildParticipants = <T extends Record<string, (input: BasicInput, additionalInput: any) => any>>(arg: T) =>
    arg
const buildParticipants = makeBuildParticipants({
    async generateManifest({ outDir, mode, config, targets }) {
        const { generatedManifest, sourceManifest } =
            (await generateAndWriteManifest({
                outputPath: join(outDir, 'package.json'),
                overwrite: true,
                config,
                propsGeneratorsMeta: {
                    mode,
                    target: Array.isArray(targets)
                        ? Object.fromEntries(targets.map(target => [target, true]))
                        : // TS is literally killing the target type!
                          ({ [targets]: true } as any),
                    config,
                },
            })) ?? {}
        if (!generatedManifest || !sourceManifest) throw new Error('Extension manifest (package.json) is missing.')
        // -> POST MANIFEST CHECKS
        // TODO move them to the schema
        if (generatedManifest.extensionKind?.length === 0)
            console.warn("Warning: extensionKind in manifest is set to [] which means your extension won't be launched")
        if (!config.target.desktop && !config.target.web)
            throw new Error('Both targets are disabled in config. Enable either desktop or web')
        return { generatedManifest, sourceManifest }
    },
    /**
     * In start mode, symlinks `resources`
     * In build mode, copies
     */
    async resourceAssets({ mode, outDir }) {
        // Pick icons from here https://github.com/microsoft/vscode-codicons/tree/main/src/icons
        /** should be absolute */
        const resourcesPaths = {
            from: join(process.cwd(), 'resources'),
            to: join(outDir, 'resources'),
        }
        if (fs.existsSync(resourcesPaths.to)) {
            // weirdest thing I've seen in node
            await fs.promises.rm(resourcesPaths.to, { recursive: true })
            try {
                // without this it won't remove symlink on win
                await fs.promises.unlink(resourcesPaths.to)
            } catch {}

            if (fs.existsSync(resourcesPaths.to)) throw new Error(`Failed to remove ${resourcesPaths.to}`)
        }

        if (fs.existsSync(resourcesPaths.from) && fs.statSync(resourcesPaths.from).isDirectory())
            await (mode === 'production'
                ? fsExtra.copy(resourcesPaths.from, resourcesPaths.to)
                : fs.promises.symlink(resourcesPaths.from, resourcesPaths.to, 'junction'))
    },
    async generateTypes(
        { participants: commandArgs, config },
        { generatedManifest, sourceManifest }: Record<'sourceManifest' | 'generatedManifest', ManifestType>,
    ) {
        if (commandArgs.skipGeneratingTypes) return
        await generateFile({
            config: { trimIds: config.prependIds !== false },
            contributionPoints: {
                // commands can have additional generated variants
                commands: sourceManifest.contributes.commands,
                // configuration don't have additional generated variants for now
                configuration: generatedManifest.contributes.configuration,
            },
            framework: {
                useConfigurationType: fsExtra.existsSync(configurationTypeFile),
            },
            // TODO
            outputPath: 'src/generated.ts',
        })
    },
    async typechecking({ participants: { skipTypechecking } }) {
        if (skipTypechecking || fsExtra.existsSync('./tsconfig.json')) return
        const date = Date.now()
        console.log(kleur.green('Executing tsc for type-checking...'))
        // just for simplicity, don't see a reason for programmatic usage
        await execa('tsc', ['--noEmit'], { stdio: 'inherit' })
        console.log(kleur.green('Type-checking done in '), `${Date.now() - date}ms`)
    },
})

export const EXTENSION_ENTRYPOINTS = {
    node: 'extension-node.js',
    web: 'extension-web.js',
}

/** Check that entrypoint exists and `activate` function is exported. Not used for now, as it's slow */
// const checkEntrypoint = (config: Config) => {
//     // TODO
//     // 1. default export is still fine
//     // 2. warning: enforce to use export before const. otherwise it takes > 1s to check
//     // 3. doesn't work with functions
//     console.time('check')
//     const { entryPoint } = config.esbuild
//     const project = new Project({
//         skipAddingFilesFromTsConfig: true,
//         compilerOptions,
//     })
//     const source = project.addSourceFileAtPath(entryPoint)
//     // TODO fancy errors
//     if (!source.getVariableDeclarationOrThrow('activate').isExported())
//         throw new Error("activate function isn't exported")

//     console.timeEnd('check')
// }
