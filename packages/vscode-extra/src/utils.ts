import { pick } from 'lodash'

/** @internal */
export const pickObject = <T extends Record<string, any>, K extends keyof T>(object: T, keys: K[]) => pick(object, keys)
