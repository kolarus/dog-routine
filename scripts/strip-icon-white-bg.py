#!/usr/bin/env python3
"""
Post-process DogRoutine app icon PNGs.

Why this exists
    The master icon (Stitch / export) arrived as a 1024×1024 PNG with a flat,
    near-white frame around the squircle. For Expo we wanted transparency
    outside the artwork so Android adaptive icons show `backgroundColor`
    behind the mask and the asset looks correct on the web favicon.

Why not “delete every white pixel”?
    A global white threshold can erase light highlights inside the mark. This
    script only removes pixels that are (1) light enough and (2) connected to
    the image border via other light pixels—so interior whites stay unless they
    touch the edge.

    After that, an iterative “halo” pass (8-connected to transparency, several
    composited brightness/chroma rules) peels anti-aliased near-white that the
    flood fill cannot reach— including warm R-heavy fringe and ~180 RGB grays.

What it updates
    `assets/images/icon.png` (source of truth), then copies the result to the
    Android foreground and splash assets, rebuilds `favicon.png` at 48×48,
    and writes `android-icon-monochrome.png` as white-on-transparent for
    themed adaptive icons.

When to run
    After you replace `assets/images/icon.png` with a new export that still has
    an outer white mat. Requires Pillow (`pip install pillow`).

Requires: Pillow (PIL).
"""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


def strip_edge_white(
    img: Image.Image,
    *,
    min_channel: int = 238,
) -> Image.Image:
    """
    Flood-fill from every edge pixel; expand through pixels whose min(R,G,B)
    is at least `min_channel` (near-white / light gray). Matched pixels get
    alpha 0. Tune `--min-channel` if a halo remains or detail is clipped.
    """
    rgba = img.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()

    def is_bg(x: int, y: int) -> bool:
        r, g, b, _ = px[x, y]
        return min(r, g, b) >= min_channel

    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        for y in (0, h - 1):
            if not visited[y][x] and is_bg(x, y):
                visited[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not visited[y][x] and is_bg(x, y):
                visited[y][x] = True
                q.append((x, y))

    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx] and is_bg(nx, ny):
                visited[ny][nx] = True
                q.append((nx, ny))

    out = rgba.copy()
    opx = out.load()
    for y in range(h):
        for x in range(w):
            if visited[y][x]:
                r, g, b, _ = opx[x, y]
                opx[x, y] = (r, g, b, 0)
    return out


def _neighbor8_transparent(px, w: int, h: int, x: int, y: int) -> bool:
    for nx in (x - 1, x, x + 1):
        for ny in (y - 1, y, y + 1):
            if nx == x and ny == y:
                continue
            if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0:
                return True
    return False


def _looks_like_white_halo(r: int, g: int, b: int, *, min_rgb: int, max_chroma: int) -> bool:
    """
    True for near-white / gray anti-alias and for light white+brand blends on
    the outer edge. Tuned so saturated interior colors (low min channel) stay.
    """
    lo, hi = min(r, g, b), max(r, g, b)
    chroma = hi - lo
    avg = (r + g + b) / 3.0

    if lo >= min_rgb and chroma <= max_chroma:
        return True
    # Just under the min_rgb box (e.g. 187 vs 188) with modest chroma.
    if lo >= min_rgb - 12 and chroma <= max_chroma + 12 and avg >= 218:
        return True
    # Near-neutral gray anti-alias (channels almost equal); avg can sit ~172–184.
    if chroma <= 25 and lo >= 165 and avg >= 172:
        return True
    # White blended with a bit of brand color (moderate chroma, still “mist”).
    if lo >= 172 and chroma <= 68 and 202 <= avg <= 238:
        return True
    # Warm light fringe: one channel still very bright, others dragged down by anti-alias.
    if (
        hi >= 222
        and lo >= 118
        and chroma <= 115
        and 172 <= avg <= 240
    ):
        return True
    # Hot channel + cream/yellow anti-alias (chroma can exceed 110).
    if hi >= 232 and lo >= 112 and chroma <= 125 and 168 <= avg <= 202:
        return True
    # Mid “mist”: no single channel spikes, but still a light blend on the rim.
    if hi >= 210 and lo >= 165 and 30 <= chroma <= 55 and 188 <= avg <= 205:
        return True
    # Bright tinted fringe: high mean, not too saturated (white mixed with ink).
    if avg >= 222 and chroma <= max_chroma + 35 and lo >= 155:
        return True
    # Very bright channel (glow): kill leftover specks.
    if hi >= 252 and lo >= 168 and chroma <= max_chroma + 45:
        return True
    return False


def trim_light_halo(
    img: Image.Image,
    *,
    passes: int = 12,
    min_rgb: int = 188,
    max_chroma: int = 72,
) -> Image.Image:
    """
    Remove light “aura” left after the flood fill.

    Uses 8-connected adjacency to transparency (diagonal gaps count). `_looks_like_white_halo`
    combines several predicates (neutral grays, warm high-chroma blends, bright
    channels, etc.) so pixels just below the flood threshold and tinted anti-alias
    still clear. Iterates so multiple rings of fringe peel off.
    """
    rgba = img.convert("RGBA")
    w, h = rgba.size

    for _ in range(passes):
        px = rgba.load()
        to_clear: list[tuple[int, int]] = []
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a == 0:
                    continue
                if not _neighbor8_transparent(px, w, h, x, y):
                    continue
                if _looks_like_white_halo(r, g, b, min_rgb=min_rgb, max_chroma=max_chroma):
                    to_clear.append((x, y))
        if not to_clear:
            break
        for x, y in to_clear:
            r, g, b, _ = px[x, y]
            px[x, y] = (r, g, b, 0)
    return rgba


def to_monochrome_foreground(img: Image.Image) -> Image.Image:
    """Android adaptive monochrome: white on transparent, preserving alpha."""
    rgba = img.convert("RGBA")
    w, h = rgba.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = rgba.getpixel((x, y))
            if a == 0:
                continue
            opx[x, y] = (255, 255, 255, a)
    return out


def main() -> None:
    # Paths are relative to repo root by default (`--root`).
    parser = argparse.ArgumentParser()
    parser.add_argument("--min-channel", type=int, default=238)
    parser.add_argument(
        "--halo-passes",
        type=int,
        default=12,
        help="Max iterations of light-fringe removal (default 12).",
    )
    parser.add_argument(
        "--halo-min-rgb",
        type=int,
        default=188,
        help="Base min(R,G,B) for simple halo box (default 188).",
    )
    parser.add_argument(
        "--halo-max-chroma",
        type=int,
        default=72,
        help="Base max chroma for simple halo box (default 72).",
    )
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root
    img_dir = root / "assets" / "images"
    master = img_dir / "icon.png"

    cleaned = strip_edge_white(Image.open(master), min_channel=args.min_channel)
    cleaned = trim_light_halo(
        cleaned,
        passes=args.halo_passes,
        min_rgb=args.halo_min_rgb,
        max_chroma=args.halo_max_chroma,
    )
    cleaned.save(master, optimize=True)

    for name in ("android-icon-foreground.png", "splash-icon.png"):
        path = img_dir / name
        cleaned.save(path, optimize=True)

    fav = cleaned.resize((48, 48), Image.Resampling.LANCZOS)
    fav.save(img_dir / "favicon.png", optimize=True)

    mono = to_monochrome_foreground(cleaned)
    mono.save(img_dir / "android-icon-monochrome.png", optimize=True)

    print("Updated:", master, img_dir / "android-icon-foreground.png", img_dir / "splash-icon.png")
    print("Updated:", img_dir / "favicon.png", img_dir / "android-icon-monochrome.png")


if __name__ == "__main__":
    main()
