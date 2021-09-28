import vscode from 'vscode'
import { VscodeFramework } from 'vscode-framework'

export const activate = (ctx: vscode.ExtensionContext) => {
    const item = vscode.window.createStatusBarItem()
    item.text = 'Hedll1o W3o2rld1!113'
    item.show()
    ctx.subscriptions.push(item)
    // console.log('Hello from extension!')
    // const framework = new VscodeFramework(ctx)
    // framework.registerCommand('sayHello', async () => {
    //     await vscode.window.showInformationMessage('Hello!')
    // })
    // framework.getExtensionSetting()
}
