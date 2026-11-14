import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function fixtureEvent(partial) {
  return {
    id: 1,
    title: "Fixture event",
    starts_at: "2099-01-01T19:00",
    ends_at: "",
    blurb: "Test-only fixture. Not a restaurant booking.",
    is_sample: false,
    price: "",
    photo: "",
    next_step: "",
    status: "published",
    updated_at: "",
    published_at: "",
    ...partial,
  };
}

test("public guest Events surfaces never say Placeholder", () => {
  const files = [
    "src/components/ConfirmedEvents.tsx",
    "src/app/events/page.tsx",
    "src/app/page.tsx",
    "src/lib/events-public.ts",
  ];
  for (const file of files) {
    const source = read(file)
      // Ignore block/line comments so docs about the old copy do not fail the guard.
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    assert.doesNotMatch(
      source,
      /["'`][^"'`]*Placeholder\.[^"'`]*["'`]|<strong>\s*Placeholder\./,
      `${file} must not show guest “Placeholder.” copy`,
    );
    assert.doesNotMatch(
      source,
      />\s*Placeholder\./,
      `${file} must not render Placeholder. as visible text`,
    );
  }
});

test("empty-state recovery CTAs reach Contact, Call, and Order (no Private Parties)", () => {
  const empty = read("src/components/ConfirmedEvents.tsx");
  assert.match(empty, /GUEST_EVENTS_EMPTY_LINE|No upcoming events are posted right now/);
  assert.doesNotMatch(empty, /href="\/parties"|Private parties|private party/i);
  assert.match(empty, /href="\/contact"/);
  assert.match(empty, /RESERVE_TEL|tel:7349057051/);
  assert.match(empty, /role="status"/);
  assert.match(empty, /aria-label="Next steps when no events are posted"/);
  assert.match(empty, /OrderLink className="btn btn-solid" url=\{toastUrl\}/);
  assert.doesNotMatch(empty, /\bORDER_URL\b/, "empty-state must not hardcode ORDER_URL");

  const home = read("src/app/page.tsx");
  assert.match(home, /EventsEmptyState[\s\S]*?surface="home"/);
  assert.match(home, /phoneHref=\{site\.phoneHref\}/);
  assert.match(home, /toastUrl=\{site\.toastUrl\}/);
  assert.match(home, /All events/);
  assert.doesNotMatch(
    home,
    /ConfirmedEvents events=\{upcoming\}[\s\S]*?<Link className="btn" href="\/events">\s*Events\s*<\/Link>/,
    "homepage must not dead-end empty Events into a lone Events link",
  );

  const page = read("src/app/events/page.tsx");
  assert.match(page, /getSite/);
  assert.match(page, /EventsEmptyState surface="page"/);
  assert.match(page, /hasEarlier=\{earlier\.length > 0\}/);
  assert.match(page, /toastUrl:\s*site\.toastUrl/);
  assert.match(page, /Only confirmed events are listed/);
});

test("empty CMS ordering URL does not expose a hardcoded ordering link on Events empty-state", () => {
  const empty = read("src/components/ConfirmedEvents.tsx");
  const page = read("src/app/events/page.tsx");
  const orderLink = read("src/components/OrderLink.tsx");

  assert.doesNotMatch(empty, /\bORDER_URL\b/);
  assert.doesNotMatch(page, /\bORDER_URL\b/);
  assert.doesNotMatch(empty, /toastUrl\s*\|\|\s*ORDER_URL/);
  assert.doesNotMatch(page, /toastUrl\s*\|\|\s*ORDER_URL/);
  assert.doesNotMatch(empty, /order\.toasttab\.com/);
  assert.match(orderLink, /if \(!url\) return null/, "OrderLink hides when CMS URL is empty");
  assert.match(empty, /url=\{toastUrl\}/);
});

test("splitPublicEvents covers empty, upcoming, and past fixtures", async () => {
  const mod = await import(
    `${pathToFileURL(path.join(root, "src/lib/events-public.ts")).href}?t=${Date.now()}`
  );
  const now = "2026-06-15T12:00";

  const empty = mod.splitPublicEvents([], now);
  assert.deepEqual(empty, { upcoming: [], earlier: [] });

  const upcomingOnly = mod.splitPublicEvents(
    [fixtureEvent({ id: 2, title: "Upcoming fixture", starts_at: "2026-07-01T18:00" })],
    now,
  );
  assert.equal(upcomingOnly.upcoming.length, 1);
  assert.equal(upcomingOnly.earlier.length, 0);
  assert.equal(upcomingOnly.upcoming[0].title, "Upcoming fixture");

  const pastOnly = mod.splitPublicEvents(
    [fixtureEvent({ id: 3, title: "Past fixture", starts_at: "2026-01-10T18:00", ends_at: "2026-01-10T21:00" })],
    now,
  );
  assert.equal(pastOnly.upcoming.length, 0);
  assert.equal(pastOnly.earlier.length, 1);
  assert.equal(pastOnly.earlier[0].title, "Past fixture");

  const mixed = mod.splitPublicEvents(
    [
      fixtureEvent({ id: 4, title: "Past A", starts_at: "2026-01-01T12:00" }),
      fixtureEvent({ id: 5, title: "Future B", starts_at: "2026-12-01T12:00" }),
      fixtureEvent({
        id: 6,
        title: "Still happening",
        starts_at: "2026-06-14T18:00",
        ends_at: "2026-06-16T01:00",
      }),
    ],
    now,
  );
  assert.deepEqual(
    mixed.upcoming.map((row) => row.title),
    ["Future B", "Still happening"],
  );
  assert.deepEqual(
    mixed.earlier.map((row) => row.title),
    ["Past A"],
  );

  assert.equal(mod.GUEST_EVENTS_EMPTY_LINE, "No upcoming events are posted right now.");
  assert.doesNotMatch(mod.GUEST_EVENTS_EMPTY_LINE, /placeholder/i);
});

test("events empty-state CSS keeps recovery CTAs wrapping on narrow widths", () => {
  const css = read("src/app/globals.css");
  assert.match(css, /\.events-empty\s*\{/);
  assert.match(css, /\.home-card \.events-empty \.cta-row[\s\S]*?flex-wrap:\s*wrap/);
  assert.match(css, /\.home-card \.events-empty \.btn[\s\S]*?margin-top:\s*0/);
  assert.match(
    css,
    /\.home-card \.hint\s*\{\s*color:\s*#5c5148\s*;\s*\}/,
    "home-card hints must use paper-readable muted (UX-A1)",
  );
});
