#!/usr/bin/env node
/**
 * Dev-only: side-by-side reference vs SVG at matched height (scale-normalized).
 * Usage: node scripts/wordmark-compare-shot.mjs [output.png]
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const refPath = path.resolve("/cursor/stores/self/media/vinnys-bar-logo-reference-v2.png");
const outPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve("/cursor/stores/self/media/vinnys-wordmark-v4-compare.png");

const tsx = fs.readFileSync(path.join(root, "src/components/VinnyWordmark.tsx"), "utf8");
const body = tsx
  .replace(/className=/g, "class=")
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
  .replace(/strokeWidth=\{V_STROKE\}/g, 'stroke-width="4.35"')
  .replace(/strokeWidth=\{L_STROKE\}/g, 'stroke-width="3.35"')
  .replace(/strokeWidth=\{(\d+(?:\.\d+)?)\}/g, 'stroke-width="$1"')
  .replace(/r=\{V_STROKE \/ 2\}/g, 'r="2.7"')
  .replace(/r=\{3\.1\}/g, 'r="3.1"')
  .replace(/([a-zA-Z]+)=\{(\d+(?:\.\d+)?)\}/g, '$1="$2"')
  .replace(/dominantBaseline=/g, "dominant-baseline=")
  .replace(/letterSpacing=/g, "letter-spacing=")
  .replace(/strokeLinecap=/g, "stroke-linecap=")
  .replace(/strokeLinejoin=/g, "stroke-linejoin=");

const block = body.match(/<g class="vinny-wordmark__letters"[^>]*>([\s\S]*)<\/g>\s*<\/svg>/)?.[1];
if (!block || !fs.existsSync(refPath)) {
  console.error("Missing SVG extract or reference image");
  process.exit(1);
}
const lettersInner = block
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .trim();

const refData = fs.readFileSync(refPath).toString("base64");
const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><style>
  body { margin: 0; font-family: system-ui, sans-serif; background: #fff; }
  .row { display: flex; align-items: center; gap: 28px; padding: 24px 32px; }
  .panel { text-align: center; }
  .panel p { margin: 0 0 8px; font-size: 12px; color: #444; text-transform: uppercase; letter-spacing: 0.08em; }
  .mark { height: 88px; width: auto; display: block; margin: 0 auto; }
  svg.mark { color: #0c0b0a; }
</style></head><body>
<div class="row">
  <div class="panel"><p>Reference (v2)</p><img class="mark" alt="reference" src="data:image/png;base64,${refData}"/></div>
  <div class="panel"><p>SVG (flat)</p><svg class="mark" viewBox="0 0 162 56" xmlns="http://www.w3.org/2000/svg">${lettersInner}</svg></div>
</div>
</body></html>`;

const htmlPath = path.join(root, ".tmp-wordmark-compare.html");
fs.writeFileSync(htmlPath, html);
const url = `file://${htmlPath}`;
execSync(
  `npx --yes playwright@1.49.1 screenshot --browser=chromium --viewport-size=920,180 "${url}" "${outPath}"`,
  { stdio: "inherit" },
);
fs.unlinkSync(htmlPath);
console.log("Wrote", outPath);