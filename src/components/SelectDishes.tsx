"use client";

import { useEffect, useState } from "react";
import { OrderLink } from "@/components/OrderLink";
import { formatPrice } from "@/lib/format";

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
    <div className="select-dishes">
      <div className={feature.photo ? "select-stage" : "select-stage select-stage--text"} role="region" aria-roledescription="carousel" aria-label="Featured dish">
        {feature.photo ? (
          <figure className="select-feature-photo">
            <img
              src={feature.photo.src}
              alt={feature.photo.alt}
              width={feature.photo.width}
              height={feature.photo.height}
            />
          </figure>
        ) : null}
        <div className="select-card">
          <h3 id="select-dish-title" aria-live="polite" aria-atomic="true">{feature.name}</h3>
          <p className="select-meta">
            {feature.section}
            {feature.price ? <span> · {formatPrice(feature.price)}</span> : null}
            {feature.glutenFree ? <span className="chip">Gluten free</span> : null}
          </p>
          {feature.description ? <p className="select-writeup">{feature.description}</p> : null}
          <div className="select-card-foot">
            <OrderLink className="btn btn-gold select-order" url={toastUrl}>
              Order online
            </OrderLink>
            {dishes.length > 1 ? (
              <div className="select-card-nav">
                <button type="button" className="select-card-arrow" onClick={() => showDish(-1)}>
                  <Arrow direction="prev" />
                  <span className="sr-only">Previous dish</span>
                </button>
                <div className="select-dots" role="group" aria-label="Featured dishes">
                  {dishes.map((dish) => (
                    <button
                      key={dish.id}
                      type="button"
                      className={dish.id === feature.id ? "is-current" : undefined}
                      aria-label={`Show ${dish.name}`}
                      aria-current={dish.id === feature.id ? "true" : undefined}
                      onClick={() => setFeatureId(dish.id)}
                    />
                  ))}
                </div>
                <button type="button" className="select-card-arrow" onClick={() => showDish(1)}>
                  <span>Next</span>
                  <Arrow direction="next" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <MenuChoices menus={menus} />
    </div>
  );
}

export function MenuChoices({ menus }: { menus: SelectMenu[] }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  useEffect(() => {
    const sync = () => {
      const id = window.location.hash.replace("#select-menu-", "");
      if (menus.some(menu => menu.id === id)) setOpenMenu(id);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [menus]);
  return (
    <>
      {menus.length ? (
        <div className="select-menus">
          <div className="select-menu-controls">
            {menus.map((menu) => (
              <button
                key={menu.id}
                type="button"
                aria-expanded={openMenu === menu.id}
                aria-controls={`select-menu-${menu.id}`}
                onClick={() => setOpenMenu((current) => (current === menu.id ? null : menu.id))}
              >
                {menu.label}
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
                {item.name}
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
