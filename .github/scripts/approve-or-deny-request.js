const { Octokit } = require("@octokit/rest");

module.exports = async ({github, context, options}) => {

    let octokit = new Octokit({
        auth: options.token,
        baseUrl: options.baseUrl
    });

    let repoUpdate = {
        owner: `${options.actionsApprovedOrg}`,
        repo: `${options.repo}_${options.latestRelease}`
    }
    if (context.payload.comment.body.includes('approve') && await isAuthorized(context, options, octokit)) {
        // appove the request
        console.log(`Approving the request`);
        repoUpdate.private = false;
        repoUpdate.archived = false;
        await updateRepoCloseIssue(context, octokit, repoUpdate);
    } else if (context.payload.comment.body.includes('deny') && await isAuthorized(context, options, octokit)) {
        // deny the request
        console.log(`Denying the request, archiving the repo`);
        repoUpdate.private = true;
        repoUpdate.archived = true;
        await updateRepoCloseIssue(context, octokit, repoUpdate);
    } else {
        // do nothing
        console.log('Do nothing');
    }
}

async function isAuthorized(context, options, octokit) {
    try {
        let membership = await octokit.request(`GET /orgs/${options.adminOpsOrg}/teams/${options.actionsApproverTeam}/memberships/${context.payload.comment.user.login}`, {
            org: options.adminOpsOrg,
            team_slug: options.actionsApproverTeam,
            username: context.payload.comment.user.login
        })

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

async function updateRepoCloseIssue(context, octokit, repoUpdate) {
    // Update the repo and close the issue
    await octokit.request(`PATCH /repos/${repoUpdate.owner}/${repoUpdate.repo}`, repoUpdate);
    await octokit.request(`PATCH /repos/${context.payload.repository.owner.login}/${context.payload.repository.name}/issues/${context.payload.issue.number}`, {
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        issue_number: context.payload.issue.number,
        state: 'closed'
    });
}