import { getMedia } from "@/lib/content";
import { mediaBucket } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return new Response(null, { status: 404 });
  const row = await getMedia(id);
  const bucket = await mediaBucket();
  if (!row || !bucket) return new Response(null, { status: 404 });
  const object = await bucket.get(row.object_key);
  if (!object) return new Response(null, { status: 404 });
  const body = await object.arrayBuffer();
  return new Response(body, {
    headers: {
      "content-type": object.httpMetadata?.contentType || row.content_type,
      "cache-control": "public, max-age=3600",
    },
  });
}
