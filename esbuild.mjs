//@ts-check

import { build } from 'esbuild'
import fs from 'fs'
import jsonfile from 'jsonfile'
import { posix as pathPosix } from 'path'

import { globby } from 'globby'
import { fileURLToPath } from 'url'

const { dirname, join, extname } = pathPosix
;(async () => {
    // @ts-ignore
    const __dirname = dirname(fileURLToPath(import.meta.url))

    const fromPackages = (...p) => join(__dirname, 'packages', ...p)

    const packagesPath = fromPackages()
    const packagesDirs = (await fs.promises.readdir(packagesPath)).filter(monorepoPackage => {
        const fromPackage = (...p) => join(__dirname, 'packages', monorepoPackage, ...p)
        if (!fs.existsSync(fromPackage('package.json'))) return false
        const packageJson = jsonfile.readFileSync(fromPackage('package.json'))
        if (!packageJson.types) return false
        return true
    })
    /** @type{"development" | "production"} */
    // @ts-ignore
    const mode = process.argv[2]
    let entryPoints = {}
    for (const pkg of packagesDirs) {
        const srcPath = fromPackages(pkg, 'src')
        Object.assign(
            entryPoints,
            Object.fromEntries(
                (await globby(fromPackages(pkg, 'src'))).map(path => {
                    const ext = extname(path)
                    return [join(pkg, 'build', path.slice(srcPath.length + 1, -ext.length)), path]
                }),
            ),
        )
    }
    if (!mode) throw new TypeError('mode is not specified')
    await build({
        define: {
            __DEV__: `${mode === 'development'}`,
        },
        // watch: mode === 'development',
        platform: 'node',
        format: 'cjs',
        logLevel: 'info',
        // @ts-ignore
        entryPoints,
        outdir: 'packages',
        banner: {
            js: `/* vscode-framework ${mode === 'production' ? 'build' : 'dev'} */`,
        },
        plugins: [
            {
                name: 'writer',
                setup(build) {
                    build.onEnd(async ({ errors }) => {
                        if (errors.length) return
                        const pathsToPatch = {
                            'packages/vscode-framework/build/index.d.ts'(contents) {
                                return contents
                                    .replace("RegularCommandsTypeToReplace: '';", '')
                                    .replace("SettingsTypeToReplace: '';", '')
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
                    })
                },
            },
        ],
    })
})().catch(err => {
    console.error(err)
    process.exit(1)
})
