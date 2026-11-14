import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const root = path.resolve(import.meta.dirname, "..");

test("menu wordmark raster asset exists in public", () => {
  const asset = path.join(root, "public/brand/vinnys-wordmark.png");
  assert.ok(fs.existsSync(asset), "public/brand/vinnys-wordmark.png");
  const header = fs.readFileSync(asset).subarray(0, 8);
  assert.equal(header[0], 0x89, "PNG magic");
  const dim = execSync(`identify -format "%wx%h %A" "${asset}"`, { encoding: "utf8" }).trim();
  assert.match(dim, /^682x110 True$/);
});

test("store menu crop copy exists", () => {
  const store = "/cursor/stores/self/media/vinnys-wordmark-menu-crop.png";
  if (!fs.existsSync(store)) return;
  assert.match(execSync(`identify -format "%wx%h %A" "${store}"`, { encoding: "utf8" }).trim(), /682x110 True/);
});

test("VinnyWordmark uses menu crop image not potrace paths", () => {
  const src = fs.readFileSync(path.join(root, "src/components/VinnyWordmark.tsx"), "utf8");
  assert.match(src, /\/brand\/vinnys-wordmark\.png/);
  assert.match(src, /<img/);
  assert.doesNotMatch(src, /VINNY_MENU_TRACE_PATHS|<path|viewBox/i);
});

test("extract script reads menu logomark", () => {
  const script = fs.readFileSync(path.join(root, "scripts/extract-menu-wordmark.mjs"), "utf8");
  assert.match(script, /vinnys-menu-logomark\.png/);
  assert.match(script, /public\/brand\/vinnys-wordmark\.png/);
});