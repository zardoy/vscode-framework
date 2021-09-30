//@ts-check
import del from 'del'
import { run } from './packages/vscode-framework/scripts/esbuild.mjs'
import execa from 'execa'
import * as globby from 'globby'

let buildDel = await globby.globby(['packages/**/*.tsbuildinfo', 'packages/*/build/**'])

buildDel = buildDel.filter(v => v !== 'packages/vscode-framework/build/client.d.ts')

await del(buildDel, {
    // TODO! read gitignores automatically
    // gitignore: true,
})

await execa('tsc -b tsconfig.prod.json', { preferLocal: true }).catch(e => {})

await run()
