# Project context — Vinny’s Bar & Grill

Repo: `Alexanderjsinger/vinnys-restaurant`  
Public brand: Vinny’s Bar & Grill (Ypsilanti). Intended eventual host for vinnysbargrill.com — **DNS is not changed by this project until the owner approves.**

## Who decides what

| Role | Owns |
| --- | --- |
| **Product Owner** | Merge, deploy, DNS, secrets, restaurant facts, R2/Resend enablement |
| **Coordinator** | Roadmap, architecture decisions, assignments, consolidating UX + QA for the owner |
| **Full-Stack Engineer** | Implementation in this repo |
| **UX/Design Reviewer** | Independent UX recommendations (no ship authority) |
| **QA Reviewer** | Independent verification with PASS/FAIL/BLOCKED/NOT TESTED (no ship authority) |

Agent role specs: [`.cursor/agents/`](../.cursor/agents/). Workflow: [`agent-workflow.md`](agent-workflow.md).

## Roadmap pointer (do not duplicate full audits)

| Phase | Where to read |
| --- | --- |
| Phase 2 shipped status, staging, seed facts | [`phase-2-status.md`](phase-2-status.md) |
| Phase 2.5 reliability/security audit | [`phase-2-5-audit.md`](phase-2-5-audit.md) |
| Phase 2.5 QA matrix | [`phase-2-5-qa.md`](phase-2-5-qa.md) |
| Phase 2.5 handoff / next steps | [`phase-2-5-handoff.md`](phase-2-5-handoff.md) |
| Owner R2 / Resend / content checklist | [`owner-setup.md`](owner-setup.md) |
| CMS / D1 choice background | [`cms-architecture.md`](cms-architecture.md) |
| Isolation expectations | [`isolation-audit.md`](isolation-audit.md) |

## Staging and blockers

- **Staging worker:** https://vinnys-bar-grill.toastisadog.workers.dev/
- **D1:** live business data on the bound database — treat as production-like; do not mutate without approval.
- **Blocked (owner):** Cloudflare R2 (photo upload); Resend (`RESEND_API_KEY` / `RESEND_FROM`). Details in Phase 2 status and owner-setup.
- **Admin:** `/admin/login` with Worker secret `ADMIN_PASSWORD` — never commit passwords.

## Isolation

This workspace and Cursor environment must stay Vinny-only. If Game Intelligence Lab or another repo appears, stop and escalate to the Coordinator.
