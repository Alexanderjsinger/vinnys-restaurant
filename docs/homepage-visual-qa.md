# Homepage visual QA

Validate the public refinement against its source SHA and actual rendered behavior. Staging: https://vinnys-bar-grill.toastisadog.workers.dev/. Record the deployed version separately; local SQLite content can differ from staging D1.

## Automated checks

Run `npm run ci` (typecheck, tests, Vinext production build). Homepage guardrails cover published-content reads, honest call-to-reserve actions, matching food photography with text fallback, navigation disclosure semantics, motion preferences, and the Range-aware video source. Source assertions complement browser checks; they do not establish visual acceptance.

## Rendered checks

Capture before/after screenshots at **390×844, 430×932, 768×1024, 1280×800, and 1440×900**. Scroll through each page before full-page capture so lazy images load. Record date, source SHA, viewport, Expected / Actual / Result / Evidence. Use PASS / FAIL / BLOCKED / NOT TESTED.

| Surface | Expected |
| --- | --- |
| Desktop hero/header | Full-viewport reel, readable overlay header throughout playback; one clear action area below the reel |
| Mobile header | Compact logo, CMS Order link when configured, menu disclosure; no overlap or overflow; targets at least 44px |
| Navigation | Menu opens and closes; Escape closes and returns focus; hidden links are not keyboard reachable; links reach advertised routes |
| Hero motion | Reel loops automatically without visible playback buttons; reduced motion and Save-Data use still poster; mobile reel remains 16:9 |
| Quick actions | Menu, Call to Reserve (`tel:`), and Directions; no nonfunctional party/date/time inputs |
| Food | Published names, descriptions, prices; only matching approved burger/cauliflower photos; one highlighted dish at a time, text-only for unmatched photos; manual previous/next; Lunch / Happy Hour / Dinner expand one menu at a time; unconfirmed menus show a details-unavailable message |
| Events | Dates/times prominent, descriptions readable, status/next-step behavior preserved; home displays at most three upcoming |
| Visit | Authentic storefront retained without added frame or crop; hours/address/call/directions legible; map and footer usable |
| Public routes | `/`, `/menu`, `/events`, `/contact`, `/order`, `/reserve` render; legacy `/parties` redirects to Contact |
| Media | No broken image paths; `/api/sizzle` serves video and Range requests return 206 |

Do not infer real-device PASS from desktop emulation. Record an actual mobile-browser check separately when available.

## Data and release constraints

- No live D1 writes during visual review. Leave the registered Limp Bizkit demo row unchanged.
- Demo content remains excluded from production launch readiness: see `events-demo-content-registry.md`.
- Empty-state recovery requires independent evidence; do not archive demo content to manufacture it.
- Preserve necessary attribution based on verified image permissions; never invent credit or restaurant facts.
- E6 HOLD is separate from visual review and remains unchanged until its acceptance evidence is reviewed.
- Publish only with owner approval through the established Vinext path; Workers Builds remains disconnected.
