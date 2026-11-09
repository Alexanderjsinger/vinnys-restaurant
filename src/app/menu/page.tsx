import { PhotoStrip } from "@/components/PhotoStrip";
import { TrackView } from "@/components/TrackView";
import { formatPrice } from "@/lib/format";
import { listMenu } from "@/lib/content";
import { LUNCH_FOOTNOTE, LUNCH_SERVICE } from "@/lib/lunch-menu";
import { OrderLink } from "@/components/OrderLink";
import { pageMeta } from "@/lib/seo";
import { getSite } from "@/lib/site";
import type { MenuItem, MenuSection } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = pageMeta(
  "/menu",
  "Food & Drinks",
  "Food and drinks from the printed lunch menu at Vinny's Bar & Grill. Lunch daily, 11–3pm. Order on Toast.",
);

export default async function MenuPage() {
  const site = await getSite();
  const sections = await listMenu("public");
  const showFootnote = sections.some((section) => section.items.some((item) => item.marked));
  return (
    <div className="page wrap">
      <TrackView name="menu_view" />
      <p className="eyebrow">Lunch menu</p>
      <h1>Food &amp; Drinks at Vinny&apos;s</h1>
      <p className="lunch-line">{LUNCH_SERVICE}</p>
      <p>
        <OrderLink className="btn btn-solid" url={site.toastUrl} />
      </p>
      <PhotoStrip />
      {sections.length === 0 ? (
        <p>The menu has not been published yet.</p>
      ) : (
        <div className="paper menu-sheet">
          {sections.map((section) => (
            <MenuBlock key={section.id} section={section} />
          ))}
          {showFootnote ? (
            <p className="menu-note">
              <span aria-hidden="true">* </span>
              {LUNCH_FOOTNOTE}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function MenuBlock({ section }: { section: MenuSection }) {
  const solo =
    section.items.length === 1 &&
    section.items[0].name.toLowerCase() === section.name.toLowerCase() &&
    !section.items[0].description;
  if (solo) {
    const item = section.items[0];
    return (
      <section className="menu-section" aria-labelledby={`section-${section.id}`}>
        <div className="menu-top">
          <h2 id={`section-${section.id}`}>{section.name}</h2>
          <span className="dots" aria-hidden="true" />
          <span className="price">{formatPrice(item.price)}</span>
        </div>
      </section>
    );
  }
  return (
    <section className="menu-section" aria-labelledby={`section-${section.id}`}>
      <h2 id={`section-${section.id}`}>{section.name}</h2>
      {section.blurb ? <p className="menu-blurb">{section.blurb}</p> : null}
      <ul className="menu-list">
        {section.items.map((item) => (
          <MenuRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

function MenuRow({ item }: { item: MenuItem }) {
  return (
    <li className="menu-item">
      <div className="menu-top">
        <strong>
          {item.marked ? <span className="mark">* </span> : null}
          {item.name}
          {item.gluten_free ? <span className="chip">Gluten free</span> : null}
        </strong>
        <span className="dots" aria-hidden="true" />
        <span className="price">{formatPrice(item.price)}</span>
      </div>
      {item.description ? <p>{item.description}</p> : null}
    </li>
  );
}
