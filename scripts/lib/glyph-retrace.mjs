import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** Crops from menu-vinnys-trim that isolate y (with descender) and s ink. */
const Y_KEEP = { x0: 555, y0: 42, x1: 642, y1: 110 };
const S_KEEP = { x0: 600, y0: 52, x1: 682, y1: 110 };
export function maskAndTraceGlyph(workDir, trimPng, id, keep, scale = 1) {
  const masked = path.join(workDir, `${id}-masked.png`);
  const scaled = path.join(workDir, `${id}-scaled.png`);
  const pbm = path.join(workDir, `${id}-glyph.pbm`);
  const svg = path.join(workDir, `${id}-glyph.svg`);

  const w = keep.x1 - keep.x0;
  const h = keep.y1 - keep.y0;
  execSync(
    `convert "${trimPng}" -colorspace Gray -threshold 50% -type bilevel -crop ${w}x${h}+${keep.x0}+${keep.y0} +repage "${masked}"`,
    { stdio: "pipe" },
  );
  execSync(`convert "${masked}" -filter point -resize ${scale * 100}% "${scaled}"`, { stdio: "pipe" });
  execSync(
    `convert "${scaled}" -colorspace Gray -threshold 55% -negate -negate -type bilevel "${pbm}"`,
    { stdio: "pipe" },
  );
  execSync(`potrace "${pbm}" -s -o "${svg}" --flat -t 0.35 -a 0.25`, { stdio: "pipe" });
  const paths = [...fs.readFileSync(svg, "utf8").matchAll(/<path d="([^"]+)"/gs)].map((m) =>
    m[1].replace(/\s+/g, " ").trim(),
  );
  const dx = keep.x0 * 10;
  return splitPotraceSubpaths(paths).map((d) => rescaleAndOffsetPath(d, dx, scale));
}

/** Potrace may emit multiple M movetos in one d; split into separate paths. */
function splitPotraceSubpaths(paths) {
  const out = [];
  for (const d of paths) {
    const parts = d.split(/(?=M)/).map((p) => p.trim()).filter(Boolean);
    out.push(...parts);
  }
  return out;
}

function rescaleAndOffsetPath(d, dx, scale) {
  if (scale === 1) {
    return d.replace(/\bM\s*([-\d.]+)\s+([-\d.]+)/g, (_, x, y) => `M${Number(x) + dx} ${y}`);
  }
  const scaled = d.replace(/[-\d.]+/g, (n) => String(Number(n) / scale));
  return scaled.replace(/\bM\s*([-\d.]+)\s+([-\d.]+)/g, (_, x, y) => `M${Number(x) + dx} ${y}`);
}

function pathStartScreenX(d) {
  const m = d.match(/^M\s*([-\d.]+)/);
  return m ? Number(m[1]) / 10 : 0;
}

function pathInScreenBand(d, x0, x1) {
  const sx = pathStartScreenX(d);
  return sx >= x0 && sx <= x1;
}

export function patchYandSPaths(workDir, trimPng, allPaths) {
  const yPaths = maskAndTraceGlyph(workDir, trimPng, "y", Y_KEEP, 2).filter((p) =>
    pathInScreenBand(p, Y_KEEP.x0 - 3, Y_KEEP.x1 + 3),
  );
  const sPaths = maskAndTraceGlyph(workDir, trimPng, "s", S_KEEP, 4).filter((p) =>
    pathInScreenBand(p, S_KEEP.x0 - 5, S_KEEP.x1 + 5),
  );
  if (!yPaths.length || !sPaths.length) {
    throw new Error(`Glyph retrace failed (y=${yPaths.length}, s=${sPaths.length})`);
  }

  const dropIdx = new Set([3, 6, 8, 9]);
  const kept = allPaths.filter((_, idx) => !dropIdx.has(idx));

  return [...kept, ...yPaths, ...sPaths];
}

export { Y_KEEP, S_KEEP };