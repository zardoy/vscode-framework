/// <reference types="jest" />

import { forceChalkColor } from './utils'
// and what to do in esm?
forceChalkColor(true)
const { validateOrThrow } = require('../src/validateManifest')

// read manifest functions are in global tests

test('Errors on missing and invalid props', async () => {
    const testManifest = {
        name: 3,
        contributes: {
            commands: [
                {
                    lulw: true,
                },
            ],
        },
    }
    const spy = jest.spyOn(global.console, 'error')
    spy.mockImplementation(() => {})
    // const force_color = process.env.FORCE_COLOR
    //@ts-expect-error
    expect(() => validateOrThrow(testManifest)).toThrow()
    expect(spy.mock.calls.join('\n')).toMatchInlineSnapshot(`
"[41m ERROR [49m,[31mInvalid package.json[39m
[31mMissing root properties:[39m [31m[39m
[31m- [1mcategories[22m[39m[31m[39m
[31m- [1mdisplayName[22m[39m[31m[39m
[31m- [1mpublisher[22m[39m[31m[39m
[31m- [1mversion[22m[39m
[31mOther errors:[39m
[31m- [1mcontributes.commands.0[22m must have required property 'command'[39m
[31m- [1mcontributes.commands.0[22m must have required property 'title'[39m
[31m- [1mname[22m must be string[39m"
`)
    spy.mockRestore()
    // process.env.FORCE_COLOR = force_color
})
