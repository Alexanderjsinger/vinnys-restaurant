/**
 * Single-range parsing for progressive media (Safari / iOS require 206).
 * Multi-range requests are ignored (return null → full 200), per RFC 9110.
 */

export type ByteRange = { start: number; end: number };

/** Parse a single `bytes=` Range. Returns null when absent/unsupported. */
export function parseByteRange(
  header: string | null,
  size: number,
): ByteRange | "unsatisfiable" | null {
  if (!header || size <= 0) return null;
  const trimmed = header.trim();
  if (!trimmed.toLowerCase().startsWith("bytes=")) return null;
  const spec = trimmed.slice(6).trim();
  if (!spec || spec.includes(",")) return null;

  if (spec.startsWith("-")) {
    const suffix = Number(spec.slice(1));
    if (!Number.isInteger(suffix) || suffix <= 0) return "unsatisfiable";
    if (suffix >= size) return { start: 0, end: size - 1 };
    return { start: size - suffix, end: size - 1 };
  }

  const dash = spec.indexOf("-");
  if (dash < 0) return null;
  const start = Number(spec.slice(0, dash));
  const endPart = spec.slice(dash + 1);
  const end = endPart === "" ? size - 1 : Number(endPart);
  if (!Number.isInteger(start) || start < 0 || !Number.isInteger(end)) {
    return "unsatisfiable";
  }
  if (start >= size) return "unsatisfiable";
  return { start, end: Math.min(end, size - 1) };
}

export function applyByteRange(
  body: ArrayBuffer,
  request: Request,
  baseHeaders: Headers,
): Response {
  const size = body.byteLength;
  const headers = new Headers(baseHeaders);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Type", headers.get("Content-Type") || "video/mp4");

  const range = parseByteRange(request.headers.get("Range"), size);
  const head = request.method === "HEAD";

  if (range === "unsatisfiable") {
    headers.set("Content-Range", `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }

  if (!range) {
    headers.set("Content-Length", String(size));
    return new Response(head ? null : body, { status: 200, headers });
  }

  headers.set("Content-Range", `bytes ${range.start}-${range.end}/${size}`);
  headers.set("Content-Length", String(range.end - range.start + 1));
  return new Response(head ? null : body.slice(range.start, range.end + 1), {
    status: 206,
    headers,
  });
}
