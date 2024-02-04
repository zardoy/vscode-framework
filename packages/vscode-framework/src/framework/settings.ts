import * as vscode from 'vscode'
import { Settings } from '..'

type ConfigurationScope = vscode.ConfigurationScope | null

/**
 * @param mergeScopes (for object/array settings only) Wether to merge global and local setting properties, local takes precedence
 */
export const getExtensionSetting = <T extends keyof Settings>(
    key: T,
    scope?: ConfigurationScope,
    mergeScopes?: { defaultValue: 'object' | 'array' },
): Settings[T] => {
    if (mergeScopes) {
        // eslint-disable-next-line @typescript-eslint/ban-types
        const defaultValue = (mergeScopes.defaultValue === 'object' ? {} : []) as []
        const {
            globalValue = defaultValue,
            workspaceValue = defaultValue,
            workspaceFolderValue = defaultValue,
            defaultLanguageValue = defaultValue,
            globalLanguageValue = defaultValue,
            workspaceLanguageValue = defaultValue,
            workspaceFolderLanguageValue = defaultValue,
        } = vscode.workspace.getConfiguration(process.env.IDS_PREFIX, scope ?? null).inspect<Settings[T] & Record<string, any>>(key)!
        if (mergeScopes.defaultValue === 'object')
            return {
                ...globalValue,
                ...workspaceValue,
                ...workspaceFolderValue,
                ...defaultLanguageValue,
                ...globalLanguageValue,
                ...workspaceLanguageValue,
                ...workspaceFolderLanguageValue,
            } as Settings[T] & Record<string, any>

        return [
            ...globalValue,
            ...workspaceValue,
            ...workspaceFolderValue,
            ...defaultLanguageValue,
            ...globalLanguageValue,
            ...workspaceLanguageValue,
            ...workspaceFolderLanguageValue,
        ] as Settings[T] & any[]
    }

    return vscode.workspace.getConfiguration(process.env.IDS_PREFIX, scope).get<Settings[T]>(key)!
}

/** Pass `undefined` as value to reset the setting */
export const updateExtensionSetting = async <T extends keyof Settings>(
    key: T,
    value: Settings[T] | undefined,
    scope?: ConfigurationScope,
): Promise<void> => vscode.workspace.getConfiguration(process.env.IDS_PREFIX, scope).update(key, value)
