/**
 * Approved homepage sizzle reel (static under public/hero).
 * Duration measured with ffprobe (~30.25s) — do not invent timecodes.
 *
 * Guest `src` is the Range-aware API route so Safari/iOS get 206 Partial
 * Content. Cloudflare Static Assets ignore Range and break mobile playback.
 * `assetPath` remains the underlying public file the API serves from ASSETS.
 */
export const SIZZLE_REEL = {
  src: "/api/sizzle",
  assetPath: "/hero/vinnys-sizzle-reel-1080p.mp4",
  durationLabel: "0:30",
} as const;
