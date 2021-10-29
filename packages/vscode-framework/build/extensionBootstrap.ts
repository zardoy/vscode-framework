/* eslint-disable zardoy-config/@typescript-eslint/no-require-imports */
/// <reference path="client.d.ts" />

// file that placed into output directory as-is

import vscode from 'vscode'
import type { BootstrapConfig, IpcEvents } from '../src/cli/buildExtension'
import type { MaybePromise } from '../src/util'

type AsyncVoid = MaybePromise<void>

// TODO implement exports-typechecker !
interface Extension {
    activate: (ctx: vscode.ExtensionContext) => AsyncVoid
    deactivate?: () => AsyncVoid
}
const activateFunctions: Array<Extension['activate']> = []

declare const VSCODE_FRAMEWORK_OUTPUT: any | undefined
declare const vscode_framework_set_debug_enabled: any
declare let __VSCODE_FRAMEWORK_CONTEXT: any
if (typeof VSCODE_FRAMEWORK_OUTPUT !== 'undefined')
    activateFunctions.push(() => {
        const outputChannel = vscode.window.createOutputChannel(process.env.EXTENSION_DISPLAY_NAME)
        // eslint-disable-next-line new-cap
        VSCODE_FRAMEWORK_OUTPUT.channel = outputChannel
        if (process.env.NODE_ENV !== 'production') vscode_framework_set_debug_enabled(true)
    })

if (process.env.EXTENSION_BOOTSTRAP_CONFIG) {
    const bootstrapConfig = process.env.EXTENSION_BOOTSTRAP_CONFIG as unknown as BootstrapConfig
    // TODO! review avaialble
    if (bootstrapConfig.developmentCommands && typeof VSCODE_FRAMEWORK_OUTPUT !== 'undefined')
        activateFunctions.push(ctx => {
            ctx.subscriptions.push(
                vscode.commands.registerCommand('focusActiveDevelopmentExtensionOutput', () => {
                    VSCODE_FRAMEWORK_OUTPUT.channel.show(true)
                }),
            )
        })

    if (process.env.PLATFORM === 'node' && bootstrapConfig.serverIpcChannel) {
        const { Client: IpcClient } = require('net-ipc') as typeof import('net-ipc')
        activateFunctions.push(() => {
            // maxRetries: 1, timeout: 1000
            const { serverIpcChannel } = bootstrapConfig
            const client = new IpcClient({
                path: serverIpcChannel,
            })
            client.on('ready', () => {
                client.on('error', err => {
                    console.error('[ipc]', err)
                })
                client.on('message', (message: IpcEvents['extension']) => {
                    if (message === 'action:reload' && bootstrapConfig.forceReload) {
                        void vscode.commands.executeCommand('workbench.action.reloadWindow')
                        return
                    }

                    if (message === 'action:close' && bootstrapConfig.closeWindowOnExit)
                        void vscode.commands.executeCommand('workbench.action.closeWindow')
                })
            })
            client.connect().catch(console.error)
        })
    }

    if (bootstrapConfig?.hotReload) {
        // const { enableHotReload, hotRequire } = require('@hediet/node-reload') as typeof import('@hediet/node-reload')
        // enableHotReload({ entryModule: module })
        // // TODO return type
        // activateFunctions.push(ctx => {
        //     hotRequire<Extension>(module, './extension-node.js', ({ activate, deactivate }) => {
        //         // console.log('activating')
        //         void activate(ctx)
        //         return {
        //             dispose: () => {
        //                 for (const { dispose } of ctx.subscriptions) dispose()
        //                 console.log('deactivating')
        //                 const promise = deactivate?.()
        //                 if (deactivate) console.log('deactivate for disposing is called')
        //                 // if (promise)
        //                 //     console.log(
        //                 //         kleur.yellow().bold('Warning: '),
        //                 //         kleur.yellow("deactivate promises can't be handled gracefully consider sync disposing"),
        //                 //     )
        //             },
        //         }
        //     })
        // })
    }
}

export const activate: Extension['activate'] = ctx => {
    __VSCODE_FRAMEWORK_CONTEXT = ctx
    for (const activate of activateFunctions) void activate(ctx)
    require(process.env.EXTENSION_ENTRYPOINT!).activate(ctx)
}
