/// <reference types="jest" />

import { validateOrThrow } from '../src/validateManifest'
import { UnprintableError } from '../src/displayError'

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
    expect(() => validateOrThrow(testManifest as any)).toThrow(UnprintableError)
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
})
