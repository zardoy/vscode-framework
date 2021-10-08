import { generateTypes } from './cli/types-generator'
;(async () => {
    await generateTypes({ nodeModulesDir: process.env.INIT_CWD! })
})().catch(() => {})
