# Extension Manifest

Extension manifest is package.json file for your VSCode extension. Learn more in [official reference](https://code.visualstudio.com/api/references/extension-manifest). Throughout the docs I'll be calling it simply *manifest*.

However, manifest that used with `vscode-framework` is differs.

## The Differences

1. More required fields: `categories`, `contributes`.

2. Mandatory fields. These fields are auto-generated at build-time, and should not be placed in manifest: `engines`, `repository`, `main`, `browser`. For example `engines` that is required in official reference is mandatory here and can be handled for you. They're handled by *props generators*.
<!-- TODO sync with schema and propsGenerators -->

1. No need to place IDs where they can be omitted. For example you don't need to repeat yourself and write the extension name in `contributes.command`, `contributes.menus` and so on. It improves maintainability and readability. It means that you can't now copy the command from here and place it in your keybinding. Use command palette for this! However, if don't like, you can disable it in config.
<!-- TODO config link -->

5. New allowed values:
- New activation events:
  - `onCommands`. Will replace with `onCommand:commandID` for every command from `contributes.command`

*vscode-framework* would validate your manifest every time you run `start` (or change it after start).
<!-- TODO screenshot -->

## IDs in contributions


## Manifest Migration

Instead of removing of modifying fields yourself, just run interactive command `vscode-framework migrate`, it will guide you through the steps described above.

It would also propose:

- to create/change scripts in `package.json`:
  - `start`: `vscode-framework start` – just run this script to launch extension
  - `build`: `vscode-framework build` – create optimized build (doesn't create `.vsix` for a moment)

- [ ] But this command for now doesn't perform code migration, if you have big codebase you can wait until this feature is done.
