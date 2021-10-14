/// <reference path="client.d.ts" />

// file that placed into output directory as-is

import vscode from 'vscode'
// import nodeIpc from 'node-ipc'
import type { BootstrapConfig } from '../src/cli/buildExtension'
import type { MaybePromise } from '../src/util'

type AsyncVoid = MaybePromise<void>

// TODO implement exports-typechecker !
interface Extension {
    activate: (ctx: vscode.ExtensionContext) => AsyncVoid
    deactivate?: () => AsyncVoid
}
const activateFunctions: Array<Extension['activate']> = []

if (process.env.EXTENSION_BOOTSTRAP_CONFIG) {
    const bootstrapConfig = JSON.parse(process.env.EXTENSION_BOOTSTRAP_CONFIG) as BootstrapConfig
    if (bootstrapConfig.serverIpcChannel)
        activateFunctions.push(() => {
            // STATUS: connecting
            // maxRetries: 1, timeout: 1000
            const { serverIpcChannel } = bootstrapConfig
            // console.time('ipc-connect')
            // nodeIpc.connectTo(serverIpcChannel!, () => {
            //     console.timeEnd('ipc-connect')
            //     const ipc = nodeIpc.of[serverIpcChannel!]!
            //     // STATUS: connected
            //     ipc.on('data', buffer => {
            //         console.log(buffer)
            //     })
            // })
        })

    if (bootstrapConfig?.hotReload) {
        // eslint-disable-next-line zardoy-config/@typescript-eslint/no-require-imports
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

declare const VSCODE_FRAMEWORK_OUTPUT: any | undefined
declare const vscode_framework_set_debug_enabled: any
if (VSCODE_FRAMEWORK_OUTPUT)
    activateFunctions.push(() => {
        const outputChannel = vscode.window.createOutputChannel(process.env.EXTENSION_DISPLAY_NAME)
        // eslint-disable-next-line new-cap
        VSCODE_FRAMEWORK_OUTPUT.channel = outputChannel
        if (process.env.NODE_ENV !== 'production') vscode_framework_set_debug_enabled(true)
    })

export const activate: Extension['activate'] = ctx => {
    for (const activate of activateFunctions) void activate(ctx)
    // eslint-disable-next-line zardoy-config/@typescript-eslint/no-require-imports
    require(process.env.EXTENSION_ENTRYPOINT!).activate(ctx)
}
