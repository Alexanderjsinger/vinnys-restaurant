---
name: vinny-creative-direction
description: >-
  Research, design, and evaluate genuine restaurant art direction for Vinny’s
  Bar & Grill — typography, imagery, responsive layouts, Events surfaces, and
  video hero concepts. Requires visual evidence and deliberate creative decisions,
  not generic templates. Use when planning or reviewing Phase 3 UX, homepage hero,
  menu/events presentation, mobile first-viewport, or brand hierarchy changes.
---

# Vinny’s creative direction

Applies only to **Alexanderjsinger/vinnys-restaurant**. Do not use for other brands or repos.

This skill is **project-specific creative direction**. It does not replace implementation (`full-stack-engineer`) or formal acceptance (`qa-reviewer`). For structured UX review output with read-only constraints, also brief **`.cursor/agents/ux-design-reviewer.md`** (`/ux-design-reviewer`).

For deep, hypothesis-driven **bugs** (layout broken, video OOM, playback failures), use Cursor’s **`debug`** subagent — do not fold debugging SOP into this skill.

## When to use

- Homepage: hero poster, sizzle reel framing, intro hierarchy, CTA rows, lunch plates, storefront band
- Events: list/card empty states, photo treatment, recovery CTAs (see product HOLD in `docs/events-cms-backlog.md`)
- Typography and wordmark: `Vinny’s` vs straight apostrophe, H1/H2 scale, gold utility row vs duplicate CTAs
- Responsive: 390×844, 1280×800, 1920×1080 — no horizontal overflow, touch targets (44px nav is a known gap)
- Video hero: ambient reel behavior, poster honesty caption, `prefers-reduced-motion`, Save-Data, Range `/api/sizzle`
- Evaluating whether a change reads as a **real Ypsilanti bar & grill** versus a stock template

## When not to use

- D1 writes, admin intents, CSRF, or deploy paths → **`vinny-cms-workflow`**
- Security review or CSRF matrices → `docs/admin-csrf.md`, `docs/security-closure-csrf.md`, **`qa-reviewer`**
- Inventing hours, prices, menu items, or event copy not in CMS/docs
- Merge, deploy, DNS, or R2/Resend enablement

## Read first (repo)

| Topic | Path |
| --- | --- |
| Roles, staging, HOLD | `docs/project-context.md` |
| Agent loop | `docs/agent-workflow.md` |
| Homepage layout CI bar | `docs/homepage-visual-qa.md` |
| Events product gaps | `docs/events-cms-backlog.md` |
| UX reviewer mandate | `.cursor/agents/ux-design-reviewer.md` |

## Ground truth in code (cite paths; avoid guessing)

| Surface | Primary references |
| --- | --- |
| Brand / wordmark | `src/lib/brand.ts`, `src/components/SiteHeader.tsx` |
| Hero video + poster | `src/lib/hero.ts`, `src/components/HeroMedia.tsx`, `public/hero/` |
| Global type/color | `src/app/globals.css`, `src/app/layout.tsx` |
| Homepage composition | `src/app/page.tsx`, lunch photos `src/lib/lunch-photos.ts` |
| Events public | `src/app/events/page.tsx`, `src/components/ConfirmedEvents.tsx`, `src/lib/events-public.ts` |
| Event photos | `src/components/EventPhoto.tsx` |

**Sizzle reel constraints (do not “improve” without evidence):** ~720p encoded asset, ~30s duration, `GET /api/sizzle` for Range 206; large 1080p masters previously OOM’d the Worker (`src/lib/hero.ts` comments). Poster honesty: stock still ≠ dining room (`HeroMedia.tsx`).

## Workflow

### 1. Anchor the assignment

- Read Coordinator scope: which pages, viewports, and success criteria.
- Confirm staging: https://vinnys-bar-grill.toastisadog.workers.dev/ (read-only unless assigned).
- Note **Events/CMS HOLD** — creative work may ship in PRs but does not clear HOLD without product AC in `docs/events-cms-backlog.md`.

### 2. Gather visual evidence (required)

Before recommending or designing:

1. Capture **current** state: screenshots at assigned viewports, or cite existing Project store media paths.
2. If changing hero/video: note poster vs reel, caption placement, and mobile playback (Safari/iOS often needs Range).
3. Run or reference automated guardrails when layout/hero touches code:

   ```bash
   npm test
   ```

   (`tests/homepage-layout.test.mjs` — see `docs/homepage-visual-qa.md`.)

4. For manual smoke, follow the table in `docs/homepage-visual-qa.md` and record date, viewport, PASS/FAIL in the PR.

Do **not** approve visuals from code inspection alone.

### 3. Art-direction decisions (document deliberately)

For each proposed change, write a short decision record:

| Decision | Options considered | Choice | Rationale (guest + owner) | Risk |
| --- | --- | --- | --- | --- |
| Example: hero height | full-bleed vs aspect-ratio box | … | … | LCP, overflow |

Requirements:

- **Hierarchy:** one primary story in first viewport (brand → lede → hero); no twin gold CTA rows under H1.
- **Imagery:** `object-fit: cover` on food/venue frames; no letterboxed “void” plates (regression called out in homepage visual QA).
- **Honesty:** stock or atmosphere-only assets labeled clearly; never imply a photo is Vinny’s dining room when it is not.
- **Events:** guest copy must not show admin placeholders (E1); empty lists need recovery paths (E2) when in scope.
- **Motion:** respect `prefers-reduced-motion` and Save-Data; hero stays usable as still poster.

Prefer evolving existing tokens in `globals.css` over importing unrelated design systems.

### 4. Collaborate with repo roles

| Need | Delegate |
| --- | --- |
| CSS/component implementation | `/full-stack-engineer` or Engineer assignment |
| Independent UX severity + evidence | `/ux-design-reviewer` |
| PASS/FAIL matrices after functional touches | `/qa-reviewer` |
| Walkthrough screenshots/video for PR | `walkthrough-artifacts` skill (global), save under `/opt/cursor/artifacts/` |

Coordinator consolidates UX + QA for the Product Owner. **No merge/deploy** from this skill.

### 5. Deliverables

- Design notes or PR description section: decisions table, evidence links, viewports tested.
- If Engineer implements: list files touched and which automated tests must stay green.
- Explicit UX stance: **recommend / do not recommend** from a creative perspective — not ship authority.

## Constraints

- **Vinny isolation:** repo `Alexanderjsinger/vinnys-restaurant` only.
- **Facts:** never invent menu, hours, events, or address; use CMS staging or docs.
- **Secrets:** never commit; no staging writes without `vinny-cms-workflow` approval path.
- **Templates:** reject “default restaurant theme” swaps unless tied to Vinny brand evidence (EMU-adjacent bar & grill, lunch 11–3, Ypsilanti).
- **LCP / Worker memory:** treat hero video byte size and concurrent `GET /` as production risks; justify encodes with measured file size.

## Invocation (for agents and humans)

Cursor loads skills from **`.cursor/skills/<name>/SKILL.md`** in this repository.

| Method | Example |
| --- | --- |
| Skill name in prompt | “Follow the **vinny-creative-direction** skill.” |
| @ file | `@.cursor/skills/vinny-creative-direction/SKILL.md` |
| Agent instructions | “Read `.cursor/skills/vinny-creative-direction/SKILL.md` before Phase 3 homepage work.” |
| Pair with subagent | UX output via `/ux-design-reviewer`; build via `/full-stack-engineer` |

Discovery check: path must exist, YAML `name` matches folder intent, `description` explains when the agent should read the file (Cursor uses `description` for skill matching).