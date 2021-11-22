import path from 'path'
import { camelCase } from 'change-case'
import { mapKeys } from 'lodash'
import { readFile } from 'jsonfile'
import { Except } from 'type-fest'
import { validateOrThrow } from './validateManifest'

// TODO thank https://blog.hediet.de/post/hot_reload_for_vs_code_extension_development

import { ManifestType } from './frameworkTypes'

// package: generate package

export interface ReadManifestOptions {
    /**
     * Try to restore and prepend extension ID where they are missing. e.g.
     * ```json
     * "contributes": {
     *     "commands": [ { "command": "sayHello", ... } ] -> "commands": [ { "command": "extension.sayHello", ... } ]
     *     // But, be aware of that!
     *     "commands": [ { "command": "ext.sayHello", ... } ] -> "commands": [ { "command": "extension.ext.sayHello", ... } ]
     *     // but will skip this
     *     "commands": [ { "command": "extension.sayHello", ... } ] -> "commands": [ { "command": "extension.sayHello", ... } ]
     * }
     * ```
     * Works only on contribution fields where full ids (with extension name) are needed.
     * Set to false to fully disable this.
     * @note The setting will be probably removed.
     * @default { style: 'camelCase' }
     */
    prependIds?:
        | {
              /** - `original` usually implies pascal-case
               * - `camelCase` transform `name` prop into lowerCase
               */
              style: 'original' | 'camelCase'
              // ignoreContributions: string[]
          }
        | false
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
    prependIds,
    throwIfInvalid = true,
}: ReadManifestOptions): Promise<ManifestType> => {
    const prependIdsStyle = (prependIds ? prependIds.style : prependIds) ?? 'camelCase'

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

        const name = prependIdsStyle === 'camelCase' ? camelCase(manifest.name) : manifest.name
        if (parts.length >= 2 && parts[0] === name) return id
        const generateId = prependIdsStyle || (Array.isArray(prependIdsStyle) && prependIdsStyle.includes(where))
        return generateId ? `${name}.${id}` : id
    }

    if (prependIdsStyle && manifest.contributes) {
        const { configuration, commands, menus } = manifest.contributes
        if (commands)
            manifest.contributes.commands = commands.map(c => ({
                ...c,
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
            // TODO tests
            // lodash-marker
            manifest.contributes.menus = Object.fromEntries(
                Object.entries(menus).map(([menuName, menuEntries]) => [
                    menuName,
                    menuEntries.map(({ command, ...rest }) => ({
                        ...rest,
                        command: command && ensureHasId('menus', command),
                    })),
                ]),
            )
    }

    return manifest
}
