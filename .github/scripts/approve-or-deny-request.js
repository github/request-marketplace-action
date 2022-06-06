const { Octokit } = require("@octokit/rest");

let adminOpsOrg = 'admin-ops';
let actionsApprovedOrg = 'actions-approved';
let actionsApproverTeam = 'actions-approvers'

module.exports = async ({github, context, payload, options}) => {

    let octokit = new Octokit({
        auth: options.token,
        baseUrl: options.baseUrl
    });

    if (context.payload.comment.body.includes('approve') && await isAuthorized(context, octokit)) {
        // appove the request
        console.log(`Approving the request`);
        await octokit.request(`PATCH /repos/${actionsApprovedOrg}/${payload.repo}_${payload.ref}`, {
            owner: `${actionsApprovedOrg}`,
            repo: `${payload.repo}_${payload.ref}`,
            private: false
        });
    } else if (context.payload.comment.body.includes('deny') && await isAuthorized(context, octokit)) {
        // deny the request
        console.log(`Denying the request, archiving the repo`);
        await octokit.request(`PATCH /repos/${actionsApprovedOrg}/${payload.repo}_${payload.ref}`, {
            owner: `${actionsApprovedOrg}`,
            repo: `${payload.repo}_${payload.ref}`,
            archived: true
        });
    } else {
        // do nothing
        console.log('Do nothing');
    }
    //console.log(JSON.stringify(context));
}

async function isAuthorized(context, octokit) {
    try {
        let membership = await octokit.request(`GET /orgs/${adminOpsOrg}/teams/${actionsApproverTeam}/memberships/${context.payload.comment.user.login}`, {
            org: adminOpsOrg,
            team_slug: actionsApproverTeam,
            username: context.payload.comment.user.login
        })

        console.log(`membership: ${JSON.stringify(membership)}`);

        if (membership.data.state == 'active') {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log(`error: ${error}`);
        return false;
    }
}