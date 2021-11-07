import vscode from 'vscode'
import { showQuickPick } from '.'
type MaybePromise<T> = T | Promise<T>

// TODO rewrite description
/**
 * Returns `vscode.workspace.workspaceFolders?.[0]`
 * In multiroot workspaces, shows quickPick with workspaces preselected:
 * - in case of open editor, workspace that holds opened file
 * - if no editor is open or open editor doesn't belong to current workspace first workspace
 * @argument prompt Pass false to not show quickPick and return preselected as described above
 * @returns `undefined` – in not workspaces & when select is canceled
 * @return `false` – when filter removed all workspaces
 */
export const getCurrentWorkspace = async ({
    showSelect = true,
    filterWorkspaces,
    showSelectIfOnlyOne = true,
}: {
    showSelect?: boolean
    filterWorkspaces?: (
        workspaceFolder: vscode.WorkspaceFolder,
    ) => MaybePromise<boolean> /** Applies only for workspaces */
    showSelectIfOnlyOne?: boolean
} = {}) => {
    if (!vscode.workspace.workspaceFolders) return undefined
    if (vscode.workspace.workspaceFolders.length === 1) return vscode.workspace.workspaceFolders[0]!

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
        workspacesToPick.map(workspace => ({
            label: workspace.name,
            value: workspace,
            picked: workspace.index === preselectedWorkspaceIndex,
        })),
    )
    return selectedWorkspace
}
