import { generateTypes } from './cli/types-generator'
;(async () => {
    try {
        await generateTypes(process.env.INIT_CWD!)
    } catch (err) {}
})().catch(e => {})
