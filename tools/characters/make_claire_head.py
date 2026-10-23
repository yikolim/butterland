"""Cut Claire's head out of her front-facing walk frame for the Tesla app's map marker.

The walk sheet is 3 x 4 cells (362 px each) of upscaled pixel art (~10 px per art pixel). We crop
the head (hair top to chin) of the standing front frame, sample it back down to one art pixel per
pixel, and save public/phone/claire-head.png.
"""
from PIL import Image

SHEET = "public/sprite-sheets/claire-walk-pixelated-v2.png"
CELL = 362
# head box inside the front-facing standing cell (column 1, row 0), in sheet pixels
BOX = (73, 42, 303, 212)
OUT = (23, 17)

im = Image.open(SHEET).convert("RGBA")
cell = im.crop((CELL, 0, CELL * 2, CELL))
head = cell.crop(BOX).resize(OUT, Image.NEAREST)
# clean the edges: drop faint pixels, make the rest solid
px = head.load()
for y in range(head.height):
    for x in range(head.width):
        r, g, b, a = px[x, y]
        px[x, y] = (r, g, b, 255) if a > 128 else (0, 0, 0, 0)
head.save("public/phone/claire-head.png")
head.resize((OUT[0] * 12, OUT[1] * 12), Image.NEAREST).save("/var/folders/zz/n55xjx0x5lx8wrs9mmnk5f5c0000gn/T/head-big.png")
print("saved", head.size)
