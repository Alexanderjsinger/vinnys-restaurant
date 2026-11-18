# Contact forms

The Contact page includes a separate email signup and a general outreach form for questions, special events and promotions. Both use `/api/contact`. The legacy birthday `/api/signup` endpoint remains closed and the party `/api/inquiries` flow stays unchanged.

## Storage and owner workflow

- Email signup requires an unchecked-by-default explicit opt-in, validates and normalizes the email address, and inserts into the existing `signups` table only if a case-insensitive match does not exist. The existing `created_at` records the signup time. There is no campaign/welcome-email integration in this change. Existing records may predate this consent wording; do not infer their consent from their presence in the table.
- Outreach stores name, email and a topic-prefixed message in the existing `inquiries` table. Event date is empty and party size is zero, meaning unspecified; no fictional event details are inserted. Sending a message never signs someone up for marketing.
- Authenticated `/admin/inquiries` shows email contacts and outreach messages alongside existing inquiries. General messages display as Contact message rather than Party of 0.
- Owner notifications use the existing Resend/queue system after durable message storage. Missing provider credentials or notification failures leave the message available in admin. Guest success copy confirms receipt, not email delivery. Automated campaigns and unsubscribe management require a mailing-service setup before using the captured list for campaigns.

No schema migration or live-data backfill is introduced. Local SQLite and D1 share the same write behavior. Implementation/QA does not write live D1 or send live test emails.

## Input and feedback

- Required Origin is checked with the project same-origin helper; only URL-encoded POSTs accepted; streamed bodies capped at 16 KiB.
- Shared per-client limit: 8 submissions per 15 minutes, using the existing persistence-backed rate limiter. Cloudflare client IP is used on Workers; unknown clients share a fallback bucket.
- Honeypot requests return generic success without storing contact details.
- Server-side field limits: name 120 characters, email 200, message 2,000; topic allowlisted; signup consent required.
- Browser retains entries on a failed request and announces status with an accessible live region. Native forms also submit without JS and redirect to a non-PII Contact status URL; the native fallback does not retain entries after an error.
- Separate forms have unique labels/IDs; email inputs use autocomplete and email keyboards. Message details are used for replies only; marketing is a separate choice.

## Verification

Unit tests cover validation/consent, message/signup separation, bot/rate rejection, persistence failure and notification failure after storage. Local API checks cover origin, content type, body size, deduplication, redirects and throttling. Chromium 390/768/1440 and WebKit 390 captures confirm no horizontal overflow; actual local submissions and retained values after a simulated save failure are checked. Stored local test records and queued notification reason confirm persistence; Resend was not configured and no emails were sent. Live D1/Resend acceptance remains NOT TESTED. E6 HOLD unchanged.
