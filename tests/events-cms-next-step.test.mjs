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

test("cleanEventNextStep accepts blank, https, http, phone; rejects junk and javascript", async () => {
  const { cleanEventNextStep, eventNextStepHref, phoneHref } = await loadFormat();
  assert.equal(cleanEventNextStep(""), "");
  assert.equal(cleanEventNextStep("   "), "");
  assert.equal(cleanEventNextStep("https://tickets.example.com/show"), "https://tickets.example.com/show");
  assert.equal(cleanEventNextStep("http://tickets.example.com/show"), "http://tickets.example.com/show");
  assert.equal(cleanEventNextStep("(248) 555-0199"), "(248) 555-0199");
  assert.equal(cleanEventNextStep("2485550199"), "2485550199");
  assert.equal(cleanEventNextStep("+1 248 555 0199"), "+1 248 555 0199");
  assert.equal(cleanEventNextStep("javascript:alert(1)"), null);
  assert.equal(cleanEventNextStep("ftp://files.example.com/x"), null);
  assert.equal(cleanEventNextStep("not-a-url"), null);
  assert.equal(cleanEventNextStep("Call us"), null);
  assert.equal(cleanEventNextStep("/parties"), null);

  assert.equal(eventNextStepHref("https://tickets.example.com/show"), "https://tickets.example.com/show");
  assert.equal(eventNextStepHref("(248) 555-0199"), phoneHref("(248) 555-0199"));
  assert.equal(eventNextStepHref(""), null);
  assert.equal(eventNextStepHref("plain text"), null);
});

test("nextstep error copy is specific and distinct from photo/url", async () => {
  const { adminError } = await loadMessages();
  assert.equal(
    adminError("nextstep"),
    "That next step did not save. Use a phone number or a full http:// or https:// link, or leave it blank.",
  );
  assert.notEqual(adminError("nextstep"), adminError("photo"));
  assert.notEqual(adminError("nextstep"), adminError("url"));
});

test("Events admin UI exposes editable next_step field with guidance", () => {
  const page = read("src/app/admin/(panel)/events/page.tsx");
  assert.match(page, /name="next_step"/);
  assert.match(page, /Next step, optional/);
  assert.match(page, /placeholder="Phone or https:\/\/"/);
  assert.match(page, /phone number or a full http:\/\/ or https:\/\/ link/);
  assert.match(page, /next_step:/);
});

test("event mutate reads next_step and rejects invalid with nextstep error", () => {
  const mutate = read("src/lib/mutate.ts");
  assert.match(mutate, /cleanEventNextStep/);
  assert.match(mutate, /form\.get\("next_step"\)/);
  assert.match(mutate, /error=nextstep/);
  assert.doesNotMatch(mutate, /nextStep:\s*""/);
});

test("public ConfirmedEvents links next_step via shared eventNextStepHref", () => {
  const component = read("src/components/ConfirmedEvents.tsx");
  assert.match(component, /eventNextStepHref/);
  assert.match(component, /event\.next_step/);
  assert.match(component, /data-track=\{stepHref\.startsWith\("tel:"\) \? "phone_click" : undefined\}/);
  assert.doesNotMatch(component, /function nextStepHref/);
});

test("next_step CMS round-trip: blank default, https, phone, reject junk, preserve across update", () => {
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "vinnys-events-prc-"));
  try {
    fs.mkdirSync(path.join(fixtureDir, "data"), { recursive: true });
    const script = `
      const mutate = await import(${JSON.stringify(pathToFileURL(path.join(root, "src/lib/mutate.ts")).href)});
      const content = await import(${JSON.stringify(pathToFileURL(path.join(root, "src/lib/content.ts")).href)});
      const format = await import(${JSON.stringify(pathToFileURL(path.join(root, "src/lib/format.ts")).href)});

      function form(entries) {
        const data = new FormData();
        for (const [key, value] of Object.entries(entries)) data.set(key, String(value));
        return data;
      }

      const base = {
        title: "PR-C Fixture Trivia Night",
        blurb: "Disposable fixture event for automated next_step tests.",
        event_date: "2099-07-20",
        start_time: "18:00",
        end_time: "21:00",
        price: "",
        photo: "",
        next_step: "",
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
      if (event.next_step !== "") throw new Error("expected blank next_step, got " + JSON.stringify(event.next_step));

      const badStep = await mutate.applyAdminSave(form({
        intent: "event-update",
        id: event.id,
        action: "draft",
        ...base,
        next_step: "javascript:alert(1)",
      }));
      if (badStep !== "/admin/events?error=nextstep") throw new Error("junk reject " + badStep);

      const badPlain = await mutate.applyAdminSave(form({
        intent: "event-update",
        id: event.id,
        action: "draft",
        ...base,
        next_step: "RSVP at the bar",
      }));
      if (badPlain !== "/admin/events?error=nextstep") throw new Error("plain reject " + badPlain);

      const withUrl = await mutate.applyAdminSave(form({
        intent: "event-update",
        id: event.id,
        action: "publish",
        ...base,
        next_step: "https://tickets.example.com/trivia",
      }));
      if (withUrl !== "/admin/events?saved=published") throw new Error("publish url " + withUrl);

      event = (await content.listEvents("admin")).find((row) => row.id === event.id);
      if (!event || event.status !== "published") throw new Error("not published");
      if (!event.next_step.startsWith("https://tickets.example.com/trivia")) {
        throw new Error("url not saved: " + event.next_step);
      }
      const href = format.eventNextStepHref(event.next_step);
      if (!href || !href.startsWith("https://tickets.example.com/trivia")) {
        throw new Error("public href missing: " + href);
      }
      if (!(await content.listEvents("public")).some((row) => row.id === event.id && row.next_step === event.next_step)) {
        throw new Error("public missing next_step");
      }

      const withPhone = await mutate.applyAdminSave(form({
        intent: "event-update",
        id: event.id,
        action: "publish",
        ...base,
        next_step: "(248) 555-0199",
      }));
      if (withPhone !== "/admin/events?saved=published") throw new Error("publish phone " + withPhone);
      event = (await content.listEvents("admin")).find((row) => row.id === event.id);
      if (event.next_step !== "(248) 555-0199") throw new Error("phone not saved: " + event.next_step);
      if (format.eventNextStepHref(event.next_step) !== "tel:+12485550199") {
        throw new Error("phone href " + format.eventNextStepHref(event.next_step));
      }

      const preserved = await mutate.applyAdminSave(form({
        intent: "event-update",
        id: event.id,
        action: "publish",
        ...base,
        title: "PR-C Fixture Trivia Night Updated",
        next_step: "(248) 555-0199",
      }));
      if (preserved !== "/admin/events?saved=published") throw new Error("preserve update " + preserved);
      event = (await content.listEvents("admin")).find((row) => row.id === event.id);
      if (event.title !== "PR-C Fixture Trivia Night Updated") throw new Error("title not updated");
      if (event.next_step !== "(248) 555-0199") throw new Error("next_step wiped on update");

      const cleared = await mutate.applyAdminSave(form({
        intent: "event-update",
        id: event.id,
        action: "draft",
        ...base,
        title: event.title,
        next_step: "",
      }));
      if (cleared !== "/admin/events?saved=draft") throw new Error("clear " + cleared);
      event = (await content.listEvents("admin")).find((row) => row.id === event.id);
      if (event.next_step !== "") throw new Error("clear failed: " + event.next_step);

      const deleted = await mutate.applyAdminSave(form({
        intent: "event-delete",
        id: event.id,
        yes: "1",
      }));
      if (deleted !== "/admin/events?saved=deleted") throw new Error("delete " + deleted);

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
