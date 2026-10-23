#!/usr/bin/env python3
"""Cut the delivery truck and package art out of their cream backgrounds and scale them for the game.

Input : docs/characters/generated/delivery/{truck,package}-source.webp  (owner-supplied art)
Output: public/delivery/truck.png        150 px long, for the street cutscene
        public/delivery/package.png      18 px wide, on the sidewalk and next to Claire
        public/delivery/package-icon.png 28 px wide, for the notification and quest card
Run: python3 tools/characters/process_delivery.py
"""
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "docs" / "characters" / "generated" / "delivery"
OUT = ROOT / "public" / "delivery"


def cut_out(img, tol=26):
    """Flood fill the light background from the edges to transparent, then crop to the art."""
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    bg = px[2, 2][:3]
    def near(c):
        return all(abs(c[i] - bg[i]) <= tol for i in range(3))
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            q.append((x, y))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        if not near(px[x, y][:3]):
            continue
        px[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]:
                q.append((nx, ny))
    return img.crop(img.getbbox())


def scale(img, width):
    """Shrink with filtering (the art is far larger than its game size), then snap alpha so edges stay crisp."""
    height = round(img.height * width / img.width)
    small = img.resize((width, height), Image.LANCZOS)
    a = small.split()[3].point(lambda v: 255 if v >= 110 else 0)
    small.putalpha(a)
    return small


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    truck = cut_out(Image.open(SRC / "truck-source.webp"))
    pkg = cut_out(Image.open(SRC / "package-source.webp"))
    for name, im, w in (("truck", truck, 150), ("package", pkg, 18), ("package-icon", pkg, 28)):
        s = scale(im, w)
        s.save(OUT / f"{name}.png")
        print(name, s.size)


if __name__ == "__main__":
    main()
