import vscode from 'vscode'
import { RegularCommands } from '..'
import { MaybePromise } from '../util'
import { getExtensionContributionsPrefix, extensionCtx } from './injected'

export type CommandHandler = (data: { command: keyof RegularCommands }, ...args: any[]) => MaybePromise<void>

export const registerExtensionCommand = (command: keyof RegularCommands, handler: CommandHandler) => {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(`${getExtensionContributionsPrefix()}${command}`, (...args) =>
            handler({ command }, ...args),
        ),
    )
}

export const registerAllExtensionCommands = (commands: { [C in keyof RegularCommands]: CommandHandler }) => {
    for (const [command, handler] of Object.entries(commands)) registerExtensionCommand(command, handler)
}

// TODO! disallow production
export const registerActiveDevelopmentCommand = (
    handler: (data: { command: '' }, ...args: any[]) => MaybePromise<void>,
) => {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand('runActiveDevelopmentCommand', (...args) => handler({ command: '' }, ...args)),
    )
}

/** would never run. something like `test.skip` */
export const registerNoop = (description: string, handler: CommandHandler) => {}
