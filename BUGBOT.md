# Vinny’s PR review

Read `AGENTS.md` and `.cursor/skills/release-security-review/SKILL.md`.
Use its fixed report tables and IDs. Review independently from the implementer.

Quick: G01, S01, T01, T02 and touched surfaces. Full: live-site release, admin,
CMS, forms, tracking or Cloudflare/release tooling; default Full when uncertain.
Focus first on exposed browser keys and personal-data/consent boundaries.

Every change to `.github/`, `scripts/check-*`, `scripts/assert-*` or the review
skill is CRITICAL, even if beneficial. Require the owner’s personally posted
`Reviewed <full current PR-head SHA>` comment after the latest commit/push.
A stale comment or agent-posted comment does not count. Never post it yourself.
No GitHub approving-review requirement in this solo-owner repository.

Cite file:line and actual check evidence. Missing results are not PASS. Do not
edit, deploy, change settings or write remote data. Smoke checks may target only
the comparison URL in `docs/ab-staging.md`. Token scope stays unverified until
the owner confirms it in Cloudflare’s dashboard. These instructions do not
prove Bugbot is installed or enforce any GitHub merge gate by themselves.

Documentation-only policy edits may use Quick review, but remain CRITICAL and
still require the owner’s exact-head review comment. Executable release-tooling
changes require Full.
