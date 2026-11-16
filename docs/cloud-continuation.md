# Vinny’s Codex Cloud continuation

The owner wants this project accessible across devices without relying on their Mac. This document preserves the working context; it is not a migration of the complete local chat history.

## Current work

- Repository: `Alexanderjsinger/vinnys-restaurant`.
- Active branch: `codex/alternative-homepage`.
- Draft comparison PR: https://github.com/Alexanderjsinger/vinnys-restaurant/pull/55.
- Last implementation SHA before this handoff: `0da49a7c26e83a0a6b88bd0c4257db658539a186`.
- Accepted main at handoff: `16ee814a1c188515a8a25ae8ba34977b51b409b4` (PR #54). Refresh refs before relying on this snapshot.
- Staging: https://vinnys-bar-grill.toastisadog.workers.dev/.

First cloud task: verify repository access, check out the existing active branch, read project guidance, prepare dependencies and report readiness. No new feature, merge, or deployment is requested by the migration.

## Design comparison

Design A is the accepted application at `/`. Design B is a separate static prototype:

- `public/design-b/index.html`: supplied desktop design with the owner's approved refinements.
- `public/design-b/mobile.html`: second supplied phone design.
- `public/design-b/responsive-preview.js`: mobile below 768px, desktop from 768px, reciprocal switching on resize.
- `docs/design-b/README.md`: provenance, modifications and prototype limitations.
- `docs/design-b/source-design.md`: uploaded reference material, not overriding project instructions.

Desktop refinements to preserve: current wordmark in header/footer; the existing `/api/sizzle` reel/poster behind the hero; removed hero location pill; quieter Manrope top strip without a green status indicator; compact phone header fallback. The mobile design is retained as supplied, including compact header, occasion-card rail, stacked sections and bottom navigation. Do not substitute or redesign it without the owner's request. Source sample copy and prototype links remain intentional. Design B has not been selected as accepted main or integrated with the CMS.

## Main-site decisions

Read `docs/typography.md`: Montserrat headings, Jakarta body/controls, open Events/Contact layouts, plain dates and phone links, no duplicate reservation CTA. Mobile reel is 15% taller and the Story exterior uses a supporting 2:1 crop. Footer links use compact responsive columns/rows.

Contact forms store explicit-consent email signups and general messages in existing tables; authenticated `/admin/inquiries` exposes them. Campaigns are not connected. Missing Resend credentials leave owner notifications queued without losing messages. See `docs/contact-forms.md`.

Staging event mockups are in-memory fixtures requiring an enabled runtime flag and the exact staging hostname. Other hosts read published events. No demo rows were inserted in D1; the registered Limp Bizkit record remains intact. See `docs/demo-events-preview.md`. E6 HOLD remains unchanged.

## Guidance and limits

Read relevant repo docs and `.cursor/skills/vinny-creative-direction/SKILL.md` / `vinny-cms-workflow/SKILL.md`. Cursor remains the primary development environment; do not create another coordinator or additional development infrastructure.

No merge, deploy, DNS, live D1 writes or secret changes without owner approval. Keep Workers Builds disconnected. Only approved publish path: `npm run ci && npm run deploy:vinext`, from an approved SHA. Preserve DB binding `5bd8ee69-a229-4156-a6fa-166f55e3abcb`. No Cloudflare deployment token was available locally; one is not required just to work in Codex Cloud.

Untracked local `.codex/agents/`, personal skills/plugins, ignored files, attachments and secrets do not automatically transfer through GitHub. Preserve the local originals; use tracked project guidance in the cloud.

## Cloud setup

Use Node >=22 and `npm ci` with the lockfile on Linux. The local Mac required `--force` due to the explicit Linux SWC dependency; do not assume that workaround is needed in Linux.

For preview use runtime/ignored local values `VINNYS_SNAPSHOT=1` and `VINNYS_DEMO_EVENTS=1`; never commit secrets. Start with `npm run dev -- --port 3105` and open `/design-b/index.html`. The old Mac's localhost links do not transfer. Report a cloud preview URL only if the environment actually exposes one.

`npm run ci` runs typecheck, tests and Vinext build; last result was 68 PASS, 2 SKIP. Chromium/WebKit covered phone/desktop routing and bidirectional resizing; source fidelity was independently checked. Actual-device acceptance remains unverified. Desktop source has a pre-existing 4px Story badge overhang at narrow tablet widths, preserved under the desktop-fidelity requirement.

The local task could not verify automatic cloud-chat creation. If repository/environment access is missing, report the exact setup needed rather than claiming readiness.
