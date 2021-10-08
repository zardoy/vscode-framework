import { ManifestType } from 'vscode-manifest'
import jsonfile from 'jsonfile'

// TODO mock config in all tests to ensure stability

export const mockManifestOnce = (manifest: ManifestType) => {
    const spy = jest.spyOn(jsonfile, 'readFile')
    // TODO mock implementation with testing on path
    spy.mockResolvedValueOnce(JSON.parse(JSON.stringify(manifest)))
}

const deepFreeze = <T extends Record<string, any>>(obj: T) => {
    for (const [, value] of Object.entries(obj)) if (typeof value === 'object') deepFreeze(value)

    Object.freeze(obj)
    return obj
}

export const screenRecorderManifest: ManifestType = deepFreeze({
    name: 'screen-recorder',
    displayName: 'Screen Recorder',
    publisher: 'yatki',
    version: 'invalid-doesnt-matter',
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
})
