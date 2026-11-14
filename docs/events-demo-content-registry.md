# Events — demonstration content registry

**Purpose:** Track guest-visible content that is **not** owner-confirmed real-world programming.  
**Effective:** 2026-11-14 (Product Owner clarification after E6 BLOCKED session).  
**E6 / HOLD:** Unchanged — registry is tracking only; no D1 mutations authorized by this document.

---

## Registered demo events

| Title | Environment | Status | Purpose | Production launch |
| --- | --- | --- | --- | --- |
| **Limp Bizkit** | Staging (`vinnys-bar-grill.toastisadog.workers.dev`) | **Published** (guest-visible) | **Intentional demonstration** of Events page layout (title, date, time, price, body) | **Exclude** from production-launch readiness — not a real event |

**Fields observed on staging (read-only, 2026-11-14):**

- Date/time: 2027-02-08, 9:15 p.m. America/Detroit  
- Price: $35  
- Blurb: repetitive placeholder-style copy  
- Photo / next step: not set on guest render  

**Policy:**

1. **Keep** for visual/UI testing until Coordinator/Product Owner says otherwise.  
2. **Do not** delete, archive, edit, or republish **without explicit approval**.  
3. QA agents: **do not** use this row for E6 lifecycle tests — use `E6-QA*` disposables only ([`events-e6-owner-acceptance-runbook.md`](events-e6-owner-acceptance-runbook.md)).  
4. **Do not** archive or unpublish demo rows to force empty-state (E2) testing — see runbook §5.  

---

## Pre-launch gate (public website)

Before treating the site as production-ready for real guests:

- [ ] **No fictional or demonstration events** remain **published** on the production host (includes archiving or removing **Limp Bizkit** and any `E6-QA*` stragglers).  
- [ ] Only owner-confirmed events appear on public `/events` and the home Events card.  

Until then, demo content may remain on **staging** for presentation testing only.

---

## Project tracking

| Task | Note |
| --- | --- |
| **MMAV-6** | E6 acceptance — demo **Limp Bizkit** excluded from launch-readiness criteria; owner browser runbook: [`events-e6-owner-acceptance-runbook.md`](events-e6-owner-acceptance-runbook.md) |

**Related:** [`events-cms-backlog.md`](events-cms-backlog.md) (HOLD / E6 backlog).