"use client";

import {
  VINNY_MENU_TRACE_PATHS,
  VINNY_MENU_TRACE_TRANSFORM,
  VINNY_MENU_TRACE_VIEWBOX,
} from "@/lib/vinny-wordmark-menu-paths";

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
  decorative?: boolean;
  className?: string;
};

/** Flat logomark: potrace of printed menu reference (vinnys-menu-logomark.png). */
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
      viewBox={VINNY_MENU_TRACE_VIEWBOX}
      overflow="visible"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : "Vinny's"}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMid meet"
    >
      <g fill="currentColor" transform={VINNY_MENU_TRACE_TRANSFORM}>
        {VINNY_MENU_TRACE_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}