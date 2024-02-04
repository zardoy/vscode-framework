import * as vscode from 'vscode'
import { ManifestType } from 'vscode-manifest'
import { RegularCommands } from '..'
import { MaybePromise } from '../util'
import { getExtensionContributionsPrefix, extensionCtx } from './injected'
import { getExtensionCommandId } from '.'

export type CommandHandlerMetadata = {
    command: keyof RegularCommands
    commandTitle: string
}

export type CommandHandler<T extends 'regular' | 'editor' = 'regular'> = T extends 'editor'
    ? (data: CommandHandlerMetadata, textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) => MaybePromise<any>
    : (data: CommandHandlerMetadata, ...args: any[]) => MaybePromise<any>

const getCommandTitle = (commandId: string) => {
    const fullCommandId = getExtensionCommandId(commandId as any)
    const command = (extensionCtx.extension.packageJSON as ManifestType).contributes.commands!.find(({ command }) => command === fullCommandId)!
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

/** Works only via `vscode-framework start` */
export const registerExtensionCommand = (command: keyof RegularCommands, handler: CommandHandler) => {
    const disposable = vscode.commands.registerCommand(`${getExtensionContributionsPrefix()}${command}`, async (...args) => {
        const commandTitle = getCommandTitle(command)
        try {
            return handler({ command, commandTitle }, ...args)
        } catch (error) {
            if (error instanceof GracefulCommandError) {
                const firstArgs = error.options.modal
                    ? ([
                          `Running command '${commandTitle}' failed`,
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
                return
            }

            // TODO-low add github report button, like in some module for Electron
            if (process.env.NODE_ENV === 'development') throw error
            void vscode.window.showErrorMessage(`Command '${commandTitle}' failed`, {
                modal: true,
                detail: error.message,
            })
        }
    })
    extensionCtx.subscriptions.push(disposable)
    return disposable
}

/** Works only via `vscode-framework start` */
export const registerAllExtensionCommands = (commands: { [C in keyof RegularCommands]: CommandHandler }) => {
    const disposables: vscode.Disposable[] = []
    for (const [command, handler] of Object.entries(commands)) disposables.push(registerExtensionCommand(command, handler))
    return disposables
}

// TODO! disallow production
/** Works only via `vscode-framework start` */
export const registerActiveDevelopmentCommand = (handler: (data: { command: '' }, ...args: any[]) => MaybePromise<void>) => {
    extensionCtx.subscriptions.push(vscode.commands.registerCommand('runActiveDevelopmentCommand', (...args) => handler({ command: '' }, ...args)))
}

/** would never run. something like `test.skip` */
export const registerNoop = (description: string, handler: CommandHandler) => {}
