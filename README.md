# request-marketpalce-action

Include in your issue, the following markdown...

```
    ```json request
    {
        "owner": "hashicorp-contrib",
        "repo": "setup-packer"
    }
    ```
```
See [examples.md](examples.md) for more examples.

## Prerequisites
1. You must have [enabled GitHub Actions for GitHub Enterprise Server](https://docs.github.com/en/enterprise-server@3.4/admin/github-actions/enabling-github-actions-for-github-enterprise-server)
1. Configure the org where this repo resides to allow the following actions:
    - actions/setup-node@v2
    - peter-murray/issue-body-parser-action@v1
1. Configure this repo with a sercret named `TOKEN` with the value of a PAT that has admin:org and repo rights on your GHEC server.
1. Configure this repo with the following repo secrets and note their values below. These are not really secrets, but rather config values that should be known.  
ADMIN_OPS_ORG: admin-ops  
ACTIONS_APPROVED_ORG: actions-approved 
ACTIONS_APPROVERS_TEAM: actions-approvers  