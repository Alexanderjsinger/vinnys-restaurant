# Content store choice

Phase 2 is deployed. The live worker reads and writes D1 for place, hours, menu, events, and inquiries. Current status, including the R2 and email blockers and how to sign in, is in `docs/phase-2-status.md`. The rest of this note is the earlier reproduction that led to that choice.

This note records the fixture run and the choice between a Cloudflare database and a managed CMS.

No production D1 query was sent. `cloudflare.config.ts` binds the live database `5bd8ee69-a229-4156-a6fa-166f55e3abcb`, so a Workers preview was not started. A preview on that binding could read or write real inquiries. The reproduction uses a temporary SQLite file and an in-memory stand-in for D1.

## What the fixture showed

`npm test` at the repo root runs `tests/stores.test.mjs`. Seven tests passed.

One test creates a throwaway database, changes Vinny’s Burger from 16 to 99, renames the restaurant to “Fixture Grill,” and stores `fixture-guest@example.com`. With `VINNYS_SNAPSHOT=1`, the same file still has those rows, and the public read does not. The public menu price stays 16. The public name stays Vinny’s Bar & Grill. `getDb()` and `listInquiries()` throw `SQLite is not used on the public site.` A second inquiry, `snapshot-only@example.com`, is handed to the D1 stand-in and is absent from SQLite. Reopening the file without snapshot mode shows the 99 price and only the first email.

The other tests originally locked gaps that Phase 2 later closed. Current truth (also covered by `npm test`):

- No public component reads `site.promo`, `site.story`, or `site.reservation`.
- Order links use the CMS Toast URL only; an empty URL hides Order (no hardcoded public fallback).
- Menu updates write `gluten_free` and related dietary fields.
- `pageMeta("/menu", …)` returns canonical `https://vinnysbargrill.com/menu`.
- Source marks a `workers.dev` host `noindex` and blocks `/` in `robots.txt`.
- A GET of the live worker returned `noindex`, that canonical, `Disallow: /`, and sitemap URLs for `/`, `/menu`, `/events`, `/parties`, and `/contact`.

For live status, R2/Resend blockers, and Phase 2.5 hardening, see `docs/phase-2-status.md` and `docs/phase-2-5-handoff.md`.

`site/data/site.sqlite` was not part of the fixture. Its file time is still November 8.

## Two ways to keep one published copy

| | D1 for content and leads | Sanity for content, D1 for leads |
| --- | --- | --- |
| What the owner edits | The admin already in this repo | Sanity Studio |
| What the live site reads | The same D1 tables the admin writes | Sanity’s API, cached in the worker |
| Party notes | The same D1 database, plus one email when a row is stored | Still need D1 or email. A public Sanity dataset is the wrong place for a guest’s phone and date |
| Photos | Stay in the repo until there are real owner photos. R2 is the later upload bucket | Sanity’s asset library |
| Drafts and history | Not in the first slice. Add a published flag when the straight save works | Included. Free plan history is short; Growth adds scheduled drafts |
| Who maintains it | Whoever deploys this worker: SQL migrations, the admin screens, login, backups | A Sanity project plus the website. Schema changes are still code |
| New accounts | None. The D1 database is already bound | A Sanity login and an API token on the worker |
| Published price | D1’s included allowance covers a menu, events, and a handful of inquiries. Workers Free includes 5 million row reads a day, 100,000 row writes a day, and 5 GB. Paid plans include more before overage. Source: [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), updated October 30, 2026. This account’s plan was not re-checked | [Sanity pricing](https://www.sanity.io/pricing): Free is $0, up to 20 seats, two public datasets. Growth is $15 per editing seat each month and adds private datasets. This site’s menu fits Free. Party leads should not |

R2’s published free tier includes 10 GB-month ([Cloudflare pricing](https://www.cloudflare.com/pricing.md)). That matters after photo upload exists. It does not fix the publish gap.

## Choice

Use D1 as the only store for place, hours, menu, events, and party inquiries. Drop snapshot mode once a public page can read a row that admin just wrote. Send email when an inquiry is stored. Turn the birthday form off until the offer, the birth date, and a way to opt out exist. Leave promo, story, and reservations off the public site, or stop showing those admin screens.

Sanity is the right later move if Vinny is editing every week and nobody wants to keep the custom admin. It does not replace the inquiry inbox, and it adds a second login before the first publish path works.

The first build slice is four reads and four writes on D1: menu price, one event, hours, and one inquiry the owner can open. No R2, no roles, no draft history in that slice. When that slice lands, the snapshot test should be rewritten so a saved price of 99 is what the public read returns.
