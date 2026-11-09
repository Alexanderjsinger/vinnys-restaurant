"use client";

import { useEffect, useState } from "react";
import { HERO_LINE } from "@/lib/public";

type Poster = { src: string; alt: string };

const HERO_PLACEHOLDER: Poster = {
  src: "/hero/meet-me.jpg",
  alt: "Friends at a restaurant table with drinks and appetizers",
};

export function PosterSlider({ posters }: { posters: Poster[] }) {
  const [index, setIndex] = useState(0);
  const count = posters.length;

  useEffect(() => {
    if (count < 2) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 6500);
    return () => window.clearInterval(id);
  }, [count]);

  return (
    <section
      className="poster"
      aria-roledescription={count > 1 ? "carousel" : undefined}
      aria-label={count === 0 ? HERO_LINE : "Event posters"}
    >
      {count === 0 ? (
        <figure className="poster-frame is-active">
          <img src={HERO_PLACEHOLDER.src} alt={HERO_PLACEHOLDER.alt} width={1800} height={1203} />
          <figcaption className="poster-line">{HERO_LINE}</figcaption>
          <p className="poster-credit">Friends at a restaurant table. Not a photo of the dining room.</p>
        </figure>
      ) : (
        posters.map((poster, posterIndex) => (
          <figure
            key={poster.src}
            className={posterIndex === index ? "poster-frame is-active" : "poster-frame"}
            hidden={posterIndex !== index}
          >
            <img src={poster.src} alt={poster.alt} width={1200} height={1600} />
            <figcaption className="poster-line">{HERO_LINE}</figcaption>
          </figure>
        ))
      )}
      {count > 1 ? (
        <div className="poster-controls">
          <button
            type="button"
            className="btn"
            onClick={() => setIndex((current) => (current - 1 + count) % count)}
          >
            Previous poster
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setIndex((current) => (current + 1) % count)}
          >
            Next poster
          </button>
          <p className="poster-count">
            {index + 1} / {count}
          </p>
        </div>
      ) : null}
    </section>
  );
}
