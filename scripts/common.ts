import fs from 'fs'
import { join } from 'path'
import { PackageJson } from 'type-fest'
import { readPackageJsonFile } from 'typed-jsonfile'
export const getMonorepoPackages = async () => {
    const packagesDirs = await fs.promises.readdir('packages')
    const packages = [] as string[]
    for (const monorepoPackage of packagesDirs) {
        const fromPackage = (...p: string[]) => join('packages', monorepoPackage, ...p)
        if (!fs.existsSync(fromPackage('package.json'))) continue
        const packageJson: PackageJson = await readPackageJsonFile({ dir: fromPackage() })
        if (packageJson.private) continue
        packages.push(monorepoPackage)
    }

    return packages
}
