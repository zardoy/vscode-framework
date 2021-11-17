/// <reference types="jest" />

import fs from 'fs'
import path from 'path'
import { readDirectoryManifest } from 'vscode-manifest'
import { configurationTypeFile } from '../../src/cli/configurationFromType'
import { defaultConfig } from '../../src/config'
import { generateContributesTypes } from '../../src/cli/commands/generateTypes'
import { mockManifestOnce, screenRecorderManifest } from './fixtures'

describe('New simple types generator', () => {
    test('Just generates types', async () => {
        mockManifestOnce(screenRecorderManifest)
        const generatedManifest = await readDirectoryManifest()
        const spy = jest.spyOn(fs.promises, 'writeFile')
        spy.mockImplementationOnce(async (_path, content) => {
            expect(content).toMatchInlineSnapshot(`
                "declare module 'vscode-framework' {
                    interface RegularCommands {
                        \\"startRecording\\": true
                        \\"editRecording\\": true
                    }
                    interface Settings extends Required<ConfigurationObject> {}
                }

                interface ConfigurationObject {
                    /**
                     * Record quality
                     */
                    \\"screenRecorder.recordQuality\\"?: ScreenRecorderRecordQuality;
                    /**
                     * Record sound
                     */
                    \\"screenRecorder.recordSound\\"?: boolean;
                    \\"screenRecorder.saveDir\\"?:     string;
                }

                type ScreenRecorderRecordQuality =
                    \\"FullHD\\" |
                    \\"HD\\" |
                    \\"4K\\"

                export {}
                "
            `)
        })
        // all source, configuration not generated
        await generateContributesTypes({ ...generatedManifest.contributes }, defaultConfig)
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
                "import { Configuration } from './configurationType'
                declare module 'vscode-framework' {
                    interface RegularCommands {
                        \\"startRecording\\": true
                        \\"editRecording\\": true
                    }
                    interface Settings extends Required<Configuration> {}
                }

                export {}
                "
            `)
        })
        await generateContributesTypes({ ...generatedManifest.contributes }, defaultConfig)
    })
})
