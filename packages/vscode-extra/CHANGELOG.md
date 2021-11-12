# vscode-extra

## 0.0.4

### Patch Changes

-   bcbce6d: add mapQuickPickItem option to getCurrentWorkspace
-   bcbce6d: BREAKING: filterWorkspaces now applies for single-root workspaces and returns false if filter returned false (getCurrentWorkspace method)

## 0.0.3

### Patch Changes

-   eeb0f89: BREAKING: use TS compiler to ship code into NPM. It allows mocking of exported methods

## 0.0.2

### Patch Changes

-   New `showQuickPick` and `getCurrentWorkspace` API.
-   `VSCodeQuickPickItem` now has generic type `string` by default
