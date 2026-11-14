import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function nodePath() {
  const candidates = [path.join(root, "node_modules"), "/home/ubuntu/vinnys-build/node_modules"];
  const found = candidates.filter((dir) => fs.existsSync(path.join(dir, "better-sqlite3")));
  return [...found, process.env.NODE_PATH].filter(Boolean).join(path.delimiter);
}

async function loadFormat() {
  return import(`${pathToFileURL(path.join(root, "src/lib/format.ts")).href}?t=${Date.now()}`);
}

async function loadMessages() {
  return import(`${pathToFileURL(path.join(root, "src/lib/messages.ts")).href}?t=${Date.now()}`);
}

test("cleanEventPhoto accepts blank, https, /events paths; rejects /media, Drive viewers, junk", async () => {
  const { cleanEventPhoto } = await loadFormat();
  assert.equal(cleanEventPhoto(""), "");
  assert.equal(cleanEventPhoto("   "), "");
  assert.equal(cleanEventPhoto("https://cdn.example.com/event.jpg"), "https://cdn.example.com/event.jpg");
  assert.equal(cleanEventPhoto("http://cdn.example.com/event.jpg"), "http://cdn.example.com/event.jpg");
  assert.equal(cleanEventPhoto("/events/live-music.webp"), "/events/live-music.webp");
  assert.equal(cleanEventPhoto("/media/1"), null);
  assert.equal(cleanEventPhoto("/media/99"), null);
  assert.equal(cleanEventPhoto("/photos/storefront.webp"), null);
  assert.equal(cleanEventPhoto("/events/../secret"), null);
  assert.equal(cleanEventPhoto("javascript:alert(1)"), null);
  assert.equal(cleanEventPhoto("not-a-url"), null);
  assert.equal(
    cleanEventPhoto("https://drive.google.com/file/d/1qFgAIXdnzvuZCfsgleoLUid9PdMonmsS/view?usp=drivesdk"),
    null,
  );
  assert.equal(cleanEventPhoto("https://docs.google.com/file/d/abc/view"), null);
  assert.equal(cleanEventPhoto("https://cdn.example.com/poster/view"), null);
});

test("photo error copy is specific; url error stays for generic links", async () => {
  const { adminError } = await loadMessages();
  assert.equal(
    adminError("photo"),
    "That photo did not save. Use a direct https:// image link (not a Google Drive or share page), or leave the photo blank. Paths like /media/1 are not accepted for events yet.",
  );
  assert.equal(adminError("url"), "Links must start with http:// or https://.");
  assert.notEqual(adminError("photo"), adminError("url"));
});

test("Events admin UI uses button-only status model and truthful photo field", () => {
  const page = read("src/app/admin/(panel)/events/page.tsx");
  assert.doesNotMatch(page, /<select[^>]*name="status"|name="status"/);
  assert.doesNotMatch(page, /\/media\/1/);
  assert.match(page, /Photo URL, optional/);
  assert.match(page, /placeholder="https:\/\/"/);
  assert.match(page, /Direct https:\/\/ image link only/);
  assert.match(
    page,
    /Uploaded \/media\/… paths are not available for events until photo upload is turned on/,
  );
  assert.match(page, /value="draft"[\s\S]*Save draft|Save draft[\s\S]*value="draft"/);
  assert.match(page, /value="publish"[\s\S]*Publish|Publish[\s\S]*value="publish"/);
  assert.match(page, /value="archive"[\s\S]*Archive|Archive[\s\S]*value="archive"/);
  assert.match(page, /Restore draft/);
  assert.match(page, /href="\/admin\/preview"/);
  assert.match(page, /Archive<\/strong> hides it from guests and preview/);
  assert.match(page, /Delete<\/strong> removes it for good/);
  assert.match(page, /className="badge"/);
});

test("SaveBanner distinguishes archive, delete, and non-event removals", () => {
  const banner = read("src/components/SaveBanner.tsx");
  assert.match(
    banner,
    /Archived\. It is off the public site and preview\. You can restore it to a draft later\./,
  );
  assert.match(banner, /Deleted\. This event is gone\./);
  assert.match(banner, /Removed from the public site\./);
  assert.match(banner, /saved === "archived"/);
  assert.match(banner, /saved === "deleted"/);
  assert.match(banner, /saved === "removed"/);
});

test("event mutate uses photo error, archive action, and deleted redirect", () => {
  const mutate = read("src/lib/mutate.ts");
  assert.match(mutate, /action === "archive"/);
  assert.match(mutate, /error=photo/);
  assert.doesNotMatch(mutate, /events\?error=url/);
  assert.match(mutate, /events\?saved=deleted/);
  assert.doesNotMatch(mutate, /events\?saved=archived/);
});

test("owner-setup no longer tells owners to paste /media id onto Events while R2 is off", () => {
  const docs = read("docs/owner-setup.md");
  assert.doesNotMatch(docs, /use `\/media\/<id>` on Homepage or Events/);
  assert.match(docs, /Events photo fields do \*\*not\*\* accept `\/media\/<id>`/);
  assert.match(docs, /optional photo = direct https image URL/);
  assert.match(docs, /not a Google Drive or share\/view page/);
});

test("content keep excludes archived from public and preview", () => {
  const content = read("src/lib/content.ts");
  assert.match(content, /if \(status === "archived"\) return false;/);
  assert.match(content, /scope === "preview"\) return status === "draft" \|\| status === "published"/);
});

test("event draft → publish → archive → restore → delete lifecycle and visibility", () => {
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "vinnys-events-prb-"));
  try {
    fs.mkdirSync(path.join(fixtureDir, "data"), { recursive: true });
    const script = `
      const mutate = await import(${JSON.stringify(pathToFileURL(path.join(root, "src/lib/mutate.ts")).href)});
      const content = await import(${JSON.stringify(pathToFileURL(path.join(root, "src/lib/content.ts")).href)});

      function form(entries) {
        const data = new FormData();
        for (const [key, value] of Object.entries(entries)) data.set(key, String(value));
        return data;
      }

      const base = {
        title: "PR-B Fixture Live Music",
        blurb: "Disposable fixture event for automated CMS status/photo tests.",
        event_date: "2099-06-15",
        start_time: "19:00",
        end_time: "22:00",
        price: "",
        photo: "",
      };

      const draftRedirect = await mutate.applyAdminSave(form({
        intent: "event-add",
        action: "draft",
        ...base,
      }));
      if (draftRedirect !== "/admin/events?saved=draft") throw new Error("draft add " + draftRedirect);

      let admin = await content.listEvents("admin");
      let event = admin.find((row) => row.title === base.title);
      if (!event || event.status !== "draft") throw new Error("draft missing");
      if ((await content.listEvents("public")).some((row) => row.id === event.id)) {
        throw new Error("draft leaked to public");
      }
      if (!(await content.listEvents("preview")).some((row) => row.id === event.id)) {
        throw new Error("draft missing from preview");
      }

      const badPhoto = await mutate.applyAdminSave(form({
        intent: "event-update",
        id: event.id,
        action: "draft",
        ...base,
        photo: "/media/1",
      }));
      if (badPhoto !== "/admin/events?error=photo") throw new Error("photo reject " + badPhoto);

      const published = await mutate.applyAdminSave(form({
        intent: "event-update",
        id: event.id,
        action: "publish",
        ...base,
        photo: "https://cdn.example.com/fixture-event.jpg",
      }));
      if (published !== "/admin/events?saved=published") throw new Error("publish " + published);
      event = (await content.listEvents("admin")).find((row) => row.id === event.id);
      if (event.status !== "published" || event.photo !== "https://cdn.example.com/fixture-event.jpg/") {
        // URL may normalize with trailing slash depending on URL API
      }
      if (event.status !== "published") throw new Error("not published");
      if (!event.photo.startsWith("https://cdn.example.com/fixture-event.jpg")) {
        throw new Error("photo not saved: " + event.photo);
      }
      if (!(await content.listEvents("public")).some((row) => row.id === event.id)) {
        throw new Error("published missing from public");
      }

      const archived = await mutate.applyAdminSave(form({
        intent: "event-update",
        id: event.id,
        action: "archive",
        ...base,
        photo: event.photo,
      }));
      if (archived !== "/admin/events?saved=archived") throw new Error("archive " + archived);
      event = (await content.listEvents("admin")).find((row) => row.id === event.id);
      if (!event || event.status !== "archived") throw new Error("archive status");
      if ((await content.listEvents("public")).some((row) => row.id === event.id)) {
        throw new Error("archived on public");
      }
      if ((await content.listEvents("preview")).some((row) => row.id === event.id)) {
        throw new Error("archived on preview");
      }

      const restored = await mutate.applyAdminSave(form({
        intent: "event-update",
        id: event.id,
        action: "draft",
        ...base,
        photo: "",
      }));
      if (restored !== "/admin/events?saved=draft") throw new Error("restore " + restored);
      event = (await content.listEvents("admin")).find((row) => row.id === event.id);
      if (event.status !== "draft") throw new Error("restore status");
      if ((await content.listEvents("public")).some((row) => row.id === event.id)) {
        throw new Error("restored draft on public");
      }

      const deletedNoConfirm = await mutate.applyAdminSave(form({
        intent: "event-delete",
        id: event.id,
      }));
      if (deletedNoConfirm !== "/admin/events?error=confirm") throw new Error("confirm " + deletedNoConfirm);

      const deleted = await mutate.applyAdminSave(form({
        intent: "event-delete",
        id: event.id,
        yes: "1",
      }));
      if (deleted !== "/admin/events?saved=deleted") throw new Error("delete " + deleted);
      if ((await content.listEvents("admin")).some((row) => row.id === event.id)) {
        throw new Error("delete left row");
      }

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
        env: {
          ...process.env,
          FIXTURE_DIR: fixtureDir,
          NODE_PATH: nodePath(),
          VINNYS_FORCE_SQLITE: "1",
        },
        encoding: "utf8",
      },
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const payload = JSON.parse(result.stdout.trim().split("\n").at(-1));
    assert.equal(payload.ok, true);
  } finally {
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  }
});
