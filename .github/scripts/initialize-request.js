const { Octokit } = require("@octokit/rest");
const fs = require("fs");
var NodeGit = require("nodegit");

let stagingOrg = 'actions-staging';
let octokit;

module.exports = async ({github, context, payload, options}) => {
    // Instantiate octokit for github.com
    // ghoctokit = new Octokit({
    // });

    var cloneURL = `https://github.com/${payload.owner}/${payload.repo}.git`;
    var localPath = require("path").join(__dirname, "requested-action");
    cloneOptions.fetchOpts = {
        callbacks: {
          certificateCheck: function() { return 0; }
        }
      };
    console.log("Attempting to clone " + cloneURL + " to " + localPath);
    try {
        var cloneRepository = await NodeGit.Clone(cloneURL, localPath, cloneOptions);
    } catch (e) {
        console.log("Error cloning repository: " + e);
    }
    // Instantiate octokit with ghtoken and baseUrl for GHES
    octokit = new Octokit({
        auth: options.token,
        baseUrl: options.baseUrl
    });

    // let response = await ghoctokit.request(`GET /repos/${payload.owner}/${payload.repo}/tarball/${payload.ref}`, {
    //     owner: payload.owner,
    //     repo: payload.repo,
    //     ref: payload.ref
    // });

    //console.log(response);

    // // Get the list of selected actions from the staging org
    // let allowedActions  = await octokit.rest.actions.getAllowedActionsOrganization({
    //     org: stagingOrg
    // });
    // // If the action is not in the list, add it
    // if (!allowedActions.data.patterns_allowed.includes(payload.action)) {
    //     allowedActions.data.patterns_allowed.push(payload.action);
    //     await octokit.rest.actions.setAllowedActionsOrganization({
    //         org: stagingOrg,
    //         patterns_allowed: allowedActions.data.patterns_allowed
    //     });
    //     console.log(`Updated allowed actions: ${JSON.stringify(allowedActions.data.patterns_allowed)} in ${stagingOrg}`);
    // } else {
    //     console.log(`Action ${payload.action} already allowed in ${stagingOrg}`);
    // }
}