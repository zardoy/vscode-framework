//@ts-check
import fs from 'fs'

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
// TODO! combine with incremental
for (const [path, patch] of Object.entries(pathsToPatch)) {
    const contents = await fs.promises.readFile(path, 'utf-8')
    await fs.promises.writeFile(path, patch(contents), 'utf-8')
}
