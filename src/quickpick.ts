import vscode from 'vscode';

export type VSCodeQuickPickItem<T> = vscode.QuickPickItem & {
    value: T;
};

// TODO move to vscode-tools. implement handleCancel: true
export const showQuickPick = async <T>(items: Array<VSCodeQuickPickItem<T>>, options: vscode.QuickPickOptions = {}) => {
    const selectedItem = await vscode.window.showQuickPick(items, options);
    return selectedItem?.value;
};
