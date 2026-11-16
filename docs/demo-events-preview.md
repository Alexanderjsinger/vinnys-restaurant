# Demo week preview

The homepage and `/events` can display five in-memory Monday–Friday concepts. No D1 records are created, edited, archived, or deleted; the existing registered demo row remains intact. Other public pages and admin continue using their normal data sources.

## Local development

`VINNYS_DEMO_EVENTS=1` in the gitignored `.env.local` enables concepts during `next dev`. Restart the server if the flag changes. This local flag cannot enable concepts in a production build.

## Staging Worker

`cloudflare.config.ts` sets the runtime text binding `VINNYS_STAGING_DEMO_EVENTS` to `"1"`. The server also requires the request Host to exactly match `vinnys-bar-grill.toastisadog.workers.dev`; custom domains and other Workers hosts use real published events even if the switch is enabled. Do not substitute forwarded-host headers. This scopes display behavior, not private access: anyone visiting staging can see the mockups.

Both routes retain a visible “Demo week — concepts only” notice. All five concepts appear on the homepage. Dates use next Monday–Friday in Detroit calendar terms; 19:00–21:00 is illustrative only. No prices, real hosts, prizes, specials, booking links or performers are asserted.

To restore real staging events, change the text binding to `"0"` in the config and deploy through `npm run ci && npm run deploy:vinext`. No data cleanup is needed. Normal real-event mode retains the three-upcoming homepage limit. Workers Builds stays disconnected.

Concepts: Monday Trivia & Table Games; Tuesday Acoustic Evenings; Wednesday Open Mic at Vinny’s; Thursday Themed Dinner Night; Friday Game Night at Vinny’s.

E6 HOLD remains unchanged. This is visual fixture coverage, not CMS acceptance or event scheduling approval.
