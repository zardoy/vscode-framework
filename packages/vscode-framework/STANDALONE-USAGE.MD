# Standalone Usage

`vscode-framework` can be installed globally and used where the this package itself can't be installed.

## `launch`

Launches VSCode extension in Development windows (similar to launch.json config, but much faster). Note, that it leaves contents of `package.json` untouched, you still need to launch compiler yourself.

## `update-manifest`

Updates original `package.json` of extension, means that it normalizes.

Can be used for normalization or verifying that everything is correct.
