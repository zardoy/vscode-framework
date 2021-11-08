import fs from 'fs'
import { join } from 'path'

const fromPackage = (...p: string[]) => join('packages', 'vscode-framework', ...p)

console.log(process.cwd())
console.log(await fs.promises.readFile(fromPackage('CHANGELOG.MD'), 'utf-8'))
