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
              "command": "screen-recorder.start-recording",
              "title": "Start Screen Recording",
            },
          ],
          "configuration": Object {
            "properties": Object {
              "screen-recorder.record-quality": Object {
                "description": "Record quality",
                "enum": Array [
                  "4K",
                  "FullHD",
                  "HD",
                ],
                "type": "string",
              },
              "screen-recorder.record-sound": Object {
                "description": "Record sound",
                "type": "boolean",
              },
              "screen-recorder.save-dir": Object {
                "description": "",
                "type": "string",
              },
            },
          },
          "menus": Object {
            "commandPalette": Array [
              Object {
                "command": "screen-recorder.start-recording",
                "when": "!virtualWorkspace",
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
              "screen-recorder.enable-me": Object {
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
              "screen-recorder.show-tips": Object {
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

test('Generates schema properly', async () => {
    const generatedManifest = await generateManifest({
        sourceManifest: screenRecorderManifest,
        propsGeneratorsConfig: { alwaysActivationEvent: false, ...defaultConfig },
    })
    expect(generatedManifest).toMatchInlineSnapshot(`
        Object {
          "activationEvents": Array [
            "onCommand:start-recording",
          ],
          "categories": Array [
            "Other",
          ],
          "contributes": Object {
            "commands": Array [
              Object {
                "category": "Screen Recorder",
                "command": "start-recording",
                "title": "Start Screen Recording",
              },
            ],
            "configuration": Object {
              "properties": Object {
                "record-quality": Object {
                  "description": "Record quality",
                  "enum": Array [
                    "4K",
                    "FullHD",
                    "HD",
                  ],
                  "type": "string",
                },
                "record-sound": Object {
                  "description": "Record sound",
                  "type": "boolean",
                },
                "save-dir": Object {
                  "description": "",
                  "type": "string",
                },
              },
            },
            "menus": Object {
              "commandPalette": Array [
                Object {
                  "command": "start-recording",
                  "when": "!virtualWorkspace",
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
