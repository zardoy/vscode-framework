import fs from 'fs'
import { join, resolve } from 'path'
import Debug from '@prisma/debug'
import fsExtra from 'fs-extra'
import kleur from 'kleur'
import { defaultsDeep } from 'lodash'
import { nanoid } from 'nanoid'
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

/** does watch only in `development` mode actually */
export const buildExtensionAndWatch = async (params: Parameters<typeof buildExtension>[0]) => {
    const { mode, outDir } = params
    // if (params.mode !== 'development') throw new Error('Watch is allowed only in development mode')
    debug('Building extension', {
        mode,
        outDir,
    })
    if (mode === 'production') {
        await buildExtension(params)
        return
    }

    let stopEsbuild: (() => void) | undefined
    const restartBuild = async () => {
        if (stopEsbuild) stopEsbuild()
        stopEsbuild = (await buildExtension(params)).stop
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

const getEnableBootstrap = (config: Config): Record<'bootstrap' | 'ipc', boolean> => {
    let bootstrap = false
    let ipc = false
    if (config.console === 'outputChannel') bootstrap = true
    if (config.development.extensionBootstrap !== false) {
        const values = Object.values(config.development.extensionBootstrap)
        const allDisabled = values.every(value => value === false)
        if (!allDisabled) {
            bootstrap = true
            ipc = true
        }
    }

    return {
        bootstrap,
        ipc,
    }
}

const buildExtension = async ({
    mode,
    target,
    config,
    outDir,
    launchVscodeParams,
}: {
    config: Config
    mode: ModeType
    target: BuildTargetType
    outDir: string
    /** Config for handling vscode launch, pass `false` to skip launching */
    launchVscodeParams: LauncherCLIParams | false
}) => {
    await fsExtra.ensureDir(outDir)

    // #region prepare bootstrap config
    const bootstrapPartsEnablement = launchVscodeParams && (getEnableBootstrap(config) as any)
    const enableBootstrap = bootstrapPartsEnablement !== false && bootstrapPartsEnablement.bootstrap
    const enableIpc = bootstrapPartsEnablement !== false && bootstrapPartsEnablement.ipc
    const serverIpcChannel = enableIpc ? `vscode-framework:server_${nanoid(5)}` : undefined

    // #endregion

    // -> MANIFEST
    const generatedManifest = await generateAndWriteManifest({
        outputPath: join(outDir, 'package.json'),
        overwrite: true,
        propsGeneratorsConfig:
            mode === 'development'
                ? {
                      alwaysActivationEvent: true, // TODO!
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
            if (mode !== 'development' || launchVscodeParams === false || rebuildCount > 0) return
            await launchVscode(outDir, {
                ...launchVscodeParams,
                // TS doesn't see target override ???
                // ...config,
                development: config.development,
                serverIpcChannel: serverIpcChannel ?? false,
            })
        },
        overrideBuildConfig: defaultsDeep(
            serverIpcChannel
                ? {
                      define: {
                          EXTENSION_BOOTSTRAP_CONFIG: JSON.stringify({
                              ...launchVscodeParams,
                              serverIpcChannel,
                          } as BootstrapConfig),
                      },
                  }
                : {},
            config.esbuildConfig,
        ),
    })
}

export const EXTENSION_ENTRYPOINTS = {
    node: 'extension-node.js',
    web: 'extension-web.js',
}
