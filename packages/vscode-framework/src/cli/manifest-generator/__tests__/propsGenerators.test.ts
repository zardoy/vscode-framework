/// <reference types="jest" />

import { PackageJson } from 'type-fest'
import { propsGenerators } from '../propsGenerators'
import fs from 'fs'

type Tests = {
    [K in keyof typeof propsGenerators as K]: (packageJson: PackageJson) => void
}

type HaveUniqueTests = 'repository'

test.only('Repository field', () => {
    const testGitConfig = `
[remote "origin"]
url=https://github.com/test-author/vscode-extension-name.git
    `
    const spyReadFile = jest.spyOn(fs, 'readFile')
    spyReadFile.mock
})

// const tests: Tests = {
//     "contributes.commands": expected => expect(expected)
// }
