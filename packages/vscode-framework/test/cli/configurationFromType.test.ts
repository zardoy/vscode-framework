/// <reference types="jest" />

import {
    cachedGeneratedConfigurationPath,
    runConfigurationGenerator,
    configurationTypeFile,
} from '../../src/cli/configurationFromType'
import fs from 'fs'
import * as util from '../../src/util'
import { join } from 'path'

describe.skip('Generates configuration from type', () => {
    test('Simple case: better snippets fixture', async () => {
        const spyLog = jest.spyOn(console, 'log')
        const fixtureContent = await fs.promises.readFile(
            join(__dirname, './configurationFromTypeFixtures/betterSnippets.ts'),
        )
        const spy = jest.spyOn(fs.promises, 'readFile')
        //@ts-ignore
        spy.mockImplementation(async path => {
            if (path === cachedGeneratedConfigurationPath) throw new Error('No file')
            if (path === configurationTypeFile) return fixtureContent
        })
        const spyWrite = jest.spyOn(fs.promises, 'writeFile')
        spyWrite.mockImplementation(async (path, data) => {
            expect(path).toBe(configurationTypeFile)
            expect(data).toMatchInlineSnapshot()
        })
        jest.spyOn(util, 'getFileHash').mockImplementationOnce(async () => {
            return '54'
        })
        runConfigurationGenerator('Ignored.')
        expect(spyLog.mock.calls.join('\n')).toMatchInlineSnapshot()
        spy.mockRestore()
        spyLog.mockRestore()
    })
})
