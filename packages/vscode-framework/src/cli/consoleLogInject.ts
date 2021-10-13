// eslint-disable-next-line zardoy-config/unicorn/import-style
import type { OutputChannel } from 'vscode'
// TODO! review it
import prettyFormat from 'pretty-format'

// TODO place eerything into object

// TODO rename
let VSCODE_FRAMEWORK_OUTPUT_CHANNEL: Pick<OutputChannel, 'appendLine' | 'clear' | 'hide' | 'show'> | undefined

/** @internal */
export const VSCODE_FRAMEWORK_ASSIGN_CONSOLE_OUTPUT = (
    NEW_OUTPUT_CHANNEL: NonNullable<typeof VSCODE_FRAMEWORK_OUTPUT_CHANNEL>,
) => {
    VSCODE_FRAMEWORK_OUTPUT_CHANNEL = NEW_OUTPUT_CHANNEL
}

/** @internal */
export type VSCODE_FRAMEWORK_ASSIGN_CONSOLE_OUTPUT_TYPE = typeof VSCODE_FRAMEWORK_ASSIGN_CONSOLE_OUTPUT

// from patch-console
const CONSOLE_METHODS = [
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
]

// TODO!
const IMPLEMENTED_CONSOLE_METHODS = ['log', 'warn', 'error', 'debug', 'clear', 'show', 'hide'] as Array<keyof Console>

const consoleTimeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false,
})

const timeMarkers = {} as Record<string, number>

const appendOutput = (level: string, ...data) =>
    VSCODE_FRAMEWORK_OUTPUT_CHANNEL!.appendLine(
        `[${consoleTimeFormatter.format(new Date())}] [${level}] ${data.map(d => prettyFormat(d)).join(' ')}`,
    )

/** @internal */
export const console: Pick<
    Console,
    'log' | 'warn' | 'error' | 'debug' | 'clear' | 'show' | 'hide' | 'time' | 'timeEnd'
> = {
    log(...data) {
        appendOutput('log', ...data)
    },
    warn(...data) {
        appendOutput('warn', ...data)
    },
    error(...data) {
        appendOutput('error', ...data)
    },
    debug(...data) {
        // TODO
        appendOutput('debug', ...data)
    },
    clear() {
        VSCODE_FRAMEWORK_OUTPUT_CHANNEL!.clear()
    },
    show() {
        VSCODE_FRAMEWORK_OUTPUT_CHANNEL!.show()
    },
    hide() {
        VSCODE_FRAMEWORK_OUTPUT_CHANNEL!.hide()
    },
    time(marker = 'default') {
        timeMarkers[marker] = Date.now()
    },
    timeEnd(marker = 'default') {
        timeMarkers[marker] = Date.now()
        if (!timeMarkers[marker]) {
            console.warn('No time marker', marker)
            return
        }

        // eslint-disable-next-line zardoy-config/@typescript-eslint/no-dynamic-delete
        delete timeMarkers[marker]
        appendOutput('log', marker, Date.now() - timeMarkers[marker]!)
    },
}
