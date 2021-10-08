import fs from 'fs'
import { join } from 'path'
import jsonfile from 'jsonfile'
import { modifyPackageJsonFile, modifyTsConfigJsonFile } from 'modify-json-file'
import { PackageJson, TsConfigJson } from 'type-fest'
import { getGithubRemoteInfo } from 'github-remote-info'
;(async () => {
    const fromMonorepo = (...p: string[]) => join(__dirname, 'packages', ...p)
    const packageTsconfigs = {
        dev: 'tsconfig.dev.json',
        prod: 'tsconfig.prod.json',
    }
    const packagesDirs = (await fs.promises.readdir(fromMonorepo())).filter(monorepoPackage => {
        const fromPackage = (...p: string[]) => join(__dirname, 'packages', monorepoPackage, ...p)
        if (!fs.existsSync(fromPackage('package.json'))) return false
        const packageJson: PackageJson = jsonfile.readFileSync(fromPackage('package.json'))
        if (packageJson.private || !packageJson.types) return false
        return true
    })
    console.log(packagesDirs)

    for (const monorepoPackage of packagesDirs) {
        const fromPackage = (...p: string[]) => join(__dirname, 'packages', monorepoPackage, ...p)
        // if (fs.existsSync(fromPackage(packageTsconfigName))) {
        //     console.warn(monorepoPackage, 'has tsconfig.json')
        // }
        for (const { path, tsconfig } of [
            {
                path: packageTsconfigs.dev,
                tsconfig: {
                    extends: `./${packageTsconfigs.prod}`,
                    compilerOptions: {
                        declarationMap: true,
                    },
                },
            },
            {
                path: packageTsconfigs.prod,
                tsconfig: {
                    extends: '@zardoy/tsconfig/node-lib',
                    compilerOptions: {
                        composite: true,
                        emitDeclarationOnly: true,
                        rootDir: 'src',
                        outDir: 'build',
                    },
                    include: ['src'],
                },
            },
        ] as Array<{
            path: string
            tsconfig: TsConfigJson
        }>)
            await Ojsonfile.writeFile(fromPackage(path), tsconfig, {
                spaces: 4,
            })
    }

    await modifyTsConfigJsonFile(join(__dirname, 'tsconfig.dev.json'), {
        references: packagesDirs.map(dir => ({ path: `packages/${dir}/${packageTsconfigs.dev}` })),
    })
    await modifyTsConfigJsonFile(join(__dirname, 'tsconfig.prod.json'), {
        references: packagesDirs.map(dir => ({ path: `packages/${dir}/${packageTsconfigs.prod}` })),
    })

    const readme = await fs.promises.readFile('./README.MD', 'utf-8')

    const { owner, name } = (await getGithubRemoteInfo('.'))!
    const githubBaseUrl = `https://github.com/${owner}/${name}/tree/main/packages/`

    const tableBody = packagesDirs
        .map(pkg => {
            const packageJson: PackageJson = jsonfile.readFileSync(join('packages', pkg, 'package.json'))
            const { name, description } = packageJson
            // eslint-disable-next-line zardoy-config/@typescript-eslint/restrict-template-expressions
            return `| [${name}](${githubBaseUrl}${pkg}) | ${description} | [![${name} version](https://img.shields.io/npm/v/${name}.svg?label=%20)](https://npmjs.com/${name}) |`
        })
        .join('\n')
    // TODO!

    const generatedTable = `
## Ecosystem
| Package | Description | Version |
| --- | --- | --- |
${tableBody}
    `
    await fs.promises.writeFile('./README.MD', readme.replace(/## Ecosystem.*(##)?/s, generatedTable), 'utf-8')
})()
