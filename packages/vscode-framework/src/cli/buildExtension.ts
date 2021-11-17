import fs from 'fs'
import { join } from 'path'
import Debug from '@prisma/debug'
import { camelCase } from 'change-case'
import { watch } from 'chokidar'
import del from 'del'
import exitHook from 'exit-hook'
import fsExtra from 'fs-extra'
import { compilerOptions } from 'generated-module/build/ts-morph-utils'
import kleur from 'kleur'
import { Project } from 'ts-morph'
import { Except } from 'type-fest'
import { WebSocketServer } from 'ws'
import { BuildTargetType, Config, ExtensionBootstrapConfig } from '../config'
import { getFileHash } from '../util'
import { configurationTypeFile, runConfigurationGenerator } from './configurationFromType'
import { runEsbuild } from './esbuild/esbuild'
import { LauncherCLIParams, launchVscode as launchVscodeOuter } from './launcher'
import { generateAndWriteManifest } from './manifest-generator'
import { generateContributesTypes } from './commands/generateTypes'

const debug = Debug('vscode-framework:bulid-extension')

const ipcDebug = Debug('vscode-framework:ipc')

/** for ipc. used in extensionBootstrap.ts */
export type BootstrapConfig = ExtensionBootstrapConfig & {
    /** `undefined` means didn't enable server */
    webSocketPort: number | undefined
    debugWs: boolean
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
    debug('Building extension')
    debug({
        mode,
        outDir,
    })
    await del(
        Object.values(EXTENSION_ENTRYPOINTS).flatMap(jsOut => [join(outDir, jsOut), join(outDir, `${jsOut}.map`)]),
    )
    if (mode === 'production') {
        await buildExtension(params)
        return
    }

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
        stopEsbuild = (
            await buildExtension({
                ...params,
                async afterSuccessfulBuild(rebuildCount) {
                    if (rebuildCount === 0 && !stopEsbuild && params.launchVscodeParams) {
                        await launchVscode()
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

    const manifestPath = 'package.json'
    const watcher = watch([manifestPath, configurationTypeFile])
    const prevHashes = new Map<string, string>()
    const neededFileWasChanged = async (changedFilePath: string, neededPath: string) => {
        if (!changedFilePath.endsWith(neededPath)) return false
        const newHash = await getFileHash(neededPath)
        if (prevHashes.get(neededPath) === newHash) return false
        prevHashes.set(neededPath, newHash)
        return true
    }

    const onFileChange = async (path: string) => {
        if (await neededFileWasChanged(path, manifestPath)) {
            await restartBuild()
            console.log('[vscode-framework] Manifest updated.')
        }

        if (await neededFileWasChanged(path, configurationTypeFile)) {
            await runConfigurationGenerator(process.cwd())
            await restartBuild()
            console.log('[vscode-framework] Configuration updated.')
        }
    }

    watcher.on('change', onFileChange)
    watcher.on('add', onFileChange)
    watcher.on('unlink', async path => {
        // TODO also run typesGenerator
        if (path.endsWith(manifestPath))
            console.log(kleur.red('[vscode-framework] Manifest is missing! Return it back.'))
        // TODO! run typesGenerator configurationType.ts was removed, for now need to rerun start script
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
    // ensure always on top of function
    await fsExtra.ensureDir(outDir)

    // -> ASSETS
    // Pick icons from here https://github.com/microsoft/vscode-codicons/tree/main/src/icons
    /** should be absolute */
    const resourcesPaths = {
        from: join(process.cwd(), 'resources'),
        to: join(outDir, 'resources'),
    }
    // TODO watch assets dir
    if (fs.existsSync(resourcesPaths.to)) await fs.promises.unlink(resourcesPaths.to)

    if (fs.existsSync(resourcesPaths.from) && fs.statSync(resourcesPaths.from).isDirectory())
        await (mode === 'production'
            ? fsExtra.copy(resourcesPaths.from, resourcesPaths.to)
            : fs.promises.symlink(resourcesPaths.from, resourcesPaths.to, 'junction'))

    // -> MANIFEST
    const { generatedManifest, sourceManifest } =
        (await generateAndWriteManifest({
            outputPath: join(outDir, 'package.json'),
            overwrite: true,
            config,
            propsGeneratorsMeta: {
                mode,
                // TS is literally killing the target type!
                target: mode === 'development' ? ({ [target]: true } as any) : config.target,
                config,
            },
        })) ?? {}
    if (!generatedManifest) throw new Error('Extension manifest (package.json) is missing.')

    // -> POST MANIFEST CHECKS
    if (generatedManifest.extensionKind?.length === 0)
        // TODO move to the schema
        console.warn("Warning: extensionKind in manifest is set to [] which means your extension won't be launched")

    // -> GENERATE TYPES
    if (mode !== 'production' && !skipGeneratingTypes)
        await generateContributesTypes(
            {
                // commands can have additional generated variants
                commands: sourceManifest!.contributes.commands,
                // configuration don't have additional generated variants for now
                configuration: generatedManifest.contributes.configuration,
            },
            config,
        )

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

/** Check that entrypoint exists and `activate` function is exported. Not used for now, as it's slow */
const checkEntrypoint = (config: Config) => {
    // TODO
    // 1. default export is still fine
    // 2. warning: enforce to use export before const. otherwise it takes > 1s to check
    // 3. doesn't work with functions
    console.time('check')
    const { entryPoint } = config.esbuild
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
