export type ServiceMenuId = "lunch" | "happy-hour" | "dinner";

/** Eastern wall-clock boundaries, including daylight saving time. Lunch is the off-hours fallback. */
export function menuForEasternTime(now = new Date()): ServiceMenuId {
  const hour = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Detroit", hour: "2-digit", hourCycle: "h23",
  }).format(now));
  if (hour >= 15 && hour < 17) return "happy-hour";
  if (hour >= 17 && hour < 23) return "dinner";
  return "lunch";
}
