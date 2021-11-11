// The last step: generate validator for package.json (Extension Manifest)

// import { InputData, JSONSchemaInput, quicktype, FetchingJSONSchemaStore } from 'quicktype-core'
import { resolve } from 'path'
import fs from 'fs'
import fsExtra from 'fs-extra'
import Ajv from 'ajv'
import { build } from 'esbuild'

// ts-json-schema-generator doesn't set on-top required property (see issues)
import * as TJS from 'typescript-json-schema'
import standaloneCode from 'ajv/dist/standalone'

import type { ExtensionManifestRequired } from '../src/frameworkTypes'

type EnsureTypeNameIs = ExtensionManifestRequired
const exportTypeName = 'ExtensionManifestRequired'

const main = async () => {
    // #region TYPESCRIPT-JSON-SCHEMA
    const settings: TJS.PartialArgs = {
        ref: false,
        required: true,
        strictNullChecks: true,
        topRef: true,
    }

    const program = TJS.getProgramFromFiles([resolve(__dirname, '../src/frameworkTypes.ts')], {})
    const generatedSchema = TJS.generateSchema(program, exportTypeName, settings)
    // #endregion

    // #region TS-JSON-SCHEMA-GENERATOR (unused)

    // const generatedSchema = TJS.createGenerator({
    //     path: resolve(__dirname, '../src/frameworkTypes.ts'),
    //     type: exportTypeName,
    //     additionalProperties: true,
    //     tsconfig: resolve(__dirname, 'tsconfig.for-script.json'),
    // }).createSchema(exportTypeName)

    // #endregion

    const fromGenerated = (path: string) => resolve(__dirname, '../src/generated', path)
    const generatedDir = fromGenerated('')
    await fsExtra.ensureDir(generatedDir)
    // for inspectations / debugging
    // writeFileSync(resolve(__dirname, generatedDir, 'schemaForValidation.json'), generatedSchema, { spaces: 4 })

    // #region Generate validator using ajv and minify using esbuild (best)
    const ajv = new Ajv({
        code: { source: true },
        allErrors: true,
        strictSchema: false,
        strictTypes: true,
        strictTuples: true,
        strictRequired: true,

        allowUnionTypes: true,
    })

    const validate = ajv.compile(generatedSchema!)
    const moduleCode = standaloneCode(ajv, validate)

    const esbuildEntryPoint = resolve(__dirname, 'esbuild-ajv-input.js')
    await fs.promises.writeFile(esbuildEntryPoint, moduleCode, 'utf-8')
    const { metafile } = await build({
        bundle: true,
        entryPoints: [esbuildEntryPoint],
        metafile: true,
        minify: true,
        platform: 'node',
        outfile: fromGenerated('validate.js'),
    })
    await fs.promises.unlink(esbuildEntryPoint)
    const outputSize = Object.entries(metafile!.outputs)[0]![1]!.bytes

    // for now it's around 51
    if (outputSize > 55_000) throw new Error(`esbuild output size exceeded`)
    // #endregion

    // #region Generate validator using quicktype (works badly)

    // const jsonInput = new JSONSchemaInput(new FetchingJSONSchemaStore())
    // await jsonInput.addSource({
    //     name: 'Ignored_ExtensionManifest',
    //     schema: JSON.stringify(generatedSchema),
    // })

    // const inputData = new InputData()
    // inputData.addInput(jsonInput)

    // const { lines } = await quicktype({
    //     inputData,
    //     lang: 'typescript',
    // })

    // await fsExtra.writeFile(resolve(generatedDir, 'extensionManifestValidator.ts'), lines.join('\n'))

    // #endregion
}

main().catch(error => {
    console.error(error)
    // eslint-disable-next-line zardoy-config/unicorn/no-process-exit
    process.exit(1)
})
