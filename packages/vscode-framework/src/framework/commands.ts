import vscode from 'vscode'
import { ManifestType } from 'vscode-manifest'
import { RegularCommands } from '..'
import { MaybePromise } from '../util'
import { getExtensionContributionsPrefix, extensionCtx } from './injected'
import { getExtensionCommandId } from '.'

export type CommandHandler = (data: { command: keyof RegularCommands }, ...args: any[]) => MaybePromise<void>

const getCommandTitle = (commandId: string) => {
    const fullCommandId = getExtensionCommandId(commandId as any)
    const command = (extensionCtx.extension.packageJSON as ManifestType).contributes.commands!.find(
        ({ command }) => command === fullCommandId,
    )!
    let msg = ''
    if (command.category) msg += `${command.category}: `
    msg += command.title
    return msg
}

export class GracefulCommandError extends Error {
    constructor(
        public override message: string,
        public options: {
            /** if modal is shown command will be displayed as title */
            modal?: boolean
            actions?: Array<{ label: string; action: () => MaybePromise<void> }>
        } = {},
    ) {
        super(message)
        this.name = 'GracefulCommandError'
    }
}

export const registerExtensionCommand = (command: keyof RegularCommands, handler: CommandHandler) => {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(`${getExtensionContributionsPrefix()}${command}`, async (...args) => {
            try {
                await handler({ command }, ...args)
            } catch (error) {
                // eslint-disable-next-line curly
                if (error instanceof GracefulCommandError) {
                    const firstArgs = error.options.modal
                        ? ([
                              `Running command "${getCommandTitle(command)}" failed`,
                              {
                                  modal: true,
                                  detail: error.message,
                              },
                          ] as const)
                        : ([error.message] as const)
                    const action = await vscode.window.showErrorMessage(
                        ...(firstArgs as [any]),
                        ...(error.options.actions ? error.options.actions.map(({ label }) => label) : []),
                    )
                    if (action) await error.options.actions!.find(({ label }) => label === action)!.action()
                }

                // show more graceful (AND HELPFUL!) errors
                // TODO add github report report, like sindresorhus did in module for Electron
                await vscode.window.showErrorMessage(`Command "${getCommandTitle(command)}" failed`, {
                    modal: true,
                    detail: error.message,
                })
            }
        }),
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
