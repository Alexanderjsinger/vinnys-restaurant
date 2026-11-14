"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

/**
 * Framed homepage hero media — ambient cinematic reel (not a video player chrome).
 * Approved sizzle via /api/sizzle (Range 206); poster remains meet-me.jpg.
 *
 * Playback:
 * - Poster first; muted inline play when ~50% visible (IntersectionObserver).
 * - Auto-pause off-viewport / tab hidden; never override a manual pause.
 * - Play once (~30s), hold end frame; replay only via discreet corner control.
 * - prefers-reduced-motion + Save-Data → still poster only.
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
  el.loop = false;
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  el.setAttribute("muted", "");
}

function connectionWantsDataSave(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    mozConnection?: { saveData?: boolean };
    webkitConnection?: { saveData?: boolean };
  };
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  return Boolean(conn?.saveData);
}

function visibleRatio(el: Element): number {
  const rect = el.getBoundingClientRect();
  if (rect.height <= 0) return 0;
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
  return Math.max(0, Math.min(1, visible / rect.height));
}

export function HeroMedia({
  videoSrc = null,
  durationLabel: _durationLabel = null,
  poster = DEFAULT_POSTER,
  overlay,
}: {
  videoSrc?: string | null;
  /** Kept for call-site honesty; not shown in ambient chrome. */
  durationLabel?: string | null;
  poster?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    credit: string;
  };
  /** Optional overlay — prefer keeping CTAs outside the moving frame. */
  overlay?: ReactNode;
}) {
  void _durationLabel;
  const frameRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const manualPauseRef = useRef(false);
  const playGenRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [saveData, setSaveData] = useState(false);

  const canPlayVideo = Boolean(videoSrc) && !reduceMotion && !saveData;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setSaveData(connectionWantsDataSave());
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    const frame = frameRef.current;
    if (!el || !frame || !canPlayVideo) return;

    prepareVideoEl(el);

    const syncPlaying = () => {
      setPlaying(!el.paused && !el.ended);
      if (!el.ended) setEnded(false);
    };
    const onEnded = () => {
      setPlaying(false);
      setEnded(true);
    };
    const onError = () => setPlaying(false);

    el.addEventListener("play", syncPlaying);
    el.addEventListener("playing", syncPlaying);
    el.addEventListener("pause", syncPlaying);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);

    const tryAmbientPlay = () => {
      if (manualPauseRef.current) return;
      if (el.ended) return;
      if (document.visibilityState === "hidden") return;
      prepareVideoEl(el);
      const gen = ++playGenRef.current;
      void el
        .play()
        .then(() => {
          if (gen !== playGenRef.current) return;
          setPlaying(!el.paused && !el.ended);
        })
        .catch(() => {
          if (gen !== playGenRef.current) return;
          setPlaying(false);
        });
    };

    const pauseAmbient = () => {
      if (!el.paused) el.pause();
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          tryAmbientPlay();
        } else {
          pauseAmbient();
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(frame);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        pauseAmbient();
        return;
      }
      if (manualPauseRef.current || el.ended) return;
      if (visibleRatio(frame) >= 0.5) tryAmbientPlay();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      playGenRef.current += 1;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      el.removeEventListener("play", syncPlaying);
      el.removeEventListener("playing", syncPlaying);
      el.removeEventListener("pause", syncPlaying);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
  }, [canPlayVideo, videoSrc]);

  function togglePlayback() {
    const el = videoRef.current;
    if (!el || !canPlayVideo) return;
    prepareVideoEl(el);

    if (el.paused || el.ended) {
      manualPauseRef.current = false;
      if (el.ended || ended) {
        el.currentTime = 0;
        setEnded(false);
      }
      // User gesture stack — required for iOS after a blocked autoplay.
      setPlaying(true);
      void el.play().catch(() => {
        setPlaying(false);
      });
      return;
    }

    manualPauseRef.current = true;
    el.pause();
    setPlaying(false);
  }

  const controlLabel = ended
    ? "Replay atmosphere reel"
    : playing
      ? "Pause atmosphere reel"
      : "Play atmosphere reel";

  return (
    <div className="framed-hero">
      <section
        ref={frameRef}
        className="framed-hero-frame"
        aria-label="Vinny's atmosphere"
      >
        <figure className="framed-hero-media">
          {canPlayVideo && videoSrc ? (
            <video
              ref={videoRef}
              className="hero-video"
              muted
              playsInline
              preload="metadata"
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

        {canPlayVideo ? (
          <div className="framed-hero-chrome">
            <button
              type="button"
              className="framed-ambient-control"
              onClick={togglePlayback}
              aria-pressed={playing}
              aria-label={controlLabel}
            >
              <span
                className="framed-play-icon"
                data-paused={playing ? "false" : "true"}
                aria-hidden="true"
              />
            </button>
          </div>
        ) : null}

        {overlay ? <div className="framed-hero-overlay">{overlay}</div> : null}
      </section>
      <p className="framed-hero-credit">{poster.credit}</p>
    </div>
  );
}
