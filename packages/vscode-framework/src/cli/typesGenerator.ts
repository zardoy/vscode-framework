import fs from 'fs'
import { join } from 'path'
import Debug from '@prisma/debug'
import { generateTypes as generateTypesModule, StringWriters } from 'generated-module'
import { createJsdoc } from 'generated-module/build/ts-morph-utils'
import { StatementStructures, StructureKind } from 'ts-morph'
import { ExtensionManifest, readDirectoryManifest } from 'vscode-manifest'
import { ensureArray, oneOf } from '../util'
import { GracefulError } from './errors'

const debug = Debug('vscode-framework:types-generator')

// TODO make TS peer dep and use printer

const sliceExtensionId = (name: string) => name.split('.').slice(1).join('.')

/**
 * Should be used directly in cli
 * @deprecated slow and therefore needs refactor
 * @param cwd Directory with package.json (manifest) and node_modules
 */
export const generateTypes = async ({ nodeModulesDir = process.cwd() }: { nodeModulesDir?: string } = {}) => {
    // TODO!
    // TODOgenerateskeleteonanyway
    const manifest = await readDirectoryManifest() // ensure prepandIds doesn't affect generated code
    if (!manifest.contributes) throw new GracefulError("Contributes property doesn't exist. Nothing to generate from")

    const { commands, configuration } = manifest.contributes

    const generatedStatements: StatementStructures[] = []
    generatedStatements.push({
        kind: StructureKind.Interface,
        name: 'Commands',
        properties: commands
            ? [
                  {
                      name: 'regular',
                      type: writer =>
                          commands.length > 0
                              ? StringWriters.union(commands.map(c => sliceExtensionId(c.command)))(writer)
                              : writer.quote('ERROR: There are no command contributions in manifest'),
                  },
              ]
            : [],
        isExported: true,
    })

    // TODO provide line column TODO: REMOVE REMOVE
    if (Array.isArray(configuration)) throw new TypeError("manifest: contributes.configuration can't be array")
    generatedStatements.push({
        kind: StructureKind.Interface,
        isExported: true,
        name: 'Settings',
        properties: configuration
            ? Object.entries(configuration.properties).map(([name, setting]) => ({
                  // TODO use quote
                  name: `"${sliceExtensionId(name)}"`,
                  docs: createJsdoc({
                      description: setting.description,
                      default: setting.default,
                  }),
                  type: writer => {
                      if (setting.enum) {
                          StringWriters.union(setting.enum)(writer)
                          return
                      }

                      if (oneOf(setting.type, ['boolean', 'number', 'string'])) {
                          writer.write(setting.type as string)
                          return
                      }

                      writer.write('unknown')
                  },
              }))
            : [],
    })
    debug(
        `Generating types from manifest ${join(process.cwd(), 'package.json')} into ${join(
            nodeModulesDir,
            'node_modules/index.d.ts',
        )}`,
    )
    await generateTypesModule({
        moduleName: '.vscode-framework',
        targetDirectory: nodeModulesDir,
        generator: {
            tsMorph: generatedStatements,
        },
    })
}

/**
 * Places/rewrites generated file at ./src/generated.ts
 * Signficantly faster then that is above
 * @param resolvedManifest final manifest after all propsGenerators are run
 */
export const newTypesGenerator = async (resolvedManifest: ExtensionManifest) => {
    const withoutId = (arg: string) => arg.slice(arg.indexOf('.') + 1)
    const contents = `
declare module 'vscode-framework' {
    interface RegularCommands {
        ${
            resolvedManifest.contributes?.commands
                ?.map(({ command }) => `      "${withoutId(command)}": true`)
                .join('\n') ?? ''
        }
    }
    // // extremely simplified for a moment
    ${
        resolvedManifest.contributes?.configuration
            ? `interface Settings {
        ${ensureArray(resolvedManifest.contributes.configuration)
            .map(({ properties }) =>
                Object.entries(properties)
                    .map(
                        ([id, type]) =>
                            `       "${withoutId(id)}": ${
                                // eslint-disable-next-line zardoy-config/@typescript-eslint/restrict-template-expressions
                                type.type === 'string' && type.enum
                                    ? type.enum.map(s => `"${s}"`).join(' | ')
                                    : // @ts-expect-error
                                    ['string', 'number', 'boolean'].includes(type.type)
                                    ? type.type
                                    : 'any'
                            }`,
                    )
                    .join('\n'),
            )
            .join('')}
    }`
            : ''
    }
}

export {}`

    await fs.promises.writeFile('./src/generated.ts', contents, 'utf-8')
}
