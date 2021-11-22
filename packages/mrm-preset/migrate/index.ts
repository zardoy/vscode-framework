import { basename } from 'path'
import { install, json, packageJson } from 'mrm-core'
import { PackageJson } from 'type-fest'

module.exports = () => {
    // this is for migrating, not for initializing
    if (!packageJson().exists()) throw new Error('package.json is missing! Initialize it first')

    packageJson().prependScript('start', 'vscode-framework start')
    packageJson().prependScript('build', 'vscode-framework build')
    const filesToRemove = () => ['.vscodeignore']

    // references:
    // https://github.com/xojs/vscode-linter-xo/blob/master/package.json
    // change .vscode

    // engines.vscode ONLY
    //

    // TODO! remove next
    install('vscode-framework')
}
