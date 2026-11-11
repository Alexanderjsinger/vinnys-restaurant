# Phase 2.5 QA matrix

Statuses used: **PASS** | **FAIL** | **BLOCKED** | **NOT TESTED**  
Never mark PASS without evidence. Staging base: https://vinnys-bar-grill.toastisadog.workers.dev/

Follow-up date: 2026-11-11 (America/Detroit). Automated on branch `cursor/phase-2-5-followup-a5de`. Browser checks against **currently deployed** staging (image swap live; security headers from this branch **not** live until deploy).

## Automated

| Test | Expected result | Actual result | Status |
| --- | --- | --- | --- |
| `npm test` | All tests pass | 18/18 passed (Phase 2.5 + homepage layout + stores) | PASS |
| `npm run typecheck` | No TS errors | Clean | PASS |
| `npm run build:vinext` | Production Vite/Workers build | Build complete; security header strings present in worker bundle | PASS |
| Snapshot isolation fixture | Draft/sqlite edits stay off public snapshot | Existing stores test passed | PASS |
| Image magic-byte validation | Spoofed/non-image rejected | Unit test passed | PASS |
| Notify queue upsert + sent marker | One pending row; sent blocks re-queue | Unit test passed | PASS |
| Media in-use delete guard | Referenced `/media/:id` cannot delete | Unit test passed | PASS |
| Admin route auth presence | `isAdmin` on save/media | Source assertion passed | PASS |
| sameOriginPost + Referer | Cross-site / bad Referer rejected | Unit test passed | PASS |
| Security headers helper | nosniff + SAMEORIGIN applied | Unit test passed | PASS |
| Birthday signup closed | No public insert path | Source + staging POST → `/?join=closed#list` | PASS |
| Hero asset consistency | Storefront hero / table venue | Source assertion passed | PASS |
| Homepage layout smoke | No intro twin CTA; plate/hero CSS | `tests/homepage-layout.test.mjs` passed | PASS |

Homepage visual checklist: `docs/homepage-visual-qa.md`.

## Browser / staging (read-only, 2026-11-11)

Evidence: HTML fetches under `/tmp/vinnys-qa-2026-11-11/`; screenshots in Project store `media/phase-2-5-qa-2026-11-11/` and `/opt/cursor/artifacts/phase25-*.webp`.

| Test | Expected result | Actual result | Status |
| --- | --- | --- | --- |
| CMS login page loads | Password form at `/admin/login` | Form + Sign in present; auth not attempted | PASS |
| Unauthenticated `/admin` | Redirect to login | HTTP 307 → `/admin/login` | PASS |
| Homepage | Brand visible; birthday closed | Brand present; closed list; no `/api/signup` form | PASS |
| Homepage hero image | Storefront exterior | `/photos/storefront.webp` in hero; venue uses `/hero/meet-me.jpg` | PASS |
| Skip link | Present | `Skip to content` → `#main` in HTML | PASS |
| Menu public page | Lunch items + prices | Items/prices visible | PASS |
| Events public page | Loads; empty OK | “No confirmed events yet.” | PASS |
| Parties form + honeypot | Form + hidden `company_website` | Form PASS; honeypot in `.hp` with `aria-hidden` | PASS |
| Contact | Address + phone | 705 W. Cross St.; 734-905-7051 | PASS |
| Order | Toast when URL set | 307 → Toast Tab URL | PASS |
| Reserve | Call-to-reserve | Phone CTA | PASS |
| Signup POST | Closed redirect | 303 → `/?join=closed#list` | PASS |
| Unconfirmed hours note | Flagged until owner confirms | “Not confirmed yet…” in footer hours | PASS |
| Notification delivered | Resend acceptance | Resend not configured | BLOCKED |
| Media upload | Persists and renders | R2 not enabled | BLOCKED |
| Security headers on live staging | nosniff / frame-options | Absent on current deploy (expected until this branch deploys) | NOT TESTED (live) / PASS (build) |
| Menu publish (live CMS write) | Live content changes | Not mutated on live D1 this pass | NOT TESTED |
| Inquiry submit (live) | Stored reliably | Not run against staging (avoid polluting inquiries) | NOT TESTED |
| Mobile ~390px homepage | No horizontal overflow | Prior computer-use evidence + static pages; screenshots captured | PASS |
| Desktop homepage readability | Readable | Readable; header **not** sticky (UX note) | PASS |

## Core Web Vitals (lab, measured)

Tool: Lighthouse 13.6.0, mobile form-factor, headless Chrome, URL staging homepage, 2026-11-11.

| Metric | Display value | Score |
| --- | --- | --- |
| Performance category | 0.85 | — |
| LCP | 4.2 s | 0.43 |
| CLS | 0 | 1.00 |
| TBT | 0 ms | 1.00 |
| FCP | 1.6 s | 0.95 |
| Speed Index | 1.6 s | 1.00 |
| INP | (lab N/A) | — |

These are **lab** numbers on workers.dev, not CrUX field data. LCP is the weak metric (hero image). Do not treat as production SLOs. Raw JSON: `/tmp/vinnys-qa-2026-11-11/lighthouse-mobile.json`.

## CMS workflows (authorized staging) — deferred

Require admin password and write to live D1. Not executed without deploy of this branch + explicit approval:

| Test | Expected | Status |
| --- | --- | --- |
| Login/logout | Session cookie; logout clears | NOT TESTED |
| Edit + publish menu price | Public `/menu` updates | NOT TESTED |
| Create / preview / publish / archive event | Visibility rules | NOT TESTED |
| Update hours / homepage | Public reflects publish | NOT TESTED |
| Retry notifications | Queue drains when Resend configured | BLOCKED |

## Accessibility notes

- Skip link present (`layout.tsx`).
- Form labels present on parties fields (`htmlFor` / `id`).
- Honeypot marked `aria-hidden`.
- Sticky header absent (note only; out of visual redesign scope).

## Performance

Measured lab CWV captured above. Recommend PageSpeed / CrUX on the production host after domain cutover.
