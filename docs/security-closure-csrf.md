# Security closure — Admin CSRF (staging)

**Record date:** 2026-11-11  
**Repo:** `Alexanderjsinger/vinnys-restaurant`  
**Scope:** Documentation of completed CSRF / same-origin hardening. **No production authorization. No DNS.**

## Verdict

| Layer | Status |
| --- | --- |
| Engineering (code + CI on `main`) | **Completed** — PR [#9](https://github.com/Alexanderjsinger/vinnys-restaurant/pull/9) merged |
| Staging deploy of merge SHA | **Completed** — Worker Version `22ba677c-9192-40da-8dfe-6666d0a5b039` |
| Independent staging QA (CSRF matrix) | **PASS** (staging-verified) |
| Events / CMS product release | **HOLD** — not production-ready; CSRF PASS does **not** clear this |
| Production / custom DNS | **Not authorized** — untouched |

CSRF is **staging-verified PASS**. Events/CMS remain on **HOLD**. This record closes the security slice only.

## Completed engineering work

| Item | Detail |
| --- | --- |
| PR | [#9](https://github.com/Alexanderjsinger/vinnys-restaurant/pull/9) — `cursor/admin-csrf-hardening-58e6` |
| Reviewed tip | `3c838e6e5b01fe4cebed8f79e3ae3fb8f089834f` |
| Merge commit on `main` | `b7bf813cd3fbf14a016db55a115463dab0a10ae8` |
| Related docs PR | [#8](https://github.com/Alexanderjsinger/vinnys-restaurant/pull/8) — agent frontmatter + durable next-plan (`0547299`) also on `main` |

**Controls shipped (see [`admin-csrf.md`](admin-csrf.md)):**

- `sameOriginPost` rejects POSTs when Origin, Sec-Fetch-Site, and Referer are all absent
- Session-bound CSRF tokens on admin save / media / logout
- Admin UI forms embed CSRF via `AdminForm` / `CsrfField` / `CsrfInput`
- Unit coverage in `tests/admin-csrf.test.mjs` (+ phase25 guards)

## Staging verification

| Field | Value |
| --- | --- |
| Staging URL | https://vinnys-bar-grill.toastisadog.workers.dev/ |
| Deployed merge | `b7bf813cd3fbf14a016db55a115463dab0a10ae8` |
| Live Worker Version | `22ba677c-9192-40da-8dfe-6666d0a5b039` |
| Prior Worker (rollback) | `c9db5b34-879e-46ca-a226-4c88d7d3674c` |
| QA verdict | **PASS** — STG-01…09; rollback **not** required |

Security response headers (`nosniff`, `SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`) observed live on `/`, `/events`, `/admin/login`, `/parties`.

### Matrix (summary)

| ID | Check | Status |
| --- | --- | --- |
| STG-01 | Admin login + Overview | PASS |
| STG-02 | Authenticated draft save + disposable cleanup | PASS |
| STG-03 | Invalid / missing CSRF → reject, no write | PASS |
| STG-04 | Missing Origin/Referer/Fetch Metadata → reject | PASS |
| STG-05 | Logout clears cookie; `/admin/*` → login | PASS |
| STG-06 | Public inquiry same-origin (no admin CSRF) | PASS |
| STG-07 | Security headers present | PASS |
| STG-08 | Unauth admin save → login | PASS |
| STG-09 | Cross-origin authed save → reject | PASS |

Full matrix and cleanup notes live in the Project store QA doc (path below). Disposable draft event and test inquiry were removed; no customer-facing residue.

## Evidence pointers (Project store — not in git)

Do **not** commit secrets, D1 dumps, or cookies. Paths are Cursor Project store evidence:

| Artifact | Path |
| --- | --- |
| Staging QA verdict | `/cursor/stores/bc-9372d14d-41c8-4fa9-84cf-39adea69c698/docs/admin-csrf-staging-qa.md` |
| Deploy record | `/cursor/stores/bc-9372d14d-41c8-4fa9-84cf-39adea69c698/internal/csrf-staging-deploy.md` |
| QA media / headers / screenshots | `/cursor/stores/bc-9372d14d-41c8-4fa9-84cf-39adea69c698/media/csrf-staging-qa/` |
| Deploy media (version IDs, smoke) | `/cursor/stores/bc-9372d14d-41c8-4fa9-84cf-39adea69c698/media/csrf-staging-deploy/` |
| Pre-deploy local QA | `/cursor/stores/bc-9372d14d-41c8-4fa9-84cf-39adea69c698/docs/admin-csrf-qa-verdict.md` |

In-repo implementation notes: [`admin-csrf.md`](admin-csrf.md).

## Remaining limitations

| Item | Status | Notes |
| --- | --- | --- |
| Events / CMS product | **HOLD** | Empty-state UX, photo placeholder `/media/1`, `next_step` admin gap, draft/publish clarity — **not** cleared by CSRF PASS |
| R2 media upload E2E | **BLOCKED** (owner) | Account R2 enablement |
| Resend inquiry email | **BLOCKED** (owner) | Secrets + verified sender |
| Business facts (hours, emails, Toast, address/phone) | **Owner** | Still unconfirmed / CMS-dependent |
| Production / DNS cutover | **Not approved** | Staging `workers.dev` only |
| Login CSRF tokens | Out of CSRF slice | Login uses same-origin + rate limit + password |
| Broad CMS write matrix (menu/place/hours) | **NOT TESTED** in CSRF pass | Disposable event draft was sufficient for CSRF positive path |
| Independent full Phase 2.5 QA refresh | Outstanding | Prefer post-CSRF staging as baseline; R2/Resend still BLOCKED |

## Production requirements (not met by this closure)

Before any production / DNS discussion, Product Owner + Coordinator still need at least:

1. Explicit production deploy + DNS approval (separate from staging CSRF).
2. Owner-confirmed business facts on public/admin.
3. R2 and Resend paths PASS with evidence (or explicitly deferred in writing).
4. Events/CMS HOLD cleared by Coordinator after Eng/UX/QA product work — **not** by this security record.
5. Fresh independent QA on the intended production SHA; no secrets in git.

## Related docs

- [`project-context.md`](project-context.md) — durable status
- [`next-execution-plan.md`](next-execution-plan.md) — prioritized checklist
- [`phase-2-5-handoff.md`](phase-2-5-handoff.md) — Phase 2.5 + CSRF follow-through
- [`agent-workflow.md`](agent-workflow.md) — role loop
- [`owner-setup.md`](owner-setup.md) — R2 / Resend / content
