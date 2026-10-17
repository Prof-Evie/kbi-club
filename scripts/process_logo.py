#!/usr/bin/env python3
"""Process the KBI logo:
1. Remove the pure-black JPG background -> transparent PNG (yellow monogram kept)
2. Save a large watermark version (public/kbi-mark.png)
3. Save an app icon with rounded dark background (app/icon.png)
"""
import os
import numpy as np
from PIL import Image, ImageDraw

SRC = "/home/z/my-project/upload/IMG_20261017_102336_076.jpg"
OUT_DIR = "/home/z/my-project/public"
ICON_OUT = "/home/z/my-project/src/app/icon.png"

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(os.path.dirname(ICON_OUT), exist_ok=True)

src = Image.open(SRC).convert("RGB")
arr = np.array(src).astype(np.float32)

# Brightness = max channel. Logo is pure yellow (~245,197,27) on black.
mx = arr.max(axis=2)
# Alpha ramp: 0 below 22, 255 above 215 -> kills JPEG noise around black
alpha = np.clip((mx - 22.0) / (215.0 - 22.0), 0.0, 1.0)
# Slight gamma to firm up semi-transparent edges
alpha = alpha ** 0.85 * 255.0

rgba = np.dstack([arr, alpha]).astype(np.uint8)
logo = Image.fromarray(rgba, "RGBA")

# Trim transparent margins to the logo bounding box
bbox = logo.getchannel("A").getbbox()
if bbox:
    logo = logo.crop(bbox)
print("Cropped size:", logo.size)

# 1) Watermark: square canvas, logo centered, 1200px
watermark = Image.new("RGBA", (1200, 1200), (0, 0, 0, 0))
lw, lh = logo.size
scale = min(1080 / lw, 1080 / lh)
nw, nh = int(lw * scale), int(lh * scale)
resized = logo.resize((nw, nh), Image.LANCZOS)
watermark.paste(resized, ((1200 - nw) // 2, (1200 - nh) // 2), resized)
watermark.save(os.path.join(OUT_DIR, "kbi-mark.png"))
print("Saved public/kbi-mark.png")

# 2) App icon 512x512: near-black rounded square + yellow monogram
icon = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
draw = ImageDraw.Draw(icon)
draw.rounded_rectangle([6, 6, 506, 506], radius=96, fill=(8, 8, 10, 255))
inner = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
iw, ih = logo.size
scale2 = min(340 / iw, 340 / ih)
nw2, nh2 = int(iw * scale2), int(ih * scale2)
logo2 = logo.resize((nw2, nh2), Image.LANCZOS)
inner.paste(logo2, ((512 - nw2) // 2, (512 - nh2) // 2 + 6), logo2)
icon = Image.alpha_composite(icon, inner)
icon.save(ICON_OUT)
print("Saved src/app/icon.png")

# 3) Small crisp mark for header (256px, transparent)
small = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
sw, sh = logo.size
scale3 = min(240 / sw, 240 / sh)
nw3, nh3 = int(sw * scale3), int(sh * scale3)
logo3 = logo.resize((nw3, nh3), Image.LANCZOS)
small.paste(logo3, ((256 - nw3) // 2, (256 - nh3) // 2), logo3)
small.save(os.path.join(OUT_DIR, "kbi-logo-sm.png"))
print("Saved public/kbi-logo-sm.png")
