# D1 backup and recovery

## Authoritative database

| Environment | Binding | Database name | Database id |
| --- | --- | --- | --- |
| Staging worker `vinnys-bar-grill` | `DB` | `vinnys-bar-grill` | `5bd8ee69-a229-4156-a6fa-166f55e3abcb` |

There is currently **no separate production D1**. Treat this database as live business data (menu, events, hours, inquiries).

Local `npm run dev` uses SQLite at `data/site.sqlite` (gitignored). It is not the staging database.

## Isolation rules

- Do not run destructive migration or recovery tests against the live D1 id above.
- Workers preview that binds the same D1 can read/write real inquiries — avoid casual previews.
- Seed is one-shot (`meta.content_seed`) with `ON CONFLICT DO NOTHING` and does not wipe inquiries.

## Backup strategy (Cloudflare D1)

Prefer Cloudflare’s built-in D1 export / Time Travel features over a custom backup service.

### Manual export (recommended before risky deploys)

Using the Cloudflare dashboard or Wrangler (requires owner Cloudflare auth):

```bash
# Example — run only with owner credentials against a documented database id
npx wrangler d1 export vinnys-bar-grill --remote --output=./backups/vinnys-$(date -u +%Y%m%dT%H%M%SZ).sql
```

Store exports outside git. Encrypt if they contain party inquiry PII.

### Cadence

- Before any schema-changing deploy
- Before domain cutover
- After a large content migration
- Weekly while the restaurant is live (owner or automation)

## Recovery procedure (isolated first)

1. Create a **temporary** D1 database for practice.
2. Import the SQL export into the temporary DB.
3. Point a non-public preview worker at the temporary DB (not the live id).
4. Verify menu, events, and a sample inquiry row.
5. Only then, with owner approval, restore into the live database (or swap bindings carefully).

**Never** practice restore by overwriting live D1 without a fresh export taken immediately beforehand.

## Application-level rollback (public site)

Set `VINNYS_SNAPSHOT=1` on the worker and redeploy. Public reads come from `src/lib/public-snapshot.json`. Writes (including inquiries) still go to D1. Do **not** delete inquiry rows as a rollback step.

## Migration safety

- Schema changes use `CREATE TABLE IF NOT EXISTS` and additive `ALTER TABLE ... ADD COLUMN` with duplicate-column ignore.
- Failed writes should not rewrite published rows outside the targeted UPDATE.
- Draft rows stay off public lists via status filters.

## Verification checklist after restore

- [ ] Published menu prices match expected
- [ ] Draft items absent from `/menu`
- [ ] Events visibility correct
- [ ] Inquiry count ≥ pre-incident export
- [ ] Admin login still works
