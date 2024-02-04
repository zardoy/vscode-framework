---
'vscode-framework': patch
'vscode-extra': patch
---

## Highlights

- a lot of fixes
- now extension reloading happens much quicker by default on code-only changes (added `partial` reload type)
- fixed: now possible to expose extension api, now possible to use esbuild plugins

### Misc

- node.js 16 is now minimal supported version
- codegen from Configuration type produces less errors
- when using configurationType, by default all fields are normalized to markdown-kind deeply e.g. `description` -> `markdownDescription`

#### Update esbuild and its config defaults

- fix build with jsonc-parser by default (change mainFields)
- fix adding plugins
<!-- - polyfill node modules for browser -->
- don't include development-only command registering & feature to production
- fix ability to override `define`
<!-- - inject __dirname when module: esnext -->

#### Revamp vscode launching

- `launch` command: Add `--web`, `--insiders` args.

<!-- Also, now now possible to pass launch args to vscode from `launch` command and config. -->

<!-- Now if you launch from insiders, we would gracefully launch insiders -->

#### Rename command `launch-config` to `init-launch`

And fix it when dir doesn't exist.

### Configuration type

<!-- Meta files location -->

### Code

#### Commands

- `registerExtensionCommand` now returns disposable
- `registerAllExtensionCommands` now returns array of disposables

- Now in first arg for command handlers we also pass: commandTitle
- `CommandHandler` type: Add first optional generic (string enum) to specify command type, which controls additional args

#### Settings

- Support `scope` arg in getting/setting functions.

- When setting value is object, new arg support getting merged config from all requested levels (global / workspace by default)

<!-- now it is possible to reference to other settings -->

### vscode-extra

<!-- Huge showQuickPick changes 1 2 -->
<!-- - fix `onDidChangeActive` usage -->
