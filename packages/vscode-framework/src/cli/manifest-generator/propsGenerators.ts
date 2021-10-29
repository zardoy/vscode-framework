import Debug from '@prisma/debug'
import { getGithubRemoteInfo } from 'github-remote-info'
import { defaultsDeep, mapValues } from 'lodash'
import { UnionToIntersection } from 'type-fest'
import { ContributesConfigurationType, ManifestType } from 'vscode-manifest'
import { Config, ExtensionBootstrapConfig } from '../../config'
import { MaybePromise, readModulePackage } from '../../util'
import { EXTENSION_ENTRYPOINTS, ModeType } from '../buildExtension'

// They're generating package.json properties
// If you with you can use them directly

// TODO! package.json name - fileName
const debug = Debug('vscode-framework:propsGenerators')

export type PropsGeneratorsMeta = {
    mode: ModeType
    target: Config['target']
    config: Pick<Config, 'prependIds'> & {
        development: {
            alwaysActivationEvent: Config['development']['alwaysActivationEvent']
            extensionBootstrap:
                | {
                      developmentCommands: ExtensionBootstrapConfig['developmentCommands']
                  }
                | false
        }
    }
}

type MakePropsGenerators = Record<
    string,
    (manifestData: any, meta: PropsGeneratorsMeta) => MaybePromise<Partial<ManifestType>>
>

type PickManifest<T extends keyof ManifestType> = Pick<ManifestType, T>
type PickContributes<T extends keyof ManifestType['contributes']> = {
    contributes: Pick<ManifestType['contributes'], T>
}

// MAKE TECH!
const makeGenerators = <T extends MakePropsGenerators>(generators: T) => generators

// HERE!
export const propsGenerators = makeGenerators({
    // every generator's return type should be deeply merged
    async repository() {
        // hard to test
        const githubRepoUrl = await getGithubRemoteInfo(process.cwd())
        if (!githubRepoUrl)
            throw new Error(
                "GitHub remote origin can't be detected on current cwd. Either disable generating repository property or consider publising your project to GitHub",
            )

        const { name, owner } = githubRepoUrl

        return { repository: `https://github.com/${owner}/${name}` }
    },
    async engines() {
        const vscodeTypes = await readModulePackage('@types/vscode')
        return {
            engines: {
                vscode: `^${vscodeTypes.version!}`,
            },
        }
    },
    /** disables useless Q&A tab in marketplace on the web */
    qnaFalse() {
        return { qna: false }
    },
    extensionEntryPoint(_, { target }) {
        return {
            ...(target.desktop ? { main: EXTENSION_ENTRYPOINTS.node } : {}),
            ...(target.web ? { browser: EXTENSION_ENTRYPOINTS.web } : {}),
        }
    },
    'contributes.commands': (
        manifest: PickManifest<'name' | 'displayName'> & { contributes: Pick<ManifestType['contributes'], 'commands'> },
        {
            mode,
            config: {
                development: { extensionBootstrap },
            },
        },
    ) => {
        const additionalCommands =
            mode !== 'production' && extensionBootstrap && extensionBootstrap.developmentCommands
                ? [
                      {
                          title: 'Run Active Development Command',
                          category: 'VSCode Framework',
                          command: 'runActiveDevelopmentCommand',
                      },
                      {
                          title: 'Focus on Active Development Extension Output',
                          category: 'VSCode Framework',
                          command: 'focusActiveDevelopmentExtensionOutput',
                      },
                  ]
                : []
        // TODO! default category should respect config
        const { contributes, displayName } = manifest
        const commands = [
            ...additionalCommands,
            ...(contributes?.commands ?? []).map(({ category = displayName, ...rest }) => ({
                category,
                ...rest,
            })),
        ]
        return commands.length > 0
            ? {
                  contributes: {
                      commands,
                  },
              }
            : {}
    },
    // 'contributes.configuration': (
    //     { name, contributes: { configuration } }: PickManifest<'name'> & PickContributes<'configuration'>,
    //     { config: { prependIds } },
    // ) => {
    //     // TODO check anyway
    //     if (!prependIds) return {}
    //     const allKnownSettings = new Set<string>()
    //     const parseMarkdownValue = (markdownString: string, prop: string, referencedSettingId: string) => {
    //         markdownString.replace(/#(.+#)/, (match, settingId) => {
    //             // GO INSANE: display position in markdown string
    //             // TODO move from here to validate manifest
    //             if (!allKnownSettings.has(settingId))
    //                 throw new Error(`Setting ${settingId} was referenced from ${referencedSettingId} via ${prop}`)
    //             return `#${}#`
    //         })
    //     }

    //     const parseSetting = (setting: ContributesConfigurationType['properties']['']) => {
    //         mapValues(setting, (value, key) => {
    //             if (key.startsWith('markdown')) {
    //             }
    //         })
    //     }

    //     const parseConfig = (config: ContributesConfigurationType) => ({
    //             ...config,
    //             properties: Object.entries(config.properties).map(([id, setting]) => ({
    //                 ...setting,
    //             })),
    //         })

    //     return {
    //         contributes: {
    //             configuration,
    //         },
    //     }
    // },
    activationEvents(
        { contributes, activationEvents }: PickManifest<'activationEvents'> & PickContributes<'commands'>,
        {
            mode,
            config: {
                development: { alwaysActivationEvent },
            },
        },
    ) {
        if (mode !== 'production' && alwaysActivationEvent)
            return {
                activationEvents: ['*'],
            }
        const { commands } = contributes
        // Generate Activation Events From Commands
        if (!commands || !activationEvents) return {}
        const onCommandsIndex = activationEvents.indexOf('onCommands')
        if (onCommandsIndex < 0) return {}
        const allCommands = commands.map(({ command }) => command)
        const newActivationEvents = [...activationEvents]
        newActivationEvents.splice(onCommandsIndex, 1, ...allCommands.map(command => `onCommand:${command}`))
        return {
            activationEvents: newActivationEvents,
        }
    },
    // requiredRuntimeDependency({
    //     dependencies = {},
    //     devDependencies = {},
    // }: PickManifest<'dependencies' | 'devDependencies'>) {
    //     // TODO extract from actual peerDeps of that package.json
    //     // TODO uncomment when HR is available
    //     // const requiredRuntimeDeps = ['@hediet/node-reload']
    //     const requiredRuntimeDeps = []
    //     const unmetDeps = [...requiredRuntimeDeps]
    //     // I believe it could be slow
    //     const allListedDeps = [dependencies, devDependencies]
    //         .flatMap(deps => deps && Object.keys(deps))
    //         .filter(a => a !== undefined)
    //     for (const requiredDep of unmetDeps) {
    //         if (allListedDeps.includes(requiredDep)) unmetDeps.splice(unmetDeps.indexOf(requiredDep), 1)
    //     }
    //     if (unmetDeps.length)
    //         throw new TypeError(
    //             `These required peerDependencies are not in your package.json: ${unmetDeps.join(
    //                 ', ',
    //             )} please install them`,
    //         )
    //     return {
    //         // TODO use pick
    //         dependencies: {
    //             // TODO do we really need it?
    //             [requiredRuntimeDeps[0]!]: '*',
    //         },
    //     }
    // },
})

/** Generate manifest with property generates from {@link propsGenerators}
 * @param sourceManifest Manifest, from which props will be generated
 * @param runGenerators property generators to run. true means all, otherwise pass array to run only them
 * @param mergeSource Wheter return manifest with merged fields or only generated (if false)
 */
export const runGeneratorsOnManifest = async (
    sourceManifest: ManifestType,
    runGenerators: true | Array<keyof typeof propsGenerators>,
    mergeSource: boolean,
    propsGeneratorsMeta: PropsGeneratorsMeta,
) => {
    debug('Running generators on manifest')
    debug({
        runGenerators,
        propsGeneratorsMeta,
    })
    if (runGenerators === true) runGenerators = Object.keys(propsGenerators)
    let generatedManifest = {} as ManifestType
    for (const prop of runGenerators)
        generatedManifest = defaultsDeep(
            await propsGenerators[prop](sourceManifest, propsGeneratorsMeta),
            generatedManifest,
        )
    debug('Generated props %o', generatedManifest)
    return mergeSource ? defaultsDeep(generatedManifest, sourceManifest) : generatedManifest
}

// 100% safe but
// TODO-low use ttypescript to extract the type to constant automaticlly
// TODO-low it's interesting type but it is not used, maybe remove?
/** Keys from package.json that will be used in all prop generators */
export type RequiredKeysFromManifest = keyof UnionToIntersection<
    NonNullable<Parameters<typeof propsGenerators[keyof typeof propsGenerators]>[0]>
>
