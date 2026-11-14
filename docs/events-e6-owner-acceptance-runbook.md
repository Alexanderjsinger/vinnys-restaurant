# Events E6 — owner-operated acceptance runbook

**Purpose:** Complete ADM-06–10 on staging **from your browser**, with recovery in place first.  
**Staging:** https://vinnys-bar-grill.toastisadog.workers.dev/  
**Database:** D1 `vinnys-bar-grill` — id `5bd8ee69-a229-4156-a6fa-166f55e3abcb` (shared business data: menu, hours, events, inquiries).  
**Status:** E6 product **HOLD** unchanged until you record PASS with evidence. This runbook does not authorize agent/automated writes.

**Demo content:** See [`events-demo-content-registry.md`](events-demo-content-registry.md) — **Limp Bizkit** stays for visual testing; do not delete or edit without approval.

---

## 1. Recovery point (Cloudflare — your account)

Time Travel is **always on** for production D1; you do not enable it. There is no separate “create restore point” button — you **capture a bookmark** you can restore to later.

### A. Confirm the database

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **D1**.
2. Open database **`vinnys-bar-grill`**.
3. Confirm the **database ID** matches `5bd8ee69-a229-4156-a6fa-166f55e3abcb` (see repo `cloudflare.config.ts` if needed).

### B. Verify Time Travel works (Wrangler with your login/token)

From your machine (Wrangler 3.4+):

```bash
cd vinnys-restaurant   # or any directory with npx
npx wrangler login     # if not already authenticated
npx wrangler d1 info vinnys-bar-grill
npx wrangler d1 time-travel info vinnys-bar-grill
```

**Expect:** `version: production` on `info`, and a **current bookmark** string from `time-travel info`.  
**Optional JSON:** add `--json` to either command for a log you can paste into QA notes.

**Record before any CMS QA:**

| Field | Your value |
| --- | --- |
| UTC timestamp when you started | e.g. `2026-11-14T18:00:00Z` |
| Bookmark from `time-travel info` | copy full string |
| Optional SQL export | `npx wrangler d1 export vinnys-bar-grill --remote --output=./backups/vinnys-pre-e6-YYYYMMDD.sql` |

Official reference: [Cloudflare D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/).

### C. If something goes wrong

- **Undo a restore:** `time-travel restore` returns a **previous_bookmark** — restore to that bookmark to roll back the restore itself.
- **Destructive:** `time-travel restore` **overwrites the whole database** — use only after stopping traffic or accepting brief inconsistency; prefer fixing disposable rows in admin when possible.
- **App-level read-only rollback (guest only):** Worker `VINNYS_SNAPSHOT=1` — does **not** undo D1 event rows; see [`d1-backup-recovery.md`](d1-backup-recovery.md).

**Do not run `time-travel restore` as part of routine E6 testing** unless admin cleanup fails and you accept full DB rollback.

---

## 2. Browser steps — ADM-06 through ADM-10

**Sign in:** https://vinnys-bar-grill.toastisadog.workers.dev/admin/login (Worker secret `ADMIN_PASSWORD`).

**Navigation:** After login → **Events** (`/admin/events`). Use **Preview site** link for draft/preview checks.

### ADM-06 — Login + draft (E6-1, E6-7)

1. Confirm you see Events list and **New event** form (Save draft / Publish buttons — **no Status dropdown**).
2. Fill **only** the disposable upcoming row (§3 table).
3. Click **Save draft**.
4. **Expect:** Green/saved banner for draft; event shows **draft** badge in admin.
5. Open **Preview site** → disposable title **visible**.
6. Open guest `/events` in a private window → disposable title **not** listed (Limp Bizkit may still show).
7. Optional E6-2: edit same row, set Photo URL to `/media/1`, **Save draft** → **Expect:** error banner about photo (not generic URL).

### ADM-07 — Publish + public (E6-3)

1. Set Photo URL to a direct `https://…` image URL (not `/media/…`, not Google Drive view link).
2. Click **Publish**.
3. **Expect:** Published badge; guest `/events` and home **Events** section show the disposable title, date, price, Detroit time.

### ADM-08 — Archive (E6-4)

1. Click **Archive** on the disposable row.
2. **Expect:** Archived badge; guest `/events` and **Preview** no longer show it; still visible in admin with **Restore draft**.

### ADM-09 — Update, past, delete (E6-5, E6-6, E6-9)

On the **same** disposable row (or a second copy if you prefer):

1. **Restore draft** → **Save draft** → confirm still off public.
2. **Publish** again → change **Title** or **Description** → **Publish** → confirm guest shows edits.
3. Create second row **`E6-QA PAST DISPOSABLE`** with date **2020-01-01**, **Publish** → guest `/events` shows it under **Earlier**, not **Upcoming**.
4. **Delete:** check **Delete this event**, submit → **Expect:** banner says **deleted** (not archive); row gone from admin.

Repeat delete for any remaining `E6-QA*` rows.

### ADM-10 — `next_step` (E6-8)

On a disposable row while **published** (before delete):

1. **Next step** = `https://example.com/e6-tickets` → **Publish** → guest event shows clickable link.
2. Change to `(734) 905-7051` → **Publish** → guest shows `tel:` link.
3. Clear field → **Publish** → no next-step link.
4. Invalid value (e.g. `Call us`) → **Expect:** `nextstep` error, no save.

---

## 3. Test records, expectations, cleanup

| Title | Purpose | Key fields | After test |
| --- | --- | --- | --- |
| `E6-QA DISPOSABLE — DO NOT PROMOTE` | Upcoming lifecycle | Date `2099-06-15`, times `19:00`–`22:00`, blurb notes QA | **Hard delete** |
| `E6-QA PAST DISPOSABLE` | Past / Earlier | Date `2020-01-01`, publish | **Hard delete** |

**Cleanup checklist (required):**

1. Admin Events: **no** rows whose title starts with `E6-QA`.
2. Guest `/events`: only intended content (demo **Limp Bizkit** OK until launch policy).
3. Save a screenshot or short note per ADM step for MMAV-6 / HOLD evidence.

**Do not touch:** **Limp Bizkit** (demo registry) — no edit, archive, or delete without explicit approval.

---

## 4. Do **not** run on the shared database

| Avoid | Why |
| --- | --- |
| Editing/deleting **Limp Bizkit** or any non-`E6-QA` event | Business/demo content policy |
| Menu price publish, hours, homepage, ordering URL tests | Out of E6 scope; risks guest-facing business data |
| **Inquiry** form submits on staging | Writes real `inquiries` rows / email queue noise |
| **Photos** media upload | R2 not enabled — BLOCKED |
| Bulk **delete inquiries** | Forbidden for QA rollback |
| **`time-travel restore`** during happy-path E6 | Full-database overwrite — emergency only |
| Creating extra published events you plan to “leave up” | Clutters launch readiness |

E6 only needs **disposable `E6-QA*` rows** plus read-only observation of existing demo content.

---

## 5. Isolated QA database — when needed

**Default (recommended):** Run E6 on the **existing** staging D1 using **only** `E6-QA*` rows, bookmark + optional SQL export first. One shared DB is how Vinny’s staging is designed today.

**Consider a separate D1 only if:**

- You refuse any write risk to menu/hours/inquiries on the live id, or  
- You need parallel testers without coordination.

**That path is extra infra (not required for E6):** create a **new** D1 database, import schema/seed, deploy a **private preview worker** bound to that DB — see [`d1-backup-recovery.md`](d1-backup-recovery.md) “isolated first” pattern. Cost: setup time + divergent data; **not** needed for a single owner browser pass with disposable events.

---

## 6. Recording results (clear HOLD)

After you finish, capture:

| Criterion | What proves it |
| --- | --- |
| **B** | Guest empty/recovery if you test empty state (optional); E1 copy already on staging |
| **C** | Photo error, `next_step`, archive UX — your admin banners + guest pages |
| **D** | ADM-06–10 all PASS with screenshots |

File evidence in Project Context `media/` or attach to MMAV-6. Coordinator updates HOLD only when **B–D** are PASS with evidence.

**E6 HOLD remains until that package exists.** This runbook does not clear HOLD by itself.