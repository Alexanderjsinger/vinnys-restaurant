"use client";

import { VINNY_WORDMARK_VIEWBOX } from "@/lib/vinny-wordmark-geometry";

export type VinnyWordmarkSize = "sm" | "md" | "lg";
export type VinnyWordmarkSurface = "light" | "dark";

const SIZE_HEIGHT: Record<VinnyWordmarkSize, number> = {
  sm: 32,
  md: 40,
  lg: 72,
};

const V_STROKE = 5.4;
const BODY_SIZE = 26.4;

type VinnyWordmarkProps = {
  size?: VinnyWordmarkSize;
  surface?: VinnyWordmarkSurface;
  decorative?: boolean;
  className?: string;
};

/** Flat black/white logomark traced to the physical Vinny's sign silhouette (no filters). */
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
          d="M 5 38 L 33 51.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={V_STROKE}
          strokeLinecap="butt"
          strokeLinejoin="round"
        />
        <circle className="vinny-wordmark__v-vertex" cx={33} cy={51.5} r={V_STROKE / 2} />
        <path
          className="vinny-wordmark__v-right"
          d="M 33 51.5 C 36 47.5 47 18 111 3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={V_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle className="vinny-wordmark__i-dot" cx={90.2} cy={26.5} r={3.1} />
        <rect className="vinny-wordmark__i-stem" x={87.7} y={30.8} width={5.1} height={16.2} rx={2.55} />

        <text
          className="vinny-wordmark__rest"
          fontSize={BODY_SIZE}
          fontWeight={640}
          letterSpacing="-0.06em"
          dominantBaseline="alphabetic"
        >
          <tspan x={97} y={47}>
            n
          </tspan>
          <tspan x={110.8} y={47}>
            n
          </tspan>
          <tspan x={124.5} y={47}>
            y
          </tspan>
          <tspan x={154.5} y={47}>
            s
          </tspan>
        </text>

        <path
          className="vinny-wordmark__apostrophe"
          d="M 147 17.6 C 149.1 17.6 150.2 19.5 150.2 22 C 150.2 24.6 149.1 27 148.7 28 C 148.4 28.7 147.3 28.7 147 27.9 C 146.5 26.8 145.4 24.5 145.4 22 C 145.4 19.5 146.1 17.6 147 17.6 Z"
        />
      </g>
    </svg>
  );
}