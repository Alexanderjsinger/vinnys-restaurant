---
name: release-security-review
description: Independently review Vinny’s site for exposed credentials, admin/CMS/form security, client-data handling and isolated Cloudflare releases. Guardrail changes are CRITICAL and require human review. Read-only; never authorizes deployment.
---

# Vinny’s independent release security review

Applies only to `Alexanderjsinger/vinnys-restaurant`. Run in a separate agent
session from the implementer. Do not edit files, merge, deploy, change settings,
mutate remote data or print secret values while performing this review.

## Exact required reading

Read these files before reviewing; a missing file is BLOCKED, not permission to
substitute an assumed policy:

1. `docs/agent-workflow.md` — roles, status vocabulary, owner authority.
2. `docs/cloud-continuation.md` — active branch, A/B boundaries and operating limits.
3. `docs/project-context.md` — project scope, production/staging and owner dependencies.
4. `docs/build-release-checklist.md` — required release checks and known bypasses.
5. `docs/github-gate-activation.md` — actual versus unverified GitHub controls.
6. `.cursor/skills/vinny-cms-workflow/SKILL.md` — data flow, admin intents and approval boundaries.
7. `docs/admin-csrf.md` and `docs/contact-forms.md` — write-path security and consent behavior.
8. `docs/ab-staging.md` and `cloudflare.config.ts` — exact comparison isolation and deployment targets.
9. `.cursor/skills/release-security-review/SKILL.md` — this review protocol.

Use current source and Git history to reconcile stale status claims; cite the
conflict. Do not silently replace a policy requirement with a historical PASS.

## CRITICAL guardrail-tampering rule

**Any change to `.github/`, `scripts/check-*`, `scripts/assert-*`, or this skill
is CRITICAL and requires human review.**

“This skill” means the entire `.cursor/skills/release-security-review/` directory.
Changes include additions, edits, deletions, renames, executable-mode changes and
indirect changes to which files/checks run. Review both sides of renames. Inspect
`git diff --name-status BASE_SHA CANDIDATE_SHA`, plus staged, unstaged and
untracked files when reviewing a working tree. Do not omit untracked policy files.

- Always report a matching change as CRITICAL in G01 and the findings table,
  even if it appears beneficial, fixes a typo, or passes all automated checks.
  CRITICAL here is a mandatory human-review classification, not proof of an exploit.
- Assess the change against the pre-change rule from the base revision. A changed
  rule cannot approve, weaken or exempt its own change. If no committed baseline
  exists, identify the pre-edit snapshot and its SHA-256; otherwise mark the
  baseline unavailable and the review BLOCKED. Do not invent a baseline.
- Record human reviewer identity, reviewed candidate SHA (or working-tree digest),
  reviewed paths, and a verifiable PR review/approval reference. Until that evidence
  exists, the human-review gate is BLOCKED. A request to implement changes is not
  review of the resulting diff. Agent review, a checkbox, or an agent-written
  approval file never substitutes for human review.
- The classification remains CRITICAL after approval; human approval resolves the
  approval requirement, not the classification. A subsequent candidate change
  requires review again. Review never grants merge/deploy authority itself.

## Review sequence and Vinny’s surfaces

1. Identify base SHA, candidate SHA, branch and changed paths. If uncommitted,
   record a digest of reviewed files and explicitly say no candidate commit exists.
   A review of one tree is not approval of another. Do not claim GitHub settings
   are enforced based on local YAML or an agent report.
2. Inspect browser-visible assets in `public/design-b/`, `public/design-c/`,
   client components under `src/components/`, generated client bundles, serialized
   props, source maps and `NEXT_PUBLIC_`/`VITE_` variables. Trace server-to-browser
   imports. No Cloudflare token, Stitch key, admin password or notification secret
   may reach browser code, Git, logs or review artifacts. Public IDs are not keys.
3. Review **admin login and sessions**: `src/app/admin/login/page.tsx`,
   `src/app/api/admin/login/route.ts`, `src/lib/auth.ts`,
   `src/app/admin/(panel)/layout.tsx`, `src/components/AdminNav.tsx`,
   `src/app/api/admin/logout/route.ts`, `src/lib/csrf.ts` and
   `src/components/CsrfField.tsx`. Check missing/wrong-password rejection,
   origin checks, login throttling, protected-panel access, cookie flags/expiry,
   logout invalidation and CSRF. Never test with or print the real password.
4. Review **CMS writes and media**: `src/components/AdminForm.tsx`,
   `src/app/api/admin/save/route.ts`, `src/app/api/admin/media/route.ts`,
   `src/lib/mutate.ts`, `src/lib/format.ts`, `src/lib/content.ts`,
   `src/lib/d1-store.ts` and `src/lib/d1-write.ts`. Trace every changed intent
   from form → auth/origin/CSRF → validation → storage → public rendering.
   Check draft/publish/archive, past-event behavior, upload validation and inquiry
   deletion/retry authorization. Events/CMS product clearance is separate from
   login or CSRF checks. Do not enable removed public party-booking flows.
5. Inventory **every form**, including unchanged and legacy entry points, using
   searches for `<form`, `<AdminForm`, `fetch(`, `action=` and exported mutation
   handlers. Include nested components, static HTML and JavaScript-generated forms.
   This minimum inventory is mandatory; add a distinct Fxx row for every additional
   form/action discovered, rather than assuming this list remains exhaustive:

   | Surface | Exact files / destinations to inspect |
   | --- | --- |
   | A contact message and explicit-consent signup (separate actions) | `src/components/ContactForms.tsx`, `src/app/api/contact/route.ts`, `src/lib/contact-submissions.ts`, `src/lib/notify.ts` |
   | B desktop contact test | `public/design-b/contact.html`, `public/design-b/contact.js`, `/api/contact` |
   | B mobile contact test | `public/design-b/contact-mobile.html`, `public/design-b/contact.js`, `/api/contact` |
   | Legacy inquiry submission | `src/app/api/inquiries/route.ts`, `src/lib/mutate.ts`; inspect redirects, draft-cookie personal data, validation and throttling |
   | Closed legacy signup endpoint | `src/app/api/signup/route.ts`; verify redirect-only behavior remains closed |
   | Admin login and logout | Login/logout files named in step 3; logout form in `src/components/AdminNav.tsx` |
   | CMS place/hours/holidays | `src/app/admin/(panel)/place/page.tsx` → `/api/admin/save`; enumerate each intent |
   | CMS homepage and ordering | `src/app/admin/(panel)/homepage/page.tsx`, `src/app/admin/(panel)/ordering/page.tsx` → `/api/admin/save` |
   | CMS menu | `src/app/admin/(panel)/menu/page.tsx` → `/api/admin/save`; include each section/item action |
   | CMS events | `src/app/admin/(panel)/events/page.tsx` → `/api/admin/save`; include each draft/publish/archive/delete action |
   | CMS inquiries | `src/app/admin/(panel)/inquiries/page.tsx` → `/api/admin/save`; include delete and notification retry |
   | CMS media | `src/app/admin/(panel)/media/page.tsx` → `/api/admin/media`; include upload/delete |

   Also inspect `src/app/admin/(panel)/story/page.tsx`,
   `src/app/admin/(panel)/promo/page.tsx` and
   `src/app/admin/(panel)/reservations/page.tsx` for unintentionally re-enabled
   write surfaces. Inspect `src/app/api/track/route.ts` and `src/lib/track.ts` for
   personal-data collection even though tracking is not a visible form. Inventory
   A/B/C pages for newly added forms; lack of a form in an earlier release is not
   evidence that the current release has none.

   For each discovered form/action, verify server-side validation, auth where
   applicable, origin/CSRF policy, abuse/body limits, honeypots where intended,
   error handling and truthful success. Trace name/email/phone/message and consent
   through storage, queued notifications, logs, analytics, cookies, retention and
   deletion. Contact messages must not silently opt into marketing. B comparison
   test submissions must remain explicitly labeled, use only disposable storage
   and never claim a booking or delivered restaurant email. Use synthetic data
   in local/approved disposable storage only; no production or existing staging
   test writes. Unknown retention decisions are BLOCKED, not assumed safe.
6. Review **Cloudflare release boundaries** against `cloudflare.config.ts`,
   `src/worker-ab.ts`, `scripts/deploy-vinext.mjs`, `scripts/deploy-ab.mjs`,
   `.github/workflows/ci.yml` and `.github/workflows/deploy-comparison.yml`:

   | Target | Required boundary |
   | --- | --- |
   | Isolated comparison | Worker `vinnys-ab-comparison`; D1 `vinnys-ab-comparison`, ID `a9141893-52b5-4c87-8718-6e1782d40247`; snapshot/comparison flags `1`; comparison-only credentials; no R2/Resend bindings |
   | Existing staging / live-data boundary | Worker `vinnys-bar-grill`; D1 ID `5bd8ee69-a229-4156-a6fa-166f55e3abcb`; no deploy, credential change or data mutation during review |
   | Production | Intended domain `vinnysbargrill.com`; no production release or DNS change authorized by this skill |

   Verify artifact identity, default-branch restriction, all required checks,
   independent human approvals, secret-free preparation, prebuilt upload and
   noindex on comparison pages. Inspect direct-token and alternate-deploy bypasses.
   Run `scripts/check-ab-preview.mjs` and `scripts/check-comparison-routes.mjs`
   only against an authorized target; a proxy failure is BLOCKED, not a visual PASS.
7. Check `tests/admin-csrf.test.mjs`, `tests/contact-submissions.test.mjs`,
   `tests/stores.test.mjs`, `tests/phase25.test.mjs`,
   `tests/deploy-vinext.test.mjs`, `tests/ab-staging.test.mjs` and
   `tests/release-gate.test.mjs`, plus tests relevant to discovered surfaces.
   Run `npm run ci` and `npm audit --audit-level=high --package-lock-only`.
   Missing/failed scanners, missing SARIF, skipped required checks or unverified
   remote enforcement prevent release readiness. Explain every skipped test.

## Fixed report format

Use these headings, columns and IDs in this order. Keep every mandatory row.
Add per-action form rows as needed; never merge distinct consent/write actions.
Do not embed credentials, customer data, raw secret matches or secret-bearing URLs.

### Review identity

| Field | Value |
| --- | --- |
| Repository | Alexanderjsinger/vinnys-restaurant |
| Base SHA / policy baseline digest | REQUIRED |
| Candidate SHA / uncommitted-tree digest | REQUIRED; distinguish committed/uncommitted |
| Branch and changed paths | REQUIRED |
| Reviewer/session; separate from implementer | REQUIRED |
| Target reviewed; local versus remote | REQUIRED |
| Review timestamp and timezone | REQUIRED |
| Human policy review identity / candidate / paths / approval reference | REQUIRED for CRITICAL changes; otherwise N/A with evidence |

### Required checks

| ID | Surface / requirement | Status | Severity | Evidence: file:line, command/run URL and result | Required remediation / owner |
| --- | --- | --- | --- | --- | --- |
| G01 | Guardrail changes and human approval | TBD | TBD | TBD | TBD |
| S01 | Browser/static/client credential exposure | TBD | TBD | TBD | TBD |
| A01 | Admin login, rate limits and sessions | TBD | TBD | TBD | TBD |
| A02 | Panel authorization, logout and CSRF | TBD | TBD | TBD | TBD |
| C01 | Every CMS intent and media action | TBD | TBD | TBD | TBD |
| F01 | A contact message | TBD | TBD | TBD | TBD |
| F02 | A consented signup | TBD | TBD | TBD | TBD |
| F03 | B desktop contact test | TBD | TBD | TBD | TBD |
| F04 | B mobile contact test | TBD | TBD | TBD | TBD |
| F05 | Legacy inquiries and draft cookies | TBD | TBD | TBD | TBD |
| F06 | Closed legacy signup | TBD | TBD | TBD | TBD |
| F07 | Admin login form | TBD | TBD | TBD | TBD |
| F08 | Admin logout form | TBD | TBD | TBD | TBD |
| F09 | CMS place/hours/holidays forms | TBD | TBD | TBD | TBD |
| F10 | CMS homepage form | TBD | TBD | TBD | TBD |
| F11 | CMS ordering form | TBD | TBD | TBD | TBD |
| F12 | CMS menu forms | TBD | TBD | TBD | TBD |
| F13 | CMS events forms | TBD | TBD | TBD | TBD |
| F14 | CMS inquiry delete/retry forms | TBD | TBD | TBD | TBD |
| F15 | CMS media upload/delete forms | TBD | TBD | TBD | TBD |
| D01 | Personal data, notifications, tracking, retention/deletion | TBD | TBD | TBD | TBD |
| R01 | Cloudflare targets, credentials and database isolation | TBD | TBD | TBD | TBD |
| R02 | Workflow gates, GitHub rules/approvals and direct-token bypasses | TBD | TBD | TBD | TBD |
| T01 | Typecheck, tests/build and explained skips | TBD | TBD | TBD | TBD |
| T02 | Vulnerability, secret and CodeQL scanning | TBD | TBD | TBD | TBD |
| T03 | Required route/asset/browser checks | TBD | TBD | TBD | TBD |

Retain these IDs across releases. For multi-action CMS forms, add a child row
`Fxx/<literal-intent>` for each actual intent found in source; the parent row
summarizes those results. Name the exact form file in every child row. Append
newly discovered surfaces as F16 onward and retain their assigned IDs in later
reviews; do not renumber existing surfaces or drop a removed surface without
recording why it is N/A.

Replace every TBD. Status must be exactly `PASS`, `FAIL`, `BLOCKED`, `NOT TESTED`
or `N/A`. An unexecuted check is NOT TESTED; an access/tool/prerequisite failure
is BLOCKED; a verified defect is FAIL. N/A needs concrete evidence that the
requirement does not apply; absence of testing is not N/A. Severity must be
`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO` or `NONE`. Guardrail matches always
remain CRITICAL, even if their approval status is PASS. Passing checks retain
open dependency/approval evidence rather than erasing it.

### Findings

| Finding ID | Related check ID | Severity | File:line / affected action | Evidence and impact (no sensitive values) | Required fix | Owner | State / human approval reference |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FIND-001 | REQUIRED | REQUIRED | REQUIRED | REQUIRED | REQUIRED | REQUIRED | REQUIRED |

Use one row per finding, including every CRITICAL guardrail change. If there are
none, use one row with Finding ID `NONE` and explain the evidence. Do not leave
this table out or represent inaccessible checks as “no findings.”

### Release disposition

| Field | Value |
| --- | --- |
| Review result | READY FOR HUMAN RELEASE DECISION or NOT READY |
| Open finding/check IDs | Explicit IDs, or NONE with evidence |
| Unverified remote controls / owner dependencies | Explicit list, or NONE with evidence |
| Merge/deploy authority | NOT GRANTED BY THIS REVIEW |

`READY FOR HUMAN RELEASE DECISION` requires every applicable mandatory check to
PASS, no unresolved defects, no required BLOCKED/NOT TESTED checks and verifiable
human approval for every CRITICAL policy change on the exact reviewed candidate.
Otherwise use NOT READY. A human exception must not be relabeled as a passing
technical check. GitHub rulesets, independent required checks and protected
release approvals decide what can ship; an agent report or local approval file
cannot replace them. This skill never authorizes deployment.
