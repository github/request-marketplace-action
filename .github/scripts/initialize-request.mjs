//const { Octokit } = require("@octokit/rest");
import { Octokit } from "@octokit/rest";

export default async function main(github, context, options) {
    // Instantiate octokit with ghtoken and baseUrl for GHES
    let octokit = new Octokit({
        auth: options.token,
        baseUrl: options.baseUrl
    });

    let exitError = false;
    // check if the repo already exists
    let repo = await octokit.request(`GET /repos/${options.actionsApprovedOrg}/${options.repo}_${options.version}`, {
        owner: options.actionsApprovedOrg,
        repo: `${options.repo}_${options.version}`
    })
    .then(response => {
        // Repo exists, so we will fail the remainder of the workflow
        console.log(`Repo ${options.repo}_${options.version} already exists`);
        exitError = true;
    })
    .catch(async error => {
        // Repo does not exist, so we will create it
        console.log(error);
        console.log(`Creating repo ${options.repo}_${options.version}`);
        let response = await octokit.request(`POST /orgs/${options.actionsApprovedOrg}/repos`, {
            org: options.actionsApprovedOrg,
            name: `${options.repo}_${options.version}`,
            description: `${options.owner}/${options.repo}@${options.version}`,
            homepage: `https://github.com/${options.owner}/${options.repo}`,
            visibility: 'private',
            has_issues: true,
            has_projects: false,
            has_wiki: false
        });
        console.log(`Repo ${options.repo}_${options.version} created successfully`);
        // disable actions on the repo
        console.log('Disabling actions on new repo')
        await octokit.request(`PUT /repos/${options.actionsApprovedOrg}/${options.repo}_${options.version}/actions/permissions`, {
            owner: options.actionsApprovedOrg,
            repo: `${options.repo}_${options.version}`,
            enabled: false
        });
    });

    if (exitError) {
        throw new Error(`Repo ${options.actionsApprovedOrg}/${options.repo}_${options.version} already exists`);
    }
}
