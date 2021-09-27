import path from 'path'
import { pick } from 'lodash'

import { readFile } from 'jsonfile'
import { PackageJson } from 'type-fest'
import { resolve } from 'path'

export const getManifestPathFromRoot = () => resolve(process.cwd(), 'package.json')

export type MaybePromise<T> = T | Promise<T>

export const readModulePackage = async (
    module: string,
    packageJsonDir: string = process.cwd(),
): Promise<PackageJson> => {
    const modulePath = path.join(packageJsonDir, 'node_modules/', module, 'package.json')
    if (!modulePath) throw new Error(`${module} can't be found. Ensure that it is installed on ${packageJsonDir}`)
    return readFile(modulePath)
}

export const oneOf = <T>(value: T, matches: T[]) => matches.includes(value)
export const pickKeys = <T extends Record<string, any>, K extends keyof T>(array: T[], keys: K[]): Array<Pick<T, K>> =>
    array.map(object => pick(object, keys))
export const pickObject = <T extends Record<string, any>, K extends keyof T>(object: T, keys: K[]) => pick(object, keys)
