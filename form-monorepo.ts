import fs from 'fs'
import jsonfile from 'jsonfile'
import { modifyTsConfigJsonFile } from 'modify-json-file'
import { join } from 'path'
import { PackageJson, TsConfigJson } from 'type-fest'
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
        if (!packageJson.types) return false
        return true
    })
    console.log(packagesDirs)

    for (const monorepoPackage of packagesDirs) {
        const fromPackage = (...p: string[]) => join(__dirname, 'packages', monorepoPackage, ...p)
        // if (fs.existsSync(fromPackage(packageTsconfigName))) {
        //     console.warn(monorepoPackage, 'has tsconfig.json')
        // }
        ;(
            [
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
            ] as {
                path: string
                tsconfig: TsConfigJson
            }[]
        ).forEach(({ path, tsconfig }) => {
            jsonfile.writeFile(fromPackage(path), tsconfig, {
                spaces: 4,
            })
        })
    }
    await modifyTsConfigJsonFile(join(__dirname, 'tsconfig.dev.json'), {
        references: packagesDirs.map(dir => ({ path: `packages/${dir}/${packageTsconfigs.dev}` })),
    })
    await modifyTsConfigJsonFile(join(__dirname, 'tsconfig.prod.json'), {
        references: packagesDirs.map(dir => ({ path: `packages/${dir}/${packageTsconfigs.prod}` })),
    })
})()
