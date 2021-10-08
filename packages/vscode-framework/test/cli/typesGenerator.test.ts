/// <reference types="jest" />

import fs from 'fs'
import path from 'path'
import { generateTypes } from '../../src/cli/types-generator'
import { mockManifestOnce, screenRecorderManifest } from './common'

test('Generates types propertly', async () => {
    mockManifestOnce(screenRecorderManifest)
    const spy = jest.spyOn(fs, 'writeFile')
    spy.mockImplementationOnce((savePath, content, callback) => {
        expect(savePath).toBe(path.posix.resolve(__dirname, '../../../../node_modules/.vscode-framework/index.d.ts'))
        // TODO make readable
        expect(content).toMatchInlineSnapshot(`
"export interface Commands {
    regular: \\"startRecording\\";
}

export interface Settings {
    /** Record sound */
    \\"record-sound\\": boolean;
    \\"save-dir\\": string;
    /** Record quality */
    \\"record-quality\\": \\"4K\\" | \\"FullHD\\" | \\"HD\\";
}
"
`)
        callback(null)
    })
    await generateTypes()
})
