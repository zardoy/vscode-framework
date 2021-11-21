import fs from 'fs'
import { join } from 'path'
import execa from 'execa'
import fsExtra from 'fs-extra'
import got from 'got'
import { getUserReposJson } from 'repos-json'
import { readPackageJsonFile, writeJsonFile } from 'typed-jsonfile'
import globby from 'globby'
import { ManifestType } from '../packages/vscode-manifest'
import { packageJsonCleanDeps } from './utils'
import { modifyPackageJsonFile } from 'modify-json-file'

const setupFixture = async (fixtureName: string) => {
    const fromFixture = (...path: string[]) => join(__dirname, 'fixture', fixtureName, ...path)
    await fsExtra.emptyDir(fromFixture())
    return { fromFixture }
}

const fromPackages = (...path: string[]) => join(__dirname, '../packages', ...path)
let frameworkPackagePath = join(__dirname, 'fixture')

beforeAll(async () => {
    await fsExtra.emptyDir(join(__dirname, 'fixture'))
})

const pnpmWorkspaceFilePath = {
    current: 'pnpm-workspace.yaml',
    old: 'pnpm-workspace.old.yaml',
}

describe.only('Integration', () => {
    beforeAll(async () => {
        // Ensure that start and build script outputs the same code
        // @link-source-path
        if (!fs.existsSync('packages/vscode-framework/build/cli/commands.js'))
            throw new Error('These tests require build. Run pnpm build/start')
        const packageJsonDir = fromPackages('vscode-framework')
        const { version: oldVersion } = await readPackageJsonFile({ dir: packageJsonDir })
        const newVersion = `${oldVersion!}-testing`
        await modifyPackageJsonFile(
            { dir: packageJsonDir },
            {
                version: newVersion,
            },
        )
        console.log(`Packaging... ${newVersion}`)
        await execa('pnpm', ['pack', '--pack-destination', frameworkPackagePath], {
            cwd: fromPackages('vscode-framework'),
            stdio: 'inherit',
        })
        await modifyPackageJsonFile(
            { dir: packageJsonDir },
            {
                version: oldVersion,
            },
        )
        const [tgzName] = await globby('*.tgz', { cwd: frameworkPackagePath })
        // eslint-disable-next-line zardoy-config/@typescript-eslint/no-unnecessary-type-assertion
        frameworkPackagePath = join(frameworkPackagePath, tgzName!)
    })
    test('ESLint contribution points', async () => {
        const { fromFixture } = await setupFixture('eslint')

        // ENSURE renames only once
        await fsExtra.rename(pnpmWorkspaceFilePath.current, pnpmWorkspaceFilePath.old)
        // ESLint build not in framework-way, so its need additionlal config
        const { body: eslintManifest } = await got<ManifestType>(
            'https://cdn.jsdelivr.net/gh/Microsoft/vscode-eslint@7753f3a96d53b47ba49ea3428950f63fe8ddb415/package.json',
            {
                responseType: 'json',
            },
        )
        await writeJsonFile(
            fromFixture('package.json'),
            {
                ...(packageJsonCleanDeps(eslintManifest) as any),
                devDependencies: {
                    '@types/vscode': '*',
                },
            },
            { spaces: 4 },
        )
        await execa('pnpm', ['i', frameworkPackagePath, '--strict-peer-dependencies'], {
            cwd: fromFixture(),
            stdio: 'inherit',
        })
        // const process = execa.node(binPath, ['start'], { stdio: 'inherit', cwd: fromFixture() })
        // await delay(3000)
        // process.kill()
        // Snapshot generated types
        // expect(await fs.promises.readFile(fromFixture('src/generated.ts'), 'utf-8')).toMatchInlineSnapshot()
    }, 20_000)
    afterAll(async () => {
        await fsExtra.rename(pnpmWorkspaceFilePath.old, pnpmWorkspaceFilePath.current).catch(() => {})
    })
})

// let reposExtensions: { repos: string[] } = undefined!

// beforeAll(async () => {
//     reposExtensions = (await getUserReposJson('zardoy'))['vscode-extensions']!
// })

// // I got exploded after last installation failure due to abondened quicktype-core
// // This test ensures that Evertything works with my every project
// test('Evertything works in real projects', async () => {
//     const getFixturePath = (repoName: string) => join(__dirname, 'fixture', repoName)

//     for (const repo of reposExtensions.repos) {
//         const fixtureRoot = getFixturePath(repo)
//         await execa('git', ['clone', `https://github.com/${repo}.git`, fixtureRoot, '--depth=1'], { stderr: 'inherit' })
//     }
// })
