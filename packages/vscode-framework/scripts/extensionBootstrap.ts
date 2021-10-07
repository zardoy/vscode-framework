import * as vscode from 'vscode'
import { Config } from '../src/config'
import type { MaybePromise } from '../src/util'
import nodeIpc from 'node-ipc'

type AsyncVoid = MaybePromise<void>

interface Extension {
    activate: (ctx: vscode.ExtensionContext) => AsyncVoid
    deactivate?: () => AsyncVoid
}

let activate: Extension['activate']

const bootstrapConfig = JSON.parse(process.env.EXTENSION_BOOTSTRAP_CONFIG!) as Exclude<
    Config['development']['extensionBootstrap'],
    false
>

if (bootstrapConfig.hotReload) {
    const { enableHotReload, hotRequire } = require('@hediet/node-reload') as typeof import('@hediet/node-reload')
    enableHotReload({ entryModule: module })
    // TODO return type
    activate = ctx => {
        hotRequire<Extension>(module, './extension.js', ({ activate, deactivate }) => {
            // console.log('activating')
            void activate(ctx)

            return {
                dispose: () => {
                    ctx.subscriptions.forEach(({ dispose }) => {
                        dispose()
                    })
                    console.log('deactivating')
                    const promise = deactivate?.()
                    if (deactivate) console.log('deactivate for disposing is called')
                    // if (promise)
                    //     console.log(
                    //         kleur.yellow().bold('Warning: '),
                    //         kleur.yellow("deactivate promises can't be handled gracefully consider sync disposing"),
                    //     )
                },
            }
        })
    }
} else {
    activate = ctx => {
        return activate(ctx)
    }
}
