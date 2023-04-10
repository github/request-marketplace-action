const { Octokit } = require("@octokit/rest");

module.exports = async ({github, context, payload, options}) => {

    let octokit = new Octokit({
        auth: options.token,
        baseUrl: options.baseUrl
    });

    let repoUpdate = {
        owner: `${options.actionsApprovedOrg}`,
        repo: `${payload.repo}_${options.version}`
    }
    if (context.payload.comment.body.toLowerCase().includes('approve') && await isAuthorized(context, options, octokit)) {
        // Check GitHub.com or GHEC version
        let internalRepoToggle = true;
        if (options.baseUrl != 'https://api.github.com') {
            let meta = await octokit.request('GET /meta', {});
            if (/^[3]{1}\.[0-4]{1}/.test(meta.data.installed_version)) {
                internalRepoToggle = false;
            }
        }
        // appove the request
        console.log(`Approving the request`);
        repoUpdate.visibility = internalRepoToggle ? 'internal' : 'public';
        repoUpdate.archived = false;
        await updateRepoCloseIssue(context, octokit, repoUpdate);
        // set level of access for workflows outside of the repository
        if (internalRepoToggle) {
            await octokit.request(`PUT /repos/${repoUpdate.owner}/${repoUpdate.repo}/actions/permissions/access`, {
                owner: repoUpdate.owner,
                repo: repoUpdate.repo,
                access_level: 'enterprise'
            });
        }
    } else if (context.payload.comment.body.toLowerCase().includes('deny') && await isAuthorized(context, options, octokit)) {
        // deny the request
        console.log(`Denying the request, archiving the repo`);
        repoUpdate.visibility = 'private';
        repoUpdate.archived = true;
        await updateRepoCloseIssue(context, octokit, repoUpdate);
    } else {
        // do nothing
        console.log('Do nothing');
    }
}

async function isAuthorized(context, options, octokit) {
    console.log(`Checking if ${context.payload.comment.user.login} is a member of ${options.adminOpsOrg}/${options.actionsApproverTeam} team`)
    try {
        let membership = await octokit.request(`GET /orgs/${options.adminOpsOrg}/teams/${options.actionsApproverTeam}/memberships/${context.payload.comment.user.login}`, {
            org: options.adminOpsOrg,
            team_slug: options.actionsApproverTeam,
            username: context.payload.comment.user.login
        })

        if (membership.data.state == 'active') {
            console.log( "Membership active")
            return true;
        } else {
            console.log( "Membership not active")
            return false;
        }
    } catch (error) {
        console.log(`error: ${error}`);
        console.log("Error checking membership. Check the ADMIN_OPS_ORG and ACTIONS_APPROVER_TEAM variables.")
        throw new Error("Error checking membership");
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