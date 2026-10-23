#!/usr/bin/env python3
"""Paint the hall table (blocking the stairs) and the tall wall mirror out of the ground floor.

Input : public/house/floor-0.png      (kept untouched)
Output: public/house/floor-0-v2.png   (houseData.ts points the ground floor at this file)

Floor planks and wall boards both run horizontally, so each row of a patch is refilled from
the clean pixels of the same row just left and right of it. That keeps plank seams and board
edges lined up with their surroundings. Pixel coordinates are in the 896x544 painting.
Run: python3 tools/characters/paint_out_foyer.py
"""
from pathlib import Path
from statistics import median

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "public" / "house" / "floor-0.png"
OUT = ROOT / "public" / "house" / "floor-0-v2.png"


def row_fill(px, y, x0, x1, left, right):
    """Fill px[x0:x1, y] with the per-channel median of the sample spans left and right."""
    samples = [px[x, y] for span in (left, right) for x in range(*span)]
    color = tuple(int(median(c[i] for c in samples)) for i in range(3))
    for x in range(x0, x1):
        px[x, y] = color


def main():
    im = Image.open(SRC).convert("RGB")
    px = im.load()

    # 1. Hall table in front of the stairs: top at y=370, legs and shadow to y=397.
    #    The floor planks either side (x 337-347 and 392-399) are clean in these rows.
    for y in range(370, 398):
        row_fill(px, y, 348, 392, (337, 347), (392, 399))
    # Close off the bottom of the stair opening with the same dark edge the posts end on.
    edge = px[346, 366]
    for x in range(352, 377):
        px[x, 370] = edge

    # 2. Tall wall mirror: frame x 488-504, y 320-356, on light horizontal wall boards.
    #    Clean board pixels sit at x 478-487 (left) and 504-507 (right).
    for y in range(319, 357):
        row_fill(px, y, 488, 504, (478, 487), (504, 507))

    im.save(OUT)
    print(OUT.relative_to(ROOT))


if __name__ == "__main__":
    main()
