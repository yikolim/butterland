#!/usr/bin/env python3
"""Hi-res character frames for Molar Quest, matching the active sprite sheets.

The live game (app/page.tsx, app/house/*) draws Claire from a 3x4 sheet and the cat
from a 4x3 sheet, both with 362x362 px cells and chunky ~12 px pixel blocks.
Characters here are authored as small logical grids and scaled up with nearest
neighbour into the same 362 px cells so they sit at Claire's scale and style.

  Dr. Lee : 30x30 logical grid, 12 px blocks  (same pitch as Claire)
  Cats    : 36x36 logical grid, 10 px blocks  (same pitch as the white cat)

Run: python3 tools/characters/build_hires.py
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "sprite-sheets" / "characters"
DOCS = ROOT / "docs" / "characters"
CELL = 362

# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def grid(rows: list[str], w: int, h: int) -> list[str]:
    assert len(rows) == h, f"expected {h} rows, got {len(rows)}"
    out = []
    for i, r in enumerate(rows):
        assert len(r) <= w, f"row {i} is {len(r)} wide (> {w}): {r!r}"
        out.append(r.ljust(w, "."))
    return out


def blank(w: int, h: int) -> list[str]:
    return ["." * w for _ in range(h)]


def compose(w: int, h: int, layers: list[tuple[list[str], int, int]]) -> list[str]:
    """Overlay layers (grid, dx, dy) back to front; non-'.' pixels win."""
    out = [list(r) for r in blank(w, h)]
    for g, dx, dy in layers:
        for y, row in enumerate(g):
            for x, c in enumerate(row):
                if c == ".":
                    continue
                X, Y = x + dx, y + dy
                if 0 <= X < w and 0 <= Y < h:
                    out[Y][X] = c
    return ["".join(r) for r in out]


def flip(rows: list[str]) -> list[str]:
    return [r[::-1] for r in rows]


def hex_rgba(h: str):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


def render(rows: list[str], palette: dict[str, str], pitch: int) -> Image.Image:
    """Render a logical grid into a 362x362 cell, bottom-aligned and centred."""
    h, w = len(rows), len(rows[0])
    small = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = small.load()
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c == ".":
                continue
            if c not in palette:
                raise KeyError(f"no palette entry for {c!r} at ({x},{y})")
            px[x, y] = hex_rgba(palette[c])
    big = small.resize((w * pitch, h * pitch), Image.NEAREST)
    cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    cell.alpha_composite(big, ((CELL - big.width) // 2, CELL - big.height))
    return cell


# ---------------------------------------------------------------------------
# DR. LEE — 30x30 logical, front view, suit
# ---------------------------------------------------------------------------
# K outline  H hair dark  h hair mid  G grey streak  S skin  s skin shade
# L lens  l lens shade  E pupil  W shirt  T tie  t tie shade  J suit  j suit shade
# B shoe  M olive  m olive shade  Y gold

LEE_PALETTE = {
    "K": "#1F1E2E", "H": "#262632", "h": "#3B3C4C", "G": "#A9AEBB",
    "S": "#F0B98F", "s": "#D9986F", "L": "#8ED8F2", "l": "#56BDE0", "E": "#1F1E2E",
    "W": "#FFFFFF", "w": "#D8DCE6", "T": "#E8445F", "t": "#B82E47",
    "J": "#3B3F5C", "j": "#2B2E45", "B": "#2A2834",
    "M": "#6B7A3D", "m": "#4C5A2B", "Y": "#FFE260",
}

LEE_SUIT_DOWN = grid([
    "..........KKKKKKKKKK..........",  # 0
    "........KKHHHHHHHHHHKK........",  # 1
    ".......KHHhhHhhhhhhhhhHK......",  # 2 side part
    "......KHHhhhHhhhhhhhhhhHK.....",  # 3
    "......KHhhhhhHhhhhhhhhhHK.....",  # 4
    "......KHhhhSSSSSSSShhhHK......",  # 5 fringe, forehead
    "......KGhKSSSSSSSSSSKhGK......",  # 6 grey temples
    "......KHhKSSSSSSSSSSKhHK......",  # 7
    "......KHhKSKKKSSKKKSKhHK......",  # 8 glasses top
    "......KHhKKLELKKLELKKhHK......",  # 9 lenses + pupils
    "......KSsKKlllKKlllKKsSK......",  # 10 ears
    "......KSsKSKKKSSKKKSKsSK......",  # 11 glasses bottom
    ".......KKKSSSSssSSSSKKK.......",  # 12 nose
    "........KSSSSSSSSSSK..........",  # 13
    "........KSSKKKKKKSSK..........",  # 14 stern mouth
    ".........KKSSSSSSKK...........",  # 15 chin
    "...........KssSSsK............",  # 16 neck
    ".......KKJJJWWWWWJJJKK........",  # 17 shoulders / collar
    "......KJJJJJWWTWWJJJJJK.......",  # 18
    ".....KJKJJJJWWTWWJJJJKJK......",  # 19 arms
    ".....KJKJJJJJJTJJJJJJKJK......",  # 20
    ".....KJKjJJJJJTJJJJJjKJK......",  # 21
    ".....KSKjJJJJJtJJJJJjKSK......",  # 22 hands
    ".....KsKjjjjjjjjjjjjjKsK......",  # 23
    "......KKjjjjjjjjjjjjjKK.......",  # 24 hem
    "........KjjjjjK.KjjjjjK.......",  # 25 trousers
    "........KjjjjjK.KjjjjjK.......",  # 26
    "........KjjjjjK.KjjjjjK.......",  # 27
    "........KBBBBBK.KBBBBBK.......",  # 28 shoes
    "........KKKKKKK.KKKKKKK.......",  # 29
], 30, 30)

# ---------------------------------------------------------------------------
# CATS — 36x36 logical, three-quarter view facing RIGHT (row 0 of the sheets)
# ---------------------------------------------------------------------------
# K outline  B body  b body shade  F body highlight
# Q tail  q tail shade  f tail highlight
# P head points/markings  p point shade  V muzzle/blaze  I inner ear
# E eye  e eye highlight  N nose  T stripe

CAT_TAIL = [
    ".....KKKKK......",  # 0
    "...KKfffffK.....",  # 1
    "..KffffffffKK...",  # 2
    ".KfffffQffffK...",  # 3
    ".KffffQQQfffffK.",  # 4
    "KffQQQQQQQffffK.",  # 5
    "KfQQQQQQQQQfffK.",  # 6
    "KfQQQQQQQQQffffK",  # 7
    "KQQQQQQQQQQfffK.",  # 8
    ".KqQQQQQQQQffK..",  # 9
    ".KqqQQQQQQQfffK.",  # 10
    "..KqqQQQQQQQfK..",  # 11
    "..KqqqQQQQQQQK..",  # 12
    "...KqqqQQQQQQQK.",  # 13
    "....KqqqqQQQQQQK",  # 14
    ".....KKqqqqQQQQK",  # 15
    ".......KKqqqqqqK",  # 16
]

CAT_BODY = [
    "..........KKKKKKKKK...........",  # 0
    "........KKBBBBBBBBBKK.........",  # 1
    "......KKBBBBBBBBBBBBBKK.......",  # 2
    ".....KBBBBBBBBBBBBBBBBBK......",  # 3
    "....KBBBBBBBBBBBBBBBBBBBK.....",  # 4
    "...KBBBBBBBBBBBBBBBBBBBBBK....",  # 5
    "...KBBBBBBBBBBBBBBBBBBBBBBK...",  # 6
    "..KBBBBBBBBBBBBBBBBBBBBBBBBK..",  # 7
    "..KBBBBBBBBBBBBBBBBBBBBBBBBBK.",  # 8
    "..KbBBBBBBBBBBBBBBBBBBBBBBBBK.",  # 9
    "..KbBBBBBBBBBBBBBBBBBBBBBBBBBK",  # 10
    "..KbbBBBBBBBBBBBBBBBBBBBBBBBBK",  # 11
    "..KbbbBBBBBBBBBBBBBBBBBBBBBBBK",  # 12
    "...KbbbbBBBBBBBBBBBBBBBBBBBBBK",  # 13
    "...KKbbbbbbbbbbbbbbbbbbbbbbbbK",  # 14
    "....KKKbbbKKbKKbKKKKbbbKKbKKK.",  # 15 legs + fur tufts
    "......KbbbK.........KbbbK.....",  # 16
    "......KKKKK.........KKKKK.....",  # 17
]

CAT_HEAD = grid([
    "...KK.......KK...",  # 0
    "..KPPK.....KPPK..",  # 1
    "..KPIPK...KPIPK..",  # 2
    ".KPPIIPKKKPIIPPK.",  # 3
    ".KPPPPPPPPPPPPPK.",  # 4
    "KPPPPPPPPPPPPPPPK",  # 5
    "KPPPPPPPVVPPPPPPK",  # 6
    "KPPKEEEKVVKEEEKPK",  # 7 eyes
    "KPPKeEEKVVKeEEKPK",  # 8
    "KPPKEEEKVVKEEEKPK",  # 9
    "KPPPKKKVVVVKKKPPK",  # 10
    "KPPVVVVVNNVVVVVPK",  # 11 nose
    ".KPVVVVVNNVVVVVK.",  # 12
    ".KPVVVKVVVVKVVVK.",  # 13 mouth
    "..KVVVVVKKVVVVK..",  # 14
    "...KKVVVVVVVKK...",  # 15
    ".....KKKKKKK.....",  # 16
], 17, 17)

CAT_RIGHT = compose(36, 36, [
    (CAT_TAIL, 0, 1),
    (CAT_BODY, 4, 18),
    (CAT_HEAD, 19, 6),
])

# Tabby overlay: stripes on back and tail rings (only coloured for Ollie)
CAT_STRIPES = grid([
    "....................................",  # 0
    "....................................",  # 1
    "....................................",  # 2
    "....................................",  # 3
    "....................................",  # 4
    "....................................",  # 5
    "....TT..............................",  # 6
    "....................................",  # 7
    "...TTT..............................",  # 8
    "....................................",  # 9
    "....TTT.............................",  # 10
    "....................................",  # 11
    ".....TTT............................",  # 12
    "....................................",  # 13
    "....................................",  # 14
    "....................................",  # 15
    "....................................",  # 16
    "....................................",  # 17
    "..............T....T....T...........",  # 18
    ".............TT...TT...TT...........",  # 19
    ".............T....T....T............",  # 20
    "....................................",  # 21
    "..............T....T....T...........",  # 22
    "..............TT...TT...TT..........",  # 23
    "....................................",  # 24
    "....................................",  # 25
    "....................................",  # 26
    "....................................",  # 27
    "....................................",  # 28
    "....................................",  # 29
    "....................................",  # 30
    "....................................",  # 31
    "....................................",  # 32
    "....................................",  # 33
    "....................................",  # 34
    "....................................",  # 35
], 36, 36)


def with_stripes(base: list[str]) -> list[str]:
    out = []
    for br, sr in zip(base, CAT_STRIPES):
        out.append("".join(s if (s != "." and b in "BbQqf") else b for b, s in zip(br, sr)))
    return out


INK = "#1F1E2E"
CATS = {
    "michael": {  # seal bicolor ragdoll: cream body, seal mask/ears/tail, white blaze, blue eyes
        "K": INK, "B": "#FFFBF0", "b": "#E9E0CF", "F": "#FFFFFF",
        "Q": "#4E3A2E", "q": "#3A2A21", "f": "#6A5244",
        "P": "#4E3A2E", "p": "#3A2A21", "V": "#FFFBF0", "I": "#E8A3A3",
        "E": "#3F9FE0", "e": "#DFF4FF", "N": "#F08AA0", "T": "#FFFBF0",
    },
    "sashi": {  # blue point ragdoll: pale lilac body, blue-grey mask/ears/tail, blue eyes
        "K": INK, "B": "#F5F3F8", "b": "#DBD7E5", "F": "#FFFFFF",
        "Q": "#8C92A8", "q": "#6F7590", "f": "#A9AEC0",
        "P": "#8C92A8", "p": "#6F7590", "V": "#B7BBCB", "I": "#E8A3B8",
        "E": "#3F9FE0", "e": "#DFF4FF", "N": "#6E7288", "T": "#F5F3F8",
    },
    "ollie": {  # brown long-hair tabby: tan body, dark stripes, pale muzzle, green eyes
        "K": INK, "B": "#CDA06A", "b": "#A97C4A", "F": "#E6C993",
        "Q": "#B88A56", "q": "#8E6A42", "f": "#D6B07E",
        "P": "#A77C4C", "p": "#8E6A42", "V": "#EBD8B4", "I": "#E8A3A3",
        "E": "#B9DC3E", "e": "#F4FFD0", "N": "#D98A7A", "T": "#5C3F27",
    },
    "aggu": {  # white long-hair: all white, pink ears and nose, blue eyes
        "K": INK, "B": "#FFFFFF", "b": "#E4E6EF", "F": "#FFFFFF",
        "Q": "#FFFFFF", "q": "#E4E6EF", "f": "#FFFFFF",
        "P": "#FFFFFF", "p": "#E4E6EF", "V": "#FFFFFF", "I": "#F5B0C0",
        "E": "#3F9FE0", "e": "#DFF4FF", "N": "#F3A3B5", "T": "#FFFFFF",
    },
}


def build_preview():
    OUT.mkdir(parents=True, exist_ok=True)
    DOCS.mkdir(parents=True, exist_ok=True)

    cells = {}
    cells["dr-lee"] = render(LEE_SUIT_DOWN, LEE_PALETTE, 12)
    for cid, pal in CATS.items():
        g = with_stripes(CAT_RIGHT) if cid == "ollie" else CAT_RIGHT
        cells[cid] = render(g, pal, 10)
    for cid, im in cells.items():
        im.save(OUT / f"{cid}-preview.png")

    # Lineup against the existing sheets, at in-game display scale (Claire = 10% of 1672 px)
    claire = Image.open(ROOT / "public/sprite-sheets/claire-walk-pixelated-v2.png").crop((CELL, 0, 2 * CELL, CELL))
    oldcat = Image.open(ROOT / "public/sprite-sheets/white-cat-walk-concept.png").crop((0, 0, CELL, CELL))
    items = [("Claire (current)", claire, 167), ("Dr. Lee", cells["dr-lee"], 167),
             ("Michael", cells["michael"], 122), ("Sashi", cells["sashi"], 122),
             ("Ollie", cells["ollie"], 122), ("Aggu", cells["aggu"], 122),
             ("white cat (current)", oldcat, 122)]
    try:
        font = ImageFont.load_default(size=14)
    except TypeError:
        font = ImageFont.load_default()

    def lineup(scale: float, label: str) -> Image.Image:
        pad = 24
        widths = [int(w * scale) for _, _, w in items]
        W = pad * 2 + sum(widths) + pad * (len(items) - 1)
        H = int(167 * scale) + 70
        img = Image.new("RGBA", (W, H), hex_rgba("#07E66E"))
        d = ImageDraw.Draw(img)
        d.text((pad, 8), label, fill="#1F1E2E", font=font)
        x = pad
        base = H - 30
        for (name, im, w), dw in zip(items, widths):
            s = im.resize((dw, dw), Image.NEAREST)
            img.alpha_composite(s, (x, base - dw))
            d.text((x, base + 6), name, fill="#1F1E2E", font=font)
            x += dw + pad
        return img

    a = lineup(1.0, "In-game scale (scene at 1672 px wide)")
    b = lineup(2.0, "2x")
    out = Image.new("RGBA", (max(a.width, b.width), a.height + b.height), hex_rgba("#26323A"))
    out.alpha_composite(a, (0, 0))
    out.alpha_composite(b, (0, a.height))
    out.save(DOCS / "lineup-preview.png")
    print("ok")


if __name__ == "__main__":
    build_preview()
