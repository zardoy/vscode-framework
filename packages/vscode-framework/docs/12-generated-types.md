# Generated Types

Types are required to make your code work with vscode-framework. So there are generated in `postinstall` script of vscode-framework e.g. when you install this framework or perform clean install in project that have this framework in dependencies. File with generated types will be created as `src/generated.ts`

By default generated types are usable with `vscode-framework`.

<!-- TODO don't generate types if no src/ -->

**However**, you can use `vscode-framework` to generate types for with `@types/vscode` or for manually importing them in your code (see `typed-vscode` package).
