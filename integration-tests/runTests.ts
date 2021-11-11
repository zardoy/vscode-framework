import got from 'got'
import fs from 'fs'
import fsExtra from 'fs-extra'
import { writeJsonFile } from 'typed-jsonfile'
import { join } from 'path'
import type { ManifestType } from '../packages/vscode-manifest/src'
import type { MaybePromise } from '../packages/vscode-framework/src/util'
import execa from 'execa'

export const runFixtures = () => {
    // cwd must be root of the repository
    //@link-source-path
    if (!fs.existsSync('packages/vscode-framework/build/cli/commands.ts'))
        throw new Error('These tests require build. Run pnpm build')
    const fromFixture = (...path: string[]) => join('fixtures', 'eslint-config')
    const binPath = 'packages/vscode-framework/bin.js'
    const fixturesSetup: Record<
        string,
        (fromPath: (...path: string[]) => string, data: { fixtureName: string }) => MaybePromise<void>
    > = {
        async 'eslint-config'(fromFixture, { fixtureName }) {
            // ESLint build not in framework-way, so its need additionlal config
            const { body: eslintManifest } = await got<ManifestType>(
                'https://cdn.jsdelivr.net/gh/Microsoft/vscode-eslint@7753f3a96d53b47ba49ea3428950f63fe8ddb415/package.json',
                { responseType: 'json' },
            )
            await writeJsonFile(fromFixture('package.json'), eslintManifest as any)
            await execa('node', [binPath, 'start'], { cwd: fromFixture() })
        },
    }
    for (const fixture of fixturesSetup) {
        const fromFixture = (...path: string[]) => join()
    }
}

runFixtures()
