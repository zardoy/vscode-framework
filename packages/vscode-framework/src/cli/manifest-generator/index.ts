// TODO can properties contain " ?

import { ManifestType, readManifest } from 'vscode-manifest'
import fs from 'fs'
import { writeFile } from 'jsonfile'
import { defaultsDeep, omit } from 'lodash'
import { getManifestPathFromRoot, pickObject } from '../../util'
import { propsGenerators } from './propsGenerators'

interface Options {
    /**
     * (soon) - vsce - update package.json that inside VSIX package (I'll recommend this approach in the future)
     * for now custom path to package.json
     */
    outputPath: string
    /** @default true */
    overwrite?: boolean
    propsToGenerate?: true | Array<keyof typeof propsGenerators>
}

/** Reads and validates manifest on <cwd>/package.json and writes manifest with generated props */
export const generateAndWriteManifest = async ({ outputPath, overwrite = true, propsToGenerate = true }: Options) => {
    if (fs.existsSync(outputPath))
        if (overwrite) await fs.promises.unlink(outputPath)
        else return

    const generatedManifest = await generateManifest({
        propsToGenerate,
        sourceManifest: await readManifest({ manifestPath: getManifestPathFromRoot() }),
    })
    await writeFile(outputPath, generatedManifest, { spaces: 4 })
    return generatedManifest
}

/**
 * Mutates sourceManifest !
 * @returns mutated sourceManifest with generatedProps
 */
export const generateManifest = async ({
    propsToGenerate = true,
    sourceManifest,
    cleanupManifest = true,
}: {
    propsToGenerate?: Options['propsToGenerate']
    /** Manifest that will be used to generate props */
    sourceManifest: ManifestType
    /** Preserves only required props in generated package.json and removes other. Disable to preserve all source props + generated. */
    cleanupManifest?: boolean
}): Promise<ManifestType> => {
    // TODO clone manifest, don't mutate
    // TODO warn about overwritted props and to run vscode-framework migrate
    if (propsToGenerate === true) propsToGenerate = Object.keys(propsGenerators)

    let generatedManifest = cleanupManifest
        ? // TODO use actual pick with ttypescript.
          omit(sourceManifest, [
              'dependencies',
              'devDependencies',
              'peerDependencies',
              'bin',
              'scripts',
          ] as (keyof typeof sourceManifest)[])
        : sourceManifest
    // eslint-disable-next-line no-await-in-loop
    for (const prop of propsToGenerate)
        generatedManifest = defaultsDeep(await propsGenerators[prop](sourceManifest), generatedManifest)

    // TODO check type
    return generatedManifest as any
}
