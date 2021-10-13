# Config

To overwrite [default config values](src/config.ts), you need to place config in of the [supported places](https://github.com/davidtheclark/cosmiconfig#cosmiconfig).

Example: `vscode-framework.config.js` in the root of your project:

```js
/** @type {import('vscode-framework/build/config').UserConfig} */
const config = {
    openDevtools: true
}
module.exports = config
```

Unfortunately, cosmiconfig doesn't support `.mjs` extensions right now. ([issue](https://github.com/davidtheclark/cosmiconfig/issues/224))

If you need to override entry point of the extension, use this config:

```json
{
    "esbuildConfig": {
        "entryPoints": ["src/extension.ts"]
    }
}
```

### Allow IDs

In some fields like `contributes.menus` it is possible to reference and disable commands of other external extensions (but not builtin) such as `errorLens.copyProblemMessage`.

<!-- TODO describe how to disable -->
