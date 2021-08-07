# VSCode Framework

Framework for creating VSCode extensions.

## The Main Reason

I personally think that it's just tedious to maintain an average VSCode extension and there should be an easier way to do things.

<!-- The standard `vscode` module just slows me down. -->

## Usage

Install it: `yarn add github:zardoy/vscode-tools#build`

1. Set your `main` field of `package.json` to `out.js` (also don't forget to gitignore it)
2. Set your `watch` NPM script to `vscode-tools esbuild dev` (also NPM script `watch` should be your default task)
3. Create prepare script for generating commands like so: https://github.com/zardoy/github-manager/blob/main/scripts/prepare.ts

## Features

### Extension Commands

Instead of keeping your commands in sync with

1. Contribution points
2. Activation events

You can

1. Define your commands in a dedicated file (e.g. `src/commands.ts`):

```ts
// this is your source of truth. You edit manually any command metadata only here
export const commands = [
    {
        // command ID (should be short and UNIQUE)
        command: "fix-all",
        // command title should be verbose and in title-case
        title: "Fix all auto-fixable Problems",
        // optional, see below
        description: "Applies ESLint auto-fix resolutions to all fixable problems"
    }
]
```

2. Create a script to programmatically place them in `package.json` (let's say `scripts/prepare.ts`):

```ts
import { updatePackageJson } from "@zardoy/vscode-tools/cli"
import { commands } from "../src/commands";

updatePackageJson({
    commands: commands,
    where: "original",
})
```

1. After running the script, you'll get package.json updated.
TODO: better docs extract fields

#### About Description

Don't confuse `description` from commands above with description from VSCode's `Feature Contributes` tab:

![VSCode-Feature-Contributes](media/vscode-contribution-points.png)

#### About Keywords

Note, that VSCode doesn't support keywords for the commands, so

### CLI

WIP

### Environment Variables

See [Environment Variables](build/client.d.ts) that are injected.

To get them in intellisense create `globals.d.ts` file in your source root with `///<reference lib="">` at the top.

TODO: add `types` command

And also, what about having IDE-agnostic API?
