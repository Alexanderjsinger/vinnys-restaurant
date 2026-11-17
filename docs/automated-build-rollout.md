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

- GitHub API access now works. Actions log-download hosts still return Forbidden,
  and the integration cannot read classic branch protection, code-scanning alerts
  or repository security settings (HTTP 403). No environment configuration changes
  were made to obtain access.
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
- PR #57's current head is `1ae5992842000ce12b3bcb7883228bc527169595`;
  its owner-account comment matches that SHA and the reported CI check passed.
  Trusted latest-push timing remains unverified; repeating the comment is not
  a substitute for that missing evidence. The new CI diff is CRITICAL and needs
  its own exact-head owner review; PR #57's comment does not approve PR #58.

## Hosted investigation — November 17, 2026

The original [hosted run](https://github.com/Alexanderjsinger/vinnys-restaurant/actions/runs/44146981129)
passed build/tests and workflow lint, but failed audit, secrets, CodeQL validation
and the aggregate gate. Follow-up work preserves those blocking checks:

- Full-ref Gitleaks reproduction found the same documented noncredential Worker
  version UUID on a second historical commit. Added only the exact
  commit/file/rule/line fingerprint, not a value-wide exclusion. The subsequent
  [hosted run](https://github.com/Alexanderjsinger/vinnys-restaurant/actions/runs/44150035503)
  passed secret scanning, build/tests and workflow lint.
- CodeQL analysis/upload succeeded, but SARIF contained one result:
  `js/incomplete-url-substring-sanitization`, `tests/stores.test.mjs:150`.
  The sitemap test now compares complete `<loc>` entries instead of substrings.
  Local synthetic fixtures verified valid locations pass and a URL embedded in
  another address fails. Redacted annotations expose only failure categories
  and validated rule/location metadata, never result text or snippets. Eight
  focused gate tests passed. Consult the latest PR check results for hosted
  validation of this fix.
- A fresh audit reproduces high-severity
  [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)
  in transitive picomatch. The advisory reports no patched version and npm's
  latest version remains 4.0.7, inside the affected range. The older zero-high
  audit above is historical, not the current result. No exception, forced
  override, or severity-threshold reduction was applied. This remains a blocker.

Read-only GitHub control evidence:

- Branch metadata for `main`, `codex/alternative-homepage` and
  `codex/solo-owner-review-policy` reports `protected: false`, protection disabled,
  empty required check contexts and enforcement `off`.
- Repository rulesets (including parents) and effective branch rules returned
  empty lists. CI's aggregate failure is verified, but no required merge-check
  enforcement is established. Classic protection details remain inaccessible
  (403); do not interpret that error alone as proof of absence.
- The environments API returns zero environments. There is no configured
  `vinnys-comparison` environment approval gate. Auto-merge is disabled.
- Code-scanning and vulnerability-alert configuration APIs return 403. Hosted
  CodeQL execution is verified; secret-scanning/push-protection settings remain
  unverified. Owner-comment enforcement is still a manual policy control.

Both PRs remain unmerged; PR #58 remains draft. No deployment, environment/settings
change, credential transition or owner-review comment was performed. This is
failure triage, not an independent security/release PASS.
