import Link from "next/link";
import { ConfirmedEvents, EventsEmptyState } from "@/components/ConfirmedEvents";
import { HeroMedia } from "@/components/HeroMedia";
import { SIZZLE_REEL } from "@/lib/hero";
import { HoursList } from "@/components/HoursList";
import { listEvents, listMenu } from "@/lib/content";
import { detroitNowLocal } from "@/lib/format";
import { LUNCH_SERVICE } from "@/lib/lunch-menu";
import { SelectDishes, type SelectDish } from "@/components/SelectDishes";
import { DEFAULT_PLACE_NAME, isVinnyShortMark, splitPlaceWordmark } from "@/lib/brand";
import { VinnyWordmark } from "@/components/VinnyWordmark";
import { DIRECTIONS_URL, isMeetMeLine, MAP_QUERY, PHONE_DISPLAY, RESERVE_TEL } from "@/lib/public";
import { OrderLink } from "@/components/OrderLink";
import { LUNCH_PLATES } from "@/lib/lunch-photos";
import { pageMeta } from "@/lib/seo";
import { getSite } from "@/lib/site";
import type { MenuSection } from "@/lib/types";

export const metadata = pageMeta(
  "/",
  { absolute: DEFAULT_PLACE_NAME },
  `${DEFAULT_PLACE_NAME} is a bar and grill across from EMU at 705 W. Cross St., Ypsilanti. Lunch is served daily, 11–3pm.`,
);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SELECT_DISH_NAMES = [
  "VINNY'S BURGER",
  "SPICY CAULIFLOWER",
  "SOUTHERN CHICKEN SALAD",
  "WINGS (8)",
  "FRENCH DIP",
  "BAVARIAN PRETZEL",
] as const;

function selectDishes(menu: MenuSection[]): SelectDish[] {
  const rows = menu.flatMap((section) => section.items.map((item) => ({ item, sectionName: section.name })));
  return SELECT_DISH_NAMES.flatMap((name) => {
    const row = rows.find((entry) => entry.item.name === name);
    if (!row) return [];
    const plate = LUNCH_PLATES.find((photo) => photo.menuName === name);
    const photo = plate;
    return [
      {
        id: row.item.id,
        name: row.item.name,
        description: row.item.description,
        price: row.item.price,
        section: row.sectionName,
        glutenFree: row.item.gluten_free,
        photo: photo ? { src: photo.src, alt: photo.alt, width: photo.width, height: photo.height } : null,
      },
    ];
  });
}

export default async function HomePage() {
  const site = await getSite();
  const menu = await listMenu("public");
  const dishes = selectDishes(menu);
  const now = detroitNowLocal();
  const upcoming = (await listEvents("public"))
    .filter((event) => (event.ends_at || event.starts_at) >= now)
    .slice(0, 3);
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=16&output=embed`;
  const addressLine = site.address || MAP_QUERY;
  const phoneHref = site.phoneHref || RESERVE_TEL;
  const phoneLabel = site.phone || PHONE_DISPLAY;
  const rawHeroSupport = site.heroText?.trim() || "";
  // Meet me lives in the header. The EMU sentence is a placeholder, not reel copy.
  const heroSupport =
    isMeetMeLine(rawHeroSupport) || /^a bar and grill across from emu\b/i.test(rawHeroSupport)
      ? ""
      : rawHeroSupport;
  const placeName = (site.heroHeading || site.name).trim() || DEFAULT_PLACE_NAME;
  const { mark: heroMark, rest: heroRest } = splitPlaceWordmark(placeName);

  return (
    <>
      <section className="stitch-hero reel-hero" aria-labelledby="home-heading">
        <HeroMedia videoSrc={SIZZLE_REEL.src} durationLabel={SIZZLE_REEL.durationLabel} />
        <div className="reel-hero-copy">
          <h1 id="home-heading" className="stitch-wordmark">
            <span className="stitch-wordmark-mark">
              {isVinnyShortMark(heroMark) ? (
                <VinnyWordmark size="lg" surface="dark" decorative />
              ) : (
                heroMark
              )}
            </span>
            {heroRest ? <span className="stitch-wordmark-rest">{heroRest}</span> : null}
          </h1>
          <div className="gold-rule" aria-hidden="true" />
          {heroSupport ? <p className="stitch-hero-support">{heroSupport}</p> : null}
        </div>

      </section>

      <section className="quick-actions" aria-label="Plan your visit">
        <div className="wrap quick-actions-inner">
          <div className="reserve-copy">
            <p className="micro-label">Meet me at Vinny’s</p>
            <p>Menu, a table, or the way here.</p>
          </div>
          <div className="quick-action-links">
            <Link className="btn btn-ink" href="/menu">View Menu</Link>
            <a className="btn" href={phoneHref} data-track="phone_click">Call to Reserve</a>
            <a className="btn" href={site.mapUrl || DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" data-track="directions_click">
              Directions<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </section>

      <section className="band-cream food-band" aria-labelledby="select-dishes-heading">
        <div className="wrap page">
          <div className="select-intro">
            <h2 id="select-dishes-heading">Select Dishes</h2>
            <p className="band-lede">{LUNCH_SERVICE}.</p>
          </div>
          <SelectDishes dishes={dishes} toastUrl={site.toastUrl} />
        </div>
      </section>

      <section className="page wrap home-cards" aria-label="Events">
        <article className="home-card">
          <p className="micro-label">On the calendar</p>
          <h2>What’s happening</h2>
          {upcoming.length ? (
            <>
              <ConfirmedEvents events={upcoming} />
              <Link className="btn" href="/events">
                All events
              </Link>
            </>
          ) : (
            <EventsEmptyState
              surface="home"
              phoneHref={site.phoneHref}
              phone={site.phone}
              toastUrl={site.toastUrl}
            />
          )}
        </article>
      </section>

      <section className="visit-band" aria-labelledby="visit-heading">
        <figure className="story-frame visit-storefront">
          <img src="/photos/storefront.webp" alt={`Exterior of ${DEFAULT_PLACE_NAME} at 705 W. Cross St.`} width={1110} height={886} loading="lazy" />
        </figure>
        <div className="wrap visit-grid">
          <div>
            <p className="micro-label">Visit</p>
            <h2 id="visit-heading">Right across from EMU.</h2>
            <p className="lunch-line">{LUNCH_SERVICE}</p>
            <h3 id="home-hours-heading">Hours</h3>
            <HoursList hours={site.hours} />
            <p className="visit-address">{addressLine}</p>
            <p>
              <a href={phoneHref} data-track="phone_click">
                {phoneLabel}
              </a>
            </p>
            <p>
              <a href={site.mapUrl || DIRECTIONS_URL} data-track="directions_click" target="_blank" rel="noopener noreferrer">
                Get Directions
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
            <p>
              <OrderLink className="btn btn-ink" url={site.toastUrl} />
            </p>
          </div>
          <iframe
            className="visit-map"
            title={`Map of ${DEFAULT_PLACE_NAME} at 705 W. Cross St., Ypsilanti`}
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
