import { DEFAULT_PLACE_NAME } from "./brand";
import {
  enqueueNotify,
  getInquiryNotifyStatus,
  getSettings,
  listPendingNotifies,
  markNotifyAttempt,
  markNotifySent,
  recordNotifyFailure,
} from "./content";

const MAX_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 5 * 60 * 1000;

async function readSecret(name: string): Promise<string> {
  const fromProcess = process.env[name]?.trim() ?? "";
  if (fromProcess) return fromProcess;
  try {
    const { env } = await import("cloudflare:workers");
    const value = (env as Record<string, unknown>)[name];
    return typeof value === "string" ? value.trim() : "";
  } catch {
    return "";
  }
}

function ownerRecipient(settings: Awaited<ReturnType<typeof getSettings>>): string {
  return settings.email.value.trim() || settings.notify_email.value.trim();
}

async function sendResend(input: {
  to: string;
  from: string;
  key: string;
  placeName: string;
  inquiry: { id: number; name: string; email: string; eventDate: string; partySize: number; message: string };
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: input.from,
        to: [input.to],
        subject: `New party note for ${input.placeName}`,
        text: [
          `Name: ${input.inquiry.name}`,
          `Email: ${input.inquiry.email}`,
          `Date: ${input.inquiry.eventDate}`,
          `Party size: ${input.inquiry.partySize}`,
          `Note: ${input.inquiry.message}`,
        ].join("\n"),
      }),
    });
    if (!response.ok) return { ok: false, reason: `resend ${response.status}` };
    // Resend accepted the request. This is not a mailbox delivery receipt.
    return { ok: true };
  } catch {
    return { ok: false, reason: "resend-error" };
  }
}

export async function notifyOwner(inquiry: {
  id: number;
  name: string;
  email: string;
  eventDate: string;
  partySize: number;
  message: string;
}) {
  const existing = await getInquiryNotifyStatus(inquiry.id);
  if (existing?.status === "sent") {
    console.log(JSON.stringify({ partyNotify: "skip-duplicate", inquiryId: inquiry.id }));
    return;
  }

  const settings = await getSettings();
  const placeName = settings.restaurant_name.value.trim() || DEFAULT_PLACE_NAME;
  const to = ownerRecipient(settings);
  const key = await readSecret("RESEND_API_KEY");
  const from = await readSecret("RESEND_FROM");
  const reason = !key ? "RESEND_API_KEY is not set" : !from ? "RESEND_FROM is not set" : !to ? "no owner email" : "";
  if (reason) {
    await enqueueNotify(inquiry.id, reason);
    console.log(JSON.stringify({ partyNotify: "queued", reason, inquiryId: inquiry.id }));
    return;
  }

  const result = await sendResend({ to, from, key, placeName, inquiry });
  if (result.ok) {
    await markNotifySent(inquiry.id, "accepted-by-resend");
    console.log(JSON.stringify({ partyNotify: "accepted", inquiryId: inquiry.id }));
    return;
  }
  await enqueueNotify(inquiry.id, result.reason);
  console.log(JSON.stringify({ partyNotify: "queued", reason: result.reason, inquiryId: inquiry.id }));
}

function readyForRetry(row: { attempts: number; last_attempt_at: string; status: string }): boolean {
  if (row.status !== "pending" && row.status !== "failed") return false;
  if (row.attempts >= MAX_ATTEMPTS) return false;
  if (!row.last_attempt_at) return true;
  const last = Date.parse(row.last_attempt_at);
  if (Number.isNaN(last)) return true;
  const wait = Math.min(Math.max(row.attempts, 1) * BASE_BACKOFF_MS, 60 * 60 * 1000);
  return Date.now() - last >= wait;
}

/** Retry pending/failed notify rows. Safe to call from admin. */
export async function retryPendingNotifications(limit = 10): Promise<{
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
}> {
  const settings = await getSettings();
  const placeName = settings.restaurant_name.value.trim() || DEFAULT_PLACE_NAME;
  const to = ownerRecipient(settings);
  const key = await readSecret("RESEND_API_KEY");
  const from = await readSecret("RESEND_FROM");
  if (!key || !from || !to) {
    return { attempted: 0, sent: 0, failed: 0, skipped: 0 };
  }

  const pending = await listPendingNotifies(limit * 2);
  let attempted = 0;
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of pending) {
    if (attempted >= limit) break;
    if (!readyForRetry(row)) {
      skipped += 1;
      continue;
    }
    attempted += 1;
    await markNotifyAttempt(row.id);
    const result = await sendResend({
      to,
      from,
      key,
      placeName,
      inquiry: {
        id: row.inquiry_id,
        name: row.name,
        email: row.email,
        eventDate: row.event_date,
        partySize: row.party_size,
        message: row.message,
      },
    });
    if (result.ok) {
      await markNotifySent(row.inquiry_id, "accepted-by-resend");
      sent += 1;
    } else {
      await recordNotifyFailure(row.id, result.reason);
      failed += 1;
      console.log(JSON.stringify({ partyNotify: "retry-failed", inquiryId: row.inquiry_id, reason: result.reason }));
    }
  }

  return { attempted, sent, failed, skipped };
}

export const NOTIFY_MAX_ATTEMPTS = MAX_ATTEMPTS;
