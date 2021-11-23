import { program } from './cli'
;(async () => {
    process.chdir(process.env.INIT_CWD!)
    await program.parseAsync([], { from: 'user' })
})().catch(() => {})
