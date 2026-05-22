from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = Path(__file__).resolve().parents[1]
EGG_DIR = ROOT / "assets" / "eggs"

ELEMENT_STYLE = {
    "fire": {
        "core": (42, 8, 5, 245),
        "shadow": (8, 2, 2, 210),
        "rim": (255, 220, 100, 230),
        "hot": (255, 82, 38, 210),
    },
    "water": {
        "core": (4, 25, 60, 245),
        "shadow": (0, 8, 28, 215),
        "rim": (210, 248, 255, 232),
        "hot": (75, 202, 255, 210),
    },
    "earth": {
        "core": (24, 18, 6, 245),
        "shadow": (6, 5, 2, 215),
        "rim": (255, 216, 82, 232),
        "hot": (135, 225, 72, 200),
    },
}

# Normalized egg-space crack paths. Coordinates are relative to the alpha bbox.
# They intentionally make a readable "broken shell" silhouette at 250px display size.
STAGE_PATHS = [
    [
        [(0.51, 0.15), (0.49, 0.24), (0.53, 0.34), (0.50, 0.45), (0.52, 0.56)],
        [(0.52, 0.34), (0.61, 0.39), (0.66, 0.47)],
        [(0.50, 0.45), (0.42, 0.50), (0.38, 0.58)],
    ],
    [
        [(0.50, 0.11), (0.47, 0.22), (0.53, 0.32), (0.48, 0.44), (0.52, 0.56), (0.48, 0.70)],
        [(0.53, 0.31), (0.63, 0.36), (0.70, 0.46), (0.75, 0.57)],
        [(0.50, 0.42), (0.39, 0.47), (0.32, 0.57), (0.29, 0.68)],
        [(0.52, 0.55), (0.62, 0.63), (0.70, 0.73)],
        [(0.48, 0.68), (0.41, 0.76), (0.36, 0.86)],
    ],
    [
        [(0.50, 0.09), (0.46, 0.20), (0.54, 0.31), (0.47, 0.43), (0.53, 0.57), (0.47, 0.72), (0.51, 0.90)],
        [(0.54, 0.29), (0.66, 0.35), (0.74, 0.47), (0.82, 0.61)],
        [(0.49, 0.39), (0.37, 0.46), (0.28, 0.59), (0.22, 0.76)],
        [(0.53, 0.55), (0.65, 0.64), (0.76, 0.78)],
        [(0.48, 0.69), (0.37, 0.78), (0.30, 0.92)],
        [(0.46, 0.22), (0.36, 0.26), (0.28, 0.34)],
        [(0.52, 0.73), (0.60, 0.82), (0.67, 0.92)],
        [(0.58, 0.42), (0.48, 0.50), (0.40, 0.62)],
    ],
]


def alpha_bbox(image: Image.Image):
    alpha = image.getchannel("A")
    mask = alpha.point(lambda a: 255 if a > 150 else 0)
    return mask.getbbox()


def denorm(path, bbox):
    x0, y0, x1, y1 = bbox
    w, h = x1 - x0, y1 - y0
    return [(int(x0 + x * w), int(y0 + y * h)) for x, y in path]


def clipped_overlay(base: Image.Image, overlay: Image.Image) -> Image.Image:
    alpha = base.getchannel("A").filter(ImageFilter.GaussianBlur(1.2))
    r, g, b, a = overlay.split()
    clipped_alpha = ImageChops.multiply(a, alpha)
    overlay.putalpha(clipped_alpha)
    return overlay


def draw_crack_stage(element: str, stage: int) -> None:
    base = Image.open(EGG_DIR / f"{element}-dragon-egg-cutout.png").convert("RGBA")
    bbox = alpha_bbox(base)
    style = ELEMENT_STYLE[element]
    scale = max(base.size) / 1536
    # At 250px in-app size these land around 2-3 visible screen pixels: readable,
    # but still organic shell fractures instead of graphic black stripes.
    core_width = int((9 + stage * 4) * scale)
    shadow_width = int(core_width * 1.8)
    rim_width = int(core_width + 8 * scale)
    glow_width = int(core_width * 3.0)

    glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ink = Image.new("RGBA", base.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    d = ImageDraw.Draw(ink)

    paths = STAGE_PATHS[stage - 1]
    for path in paths:
        pts = denorm(path, bbox)
        # Soft elemental light + pale chipped edge + dark center split.
        # Drawing the rim under the core keeps contrast high without creating offset "Tron" stripes.
        gd.line(pts, fill=style["hot"], width=glow_width, joint="curve")
        d.line(pts, fill=style["shadow"], width=shadow_width, joint="curve")
        d.line(pts, fill=style["rim"], width=rim_width, joint="curve")
        d.line(pts, fill=style["core"], width=core_width, joint="curve")

    glow = glow.filter(ImageFilter.GaussianBlur(max(3, int(6 * scale))))
    glow = clipped_overlay(base, glow)
    ink = clipped_overlay(base, ink)

    out = Image.alpha_composite(base, glow)
    out = Image.alpha_composite(out, ink)
    out.save(EGG_DIR / f"{element}-dragon-egg-crack-{stage}.png")


def main():
    for element in ELEMENT_STYLE:
        for stage in (1, 2, 3):
            draw_crack_stage(element, stage)
            print(f"wrote {element} stage {stage}")


if __name__ == "__main__":
    main()
