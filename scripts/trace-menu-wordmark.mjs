#!/usr/bin/env node
/**
 * Trace flat black "Vinny's" from menu reference via potrace; writes path module + raw SVG.
 * Usage: node scripts/trace-menu-wordmark.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { boundsAfterPotraceTransform } from "./lib/path-viewbox.mjs";
import { patchYandSPaths } from "./lib/glyph-retrace.mjs";

const DISPLAY_VIEWBOX_PAD = 16;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const menu = path.resolve("/cursor/stores/self/media/vinnys-menu-logomark.png");
const work = path.join(root, ".wordmark-trace");

if (!fs.existsSync(menu)) {
  console.error("Missing menu reference:", menu);
  process.exit(1);
}

fs.mkdirSync(work, { recursive: true });

execSync(
  `convert "${menu}" -crop 65%x52%+17%x4% +repage -trim +repage "${work}/menu-vinnys-trim.png"`,
  { stdio: "inherit" },
);
execSync(
  `convert "${work}/menu-vinnys-trim.png" -colorspace Gray -threshold 55% -negate -negate -type bilevel "${work}/menu-letters.pbm"`,
  { stdio: "inherit" },
);
execSync(
  `potrace "${work}/menu-letters.pbm" -s -o "${work}/menu-trace-group.svg" --flat -t 1 -a 0.5 --group`,
  { stdio: "inherit" },
);

const raster = parseIdentify(`${work}/menu-vinnys-trim.png`);
const svg = fs.readFileSync(`${work}/menu-trace-group.svg`, "utf8");
const transformMatch = svg.match(
  /<g transform="translate\(0\.000000,([0-9.]+)\) scale\(0\.100000,-0\.100000\)"/,
);
const traceHeight = transformMatch ? Number(transformMatch[1]) : raster.height;
const paths = [...svg.matchAll(/<path d="([^"]+)"\s*\/>/g)].map((m) => m[1].replace(/\s+/g, " ").trim());

if (paths.length < 5) {
  console.error("Expected multiple letter paths, got", paths.length);
  process.exit(1);
}

const trimPng = path.join(work, "menu-vinnys-trim.png");
const pathsPatched = patchYandSPaths(work, trimPng, paths);

const transform = `translate(0, ${traceHeight}) scale(0.1, -0.1)`;
const inkBBox = measureInkBBox(pathsPatched, transform, work);
const pathBBox = boundsAfterPotraceTransform(pathsPatched, traceHeight, 0.1);
const pad = DISPLAY_VIEWBOX_PAD;
const minX = Math.floor(Math.min(pathBBox.minX, inkBBox.x) - pad);
const minY = Math.floor(Math.min(pathBBox.minY, inkBBox.y) - pad);
const maxX = Math.ceil(Math.max(pathBBox.maxX, inkBBox.x + inkBBox.width) + pad);
const maxY = Math.ceil(Math.max(pathBBox.maxY, inkBBox.y + inkBBox.height) + pad);
const viewW = maxX - minX;
const viewH = maxY - minY;
const viewBox = `${minX} ${minY} ${viewW} ${viewH}`;

const outTs = path.join(root, "src/lib/vinny-wordmark-menu-paths.ts");
const body = `/** Auto-generated from vinnys-menu-logomark.png — do not hand-edit; re-run scripts/trace-menu-wordmark.mjs */
export const VINNY_MENU_TRACE_VIEWBOX = "${viewBox}" as const;
/** Potrace bitmap coords — use for pixel-aligned overlay on menu-vinnys-trim (${raster.width}×${raster.height}). */
export const VINNY_MENU_TRACE_REGISTER_VIEWBOX = "0 0 ${raster.width} ${raster.height}" as const;
export const VINNY_MENU_TRACE_TRANSFORM = ${JSON.stringify(transform)} as const;
export const VINNY_MENU_TRACE_PATHS: readonly string[] = [
${pathsPatched.map((p) => `  ${JSON.stringify(p)},`).join("\n")}
] as const;
`;

fs.writeFileSync(outTs, body);

/** Store flat svg with measured viewBox for inspection */
const flatSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${viewW}" height="${viewH}">
<g fill="#000" transform="${transform}">
${pathsPatched.map((d) => `<path d="${d}"/>`).join("\n")}
</g>
</svg>`;
fs.writeFileSync(path.join(root, "public/brand/vinny-menu-wordmark-trace.svg"), flatSvg);

console.log(
  `Wrote ${pathsPatched.length} paths (${paths.length} raw + y/s retrace) → ${outTs} (raster ${raster.width}×${raster.height}, viewBox ${viewBox})`,
);

function parseIdentify(file) {
  const line = execSync(`identify -format "%w %h" "${file}"`, { encoding: "utf8" }).trim();
  const [width, height] = line.split(/\s+/).map(Number);
  return { width, height };
}

/** Rasterize on a generous canvas so cubic overshoot is not clipped before trim. */
function measureInkBBox(pathList, transformAttr, workDir) {
  const pathsHtml = pathList.map((d) => `<path d="${d}"/>`).join("");
  const measureSvg = path.join(workDir, "measure-bbox.svg");
  const measurePng = path.join(workDir, "measure-bbox.png");
  const canvasW = 720;
  const canvasH = 150;
  fs.writeFileSync(
    measureSvg,
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="-20 -20 ${canvasW} ${canvasH}" overflow="visible">
<g fill="black" transform="${transformAttr}">${pathsHtml}</g>
</svg>`,
  );
  execSync(`convert -background white "${measureSvg}" "${measurePng}"`, { stdio: "pipe" });
  const trimLine = execSync(`convert "${measurePng}" -fuzz 1% -trim -format "%w %h %X %Y" info:`, {
    encoding: "utf8",
  }).trim();
  const [w, h, x, y] = trimLine.split(/\s+/).map((part) => Number(part.replace(/^\+/, "")));
  if (!w || !h) {
    throw new Error(`Could not measure ink bounds from ${measurePng}`);
  }
  return { x, y, width: w, height: h };
}