import vscode from 'vscode'

export type VSCodeQuickPickItem<T> = vscode.QuickPickItem & {
    value: T
}

// TODO implement handleCancel: true
/** Shows a selection list. {@linkcode vscode.window.showQuickPick} wrapper. */
export const showQuickPick = async <T, M extends boolean = false>(
    items: Array<VSCodeQuickPickItem<T>>,
    options: vscode.QuickPickOptions & { canPickMany?: M } = {},
): Promise<M extends true ? T[] : T> => {
    const selectedItem = await vscode.window.showQuickPick(items, options)

    return Array.isArray(selectedItem) ? selectedItem?.map(item => item.value) : (selectedItem?.value as any)
}
