# Alternative homepage comparison

Branch: `codex/alternative-homepage`, based on accepted main `16ee814`.

The owner requested an identical reproduction of the supplied Stitch design. `public/design-b/index.html` is copied byte-for-byte from `code.html` in `stitch_vinny_s_website_design_audit.zip`; no copy, styling, image, font or link substitutions have been made. `source-design.md` is the supplied design reference, retained as reference material rather than project-wide instructions.

Preview the alternative at `/design-b/index.html`. The accepted homepage remains at `/`. Use a separate local server on port 3105 for this branch; the current preview remains on port 3100. No merge, deployment or D1 changes are part of this comparison.

This is the supplied static design prototype. Its CDN fonts/Tailwind, remote imagery/video, sample content and prototype links are retained exactly; it is not wired to the CMS or Contact submission backend. Owner selection and any later integration are separate work.

Verification: HTTP 200 and served bytes match the source SHA-256 `aa4a34881945025efa1fe1e493e2197ad4f9ab5a53dc8f6a4d4de8845fcff0ad`. Chromium captures at 390, 1440 and 2560px show no horizontal overflow. The two occurrences of the supplied wordmark URL fail to load; they remain unchanged under the owner's identical-copy requirement. Other supplied image URLs loaded during the check. `npm run ci` passes (68 PASS, 2 SKIP). External resources are still subject to their providers' availability.
