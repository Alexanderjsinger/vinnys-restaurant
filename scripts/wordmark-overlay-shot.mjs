#!/usr/bin/env node
/** Menu-reference overlay + compare (v5 legacy). Prefer: node scripts/wordmark-v6-proof.mjs */
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
const mod = await import(pathToFileURL(path.join(root, "src/lib/vinny-wordmark-menu-paths.ts")).href);
const { VINNY_MENU_TRACE_VIEWBOX, VINNY_MENU_TRACE_TRANSFORM, VINNY_MENU_TRACE_PATHS } = mod;
const [, , vbW, vbH] = VINNY_MENU_TRACE_VIEWBOX.split(/\s+/).map(Number);

const pathsSvg = VINNY_MENU_TRACE_PATHS.map((d) => `<path d="${d}"/>`).join("\n");
const svg = `<svg viewBox="${VINNY_MENU_TRACE_VIEWBOX}" overflow="visible" xmlns="http://www.w3.org/2000/svg" width="${vbW}" height="${vbH}" style="display:block;color:#0c0b0a"><g fill="currentColor" transform="${VINNY_MENU_TRACE_TRANSFORM}">${pathsSvg}</g></svg>`;

const trimData = fs.readFileSync(trim).toString("base64");
const menuData = fs.readFileSync(menu).toString("base64");
const trimMeta = execSync(`identify -format "%w %h" "${trim}"`, { encoding: "utf8" }).trim().split(/\s+/).map(Number);
const [trimW, trimH] = trimMeta;

const compareHtml = `<!DOCTYPE html><html><head><style>
body{margin:0;background:#fff;font-family:system-ui,sans-serif;}
.row{display:flex;gap:32px;padding:24px;align-items:flex-end;}
p{margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#444;}
.panel{display:flex;flex-direction:column;align-items:center;}
img{display:block;}
.svgbox{width:${vbW}px;height:${vbH}px;}
.crop{width:${trimW}px;height:auto;}
</style></head><body><div class="row">
<div class="panel"><p>Menu crop (trace source)</p><img class="crop" src="data:image/png;base64,${trimData}" alt="crop"/></div>
<div class="panel"><p>Potrace SVG (measured viewBox)</p><div class="svgbox">${svg}</div></div>
</div></body></html>`;

const overlayHtml = `<!DOCTYPE html><html><head><style>
body{margin:0;background:#f4f4f4;padding:24px;}
.stack{position:relative;width:${trimW}px;margin:0 auto;}
.base{display:block;width:100%;height:auto;}
.over{position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;opacity:.5;}
.over svg{max-width:100%;height:auto;}
h2{font:600 14px system-ui;text-align:center;margin:0 0 12px;}
.ctx{max-width:100%;display:block;margin:24px auto;}
</style></head><body>
<h2>Vinny's — full mark overlay (registered width)</h2>
<div class="stack">
<img class="base" src="data:image/png;base64,${trimData}" alt="menu crop"/>
<div class="over">${svg}</div>
</div>
<p style="text-align:center;font:12px system-ui;color:#666;margin-top:32px">Full menu sheet (context)</p>
<img class="ctx" src="data:image/png;base64,${menuData}" alt="full menu"/>
</body></html>`;

const cPath = path.join(root, ".tmp-v5-compare.html");
const oPath = path.join(root, ".tmp-v5-overlay.html");
fs.writeFileSync(cPath, compareHtml);
fs.writeFileSync(oPath, overlayHtml);
const pw = "npx --yes playwright@1.49.1 screenshot --browser=chromium";
execSync(`${pw} --viewport-size=980,240 "file://${cPath}" "${compareOut}"`, { stdio: "inherit" });
execSync(`${pw} --viewport-size=920,520 "file://${oPath}" "${overlayOut}"`, { stdio: "inherit" });
fs.unlinkSync(cPath);
fs.unlinkSync(oPath);
console.log("Wrote", compareOut, overlayOut, "viewBox", VINNY_MENU_TRACE_VIEWBOX);