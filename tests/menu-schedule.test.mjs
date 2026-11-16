import assert from "node:assert/strict";
import { test } from "node:test";
import { menuForEasternTime } from "../src/lib/menu-schedule.ts";

test("Eastern menu boundaries select Lunch, Happy Hour, Dinner and off-hours fallback", () => {
  for (const [utc, expected] of [
    ["2026-11-15T15:59:00Z", "lunch"],
    ["2026-11-15T16:00:00Z", "lunch"],
    ["2026-11-15T19:59:00Z", "lunch"],
    ["2026-11-15T20:00:00Z", "happy-hour"],
    ["2026-11-15T21:59:00Z", "happy-hour"],
    ["2026-11-15T22:00:00Z", "dinner"],
    ["2026-11-16T03:59:00Z", "dinner"],
    ["2026-11-16T04:00:00Z", "lunch"],
    ["2026-11-16T05:00:00Z", "lunch"],
  ]) assert.equal(menuForEasternTime(new Date(utc)), expected, utc);
});
test("Eastern menu selection follows daylight saving offsets, not the server zone", () => {
  assert.equal(menuForEasternTime(new Date("2026-07-15T19:00:00Z")), "happy-hour");
  assert.equal(menuForEasternTime(new Date("2026-11-15T19:00:00Z")), "lunch");
  assert.equal(menuForEasternTime(new Date("2026-07-15T21:00:00Z")), "dinner");
});
