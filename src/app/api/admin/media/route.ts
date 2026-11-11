import { NextResponse } from "next/server";
import { isAdmin, verifyCsrfForm } from "@/lib/auth";
import { addMedia, allowRate, deleteMediaRecord } from "@/lib/content";
import { sameOriginPost } from "@/lib/format";
import { newMediaObjectKey, validateImageUpload } from "@/lib/image-bytes";
import { mediaBucket } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOriginPost(request) || !(await isAdmin())) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }
  const ip = (request.headers.get("cf-connecting-ip") || "unknown").split(",")[0].trim();
  if (!(await allowRate(`upload:${ip}`, 20, 60 * 60 * 1000))) {
    return NextResponse.redirect(new URL("/admin/media?error=rate", request.url), 303);
  }

  const form = await request.formData();
  if (!(await verifyCsrfForm(form))) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  }
  const intent = String(form.get("intent") ?? "upload");
  if (intent === "delete") {
    const id = Number(form.get("id"));
    if (!Number.isInteger(id) || id < 1 || form.get("yes") !== "1") {
      return NextResponse.redirect(new URL("/admin/media?error=required", request.url), 303);
    }
    const result = await deleteMediaRecord(id);
    if (!result.ok) {
      return NextResponse.redirect(new URL(`/admin/media?error=${result.reason}`, request.url), 303);
    }
    const bucket = await mediaBucket();
    if (bucket?.delete) {
      try {
        await bucket.delete(result.object_key);
      } catch (error) {
        console.error(error);
      }
    }
    return NextResponse.redirect(new URL("/admin/media?saved=archived", request.url), 303);
  }

  const bucket = await mediaBucket();
  if (!bucket) {
    return NextResponse.redirect(new URL("/admin/media", request.url), 303);
  }
  const file = form.get("file");
  const alt = String(form.get("alt") ?? "").trim().slice(0, 180);
  if (!(file instanceof File) || file.size <= 0 || !alt) {
    return NextResponse.redirect(new URL("/admin/media?error=required", request.url), 303);
  }
  const bytes = await file.arrayBuffer();
  const checked = validateImageUpload(bytes);
  if (!checked.ok) {
    return NextResponse.redirect(new URL(`/admin/media?error=${checked.reason}`, request.url), 303);
  }
  const key = newMediaObjectKey(checked.type);
  await bucket.put(key, bytes, { httpMetadata: { contentType: checked.type } });
  try {
    await addMedia({
      object_key: key,
      alt,
      content_type: checked.type,
      bytes: bytes.byteLength,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    if (bucket.delete) {
      try {
        await bucket.delete(key);
      } catch (cleanupError) {
        console.error(cleanupError);
      }
    }
    return NextResponse.redirect(new URL("/admin/media?error=save", request.url), 303);
  }
  return NextResponse.redirect(new URL("/admin/media?saved=published", request.url), 303);
}
