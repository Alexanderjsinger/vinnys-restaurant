import { enqueueNotify, getSettings } from "./content";

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

export async function notifyOwner(inquiry: {
  id: number;
  name: string;
  email: string;
  eventDate: string;
  partySize: number;
  message: string;
}) {
  const settings = await getSettings();
  const to = settings.email.value.trim() || settings.notify_email.value.trim();
  const key = await readSecret("RESEND_API_KEY");
  const from = await readSecret("RESEND_FROM");
  const reason = !key ? "RESEND_API_KEY is not set" : !from ? "RESEND_FROM is not set" : !to ? "no owner email" : "";
  if (reason) {
    await enqueueNotify(inquiry.id, reason);
    console.log(JSON.stringify({ partyNotify: "queued", reason, inquiryId: inquiry.id }));
    return;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "New party note for Vinny's",
        text: [
          `Name: ${inquiry.name}`,
          `Email: ${inquiry.email}`,
          `Date: ${inquiry.eventDate}`,
          `Party size: ${inquiry.partySize}`,
          `Note: ${inquiry.message}`,
        ].join("\n"),
      }),
    });
    if (!response.ok) {
      await enqueueNotify(inquiry.id, `resend ${response.status}`);
      console.log(JSON.stringify({ partyNotify: "queued", reason: "resend-failed", inquiryId: inquiry.id }));
    }
  } catch (error) {
    await enqueueNotify(inquiry.id, "resend-error");
    console.error(error);
  }
}
