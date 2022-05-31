const { Octokit } = require("@octokit/rest");

let actionsApprovedOrg = 'actions-approved';
let octokit;

module.exports = async ({github, context, payload, options}) => {
    // Instantiate octokit with ghtoken and baseUrl for GHES
    octokit = new Octokit({
        auth: options.token,
        baseUrl: options.baseUrl
    });

    let response = await octokit.request(`POST /orgs/${actionsApprovedOrg}/repos`, {
        org: actionsApprovedOrg,
        name: payload.repo,
        description: `${payload.owner}/${payload.repo}@${payload.ref}`,
        homepage: `https://github.com/${payload.owner}/${payload.repo}`,
        'private': true,
        has_issues: true,
        has_projects: false,
        has_wiki: false
    });

    console.log(JSON.stringify(response.data));
}