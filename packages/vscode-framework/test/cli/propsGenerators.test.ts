/// <reference types="jest" />

import fs from 'fs'
import { join } from 'path'
import { PackageJson } from 'type-fest'
import { validRange } from 'semver'
import { ManifestType } from 'vscode-manifest'
import { propsGenerators } from '../../src/cli/manifest-generator/propsGenerators'
import { defaultConfig } from '../../src/config'
import { screenRecorderManifest, screenRecorderManifestBase } from './fixtures'

type HaveOwnTests = 'repository'

type Tests = {
    [K in Exclude<keyof typeof propsGenerators, HaveOwnTests>]: (packageJson: PackageJson) => void
}

const productionMeta = {
    target: { desktop: true, web: true },
    mode: 'production',
    config: defaultConfig.development,
} as const

// TODO-low transfer test from here
test('Repository field', async () => {
    const testGitConfig = `
[remote "origin"]
url=https://github.com/test-author/vscode-extension-name.git
    `
    const spyReadFile = jest.spyOn(fs, 'readFile')
    spyReadFile.mockImplementation((path, callback) => {
        expect(path).toBe(join(process.cwd(), '.git/config'))
        callback(null, testGitConfig as any)
    })
    expect(await propsGenerators.repository()).toMatchInlineSnapshot(`
        Object {
          "repository": "https://github.com/test-author/vscode-extension-name",
        }
    `)
})

const screenRecorderManifestWithCommands: ManifestType = {
    ...screenRecorderManifestBase,
    contributes: {
        commands: screenRecorderManifest.contributes.commands,
    },
}

describe('Generated activation events', () => {
    test('Nothing to change', async () => {
        const result = propsGenerators.activationEvents(
            {
                ...screenRecorderManifestWithCommands,
                activationEvents: ['workspaceContains:package.json', 'onCommand:foo', 'onFileSystem:fs'],
            },
            productionMeta,
        )
        expect(result.activationEvents).toBe(['workspaceContains:package.json', 'onCommand:foo', 'onFileSystem:fs'])
    })
    test("Doesn't touch original", async () => {
        const result = propsGenerators.activationEvents(
            {
                ...screenRecorderManifestWithCommands,
                activationEvents: ['workspaceContains:package.json', 'onCommands', 'onFileSystem:fs'],
            },
            productionMeta,
        )
        expect(result.activationEvents).toMatchInlineSnapshot(`
            Array [
              "workspaceContains:package.json",
              "onCommand:startRecording",
              "onCommand:editRecording",
              "onFileSystem:fs",
            ]
        `)
    })
})

const tests: Tests = {
    'contributes.commands': expected =>
        expect(expected).toMatchInlineSnapshot(`
Object {
  "contributes": Object {
    "commands": Array [
      Object {
        "category": "Screen Recorder",
        "command": "startRecording",
        "title": "Start Screen Recording",
      },
      Object {
        "category": "Screen Recorder",
        "command": "editRecording",
        "icon": "$(edit)",
        "shortTitle": "Edit",
        "title": "Edit Screen Recording",
      },
    ],
  },
}
`),
    activationEvents: expected =>
        expect(expected).toMatchInlineSnapshot(`
Object {
  "activationEvents": Array [
    "onCommand:startRecording",
    "onCommand:editRecording",
  ],
}
`),
    engines: expected => expect(validRange(expected.engines!.vscode)).not.toBeNull(),
    extensionEntryPoint: expected =>
        expect(expected).toMatchInlineSnapshot(`
Object {
  "browser": "extension-web.js",
  "main": "extension-node.js",
}
`),
    qnaFalse: expected =>
        expect(expected).toMatchInlineSnapshot(`
Object {
  "qna": false,
}
`),
}

test.each<{ name: keyof Tests; expect: (data) => void }>(
    Object.entries(tests).map(([name, expect]) => ({ name, expect })),
)('Auto-generated field $name', async ({ name, expect }) => {
    expect(await propsGenerators[name](screenRecorderManifest, productionMeta))
})
