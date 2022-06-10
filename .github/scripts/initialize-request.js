const { Octokit } = require("@octokit/rest");

module.exports = async ({github, context, payload, options}) => {
    // Instantiate octokit with ghtoken and baseUrl for GHES
    let octokit = new Octokit({
        auth: options.token,
        baseUrl: options.baseUrl
    });

    let exitError = false;
    // check if the repo already exists
    let repo = await octokit.request(`GET /repos/${options.actionsApprovedOrg}/${payload.repo}_${options.latestRelease}`, {
        owner: options.actionsApprovedOrg,
        repo: `${payload.repo}_${options.latestRelease}`
    })
    .then(response => {
        // Repo exists, so we will fail the remainder of the workflow
        console.log(`Repo ${payload.repo}_${options.latestRelease} already exists`);
        exitError = true;
    })
    .catch(async error => {
        // Repo does not exist, so we will create it
        console.log(error);
        console.log(`Creating repo ${payload.repo}_${options.latestRelease}`);
        let response = await octokit.request(`POST /orgs/${options.actionsApprovedOrg}/repos`, {
            org: options.actionsApprovedOrg,
            name: `${payload.repo}_${options.latestRelease}`,
            description: `${payload.owner}/${payload.repo}@${options.latestRelease}`,
            homepage: `https://github.com/${payload.owner}/${payload.repo}`,
            'private': true,
            has_issues: true,
            has_projects: false,
            has_wiki: false
        });
    });

    if (exitError) {
        throw new Error(`Repo ${options.actionsApprovedOrg}/${payload.repo}_${options.latestRelease} already exists`);
    }
}