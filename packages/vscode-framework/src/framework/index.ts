/// <reference path="../../build/client.d.ts" />
import vscode from 'vscode'
import { MaybePromise } from '../util'
import { Commands, Settings } from './generated'

type RegularCommands = Commands['regular']

// TODO test args
export type CommandHandler = (data: { command: RegularCommands }, ...args: any[]) => MaybePromise<void>

declare let __VSCODE_FRAMEWORK_CONTEXT: vscode.ExtensionContext

/**
 * Can be used only inside function
 * and not used before extension activation!
 * */
export const extensionCtx = __VSCODE_FRAMEWORK_CONTEXT

export const getExtensionId = (full = false) => {
    const ctx = __VSCODE_FRAMEWORK_CONTEXT
    return full ? ctx.extension.id : ctx.extension.id.split('.')[1]!
}

export const registerExtensionCommand = (command: RegularCommands, handler: CommandHandler) => {
    const ctx = __VSCODE_FRAMEWORK_CONTEXT
    const extensionIdName = extensionCtx.extension.id.split('.')[1]!
    ctx.subscriptions.push(
        vscode.commands.registerCommand(`${extensionIdName}.${command}`, (...args) => handler({ command }, ...args)),
    )
}

export const registerAllExtensionCommands = (commands: { [C in RegularCommands]: CommandHandler }) => {
    for (const [command, handler] of Object.entries(commands)) registerExtensionCommand(command, handler)
}

export const getExtensionSetting = <T extends keyof Settings>(key: T): Settings[T] =>
    vscode.workspace.getConfiguration(getExtensionId()).get<Settings[T]>(key)

/** Pass `undefined` as value to reset the setting */
export const updateExtensionSetting = async <T extends keyof Settings>(
    key: T,
    value: Settings[T] | undefined,
): Promise<void> => vscode.workspace.getConfiguration(getExtensionId()).update(key, value)

export * from 'vscode-extra'
