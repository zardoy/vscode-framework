;(async () => {
    process.argv[2] = 'generate-types'
    await import('./cli/commands')
})().catch(() => {})
