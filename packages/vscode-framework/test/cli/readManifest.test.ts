/// <reference types="jest" />

import { readDirectoryManifest } from 'vscode-manifest'
import { generateManifest } from '../../src/cli'
import { defaultConfig } from '../../src/config'
import { mockManifestOnce, screenRecorderManifest } from './fixtures'
import { mapValues } from 'lodash'

test('Places IDs in contributes props', async () => {
    mockManifestOnce(screenRecorderManifest)
    const generatedManifest = await readDirectoryManifest()
    // COMMANDS IDS
    expect(generatedManifest.contributes.commands!.map(({ command }) => command)).toMatchInlineSnapshot(`
        Array [
          "screenRecorder.startRecording",
          "screenRecorder.editRecording",
        ]
    `)
    // CONFIGURATION IDS
    expect(
        Object.entries(
            (
                generatedManifest.contributes.configuration! as Exclude<
                    NonNullable<typeof generatedManifest.contributes.configuration>,
                    any[]
                >
            ).properties,
        ).map(([id]) => id),
    ).toMatchInlineSnapshot(`
        Array [
          "screenRecorder.recordSound",
          "screenRecorder.saveDir",
          "screenRecorder.recordQuality",
        ]
    `)
    // MENUS IDS
    expect(mapValues(generatedManifest.contributes.menus!, arr => arr.map(({ command }) => command)))
        .toMatchInlineSnapshot(`
        Object {
          "commandPalette": Array [
            "screenRecorder.startRecording",
            "screenRecorder.editRecording",
          ],
          "editor/title": Array [
            "screenRecorder.editRecording",
          ],
        }
    `)
    mockManifestOnce({
        ...screenRecorderManifest,
        contributes: {
            configuration: [
                {
                    title: 'Settings Section 1',
                    properties: {
                        'enable-me': {
                            type: 'boolean',
                            description: 'whether is am i enabled',
                            default: false,
                        },
                    },
                },
                {
                    title: 'Settings Section 2',
                    properties: {
                        'show-tips': {
                            type: 'boolean',
                            description: 'show tips',
                            default: false,
                        },
                    },
                },
            ],
        },
    })
    const generatedManifest2 = await readDirectoryManifest()
    expect(generatedManifest2.contributes.configuration).toMatchInlineSnapshot(`
        Array [
          Object {
            "properties": Object {
              "screenRecorder.enable-me": Object {
                "default": false,
                "description": "whether is am i enabled",
                "type": "boolean",
              },
            },
            "title": "Settings Section 1",
          },
          Object {
            "properties": Object {
              "screenRecorder.show-tips": Object {
                "default": false,
                "description": "show tips",
                "type": "boolean",
              },
            },
            "title": "Settings Section 2",
          },
        ]
    `)
})

test('Generates schema properly in production', async () => {
    const generatedManifest = await generateManifest({
        sourceManifest: screenRecorderManifest,
        propsGeneratorsMeta: { target: defaultConfig.target, mode: 'production', config: defaultConfig },
    })
    expect(generatedManifest).toMatchInlineSnapshot(`
        Object {
          "activationEvents": Array [
            "onCommand:startRecording",
            "onCommand:editRecording",
          ],
          "categories": Array [
            "Other",
          ],
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
            "configuration": Object {
              "properties": Object {
                "recordQuality": Object {
                  "default": "4K",
                  "description": "Record quality",
                  "enum": Array [
                    "4K",
                    "FullHD",
                    "HD",
                  ],
                  "type": "string",
                },
                "recordSound": Object {
                  "default": false,
                  "description": "Record sound",
                  "type": "boolean",
                },
                "saveDir": Object {
                  "default": null,
                  "description": "",
                  "type": "string",
                },
              },
            },
            "menus": Object {
              "commandPalette": Array [
                Object {
                  "command": "startRecording",
                  "when": "!virtualWorkspace",
                },
                Object {
                  "command": "editRecording",
                  "when": "resourceExtname == .mpeg",
                },
              ],
              "editor/title": Array [
                Object {
                  "command": "editRecording",
                  "group": "navigation",
                  "when": "resourceExtname == .mpeg",
                },
              ],
            },
          },
          "displayName": "Screen Recorder",
          "engines": Object {
            "vscode": "^1.61.0",
          },
          "main": "extension-node.js",
          "name": "screen-recorder",
          "publisher": "yatki",
          "qna": false,
          "repository": "https://github.com/zardoy/vscode-framework",
          "version": "invalid-doesnt-matter",
        }
    `)
})
