#!/usr/bin/env node
/** Full-framed mark proof after y/s glyph retrace (not final product). */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { assertOuterBorderBackground } from "./lib/mark-border-check.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const markOut = path.resolve("/cursor/stores/self/media/vinnys-wordmark-v8-mark.png");
const work = path.join(root, ".wordmark-trace");
const pw = "npx --yes playwright@1.49.1 screenshot --browser=chromium";

execSync(`node "${path.join(root, "scripts/trace-menu-wordmark.mjs")}"`, { stdio: "inherit" });

const mod = await import(pathToFileURL(path.join(root, "src/lib/vinny-wordmark-menu-paths.ts")).href);
const { VINNY_MENU_TRACE_VIEWBOX, VINNY_MENU_TRACE_TRANSFORM, VINNY_MENU_TRACE_PATHS } = mod;
const [, , vbW, vbH] = VINNY_MENU_TRACE_VIEWBOX.split(/\s+/).map(Number);

const pathsInner = VINNY_MENU_TRACE_PATHS.map((d) => `<path d="${d}"/>`).join("");
const pxW = Math.ceil(vbW * 2);
const pxH = Math.ceil(vbH * 2);

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
  *{margin:0;padding:0;}
  html,body{width:${pxW}px;height:${pxH}px;background:#fff;overflow:hidden;}
  svg{display:block;width:${pxW}px;height:${pxH}px;background:#fff;}
</style></head><body><svg xmlns="http://www.w3.org/2000/svg"
  viewBox="${VINNY_MENU_TRACE_VIEWBOX}" width="${pxW}" height="${pxH}">
  <rect width="100%" height="100%" fill="#fff"/>
  <g fill="#0c0b0a" transform="${VINNY_MENU_TRACE_TRANSFORM}">${pathsInner}</g>
</svg></body></html>`;

const htmlPath = path.join(work, "v8-mark.html");
fs.writeFileSync(htmlPath, html);
execSync(`${pw} --viewport-size=${pxW},${pxH} "file://${htmlPath}" "${markOut}"`, { stdio: "inherit" });
fs.unlinkSync(htmlPath);

assertOuterBorderBackground(markOut, 4);
console.log("Wrote", markOut, "viewBox", VINNY_MENU_TRACE_VIEWBOX);