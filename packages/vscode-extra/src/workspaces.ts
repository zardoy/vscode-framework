import vscode from 'vscode'
import { showQuickPick, VSCodeQuickPickItem } from '.'
type MaybePromise<T> = T | Promise<T>

// TODO rewrite description
/**
 * Returns `vscode.workspace.workspaceFolders?.[0]`
 * In multiroot workspaces, shows quickPick with workspaces preselected:
 * - in case of open editor, workspace that holds opened file
 * - if no editor is open or open editor doesn't belong to current workspace first workspace
 * @returns `undefined` – in not workspaces & when select is canceled
 * @return `false` – when filter removed all workspaces (even if only one workspace is opened)
 */
export const getCurrentWorkspace = async ({
    showSelect = true,
    filterWorkspaces,
    mapQuickPickItem = item => item,
    showSelectIfOnlyOne = true,
}: {
    /** Pass false to not show quickPick and return preselected as described in method description */
    showSelect?: boolean
    /** Applies only for all types of workspaces */
    filterWorkspaces?: (workspaceFolder: vscode.WorkspaceFolder) => MaybePromise<boolean>
    mapQuickPickItem?: <T extends VSCodeQuickPickItem<vscode.WorkspaceFolder>>(item: T) => T
    /** Applies only for multi-root workspaces */
    showSelectIfOnlyOne?: boolean
} = {}) => {
    if (!vscode.workspace.workspaceFolders) return undefined
    if (vscode.workspace.workspaceFolders.length === 1) {
        if (filterWorkspaces && !(await filterWorkspaces(vscode.workspace.workspaceFolders[0]!))) return false
        return vscode.workspace.workspaceFolders[0]!
    }

    const workspacesToPick = [...vscode.workspace.workspaceFolders]
    if (filterWorkspaces)
        for (let i = 0; i < workspacesToPick.length; i++) {
            if (await filterWorkspaces(workspacesToPick[i]!)) continue
            workspacesToPick.splice(i, 1)
            i--
        }

    if (workspacesToPick.length === 0) return false
    if (workspacesToPick.length === 1 && !showSelectIfOnlyOne) return workspacesToPick[0]!

    let preselectedWorkspaceIndex = workspacesToPick[0]!.index
    const activeEditor = vscode.window.activeTextEditor
    const activeDocumentUri = activeEditor?.document.uri
    if (activeEditor && activeEditor.viewColumn && activeDocumentUri!.scheme !== 'untitled') {
        const editorWorkspace = vscode.workspace.getWorkspaceFolder(activeDocumentUri!)
        if (editorWorkspace) preselectedWorkspaceIndex = editorWorkspace.index
    }

    if (!showSelect) return workspacesToPick.find(({ index }) => index === preselectedWorkspaceIndex)!
    const selectedWorkspace = await showQuickPick(
        workspacesToPick.map(workspace =>
            mapQuickPickItem({
                label: `$(file-directory) ${workspace.name}`,
                value: workspace,
                picked: workspace.index === preselectedWorkspaceIndex,
            }),
        ),
    )
    return selectedWorkspace
}
