# VSCode Framework

<!-- > :fire: The fastest way to develop extensions for VSCode -->

Warning: still WIP, not all functionality are available.

- 💡 Not Boilerplated
- ⚡️ Hot Reload (WIP)
- 🔑 TypeScript Types from `package.json` Contribution Points
- 📦 Publish Production-ready Build with zero config
- 🚀 Use `console` methods in production (creates extension output for you)
- 🛠️ Verbose Configuration
- ⚙️ Use TypeScript type for `configuration` instead of schema in *package.json*

<!-- And even more: pnpm support, CI, [API wrappers](packages/vscode-extra/). -->

Note: highly experimental, `start` works, but `build` wasn't battle-tested yet.

## What is this?

This is a full-featured set of tools to develop [VSCode extensions](https://code.visualstudio.com/api) with speed and minimal friction.

<!-- The standard `vscode` module just slows me down. -->

## Usage

- Install it in your project: `npm i vscode-framework --dev`
- Read the [DOCS](./docs/)

## Brief Overview

```ts
import vscode from 'vscode'

export const activate = (ctx: vscode.ExtensionContext) => {
    ctx.subscriptions.push(
        vscode.commands.registerCommand('extension.command', () =>
            vscode.window.showInformationMessage(`Debug is ${vscode.workspace.getConfiguration(extension).get<true>('enableDebug') ? 'enabled' : 'disabled'}`),
        ),
    )
}
```

With this framework:

```ts
import vscode from 'vscode'
import { getExtensionSetting, registerExtensionCommand } from 'vscode-framework'

export const activate = () => {
    registerExtensionCommand('command', () =>
        vscode.window.showInformationMessage(`Debug is ${getExtensionSetting('enableDebug') ? 'enabled' : 'disabled'}`),
    )
}
```

## More Features

- access extension context anywhere via `extensionCtx` export

<!-- There is a hot reload feature, but you can manually restart editor with pressing <kdb>R</kbd> in console. -->
<!--
Don't confuse `description` from commands above with description from VSCode's `Feature Contributes` tab:

![VSCode-Feature-Contributes](media/vscode-contribution-points.png)

#### About Keywords

Note, that VSCode doesn't support keywords for the commands, so --> -->

## Why it was Created?

There are several things that I don't really liked, but one of the important parts was the boilerplated [generator-code](https://github.com/Microsoft/vscode-generator-code).

Also, web extensions [must be bundled](https://docs.microsoft.com/en-us/answers/questions/368286/vc-2015-2019-install-check.html) into a single file, so just let the included esbuild do all the work.
