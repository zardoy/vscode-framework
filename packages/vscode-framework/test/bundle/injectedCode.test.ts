/// <reference types="jest" />

import fs from 'fs'
import { join } from 'path'

// the main purpose of these tests is to see that bundler isn't misbehaving
// with this test it's relatively safe to keep esbuild up-to-date
// for example esbuild would remove declarations as unused etc in one of the future releases
test('Injected console code remains the same', async () => {
    const injectedCode = await fs.promises.readFile(
        join(__dirname, '../../build/cli/esbuild/consoleInject.js'),
        'utf-8',
    )
    expect(injectedCode.split('\n').slice(1).join('\n')).toMatchSnapshot()
})
