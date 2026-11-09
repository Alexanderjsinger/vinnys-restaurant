# Environment audit — GIL vs Vinny’s

Historical audit from 2026-11-09 (America/Toronto), kept for context. Since then the site was imported into `Alexanderjsinger/vinnys-restaurant` (this repository). No files were deleted, reset, or moved as part of the original audit.

## 1. Environment audit

### What was wrong

This Cursor Project is named Vinny’s Restaurant, but the Cloud Agent environment for this run is bound to **game-intel-lab** only:

- Workspace: `/workspace` → `https://github.com/Alexanderjsinger/game-intel-lab`
- Branch: `main` at `89b3472` (matches `origin/main`)
- Environment repos: `github.com/Alexanderjsinger/game-intel-lab`
- Environment id: `0c9e4060-d4a8-11f1-89ee-7aa6f0729b11` (personal, default image)

Vinny’s Phase 1 / Phase 2 plans and all site work lived in the **Project agent store** and on a **separate local clone**, not as commits inside GIL.

### Contamination classification

| Type | Finding |
| --- | --- |
| A. Plan on wrong Cursor Project | **Yes.** Plans under `/opt/cursor/artifacts/plans/` (`vinny_site_direction_…`, `phase_2_cms_unify_…`) appeared under this chat’s Plans UI while the cloud environment still points at GIL. |
| B. Uncommitted Vinny files in GIL | **No.** `git status` on `/workspace` is clean. |
| C. Committed Vinny files in GIL | **No.** No tracked paths matching vinny / toastisadog / bar-grill. HEAD is the GIL-45 merge commit. |
| D. Shared / inherited env config | **Partial, non-repo.** `/workspace/.cursor/mcp.json` adds Cloudflare MCP URL; that path is **gitignored** (`.gitignore` line 60: `.cursor/`). User-level `/home/ubuntu/.cursor/AGENTS.md` tells agents to prefer `cf` CLI. Cloudflare login and the live Worker `vinnys-bar-grill` are account-level, not GIL git history. |

### What was affected

- Cursor Project / Plans association (organizational).
- Agent store at `/cursor/stores/bc-9372d14d-41c8-4fa9-84cf-39adea69c698/` (Vinny site, docs, CMS, admin password file).
- Local clone `/home/ubuntu/vinnys-restaurant` (commit `993fcdd` **ahead 1** of `origin/main`; earlier push was denied for `cursor[bot]`).
- Cloudflare: Worker `vinnys-bar-grill`, D1 binding, optional secrets on that worker.
- Machine-local: ignored `.cursor/mcp.json`, home `AGENTS.md`, Cloudflare CLI login.

### What was unaffected

- GIL repository history, branches, CI workflows, agent role docs under `agents/`, research content.
- No Vinny application source inside `Alexanderjsinger/game-intel-lab`.
- No GIL secrets rewritten for Vinny in git.

## 2. Cleanup report

### Safe / already true

- GIL working tree clean; no Vinny import to reverse in git.
- Vinny source of truth for recent CMS work: store `…/site` (Phase 2 D1 CMS). Older clone at `/home/ubuntu/vinnys-restaurant` may lag the store.

### Remains (needs approval or UI)

1. **Create or bind a Cursor Cloud environment** whose only repo is `Alexanderjsinger/vinnys-restaurant` (or a dedicated Vinny environment). Do not keep Vinny agents defaulting to the GIL environment.
2. **Push** store Phase 2 source to `vinnys-restaurant` on a feature branch after GitHub write access for the Cursor app (or a personal token you control). Last known block: `Permission to Alexanderjsinger/vinnys-restaurant.git denied to cursor[bot]`.
3. **Recreate / attach Phase 1–5 plans** under a Cursor Project that is bound to that Vinny environment (UI: Project settings → environment/repo). Do not delete the current Phase 2 plan file until a verified copy exists in the Vinny Project.
4. Optional hygiene (approval first): remove `/workspace/.cursor/mcp.json` if you do not want Cloudflare MCP on GIL agents; it is untracked and ignored.

### Do not do without approval

- `git reset --hard`, `git clean -fd`, force push, deleting GIL branches.
- Deleting the agent store site or D1 data.
- Deploying or changing production DNS for `vinnysbargrill.com`.

## 3. Project configuration summary

| App | GitHub repo | This machine path | Cursor / Cloud env | Notes |
| --- | --- | --- | --- | --- |
| Game Intelligence Lab | `Alexanderjsinger/game-intel-lab` | `/workspace` `main` @ `89b3472` | Env `0c9e4060-…` repos = GIL only | Clean; preserve as-is |
| Vinny’s Bar & Grill | `Alexanderjsinger/vinnys-restaurant` | Store: `…/site`; Clone: `/home/ubuntu/vinnys-restaurant` ahead 1 (`993fcdd`) | **Not** the repo bound to this run’s environment | Live site: `https://vinnys-bar-grill.toastisadog.workers.dev` |

## 4. Validation results

| Check | Result |
| --- | --- |
| `git -C /workspace status` | Passed — clean |
| Vinny paths in GIL `ls-files` | Passed — none |
| `.cursor/mcp.json` tracked in GIL | Passed — ignored, not tracked |
| Environment `repos` | Passed (for GIL binding) — only game-intel-lab |
| Vinny remote push of Phase 2 store | Not tested this turn; historically failed with 403 |
| Fresh `npm install` / build in a Vinny-only env | Not tested this turn |
| Cursor UI “move plan to other Project” | Not tested — requires manual UI |

## 5. Phase 2 readiness

**Do not resume CMS development inside this GIL-bound environment.**

Phase 2 code already exists in the Project store and on the live Worker. Independent continuation requires:

1. A Cloud Agent environment whose repo is `vinnys-restaurant`.
2. Feature-branch import of the current store `site/` (exclude `.env.local`, sqlite with real leads, `node_modules`, build dirs).
3. Plans attached to that Project/environment.
4. Separate secrets (ADMIN_PASSWORD, Resend, R2) on the Vinny Worker only — already separate from GIL git.

### Manual UI steps (user)

1. Cursor Dashboard → Cloud Agents → Environments → create or select one with **only** `Alexanderjsinger/vinnys-restaurant`.
2. Grant the Cursor GitHub app **write** access to that repo.
3. Open or create Cursor Project “Vinny’s Bar & Grill” and set its environment to that Vinny environment (not GIL).
4. Copy or re-add Phase 2 plan text into that Project’s Plans; only then archive the misplaced GIL-associated plan if the UI still shows it under GIL.
5. Tell the agent to continue Phase 2 only after a new run boots with `repos` containing `vinnys-restaurant` and not `game-intel-lab`.
