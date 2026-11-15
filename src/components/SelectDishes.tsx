"use client";

import { useRef, useState } from "react";
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
  const photoDishes = dishes.filter((dish) => dish.photo);
  const [featureId, setFeatureId] = useState<number | null>(photoDishes[0]?.id ?? dishes[0]?.id ?? null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const rowRef = useRef<HTMLUListElement>(null);
  const feature = dishes.find((dish) => dish.id === featureId) ?? null;
  const photoIndex = feature ? photoDishes.findIndex((dish) => dish.id === feature.id) : -1;
  const rowDishes = dishes.filter((dish) => dish.id !== feature?.id);

  function showPhoto(direction: -1 | 1) {
    if (photoDishes.length < 2) return;
    const next = photoDishes[stepIndex(Math.max(photoIndex, 0), photoDishes.length, direction)];
    setFeatureId(next.id);
  }

  function scrollRow(direction: -1 | 1) {
    const row = rowRef.current;
    if (!row) return;
    const card = row.querySelector("li");
    const width = (card?.getBoundingClientRect().width ?? 184) + 12;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollBy({ left: direction * width, behavior: reduce ? "auto" : "smooth" });
  }

  if (!feature) {
    return <p>The menu has not been published yet.</p>;
  }

  return (
    <div className="select-dishes">
      <div className="select-stage" aria-roledescription="carousel" aria-label="Featured dish">
        {feature.photo ? (
          <figure className="select-feature-photo">
            <img
              src={feature.photo.src}
              alt={feature.photo.alt}
              width={feature.photo.width}
              height={feature.photo.height}
            />
            {photoDishes.length > 1 ? (
              <>
                <button type="button" className="select-photo-arrow select-photo-arrow-prev" onClick={() => showPhoto(-1)}>
                  <span className="sr-only">Previous dish</span>
                  <Arrow direction="prev" />
                </button>
                <button type="button" className="select-photo-arrow select-photo-arrow-next" onClick={() => showPhoto(1)}>
                  <span className="sr-only">Next dish</span>
                  <Arrow direction="next" />
                </button>
              </>
            ) : null}
          </figure>
        ) : null}
        <div className="select-card">
          <h3 id="select-dish-title">{feature.name}</h3>
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
            {photoDishes.length > 1 ? (
              <div className="select-dots">
                {photoDishes.map((dish, index) => (
                  <button
                    key={dish.id}
                    type="button"
                    className={dish.id === feature.id ? "is-current" : undefined}
                    aria-label={`Show ${dish.name}`}
                    aria-current={dish.id === feature.id ? "true" : undefined}
                    onClick={() => setFeatureId(dish.id)}
                  >
                    <span className="sr-only">{index + 1}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {rowDishes.length ? (
        <div className="select-row-wrap">
          <button type="button" className="select-row-arrow" onClick={() => scrollRow(-1)}>
            <span className="sr-only">Previous dishes</span>
            <Arrow direction="prev" />
          </button>
          <ul className="select-row" ref={rowRef}>
            {rowDishes.map((dish) => (
              <li key={dish.id}>
                {dish.photo ? (
                  <button type="button" className="select-row-card" onClick={() => setFeatureId(dish.id)}>
                    <DishFace dish={dish} />
                  </button>
                ) : (
                  <article className="select-row-card">
                    <DishFace dish={dish} />
                  </article>
                )}
              </li>
            ))}
          </ul>
          <button type="button" className="select-row-arrow" onClick={() => scrollRow(1)}>
            <span className="sr-only">Next dishes</span>
            <Arrow direction="next" />
          </button>
        </div>
      ) : null}

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
    </div>
  );
}

function DishFace({ dish }: { dish: SelectDish }) {
  return (
    <>
      {dish.photo ? (
        <figure className="select-row-photo">
          <img src={dish.photo.src} alt={dish.photo.alt} width={dish.photo.width} height={dish.photo.height} />
        </figure>
      ) : (
        <div className="select-row-text">
          {dish.description ? <p>{dish.description}</p> : null}
        </div>
      )}
      <span className="select-row-name">{dish.name}</span>
      {dish.price ? <span className="price">{formatPrice(dish.price)}</span> : null}
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
