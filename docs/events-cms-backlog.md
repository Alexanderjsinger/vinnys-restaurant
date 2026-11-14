# Events/CMS — coordinated backlog & next cycle

**Source:** Coordinator consolidate 2026-11-11 (Vinny only)  
**Checkpoint:** GitHub `main` `731eedc`; **verified staging content baseline** `2b77538` (PR #28, fingerprints 2026-11-14). Events eng **PR #12–#14** (E1–E5) merged; **E6** QA still open. CSRF closure on earlier `b7bf813` — [`security-closure-csrf.md`](security-closure-csrf.md).
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
| E1 | Guest empty copy says “Placeholder.” | UX RB1; QA D5 | Guest-facing empty string | Full-Stack + UX | — | No “Placeholder.” on public `/events` or home Events card | QA public empty matrix | **Merged PR #12** |
| E2 | Empty `/events` dead end | UX RB2 | Recovery CTA group (Contact/Call/Order) | Full-Stack + UX | E1 | Recovery paths on empty Events | UX spot-check | **Merged PR #12** |
| E3 | Photo `/media/1` vs `cleanEventPhoto` | Eng F4; QA D4 | Validator + photo-specific errors | Full-Stack | R2 optional later | Invalid path → `error=photo` | Unit + admin form QA | **Merged PR #13** |
| E4 | Dual Status + Draft/Publish; Archived unreachable | Eng F5; UX RB4 | Button-only status model | Full-Stack + UX | — | Archived reachable; lifecycle unambiguous | CMS mutation tests | **Merged PR #13** |
| E5 | `next_step` public render / mutate `""` | Eng F6; QA D3 | Editable admin field + public link | Full-Stack | — | Phone/https end-to-end | QA ADM-10 | **Merged PR #14** |
| E6 | CMS publish/update/past matrix incomplete | QA NOT TESTED ADM-06–09 | Disposable CMS acceptance on staging | QA | E1–E5 on `main` | HOLD-release B–D met | Documented matrix PASS | QA report (open) |

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
- Product B–C (guest copy, photo/status/`next_step` eng): **met on `main`** (#12–#14); live QA still required for HOLD clear.
- Product D (CMS matrix E6): **not met** until independent QA PASS.

## Next tasks (recommendation)

1. **Independent QA — E6 matrix** (ADM-06–10) on staging with PO-approved disposable CMS session — plan: Project store `internal/events-e6-acceptance-plan.md`.
2. Coordinator HOLD-clear package after QA evidence.
3. Owner deps unchanged (**O-R2**, **O-Resend**, **O-Biz**) — parallel track, not a substitute for E6.

## Workflow reminder

Coordinator defines AC → Eng branch → PR → independent QA → fix → Coordinator package → PO merge/deploy auth → staging verify before any prod recommendation.

Standing constraints: no DNS; no live D1 mutation without approval; no deploy/merge without Product Owner approval via Coordinator.
