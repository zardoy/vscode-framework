// TODO can properties contain " ?

import fs from 'fs'
import { writeFile } from 'jsonfile'
import { omit } from 'lodash'
import { ManifestType, readManifest } from 'vscode-manifest'
import { getManifestPathFromRoot } from '../../util'
import { propsGenerators, PropsGeneratorsConfig, runGeneratorsOnManifest } from './propsGenerators'

interface Options {
    /**
     * (soon) - vsce - update package.json that inside VSIX package (I'll recommend this approach in the future)
     * for now custom path to package.json
     */
    outputPath: string
    /** @default true */
    overwrite?: boolean
    propsToGenerate?: true | Array<keyof typeof propsGenerators>
    propsGeneratorsConfig: PropsGeneratorsConfig
}

/** Reads and validates manifest on <cwd>/package.json and writes manifest with generated props */
export const generateAndWriteManifest = async ({
    outputPath,
    overwrite = true,
    propsToGenerate = true,
    propsGeneratorsConfig,
}: Options) => {
    if (fs.existsSync(outputPath))
        if (overwrite)
            // TODO jsonfile already overwrites
            await fs.promises.unlink(outputPath)
        else return

    const generatedManifest = await generateManifest({
        propsToGenerate,
        sourceManifest: await readManifest({ manifestPath: getManifestPathFromRoot() }),
        propsGeneratorsConfig,
    })
    await writeFile(outputPath, generatedManifest, { spaces: 4 })
    return generatedManifest
}

/**
 * @return like {@linkcode propsToGenerate}, but can also clean manifest
 */
export const generateManifest = async ({
    propsToGenerate = true,
    sourceManifest,
    cleanupManifest = true,
    propsGeneratorsConfig: config,
}: {
    propsToGenerate?: Options['propsToGenerate']
    /** Manifest that will be used to generate props */
    sourceManifest: ManifestType
    /** Preserves only required props in generated package.json and removes other. Disable to preserve all source props + generated. */
    cleanupManifest?: boolean
    propsGeneratorsConfig: PropsGeneratorsConfig
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
    return runGeneratorsOnManifest(sourceManifest, propsToGenerate as any, true, config)
}
