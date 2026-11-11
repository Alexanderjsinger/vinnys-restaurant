import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);

function nodePath() {
  const candidates = [path.join(root, "node_modules"), "/home/ubuntu/vinnys-build/node_modules"];
  const found = candidates.filter((dir) => fs.existsSync(path.join(dir, "better-sqlite3")));
  return [...found, process.env.NODE_PATH].filter(Boolean).join(path.delimiter);
}

async function loadLib(name, fixtureDir) {
  process.env.VINNYS_FORCE_SQLITE = "1";
  process.env.FIXTURE_DIR = fixtureDir;
  process.env.NODE_PATH = nodePath();
  const url = pathToFileURL(path.join(root, "src/lib", name)).href;
  return import(`${url}?t=${Date.now()}-${Math.random()}`);
}

function pngBytes() {
  // Minimal 1x1 PNG
  return Uint8Array.from(
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    ),
  ).buffer;
}

function jpegBytes() {
  const bytes = new Uint8Array(16);
  bytes[0] = 0xff;
  bytes[1] = 0xd8;
  bytes[2] = 0xff;
  bytes[3] = 0xd9;
  return bytes.buffer;
}

test("image magic-byte validation accepts png/jpeg and rejects spoofed types", async () => {
  const mod = await import(pathToFileURL(path.join(root, "src/lib/image-bytes.ts")).href);
  assert.equal(mod.detectImageType(pngBytes()), "image/png");
  assert.equal(mod.detectImageType(jpegBytes()), "image/jpeg");
  const fake = new TextEncoder().encode("not-an-image").buffer;
  assert.equal(mod.detectImageType(fake), null);
  const oversized = new ArrayBuffer(5 * 1024 * 1024);
  assert.equal(mod.validateImageUpload(oversized).ok, false);
  assert.equal(mod.validateImageUpload(pngBytes()).ok, true);
});

test("notify queue records pending then sent without duplicate open rows", async () => {
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "vinnys-notify-"));
  const prevCwd = process.cwd();
  try {
    process.chdir(fixtureDir);
    fs.mkdirSync(path.join(fixtureDir, "data"), { recursive: true });
    // Load through register stubs like other fixtures
    const { spawnSync } = await import("node:child_process");
    const script = `
      const db = await import(${JSON.stringify(pathToFileURL(path.join(root, "src/lib/db.ts")).href)});
      const id = await db.addInquiry({
        name: "Test Guest",
        email: "guest@example.com",
        eventDate: "2099-01-15",
        partySize: 4,
        message: "Birthday room",
      });
      db.enqueueNotify(id, "RESEND_API_KEY is not set");
      db.enqueueNotify(id, "RESEND_API_KEY is not set");
      const pending1 = db.listPendingNotifies(10);
      if (pending1.length !== 1) throw new Error("expected one pending row, got " + pending1.length);
      db.markNotifyAttempt(pending1[0].id);
      db.recordNotifyFailure(pending1[0].id, "resend 500");
      const status = db.getInquiryNotifyStatus(id);
      if (status.attempts !== 1) throw new Error("attempts");
      if (status.status !== "pending") throw new Error("status " + status.status);
      db.markNotifySent(id, "accepted-by-resend");
      const sent = db.getInquiryNotifyStatus(id);
      if (sent.status !== "sent") throw new Error("not sent");
      db.enqueueNotify(id, "should-skip");
      const pending2 = db.listPendingNotifies(10);
      if (pending2.length !== 0) throw new Error("sent inquiry should not re-queue");
      console.log(JSON.stringify({ ok: true, id }));
    `;
    const result = spawnSync(
      process.execPath,
      [
        "--experimental-strip-types",
        "--disable-warning=ExperimentalWarning",
        "--import",
        path.join(root, "tests/register.mjs"),
        "--eval",
        script,
      ],
      {
        cwd: fixtureDir,
        encoding: "utf8",
        env: {
          ...process.env,
          NODE_PATH: nodePath(),
          VINNYS_FORCE_SQLITE: "1",
          FIXTURE_DIR: fixtureDir,
        },
      },
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const out = JSON.parse(result.stdout.trim().split("\n").at(-1));
    assert.equal(out.ok, true);
  } finally {
    process.chdir(prevCwd);
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  }
});

test("media in-use protection blocks delete while referenced", async () => {
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "vinnys-media-"));
  try {
    const { spawnSync } = await import("node:child_process");
    const script = `
      const db = await import(${JSON.stringify(pathToFileURL(path.join(root, "src/lib/db.ts")).href)});
      const id = db.addMedia({
        object_key: "library/test.png",
        alt: "test",
        content_type: "image/png",
        bytes: 12,
        created_at: new Date().toISOString(),
      });
      db.saveSetting("hero_image", "/media/" + id, true);
      if (!db.mediaInUse(id)) throw new Error("expected in use");
      const blocked = db.deleteMedia(id);
      if (blocked.ok) throw new Error("delete should be blocked");
      db.saveSetting("hero_image", "", false);
      const removed = db.deleteMedia(id);
      if (!removed.ok) throw new Error("delete should succeed");
      console.log(JSON.stringify({ ok: true }));
    `;
    const result = spawnSync(
      process.execPath,
      [
        "--experimental-strip-types",
        "--disable-warning=ExperimentalWarning",
        "--import",
        path.join(root, "tests/register.mjs"),
        "--eval",
        script,
      ],
      {
        cwd: fixtureDir,
        encoding: "utf8",
        env: {
          ...process.env,
          NODE_PATH: nodePath(),
          VINNYS_FORCE_SQLITE: "1",
          FIXTURE_DIR: fixtureDir,
        },
      },
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  }
});

test("sameOriginPost rejects cross-site sec-fetch-site without matching origin", async () => {
  const { sameOriginPost } = await import(pathToFileURL(path.join(root, "src/lib/format.ts")).href);
  const bad = new Request("https://vinnys.example/api/inquiries", {
    method: "POST",
    headers: { "sec-fetch-site": "cross-site" },
  });
  assert.equal(sameOriginPost(bad), false);
  const ok = new Request("https://vinnys.example/api/inquiries", {
    method: "POST",
    headers: { origin: "https://vinnys.example" },
  });
  assert.equal(sameOriginPost(ok), true);
  const spoofedReferer = new Request("https://vinnys.example/api/inquiries", {
    method: "POST",
    headers: { referer: "https://evil.example/parties" },
  });
  assert.equal(sameOriginPost(spoofedReferer), false);
  const sameReferer = new Request("https://vinnys.example/api/inquiries", {
    method: "POST",
    headers: { referer: "https://vinnys.example/parties" },
  });
  assert.equal(sameOriginPost(sameReferer), true);
  const noHeaders = new Request("https://vinnys.example/api/inquiries", { method: "POST" });
  assert.equal(sameOriginPost(noHeaders), false);
});

test("security headers helper includes nosniff and frame options", async () => {
  const { SECURITY_HEADERS, applySecurityHeaders } = await import(
    pathToFileURL(path.join(root, "src/lib/security-headers.ts")).href,
  );
  const keys = SECURITY_HEADERS.map(([key]) => key);
  assert.ok(keys.includes("X-Content-Type-Options"));
  assert.ok(keys.includes("X-Frame-Options"));
  assert.ok(keys.includes("Referrer-Policy"));
  const headers = new Headers();
  applySecurityHeaders(headers);
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headers.get("X-Frame-Options"), "SAMEORIGIN");
  const middleware = fs.readFileSync(path.join(root, "src/middleware.ts"), "utf8");
  assert.match(middleware, /applySecurityHeaders/);
});

test("birthday signup route stays closed and homepage has no signup inputs", () => {
  const signup = fs.readFileSync(path.join(root, "src/app/api/signup/route.ts"), "utf8");
  assert.match(signup, /join=closed/);
  assert.doesNotMatch(signup, /addSignup|INSERT INTO signups/);
  const home = fs.readFileSync(path.join(root, "src/app/page.tsx"), "utf8");
  assert.match(home, /birthday list is closed/i);
  assert.doesNotMatch(home, /action="\/api\/signup"/);
  assert.doesNotMatch(home, /name="email"/);
});

test("homepage hero uses storefront exterior and venue uses table photo", () => {
  const poster = fs.readFileSync(path.join(root, "src/components/PosterSlider.tsx"), "utf8");
  const page = fs.readFileSync(path.join(root, "src/app/page.tsx"), "utf8");
  const layout = fs.readFileSync(path.join(root, "src/app/layout.tsx"), "utf8");
  const seo = fs.readFileSync(path.join(root, "src/lib/seo.ts"), "utf8");
  assert.match(poster, /\/photos\/storefront\.webp/);
  assert.match(poster, /listing photo of the exterior/);
  assert.match(page, /src="\/hero\/meet-me\.jpg"/);
  assert.match(page, /Not a photo of the dining room/);
  assert.match(layout, /\/photos\/storefront\.webp/);
  assert.match(seo, /\/photos\/storefront\.webp/);
});

test("admin mutations require isAdmin in source", () => {
  const save = fs.readFileSync(path.join(root, "src/app/api/admin/save/route.ts"), "utf8");
  const media = fs.readFileSync(path.join(root, "src/app/api/admin/media/route.ts"), "utf8");
  assert.match(save, /isAdmin/);
  assert.match(media, /isAdmin/);
  assert.match(media, /validateImageUpload/);
  assert.match(save, /verifyCsrfForm/);
  assert.match(media, /verifyCsrfForm/);
});
