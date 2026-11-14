"use client";

import { useId } from "react";

export type VinnyWordmarkSize = "sm" | "md" | "lg";
export type VinnyWordmarkSurface = "light" | "dark";

const SIZE_HEIGHT: Record<VinnyWordmarkSize, number> = {
  sm: 32,
  md: 40,
  lg: 72,
};

type VinnyWordmarkProps = {
  size?: VinnyWordmarkSize;
  surface?: VinnyWordmarkSurface;
  /** When true, parent link/heading owns the accessible name. */
  decorative?: boolean;
  className?: string;
};

/**
 * Vector wordmark echoing the physical bar sign: brushed silver letterforms with a warm halo.
 * Custom V with upward right stroke; lowercase inny's in rounded sans.
 */
export function VinnyWordmark({
  size = "md",
  surface = "light",
  decorative = false,
  className = "",
}: VinnyWordmarkProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `vinny-metal-${uid}`;
  const haloId = `vinny-halo-${uid}`;
  const height = SIZE_HEIGHT[size];
  const classes = ["vinny-wordmark", `vinny-wordmark--${size}`, `vinny-wordmark--${surface}`, className]
    .filter(Boolean)
    .join(" ");

  const ink = `url(#${gradId})`;

  return (
    <svg
      className={classes}
      width="auto"
      height={height}
      viewBox="0 0 286 64"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : "Vinny's"}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMid meet"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={surface === "dark" ? "#f2f4f7" : "#eceef2"} />
          <stop offset="18%" stopColor={surface === "dark" ? "#bcc3cd" : "#a8b0bb"} />
          <stop offset="52%" stopColor={surface === "dark" ? "#8e98a4" : "#7a8490"} />
          <stop offset="82%" stopColor={surface === "dark" ? "#c5ccd6" : "#b5bcc6"} />
          <stop offset="100%" stopColor={surface === "dark" ? "#e8ebef" : "#d8dde4"} />
        </linearGradient>
        <filter id={haloId} x="-14%" y="-45%" width="128%" height="210%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation={surface === "dark" ? "3" : "1.5"} result="blur" />
          <feFlood floodColor="#d4a83a" floodOpacity={surface === "dark" ? "0.9" : "0.5"} result="gold" />
          <feComposite in="gold" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g className="vinny-wordmark__letters" fill={ink} filter={`url(#${haloId})`}>
        <g fill="none" stroke={ink} strokeWidth="5.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 2 10 L 26 52" />
          <path d="M 26 52 C 32 42 54 14 118 8" />
        </g>
        <text
          x="124"
          y="49"
          className="vinny-wordmark__rest"
          fontSize="43"
          fontWeight="600"
          letterSpacing="-0.06em"
        >
          inny
        </text>
        <path className="vinny-wordmark__apostrophe" d="M 206 14 h 6 v 14 h -6 z" />
        <text x="218" y="49" className="vinny-wordmark__rest" fontSize="43" fontWeight="600">
          s
        </text>
      </g>
    </svg>
  );
}