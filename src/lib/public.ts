export const ORDER_URL =
  "https://order.toasttab.com/online/vinny-s-bar-grill-705-west-cross-street";

export const RESERVE_TEL = "tel:7349057051";

export const PHONE_DISPLAY = "734-905-7051";

export const STREET_ADDRESS = "705 W. Cross St., Ypsilanti";

export const MAP_QUERY = "705 W. Cross St., Ypsilanti, MI 48197";

export const DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;

export const PRODUCTION_ORIGIN = "https://vinnysbargrill.com";

export const POSITIONING =
  "YPSILANTI'S BAR & GRILL ACROSS FROM EMU. LUNCH, GAME DAY, AFTER WORK.";

export const HERO_LINE = "Meet me at Vinny’s.";

/** True when CMS/copy is only the Meet me slogan (any apostrophe / trailing period). */
export function isMeetMeLine(text: string): boolean {
  return /^meet\s+me\s+at\s+vinny['’]s\.?$/iu.test(text.trim());
}

/** Guest footer tagline. Prefer typographic apostrophe. */
export const FOOTER_TAGLINE = "Meet me at Vinny’s";
