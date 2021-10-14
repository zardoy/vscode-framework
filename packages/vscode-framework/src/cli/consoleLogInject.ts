import type internal from 'stream'

const makeConsoleMethods = <T extends keyof Console>(t: T[]) => t

// I am trying to store everything in the object, so esbuild does less renames (possible variable names collisions)
const VSCODE_FRAMEWORK_OUTPUT = {
    oldConsole: globalThis.console,
    channel: undefined as Pick<import('vscode').OutputChannel, 'appendLine' | 'clear' | 'hide' | 'show'> | undefined,
    consoleTimeFormatter: new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
        hour12: false,
    }),
    // from patch-Console
    CONSOLE_METHODS: makeConsoleMethods([
        'assert',
        'count',
        'countReset',
        'debug',
        'dir',
        'dirxml',
        'error',
        'group',
        'groupCollapsed',
        'groupEnd',
        'info',
        'log',
        'table',
        'time',
        'timeEnd',
        'timeLog',
        'trace',
        'warn',
        'clear',
        'show',
        'hide',
    ]),
    isDebugEnabled: process.env.NODE_ENV !== 'production',
    currentLevel: undefined as string | undefined,
    appendOutput(message: string) {
        const levelString = this.currentLevel ? ` [${this.currentLevel}]` : ''
        this.channel!.appendLine(`[${this.consoleTimeFormatter.format(new Date())}]${levelString} ${message}`)
        this.currentLevel = undefined
    },
    newConsole: new globalThis.console.Console(
        ...((): [internal.PassThrough, internal.PassThrough] => {
            // eslint-disable-next-line zardoy-config/@typescript-eslint/no-require-imports
            const { PassThrough } = require('stream') as typeof import('stream')

            const stdout = new PassThrough()
            stdout.write = ((message: string) => VSCODE_FRAMEWORK_OUTPUT.appendOutput(message)) as any

            const stderr = new PassThrough()
            stderr.write = ((message: string) => {
                VSCODE_FRAMEWORK_OUTPUT.currentLevel = 'error'
                VSCODE_FRAMEWORK_OUTPUT.appendOutput(message)
            }) as any

            return [stdout, stderr]
        })(),
    ),
}
// TODO implement
// if (process.env.REVEAL_OUTPUT_PANEL_IN_DEVELOPMENT !== 'false')

type HandledConsoleMethods = typeof VSCODE_FRAMEWORK_OUTPUT['CONSOLE_METHODS'][number]
// ctrl+space to see which methods are not touched in console
// const methodsToLeaveAsIs: Exclude<keyof Console, HandledConsoleMethods> = ''

/** @internal */
export const VSCODE_FRAMEWORK_ASSIGN_CONSOLE_OUTPUT = (
    NEW_OUTPUT_CHANNEL: NonNullable<typeof VSCODE_FRAMEWORK_OUTPUT['channel']>,
) => {
    VSCODE_FRAMEWORK_OUTPUT.channel = NEW_OUTPUT_CHANNEL
}

/** @internal */
export type VSCODE_FRAMEWORK_ASSIGN_CONSOLE_OUTPUT_TYPE = typeof VSCODE_FRAMEWORK_ASSIGN_CONSOLE_OUTPUT

/** @internal */
export const VSCODE_FRAMEWORK_SET_DEBUG_ENABLED = (enabled: boolean): void => {
    VSCODE_FRAMEWORK_OUTPUT.isDebugEnabled = enabled
}

export type VSCODE_FRAMEWORK_SET_DEBUG_ENABLED_TYPE = typeof VSCODE_FRAMEWORK_SET_DEBUG_ENABLED

// const timeMarkers = {} as Record<string, number>

/** @internal */
export const console = {
    ...VSCODE_FRAMEWORK_OUTPUT.oldConsole,
    ...VSCODE_FRAMEWORK_OUTPUT.newConsole,
    ...({
        debug(...data) {
            if (!VSCODE_FRAMEWORK_OUTPUT.isDebugEnabled) return
            VSCODE_FRAMEWORK_OUTPUT.currentLevel = 'debug'
            VSCODE_FRAMEWORK_OUTPUT.newConsole.log(...data)
        },
        warn(...data) {
            VSCODE_FRAMEWORK_OUTPUT.currentLevel = 'warn'
            VSCODE_FRAMEWORK_OUTPUT.newConsole.log(...data)
        },
        log(...data) {
            VSCODE_FRAMEWORK_OUTPUT.currentLevel = 'log'
            VSCODE_FRAMEWORK_OUTPUT.newConsole.log(...data)
        },
        clear() {
            VSCODE_FRAMEWORK_OUTPUT.channel!.clear()
        },
        show() {
            VSCODE_FRAMEWORK_OUTPUT.channel!.show()
        },
        hide() {
            VSCODE_FRAMEWORK_OUTPUT.channel!.hide()
        },
    } as Partial<Pick<Console, HandledConsoleMethods>>),
}
// export const console = {
//     time(marker = 'default') {
//         timeMarkers[marker] = Date.now()
//     },
//     timeEnd(marker = 'default') {
//         timeMarkers[marker] = Date.now()
//         if (!timeMarkers[marker]) {
//             console.warn('No time marker', marker)
//             return
//         }

//         // eslint-disable-next-line zardoy-config/@typescript-eslint/no-dynamic-delete
//         delete timeMarkers[marker]
//         appendOutput('log', marker, Date.now() - timeMarkers[marker]!)
//     },
// }
