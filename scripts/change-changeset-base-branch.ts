// workaround for https://github.com/changesets/action/issues/88

import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN!,
})

const repoSlug = process.env.GITHUB_REPOSITORY!
const [owner, repo] = repoSlug.split('/') as [string, string]
const { data } = await octokit.search.issuesAndPullRequests({
    q: `Version Packages in:title+repo:${repoSlug}+state:open+author:app/github-actions`,
})
const prNumber = data.items[0]?.number
if (prNumber === undefined) throw new Error('Cannot find the PR!')
await octokit.pulls.update({
    owner,
    repo,
    pull_number: prNumber,
    base: 'main',
})

await octokit.pulls.create({
    owner,
    repo,
    head: 'main',
    base: 'next',
    title: 'Update changelogs',
})
