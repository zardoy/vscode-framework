import { readJsonFile, readPackageJsonFile } from 'typed-jsonfile'
import { intersection } from 'lodash-es'
import execa from 'execa'
import { getMonorepoPackages } from './common'

const packagesDirs = await getMonorepoPackages()

const { devDependencies } = await readPackageJsonFile({ dir: '.' })
const rootDeps = Object.keys(devDependencies!)
const monorepoDeps: { [pkg: string]: string[] } = {}

const action = true

for (const packageDir of packagesDirs) {
    const dir = `packages/${packageDir}`
    const { dependencies, devDependencies } = await readPackageJsonFile({ dir })
    // dev only
    const packageDeps = [...Object.keys(devDependencies ?? {})]

    const commonDeps = intersection(rootDeps, packageDeps)
    if (commonDeps.length > 0) {
        console.warn('Redundant deps. Must be removed from', packageDir, commonDeps)
        if (action) await execa('pnpm', ['remove', ...commonDeps], { cwd: dir, stdio: 'inherit' })
    }

    // TODO remove them
    const packagesCommonDeps = intersection(Object.values(monorepoDeps).flat(1), packageDeps)
    if (packagesCommonDeps.length > 0) {
        console.warn('Duplicate devDeps', packageDir, packagesCommonDeps)
        // if (action) {
        //     await execa('pnpm', ['remove', ...packagesCommonDeps], { cwd: dir, stdio: 'inherit' })
        //     await execa('pnpm', ['add', '-DW', ...packagesCommonDeps], { stdio: 'inherit' })
        // }
    }

    monorepoDeps[packageDir] = packageDeps
}
