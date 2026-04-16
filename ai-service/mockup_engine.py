"""
Mockup compositing engine using Pillow.
Fetches the logo from a URL, removes background (via rembg or alpha),
then composites it onto pre-designed template canvases.

Supported templates:
  - business_card   : 1050 x 600 px
  - tshirt          : 800 x 900 px
  - mug             : 900 x 750 px
  - website_hero    : 1200 x 630 px
  - social_banner   : 1080 x 1080 px
"""

import io
import os
import uuid
import base64
import requests
from PIL import Image, ImageDraw, ImageFont
from typing import Optional

STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)

# Attempt to import rembg; fall back gracefully if not installed
try:
    from rembg import remove as remove_bg
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False


def hex_to_rgb(hex_color: str) -> tuple:
    """Convert #RRGGBB to (R, G, B)."""
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 3:
        hex_color = "".join(c * 2 for c in hex_color)
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def fetch_logo(logo_url: str) -> Image.Image:
    """Download logo from URL and return as RGBA PIL Image."""
    if logo_url.startswith("data:image"):
        # base64 encoded
        header, encoded = logo_url.split(",", 1)
        img_bytes = base64.b64decode(encoded)
    else:
        resp = requests.get(logo_url, timeout=15)
        resp.raise_for_status()
        img_bytes = resp.content

    img = Image.open(io.BytesIO(img_bytes)).convert("RGBA")

    # Remove background if rembg is available
    if REMBG_AVAILABLE:
        try:
            rbg_bytes = remove_bg(img_bytes)
            img = Image.open(io.BytesIO(rbg_bytes)).convert("RGBA")
        except Exception:
            pass  # Fall back to original

    return img


def gradient_rect(size: tuple, color1: tuple, color2: tuple) -> Image.Image:
    """Create a horizontal gradient rectangle."""
    w, h = size
    base = Image.new("RGBA", size)
    draw = ImageDraw.Draw(base)
    for x in range(w):
        r = int(color1[0] + (color2[0] - color1[0]) * x / w)
        g = int(color1[1] + (color2[1] - color1[1]) * x / w)
        b = int(color1[2] + (color2[2] - color1[2]) * x / w)
        draw.line([(x, 0), (x, h)], fill=(r, g, b, 255))
    return base


def get_font(size: int = 32):
    """Get a PIL font — tries system fonts, falls back to default."""
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/Arial.ttf"
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()


def paste_logo(canvas: Image.Image, logo: Image.Image,
               box: tuple, padding: int = 10) -> Image.Image:
    """Resize logo to fit box with padding, then paste centered with alpha."""
    bx, by, bw, bh = box
    max_w = bw - padding * 2
    max_h = bh - padding * 2
    logo.thumbnail((max_w, max_h), Image.LANCZOS)
    lw, lh = logo.size
    px = bx + (bw - lw) // 2
    py = by + (bh - lh) // 2
    canvas.paste(logo, (px, py), logo)
    return canvas


# ─── TEMPLATE BUILDERS ────────────────────────────────────────────────────────

def make_business_card(logo: Image.Image, brand_name: str,
                       c1: tuple, c2: tuple) -> Image.Image:
    W, H = 1050, 600
    card = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    draw = ImageDraw.Draw(card)

    # Left gradient panel
    panel = gradient_rect((W // 2, H), c1, c2)
    card.paste(panel, (0, 0))

    # Paste logo on left panel
    card = paste_logo(card, logo, (40, 40, W // 2 - 40, H - 40))

    # Right side: white with brand name
    font_lg = get_font(52)
    font_sm = get_font(26)
    draw.text((W // 2 + 60, H // 2 - 50), brand_name, fill=c1, font=font_lg)
    draw.text((W // 2 + 60, H // 2 + 20), "www.yourbrand.com", fill=(150, 150, 150), font=font_sm)
    draw.text((W // 2 + 60, H // 2 + 60), "hello@yourbrand.com", fill=(150, 150, 150), font=font_sm)

    # Decorative accent lines
    draw.rectangle([W // 2 + 40, H // 2 - 55, W // 2 + 44, H // 2 + 80], fill=c1)

    return card.convert("RGB")


def make_tshirt(logo: Image.Image, brand_name: str,
                c1: tuple, c2: tuple) -> Image.Image:
    W, H = 800, 900
    # Simple tshirt silhouette with gradient
    shirt = Image.new("RGBA", (W, H), (245, 245, 245, 255))
    draw = ImageDraw.Draw(shirt)

    # Shirt body (simplified polygon)
    body_color = (*c1[:3], 220)
    draw.polygon([
        (200, 150), (600, 150),   # shoulders
        (650, 200), (700, 350),   # right arm
        (680, 400), (630, 380),   # under arm right
        (620, 850), (180, 850),   # bottom
        (170, 380), (120, 400),   # under arm left
        (100, 350), (150, 200)    # left arm
    ], fill=body_color)

    # Collar
    draw.ellipse([320, 130, 480, 210], fill=(255, 255, 255, 255))

    # Logo on chest
    chest_box = (280, 280, 240, 240)  # x, y, w, h
    card = paste_logo(shirt, logo, (280, 280, 240, 240))

    # Brand name below logo
    font = get_font(30)
    draw.text((W // 2, 560), brand_name, fill=(255, 255, 255, 230), font=font, anchor="mm")

    return shirt.convert("RGB")


def make_mug(logo: Image.Image, brand_name: str,
             c1: tuple, c2: tuple) -> Image.Image:
    W, H = 900, 750
    mug = Image.new("RGBA", (W, H), (248, 248, 248, 255))
    draw = ImageDraw.Draw(mug)

    # Mug body
    mug_color = (*c1[:3], 230)
    draw.rounded_rectangle([150, 100, 650, 650], radius=40, fill=mug_color)

    # Mug highlight (white band)
    draw.rounded_rectangle([155, 105, 645, 180], radius=35, fill=(255, 255, 255, 80))

    # Handle
    draw.arc([620, 250, 750, 500], start=315, end=45, fill=(*c2[:3], 230), width=40)

    # Logo center of mug face
    mug = paste_logo(mug, logo, (200, 220, 350, 280))

    # Brand name
    font = get_font(36)
    draw.text((400, 560), brand_name, fill=(255, 255, 255, 220), font=font, anchor="mm")

    # Base shadow
    draw.ellipse([140, 640, 670, 690], fill=(200, 200, 200, 120))

    return mug.convert("RGB")


def make_website_hero(logo: Image.Image, brand_name: str,
                      c1: tuple, c2: tuple) -> Image.Image:
    W, H = 1200, 630
    hero = gradient_rect((W, H), c1, c2).convert("RGB")
    hero_rgba = hero.convert("RGBA")
    draw = ImageDraw.Draw(hero_rgba)

    # Subtle grid overlay
    for x in range(0, W, 60):
        draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 15))
    for y in range(0, H, 60):
        draw.line([(0, y), (W, y)], fill=(255, 255, 255, 15))

    # Logo left side
    hero_rgba = paste_logo(hero_rgba, logo, (80, 80, 400, 400))

    # Text right side
    font_xl = get_font(72)
    font_lg = get_font(36)
    font_sm = get_font(26)
    draw.text((550, 200), brand_name, fill=(255, 255, 255, 255), font=font_xl)
    draw.text((550, 300), "Built with AI · Powered by BrandyBot", fill=(255, 255, 255, 160), font=font_sm)

    # CTA button shape
    draw.rounded_rectangle([550, 370, 820, 430], radius=20, fill=(255, 255, 255, 220))
    draw.text((685, 400), "Get Started →", fill=c1, font=font_sm, anchor="mm")

    return hero_rgba.convert("RGB")


def make_social_banner(logo: Image.Image, brand_name: str,
                       c1: tuple, c2: tuple) -> Image.Image:
    W, H = 1080, 1080
    banner = gradient_rect((W, H), c1, c2).convert("RGBA")
    draw = ImageDraw.Draw(banner)

    # Decorative circles
    draw.ellipse([800, -100, 1200, 300], fill=(255, 255, 255, 20))
    draw.ellipse([-100, 800, 300, 1200], fill=(255, 255, 255, 15))

    # Logo large center-top
    banner = paste_logo(banner, logo, (290, 180, 500, 500))

    # Brand name
    font_xl = get_font(88)
    font_sm = get_font(36)
    draw.text((W // 2, 760), brand_name, fill=(255, 255, 255, 255), font=font_xl, anchor="mm")
    draw.text((W // 2, 870), "— Creating brands that matter —", fill=(255, 255, 255, 180), font=font_sm, anchor="mm")

    return banner.convert("RGB")


# ─── DISPATCH ─────────────────────────────────────────────────────────────────

TEMPLATES = {
    "business_card": make_business_card,
    "tshirt":        make_tshirt,
    "mug":           make_mug,
    "website_hero":  make_website_hero,
    "social_banner": make_social_banner,
}


def generate_mockup(
    logo_url: str,
    template_type: str,
    brand_name: str = "Brand",
    primary_color: str = "#7C3AED",
    secondary_color: str = "#3B82F6"
) -> str:
    """
    Generate a mockup image and save it to static/.
    Returns the local file path of the saved PNG.
    """
    template_fn = TEMPLATES.get(template_type, make_business_card)

    c1 = hex_to_rgb(primary_color)
    c2 = hex_to_rgb(secondary_color)

    logo = fetch_logo(logo_url)
    result_img = template_fn(logo, brand_name, c1, c2)

    filename = f"mockup_{uuid.uuid4()}.png"
    filepath = os.path.join(STATIC_DIR, filename)
    result_img.save(filepath, "PNG", optimize=True)

    return filepath, filename
