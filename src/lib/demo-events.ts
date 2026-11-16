import type { EventRow } from "@/lib/types";

/** Local opt-in stays separate from the host-scoped staging switch. */
export function demoEventsEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.NODE_ENV === "development" && env.VINNYS_DEMO_EVENTS === "1";
}

export const DEMO_STAGING_HOST = "vinnys-bar-grill.toastisadog.workers.dev";

/** A production build can show concepts only on the designated staging host. */
export function stagingDemoEventsEnabled(flag: unknown, host: string): boolean {
  return flag === "1" && host.toLowerCase() === DEMO_STAGING_HOST;
}

export function makeDemoEvents(today: string): EventRow[] {
  const monday = new Date(`${today}T12:00:00Z`);
  monday.setUTCDate(monday.getUTCDate() + ((8 - monday.getUTCDay()) % 7 || 7));
  const concepts = [
    ["Monday: Trivia & Table Games", "Bring your team for two hours of pub trivia, music bingo, or board games. A relaxed start to the week, with friendly competition around the table."],
    ["Tuesday: Acoustic Evenings", "An intimate evening built around acoustic music and conversation. A concept for featuring local soloists alongside dinner."],
    ["Wednesday: Open Mic at Vinny’s", "A welcoming stage for local voices, original songs, and first-time performers. A midweek concept for the Ypsilanti and EMU community."],
    ["Thursday: Themed Dinner Night", "A rotating dinner theme to bring people together around the table. Taco and pasta nights are ideas for the owner to explore; menu details are not confirmed."],
    ["Friday: Game Night at Vinny’s", "Gather your group and cheer on your team. A sports-viewing concept; games, viewing arrangements, food offers, and drink specials are not confirmed."],
  ];
  return concepts.map(([title, blurb], index) => {
    const date = new Date(monday);
    date.setUTCDate(date.getUTCDate() + index);
    const day = date.toISOString().slice(0, 10);
    return { id: -(index + 1), title, blurb, starts_at: `${day}T19:00`, ends_at: `${day}T21:00`, is_sample: true, price: "", photo: "", next_step: "", status: "published", updated_at: "", published_at: "" };
  });
}
