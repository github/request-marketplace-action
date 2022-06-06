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
    baseUrl: "https://github.robandpdx.demo-stack.com/api/v3"
};

const context = {
    payload: {
        repository: {
            name: "stale-repo-archiver",
        },
        organization: {
            login: "robandpdx-volcano",
            repos_url: "https://api.github.com/orgs/robandpdx-volcano/repos"
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
    repo:"setup-packer",
    ref: "v1"
}

const membershipResponse = JSON.parse(fs.readFileSync("./mocks/membership-response.json", "utf-8"));
const issueCommentCreated = JSON.parse(fs.readFileSync("./mocks/issue-comment-created.json", "utf-8"));

test.before.each(() => {
    membershipResponse.state = "active";
});
test.after.each(() => {
    // nothing to do here
});

// Fail the workflow because the repo already exists
test("Fail the workflow because the repo already exists", async function () {
    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/repos/actions-approved/setup-packer_v1?owner=actions-approved&repo=setup-packer_v1`)
         .reply(201);

    try {
        await require('./initialize-request.js')({github, context, payload, options});
    } catch (err) {
        assert.equal(err.message, "Repo actions-approved/setup-packer_v1 already exists");
    }
        assert.equal(mock.pendingMocks(), []);
});

// Create the repo because it doesn't exist
test("Create the repo because it doesn't exist", async function () {
    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/repos/actions-approved/setup-packer_v1?owner=actions-approved&repo=setup-packer_v1`)
         .reply(404);

    mock.post(`/orgs/actions-approved/repos`, 
    (requestBody) => {
        assert.equal(requestBody.name, "setup-packer_v1");
        assert.equal(requestBody.org, "actions-approved");
        assert.equal(requestBody.private, true);
        assert.equal(requestBody.has_issues, true);
        assert.equal(requestBody.has_projects, false);
        assert.equal(requestBody.has_wiki, false);
        assert.equal(requestBody.description, "hashicorp-contrib/setup-packer@v1");
        assert.equal(requestBody.homepage, "https://github.com/hashicorp-contrib/setup-packer");
        return true;
    }
    ).reply(201);

    await require('./initialize-request.js')({github, context, payload, options});
    assert.equal(mock.pendingMocks(), []);
});

// Change the repo visibility to public on approval
test("Change the repo visibility to public on approval", async function () {
    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/orgs/admin-ops/teams/actions-approvers/memberships/octocat?org=admin-ops&team_slug=actions-approvers&username=octocat`)
    .reply(200, membershipResponse);
    mock.patch(`/repos/actions-approved/setup-packer_v1`,
    (requestBody) => {
        assert.equal(requestBody.owner, "actions-approved");
        assert.equal(requestBody.repo, "setup-packer_v1");
        assert.equal(requestBody.private, false);
        return true;
    })
    .reply(200);

    await require('./approve-or-deny-request.js')({github, context, payload, options});
    assert.equal(mock.pendingMocks(), []);
});

// Change the repo to archived on denial
test("Change the repo to archived on denial", async function () {
    context.payload.comment.body = "deny"
    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/orgs/admin-ops/teams/actions-approvers/memberships/octocat?org=admin-ops&team_slug=actions-approvers&username=octocat`)
    .reply(200, membershipResponse);
    mock.patch(`/repos/actions-approved/setup-packer_v1`,
    (requestBody) => {
        console.log(requestBody);
        assert.equal(requestBody.owner, "actions-approved");
        assert.equal(requestBody.repo, "setup-packer_v1");
        assert.equal(requestBody.archived, true);
        return true;
    })
    .reply(200);

    await require('./approve-or-deny-request.js')({github, context, payload, options});
    assert.equal(mock.pendingMocks(), []);
});

// Membership not active 404
test("Membership not active 404", async function () {
    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/orgs/admin-ops/teams/actions-approvers/memberships/octocat?org=admin-ops&team_slug=actions-approvers&username=octocat`)
    .reply(404);

    await require('./approve-or-deny-request.js')({github, context, payload, options});
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