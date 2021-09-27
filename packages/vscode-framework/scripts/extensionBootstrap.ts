import { enableHotReload, hotRequire } from '@hediet/node-reload'
import * as vscode from 'vscode'
import kleur from 'kleur'
import type { MaybePromise } from '../src/util'

type AsyncVoid = MaybePromise<void>

interface Extension {
    activate: (ctx: vscode.ExtensionContext) => AsyncVoid
    deactivate?: () => AsyncVoid
}

enableHotReload({ entryModule: module })

export const activate = (ctx: vscode.ExtensionContext) => {
    const outputChannel = vscode.window.createOutputChannel('extension')
    console.log = (...args) => {
        outputChannel.appendLine(args.join(' '))
    }
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
