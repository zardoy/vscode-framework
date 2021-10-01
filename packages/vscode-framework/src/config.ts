import { PartialDeep } from 'type-fest'
import { BuildOptions } from 'esbuild'

export interface Config {
    // TODO implies executable = insiders
    enableProposedApi: boolean
    /** Override (extend) esbuild config in both */
    esbuildConfig: BuildOptions
    /** Development-only settings. They don't affect production build */
    development: {
        executable: 'code' | 'code-insiders'
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
    }
    /** If array - specify contribution properties where it's allowed */
    allowId: boolean | string[]
    /** Category that will be used in commands by default */
    defaultCategory: 'extensionName' | { custom: string }
}

export type UserConfig = PartialDeep<Config>

export const defaultConfig: Config = {
    esbuildConfig: {},
    enableProposedApi: false,
    development: {
        executable: 'code',
        disableExtensions: true,
        openDevtools: false,
        hotReload: {
            enabled: true,
            automaticDispose: {
                enabled: true,
                ignore: [],
            },
        },
    },
    allowId: false,
    defaultCategory: 'extensionName',
}
