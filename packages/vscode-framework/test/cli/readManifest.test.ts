/// <reference types="jest" />

import { readDirectoryManifest } from 'vscode-manifest'
import { generateManifest } from '../../src/cli'
import { mockManifestOnce, screenRecorderManifest } from './common'

test('Places IDs in contributes props', async () => {
    mockManifestOnce(screenRecorderManifest)
    const generatedManifest = await readDirectoryManifest()
    expect(generatedManifest.contributes).toMatchInlineSnapshot(`
Object {
  "commands": Array [
    Object {
      "command": "screen-recorder.startRecording",
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
}
`)
})

test('Generates schema properly', async () => {
    const generatedManifest = await generateManifest({ sourceManifest: screenRecorderManifest })
    expect(generatedManifest).toMatchInlineSnapshot(`
Object {
  "activationEvents": Array [
    "onCommand:startRecording",
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
  },
  "displayName": "Screen Recorder",
  "engines": Object {
    "vscode": "^1.60.0",
  },
  "main": "extension.js",
  "name": "screen-recorder",
  "publisher": "yatki",
  "qna": false,
  "repository": "https://github.com/zardoy/vscode-framework",
  "version": "invalid-doesnt-matter",
}
`)
})
