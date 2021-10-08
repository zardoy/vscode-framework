import Debug from '@prisma/debug'
import execa from 'execa'
import exitHook from 'exit-hook'
import nodeIpc from 'node-ipc'
import { Config } from '../config'

const debug = Debug('vscode-framework:launcher')

type LaunchParams = Pick<Config, 'development'> & {
    /**
     *  Passing a channel with an ID to launch IPC server only from `start` command, but not from `launch`.
     *  An unique ID is required because multiple instances of extension can be launched
     * */
    serverIpcChannel: string | false
}

export type IpcEvents = {
    // app:reload not necessarily reloads window. it means changes happened and new file is on disk
    extension: 'app:close' | 'app:reload'
}

let isServerIpcStarted = false

export const launchVscode = async (
    targetDir: string,
    { development: developmentConfig, serverIpcChannel }: LaunchParams,
) => {
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
    if (serverIpcChannel) {
        if (isServerIpcStarted) throw new Error('IPC is already started. the first one must be closed')

        nodeIpc.config.id = serverIpcChannel
        nodeIpc.server.on('disconnect', () => {
            isServerIpcStarted = false
        })
        nodeIpc.server.on('error', () => {
            isServerIpcStarted = false
        })
        await new Promise<void>(resolve => {
            nodeIpc.serve(resolve)
            nodeIpc.server.start()
        })
        isServerIpcStarted = true
    }

    const vscodeProcess = execa(developmentConfig.executable, [...argsParsed], {
        preferLocal: false,
        detached: true,
        stdio: 'ignore',
    })
    if (serverIpcChannel)
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
