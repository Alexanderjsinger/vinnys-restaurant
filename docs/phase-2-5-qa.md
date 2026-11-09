# Phase 2.5 QA matrix

Statuses used: **PASS** | **FAIL** | **BLOCKED** | **NOT TESTED**  
Never mark PASS without evidence. Staging base: https://vinnys-bar-grill.toastisadog.workers.dev/

## Automated

| Test | Expected result | Actual result | Status |
| --- | --- | --- | --- |
| `npm test` | All tests pass | 12/12 passed (includes Phase 2.5 notify/media/origin cases) | PASS |
| `npm run typecheck` | No TS errors | Clean | PASS |
| `npm run build:vinext` | Production Vite/Workers build | Build complete | PASS |
| Snapshot isolation fixture | Draft/sqlite edits stay off public snapshot | Existing stores test passed | PASS |
| Image magic-byte validation | Spoofed/non-image rejected | Unit test passed | PASS |
| Notify queue upsert + sent marker | One pending row; sent blocks re-queue | Unit test passed | PASS |
| Media in-use delete guard | Referenced `/media/:id` cannot delete | Unit test passed | PASS |
| Admin route auth presence | `isAdmin` on save/media | Source assertion passed | PASS |

## Browser / staging (read-only)

Evidence also in Project store: `internal/staging-qa-report.md` (computer-use agent).

| Test | Expected result | Actual result | Status |
| --- | --- | --- | --- |
| CMS login page loads | Password form at `/admin/login` | Form present; auth not attempted this pass | PASS |
| Unauthenticated admin panel | Redirect/deny without session | Layout uses `isAdmin` redirect (code); live panel not probed beyond login | PASS |
| Homepage | Brand visible; birthday signup closed | Brand + closed list; no signup inputs | PASS |
| Menu publish (live CMS) | Live content changes | **Not mutated** on live D1 this phase | NOT TESTED |
| Menu public page | Lunch items + prices | Items/prices visible | PASS |
| Event publish | Appears publicly | No live publish this phase | NOT TESTED |
| Events public page | Loads; empty OK | “No confirmed events yet.” | PASS |
| Inquiry submit (isolated) | Stored reliably | Fixture/SQLite covered; live submit with test data **not** run against staging to avoid polluting owner inbox | NOT TESTED |
| Parties form present | Form fields + honeypot | Form PASS; honeypot is `company_website` in `.hp` (not string “honeypot”) | PASS |
| Notification delivered | Resend acceptance | Resend not configured | BLOCKED |
| Notification queued when Resend off | Queued + admin visible | Code + unit tests; live admin UI after deploy | PASS (code) / BLOCKED (live Resend) |
| Media upload | Persists and renders | R2 not enabled | BLOCKED |
| Contact | Address + phone | 705 W. Cross St.; 734-905-7051 | PASS |
| Order | Toast when URL set | Redirects to Toast | PASS |
| Reserve | Call-to-reserve | Phone CTA | PASS |
| Mobile ~390px homepage | No horizontal overflow | No overflow; nav usable | PASS |
| Desktop homepage readability | Readable; header behavior noted | Readable; header **not** sticky | PASS |
| Core Web Vitals (measured) | Documented LCP/INP/CLS | No field tooling run this phase | NOT TESTED |

## CMS workflows (authorized staging) — deferred to post-deploy

These require admin password and write to live D1. Not executed without deploy of this branch + explicit approval:

| Test | Expected | Status |
| --- | --- | --- |
| Login/logout | Session cookie; logout clears | NOT TESTED |
| Edit + publish menu price | Public `/menu` updates | NOT TESTED |
| Create / preview / publish / archive event | Visibility rules | NOT TESTED |
| Update hours / homepage | Public reflects publish | NOT TESTED |
| Retry notifications | Queue drains when Resend configured | BLOCKED |

## Accessibility notes

- Form labels present on parties fields (`htmlFor` / `id`).
- Honeypot marked `aria-hidden`.
- Skip link not present (P2).
- Sticky header absent (note only; out of visual redesign scope).

## Performance

No measured Core Web Vitals captured this phase. Do not treat estimates as results. Recommend PageSpeed / CrUX on staging after next deploy.
