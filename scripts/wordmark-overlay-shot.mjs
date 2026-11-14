#!/usr/bin/env node
/** Menu-reference overlay + compare (v5). Usage: node scripts/wordmark-overlay-shot.mjs */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const menu = path.resolve("/cursor/stores/self/media/vinnys-menu-logomark.png");
const overlayOut = path.resolve("/cursor/stores/self/media/vinnys-wordmark-v5-overlay.png");
const compareOut = path.resolve("/cursor/stores/self/media/vinnys-wordmark-v5-compare.png");
const work = path.join(root, ".wordmark-trace");

execSync(`node "${path.join(root, "scripts/trace-menu-wordmark.mjs")}"`, { stdio: "inherit" });

const trim = path.join(work, "menu-vinnys-trim.png");
const { VINNY_MENU_TRACE_VIEWBOX, VINNY_MENU_TRACE_TRANSFORM, VINNY_MENU_TRACE_PATHS } = await import(
  pathToFileURL(path.join(root, "src/lib/vinny-wordmark-menu-paths.ts")).href,
);

const pathsSvg = VINNY_MENU_TRACE_PATHS.map((d) => `<path d="${d}"/>`).join("\n");
const svg = `<svg viewBox="${VINNY_MENU_TRACE_VIEWBOX}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%;color:#0c0b0a"><g fill="currentColor" transform="${VINNY_MENU_TRACE_TRANSFORM}">${pathsSvg}</g></svg>`;

const trimData = fs.readFileSync(trim).toString("base64");
const menuData = fs.readFileSync(menu).toString("base64");

const compareHtml = `<!DOCTYPE html><html><head><style>
body{margin:0;background:#fff;font-family:system-ui,sans-serif;}
.row{display:flex;gap:32px;padding:24px;align-items:center;}
p{margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#444;}
img,.svgbox{height:110px;width:auto;display:block;}
</style></head><body><div class="row">
<div><p>Menu crop (trace source)</p><img src="data:image/png;base64,${trimData}" alt="crop"/></div>
<div><p>Potrace SVG</p><div class="svgbox">${svg}</div></div>
</div></body></html>`;

const overlayHtml = `<!DOCTYPE html><html><head><style>
body{margin:0;background:#f4f4f4;}
.stack{position:relative;width:682px;height:110px;margin:32px auto;}
.base{display:block;width:100%;height:100%;}
.over{position:absolute;inset:0;opacity:.5;pointer-events:none;}
</style></head><body>
<div class="stack">
<img class="base" src="data:image/png;base64,${trimData}" alt="menu"/>
<div class="over">${svg}</div>
</div>
<p style="text-align:center;font:12px system-ui;color:#666">Full menu reference (context)</p>
<img src="data:image/png;base64,${menuData}" style="display:block;max-width:90%;margin:12px auto;" alt="full menu"/>
</body></html>`;

const cPath = path.join(root, ".tmp-v5-compare.html");
const oPath = path.join(root, ".tmp-v5-overlay.html");
fs.writeFileSync(cPath, compareHtml);
fs.writeFileSync(oPath, overlayHtml);
const pw = "npx --yes playwright@1.49.1 screenshot --browser=chromium";
execSync(`${pw} --viewport-size=960,200 "file://${cPath}" "${compareOut}"`, { stdio: "inherit" });
execSync(`${pw} --viewport-size=760,520 "file://${oPath}" "${overlayOut}"`, { stdio: "inherit" });
fs.unlinkSync(cPath);
fs.unlinkSync(oPath);
console.log("Wrote", compareOut, overlayOut);