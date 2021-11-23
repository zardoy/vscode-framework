import vscode, { CodeAction } from 'vscode'

vscode.commands.registerCommand('test', () => {}, this)
vscode.commands.registerCommand('', () => {}, this)
vscode.commands.executeCommand('test', () => {}, this)
vscode.commands.executeCommand('test')
vscode.commands.executeCommand('', () => {}, this)

vscode.workspace.getConfiguration().get('extension.group.test')
vscode.workspace.getConfiguration('extension.group').get('test')
vscode.workspace.getConfiguration('').get('extension.topSettting')
vscode.workspace.getConfiguration('extension').get('topSettting')
// BUT NOT:
// vscode.workspace.getConfiguration('commandPalettes.group.test').get('')

// vscode.languages.registerCodeActionsProvider('selector', {
//     provideCodeActions(document, range, context, token) {
//         const codeAction = new CodeAction('')
//         codeAction.command = {
//             command: ''
//         }
//         return codeAction
//     }
// })
