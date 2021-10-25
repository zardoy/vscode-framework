# Extension Code

For example if you declare `make-project-awesome` command, you can register it:

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

<!-- - `vscode-framework` reexports `vscode-extra`, which consists [useful methods](../vscode-extra) in additional to standard `vscode` module. -->

## Start Extension

<!-- TODO script -->

Let's finally start the extension with `vscode-framework start` command.

It will check and transform your manifest, to remove the differences we talk earlier. All files for your extension (including manifest) will be placed into `out/` directory. It will be `node_modules/.vscode-extension` in future.
You shouldn't modify anything here, as your changes will be lost, instead, gitignore this folder.

Then, it will start your extension build in watch mode. You can also edit manifest without needing to restart command.

### Launching

`start` command, by default opens desktop VSCode, however you can:

- Skip launching VSCode and only build extension, this can be useful if you want to use your launch config for debugging

To do this, append `--skip-launching` option, like so: `vscode-framework start --skip-launching`. But note, that with this command you can develop extension without opening IDE and creating `launch.json`. It will be slightly faster, because you don't use the builtin debugger in this way.

- Open extension in the web browser (see below)

### Web

You extension should support web. See [official guide](https://code.visualstudio.com/api/extension-guides/web-extensions) to decide wether you should test your extension in browser or not.

To test your extension on the web use `vscode-framework start --web` command. ~~By default~~ (will be default in future) it uses `@vscode/test-web` to launch your extension in the browser (read how it works in [VSCode guide](https://code.visualstudio.com/api/extension-guides/web-extensions#test-your-web-extension)). It means that it will download VSCode insiders to the `.vscode-test-web` folder (don't forget to gitignore it) and launch your extension in the chromium. ~~VSCode version and browser are configurable.~~

> Note: it also possible to launch web extension in desktop version: `vscode-framework start --web --web-desktop`

<!-- TODO: -->

### Environment Variables

See [Environment Variables](../build/client.d.ts) that are injected.

They are injected automatically when you write import anything from `vscode-framework`.

There are already `ctx.extensionMode` and `vscode.env.appHost` for checking mode and environment. **Don't use them!**

Use `process.env.NODE_ENV` and `process.env.PLATFORM` instead by using them unreachable code won't be bundled.

Examples:

```ts
if (process.env.NODE_ENV !== 'production') {
    // this code will be removed from production code
}
```

```ts
if (process.env.PLATFORM === 'node') {
    const depcheck = require('depcheck') as typeof import('depcheck')
    await depcheck.doSomeCrazyThing()
    await vscode.window.showInformationWindow(result)
}
```

<!-- TODO include more comprehensive example with commands -->

Here we're importing module that doesn't have browser support, in browser bundle (`extension-web.js`) the `depcheck` module won't be included.

> Note: we could also use `import` here but since VSCode doesn't support ESM it doesn't matter for now

<!-- To get them in intellisense create `globals.d.ts` file in your source root with `///<reference lib="vscode-framework/build/client">` at the top. -->

## TypeChecking

<!-- > The fix is coming -->

You might noticed the speed of bundling. This is because esbuild doesn't perform type-checking of your project. But don't worry this affects only development workflow, with `build` command it will perform typechecking by using `tsc` from your project, but only if you have `tsconfig.json` (but not jsconfig) at the root. You can also pass `--skip-typechecking` to disable it.

<!-- ## Hot Reload -->
## Reload

<!-- Every time you hit save in your  -->

- [ ] Hot reload is coming soon, for now you can quickly reload the development window by pressing `CMD+R` in it.
Or you can enable option `reloadWindow: true` in config.
