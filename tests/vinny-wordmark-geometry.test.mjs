import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

const root = path.resolve(import.meta.dirname, "..");

test("VinnyWordmark geometry constants match sign-traced viewBox", async () => {
  const mod = await import(pathToFileURL(path.join(root, "src/lib/vinny-wordmark-geometry.ts")).href);
  assert.equal(mod.VINNY_WORDMARK_VIEWBOX, "0 0 162 56");
  assert.equal(mod.VINNY_WORDMARK_LETTER_STROKE, 3.35);
});

test("VinnyWordmark is path-only flat SVG (no font text, no effects)", () => {
  const src = fs.readFileSync(path.join(root, "src/components/VinnyWordmark.tsx"), "utf8");
  assert.match(src, /L_STROKE = 3\.35/);
  assert.match(src, /M 13 41\.2 L 36 50\.6/);
  assert.match(src, /M 36 50\.6 C 37\.8 48\.6 41 36 60 9/);
  assert.match(src, /cx=\{49\.2\} cy=\{25\.2\}/);
  assert.doesNotMatch(src, /<text|<tspan|fontSize|font-family/i);
  assert.doesNotMatch(src, /linearGradient|feGaussianBlur|<filter|filter:\s*url/i);
});