#!/usr/bin/env node
/** Crop black "Vinny's" from menu header art; transparent background. */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const menu = path.resolve("/cursor/stores/self/media/vinnys-menu-logomark.png");
const outRepo = path.join(root, "public/brand/vinnys-wordmark.png");
const outStore = path.resolve("/cursor/stores/self/media/vinnys-wordmark-menu-crop.png");
const work = path.join(root, ".wordmark-trace");

if (!fs.existsSync(menu)) {
  console.error("Missing menu reference:", menu);
  process.exit(1);
}

fs.mkdirSync(work, { recursive: true });
fs.mkdirSync(path.dirname(outRepo), { recursive: true });

const crop = path.join(work, "menu-vinnys-crop-raw.png");
/** Center band: Vinny's script only (no LUNCH MENU, BAR GRILL, DAILY). */
execSync(
  `convert "${menu}" -crop 65%x52%+17%x4% +repage -trim +repage "${crop}"`,
  { stdio: "inherit" },
);

/** Ink → alpha: black letters opaque, paper transparent. */
const trans = path.join(work, "menu-vinnys-crop-alpha.png");
execSync(
  `convert "${crop}" \\( +clone -colorspace Gray -negate \\) -alpha off -compose CopyOpacity -composite "${trans}"`,
  { stdio: "pipe" },
);

for (const dest of [outRepo, outStore]) {
  fs.copyFileSync(trans, dest);
}

const dim = execSync(`identify -format "%w %h" "${outRepo}"`, { encoding: "utf8" }).trim();
console.log("Wrote", outRepo);
console.log("Wrote", outStore, dim);