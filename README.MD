# VSCode Framework

Warning: still WIP, not all functionality are available.

- 💡 Not Boilerplated
- ⚡️ Hot Reload (WIP)
- 🔑 TypeScript Types from `package.json` Contribution Points
- 📦 Optimized Single File Build with zero config
- 🛠️ Configurable




## Ecosystem
| Package | Description | Version |
| --- | --- | --- |
| [vscode-extra](https://github.com/zardoy/vscode-framework/tree/main/packages/vscode-extra) | Contains additional useful methods extensions that aren't provided by vscode API | [![vscode-extra version](https://img.shields.io/npm/v/vscode-extra.svg?label=%20)](https://npmjs.com/vscode-extra) |
| [vscode-framework](https://github.com/zardoy/vscode-framework/tree/main/packages/vscode-framework) | undefined | [![vscode-framework version](https://img.shields.io/npm/v/vscode-framework.svg?label=%20)](https://npmjs.com/vscode-framework) |
| [vscode-manifest](https://github.com/zardoy/vscode-framework/tree/main/packages/vscode-manifest) | Contains TypeScript types, JSON schema and compiled validator for VSCode Extension Manifest | [![vscode-manifest version](https://img.shields.io/npm/v/vscode-manifest.svg?label=%20)](https://npmjs.com/vscode-manifest) |

## Development

When you clone this repo for the first time and run `pnpm i`, you need to wait before schema gets generated via postinstall script.

## TODO

- [ ] ensure extension work correctly in portable mode, use right TMP
