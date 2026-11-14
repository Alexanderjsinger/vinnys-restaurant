import { applyByteRange } from "@/lib/byte-range";
import {
  fetchSizzleAssetResponse,
  loadSizzleBytes,
  sizzleResponseHeaders,
} from "@/lib/sizzle-asset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Progressive sizzle reel with HTTP byte-range (206).
 * Cloudflare Static Assets ignore Range and return full 200s — Safari/iOS
 * need 206 to play MP4. Range responses still buffer once (single-flight)
 * then slice. Non-Range GETs stream from ASSETS so concurrent full downloads
 * do not OOM the isolate (CF error 1102) and take down `/` with them.
 */
async function handle(request: Request): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  const wantsRange = Boolean(request.headers.get("Range"));

  // Full-body requests: stream from ASSETS (no 15MB ArrayBuffer in the Worker).
  if (!wantsRange) {
    const streamed = await fetchSizzleAssetResponse(request.url);
    if (streamed) {
      const headers = sizzleResponseHeaders(
        streamed.headers.get("Content-Type") || "video/mp4",
        streamed.headers.get("ETag"),
      );
      headers.set("Accept-Ranges", "bytes");
      const length = streamed.headers.get("Content-Length");
      if (length) headers.set("Content-Length", length);
      if (request.method === "HEAD") {
        return new Response(null, { status: 200, headers });
      }
      return new Response(streamed.body, { status: 200, headers });
    }
    // Local/dev fallback when ASSETS is unavailable: buffered path below.
  }

  const asset = await loadSizzleBytes(request.url);
  if (!asset) return new Response(null, { status: 404 });

  return applyByteRange(
    asset.body,
    request,
    sizzleResponseHeaders(asset.contentType, asset.etag),
  );
}

export function GET(request: Request) {
  return handle(request);
}

export function HEAD(request: Request) {
  return handle(request);
}
