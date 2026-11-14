#!/usr/bin/env python3
"""Tight-crop black Vinny's from owner reference; transparent + padding."""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

BAR_GRILL_ROW = 162
PAD = 10
INK_MAX = 95
INK_SUM_MAX = 260


def ink_mask(arr: np.ndarray) -> np.ndarray:
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    greenish = (g.astype(np.int16) > r.astype(np.int16) + 5) & (
        g.astype(np.int16) > b.astype(np.int16) + 10
    ) & (r < 120)
    return (
        (r < INK_MAX)
        & (g < INK_MAX)
        & (b < INK_MAX)
        & ((r.astype(np.int16) + g.astype(np.int16) + b.astype(np.int16)) < INK_SUM_MAX)
        & ~greenish
    )


def crop_bounds(mask: np.ndarray) -> tuple[int, int, int, int]:
    word = mask.copy()
    word[BAR_GRILL_ROW:, :] = False
    # Exclude green-U residue: leftmost x from upper band (V), not y-tail at x=0.
    upper = word[:120, :]
    uy, ux = np.where(upper)
    if ux.size == 0:
        raise RuntimeError("No ink found in owner crop")
    x0 = int(ux.min())
    uy2, ux2 = np.where(word)
    y0, y1 = int(uy2.min()), int(uy2.max())
    x1 = int(ux2.max())
    return x0, y0, x1, y1


def to_rgba(crop: np.ndarray) -> Image.Image:
    gray = crop[:, :, :3].mean(axis=2)
    # Paper ~253 → alpha 0; ink → alpha from darkness (preserve AA).
    alpha = np.clip((255 - gray) * (255 / 45), 0, 255).astype(np.uint8)
    alpha[gray > 248] = 0
    out = np.zeros((*crop.shape[:2], 4), dtype=np.uint8)
    out[:, :, :3] = crop[:, :, :3]
    out[:, :, 3] = alpha
    return Image.fromarray(out, "RGBA")


def main() -> None:
    if len(sys.argv) != 4:
        print("usage: crop-owner-wordmark.py <src> <out-repo> <out-store>", file=sys.stderr)
        sys.exit(1)
    src, out_repo, out_store = map(Path, sys.argv[1:])
    if not src.is_file():
        print(f"missing source: {src}", file=sys.stderr)
        sys.exit(1)

    arr = np.array(Image.open(src).convert("RGBA"))
    mask = ink_mask(arr)
    x0, y0, x1, y1 = crop_bounds(mask)
    y0 = max(0, y0 - PAD)
    x1 = min(arr.shape[1] - 1, x1)
    # Do not expand left (green "U" scrap) or below (BAR GRILL); pad transparently later.
    y1 = min(y1, BAR_GRILL_ROW - 1)
    cropped = arr[y0 : y1 + 1, x0 : x1 + 1]
    core = to_rgba(cropped)
    img = Image.new(
        "RGBA",
        (core.width + 2 * PAD, core.height + 2 * PAD),
        (0, 0, 0, 0),
    )
    img.paste(core, (PAD, PAD))

    for dest in (out_repo, out_store):
        dest.parent.mkdir(parents=True, exist_ok=True)
        img.save(dest, optimize=True)
    print(img.size[0], img.size[1])


if __name__ == "__main__":
    main()