const { test } = require('uvu');
const assert = require('uvu/assert');

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

// Fail the workflow because the repo already exists
test("Fail the workflow because the repo already exists", async function () {
    let mock = nock("https://github.robandpdx.demo-stack.com/api/v3");
    mock.get(`/repos/actions-approved/setup-packer_v1?owner=actions-approved&repo=setup-packer_v1`)
         .reply(201);

    let payload = {
        owner: "hashicorp-contrib",
        repo:"setup-packer",
        ref: "v1"
    }

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
        console.log(requestBody);
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
    
    let payload = {
        owner: "hashicorp-contrib",
        repo:"setup-packer",
        ref: "v1"
    }

    await require('./initialize-request.js')({github, context, payload, options});
    assert.equal(mock.pendingMocks(), []);
});

test.run();