# Phase 2 status

Copied into this repo from the Vinny Project store when the site was imported onto `setup/phase-2-site`. Live worker at time of import: [vinnys-bar-grill](https://vinnys-bar-grill.toastisadog.workers.dev). DNS was not changed. Application source is the repository root.

Slices A–D are in the deployed worker. Two owner setup steps are blocked: R2 and Resend. Admin sign-in works.

## What shipped

D1 (`5bd8ee69-a229-4156-a6fa-166f55e3abcb`) is the live store for place, hours, menu, events, and inquiries. The worker reads and writes those tables. Local `npm run dev` still uses SQLite through the same repository (`src/lib/content.ts`). `VINNYS_SNAPSHOT=1` switches public reads back to `src/lib/public-snapshot.json`. That file is backup/seed only. It is not the default live source.

The first request seeded D1 once (`meta.content_seed`). Seed data is the current lunch menu, the address 705 W. Cross St., Ypsilanti, MI 48197, the phone 734-905-7051, the existing Toast URL stored as a setting, weekly hours copied as unconfirmed, and the homepage lines that already match the public page. No events were seeded. Existing inquiry rows are not deleted by the seed (`CREATE TABLE IF NOT EXISTS` and `ON CONFLICT DO NOTHING`).

Party notes and the admin inquiries list use that same `inquiries` table. The public page says “Inquiry received” only after a successful insert. A cross-origin post returns “That note did not save” and does not insert. The honeypot still pretends success and does not insert.

If the place email is set, that address is the owner notify target. Otherwise the editable Place field `notify_email` is used. It was seeded with the interim address. Email is not sent: see Blocked.

The birthday form is gone. `/api/signup` redirects to `/?join=closed#list` and does not insert. The homepage says the list is closed until an offer, a birth date, and an opt-out exist.

Promo, story, and reservations admin screens redirect away. They are not in the admin nav. Order uses the CMS Toast URL only. An empty URL hides Order and `/order` tells the guest to call. There is no hardcoded public fallback.

Events can be created and edited (title, description, date, start, optional end, optional price, status). Times are America/Detroit local values. Past events drop off the upcoming list. Home and `/events` share `listEvents("public")`.

Menu editing is category, then item: name, description, price, availability, gluten-free mark, dietary note, order, and status. Price must be a number with at most two decimal places. Delete asks for confirmation. The public menu stays HTML.

Each menu item, section, event, and hours row has `draft`, `published`, or `archived`, plus `updated_at` and `published_at`. Save draft and Publish are separate. The banner says when a draft is off the public site and when a publish is live. Signed-in `/admin/preview` shows drafts. Scheduled publish and revision history are deferred.

Homepage admin edits the hero heading, hero text, optional hero image, and footer tagline. Those are the fields the public page renders. Holiday hours for a date range render above the weekly hours when the range includes today in Detroit.

`ADMIN_PASSWORD` is a worker secret. The example string `local-dev-only-change-me` is not in `src/lib/auth.ts` and was not in the production bundle. Login fails closed when the secret is missing.

## Blocked

**R2 / photo upload.** `cf r2 buckets create` returned 403, API error 10042: “Please enable R2 through the Cloudflare Dashboard.” The `MEDIA` binding was left out of `cloudflare.config.ts` so deploy does not require a bucket that does not exist. `/admin/media` stays in the nav and says photo upload is off because no R2 bucket is bound. Upload, preview, alt text, and type/size checks are implemented and stay disabled until R2 is enabled and a bucket is bound.

**Email.** No Resend API key was available, and none was invented. `RESEND_API_KEY` and `RESEND_FROM` are not set. A new party note is stored, a row is added to `notify_queue` with the reason, and the worker logs that the note was queued. The guest is not told that an email went out. The inquiries page says the same. To turn email on later, set both secrets and a real `RESEND_FROM`. Do not put the key in the repo.

**Password handling.** Keep `ADMIN_PASSWORD` out of git. Do not commit password files or `.env.local`.

## How to sign in

Open https://vinnys-bar-grill.toastisadog.workers.dev/admin/login and use the worker secret `ADMIN_PASSWORD` (set in Cloudflare; never commit it). Locally, copy `.env.example` to `.env.local` and set a private value.

The session cookie lasts 12 hours. Wrong passwords and a missing secret both stay on the login page.

## Validation

`npm test` in the site: 7 passed. Production build is `npm run build:vinext` (Vite). That build completed and `vinext-cloudflare deploy` published the worker. Deployed code version before the secret was reattached: `1db5d42f-e4e5-4b7d-9f10-e6819dff8994`. The secret was set again after that deploy so the current version can sign in. Login was then checked on the live worker.

Live acceptance on https://vinnys-bar-grill.toastisadog.workers.dev, then restored:

1. Publishing Vinny’s Burger at 99 showed `$99` on `/menu` without a rebuild. Price is back to 16.
2. A future published event appeared on the homepage and `/events`, then was deleted. `events` count is 0. No sample events were seeded.
3. A one-day temporary hours row appeared above the weekly hours, then was deleted. No holiday rows remain. Weekly hours are still unconfirmed.
4. A party note was stored and listed in admin. `/parties?sent=1` says “Inquiry received” and “We have your note,” and does not say an email was sent. `/parties?error=save` does not say the inquiry was received. A foreign `Origin` did not insert. A honeypot did not insert. The test row was deleted. After that, `inquiries` count is 0. The delete matched only the test email. No other inquiry id was deleted.
5. The homepage has no birthday form. Posting to `/api/signup` returns `/?join=closed#list`.
6. Clearing the Toast setting hid `order.toasttab.com`. `/order` showed the phone instead of redirecting. The previous Toast URL was saved back and Order works again.
7. A draft item stayed off `/menu` and showed on `/admin/preview`, then was deleted.

## Rollback

Set the worker variable `VINNYS_SNAPSHOT` to `1` and redeploy if public reads must come from the snapshot again. Writes still go to D1. Do not delete inquiry rows to roll back.
