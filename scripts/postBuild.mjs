//@ts-check
import fs from 'fs'
import { build } from 'esbuild'

// PATCH TS OUTPUT
const pathsToPatch = {
    'packages/vscode-framework/build/index.d.ts'(contents) {
        return contents.replace("RegularCommandsTypeToReplace: '';", '').replace("SettingsTypeToReplace: '';", '')
    },
    'packages/vscode-framework/build/framework/commands.d.ts'(contents) {
        return contents.replace(/RegularCommandsTypeToReplace/g, '[k in keyof RegularCommands]')
    },
    'packages/vscode-framework/build/framework/settings.d.ts'(contents) {
        return contents.replace(/"SettingsTypeToReplace"/g, 'keyof Settings')
    },
}

for (const [path, patch] of Object.entries(pathsToPatch)) {
    const contents = await fs.promises.readFile(path, 'utf-8')
    await fs.promises.writeFile(path, patch(contents), 'utf-8')
}

// COPY ASSETS FILES

await fs.promises.copyFile(
    'packages/vscode-manifest/src/generated/validate.js',
    'packages/vscode-manifest/build/generated/validate.js',
)

await fs.promises.copyFile(
    'packages/vscode-manifest/src/vscode-manifest-schema.json',
    'packages/vscode-manifest/build/vscode-manifest-schema.json',
)

// BUILD INJECT CODE

const { outputFiles } = await build({
    bundle: true,
    platform: 'node',
    format: 'cjs',
    entryPoints: ['packages/vscode-framework/src/cli/esbuild/consoleInject.ts'],
    outfile: 'packages/vscode-framework/build/cli/esbuild/consoleInject.js',
    write: false,
})

await fs.promises.writeFile(outputFiles[0].path, outputFiles[0].text.split('\n').slice(1).join('\n'), 'utf-8')
