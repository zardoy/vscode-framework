import fs from 'fs'
import { join } from 'path'
import Debug from '@prisma/debug'
import { camelCase } from 'change-case'
import exitHook from 'exit-hook'
import fsExtra from 'fs-extra'
import { compilerOptions } from 'generated-module/build/ts-morph-utils'
import kleur from 'kleur'
import { defaultsDeep } from 'lodash'
import { nanoid } from 'nanoid'
import { Server as IpcServer } from 'net-ipc'
import { Project } from 'ts-morph'
import { Except } from 'type-fest'
import { BuildTargetType, Config, ExtensionBootstrapConfig } from '../config'
import { runEsbuild } from './esbuild/esbuild'
import { LauncherCLIParams, launchVscode } from './launcher'
import { generateAndWriteManifest } from './manifest-generator'
import { newTypesGenerator } from './typesGenerator'
declare const __DEV__: boolean

const debug = Debug('vscode-framework:bulid-extension')

const ipcDebug = Debug('vscode-framework:ipc')

/** for ipc. used in extensionBootstrap.ts */
export type BootstrapConfig = ExtensionBootstrapConfig & {
    /** `undefined` means don't enable IPC */
    serverIpcChannel: string | undefined
    debugIpc: boolean
}

/** Build mode.
 * - development - started with `start` command
 * - production - started with `build` command
 */
export type ModeType = 'development' | 'production'

export type IpcEvents = {
    // app:reload not necessarily reloads window. it means changes happened and new file is on disk
    extension: 'action:close' | 'action:reload'
}

/** does watch only in `development` mode actually */
export const startExtensionDevelopment = async (
    params: Except<Parameters<typeof buildExtension>[0], 'afterSuccessfulBuild'> & {
        /** Config for handling vscode launch, pass `false` to skip launching */
        launchVscodeParams: LauncherCLIParams | false
    },
) => {
    const { mode, outDir, config } = params
    // if (params.mode !== 'development') throw new Error('Watch is allowed only in development mode')
    debug('Building extension')
    debug({
        mode,
        outDir,
    })
    if (mode === 'production') {
        await buildExtension(params)
        return
    }

    // TODO! why do we need to stop esbuild?
    let stopEsbuild: (() => void) | undefined

    // #region IPC
    /** An unique ID is required because extensions can be launched */
    const serverIpcChannel = getEnableIpc(config) ? `vscode-framework:${nanoid(5)}` : undefined
    const server = new IpcServer({
        path: serverIpcChannel,
        max: 1,
    })
    const sendMessage = (message: IpcEvents['extension']) => {
        // we're not logging failures since it's common to have errors on load
        // TODO fix this violation
        server.connections[0]?.send(message)
    }

    server.on('ready', () => {
        ipcDebug('server started')
    })
    server.on('connect', () => {
        ipcDebug('connected to extension')
    })
    let skipSendExtensionClose = false
    server.on('disconnect', (_client, reason) => {
        // ipcDebug('disconnected from extension')
        console.log('Extension disconnected', reason)
        // const { actionOnExtensionClose } = config.development
        // if (actionOnExtensionClose === false) return
        // if (actionOnExtensionClose === 'exit') {
        //     skipSendExtensionClose = true
        //     console.log('Extension development window ');
        //     process.exit(0)
        // } else if (actionOnExtensionClose === 'reopen') {

        // }
    })
    exitHook(() => {
        if (skipSendExtensionClose) {
            skipSendExtensionClose = false
            return
        }

        sendMessage('action:close')
    })
    void server.start()
    const extensionBootstrapConfig: BootstrapConfig | false = serverIpcChannel
        ? {
              ...(config.development.extensionBootstrap as ExtensionBootstrapConfig),
              serverIpcChannel,
              debugIpc: ipcDebug.enabled,
          }
        : false
    // #endregion
    const restartBuild = async () => {
        if (stopEsbuild) stopEsbuild()
        stopEsbuild = (
            await buildExtension({
                ...params,
                async afterSuccessfulBuild(rebuildCount) {
                    if (rebuildCount === 0) {
                        if (params.launchVscodeParams)
                            await launchVscode(outDir, {
                                ...params.launchVscodeParams,
                                // TODO ...params.config
                                development: config.development,
                            })
                        return
                    }

                    sendMessage('action:reload')
                },
                define: {
                    EXTENSION_BOOTSTRAP_CONFIG: extensionBootstrapConfig,
                },
            })
        ).stop
    }

    await restartBuild()
    let throttled = false
    const manifestPath = './package.json'
    // it would still restart esbuild on ctrl+s on file
    const manifestWatcher = fs.watch(manifestPath, async () => {
        if (throttled) return
        throttled = true
        setTimeout(() => {
            throttled = false
        }, 200)
        if (fs.existsSync(manifestPath)) {
            await restartBuild()
            // investigate clearing console here

            console.log('[vscode-framework] Manifest updated.')
        } else {
            console.log(kleur.red('[vscode-framework] Manifest is missing! Return it back.'))
        }
    })
    return {
        manifestWatcher,
        stopEsbuild,
    }
}

const getEnableIpc = (config: Config): boolean => {
    if (config.development.extensionBootstrap !== false) {
        const values = Object.values(config.development.extensionBootstrap)
        const allDisabled = values.every(value => value === false)
        if (!allDisabled) return true
    }

    return false
}

/** build JS output whenever manifest changes */
export const buildExtension = async ({
    mode,
    target,
    config,
    outDir,
    define,
    skipGeneratingTypes,
    ...bundlerParams
}: {
    config: Config
    mode: ModeType
    target: BuildTargetType
    outDir: string
    skipGeneratingTypes: boolean
    define?: Record<string, any>
} & Pick<Parameters<typeof runEsbuild>[0], 'afterSuccessfulBuild'>) => {
    await fsExtra.ensureDir(outDir)

    // -> MANIFEST
    const generatedManifest = await generateAndWriteManifest({
        outputPath: join(outDir, 'package.json'),
        overwrite: true,
        config,
        propsGeneratorsMeta: {
            mode,
            // TS is literally killing the target type!
            target: mode === 'development' ? ({ [target]: true } as any) : config.target,
            config: config.development,
        },
    })
    if (!generatedManifest) throw new Error('Extension manifest (package.json) is missing.')

    // -> POST MANIFEST CHECKS
    if (generatedManifest.extensionKind?.length === 0)
        // TODO also detect other cases
        console.warn("Warning: extensionKind in manifest is set to [] which means your extension won't be launched")

    // -> ASSETS
    // TODO

    if (mode !== 'production' && !skipGeneratingTypes) await newTypesGenerator(generatedManifest)

    // -> EXTENSION ENTRYPOINT
    return runEsbuild({
        target,
        mode,
        outDir,
        resolvedManifest: generatedManifest,
        defineEnv: {
            IDS_PREFIX: config.prependIds
                ? config.prependIds.style === 'camelCase'
                    ? camelCase(generatedManifest.name)
                    : generatedManifest.name
                : undefined,
            ...define,
        },
        config,
        // TODO handle other options
        injectConsole: config.consoleStatements !== false && config.consoleStatements.action === 'pipeToOutputChannel',
        ...bundlerParams,
    })
}

export const EXTENSION_ENTRYPOINTS = {
    node: 'extension-node.js',
    web: 'extension-web.js',
}

/** Check that entrypoint exists and `activate` function is exported */
export const checkEntrypoint = (config: Config) => {
    // TODO
    // 1. default export is still fine
    // 2. warning: enforce to use export before const. otherwise it takes > 1s to check
    // 3. doesn't work with functions
    console.time('check')
    const { entryPoint } = config.esbuildConfig
    const project = new Project({
        skipAddingFilesFromTsConfig: true,
        compilerOptions,
    })
    const source = project.addSourceFileAtPath(entryPoint)
    // TODO fancy errors
    if (!source.getVariableDeclarationOrThrow('activate').isExported())
        throw new Error("activate function isn't exported")

    console.timeEnd('check')
}
