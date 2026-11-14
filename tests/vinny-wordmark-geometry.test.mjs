import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const root = path.resolve(import.meta.dirname, "..");

function readPngIhdr(filePath) {
  const buf = fs.readFileSync(filePath);
  assert.equal(buf.toString("hex", 0, 8), "89504e470d0a1a0a", "PNG signature");
  assert.equal(buf.toString("ascii", 12, 16), "IHDR", "IHDR chunk");
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf[25];
  const hasAlpha = colorType === 4 || colorType === 6;
  return { width, height, hasAlpha };
}

function readCropSizeFromTs() {
  const src = fs.readFileSync(path.join(root, "src/lib/vinny-wordmark-geometry.ts"), "utf8");
  const m = src.match(/width:\s*(\d+),\s*height:\s*(\d+)/);
  assert.ok(m, "VINNY_WORDMARK_CROP_SIZE in geometry module");
  return { width: Number(m[1]), height: Number(m[2]) };
}

test("wordmark raster asset exists in public", () => {
  const asset = path.join(root, "public/brand/vinnys-wordmark.png");
  const expected = readCropSizeFromTs();
  assert.ok(fs.existsSync(asset), "public/brand/vinnys-wordmark.png");
  const info = readPngIhdr(asset);
  assert.equal(info.width, expected.width);
  assert.equal(info.height, expected.height);
  assert.ok(info.hasAlpha, "transparent background");
});

test("store menu crop copy exists", () => {
  const store = "/cursor/stores/self/media/vinnys-wordmark-menu-crop.png";
  if (!fs.existsSync(store)) return;
  const expected = readCropSizeFromTs();
  const info = readPngIhdr(store);
  assert.equal(info.width, expected.width);
  assert.equal(info.height, expected.height);
  assert.ok(info.hasAlpha);
});

test("VinnyWordmark uses raster image not potrace paths", () => {
  const src = fs.readFileSync(path.join(root, "src/components/VinnyWordmark.tsx"), "utf8");
  assert.match(src, /\/brand\/vinnys-wordmark\.png/);
  assert.match(src, /<img/);
  assert.doesNotMatch(src, /VINNY_MENU_TRACE_PATHS|<path|viewBox/i);
});

test("extract script reads owner reference", () => {
  const script = fs.readFileSync(path.join(root, "scripts/extract-menu-wordmark.mjs"), "utf8");
  assert.match(script, /vinnys-wordmark-owner-crop\.png/);
  assert.match(script, /public\/brand\/vinnys-wordmark\.png/);
});