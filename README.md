# request-marketplace-action

## Background
In [GitHub Enterprise Server](https://docs.github.com/en/enterprise-server) you can allow access to [marketplace actions](https://github.com/marketplace?type=actions) by configuring [GitHub Connect](https://docs.github.com/en/enterprise-server/admin/github-actions/managing-access-to-actions-from-githubcom/enabling-automatic-access-to-githubcom-actions-using-github-connect). However, controlling which actions can be used comes at a huge administrative cost, as you would need to configure each org to allow the actions you approve of. Sometimes org admins are not the appropriate people to decide what actions are allowed or not. You may want to control allowed action for the entire enterprise, which can be done through the Enterprise Settings>Policies>Actions. However, there is no API to automate updating this setting, and there is no way to stage actions and allow admins to evaluate them prior to approval for wider use within your enterprise. The same issue exist for managing access to marketplace actions in [GitHub Enterprise Cloud](https://github.com/enterprise). In these case, you want to host the requested marketplace actions in an org within your enterprise as private repos, allowing admins to evaluate the actions prior to making them available within your enterprise. Upon approval, the visibility of the repo changes so that the action is available to users within your enterprise.  

This project provides two actions workflows to help manage the process of requesting marketplace actions and approving or denying such requests: Initialize Marketplace Action Request and Approve or Deny Marketplace Action Request

## Workflows
**Initialize Marketplace Action Request** is triggered when a user opens an issue requesting a spicific marketplace action. The marketplace actions is "staged" as a private repo in your org where you intend to host the approved actions. Within this private repo, admins can review the marketplace action code and determine if it is appropriate for use within your enterprise. 

**Approve or Deny Marketplace Action Request** is triggered when a user comments on an issue. If the user commenting is a member of the approvers team, and the comment includes the word "approve", then the visibility of the repo create by the previous workflow is changed from "private" to "internal" (GHEC EMU and GHES >= 3.5, for GHES < 3.5 repos become "public" on approval) and the issue is closed. If the user commenting is a member of the approvers team, and the comment includes the word "deny", then the repo create by the previous workflow is put in "archive" mode and remains "private".

## Requesting a marketplace action
To request a marketplace action, open an issue in this repo. Include in your issue, the following markdown...

```
    ```json request
    {
        "owner": "hashicorp-contrib",
        "repo": "setup-packer",
        "version": "latest"
    }
    ```
```
The example above refers to the repo `https://github.com/hashicorp-contrib/setup-packer`. The value of the `version` field needs to either match exactly a release in the repo, or be `latest`. The value of `latest` will cause the workflow to find the latest release available currently.  
See [examples.md](examples.md) for more examples.

## Prerequisites
1. [GitHub Enterprise Server v3.x](https://docs.github.com/en/enterprise-server@3.5/get-started/onboarding/getting-started-with-github-enterprise-server) or [GitHub Enterprise Managed Users (EMU) Account on GitHub.com](https://docs.github.com/en/enterprise-cloud@latest/admin/identity-and-access-management/using-enterprise-managed-users-for-iam/about-enterprise-managed-users).
1. You must have [enabled GitHub Actions for GitHub Enterprise Server](https://docs.github.com/en/enterprise-server@3.4/admin/github-actions/enabling-github-actions-for-github-enterprise-server).
1. You have an org created where you intend to host your approved actions. Let's call it `actions-approved` for now.
1. You have an org created where you intend to host the repos that will run these workflow. Let's call it `admin-ops` for now.
1. You have a team created within the `admin-ops` org. Members of this team will be able to approve or deny requests for marketplace actions. Let's call it `actions-approvers` for now.
1. You need runners available to the repo or org where you intend to run these workflows. Currently the workflow are configured to use `self-hosted` runners.

## Setup
1. Configure this repo with a sercret named `TOKEN` with the value of a PAT that has `admin:org`, `repo`, and `workflow` scope on your GHEC server.
1. Configure this repo with the following repo secrets and note their values below. These are not really secrets, but rather config values that should be known.  
`ADMIN_OPS_ORG`: admin-ops  
`ACTIONS_APPROVED_ORG`: actions-approved  
`ACTIONS_APPROVERS_TEAM`: actions-approvers  
1. Configure the Enterprise Actions Policies to allow select actions. Allow specified actions as follows:
    - peter-murray/issue-body-parser-action@v1 (required by these workflows)

## Installing these workflows into another repo
You may already have requests for marketplace actions occuring in another repo, and want to simply use these workflows in that repo.
1. Make sure the [prerequisutes](#prerequisites) above are met.
1. Follow the [setup](#setup) instructions above on the repo you intent to use.
1. Move the contents of the this repos .github directory into the .github directory of the repo you intent to use. Be careful not to clobber any existing files in the .github repo!
