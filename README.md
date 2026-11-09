# Vinny's Bar & Grill

Restaurant site for Vinny's Bar & Grill in Ypsilanti (repo: `Alexanderjsinger/vinnys-restaurant`). Intended to replace the GoDaddy one-pager at vinnysbargrill.com once DNS is pointed at a host running this app.

**This project does not change DNS for vinnysbargrill.com.**

Phase 2 / 2.5 docs live under [`docs/`](docs/) (`phase-2-status.md`, `phase-2-5-audit.md`, `owner-setup.md`, `d1-backup-recovery.md`).

## Run

Requirements: Node.js 22 or newer, and build tools for `better-sqlite3` (`python3`, `make`, `g++`, and SQLite headers).

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

`.env.example` contains `ADMIN_PASSWORD=local-dev-only-change-me` for local development only. Change that password before the site is reachable by anyone else. Do not commit `.env.local` or deploy the example password.

Production-style local run (Next):

```bash
npm run build
npm start
```

Cloudflare / Vite production build (documented Phase 2 path):

```bash
npm run build:vinext
```

Checks used in CI:

```bash
npm run typecheck
npm test
npm run ci
```

Optional Vite local preview:

```bash
npm run dev:vinext
```

Set `ADMIN_PASSWORD` in the server environment. Set `COOKIE_SECURE=true` only when the site is served over HTTPS. Leave it false for `http://localhost`, or the sign-in cookie will not stick.

The admin session lasts 12 hours.

## Edit content

Sign in at `/admin`.

| Screen | What it changes |
| --- | --- |
| Place | Name, address, phone, email, hours, homepage copy |
| Menu | Categories and items (draft / publish) |
| Events | Title, start, optional end, price, status |
| Inquiries | Private-party notes from the public form |
| Media | Photo upload (requires R2 when enabled) |

Saves go into `data/site.sqlite` for local Next/SQLite. On Cloudflare Workers, D1 is the live store. Party inquiries live in the same database — treat it as private.

The party form stores name, email, date, party size, and message. Email notify is optional and needs Resend secrets when enabled.

## Toast ordering URL

Admin → Place / ordering settings. Public Order buttons use the CMS Toast URL. An empty URL hides Order; `/order` tells the guest to call.

## DNS

Running, building, or editing this site does not change DNS for vinnysbargrill.com.
