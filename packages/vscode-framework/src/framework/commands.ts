import vscode from 'vscode'
import { MaybePromise } from '../util'
import { Commands } from './generated'
import { extensionCtx } from './injected'

export const registerExtensionCommand = (command: RegularCommands, handler: CommandHandler) => {
    const extensionIdName = extensionCtx.extension.id.split('.')[1]!
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(`${extensionIdName}.${command}`, (...args) => handler({ command }, ...args)),
    )
}

// TODO! disallow production
export const registerActiveDevelopmentCommand = (
    handler: (data: { command: '' }, ...args: any[]) => MaybePromise<void>,
) => {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand('runActiveDevelopmentCommand', (...args) => handler({ command: '' }, ...args)),
    )
}

export type CommandHandler = (data: { command: RegularCommands }, ...args: any[]) => MaybePromise<void>

/** would never run. something like `test.skip` */
export const registerNoop = (description: string, handler: CommandHandler) => {}

export const registerAllExtensionCommands = (commands: { [C in RegularCommands]: CommandHandler }) => {
    for (const [command, handler] of Object.entries(commands)) registerExtensionCommand(command, handler)
}

type RegularCommands = Commands['regular']
