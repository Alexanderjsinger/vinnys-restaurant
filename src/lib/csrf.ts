import { createHmac, timingSafeEqual } from "crypto";

/** Form field name for session-bound admin CSRF tokens. */
export const CSRF_FIELD = "csrf";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

/** Session-bound CSRF token (HMAC of the session cookie). Safe to embed in HTML forms. */
export function csrfTokenForSession(sessionToken: string, password: string): string {
  return createHmac("sha256", password).update(`csrf:v1:${sessionToken}`).digest("hex");
}

export function verifyCsrfToken(sessionToken: string, password: string, provided: string): boolean {
  if (!provided || provided.length > 128) return false;
  const expected = csrfTokenForSession(sessionToken, password);
  return safeEqual(provided, expected);
}
