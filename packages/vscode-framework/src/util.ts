import fs from 'fs'
import crypto from 'crypto'
import { join } from 'path'
import { pick } from 'lodash'

import { readFile } from 'jsonfile'
import { PackageJson } from 'type-fest'

export const getManifestPathFromRoot = () => join(process.cwd(), 'package.json')

export type MaybePromise<T> = T | Promise<T>

export const readModulePackage = async (
    module: string,
    packageJsonDir: string = process.cwd(),
): Promise<PackageJson> => {
    const modulePath = join(packageJsonDir, 'node_modules/', module, 'package.json')
    if (!modulePath) throw new Error(`${module} can't be found. Ensure that it is installed on ${packageJsonDir}`)
    return readFile(modulePath)
}

export const oneOf = <T>(value: T, matches: T[]) => matches.includes(value)
export const pickKeys = <T extends Record<string, any>, K extends keyof T>(array: T[], keys: K[]): Array<Pick<T, K>> =>
    array.map(object => pick(object, keys))
export const pickObject = <T extends Record<string, any>, K extends keyof T>(object: T, keys: K[]) => pick(object, keys)

export const ensureArray = <T>(arg: T | T[]): T[] => (Array.isArray(arg) ? arg : [arg])

export const getFileHash = async (path: string) =>
    new Promise<string>(resolve => {
        const stream = fs.createReadStream(path)
        const md5sum = crypto.createHash('md5')

        stream.on('data', data => {
            md5sum.update(data)
        })
        stream.on('end', () => {
            resolve(md5sum.digest('hex'))
        })
    })

/** used only to compare output, I believe it's the fastest */
export const getHashFromString = (data: string) => crypto.createHash('md5').update(data).digest('hex')
