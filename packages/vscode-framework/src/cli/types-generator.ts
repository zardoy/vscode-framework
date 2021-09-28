import { readDirectoryManifest } from 'vscode-manifest'
import { oneOf } from '../util'
import { GracefulError } from './errors'
import { createJsdoc } from 'generated-module/build/ts-morph-utils'
import { StatementStructures, StructureKind } from 'ts-morph'
import { generateTypes as generateTypesModule, StringWriters } from 'generated-module'
import Debug from '@prisma/debug'
import { join } from 'path'

const debug = Debug('vscode-framework:types-generator')

// TODO make TS peer dep and use printer

const sliceExtensionId = (name: string) => name.split('.').slice(1).join('.')

/**
 * Should be used directly in cli
 * @param cwd Directory with package.json (manifest) and node_modules
 */
export const generateTypes = async (cwd: string) => {
    const manifest = await readDirectoryManifest()
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
                          commands.length
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
            ? Object.entries(configuration.properties).map(([name, setting]) => {
                  return {
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
                  }
              })
            : [],
    })
    if (debug.enabled) {
        debug(
            `Generating types from manifest ${join(process.cwd(), 'package.json')} into ${join(
                cwd,
                'node_modules/index.d.ts',
            )}`,
        )
    }
    await generateTypesModule({
        moduleName: '.vscode-framework',
        targetDirectory: cwd,
        generator: {
            tsMorph: generatedStatements,
        },
    })
}
