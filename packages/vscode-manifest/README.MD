# Extension Manifest

Contains TypeScript types, JSON schema and compiled validator for [VSCode Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest).

For types and methods, see [API](https://paka.dev/npm/vscode-manifest)

But note, that `ExtensionManifest` contains only manifest-specific fields and `ExtensionManifestRequired` contains all manifest-specific fields (with required ones) + required fields from [package.json type](https://github.com/sindresorhus/type-fest/blob/main/source/package-json.d.ts).

**In preview!** The extraction process is WIP. Not all fields of `contributes` are available, but it already contains all required top-level fields. Mainly used for validating to publish, but can also be used for displaying suggestions.

Schema is available (json is coming soon) via `require('vscode-manifest/build/vscode-manifest-schema.js')` as default export.

## How Extracted

> Obsolete, needs review

The extracted file from vscode sources is `vscode-manifest-schema.json` (raw). But most complete is `sourceType.ts`.

See [script](scripts/generateSchemaValidator.ts), that used for extraction

<!-- Approx proccess of generating types (desired, TBD):

- Extract code from with mocking `src/vs/workbench/services/extensions/common/extensionsRegistry.ts` target = `schema` export.
- `typescript-json-schema` on code (it generates JSON schema from TS)
- Manually Adjust Schema
- Generate TS (`src/sourceType.ts`) from schema via ``
- `scripts/generateSchemaValidator.ts`: Generate JSON schemas back for validation
- Generate TS for actual runtime validation
- the output file of this process should appear in `generated/extensionManifestValidator.ts` -->
