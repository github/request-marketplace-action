const { test } = require('uvu');
const assert = require('uvu/assert');
//const fs = require("fs");
//const mockFs = require("mock-fs");

const nock = require("nock");
nock.disableNetConnect();

const { Octokit } = require("@octokit/rest");
const github = new Octokit({
    auth: "secret123",
    userAgent: 'myApp v1.2.3',
    event: {
        issue: {
            number: 1
        }
    }
});

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

const payload = {
    actions: "hashicorp-contrib/setup-packer@v1"
}

test.before.each(() => {
    // nothing to do here
});
test.after.each(() => {
    // nothing to do here
});

// This test finds some repos that are not stale
test("find no stale repos", async function () {
    await require('./initialize-request.js')({github, context, payload});
    //assert.equal(mock.pendingMocks(), []);
});

test.run();