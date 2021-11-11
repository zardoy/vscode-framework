// TODO can properties contain " ?

import fs from 'fs'
import { writeFile } from 'jsonfile'
import { defaultsDeep, omit } from 'lodash'
import { ManifestType, readManifest } from 'vscode-manifest'
import { defaultConfig, Config } from '../../config'
import { getManifestPathFromRoot } from '../../util'
import { manifestGenerators, ManifestGeneratorsMeta, runGeneratorsOnManifest } from './manifestGenerators'

// TODO get off of config

interface Options {
    /**
     * (soon) - vsce - update package.json that inside VSIX package (I'll recommend this approach in the future)
     * for now custom path to package.json
     */
    outputPath: string
    config: Config
    /** @default true */
    overwrite?: boolean
    propsGeneratorsMeta: ManifestGeneratorsMeta
}

/** Reads and validates manifest on <cwd>/package.json and writes manifest with generated props */
export const generateAndWriteManifest = async ({
    outputPath,
    overwrite = true,
    config,
    propsGeneratorsMeta,
}: Options) => {
    if (fs.existsSync(outputPath))
        if (overwrite)
            // TODO jsonfile already overwrites
            await fs.promises.unlink(outputPath)
        else return

    const sourceManifest = await readManifest({
        manifestPath: getManifestPathFromRoot(),
        prependIds: config.prependIds,
    })
    let generatedManifest =
        config.disablePropsGenerators === true
            ? sourceManifest
            : await generateManifest({
                  skipPropGenerators: config.disablePropsGenerators,
                  sourceManifest,
                  propsGeneratorsMeta,
              })
    for (const generator of config.extendPropsGenerators)
        generatedManifest = defaultsDeep(
            await generator({
                generatedManifest,
                meta: propsGeneratorsMeta,
                resolvedConfig: config,
                sourceManifest,
            }),
            generatedManifest,
        )

    await writeFile(outputPath, generatedManifest, { spaces: 4 })
    return { generatedManifest, sourceManifest }
}

// TODO rethink and rename export

/**
 * @return like {@linkcode propsToGenerate}, but can also clean manifest
 */
export const generateManifest = async ({
    skipPropGenerators = defaultConfig.disablePropsGenerators,
    sourceManifest,
    cleanupManifest = true,
    propsGeneratorsMeta: config,
}: {
    skipPropGenerators?: Config['disablePropsGenerators']
    /** Manifest that will be used to generate props */
    sourceManifest: ManifestType
    /** Preserves only required props in generated package.json and removes other. Disable to preserve all source props + generated. */
    cleanupManifest?: boolean
    propsGeneratorsMeta: ManifestGeneratorsMeta
}): Promise<ManifestType> => {
    // TODO warn about overwritted props and to run vscode-framework migrate
    sourceManifest = cleanupManifest
        ? // TODO-low use actual pick with ttypescript.
          (omit(sourceManifest, [
              'dependencies',
              'devDependencies',
              'peerDependencies',
              'bin',
              'scripts',
              'main',
              'browser',
              // eslint-disable-next-line zardoy-config/@typescript-eslint/array-type
          ] as (keyof typeof sourceManifest)[]) as any)
        : sourceManifest
    return runGeneratorsOnManifest(
        sourceManifest,
        typeof skipPropGenerators === 'boolean'
            ? (!skipPropGenerators as true)
            : (removeItems(Object.keys(manifestGenerators), skipPropGenerators) as any[]),
        true,
        config,
    )
}

const removeItems = (arr: string[], toRemove: string[]) => arr.filter(item => !toRemove.includes(item))
