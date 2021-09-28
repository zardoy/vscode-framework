# VSCode Framework

<!-- > :fire: The fastest way to develop extensions for VSCode -->

Warning: still WIP, not all functionality are available.

- 💡 Not Boilerplated
- ⚡️ Hot Reload (WIP)
- 🔑 TypeScript Types from `package.json` Contribution Points
- 📦 Optimized Single File Build with zero config
- 🛠️ Configurable

And even more: painless <!-- pnpm support, CI, --> [API wrappers](packages/vscode-extra/).

## The Main Reason

I personally think that it's just tedious to maintain an average VSCode extension and there should be an easier way to do things. Also, I didn't like the boilerplated [generator-code](https://github.com/Microsoft/vscode-generator-code).

Also, web extensions [must be bundled](https://docs.microsoft.com/en-us/answers/questions/368286/vc-2015-2019-install-check.html) into a single file, just let esbuild do all work.

<!-- The standard `vscode` module just slows me down. -->

## Usage

Install it: `npm i vscode-framework`

This framework encourage you to store the minimal amount of information in `package.json` (Extension Manifest).

### Manifest Migration

- [ ] WIP

Command: `vscode-framework migrate`

This is interactive command, you can either run it or read what it does below (all steps are optional):

- `package.json` cleanup: remove `engines`, `main`, `repository` and other properties that can be generated at start/build time.
- Scripts in `package.json`:
  - Adds/proposes to change:
    - `start`: `vscode-framework start` – just run this script to launch extension
    - `build`: `vscode-framework build` – create optimized build (doesn't create `.vsix` for a moment)
- Creates config overrides

- [ ] But this command for now doesn't perform code migration, if you have big codebase you can wait until this feature is done.

### Extension Code

```ts
//📁 src/extension.ts
import vscode from 'vscode';
import { VscodeFramework, showQuickPick } from 'vscode-framework';

export const activate = (ctx: vscode.ExtensionContext) => {
    const framework = new VscodeFramework(ctx);

    framework.registerCommand('make-project-awesome', async () => {
        const packageManager = await showQuickPick([
            {
                label: 'Yarn (fast)',
                value: 'yarn1'
            },
            {
                label: 'NPM (faster)',
                value: 'npm'
            },
            {
                label: 'PNPM (the fastest)',
                value: 'pnpm'
            }
        ]);
        // Will be handled for you soon, but for now use snippet (also coming soon)
        if (packageManager === undefined) return;
        // will be printed in output pane
        console.log('Selected', packageManager);
    });
}
```

- `vscode-framework` reexports `vscode-extra`, which consists [useful methods](../vscode-extra) in additional to standard `vscode` module.

## Hot Reload

- [ ] Hot reload is coming soon, for now you can quickly reload window by pressing `CMD+R` in development window.
Or you can enable option `reloadWindow: true` in config.

### Repo Notes

- [ ] add postinstall hook with check for the file

For local development in this repo, generate schema validator. e.g. in `./packages/extension-manifest` run `generate-validator` NPM script.
It wasn't added to `postinstall`, to not bother you every time you install a dep, because generating takes some time.

### Config

To overwrite [default config](src/config.ts), you need to place config in of the [supported places](https://github.com/davidtheclark/cosmiconfig#cosmiconfig).

Example: `vscode-framework.config.js` in the root of your project:

```js
/** @type {import('vscode-framework/build/config').UserConfig} */
const config = {
    enableProposedApi: true
    openDevtools: true
}
module.exports = config
```

Unfortunately, cosmiconfig doesn't support `.mjs` extensions right now. ([issue](https://github.com/davidtheclark/cosmiconfig/issues/224))

### Development Workflow

I think you have noticed that it encourages to use `start` command instead of starting via *launch config*. That command is significantly faster because no debugger warmup needed, but you still want to use launch config with sources if debugger is needed.
But `launch` is a IDE-agnostic and you can even start extension without opening IDE.

<!-- There is a hot reload feature, but you can manually restart editor with pressing <kdb>R</kbd> in console. -->

### Tradeoffs

### No type-checking

> The fix is coming

Because we use ESBuild for blazing-fast compilation there is no type checking in console (but this is only temporary limitation).

For now you need to rely on your IDE.

TODO: debugger

#### About Description

TODO: rewrite

Don't confuse `description` from commands above with description from VSCode's `Feature Contributes` tab:

![VSCode-Feature-Contributes](media/vscode-contribution-points.png)

#### About Keywords

Note, that VSCode doesn't support keywords for the commands, so

### Environment Variables

See [Environment Variables](build/client.d.ts) that are injected.

<!-- To get them in intellisense create `globals.d.ts` file in your source root with `///<reference lib="">` at the top. -->

And also, what about having IDE-agnostic extension API?
