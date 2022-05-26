const { Octokit } = require("@octokit/rest");
const fs = require("fs");

let stagingOrg = 'actions-staging';
let octokit;

module.exports = async ({github, context, payload, options}) => {
    // Instantiate oktokit with token and baseUrl
    octokit = new Octokit({
        auth: options.token,
        baseUrl: options.baseUrl
    });

    // Get the list of selected actions from the staging org
    let allowedActions  = await octokit.rest.actions.getAllowedActionsOrganization({
        org: stagingOrg
    });
    // If the action is not in the list, add it
    if (!allowedActions.data.patterns_allowed.includes(payload.action)) {
        allowedActions.data.patterns_allowed.push(payload.action);
        await octokit.rest.actions.setAllowedActionsOrganization({
            org: stagingOrg,
            patterns_allowed: allowedActions.data.patterns_allowed
        });
        console.log(`Updated allowed actions: ${JSON.stringify(allowedActions.data.patterns_allowed)}`);
    } else {
        console.log(`Action ${payload.action} already allowed`);
    }
}