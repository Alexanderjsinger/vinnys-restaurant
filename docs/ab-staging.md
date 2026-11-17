# Isolated A/B comparison

Operational history of the existing remote comparison Worker. This policy-only
PR includes this document as review context; it does not introduce the deployment
scripts, configuration or uncommitted A/B/C implementation described below.
Those code changes remain separate. Historical deployment evidence is not a
release validation of this policy candidate.

## Published comparison — 2026-11-16

### Version C added from latest desktop/mobile masters

Worker version `dffd5900-c770-42dd-924d-6b7f8f013de1` adds
`/design-c/index.html` and its responsive mobile master, preserving A/B.
Cloudflare's API confirms 100% allocation and the existing disposable D1 ID
`a9141893-52b5-4c87-8718-6e1782d40247`. CI: 72 passed / 2 skipped; build passed.
Nine local browser viewport checks, asset/font checks and reel behavior checks
passed. Public A/B/C checks remain blocked by outbound proxy CONNECT 403;
no full live visual PASS is claimed. No production/staging/DNS/live-data or
environment-settings changes. Exact source fingerprint and evidence:
`docs/design-c/README.md`.


### Supplied mobile secondary-page set integrated

Worker version `7edc9f6c-4a24-4711-af53-87e3103b358d` adds the four supplied
phone documents for menu/events/story/visit. Existing B URLs choose them below
768px and retain desktop designs at 768px and above. Browser checks passed at
360/390/430px, plus reciprocal breakpoint switching, query/anchor preservation,
all day filters, real Toast links, and mobile inquiry validation/failure/reset
and rotation retention. Desktop inquiry regression passed. CI: 72 passed,
2 skipped; build passed. Version A and live records are unchanged. Source
provenance and deliberate mock-behavior corrections are documented in
`docs/design-b/mobile-pages.md`.

### Version B contact page added

Worker version `e79ee033-9030-4bbc-8273-537eab832ee2` adds
`/design-b/contact.html` from the supplied Page 4 reference. B Visit/Hours links
now navigate here. The form is explicitly a comparison test: it reuses the
existing contact-message API and saves only to disposable storage, without
booking confirmation, marketing signup or restaurant email delivery. Browser
checks passed at 1280/768/390, including validation, retained failed entries,
honest success and no-JS call fallback. A local synthetic POST was persisted
and inspected in local SQLite only. CI: 72 passed, 2 skipped; build passed.
Version A's `/contact`, its API implementation, and live data are unchanged.
Details: `docs/design-b/contact-page.md`.

### Version B Our Story page added

Worker version `b0552058-bd73-4b50-ba89-c554ecb682a9` adds
`/design-b/about.html` from the supplied Page 3 reference. Broken image placeholders
are replaced with the existing wordmark and current owner-supplied storefront;
the supplied map graphic and fonts are served locally. Our Story links on B
home/menu/events navigate to this page. Version A's `/about`, its owner-approved
story source and all CMS records are unchanged. Browser checks passed at 1280,
768 and 390px; CI: 72 passed, 2 skipped; build passed. Details and source-copy
limitations are documented in `docs/design-b/about-page.md`.

### Version B events page added

Worker version `e1e53727-cabd-4fc3-896d-3249762cf25d` adds
`/design-b/events.html` from the supplied events ZIP. All seven original event
images, font assets and styling are served locally. Home/menu navigation links
to the new page; all seven filter states passed at desktop/tablet/phone widths.
CI: 72 passed, 2 skipped; build passed. The supplied schedule and offers are
static prototype content; no CMS event records were changed. Provenance and
implementation details are in `docs/design-b/events-page.md`.

### Version B menu added

Worker version `d04e1b5e-32f1-4768-be3c-defc5022f685` adds
`/design-b/menu.html`, based on the owner's supplied HTML/screenshot and design
reference. Both responsive B home variants link to it. The page's supplied
Tailwind theme and fonts are hosted locally; it does not require the runtime
CDN used by earlier prototypes. Local Chromium passed at 1280, 768 and 390px,
including fonts, wordmarks, all six category targets, round-trip homepage/menu
navigation, no overflow and no JavaScript/resource errors. CI: 72 passed,
2 skipped; build passed. Version A and CMS data are unchanged. Details and
source provenance: `docs/design-b/menu-page.md`. Public HTTP validation remains
subject to the workspace outbound-policy restriction described below.

### Version A text-only regression fixed

Follow-up Worker version: `95963919-21ea-4285-99b8-5d7fd800c287`.
The initial ab-mode `runWorkerFirst: ["/*"]` sent compiled Next CSS/JS through
the application Worker, which returned 404. Production-mode local preview
reproduced the missing assets. The comparison configuration now uses the
existing staging exclusions `!/_next/static/*` and `!/*/_next/static/*` so the
asset service handles compiled files directly. No design/content files changed.
All 11 referenced CSS/JS files returned 200 with correct MIME types after the
fix. Chromium at 1280px and 390px verified loaded images and primary fonts,
advancing muted reel playback, no horizontal overflow, and no JavaScript errors.
All 8 targeted deployment/isolation tests passed. The regression check can be
repeated with `node scripts/check-ab-preview.mjs <origin>` against a production
preview. The fix was deployed only to the comparison Worker. Public HTTP
verification remains blocked by workspace egress policy, as noted below.

Deployment succeeded through `npm run deploy:vinext -- --env ab`, with
`VINNYS_AB_SECRETS_FILE` selecting a private, ignored JSON file containing only
the newly generated comparison password. The guarded command builds Vite mode
`ab`, verifies the isolated artifact, then invokes the installed cf CLI's
supported `deploy --prebuilt --mode ab --secrets-file` flow. The standard
deployment path is unchanged when that variable is absent.

- Origin: `https://vinnys-ab-comparison.toastisadog.workers.dev`
- Worker version: `96efe0bf-2bdc-4897-bc14-05baeaf461d2` (100% traffic).
- Deployment ID: `d986fee3-68f2-4d0f-a4f0-0e8898d10119`.
- New disposable DB: `a9141893-52b5-4c87-8718-6e1782d40247`.
- Cloudflare API verified the enabled workers.dev route, comparison DB binding,
  `VINNYS_SNAPSHOT=1`, `VINNYS_AB_COMPARISON=1`, and `ADMIN_PASSWORD` as secret_text.
- The source is base commit `534717f9ed80a74dfb7ddc5d5250e925fdb163cf`
  plus the uncommitted isolation/deployment changes in this working tree.
- Token verification and D1 access both passed after the permission update.
- Full CI passed (72 passed, 2 skipped), and all 8 targeted deployment/isolation
  tests passed after adding first-deploy secrets-file support.
- Public HTTP verification is **BLOCKED** by this workspace's egress policy:
  CONNECT to the new comparison hostname receives HTTP 403. The Cloudflare
  deployment is confirmed; page responses, remote demo parity, and external
  asset visual acceptance are not yet verified. Allow the comparison hostname
  in workspace Internet access before retrying. No environment settings were
  changed or published by the agent.

The sections below retain the setup procedure and earlier validation history;
the publication facts above supersede earlier missing-token/not-deployed notes.

Base application: `534717f9ed80a74dfb7ddc5d5250e925fdb163cf` on
`codex/alternative-homepage`. The working changes add hosting isolation, not a
redesign. Both supplied Design B documents and their responsive loader remain
byte-identical, as do Version A's pages, components and assets.

## Targets

Cloudflare mode `ab` selects Worker `vinnys-ab-comparison`, entrypoint
`src/worker-ab.ts`, and the disposable D1 database named `vinnys-ab-comparison`.
The installed cf tooling supports provisioning/resolving a database by name;
no live database ID is supplied. Before publishing, verify a pre-existing database
with that name is comparison-only. Do not import live data. All other modes retain
the original Worker configuration and live database binding unchanged.

The intended URL, not yet deployed or verified, is
`https://vinnys-ab-comparison.toastisadog.workers.dev`:

- Version A: `/`
- Version B: `/design-b/index.html`, switching to `mobile.html` below 768px.

Snapshot reads use `VINNYS_SNAPSHOT=1`. Writes are **not** disabled by snapshot
mode: they must go only to the disposable DB. Its schema/seed initialization uses
the existing repository code. No live database exports or production credentials
are needed. R2 and Resend are deliberately unbound. A/B demo events require the
`VINNYS_AB_COMPARISON=1` binding and the exact comparison hostname; this does not
relax the existing staging-host gate. A comparison-only Worker wrapper adds
`X-Robots-Tag: noindex, nofollow` to SSR, static HTML and API responses without
modifying bodies or Range responses.

## Credential prerequisites (currently missing)

Provide `CLOUDFLARE_API_TOKEN` securely to this task's deployment process, never
in Git, command arguments, or chat. The token needs the intended account's
Workers Scripts Edit and D1 Edit permissions, plus account/subdomain read access
needed by cf to resolve the workers.dev target. Scope it to that account. The
existing deploy guard's message mentions an old Cursor environment; that is
historical guidance, not this Codex task's secret destination.

If the account cannot be discovered unambiguously, supply its non-secret account
ID and pin `accountId` only for mode `ab` before publishing. The environment must
allow the deployment client to reach `api.cloudflare.com`; its current custom
allowlist does not include that destination. Complete the corresponding secure
runtime/network setup without publishing environment settings on the user's behalf.

Use a fresh `ADMIN_PASSWORD` secret on **only** `vinnys-ab-comparison`, through
Cloudflare's secure secret-entry UI. Never copy an existing staging or production
secret. A fresh ignored `.env.ab.local` is prepared for local comparison work;
it is not proof that a Worker secret has been provisioned. Do not pass a password
with CLI `--text` or print its value. If cf requires the secret during initial
provisioning, use its secure prompt; abort unattended publishing rather than
substituting a shared password. No Resend or R2 credentials should be added.

## Verified deployment command

The installed `@vinext/cloudflare` CLI maps `--env ab` to Vite mode `ab` and
`cf deploy --prebuilt --mode ab`. Its typed-config path rejects `--name` and
`--config` overrides. Use the existing guarded repository command:

```bash
cd /workspace/vinnys-restaurant
npm ci
NODE_USE_ENV_PROXY=1 XDG_CONFIG_HOME=/workspace/.config XDG_CACHE_HOME=/workspace/.cache npm run ci
XDG_CONFIG_HOME=/workspace/.config XDG_CACHE_HOME=/workspace/.cache npm run deploy:vinext -- --env ab
```

The deploy wrapper checks the token before any publish. The approved command was
attempted and stopped at that guard because `CLOUDFLARE_API_TOKEN` is absent.
Nothing was deployed. Do not run the command without `--env ab`.

For a local mode build:

```bash
XDG_CONFIG_HOME=/workspace/.config XDG_CACHE_HOME=/workspace/.cache npm run build:vinext -- --mode ab
```

Inspect `.cloudflare/output/v0/workers/default/worker.config.json`: the Worker
and DB must both be `vinnys-ab-comparison`, with no live ID
`5bd8ee69-a229-4156-a6fa-166f55e3abcb`, R2 or Resend bindings. The normal CI build
targets the original mode, so rebuild `ab` afterward. Do not reuse the default
artifact with `--skip-build`. Cloudflare deployment rebuilds the selected mode.

## Validation evidence and remaining checks

- CI: 72 passed, 2 skipped, 0 failures; typecheck and standard Vinext build passed.
- Separate `ab` build passed. Generated Worker name/bindings and packaged Design B
  byte identity verified.
- Local Cloudflare Worker served A and both B documents with 200/noindex; B bodies
  were byte-identical. Sizzle returned 206 and the requested 32 bytes with noindex.
- Tests cover mode isolation, exact demo host gating, and header/body/status
  preservation for HTML and partial video responses.
- Earlier Chromium checks verified A desktop/mobile images, primary fonts, and
  advancing reel playback; B layout switching, desktop reel, and reduced-motion
  poster behavior passed. The supplied mobile document has no reel.
- B's external Tailwind/fonts/images remain blocked by Chromium's proxy CA trust.
  Full visual acceptance is **BLOCKED**, not PASS. Automatic approval review
  rejected persistent CA trust installation; it was not applied or bypassed.
- Exact-host production demo parity, remote database isolation, remote secret
  provisioning and remote URLs remain unverified until actual deployment. Local
  Vite requests do not establish the production hostname's behavior.

After credentials are supplied, continue under the existing deployment approval:
verify target availability and account identity, provision only disposable
resources, publish the approved working revision, record its exact source revision
and Worker version, and verify both URLs, noindex, data isolation, demo parity,
fonts/images and Range playback. Never describe the intended URLs as verified
before receiving successful responses. Persistent Workers hosting survives the
cloud session; local port previews do not.
