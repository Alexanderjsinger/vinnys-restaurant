# Alternative homepage comparison

Branch: `codex/alternative-homepage`, based on accepted main `16ee814`. Local comparison: accepted Design A at `http://localhost:3105/`, alternative Design B at `http://localhost:3105/design-b/index.html`. The main homepage and backend remain unchanged.

## Supplied baseline

The first prototype commit `50d7c69` copied `code.html` from `stitch_vinny_s_website_design_audit.zip` byte-for-byte (55,394 bytes), identical to the pasted HTML. SHA-256: `aa4a34881945025efa1fe1e493e2197ad4f9ab5a53dc8f6a4d4de8845fcff0ad`. `source-design.md` is the supplied design reference, retained as reference material rather than project-wide instructions.

## Owner-requested desktop refinements

- Replace the two broken external logo references with the current `/brand/vinnys-wordmark.png`, rendered white on the dark concept header/footer.
- Play the existing `/api/sizzle` reel behind the hero, using its matching poster. Muted inline loop, no playback controls; pause offscreen/inactive and retain the poster for reduced motion or Save-Data. The existing Range API is reused; no new video file is introduced.
- Remove the hero location pill.
- Remove the top status strip’s green/pulsing indicator and use normal Manrope text rather than the monospaced badge styling.
- Keep the header usable on phones with the logo and a compact Order label; ensure the hero title clears the fixed header.

Remaining source layout, fonts, imagery, sample copy and prototype links are retained. This remains a static comparison design, not a CMS integration. No merge/deploy or D1 changes are included. External Tailwind/fonts/other remote image URLs remain dependencies of the supplied prototype.

## Verification

The initial source baseline passed independent byte-identity review. Follow-up browser checks cover loaded header/footer wordmarks, live advancing reel playback, poster-only reduced-motion behavior, removal of the badge/green dot, and header/title fit at mobile, annotated tablet width and desktop. Local checks do not establish actual-device acceptance or live deployment.

## Supplied mobile layout

The second uploaded ZIP and pasted source contain the same mobile HTML (SHA-1 `3c52b8331793c8a010ab89a9096f1e712b0d2981`). It is retained in `public/design-b/mobile.html`, with only the responsive loader added. The annotated desktop document remains unchanged apart from that same loader. The loader is deferred until viewport metadata is parsed, avoiding mobile redirect loops.

- Under 768 CSS pixels, the shared Design B preview opens `mobile.html`.
- At 768px and above, it uses the existing `index.html` desktop concept.
- Resizing across the boundary switches documents in either direction. Query/hash values are retained.
- The mobile source’s compact header, occasion-card rail, stacked menu/events, and bottom navigation are kept as supplied. This is still a static design comparison using the source’s sample copy and prototype links.

Verification compares both documents with their prior/source versions after removing the single loader tag. Chromium and WebKit checks cover phone widths, both sides of the breakpoint, the annotated 918px width and desktop, plus bidirectional resizing. No horizontal page overflow in the supplied phone layout. The desktop source’s narrow-tablet floating Story badge can extend 4px outside the page; it is retained under the desktop-preservation requirement. Accepted Design A and all data/backend paths remain unchanged.
