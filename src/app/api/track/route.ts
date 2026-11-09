import { allowedTrack, recordTrack } from "@/lib/track";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let name = "";
  try {
    const raw = await request.text();
    if (raw.length > 200) return new Response(null, { status: 204 });
    const data = JSON.parse(raw) as { event?: unknown };
    name = typeof data.event === "string" ? data.event : "";
  } catch {
    name = "";
  }
  if (allowedTrack(name)) {
    try {
      await recordTrack(name);
    } catch {
      // Counting must not break the page.
    }
  }
  return new Response(null, { status: 204 });
}
