import fs from 'fs'
import { join } from 'path'
import Debug from '@prisma/debug'
import { watch } from 'chokidar'
import exitHook from 'exit-hook'
import kleur from 'kleur'
import { Except } from 'type-fest'
import { WebSocketServer } from 'ws'
import { Config, ExtensionBootstrapConfig } from '../../config'
import { getFileHash, MaybePromise } from '../../util'
import {
    cachedGeneratedConfigurationPath,
    configurationTypeFile,
    runConfigurationGenerator,
} from '../configurationFromType'
import { LauncherCLIParams, launchVscode as launchVscodeOuter } from '../launcher'
import { buildExtension } from './build'

const debug = Debug('vscode-framework:start')
const ipcDebug = Debug('vscode-framework:ipc')

/** for ipc. used in extensionBootstrap.ts */
export type BootstrapConfig = ExtensionBootstrapConfig & {
    /** `undefined` means didn't enable server */
    webSocketPort: number | undefined
    debugWs: boolean
}
export type IpcEvents = {
    // app:reload not necessarily reloads window. it means changes happened and new file is on disk
    extension: 'action:close' | 'action:reload'
}

/** build extension in `development` mode and watch for changes. reuses `build` command */
export const startExtensionDevelopment = async (
    params: Except<Parameters<typeof buildExtension>[0], 'afterSuccessfulBuild' | 'mode'> & {
        /** Config for handling vscode launch, pass `false` to skip launching */
        launchVscodeParams: LauncherCLIParams | false
    },
) => {
    const { outDir, config } = params

    // TODO why do we need to stop esbuild?
    let stopEsbuild: (() => void) | undefined

    // #region Spin up WebSocket
    const wss = getEnableIpc(config)
        ? new WebSocketServer({
              // pick next available port
              port: 0,
          })
        : undefined
    let extensionBootstrapConfig: BootstrapConfig | false = false
    let activeWebSocket: import('ws') | undefined
    const sendMessage = (message: IpcEvents['extension']) => {
        // we're not logging failures since it's common to have errors on load
        // TODO fix this violation
        activeWebSocket?.send(message)
    }

    if (wss) {
        // wait until ws is ready
        await new Promise<void>(resolve => {
            wss.once('listening', resolve)
        })
        console.log('WebSocket server ready!')
        wss.on('connection', ws => {
            console.log('Extension connected')
            if (activeWebSocket) {
                console.warn('Warning: new extension connected, disconnecting previous extension')
                activeWebSocket.close()
            }

            activeWebSocket = ws
            ws.on('close', () => {
                activeWebSocket = undefined
            })
        })
        const wsLocalhostPort = (wss.address() as { port: number }).port
        extensionBootstrapConfig = {
            ...(config.development.extensionBootstrap as ExtensionBootstrapConfig),
            webSocketPort: wsLocalhostPort,
            debugWs: ipcDebug.enabled,
        }
        exitHook(() => {
            // ensure that we close vscode only when process exits, but not when connection is lost
            sendMessage('action:close')
        })
    }
    // #endregion

    const launchVscode = async () => {
        if (!params.launchVscodeParams) return
        await launchVscodeOuter(outDir, {
            ...params.launchVscodeParams,
            // TODO ...params.config
            development: config.development,
        })
    }

    const restartBuild = async () => {
        if (stopEsbuild) stopEsbuild()
        stopEsbuild = (await buildExtension({
            mode: 'development',
            ...params,
            async afterSuccessfulBuild(rebuildCount) {
                if (rebuildCount === 0 && !stopEsbuild && params.launchVscodeParams) {
                    await launchVscode()
                    return
                }

                sendMessage('action:reload')
            },
            defineEnv: {
                EXTENSION_BOOTSTRAP_CONFIG: extensionBootstrapConfig,
            },
        }))!.stop
    }

    // WATCHER
    const watchedFiles = {
        manifest: 'package.json',
        configurationType: join(process.cwd(), configurationTypeFile),
        config: 'vscode-framework.config.js',
    }
    // TODO resources couldn't be watched since chokidar locks would lock it
    // const resourcesPath = 'resources'
    // can cause issues, especially EPRM on win. filespy should fix it
    const watcher = watch(Object.values(watchedFiles))
    const prevHashes = new Map<string, string>()
    const neededFileWasChanged = async (changedFilePath: string, neededPath: string) => {
        if (changedFilePath !== neededPath) return false
        const newHash = await getFileHash(neededPath)
        if (prevHashes.get(neededPath) === newHash) return false
        prevHashes.set(neededPath, newHash)
        return true
    }

    let lastRestart = null as null | number
    let firstManifestChange = true
    const onFileChange = async (path: string) => {
        const restartBuildFromWatcher = async (reason: string | undefined) => {
            const now = Date.now()
            // 50ms throttle
            if (lastRestart && now - lastRestart < 50) return
            lastRestart = now
            if (reason) console.log(`[vscode-framework] ${reason}.`)
            await restartBuild()
        }

        const fileChangedAction: Record<keyof typeof watchedFiles, () => MaybePromise<void>> = {
            async configurationType() {
                await runConfigurationGenerator(process.cwd())
                await restartBuildFromWatcher('Configuration type updated')
            },
            async manifest() {
                await restartBuildFromWatcher(firstManifestChange ? undefined : 'Manifest updated')
                if (!firstManifestChange) firstManifestChange = false
            },
            async config() {
                await restartBuildFromWatcher(`${watchedFiles.config} updated`)
            },
        }

        for (const [key, runAction] of Object.entries(fileChangedAction))
            if (await neededFileWasChanged(path, watchedFiles[key])) {
                debug('File changed:running action', key)
                await runAction()
                break
            }
    }

    watcher
        .on('change', onFileChange)
        .on('add', onFileChange)
        .on('unlink', async path => {
            if (path === watchedFiles.manifest)
                console.log(kleur.red('[vscode-framework] Manifest is missing! Return it back.'))

            if (await neededFileWasChanged(path, watchedFiles.configurationType)) {
                // remove generated file
                if (fs.existsSync(cachedGeneratedConfigurationPath))
                    await fs.promises.unlink(cachedGeneratedConfigurationPath)
                // TODO-low rerun only manifest participant
                await restartBuild()
            }
        })

    return {
        watcher,
        stopEsbuild,
        /** Would launch vscode, if connection not found */
        async restartCommand() {
            if (activeWebSocket) sendMessage('action:reload')
            else await launchVscode()
        },
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
