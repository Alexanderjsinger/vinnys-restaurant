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
        </div>

      </section>

      <section className="about-band" aria-labelledby="about-heading">
        <div className="about-grid">
          <figure className="about-exterior">
            <img src="/photos/storefront.webp" alt={`Exterior of ${DEFAULT_PLACE_NAME} at 705 W. Cross St.`} width={1110} height={886} loading="lazy" />
          </figure>
          <div className="about-copy">
            <p className="micro-label">Our Story</p>
            <h2 id="about-heading">Meet me on Cross Street.</h2>
            <p className="about-lede">Vinny’s Bar &amp; Grill, Ypsilanti.</p>
            <p>
              You’ll find Vinny’s at 705 W. Cross Street, right across from Eastern Michigan University.
              Look for the Vinny’s sign above the storefront and come on in.
            </p>
            <p>
              Explore the lunch menu, see what’s on the calendar, or call us to plan your visit.
              Lunch is served daily, 11–3pm.
            </p>
            <Link className="text-link" href="/contact">Come find us <span aria-hidden="true">→</span></Link>
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
              <img src="/hero/sizzle-bartender.jpg" alt="Cocktail atmosphere from the Vinny’s reel" width={1280} height={720} loading="lazy" />
              <div className="occasion-copy">
                <p className="micro-label">At the bar</p>
                <h3>Happy Hour</h3>
                <p>Happy Hour menu details will be posted here when available.</p>
                <Link href="/menu#select-menu-happy-hour">Explore menus <span aria-hidden="true">→</span></Link>
              </div>
            </article>
            <article className="occasion-card">
              <img src="/photos/storefront.webp" alt="Vinny’s Bar & Grill on Cross Street" width={1110} height={886} loading="lazy" />
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
            <h2 id="select-dishes-heading">Select Dishes</h2>
            <p className="band-lede">{LUNCH_SERVICE}.</p>
          </div>
          <SelectDishes dishes={dishes} menus={publishedMenus(menu)} toastUrl={site.toastUrl} />
        </div>
      </section>

      <section className="home-events" aria-labelledby="home-events-heading">
        <div className="wrap home-events-inner">
          <p className="micro-label">On the calendar</p>
          <h2 id="home-events-heading">What’s happening at Vinny’s</h2>
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
