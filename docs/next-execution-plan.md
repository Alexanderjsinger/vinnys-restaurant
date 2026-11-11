# Next execution plan

Prioritized checklist after Phase 2.5 code on `main` (`057f651` verified 2026-11-11). Split by who can finish the item. Full owner how-to: [`owner-setup.md`](owner-setup.md). Status narrative: [`project-context.md`](project-context.md). Phase 2.5 history: [`phase-2-5-handoff.md`](phase-2-5-handoff.md).

**Standing constraints:** no DNS, no live D1 mutation, no deploy/merge without Product Owner approval via Coordinator.

## Priority order

| # | Workstream | Completable by | Depends on |
| --- | --- | --- | --- |
| 1 | GitHub → Cloudflare staging sync | Eng **after** owner deploy approval | Owner: authorize Workers deploy of `main` |
| 2 | R2 media | Owner enable → Eng bind/deploy/smoke | Cloudflare R2 account enablement |
| 3 | Resend inquiry email | Owner secrets → Eng verify + Retry | Verified sender + Worker secrets |
| 4 | Business info approval | Owner (Eng assists in CMS only if asked) | Owner decisions on facts |
| 5 | Independent QA / perf | QA (+ UX); Eng fixes defects | Prefer post-deploy staging (#1) |
| 6 | Phase 3 UX | Coord scopes → Eng/UX | Prefer #1–#4 unblocked or explicitly deferred |

---

## 1. GitHub → Cloudflare staging sync

**Goal:** Staging Workers matches approved GitHub `main` (security headers, hero parity, Phase 2.5 behavior).

### Owner-approval required

- [ ] Explicit approval to run authorized `npm run deploy:vinext` (or equivalent) for a named SHA
- [ ] Confirm Cloudflare account / Worker `vinnys-bar-grill` access for the deployer

### Eng-completable (after approval)

- [ ] Deploy named `main` SHA to staging
- [ ] Record deployed version / evidence (`curl -sI` for security headers; smoke home, menu, admin login page)
- [ ] Note any remaining staging drift in handoff

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

- [ ] Refresh [`phase-2-5-qa.md`](phase-2-5-qa.md)-style matrix on post-deploy staging
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

## Explicitly out of band (until owner says otherwise)

- DNS cutover for vinnysbargrill.com
- Merge/deploy without Coordinator-relayed owner approval
- Live D1 mutation / inquiry spam for testing
- Creating a Coordinator custom subagent in `.cursor/agents/`
