import type { ProviderId } from "./types";

export const PROVIDERS: { id: ProviderId; label: string }[] = [
  { id: "none", label: "None" },
  { id: "toast", label: "Toast Tables" },
  { id: "opentable", label: "OpenTable" },
  { id: "resy", label: "Resy" },
];

export function parseProvider(value: string): ProviderId {
  if (value === "toast" || value === "opentable" || value === "resy") return value;
  return "none";
}

export function providerLabel(id: ProviderId): string {
  return PROVIDERS.find((item) => item.id === id)?.label ?? "None";
}

export function cleanText(value: FormDataEntryValue | null, max: number): string {
  return String(value ?? "")
    .replace(/\0/g, "")
    .trim()
    .slice(0, max);
}

export function asId(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "");
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function normalizeTime(value: string): string | null {
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour === 24 && minute === 0) return "24:00";
  if (hour > 23 || minute > 59) return null;
  return `${match[1]}:${match[2]}`;
}

export function normalizeDateTime(value: string): string | null {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  if (!isValidDate(match[1])) return null;
  const time = normalizeTime(`${match[2]}:${match[3]}`);
  if (!time || time === "24:00") return null;
  return `${match[1]}T${time}`;
}

export function cleanEventPhoto(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/events/") && !trimmed.includes("..") && !trimmed.includes("\\")) return trimmed;
  return safeHttpUrl(trimmed);
}

export function safeHttpUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function hostLabel(value: string): string {
  try {
    return new URL(value).host;
  } catch {
    return value;
  }
}

export function phoneHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `tel:+${digits}`;
  if (digits.length >= 7) return `tel:${digits}`;
  return null;
}

export function mapUrl(address: string): string | null {
  const query = address.trim();
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function formatTime(value: string): string {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) return value;
  let hour = Number(match[1]);
  const minute = match[2];
  if (hour === 24) hour = 0;
  const suffix = hour >= 12 ? "p.m." : "a.m.";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${suffix}`;
}

export function formatLongDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return value;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatEventStart(value: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/.exec(value);
  if (!match) return value;
  const date = new Date(Date.UTC(
    Number(match[1].slice(0, 4)),
    Number(match[1].slice(5, 7)) - 1,
    Number(match[1].slice(8, 10)),
  ));
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
  if (!match[2]) return dateLabel;
  return `${dateLabel} · ${formatTime(match[2])}`;
}

export function normalizePrice(value: string, required: boolean): string | null {
  const trimmed = value.trim().replace(/^\$/, "");
  if (!trimmed) return required ? null : "";
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  return trimmed;
}

export function detroitNowLocal(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Detroit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export function formatPrice(price: string): string {
  const trimmed = price.trim();
  if (!trimmed) return "";
  if (/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    const amount = Number(trimmed);
    const whole = Number.isInteger(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(amount);
  }
  return trimmed;
}

export function detroitToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Detroit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function eventDate(value: string): string {
  return value.slice(0, 10);
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Detroit",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200;
}

export function sameOriginPost(request: Request): boolean {
  const requestHost = (() => {
    try {
      return new URL(request.url).host;
    } catch {
      return "";
    }
  })();
  if (!requestHost) return false;

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === requestHost;
    } catch {
      return false;
    }
  }
  // Browsers usually send Origin on cross-site POSTs. When Origin is absent,
  // require same-origin/same-site Sec-Fetch-Site; if that is also absent, trust
  // Referer when present; allow non-browser tooling that sends none of these.
  const site = (request.headers.get("sec-fetch-site") || "").toLowerCase();
  if (site) {
    return site === "same-origin" || site === "same-site" || site === "none";
  }
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === requestHost;
    } catch {
      return false;
    }
  }
  return true;
}
