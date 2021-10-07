import Debug from '@prisma/debug'
import execa from 'execa'
import { Config } from '../config'
import nodeIpc from 'node-ipc'
import exitHook from 'exit-hook'

const debug = Debug('vscode-framework:launcher')

export type LaunchParams = Pick<Config, 'development'>

export const launchVscode = async (targetDir: string, { development: developmentConfig }: LaunchParams) => {
    // reference: NativeParsedArgs
    /** falsy values are trimmed. I don't think that we need to pass false explicitly here */
    const args = {
        'skip-add-to-recently-opened': true,
        'new-window': true,
        // ignored if already has windows opened
        // wait: true,
        extensionDevelopmentPath: targetDir,
        'disable-extensions': developmentConfig.disableExtensions,
        'open-devtools': developmentConfig.openDevtools,
    }
    debug(args)

    const argsParsed = Object.entries(args)
        .flatMap(([name, value]) => {
            if (!value) return undefined
            const array = [`--${name}`]
            if (typeof value === 'string') array.push(value)
            return array
        })
        .filter(a => a !== undefined) as string[]

    // TODO don't use globals
    nodeIpc.config.id = 'vscode-framework:server'
    await new Promise<void>(r => {
        nodeIpc.serve(r)
        nodeIpc.server.start()
    })

    const vscodeProcess = execa(developmentConfig.executable, [...argsParsed], {
        preferLocal: false,
        detached: true,
        stdio: 'ignore',
    })
    exitHook(() => {
        // workbench.action.quit
        // workbench.action.closeWindow
        // search.action.focusActiveEditor
        nodeIpc.server.emit('app:close')
    })

    return {
        vscodeProcess,
    }
}
