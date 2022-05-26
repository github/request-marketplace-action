const { test } = require('uvu');
const assert = require('uvu/assert');
//const fs = require("fs");
//const mockFs = require("mock-fs");

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
};

const context = {
    payload: {
        repository: {
            name: "stale-repo-archiver",
        },
        organization: {
            login: "robandpdx-volcano",
            repos_url: "https://api.github.com/orgs/robandpdx-volcano/repos"
        }
    }
}

const allowedActionsForOrg = {
    "github_owned_allowed": true,
    "verified_allowed": false,
    "patterns_allowed": [
        "actions/setup-node@v2",
        "peter-murray/issue-body-parser-action@v1",
    ]
}

test.before.each(() => {
    // nothing to do here
});
test.after.each(() => {
    // nothing to do here
});

// This test will update the selected-actions in the actions-staging org
test("update selected-actions in the actions-staging org", async function () {
    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/orgs/actions-staging/actions/permissions/selected-actions`)
        .reply(200, allowedActionsForOrg);

    mock.put(`/orgs/actions-staging/actions/permissions/selected-actions`)
        .reply(204);

    let payload = {
        action: "hashicorp-contrib/setup-packer@v1"
    }

    await require('./initialize-request.js')({github, context, payload, options});
    assert.equal(mock.pendingMocks(), []);
});

// This test will NOT update the selected-actions in the actions-staging org
test("do NOT update selected-actions in the actions-staging org", async function () {
    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/orgs/actions-staging/actions/permissions/selected-actions`)
        .reply(200, allowedActionsForOrg);

    let payload = {
        action: "peter-murray/issue-body-parser-action@v1"
    }

    await require('./initialize-request.js')({github, context, payload, options});
    assert.equal(mock.pendingMocks(), []);
});

test.run();