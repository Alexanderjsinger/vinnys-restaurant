import "server-only";
import { headers } from "next/headers";
import { demoEventsEnabled, stagingDemoEventsEnabled } from "./demo-events";

export async function showDemoEvents(): Promise<boolean> {
  if (process.env.NODE_ENV === "development" && demoEventsEnabled()) return true;
  const host = (await headers()).get("host") ?? "";
  try {
    const { env } = await import("cloudflare:workers");
    const flag = (env as { VINNYS_STAGING_DEMO_EVENTS?: unknown }).VINNYS_STAGING_DEMO_EVENTS;
    return stagingDemoEventsEnabled(flag, host);
  } catch {
    // Node preview/build has no Workers bindings. Use real public events.
    return false;
  }
}
