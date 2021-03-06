//@ts-check
import del from 'del'
import execa from 'execa'
import globby from 'globby'

let buildDel = await globby(['packages/**/*.tsbuildinfo', 'packages/*/build/**'])

buildDel = buildDel.filter(
    v =>
        v !== 'packages/vscode-framework/build/client.d.ts' &&
        v !== 'packages/vscode-framework/build/extensionBootstrap.ts',
)

await del(buildDel, {
    // TODO! read gitignores automatically
    // gitignore: true,
})

// projects with compiste: true must run twice
// we're losing a lot of time here
await execa('tsc', '-b tsconfig.prod.json'.split(' '), { preferLocal: true }).catch(e => {})
