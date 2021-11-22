import fs from 'fs'
import { join } from 'path'
import execa from 'execa'
import fsExtra from 'fs-extra'
import got from 'got'
import { readPackageJsonFile, writeJsonFile, writePackageJsonFile } from 'typed-jsonfile'
import globby from 'globby'
import { modifyPackageJsonFile } from 'modify-json-file'
import { ManifestType } from '../packages/vscode-manifest'
import { packageJsonCleanDeps } from './utils'

// TODO still doesn't fail when some packages are in devDeps and not in deps
// commit: b281e9998d1f9d1209477c6dbed61b1221b2fcf6 where kleur in devDeps

beforeAll(async () => {
    // Ensure that start and build script outputs the same code
    // @link-source-path
    if (!fs.existsSync('packages/vscode-framework/build/cli/commands.js'))
        throw new Error('These tests require build. Run pnpm build/start')
    await fsExtra.emptyDir(join(__dirname, 'fixture'))
})

const BIN_ENTRYPOINT = join(__dirname, '../packages/vscode-framework/bin.js')

const setupFixture = async (fixtureName: string) => {
    const fromFixture = (...path: string[]) => join(__dirname, 'fixture', fixtureName, ...path)
    await fsExtra.emptyDir(fromFixture())
    return { fromFixture }
}

const fromPackages = (...path: string[]) => join(__dirname, '../packages', ...path)

// TODO use actual snapshot testing? (snapshotResolver with snapshotSerializers)
// The reason why I prefer this because I can just remove failing snapshots, which is faster than --watch or -u in case of several failing snapshots
const toMatchFileSnapshot = async (fixtureName: string, file: 'src-generated.ts') => {
    const fixturePath = join(__dirname, 'fixture-snapshots', fixtureName, file)
    await fsExtra.ensureDir(join(fixturePath, '..'))
    const actualPathMap = {
        'src-generated.ts': 'src/generated.ts',
    }
    const actualCode = await fs.promises.readFile(join(__dirname, 'fixture', fixtureName, actualPathMap[file]), 'utf-8')
    if (fs.existsSync(fixturePath)) expect(await fs.promises.readFile(fixturePath, 'utf-8')).toBe(actualCode)
    else await fs.promises.writeFile(fixturePath, actualCode, 'utf-8')
}

const downloadPackageJson = async (repo: string, writeDir?: string) => {
    const { body: eslintManifest } = await got<ManifestType>(
        `https://cdn.jsdelivr.net/gh/${repo.replace('#', '@')}/package.json`,
        {
            responseType: 'json',
        },
    )
    if (writeDir) await writePackageJsonFile({ dir: writeDir }, eslintManifest)
    return eslintManifest
}

const runTypesGenerator = async (cwd: string) => {
    await execa.node(BIN_ENTRYPOINT, ['generate-types'], { cwd, stdio: 'inherit' })
}

describe('Integration', () => {
    const getNameFromRepo = (repoFullSlug: string) => /.+\/(.+)#/.exec(repoFullSlug)![1]!
    // TODO! detect updates on CI. write to issue
    test.each([
        // {
        // TODO! quicktype doesn't work with XO figure out what's wrong with schema err: type must be string
        // repo: 'xojs/vscode-linter-xo#6b765c12adb0d93ca7e2b67720ac5a7ed6a62e8f',
        // },
        {
            repo: 'Microsoft/vscode-eslint#7753f3a96d53b47ba49ea3428950f63fe8ddb415',
        },
        {
            repo: 'Axosoft/vscode-gitlens#5dee2e97b08df1198c7afd8034476b277d613729',
        },

        {
            repo: 'microsoft/vscode-python#24fb1c22763663055655f237510f82148250bb48',
        },
        // impossible type in your schema? - of course
        // TODO!
        // {
        //     repo: 'microsoft/vscode-jupyter#de235e0046676a74c178991fe2f232992b4f890a',
        // },
        {
            repo: 'microsoft/vscode-docker#f59728db476e432752f5e3f1aed07e6341509b60',
        },
        // {
        //     repo: 'microsoft/omnisharp-vscode#3ffc2963ab5519fa4498c9fe0bea62ac13e56142',
        // },
        // TODO invalid schema
        // {
        //     repo: 'microsoft/vscode-java-test#e3ac973678b3bbaef8259bd1e73f345be9b5a222',
        // },
        // All these disabled cause failing:
        // {
        //     repo: 'microsoft/vscode-react-native#48ca0c6243e4cda833290b57fec530369e205179',
        // },
        // {
        //     repo: 'microsoft/vscode-java-debug#0289e29e6cbb2758e6c9626ba6349625fdd00163',
        // },
        // TODO support path https://github.com/microsoft/vscode-cpptools/blob/main/Extension/package.json

        {
            repo: 'redhat-developer/vscode-yaml#653baee6427ca37e3adaa689c15d27ed454d8c2d',
        },
        {
            repo: 'redhat-developer/vscode-xml#70024545886d9f9cc19bc804361192d5c00821ab',
        },
        {
            repo: 'redhat-developer/vscode-xml#70024545886d9f9cc19bc804361192d5c00821ab',
        },

        {
            repo: 'prettier/prettier-vscode#4a9ad9d27c23d200e8103a09bbb0f78cc5b0570b',
        },
        // TODO the same thing as with XO
        // {
        //     repo: 'redhat-developer/vscode-java#b4f8b07d774acb17bee19f3b06f4d0364a72c682',
        // },
        {
            repo: 'lostintangent/gistpad#3a0ac31478d8ecc845ad981ebe242f0bb9c98085',
        },
    ] as Array<{
        repo: string
    }>)('Integration with $repo', async ({ repo }) => {
        const fixtureName = getNameFromRepo(repo)
        const { fromFixture } = await setupFixture(fixtureName)
        await downloadPackageJson(repo, fromFixture())
        await runTypesGenerator(fromFixture())
        // TODO! automatically read and report `any` types
        await toMatchFileSnapshot(fixtureName, 'src-generated.ts')
    })
    // TODO test also every vscode builtin extension
})
