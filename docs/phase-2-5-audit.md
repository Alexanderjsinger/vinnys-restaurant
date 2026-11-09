# Phase 2.5 audit

Branch: `cursor/phase-2-5-reliability-058e`  
Repo: `Alexanderjsinger/vinnys-restaurant`  
Staging: https://vinnys-bar-grill.toastisadog.workers.dev/  
Authoritative D1: `vinnys-bar-grill` (`5bd8ee69-a229-4156-a6fa-166f55e3abcb`)

## Environment isolation

| Check | Result |
| --- | --- |
| Git remote | `github.com/Alexanderjsinger/vinnys-restaurant` only |
| Cursor environment repos | Vinny only (`7e682a92-dc57-11f1-8120-06b44be262b7`) |
| Workspace contains site source | Yes (repo root) |
| Game Intelligence Lab present | No |

## Current implementation status

| Area | Status |
| --- | --- |
| D1 CMS (menu, events, hours, homepage, inquiries) | Working on staging |
| Admin auth (HMAC session, fail-closed) | Working |
| Draft / publish / preview | Working |
| Inquiry persistence | Working (SQLite local / D1 staging) |
| Notification queue | Hardened in this phase (status, attempts, retry, admin visibility) |
| Resend delivery | **BLOCKED** — secrets/sender not configured |
| R2 media upload | Code ready; **BLOCKED** — R2 not enabled on account |
| Public static photos in `public/` | Working |
| CI (`typecheck`, `test`, `build:vinext`) | Added |

## Confirmed defects addressed in this branch

1. **Notify queue had no retry or delivery state** — extended schema (`status`, `attempts`, `last_attempt_at`, `sent_at`), upsert enqueue, admin retry, duplicate-send guard.
2. **Successful Resend calls were not recorded** — `markNotifySent` now records `accepted-by-resend` (API accept ≠ mailbox delivery).
3. **Media trusted client MIME type** — magic-byte validation in `src/lib/image-bytes.ts`.
4. **Weak media object keys / orphan risk** — UUID keys; R2 delete on DB insert failure; in-use delete protection.
5. **Cross-site POST with spoofed Sec-Fetch-Site** — `sameOriginPost` tightened when Origin is absent.

## Security findings

| Severity | Finding | File | Impact | Fix / status |
| --- | --- | --- | --- | --- |
| Medium | Media Content-Type trusted from client | `api/admin/media` | Unsafe file stored if R2 enabled | **Fixed** — magic bytes |
| Medium | Notify failures invisible to owner | `notify.ts`, inquiries admin | Missed party leads | **Fixed** — status + retry UI |
| Low | Missing Origin allowed with no Sec-Fetch-Site | `format.ts` | Non-browser tooling / older agents | **Mitigated** — reject cross-site Sec-Fetch-Site |
| Low | Session keyed by admin password HMAC | `auth.ts` | Password rotation invalidates sessions (acceptable) | Documented |
| Info | Rate limits on login (10/15m), inquiry (8/15m), upload (20/h) | routes | Brute-force / spam resistance | Present |
| Info | Honeypot field is `company_website` (CSS class `.hp`) | `parties/page.tsx` | Anti-bot; not labeled “honeypot” in HTML | Working |

No secrets were logged or committed. Intrusive testing against production was not performed.

## Infrastructure dependencies (owner)

1. Enable Cloudflare R2 → create bucket → bind `MEDIA` (see `owner-setup.md`).
2. Create Resend account → verify sender → set `RESEND_API_KEY` + `RESEND_FROM`.
3. Confirm business hours and notification email (currently interim / unconfirmed).

## Architectural concerns

- Single D1 database serves staging worker; there is no separate production D1 yet. Treat the bound DB as live business data.
- Seed runs once (`meta.content_seed`) with `ON CONFLICT DO NOTHING` — safe, but interim `notify_email` was part of the original seed.
- `VINNYS_SNAPSHOT=1` rolls public reads back to JSON snapshot without deleting inquiries — preferred emergency public rollback.
- Media and Resend bindings intentionally omitted from `cloudflare.config.ts` until owner enables them (avoids deploy hard-fail).

## Recommended corrections (remaining)

1. Owner enables R2 + Resend, then redeploy with bindings/secrets.
2. Owner confirms hours and notify email in Admin → Place.
3. After Resend is live, run admin “Retry failed notifications” once.
4. Before domain cutover: re-run QA matrix on production host; keep workers.dev `noindex`.
