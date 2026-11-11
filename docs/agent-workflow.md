# Agent workflow

Permanent AI development loop for this repository. Config lives in git so every agent starts from the same rules.

## Roles

| Spec | Path | Cursor subagent notes |
| --- | --- | --- |
| Full-Stack Engineer | [`.cursor/agents/full-stack-engineer.md`](../.cursor/agents/full-stack-engineer.md) | Writable implementer (`readonly: false`) |
| UX/Design Reviewer | [`.cursor/agents/ux-design-reviewer.md`](../.cursor/agents/ux-design-reviewer.md) | `readonly: true` — review/recommend only |
| QA Reviewer | [`.cursor/agents/qa-reviewer.md`](../.cursor/agents/qa-reviewer.md) | `readonly: true` — verify with evidence only |

**Project Coordinator** is **not** a `.cursor/agents/` file. Roadmap, architecture decisions, and Product Owner consolidation stay in the Cursor Project. Do not add a duplicate Coordinator subagent.

Shared facts and pointers: [`project-context.md`](project-context.md). Next checklist: [`next-execution-plan.md`](next-execution-plan.md).

## Custom subagent frontmatter

Each file under `.cursor/agents/` starts with Cursor YAML frontmatter (`name`, `description`, `model`, `readonly`) per [Cursor subagents docs](https://cursor.com/docs/subagents). Preserve the instruction body when editing frontmatter.

- **`description`** steers automatic delegation — keep it specific about when to use (and not use) the role.
- **`readonly: true`** on UX and QA restricts file edits and state-changing shell commands.
- Prefer `/full-stack-engineer`, `/ux-design-reviewer`, `/qa-reviewer`, or Task-tool delegation by those names.

## Coordinator owns

- Roadmap and current phase priorities
- Architecture decisions
- Assignments to Engineer / UX / QA
- Consolidation of reviews for the Product Owner
- Relaying Product Owner approval for merge, deploy, and DNS

## Default loop

1. **Coordinator** assigns a scoped task (branch naming, constraints, “no deploy” when applicable).
2. **Full-Stack Engineer** implements on a feature branch, opens a PR to `main`, writes a short handoff.
3. **UX/Design Reviewer** and **QA Reviewer** review independently (recommend only; cite evidence; QA uses PASS/FAIL/BLOCKED/NOT TESTED).
4. **Coordinator** consolidates findings, asks for remediations if needed, then presents a clear recommendation to the Product Owner.
5. **Product Owner** alone authorizes merge and any deploy/DNS/secrets work.

Parallel UX + QA is preferred after Engineer handoff. Neither reviewer may authorize ship.

## How to use `.cursor/agents/` in this repo

- When spawning or briefing a Cursor agent for Vinny work, **attach, @-mention, or `/`-invoke** the matching file under `.cursor/agents/`.
- Keep assignments config/docs-only or app-scoped as stated; do not mix GIL or other projects into the same run.
- Prefer extending these specs over creating one-off conflicting instructions. Update the markdown in a PR when the permanent workflow changes.
- Agents should re-read [`project-context.md`](project-context.md) for staging URL, blockers, and Phase doc pointers instead of pasting long audits into every prompt.

## Standing constraints

- Repo only: `Alexanderjsinger/vinnys-restaurant`
- Never invent restaurant facts; never commit secrets
- Known owner blockers: R2 and Resend — see [`phase-2-status.md`](phase-2-status.md) and [`owner-setup.md`](owner-setup.md)
- Staging: https://vinnys-bar-grill.toastisadog.workers.dev/
- Do not rewrite Phase 2.5 audits when updating workflow docs; link them
- No merge, deploy, or DNS without Product Owner approval relayed by Coordinator
