import { ManifestType } from '@vscode-framework/extension-manifest/'
import jsonfile from 'jsonfile'

export const mockManifestOnce = (manifest: ManifestType) => {
    const spy = jest.spyOn(jsonfile, 'readFile')
    // TODO mock implementation with testing on path
    spy.mockResolvedValueOnce(manifest)
}

export const screenRecorderManifest: ManifestType = {
    name: 'screen-recorder',
    displayName: 'Screen Recorder',
    publisher: 'yatki',
    version: 'invalid-doesn-matter',
    categories: ['Other'],
    devDependencies: {
        '@hediet/node-reload': '*',
    },
    contributes: {
        commands: [
            {
                // In this case both command and title would be prefixed
                command: 'startRecording',
                title: 'Start Screen Recording',
            },
        ],
        configuration: {
            // title: 'Screen Recorder',
            properties: {
                'record-sound': {
                    type: 'boolean',
                    // TODO make description optional when it means the same as setting id
                    description: 'Record sound',
                },
                // TODO make no-sync and optional
                'save-dir': {
                    type: 'string',
                    description: '',
                },
                'record-quality': {
                    description: 'Record quality',
                    type: 'string',
                    enum: ['4K', 'FullHD', 'HD'],
                },
            },
        },
    },
}
