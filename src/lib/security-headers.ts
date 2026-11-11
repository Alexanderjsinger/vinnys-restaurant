/** Baseline browser security headers for public and admin responses. */

export const SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ["X-Content-Type-Options", "nosniff"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["X-Frame-Options", "SAMEORIGIN"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
];

export function applySecurityHeaders(headers: Headers): void {
  for (const [key, value] of SECURITY_HEADERS) {
    headers.set(key, value);
  }
}
