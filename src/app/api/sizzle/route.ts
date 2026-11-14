import { applyByteRange } from "@/lib/byte-range";
import { loadSizzleBytes, sizzleResponseHeaders } from "@/lib/sizzle-asset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Progressive sizzle reel with HTTP byte-range (206).
 * Cloudflare Static Assets ignore Range and return full 200s — Safari/iOS
 * need 206 to play MP4. This route fetches ASSETS without forwarding Range,
 * then slices. See CF Workers static-assets billing-and-limitations.
 */
async function handle(request: Request): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
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
