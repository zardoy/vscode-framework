import Debug from '@prisma/debug'
import execa from 'execa'
import exitHook from 'exit-hook'
import { open as openVscodeBrowser } from '@vscode/test-web'
import { Config, BuildTargetType } from '../config'

const debug = Debug('vscode-framework:launcher')

export type LauncherCLIParams = {
    /** What to launch */
    target: BuildTargetType
    webOpen: WebOpenType
}

type LaunchParams = Pick<Config, 'development'> & LauncherCLIParams

export type WebOpenType = 'desktop' | 'web'

export const launchVscode = async (
    extensionDir: string,
    { development: developmentConfig, target, webOpen }: LaunchParams,
) => {
    debug({
        target,
        webOpen,
    })
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

    const vscodeProcess = execa(developmentConfig.executable, [...argsParsed], {
        preferLocal: false,
        detached: true,
        stdio: 'ignore',
    })

    return {
        vscodeProcess,
    }
}
