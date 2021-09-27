import { generateTypes } from './cli/types-generator'
;(async () => {
    await generateTypes(process.env.INIT_CWD!)
})().catch(e => {})
