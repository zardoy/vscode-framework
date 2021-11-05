import jsonfile from 'jsonfile'
import { SetOptional } from 'type-fest'
import { ManifestType } from 'vscode-manifest'

// Manifest fixtures
// TODO mock config in all tests to ensure stability

export const mockManifestOnce = (manifest: ManifestType) => {
    const spy = jest.spyOn(jsonfile, 'readFile')
    // TODO mock implementation with testing on path
    spy.mockResolvedValueOnce(JSON.parse(JSON.stringify(manifest)))
}

const deepFreeze = (obj: ManifestType) => {
    for (const [, value] of Object.entries(obj))
        if (typeof value === 'object' && value !== null) deepFreeze(value as any)

    Object.freeze(obj)
    return obj
}

const makeManifest = <T extends ManifestType>(t: T) => t

export const screenRecorderManifestBase = makeManifest({
    name: 'screen-recorder',
    displayName: 'Screen Recorder',
    publisher: 'yatki',
    version: 'invalid-doesnt-matter',
    categories: ['Other'],
    contributes: {},
})

export const makeManifestFromBase = (manifest: SetOptional<ManifestType, keyof typeof screenRecorderManifestBase>) =>
    deepFreeze({
        ...screenRecorderManifestBase,
        ...manifest,
    })

export const screenRecorderManifest: ManifestType = deepFreeze({
    ...screenRecorderManifestBase,
    contributes: {
        commands: [
            {
                // In this case both command and title would be prefixed
                command: 'startRecording',
                title: 'Start Screen Recording',
            },
            {
                command: 'editRecording',
                title: 'Edit Screen Recording',
                shortTitle: 'Edit',
                icon: '$(edit)',
            },
        ],
        configuration: {
            // title: 'Screen Recorder',
            properties: {
                recordSound: {
                    type: 'boolean',
                    // TODO make description optional when it means the same as setting id
                    default: false,
                    description: 'Record sound',
                },
                // TODO make no-sync and optional
                saveDir: {
                    type: 'string',
                    default: null,
                    description: '',
                },
                recordQuality: {
                    description: 'Record quality',
                    type: 'string',
                    enum: ['4K', 'FullHD', 'HD'],
                    default: '4K',
                },
            },
        },
        menus: {
            commandPalette: [
                {
                    command: 'startRecording',
                    when: '!virtualWorkspace',
                },
                {
                    command: 'editRecording',
                    when: 'resourceExtname == .mpeg',
                },
            ],
            'editor/title': [
                {
                    command: 'editRecording',
                    group: 'navigation',
                    when: 'resourceExtname == .mpeg',
                },
            ],
        },
    },
    activationEvents: ['onCommands'],
})
