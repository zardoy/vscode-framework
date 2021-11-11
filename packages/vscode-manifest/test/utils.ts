import { Instance as Chalk } from 'chalk'

export const forceChalkColor = (enable: boolean) => {
    jest.mock('chalk', () => new Chalk({ level: enable ? 1 : 0 }))
}
