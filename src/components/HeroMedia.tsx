"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

/**
 * Framed homepage hero media — ambient cinematic reel (not a video player chrome).
 * Approved sizzle via /api/sizzle (Range 206). Poster is a still from that reel
 * at the bartender shot (~11.8s), so the first paint matches the video.
 *
 * Playback:
 * - Poster first; muted inline play when ~50% visible (IntersectionObserver).
 * - Loops for as long as it stays on screen. Pauses off-viewport / tab hidden.
 * - No play button, pause button, or other controls.
 * - prefers-reduced-motion + Save-Data → still poster only.
 */
const DEFAULT_POSTER = {
  src: "/hero/sizzle-bartender.jpg",
  alt: "Bartender serving cocktails to guests at the Vinny's bar",
  width: 1280,
  height: 720,
} as const;

function prepareVideoEl(el: HTMLVideoElement) {
  el.muted = true;
  el.defaultMuted = true;
  el.playsInline = true;
  el.loop = true;
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
  };
  /** Optional overlay — prefer keeping CTAs outside the moving frame. */
  overlay?: ReactNode;
}) {
  void _durationLabel;
  const frameRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playGenRef = useRef(0);
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

    const tryAmbientPlay = () => {
      if (document.visibilityState === "hidden") return;
      prepareVideoEl(el);
      playGenRef.current += 1;
      const gen = playGenRef.current;
      void el.play().catch(() => {
        if (gen !== playGenRef.current) return;
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
      if (visibleRatio(frame) >= 0.5) tryAmbientPlay();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      playGenRef.current += 1;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [canPlayVideo, videoSrc]);

  return (
    <div className="framed-hero">
      <section
        ref={frameRef}
        className="framed-hero-frame"
        aria-label="Vinny’s Bar & Grill atmosphere"
      >
        <figure className="framed-hero-media">
          {canPlayVideo && videoSrc ? (
            <video
              ref={videoRef}
              className="hero-video"
              muted
              loop
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

        {overlay ? <div className="framed-hero-overlay">{overlay}</div> : null}
      </section>
    </div>
  );
}
