"use client";

import { VINNY_WORDMARK_VIEWBOX } from "@/lib/vinny-wordmark-geometry";

export type VinnyWordmarkSize = "sm" | "md" | "lg";
export type VinnyWordmarkSurface = "light" | "dark";

const SIZE_HEIGHT: Record<VinnyWordmarkSize, number> = {
  sm: 32,
  md: 40,
  lg: 72,
};

const V_STROKE = 4.35;
const L_STROKE = 3.35;

type VinnyWordmarkProps = {
  size?: VinnyWordmarkSize;
  surface?: VinnyWordmarkSurface;
  decorative?: boolean;
  className?: string;
};

/** Path-only flat logomark (no webfont) traced to the physical sign silhouettes. */
export function VinnyWordmark({
  size = "md",
  surface = "light",
  decorative = false,
  className = "",
}: VinnyWordmarkProps) {
  const height = SIZE_HEIGHT[size];
  const classes = ["vinny-wordmark", `vinny-wordmark--${size}`, `vinny-wordmark--${surface}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      className={classes}
      width="auto"
      height={height}
      viewBox={VINNY_WORDMARK_VIEWBOX}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : "Vinny's"}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMid meet"
    >
      <g className="vinny-wordmark__letters" fill="currentColor">
        <path
          className="vinny-wordmark__v-left"
          d="M 13 41.2 L 36 50.6"
          fill="none"
          stroke="currentColor"
          strokeWidth={V_STROKE}
          strokeLinecap="butt"
          strokeLinejoin="round"
        />
        <circle className="vinny-wordmark__v-vertex" cx={36} cy={50.6} r={V_STROKE / 2} />
        <path
          className="vinny-wordmark__v-right"
          d="M 36 50.6 C 37.8 48.6 41 36 60 9"
          fill="none"
          stroke="currentColor"
          strokeWidth={V_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle className="vinny-wordmark__i-dot" cx={49.2} cy={25.2} r={2.35} />
        <rect className="vinny-wordmark__i-stem" x={47.35} y={29.8} width={3.7} height={17.2} rx={1.85} />

        <path
          className="vinny-wordmark__n"
          d="M 61.2 47 V 27.2 C 61.2 25.1 62.6 24.1 64.5 24.1 C 66.2 24.1 67.4 25.2 67.4 27 V 47"
          fill="none"
          stroke="currentColor"
          strokeWidth={L_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="vinny-wordmark__n"
          d="M 75 47 V 27.2 C 75 25.1 76.4 24.1 78.3 24.1 C 80 24.1 81.2 25.2 81.2 27 V 47"
          fill="none"
          stroke="currentColor"
          strokeWidth={L_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="vinny-wordmark__y"
          d="M 88.8 47 V 29.2 C 88.8 27 90.4 24.8 92.6 24.8 C 94.6 24.8 96.2 26.6 96.2 28.8 V 47 M 92.6 29 L 95.2 50.5 C 95.8 51.4 96.6 51 96.2 49.8"
          fill="none"
          stroke="currentColor"
          strokeWidth={L_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          className="vinny-wordmark__apostrophe"
          d="M 99.2 19 C 100.3 19 101 20 101 21.2 C 101 22.5 100.3 23.5 100.15 23.9 C 99.95 24.2 99.45 24.2 99.3 23.85 C 99.1 23.4 98.5 22.3 98.5 21.1 C 98.5 19.9 98.85 19 99.2 19 Z"
        />

        <path
          className="vinny-wordmark__s"
          d="M 107.2 34 C 107.2 31.2 105.2 29.4 102.6 29.4 C 100 29.4 98.2 31 98.2 33 C 98.2 35.2 100.4 35.9 102.6 36.4 C 104.9 36.9 107.2 37.5 107.2 39.8 C 107.2 42.2 105.4 44 102.6 44 C 100 44 98.4 42.6 98.4 40.8"
          fill="none"
          stroke="currentColor"
          strokeWidth={L_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}