const { Octokit } = require("@octokit/rest");

let actionsApprovedOrg = 'actions-approved';
let octokit;

module.exports = async ({github, context, payload, options}) => {
    // Instantiate octokit with ghtoken and baseUrl for GHES
    octokit = new Octokit({
        auth: options.token,
        baseUrl: options.baseUrl
    });

    //let repo;
    // check if the repo already exists
    let repo = await octokit.request('GET /repos/{owner}/{repo}', {
        owner: actionsApprovedOrg,
        repo: payload.repo
    })
    .then(response => {
        console.log(response);
        console.log(`Repo ${payload.repo} already exists`);
    })
    .catch(async error => {
        console.log(error);
        console.log(`Creating repo ${payload.repo}`);
        let response = await octokit.request(`POST /orgs/${actionsApprovedOrg}/repos`, {
            org: actionsApprovedOrg,
            name: `${payload.repo}_${payload.ref}`,
            description: `${payload.owner}/${payload.repo}@${payload.ref}`,
            homepage: `https://github.com/${payload.owner}/${payload.repo}`,
            'private': true,
            has_issues: true,
            has_projects: false,
            has_wiki: false
        });
    });

    // create new repo
    // if (repo.status === 404) {
    //     console.log(`Creating repo ${payload.repo}`);
    //     let response = await octokit.request(`POST /orgs/${actionsApprovedOrg}/repos`, {
    //         org: actionsApprovedOrg,
    //         name: payload.repo,
    //         description: `${payload.owner}/${payload.repo}@${payload.ref}`,
    //         homepage: `https://github.com/${payload.owner}/${payload.repo}`,
    //         'private': true,
    //         has_issues: true,
    //         has_projects: false,
    //         has_wiki: false
    //     });
    // } else {
    //     console.log(`Repo ${payload.repo} already exists`);
    //     //throw new Error(`Repo ${payload.repo} already exists`);
    // }
    //console.log(JSON.stringify(response));
}