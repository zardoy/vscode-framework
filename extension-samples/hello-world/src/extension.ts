import * as vscode from 'vscode'
import { registerExtensionCommand } from 'vscode-framework'

export const activate = () => {
    console.log('Extension activated!')
    registerExtensionCommand('sayHello', async () => {
        await vscode.window.showInformationMessage('Hello World!')
    })
}
