import Link from "next/link";
import { ConfirmedEvents, EventsEmptyState } from "@/components/ConfirmedEvents";
import { HeroMedia } from "@/components/HeroMedia";
import { SIZZLE_REEL } from "@/lib/hero";
import { HoursList } from "@/components/HoursList";
import { listEvents, listMenu } from "@/lib/content";
import { detroitNowLocal, formatPrice } from "@/lib/format";
import { firstQuery } from "@/lib/messages";
import { LUNCH_SERVICE } from "@/lib/lunch-menu";
import { DEFAULT_PLACE_NAME, splitPlaceWordmark } from "@/lib/brand";
import { DIRECTIONS_URL, HERO_LINE, MAP_QUERY, PHONE_DISPLAY, RESERVE_TEL } from "@/lib/public";
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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const joinCode = firstQuery(query.join);
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
  const heroSupport =
    site.heroText?.trim() ||
    "A bar and grill across from EMU on Cross Street. Lunch daily, 11–3pm.";
  const placeName = (site.heroHeading || site.name).trim() || DEFAULT_PLACE_NAME;
  const { mark: heroMark, rest: heroRest } = splitPlaceWordmark(placeName);

  return (
    <>
      <section className="stitch-hero" aria-labelledby="home-heading">
        <div className="wrap stitch-hero-copy">
          <p className="micro-label stitch-hero-label">Historic Cross Street / Ypsilanti, Michigan</p>
          <h1 id="home-heading" className="stitch-wordmark">
            <span className="stitch-wordmark-mark">{heroMark}</span>
            {heroRest ? <span className="stitch-wordmark-rest">{heroRest}</span> : null}
          </h1>
          <div className="gold-rule" aria-hidden="true" />
          <p className="stitch-hero-support">{heroSupport}</p>
        </div>

        <div className="wrap">
          <HeroMedia videoSrc={SIZZLE_REEL.src} durationLabel={SIZZLE_REEL.durationLabel} />
          <div className="sizzle-below">
            <p className="sizzle-lockup">{HERO_LINE}</p>
            <p className="framed-hero-actions">
              <a className="btn btn-gold" href={phoneHref} data-track="phone_click">
                Call {phoneLabel}
              </a>
              <Link className="btn btn-ink" href="/menu">
                View menus
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="story-split" aria-labelledby="story-heading">
        <div className="wrap story-grid">
          <div className="story-copy">
            <p className="micro-label">Our home on historic Cross Street</p>
            <h2 id="story-heading">
              705 W Cross St: across from EMU, built for gathering
            </h2>
            <p>
              {site.heroText?.trim() ||
                `${DEFAULT_PLACE_NAME} is a bar and grill on historic Cross Street in Ypsilanti, directly across from Eastern Michigan University.`}
            </p>
            <p>
              Lunch is served daily, 11–3pm, from the published menu. Call for the room, or order
              takeout when Toast is connected.
            </p>
            <p className="story-links">
              <Link className="btn btn-ink" href="/contact">
                Visit & hours →
              </Link>
              <a className="text-link" href={phoneHref} data-track="phone_click">
                Call to plan an evening →
              </a>
            </p>
          </div>
          <figure className="story-frame">
            <img
              src="/photos/storefront.webp"
              alt={`Exterior of ${DEFAULT_PLACE_NAME} at 705 W. Cross St.`}
              width={1110}
              height={886}
            />
            <figcaption>
              <span>705 W Cross St · Across from EMU / Ypsilanti, MI</span>
              <span className="story-frame-note">
                Listing photo of the exterior, not an owner photo of the dining room.
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="social-rituals" aria-labelledby="rituals-heading">
        <div className="wrap">
          <p className="micro-label">Social rituals & gatherings</p>
          <h2 id="rituals-heading">Curated for every Cross Street night</h2>
          <p className="band-lede social-lede">
            Published events when we have them, private parties by phone, and lunch from the menu.
          </p>
          <ul className="ritual-strip">
            <li>
              <figure>
                <img
                  src="/hero/meet-me.jpg"
                  alt="Friends sharing drinks and plates at a restaurant table"
                  width={900}
                  height={600}
                />
                <figcaption>Meet me at Vinny&apos;s</figcaption>
              </figure>
            </li>
            {plates.map(({ plate, item }) => (
              <li key={item.id}>
                <figure>
                  <img src={plate.src} alt={plate.alt} width={plate.width} height={plate.height} />
                  <figcaption>
                    {item.name} · {formatPrice(item.price)}
                  </figcaption>
                </figure>
              </li>
            ))}
            <li>
              <figure>
                <img
                  src="/photos/storefront.webp"
                  alt={`${DEFAULT_PLACE_NAME} storefront exterior`}
                  width={555}
                  height={443}
                />
                <figcaption>705 W Cross St</figcaption>
              </figure>
            </li>
          </ul>
          <p className="cta-row social-ctas">
            <Link className="btn btn-gold" href="/events">
              Events
            </Link>
            <a className="btn btn-outline-light" href={phoneHref} data-track="phone_click">
              Call about private parties
            </a>
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

      <section className="page wrap home-cards" aria-label="Events and private parties">
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

        <article className="home-card">
          <h2>Private parties</h2>
          <p>Call to plan a private party. Room capacity and party prices are not published.</p>
          <a className="btn btn-ink" href={phoneHref} data-track="phone_click">
            {phoneLabel}
          </a>
          <Link className="btn" href="/parties">
            Party details
          </Link>
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

      <section className="signup-band" id="list" aria-labelledby="list-heading">
        <div className="wrap">
          <h2 id="list-heading">Birthday list</h2>
          <p>The birthday list is closed until the offer, a birth date, and a way to opt out are ready.</p>
          {joinCode === "closed" ? (
            <p className="banner banner-bad" role="status">
              That signup was not saved. The list is not open.
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
