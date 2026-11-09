import Link from "next/link";
import { ConfirmedEvents } from "@/components/ConfirmedEvents";
import { PosterSlider } from "@/components/PosterSlider";
import { HoursList } from "@/components/HoursList";
import { listEvents, listMenu } from "@/lib/content";
import { detroitNowLocal, formatPrice } from "@/lib/format";
import { firstQuery } from "@/lib/messages";
import { LUNCH_SERVICE } from "@/lib/lunch-menu";
import { listEventPosters } from "@/lib/posters";
import { DIRECTIONS_URL, MAP_QUERY, PHONE_DISPLAY, RESERVE_TEL } from "@/lib/public";
import { OrderLink } from "@/components/OrderLink";
import { LUNCH_PLATES } from "@/lib/lunch-photos";
import { pageMeta } from "@/lib/seo";
import { getSite } from "@/lib/site";
import type { MenuItem } from "@/lib/types";

export const metadata = pageMeta(
  "/",
  { absolute: "Vinny's Bar & Grill" },
  "Vinny's Bar & Grill is a bar and grill across from EMU at 705 W. Cross St., Ypsilanti. Lunch is served daily, 11–3pm.",
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
  const posters = listEventPosters();
  const plates = lunchPlates(menu);
  const highlights = lunchHighlights(menu);
  const now = detroitNowLocal();
  const upcoming = (await listEvents("public"))
    .filter((event) => (event.ends_at || event.starts_at) >= now)
    .slice(0, 3);
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=16&output=embed`;

  return (
    <>
      <PosterSlider posters={posters} />

      <section className="page wrap home-intro" aria-labelledby="home-heading">
        <h1 id="home-heading">{site.heroHeading}</h1>
        <p className="lede">{site.heroText}</p>
        {site.heroImage ? (
          <figure className="shot">
            <img src={site.heroImage} alt="" />
          </figure>
        ) : null}
      </section>

      <section className="page wrap" aria-labelledby="plates-heading">
        <h2 id="plates-heading">Lunch plates</h2>
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
      </section>

      <figure className="venue-shot">
        <img
          src="/photos/storefront.webp"
          alt="Exterior of Vinny's Bar & Grill at 705 W. Cross St."
          width={1110}
          height={886}
        />
        <figcaption>
          Storefront at 705 W. Cross St. This is a listing photo of the exterior, not an owner photo of the dining room.
        </figcaption>
      </figure>

      <section className="page wrap home-cards" aria-label="Lunch, events, and private parties">
        <article className="home-card">
          <h2>Lunch</h2>
          <p className="lunch-line">{LUNCH_SERVICE}</p>
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
          <Link className="btn" href="/menu">
            Full lunch menu
          </Link>
        </article>

        <article className="home-card">
          <h2>Events</h2>
          <ConfirmedEvents events={upcoming} />
          <Link className="btn" href="/events">
            Events
          </Link>
        </article>

        <article className="home-card">
          <h2>Private parties</h2>
          <p>Call to plan a private party.</p>
          <a className="btn btn-solid" href={site.phoneHref || RESERVE_TEL} data-track="phone_click">
            {site.phone || PHONE_DISPLAY}
          </a>
        </article>
      </section>

      <section className="visit-band" aria-labelledby="visit-heading">
        <div className="wrap visit-grid">
          <div>
            <h2 id="visit-heading">Visit</h2>
            <p className="lunch-line">{LUNCH_SERVICE}</p>
            <HoursList hours={site.hours} />
            <p className="visit-address">{site.address || MAP_QUERY}</p>
            <p>
              <a href={site.phoneHref || RESERVE_TEL} data-track="phone_click">
                {site.phone || PHONE_DISPLAY}
              </a>
            </p>
            <p>
              <a href={site.mapUrl || DIRECTIONS_URL} data-track="directions_click" target="_blank" rel="noopener noreferrer">
                Get Directions
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
            <p>
              <OrderLink className="btn btn-solid" url={site.toastUrl} />
            </p>
          </div>
          <iframe
            className="visit-map"
            title="Map of Vinny's Bar & Grill at 705 W. Cross St., Ypsilanti"
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
