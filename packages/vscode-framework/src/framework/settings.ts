import * as vscode from 'vscode'
import { Settings } from '..'

type ConfigurationScope = vscode.ConfigurationScope | null

// TODO! check with empty string (when disabled prefix)
export const getExtensionSetting = <T extends keyof Settings>(key: T, scope?: ConfigurationScope): Settings[T] =>
    vscode.workspace.getConfiguration(process.env.IDS_PREFIX, scope).get<Settings[T]>(key)!

/** Pass `undefined` as value to reset the setting */
export const updateExtensionSetting = async <T extends keyof Settings>(
    key: T,
    value: Settings[T] | undefined,
    scope?: ConfigurationScope,
): Promise<void> => vscode.workspace.getConfiguration(process.env.IDS_PREFIX, scope).update(key, value)
