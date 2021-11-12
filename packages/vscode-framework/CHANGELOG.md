# vscode-framework

## 0.0.11

### Patch Changes

-   c1d8819: Fix critical regression where extensions were unable to launch because injected variable was removed. I knew that it might happen, but unforunately I updated snapshot of injected code carelessly

## 0.0.10

### Patch Changes

-   eeb0f89: BREAKING: use TS compiler to ship code into NPM. It allows mocking of exported methods
-   9ddebd3: fix: generated commands doesn't appear in generated types anymore
-   Updated dependencies [eeb0f89]
-   Updated dependencies [eeb0f89]
    -   vscode-extra@0.0.3
    -   vscode-manifest@0.0.6

## 0.0.9

### Patch Changes

-   2c96acc: Fix issues where vscode-framework couldn't be imported in foreign environments. This was done by adding a check if variable, that should be injected to the code later by the our bundler actually exists
