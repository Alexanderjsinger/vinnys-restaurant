# Admin CSRF and same-origin hardening

**Status:** Merged to `main` as `b7bf813` (PR #9 tip `3c838e6`). Staging-verified **PASS** on Worker `22ba677c-9192-40da-8dfe-6666d0a5b039`. Closure record: [`security-closure-csrf.md`](security-closure-csrf.md).  
**Repo:** `Alexanderjsinger/vinnys-restaurant`  
**Related product:** Events/CMS remain **HOLD** — CSRF PASS does not clear product readiness. Prior gap: authenticated `POST /api/admin/save` accepted when Origin, Referer, and Sec-Fetch-Site were all absent (`sameOriginPost` treated missing headers as OK).

## Threat model

| Actor | Capability | Goal |
| --- | --- | --- |
| Cross-site page | Can cause the browser to POST to Vinny’s with cookies that `SameSite=Lax` still attaches in some edge cases, or can omit Fetch Metadata | Change CMS content / log the owner out |
| Stolen session cookie + scripted client | Cookie value only; cannot read HTML of `/admin/*` | Replay CMS mutations without a browser |
| Public guest | No admin cookie | Submit party inquiry / contact flows only |

**Out of scope for this change:** full login CSRF tokens (login still requires same-origin checks + rate limit + password), R2/Resend enablement, Events/CMS product UX. Security headers are live on staging with the CSRF deploy (see security closure).

## Controls

### 1. `sameOriginPost` (`src/lib/format.ts`)

Used by:

- `POST /api/admin/login`
- `POST /api/admin/save`
- `POST /api/admin/media`
- `POST /api/admin/logout`
- `POST /api/inquiries` (public parties form)

Rules (first match wins):

1. If `Origin` is present → host must equal the request host.
2. Else if `Sec-Fetch-Site` is present → must be `same-origin`, `same-site`, or `none`.
3. Else if `Referer` is present → host must equal the request host.
4. Else → **reject** (missing headers are not trusted).

Legitimate browsers send at least one of these on form POSTs. Public `/parties` inquiries keep working under normal browser conditions; they do **not** use admin CSRF tokens.

### 2. Session-bound CSRF tokens (admin mutations only)

Token = `HMAC-SHA256(ADMIN_PASSWORD, "csrf:v1:" + sessionCookie)` (`src/lib/csrf.ts`).

- Embedded as hidden field `csrf` via `AdminForm` / `CsrfField` / logout `CsrfInput`.
- Validated with `verifyCsrfForm` after `sameOriginPost` + `isAdmin` on:
  - `POST /api/admin/save`
  - `POST /api/admin/media`
  - `POST /api/admin/logout`
- Bound to the current session cookie; password rotation or session expiry invalidates tokens.
- Not required for public inquiries or signup (signup remains closed).

### 3. Auth gate (unchanged)

`isAdmin()` still requires a valid HMAC session cookie. CSRF does not replace auth.

## Routes audited

| Route | Auth | Same-origin | CSRF | Notes |
| --- | --- | --- | --- | --- |
| `POST /api/admin/login` | Password | Yes | No (pre-session) | Rate-limited |
| `POST /api/admin/logout` | Session | Yes | Yes | Clears cookie only after CSRF OK |
| `POST /api/admin/save` | Session | Yes | Yes | All CMS intents via `applyAdminSave` |
| `POST /api/admin/media` | Session | Yes | Yes | Upload + delete |
| `POST /api/inquiries` | Public | Yes | No | Honeypot + rate limit |
| `POST /api/signup` | N/A | N/A | N/A | Always redirects closed |
| `POST /api/track` | Public | N/A | N/A | Allowlisted analytics events only |

Admin UI surfaces that POST to save/media/logout: Place, Homepage, Menu, Events, Ordering, Inquiries, Photos, Log out.

## Validation results (local)

Commands:

```bash
npm test
npm run typecheck
```

Expected:

- `sameOriginPost` unit cases: bare POST → false; matching Origin → true; evil Origin → false.
- CSRF unit cases: stable token per session; wrong session/password/token → false.
- Source guards: admin save/media/logout call `verifyCsrfForm`; panel pages use `AdminForm`; parties form unchanged.

Staging verification of the missing-header / CSRF matrix is **complete** (independent QA PASS). See [`security-closure-csrf.md`](security-closure-csrf.md) for evidence pointers. Do not re-mutate customer D1 for casual re-probes.

## Manual browser check (post-deploy smoke)

1. Sign in at `/admin/login` → Overview loads.
2. Edit a draft field and save → success banner (CSRF present in form).
3. Log out → returns to login.
4. Submit `/parties` inquiry in a normal browser → still redirects to sent/error as before.
5. Scripted authed POST to `/api/admin/save` with session cookie but **no** Origin/Referer/Sec-Fetch-Site and **no** `csrf` → redirect to login, no write.
