"use client";

export type VinnyWordmarkSize = "sm" | "md" | "lg";
export type VinnyWordmarkSurface = "light" | "dark";

const SIZE_HEIGHT: Record<VinnyWordmarkSize, number> = {
  sm: 32,
  md: 40,
  lg: 72,
};

const WORDMARK_SRC = "/brand/vinnys-wordmark.png";

type VinnyWordmarkProps = {
  size?: VinnyWordmarkSize;
  surface?: VinnyWordmarkSurface;
  decorative?: boolean;
  className?: string;
};

/** Raster logomark cropped from printed menu (vinnys-menu-logomark.png). Not the potrace SVG. */
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

  const width = Math.round(height * (682 / 110));

  return (
    // eslint-disable-next-line @next/next/no-img-element -- menu-derived raster mark (PR #32)
    <img
      className={classes}
      src={WORDMARK_SRC}
      width={width}
      height={height}
      alt={decorative ? "" : "Vinny's"}
      aria-hidden={decorative ? true : undefined}
      decoding="async"
      draggable={false}
    />
  );
}