/** Detect image type from file magic bytes. Do not trust client Content-Type alone. */

export type AllowedImageType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

const MAX_BYTES = 4 * 1024 * 1024;

export const MEDIA_MAX_BYTES = MAX_BYTES;

export function detectImageType(bytes: ArrayBuffer): AllowedImageType | null {
  const view = new Uint8Array(bytes);
  if (view.length < 12) return null;
  if (view[0] === 0xff && view[1] === 0xd8 && view[2] === 0xff) return "image/jpeg";
  if (view[0] === 0x89 && view[1] === 0x50 && view[2] === 0x4e && view[3] === 0x47) return "image/png";
  if (view[0] === 0x47 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x38) return "image/gif";
  const riff =
    view[0] === 0x52 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x46;
  const webp =
    view[8] === 0x57 && view[9] === 0x45 && view[10] === 0x42 && view[11] === 0x50;
  if (riff && webp) return "image/webp";
  return null;
}

export function extensionForType(type: AllowedImageType): string {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
  }
}

export function newMediaObjectKey(type: AllowedImageType): string {
  const id = crypto.randomUUID();
  return `library/${id}.${extensionForType(type)}`;
}

export function validateImageUpload(bytes: ArrayBuffer): { ok: true; type: AllowedImageType } | { ok: false; reason: string } {
  if (bytes.byteLength <= 0) return { ok: false, reason: "empty" };
  if (bytes.byteLength > MAX_BYTES) return { ok: false, reason: "size" };
  const type = detectImageType(bytes);
  if (!type) return { ok: false, reason: "type" };
  return { ok: true, type };
}
