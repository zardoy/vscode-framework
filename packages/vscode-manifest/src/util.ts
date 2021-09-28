export const onlyProperties = <T extends Record<string, any>>(obj: T, props: (keyof T)[]) => {
    const entries = Object.keys(obj)
    return entries.length === props.length && entries.every(key => props.includes(key))
}

export const intoTwoArrays = <T>(array: T[], predicate: (value: T, index: number) => boolean): [T[], T[]] => {
    const arrs: [T[], T[]] = [[], []]
    // TODO don't forget to use linter and refactor
    array.forEach((value, index) => {
        // truthy value in first array, falsy in second
        arrs[predicate(value, index) ? 0 : 1].push(value)
    })
    return arrs
}
