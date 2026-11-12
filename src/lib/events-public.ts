import type { EventRow } from "@/lib/types";

/** Split published public events into upcoming vs earlier relative to Detroit-local `now`. */
export function splitPublicEvents(events: EventRow[], now: string) {
  const upcoming = events.filter((event) => (event.ends_at || event.starts_at) >= now);
  const earlier = events.filter((event) => (event.ends_at || event.starts_at) < now);
  return { upcoming, earlier };
}

export const GUEST_EVENTS_EMPTY_LINE = "No upcoming events are posted right now.";
