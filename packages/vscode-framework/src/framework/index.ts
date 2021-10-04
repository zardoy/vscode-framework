/// <reference path="../../build/client.d.ts" />
import vscode from 'vscode'
import { MaybePromise } from '../util'
import { Commands, Settings } from './generated'

type RegularCommands = Commands['regular']

// TODO test args
export type CommandHandler = (data: { command: RegularCommands }, ...args: any[]) => MaybePromise<void>

export class VscodeFramework<T extends boolean = false> {
    // outputChannel: vscode.OutputChannel
    readonly extensionIDName: string

    constructor(public readonly ctx: vscode.ExtensionContext) {
        // this.outputChannel = vscode.window.createOutputChannel(process.env.EXTENSION_DISPLAY_NAME)
        // TODO: we can't globally reassign things because Extension Host is shared between extensions
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

    /** make sure to not call after class creation, to prevent accidental registerCommand call (but no runtime restriction) */
    public registerAllCommands(
        commands: T extends false ? { [C in RegularCommands]: CommandHandler } : never,
    ): VscodeFramework<true> {
        for (const [command, handler] of Object.entries(commands)) {
            this.registerCommand(command as any, handler)
        }
        return this as any
    }

    public registerCommand(command: T extends false ? RegularCommands : never, handler: CommandHandler) {
        this.ctx.subscriptions.push(
            vscode.commands.registerCommand(`${this.extensionIDName}.${command}`, (...args) =>
                handler({ command }, ...args),
            ),
        )
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
