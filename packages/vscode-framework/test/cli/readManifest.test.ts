/// <reference types="jest" />

import { readDirectoryManifest } from 'vscode-manifest'
import { generateManifest } from '../../src/cli'
import { defaultConfig } from '../../src/config'
import { mockManifestOnce, screenRecorderManifest } from './common'

test('Places IDs in contributes props', async () => {
    mockManifestOnce(screenRecorderManifest)
    const generatedManifest = await readDirectoryManifest()
    expect(generatedManifest.contributes).toMatchInlineSnapshot(`
        Object {
          "commands": Array [
            Object {
              "command": "screenRecorder.startRecording",
              "title": "Start Screen Recording",
            },
            Object {
              "command": "screenRecorder.editRecording",
              "icon": "$(edit)",
              "shortTitle": "Edit",
              "title": "Edit Screen Recording",
            },
          ],
          "configuration": Object {
            "properties": Object {
              "screenRecorder.recordQuality": Object {
                "description": "Record quality",
                "enum": Array [
                  "4K",
                  "FullHD",
                  "HD",
                ],
                "type": "string",
              },
              "screenRecorder.recordSound": Object {
                "default": false,
                "description": "Record sound",
                "type": "boolean",
              },
              "screenRecorder.saveDir": Object {
                "description": "",
                "type": "string",
              },
            },
          },
          "menus": Object {
            "commandPalette": Array [
              Object {
                "command": "screenRecorder.startRecording",
                "when": "!virtualWorkspace",
              },
              Object {
                "command": "screenRecorder.editRecording",
                "when": "resourceExtname == .mpeg",
              },
            ],
            "editor/title": Array [
              Object {
                "command": "screenRecorder.editRecording",
                "group": "navigation",
                "when": "resourceExtname == .mpeg",
              },
            ],
          },
        }
    `)
    mockManifestOnce({
        ...screenRecorderManifest,
        contributes: {
            // TODO enhance
            configuration: [
                {
                    title: 'Settings Section 1',
                    order: 1,
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
                    order: 2,
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
            "order": 1,
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
            "order": 2,
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
        propsGeneratorsMeta: { target: defaultConfig.target, mode: 'production', config: defaultConfig.development },
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
