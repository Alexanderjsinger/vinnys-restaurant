import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { assertOuterBorderBackground } from "../scripts/lib/mark-border-check.mjs";

const v7 = path.resolve("/cursor/stores/self/media/vinnys-wordmark-v7-mark.png");
const v8 = path.resolve("/cursor/stores/self/media/vinnys-wordmark-v8-mark.png");

test("v7 mark PNG has 4px background-only border", { skip: !fs.existsSync(v7) }, () => {
  const { width, height } = assertOuterBorderBackground(v7, 4);
  assert.ok(width >= 400 && height >= 100, "mark dimensions");
});

test("v8 mark PNG has 4px background-only border", { skip: !fs.existsSync(v8) }, () => {
  assertOuterBorderBackground(v8, 4);
});