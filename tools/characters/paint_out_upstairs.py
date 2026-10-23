#!/usr/bin/env python3
"""Paint the stray orange strip out of the upstairs spare room.

The repaint left a flat orange striped band (pixels x 655-737, y 215-236 of the 896x544 picture)
across the top of the spare-room bed and the wall behind it.
Input : public/house/floor-1.png     (kept untouched)
Output: public/house/floor-1-v2.png  (houseData.ts points the upstairs floor at this file)
Run: python3 tools/characters/paint_out_upstairs.py
"""
from pathlib import Path
from statistics import median

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "public" / "house" / "floor-1.png"
OUT = ROOT / "public" / "house" / "floor-1-v2.png"
X0, X1, Y0, Y1 = 655, 738, 215, 237          # the strip (x1/y1 exclusive)
BED0, BED1 = 673, 715                        # bed columns, outline included


def main():
    im = Image.open(SRC).convert("RGB")
    px = im.load()
    h = Y1 - Y0
    for y in range(Y0, Y1):
        # Wall and floor run horizontally: refill each row from the clean pixels just left of the strip.
        samples = [px[x, y] for x in range(646, 652)]
        color = tuple(int(median(c[i] for c in samples)) for i in range(3))
        for x in range(X0, X1):
            if BED0 <= x < BED1:
                px[x, y] = px[x, y + h]      # continue the bed's blanket (and its outline) upward
            else:
                px[x, y] = color
    im.save(OUT)
    print(OUT.relative_to(ROOT))


if __name__ == "__main__":
    main()
