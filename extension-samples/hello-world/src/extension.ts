import { registerExtensionCommand } from 'vscode-framework'

export const activate = () => {
    console.log('Extension active!')
    registerExtensionCommand('sayHello', () => {})
}
