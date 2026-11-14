import { readFile } from "node:fs/promises";
import path from "node:path";
import { SIZZLE_REEL } from "@/lib/hero";

const ASSET_PATH = SIZZLE_REEL.assetPath;
const CACHE_CONTROL = "public, max-age=86400";

type AssetsBinding = { fetch: (request: Request) => Promise<Response> };

type SizzleBytes = {
  body: ArrayBuffer;
  contentType: string;
  etag: string | null;
};

/** Warm-isolate cache so repeated Safari range hits do not re-read 15MB. */
let memoryCache: SizzleBytes | null = null;

async function assetsBinding(): Promise<AssetsBinding | null> {
  try {
    const { env } = await import("cloudflare:workers");
    const assets = (env as { ASSETS?: AssetsBinding }).ASSETS;
    if (!assets || typeof assets.fetch !== "function") return null;
    return assets;
  } catch {
    return null;
  }
}

/** Load the approved sizzle bytes (Workers ASSETS, else local public file). */
export async function loadSizzleBytes(requestUrl: string): Promise<SizzleBytes | null> {
  if (memoryCache) return memoryCache;

  const assets = await assetsBinding();
  if (assets) {
    // Fresh request: never forward client Range / validators (304 has no body).
    const origin = new URL(requestUrl).origin;
    const asset = await assets.fetch(new Request(new URL(ASSET_PATH, origin)));
    if (!asset.ok) return null;
    memoryCache = {
      body: await asset.arrayBuffer(),
      contentType: asset.headers.get("Content-Type") || "video/mp4",
      etag: asset.headers.get("ETag"),
    };
    return memoryCache;
  }

  const filePath = path.join(process.cwd(), "public", ASSET_PATH.replace(/^\//, ""));
  try {
    const buf = await readFile(filePath);
    memoryCache = {
      body: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      contentType: "video/mp4",
      etag: null,
    };
    return memoryCache;
  } catch {
    return null;
  }
}

export function sizzleResponseHeaders(contentType: string, etag: string | null): Headers {
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", CACHE_CONTROL);
  headers.set("X-Content-Type-Options", "nosniff");
  if (etag) headers.set("ETag", etag);
  return headers;
}
