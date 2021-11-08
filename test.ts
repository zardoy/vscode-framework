import fs from 'fs'
import { join } from 'path'

const fromPackage = (...p: string[]) => join('packages', 'vscode-framework', ...p)

console.log(process.cwd())
console.log(process.env['GITHUB_WORKSPACE'])
console.log(await fs.promises.readFile('packages/vscode-framework/CHANGELOG.md', 'utf-8'))
