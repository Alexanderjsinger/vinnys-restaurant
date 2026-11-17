# Build and release standard

Applies to Vinny's builds and can be copied to other repositories. Preserve each
project's actual hosting platform: Vinny's uses Cloudflare Workers and D1;
there is no reason to migrate it to Netlify to gain these controls.

## Required review, starting with the largest risks

| Area | Required evidence | Block when |
| --- | --- | --- |
| Keys in browser code | Inspect public/static files, client imports, serialized page props, source maps, NEXT_PUBLIC_/VITE_ variables and network requests; Gitleaks history scan | Any private credential reaches the browser, logs or Git history; scanner unavailable |
| Client information | Trace name/email/phone/message from input to storage, notification, analytics/logging and deletion; test only synthetic isolated records | Unnecessary collection, undisclosed third-party transmission, personal data in logs, unclear access controls or missing retention decision |
| Consent | Contact-message and marketing-signup paths remain separate; explicit consent tests pass | A message signs someone up without consent |
| Access and writes | Authentication, same-origin, CSRF, server validation, body/rate limits and unauthorized-request tests | Missing or weakened controls; validation only in browser |
| Dependencies | Lockfile review, npm audit including build tools, Dependabot PR review | High/critical vulnerabilities, missing/unreachable audit or unexplained lockfile changes |
| Static security analysis | CodeQL SARIF exists, scanner completed, no results | Missing reports, scanner failure, any finding pending remediation |
| Functional behavior | Typecheck, security/regression tests, Vinext build, relevant desktop/mobile browser evidence | Failing/missing tests, untested material behavior, unexplained skips |
| Isolation and credentials | Exact Worker/database names and IDs; deployment-only, comparison-specific credentials | Production binding in a comparison, shared production secrets, arbitrary deployment target |
| Release evidence | Exact candidate SHA, owner Reviewed-SHA comment for guardrails, all required checks and owner release approval | Stale review comment, missing check, skipped/cancelled check, bypass privileges |
| Post-deploy | A stylesheet/script smoke check, B/C HTML/noindex checks, appropriate browser/video verification | Broken routes/assets or inability to verify; mark deployed-but-unverified, never silently PASS |

An agent runs `.cursor/skills/release-security-review/SKILL.md` independently.
The implementer fixes findings; another agent review covers the new candidate.
For CRITICAL guardrail changes, the solo owner personally posts
`Reviewed <full current PR-head SHA>` after the latest commit/push. The comment
URL, author, timestamp and head SHA are verified; an earlier SHA does not count.
Agents must never post this owner comment, even using owner-account credentials. Never print discovered secret contents in a report.
For a leaked secret: identify file/location, revoke/rotate through the service's
secure interface, then handle Git history with an explicit owner-approved plan.
Removing the string alone does not revoke it.

## CI candidate and deployment follow-up

PR #57 is the policy-only baseline. This stacked CI branch now includes the
build/audit/secret/CodeQL/release-gate workflow, its gate scripts and the Vite
8.3.8 patch. These files are not evidence that GitHub has activated or enforced
them; hosted runs, owner review and ruleset verification remain required.
The comparison deployment workflow and uncommitted A/B/C implementation remain
outside this branch. See `docs/automated-build-rollout.md` for the precise scope.
Steps 1–3 below describe the CI candidate; steps 4–5 describe a proposed later
deployment change, not a deployment workflow included here.

1. PR/push/merge-queue CI runs build/tests, full lockfile vulnerability audit,
   Gitleaks across reachable Git history, and CodeQL.
2. `release-gate` accepts only successful results for every required job.
   Missing, skipped, cancelled, failed, malformed or empty results block it.
   CodeQL upload success is insufficient: the SARIF gate rejects findings.
3. The solo-owner GitHub ruleset requires successful status checks and resolved
   conversations, **not approving reviews**. Guardrail changes additionally need
   the owner's exact-SHA PR comment under the review skill. A new head SHA makes
   an earlier comment stale. This comment rule is not automatically enforced by
   the current workflows; until a trusted required check verifies it, report it
   as a manually verified policy control, not an unbypassable GitHub gate.
4. Manual `Deploy isolated comparison` accepts only the repository's default
   branch and reruns the same reusable CI on the exact checkout SHA. A separate
   secret-free job builds mode `ab` and uploads a SHA-named artifact. The protected
   `vinnys-comparison` job checks that artifact's SHA before the upload-only step
   receives secrets. Deployment-runner installation disables lifecycle hooks,
   and the guarded Node entry is called directly without npm pre/post hooks.
   No Vite build runs with deployment credentials in CI.
5. The comparison deploy guard validates bindings and invokes the supported cf
   deployment command. CI uses `--env ab --prebuilt` with the prepared artifact;
   local `--env ab` still builds first, stripping deployment variables from the
   child environment. A local secrets file is still readable to trusted build
   code in that workspace; the separate CI job is the stronger boundary. A post-deploy smoke failure
   fails the workflow; it does not roll back automatically or pretend the Worker
   was not published. Investigate and explicitly approve a known-good rollback.

This is deterministic orchestration with an independent review step. No agent
message, review file, local receipt or checkbox can override failing checks.
Scanners still have false negatives; passing this pipeline is not a guarantee
that all vulnerabilities have been found.

## One-time dashboard activation (not completed by these files)

GitHub API calls from this workspace returned `Forbidden`. Remote settings and
repository plan eligibility are **NOT VERIFIED**. YAML files in the working tree
are not active until committed, reviewed and merged. Do not claim an enforced
merge gate until the following settings have been configured and tested.

1. **Settings → Code security** (sometimes Security → Advanced Security): enable
   Dependabot alerts/security updates, secret scanning and push protection where
   the plan supports them. CodeQL advanced setup is supplied here; do not also
   enable a conflicting default CodeQL workflow. Private-repository CodeQL or
   secret scanning may require a paid security entitlement. Missing entitlement
   blocks this gate; choose and validate a supported scanner before replacing it.
2. **Settings → Rules → Rulesets**, target the actual default branch: require
   PRs, status checks (select the actual CI `release-gate` context), conversation
   resolution, up-to-date checks and protection against force pushes/deletions.
   **Do not enable Require approvals, required code-owner approval, or last-push
   approval for this solo-owner repo.** CODEOWNERS identifies the policy owner;
   it does not create a second human. For CRITICAL changes verify the owner's
   `Reviewed <full head SHA>` PR comment after the latest commit/push. The owner
   posts it personally; agents do not. A future comment-verification check must
   be implemented and configured before claiming tool-enforced owner review.
3. **Settings → Environments → vinnys-comparison**: restrict deployments to the
   default branch. Where required-reviewer controls are supported, allow the
   solo owner to approve their own release; do not enable prevent-self-review
   and invent a second reviewer. Record the actual supported control and its
   limits. Store only environment-scoped `COMPARISON_CLOUDFLARE_API_TOKEN` and
   `COMPARISON_ADMIN_PASSWORD` through the secret UI. Use only the existing
   isolated comparison password, never production/staging credentials. Missing
   secrets fail deployment. No remote settings or credentials are changed here.
4. Cloudflare token permissions must be as narrow as the installed tooling
   allows. Workers API tokens may have account-wide script access; naming a token
   “comparison” does not scope it to one Worker. Use a separate account if actual
   per-Worker isolation cannot be enforced. Do not change existing account,
   production secrets, staging or DNS as part of this rollout.
5. **Critical bypass**: the existing local CLI still accepts a runtime Cloudflare
   token, including the one used in this cloud workspace. GitHub protection cannot
   prevent a credential holder from using Cloudflare directly. After validating
   the Actions path, the owner must separately remove/restrict deployment tokens
   in agent workspaces and disconnect alternate auto-deploy paths. Existing
   Workers Builds must stay disconnected. No credentials were revoked or settings
   published by this implementation. Until that transition, this is a prepared
   gated path, not an unbypassable release system.
6. Prove enforcement with a disposable PR: a failed check blocks merge; a skipped
   required check blocks merge; a new commit invalidates the owner review comment; deployment
   from another branch fails; supported environment approval gates secret access. Use only the
   comparison target and synthetic data. Record the Actions run URLs and exact SHA.

GitHub check logs should never contain secret matches. Gitleaks uses full
redaction and no raw report upload. Its archive version is fixed and verified
against the publisher's checksum file. Action references are pinned to full upstream object IDs resolved through
`git ls-remote` for the v4 Actions and v3 CodeQL tags; this Git transport worked
while the GitHub settings API remained blocked. Dependabot can propose updates
for owner review. Pinning prevents silent tag movement; it is not an independent
audit of every line of upstream action code.

## Current boundaries

Existing A/B/C designs and CMS behavior are unchanged. No merge, deployment,
Netlify migration, DNS update, live data write, secret rotation or environment
publishing is part of preparing this pipeline. An independently reviewed PR and
explicit rollout approval remain required by this project's operating rules.


## Historical validation of separate workspace changes (not this candidate)

- `actionlint` 1.7.7: workflow validation passed. Versioned binary downloaded with
  publisher checksum verification; parser-only YAML validation also passed.
- Gitleaks 8.24.2 scanned 75 reachable historical commits. Its sole initial
  match was a documented Worker deployment UUID in `docs/phase-2-status.md:47`,
  not a credential. `.gitleaksignore` contains only that commit/file/rule/line
  fingerprint; new values and locations remain scanned. This exception is policy
  owned and must be independently reviewed.
- Full npm audit reported 11 vulnerabilities: 1 high, 5 moderate, 5 low. The high
  finding is in Vite; the current dependency resolution reports no available fix.
  Advisory report also includes transitive `fflate` issues. This is a release
  blocker under the proposed policy, not a statement that an exploit against the
  deployed Worker was reproduced. Triage development-server/build exposure and a
  supported upgrade path separately. Do not run an unreviewed `npm audit fix` or
  lower the audit threshold simply to make the gate pass.
- CodeQL hosted execution, GitHub settings and end-to-end gated deployment have
  not been validated here. The pipeline is prepared, not activated or certified.


The independent review caught credential exposure in the initial combined build /
publish design. Preparation and publishing now use separate runners. The review
also prompted lifecycle-hook suppression on the publishing runner, ownership of
all smoke/gate scripts, and B/C asset traversal rather than HTML-only checks.
No overall security/release PASS is claimed while hosted scanning and
enforcement checks remain unverified. The initial Vite audit finding was
subsequently remediated locally as recorded below.


Final local checks: `npm run ci` passed typecheck/build with **78 tests passed,
2 skipped**. Workflow lint passed. Gitleaks reachable-history and nonignored
candidate-file scans passed after the narrow false-positive clarification.
Six focused gate tests cover missing/skipped/cancelled checks, SARIF rejection,
missing font assets, credential stripping and prebuilt target validation. A
fresh installation with lifecycle scripts disabled succeeded and the installed
cf CLI initialized; real cross-runner deployment remains untested. Independent
read-only review found no remaining concrete implementation defects; remote activation and hosted
scanning blockers prevent an operational release PASS.
No deployment, merge, remote setting changes or credential changes were made.


## Vite remediation in the separate unmerged dependency change

Vite was narrowly updated from 8.3.0 to 8.3.8, with its required nested Rolldown
patch from 1.2.16 to 1.2.19. Other direct dependency versions are unchanged. The
registry's advisory ranges end at 8.3.2; despite the earlier audit's automatic
“no fix available” label, a compatible patched release was verified in npm.
A fresh lockfile audit reports **zero high/critical findings** and five moderate
findings in the existing fflate/Satori/OG/Vinext dependency chain. Those remain
visible; no advisory was ignored and the high-severity threshold was not lowered.

GitHub's network blocker is now identified, not guessed: `api.github.com` is
missing from the current enforced allowlist. Exact owner steps and read-only
verification commands: [GitHub gate activation](github-gate-activation.md).
No network settings, credentials or deployed Workers were changed.


Patched-version verification: `npm ci` installed Vite 8.3.8; `npm run ci`
passed typecheck, 78 tests / 2 skipped, and the normal build. Separate `ab` build
passed the comparison artifact guard. Local Worker smoke checks verified root A
and all 11 CSS/JS references, B/C HTML/noindex, and sizzle Range 206. No hosted
pages were redeployed. An independent dependency review confirmed the narrow
Vite/Rolldown changes and found no concrete compatibility defect. CI uses the
latest Node 22; this workspace used Node 24.22.1. The patch's optional WASM
fallback dependencies require Node 22.13+ (native Linux bindings remain present).


## Review tiers and solo-owner policy

Quick reviews run G01, S01, T01 and T02 plus affected surfaces. Full reviews run
all rows for live-site releases or admin/CMS/forms/tracking/Cloudflare/release
changes. Default to Full if uncertain. Exact protocol and fixed tables:
`.cursor/skills/release-security-review/SKILL.md`. Read-only automated smoke checks
may use only the comparison URL in `docs/ab-staging.md`, and nothing else.
Cloudflare token validity is not proof of least privilege: R01 lists actual token
permissions as unverified until the owner confirms them in Cloudflare's dashboard.
The owner's prior chat review approved the direction with requested fixes; it is
not the exact-head PR comment required to merge this amendment.


Historical policy-candidate boundary: PR #57 retained Vite 8.3.0 and older CI.
This stacked CI change adds the patch and build gates separately; record its own
validation below rather than borrowing another working tree’s PASS. Documentation-only
policy edits may use Quick review while retaining CRITICAL classification and
owner-comment requirements; executable release-tool changes require Full.
