# Phase 2.5 audit

Follow-up branch: `cursor/phase-2-5-followup-a5de`  
Prior hardening landed on `main` via PR #2 (`2a60b97`).  
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
| Notification queue | Hardened on `main` (status, attempts, retry, admin visibility) |
| Resend delivery | **BLOCKED** — secrets/sender not configured |
| R2 media upload | Code ready; **BLOCKED** — R2 not enabled on account |
| Public static photos in `public/` | Working |
| CI (`typecheck`, `test`, `build:vinext`) | Present since PR #2 |
| Hero ↔ storefront image swap | Live on staging; **ported to `main` in this follow-up** (PR #5 had merged onto a feature branch, not `main`) |
| Baseline security response headers | Added in this follow-up (`src/middleware.ts` + `next.config.ts`); live staging still lacks them until authorized deploy |

## Confirmed defects addressed previously (PR #2)

1. Notify queue retry / delivery state
2. Resend acceptance recorded as `accepted-by-resend` (not mailbox proof)
3. Media magic-byte validation
4. UUID media keys + R2 rollback + in-use delete guard
5. Tighter `sameOriginPost` for cross-site `Sec-Fetch-Site`

## Confirmed defects addressed in this follow-up

1. **`main` missing hero/storefront swap** — poster, venue band, layout OG, and `seo` share image now match staging intent (`/photos/storefront.webp` hero; `/hero/meet-me.jpg` venue).
2. **Missing baseline security headers** — `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy` camera/mic/geo disabled; admin paths also get `Cache-Control: private, no-store` via middleware.
3. **`sameOriginPost` Referer gap** — when Origin and Sec-Fetch-Site are absent, a cross-host Referer is now rejected.
4. **Regression coverage** — tests for security headers helper, closed birthday signup, hero asset consistency, Referer same-origin check.

## Security findings

| Severity | Finding | File | Impact | Fix / status |
| --- | --- | --- | --- | --- |
| Medium | Media Content-Type trusted from client | `api/admin/media` | Unsafe file if R2 enabled | **Fixed in PR #2** — magic bytes |
| Medium | Notify failures invisible to owner | `notify.ts`, inquiries admin | Missed party leads | **Fixed in PR #2** — status + retry UI |
| Low–Medium | No browser security headers on responses | Worker HTML | Clickjacking / MIME sniffing exposure | **Fixed in this branch** — awaiting deploy |
| Low | Missing Origin allowed with no Sec-Fetch-Site | `format.ts` | Non-browser / older agents | **Mitigated** — reject cross-site Sec-Fetch-Site; reject bad Referer |
| Low | Session keyed by admin password HMAC | `auth.ts` | Password rotation invalidates sessions (acceptable) | Documented |
| Info | Rate limits on login (10/15m), inquiry (8/15m), upload (20/h) | routes | Brute-force / spam resistance | Present |
| Info | Honeypot field is `company_website` (CSS class `.hp`) | `parties/page.tsx` | Anti-bot; not labeled “honeypot” in HTML | Working |
| Info | Skip link `#main` present | `layout.tsx` | Keyboard bypass of chrome | Working |

No secrets were logged or committed. Intrusive testing against production was not performed.

## Infrastructure dependencies (owner)

1. Enable Cloudflare R2 → create bucket → bind `MEDIA` (see `owner-setup.md`).
2. Create Resend account → verify sender → set `RESEND_API_KEY` + `RESEND_FROM`.
3. Confirm business hours and notification email (currently interim / unconfirmed).
4. Authorize Workers redeploy so security headers + `main` hero swap are live (staging already has the image swap from an earlier deploy).

## Architectural concerns

- Single D1 database serves staging worker; there is no separate production D1 yet. Treat the bound DB as live business data.
- Seed runs once (`meta.content_seed`) with `ON CONFLICT DO NOTHING` — safe, but interim `notify_email` was part of the original seed.
- `VINNYS_SNAPSHOT=1` rolls public reads back to JSON snapshot without deleting inquiries — preferred emergency public rollback.
- Media and Resend bindings intentionally omitted from `cloudflare.config.ts` until owner enables them (avoids deploy hard-fail).

## Recommended corrections (remaining)

1. Owner enables R2 + Resend, then redeploy with bindings/secrets.
2. Owner confirms hours and notify email in Admin → Place.
3. After Resend is live, run admin “Retry failed notifications” once.
4. Authorize deploy of this follow-up so security headers ship.
5. Before domain cutover: re-run QA matrix on production host; keep workers.dev `noindex`.
