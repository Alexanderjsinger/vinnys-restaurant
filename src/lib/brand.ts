/** Default public brand string when CMS name is empty. Prefer typographic apostrophe in guest copy. */
export const DEFAULT_PLACE_NAME = "Vinny’s Bar & Grill";

/**
 * Split a CMS place name for short wordmark + rest.
 * Keeps art-direction "Vinny’s" mark when the full name is "Vinny’s Bar & Grill".
 */
export function splitPlaceWordmark(name: string): { mark: string; rest: string | null } {
  const trimmed = name.trim();
  const match = /^(Vinny['’]s)\s+(.+)$/iu.exec(trimmed);
  if (match) return { mark: match[1], rest: match[2] };
  return { mark: trimmed || DEFAULT_PLACE_NAME, rest: null };
}
