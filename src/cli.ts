import path from 'path';
import { modifyJsonFile } from 'modify-json-file';
import gitRemoteOriginUrl from 'git-remote-origin-url';

import { build as esbuildBuild, BuildOptions } from 'esbuild';
import { readFile } from 'jsonfile';
import type { CommandsExport } from '.';

interface Options {
    /**
     * - original - update root's package.json (changes will be commited)
     * (soon) - vsce - update package.json that inside VSIX package (I'll recommend this approach in the future)
     * or provide custom path to package.json
     */
    where: 'original' | { path: string };
    commands: CommandsExport;
    /** @default [] - Updates all fields */
    updateFields?: Array<'repository' | 'contributes.commands' | 'activationEvents' | 'engines'>;
}

export const updatePackageJson = async ({ where, commands, updateFields = [] }: Options) => {
    const packageJsonFile = path.join(process.cwd(), typeof where === 'string' && where === 'original' ? 'package.json' : where.path);

    await modifyJsonFile(packageJsonFile, async json => {
        const updateFieldsExecutors: Record<(typeof updateFields)[number], () => unknown> = {
            repository: async () => {
                let githubRepoUrl = await gitRemoteOriginUrl();

                if (githubRepoUrl.endsWith('.git')) githubRepoUrl = githubRepoUrl.slice(0, -'.git'.length);
                json.repository = githubRepoUrl;
            },
            engines() {
                json.engines = {
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    vscode: `^${require('@types/vscode/package.json').version}`,
                };
            },
            'contributes.commands': () => {
                const commandPrefix: string = json.name;
                const displayName: string = json.displayName;
                if (!json.contributes) json.contributes = {};
                json.contributes.commands = commands.regular.map(({ command, title }) => ({
                    // category: category ? displayName : category,
                    category: displayName,
                    command: `${commandPrefix}.${command}`,
                    title,
                }));
            },
            activationEvents() {
                type ContributedCommand = Record<'category' | 'command' | 'title', string>;
                const allCommands = (json.contributes.commands as ContributedCommand[]).map(({ command }) => command);
                // TODO would override custom commands
                if ((json.activationEvents.length === 1 && json.activationEvents[0] === 'onCommands') || json.activationEvents.every((event: string) => event.startsWith('onCommand:')))
                    json.activationEvents = allCommands.map(command => `onCommand:${command}`);
            },
        };

        if (updateFields.length === 0) updateFields = Object.keys(updateFieldsExecutors);

        for (const prop of updateFields)
            // eslint-disable-next-line no-await-in-loop
            await updateFieldsExecutors[prop]();

        return json;
    });
};

export const build = async (NODE_ENV: 'development' | 'production', entryPoint = 'src/index.ts', outfile = 'out.js', overrideBuildOptions: BuildOptions = {}) => {
    const packageJson = await readFile(path.join(process.cwd(), 'package.json'));

    if (!packageJson.displayName) throw new TypeError(`displayName must be defined in package.json`);

    const result = await esbuildBuild({
        bundle: true,
        watch: NODE_ENV === 'development',
        minify: NODE_ENV === 'production',
        entryPoints: [
            entryPoint,
        ],
        external: [
            'vscode',
        ],
        platform: 'node',
        outfile,
        ...overrideBuildOptions,
        define: {
            'process.env.NODE_ENV': `"${NODE_ENV}"`,
            'process.env.EXTENSION_ID_NAME': `"${packageJson.name}"`,
            'process.env.EXTENSION_DISPLAY_NAME': `"${packageJson.displayName}"`,
            'process.env.REVEAL_OUTPUT_PANEL_IN_DEVELOPMENT': `true`,
            ...overrideBuildOptions.define ? overrideBuildOptions.define : {},
        },
    });
};
