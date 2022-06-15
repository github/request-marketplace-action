# request-marketpalce-action

## Background
In [GitHub Enterprise Server](https://docs.github.com/en/enterprise-server) you can allow access to [marketplace actions](https://github.com/marketplace?type=actions) by configuring [GitHub Connect](https://docs.github.com/en/enterprise-server/admin/github-actions/managing-access-to-actions-from-githubcom/enabling-automatic-access-to-githubcom-actions-using-github-connect). However, controlling which actions can be used comes at a huge administrative cost, as you would need to configure each org to allow the actions you approve of. Sometimes org admins are not the appropriate people to decide what actions are allowed or not. You may want to control allowed action for the entire enterprise. In this case, you want to host the approved marketplace actions in an org within your enterprise. This repo provides two actions workflows to help manage the process of requesting marketplace actions and approving or denying such requests: Initialize Marketplace Action Request and Approve or Deny Marketplace Action Request

## Workflows
**Initialize Marketplace Action Request** is triggered when a user opens an issue requesting a spicific marketplace action. The marketplace actions is "staged" as a private repo in your org where you intend to host the approved actions. Within this private repo, admins can review the marketplace action code and determine if it is appropriate for use within your enterprise. 

**Approve or Deny Marketplace Action Request** is triggered when a user comments on an issue. If the user commenting is a member of the approvers team, and the comment includes the work "approve", then the visibility of the repo create by the previous workflow is changed from "private" to "internal" and the issue is closed. If the user commenting is a member of the approvers team, and the comment includes the work "deny", then the repo create by the previous workflow is put in "archive" mode and remains "private".

## Requesting a marketplace action
To request a marketplace action, open an issue in this repo. Include in your issue, the following markdown...

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
1. Configure this repo with a sercret named `TOKEN` with the value of a PAT that has `admin:org`, `repo`, and `workflow` scope on your GHEC server.
1. Configure this repo with the following repo secrets and note their values below. These are not really secrets, but rather config values that should be known.  
`ADMIN_OPS_ORG`: admin-ops  
`ACTIONS_APPROVED_ORG`: actions-approved  
`ACTIONS_APPROVERS_TEAM`: actions-approvers  