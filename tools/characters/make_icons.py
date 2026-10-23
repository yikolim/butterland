"""Favicons and the home-screen icon from Claire's head (public/phone/claire-head.png, 23 x 17).

The head is centred on a square pixel canvas and scaled up with nearest-neighbour so it stays crisp:
claire-32.png and claire-512.png are transparent; claire-180.png (apple-touch-icon) sits on the
shell's pink, since iOS fills transparency with black. Output: public/icons/.
"""
import os
from PIL import Image

head = Image.open("public/phone/claire-head.png").convert("RGBA")
os.makedirs("public/icons", exist_ok=True)

def icon(size, background=None, margin=1):
    grid = max(head.width, head.height) + margin * 2          # square pixel canvas around the head
    canvas = Image.new("RGBA", (grid, grid), background or (0, 0, 0, 0))
    canvas.alpha_composite(head, ((grid - head.width) // 2, (grid - head.height) // 2))
    scale = size // grid
    big = canvas.resize((grid * scale, grid * scale), Image.NEAREST)
    out = Image.new("RGBA", (size, size), background or (0, 0, 0, 0))
    out.alpha_composite(big, ((size - big.width) // 2, (size - big.height) // 2))
    return out

icon(32, margin=0).save("public/icons/claire-32.png")
icon(512).save("public/icons/claire-512.png")
icon(180, background=(239, 195, 195, 255), margin=3).save("public/icons/claire-180.png")
print(sorted(os.listdir("public/icons")))
