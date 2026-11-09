import "server-only";
import specialsFile from "../../content/specials.json";

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export type Special = {
  day: Weekday;
  offer: string;
};

const EMPTY_OFFER = "TODO";

function blankWeek(): Special[] {
  return WEEKDAYS.map((day) => ({ day, offer: EMPTY_OFFER }));
}

function offerFor(value: unknown): string {
  if (typeof value !== "string") return EMPTY_OFFER;
  const trimmed = value.trim();
  return trimmed || EMPTY_OFFER;
}

function fromUnknown(parsed: unknown): Special[] {
  const byDay = new Map<string, string>();
  if (Array.isArray(parsed)) {
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const day = "day" in row ? String(row.day) : "";
      const offer = "offer" in row ? offerFor(row.offer) : EMPTY_OFFER;
      if (day) byDay.set(day, offer);
    }
  } else if (parsed && typeof parsed === "object") {
    for (const [day, offer] of Object.entries(parsed)) {
      byDay.set(day, offerFor(offer));
    }
  }
  return WEEKDAYS.map((day) => ({ day, offer: byDay.get(day) || EMPTY_OFFER }));
}

export function readSpecials(): Special[] {
  try {
    return fromUnknown(specialsFile);
  } catch {
    return blankWeek();
  }
}
