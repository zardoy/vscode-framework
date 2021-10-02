//@ts-check

import { build } from 'esbuild'
import fs from 'fs'
import jsonfile from 'jsonfile'
import { dirname, join, extname } from 'path/posix'

import { globby } from 'globby'
import { fileURLToPath } from 'url'
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
    build({
        define: {
            __DEV__: `${mode === 'development'}`,
        },
        // watch: mode === 'development',
        platform: 'node',
        format: 'cjs',
        // @ts-ignore
        entryPoints,
        outdir: 'packages',
        banner: {
            js: `/* vscode-framework ${mode === 'production' ? 'build' : 'dev'} */`,
        },
    })
})().catch(err => {
    console.error(err)
    process.exit(1)
})
