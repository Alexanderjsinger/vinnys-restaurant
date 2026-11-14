import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

const root = path.resolve(import.meta.dirname, "..");

test("splitPlaceWordmark keeps short mark + Bar & Grill from CMS name", async () => {
  const mod = await import(pathToFileURL(path.join(root, "src/lib/brand.ts")).href);
  assert.equal(mod.DEFAULT_PLACE_NAME, "Vinny’s Bar & Grill");
  assert.deepEqual(mod.splitPlaceWordmark("Vinny’s Bar & Grill"), {
    mark: "Vinny’s",
    rest: "Bar & Grill",
  });
  assert.deepEqual(mod.splitPlaceWordmark("Vinny's Bar & Grill"), {
    mark: "Vinny's",
    rest: "Bar & Grill",
  });
  assert.deepEqual(mod.splitPlaceWordmark("Fixture Grill"), {
    mark: "Fixture Grill",
    rest: null,
  });
});

test("guest UI does not hardcode bare Vinny’s as the place name", () => {
  const files = [
    "src/components/SiteHeader.tsx",
    "src/app/menu/page.tsx",
    "src/app/page.tsx",
    "src/lib/notify.ts",
  ];
  for (const rel of files) {
    const text = fs.readFileSync(path.join(root, rel), "utf8");
    assert.match(text, /DEFAULT_PLACE_NAME|site\.name|restaurant_name|splitPlaceWordmark/, rel);
    assert.doesNotMatch(
      text,
      /brand-mark">Vinny|Food &amp; Drinks at Vinny&apos;s<\/h1>|New party note for Vinny's"/,
      `${rel} should not hardcode short place name`,
    );
  }
});
