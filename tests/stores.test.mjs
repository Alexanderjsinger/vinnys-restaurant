import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "src");

function nodePath() {
  const candidates = [path.join(root, "node_modules"), "/home/ubuntu/vinnys-build/node_modules"];
  const found = candidates.filter((dir) => fs.existsSync(path.join(dir, "better-sqlite3")));
  return [...found, process.env.NODE_PATH].filter(Boolean).join(path.delimiter);
}

function runFixture(command, fixtureDir) {
  const env = { ...process.env, FIXTURE_DIR: fixtureDir, NODE_PATH: nodePath(), VINNYS_FORCE_SQLITE: "1" };
  delete env.VINNYS_SNAPSHOT;
  if (command === "snapshot-read") env.VINNYS_SNAPSHOT = "1";
  const result = spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "--disable-warning=ExperimentalWarning",
      "--import",
      path.join(root, "tests/register.mjs"),
      path.join(root, "tests/fixture-run.mjs"),
      command,
    ],
    { cwd: fixtureDir, env, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout.trim().split("\n").at(-1));
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) files.push(full);
  }
  return files;
}

test("sqlite edits stay in sqlite and the snapshot keeps the published menu", () => {
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "vinnys-stores-"));
  try {
    const written = runFixture("local-write", fixtureDir);
    assert.equal(written.price, "99");
    assert.equal(written.name, "Fixture Grill");
    assert.equal(written.draftVisible, false);
    assert.equal(written.draftPreview, true);
    assert.deepEqual(written.emails, ["fixture-guest@example.com"]);

    const published = runFixture("snapshot-read", fixtureDir);
    assert.equal(published.publicPrice, "16");
    assert.equal(published.publicName, "Vinny’s Bar & Grill");
    assert.equal(published.sqlitePrice, "99");
    assert.equal(published.sqliteName, "Fixture Grill");

    const reread = runFixture("local-read", fixtureDir);
    assert.equal(reread.price, "99");
    assert.deepEqual(reread.emails, ["fixture-guest@example.com"]);
  } finally {
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  }
});

test("promo, story, and reservation objects are not rendered", () => {
  const hits = [];
  for (const file of walk(src)) {
    if (file.endsWith(`${path.sep}lib${path.sep}site.ts`)) continue;
    const text = fs.readFileSync(file, "utf8");
    if (text.includes("site.promo") || text.includes("site.story") || text.includes("site.reservation")) {
      hits.push(path.relative(root, file));
    }
  }
  assert.deepEqual(hits, []);
});

test("an empty ordering URL does not fall back to a hardcoded Toast link", () => {
  const hits = walk(src).filter((file) => fs.readFileSync(file, "utf8").includes("toastUrl || ORDER_URL"));
  assert.deepEqual(hits, []);
});

test("menu updates write dietary flags", () => {
  const text = fs.readFileSync(path.join(src, "lib/db.ts"), "utf8");
  const start = text.indexOf("export function updateItem");
  const end = text.indexOf("export function deleteItem");
  const body = text.slice(start, end);
  assert.match(body, /gluten_free/);
});

test("canonical URLs point at the production origin", async () => {
  const seoUrl = pathToFileURL(path.join(src, "lib/seo.ts")).href;
  const child = spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "--disable-warning=ExperimentalWarning",
      "--import",
      path.join(root, "tests/register.mjs"),
      "--eval",
      `const seo = await import(${JSON.stringify(seoUrl)});
       const meta = seo.pageMeta("/menu", "Food & Drinks", "Lunch and dinner.");
       console.log(JSON.stringify({ canonical: meta.alternates.canonical, origin: meta.openGraph.url }));`,
    ],
    { encoding: "utf8", env: { ...process.env, NODE_PATH: nodePath() } },
  );
  assert.equal(child.status, 0, child.stderr || child.stdout);
  const meta = JSON.parse(child.stdout.trim().split("\n").at(-1));
  assert.equal(meta.canonical, "https://vinnysbargrill.com/menu");
  assert.equal(meta.origin, "https://vinnysbargrill.com/menu");
});

test("staging host is noindex and production host is indexable", () => {
  const layout = fs.readFileSync(path.join(src, "app/layout.tsx"), "utf8");
  const robots = fs.readFileSync(path.join(src, "app/robots.ts"), "utf8");
  assert.match(layout, /host\.includes\("workers\.dev"\) \? \{ index: false, follow: false \}/);
  assert.match(robots, /host\.includes\("workers\.dev"\)/);
  assert.match(robots, /disallow: "\/"/);
  assert.match(robots, /sitemap: `\$\{PRODUCTION_ORIGIN\}\/sitemap\.xml`/);
});

test("live workers.dev pages advertise noindex, the production canonical, and five sitemap URLs", async () => {
  const headers = { "user-agent": "Mozilla/5.0", accept: "text/html" };
  const home = await fetch("https://vinnys-bar-grill.toastisadog.workers.dev/", { headers });
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.match(html, /noindex/);
  assert.match(html, /rel="canonical" href="https:\/\/vinnysbargrill\.com\/?"/);
  const robots = await fetch("https://vinnys-bar-grill.toastisadog.workers.dev/robots.txt", { headers });
  assert.equal(robots.status, 200);
  const robotsText = await robots.text();
  assert.match(robotsText, /Disallow:\s*\//);
  const sitemap = await fetch("https://vinnys-bar-grill.toastisadog.workers.dev/sitemap.xml", { headers });
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  for (const page of ["/", "/menu", "/events", "/parties", "/contact"]) {
    const url = page === "/" ? "https://vinnysbargrill.com/" : `https://vinnysbargrill.com${page}`;
    assert.equal(xml.includes(url), true, url);
  }
});
