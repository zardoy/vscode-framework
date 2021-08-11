import path from 'path';
import { build as esbuildBuild, BuildOptions } from 'esbuild';
import execa from 'execa';
import fsExtra from 'fs-extra';
import { readFile } from 'jsonfile';
import { defaultConfig } from '../config';

export const build = async (NODE_ENV: 'development' | 'production', entryPoint = 'src/extension.ts', outfile = 'out/extension.js', overrideBuildOptions: BuildOptions = {}) => {
    const packageJson = await readFile(path.join(process.cwd(), 'package.json'));

    if (!packageJson.displayName) throw new TypeError('displayName must be defined in package.json');

    await fsExtra.copy(require.resolve('./extensionBootstrap'), path.join(process.cwd(), 'out/extensionBootstrap.js'));

    /** falsy values are trimmed. I don't think that we need to pass false explicitly here */
    const args = {
        'skip-add-to-recently-opened': true,
        'new-window': true,
        wait: true,
        extensionDevelopmentPath: process.cwd(),
        'disable-extensions': defaultConfig.disableExtensions,
        'open-devtools': defaultConfig.openDevtools,
    };

    const argsParsed = Object.entries(args).flatMap(([name, value]) => {
        if (!value) return undefined;
        const array = [`--${name}`];
        if (typeof value === 'string') array.push(value);
        return array;
    }).filter(a => a !== undefined) as string[];

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
            'process.env.REVEAL_OUTPUT_PANEL_IN_DEVELOPMENT': 'true',
            ...overrideBuildOptions.define ? overrideBuildOptions.define : {},
        },
        plugins: [
            {
                name: 'build-wather',
                setup(build) {
                    let rebuildCount = 0;
                    let vscodeProcess: execa.ExecaChildProcess | undefined;
                    build.onEnd(({ errors }) => {
                        if (errors.length > 0) return;
                        rebuildCount++;
                        // reference: NativeParsedArgs --open-devtools
                        if (rebuildCount === 1) vscodeProcess = execa('code', [...argsParsed], { preferLocal: false, detached: true });
                    });
                },
            },
        ],
    });
};
