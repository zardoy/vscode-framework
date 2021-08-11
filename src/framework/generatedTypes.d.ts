declare module '.vscode-framework' {
    export type Commands = {
        regular: Array<{
            id: string;
            title: string;
        }>;
    };
    // extremely simplified for a moment
    export type Settings = Record<string, any>; // settingID-type of it
}
