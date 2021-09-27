# Extension Manifest

Extracted VSCode manifest (package.json fields) can be used for:

- enhance TypeScript types:

```ts
// types
import {} from ''
```

## Developer Notes

Types for extension's `package.json`.

The golden file is `vscode-manifest-schema.json`

Approx proccess of generating types (desired, TBD):

TODO: Obsolete, rewrite using Ajv instead of quicktype now

- Extract code from with mocking `src/vs/workbench/services/extensions/common/extensionsRegistry.ts` target = `schema` export.
- `typescript-json-schema` on code (it generates JSON schema from TS)
- Manually Adjust Schema
- Generate TS (`src/sourceType.ts`) from schema via `quicktype`
- `scripts/generateSchemaValidator.ts`: Generate JSON schemas back for validation
- Generate TS for actual runtime validation
- the output file of this process should appear in `generated/extensionManifestValidator.ts`
