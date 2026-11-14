"use client";

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
 * Solid logomark derived from the physical Vinny's sign: distinctive swoop V plus lowercase inny's.
 * No metallic fill or halo — black on light surfaces, warm off-white on dark.
 */
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
      viewBox="0 0 298 68"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : "Vinny's"}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMid meet"
    >
      <g className="vinny-wordmark__letters" fill="currentColor">
        {/* V: left leg + upward-sweeping right stroke (sign checkmark brush) */}
        <path
          className="vinny-wordmark__v"
          fill="none"
          stroke="currentColor"
          strokeWidth="6.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M 2 14 L 24 52 M 24 52 C 31 43 50 16 116 6"
        />
        <text
          x="120"
          y="51"
          className="vinny-wordmark__rest"
          fontSize="44"
          fontWeight="650"
          letterSpacing="-0.05em"
        >
          inny
        </text>
        <path
          className="vinny-wordmark__apostrophe"
          d="M 206.5 13 a 3.4 3.4 0 0 1 6.8 0 v 16 a 3.4 3.4 0 0 1 -6.8 0 Z"
        />
        <text x="220" y="51" className="vinny-wordmark__rest" fontSize="44" fontWeight="650" letterSpacing="-0.02em">
          s
        </text>
      </g>
    </svg>
  );
}