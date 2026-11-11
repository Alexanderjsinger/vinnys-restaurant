import { CSRF_FIELD } from "@/lib/csrf";

/** Sync CSRF input when the token was already loaded (safe for client components). */
export function CsrfInput({ token }: { token: string }) {
  return <input type="hidden" name={CSRF_FIELD} value={token} />;
}
