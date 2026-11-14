#!/usr/bin/env node
/** Crop black "Vinny's" from owner reference; transparent background. */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const owner = path.resolve("/cursor/stores/self/media/vinnys-wordmark-owner-crop.png");
const outRepo = path.join(root, "public/brand/vinnys-wordmark.png");
const outStore = path.resolve("/cursor/stores/self/media/vinnys-wordmark-menu-crop.png");
const py = path.join(__dirname, "crop-owner-wordmark.py");

if (!fs.existsSync(owner)) {
  console.error("Missing owner reference:", owner);
  process.exit(1);
}

fs.mkdirSync(path.dirname(outRepo), { recursive: true });

const dim = execFileSync("python3", [py, owner, outRepo, outStore], { encoding: "utf8" }).trim();
const [width, height] = dim.split(/\s+/).map(Number);
console.log("Wrote", outRepo, `${width}x${height}`);
console.log("Wrote", outStore);