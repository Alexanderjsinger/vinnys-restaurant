# Project context — Vinny’s Bar & Grill

Repo: `Alexanderjsinger/vinnys-restaurant`  
Public brand: Vinny’s Bar & Grill (Ypsilanti). Intended eventual host for vinnysbargrill.com — **DNS is not changed by this project until the owner approves.**

**Git checkpoint (verified 2026-11-11):** `main` HEAD `057f651` — six merged PRs on `main` (#1–#4, #7, #6). Prior “seven PRs” claim was incorrect; treat this SHA as current until superseded.

## Who decides what

| Role | Owns |
| --- | --- |
| **Product Owner** | Merge, deploy, DNS, secrets, restaurant facts, R2/Resend enablement |
| **Coordinator** | Roadmap, architecture decisions, assignments, consolidating UX + QA for the owner (lives in the Cursor Project — **not** a `.cursor/agents/` file) |
| **Full-Stack Engineer** | Implementation in this repo |
| **UX/Design Reviewer** | Independent UX recommendations (no ship authority; custom subagent `readonly: true`) |
| **QA Reviewer** | Independent verification with PASS/FAIL/BLOCKED/NOT TESTED (no ship authority; custom subagent `readonly: true`) |

Agent role specs: [`.cursor/agents/`](../.cursor/agents/). Workflow: [`agent-workflow.md`](agent-workflow.md).

## Current status (revisable with evidence)

- **Phase 2** CMS + public site imported and live on staging Workers; D1 is the content/inquiry store.
- **Phase 2.5** code-level reliability/security work is on `main` (notify queue, media hardening, CI, security headers helper, Referer tightening, hero/storefront parity docs/QA). See [`phase-2-5-handoff.md`](phase-2-5-handoff.md).
- **Staging vs `main`:** staging worker may lag GitHub `main` until an authorized deploy. Security headers and latest `main` parity are **not** assumed live until deploy evidence exists.
- **Permanent AI loop:** three custom subagents under `.cursor/agents/` with Cursor YAML frontmatter; Coordinator remains Project-side only.
- **No DNS cutover.** No production domain change without owner approval.

## Outstanding work (summary)

| Item | Owner | Notes |
| --- | --- | --- |
| GitHub → Cloudflare staging sync (authorized deploy of `main`) | Eng after owner approve | Required before treating staging as `main`-accurate |
| Cloudflare R2 + `MEDIA` binding + upload smoke | Owner enable → Eng bind/deploy | BLOCKED on account R2 enablement (API 10042 historically) |
| Resend secrets + notify email + Retry queue | Owner secrets → Eng verify | Party notes already persist without email |
| Confirm hours, notify/place email, Toast URL, address/phone | Owner | Hours still **unconfirmed** in CMS seed path |
| Independent QA/perf refresh after deploy | QA (+ UX as needed) | Live CMS writes remain NOT TESTED by policy until approved |
| Phase 3 visual / UX / LCP | Coord → Eng/UX | After infra + facts; LCP improvement called out in Phase 2.5 QA |

Prioritized checklist: [`next-execution-plan.md`](next-execution-plan.md). Owner steps: [`owner-setup.md`](owner-setup.md).

## Prioritized roadmap

1. **Stabilize staging** — authorized deploy so Workers match `main`; confirm headers and smoke paths.
2. **Unblock media + email** — R2 then Resend per owner-setup; eng wiring only after enablement.
3. **Owner fact lock** — hours, emails, Toast URL, photos policy before domain talk.
4. **Independent QA / lab perf** — refresh matrices on post-deploy staging; no rubber-stamp of eng self-tests.
5. **Phase 3 UX** — brand/first-viewport polish, LCP, CMS usability; separate scoped PRs.

Conclusions here are revisable when new deploy SHAs, QA matrices, or owner decisions land.

## Architecture decisions (preserve; revise with evidence)

| Decision | Status | Where |
| --- | --- | --- |
| D1 as sole store for place, hours, menu, events, inquiries | Chosen | [`cms-architecture.md`](cms-architecture.md) |
| Sanity deferred until weekly editing / admin cost justifies it | Chosen | same |
| Custom admin in-repo; promo/story/reservations admin hidden | Chosen | [`phase-2-status.md`](phase-2-status.md) |
| Order links = CMS Toast URL only (empty hides Order) | Chosen | same |
| Birthday list closed until offer + DOB + opt-out | Chosen | same |
| `VINNYS_SNAPSHOT=1` emergency public-read rollback; do not delete inquiries | Chosen | handoff + status |
| R2 for owner photo uploads (not Sanity assets first) | Intended; blocked | owner-setup |
| Resend for inquiry notify; queue + Retry while off | Intended; blocked | Phase 2.5 |
| Coordinator is Cursor Project role, not a repo subagent | Chosen | this file + agent-workflow |
| UX + QA custom subagents are `readonly: true` | Chosen | `.cursor/agents/` frontmatter |

## Owner dependencies

- Enable R2 in Cloudflare Dashboard (billing awareness); name a bucket.
- Create Resend account, verify sender, set Worker secrets `RESEND_API_KEY` / `RESEND_FROM` (never commit).
- Confirm business facts (hours, emails, Toast, address/phone).
- Explicit approval for Workers deploy and, later, DNS for vinnysbargrill.com.
- Keep `ADMIN_PASSWORD` as Worker secret only.

## Acceptance criteria (working bar)

Use QA vocabulary: **PASS** / **FAIL** / **BLOCKED** / **NOT TESTED**. Never PASS without evidence.

**Before calling Phase 2.5 “owner-complete”:**

- [ ] Staging deploy of approved `main` SHA verified (version / headers / smoke).
- [ ] R2 bound; admin photo upload + `/media/<id>` smoke **PASS**.
- [ ] Resend path: test inquiry notifies or Retry clears queue with evidence **PASS**.
- [ ] Owner-confirmed hours + notify/place email reflected on public/admin **PASS**.
- [ ] Automated `npm test` / typecheck / CI green on the shipped SHA.
- [ ] Independent QA matrix refreshed; critical public + auth gates not left as eng-only claims.
- [ ] No secrets in git; DNS unchanged unless separately approved.

**Phase 3 UX** has its own acceptance (brand hierarchy, mobile, LCP targets) — do not fold into the infra checklist above.

## Roadmap pointer (do not duplicate full audits)

| Phase | Where to read |
| --- | --- |
| Phase 2 shipped status, staging, seed facts | [`phase-2-status.md`](phase-2-status.md) |
| Phase 2.5 reliability/security audit | [`phase-2-5-audit.md`](phase-2-5-audit.md) |
| Phase 2.5 QA matrix | [`phase-2-5-qa.md`](phase-2-5-qa.md) |
| Phase 2.5 handoff | [`phase-2-5-handoff.md`](phase-2-5-handoff.md) |
| Next execution checklist | [`next-execution-plan.md`](next-execution-plan.md) |
| Owner R2 / Resend / content checklist | [`owner-setup.md`](owner-setup.md) |
| CMS / D1 choice background | [`cms-architecture.md`](cms-architecture.md) |
| Isolation expectations | [`isolation-audit.md`](isolation-audit.md) |

## Staging and blockers

- **Staging worker:** https://vinnys-bar-grill.toastisadog.workers.dev/
- **D1:** live business data on the bound database — treat as production-like; do not mutate without approval.
- **Blocked (owner):** Cloudflare R2 (photo upload); Resend (`RESEND_API_KEY` / `RESEND_FROM`). Details in Phase 2 status and owner-setup.
- **Admin:** `/admin/login` with Worker secret `ADMIN_PASSWORD` — never commit passwords.

## Isolation

This workspace and Cursor environment must stay Vinny-only. If Game Intelligence Lab or another repo appears, stop and escalate to the Coordinator.
