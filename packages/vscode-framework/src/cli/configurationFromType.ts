import fs from 'fs'
import { parseJsoncString } from 'typed-jsonfile/build/parseJsonc'
import * as TJS from 'typescript-json-schema'
import { getFileHash } from '../util'

const configurationFileNames = {
    source: 'configurationType.ts',
    cached: 'configurationTypeCache.jsonc',
}

// previous was settingsType.ts thinking about renaming it back
export const configurationTypeFile = 'src/configurationType.ts'
export const cachedGeneratedConfigurationPath = 'src/configurationTypeCache.jsonc'

/** @returns JSON `properties` obj of `configuration` */
export const runConfigurationGenerator = async (cwd: string) => {
    let hash: string | undefined
    let cachedGeneratedConfiguration: string
    try {
        cachedGeneratedConfiguration = await fs.promises.readFile(cachedGeneratedConfigurationPath, 'utf-8')
        hash = /^\/\/ md5hash: (.+)\n/m.exec(cachedGeneratedConfiguration)?.[1]
    } catch {
        cachedGeneratedConfiguration = undefined!
        hash = undefined
    }

    const configurationTypeHash = await getFileHash(configurationTypeFile)
    if (hash === configurationTypeHash) return parseJsoncString(cachedGeneratedConfiguration)

    console.log('[vscode-framework] Running configuration type generator, this may take some time...')
    const propertiesConfig = generateConfigFromFile(configurationTypeFile)!
    const normalizeSchema = (obj: typeof propertiesConfig) => {
        for (const key of Object.keys(propertiesConfig)) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                normalizeSchema(propertiesConfig[key] as any)
                continue
            }

            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            if (key.startsWith('$')) delete obj[key]
        }
    }

    normalizeSchema(propertiesConfig)
    await fs.promises.writeFile(
        cachedGeneratedConfigurationPath,
        `// GENERATED. DON'T EDIT MANUALLY\n// md5hash: ${configurationTypeHash}\n${JSON.stringify(
            propertiesConfig,
            undefined,
            4,
        )}`,
    )
}

const generateConfigFromFile = (configurationTypeFilePath: string) => {
    const settings: TJS.PartialArgs = {
        ref: false,
        required: true,
        strictNullChecks: true,
        topRef: true,
        validationKeywords: ['enumDescription', 'suggestSortText', 'defaultSnippets'],
        ignoreErrors: true,
    }

    console.time('TJS generate configuration')
    const program = TJS.getProgramFromFiles([configurationTypeFilePath], {})
    const generatedSchema = TJS.generateSchema(program, 'Configuration', settings)
    console.timeEnd('TJS generate configuration')

    return generatedSchema
}
