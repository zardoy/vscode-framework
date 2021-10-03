import path from 'path'
import { mapKeys } from 'lodash'
import { validateOrThrow } from './validateManifest'
import { readFile } from 'jsonfile'

// TODO thank https://blog.hediet.de/post/hot_reload_for_vs_code_extension_development

import { ManifestType } from './frameworkTypes'
import { Except } from 'type-fest'

// package: generate package

interface ReadManifestOptions {
    /**
     * Contribution fields where full ids (with extension name) are allowed
     * Will be probably removed
     * @default true
     */
    allowIds?: boolean | string[]
    /**
     * set to `false` to skip validation but in this case you need to handle it manually.
     * see exports of validateManifest.ts for more
     * @default true
     * */
    throwIfInvalid?: boolean
    manifestPath: string
}

/** `readManifest` wrapper to read it from <cwd>/package.json */
export const readDirectoryManifest = ({
    directory = process.cwd(),
    ...options
}: Except<ReadManifestOptions, 'manifestPath'> & { directory?: string } = {}) =>
    readManifest({ manifestPath: path.join(directory, 'package.json'), ...options })

/** Should be cached */
/** Read extension manifest (package.json) from given path. Note that it will be validated by default */
export const readManifest = async ({
    manifestPath,
    // TODO-high change to false
    allowIds = true,
    throwIfInvalid = true,
}: ReadManifestOptions): Promise<ManifestType> => {
    try {
        const manifest: ManifestType = await readFile(manifestPath)

        if (throwIfInvalid) validateOrThrow(manifest)

        /**
         * configurationDefaults, keybindings must have extension name prefix for settings
         * TODO customEditors, submenus, viewsWelcome, walkthroughs, menus and so on
         * @returns id.name - only one dot
         */
        const ensureHasId = (
            where: keyof Pick<NonNullable<ManifestType['contributes']>, 'commands' | 'colors' | 'configuration'>,
            id: string,
        ) => {
            const parts = id.split('.')
            // TODO produce warning
            if (parts.length >= 2 && parts[0] === manifest.name) return id
            const generateId = allowIds === true || (Array.isArray(allowIds) && allowIds.includes(where))
            return generateId ? `${manifest.name}.${id}` : id
        }

        if (manifest.contributes?.commands)
            manifest.contributes.commands = manifest.contributes.commands.map(c => ({
                ...c,
                // TODO ensure that command is required in schema
                command: ensureHasId('commands', c.command!),
            }))

        if (manifest.contributes?.configuration) {
            if (Array.isArray(manifest.contributes.configuration))
                throw new TypeError("contributes.configuration can't be array")
            manifest.contributes.configuration.properties = mapKeys(
                manifest.contributes.configuration.properties,
                (_value, key) => ensureHasId('configuration', key),
            )
        }

        return manifest
    } catch (err) {
        throw err
    }
}
