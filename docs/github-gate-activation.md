# Activate and verify GitHub release controls

## Current access blocker

The managed environment reports a current, enforced restricted network policy.
`github.com` is allowed through the package-manager preset, but **`api.github.com`
is absent from the effective allowlist**. `gh api` returns `Forbidden` before we
can inspect repository settings. Git transport working does not verify API
access or GitHub administrative permissions.

In this cloud environment's networking settings, add **`api.github.com`** as an
exact allowed destination, retaining the existing destinations. The owner must
publish that targeted environment change and resume the workspace. No wildcard,
all-internet grant, Cloudflare credential change or GitHub token pasted into chat
is needed. This agent has not edited or published environment configuration.

Network access and identity are separate. Once the host is allowed, the existing
GitHub connection must have access to this repository. Reading branch rules and
environments may need Administration/Environments read permission; modifying
those settings requires the corresponding write permissions and a repository
administrator. Reauthorize the existing connection through the secure UI only if
the API then reports an authentication/authorization error. Do not give an agent
an unrestricted personal token just to get past the network restriction.

## Read-only checks after access is restored

```sh
gh api repos/Alexanderjsinger/vinnys-restaurant --jq '{default_branch,permissions}'
gh api repos/Alexanderjsinger/vinnys-restaurant/branches/main/protection
gh api repos/Alexanderjsinger/vinnys-restaurant/rules/branches/main
gh api repos/Alexanderjsinger/vinnys-restaurant/rulesets
gh api repos/Alexanderjsinger/vinnys-restaurant/environments/vinnys-comparison --jq '{name,protection_rules,deployment_branch_policy}'
```

Use the actual default branch reported by the first command if it differs from
`main`. A 404 on classic branch protection alone does **not** prove an unprotected
branch: active repository/organization rulesets must also be inspected. A 401/403
is BLOCKED, not proof that protection is absent. Merely finding a ruleset is not
proof that it applies: check its enforcement, branch conditions and bypass actors.

## Dashboard configuration to review and enable

- Rulesets: https://github.com/Alexanderjsinger/vinnys-restaurant/settings/rules
- Environments: https://github.com/Alexanderjsinger/vinnys-restaurant/settings/environments
- Security: https://github.com/Alexanderjsinger/vinnys-restaurant/settings/security_analysis

The local workflow changes must first be committed and independently reviewed in
a PR; no workflow is activated merely by editing this workspace. Do not merge all
existing uncommitted A/B/C work as a side effect of activating security controls.

For the default branch, require PRs, resolved conversations, the exact CI
`release-gate` status context only after the separate pipeline PR has introduced
it and it has actually run, up-to-date checks and force-push/deletion protection.
**Do not enable Require approvals, required code-owner reviews or last-push
approval requirements:** the only owner cannot approve their own PR in GitHub.
CODEOWNERS is an ownership map. For CRITICAL guardrail changes, the owner account
`Alexanderjsinger` personally posts `Reviewed <full current PR-head SHA>` after
the latest commit/push. Record and verify the comment author, URL, timestamp and
current head. Earlier-SHA comments do not count. An agent must never post/edit
this comment on behalf of the owner. The workflows do not yet enforce this
comment automatically; required status checks alone do not prove owner review.

For **`vinnys-comparison`**, allow only the default branch. If the repository's
plan supports protected-environment reviewers, allow the solo owner to approve
their own release; do not enable prevent-self-review and deadlock the release.
Document supported controls instead of claiming an independent second reviewer.
Store comparison-only deployment credentials through the environment's Secrets
UI, never in chat or Git. Confirm Cloudflare token permissions personally in its
dashboard; keep R01's token-scope control unverified until that owner check.

Enable secret scanning/push protection and CodeQL where the repository's plan
permits; this project supplies the advanced CodeQL workflow, so avoid enabling
a conflicting default workflow. Verify actual hosted scan results. The local
CodeQL SARIF validator passing unit tests does not mean CodeQL scanned this repo.

## Acceptance before calling the gate enforced

Use a disposable PR to demonstrate:

1. A failing or missing required check blocks merge.
2. A new commit makes the earlier owner review comment stale.
3. A non-default-branch release attempt fails before obtaining secrets.
4. Where supported, deployment pauses for the solo owner’s environment review.
5. The exact approved SHA is built without deploy credentials and its immutable
   artifact is used by the protected publishing job.

The comparison Worker is the only permitted deployment target for that later
exercise. Production/staging/DNS/live data remain outside this rollout. Existing
workspace Cloudflare deployment credentials are still a bypass of GitHub gates;
remove/restrict them only as a separately authorized credential transition after
the hosted release path is validated. No such credential changes occurred here.


PR #57 did not add the proposed release-gate/deployment workflows. This stacked
CI branch adds release-gate, but still no deployment workflow.
Do not configure a required context that has not been introduced and run: that
would block all merges without providing a working check. The new CI definition remains a candidate until its own PR is reviewed and
merged; it is not proof of remote enforcement.
