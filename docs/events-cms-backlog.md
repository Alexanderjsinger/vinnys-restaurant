# Events/CMS — coordinated backlog & next cycle

**Source:** Coordinator consolidate 2026-11-11 (Vinny only)  
**Checkpoint:** CSRF staging-verified on `main` merge `b7bf813` (Worker `22ba677c-9192-40da-8dfe-6666d0a5b039`); docs sync PR #10 also on `main`  
**CSRF:** staging-verified PASS — see [`security-closure-csrf.md`](security-closure-csrf.md)  
**Events/CMS product:** **HOLD** — not production-ready

Full specialist write-ups (Eng / QA / UX assessments dated 2026-11-11) live in **Project Context** `docs/` (`events-cms-*-2026-11-11.md`), not in this repo. This file is the durable, repo-facing summary without secrets.

## Specialist verdicts (reference)

| Role | Verdict | Where |
| --- | --- | --- |
| Full-Stack | HOLD (product) | Project Context: `docs/events-cms-eng-assessment-2026-11-11.md` |
| QA | HOLD (product); security D1/D2 corrected | Project Context: `docs/events-cms-qa-assessment-2026-11-11.md` |
| UX | NEEDS CHANGES (RB1–RB4) | Project Context: `docs/events-cms-ux-assessment-2026-11-11.md` |
| Coordinator | Consolidated backlog | Project Context: `docs/events-cms-coordinated-backlog-2026-11-11.md` (canonical); this file = repo copy |

## Security closure (reference)

| Item | Status |
| --- | --- |
| PR #8 / #9 / #10 | Merged on `main` |
| CSRF + headers on staging | Verified PASS — [`security-closure-csrf.md`](security-closure-csrf.md) |
| Rollback | Not required |
| Events HOLD | **Remains** — CSRF PASS does not clear product HOLD |

## Prioritized backlog

### P0 — Critical blockers

None open for **security** on staging after CSRF. Product HOLD is driven by **P1** below (guest trust + owner CMS correctness), not a new authz hole.

### P1 — Required to release Events/CMS HOLD

| ID | Problem | Evidence | Solution | Owner | Dependencies | Acceptance | Tests | Deliverable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E1 | Guest empty copy says “Placeholder.” | UX RB1; QA D5; live `/events` | Guest-facing empty string; reserve “placeholder” for admin | Full-Stack + UX review | None | No “Placeholder.” on public `/events` or home Events card | QA public empty matrix | Focused PR |
| E2 | Empty `/events` dead end | UX RB2 | Recovery CTA group (Parties/Contact/Call/Order as appropriate) | Full-Stack + UX | E1 ideally same PR | At least one recovery path on empty Events | UX spot-check mobile/desktop | Same or stacked PR |
| E3 | Photo `/media/1` vs `cleanEventPhoto` | Eng F4; QA D4; UX RB3 | Align placeholder, docs, validator; clear error copy until R2 | Full-Stack | R2 optional later | Saving with invalid path fails with photo-specific message; docs match | Unit + admin form QA | Focused PR |
| E4 | Dual Status + Draft/Publish; Archived unreachable | Eng F5; UX RB4 | Single status model (buttons OR select, not conflicting) | Full-Stack + UX | None | Archived reachable intentionally; draft/publish unambiguous | CMS mutation tests (disposable) | Focused PR |
| E5 | `next_step` public render / mutate `""` | Eng F6; QA D3; UX O3 | Admin field **or** stop rendering until supported | Full-Stack | Product choice | Either editable end-to-end or removed from public | QA ADM-10 | Focused PR |
| E6 | CMS publish/update/past matrix incomplete | QA NOT TESTED ADM-06–09 | Intentional disposable CMS acceptance after E1–E5 | QA | Eng PRs | HOLD-release criteria B–D in QA doc met | Documented matrix PASS | QA report |

### P2 — Improvements

| ID | Item | Owner |
| --- | --- | --- |
| I1 | Eastern Time wording; home CTA when empty (UX O1–O2) | Full-Stack + UX |
| I2 | Photo-specific errors; 44px nav; end-next-day hint (O4–O6) | Full-Stack + UX |
| I3 | Events product automated tests beyond CSRF | Full-Stack + QA |
| I4 | Soft-archive semantics vs hard delete messaging (O8) | Full-Stack |

### Owner dependencies (unchanged)

| ID | Item |
| --- | --- |
| O-R2 | Cloudflare R2 enable + MEDIA bind |
| O-Resend | Resend secrets + verified sender |
| O-Biz | Hours / notify email confirmation |

## Exact HOLD release (from QA)

- Security section A: **met** on staging (see [`security-closure-csrf.md`](security-closure-csrf.md)).
- Product B–D (guest copy, photo/`next_step`/archive UX, intentional CMS matrix): **not met**.

## Next 1–3 engineering tasks (recommendation)

1. **PR-A — Guest empty-state + recovery CTAs** (E1+E2) — highest guest trust impact; small surface.
2. **PR-B — Events CMS status model + photo path/docs/errors** (E4+E3) — owner safety.
3. **PR-C — `next_step` decision + field or removal** (E5) — then QA E6 matrix to lift HOLD.

Do **not** start implementation until Product Owner approves this sequence/scope.

## Workflow reminder

Coordinator defines AC → Eng branch → PR → independent QA → fix → Coordinator package → PO merge/deploy auth → staging verify before any prod recommendation.

Standing constraints: no DNS; no live D1 mutation without approval; no deploy/merge without Product Owner approval via Coordinator.
