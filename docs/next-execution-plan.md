# Next execution plan

Prioritized checklist after Phase 2.5 + admin CSRF on `main` (`b7bf813` verified 2026-11-11). Split by who can finish the item. Full owner how-to: [`owner-setup.md`](owner-setup.md). Status narrative: [`project-context.md`](project-context.md). Phase 2.5 history: [`phase-2-5-handoff.md`](phase-2-5-handoff.md). CSRF closure: [`security-closure-csrf.md`](security-closure-csrf.md).

**Standing constraints:** no DNS, no live D1 mutation, no deploy/merge without Product Owner approval via Coordinator.

## Status snapshot (do not collapse)

| Layer | State |
| --- | --- |
| Completed eng | Phase 2.5 + CSRF on `main` `b7bf813` (PRs #2, #7, #8, #9) |
| Verified staging | CSRF matrix **PASS**; Worker `22ba677c-9192-40da-8dfe-6666d0a5b039`; headers live |
| Outstanding product | Events/CMS **HOLD** |
| Unresolved defects | Photo placeholder, `next_step` admin gap, empty-state UX, related CMS clarity |
| Owner deps | R2, Resend, business info confirmation |
| Prod requirements | Separate PO approval; HOLD cleared; facts + infra evidence |

## Priority order

| # | Workstream | Completable by | Depends on |
| --- | --- | --- | --- |
| 0 | Admin CSRF staging verify | — | **DONE** — staging-verified PASS (`b7bf813`) |
| 1 | Events / CMS product backlog | Eng/UX after Coord consolidate | HOLD remains; security gate closed |
| 2 | R2 media | Owner enable → Eng bind/deploy/smoke | Cloudflare R2 account enablement |
| 3 | Resend inquiry email | Owner secrets → Eng verify + Retry | Verified sender + Worker secrets |
| 4 | Business info approval | Owner (Eng assists in CMS only if asked) | Owner decisions on facts |
| 5 | Independent QA / perf | QA (+ UX); Eng fixes defects | Current staging baseline; R2/Resend still BLOCKED until configured |
| 6 | Phase 3 UX | Coord scopes → Eng/UX | Prefer #1–#4 unblocked or explicitly deferred |
| 7 | Production / DNS | Owner only | Explicit prod requirements — not staging CSRF alone |

---

## 0. Admin CSRF (closed)

**Goal:** Close the authenticated missing-header / CSRF gap on staging.

- [x] Eng: PR #9 merge `b7bf813`
- [x] Owner-authorized staging deploy
- [x] Independent QA STG-01…09 **PASS**
- [ ] ~~Treat as Events/CMS clearance~~ — **no**; HOLD unchanged

Record: [`security-closure-csrf.md`](security-closure-csrf.md).

---

## 1. Events / CMS product (HOLD)

**Goal:** Clear product HOLD only after Coordinator consolidates specialist findings and Eng/UX land agreed fixes — **not** because CSRF passed.

### Owner-approval / Coordinator

- [ ] Coordinator consolidates Eng/UX/QA Events reports into the backlog section below
- [ ] Scope eng PR(s); keep CSRF/security regressions out of “done” confusion
- [ ] Owner approval before any deploy of product fixes

### Eng / UX (after consolidate)

- [ ] Empty-state copy + recovery CTAs; avoid home→empty Events dead-end
- [ ] Event photo placeholder vs `cleanEventPhoto` / `/media/1`
- [ ] Admin `next_step` field aligned with public render
- [ ] Draft/publish / dual-status clarity as scoped
- [ ] UX review + QA re-verify before merge recommendation

### PLACEHOLDER — Events assessment backlog (pending coordinator consolidate)

> **Coordinator will send a follow-up to fill this section after Eng/QA/UX reports land**, or amend this PR via a second commit when asked.
>
> Until then, do **not** invent backlog items beyond the known HOLD themes already listed above.
> Specialist reports currently live in the Project store (not yet folded into this repo checklist):
>
> - `/cursor/stores/bc-9372d14d-41c8-4fa9-84cf-39adea69c698/docs/events-assessment-engineering.md`
> - `/cursor/stores/bc-9372d14d-41c8-4fa9-84cf-39adea69c698/docs/events-assessment-qa.md`
> - `/cursor/stores/bc-9372d14d-41c8-4fa9-84cf-39adea69c698/docs/events-assessment-ux.md`
> - `/cursor/stores/bc-9372d14d-41c8-4fa9-84cf-39adea69c698/docs/events-assessment-coordinated-summary.md`
>
> **Fill-in checklist (leave blank for Coordinator):**
>
> - [ ] Prioritized defect list (P0/P1/P2) with owners
> - [ ] Acceptance criteria per item (QA vocabulary)
> - [ ] Suggested PR slice order
> - [ ] Explicit non-goals / still-HOLD items

---

## 2. R2 media

**Goal:** Admin photo upload works end-to-end.

### Owner-approval / owner action

- [ ] Enable R2 in Cloudflare Dashboard (API 10042 until enabled; billing awareness)
- [ ] Create private bucket (e.g. `vinnys-bar-grill-media`) and tell Eng the name
- [ ] Approve redeploy with `MEDIA` binding

### Eng-completable (after enablement)

- [ ] Add `MEDIA` R2 binding in `cloudflare.config.ts`
- [ ] Deploy; smoke upload (≤4 MB image + alt) and `/media/<id>` use on Homepage or Events
- [ ] Update docs if binding name or runbook differs from owner-setup

---

## 3. Resend

**Goal:** Party notes email the owner; Retry drains queue from email-off period.

### Owner-approval / owner action

- [ ] Resend account + verified From domain/address
- [ ] Set Worker secrets `RESEND_API_KEY` and `RESEND_FROM` (never in git/chat)
- [ ] Set final place/notify email in Admin → Place
- [ ] Approve redeploy if secrets/config require it

### Eng-completable (after secrets)

- [ ] Confirm notify path against a **approved** test inquiry (avoid spam)
- [ ] Exercise Admin → Party inquiries → Retry failed notifications
- [ ] Document PASS/FAIL with evidence for QA

---

## 4. Business info approval

**Goal:** Public facts are owner-true before domain cutover discussion.

### Owner-approval (primary)

- [ ] Confirm name, address, phone
- [ ] Confirm weekly hours (currently unconfirmed) and any holiday hours
- [ ] Confirm Toast ordering URL; reservations = call-only unless changed
- [ ] Confirm notify / place email
- [ ] Policy on photos (keep stock vs replace when R2 on)
- [ ] Keep birthday list closed until offer + DOB + opt-out exist

### Eng-completable

- [ ] Apply owner-provided edits in CMS only when assigned
- [ ] No invented copy or hours

---

## 5. Independent QA / perf

**Goal:** Fresh acceptance matrix and lab CWV; not eng self-certification.

### Eng-completable

- [ ] Provide SHA, changed surfaces, how to test, staging URL
- [ ] Fix FAIL items from QA or escalate BLOCKED

### QA / UX (read-only reviewers)

- [x] CSRF staging matrix PASS (see security closure) — does **not** replace full Phase 2.5 refresh
- [ ] Refresh [`phase-2-5-qa.md`](phase-2-5-qa.md)-style matrix on current staging as needed
- [ ] Mark R2/Resend paths BLOCKED until configured; do not invent PASS
- [ ] Lab CWV / LCP note for Phase 3 backlog (prior lab: LCP ~4.2s mobile)
- [ ] Live CMS writes stay NOT TESTED unless Coordinator/owner authorizes

---

## 6. Phase 3 UX

**Goal:** Visual/brand/LCP/CMS-usability improvements in scoped PRs.

### Owner-approval / Coordinator

- [ ] Prioritize Phase 3 themes (hero/LCP, brand hierarchy, mobile, CMS clarity)
- [ ] Approve any content/imagery changes that alter public facts

### Eng / UX

- [ ] Scoped feature branches; UX review before merge recommendation
- [ ] No DNS; no drive-by infra in UX PRs

---

## 7. Production requirements (gate)

Not started. Staging CSRF PASS is **necessary but not sufficient**.

- [ ] Explicit Product Owner approval for production Worker + DNS
- [ ] Owner-confirmed business facts live
- [ ] R2/Resend PASS or written deferral
- [ ] Events/CMS HOLD cleared by Coordinator
- [ ] Independent QA on intended production SHA
- [ ] No secrets in git; rollback plan understood

---

## Explicitly out of band (until owner says otherwise)

- DNS cutover for vinnysbargrill.com
- Merge/deploy without Coordinator-relayed owner approval
- Live D1 mutation / inquiry spam for testing
- Creating a Coordinator custom subagent in `.cursor/agents/`
- Treating CSRF staging PASS as Events/CMS or production clearance
