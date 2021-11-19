// tsm formMonorepo.ts
import fs from 'fs'
import { join } from 'path'
import { getGithubRemoteInfo } from 'github-remote-info'
import jsonfile from 'jsonfile'
import { modifyPackageJsonFile, modifyTsConfigJsonFile } from 'modify-json-file'
import { PackageJson, TsConfigJson } from 'type-fest'
import { getMonorepoPackages } from './common'
;(async () => {
    const packageTsconfigs = {
        dev: 'tsconfig.dev.json',
        prod: 'tsconfig.prod.json',
    }
    const packagesDirs = await getMonorepoPackages()

    console.log(packagesDirs)

    for (const monorepoPackage of packagesDirs) {
        const fromPackage = (...p: string[]) => join('packages', monorepoPackage, ...p)
        for (const { path, tsconfig } of [
            {
                path: packageTsconfigs.dev,
                tsconfig: {
                    extends: `./${packageTsconfigs.prod}`,
                    compilerOptions: {
                        declarationMap: true,
                        sourceMap: true,
                    },
                },
            },
            {
                path: packageTsconfigs.prod,
                tsconfig: {
                    extends: '@zardoy/tsconfig/node-lib',
                    compilerOptions: {
                        composite: true,
                        // emitDeclarationOnly: true,
                        // isolatedModules: true,
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
            await jsonfile.writeFile(fromPackage(path), tsconfig, {
                spaces: 4,
            })
    }

    await modifyTsConfigJsonFile('tsconfig.dev.json', {
        references: packagesDirs.map(dir => ({ path: `packages/${dir}/${packageTsconfigs.dev}` })),
    })
    await modifyTsConfigJsonFile('tsconfig.prod.json', {
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
