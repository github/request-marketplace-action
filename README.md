# request-marketpalce-action

Include in your issue, the following markdown...

```
    ```json request
    {
        "owner": "hashicorp-contrib",
        "repo": "setup-packer",
        "ref": "v1"
    }
    ```
```

## Prerequisites
1. You must have [enabled GitHub Actions for GitHub Enterprise Server](https://docs.github.com/en/enterprise-server@3.4/admin/github-actions/enabling-github-actions-for-github-enterprise-server)
1. You must have [enabled automatic access to GitHub.com actions using GitHub Connect](https://docs.github.com/en/enterprise-server@3.4/admin/github-actions/managing-access-to-actions-from-githubcom/enabling-automatic-access-to-githubcom-actions-using-github-connect).
1. Configure the org where this repo resides to allow the following actions:
    - actions/setup-node@v2
    - peter-murray/issue-body-parser-action@v1
1. Configure this repo with a sercret named `TOKEN` with the value of a PAT that has admin:org rights on your GHEC server.
1. Configure this repo with a secret names `GHTOKEN` 