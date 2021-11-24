# VSCode Framework<sup>beta</sup>

- 💡 Not Boilerplated
- ⚡️ Auto Reload
- 🔑 TypeScript Types from `package.json` Contribution Points
- ⚙️ Use TypeScript type for `configuration` instead of schema in *package.json*
- 📦 Publish Production-ready Build with zero config
- 🚀 Use `console` methods in production (creates extension output for you)
- 🛠️ Highly Configurable

> Stability note: Docs and some tests are still WIP. The `build` script also need some work.

## Ecosystem
| Package | Description | Version |
| --- | --- | --- |
| [vscode-extra](https://github.com/zardoy/vscode-framework/tree/main/packages/vscode-extra) | Contains additional useful methods extensions that aren't provided by vscode API | [![vscode-extra version](https://img.shields.io/npm/v/vscode-extra.svg?label=%20)](https://npmjs.com/vscode-extra) |
| [vscode-framework](https://github.com/zardoy/vscode-framework/tree/main/packages/vscode-framework) | undefined | [![vscode-framework version](https://img.shields.io/npm/v/vscode-framework.svg?label=%20)](https://npmjs.com/vscode-framework) |
| [vscode-manifest](https://github.com/zardoy/vscode-framework/tree/main/packages/vscode-manifest) | Contains TypeScript types, JSON schema and compiled validator for VSCode Extension Manifest | [![vscode-manifest version](https://img.shields.io/npm/v/vscode-manifest.svg?label=%20)](https://npmjs.com/vscode-manifest) |
| [typed-vscode](https://github.com/zardoy/vscode-framework/tree/main/packages/typed-vscode) | Contains TypeScript types, JSON schema and compiled validator for VSCode Extension Manifest | [![typed-vscode version](https://img.shields.io/npm/v/typed-vscode.svg?label=%20)](https://npmjs.com/typed-vscode) |

## Development

Please use pnpm for development, it is easy to install: `npm i -g pnpm`

When you clone this repo *for the first time* and run `pnpm i`, you need to wait before schema gets generated via postinstall script.

## TODO

Api for extensions:

- [ ] ensure extension work correctly in portable mode, use right TMP
