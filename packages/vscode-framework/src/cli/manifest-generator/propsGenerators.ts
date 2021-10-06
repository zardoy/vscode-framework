import { getGithubRemoteInfo } from 'github-remote-info'
import { MaybePromise, readModulePackage } from '../../util'
import { ExtensionManifest, ManifestType } from 'vscode-manifest'
import { UnionToIntersection } from 'type-fest'
import { defaultsDeep } from 'lodash'

// They're generating package.json properties
// If you with you can use them directly

type GeneralPropGeneratorsType = Record<
    string,
    (manifestData: any, configData: any) => MaybePromise<Partial<ManifestType>>
>

type PickManifest<T extends keyof ManifestType> = Pick<ManifestType, T>

// MAKE TECH!
const makeGenerators = <T extends GeneralPropGeneratorsType>(generators: T) => generators

// HERE!
export const propsGenerators = makeGenerators({
    // TODO implement tests
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
    // disables useless Q&A tab in marketplace
    qnaFalse() {
        return { qna: false }
    },
    extensionEntryPoint() {
        // TODO pass config
        // TODO browser entry point
        // return { main: `${process.env.NODE_ENV === 'development' ? 'extensionBootstrap.js' : 'extension.js'}` }
        return { main: 'extension.js' }
    },
    'contributes.commands': (manifest: PickManifest<'contributes' | 'name' | 'displayName'>) => {
        const { contributes } = manifest
        if (!contributes?.commands) return {}
        const displayName = manifest.displayName
        return {
            contributes: {
                // TODO HIGH !!!!
                commands: contributes.commands.map(({ command, title, category = displayName }) => ({
                    // category: category ? displayName : category,
                    category,
                    command,
                    title,
                })),
            },
        }
    },
    activationEvents({ contributes, activationEvents }: PickManifest<'contributes' | 'activationEvents'>) {
        if (!contributes?.commands) return {}
        const allCommands = contributes.commands.map(({ command }) => command)
        // TODO! would override custom commands
        if (
            !activationEvents ||
            (activationEvents.length === 1 && activationEvents[0] === 'onCommands') ||
            activationEvents.every((event: string) => event.startsWith('onCommand:'))
        )
            // TODO
            return {
                activationEvents:
                    process.env.NODE_ENV === 'development' ? ['*'] : allCommands.map(command => `onCommand:${command}`),
            }
        else return {}
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
    runGenerators: true | keyof typeof propsGenerators,
    mergeSource: boolean,
) => {
    // TODO-low remove unknown conversion
    if (runGenerators === true) runGenerators = Object.keys(propsGenerators) as unknown as keyof typeof propsGenerators
    let generatedManifest = {} as ManifestType
    for (const prop of runGenerators)
        generatedManifest = defaultsDeep(await propsGenerators[prop](sourceManifest), generatedManifest)
    return mergeSource ? defaultsDeep(generatedManifest, sourceManifest) : generatedManifest
}

// 100% safe but
// TODO-low use ttypescript to extract the type to constant automaticlly
// TODO-low it's interesting type but it is not used, maybe remove?
/** Keys from package.json that will be used in all prop generators */
export type RequiredKeysFromManifest = keyof UnionToIntersection<
    NonNullable<Parameters<typeof propsGenerators[keyof typeof propsGenerators]>[0]>
>
