---
name: vinny-cms-workflow
description: >-
  Safely change Vinny’s D1-backed menu, events, homepage, hours, place, and
  admin flows — trace editor → API → database → public render. Requires security
  checks, regression tests, and Coordinator/Product Owner approval before live
  D1 mutation, merge, or Workers deploy. Use when touching admin save intents,
  content.ts/d1-store, public reads, or Events/CMS HOLD remediation.
---

# Vinny’s CMS workflow

Applies only to **Alexanderjsinger/vinnys-restaurant**. D1 on staging holds **production-like business data** — treat writes as consequential.

This skill is **project-specific CMS + data flow**. It does not duplicate Cursor’s generic **`debug`** subagent (use for failing tests/repros) or a full **security audit** playbook — for CSRF closure and staging-verified controls, follow `docs/security-closure-csrf.md` and assign **`qa-reviewer`** for independent matrices.

For visual/UX outcomes of CMS fields, pair with **`vinny-creative-direction`** and **`ux-design-reviewer`**.

## Reconcile status before acting

Historical `docs/*` checkpoints (e.g. 2026-11-11 HOLD language) can lag **`main`**. Before relying on any status doc:

1. `git fetch origin main` and note `git rev-parse origin/main`
2. Scan recent merges: `git log origin/main --oneline -25` and/or merged GitHub PRs for Vinny’s
3. On conflict, **`origin/main` + merged PR bodies** override stale doc claims; trace `src/` for guest vs admin behavior
4. Do **not** treat `docs/events-cms-backlog.md` HOLD/E6 wording as current ship state without re-checking `main` and QA evidence

## When to use

- Admin panels: place, homepage, menu, events, ordering, inquiries, media
- `POST /api/admin/save`, `POST /api/admin/media`, `POST /api/admin/login|logout`
- Public reads: menu, events, hours, homepage, contact (no guest `/parties` page — see PR #25)
- Admin inquiries panel (historical party-note data in D1; not a public form surface)
- Local dev: SQLite via `src/lib/content.ts` vs live D1 (`src/lib/d1-write.ts`, `cloudflare.config.ts`)
- Events/CMS backlog items E1–E6 (`docs/events-cms-backlog.md` as index — confirm merge state on `main`)
- Emergency read rollback: `VINNYS_SNAPSHOT=1` (public snapshot only — do not delete inquiries)

## When not to use

- Pure CSS/hero art direction with no data model change → **`vinny-creative-direction`**
- Re-opening closed CSRF work without new evidence → security closure docs
- R2 account enablement, Resend secrets, DNS, or `ADMIN_PASSWORD` rotation (owner/Coordinator)

## Read first (repo)

| Topic | Path |
| --- | --- |
| Architecture choice | `docs/cms-architecture.md` |
| Phase 2 shipped behavior | `docs/phase-2-status.md` |
| CSRF + routes | `docs/admin-csrf.md`, `docs/security-closure-csrf.md` |
| Events backlog / HOLD | `docs/events-cms-backlog.md` |
| Next steps / approval | `docs/next-execution-plan.md` |
| Agent loop | `docs/agent-workflow.md` |
| Engineer role | `.cursor/agents/full-stack-engineer.md` |
| QA vocabulary | `.cursor/agents/qa-reviewer.md` |

## Data path map (editor → public)

Trace every change across this chain before coding:

```
Admin UI (AdminForm + hidden intent)
  → POST /api/admin/save or /api/admin/media
  → sameOriginPost + isAdmin (+ verifyCsrfForm on mutations)
  → applyAdminSave(form) in src/lib/mutate.ts (switch on intent)
  → src/lib/content.ts repository functions
  → D1 (production/staging) or SQLite (local npm run dev)
  → public loaders: src/lib/public.ts, d1-store.ts, events-public.ts, page components
```

### Intent reference (`applyAdminSave`)

| Intent family | Admin surface | Notes |
| --- | --- | --- |
| `place`, `homepage`, `ordering` | Place, Homepage, Ordering | Settings + structured fields |
| `hour-*`, `holiday-add` | Place | Weekly + temporary hours |
| `section-*`, `item-*` | Menu | Draft/publish/archive via `action` / `status` |
| `event-add`, `event-update`, `event-delete` | Events | `cleanEventPhoto`, `cleanEventNextStep`, Detroit dates |
| `inquiry-delete`, `notify-retry` | Inquiries | Do not spam owner email in QA |
| Media `upload` / `delete` | Photos | R2/MEDIA binding often **BLOCKED** — see phase-2-status |

Public **must not** read `site.promo`, `site.story`, or `site.reservation` (locked by tests). Order links = CMS Toast URL only.

### Private Parties removed (merged PR #25)

| Layer | Behavior |
| --- | --- |
| Guest site | No Private Parties / Private Events nav, footer, homepage, or events CTAs |
| `/parties` | Permanent redirect to `/contact` (`src/app/parties/page.tsx`) |
| Sitemap | No `/parties` entry (`src/app/sitemap.ts`) |
| Public POST | `/api/inquiries` success/error redirects land on `/contact` (legacy path only) |
| Admin CMS | **`/admin` inquiries panel unchanged** — `inquiry-delete`, `notify-retry`, list/history on D1 `inquiries` |

Do not resurrect guest party-booking flows unless Coordinator + Product Owner explicitly rescope.

### Events backlog engineering vs HOLD (PRs #12–#14)

| ID | Shipped on `main` (engineering) | PR |
| --- | --- | --- |
| E1 + E2 | Guest empty copy + recovery CTAs | #12 |
| E3 + E4 | Photo validation + buttons-only status model | #13 |
| E5 | Editable `next_step` end-to-end | #14 |
| **E6** | **Not cleared by merges alone** | — |

**E6** (intentional disposable CMS publish/update/past matrix) requires **independent QA verification** with PASS/FAIL/BLOCKED/NOT TESTED and evidence — assign **`/qa-reviewer`**. Coordinator clears Events/CMS **HOLD** only after E6 PASS (and any remaining product gates), not because E1–E5 merged or because backlog docs still say HOLD.

## Workflow

### 1. Scope and approvals

1. Confirm assignment from Coordinator (branch name, no-deploy flag, HOLD scope).
2. If the task touches **live staging D1** or requires **Workers deploy** to verify: stop until Product Owner approval is relayed — document **BLOCKED** if missing.
3. For Events HOLD release: confirm E1–E5 already on `main` (PRs #12–#14) vs net-new work; **E6 must be QA-verified** — never assume PASS from docs or eng self-test alone. CSRF PASS does **not** clear HOLD.

### 2. Trace before edit

1. Find the admin `intent` in the panel under `src/app/admin/(panel)/`.
2. Follow `applyAdminSave` case in `src/lib/mutate.ts` — note validators in `src/lib/format.ts`.
3. Find read path on public page (`src/app/*/page.tsx` + libs above).
4. Check draft vs published: `recordStatus` / `listEvents("public")` behavior in phase-2-status.

Document the trace in the PR handoff (intent → SQL/table → public component).

### 3. Security checks (required on write paths)

On every PR that touches admin or POST handlers:

| Control | Where |
| --- | --- |
| Same-origin | `sameOriginPost` in `src/lib/format.ts` |
| Session auth | `src/lib/auth.ts` |
| CSRF on save/media/logout | `src/lib/csrf.ts`, `AdminForm`, `CsrfField` |
| Route audit | Table in `docs/admin-csrf.md` |

Do **not** weaken reject-missing-headers behavior or skip CSRF on admin mutations.

For **new** security concerns (auth bypass, injection), escalate to Coordinator and use **`qa-reviewer`** — do not invent a parallel security-review skill.

### 4. Local verification (required before PR)

From repo root:

```bash
npm test
npm run typecheck
```

When CMS behavior changes, extend or run targeted coverage:

- `tests/stores.test.mjs` — D1/snapshot semantics
- Intent-specific tests if added by the task
- Do not mark PASS on staging-only paths if you only ran local SQLite — say **NOT TESTED** or **BLOCKED** (R2, Resend).

**Disposable CMS matrix:** For HOLD work E6, follow QA disposable-event procedure in Project Context assessments — never leave test events/prices on staging without cleanup plan.

### 5. Staging verification (when approved)

1. Staging URL: https://vinnys-bar-grill.toastisadog.workers.dev/
2. Sign in `/admin/login` with secret `ADMIN_PASSWORD` (never commit).
3. Save draft vs publish; confirm public `/admin/preview` vs guest routes.
4. CSRF smoke: save banner after edit; logout works (`docs/admin-csrf.md` manual section).
5. Record SHA/version in handoff; QA uses PASS/FAIL/BLOCKED/NOT TESTED with evidence.

**No unauthorized deploy:** Engineer opens PR; PO authorizes deploy via Coordinator.

### 6. Regression and product rules

- Menu price validation: two decimal places; gluten/dietary fields persist.
- Events: America/Detroit local times; past events drop from upcoming list.
- Legacy inquiries POST: `/api/inquiries` — honeypot, rate limit, redirects to `/contact`; no guest `/parties` UI (PR #25). Admin inquiry tooling separate.
- Snapshot mode: `VINNYS_SNAPSHOT=1` blocks public SQLite reads in tests/live rollback — understand before toggling.

### 7. Handoff

Include:

- Intents and tables touched
- Security checklist ack
- Test command output summary
- Staging matrix status (PASS/FAIL/BLOCKED/NOT TESTED)
- Whether Events/CMS HOLD criteria moved (yes/no — only claim E6 PASS with QA evidence; cite `main` SHA)

## Constraints

- **No secrets in git** (`ADMIN_PASSWORD`, Resend keys, `.env.local`).
- **No live D1 mutation** for casual debugging; prefer local SQLite or approved disposable staging edits.
- **No merge, deploy, DNS** without Product Owner approval via Coordinator.
- **No invented restaurant facts** — seed/copy from CMS or owner-confirmed docs.
- **Do not delete inquiries** as part of rollback; snapshot rollback is public-read only.
- **Owner deps:** R2 (`MEDIA` binding), Resend — mark media/email paths **BLOCKED** until configured (`docs/owner-setup.md`).

## Invocation (for agents and humans)

| Method | Example |
| --- | --- |
| Skill name | “Use **vinny-cms-workflow** before changing Events admin.” |
| @ file | `@.cursor/skills/vinny-cms-workflow/SKILL.md` |
| Implementer | `/full-stack-engineer` after reading this skill |
| Verification | `/qa-reviewer` for independent matrices |

Discovery check: file at `.cursor/skills/vinny-cms-workflow/SKILL.md`, valid YAML frontmatter (`name`, `description`), body includes trace + approval gates.

Optional doc sync: when workflow gates change, update `docs/agent-workflow.md` in a separate Coordinator-approved PR (do not silently drift from this skill).