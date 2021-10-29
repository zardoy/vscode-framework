import { registerExtensionCommand } from 'vscode-framework'
import vscode from 'vscode'

export const activate = () => {
    console.log('Extension activated!')
    registerExtensionCommand('sayHello', async () => {
        await vscode.window.showInformationMessage('Hello World!')
    })
}
