import { PartialDeep } from 'type-fest'

export interface Config {
    executable: 'code' | 'code-insiders'
    // TODO implies executable = insiders
    enableProposedApi: boolean
    disableExtensions: boolean
    openDevtools: boolean
    hotReload: {
        enabled: boolean
        /** Mocks `vscode` import with auto disposing */
        automaticDispose: {
            enabled: boolean
            // TODO
            ignore: string[]
        }
    }
    /** If array - specify contribution properties where it's allowed */
    allowId: boolean | string[]
    /** Category that will be used in commands by default */
    defaultCategory: 'extensionName' | { custom: string }
}

export type UserConfig = PartialDeep<Config>

export const defaultConfig: Config = {
    executable: 'code',
    enableProposedApi: false,
    disableExtensions: true,
    openDevtools: false,
    hotReload: {
        enabled: true,
        automaticDispose: {
            enabled: true,
            ignore: [],
        },
    },
    allowId: false,
    defaultCategory: 'extensionName',
}
