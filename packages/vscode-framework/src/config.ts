import { BuildOptions } from 'esbuild'
import { PartialDeep } from 'type-fest'
import { ManifestType } from 'vscode-manifest'
import { ReadManifestOptions } from 'vscode-manifest/build/readManifest'
import type { propsGenerators, PropsGeneratorsMeta } from './cli/manifest-generator/propsGenerators'
import { MaybePromise } from './util'

// TODO allow to export callback from mjs and ts to LfauncherCLIParams to return

export interface Config {
    /** Override (extend) esbuild config for development and production */
    esbuildConfig: BuildOptions
    /** Effects only `build` command */
    target: Record<BuildTargetType, boolean>
    /** Category that will be used in `contibutes.commands` by default */
    defaultCategory: 'extensionName' | { custom: string }
    /**
     * What to do with `console` calls in your code?
     * - outputChannel - pipe to outputChannel with the name of your extension
     * TODO
     * - strip - completely remove all `console` statements
     * - false - disable feature. Leave console statements as-is (not recommended)
     */
    consoleStatements:
        | false
        // TODO implement
        // | {
        //       action: 'strip'
        //   }
        | {
              action: 'pipeToOutputChannel'
              useEmoji: boolean
          }
    /** Array of builtin props generators to disable. Pass `true` to retain original manifest, however in this case:
     * - `extendPropsGenerators` would run anyway
     * - IDs would resolved anyway
     */
    disablePropsGenerators: boolean | Array<keyof typeof propsGenerators>
    /** User propsGenerators. Not available in JSON config. See guide 09 */
    extendPropsGenerators: UserPropGenerator[]
    /** Configuration for auto-prepanding IDs in contribution */
    prependIds: ReadManifestOptions['prependIds']
    /** Development-only settings. They don't affect production build */
    development: {
        // TODO implies executable = insiders
        /** code- */
        executable: 'code' | 'code-insiders'
        /**
         *  effects `start` and `launch` commands. whether launch extension with other extensions disabled
         * - it's not possible to get rid of *extensions disabled* notification on every reload
         * - opening other folder/workspace will clear effect and enable extensions back
         */
        disableExtensions: boolean
        /** Adds `*` to activation events, which makes extension active at start */
        alwaysActivationEvent: boolean
        /** Set true to open Chrome DevTools at launch */
        openDevtools: boolean
        /**
         * Whether to launch wrapper with ipc or extension bundle directly (if false)
         * Note that false disables all features of vscode-extension development workflow
         */
        extensionBootstrap:
            | false
            | {
                  /**
                   * Takes effect only when consoleStatements.action == pipeToOutputChannel (by default).
                   *
                   * Whether to reveal outputChannel with logs at start (it still won't take focus)
                   */
                  // TODO
                  revealOutputChannel: boolean
                  // IPC
                  /** Whether to display all console calls in console from you launched the extension */
                  pipeConsole: boolean
                  /** Whether to close extension development window on development process exit (e.g. when you stop `vscode-framework start`) */
                  closeWindowOnExit: boolean
                  // TODO unify display-hint with hotReload
                  /**
                   * What to do when source is changed:
                   * - forced - automatically reload window with extension (drops unsaved data)
                   * - display-hint - display hint in statusbar, when extension source is changed and it's need to be reloaded
                   * - false - do nothing, but remeber you always can reload extension window with CTRL+R shortcut
                   */
                  forceReload: 'forced' | 'display-hint' | false
                  /** Add additional commands for development:
                   * - `runActiveDevelopmentCommand` - run command that is regestired with `registerActiveDevelopmentCommand`
                   * - `focusActiveDevelopmentExtensionOutput` - reveal output in extension
                   * They're in `VSCode Framework` category. Available only in extension development window
                   */
                  developmentCommands: boolean
                  hotReload:
                      | false
                      | {
                            /** Mocks `vscode` import with auto disposing */
                            automaticDispose: {
                                enabled: boolean
                                // TODO
                                ignore: string[]
                            }
                        }
              }
    }
}

export type UserConfig = PartialDeep<Config>

export type UserPropGenerator = (data: {
    /** Manifest that is generated after propsGenerators. Usually cleanued up */
    generatedManifest: ManifestType
    /** Original package.json, but with resolved IDs (if enabled) */
    sourceManifest: ManifestType
    /** Conrfig with all resolved values (uesr + default) */
    resolvedConfig: Config
    /** Meta info that was designed for builtin generators */
    meta: PropsGeneratorsMeta
}) => MaybePromise<
    | PartialDeep<ManifestType>
    | [
          PartialDeep<ManifestType>,
          {
              overwrite: boolean
          },
      ]
>

export type BuildTargetType = 'desktop' | 'web'

export type ExtensionBootstrapConfig = Exclude<Config['development']['extensionBootstrap'], false>

export const defaultConfig: Config = {
    esbuildConfig: {},
    defaultCategory: 'extensionName',
    target: { desktop: true, web: false },
    consoleStatements: {
        action: 'pipeToOutputChannel',
        // TODO
        useEmoji: false,
    },
    disablePropsGenerators: false,
    extendPropsGenerators: [],
    prependIds: {
        style: 'camelCase',
    },
    development: {
        executable: 'code',
        disableExtensions: true,
        openDevtools: false,
        alwaysActivationEvent: true,
        extensionBootstrap: {
            revealOutputChannel: false,
            closeWindowOnExit: true,
            pipeConsole: false,
            forceReload: 'display-hint',
            developmentCommands: true,
            hotReload: false,
        },
    },
}
