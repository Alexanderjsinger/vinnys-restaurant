# Homepage visual QA

Validate the public refinement against its source SHA and actual rendered behavior. Staging: https://vinnys-bar-grill.toastisadog.workers.dev/. Record the deployed version separately; local SQLite content can differ from staging D1.

## Automated checks

Run `npm run ci` (typecheck, tests, Vinext production build). Homepage guardrails cover published-content reads, honest call-to-reserve actions, matching food photography with text fallback, navigation disclosure semantics, motion preferences, and the Range-aware video source. Source assertions complement browser checks; they do not establish visual acceptance.

## Rendered checks

Capture before/after screenshots at **390×844, 430×932, 768×1024, 1280×800, and 1440×900**. Scroll through each page before full-page capture so lazy images load. Record date, source SHA, viewport, Expected / Actual / Result / Evidence. Use PASS / FAIL / BLOCKED / NOT TESTED.

| Surface | Expected |
| --- | --- |
| Desktop hero/header | Full-viewport reel, readable overlay header throughout playback; a clearly visible View Menu link inside the reel that remains clickable over the video |
| Mobile header | Compact logo, CMS Order link when configured, menu disclosure; no overlap or overflow; targets at least 44px |
| Navigation | Menu opens and closes; Escape closes and returns focus; hidden links are not keyboard reachable; links reach advertised routes |
| Hero motion | Reel loops automatically without visible playback buttons; reduced motion and Save-Data use still poster; mobile reel remains 16:9 |
| Quick actions | Menu, Call to Reserve (`tel:`), and Directions; no nonfunctional party/date/time inputs |
| Food | Published names, descriptions, prices; only matching approved burger/cauliflower photos; one highlighted dish at a time in balanced photo/copy panels; previous/next inside the text panel and a captionless photo preview rail directly below; only dishes with confirmed matching photos are featured; Lunch / Happy Hour / Dinner expand one menu at a time; unconfirmed menus show a details-unavailable message |
| Events | Compact dark cards; dates/times prominent, descriptions readable, status/next-step behavior preserved; home displays at most three upcoming |
| Visit | Authentic storefront beside a cream Our Story panel on desktop, photo then story on mobile; known-facts copy only; one bottom footer with branding, hours, address, and navigation; no repeated Visit/Hours band above it |
| Public routes | `/`, `/menu`, `/events`, `/about`, `/contact`, `/order`, `/reserve` render; legacy `/parties` redirects to Contact |
| Media | No broken image paths; `/api/sizzle` serves video and Range requests return 206 |

Do not infer real-device PASS from desktop emulation. Record an actual mobile-browser check separately when available.

## Data and release constraints

- No live D1 writes during visual review. Leave the registered Limp Bizkit demo row unchanged.
- Demo content remains excluded from production launch readiness: see `events-demo-content-registry.md`.
- Empty-state recovery requires independent evidence; do not archive demo content to manufacture it.
- Preserve necessary attribution based on verified image permissions; never invent credit or restaurant facts.
- E6 HOLD is separate from visual review and remains unchanged until its acceptance evidence is reviewed.
- Publish only with owner approval through the established Vinext path; Workers Builds remains disconnected.

## Mobile dish refinement — 2026-11-15

Owner iPhone screenshot showed a collapsed feature media frame while its thumbnail loaded. Replace the mobile grid/aspect-ratio-only sizing with an explicit responsive image-frame height. Keep imagery within the frame with object-fit cover. Root cause on the exact owner device is inferred from the screenshot; real-device recheck remains NOT TESTED.

Use “From Vinny’s Kitchen”, no pagination dots or preview text overlays, navigation and Order inside the text panel, plain descriptions, closer photo previews, and a clearly sized Menus H2. Only burger, cauliflower and wings have confirmed matching photos; unphotographed dishes remain available in the menus.

Browser verification: Chromium and WebKit at 320/390/430/768/1440px PASS for loaded feature image with height >200px, all three photo previews, no dots/captions, preview selection, previous/next navigation and no horizontal overflow. Local screenshots inspected. E6 HOLD unchanged; no D1 edits.
