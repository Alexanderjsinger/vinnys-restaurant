import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { addMedia, allowRate } from "@/lib/content";
import { sameOriginPost } from "@/lib/format";
import { mediaBucket } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  if (!sameOriginPost(request) || !(await isAdmin())) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }
  const ip = (request.headers.get("cf-connecting-ip") || "unknown").split(",")[0].trim();
  if (!(await allowRate(`upload:${ip}`, 20, 60 * 60 * 1000))) {
    return NextResponse.redirect(new URL("/admin/media?error=rate", request.url), 303);
  }
  const bucket = await mediaBucket();
  if (!bucket) {
    return NextResponse.redirect(new URL("/admin/media", request.url), 303);
  }
  const form = await request.formData();
  const file = form.get("file");
  const alt = String(form.get("alt") ?? "").trim().slice(0, 180);
  if (!(file instanceof File) || !TYPES.has(file.type) || file.size <= 0 || file.size > MAX_BYTES || !alt) {
    return NextResponse.redirect(new URL("/admin/media?error=required", request.url), 303);
  }
  const bytes = await file.arrayBuffer();
  const key = `library/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
  await bucket.put(key, bytes, { httpMetadata: { contentType: file.type } });
  await addMedia({
    object_key: key,
    alt,
    content_type: file.type,
    bytes: file.size,
    created_at: new Date().toISOString(),
  });
  return NextResponse.redirect(new URL("/admin/media?saved=published", request.url), 303);
}
