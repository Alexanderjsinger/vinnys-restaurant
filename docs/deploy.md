# Deploy

The only publish path for the `vinnys-bar-grill` Worker is `npm run deploy:vinext` after `npm run ci`, from an approved git SHA. Product Owner approval is required before any publish. This path does not change DNS and does not mutate D1.

```bash
git checkout <approved-sha>
npm ci
npm run ci
npm run deploy:vinext
```

`npm run ci` runs typecheck, `npm test`, and `npm run build:vinext`. `npm run deploy:vinext` runs `scripts/deploy-vinext.mjs`, which exits before any network publish if `CLOUDFLARE_API_TOKEN` is unset or blank, then runs `vinext-cloudflare deploy`. That command publishes with `cloudflare.config.ts` (`cf deploy --prebuilt`) so the Worker bindings stay in place.

Do not publish with `npx wrangler deploy`.

## Cloud agent token

Cloud agents need `CLOUDFLARE_API_TOKEN` as a Cloud Agent runtime secret on environment `7e682a92` (https://cursor.com/dashboard/cloud-agents/environments/e/7e682a92-dc57-11f1-8120-06b44be262b7), injected at agent start. A published-app secret does not deploy the Worker. The script reads the variable from the environment and does not print it. Do not commit the token or pass it on the command line.

A shell outside Cursor can export the same variable for an approved publish. There is no fallback to `wrangler login` or to a Cursor published-app secret.

## Workers Builds

Workers Builds stays disconnected. The Git repository connection was disconnected on purpose: an automatic Workers Builds publish shipped a bad OpenNext bundle via `npx wrangler deploy`, omitted the D1 binding, and took staging down. GitHub Actions only builds (`npm run build:vinext` in `.github/workflows/ci.yml`). It does not deploy. Do not reconnect Workers Builds auto-deploy.

## D1 binding

D1 id `5bd8ee69-a229-4156-a6fa-166f55e3abcb` must remain the `DB` binding via `cloudflare.config.ts` (database name `vinnys-bar-grill`). Do not drop that binding, and do not point a preview worker at this database when you need isolated test data. A routine publish does not edit D1 rows.

## After each publish

Record the new Worker version after each publish, with the approved git SHA. Use the version id from the deploy output or the Cloudflare dashboard, and write it into the Project store baseline. The active staging version after the 2026-11-14 rollback, until a newer approved Vinext publish replaces it, is `eb0100c6-130d-47de-b8fa-137f837635d6`.

Staging URL: https://vinnys-bar-grill.toastisadog.workers.dev/
