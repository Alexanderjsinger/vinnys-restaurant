# Phase 2.5 handoff

## Summary

Phase 2.5 reliability/security hardening originally landed in PR #2. Follow-up PR #7 closed remaining **code-level** gaps: hero/storefront swap onto `main`, baseline security headers, Referer tightening, extended tests, refreshed docs, and lab CWV notes.

**CSRF follow-through (2026-11-11):** PR #9 merged to `main` as `b7bf813` (tip `3c838e6`). PO-authorized staging deploy + independent QA → **staging-verified PASS**. See [`security-closure-csrf.md`](security-closure-csrf.md).

R2 and Resend remain **owner-blocked**. Business facts remain **owner**. Events/CMS product remains **HOLD** until **E6** live QA (#12–#14 merged for E1–E5). Staging content matches `main` `2b77538` (PR #28). No DNS. No secrets committed.

## Status by layer

| Layer | Status |
| --- | --- |
| Completed eng (Phase 2.5 + CSRF + Events + sizzle) | On `main` through `2b77538` (CSRF `b7bf813`; Events #12–#14; sizzle/home #15–#28) |
| Verified staging | CSRF **PASS**; 2026-11-14 fingerprints match `2b77538` |
| Outstanding product | Events/CMS **HOLD** — E6 QA matrix open — [`events-cms-backlog.md`](events-cms-backlog.md) |
| Unresolved defects | E6 live CMS acceptance only |
| Owner deps | R2, Resend, hours/emails/Toast/address confirmation, further deploy/DNS approval |
| Prod requirements | Separate owner approval; HOLD cleared; facts + infra evidence |

## Changes made (Phase 2.5 follow-up — PR #7)

### Content / UX consistency with staging

- Ported PR #5 image swap onto the branch targeting `main`: hero/OG use `/photos/storefront.webp`; venue band uses `/hero/meet-me.jpg` with matching alts/captions.

### Security

- `src/lib/security-headers.ts` + `src/middleware.ts` + `next.config.ts` headers
- `sameOriginPost` rejects cross-host Referer when Origin / Sec-Fetch-Site are absent

### Tests / CI

- Extended `tests/phase25.test.mjs` (Referer, headers helper, birthday closed, hero assets)
- `npm test` / `typecheck` / `build:vinext` green on that branch

### Documentation

- Updated `docs/phase-2-5-audit.md`, `docs/phase-2-5-qa.md`, `docs/owner-setup.md`, this handoff
- Corrected stale claims in `docs/cms-architecture.md`

## Already on main from PR #2 (unchanged by #7)

- Notify queue status/retry + admin visibility
- Media magic bytes / UUID keys / R2 rollback / in-use delete
- CI workflow, owner-setup, D1 backup/recovery docs

## CSRF hardening (PR #9 — completed + staging-verified)

- Reject missing Origin/Referer/Sec-Fetch-Site on POSTs (`sameOriginPost`)
- Session-bound CSRF on admin save / media / logout
- Admin form CSRF embedding; unit tests
- Staging matrix STG-01…09 **PASS**; disposable test data cleaned
- Detail: [`admin-csrf.md`](admin-csrf.md), [`security-closure-csrf.md`](security-closure-csrf.md)

## Outstanding / BLOCKED

1. ~~GitHub → Cloudflare staging sync for CSRF SHA~~ — **done** for `b7bf813` (staging-verified). Further deploys still need PO approval.
2. **Events/CMS product HOLD** — E1–E5 merged (#12–#14); **E6** independent QA on staging still required. Backlog: [`events-cms-backlog.md`](events-cms-backlog.md); checklist: [`next-execution-plan.md`](next-execution-plan.md) §1.
3. **Cloudflare R2** enablement + bucket + `MEDIA` binding + redeploy + upload smoke
4. **Resend** verified sender + `RESEND_API_KEY` / `RESEND_FROM` + notify email + Retry queue
5. Owner confirms hours and business email (and related facts in `owner-setup.md`)
6. Independent full QA/perf refresh beyond CSRF slice
7. Live CMS write workflows outside CSRF disposable path still lightly covered / NOT TESTED by policy
8. Phase 3 UX / LCP (scoped later)
9. Production / DNS — **not** authorized

Prioritized eng-vs-owner checklist: [`next-execution-plan.md`](next-execution-plan.md). Durable status: [`project-context.md`](project-context.md).

## Deployment status

- Staging worker content matches approved `main` `2b77538` (PR #28 sizzle OOM fix; read-only verify 2026-11-14)
- Prior CSRF baseline: merge `b7bf813` / Worker `22ba677c…`; rollback target if needed: `c9db5b34-879e-46ca-a226-4c88d7d3674c``
- **Do not deploy further or change DNS without Product Owner approval relayed by Coordinator**

## Rollback

1. **Code:** redeploy previous Workers version / prior git SHA
2. **Public content emergency:** set worker var `VINNYS_SNAPSHOT=1` and redeploy — public reads use `src/lib/public-snapshot.json`; writes still hit D1; **do not delete inquiry rows**
3. **Data:** restore from D1 backup export (see `docs/d1-backup-recovery.md`)

## Recommended next steps

1. PO authorizes **E6** live CMS QA on staging (disposable data) — **HOLD** until matrix PASS + Coordinator sign-off; CSRF already closed ([`security-closure-csrf.md`](security-closure-csrf.md))
2. Owner completes R2 + Resend per `owner-setup.md`; Eng binds/smokes when enabled
3. Owner content / business-info checklist
4. Independent QA + lab perf refresh on current staging (beyond CSRF); Events E6 matrix after eng PRs
5. Then Phase 3 visual/UX — LCP improvement is a natural Phase 3 item
6. Production only after explicit requirements in [`security-closure-csrf.md`](security-closure-csrf.md) / project-context
