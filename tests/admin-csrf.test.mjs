import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");

async function loadCsrf() {
  return import(`${pathToFileURL(path.join(root, "src/lib/csrf.ts")).href}?t=${Date.now()}`);
}

async function loadFormat() {
  return import(`${pathToFileURL(path.join(root, "src/lib/format.ts")).href}?t=${Date.now()}`);
}

test("sameOriginPost rejects missing Origin/Referer/Sec-Fetch-Site", async () => {
  const { sameOriginPost } = await loadFormat();
  const bare = new Request("https://vinnys.example/api/admin/save", { method: "POST" });
  assert.equal(sameOriginPost(bare), false);

  const withOrigin = new Request("https://vinnys.example/api/admin/save", {
    method: "POST",
    headers: { origin: "https://vinnys.example" },
  });
  assert.equal(sameOriginPost(withOrigin), true);

  const crossOrigin = new Request("https://vinnys.example/api/admin/save", {
    method: "POST",
    headers: { origin: "https://evil.example" },
  });
  assert.equal(sameOriginPost(crossOrigin), false);

  const sameSite = new Request("https://vinnys.example/api/admin/save", {
    method: "POST",
    headers: { "sec-fetch-site": "same-origin" },
  });
  assert.equal(sameOriginPost(sameSite), true);

  const crossSite = new Request("https://vinnys.example/api/admin/save", {
    method: "POST",
    headers: { "sec-fetch-site": "cross-site" },
  });
  assert.equal(sameOriginPost(crossSite), false);
});

test("csrfTokenForSession is stable, session-bound, and rejects mismatches", async () => {
  const { csrfTokenForSession, verifyCsrfToken, CSRF_FIELD } = await loadCsrf();
  assert.equal(CSRF_FIELD, "csrf");

  const session = "1700000000000.abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";
  const password = "test-admin-password";
  const token = csrfTokenForSession(session, password);
  assert.equal(token.length, 64);
  assert.equal(csrfTokenForSession(session, password), token);
  assert.notEqual(csrfTokenForSession(`${session}x`, password), token);
  assert.notEqual(csrfTokenForSession(session, `${password}x`), token);

  assert.equal(verifyCsrfToken(session, password, token), true);
  assert.equal(verifyCsrfToken(session, password, ""), false);
  assert.equal(verifyCsrfToken(session, password, "deadbeef"), false);
  assert.equal(verifyCsrfToken(session, password, token.slice(0, -1) + "0"), false);
});

test("admin mutation routes require CSRF verification in source", () => {
  const save = fs.readFileSync(path.join(root, "src/app/api/admin/save/route.ts"), "utf8");
  const media = fs.readFileSync(path.join(root, "src/app/api/admin/media/route.ts"), "utf8");
  const logout = fs.readFileSync(path.join(root, "src/app/api/admin/logout/route.ts"), "utf8");
  for (const source of [save, media, logout]) {
    assert.match(source, /sameOriginPost/);
    assert.match(source, /verifyCsrfForm/);
    assert.match(source, /isAdmin/);
  }
});

test("admin panel forms use AdminForm CSRF wrapper; inquiries API stays origin-check only", () => {
  const adminPages = [
    "events/page.tsx",
    "homepage/page.tsx",
    "inquiries/page.tsx",
    "media/page.tsx",
    "menu/page.tsx",
    "ordering/page.tsx",
    "place/page.tsx",
  ];
  for (const rel of adminPages) {
    const source = fs.readFileSync(path.join(root, "src/app/admin/(panel)", rel), "utf8");
    assert.match(source, /AdminForm/, rel);
    assert.doesNotMatch(source, /<form[\s>]/, rel);
  }
  const parties = fs.readFileSync(path.join(root, "src/app/parties/page.tsx"), "utf8");
  assert.match(parties, /permanentRedirect\("\/contact"\)/);
  assert.doesNotMatch(parties, /action="\/api\/inquiries"|Private parties/);
  const inquiries = fs.readFileSync(path.join(root, "src/app/api/inquiries/route.ts"), "utf8");
  assert.match(inquiries, /sameOriginPost/);
  assert.doesNotMatch(inquiries, /verifyCsrfForm/);
});

test("docs describe admin CSRF threat model", () => {
  const doc = fs.readFileSync(path.join(root, "docs/admin-csrf.md"), "utf8");
  assert.match(doc, /session-bound/i);
  assert.match(doc, /sameOriginPost/);
  assert.match(doc, /\/api\/admin\/save/);
  assert.match(doc, /Origin, Referer, and Sec-Fetch-Site were all absent/i);
});
