import vscode from 'vscode'
import { Settings } from './generated'
import { getExtensionId } from './injected'

export const getExtensionSetting = <T extends keyof Settings>(key: T): Settings[T] =>
    vscode.workspace.getConfiguration(getExtensionId()).get<Settings[T]>(key)

/** Pass `undefined` as value to reset the setting */
export const updateExtensionSetting = async <T extends keyof Settings>(
    key: T,
    value: Settings[T] | undefined,
): Promise<void> => vscode.workspace.getConfiguration(getExtensionId()).update(key, value)
