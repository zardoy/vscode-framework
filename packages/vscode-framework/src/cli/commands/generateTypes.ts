import fs from 'fs'
import { join } from 'path'
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
import { ExtensionManifest, readDirectoryManifest } from 'vscode-manifest'
import fsExtra from 'fs-extra'
import { mapKeys } from 'lodash'
import { Config } from '../../config'
import { ensureArray } from '../../util'
import { configurationTypeFile } from '../configurationFromType'

export const generateContributesTypes = async (
    contributePoints: Pick<NonNullable<ExtensionManifest['contributes']>, 'commands' | 'configuration'> | undefined,
    config: Config,
    writeFilePath: string | false = 'src/generated.ts',
) => {
    if (!contributePoints)
        contributePoints = (await readDirectoryManifest({ prependIds: config.prependIds })).contributes
    const { commands, configuration } = contributePoints
    const withoutExtensionId = (id: string) => (config.prependIds === false ? id : id.slice(id.indexOf('.') + 1))
    const writer = new CodeBlockWriter()

    const hasConfigurationTypeFile = fs.existsSync(configurationTypeFile)
    if (hasConfigurationTypeFile) writer.writeLine("import { Configuration } from './configurationType'")

    writer.write("declare module 'vscode-framework'").block(() => {
        writer.write('interface RegularCommands').block(() => {
            if (!commands) return
            for (const { command } of commands) writer.quote(withoutExtensionId(command)).write(': true').newLine()
        })

        if (hasConfigurationTypeFile || configuration)
            writer.writeLine(
                `interface Settings extends Required<${
                    hasConfigurationTypeFile ? 'Configuration' : 'ConfigurationObject'
                }> {}`,
            )
    })
    writer.blankLine()
    if (!hasConfigurationTypeFile && configuration)
        writer.writeLine(await generateConfigurationFromSchema({ configuration }, withoutExtensionId))

    writer.writeLine('export {}')
    const contents = writer.toString()
    if (writeFilePath) {
        await fsExtra.ensureDir(join(writeFilePath, '..'))
        await fs.promises.writeFile(writeFilePath, contents, 'utf-8')
    }

    return contents
}

const generateConfigurationFromSchema = async (
    { configuration }: Pick<NonNullable<ExtensionManifest['contributes']>, 'configuration'>,
    withoutExtensionId: (id: string) => string,
) => {
    // TODO run contributes.configuration generators
    const allConfigProperties = {
        // merge all properties into one object
        properties: Object.fromEntries(
            ensureArray(configuration!).flatMap(({ properties }) =>
                Object.entries(mapKeys(properties, (_val, name) => withoutExtensionId(name))),
            ),
        ),
    }

    // worst lib ever
    const jsonInput = new JSONSchemaInput(new FetchingJSONSchemaStore())
    await jsonInput.addSource({
        name: 'Configuration',
        schema: JSON.stringify(allConfigProperties),
    })
    const inputData = new InputData()
    inputData.addInput(jsonInput)
    const { lines } = await quicktype({
        inputData,
        lang: new CustomTypeScriptTargetLanguage(),
        rendererOptions: {
            'runtime-typecheck': 'false',
            'just-types': 'true',
            justTypes: 'true',
        },
    })
    return (
        lines
            // we don't need trailing whitespaces
            .map(line => line.trimEnd())
            .join('\n')
            // remove leading export for root type
            .replace('export ', '')
    )
}

class CustomTypeScriptTargetLanguage extends TypeScriptTargetLanguage {
    protected override makeRenderer(
        renderContext: RenderContext,
        untypedOptionValues: { [name: string]: any },
    ): CustomTypeScriptRenderer {
        return new CustomTypeScriptRenderer(this, renderContext, getOptionValues(tsFlowOptions, untypedOptionValues))
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
