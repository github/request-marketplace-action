const { test } = require('uvu');
const assert = require('uvu/assert');
const fs = require("fs");

const nock = require("nock");
nock.disableNetConnect();

const { Octokit } = require("@octokit/rest");

const github = new Octokit({
    auth: "secret123",
    userAgent: 'myApp v1.2.3'
});

const options = {
    token: "secret123",
    baseUrl: "https://github.robandpdx.demo-stack.com/api/v3",
    version: "v1.2.3",
    adminOpsOrg: "admin-ops",
    actionsApprovedOrg: "actions-approved",
    actionsApproverTeam: "actions-approvers"
};

const meta34 = {
    installed_version: "3.4.0"
}

const meta35 = {
    installed_version: "3.5.0"
}

const context = {
    payload: {
        repository: {
            name: "request-marketplace-action",
            owner: {
                login: "admin-ops"
            }
        },
        issue: {
            number: 12
        },
        comment: {
            user: {
                login: "octocat"
            },
            body: "approve"
        }
    }
}

const payload = {
    owner: "hashicorp-contrib",
    repo:"setup-packer"
}

const membershipResponse = JSON.parse(fs.readFileSync("./mocks/membership-response.json", "utf-8"));
const issueCommentCreated = JSON.parse(fs.readFileSync("./mocks/issue-comment-created.json", "utf-8"));

test.before.each(() => {
    membershipResponse.state = "active";
    options.baseUrl = "https://github.robandpdx.demo-stack.com/api/v3";
});
test.after.each(() => {
    // nothing to do here
});

// Fail the workflow because the repo already exists
test("Fail the workflow because the repo already exists", async function () {
    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/repos/actions-approved/setup-packer_v1.2.3?owner=actions-approved&repo=setup-packer_v1.2.3`)
        .reply(201);

    try {
        await require('./initialize-request.js')({github, context, payload, options});
    } catch (err) {
        assert.equal(err.message, "Repo actions-approved/setup-packer_v1.2.3 already exists");
    }
    assert.equal(mock.pendingMocks(), []);
});

// Create the repo because it doesn't exist
test("Create the repo because it doesn't exist", async function () {
    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/repos/actions-approved/setup-packer_v1.2.3?owner=actions-approved&repo=setup-packer_v1.2.3`)
         .reply(404);

    mock.post(`/orgs/actions-approved/repos`, 
    (requestBody) => {
        assert.equal(requestBody.name, "setup-packer_v1.2.3");
        assert.equal(requestBody.org, "actions-approved");
        assert.equal(requestBody.visibility, 'private');
        assert.equal(requestBody.has_issues, true);
        assert.equal(requestBody.has_projects, false);
        assert.equal(requestBody.has_wiki, false);
        assert.equal(requestBody.description, "hashicorp-contrib/setup-packer@v1.2.3");
        assert.equal(requestBody.homepage, "https://github.com/hashicorp-contrib/setup-packer");
        return true;
    }
    ).reply(201);

    mock.put(`/repos/actions-approved/setup-packer_v1.2.3/actions/permissions`)
        .reply(204);

    await require('./initialize-request.js')({github, context, payload, options});
    assert.equal(mock.pendingMocks(), []);
});

// Change the repo visibility to internal on approval GHES 3.5
test("Change the repo visibility to internal on approval GHES 3.5", async function () {
    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/meta`).reply(200, meta35);
    mock.get(`/orgs/admin-ops/teams/actions-approvers/memberships/octocat?org=admin-ops&team_slug=actions-approvers&username=octocat`)
    .reply(200, membershipResponse);
    mock.patch(`/repos/actions-approved/setup-packer_v1.2.3`,
    (requestBody) => {
        assert.equal(requestBody.owner, "actions-approved");
        assert.equal(requestBody.repo, "setup-packer_v1.2.3");
        assert.equal(requestBody.visibility, 'internal');
        assert.equal(requestBody.archived, false);
        return true;
    }).reply(200);
    mock.patch(`/repos/admin-ops/request-marketplace-action/issues/12`,
    (requestBody) => {
        assert.equal(requestBody.owner, "admin-ops");
        assert.equal(requestBody.repo, "request-marketplace-action");
        assert.equal(requestBody.state, 'closed');
        return true;
    }).reply(200);
    mock.put(`/repos/actions-approved/setup-packer_v1.2.3/actions/permissions/access`,
    (requestBody) => {
        assert.equal(requestBody.owner, "actions-approved");
        assert.equal(requestBody.repo, "setup-packer_v1.2.3");
        assert.equal(requestBody.access_level, 'enterprise');
        return true;
    }).reply(200);

    await require('./approve-or-deny-request.js')({github, context, payload, options});
    assert.equal(mock.pendingMocks(), []);
});

// Change the repo visibility to internal on approval GHEC
test("Change the repo visibility to internal on approval GHEC", async function () {
    options.baseUrl = "https://api.github.com";

    let mock = nock("https://api.github.com");
    mock.get(`/orgs/admin-ops/teams/actions-approvers/memberships/octocat?org=admin-ops&team_slug=actions-approvers&username=octocat`)
    .reply(200, membershipResponse);
    mock.patch(`/repos/actions-approved/setup-packer_v1.2.3`,
    (requestBody) => {
        assert.equal(requestBody.owner, "actions-approved");
        assert.equal(requestBody.repo, "setup-packer_v1.2.3");
        assert.equal(requestBody.visibility, 'internal');
        assert.equal(requestBody.archived, false);
        return true;
    }).reply(200);
    mock.patch(`/repos/admin-ops/request-marketplace-action/issues/12`,
    (requestBody) => {
        assert.equal(requestBody.owner, "admin-ops");
        assert.equal(requestBody.repo, "request-marketplace-action");
        assert.equal(requestBody.state, 'closed');
        return true;
    }).reply(200);
    mock.put(`/repos/actions-approved/setup-packer_v1.2.3/actions/permissions/access`,
    (requestBody) => {
        assert.equal(requestBody.owner, "actions-approved");
        assert.equal(requestBody.repo, "setup-packer_v1.2.3");
        assert.equal(requestBody.access_level, 'enterprise');
        return true;
    }).reply(200);

    await require('./approve-or-deny-request.js')({github, context, payload, options});
    assert.equal(mock.pendingMocks(), []);
});

// Change the repo visibility to public on approval GHES 3.4
test("Change the repo visibility to public on approval GHES 3.4", async function () {
    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/meta`).reply(200, meta34);
    mock.get(`/orgs/admin-ops/teams/actions-approvers/memberships/octocat?org=admin-ops&team_slug=actions-approvers&username=octocat`)
    .reply(200, membershipResponse);
    mock.patch(`/repos/actions-approved/setup-packer_v1.2.3`,
    (requestBody) => {
        assert.equal(requestBody.owner, "actions-approved");
        assert.equal(requestBody.repo, "setup-packer_v1.2.3");
        assert.equal(requestBody.visibility, 'public');
        assert.equal(requestBody.archived, false);
        return true;
    }).reply(200);
    mock.patch(`/repos/admin-ops/request-marketplace-action/issues/12`,
    (requestBody) => {
        assert.equal(requestBody.owner, "admin-ops");
        assert.equal(requestBody.repo, "request-marketplace-action");
        assert.equal(requestBody.state, 'closed');
        return true;
    }).reply(200);

    await require('./approve-or-deny-request.js')({github, context, payload, options});
    assert.equal(mock.pendingMocks(), []);
});

// Change the repo visibility to internal on approval GHEC, uppercase comment
test("Change the repo visibility to internal on approval GHEC, uppercase comment", async function () {
    context.payload.comment.body = "Approve";
    options.baseUrl = "https://api.github.com";

    let mock = nock("https://api.github.com");
    mock.get(`/orgs/admin-ops/teams/actions-approvers/memberships/octocat?org=admin-ops&team_slug=actions-approvers&username=octocat`)
    .reply(200, membershipResponse);
    mock.patch(`/repos/actions-approved/setup-packer_v1.2.3`,
    (requestBody) => {
        assert.equal(requestBody.owner, "actions-approved");
        assert.equal(requestBody.repo, "setup-packer_v1.2.3");
        assert.equal(requestBody.visibility, 'internal');
        assert.equal(requestBody.archived, false);
        return true;
    }).reply(200);
    mock.patch(`/repos/admin-ops/request-marketplace-action/issues/12`,
    (requestBody) => {
        assert.equal(requestBody.owner, "admin-ops");
        assert.equal(requestBody.repo, "request-marketplace-action");
        assert.equal(requestBody.state, 'closed');
        return true;
    }).reply(200);
    mock.put(`/repos/actions-approved/setup-packer_v1.2.3/actions/permissions/access`,
    (requestBody) => {
        assert.equal(requestBody.owner, "actions-approved");
        assert.equal(requestBody.repo, "setup-packer_v1.2.3");
        assert.equal(requestBody.access_level, 'enterprise');
        return true;
    }).reply(200);

    await require('./approve-or-deny-request.js')({github, context, payload, options});
    assert.equal(mock.pendingMocks(), []);
});

// Change the repo to archived on denial
test("Change the repo to archived on denial", async function () {
    context.payload.comment.body = "deny"
    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/orgs/admin-ops/teams/actions-approvers/memberships/octocat?org=admin-ops&team_slug=actions-approvers&username=octocat`)
    .reply(200, membershipResponse);
    mock.patch(`/repos/actions-approved/setup-packer_v1.2.3`,
    (requestBody) => {
        console.log(requestBody);
        assert.equal(requestBody.owner, "actions-approved");
        assert.equal(requestBody.repo, "setup-packer_v1.2.3");
        assert.equal(requestBody.visibility, 'private');
        assert.equal(requestBody.archived, true);
        return true;
    }).reply(200);
    mock.patch(`/repos/admin-ops/request-marketplace-action/issues/12`,
    (requestBody) => {
        assert.equal(requestBody.owner, "admin-ops");
        assert.equal(requestBody.repo, "request-marketplace-action");
        assert.equal(requestBody.state, 'closed');
        return true;
    }).reply(200);

    await require('./approve-or-deny-request.js')({github, context, payload, options});
    assert.equal(mock.pendingMocks(), []);
});

// Change the repo to archived on denial, uppercase comment
test("Change the repo to archived on denial, uppercase comment", async function () {
    context.payload.comment.body = "Deny"
    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/orgs/admin-ops/teams/actions-approvers/memberships/octocat?org=admin-ops&team_slug=actions-approvers&username=octocat`)
    .reply(200, membershipResponse);
    mock.patch(`/repos/actions-approved/setup-packer_v1.2.3`,
    (requestBody) => {
        console.log(requestBody);
        assert.equal(requestBody.owner, "actions-approved");
        assert.equal(requestBody.repo, "setup-packer_v1.2.3");
        assert.equal(requestBody.visibility, 'private');
        assert.equal(requestBody.archived, true);
        return true;
    }).reply(200);
    mock.patch(`/repos/admin-ops/request-marketplace-action/issues/12`,
    (requestBody) => {
        assert.equal(requestBody.owner, "admin-ops");
        assert.equal(requestBody.repo, "request-marketplace-action");
        assert.equal(requestBody.state, 'closed');
        return true;
    }).reply(200);

    await require('./approve-or-deny-request.js')({github, context, payload, options});
    assert.equal(mock.pendingMocks(), []);
});

// Membership not active 404
test("Membership not active 404", async function () {
    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/orgs/admin-ops/teams/actions-approvers/memberships/octocat?org=admin-ops&team_slug=actions-approvers&username=octocat`)
    .reply(404);

    try {
        await require('./approve-or-deny-request.js')({github, context, payload, options});
    } catch (err) {
        assert.equal(err.message, "Error checking membership");
    }
    assert.equal(mock.pendingMocks(), []);
});

// Membership not active
test("Membership not active", async function () {
    membershipResponse.state = "inactive";

    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/orgs/admin-ops/teams/actions-approvers/memberships/octocat?org=admin-ops&team_slug=actions-approvers&username=octocat`)
    .reply(200, membershipResponse);

    await require('./approve-or-deny-request.js')({github, context, payload, options});
    assert.equal(mock.pendingMocks(), []);
});

test.run();