import Link from "next/link";
import { ConfirmedEvents, EventsEmptyState } from "@/components/ConfirmedEvents";
import { HeroMedia } from "@/components/HeroMedia";
import { SIZZLE_REEL } from "@/lib/hero";
import { listEvents, listMenu } from "@/lib/content";
import { detroitNowLocal } from "@/lib/format";
import { LUNCH_SERVICE } from "@/lib/lunch-menu";
import { SelectDishes, type SelectDish } from "@/components/SelectDishes";
import { DEFAULT_PLACE_NAME, isVinnyShortMark, splitPlaceWordmark } from "@/lib/brand";
import { VinnyWordmark } from "@/components/VinnyWordmark";
import { isMeetMeLine, RESERVE_TEL } from "@/lib/public";
import { LUNCH_PLATES } from "@/lib/lunch-photos";
import { publishedMenus } from "@/lib/menu-options";
import { demoEventsEnabled, makeDemoEvents } from "@/lib/demo-events";
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
  "WINGS (8)",
  "SOUTHERN CHICKEN SALAD",
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
  const demo = process.env.NODE_ENV === "development" && demoEventsEnabled();
  const upcoming = (demo ? makeDemoEvents(now.slice(0, 10)) : await listEvents("public"))
    .filter((event) => (event.ends_at || event.starts_at) >= now)
    .slice(0, demo ? 5 : 3);
  const phoneHref = site.phoneHref || RESERVE_TEL;
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
          <Link className="hero-menu-link" href="/menu">View Menu <span aria-hidden="true">→</span></Link>
        </div>

      </section>

      <section className="about-band" aria-labelledby="about-heading">
        <div className="about-grid">
          <figure className="about-exterior">
            <img src="/photos/storefront.webp" alt={`Exterior of ${DEFAULT_PLACE_NAME} at 705 W. Cross St.`} width={1110} height={886} loading="lazy" />
          </figure>
          <div className="about-copy">
            <p className="micro-label">Our Story</p>
            <h2 id="about-heading">A place to call your own.</h2>
            <p>
              Elevated food, reasonable prices, and a warm welcome—that’s the idea behind Vinny’s.
              We’ve transformed the former Wurst Bar into a gathering spot for our Ypsilanti neighbors
              and the EMU community, pairing thoughtfully prepared favorites with carefully made cocktails.
            </p>
            <p>Come for a meal, connect with friends, and come back often.</p>
            <p className="about-lede">Meet me at Vinny’s.</p>
            <Link className="text-link" href="/about">Read our story <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="occasion-band" aria-labelledby="occasion-heading">
        <div className="wrap occasion-inner">
          <div className="occasion-intro">
            <p className="micro-label">Meet me at Vinny’s</p>
            <h2 id="occasion-heading">Curated for every occasion.</h2>
            <p>Find your next reason to stop by.</p>
          </div>
          <div className="occasion-grid">
            <article className="occasion-card">
              <img src="/photos/burger-fries.webp" alt="Vinny’s burger with fries" width={765} height={1020} loading="lazy" />
              <div className="occasion-copy">
                <p className="micro-label">{LUNCH_SERVICE}</p>
                <h3>Lunch</h3>
                <p>Explore the published lunch menu, from handhelds to shareable appetizers.</p>
                <Link href="/menu#select-menu-lunch">View lunch menu <span aria-hidden="true">→</span></Link>
              </div>
            </article>
            <article className="occasion-card">
              <img src="/photos/bartender-supplied.webp" alt="Illustrated cocktail gathering at a bar" width={1365} height={768} loading="lazy" />
              <div className="occasion-copy">
                <p className="micro-label">At the bar</p>
                <h3>Happy Hour</h3>
                <p>Happy Hour menu details will be posted here when available.</p>
                <Link href="/menu#select-menu-happy-hour">Explore menus <span aria-hidden="true">→</span></Link>
              </div>
            </article>
            <article className="occasion-card">
              <img src="/photos/pizza-supplied.webp" alt="Pizza topped with greens" width={1600} height={1143} loading="lazy" />
              <div className="occasion-copy">
                <p className="micro-label">Around the table</p>
                <h3>Dinner</h3>
                <p>Dinner menu details are on the way. Call us to plan your visit.</p>
                <a href={phoneHref} data-track="phone_click">Call Vinny’s <span aria-hidden="true">→</span></a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="band-cream food-band" aria-labelledby="select-dishes-heading">
        <div className="wrap page">
          <div className="select-intro">
            <h2 id="select-dishes-heading">Much-loved dishes</h2>
            <p className="band-lede">{LUNCH_SERVICE}.</p>
          </div>
          <SelectDishes dishes={dishes} menus={publishedMenus(menu)} toastUrl={site.toastUrl} />
        </div>
      </section>

      <section className="home-events" aria-labelledby="home-events-heading">
        <div className="wrap home-events-inner">
          <p className="micro-label">On the calendar</p>
          <h2 id="home-events-heading">What’s happening at Vinny’s</h2>
          {demo ? <p className="demo-events-note" role="note">Demo week — concepts only. Dates and 7–9pm times are illustrative; no hosts, prizes, performers, or specials are booked or confirmed.</p> : null}
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
        </div>
      </section>

    </>
  );
}
