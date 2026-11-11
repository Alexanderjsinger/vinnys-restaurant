# Project context — Vinny’s Bar & Grill

Repo: `Alexanderjsinger/vinnys-restaurant`  
Public brand: Vinny’s Bar & Grill (Ypsilanti). Intended eventual host for vinnysbargrill.com — **DNS is not changed by this project until the owner approves.**

**Git checkpoint (verified 2026-11-11):** `main` HEAD `b7bf813` — eight merged PRs on `main` (#1–#4, #6–#9). Includes durable next-plan docs (#8) and admin CSRF hardening (#9). Prior checkpoint `057f651` / “six PRs” is superseded.

## Who decides what

| Role | Owns |
| --- | --- |
| **Product Owner** | Merge, deploy, DNS, secrets, restaurant facts, R2/Resend enablement |
| **Coordinator** | Roadmap, architecture decisions, assignments, consolidating UX + QA for the owner (lives in the Cursor Project — **not** a `.cursor/agents/` file) |
| **Full-Stack Engineer** | Implementation in this repo |
| **UX/Design Reviewer** | Independent UX recommendations (no ship authority; custom subagent `readonly: true`) |
| **QA Reviewer** | Independent verification with PASS/FAIL/BLOCKED/NOT TESTED (no ship authority; custom subagent `readonly: true`) |

Agent role specs: [`.cursor/agents/`](../.cursor/agents/). Workflow: [`agent-workflow.md`](agent-workflow.md).

## Status by layer (revisable with evidence)

Distinguish **completed eng**, **verified staging**, **outstanding product**, **unresolved defects**, **owner deps**, and **prod requirements**.

### Completed engineering (on `main`)

- Phase 2 CMS + public site; D1 content/inquiry store.
- Phase 2.5 reliability/security: notify queue, media hardening, CI, security headers helper, Referer tightening, hero/storefront parity (#2, #7).
- Permanent AI loop: three custom subagents under `.cursor/agents/` with Cursor YAML frontmatter; Coordinator remains Project-side only (#6, docs in #8).
- Admin CSRF + same-origin reject-missing-headers (#9 tip `3c838e6`, merge `b7bf813`). Implementation: [`admin-csrf.md`](admin-csrf.md). Closure: [`security-closure-csrf.md`](security-closure-csrf.md).

### Verified on staging

- Staging worker: https://vinnys-bar-grill.toastisadog.workers.dev/
- Deployed merge `b7bf813` as Worker Version `22ba677c-9192-40da-8dfe-6666d0a5b039` (PO-authorized staging deploy).
- Independent CSRF matrix **PASS** (STG-01…09); security headers live; rollback not required.
- Evidence (Project store): `docs/admin-csrf-staging-qa.md`, `media/csrf-staging-qa/`, `internal/csrf-staging-deploy.md`.

### Outstanding product / HOLD

- **Events / CMS product: HOLD** — CSRF PASS does **not** clear this. Empty-state UX, event photo placeholder, `next_step` admin gap, draft/publish clarity remain. Not production-ready for Events/CMS hardening ship.
- Phase 3 visual / UX / LCP — after infra + facts (or explicitly deferred).

### Unresolved defects (known)

- Event photo path vs CMS placeholder (`/media/1` / `cleanEventPhoto`).
- `next_step` on public render without admin form field.
- Guest empty-state copy / recovery CTAs; home Events loop to empty page.
- Mobile primary nav touch targets (UX P2).
- Broad CMS write paths (menu/place/hours) **NOT TESTED** in CSRF pass by design.

### Owner dependencies (blockers)

- Cloudflare R2 enablement + bucket + `MEDIA` binding approval (API 10042 historically).
- Resend account, verified sender, Worker secrets `RESEND_API_KEY` / `RESEND_FROM` (never commit).
- Confirm hours, notify/place email, Toast URL, address/phone (hours still **unconfirmed**).
- Explicit approval for any further Workers deploy and, later, DNS for vinnysbargrill.com.
- Keep `ADMIN_PASSWORD` as Worker secret only.

### Production requirements (not met)

- No production domain / DNS cutover without separate owner approval.
- Owner-confirmed facts; R2/Resend evidence or written deferral; Events/CMS HOLD cleared by Coordinator after product work; independent QA on intended prod SHA.

Prioritized checklist: [`next-execution-plan.md`](next-execution-plan.md). Owner steps: [`owner-setup.md`](owner-setup.md).

## Prioritized roadmap

1. **Events assessment backlog** — Coordinator consolidates Eng/UX/QA product findings; eng slice after CSRF (already done for security).
2. **Unblock media + email** — R2 then Resend per owner-setup; eng wiring only after enablement.
3. **Owner fact lock** — hours, emails, Toast URL, photos policy before domain talk.
4. **Independent QA / lab perf** — refresh matrices on current staging baseline; no rubber-stamp of eng self-tests.
5. **Phase 3 UX** — brand/first-viewport polish, LCP, CMS usability; separate scoped PRs.
6. **Production** — only after owner approval + requirements above.

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
| Admin CSRF + reject-missing same-origin headers | Chosen; staging-verified | [`security-closure-csrf.md`](security-closure-csrf.md) |
| Coordinator is Cursor Project role, not a repo subagent | Chosen | this file + agent-workflow |
| UX + QA custom subagents are `readonly: true` | Chosen | `.cursor/agents/` frontmatter |

## Acceptance criteria (working bar)

Use QA vocabulary: **PASS** / **FAIL** / **BLOCKED** / **NOT TESTED**. Never PASS without evidence.

**CSRF security slice (staging):**

- [x] CSRF + same-origin hardening on `main` (`b7bf813`)
- [x] Authorized staging deploy of that SHA
- [x] Independent CSRF matrix PASS with evidence
- [ ] Events/CMS HOLD cleared (separate product work — **not** this slice)
- [ ] Production / DNS (separate owner approval)

**Before calling Phase 2.5 “owner-complete”:**

- [x] Staging deploy of approved CSRF `main` SHA verified (version / headers / CSRF smoke) — see security closure
- [ ] R2 bound; admin photo upload + `/media/<id>` smoke **PASS**
- [ ] Resend path: test inquiry notifies or Retry clears queue with evidence **PASS**
- [ ] Owner-confirmed hours + notify/place email reflected on public/admin **PASS**
- [x] Automated `npm test` / typecheck / CI green on the shipped CSRF SHA (pre-deploy)
- [ ] Independent full Phase 2.5 QA matrix refreshed beyond CSRF slice
- [x] No secrets in git; DNS unchanged unless separately approved

**Phase 3 UX** has its own acceptance (brand hierarchy, mobile, LCP targets) — do not fold into the infra checklist above.

## Roadmap pointer (do not duplicate full audits)

| Phase | Where to read |
| --- | --- |
| Phase 2 shipped status, staging, seed facts | [`phase-2-status.md`](phase-2-status.md) |
| Phase 2.5 reliability/security audit | [`phase-2-5-audit.md`](phase-2-5-audit.md) |
| Phase 2.5 QA matrix | [`phase-2-5-qa.md`](phase-2-5-qa.md) |
| Phase 2.5 handoff | [`phase-2-5-handoff.md`](phase-2-5-handoff.md) |
| CSRF security closure | [`security-closure-csrf.md`](security-closure-csrf.md) |
| Next execution checklist | [`next-execution-plan.md`](next-execution-plan.md) |
| Owner R2 / Resend / content checklist | [`owner-setup.md`](owner-setup.md) |
| CMS / D1 choice background | [`cms-architecture.md`](cms-architecture.md) |
| Isolation expectations | [`isolation-audit.md`](isolation-audit.md) |

## Staging and blockers

- **Staging worker:** https://vinnys-bar-grill.toastisadog.workers.dev/ — currently on CSRF merge `b7bf813` / Worker `22ba677c…` (staging-verified).
- **D1:** live business data on the bound database — treat as production-like; do not mutate without approval.
- **Blocked (owner):** Cloudflare R2 (photo upload); Resend (`RESEND_API_KEY` / `RESEND_FROM`). Details in Phase 2 status and owner-setup.
- **Product HOLD:** Events/CMS — see next-execution-plan placeholder + Coordinator consolidate.
- **Admin:** `/admin/login` with Worker secret `ADMIN_PASSWORD` — never commit passwords.

## Isolation

This workspace and Cursor environment must stay Vinny-only. If Game Intelligence Lab or another repo appears, stop and escalate to the Coordinator.
