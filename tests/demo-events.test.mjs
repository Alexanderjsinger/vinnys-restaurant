import assert from "node:assert/strict";
import { test } from "node:test";
import { demoEventsEnabled, makeDemoEvents } from "../src/lib/demo-events.ts";

test("demo event fixtures require an explicit local development opt-in", () => {
  assert.equal(demoEventsEnabled({ NODE_ENV: "production", VINNYS_DEMO_EVENTS: "1" }), false);
  assert.equal(demoEventsEnabled({ NODE_ENV: "test", VINNYS_DEMO_EVENTS: "1" }), false);
  assert.equal(demoEventsEnabled({ NODE_ENV: "development" }), false);
  assert.equal(demoEventsEnabled({ NODE_ENV: "development", VINNYS_DEMO_EVENTS: "1" }), true);
});
test("demo week has five dated concepts and never fabricates prices or booking actions", () => {
  const events = makeDemoEvents("2026-11-15");
  assert.equal(events.length, 5);
  assert.equal(events[0].starts_at, "2026-11-16T19:00");
  assert.equal(events[4].starts_at, "2026-11-20T19:00");
  assert.ok(events.every(event => event.is_sample && event.id < 0 && !event.price && !event.next_step));
});
