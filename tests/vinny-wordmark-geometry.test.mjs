import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

const root = path.resolve(import.meta.dirname, "..");

test("menu trace viewBox and path count", async () => {
  const mod = await import(pathToFileURL(path.join(root, "src/lib/vinny-wordmark-menu-paths.ts")).href);
  assert.match(mod.VINNY_MENU_TRACE_VIEWBOX, /^0 0 \d+ \d+$/);
  assert.ok(mod.VINNY_MENU_TRACE_PATHS.length >= 8, "potrace grouped letter paths");
  assert.match(mod.VINNY_MENU_TRACE_TRANSFORM, /translate\(0,/);
});

test("VinnyWordmark uses menu potrace paths only", () => {
  const src = fs.readFileSync(path.join(root, "src/components/VinnyWordmark.tsx"), "utf8");
  assert.match(src, /VINNY_MENU_TRACE_PATHS/);
  assert.doesNotMatch(src, /<text|<tspan|fontSize|linearGradient|feGaussianBlur|<filter/i);
  assert.match(
    fs.readFileSync(path.join(root, "scripts/trace-menu-wordmark.mjs"), "utf8"),
    /vinnys-menu-logomark\.png/,
  );
});