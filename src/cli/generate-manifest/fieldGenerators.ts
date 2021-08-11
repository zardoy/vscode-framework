import { getGithubRemoteInfo } from 'github-remote-info';
import { defaultConfig } from '../../config';
import { MaybePromise, readModulePackage } from '../../util';
import { ExtensionManifest } from '../manifestType';

// They're generating package.json fields
// If you with you can use them directly

type GeneralFieldGeneratorsType = Record<string, (manifestData: any, configData: any) => MaybePromise<Partial<ExtensionManifest>>>;

// MAKE TECH!
const makeGenerators = <T extends GeneralFieldGeneratorsType>(generators: T) => generators;

// HERE!
export const fieldGenerators = makeGenerators({
    // every generator's return type should be deeply merged
    async repository() {
        const githubRepoUrl = await getGithubRemoteInfo(process.cwd());
        if (!githubRepoUrl) throw new Error('GitHub remote origin can\'t be detected on current cwd. Either disable generating repository field or consider publising your project to GitHub');

        const { name, owner } = githubRepoUrl;

        return { repository: `https://github.com/${owner}/${name}` };
    },
    async engines() {
        const vscodeTypes = await readModulePackage('@types/vscode');
        return {
            engines: {
                vscode: `^${vscodeTypes.version!}`,
            },
        };
    },
    extensionEntryPoint() {
        return { main: `out/${process.env.NODE_ENV === 'development' ? 'extensionBootstrap.js' : 'extension.js'}` };
    },
    'contributes.commands': (manifest: Pick<ExtensionManifest, 'contributes' | 'name' | 'displayName'>) => {
        const { contributes } = manifest;
        if (!contributes?.commands) return {};
        const displayName = manifest.displayName;
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
        };
    },
    activationEvents({ contributes, activationEvents }: Pick<ExtensionManifest, 'contributes' | 'activationEvents'>) {
        if (!contributes?.commands) return {};
        const allCommands = contributes.commands.map(({ command }) => command);
        // TODO would override custom commands
        if (
            !activationEvents
            || (activationEvents.length === 1 && activationEvents[0] === 'onCommands')
            || activationEvents.every((event: string) => event.startsWith('onCommand:'))
        )
            return { activationEvents: allCommands.map(command => `onCommand:${command}`) };
        return {};
    },
});
