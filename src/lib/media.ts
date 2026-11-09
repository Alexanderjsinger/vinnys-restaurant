export type MediaBucket = {
  put(key: string, value: ArrayBuffer, options: { httpMetadata: { contentType: string } }): Promise<unknown>;
  get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer>; httpMetadata?: { contentType?: string } } | null>;
  delete?(key: string): Promise<unknown>;
};

export async function mediaEnabled(): Promise<boolean> {
  try {
    const { env } = await import("cloudflare:workers");
    return Boolean((env as { MEDIA?: { put?: unknown } }).MEDIA?.put);
  } catch {
    return false;
  }
}

export async function mediaBucket(): Promise<MediaBucket | null> {
  try {
    const { env } = await import("cloudflare:workers");
    const bucket = (env as { MEDIA?: MediaBucket }).MEDIA;
    if (!bucket || typeof bucket.put !== "function" || typeof bucket.get !== "function") return null;
    return bucket;
  } catch {
    return null;
  }
}
