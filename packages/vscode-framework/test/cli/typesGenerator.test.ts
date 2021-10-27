/// <reference types="jest" />

import fs from 'fs'
import path from 'path'
import { generateTypes } from '../../src/cli/typesGenerator'
import { mockManifestOnce, screenRecorderManifest } from './common'

test('Types generators: simple typse', async () => {
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
