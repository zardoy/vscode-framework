// eslint-disable-next-line zardoy-config/import/no-useless-path-segments
export * from '.vscode-framework'

// type _ModuleGenerated = typeof import('.vscode-framework') extends Record<any, any> ? true : false
// type ModuleGenerated = _ModuleGenerated extends true ? true : false

// type ErrorNotGenerated = 'ERROR: Types needs to be generated. Run vscode-framework generate-types'

// export type Commands = ModuleGenerated extends true
//     ? import('.vscode-framework').Commands
//     : {
//           regular: ErrorNotGenerated
//       }

// export type Settings = ModuleGenerated extends true
//     ? import('.vscode-framework').Settings
//     : { [K in ErrorNotGenerated]: any }
