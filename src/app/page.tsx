import Link from "next/link";
import { ConfirmedEvents, EventsEmptyState } from "@/components/ConfirmedEvents";
import { HeroMedia } from "@/components/HeroMedia";
import { SIZZLE_REEL } from "@/lib/hero";
import { HoursList } from "@/components/HoursList";
import { listEvents, listMenu } from "@/lib/content";
import { detroitNowLocal } from "@/lib/format";
import { LUNCH_FOOTNOTE, LUNCH_SERVICE } from "@/lib/lunch-menu";
import { SelectDishes, type SelectDish, type SelectMenu } from "@/components/SelectDishes";
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

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

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
    return [
      {
        id: row.item.id,
        name: row.item.name,
        description: row.item.description,
        price: row.item.price,
        section: row.sectionName,
        glutenFree: row.item.gluten_free,
        photo: plate
          ? { src: plate.src, alt: plate.alt, width: plate.width, height: plate.height }
          : null,
      },
    ];
  });
}

function publishedMenus(menu: MenuSection[]): SelectMenu[] {
  const sections = menu
    .filter((section) => section.items.length > 0)
    .map((section) => ({
      id: section.id,
      name: section.name,
      blurb: section.blurb,
      items: section.items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        glutenFree: item.gluten_free,
        marked: item.marked,
      })),
    }));
  if (!sections.length) return [];
  const marked = sections.some((section) => section.items.some((item) => item.marked));
  return [
    {
      id: "lunch",
      label: "Lunch",
      service: LUNCH_SERVICE,
      footnote: marked ? LUNCH_FOOTNOTE : null,
      sections,
    },
  ];
}

export default async function HomePage() {
  const site = await getSite();
  const menu = await listMenu("public");
  const dishes = selectDishes(menu);
  const menus = publishedMenus(menu);
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

      <section className="destination-tiles" aria-labelledby="destinations-heading">
        <h2 id="destinations-heading" className="sr-only">
          Reservations, menus, and events
        </h2>
        <ul>
          <li>
            <Link className="destination-tile" href="/reserve">
              <img
                className="tile-table"
                src="/hero/meet-me.jpg"
                alt="Friends sharing drinks and plates at a restaurant table"
                width={1800}
                height={1203}
              />
              <span>Reservations</span>
            </Link>
          </li>
          <li>
            <Link className="destination-tile" href="/menu">
              <img
                className="tile-burger"
                src="/photos/burger-fries.webp"
                alt="Cheeseburger on a brioche bun with bacon jam, lettuce, tomato, onion, and fries"
                width={765}
                height={1020}
              />
              <span>Menus</span>
            </Link>
          </li>
          <li>
            <Link className="destination-tile" href="/events">
              <img
                className="tile-bar"
                src="/hero/sizzle-bartender.jpg"
                alt="Bartender serving cocktails to guests at the Vinny's bar"
                width={1280}
                height={720}
              />
              <span>Events</span>
            </Link>
          </li>
        </ul>
      </section>

      <section className="band-cream food-band" aria-labelledby="select-dishes-heading">
        <div className="wrap page">
          <div className="select-intro">
            <h2 id="select-dishes-heading">Select Dishes</h2>
            <p className="band-lede">{LUNCH_SERVICE}.</p>
          </div>
          <SelectDishes dishes={dishes} menus={menus} toastUrl={site.toastUrl} />
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
