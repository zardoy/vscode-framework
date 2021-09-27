declare module '.vscode-framework' {
    export type Commands = {
        regular: string
    }
    // extremely simplified for a moment
    export type Settings = Record<string, any> // settingID-type of it
}
