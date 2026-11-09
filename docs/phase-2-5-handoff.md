# Phase 2.5 handoff

## Changes made

Reliability and security hardening on branch `cursor/phase-2-5-reliability-058e` (no production deploy from this workstream; no DNS changes).

### Notification reliability

- Extended `notify_queue` with `status`, `attempts`, `last_attempt_at`, `sent_at`
- Upsert enqueue; skip re-queue after `sent`
- Record Resend API acceptance (`accepted-by-resend`)
- Admin inquiries page shows status + **Retry failed notifications**
- Backoff and max 5 attempts

### Media hardening (R2 still owner-blocked)

- Magic-byte image validation
- UUID object keys
- Rollback R2 object if DB insert fails
- Delete with in-use guard (hero/events)

### Security / forms

- Tighter `sameOriginPost` when `Sec-Fetch-Site` is cross-site
- Existing admin `isAdmin`, rate limits, honeypot retained

### Tooling

- `npm run typecheck`, `npm run ci`
- GitHub Actions workflow `.github/workflows/ci.yml`
- Tests in `tests/phase25.test.mjs`

### Documentation

- `docs/phase-2-5-audit.md`
- `docs/phase-2-5-qa.md`
- `docs/owner-setup.md`
- `docs/d1-backup-recovery.md`
- This handoff

## Files affected (primary)

- `src/lib/notify.ts`, `image-bytes.ts`, `media.ts`, `content.ts`, `db.ts`, `d1-store.ts`, `mutate.ts`, `format.ts`, `messages.ts`, `types.ts`
- `src/app/api/admin/media/route.ts`
- `src/app/admin/(panel)/media/page.tsx`, `inquiries/page.tsx`
- `cloudflare.config.ts` (comments only)
- `package.json`, `.github/workflows/ci.yml`, `.env.example`
- `tests/phase25.test.mjs`
- `docs/*` Phase 2.5 set

## Tests performed

- `npm test` — 12 passed
- `npm run typecheck` — clean
- `npm run build:vinext` — success
- Read-only browser QA on staging (see `phase-2-5-qa.md`)

## Outstanding defects / notes

- Desktop header is not sticky (UX note, not a blocker)
- Core Web Vitals not measured
- Live CMS write tests on staging D1 not run (avoid mutating live data without deploy of this branch)

## Owner-dependent blockers

1. Cloudflare R2 enablement + bucket + `MEDIA` binding
2. Resend verified sender + `RESEND_API_KEY` / `RESEND_FROM`
3. Confirm hours and notification email

## Deployment status

- Staging worker still runs **pre–Phase 2.5** code until an authorized deploy of this branch
- PR should target `main`; merge ≠ automatic Workers deploy unless your pipeline deploys on merge
- **Do not deploy without approval**

## Rollback

1. **Code:** redeploy previous Workers version / prior git SHA
2. **Public content emergency:** set worker var `VINNYS_SNAPSHOT=1` and redeploy — public reads use `src/lib/public-snapshot.json`; writes still hit D1; **do not delete inquiry rows**
3. **Data:** restore from D1 backup export (see `docs/d1-backup-recovery.md`)

## Recommended next phase

1. Owner completes R2 + Resend; authorized deploy of this branch
2. Smoke: media upload + inquiry email + admin retry
3. Owner content checklist in `owner-setup.md`
4. Then Phase 3 visual/UX refinement (out of scope here)
