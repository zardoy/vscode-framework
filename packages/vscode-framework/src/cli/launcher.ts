import Debug from '@prisma/debug'
import execa from 'execa'
import exitHook from 'exit-hook'
import { Config } from '../config'

const debug = Debug('vscode-framework:launcher')

export type LaunchConfig = Pick<Config, 'disableExtensions' | 'openDevtools'>

export const launchVscode = (targetDir: string, config: LaunchConfig) => {
    // reference: NativeParsedArgs
    /** falsy values are trimmed. I don't think that we need to pass false explicitly here */
    const args = {
        'skip-add-to-recently-opened': true,
        'new-window': true,
        // ignored if already has windows opened
        // wait: true,
        extensionDevelopmentPath: targetDir,
        'disable-extensions': config.disableExtensions,
        'open-devtools': config.openDevtools,
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

    const vscodeProcess = execa('code', [...argsParsed], {
        preferLocal: false,
        detached: true,
        stdio: 'ignore',
    })
    exitHook(() => {
        // TODO close vscode
        // workbench.action.quit
        // workbench.action.closeWindow
        // search.action.focusActiveEditor
    })

    return {
        vscodeProcess,
    }
}
