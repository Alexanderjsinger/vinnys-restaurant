#!/usr/bin/env node
/** v6 proof shots: full-glyph mark + registered menu overlay. */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const storeMedia = path.resolve("/cursor/stores/self/media");
const markOut = path.join(storeMedia, "vinnys-wordmark-v6-mark.png");
const overlayOut = path.join(storeMedia, "vinnys-wordmark-v6-overlay.png");
const work = path.join(root, ".wordmark-trace");
const pw = "npx --yes playwright@1.49.1 screenshot --browser=chromium";

execSync(`node "${path.join(root, "scripts/trace-menu-wordmark.mjs")}"`, { stdio: "inherit" });

const mod = await import(pathToFileURL(path.join(root, "src/lib/vinny-wordmark-menu-paths.ts")).href);
const {
  VINNY_MENU_TRACE_VIEWBOX,
  VINNY_MENU_TRACE_REGISTER_VIEWBOX,
  VINNY_MENU_TRACE_TRANSFORM,
  VINNY_MENU_TRACE_PATHS,
} = mod;

const [, , vbW, vbH] = VINNY_MENU_TRACE_VIEWBOX.split(/\s+/).map(Number);
const trimPath = path.join(work, "menu-vinnys-trim.png");
const [trimW, trimH] = execSync(`identify -format "%w %h" "${trimPath}"`, { encoding: "utf8" })
  .trim()
  .split(/\s+/)
  .map(Number);

const pathsInner = VINNY_MENU_TRACE_PATHS.map((d) => `<path d="${d}"/>`).join("");

const markWidth = Math.ceil(vbW * 2);
const markHeight = Math.ceil(vbH * 2);

const markHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
  html,body{margin:0;width:${markWidth}px;height:${markHeight}px;background:#fff;overflow:visible;}
  svg{display:block;overflow:visible;}
</style></head><body><svg xmlns="http://www.w3.org/2000/svg"
  viewBox="${VINNY_MENU_TRACE_VIEWBOX}" width="${markWidth}" height="${markHeight}"
  overflow="visible"><g fill="#0c0b0a" transform="${VINNY_MENU_TRACE_TRANSFORM}">${pathsInner}</g></svg></body></html>`;

const trimB64 = fs.readFileSync(trimPath).toString("base64");
const overlayHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
  html,body{margin:0;width:${trimW}px;height:${trimH}px;background:#fff;}
  .stack{position:relative;width:${trimW}px;height:${trimH}px;}
  .stack img{display:block;width:${trimW}px;height:${trimH}px;}
  .stack svg{position:absolute;inset:0;width:${trimW}px;height:${trimH}px;opacity:.5;overflow:visible;}
</style></head><body><div class="stack">
<img src="data:image/png;base64,${trimB64}" width="${trimW}" height="${trimH}" alt=""/>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VINNY_MENU_TRACE_REGISTER_VIEWBOX}" width="${trimW}" height="${trimH}" overflow="visible">
<g fill="#b91c1c" transform="${VINNY_MENU_TRACE_TRANSFORM}">${pathsInner}</g>
</svg></div></body></html>`;

const markHtmlPath = path.join(work, "v6-mark.html");
const overlayHtmlPath = path.join(work, "v6-overlay.html");
fs.writeFileSync(markHtmlPath, markHtml);
fs.writeFileSync(overlayHtmlPath, overlayHtml);

execSync(`${pw} --viewport-size=${markWidth},${markHeight} "file://${markHtmlPath}" "${markOut}"`, {
  stdio: "inherit",
});
execSync(`${pw} --viewport-size=${trimW},${trimH} "file://${overlayHtmlPath}" "${overlayOut}"`, {
  stdio: "inherit",
});

fs.unlinkSync(markHtmlPath);
fs.unlinkSync(overlayHtmlPath);

console.log("Wrote", markOut);
console.log("Wrote", overlayOut);
console.log("viewBox", VINNY_MENU_TRACE_VIEWBOX, "register", VINNY_MENU_TRACE_REGISTER_VIEWBOX);