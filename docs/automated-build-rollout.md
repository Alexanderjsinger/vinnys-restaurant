# Automated build rollout

This branch stacks on `codex/solo-owner-review-policy` (PR #57, head
`1ae5992842000ce12b3bcb7883228bc527169595`). It adds CI/security automation and the
Vite patch without adding a deployment workflow or changing site designs, D1,
Cloudflare targets, secrets or environment settings.

## What runs automatically after GitHub activates these files

On PRs, main pushes and merge queues, `.github/workflows/ci.yml` runs:

1. Node 22 install, typecheck, regression tests and Vinext build.
2. Lockfile vulnerability audit; high/critical findings block the gate.
3. Versioned, checksum-verified Gitleaks scan of reachable history, with redaction.
4. CodeQL JavaScript/TypeScript scan plus SARIF validation. Missing reports,
   failed scanner execution or any finding blocks the gate.
5. Checksum-verified actionlint validates workflow syntax and expressions.
6. `release-gate` requires every preceding job to exist and succeed. Failure,
   cancellation or skipping is not a pass.

Dependabot proposes npm/action updates. Actions use immutable upstream object
IDs. No workflow in this change publishes a Worker, merges a PR or posts the
owner's review comment. CodeQL eligibility and actual hosted runs remain
unverified until GitHub API/Actions access works.

## PR #57 verification with one command

```sh
node scripts/check-policy-pr.mjs 57
```

The read-only verifier checks the actual current policy head and owner comment,
reported check results, effective base-branch required checks, unresolved review
threads and clean GitHub mergeability. It rechecks head SHA at the end and fails
if the head changed. Missing API access, insufficient settings-read permissions,
no required checks, drafts, absent/stale comments and unverified conversations
remain blockers. Exit 0 is a preflight result, not authorization to merge.
Account identity alone cannot prove a human posted the comment; the agent must
never post it on the owner's behalf. The timestamp check can verify the comment follows the head commit's declared
date, but that is not proof it followed the latest push. The CLI therefore also
reports push freshness as BLOCKED until trusted branch-specific GitHub event
evidence is implemented. It cannot currently emit a ready disposition merely
from comment text/commit dates; it does not ask the owner to repeat a potentially
valid comment to work around missing evidence. This is explicitly incomplete
verification, not an operational merge gate.

This verifier is a read-only helper, not a GitHub-enforced comment gate. A trusted
comment-triggered required check is a separate future change; do not claim a
builder-editable script or report makes the review policy unbypassable.

## Remaining activation boundaries

- This old chat still blocks `api.github.com`, although the user has confirmed
  access in a new chat. No environment configuration changes are made here.
- Open the stacked CI PR into `codex/solo-owner-review-policy`; after PR #57 lands,
  retarget it to `codex/alternative-homepage`. Do not merge either automatically.
- Required status-check selection and conversation-resolution rules must be
  verified on GitHub. Do not enable impossible solo-owner approving-review rules.
- CRITICAL workflow/check changes need the owner's personal exact-head
  `Reviewed <SHA>` comment on the CI PR. PR #57's comment cannot approve a new SHA.
- Cloudflare token scope remains owner-dashboard verification. No deploy token is
  required for this CI workflow. The existing direct deployment-token bypass is
  unchanged and must be addressed in a later explicitly authorized credential
  transition.
- Deployment automation, its source-SHA artifact handoff and hosted smoke checks
  are deliberately separate from this build-only change.

## Local candidate evidence

- `npm ci`: passed with the candidate's own lockfile and Vite 8.3.8.
- `npm run ci`: typecheck/build passed; 75 tests passed, 2 skipped, 0 failed.
- `npm audit --package-lock-only --audit-level=high`: passed; 5 moderate findings
  remain visible, 0 high/critical. No exception or threshold reduction.
- actionlint 1.7.7: passed after the workflow-lint job was included in the gate.
- Gitleaks 8.24.2: reachable-history scan passed with the exact historical
  noncredential UUID exception documented in `.gitleaksignore`.
- Focused tests cover missing/skipped/cancelled jobs, malformed/finding SARIF,
  stale/non-owner comments, moving PR identity and absent/untrustworthy review
  timing. Independent read-only code review found no remaining concrete defects
  after remediation. This does not establish operational readiness.
- Live PR #57 verification remains BLOCKED by this chat's GitHub API restriction.
  No current-head owner comment, hosted run or branch protection is claimed as
  verified. The new CI diff is CRITICAL and needs its own exact-head owner review;
  it is not covered by an earlier comment on PR #57.
