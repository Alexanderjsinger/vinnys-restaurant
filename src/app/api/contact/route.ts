import { NextResponse } from "next/server";
import { addInquiry, addSignup, allowRate } from "@/lib/content";
import { sameOriginPost } from "@/lib/format";
import { notifyOwner } from "@/lib/notify";
import { submitContact, type ContactResult } from "@/lib/contact-submissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BYTES = 16_384;

export async function POST(request: Request) {
  const json = request.headers.get("accept")?.includes("application/json");
  function reply(result: ContactResult, kind = "") {
    if (json) return NextResponse.json(result, { status: result.status, headers: { "Cache-Control": "no-store" } });
    const value = result.status === 200 ? `${kind}-saved` : "error";
    return NextResponse.redirect(new URL(`/contact?contact=${value}#contact-forms`, request.url), 303);
  }
  if (!request.headers.get("origin") || !sameOriginPost(request)) return reply({ status: 403, message: "Please submit this form from Vinny’s website." });
  if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return reply({ status: 415, message: "Please use the contact form to send your message." });
  const reader = request.body?.getReader();
  if (!reader) return reply({ status: 400, message: "Please complete the form." });
  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); return reply({ status: 413, message: "That message is too long. Please shorten it and try again." }); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const form = new FormData();
    new URLSearchParams(new TextDecoder().decode(bytes)).forEach((value, key) => form.append(key, value));
    // Cloudflare supplies this header; shared fallback keeps unknown clients rate limited.
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const result = await submitContact(form, {
      allow: () => allowRate(`contact:${ip}`, 8, 15 * 60 * 1000),
      signup: addSignup,
      message: addInquiry,
      notify: notifyOwner,
    });
    return reply(result, String(form.get("kind")));
  } catch {
    return reply({ status: 503, message: "We couldn’t save that just now. Please try again or give us a call." });
  }
}
