/**
 * Sign-traced metrics for VinnyWordmark (flat 2D). v4 pass — tight lockup under V right arm.
 * Verify with `node scripts/wordmark-compare-shot.mjs` and `wordmark-overlay-shot.mjs`.
 *
 * | Metric | Value |
 * | --- | ---: |
 * | viewBox | 162 × 56 |
 * | V left top | (13, 41.2) |
 * | V vertex | (36, 50.6) |
 * | V right tip | (60, 9) |
 * | V stroke | 4.35 |
 * | i-dot | (49.2, 25.2) |
 * | n stems ~ | 61.2 / 75 / 88.8, s opens ~102 |
 * | L_STROKE | 3.35 |
 *
 * Overlay tune (reference v2 crop): scripts/wordmark-overlay-shot.mjs OVERLAY_* constants.
 */

export const VINNY_WORDMARK_VIEWBOX = "0 0 162 56" as const;

export const VINNY_WORDMARK_BASELINE = 47;
export const VINNY_WORDMARK_X_HEIGHT = 22;
export const VINNY_WORDMARK_LETTER_STROKE = 3.35;

/** Dev overlay alignment against vinnys-bar-logo-reference-v2.png (fractions of image box). */
export const VINNY_WORDMARK_OVERLAY = {
  clipTop: 0.31,
  clipRight: 0.11,
  clipBottom: 0.36,
  clipLeft: 0.1,
  svgPadLeft: 0.07,
  svgPadTop: 0.035,
  svgWidth: 0.8,
} as const;