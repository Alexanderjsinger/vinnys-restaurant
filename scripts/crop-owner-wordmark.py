#!/usr/bin/env python3
"""Tight-crop black Vinny's from owner reference; transparent + padding."""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

PAD = 16


def green_pixel(r: np.ndarray, g: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Green 'U' scrap and olive fringes (not black letterforms)."""
    ri, gi, bi = r.astype(np.int16), g.astype(np.int16), b.astype(np.int16)
    sum_rgb = ri + gi + bi
    return (
        ((gi > ri + 2) & (gi > bi + 5) & (ri < 110) & (sum_rgb < 260))
        | ((gi >= ri) & (gi > bi + 3) & (ri < 95) & (gi > 72) & (sum_rgb < 275))
    )


def black_ink(r: np.ndarray, g: np.ndarray, b: np.ndarray) -> np.ndarray:
    return (r < 92) & (g < 92) & (b < 92) & (r.astype(np.int16) + g.astype(np.int16) + b.astype(np.int16) < 265)


def bar_grill_zone(h: int, w: int) -> np.ndarray:
    """Mask of pixels belonging to BAR GRILL, not the y descender."""
    zone = np.zeros((h, w), dtype=bool)
    zone[162:, 215:] = True
    for y in range(155, 162):
        zone[y, 312:] = True
    return zone


def word_mask(arr: np.ndarray) -> np.ndarray:
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    h, w = r.shape
    ink = black_ink(r, g, b) & ~green_pixel(r, g, b)
    return ink & ~bar_grill_zone(h, w)


def crop_bounds(mask: np.ndarray) -> tuple[int, int, int, int]:
    # Left bound from main word band (avoids green-U scrap at x≈0).
    upper = mask[:125, :]
    uy, ux = np.where(upper)
    if ux.size == 0:
        raise RuntimeError("No ink found in owner crop")
    x0 = int(ux.min())
    ys, xs = np.where(mask)
    y0, y1 = int(ys.min()), int(ys.max())
    x1 = int(xs.max())
    return x0, y0, x1, y1


def build_alpha(
    arr: np.ndarray,
    keep: np.ndarray,
    offset: tuple[int, int],
    full_shape: tuple[int, int],
) -> np.ndarray:
    """Pure black ink with alpha from luminance; no coloured RGB bleed."""
    y0, x0 = offset
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    lum = (r.astype(np.float32) + g.astype(np.float32) + b.astype(np.float32)) / 3.0
    bar = bar_grill_zone(full_shape[0], full_shape[1])[y0 : y0 + arr.shape[0], x0 : x0 + arr.shape[1]]
    drop = green_pixel(r, g, b) | bar
    ink = keep & ~drop & (lum < 242)
    alpha = np.zeros(lum.shape, dtype=np.float32)
    alpha[ink] = np.clip((255.0 - lum[ink]) * (255.0 / 38.0), 0, 255)
    return alpha.astype(np.uint8)


def render(arr: np.ndarray, mask: np.ndarray, box: tuple[int, int, int, int]) -> Image.Image:
    x0, y0, x1, y1 = box
    crop = arr[y0 : y1 + 1, x0 : x1 + 1]
    keep = mask[y0 : y1 + 1, x0 : x1 + 1]
    alpha = build_alpha(crop, keep, (y0, x0), (arr.shape[0], arr.shape[1]))
    h, w = alpha.shape
    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[:, :, 3] = alpha
    return Image.fromarray(out, "RGBA")


def qa_assert(img: Image.Image) -> None:
    a = np.array(img)
    r, g, b, al = a[:, :, 0], a[:, :, 1], a[:, :, 2], a[:, :, 3]
    ink = al > 40
    assert not np.any(ink & (g > r + 15) & (g > b + 10)), "green pixels in output"
    h = a.shape[0]
    bar_band = ink[max(0, h - 8) :, 250:]
    assert bar_band.sum() == 0, "BAR GRILL remnants at bottom-right"
    # Padding: no ink on outer PAD ring.
    ring = np.zeros(ink.shape, dtype=bool)
    ring[:PAD, :] = True
    ring[-PAD:, :] = True
    ring[:, :PAD] = True
    ring[:, -PAD:] = True
    assert not np.any(ink & ring), "ink touches padded edge"


def main() -> None:
    if len(sys.argv) != 4:
        print("usage: crop-owner-wordmark.py <src> <out-repo> <out-store>", file=sys.stderr)
        sys.exit(1)
    src, out_repo, out_store = map(Path, sys.argv[1:])
    if not src.is_file():
        print(f"missing source: {src}", file=sys.stderr)
        sys.exit(1)

    arr = np.array(Image.open(src).convert("RGBA"))
    mask = word_mask(arr)
    box = crop_bounds(mask)
    core = render(arr, mask, box)
    img = Image.new(
        "RGBA",
        (core.width + 2 * PAD, core.height + 2 * PAD),
        (0, 0, 0, 0),
    )
    img.paste(core, (PAD, PAD))
    qa_assert(img)

    for dest in (out_repo, out_store):
        dest.parent.mkdir(parents=True, exist_ok=True)
        img.save(dest, optimize=True)
    print(img.size[0], img.size[1])


if __name__ == "__main__":
    main()