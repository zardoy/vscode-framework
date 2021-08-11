// TODO can fields contain " ?

import { writeFile, readFile } from 'jsonfile';
import fsExtra from 'fs-extra';
import { defaultsDeep } from 'lodash';
import { defaultConfig } from '../../config';
import { pickObject } from '../../util';

import { ExtensionManifest } from '../manifestType';
import { getManifest } from '../getManifest';
import { fieldGenerators } from './fieldGenerators';

interface Options {
    /**
     * - original - update root's package.json (changes will be commited)
     * (soon) - vsce - update package.json that inside VSIX package (I'll recommend this approach in the future)
     * or provide custom path to package.json
     */
    output: string;
    /** @default true */
    overwrite: boolean;
    /** @default [] - Updates all fields */
    updateFields?: Array<keyof typeof fieldGenerators>;
}

export const writeManifest = async ({ output, overwrite = true, updateFields = [] }: Options) => {
    if (fsExtra.existsSync(output))
        if (overwrite)
            await fsExtra.unlink(output);
        else
            return;

    await writeFile(output, await generateManifest({ updateFields, sourceManifest: await getManifest(defaultConfig) }), { spaces: 4 });
};

export const generateManifest = async ({
    updateFields = [] as NonNullable<Options['updateFields']>,
    /** Set to false to get only generated fields */
    sourceFields = true,
    config = defaultConfig,
    sourceManifest,
}) => {
    if (updateFields.length === 0) updateFields = Object.keys(fieldGenerators);
    // use ttypescript
    // TODO fix XO
    let json: Partial<ExtensionManifest>
     = sourceFields ? pickObject(sourceManifest as ExtensionManifest, ['capabilities', 'version', 'categories', 'keywords', 'contributes', 'displayName', 'name', 'publisher', 'extensionDependencies', 'extensionKind']) : {};

    for (const prop of updateFields)
        // eslint-disable-next-line no-await-in-loop
        json = defaultsDeep(json, await fieldGenerators[prop](sourceManifest));

    return json;
};
