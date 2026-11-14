import { execSync } from "node:child_process";

const BORDER = 4;
/** ImageMagick fx:minima is 0–1; ink darker than this fails the border ring. */
const MIN_WHITE_NORM = 247 / 255;

/**
 * Assert the outer `borderPx` ring of a PNG is background (near-white).
 */
export function assertOuterBorderBackground(pngPath, borderPx = BORDER) {
  const dim = execSync(`identify -format "%w %h" "${pngPath}"`, { encoding: "utf8" }).trim().split(/\s+/).map(Number);
  const [w, h] = dim;
  if (w < borderPx * 2 + 1 || h < borderPx * 2 + 1) {
    throw new Error(`Image ${w}x${h} too small for ${borderPx}px border check`);
  }

  const regions = [
    { label: "top", geom: `${w}x${borderPx}+0+0` },
    { label: "bottom", geom: `${w}x${borderPx}+0+${h - borderPx}` },
    { label: "left", geom: `${borderPx}x${h}+0+0` },
    { label: "right", geom: `${borderPx}x${h}+${w - borderPx}+0` },
  ];

  for (const { label, geom } of regions) {
    const min = Number(
      execSync(`convert "${pngPath}" -crop ${geom} +repage -alpha off -colorspace Gray -format "%[fx:minima]" info:`, {
        encoding: "utf8",
      }).trim(),
    );
    if (min < MIN_WHITE_NORM) {
      throw new Error(
        `Border ${label} has ink (darkest=${min.toFixed(1)}); need background only in outer ${borderPx}px`,
      );
    }
  }
  return { width: w, height: h, borderPx };
}