//@ts-check
import { build } from 'esbuild'
import { dirname, join } from 'path'

import { fileURLToPath } from 'url'

// at a first glance – simple wrapper.

// @ts-ignore
const __dirname = dirname(fileURLToPath(import.meta.url))
const fromDirname = (...p) => join(__dirname, ...p)

export const run = async (watch = false) => {
    await build({
        bundle: true,
        watch,

        entryPoints: [fromDirname('./extensionBootstrap.ts')],
        platform: 'node',
        external: ['@hediet/node-reload', 'vscode'],
        outfile: fromDirname('../build/extensionBootstrap.js'),
    })
}
