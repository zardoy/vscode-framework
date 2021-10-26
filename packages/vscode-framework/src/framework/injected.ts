import vscode from 'vscode'

// methods that works only with injected code

declare const vscode_framework_set_debug_enabled: any
declare const __VSCODE_FRAMEWORK_CONTEXT: vscode.ExtensionContext

/**
 * Can be used only inside function
 * and not used before extension activation!
 * */
export const extensionCtx = __VSCODE_FRAMEWORK_CONTEXT

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
