"use client";

import { useEffect, useRef, useState } from "react";
import { HERO_LINE } from "@/lib/public";

/**
 * Full-bleed homepage hero. Video src is optional — when absent we ship the
 * poster/static frame so the layout is ready for an approved loop later.
 * Never invent footage; only wire a real file under public/ when one exists.
 */
const DEFAULT_POSTER = {
  src: "/hero/meet-me.jpg",
  alt: "Friends at a restaurant table with drinks and appetizers",
  width: 1800,
  height: 1203,
  credit:
    "Friends at a restaurant table. Not a photo of Vinny’s dining room.",
} as const;

export function HeroMedia({
  videoSrc = null,
  poster = DEFAULT_POSTER,
  line = HERO_LINE,
}: {
  videoSrc?: string | null;
  poster?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    credit: string;
  };
  line?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canPlayVideo = Boolean(videoSrc) && !reduceMotion;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !canPlayVideo) return;
    if (paused) {
      el.pause();
      return;
    }
    void el.play().catch(() => {
      /* Autoplay can fail; poster remains visible. */
    });
  }, [canPlayVideo, paused]);

  return (
    <div className="poster-band hero-media-band">
      <section className="poster hero-media" aria-label={line}>
        <figure className="poster-frame is-active">
          {canPlayVideo && videoSrc ? (
            <video
              ref={videoRef}
              className="hero-video"
              muted
              playsInline
              loop
              autoPlay
              poster={poster.src}
              aria-label={poster.alt}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : (
            <img
              src={poster.src}
              alt={poster.alt}
              width={poster.width}
              height={poster.height}
            />
          )}
          <figcaption className="poster-line">{line}</figcaption>
        </figure>
        {canPlayVideo ? (
          <div className="poster-controls hero-media-controls">
            <button
              type="button"
              className="btn"
              onClick={() => setPaused((value) => !value)}
              aria-pressed={paused}
            >
              {paused ? "Play video" : "Pause video"}
            </button>
          </div>
        ) : null}
      </section>
      <p className="poster-credit">{poster.credit}</p>
    </div>
  );
}
