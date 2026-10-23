#!/usr/bin/env python3
"""Debug view of what the game treats as walkable on each painted floor.

Mirrors floorish() and the half-tile rule in app/house/houseDraw.ts:
a half-tile (8x8 px) is open if at least 70% of its pixels read as floor.
Then flood-fills from a seed and colours: green = reachable, red = open but cut off,
plus authored doorways (blue) and stairs (yellow) from app/house/paintedWalk.ts when present.
Usage: python3 tools/characters/walkmap.py <floor-index> <out.png>
Green = reachable, orange = pocket filled in, red = floor-coloured but unreachable.
"""
import json
import math
import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
ART = ["floor-0-v2.png", "floor-1-v2.png", "floor-2.png"]


def floorish(r, g, b):
    mx, mn = max(r, g, b), min(r, g, b)
    v = mx / 255
    s = (mx - mn) / mx if mx else 0
    if v < .38:
        return False
    if s < .12 and v > .9:
        return False
    if s < .18:
        return .4 <= v <= .95
    if mx == mn:
        return False
    if mx == r:
        hue = ((g - b) / (mx - mn)) * 60
    elif mx == g:
        hue = (2 + (b - r) / (mx - mn)) * 60
    else:
        hue = (4 + (r - g) / (mx - mn)) * 60
    if hue < 0:
        hue += 360
    return 10 <= hue <= 52 and v > .5


def open_cells(im):
    px = im.load()
    w2, h2 = im.width // 8, im.height // 8
    grid = [[False] * w2 for _ in range(h2)]
    for cy in range(h2):
        for cx in range(w2):
            off = 0
            for y in range(8):
                for x in range(8):
                    r, g, b = px[cx * 8 + x, cy * 8 + y][:3]
                    if not floorish(r, g, b):
                        off += 1
            grid[cy][cx] = off <= 64 * .3
    return grid


def authored(floor):
    text = (ROOT / "app" / "house" / "paintedWalk.ts").read_text()
    data = json.loads(text.split("/*json*/", 1)[1].split("/*end*/", 1)[0])
    return data[floor]


def cells(r):
    for cy in range(int(r["y"] * 2), int(math.ceil((r["y"] + r["h"]) * 2))):
        for cx in range(int(r["x"] * 2), int(math.ceil((r["x"] + r["w"]) * 2))):
            yield cx, cy


INK_V = .42  # pixels darker than this are painted outlines: they wall off furniture and rooms


def compute(floor):
    """Same steps as buildFloor() for painted floors.

    1. Pixel flood fill from the seeds over every pixel that is not a dark outline, so furniture
       enclosed by its outline (table tops, counters) is never reached.
    2. A half-tile is walkable if at least 70% of its pixels were reached and read as floor.
    3. Authored open/stairs rects are walkable, block rects are not; pockets under furniture fill in.
    """
    im = Image.open(ROOT / "public" / "house" / ART[floor]).convert("RGB")
    W, H = im.size
    px = im.load()
    pw = authored(floor)
    # A staircase is walkable from its rectangle down to its landing spot one tile below.
    pw = dict(pw, stairs=[dict(r, h=r["h"] + 1) for r in pw["stairs"]])
    passable = bytearray(W * H)
    floorpx = bytearray(W * H)
    ink = bytearray(W * H)
    for y in range(H):
        for x in range(W):
            r, g, b = px[x, y]
            ink[y * W + x] = max(r, g, b) / 255 < INK_V
            floorpx[y * W + x] = floorish(r, g, b)
    # Thicken outlines by one pixel so the antialiased gaps in a 1px outline close up.
    for y in range(H):
        for x in range(W):
            hit = False
            for dy in (-1, 0, 1):
                yy = y + dy
                if yy < 0 or yy >= H:
                    continue
                row = yy * W
                for dx in (-1, 0, 1):
                    xx = x + dx
                    if 0 <= xx < W and ink[row + xx]:
                        hit = True
                        break
                if hit:
                    break
            passable[y * W + x] = not hit
    def px_rect(r):
        return (int(r["x"] * 16), int(r["y"] * 16), int(math.ceil((r["x"] + r["w"]) * 16)), int(math.ceil((r["y"] + r["h"]) * 16)))
    for r in pw["open"] + pw["stairs"]:
        x0, y0, x1, y1 = px_rect(r)
        for y in range(max(0, y0), min(H, y1)):
            for x in range(max(0, x0), min(W, x1)):
                passable[y * W + x] = 1
                floorpx[y * W + x] = 1
    for r in pw["block"]:
        x0, y0, x1, y1 = px_rect(r)
        for y in range(max(0, y0), min(H, y1)):
            for x in range(max(0, x0), min(W, x1)):
                passable[y * W + x] = 0
    seeds = [(p["x"], p["y"]) for p in pw["spawn"]] + [(s["x"] + s["w"] / 2, s["y"] + s["h"] + .75) for s in pw["stairs"]]
    reached = bytearray(W * H)
    q = deque()
    for sx, sy in seeds:
        x, y = int(sx * 16), int(sy * 16)
        if passable[y * W + x]:
            reached[y * W + x] = 1
            q.append(x + y * W)
        else:
            print("  seed on an outline:", sx, sy)
    while q:
        i = q.popleft()
        x, y = i % W, i // W
        for j in ((i + 1) if x + 1 < W else -1, (i - 1) if x > 0 else -1, i + W if y + 1 < H else -1, i - W if y > 0 else -1):
            if j >= 0 and passable[j] and not reached[j]:
                reached[j] = 1
                q.append(j)
    w2, h2 = W // 8, H // 8
    grid = [[False] * w2 for _ in range(h2)]
    reach = [[False] * w2 for _ in range(h2)]
    for cy in range(h2):
        for cx in range(w2):
            n = 0
            for y in range(cy * 8, cy * 8 + 8):
                for x in range(cx * 8, cx * 8 + 8):
                    i = y * W + x
                    if reached[i] and floorpx[i]:
                        n += 1
            reach[cy][cx] = n >= 64 * .7
            grid[cy][cx] = reach[cy][cx]
    forced = set()
    for r in pw["open"] + pw["stairs"]:
        for cx, cy in cells(r):
            if 0 <= cy < h2 and 0 <= cx < w2:
                reach[cy][cx] = True
                forced.add((cx, cy))
    # Keep only half-tiles still connected to a seed after the threshold.
    keep = [[False] * w2 for _ in range(h2)]
    q = deque()
    for sx, sy in seeds:
        cx, cy = int(sx * 2), int(sy * 2)
        if reach[cy][cx]:
            keep[cy][cx] = True
            q.append((cx, cy))
    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w2 and 0 <= ny < h2 and reach[ny][nx] and not keep[ny][nx]:
                keep[ny][nx] = True
                q.append((nx, ny))
    reach = keep
    pockets = set()
    for _ in range(6):
        mark = []
        for cy in range(1, h2):
            for cx in range(w2):
                if not reach[cy][cx] or (cx, cy) in forced or reach[cy - 1][cx]:
                    continue
                left = any(not reach[cy][cx - k] for k in range(1, 4) if cx - k >= 0)
                right = any(not reach[cy][cx + k] for k in range(1, 4) if cx + k < w2)
                if left and right:
                    mark.append((cx, cy))
        if not mark:
            break
        for cx, cy in mark:
            reach[cy][cx] = False
            pockets.add((cx, cy))
    return im, grid, reach, pockets, pw, seeds


def main():
    floor = int(sys.argv[1])
    out = sys.argv[2]
    im, grid, reach, pockets, pw, seeds = compute(floor)
    h2, w2 = len(grid), len(grid[0])
    S = 2
    big = im.resize((im.width * S, im.height * S), Image.NEAREST).convert("RGBA")
    ov = Image.new("RGBA", big.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for cy in range(h2):
        for cx in range(w2):
            box = (cx * 8 * S, cy * 8 * S, (cx + 1) * 8 * S - 1, (cy + 1) * 8 * S - 1)
            if reach[cy][cx]:
                d.rectangle(box, fill=(40, 220, 90, 70))
            elif (cx, cy) in pockets:
                d.rectangle(box, fill=(255, 160, 0, 120))
            elif grid[cy][cx]:
                d.rectangle(box, fill=(255, 40, 40, 110))
    for r in pw["stairs"]:
        d.rectangle((r["x"] * 16 * S, r["y"] * 16 * S, (r["x"] + r["w"]) * 16 * S, (r["y"] + r["h"]) * 16 * S), outline=(255, 230, 0, 255), width=3)
    for r in pw["open"]:
        d.rectangle((r["x"] * 16 * S, r["y"] * 16 * S, (r["x"] + r["w"]) * 16 * S, (r["y"] + r["h"]) * 16 * S), outline=(60, 150, 255, 255), width=3)
    for sx, sy in seeds:
        d.ellipse((sx * 16 * S - 6, sy * 16 * S - 6, sx * 16 * S + 6, sy * 16 * S + 6), fill=(255, 255, 255, 255))
    for t in range(0, im.width // 16):
        d.line([(t * 16 * S, 0), (t * 16 * S, big.height)], fill=(255, 0, 255, 60 if t % 2 else 120))
        if t % 2 == 0:
            d.text((t * 16 * S + 2, 2), str(t), fill=(255, 255, 255, 255))
    for t in range(0, im.height // 16):
        d.line([(0, t * 16 * S), (big.width, t * 16 * S)], fill=(255, 0, 255, 60 if t % 2 else 120))
        if t % 2 == 0:
            d.text((2, t * 16 * S + 2), str(t), fill=(255, 255, 255, 255))
    big.alpha_composite(ov)
    big.save(out)
    print(out, "reachable half-cells:", sum(map(sum, reach)), "pockets:", len(pockets))


if __name__ == "__main__":
    main()
