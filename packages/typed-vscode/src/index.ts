import fs from 'fs'
import { join } from 'path'
import assert from 'assert'
import CodeBlockWriter from 'code-block-writer'
import {
    EnumType,
    FetchingJSONSchemaStore,
    getOptionValues,
    InputData,
    JSONSchemaInput,
    Name,
    quicktype,
    RenderContext,
    tsFlowOptions,
    TypeScriptRenderer,
    TypeScriptTargetLanguage,
} from 'quicktype-core'
import { utf16StringEscape } from 'quicktype-core/dist/support/Strings.js'
import { mapKeys, mapValues } from 'lodash'
import type { ContributesConfigurationType, ExtensionManifest } from 'vscode-manifest'
import { StringWriters } from 'generated-module'
import fsExtra from 'fs-extra'
import { Except } from 'type-fest'
import { ensureArray } from './util'
import { Config } from './config'

export type Options = {
    contributionPoints: Pick<NonNullable<ExtensionManifest['contributes']>, 'commands' | 'configuration'>
    /** false disable writing */
    outputPath: string | false
    config: Except<Config, 'target' | 'out'>
} & (
    | {
          target: Config['target']
      }
    | {
          framework: {
              useConfigurationType: boolean
          }
      }
)

// in target: native, all commands and configuration properties must start with same ID

// Finally we got it here
// eslint-disable-next-line complexity
export const generateFile = async ({ contributionPoints, outputPath, config, ...rest }: Options) => {
    const frameworkTarget = 'framework' in rest
    const notNativeTarget = frameworkTarget || rest.target !== 'native'
    const withoutExtensionId = (id: string) => (config.trimIds && notNativeTarget ? id.slice(id.indexOf('.') + 1) : id)
    const writer = new CodeBlockWriter()

    // TODO run contributes.configuration generators
    const allConfigProperties = contributionPoints.configuration && {
        // merge root all properties into one object
        properties: Object.fromEntries(
            ensureArray(contributionPoints.configuration).flatMap(({ properties }) =>
                Object.entries(mapKeys(properties, (_val, name) => withoutExtensionId(name))),
            ),
        ),
    }
    const commandsArr = contributionPoints.commands
        ?.filter(({ command }) => command !== undefined)
        .map(({ command }) => withoutExtensionId(command))

    const getIdPart = (str: string) => /(.+)\./.exec(str)![1]!
    let extensionId: string | undefined
    if (!frameworkTarget && rest.target === 'native')
        if (commandsArr && commandsArr.length > 0) {
            // TODO throw meaningful error if not match (it must match!)
            extensionId = getIdPart(commandsArr[0]!)
            for (const str of commandsArr) {
                if (getIdPart(str) === extensionId) continue
                // todods use string diff
                throw new Error(
                    `Every command ID must have the same extension id. Expected start: ${extensionId}. Got: ${str}`,
                )
            }
        } else if (allConfigProperties) {
            const properties = Object.keys(allConfigProperties.properties)
            extensionId = getIdPart(properties[0]!)
            allConfigProperties.properties = mapKeys(allConfigProperties.properties, (_value, key) => {
                if (getIdPart(key) !== extensionId)
                    throw new Error(
                        `Every configuration property must have the same extension id. Expected start: ${extensionId!}. Got: ${key}`,
                    )

                return key.slice(extensionId.length + 1)
            })
        }

    const writeCommandsType = () => {
        // TODO change to just Commands
        writer.write('interface RegularCommands').block(() => {
            if (!commandsArr) return
            for (const command of commandsArr) writer.quote(command).write(': true').newLine()
        })
    }

    if (frameworkTarget) {
        const { useConfigurationType } = rest.framework
        if (useConfigurationType) {
            writer.writeLine("import { Configuration } from './configurationType'")
            writer.blankLine()
        }

        writer.write("declare module 'vscode-framework'").block(() => {
            writeCommandsType()
            if (useConfigurationType || allConfigProperties)
                writer.writeLine(`interface Settings extends Required<Configuration> {}`)
        })
    } else if (rest.target === 'native') {
        writer.write('declare module "vscode"').block(() => {
            if (commandsArr) {
                writer.write('type ExtensionCommands = ')
                StringWriters.union(commandsArr)(writer)
                writer
                    .write(
                        `
export namespace commands {
    export function executeCommand<T = unknown>(command: ExtensionCommands, ...rest: any[]): Thenable<T>
    export function registerCommand(
        command: ExtensionCommands,
        callback: (...args: any[]) => any,
        thisArg?: any,
    ): Disposable
    export function registerTextEditorCommand(
        command: ExtensionCommands,
        callback: (textEditor: TextEditor, edit: TextEditorEdit, ...args: any[]) => void,
        thisArg?: any,
    ): Disposable
}`,
                    )
                    .newLine()
                    .blankLine()
            }

            // ../template.ts has more readable variant
            if (allConfigProperties)
                writer.write(`
export namespace workspace {
    export function getConfiguration(
        section: '${extensionId!}',
        scope?: ConfigurationScope | null,
    ): {
        /**
         * Return a value from this configuration.
         *
         * @param section Configuration name, supports _dotted_ names.
         * @return The value \`section\` denotes or \`undefined\`.
         */
        get<K extends keyof Configuration, T extends Configuration[K]>(section: K): T | undefined

        /**
         * Return a value from this configuration.
         *
         * @param section Configuration name, supports _dotted_ names.
         * @param defaultValue A value should be returned when no value could be found, is \`undefined\`.
         * @return The value \`section\` denotes or the default.
         */
        get<K extends keyof Configuration, T extends Configuration[K]>(section: K, defaultValue: T): T

        /**
         * Check if this configuration has a certain value.
         *
         * @param section Configuration name, supports _dotted_ names.
         * @return \`true\` if the section doesn't resolve to \`undefined\`.
         */
        has<K extends keyof Configuration>(section: K): boolean

        /**
         * Retrieve all information about a configuration setting. A configuration value
         * often consists of a *default* value, a global or installation-wide value,
         * a workspace-specific value, folder-specific value
         * and language-specific values (if {@link WorkspaceConfiguration} is scoped to a language).
         *
         * Also provides all language ids under which the given configuration setting is defined.
         *
         * *Note:* The configuration name must denote a leaf in the configuration tree
         * (\`editor.fontSize\` vs \`editor\`) otherwise no result is returned.
         *
         * @param section Configuration name, supports _dotted_ names.
         * @return Information about a configuration setting or \`undefined\`.
         */
        inspect<K extends keyof Configuration, T extends Configuration[K]>(
            section: K,
        ):
            | {
                    key: K

                    defaultValue?: T
                    globalValue?: T
                    workspaceValue?: T
                    workspaceFolderValue?: T

                    defaultLanguageValue?: T
                    globalLanguageValue?: T
                    workspaceLanguageValue?: T
                    workspaceFolderLanguageValue?: T

                    languageIds?: string[]
                }
            | undefined

        /**
         * Update a configuration value. The updated configuration values are persisted.
         *
         * A value can be changed in
         *
         * - {@link ConfigurationTarget.Global Global settings}: Changes the value for all instances of the editor.
         * - {@link ConfigurationTarget.Workspace Workspace settings}: Changes the value for current workspace, if available.
         * - {@link ConfigurationTarget.WorkspaceFolder Workspace folder settings}: Changes the value for settings from one of the {@link workspace.workspaceFolders Workspace Folders} under which the requested resource belongs to.
         * - Language settings: Changes the value for the requested languageId.
         *
         * *Note:* To remove a configuration value use \`undefined\`, like so: \`config.update('somekey', undefined)\`
         *
         * @param section Configuration name, supports _dotted_ names.
         * @param value The new value.
         * @param configurationTarget The {@link ConfigurationTarget configuration target} or a boolean value.
         *	- If \`true\` updates {@link ConfigurationTarget.Global Global settings}.
            *	- If \`false\` updates {@link ConfigurationTarget.Workspace Workspace settings}.
            *	- If \`undefined\` or \`null\` updates to {@link ConfigurationTarget.WorkspaceFolder Workspace folder settings} if configuration is resource specific,
            * 	otherwise to {@link ConfigurationTarget.Workspace Workspace settings}.
            * @param overrideInLanguage Whether to update the value in the scope of requested languageId or not.
            *	- If \`true\` updates the value under the requested languageId.
            *	- If \`undefined\` updates the value under the requested languageId only if the configuration is defined for the language.
            * @throws error while updating
            *	- configuration which is not registered.
            *	- window configuration to workspace folder
            *	- configuration to workspace or workspace folder when no workspace is opened.
            *	- configuration to workspace folder when there is no workspace folder settings.
            *	- configuration to workspace folder when {@link WorkspaceConfiguration} is not scoped to a resource.
            */
        update<K extends keyof Configuration, T extends Configuration[K]>(
            section: K,
            value: T,
            configurationTarget?: ConfigurationTarget | boolean | null,
            overrideInLanguage?: boolean,
        ): Thenable<void>
    } & Readonly<Record<string, string>>
}`)
        })
    } else {
        writer.write('export ')
        writeCommandsType()
        writer.blankLine()
    }

    writer.blankLine()
    if ((!frameworkTarget || !rest.framework.useConfigurationType) && allConfigProperties) {
        if (!frameworkTarget && rest.target === 'bare') writer.write('export ')
        writer.write(await generateConfigurationFromSchema(allConfigProperties))
    }

    writer.writeLine('export {}')
    const contents = writer.toString()
    if (outputPath) {
        await fsExtra.ensureDir(join(outputPath, '..'))
        await fs.promises.writeFile(outputPath, contents, 'utf-8')
    }

    return contents
}

// with target: native, it generates plain object
// it doesn't take into account this case:
// "group": { // ignored!
//     "type": "object",
//     "properties": {
//         "foo": {
//             "type": "boolean"
//         }
//     }
// },
// "group.foo": {
//     "type": "number"
// }

export const generateConfigurationFromSchema = async (
    allConfigProperties: Pick<ContributesConfigurationType, 'properties'>,
) => {
    allConfigProperties.properties = Object.fromEntries(
        Object.entries(allConfigProperties.properties).filter(([, value]) => {
            const keys = Object.keys(value)
            return !keys.every(name => ['deprecationMessage', 'markdownDeprecationMessage'].includes(name))
        }),
    )

    // worst lib ever
    const jsonInput = new JSONSchemaInput(new FetchingJSONSchemaStore())
    await jsonInput.addSource({
        name: 'Configuration',
        schema: JSON.stringify(allConfigProperties),
    })
    const inputData = new InputData()
    inputData.addInput(jsonInput)

    class CustomTypeScriptTargetLanguage extends TypeScriptTargetLanguage {
        protected override makeRenderer(
            renderContext: RenderContext,
            untypedOptionValues: { [name: string]: any },
        ): CustomTypeScriptRenderer {
            return new CustomTypeScriptRenderer(
                this,
                renderContext,
                getOptionValues(tsFlowOptions, untypedOptionValues),
            )
        }
    }

    class CustomTypeScriptRenderer extends TypeScriptRenderer {
        protected override emitEnum(e: EnumType, enumName: Name): void {
            this.emitLine(['type ', enumName, ' = '])
            this.forEachEnumCase(e, 'none', (name, jsonName, position) => {
                const suffix = position === 'last' || position === 'only' ? '' : ' | '
                this.indent(() => this.emitLine(`"${utf16StringEscape(jsonName)}"`, suffix))
            })
        }
    }

    let { lines } = await quicktype({
        inputData,
        lang: new CustomTypeScriptTargetLanguage(),
        rendererOptions: {
            'runtime-typecheck': 'false',
            'just-types': 'true',
            justTypes: 'true',
        },
    })

    lines = lines.map(line => line.trimEnd()) // we don't need trailing whitespaces

    const inlineEnums = (content: string) => {
        const enums = new Map<string, string>()
        content = content
            .replace(/^type (.+) =\n?((?:\s*".+"(?: \|\n?)?)+)/gm, (_, enumName: string, unions: string) => {
                if (enums.has(enumName)) throw new Error(`Panic: enum ${enumName} already is here`)
                enums.set(
                    enumName,
                    unions
                        .split('\n')
                        .map(str => str.trim())
                        .join(' '),
                )
                return ''
            })
            .split('\n\n\n')
            .join('')

        for (const [enumName, enumString] of enums.entries()) content = content.split(enumName).join(enumString)

        return content
    }

    lines = inlineEnums(lines.join('\n')).split('\n')

    return (
        lines
            .join('\n')
            // remove leading export for root type
            .replace('export ', '')
            .replace('ConfigurationObject', 'Configuration')
    )
}
