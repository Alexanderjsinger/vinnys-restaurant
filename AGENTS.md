# Vinny’s agent instructions

Repository: `Alexanderjsinger/vinnys-restaurant` only. Preserve existing work.
Read `docs/agent-workflow.md` and `docs/build-release-checklist.md`. For a review,
use `.cursor/skills/release-security-review/SKILL.md` and its fixed report format.

- Quick review: G01 guardrails, S01 exposed secrets, T01 tests/build, T02 scans,
  plus affected surfaces. Full review for live releases or admin/CMS/forms/
  tracking/Cloudflare/release-tooling changes; default to Full if uncertain.
- Changes to `.github/`, `scripts/check-*`, `scripts/assert-*` or the release
  review skill are CRITICAL and require the owner’s personal PR comment
  `Reviewed <full current head SHA>` after the latest commit/push. Recheck after
  new commits. Agents must never post that comment on the owner’s behalf.
- This is a solo-owner repo: require status checks and conversation resolution,
  not GitHub approving reviews. Do not enable approval rules that prevent the
  owner from merging their own PR. Policy ownership is not self-approval.
- Never print/commit credentials or client data. No production/staging/DNS/live
  data writes, environment publishing or deployment without explicit owner scope.
- Remote review smoke checks target only the comparison URL in
  `docs/ab-staging.md`. Record failed/blocked/unrun checks honestly; an agent’s
  “done” is not evidence. Cloudflare token scope requires owner dashboard review.
