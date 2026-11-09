# Homepage visual QA

Catch image-frame and CTA regressions before merge. Staging: https://vinnys-bar-grill.toastisadog.workers.dev/

## Automated (required in CI)

```bash
npm test
```

`tests/homepage-layout.test.mjs` asserts:

1. `home-intro` has **no** twin `.cta-row` (header keeps Call / Directions / Order).
2. Lunch plate figures use a **4/3** frame with `object-fit: cover` (not letterboxed `contain` into tall voids).
3. Desktop CSS does **not** force bare `.shot img { width: 100% }` (the Phase 2 letterbox regression).
4. Hero `.poster` and `.venue-shot img` declare landscape `aspect-ratio` with cover crop; venue is not capped at `14rem`.

## Manual smoke (desktop + mobile)

Viewports: **1280×800** and **390×844**.

| Check | Pass criteria |
| --- | --- |
| Header CTAs | Exactly one primary utility row: Call / Directions / Order |
| Intro | Brand + lede only — no second gold button row under the H1 |
| Hero | Landscape band; not a flat crushed strip; overlay readable |
| Lunch plates | Food fills the frame; no tall empty black pillars above/below the photo |
| Storefront band | Wide landscape crop; not a skinny ribbon |
| Mobile | Same rules; header actions wrap once; plates stack without letterbox voids |

## Evidence

Before/after captures for the layout fix live in the Project store:

`media/homepage-layout-fix/`

Record the date, viewport, and PASS/FAIL in the PR when visuals change.
