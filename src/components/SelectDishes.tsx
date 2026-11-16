"use client";

import { useEffect, useState } from "react";
import { OrderLink } from "@/components/OrderLink";
import { formatPrice } from "@/lib/format";
import { menuForEasternTime } from "@/lib/menu-schedule";

export type SelectDishPhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type SelectDish = {
  id: number;
  name: string;
  description: string;
  price: string;
  section: string;
  glutenFree: boolean;
  photo: SelectDishPhoto | null;
};

export type SelectMenuItem = {
  id: number;
  name: string;
  description: string;
  price: string;
  glutenFree: boolean;
  marked: boolean;
};

export type SelectMenuSection = {
  id: number;
  name: string;
  blurb: string;
  items: SelectMenuItem[];
};

export type SelectMenu = {
  id: string;
  label: string;
  service: string;
  footnote: string | null;
  sections: SelectMenuSection[];
};

/** Present printed all-caps menu names consistently without changing stored content. */
function displayDishName(name: string) {
  return name.toLowerCase().replace(/(^|[\s(])([a-z])/g, (_, gap: string, letter: string) => gap + letter.toUpperCase());
}

function stepIndex(index: number, count: number, direction: -1 | 1) {
  if (count < 1) return 0;
  return (index + direction + count) % count;
}

export function SelectDishes({
  dishes,
  menus,
  toastUrl,
}: {
  dishes: SelectDish[];
  menus: SelectMenu[];
  toastUrl: string | null;
}) {
  const [featureId, setFeatureId] = useState<number | null>(dishes[0]?.id ?? null);
  const feature = dishes.find((dish) => dish.id === featureId) ?? null;
  const featureIndex = feature ? dishes.findIndex((dish) => dish.id === feature.id) : -1;

  function showDish(direction: -1 | 1) {
    if (dishes.length < 2) return;
    const next = dishes[stepIndex(Math.max(featureIndex, 0), dishes.length, direction)];
    setFeatureId(next.id);
  }

  if (!feature) {
    return <><p>Explore the menus below.</p><MenuChoices menus={menus} /></>;
  }

  return (
    <div className="select-dishes select-editorial">
      <div className="select-stage select-editorial-stage" role="region" aria-roledescription="carousel" aria-label="Featured dish">
        <div className="select-feature-media">
          {feature.photo ? (
            <img src={feature.photo.src} alt={feature.photo.alt} width={feature.photo.width} height={feature.photo.height} />
          ) : (
            <div className="select-photo-missing">
              <span className="micro-label">From the menu</span>
              <span>{displayDishName(feature.name)}</span>
            </div>
          )}
        </div>
        <div className="select-feature-panel">
          <div className="select-feature-meta">
            <span>{feature.section}</span>
            {feature.price ? <span className="select-feature-price">{formatPrice(feature.price)}</span> : null}
          </div>
          <h3 aria-live="polite" aria-atomic="true">{displayDishName(feature.name)}</h3>
          {feature.glutenFree ? <span className="chip">Gluten free</span> : null}
          {feature.description ? <div className="select-feature-description"><p>{feature.description}</p></div> : null}
          <div className="select-feature-bottom">
            <OrderLink className="btn select-feature-order" url={toastUrl}>Order online</OrderLink>
            {dishes.length > 1 ? <div className="select-feature-navigation" role="group" aria-label="Browse dishes">
              <button type="button" onClick={() => showDish(-1)} aria-label="Previous dish"><Arrow direction="prev" /></button>
              <button type="button" onClick={() => showDish(1)} aria-label="Next dish"><Arrow direction="next" /></button>
            </div> : null}
          </div>
        </div>
      </div>
      <div className="select-preview-rail" role="group" aria-label="Dish previews">
        {dishes.map(dish => <button key={dish.id} className={`select-preview${dish.id === feature.id ? " is-current" : ""}${dish.photo ? "" : " select-preview--text"}`} type="button" aria-label={`Preview ${dish.name}`} aria-pressed={dish.id === feature.id} onClick={() => setFeatureId(dish.id)}>
          {dish.photo ? <img src={dish.photo.src} alt="" width={dish.photo.width} height={dish.photo.height} loading="lazy" /> : null}
        </button>)}
      </div>
      <MenuChoices menus={menus} />
    </div>
  );
}

export function MenuChoices({ menus, initialMenu = null, showHeading = true }: { menus: SelectMenu[]; initialMenu?: string | null; showHeading?: boolean }) {
  const [openMenu, setOpenMenu] = useState<string | null>(initialMenu);
  useEffect(() => {
    // Recheck at arrival in case this route was prefetched before a service boundary.
    if (initialMenu !== null) setOpenMenu(menuForEasternTime());
    const sync = () => {
      const id = window.location.hash.replace("#select-menu-", "");
      if (menus.some(menu => menu.id === id)) setOpenMenu(id);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [menus, initialMenu]);
  return (
    <>
      {menus.length ? (
        <div className="select-menus">
          {showHeading ? <>
            <h2 className="select-menu-heading">Lunch, Happy Hour and Dinner</h2>
            <p className="select-menu-prompt">Meet me at Vinny’s, anytime</p>
          </> : null}
          <div className="select-menu-controls" role="group" aria-label="Select your menu">
            {menus.map((menu) => (
              <button
                key={menu.id}
                type="button"
                aria-expanded={openMenu === menu.id}
                aria-controls={`select-menu-${menu.id}`}
                onClick={() => setOpenMenu((current) => (current === menu.id ? null : menu.id))}
              >
                {menu.label}
                <svg className="menu-toggle-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" /></svg>
              </button>
            ))}
          </div>
          {menus.map((menu) =>
            openMenu === menu.id ? (
              <div key={menu.id} id={`select-menu-${menu.id}`} className="paper menu-sheet select-menu-panel">
                {menu.service ? <p className="lunch-line">{menu.service}</p> : null}
                {!menu.sections.length ? <p>{menu.label} menu details aren’t available online yet.</p> : null}
                {menu.sections.map((section) => (
                  <MenuBlock key={section.id} section={section} />
                ))}
                {menu.footnote ? (
                  <p className="menu-note">
                    <span aria-hidden="true">* </span>
                    {menu.footnote}
                  </p>
                ) : null}
              </div>
            ) : null,
          )}
        </div>
      ) : null}
    </>
  );
}

function MenuBlock({ section }: { section: SelectMenuSection }) {
  const solo =
    section.items.length === 1 &&
    section.items[0].name.toLowerCase() === section.name.toLowerCase() &&
    !section.items[0].description;
  if (solo) {
    const item = section.items[0];
    return (
      <section className="menu-section" aria-labelledby={`select-section-${section.id}`}>
        <div className="menu-top">
          <h2 id={`select-section-${section.id}`}>{section.name}</h2>
          <span className="dots" aria-hidden="true" />
          <span className="price">{formatPrice(item.price)}</span>
        </div>
      </section>
    );
  }
  return (
    <section className="menu-section" aria-labelledby={`select-section-${section.id}`}>
      <h2 id={`select-section-${section.id}`}>{section.name}</h2>
      {section.blurb ? <p className="menu-blurb">{section.blurb}</p> : null}
      <ul className="menu-list">
        {section.items.map((item) => (
          <li key={item.id} className="menu-item">
            <div className="menu-top">
              <strong>
                {item.marked ? <span className="mark">* </span> : null}
                {displayDishName(item.name)}
                {item.glutenFree ? <span className="chip">Gluten free</span> : null}
              </strong>
              <span className="dots" aria-hidden="true" />
              <span className="price">{formatPrice(item.price)}</span>
            </div>
            {item.description ? <p>{item.description}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Arrow({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d={direction === "prev" ? "M14.5 6.5 9 12l5.5 5.5" : "M9.5 6.5 15 12l-5.5 5.5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
