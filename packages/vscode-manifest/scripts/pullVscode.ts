import execa from 'execa'
;(async () => {
    // move to temp dir, otherwise pnpm would install all deps from it
    await execa('git', 'clone http://github.com/Microsoft/vscode.git vscode-repo --depth=1'.split(' '), {
        cwd: __dirname,
        stdio: 'inherit',
    })
    // WIP
})().catch(error => {
    console.error(error)
    // eslint-disable-next-line zardoy-config/unicorn/no-process-exit
    process.exit(1)
})
