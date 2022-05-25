const { Octokit } = require("@octokit/rest");
const fs = require("fs");

let stagingOrg = 'actions-staging';
let octokit;

module.exports = async ({github, context, payload}) => {
    console.log(`Adding action to ${stagingOrg} org: ${JSON.stringify(payload.action)}`);

    octokit = new Octokit({
        auth: github.token,
        baseUrl: github.api_url
    });

    let allowedActions  = await octokit.rest.actions.getAllowedActionsOrganization({
        org: stagingOrg
    });
    //console.log(`Found the following allowed actions: ${JSON.stringify(allowedActions)}`);
    allowedActions.data.patterns_allowed.push(payload.action);
    //console.log(`Updated allowed actions: ${JSON.stringify(allowedActions.data.patterns_allowed)}`);

    await octokit.rest.actions.setAllowedActionsOrganization({
        org: stagingOrg,
        patterns_allowed: allowedActions.data.patterns_allowed
    });
}