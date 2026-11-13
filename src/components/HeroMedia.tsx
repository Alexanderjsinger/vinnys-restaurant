"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

/**
 * Framed homepage hero media (Stitch composition).
 * Approved sizzle reel lives under public/hero; poster remains meet-me.jpg.
 * Duration labels must come from a measured file — never invent timecodes.
 */
const DEFAULT_POSTER = {
  src: "/hero/meet-me.jpg",
  alt: "Friends at a restaurant table with drinks and appetizers",
  width: 1800,
  height: 1203,
  credit:
    "Atmosphere reel from Vinny’s. Poster still is a stock table photo — Not a photo of Vinny’s dining room.",
} as const;

export function HeroMedia({
  videoSrc = null,
  durationLabel = null,
  poster = DEFAULT_POSTER,
  overlay,
}: {
  videoSrc?: string | null;
  /** Honest measured length only (e.g. "0:30"). Omit rather than invent. */
  durationLabel?: string | null;
  poster?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    credit: string;
  };
  overlay?: ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const canPlayVideo = Boolean(videoSrc) && !reduceMotion;
  const watchLabel = canPlayVideo
    ? durationLabel
      ? `Watch atmosphere reel (${durationLabel})`
      : "Watch atmosphere reel"
    : "Atmosphere · still frame";

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
      /* Autoplay can fail; keep poster/chrome honest. */
      setPaused(true);
    });
  }, [canPlayVideo, paused]);

  return (
    <div className="framed-hero">
      <section className="framed-hero-frame" aria-label="Vinny's atmosphere">
        <figure className="framed-hero-media">
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
        </figure>

        <div className="framed-hero-chrome" aria-hidden={canPlayVideo ? undefined : true}>
          <p className="framed-hero-watch">{watchLabel}</p>
          {canPlayVideo ? (
            <button
              type="button"
              className="framed-play"
              onClick={() => setPaused((value) => !value)}
              aria-pressed={!paused}
              aria-label={paused ? "Play video" : "Pause video"}
            >
              <span className="framed-play-icon" data-paused={paused ? "true" : "false"} />
            </button>
          ) : (
            <span className="framed-play" aria-hidden="true">
              <span className="framed-play-icon" data-paused="" />
            </span>
          )}
        </div>

        {overlay ? <div className="framed-hero-overlay">{overlay}</div> : null}
      </section>
      <p className="framed-hero-credit">{poster.credit}</p>
    </div>
  );
}
