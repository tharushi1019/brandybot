"""
Lockup compositing engine using Pillow.
Fetches the AI generated logo, removes the white/light background to make it transparent,
and combines it with brand name and tagline in custom horizontal or vertical typographic layouts.
"""

import io
import os
import uuid
import base64
import requests
from PIL import Image, ImageDraw, ImageFont
from typing import Optional, Tuple

# Set REMBG_AVAILABLE explicitly to False to avoid blocking download of massive ML model in active requests
REMBG_AVAILABLE = False

STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convert #RRGGBB to (R, G, B)."""
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 3:
        hex_color = "".join(c * 2 for c in hex_color)
    try:
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    except Exception:
        return (0, 0, 0)  # Default to black if conversion fails


def fetch_logo_image(logo_url: str) -> Image.Image:
    """Download logo from URL or parse base64 and return as RGBA PIL Image."""
    if logo_url.startswith("data:image"):
        # base64 encoded
        header, encoded = logo_url.split(",", 1)
        img_bytes = base64.b64decode(encoded)
    else:
        resp = requests.get(logo_url, timeout=15)
        resp.raise_for_status()
        img_bytes = resp.content

    return Image.open(io.BytesIO(img_bytes)).convert("RGBA")


def make_background_transparent(img: Image.Image, threshold: int = 240) -> Image.Image:
    """
    Remove white/light background from image using thresholding or rembg if available.
    Also crops the logo to its content bounding box to enable perfect alignment.
    """
    # 1. Attempt using rembg if available
    if REMBG_AVAILABLE:
        try:
            # Convert PIL back to bytes for rembg
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            rbg_bytes = remove_bg(buffered.getvalue())
            transparent_img = Image.open(io.BytesIO(rbg_bytes)).convert("RGBA")
            
            bbox = transparent_img.getbbox()
            if bbox:
                return transparent_img.crop(bbox)
            return transparent_img
        except Exception as e:
            print(f"rembg background removal failed: {e}. Falling back to thresholding.")

    # 2. High-performance chroma threshold fallback
    img = img.convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # item is (r, g, b, a)
        # If pixels are close to white (all channels >= threshold), make them fully transparent
        if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    transparent_img = Image.new("RGBA", img.size)
    transparent_img.putdata(new_data)

    # Crop to actual symbol contents (remove blank space)
    bbox = transparent_img.getbbox()
    if bbox:
        transparent_img = transparent_img.crop(bbox)
        
    return transparent_img


def get_styled_font(font_family: str, size: int = 32, bold: bool = False) -> ImageFont.ImageFont:
    """Locates and loads a styled TrueType font on Windows/Linux/Mac, falling back safely."""
    font_family = font_family.lower()
    
    # Map friendly names to lists of standard system TTF files
    font_map = {
        "sans": ["arial.ttf", "segoeui.ttf", "helvetica.ttf", "tahoma.ttf"],
        "serif": ["georgia.ttf", "times.ttf", "cambria.ttf"],
        "modern": ["trebuc.ttf", "segoeui.ttf", "arial.ttf"],
        "bold_sans": ["arialbd.ttf", "segoeuib.ttf", "trebucbd.ttf"],
        "bold_serif": ["georgiab.ttf", "timesbd.ttf", "cambriab.ttf"],
    }
    
    if "serif" in font_family:
        family_key = "bold_serif" if bold else "serif"
    elif any(x in font_family for x in ["modern", "outfit", "montserrat", "inter"]):
        family_key = "bold_sans" if bold else "modern"
    else:
        family_key = "bold_sans" if bold else "sans"
        
    possible_names = font_map[family_key]
    
    # Paths to search based on OS
    dirs = []
    if os.name == 'nt':  # Windows
        dirs = [r"C:\Windows\Fonts"]
    else:  # macOS & Linux
        dirs = [
            "/usr/share/fonts/truetype/dejavu",
            "/usr/share/fonts/truetype/liberation",
            "/System/Library/Fonts",
            "/Library/Fonts"
        ]
        
    for d in dirs:
        if os.path.exists(d):
            for name in possible_names:
                path = os.path.join(d, name)
                if os.path.exists(path):
                    try:
                        return ImageFont.truetype(path, size)
                    except Exception:
                        pass
                        
    # Try dynamic load by name
    try:
        font_name = "Arial Bold" if bold else "Arial"
        if os.name != 'nt':
            font_name = "Helvetica-Bold" if bold else "Helvetica"
        return ImageFont.truetype(font_name, size)
    except Exception:
        pass
        
    return ImageFont.load_default()


def get_text_dimensions(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> Tuple[int, int]:
    """Helper to fetch text bounding box dimensions safely across Pillow versions."""
    if hasattr(draw, "textbbox"):
        bbox = draw.textbbox((0, 0), text, font=font)
        return bbox[2] - bbox[0], bbox[3] - bbox[1]
    elif hasattr(font, "getbbox"):
        bbox = font.getbbox(text)
        return bbox[2] - bbox[0], bbox[3] - bbox[1]
    else:
        # Legacy fallback
        return draw.textsize(text, font=font)


def compose_vertical_lockup(
    logo: Image.Image,
    brand_name: str,
    tagline: str,
    font_family: str,
    name_color: Tuple[int, int, int],
    tag_color: Tuple[int, int, int],
    font_size_name: int,
    font_size_tagline: int,
    gap: int
) -> Image.Image:
    """Create a vertical stacked lockup: centered icon on top, brand name and tagline below."""
    W, H = 800, 800
    canvas = Image.new("RGBA", (W, H), (255, 255, 255, 0))
    draw = ImageDraw.Draw(canvas)
    
    # Load fonts
    name_font = get_styled_font(font_family, font_size_name, bold=True)
    tag_font = get_styled_font(font_family, font_size_tagline, bold=False)
    
    # Calculate sizes
    name_w, name_h = get_text_dimensions(draw, brand_name, name_font)
    tag_w, tag_h = get_text_dimensions(draw, tagline, tag_font) if tagline else (0, 0)
    
    # Resize logo icon (fit to max 350x350 box)
    logo.thumbnail((350, 350), Image.LANCZOS)
    lw, lh = logo.size
    
    # Total combined height of content
    total_content_h = lh + gap + name_h
    if tagline:
        total_content_h += (gap // 2) + tag_h
        
    # Vertical starting coordinate to center the group inside the 800px canvas
    start_y = (H - total_content_h) // 2
    
    # 1. Paste centered logo
    lx = (W - lw) // 2
    canvas.paste(logo, (lx, start_y), logo)
    
    # 2. Draw centered brand name
    ny = start_y + lh + gap
    nx = (W - name_w) // 2
    draw.text((nx, ny), brand_name, fill=(*name_color, 255), font=name_font)
    
    # 3. Draw centered tagline if present
    if tagline:
        ty = ny + name_h + (gap // 2)
        tx = (W - tag_w) // 2
        draw.text((tx, ty), tagline, fill=(*tag_color, 255), font=tag_font)
        
    return canvas


def compose_horizontal_lockup(
    logo: Image.Image,
    brand_name: str,
    tagline: str,
    font_family: str,
    name_color: Tuple[int, int, int],
    tag_color: Tuple[int, int, int],
    font_size_name: int,
    font_size_tagline: int,
    gap: int
) -> Image.Image:
    """Create a horizontal lockup: icon on the left, brand name and tagline stacked on the right."""
    W, H = 1200, 600
    canvas = Image.new("RGBA", (W, H), (255, 255, 255, 0))
    draw = ImageDraw.Draw(canvas)
    
    # Load fonts
    name_font = get_styled_font(font_family, font_size_name, bold=True)
    tag_font = get_styled_font(font_family, font_size_tagline, bold=False)
    
    # Calculate sizes
    name_w, name_h = get_text_dimensions(draw, brand_name, name_font)
    tag_w, tag_h = get_text_dimensions(draw, tagline, tag_font) if tagline else (0, 0)
    
    # Resize logo icon (fit to max 300x300 box)
    logo.thumbnail((300, 300), Image.LANCZOS)
    lw, lh = logo.size
    
    # Width of text block
    text_w = max(name_w, tag_w)
    
    # Total combined width of content
    total_content_w = lw + gap + text_w
    
    # Horizontal starting coordinate to center the group inside the 1200px canvas
    start_x = (W - total_content_w) // 2
    
    # Vertical starting coordinate to center logo icon
    ly = (H - lh) // 2
    canvas.paste(logo, (start_x, ly), logo)
    
    # Vertical starting coordinates for text block
    text_block_h = name_h
    if tagline:
        text_block_h += (gap // 2) + tag_h
    text_start_y = (H - text_block_h) // 2
    
    # 1. Draw brand name
    tx = start_x + lw + gap
    draw.text((tx, text_start_y), brand_name, fill=(*name_color, 255), font=name_font)
    
    # 2. Draw tagline
    if tagline:
        ty = text_start_y + name_h + (gap // 2)
        draw.text((tx, ty), tagline, fill=(*tag_color, 255), font=tag_font)
        
    return canvas


def generate_lockup_image(
    logo_url: str,
    brand_name: str,
    tagline: str = "",
    layout: str = "vertical",
    font_family: str = "Inter",
    primary_color: str = "#000000",
    secondary_color: str = "#666666",
    font_size_name: int = 48,
    font_size_tagline: int = 24,
    gap: int = 20
) -> Tuple[str, str]:
    """
    Main dispatch method.
    Downloads logo, erases background, structures lockup layout, saves it as transparent PNG,
    and returns (local_filepath, filename).
    """
    # 1. Fetch and process logo
    raw_logo = fetch_logo_image(logo_url)
    transparent_logo = make_background_transparent(raw_logo)
    
    # 2. Convert colors
    c1 = hex_to_rgb(primary_color)
    c2 = hex_to_rgb(secondary_color)
    
    # 3. Create lockup based on layout
    if layout.lower() == "horizontal":
        lockup_img = compose_horizontal_lockup(
            transparent_logo, brand_name, tagline, font_family,
            c1, c2, font_size_name, font_size_tagline, gap
        )
    else:
        lockup_img = compose_vertical_lockup(
            transparent_logo, brand_name, tagline, font_family,
            c1, c2, font_size_name, font_size_tagline, gap
        )
        
    # 4. Save file
    filename = f"lockup_{uuid.uuid4()}.png"
    filepath = os.path.join(STATIC_DIR, filename)
    lockup_img.save(filepath, "PNG", optimize=True)
    
    return filepath, filename
