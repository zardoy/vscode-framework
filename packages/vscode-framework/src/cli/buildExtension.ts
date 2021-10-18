import fs from 'fs'
import { join, resolve } from 'path'
import Debug from '@prisma/debug'
import fsExtra from 'fs-extra'
import kleur from 'kleur'
import { defaultsDeep } from 'lodash'
import { nanoid } from 'nanoid'
import nodeIpc from 'node-ipc'
import exitHook from 'exit-hook'
import { Except } from 'type-fest'
import { BuildTargetType, Config } from '../config'
import { LauncherCLIParams, launchVscode } from './launcher'
import { generateAndWriteManifest } from './manifest-generator'
import { runEsbuild } from './esbuild/esbuild'

const debug = Debug('vscode-framework:esbuild')

/** for ipc. used in extensionBootstrap.ts */
export type BootstrapConfig = Exclude<Config['development']['extensionBootstrap'], false> & {
    /** `undefined` means don't enable IPC */
    serverIpcChannel: string | undefined
}

export type ModeType = 'development' | 'production'

export type IpcEvents = {
    // app:reload not necessarily reloads window. it means changes happened and new file is on disk
    extension: 'app:close' | 'app:reload'
}

/** does watch only in `development` mode actually */
export const buildExtensionAndWatch = async (
    params: Except<Parameters<typeof buildExtension>[0], 'ipcEmitExtension' | 'afterBuild'>,
) => {
    const { mode, outDir } = params
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
    let isLaunched = false
    let ipcSocket
    const restartBuild = async () => {
        if (stopEsbuild) stopEsbuild()
        stopEsbuild = (
            await buildExtension({
                ...params,
                async afterBuild({ ipcChannel: serverIpcChannel }) {
                    // TODO web
                    if (isLaunched) return
                    if (params.launchVscodeParams)
                        await launchVscode(params.outDir, {
                            ...params.launchVscodeParams,
                            // TODO ...params.config
                            development: params.config.development,
                        })

                    isLaunched = true
                    if (!serverIpcChannel) return
                    debug('starting ipc', serverIpcChannel)
                    // if (isServerIpcStarted) throw new Error('IPC is already started. the first one must be closed')

                    // TODO don't use global nodeIpc
                    nodeIpc.config.id = serverIpcChannel
                    nodeIpc.config.silent = !debug.enabled
                    await new Promise<void>(resolve => {
                        nodeIpc.serve(resolve)
                        nodeIpc.server.start()
                    })
                    nodeIpc.server.on('connect', socket => {
                        ipcSocket = socket
                    })
                    nodeIpc.server.on('error', err => {
                        // investigate
                        throw err
                    })
                    console.log('ipc server started')
                    debug('ipc server started')

                    exitHook(() => {
                        // workbench.action.quit
                        // workbench.action.closeWindow
                        // search.action.focusActiveEditor
                        nodeIpc.server.emit('message', 'app:close')
                    })
                },
                ipcEmitExtension: event => {
                    // TODO! emit on package.json update
                    if (!ipcSocket) return
                    nodeIpc.server.emit(ipcSocket, 'message', event)
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

const buildExtension = async ({
    mode,
    target,
    config,
    outDir,
    ipcEmitExtension,
    afterBuild,
}: {
    config: Config
    mode: ModeType
    target: BuildTargetType
    outDir: string
    // TODO remove
    /** Config for handling vscode launch, pass `false` to skip launching */
    launchVscodeParams: LauncherCLIParams | false
    ipcEmitExtension?: (event: 'app:reload') => void | Promise<void>
    afterBuild?: (params: { ipcChannel?: string }) => void | Promise<void>
}) => {
    await fsExtra.ensureDir(outDir)

    // #region prepare bootstrap config
    /** An unique ID is required because multiple instances of extension can be launched */
    const serverIpcChannel = afterBuild && getEnableIpc(config) ? `vscode-framework:server_${nanoid(5)}` : undefined
    if (serverIpcChannel) await afterBuild!({ ipcChannel: serverIpcChannel })

    // #endregion

    // -> MANIFEST
    const generatedManifest = await generateAndWriteManifest({
        outputPath: join(outDir, 'package.json'),
        overwrite: true,
        propsGeneratorsConfig:
            mode === 'development'
                ? {
                      alwaysActivationEvent: true, // TODO! config
                      ...config,
                      // TS is literally killing the target type!
                      target: { [target]: true } as any,
                  }
                : {
                      alwaysActivationEvent: false,
                      ...config,
                  },
    })
    if (!generatedManifest) throw new Error('Extension manifest (package.json) is missing.')

    // -> POST MANIFEST CHECKS
    if (generatedManifest.extensionKind?.length === 0)
        // TODO also detect other cases
        console.warn("Warning: extensionKind in manifest is set to [] which means your extension won't be launched")

    // -> ASSETS
    // TODO

    // -> EXTENSION ENTRYPOINT
    return runEsbuild({
        target,
        mode,
        outDir,
        resolvedManifest: generatedManifest,
        async afterSuccessfulBuild(rebuildCount) {
            ipcEmitExtension?.('app:reload')
        },
        overrideBuildConfig: defaultsDeep(
            serverIpcChannel
                ? {
                      define: {
                          EXTENSION_BOOTSTRAP_CONFIG: {
                              // TODO!
                              developmentCommands: true,
                              ...config.development.extensionBootstrap,
                              serverIpcChannel,
                          } as BootstrapConfig,
                      },
                  }
                : {},
            config.esbuildConfig,
        ),
        // TODO handle other options
        injectConsole: config.console === 'outputChannel',
    })
}

export const EXTENSION_ENTRYPOINTS = {
    node: 'extension-node.js',
    web: 'extension-web.js',
}
