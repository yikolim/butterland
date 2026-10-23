#!/usr/bin/env python3
"""Turn the generated cat sheets into game-ready 4x3 sprite sheets.

Input : docs/characters/generated/dl/<cat>-sheet.png   (1456x1088, white background)
Output: public/sprite-sheets/<cat>-walk.png             (1448x1086, RGBA, 362px cells)
        docs/characters/generated/<cat>-sheet-check.png (grid overlay for review)

Steps: flood-fill the white background to transparency from the image edges (so
white fur stays), find the 12 sprite blobs, sort them into 3 rows x 4 columns,
and paste each one bottom-aligned and centred into a 362px cell. Row 0 faces
right, row 1 faces left, row 2 is rest poses — the same layout as the white cat.
"""
from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "docs" / "characters" / "generated" / "dl"
OUT = ROOT / "public" / "sprite-sheets"
CHECK = ROOT / "docs" / "characters" / "generated"
CELL = 362
COLS, ROWS = 4, 3


def knock_out_background(img: Image.Image, tol: int = 28) -> Image.Image:
    """Flood fill near-white from the edges to alpha 0. Interior white fur survives."""
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    seen = bytearray(w * h)
    q = deque()

    def is_bg(x, y):
        r, g, b, _ = px[x, y]
        return r >= 255 - tol and g >= 255 - tol and b >= 255 - tol

    for x in range(w):
        for y in (0, h - 1):
            if is_bg(x, y) and not seen[y * w + x]:
                seen[y * w + x] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_bg(x, y) and not seen[y * w + x]:
                seen[y * w + x] = 1
                q.append((x, y))
    while q:
        x, y = q.popleft()
        px[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and is_bg(nx, ny):
                seen[ny * w + nx] = 1
                q.append((nx, ny))
    return img


def find_blobs(img: Image.Image, min_area: int = 4000) -> list[tuple[int, int, int, int]]:
    """Bounding boxes of opaque connected regions (8-connected, downsampled 4x for speed)."""
    s = 4
    small = img.resize((img.width // s, img.height // s), Image.NEAREST)
    w, h = small.size
    a = small.split()[3].load()
    seen = bytearray(w * h)
    boxes = []
    for y0 in range(h):
        for x0 in range(w):
            if seen[y0 * w + x0] or a[x0, y0] == 0:
                continue
            q = deque([(x0, y0)])
            seen[y0 * w + x0] = 1
            x1 = x2 = x0
            y1 = y2 = y0
            n = 0
            while q:
                x, y = q.popleft()
                n += 1
                x1, x2, y1, y2 = min(x1, x), max(x2, x), min(y1, y), max(y2, y)
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and a[nx, ny]:
                            seen[ny * w + nx] = 1
                            q.append((nx, ny))
            if n * s * s >= min_area:
                boxes.append((x1 * s, y1 * s, (x2 + 1) * s, (y2 + 1) * s))
    return boxes


def merge_close(boxes, gap=24):
    """Merge boxes that overlap or nearly touch (a tail or ear that got separated)."""
    boxes = list(boxes)
    changed = True
    while changed:
        changed = False
        out = []
        while boxes:
            b = boxes.pop()
            bx1, by1, bx2, by2 = b
            i = 0
            while i < len(boxes):
                cx1, cy1, cx2, cy2 = boxes[i]
                if cx1 - gap <= bx2 and cx2 + gap >= bx1 and cy1 - gap <= by2 and cy2 + gap >= by1:
                    bx1, by1, bx2, by2 = min(bx1, cx1), min(by1, cy1), max(bx2, cx2), max(by2, cy2)
                    boxes.pop(i)
                    changed = True
                else:
                    i += 1
            out.append((bx1, by1, bx2, by2))
        boxes = out
    return boxes


def arrange(boxes, w, h):
    """Sort blobs into ROWS x COLS by centre position."""
    assert len(boxes) == ROWS * COLS, f"expected {ROWS * COLS} sprites, found {len(boxes)}: {boxes}"
    rows = sorted(boxes, key=lambda b: (b[1] + b[3]) / 2)
    grid = []
    for r in range(ROWS):
        row = sorted(rows[r * COLS:(r + 1) * COLS], key=lambda b: (b[0] + b[2]) / 2)
        grid.append(row)
    return grid


def build(cat: str):
    src = SRC / f"{cat}-sheet.png"
    img = knock_out_background(Image.open(src))
    W, H = img.size
    cw, ch = W / COLS, H / ROWS

    sheet = Image.new("RGBA", (CELL * COLS, CELL * ROWS), (0, 0, 0, 0))
    check = img.copy()
    d = ImageDraw.Draw(check)
    sizes = []
    for r in range(ROWS):
        row_sizes = []
        for c in range(COLS):
            # Cut on the generator's own grid, then keep only the biggest blob in the cell
            # so slivers of a neighbour's tail that crossed the line are dropped.
            cx1, cy1 = int(c * cw), int(r * ch)
            cx2, cy2 = int((c + 1) * cw), int((r + 1) * ch)
            cell = img.crop((cx1, cy1, cx2, cy2))
            blobs = merge_close(find_blobs(cell, min_area=2000), gap=12)
            if not blobs:
                raise SystemExit(f"{cat}: empty cell r{r}c{c}")
            x1, y1, x2, y2 = max(blobs, key=lambda b: (b[2] - b[0]) * (b[3] - b[1]))
            mask = Image.new("L", cell.size, 0)
            ImageDraw.Draw(mask).rectangle((x1, y1, x2 - 1, y2 - 1), fill=255)
            cell.putalpha(Image.composite(cell.split()[3], mask, mask))
            sprite = cell.crop((x1, y1, x2, y2))
            d.rectangle((cx1 + x1, cy1 + y1, cx1 + x2 - 1, cy1 + y2 - 1), outline=(255, 0, 110, 255), width=3)
            d.text((cx1 + x1 + 4, cy1 + y1 + 4), f"r{r}c{c}", fill=(255, 0, 110, 255))
            bw, bh = sprite.size
            scale = min(1.0, (CELL - 8) / bw, (CELL - 8) / bh)
            if scale < 1.0:
                sprite = sprite.resize((int(bw * scale), int(bh * scale)), Image.NEAREST)
                bw, bh = sprite.size
            ox = c * CELL + (CELL - bw) // 2
            oy = r * CELL + (CELL - bh) - 4
            sheet.alpha_composite(sprite, (ox, oy))
            row_sizes.append((bw, bh))
        sizes.append(row_sizes)
    sheet.save(OUT / f"{cat}-walk.png")
    check.save(CHECK / f"{cat}-sheet-check.png")
    print(cat, "ok", sizes)


if __name__ == "__main__":
    cats = sys.argv[1:] or ["michael", "sashi", "ollie"]
    for c in cats:
        build(c)
