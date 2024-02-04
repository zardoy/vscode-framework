import * as vscode from 'vscode'
import type { RegularCommands, Settings } from '../index'

// methods that works with injected env

export const getExtensionContributionsPrefix = () => (process.env.IDS_PREFIX ? `${process.env.IDS_PREFIX}.` : '')

export const getExtensionCommandId = (command: keyof RegularCommands) => `${getExtensionContributionsPrefix()}${command}`

export const getExtensionSettingId = (setting: keyof Settings) => `${getExtensionContributionsPrefix()}${setting}`

// methods that works only with injected code (extensionBootstrap.ts)

declare const vscode_framework_set_debug_enabled: any
declare const __VSCODE_FRAMEWORK_CONTEXT: vscode.ExtensionContext

/**
 * Can be used only inside function
 * and not used before extension activation!
 *
 * */
export const extensionCtx: vscode.ExtensionContext = typeof __VSCODE_FRAMEWORK_CONTEXT === 'undefined' ? undefined! : __VSCODE_FRAMEWORK_CONTEXT

/**
 * Get ID of current running extension
 * @param full By default returns only name (first part before dot). Pass `true`, to return also `publisher.name` as second part
 */
export const getExtensionId = (full = false) => {
    const ctx = __VSCODE_FRAMEWORK_CONTEXT
    return full ? ctx.extension.id : ctx.extension.id.split('.')[1]!
}

export const setDebugEnabled = (state: boolean) => {
    vscode_framework_set_debug_enabled(state)
}
