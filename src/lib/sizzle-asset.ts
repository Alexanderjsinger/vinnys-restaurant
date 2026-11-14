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

/**
 * Warm-isolate cache so Safari range hits share one 15MB buffer.
 * Critical: loads must be single-flight — concurrent arrayBuffer() of this
 * file exceeds Workers memory and 1102s neighboring routes (including `/`).
 */
let memoryCache: SizzleBytes | null = null;
let loadInflight: Promise<SizzleBytes | null> | null = null;

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

function assetRequest(requestUrl: string): Request {
  const origin = new URL(requestUrl).origin;
  // Never forward client Range / validators (ASSETS ignores Range; 304 has no body).
  return new Request(new URL(ASSET_PATH, origin));
}

/** Stream the reel from ASSETS without buffering into isolate memory. */
export async function fetchSizzleAssetResponse(
  requestUrl: string,
): Promise<Response | null> {
  const assets = await assetsBinding();
  if (!assets) return null;
  const asset = await assets.fetch(assetRequest(requestUrl));
  if (!asset.ok) return null;
  return asset;
}

async function loadFromAssets(requestUrl: string): Promise<SizzleBytes | null> {
  const asset = await fetchSizzleAssetResponse(requestUrl);
  if (!asset) return null;
  return {
    body: await asset.arrayBuffer(),
    contentType: asset.headers.get("Content-Type") || "video/mp4",
    etag: asset.headers.get("ETag"),
  };
}

async function loadFromDisk(): Promise<SizzleBytes | null> {
  const filePath = path.join(process.cwd(), "public", ASSET_PATH.replace(/^\//, ""));
  try {
    const buf = await readFile(filePath);
    return {
      body: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      contentType: "video/mp4",
      etag: null,
    };
  } catch {
    return null;
  }
}

/** Load the approved sizzle bytes (Workers ASSETS, else local public file). */
export async function loadSizzleBytes(requestUrl: string): Promise<SizzleBytes | null> {
  if (memoryCache) return memoryCache;
  if (loadInflight) return loadInflight;

  loadInflight = (async () => {
    const loaded = (await loadFromAssets(requestUrl)) ?? (await loadFromDisk());
    if (loaded) memoryCache = loaded;
    return loaded;
  })();

  try {
    return await loadInflight;
  } finally {
    loadInflight = null;
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
