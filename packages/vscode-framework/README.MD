# VSCode Framework

<!-- > :fire: The fastest way to develop extensions for VSCode -->

Warning: still WIP, not all functionality are available.

- 💡 Not Boilerplated
- ⚡️ Hot Reload (WIP)
- 🔑 TypeScript Types from `package.json` Contribution Points
- 📦 Publish Production-ready Build with zero config
- 🚀 Use `console.log` in production (creates extension output for you)
- 🛠️ Configurable

And even more: painless <!-- pnpm support, CI, --> [API wrappers](packages/vscode-extra/).

## What is this?

This is a full-featured set of tools to develop [VSCode extensions](https://code.visualstudio.com/api) with speed and minimal friction.

<!-- The standard `vscode` module just slows me down. -->

## Usage

- Install it in your project: `npm i -D vscode-framework`
- Read the [DOCS](./docs/01-extension-manifest.md)

<!-- There is a hot reload feature, but you can manually restart editor with pressing <kdb>R</kbd> in console. -->

<!-- #### About Description

TODO: rewrite

Don't confuse `description` from commands above with description from VSCode's `Feature Contributes` tab:

![VSCode-Feature-Contributes](media/vscode-contribution-points.png)

#### About Keywords

Note, that VSCode doesn't support keywords for the commands, so -->

## Why it was Created?

There are several things that I don't really liked, but one of the important parts was the boilerplated [generator-code](https://github.com/Microsoft/vscode-generator-code).

Also, web extensions [must be bundled](https://docs.microsoft.com/en-us/answers/questions/368286/vc-2015-2019-install-check.html) into a single file, so just let the included esbuild do all the work.
