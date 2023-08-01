import * as vscode from 'vscode'
import { Except } from 'type-fest'
import { pickObject } from './utils'

export type VSCodeQuickPickItem<T = string> = vscode.QuickPickItem & {
    value: T
    /** Optional flag indicating if this item is picked initially. */
    picked?: boolean
}

// TODO implement cancelllation token
// todo implement buttons
/** Shows a selection list. {@linkcode vscode.window.createQuickPick} wrapper. Enhenced version of {@linkcode vscode.window.showQuickPick} */
export const showQuickPick = async <T, M extends boolean = false>(
    items: Array<VSCodeQuickPickItem<T>>,
    options: Except<vscode.QuickPickOptions, 'onDidSelectItem'> & {
        canPickMany?: M
        onDidChangeActive?: (items: ReadonlyArray<VSCodeQuickPickItem<T>>) => any
        // eslint-disable-next-line @typescript-eslint/ban-types
    } & (M extends true ? { onDidChangeSelection?: (items: ReadonlyArray<VSCodeQuickPickItem<T>>) => any } : {}) = {},
): Promise<(M extends true ? T[] : T) | undefined> => {
    const quickPick = vscode.window.createQuickPick<VSCodeQuickPickItem<any>>()
    quickPick.items = items
    if (!options.canPickMany) {
        const preselectedItemIndex = quickPick.items.findIndex(({ picked }) => picked)
        if (preselectedItemIndex >= 0) quickPick.activeItems = [quickPick.items[preselectedItemIndex]!]
    }

    Object.assign(
        quickPick,
        pickObject(options, ['ignoreFocusOut', 'matchOnDescription', 'matchOnDetail', 'placeHolder', 'title']),
    )
    quickPick.placeholder = options.placeHolder
    quickPick.canSelectMany = options.canPickMany as boolean
    if ((options as any).onDidChangeSelection) quickPick.onDidChangeSelection((options as any).onDidChangeSelection)
    if (options.onDidChangeActive) quickPick.onDidChangeActive(options.onDidChangeActive)

    const selectedValues = await new Promise<(M extends true ? T[] : T) | undefined>(resolve => {
        quickPick.onDidHide(() => {
            resolve(undefined)
            quickPick.dispose()
        })
        quickPick.onDidAccept(() => {
            // align with default showQuickPick behavior
            if (quickPick.items.length === 0) return
            const { selectedItems } = quickPick
            resolve(options.canPickMany ? selectedItems?.map(item => item.value) : selectedItems[0]?.value)
            quickPick.hide()
        })
        quickPick.show()
    })

    return selectedValues
}
