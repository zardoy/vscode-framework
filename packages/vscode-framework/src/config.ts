import { PartialDeep } from 'type-fest'
import { BuildOptions } from 'esbuild'

export interface Config {
    /** Override (extend) esbuild config for development and production */
    esbuildConfig: BuildOptions
    /** Development-only settings. They don't affect production build */
    development: {
        // TODO implies executable = insiders
        /** code- */
        executable: 'code' | 'code-insiders'
        /**
         *  effects `start` and `launch` commands. whether launch extension with other extensions disabled
         * - it's not possible to get rid of *extensions disabled* notification on every reload
         * - opening other folder/workspace will clear effect and enable extensions back
         */
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
    /** Try to restore IDs in contributions. disable or add contributions keys (implies blacklist) only if have issues with that */
    // Will enable in case of any issues
    // restoreId: boolean | string[]
    /** Category that will be used in `contibutes.commands` by default */
    defaultCategory: 'extensionName' | { custom: string }
}

export type UserConfig = PartialDeep<Config>

export const defaultConfig: Config = {
    esbuildConfig: {},
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
    // restoreId: true,
    defaultCategory: 'extensionName',
}
