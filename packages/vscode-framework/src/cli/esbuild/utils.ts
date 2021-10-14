import { mapValues } from 'lodash'
// check value
export const esbuildDefineRaw = (obj: Record<string, string | boolean | number>) =>
    mapValues(obj, val => JSON.stringify(val))

export const esbuildDefineEnv = (obj: Record<string, string | boolean | number>) =>
    Object.fromEntries(Object.entries(obj).map(([key, val]) => [`process.env.${key}`, JSON.stringify(val)]))
