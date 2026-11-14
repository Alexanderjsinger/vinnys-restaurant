import "server-only";
import { connection } from "next/server";
import { DEFAULT_PLACE_NAME } from "./brand";
import { getSettings, listHours } from "./content";
import { formatLongDate, mapUrl, parseProvider, phoneHref, safeHttpUrl } from "./format";
import { FOOTER_TAGLINE } from "./public";
import type { PublicSite, StoryFact } from "./types";

export async function getSite(): Promise<PublicSite> {
  await connection();
  const settings = await getSettings();
  const provider = parseProvider(settings.reservation_provider.value);
  const reservationUrl = safeHttpUrl(settings.reservation_url.value);
  const story: StoryFact[] = [];

  if (settings.owner_name.confirmed && settings.owner_name.value.trim()) {
    story.push({ label: "Owner", value: settings.owner_name.value.trim() });
  }
  if (settings.opened_on.confirmed && settings.opened_on.value.trim()) {
    story.push({ label: "Opened", value: formatLongDate(settings.opened_on.value.trim()) });
  }
  if (settings.former_venue.confirmed && settings.former_venue.value.trim()) {
    story.push({ label: "Formerly", value: settings.former_venue.value.trim() });
  }
  if (settings.cuisine_summary.confirmed && settings.cuisine_summary.value.trim()) {
    story.push({ label: "Kitchen", value: settings.cuisine_summary.value.trim() });
  }

  return {
    name: settings.restaurant_name.value.trim() || DEFAULT_PLACE_NAME,
    tagline: settings.tagline.value.trim() || FOOTER_TAGLINE,
    address: settings.address.value.trim(),
    phone: settings.phone.value.trim(),
    phoneHref: phoneHref(settings.phone.value),
    email: settings.email.value.trim(),
    mapUrl: mapUrl(settings.address.value),
    hours: (await listHours()).filter((hour) => hour.status === "published"),
    promo: {
      headline: settings.promo_headline.value.trim(),
      body: settings.promo_body.value.trim(),
      linkLabel: settings.promo_link_label.value.trim(),
      linkUrl: safeHttpUrl(settings.promo_link_url.value),
    },
    toastUrl: safeHttpUrl(settings.toast_ordering_url.value),
    heroHeading:
      settings.hero_heading.value.trim() || settings.restaurant_name.value.trim() || DEFAULT_PLACE_NAME,
    heroText:
      settings.hero_text.value.trim() ||
      "A bar and grill across from EMU in Ypsilanti. Lunch is served daily, 11–3pm, from the printed menu.",
    heroImage: settings.hero_image.value.trim(),
    reservation: {
      provider,
      url: reservationUrl,
      ready: provider !== "none" && reservationUrl !== null,
    },
    story,
  };
}
