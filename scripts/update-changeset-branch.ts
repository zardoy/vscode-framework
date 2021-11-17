// workaround for https://github.com/changesets/action/issues/88

import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN!,
})

const repoSlug = process.env.GITHUB_REPOSITORY!
const [owner, repo] = repoSlug.split('/') as [string, string]
const action = process.argv[2]!
if (action.startsWith('next')) {
    const { data } = await octokit.search.issuesAndPullRequests({
        q: `Version Packages in:title+repo:${repoSlug}+state:open+author:app/github-actions`,
    })
    const prNumber = data.items[0]?.number
    if (action === 'next-pre') {
        // change base branch to next (default) to let the action pickup and update the PR
        if (prNumber !== undefined)
            await octokit.pulls.update({
                owner,
                repo,
                pull_number: prNumber,
                base: 'next',
            })
    } else if (
        action === 'next-post' && // changesets can skip creating PR if not needed
        prNumber !== undefined
    ) {
        await octokit.pulls.update({
            owner,
            repo,
            pull_number: prNumber,
            base: 'main',
        })
    }
}

if (action === 'main') {
    // create pr main -> next with updated version and removed changesets
    const { data } = await octokit.pulls.create({
        owner,
        repo,
        head: 'main',
        base: 'next',
        title: 'Update changelogs',
    })
    await octokit.pulls.merge({
        owner,
        repo,
        pull_number: data.number,
    })
}
