---
'vscode-manifest': patch
---

BREAKING: Use TS compiler to ship code into NPM. It allows mocking of exported methods.
Remove `build/vscode-manifest-schema.js` file with default schema export, read `build/vscode-manifest-schema.json` file instead.
