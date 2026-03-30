#!/usr/bin/env python3
"""
Build DogRoutine app icons from the Stitch raster.

Why row/column “trim white” fails here
    Edge rows are almost never 100%% white: anti-aliasing and artwork reach the
    border, so “all pixels in this row are white” never holds and nothing is cut.

What we do instead
    1. Optional ``--fetch`` (Stitch CDN).
    2. **Edge flood-fill to transparent**: from every border pixel, flood into
       neighbors that look like **neutral paper** — high minimum RGB (light) and
       **low saturation** ``max(R,G,B) - min(R,G,B)``. Saturated illustration
       colors block the flood, so interior art (even light grays) stays opaque.
    3. **Crop** to the bounding box of pixels with alpha above a small epsilon.
    4. **Fringe bbox**: crop to anything that is not “discardable” — transparent
       or neutral near-white (removes a 1–2px white ring the flood can miss).
    5. **Neutral halo strips**: peel 1px off any edge whose opaque pixels are
       uniformly light (p25 of min(R,G,B) high) and low-chroma. Fixes a **bottom
       mat row** and **right gray fringe** that sit below 248,248,248 but read
       as white on dark backgrounds.
    6. **Flood from transparency**: BFS from every near-transparent pixel into
       **neutral light** neighbors (min RGB, chroma cap, optional luminance floor).
       Removes halos that are disconnected from the image border (e.g. after
       crop) and gray **anti-alias skirts** (mn ~190) that still read as a white
       aura on black.
    7. Re-**crop** to alpha bbox, **center square**, **LANCZOS** resize to
       ``--output-size``, then repeat (6)+(crop) once to kill resize fringes.
    8. **Symmetric edge inset** (default 2px): crop an equal margin on all sides,
       then resize again and run (6) once. Removes **uniform mat lines**
       (e.g. entire left column ~187 gray) that resampling leaves behind.
    9. **Outer-ring wipe**: on the final 1px frame, alpha=0 for neutral light
       pixels (catches semi-transparent gray corners that no flood reaches).

Requires: ``pip install pillow numpy``

On macOS Homebrew Python (PEP 668)::

    python3 -m venv .venv && .venv/bin/pip install pillow numpy
    .venv/bin/python scripts/strip-icon-white-bg.py --fetch
"""

from __future__ import annotations

import argparse
import io
import sys
import urllib.request
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

DEFAULT_FETCH_URL = (
    "https://lh3.googleusercontent.com/aida/ADBb0ugBXjCsMOmKXw-8A4klBfadQYs_EP-EI7nc249K4_K-g7RMK2LNfpOZiNhBMAbnaXcu648oFimVX7mFl-E1GFwYarA868L4wFomsuGiVJ72hYTyo1RWknvmC_4MLkatDo1QWF8vaS6MczRNls-hdZXz0IbD8br_TTElmvX4dgXvW9V_GqOEiCotrZ_jz-ZhSGiYNzsMKqAuhtXBkGSmD7tfmMGZtReoYDpG7ET_w6_Z5FswPkNP43fGLdro=s1024"
)


def fetch_png(url: str, timeout: int = 60) -> Image.Image:
    req = urllib.request.Request(url, headers={"User-Agent": "DogRoutine-icon-script/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = resp.read()
    return Image.open(io.BytesIO(data)).convert("RGBA")


def flood_edge_neutral_to_transparent(
    rgba: np.ndarray,
    *,
    white_min: int,
    max_chroma: int,
) -> np.ndarray:
    """
    Set alpha=0 for pixels connected to the image border through cells where
    min(R,G,B) >= white_min and (max-min) <= max_chroma.
    """
    h, w = rgba.shape[:2]
    rgb = rgba[:, :, :3].astype(np.int16)
    mn = rgb.min(axis=2)
    mx = rgb.max(axis=2)
    chroma = mx - mn
    walkable = (mn >= white_min) & (chroma <= max_chroma)

    visited = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        for y in (0, h - 1):
            if walkable[y, x]:
                visited[y, x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if walkable[y, x] and not visited[y, x]:
                visited[y, x] = True
                q.append((x, y))

    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and walkable[ny, nx] and not visited[ny, nx]:
                visited[ny, nx] = True
                q.append((nx, ny))

    out = rgba.copy()
    out[visited, 3] = 0
    return out


def crop_to_alpha_bbox(im: Image.Image, *, alpha_floor: int) -> Image.Image:
    a = np.asarray(im)[:, :, 3]
    rows = np.any(a > alpha_floor, axis=1)
    cols = np.any(a > alpha_floor, axis=0)
    if not rows.any() or not cols.any():
        return im
    y0, y1 = int(np.argmax(rows)), int(len(rows) - np.argmax(rows[::-1]) - 1)
    x0, x1 = int(np.argmax(cols)), int(len(cols) - np.argmax(cols[::-1]) - 1)
    return im.crop((x0, y0, x1 + 1, y1 + 1))


def crop_to_content_minus_fringe(
    im: Image.Image,
    *,
    alpha_floor: int,
    trim_white_min: int,
    trim_max_chroma: int,
) -> Image.Image:
    """
    One rectangular cut: keep the bbox of pixels that are not (transparent
    enough to ignore) and not (neutral paper white / anti-alias halo).
    """
    arr = np.asarray(im)
    h, w = arr.shape[:2]
    rgb = arr[:, :, :3].astype(np.int16)
    mn = rgb.min(axis=2)
    mx = rgb.max(axis=2)
    chroma = mx - mn
    a = arr[:, :, 3]
    discard = (a <= alpha_floor) | ((mn >= trim_white_min) & (chroma <= trim_max_chroma))
    keep = ~discard
    rows = np.any(keep, axis=1)
    cols = np.any(keep, axis=0)
    if not rows.any() or not cols.any():
        return im
    y0, y1 = int(np.argmax(rows)), int(len(rows) - np.argmax(rows[::-1]) - 1)
    x0, x1 = int(np.argmax(cols)), int(len(cols) - np.argmax(cols[::-1]) - 1)
    return im.crop((x0, y0, x1 + 1, y1 + 1))


def trim_neutral_halo_strips(
    arr: np.ndarray,
    *,
    alpha_floor: int,
    p25_min_mn: int,
    max_median_chroma: int,
) -> np.ndarray:
    """
    Repeatedly shave edges that are entirely transparent or look like a uniform
    neutral light mat (high p25 of min(R,G,B), low median chroma).
    """

    def should_remove_line(pixels: np.ndarray) -> bool:
        aa = pixels[:, 3]
        op = aa > alpha_floor
        if not np.any(op):
            return True
        rgb = pixels[op, :3].astype(np.int16)
        mn = rgb.min(axis=1)
        mx = rgb.max(axis=1)
        ch = mx - mn
        if float(np.percentile(mn, 25)) < p25_min_mn:
            return False
        if float(np.median(ch)) > max_median_chroma:
            return False
        return True

    a = arr
    while True:
        changed = False
        if a.shape[0] < 2 or a.shape[1] < 2:
            break
        while a.shape[0] > 1 and should_remove_line(a[0, :, :]):
            a = a[1:, :, :]
            changed = True
        while a.shape[0] > 1 and should_remove_line(a[-1, :, :]):
            a = a[:-1, :, :]
            changed = True
        while a.shape[1] > 1 and should_remove_line(a[:, 0, :]):
            a = a[:, 1:, :]
            changed = True
        while a.shape[1] > 1 and should_remove_line(a[:, -1, :]):
            a = a[:, :-1, :]
            changed = True
        if not changed:
            break
    return a


def flood_neutral_from_transparent(
    rgba: np.ndarray,
    *,
    white_min: int,
    max_chroma: int,
    alpha_seed: int,
    lum_min: float | None,
) -> np.ndarray:
    """
    Grow from all pixels with alpha <= alpha_seed into **8-neighbors** that
    satisfy neutral-light walk rules; cleared pixels get alpha 0. Diagonal
    steps bridge semi-transparent anti-alias so isolated light pixels on the
    bitmap edge still connect to seeds.
    """
    h, w = rgba.shape[:2]
    out = rgba.copy()
    rgb = out[:, :, :3].astype(np.float32)
    mn = rgb.min(axis=2)
    mx = rgb.max(axis=2)
    ch = mx - mn
    lum = rgb.mean(axis=2)
    walkable = (mn >= white_min) & (ch <= max_chroma)
    if lum_min is not None:
        walkable &= lum >= lum_min

    al = out[:, :, 3]
    q: deque[tuple[int, int]] = deque()
    seen = np.zeros((h, w), dtype=bool)
    for y in range(h):
        for x in range(w):
            if al[y, x] <= alpha_seed:
                seen[y, x] = True
                q.append((x, y))

    neighbors = [
        (dx, dy)
        for dy in (-1, 0, 1)
        for dx in (-1, 0, 1)
        if dx != 0 or dy != 0
    ]
    while q:
        x, y = q.popleft()
        for dx, dy in neighbors:
            nx, ny = x + dx, y + dy
            if (
                0 <= nx < w
                and 0 <= ny < h
                and not seen[ny, nx]
                and walkable[ny, nx]
                and al[ny, nx] > alpha_seed
            ):
                seen[ny, nx] = True
                out[ny, nx, 3] = 0
                q.append((nx, ny))
    return out


def center_square_crop(im: Image.Image) -> Image.Image:
    w, h = im.size
    if w == h:
        return im
    s = min(w, h)
    x0 = (w - s) // 2
    y0 = (h - s) // 2
    return im.crop((x0, y0, x0 + s, y0 + s))


def resize_square(im: Image.Image, size: int) -> Image.Image:
    if im.size[0] == size:
        return im
    return im.resize((size, size), Image.Resampling.LANCZOS)


def inset_crop_square(im: Image.Image, px: int) -> Image.Image:
    """Remove ``px`` pixels from each side (same width/height loss on both axes)."""
    if px <= 0:
        return im
    w, h = im.size
    if w <= 2 * px or h <= 2 * px:
        return im
    return im.crop((px, px, w - px, h - px))


def wipe_neutral_outer_ring(
    rgba: np.ndarray,
    *,
    ring: int,
    mn_min: int,
    max_chroma: int,
) -> np.ndarray:
    """
    On the outermost ``ring`` pixel(s), force alpha=0 where the color is neutral
    and light enough. Kills leftover semi-transparent gray corners after resize
    that never connect to a transparency seed.
    """
    if ring <= 0:
        return rgba
    out = rgba.copy()
    h, w = out.shape[:2]
    rgb = out[:, :, :3].astype(np.int16)
    mn = rgb.min(axis=2)
    mx = rgb.max(axis=2)
    ch = mx - mn
    kill = (mn >= mn_min) & (ch <= max_chroma)
    border = np.zeros((h, w), dtype=bool)
    border[:ring, :] = True
    border[-ring:, :] = True
    border[:, :ring] = True
    border[:, -ring:] = True
    a = out[:, :, 3].copy()
    a[border & kill] = 0
    out[:, :, 3] = a
    return out


def to_monochrome_foreground(img: Image.Image, *, white_cutoff: int) -> Image.Image:
    rgba = img.convert("RGBA")
    w, h = rgba.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    ipx = rgba.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = ipx[x, y]
            if a < 128:
                continue
            if min(r, g, b) >= white_cutoff:
                continue
            opx[x, y] = (255, 255, 255, a)
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fetch", action="store_true")
    parser.add_argument("--fetch-url", default=DEFAULT_FETCH_URL)
    parser.add_argument(
        "--white-min",
        type=int,
        default=245,
        help="Flood only into pixels with min(R,G,B) >= this (default 245). Lower = more aggressive.",
    )
    parser.add_argument(
        "--max-chroma",
        type=int,
        default=15,
        help="Flood only if max(R,G,B)-min(R,G,B) <= this (default 15). Lower = stricter neutral-only.",
    )
    parser.add_argument(
        "--alpha-floor",
        type=int,
        default=8,
        help="Ignore alpha below this when computing crop bbox.",
    )
    parser.add_argument(
        "--no-trim-fringe",
        action="store_true",
        help="Skip the extra rectangular cut that removes leftover edge white.",
    )
    parser.add_argument(
        "--trim-white-min",
        type=int,
        default=248,
        help="Fringe trim: min(R,G,B) >= this and low chroma counts as cuttable white (default 248).",
    )
    parser.add_argument(
        "--trim-max-chroma",
        type=int,
        default=18,
        help="Fringe trim: max(R,G,B)-min(R,G,B) must be <= this for cuttable white (default 18).",
    )
    parser.add_argument(
        "--no-halo-strip",
        action="store_true",
        help="Skip neutral halo strip peeling (bottom/right light fringe).",
    )
    parser.add_argument(
        "--halo-p25-min",
        type=int,
        default=191,
        help="Halo strip: peel edge if p25(min R,G,B) on opaque pixels >= this (default 191).",
    )
    parser.add_argument(
        "--halo-max-median-chroma",
        type=int,
        default=25,
        help="Halo strip: peel only if median edge chroma <= this (default 25).",
    )
    parser.add_argument(
        "--no-transparent-flood",
        action="store_true",
        help="Skip neutral flood grown from transparent pixels.",
    )
    parser.add_argument(
        "--tf-white-min",
        type=int,
        default=188,
        help="Transparent-flood: min(R,G,B) >= this for walkable neutral (default 188).",
    )
    parser.add_argument(
        "--tf-max-chroma",
        type=int,
        default=55,
        help="Transparent-flood: chroma <= this (default 55).",
    )
    parser.add_argument(
        "--tf-lum-min",
        type=float,
        default=88.0,
        help="Transparent-flood: mean(R,G,B) >= this (default 88).",
    )
    parser.add_argument(
        "--tf-alpha-seed",
        type=int,
        default=60,
        help="Transparent-flood: seed pixels with alpha <= this (default 60).",
    )
    parser.add_argument(
        "--edge-inset",
        type=int,
        default=2,
        help="After processing, crop this many pixels per side, resize, defringe (default 2). Use 0 to disable.",
    )
    parser.add_argument(
        "--no-edge-wipe",
        action="store_true",
        help="Skip neutral wipe on the outer 1px ring (see --edge-wipe-*).",
    )
    parser.add_argument(
        "--edge-wipe-mn",
        type=int,
        default=160,
        help="Outer ring: clear alpha if min(R,G,B) >= this and chroma low (default 160).",
    )
    parser.add_argument(
        "--edge-wipe-chroma",
        type=int,
        default=40,
        help="Outer ring: clear alpha if max-min RGB <= this (default 40).",
    )
    parser.add_argument("--output-size", type=int, default=1024)
    parser.add_argument("--source", type=Path, default=None)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root
    img_dir = root / "assets" / "images"
    master = img_dir / "icon.png"

    if args.fetch:
        im = fetch_png(args.fetch_url)
    elif args.source is not None:
        im = Image.open(args.source).convert("RGBA")
    else:
        im = Image.open(master).convert("RGBA")

    arr = np.asarray(im)
    arr = flood_edge_neutral_to_transparent(
        arr, white_min=args.white_min, max_chroma=args.max_chroma
    )
    im = Image.fromarray(arr, "RGBA")
    im = crop_to_alpha_bbox(im, alpha_floor=args.alpha_floor)
    if not args.no_trim_fringe:
        im = crop_to_content_minus_fringe(
            im,
            alpha_floor=args.alpha_floor,
            trim_white_min=args.trim_white_min,
            trim_max_chroma=args.trim_max_chroma,
        )
    if not args.no_halo_strip:
        arr = np.asarray(im)
        arr = trim_neutral_halo_strips(
            arr,
            alpha_floor=args.alpha_floor,
            p25_min_mn=args.halo_p25_min,
            max_median_chroma=args.halo_max_median_chroma,
        )
        im = Image.fromarray(arr, "RGBA")

    def transparent_flood_and_tighten(image: Image.Image) -> Image.Image:
        if args.no_transparent_flood:
            return image
        arr2 = np.asarray(image)
        arr2 = flood_neutral_from_transparent(
            arr2,
            white_min=args.tf_white_min,
            max_chroma=args.tf_max_chroma,
            alpha_seed=args.tf_alpha_seed,
            lum_min=args.tf_lum_min if args.tf_lum_min > 0 else None,
        )
        return crop_to_alpha_bbox(Image.fromarray(arr2, "RGBA"), alpha_floor=args.alpha_floor)

    im = transparent_flood_and_tighten(im)
    im = center_square_crop(im)
    im = resize_square(im, args.output_size)
    im = transparent_flood_and_tighten(im)
    im = resize_square(im, args.output_size)

    if args.edge_inset > 0:
        im = inset_crop_square(im, args.edge_inset)
        im = resize_square(im, args.output_size)
        im = transparent_flood_and_tighten(im)
        im = resize_square(im, args.output_size)

    if not args.no_edge_wipe:
        arr = np.asarray(im)
        arr = wipe_neutral_outer_ring(
            arr,
            ring=1,
            mn_min=args.edge_wipe_mn,
            max_chroma=args.edge_wipe_chroma,
        )
        im = crop_to_alpha_bbox(Image.fromarray(arr, "RGBA"), alpha_floor=args.alpha_floor)
        im = resize_square(im, args.output_size)

    im.save(master, optimize=True)
    for name in ("android-icon-foreground.png", "splash-icon.png"):
        im.save(img_dir / name, optimize=True)
    resize_square(im, 48).save(img_dir / "favicon.png", optimize=True)
    mono = to_monochrome_foreground(im, white_cutoff=min(args.white_min + 3, 252))
    mono.save(img_dir / "android-icon-monochrome.png", optimize=True)

    print("Updated:", master, "+ derivatives")
    if args.fetch:
        print("Source: fetched", args.fetch_url[:72] + "…")


if __name__ == "__main__":
    main()
