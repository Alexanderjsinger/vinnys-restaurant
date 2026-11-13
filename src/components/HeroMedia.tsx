"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

/**
 * Framed homepage hero media (Stitch composition). Video src is optional —
 * when absent we ship the poster/static frame with play UI structure.
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
  overlay,
}: {
  videoSrc?: string | null;
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
  const [paused, setPaused] = useState(true);
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
          <p className="framed-hero-watch">
            {canPlayVideo ? "Watch atmosphere reel" : "Atmosphere · still frame"}
          </p>
          {canPlayVideo ? (
            <button
              type="button"
              className="framed-play"
              onClick={() => setPaused((value) => !value)}
              aria-pressed={!paused}
              aria-label={paused ? "Play video" : "Pause video"}
            >
              <span className="framed-play-icon" data-paused={paused || undefined} />
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
