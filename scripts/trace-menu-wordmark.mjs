#!/usr/bin/env node
/**
 * Trace flat black "Vinny's" from menu reference via potrace; writes path module + raw SVG.
 * Usage: node scripts/trace-menu-wordmark.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const { width, height } = parseIdentify(`${work}/menu-vinnys-trim.png`);
const svg = fs.readFileSync(`${work}/menu-trace-group.svg`, "utf8");
const paths = [...svg.matchAll(/<path d="([^"]+)"\s*\/>/g)].map((m) => m[1].replace(/\s+/g, " ").trim());

if (paths.length < 5) {
  console.error("Expected multiple letter paths, got", paths.length);
  process.exit(1);
}

const outTs = path.join(root, "src/lib/vinny-wordmark-menu-paths.ts");
const body = `/** Auto-generated from vinnys-menu-logomark.png — do not hand-edit; re-run scripts/trace-menu-wordmark.mjs */
export const VINNY_MENU_TRACE_VIEWBOX = "0 0 ${width} ${height}" as const;
export const VINNY_MENU_TRACE_TRANSFORM = "translate(0, ${height}) scale(0.1, -0.1)" as const;
export const VINNY_MENU_TRACE_PATHS: readonly string[] = [
${paths.map((p) => `  ${JSON.stringify(p)},`).join("\n")}
] as const;
`;

fs.writeFileSync(outTs, body);
fs.copyFileSync(`${work}/menu-trace-group.svg`, path.join(root, "public/brand/vinny-menu-wordmark-trace.svg"));
console.log(`Wrote ${paths.length} paths → ${outTs} (${width}×${height})`);

function parseIdentify(file) {
  const line = execSync(`identify -format "%w %h" "${file}"`, { encoding: "utf8" }).trim();
  const [w, h] = line.split(/\s+/).map(Number);
  return { width: w, height: h };
}