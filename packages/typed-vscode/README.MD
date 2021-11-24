# Typed VSCode

> Generate types from contribution points of your extension manifest

> Note: this module is already bundled for [vscode-framework](https://npmjs.com/vscode-framework)

You can make your vscode extension codebase typed by automatically generating typescript types from these contribution points:

- `commands` list
- `configuration`

## Add to Your Project

```console
npm i typed-vscode -D
```

## `generate` command

You can also manually generate (or regenerate) types.

Flags:

- `--out` Output file, default: `src/generated.ts`
- `--target`

| target   | description                                                      |
| -------- | ---------------------------------------------------------------- |
| `native` | (default) Generates types with `@types/vscode` (augments module) |
| `bare`   | Generates only plain exported types (no augmentation)            |

- trimIds: wether to trim id part from contribution IDs = `false` (not applicable to `native` target)

> Note: vscode-framework has its own command: `vscode-framework generate`

Example: `typed-vscode --out extension/types.ts`

<!-- - `structure` -->

## `postinstallGenerateTypes` in package.json

`postinstallGenerateTypes` long property of package.json can be set to `false` to disable generating types after installation

## Config

We are using cosmiconfig to find your config files, also config values are merged from CLI.

Example config in package.json to override output file path:

```json
{
    "typed-vscode": {
        "target": "bare",
        "out": "extension/types.ts"
    }
}
```

Also the same config values are merged from cli (see example above)
