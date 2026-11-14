"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

/**
 * Framed homepage hero media (Stitch composition).
 * Approved sizzle reel lives under public/hero; poster remains meet-me.jpg.
 * Duration labels must come from a measured file — never invent timecodes.
 *
 * Mobile / iOS notes:
 * - Call play() inside the tap handler (user gesture), not only in an effect.
 * - Keep muted + playsInline (and webkit-playsinline) before play().
 * - Sync chrome to real playing/pause events so a stuck poster never shows a pause icon.
 * - prefers-reduced-motion → still poster only.
 */
const DEFAULT_POSTER = {
  src: "/hero/meet-me.jpg",
  alt: "Friends at a restaurant table with drinks and appetizers",
  width: 1800,
  height: 1203,
  credit:
    "Atmosphere reel from Vinny’s. Poster still is a stock table photo — Not a photo of Vinny’s dining room.",
} as const;

function prepareVideoEl(el: HTMLVideoElement) {
  el.muted = true;
  el.defaultMuted = true;
  el.playsInline = true;
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  el.setAttribute("muted", "");
}

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
  const [playing, setPlaying] = useState(false);
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

    prepareVideoEl(el);

    const syncPlaying = () => setPlaying(!el.paused);
    const onError = () => setPlaying(false);

    el.addEventListener("play", syncPlaying);
    el.addEventListener("playing", syncPlaying);
    el.addEventListener("pause", syncPlaying);
    el.addEventListener("ended", syncPlaying);
    el.addEventListener("error", onError);

    // Muted autoplay where allowed (desktop / some Android). iOS often blocks —
    // chrome stays on the play affordance until a tap calls play() in-gesture.
    void el
      .play()
      .then(() => setPlaying(!el.paused))
      .catch(() => setPlaying(false));

    return () => {
      el.removeEventListener("play", syncPlaying);
      el.removeEventListener("playing", syncPlaying);
      el.removeEventListener("pause", syncPlaying);
      el.removeEventListener("ended", syncPlaying);
      el.removeEventListener("error", onError);
    };
  }, [canPlayVideo, videoSrc]);

  function togglePlayback() {
    const el = videoRef.current;
    if (!el || !canPlayVideo) return;
    prepareVideoEl(el);
    if (el.paused) {
      // Must stay inside the tap/click stack for iOS; update chrome immediately.
      setPlaying(true);
      void el.play().catch(() => {
        setPlaying(false);
      });
      return;
    }
    el.pause();
    setPlaying(false);
  }

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
              preload="metadata"
              poster={poster.src}
              aria-label={poster.alt}
              onClick={togglePlayback}
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
              onClick={togglePlayback}
              aria-pressed={playing}
              aria-label={playing ? "Pause video" : "Play video"}
            >
              <span className="framed-play-icon" data-paused={playing ? "false" : "true"} />
            </button>
          ) : (
            <span className="framed-play" aria-hidden="true">
              <span className="framed-play-icon" data-paused="true" />
            </span>
          )}
        </div>

        {overlay ? <div className="framed-hero-overlay">{overlay}</div> : null}
      </section>
      <p className="framed-hero-credit">{poster.credit}</p>
    </div>
  );
}
