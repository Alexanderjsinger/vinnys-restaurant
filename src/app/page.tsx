import Link from "next/link";
import { ConfirmedEvents, EventsEmptyState } from "@/components/ConfirmedEvents";
import { HeroMedia } from "@/components/HeroMedia";
import { SIZZLE_REEL } from "@/lib/hero";
import { HoursList } from "@/components/HoursList";
import { listEvents, listMenu } from "@/lib/content";
import { detroitNowLocal, formatPrice } from "@/lib/format";
import { LUNCH_SERVICE } from "@/lib/lunch-menu";
import { DEFAULT_PLACE_NAME, isVinnyShortMark, splitPlaceWordmark } from "@/lib/brand";
import { VinnyWordmark } from "@/components/VinnyWordmark";
import { DIRECTIONS_URL, isMeetMeLine, MAP_QUERY, PHONE_DISPLAY, RESERVE_TEL } from "@/lib/public";
import { OrderLink } from "@/components/OrderLink";
import { LUNCH_PLATES } from "@/lib/lunch-photos";
import { pageMeta } from "@/lib/seo";
import { getSite } from "@/lib/site";
import type { MenuItem } from "@/lib/types";

export const metadata = pageMeta(
  "/",
  { absolute: DEFAULT_PLACE_NAME },
  `${DEFAULT_PLACE_NAME} is a bar and grill across from EMU at 705 W. Cross St., Ypsilanti. Lunch is served daily, 11–3pm.`,
);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HIGHLIGHT_NAMES = [
  "VINNY'S BURGER",
  "SPICY CAULIFLOWER",
  "SOUTHERN CHICKEN SALAD",
  "WINGS (8)",
  "FRENCH DIP",
  "BAVARIAN PRETZEL",
];

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function lunchPlates(menu: Awaited<ReturnType<typeof listMenu>>): { plate: (typeof LUNCH_PLATES)[number]; item: MenuItem }[] {
  const items = menu.flatMap((section) => section.items);
  return LUNCH_PLATES.flatMap((plate) => {
    const item = items.find((row) => row.name === plate.menuName);
    return item ? [{ plate, item }] : [];
  });
}

function lunchHighlights(menu: Awaited<ReturnType<typeof listMenu>>): MenuItem[] {
  const items = menu.flatMap((section) => section.items);
  return HIGHLIGHT_NAMES.flatMap((name) => {
    const match = items.find((item) => item.name === name);
    return match ? [match] : [];
  });
}

export default async function HomePage() {
  const site = await getSite();
  const menu = await listMenu("public");
  const plates = lunchPlates(menu);
  const highlights = lunchHighlights(menu);
  const now = detroitNowLocal();
  const upcoming = (await listEvents("public"))
    .filter((event) => (event.ends_at || event.starts_at) >= now)
    .slice(0, 3);
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=16&output=embed`;
  const addressLine = site.address || MAP_QUERY;
  const phoneHref = site.phoneHref || RESERVE_TEL;
  const phoneLabel = site.phone || PHONE_DISPLAY;
  const rawHeroSupport = site.heroText?.trim() || "";
  // Meet me lives in the white header tagline; omit it from cream sub-header to condense.
  const heroSupport = isMeetMeLine(rawHeroSupport)
    ? ""
    : rawHeroSupport || "A bar and grill across from EMU on Cross Street. Lunch daily, 11–3pm.";
  const placeName = (site.heroHeading || site.name).trim() || DEFAULT_PLACE_NAME;
  const { mark: heroMark, rest: heroRest } = splitPlaceWordmark(placeName);

  return (
    <>
      <section className="stitch-hero" aria-labelledby="home-heading">
        <div className={`wrap stitch-hero-copy${heroSupport ? "" : " stitch-hero-copy-tight"}`}>
          <h1 id="home-heading" className="stitch-wordmark">
            <span className="stitch-wordmark-mark">
              {isVinnyShortMark(heroMark) ? (
                <VinnyWordmark size="lg" surface="light" decorative />
              ) : (
                heroMark
              )}
            </span>
            {heroRest ? <span className="stitch-wordmark-rest">{heroRest}</span> : null}
          </h1>
          <div className="gold-rule" aria-hidden="true" />
          {heroSupport ? <p className="stitch-hero-support">{heroSupport}</p> : null}
        </div>

        <HeroMedia videoSrc={SIZZLE_REEL.src} durationLabel={SIZZLE_REEL.durationLabel} />

        {/* /contact and /reserve cannot take party size, date, or time. The fields match the bar layout; Reserve opens the call-to-reserve page. */}
        <div
          className="reserve-bar"
          role="group"
          aria-labelledby="reserve-bar-label"
          aria-describedby="reserve-bar-note"
        >
          <p id="reserve-bar-label" className="reserve-bar-label">
            Reservations
          </p>
          <p id="reserve-bar-note" className="sr-only">
            Party size, date, and time are not saved. Reserve opens the call-to-reserve page.
          </p>
          <label className="reserve-bar-field">
            <span className="reserve-bar-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M5.5 19.2c1.4-3.2 3.6-4.7 6.5-4.7s5.1 1.5 6.5 4.7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="sr-only">Party size</span>
            <select defaultValue="">
              <option value="">Party size</option>
              {PARTY_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label className="reserve-bar-field">
            <span className="reserve-bar-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <rect x="4" y="5.5" width="16" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M4 10h16M8 3.5v4M16 3.5v4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="sr-only">Date</span>
            <input type="date" />
          </label>
          <label className="reserve-bar-field">
            <span className="reserve-bar-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M12 8.2V12l2.8 2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="sr-only">Time</span>
            <input type="time" />
          </label>
          <Link className="btn btn-gold reserve-bar-submit" href="/reserve">
            Reserve
          </Link>
        </div>
      </section>

      <section className="story-split" aria-labelledby="story-heading">
        <div className="story-grid">
          <div className="story-copy">
            <p className="micro-label">Find us in Ypsilanti</p>
            <h2 id="story-heading">Right across from EMU.</h2>
            <p className="story-address">705 W Cross Street</p>
            <p>
              A bar and grill on Cross Street, just across from Eastern Michigan University. Lunch is
              served daily, 11–3pm.
            </p>
            <p className="story-links">
              <a
                className="btn btn-ink"
                href={site.mapUrl || DIRECTIONS_URL}
                data-track="directions_click"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Directions
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <Link className="text-link" href="/contact#hours-heading">
                View Hours
              </Link>
            </p>
            <p className="story-caption">
              Listing photo of the exterior, not an owner photo of the dining room.
            </p>
          </div>
          <figure className="story-frame">
            <img
              src="/photos/storefront.webp"
              alt={`Exterior of ${DEFAULT_PLACE_NAME} at 705 W. Cross St.`}
              width={1110}
              height={886}
            />
          </figure>
        </div>
      </section>

      <section className="social-rituals" aria-labelledby="rituals-heading">
        <div className="wrap">
          <p className="micro-label">Social rituals & gatherings</p>
          <h2 id="rituals-heading">Curated for every Cross Street night</h2>
        </div>
        <ul className="ritual-strip">
          <li>
            <img
              className="ritual-faces"
              src="/hero/meet-me.jpg"
              alt="Friends sharing drinks and plates at a restaurant table"
              width={1800}
              height={1203}
            />
          </li>
          {plates.map(({ plate, item }) => (
            <li key={item.id}>
              <img src={plate.src} alt={plate.alt} width={plate.width} height={plate.height} />
            </li>
          ))}
          <li>
            <img
              className="ritual-sign"
              src="/photos/storefront.webp"
              alt={`Exterior of ${DEFAULT_PLACE_NAME} at 705 W. Cross St.`}
              width={1110}
              height={886}
            />
          </li>
        </ul>
        <div className="wrap">
          <p className="cta-row social-ctas">
            <Link className="btn btn-gold" href="/events">
              Events
            </Link>
            <Link className="btn btn-outline-light" href="/contact">
              Reserve
            </Link>
            <OrderLink className="btn btn-outline-light" url={site.toastUrl}>
              Order
            </OrderLink>
          </p>
        </div>
      </section>

      <section className="band-cream food-band" aria-labelledby="plates-heading">
        <div className="wrap page">
          <p className="micro-label">From the kitchen</p>
          <h2 id="plates-heading">Lunch plates</h2>
          <p className="band-lede">Published lunch items with prices from the menu. {LUNCH_SERVICE}.</p>
          <ul className="plate-list">
            {plates.map(({ plate, item }) => (
              <li key={item.id} className="plate">
                <figure className="shot">
                  <img src={plate.src} alt={plate.alt} width={plate.width} height={plate.height} />
                </figure>
                <h3>{item.name}</h3>
                {item.description ? <p>{item.description}</p> : null}
                <p className="price">{formatPrice(item.price)}</p>
              </li>
            ))}
          </ul>
          {highlights.length ? (
            <div className="menu-highlights">
              <h3 className="menu-highlights-title">Lunch highlights</h3>
              <ul className="highlights">
                {highlights.map((item) => (
                  <li key={item.id}>
                    <span>
                      {item.name}
                      {item.description ? <small>{item.description}</small> : null}
                    </span>
                    <span className="price">{formatPrice(item.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="menu-banner">
            <Link className="btn btn-ink" href="/menu">
              Full lunch menu
            </Link>
            <OrderLink className="btn btn-gold" url={site.toastUrl}>
              Order takeout
            </OrderLink>
          </p>
        </div>
      </section>

      <section className="page wrap home-cards" aria-label="Events">
        <article className="home-card">
          <h2>Events</h2>
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
        <div className="wrap visit-grid">
          <div>
            <p className="micro-label">Visit</p>
            <h2 id="visit-heading">Find us on Cross Street</h2>
            <p className="lunch-line">{LUNCH_SERVICE}</p>
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
