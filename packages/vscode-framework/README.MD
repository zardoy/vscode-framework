# VSCode Framework<sup>beta</sup>

<!-- > :fire: The fastest way to develop extensions for VSCode -->

**Full-featured set of tools to develop [VSCode extensions](https://code.visualstudio.com/api) with speed and minimal friction.**

- 💡 Not Boilerplated
- ⚡️ Auto Reload
- 🔑 TypeScript Types from `package.json` Contribution Points
- ⚙️ Use TypeScript type for `configuration` instead of schema in *package.json*
- 📦 Publish Production-ready Build with zero config
- 🚀 Use `console` methods in production (creates extension output for you)
- 🛠️ Highly Configurable

## Usage

- Install it in your project: `npm i vscode-framework -D`
<!-- TODO: autofix it via release action -->
- Read the [DOCS](https://github.com/zardoy/vscode-framework/tree/main/packages/vscode-framework/docs)

## Brief Overview

```ts
import * as vscode from 'vscode'

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
import * as vscode from 'vscode'
import { getExtensionSetting, registerExtensionCommand } from 'vscode-framework'

export const activate = () => {
    // typesafe. ready for refactors
    registerExtensionCommand('command', () =>
        vscode.window.showInformationMessage(`Debug is ${getExtensionSetting('enableDebug') ? 'enabled' : 'disabled'}`),
    )
}
```

## Even More Features

- access extension context anywhere via `extensionCtx` export

## Why it was Created?

There are several things that I don't really liked, but one of the important parts was the boilerplated [generator-code](https://github.com/Microsoft/vscode-generator-code).

Also, web extensions [must be bundled](https://docs.microsoft.com/en-us/answers/questions/368286/vc-2015-2019-install-check.html) into a single file, so just let the included esbuild do all the work.

<!-- The standard `vscode` module just slows me down. -->
