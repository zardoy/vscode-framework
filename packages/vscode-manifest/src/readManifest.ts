import path from 'path'
import { mapKeys } from 'lodash'
import { readFile } from 'jsonfile'
import { Except } from 'type-fest'
import { validateOrThrow } from './validateManifest'

// TODO thank https://blog.hediet.de/post/hot_reload_for_vs_code_extension_development

import { ManifestType } from './frameworkTypes'

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
     * Works only on contribution fields where full ids (with extension name) are needed.
     * Set to false to disable this behaviour.
     * @note The setting will be probably removed.
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
export const readDirectoryManifest = async ({
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
    const manifest: ManifestType = await readFile(manifestPath)

    if (throwIfInvalid) validateOrThrow(manifest)

    // TODO rewrite
    /**
     * configurationDefaults, keybindings must have extension name prefix for settings
     * TODO customEditors, submenus, viewsWelcome, walkthroughs, menus and so on
     * @returns id.name - only one dot
     */
    const ensureHasId = (
        where: keyof Pick<NonNullable<ManifestType['contributes']>, 'commands' | 'colors' | 'configuration' | 'menus'>,
        id: string,
    ) => {
        const parts = id.split('.')
        // TODO! produce warning
        if (parts.length >= 2 && parts[0] === manifest.name) return id
        const generateId = restoreIds === true || (Array.isArray(restoreIds) && restoreIds.includes(where))
        return generateId ? `${manifest.name}.${id}` : id
    }

    if (restoreIds && manifest.contributes) {
        const { configuration, commands, menus } = manifest.contributes
        if (commands)
            manifest.contributes.commands = commands.map(c => ({
                ...c,
                // TODO ensure that command is required in schema
                command: ensureHasId('commands', c.command),
            }))

        if (configuration) {
            type ConfigProperties = Extract<
                typeof configuration,
                {
                    properties: any
                }
            >['properties']

            const transformKeys = (properties: ConfigProperties): ConfigProperties =>
                mapKeys(properties, (_, key) => ensureHasId('configuration', key))

            manifest.contributes.configuration = Array.isArray(configuration)
                ? configuration.map(({ properties, ...rest }) => ({
                      ...rest,
                      properties: transformKeys(properties),
                  }))
                : {
                      ...configuration,
                      properties: transformKeys(configuration.properties),
                  }
        }

        if (menus)
            // however it is possible to disable commands of external extensions e.g. errorLens.copyProblemMessage, but not builtin
            // TODO tests
            // lodash-marker
            manifest.contributes.menus = Object.fromEntries(
                Object.entries(menus).map(([menuName, menuEntries]) => [
                    menuName,
                    menuEntries.map(({ command, ...rest }) => ({ ...rest, command: ensureHasId('menus', command) })),
                ]),
            )
    }

    return manifest
}
