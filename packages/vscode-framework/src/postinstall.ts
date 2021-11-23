import { commander } from './cli/commands'
;(async () => {
    if (process.env.INIT_CWD) process.chdir(process.env.INIT_CWD)
    await commander.processAsync(['generate'])
})().catch(() => {})
