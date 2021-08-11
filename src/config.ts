export interface Config {
    executable: 'code' | 'code-insiders';
    // TODO implies executable = insiders
    enableProposedApi: boolean;
    disableExtensions: boolean;
    openDevtools: boolean;
    hotReload: {
        enabled: boolean;
        /** Mocks `vscode` import with auto disposing */
        automaticDispose: {
            enabled: boolean;
            // TODO
            ignore: string[];
        };
    };
    /** Contribution fields if array */
    allowId: boolean | string[];
    defaultCategory: 'extensionName' | { custom: string };
}

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
};
