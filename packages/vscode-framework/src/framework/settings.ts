import vscode from 'vscode'
import { Settings } from './generated'
import { getExtensionContributionsPrefix } from './injected'

// TODO! check with empty string (when disabled prefix)
export const getExtensionSetting = <T extends keyof Settings>(key: T): Settings[T] =>
    vscode.workspace.getConfiguration(getExtensionContributionsPrefix()).get<Settings[T]>(key)

/** Pass `undefined` as value to reset the setting */
export const updateExtensionSetting = async <T extends keyof Settings>(
    key: T,
    value: Settings[T] | undefined,
): Promise<void> => vscode.workspace.getConfiguration(getExtensionContributionsPrefix()).update(key, value)
