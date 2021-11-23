/** @internal */
export const ensureArray = <T>(arg: T | T[]): T[] => (Array.isArray(arg) ? arg : [arg])
