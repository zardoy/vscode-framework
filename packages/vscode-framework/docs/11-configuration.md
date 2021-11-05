# Configuration

> The feature is experimental, see limitations below

You must probably aware that JSON schema is used to define `configuration` (but with some additional fields), in simple cases you can continue to maintain the schema and typings will be generated for you. However, in case of large configurations you can save your time and use TypeScript type to maintain configuration instead.

## Switch to Typescript

- **remove** `configuration` contribution from *package.json*
- create `src/configurationType.ts` with exported `Configuration` **type** (not interface!)
- use basic types as you always would:
  - primitives, arrays
  - objects: use `{[x: string]: ...}` and **not Record**

To specify JSON Schema-specific props, use [annotations](https://github.com/YousefED/typescript-json-schema#annotations)
You can also look at more examples and tests in [TJS Repository](https://github.com/YousefED/typescript-json-schema)

- remember to include `@default` annotations for top-level props and JSDoc description for every prop

- your `generated.ts` will now point to this settings type (that's why it must be exported)

## Advantages

- Less to write (schemas in types are shorter)
- Use comments and TODOs right where your configuration lives
- Much shorter and readable (thus maintainable) configuration
- Reuse types (enums, or string unions in type)

### It's Slow

The generation process of schema is extremely slow. It can take up to 10 seconds to generate schema. For now, to mitigate this, generated schema is cached and should also be committed.

## Known Limitations

- migrate command
- object-map support
- no support for annotations for special props (`markdown*`)
- no warnings on unsupported annotations
- no TypeScript plugin for annotations
- no `typeof defaultConfig` strategy available
