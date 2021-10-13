# Developer Notes

There are some other things that you should know.

## Compatibility

VSCode works on `node14`, which means [it doesn't support](https://github.com/evanw/esbuild/issues/1466#issuecomment-886347363) `node:` imports. Keep in mind that vscode-framework just removes `node:` prefix in such cases.
