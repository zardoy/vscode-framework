import path from 'path';
import { mapKeys } from 'lodash';
import { readFile } from 'jsonfile';
import { Config } from '../config';

// TODO thank https://blog.hediet.de/post/hot_reload_for_vs_code_extension_development

import { ExtensionManifest } from './manifestType';

// package: generate package

/** Should be cached or not called too often */
export const getManifest = async (config: Config, manifestPath = path.join(process.cwd(), 'package.json')) => {
    // TODO validate
    console.log(path.join(process.cwd(), 'package.json'), manifestPath);
    const manifest: ExtensionManifest = await readFile(manifestPath);
    console.log('supa!');

    /**
     * TODO doesn't ensure - just adds it!
     * @returns id.name - only one dot
     */
    const ensureHasId = (where: keyof NonNullable<ExtensionManifest['contributes']>, name: string) => {
        const generateId = config.allowId || (Array.isArray(config.allowId) && config.allowId.includes(where));
        return generateId ? `${manifest.name}.${name}` : name;
    };

    if (manifest.contributes?.commands)
        manifest.contributes.commands = manifest.contributes.commands.map(c => ({ ...c, command: ensureHasId('commands', c.command) }));

    if (manifest.contributes?.configuration) {
        if (Array.isArray(manifest.contributes.configuration)) throw new TypeError('contributes.configuration can\'t be array');
        manifest.contributes.configuration.properties = mapKeys(manifest.contributes.configuration.properties, (_value, key) => ensureHasId('configuration', key));
    }

    return manifest;
};
