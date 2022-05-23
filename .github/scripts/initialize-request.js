const { Octokit } = require("@octokit/rest");
const fs = require("fs");

let octokit;

module.exports = async ({github, context, payload}) => {
    console.log(`Found the following payload: ${JSON.stringify(payload)}`);
}