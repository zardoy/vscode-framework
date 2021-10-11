import Debug from '@prisma/debug'
import execa from 'execa'
import exitHook from 'exit-hook'
import nodeIpc from 'node-ipc'
import { open as openVscodeBrowser } from '@vscode/test-web'
import { Config, BuildTargetType } from '../config'

const debug = Debug('vscode-framework:launcher')

export type LauncherCLIParams = {
    /** What to launch */
    target: BuildTargetType
    webOpen: WebOpenType
}

// TODO turn into interface
type LaunchParams = Pick<Config, 'development'> &
    LauncherCLIParams & {
        /**
         *  Passing a channel with an ID to launch IPC server only from `start` command, but not from `launch`.
         *  An unique ID is required because multiple instances of extension can be launched
         * */
        serverIpcChannel: string | false
    }

export type WebOpenType = 'desktop' | 'web'

export type IpcEvents = {
    // app:reload not necessarily reloads window. it means changes happened and new file is on disk
    extension: 'app:close' | 'app:reload'
}

let isServerIpcStarted = false

export const launchVscode = async (
    extensionDir: string,
    { development: developmentConfig, serverIpcChannel, target, webOpen }: LaunchParams,
) => {
    if (target === 'web' && webOpen === 'web') {
        // TODO use mozilla's extension tool instead of this one
        await openVscodeBrowser({
            browserType: 'chromium',
            headless: false,
            devTools: developmentConfig.openDevtools,
            extensionDevelopmentPath: extensionDir,
            // version: 'stable'
            // folderPath
            // extensionPaths
        })
        return undefined
    }

    // reference: NativeParsedArgs
    /** falsy values are trimmed. I don't think that we need to pass false explicitly here */
    const args = {
        'skip-add-to-recently-opened': true,
        'new-window': true,
        // ignored if already has windows opened
        // wait: true,
        extensionDevelopmentKind: target === 'web' ? 'web' : undefined,
        extensionDevelopmentPath: extensionDir,
        'disable-extensions': developmentConfig.disableExtensions,
        'open-devtools': developmentConfig.openDevtools,
    }
    // TODO launch insiders
    debug('vscode launch args', args)

    // TODO investigate web option with extensionBootstrap
    const argsParsed = Object.entries(args)
        .flatMap(([name, value]) => {
            if (!value) return undefined
            const array = [`--${name}`]
            if (typeof value === 'string') array.push(value)
            return array
        })
        .filter(a => a !== undefined) as string[]

    if (target !== 'web' && serverIpcChannel) {
        if (isServerIpcStarted) throw new Error('IPC is already started. the first one must be closed')

        // TODO don't use global nodeIpc
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
