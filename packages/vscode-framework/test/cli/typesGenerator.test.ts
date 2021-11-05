/// <reference types="jest" />

import fs from 'fs'
import path from 'path'
import { readDirectoryManifest } from 'vscode-manifest'
import { configurationTypeFile } from '../../src/cli/buildConfiguration'
import { generateTypes, newTypesGenerator } from '../../src/cli/typesGenerator'
import { mockManifestOnce, screenRecorderManifest } from './fixtures'

// isn't used at the moment. Skiped because extremely slow
test.skip('Types generators: simple typse', async () => {
    mockManifestOnce(screenRecorderManifest)
    const spy = jest.spyOn(fs, 'writeFile')
    spy.mockImplementationOnce((savePath, content, callback) => {
        expect(savePath).toBe(path.posix.resolve(__dirname, '../../../../node_modules/.vscode-framework/index.d.ts'))
        // TODO make readable
        // TODO! missing @default
        expect(content).toMatchInlineSnapshot(`
            "export interface Commands {
                regular: \\"startRecording\\" | \\"editRecording\\";
            }

            export interface Settings {
                /** Record sound */
                \\"recordSound\\": boolean;
                \\"saveDir\\": string;
                /** Record quality */
                \\"recordQuality\\": \\"4K\\" | \\"FullHD\\" | \\"HD\\";
            }
            "
        `)
        callback(null)
    })
    await generateTypes()
})

describe('New simple types generator', () => {
    test('Just generates types', async () => {
        mockManifestOnce(screenRecorderManifest)
        const generatedManifest = await readDirectoryManifest()
        const spy = jest.spyOn(fs.promises, 'writeFile')
        spy.mockImplementationOnce(async (_path, content) => {
            expect(content).toMatchInlineSnapshot(`
                "
                declare module 'vscode-framework' {
                    interface RegularCommands {
                      \\"startRecording\\": true
                      \\"editRecording\\": true
                    }
                    // // extremely simplified for a moment
                    interface Settings {       \\"recordSound\\": boolean
                       \\"saveDir\\": string
                       \\"recordQuality\\": \\"4K\\" | \\"FullHD\\" | \\"HD\\"}
                }

                export {}"
            `)
        })
        await newTypesGenerator(generatedManifest)
    })
    test('Links to configurationType.ts', async () => {
        mockManifestOnce(screenRecorderManifest)
        const generatedManifest = await readDirectoryManifest()
        const spyExists = jest.spyOn(fs, 'existsSync')
        spyExists.mockImplementation(path => {
            if (path === configurationTypeFile) {
                spyExists.mockRestore()
                return true
            }

            return fs.existsSync(path)
        })
        const spy = jest.spyOn(fs.promises, 'writeFile')
        spy.mockImplementationOnce(async (_path, content) => {
            expect(content).toMatchInlineSnapshot(`
                "
                import { Configuration } from './configurationType'
                declare module 'vscode-framework' {
                    interface RegularCommands {
                      \\"startRecording\\": true
                      \\"editRecording\\": true
                    }
                    // // extremely simplified for a moment
                    interface Settings extends Required<Configuration> {}
                }

                export {}"
            `)
        })
        await newTypesGenerator(generatedManifest)
    })
})
