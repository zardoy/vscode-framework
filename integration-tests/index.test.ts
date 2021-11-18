import fs from 'fs'
import { join } from 'path'
import got from 'got'
import fsExtra from 'fs-extra'
import { writeJsonFile } from 'typed-jsonfile'
import execa from 'execa'
import delay from 'delay'
import type { ManifestType } from '../packages/vscode-manifest/src'
import type { MaybePromise } from '../packages/vscode-framework/src/util'

// cwd must be root of the repository
// @link-source-path
if (!fs.existsSync('packages/vscode-framework/build/cli/commands.js'))
    throw new Error('These tests require build. Run pnpm build')
const binPath = join(__dirname, '../packages/vscode-framework/bin.js')

const setupFixture = async (fixtureName: string) => {
    const fromFixture = (...path: string[]) => join(__dirname, 'fixture', fixtureName, ...path)
    await fsExtra.emptyDir(fromFixture())
    return { fromFixture }
}

describe('Integration', () => {
    test('ESLint contribution points', async () => {
        const { fromFixture } = await setupFixture('eslint')

        // ESLint build not in framework-way, so its need additionlal config
        const { body: eslintManifest } = await got(
            'https://cdn.jsdelivr.net/gh/Microsoft/vscode-eslint@7753f3a96d53b47ba49ea3428950f63fe8ddb415/package.json',
            {
                /* responseType: 'json' */
            },
        )
        await fs.promises.writeFile(fromFixture('package.json'), eslintManifest, 'utf-8')
        // should do all the work within 2 sec
        const process = execa('node', [binPath, 'start'], { stdio: 'inherit', cwd: fromFixture() })
        await delay(3000)
        process.kill()
        // Snapshot generated types
        expect(await fs.promises.readFile(fromFixture('src/generated.ts'), 'utf-8')).toMatchInlineSnapshot()
    })
})
