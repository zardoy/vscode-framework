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
     * Try to restore extension ID where they are missing. e.g.
     * ```json
     * "contributes": {
     *     "commands": [ { "command": "say-hello", ... } ] -> "commands": [ { "command": "extension.say-hello", ... } ]
     *     // But, be aware of that!
     *     "commands": [ { "command": "ext.say-hello", ... } ] -> "commands": [ { "command": "extension.ext.say-hello", ... } ]
     *     // but will skip this
     *     "commands": [ { "command": "extension.say-hello", ... } ] -> "commands": [ { "command": "extension.say-hello", ... } ]
     * }
     * ```
     * Works only on contribution fields where full ids (with extension name) are needed
     * The setting will probably be removed
     * Set to false to disable this behavious
     * @default true
     */
    restoreIds?: boolean | string[]
    /**
     * set to `false` to skip validation but in this case you need to handle it manually.
     * see exports of validateManifest.ts for more
     * @default true
     * */
    throwIfInvalid?: boolean
    manifestPath: string
}

/** `readManifest` wrapper to read it from <directory = cwd>/package.json */
export const readDirectoryManifest = ({
    directory = process.cwd(),
    ...options
}: Except<ReadManifestOptions, 'manifestPath'> & { directory?: string } = {}) =>
    readManifest({ manifestPath: path.join(directory, 'package.json'), ...options })

/**
 * Read extension manifest (package.json) from given path. Note that it will be validated by default and normalizes ids!
 *
 * I recommend to use {@linkcode readDirectoryManifest} instead
 */
export const readManifest = async ({
    manifestPath,
    // TODO-high change to false
    restoreIds = true,
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
            // TODO! produce warning
            if (parts.length >= 2 && parts[0] === manifest.name) return id
            const generateId = restoreIds === true || (Array.isArray(restoreIds) && restoreIds.includes(where))
            return generateId ? `${manifest.name}.${id}` : id
        }

        if (restoreIds) {
            if (manifest.contributes?.commands)
                manifest.contributes.commands = manifest.contributes.commands.map(c => ({
                    ...c,
                    // TODO ensure that command is required in schema
                    command: ensureHasId('commands', c.command!),
                }))

            if (manifest.contributes?.configuration) {
                // TODO remove this limitation and warning
                if (Array.isArray(manifest.contributes.configuration))
                    throw new TypeError("contributes.configuration can't be array")
                manifest.contributes.configuration.properties = mapKeys(
                    manifest.contributes.configuration.properties,
                    (_value, key) => ensureHasId('configuration', key),
                )
            }
        }

        return manifest
    } catch (err) {
        throw err
    }
}
