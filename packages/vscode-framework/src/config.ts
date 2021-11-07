import { BuildOptions } from 'esbuild'
import { Except } from 'type-fest'
import { PartialDeep } from 'type-fest'
import { ManifestType } from 'vscode-manifest'
import { ReadManifestOptions } from 'vscode-manifest/src/readManifest'
import type { propsGenerators, PropsGeneratorsMeta } from './cli/manifest-generator/propsGenerators'
import { MaybePromise } from './util'

// TODO allow to export callback from mjs and ts to LfauncherCLIParams to return

export interface Config {
    /** Override (extend) esbuild config for development and production */
    esbuild: EsbuildConfig
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
        // TODO-current investigate or remove
        /**
         * - false - ignore
         * - exit - kill development process
         * - reopen - reopen extension development window. may be annoying
         */
        // actionOnExtensionClose: 'exit' | 'reopen' | false
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
                  /**
                   * What to do when you save changed code:
                   * - forced - reload extension development window (drops unsaved data)
                   * - hot - NOT IMPLEMENTED YET
                   * - false - do nothing, but statusbar item will notify you to reload with CTRL+R shortcut
                   */
                  autoReload:
                      | {
                            type: 'forced'
                        }
                      | {
                            type: 'hot'
                            /** Mocks `vscode` import with auto disposing */
                            automaticDispose: {
                                enabled: boolean
                                // TODO
                                ignore: string[]
                            }
                        }
                      | false
                  /** Displays whether reload is needed as statusbar item in development window. Applied only when `autoReload.type != forced` */
                  statusbarReloadInfo: boolean
                  /** Add additional commands for development:
                   * - `runActiveDevelopmentCommand` - run command that is regestired with `registerActiveDevelopmentCommand`
                   * - `focusActiveDevelopmentExtensionOutput` - reveal output in extension
                   * They're in `VSCode Framework` category. Available only in extension development window
                   */
                  developmentCommands: boolean
              }
    }
}

export const defaultConfig: Config = {
    esbuild: {
        entryPoint: 'src/extension.ts',
    },
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
        // actionOnExtensionClose: 'exit',
        extensionBootstrap: {
            revealOutputChannel: false,
            closeWindowOnExit: true,
            pipeConsole: false,
            autoReload: {
                type: 'forced',
            },
            statusbarReloadInfo: true,
            developmentCommands: true,
        },
    },
}

type EsbuildConfig = Except<BuildOptions, 'entryPoints' | 'define'> & {
    entryPoint: string
    /** should be used instead of define. will prepend `process.env.` and stringify values */
    defineEnv?: Record<string, string | boolean | number>
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

export const getBootstrapFeature = <T>(
    config: Config,
    callback: (bootstrapConfig: ExtensionBootstrapConfig) => T,
): T | undefined => {
    if (!config.development.extensionBootstrap) return undefined
    return callback(config.development.extensionBootstrap)
}
