# Typed VSCode

> Generate types from contribution points of your extension manifest

> Note: this module is already bundled for [vscode-framework](https://npmjs.com/vscode-framework)

You can make your vscode extension codebase typed by automatically generating typescript types from these contribution points:

- `commands` list
- `configuration`

## Add to Your Project

```console
npm i typed-vscode@next -D
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

## Performance

Some logs from `test-integration`:

```console
Integration with Microsoft/vscode-eslint#7753f3a96d53b47ba49ea3428950f63fe8ddb415
  √ Variant native (189 ms)
  √ Variant bare (93 ms)
  √ Variant framework (96 ms)
Integration with Axosoft/vscode-gitlens#5dee2e97b08df1198c7afd8034476b277d613729
  √ Variant bare (360 ms)
Integration with microsoft/vscode-python#24fb1c22763663055655f237510f82148250bb48
  √ Variant bare (147 ms)
Integration with microsoft/vscode-docker#f59728db476e432752f5e3f1aed07e6341509b60
  √ Variant bare (199 ms)
Integration with redhat-developer/vscode-yaml#653baee6427ca37e3adaa689c15d27ed454d8c2d
  √ Variant bare (74 ms)
Integration with redhat-developer/vscode-xml#70024545886d9f9cc19bc804361192d5c00821ab
  √ Variant bare (100 ms)
  √ Variant bare (128 ms)
Integration with prettier/prettier-vscode#4a9ad9d27c23d200e8103a09bbb0f78cc5b0570b
  √ Variant bare (97 ms)
Integration with lostintangent/gistpad#3a0ac31478d8ecc845ad981ebe242f0bb9c98085
  √ Variant bare (50 ms)
```
