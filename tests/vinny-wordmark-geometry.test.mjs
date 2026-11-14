import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

const root = path.resolve(import.meta.dirname, "..");

test("VinnyWordmark geometry constants match sign-traced viewBox", async () => {
  const mod = await import(pathToFileURL(path.join(root, "src/lib/vinny-wordmark-geometry.ts")).href);
  assert.equal(mod.VINNY_WORDMARK_VIEWBOX, "0 0 236 56");
  assert.equal(mod.VINNY_WORDMARK_BASELINE, 47);
  assert.equal(mod.VINNY_WORDMARK_X_HEIGHT, 22);
  assert.ok(mod.VINNY_WORDMARK_X_HEIGHT * 2 <= 48, "x-height is ~half of V total height");
});

test("VinnyWordmark SVG uses flat paths only (no filters or gradients)", () => {
  const src = fs.readFileSync(path.join(root, "src/components/VinnyWordmark.tsx"), "utf8");
  assert.match(src, /viewBox=\{VINNY_WORDMARK_VIEWBOX\}/);
  assert.match(src, /M 5 38 L 33 51\.5/);
  assert.match(src, /M 33 51\.5 C 36 47\.5 47 18 111 3\.5/);
  assert.match(src, /cx=\{90\.2\} cy=\{26\.5\}/, "i-dot at V right-arm midpoint");
  assert.match(src, /BODY_SIZE = 26\.4/);
  assert.doesNotMatch(src, /linearGradient|feGaussianBlur|<filter|filter:\s*url/i);
});