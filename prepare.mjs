//@ts-check
import del from 'del'
import { run } from './packages/vscode-framework/scripts/esbuild.mjs'

await run()

await del('**/*.tsbuildinfo')
