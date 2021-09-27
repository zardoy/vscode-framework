/// <reference path="../../build/client.d.ts" />
import vscode from 'vscode'
import { MaybePromise } from '../util'
import { Commands, Settings } from './generated'

export class VscodeFramework {
    // outputChannel: vscode.OutputChannel
    readonly extensionIDName: string

    constructor(public readonly ctx: vscode.ExtensionContext) {
        // this.outputChannel = vscode.window.createOutputChannel(process.env.EXTENSION_DISPLAY_NAME)
        // TODO we can't globally reassign things because Extension Host is shared between extensions
        // console.log = (...args) => {
        //     this.outputChannel.appendLine(args.join(' '))
        // }

        // if (process.env.NODE_ENV === 'development' && process.env.REVEAL_OUTPUT_PANEL_IN_DEVELOPMENT !== 'false')
        //     this.outputChannel.show(true)
        // process.on("unhandledRejection", (err: Error) => {
        //     // vscode.window.showErrorMessage(`Extension ${process.env.EXTENSION_DISPLAY_NAME} Crashed`, {
        // process.on("uncaughtExceptionMonitor", (err: Error) => {

        this.extensionIDName = ctx.extension.id.split('.')[1]!
    }

    public registerCommand(command: Commands['regular'], callback: () => MaybePromise<void>) {
        this.ctx.subscriptions.push(vscode.commands.registerCommand(`${this.extensionIDName}.${command}`, callback))
    }

    public getExtensionSetting<T extends keyof Settings>(key: T): Settings[T] {
        vscode.workspace.getConfiguration(this.extensionIDName).get<Settings[T]>(key)
    }

    public async updateExtensionSetting<T extends keyof Settings>(key: T, value: Settings[T]): Promise<void> {
        return vscode.workspace.getConfiguration(this.extensionIDName).update(key, value)
    }

    public async resetExtensionSetting<T extends keyof Settings>(key: T): Promise<void> {
        return vscode.workspace.getConfiguration(this.extensionIDName).update(key, undefined)
    }
}

export * from 'vscode-extra'
