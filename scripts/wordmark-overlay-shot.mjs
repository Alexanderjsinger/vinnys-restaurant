#!/usr/bin/env node
/**
 * Reference v2 + flat SVG overlay (50% opacity) and side-by-side compare.
 * Usage: node scripts/wordmark-overlay-shot.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const refPath = path.resolve("/cursor/stores/self/media/vinnys-bar-logo-reference-v2.png");
const overlayOut = path.resolve("/cursor/stores/self/media/vinnys-wordmark-v4-overlay.png");
const compareOut = path.resolve("/cursor/stores/self/media/vinnys-wordmark-v4-compare.png");

const { VINNY_WORDMARK_OVERLAY } = await import(
  pathToFileURL(path.join(root, "src/lib/vinny-wordmark-geometry.ts")).href
);

const tsx = fs.readFileSync(path.join(root, "src/components/VinnyWordmark.tsx"), "utf8");
const body = tsx
  .replace(/className=/g, "class=")
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
  .replace(/strokeWidth=\{V_STROKE\}/g, 'stroke-width="4.35"')
  .replace(/strokeWidth=\{L_STROKE\}/g, 'stroke-width="3.35"')
  .replace(/r=\{V_STROKE \/ 2\}/g, 'r="2.4"')
  .replace(/r=\{2\.35\}/g, 'r="2.35"')
  .replace(/([a-zA-Z]+)=\{(\d+(?:\.\d+)?)\}/g, '$1="$2"')
  .replace(/strokeLinecap=/g, "stroke-linecap=")
  .replace(/strokeLinejoin=/g, "stroke-linejoin=")
  .replace(/dominantBaseline=/g, "dominant-baseline=")
  .replace(/letterSpacing=/g, "letter-spacing=");

const block = body.match(/<g class="vinny-wordmark__letters"[^>]*>([\s\S]*)<\/g>\s*<\/svg>/)?.[1];
if (!block || !fs.existsSync(refPath)) {
  console.error("Missing SVG or reference");
  process.exit(1);
}
const lettersInner = block.trim();
const viewBox = "0 0 162 56";
const refData = fs.readFileSync(refPath).toString("base64");
const o = VINNY_WORDMARK_OVERLAY;
const clip = `inset(${o.clipTop * 100}% ${o.clipRight * 100}% ${o.clipBottom * 100}% ${o.clipLeft * 100}%)`;

const svgInner = `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%;color:#0c0b0a">${lettersInner}</svg>`;

const compareHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
body{margin:0;font-family:system-ui,sans-serif;background:#fff;}
.row{display:flex;align-items:center;gap:28px;padding:24px 32px;}
.panel{text-align:center;}
.panel p{margin:0 0 8px;font-size:12px;color:#444;text-transform:uppercase;letter-spacing:.08em;}
.mark{height:92px;width:auto;display:block;margin:0 auto;}
svg.mark{color:#0c0b0a;}
</style></head><body><div class="row">
<div class="panel"><p>Reference (v2 crop)</p><img class="mark" style="clip-path:${clip}" src="data:image/png;base64,${refData}"/></div>
<div class="panel"><p>SVG (flat)</p>${svgInner.replace('style="display:block;width:100%;height:100%;','class="mark" style="height:92px;width:auto;' )}</div>
</div></body></html>`;

const overlayHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
body{margin:0;background:#e8e4dc;}
.stack{position:relative;width:720px;height:200px;margin:24px auto;}
.base{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;clip-path:${clip};}
.over{position:absolute;left:${o.svgPadLeft * 100}%;top:${o.svgPadTop * 100}%;width:${o.svgWidth * 100}%;height:92%;opacity:.52;color:#0c0b0a;}
</style></head><body>
<div class="stack">
<img class="base" src="data:image/png;base64,${refData}" alt="ref"/>
<div class="over">${svgInner}</div>
</div></body></html>`;

const comparePath = path.join(root, ".tmp-wordmark-v4-compare.html");
const overlayPath = path.join(root, ".tmp-wordmark-v4-overlay.html");
fs.writeFileSync(comparePath, compareHtml.replace('class="mark" style="height:92px;width:auto;','style="display:block;height:92px;width:auto;color:#0c0b0a;'));
// fix compare svg markup
const compareFixed = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
body{margin:0;font-family:system-ui,sans-serif;background:#fff;}
.row{display:flex;align-items:center;gap:28px;padding:24px 32px;}
.panel{text-align:center;}
.panel p{margin:0 0 8px;font-size:12px;color:#444;text-transform:uppercase;letter-spacing:.08em;}
.crop{height:92px;width:auto;display:block;margin:0 auto;clip-path:${clip};}
svg.mark{height:92px;width:auto;display:block;margin:0 auto;color:#0c0b0a;}
</style></head><body><div class="row">
<div class="panel"><p>Reference (v2 crop)</p><img class="crop" src="data:image/png;base64,${refData}"/></div>
<div class="panel"><p>SVG (flat)</p><svg class="mark" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">${lettersInner}</svg></div>
</div></body></html>`;
fs.writeFileSync(comparePath, compareFixed);
fs.writeFileSync(overlayPath, overlayHtml);

const pw = "npx --yes playwright@1.49.1 screenshot --browser=chromium";
execSync(`${pw} --viewport-size=920,180 "file://${comparePath}" "${compareOut}"`, { stdio: "inherit" });
execSync(`${pw} --viewport-size=800,260 "file://${overlayPath}" "${overlayOut}"`, { stdio: "inherit" });
fs.unlinkSync(comparePath);
fs.unlinkSync(overlayPath);
console.log("Wrote", compareOut, overlayOut);