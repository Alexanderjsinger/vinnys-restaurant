# Owner setup — Vinny’s Bar & Grill

Plain-language steps for finishing Phase 2.5. **Do not paste API keys into chat, git, or screenshots.**

## 1. Cloudflare R2 (photo uploads)

Photo upload is built but turned off until R2 exists.

1. Sign in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Open **R2 Object Storage**.
3. If prompted, **Enable R2** (account setting). This may require billing confirmation — approve only if you intend to use R2. Free tier includes storage allowance; see Cloudflare pricing.
4. Create a bucket, for example `vinnys-bar-grill-media` (name is yours to choose; keep it private).
5. Tell your developer the bucket name. They will add a `MEDIA` binding in `cloudflare.config.ts` and redeploy.
6. After deploy, open **Admin → Photos**, upload a small JPEG/PNG/WebP/GIF under 4 MB with alt text, then use `/media/<id>` on Homepage or Events.

Until this is done, the Photos page shows that upload is off. Existing photos in the website folder (`/photos/...`, `/hero/...`) keep working.

## 2. Resend (email when someone sends a party note)

Party notes are **always saved** in the database even when email is off.

1. Create an account at [Resend](https://resend.com/).
2. Add and **verify** a sending domain (or use Resend’s onboarding sender only for tests).
3. Create an API key.
4. Choose the From address (must be allowed by Resend), for example `notes@your-domain.com`.
5. In Cloudflare → Workers → `vinnys-bar-grill` → Settings → Variables / Secrets, set:
   - `RESEND_API_KEY`
   - `RESEND_FROM`
6. Redeploy after secrets are attached (and after `cloudflare.config.ts` declares those secrets if your deploy tool requires it).
7. In **Admin → Place**, set the restaurant email or Notify email to the address that should receive party notes.
8. Open **Admin → Party inquiries** and use **Retry failed notifications** once for any notes queued while email was off.

The admin will say a notification was “accepted by Resend” when Resend’s API accepts the message. That is **not** a guarantee it landed in the inbox.

## 3. Admin password

- Production: Cloudflare Worker secret `ADMIN_PASSWORD` (already used for login).
- Local: copy `.env.example` to `.env.local` and set your own password. Never commit `.env.local`.

## 4. Business information to approve before domain cutover

| Item | Current state | Owner action |
| --- | --- | --- |
| Restaurant name | Vinny’s Bar & Grill | Confirm |
| Address | 705 W. Cross St., Ypsilanti, MI 48197 | Confirm |
| Phone | 734-905-7051 (confirmed in CMS) | Confirm |
| Weekly hours | Present but marked **unconfirmed** | Confirm in Admin → Place |
| Holiday hours | None unless you add them | Add when needed |
| Toast ordering URL | Set in CMS | Confirm still correct |
| Reservations | Call only (`none` provider) | Confirm |
| Notify / place email | Interim notify address seeded; unconfirmed | Set final business email |
| Events | Empty on public site (good) | Add real events only |
| Birthday list | Closed | Keep closed until offer + DOB + opt-out exist |
| Photos | Repo stock / venue images | Replace with owner-approved photos when R2 is on |

## 5. Production launch prerequisites (not done in Phase 2.5)

- [ ] R2 enabled and media smoke-tested
- [ ] Resend verified and a test party note accepted
- [ ] Hours and emails confirmed
- [ ] Backup taken (see handoff / D1 export)
- [ ] Explicit approval to deploy
- [ ] DNS cutover for vinnysbargrill.com (separate decision — **do not change DNS until ready**)

## 6. What not to do

- Do not put secrets in the git repository.
- Do not enable paid Cloudflare products without understanding billing.
- Do not point the real domain until the checklist above is done.
