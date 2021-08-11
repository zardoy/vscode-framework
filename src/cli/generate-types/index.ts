import path from 'path';
import fsExtra from 'fs-extra';
import { PackageJson } from 'type-fest';
import { writeFile } from 'jsonfile';
import { defaultConfig } from '../../config';
import { oneOf } from '../../util';
import { GracefulError } from '../errors';
import { getManifest } from '../getManifest';

// TODO make TS peer dep and use printer

/**
 * @param cwd Directory with package.json (manifest) and node_modules
 */
export const generateTypes = async (cwd: string) => {
    const config = defaultConfig;

    console.log('flag', 1);
    const manifest = await getManifest(defaultConfig, path.join(cwd, 'package.json'));
    if (!manifest.contributes) throw new GracefulError('Contributes field doesn\'t exist. Nothing to generate from');
    let output = '';
    if (manifest.contributes.commands) {
        const commandsOutput: string[] = [];
        for (const { command, title } of manifest.contributes.commands)
            commandsOutput.push(`
                { id: "${command}", title: "${title}" }
            `);

        output += `
            export type Commands = {
                regular: [ ${commandsOutput.join(',')} ]
            }
        `;
    } else {
        output += `export type Commands = {
            regular: [{ id: "ERROR: There are no command contributions in manifest", title: "" }]
        }
        `;
    }

    if (manifest.contributes.configuration) {
        // TODO provide line column TODO: REMOVE REMOVE
        if (Array.isArray(manifest.contributes.configuration)) throw new TypeError('contributes.configuration can\'t be array');
        let settingsOutput = '';
        for (const [key, setting] of Object.entries(manifest.contributes.configuration.properties)) {
            // TODO why string[]
            let outputValue = oneOf(setting.type, ['boolean', 'number', 'string']) ? setting.type as string : 'unknown';
            if (setting.enum)
                outputValue = setting.enum.map(s => `"${s}"`).join(' | ');

            settingsOutput += `
                "${key}": ${outputValue};
            `;
        }

        output += `
            export type Settings = { ${settingsOutput} }
        `;
    } else {
        output += `export type Settings = { "ERROR: There are no configuration contributions in manifest": any }
        `;
    }

    const moduleName = '.vscode-framework';
    const modulePath = path.join(cwd, `node_modules/${moduleName}`);
    console.log('flag', 2);
    await fsExtra.ensureDir(modulePath);
    console.log('flag', 3);
    await fsExtra.writeFile(path.join(modulePath, 'index.d.ts'), output, 'utf8');
    const generatedPackage: PackageJson = {
        name: moduleName,
        version: '0.0.0-generated',
        types: 'index.d.ts',
    };
    await writeFile(path.join(modulePath, 'package.json'), generatedPackage);
};
