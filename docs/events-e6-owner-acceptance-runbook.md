# Events E6 — owner-operated acceptance runbook

**Purpose:** Complete ADM-06–10 on staging **from your browser**, with recovery in place first.  
**Staging:** https://vinnys-bar-grill.toastisadog.workers.dev/  
**Database:** D1 `vinnys-bar-grill` — id `5bd8ee69-a229-4156-a6fa-166f55e3abcb` (shared business data: menu, hours, events, inquiries).  
**Engineering reference:** GitHub `main` through `160446e` (homepage shows **at most three** upcoming events — `src/app/page.tsx` `.slice(0, 3)`).  
**Status:** E6 product **HOLD** unchanged until you record PASS with evidence. This runbook does not authorize agent/automated writes.

**Demo content:** [`events-demo-content-registry.md`](events-demo-content-registry.md) — **Limp Bizkit** stays for visual testing; **do not** edit, archive, or delete to force an empty state.

---

## Evidence log (use for every step)

For **each** step below, record:

| Column | What to write |
| --- | --- |
| **Expected** | From this runbook |
| **Actual** | What you saw (banner text, URL, visible titles) |
| **Result** | PASS / FAIL / BLOCKED / NOT TESTED |
| **Evidence** | Screenshot path, private-window URL, or short quote from admin banner |

Save screenshots under Project Context `media/` (not in this git repository).

---

## 1. Confirm staging and database identity

1. Staging URL loads: https://vinnys-bar-grill.toastisadog.workers.dev/
2. Cloudflare Dashboard → **Workers & Pages** → **D1** → **`vinnys-bar-grill`**
3. Database ID = **`5bd8ee69-a229-4156-a6fa-166f55e3abcb`** (`cloudflare.config.ts`)

There is **no separate production D1** — this id is live business data (menu, hours, inquiries, events).

---

## 2. Establish recovery safeguards

Time Travel is **always on**; capture a bookmark before CMS writes.

```bash
npx wrangler login    # if needed
npx wrangler d1 info vinnys-bar-grill
npx wrangler d1 time-travel info vinnys-bar-grill
```

**Record:** UTC start time, bookmark string, optional SQL export:

```bash
npx wrangler d1 export vinnys-bar-grill --remote \
  --output=../vinnys-backups-outside-repo/vinnys-pre-e6-YYYYMMDD.sql
```

**Backup storage rules (required):**

- Save exports **outside** the `vinnys-restaurant` git tree (e.g. `~/vinnys-backups/`, encrypted disk, password manager notes for bookmarks only).
- **Never** commit SQL exports, D1 dumps, or inquiry PII into git.
- Do **not** run `time-travel restore` during routine E6 — full-database overwrite; emergency only.

Reference: [Cloudflare D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/), [`d1-backup-recovery.md`](d1-backup-recovery.md).

---

## 3. Disposable test records (fixtures)

### Upcoming lifecycle row

| Field | Value |
| --- | --- |
| **Title** | `E6-QA DISPOSABLE — DO NOT PROMOTE` |
| **Date** | `2099-06-15` |
| **Start** | `19:00` |
| **End** | `22:00` (optional) |
| **Description** | `Disposable fixture for MMAV-6 E6 acceptance. Safe to delete after QA.` |
| **Price** | blank or `$0` |
| **Photo (valid)** | Direct `https://…` image URL when publishing |
| **Photo (invalid test)** | `/media/1` — see step 6 |

### Past / Earlier row (all required fields)

| Field | Value |
| --- | --- |
| **Title** | `E6-QA PAST DISPOSABLE` |
| **Date** | `2020-01-01` |
| **Start** | `19:00` |
| **End** | `22:00` (optional) |
| **Description** | `Past fixture for Earlier section. Disposable — delete after QA.` |
| **Price** | blank |

**Do not touch:** **Limp Bizkit** or any non-`E6-QA` row.

---

## 4. E6 acceptance sequence (ordered)

**Sign in:** `/admin/login` → **Events** (`/admin/events`). Use **Preview site** for draft/preview checks.

| Step | Action | Expected | Maps to |
| --- | --- | --- | --- |
| **1** | Confirm staging + D1 id (§1) | ID matches; login form loads | Pre-flight |
| **2** | Record bookmark / optional export (§2) | Bookmark captured; export path **outside repo** | Pre-flight |
| **3** | Create **upcoming** disposable as **Save draft** | Draft badge; banner for draft save | ADM-06, E6-1 |
| **4** | **Preview site** shows title; guest `/events` (private window) **does not** | Draft on preview only | E6-1 |
| **5** | Admin UI: **Save draft / Publish / Archive** buttons only — **no Status `<select>`** | Buttons only | E6-7 |
| **6** | **Photo validation (mandatory, criterion C):** On the **draft** row, set Photo URL `/media/1`, **Save draft** | `?error=photo` (or photo-specific banner); **not** generic URL error; title/date/blurb **unchanged** from last good save; row still **draft** | E6-2, ADM-06 |
| **7** | Set valid `https://…` photo; **Publish** | Published badge | ADM-07 |
| **8** | Guest `/events`: full disposable fields visible (title, Detroit time, price, body, photo if set) | PASS on `/events` | E6-3, ADM-07 |
| **9** | Guest `/` **Events** block: disposable **may** appear if among the **earliest three upcoming** published events by sort order; if **four+** upcoming exist, a valid disposable **not** on home is **not** a failure | Home shows **≤ 3** upcoming (`main` `160446e`); full list on `/events` | E6-3 note |
| **10** | **Archive** disposable | Off guest `/events` and preview; archived in admin | ADM-08, E6-4 |
| **11** | **Restore draft** → **Save draft** | Still off public | E6-5 |
| **12** | **Publish** again; change **Title** or **Description** → **Publish** | Guest shows edits on `/events` | ADM-09 |
| **13** | **ADM-10 (before any delete):** On **published** disposable — (a) `https://example.com/e6-tickets` (b) `(734) 905-7051` (c) blank (d) invalid `Call us` → **nextstep** error, no save | Guest links match a–c; (d) rejected | ADM-10, E6-8 |
| **14** | Create **`E6-QA PAST DISPOSABLE`** with §3 fields; **Publish** | Under **Earlier** on `/events`, **not** **Upcoming** | E6-9, ADM-09 |
| **15** | **Delete** every `E6-QA*` row (confirm checkbox); **last step** | **Deleted** banner; rows gone from admin and guest | E6-6, cleanup |
| **16** | **Cleanup confirm:** guest `/events` — no `E6-QA` titles; **Limp Bizkit** unchanged | Demo still present if it was before | Cleanup |
| **17** | Logout | Session cleared | ADM-06 |

**Order rule:** Complete **step 13 (ADM-10)** before **step 15 (delete)**. All disposable **deletes last**.

---

## 5. Criterion B — empty-state recovery

| Topic | Status in this runbook |
| --- | --- |
| E1 guest copy (“Only confirmed events are listed.”, no “Placeholder.”) | Verify read-only on staging if desired — prior agent PASS |
| E2 empty `/events` recovery CTAs (Contact / Call / Order) | **NOT TESTED** unless you have **independent evidence** (e.g. disposable-only upcoming with none published, **without** archiving demo **Limp Bizkit**) |

Do **not** archive or unpublish **Limp Bizkit** to force empty state for E2.

---

## 6. Do **not** run on the shared database

| Avoid | Why |
| --- | --- |
| **Limp Bizkit** or any non-`E6-QA` event edits | Demo / business policy |
| Forcing empty Events via demo changes | E2 NOT TESTED policy |
| Menu, hours, homepage, ordering CMS | Out of E6 scope |
| Inquiry submits | Writes inquiries |
| R2 media upload | BLOCKED |
| Inquiry deletes | Forbidden rollback practice |
| `time-travel restore` in happy path | Full DB overwrite |
| Committing `.sql` backups to git | Security / policy |

---

## 7. Isolated QA database (only if necessary)

**Default:** Shared staging D1 + `E6-QA*` only + bookmark/export first.

**Separate D1 + preview worker** only if you refuse any write risk to the live id — see [`d1-backup-recovery.md`](d1-backup-recovery.md). Not required for one owner browser pass.

---

## 8. Clearing HOLD (after you finish)

| Criterion | Evidence needed |
| --- | --- |
| **A** Security | Prior staging CSRF PASS; re-smoke only if regressions suspected |
| **B** Guest copy / recovery | E1 evidence; E2 **NOT TESTED** unless independently proven (§5) |
| **C** Photo / `next_step` / archive UX | **Step 6 mandatory** + step 13 + archive path (steps 10–12) |
| **D** Full matrix | Steps 3–16 **PASS** with evidence log |

Attach evidence to **MMAV-6**. Coordinator lifts HOLD only when **B–D** are satisfied with evidence.

**This runbook does not clear HOLD by itself.**

---

## 9. Independent QA review (qa-reviewer)

**Reviewed:** Revised runbook vs `main` `160446e` and Codex findings (2026-11-14).  
**Reviewer stance:** Read-only; recommends only.

| Check | Verdict | Note |
| --- | --- | --- |
| Sequence matches E6-1–10 / ADM-06–10 | **PASS** | ADM-10 before delete; cleanup last |
| Photo path mandatory for C | **PASS** | Step 6 + unchanged row |
| Home ≤3 upcoming | **PASS** | Step 9 documents non-failure |
| Past fixture complete fields | **PASS** | §3 table |
| Backups outside git | **PASS** | §2 explicit |
| E2 empty-state | **PASS** | NOT TESTED unless independent evidence; no Limp Bizkit toggle |
| Demo content policy | **PASS** | Cross-links registry |

**Recommendation:** **HOLD** remains until owner completes steps 1–16 with PASS evidence. Runbook is **approved for owner execution** (not a ship authorization).

### Remaining risks

| Risk | Mitigation |
| --- | --- |
| Shared D1 — accidental edit to menu/inquiries | Stay on Events admin only; disposable titles |
| No live backup taken before session | Owner must run bookmark + export (§2) |
| Home vs `/events` confusion | Step 9 — judge publish on `/events` |
| E2 still open | Accept NOT TESTED or separate approved empty-state plan without demo changes |
| R2 photo upload | Still BLOCKED — https URL only |
| Restore overwrites DB | Avoid `time-travel restore` unless emergency |