import vscode from 'vscode'

/** note: always `false` in development until `process.env.PRETEND_PORTABLE` is set */
export const isExtensionInPortableMode = (ctx: vscode.ExtensionContext) => {
    if (ctx.extensionMode === vscode.ExtensionMode.Development) return !!process.env.PRETEND_PORTABLE
    return ctx.asAbsolutePath('../..').endsWith('data')
}
