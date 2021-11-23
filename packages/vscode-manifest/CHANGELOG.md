# vscode-manifest

## 0.0.8

### Patch Changes

-   5856aec: fix some contribution fields

## 0.0.7

### Patch Changes

-   65e1a03: fix: loose contributes schema. Contributes schema is not even full and also was not correct. Since I don't have source of truth I just temporarily simplifed typings. It obviously affects schema validatioin and typing

## 0.0.6

### Patch Changes

-   eeb0f89: BREAKING: use TS compiler to ship code into NPM. It allows mocking of exported methods
-   eeb0f89: BREAKING: Use TS compiler to ship code into NPM. It allows mocking of exported methods. Remove `build/vscode-manifest-schema.js` file with default schema export, read `build/vscode-manifest-schema.json` file instead.

## 0.0.5

### Patch Changes

-   Continue to publish on next tag. First changelog line!
