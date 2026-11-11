# Phase 2.5 handoff

## Summary

Phase 2.5 reliability/security hardening originally landed in PR #2. This follow-up (`cursor/phase-2-5-followup-a5de`) closes remaining **code-level** gaps found while auditing `main` against the 2026-11-11 brief: port the hero/storefront swap onto `main`, add baseline security headers, tighten Referer handling, extend tests, refresh docs, and re-run QA with measured lab CWV.

R2 and Resend remain **owner-blocked**. No DNS changes. No secrets committed. Staging was **not** redeployed from this branch (`cf` CLI unavailable in this environment).

## Changes made (this follow-up)

### Content / UX consistency with staging

- Ported PR #5 image swap onto the branch targeting `main`: hero/OG use `/photos/storefront.webp`; venue band uses `/hero/meet-me.jpg` with matching alts/captions.

### Security

- `src/lib/security-headers.ts` + `src/middleware.ts` + `next.config.ts` headers
- `sameOriginPost` rejects cross-host Referer when Origin / Sec-Fetch-Site are absent

### Tests / CI

- Extended `tests/phase25.test.mjs` (Referer, headers helper, birthday closed, hero assets)
- `npm test` 18 passed; `typecheck` clean; `build:vinext` success

### Documentation

- Updated `docs/phase-2-5-audit.md`, `docs/phase-2-5-qa.md`, `docs/owner-setup.md`, this handoff
- Corrected stale claims in `docs/cms-architecture.md`

## Already on main from PR #2 (unchanged here)

- Notify queue status/retry + admin visibility
- Media magic bytes / UUID keys / R2 rollback / in-use delete
- CI workflow, owner-setup, D1 backup/recovery docs

## Tests performed

- `npm test` — 18 passed
- `npm run typecheck` — clean
- `npm run build:vinext` — success
- Staging read-only HTTP/HTML QA (see `phase-2-5-qa.md`)
- Lighthouse mobile lab CWV on staging homepage (LCP 4.2s; CLS 0; perf 0.85)

## Outstanding / BLOCKED

1. **Cloudflare R2** enablement + bucket + `MEDIA` binding + redeploy + upload smoke
2. **Resend** verified sender + `RESEND_API_KEY` / `RESEND_FROM` + notify email + Retry queue
3. Owner confirms hours and business email
4. Authorized Workers deploy of this branch (security headers not live until then)
5. Live CMS write workflows still NOT TESTED on staging D1 (intentional)

## Deployment status

- Staging worker already serves the hero/storefront swap from an earlier authorized deploy
- Security headers and `main` source parity require merging + authorized `npm run deploy:vinext`
- **Do not deploy without approval; do not change DNS**

## Rollback

1. **Code:** redeploy previous Workers version / prior git SHA
2. **Public content emergency:** set worker var `VINNYS_SNAPSHOT=1` and redeploy — public reads use `src/lib/public-snapshot.json`; writes still hit D1; **do not delete inquiry rows**
3. **Data:** restore from D1 backup export (see `docs/d1-backup-recovery.md`)

## Recommended next steps

1. Merge this PR to `main`
2. Owner completes R2 + Resend per `owner-setup.md`
3. Authorized deploy; smoke media upload + inquiry email + admin retry; confirm security headers with `curl -sI`
4. Owner content checklist
5. Then Phase 3 visual/UX (out of scope here) — LCP improvement is a natural Phase 3 item
