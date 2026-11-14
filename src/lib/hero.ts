/**
 * Approved homepage sizzle reel (static under public/hero).
 * Duration measured with ffprobe (~30.25s) — do not invent timecodes.
 *
 * Encoded ~720p / ~2.5MB (muted, faststart) so Workers can Range-buffer
 * without exceeding isolate memory. A prior 15MB 1080p master OOMed the
 * staging Worker (CF 1102) and took down GET `/` under concurrency.
 *
 * Guest `src` is the Range-aware API route so Safari/iOS get 206 Partial
 * Content. Cloudflare Static Assets ignore Range and break mobile playback.
 * `assetPath` remains the underlying public file the API serves from ASSETS.
 */
export const SIZZLE_REEL = {
  src: "/api/sizzle",
  assetPath: "/hero/vinnys-sizzle-reel.mp4",
  durationLabel: "0:30",
} as const;
