#!/usr/bin/env python3
"""Generate v3 cohesive-base fire hatchling proof frames.

This pass responds to stakeholder feedback that the previous animation still read
as pieced together. It intentionally favors painterly continuity over dramatic
part motion: the same cohesive base painting remains present as underpaint,
layer movement is smaller, shoulder/hip/tail seams are bridged with smoke/shadow,
and the fire plume is kept off the face/body connection.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Dict, Iterable, Tuple

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
BASE_DIR = ROOT / "assets/dragons/living-forge-fire-hatchling/cohesive-painted-base"
MANIFEST_PATH = BASE_DIR / "cohesive-proof-layer-manifest.json"
BASE_IMAGE = BASE_DIR / "living-forge-hatchling-cohesive-base-transparent-v2.png"
OUT_DIR = ROOT / "artifacts/spine/fire-hatchling/cohesive-painted-animation-proof"
VERSION = "v8"
FRAMES_DIR = OUT_DIR / f"frames-{VERSION}"
GIF_PATH = OUT_DIR / f"living-forge-cohesive-cut-animation-proof-{VERSION}.gif"
SHEET_PATH = OUT_DIR / f"living-forge-cohesive-cut-animation-proof-sheet-{VERSION}.png"
MANIFEST_OUT = OUT_DIR / f"living-forge-cohesive-cut-animation-proof-{VERSION}-manifest.json"
CANVAS = (960, 540)
FPS = 24
FRAME_COUNT = 72

# Shared-canvas proof layers, ordered back-to-front. All are cut from one base painting.
LAYER_ORDER = ["tail_lantern", "rear_leg", "body_core", "wing", "front_leg", "head_neck"]


def ease_in_out(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 0.5 - 0.5 * math.cos(math.pi * t)


def ease_out(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) * (1 - t)


def alpha_scaled(img: Image.Image, alpha: float) -> Image.Image:
    work = img.copy()
    a = work.getchannel("A").point(lambda v: int(v * max(0.0, min(1.0, alpha))))
    work.putalpha(a)
    return work


def transform_layer(img: Image.Image, pivot: Tuple[float, float], dx=0.0, dy=0.0, angle=0.0, alpha=1.0) -> Image.Image:
    work = alpha_scaled(img, alpha) if alpha < 0.999 else img.copy()
    if abs(angle) > 0.01:
        work = work.rotate(angle, resample=Image.Resampling.BICUBIC, center=pivot)
    if abs(dx) > 0.01 or abs(dy) > 0.01:
        shifted = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
        shifted.alpha_composite(work, (int(round(dx)), int(round(dy))))
        return shifted
    return work


def repaired_overlap_layer(layer: Image.Image, base: Image.Image, radius: int = 10) -> Image.Image:
    """Add same-painting overlap margins behind a cut layer.

    This approximates the production paint-repair step: hidden pixels around each
    moving part are pulled from the original cohesive painting, softly feathered,
    and placed behind the original cut so tiny rotations do not reveal hard gaps.
    """
    alpha = layer.getchannel("A")
    expanded = alpha.filter(ImageFilter.MaxFilter(radius * 2 + 1)).filter(ImageFilter.GaussianBlur(2.2))
    original_soft = alpha.filter(ImageFilter.GaussianBlur(1.0))
    margin_alpha = Image.eval(expanded, lambda v: int(v * 0.46))
    # Keep original pixels dominant; the margin only fills just-outside areas.
    margin_alpha = Image.composite(Image.new("L", CANVAS, 0), margin_alpha, original_soft.point(lambda v: 255 if v > 12 else 0))
    texture = base.filter(ImageFilter.GaussianBlur(0.45)).copy()
    texture.putalpha(margin_alpha)
    repaired = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    repaired.alpha_composite(texture)
    repaired.alpha_composite(layer)
    return repaired


def load_layers(base: Image.Image) -> Dict[str, dict]:
    data = json.loads(MANIFEST_PATH.read_text())
    layers = {}
    for entry in data["layers"]:
        name = entry["name"]
        path = ROOT / entry["file"]
        raw = Image.open(path).convert("RGBA")
        repair_radius = 8 if name in {"head_neck", "wing", "tail_lantern"} else 5
        layers[name] = {
            "image": repaired_overlap_layer(raw, base, repair_radius),
            "rawImage": raw,
            "pivot": tuple(entry["pivot"]),
            "bbox": entry["bbox"],
            "repairRadius": repair_radius,
        }
    return layers


def layer_motion(name: str, p: float) -> dict:
    """Visible but cohesive authored offsets: brace, lunge, wing flare, tail counter-swing."""
    idle = math.sin(p * math.tau)
    cfg = {"dx": 0.0, "dy": 0.0, "angle": 0.0, "alpha": 1.0}

    # Timeline: living idle -> anticipation crouch -> attack lunge -> recoil/recover.
    brace = ease_in_out((p - 0.18) / 0.18)
    breath = ease_out((p - 0.34) / 0.20)
    recover = ease_in_out((p - 0.64) / 0.28)
    snap = math.sin(max(0.0, min(1.0, (p - 0.34) / 0.20)) * math.pi)

    if name == "body_core":
        cfg.update(dx=-6.0 * brace + 4.2 * recover, dy=-1.8 * idle + 3.2 * brace - 1.0 * breath, angle=-1.6 * brace + 0.9 * recover)
    elif name == "head_neck":
        # Strong visible head push, but not so far that the neck disconnects from shoulder.
        cfg.update(dx=-5.0 * brace - 13.5 * breath + 8.0 * recover + 1.0 * idle, dy=-1.6 * brace + 1.2 * snap + 0.7 * idle, angle=-3.2 * brace + 2.0 * recover)
    elif name == "wing":
        # Wing flare sells body motion; root is masked by smoke/overlap bridges.
        cfg.update(dx=1.4 * idle - 1.0 * brace, dy=-1.0 * idle - 1.2 * brace, angle=-3.8 * idle + 8.5 * brace - 5.5 * recover)
    elif name == "front_leg":
        cfg.update(dx=-5.2 * brace + 3.4 * recover, dy=4.2 * brace - 1.0 * recover, angle=-7.0 * brace + 3.4 * recover)
    elif name == "rear_leg":
        cfg.update(dx=4.2 * brace - 1.8 * recover, dy=2.0 * brace, angle=5.2 * brace - 2.2 * recover)
    elif name == "tail_lantern":
        cfg.update(dx=7.5 * brace - 4.2 * idle - 3.0 * recover, dy=1.0 * idle + 1.0 * brace, angle=4.6 * idle + 10.5 * brace - 5.0 * recover)

    return cfg


def draw_soft_ellipse(layer: Image.Image, box, fill, blur=10):
    tmp = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    d = ImageDraw.Draw(tmp, "RGBA")
    d.ellipse(box, fill=fill)
    tmp = tmp.filter(ImageFilter.GaussianBlur(blur))
    layer.alpha_composite(tmp)


def paint_continuity_bridges(frame: Image.Image, p: float, over: bool = False) -> None:
    """Painted smoke/shadow bridges that hide cut seams at anatomy joints."""
    bridge = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    d = ImageDraw.Draw(bridge, "RGBA")
    flicker = 0.5 + 0.5 * math.sin(p * math.tau)

    if not over:
        # Under-shadows at shoulder, hip, tail base, and neck connection.
        draw_soft_ellipse(bridge, (378, 118, 535, 265), (29, 18, 18, 72), blur=18)
        draw_soft_ellipse(bridge, (450, 268, 610, 405), (32, 18, 18, 58), blur=17)
        draw_soft_ellipse(bridge, (564, 292, 710, 382), (34, 17, 13, 48), blur=16)
        draw_soft_ellipse(bridge, (265, 170, 442, 330), (32, 18, 17, 46), blur=17)
    else:
        # Smoke mane over the wing root, shaped like part of the creature rather than a gray connector blob.
        smoke_alpha = int(72 + 28 * flicker)
        for x, y, rx, ry, a in [
            (430, 184, 54, 24, smoke_alpha),
            (392, 168, 38, 19, smoke_alpha - 10),
            (466, 157, 30, 18, smoke_alpha - 18),
        ]:
            draw_soft_ellipse(bridge, (x - rx, y - ry, x + rx, y + ry), (92, 84, 82, max(20, a)), blur=8)
        # Warm overlap glazes that make the wing root/tail base share the same palette.
        d.line([(390, 224), (432, 206), (484, 205), (520, 226)], fill=(255, 116, 38, 56), width=5)
        d.line([(575, 331), (626, 319), (687, 331)], fill=(255, 118, 34, 42), width=5)
        d.line([(300, 270), (350, 251), (396, 243)], fill=(255, 125, 42, 38), width=4)
    frame.alpha_composite(bridge)


def draw_core_glow(frame: Image.Image, p: float) -> None:
    glow = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    active = ease_in_out((p - 0.22) / 0.28) * (1 - 0.55 * ease_in_out((p - 0.68) / 0.24))
    flicker = 0.5 + 0.5 * math.sin(p * math.tau * 2.0)
    a = int(42 + 86 * max(active, flicker * 0.35))
    draw_soft_ellipse(glow, (312, 260, 432, 382), (255, 95, 28, a), blur=18)
    draw_soft_ellipse(glow, (650, 288, 735, 394), (255, 160, 52, int(a * 0.68)), blur=16)
    frame.alpha_composite(glow)


def draw_fire_plume(frame: Image.Image, p: float) -> None:
    start = ease_out((p - 0.36) / 0.18)
    fade = ease_in_out((p - 0.64) / 0.22)
    strength = max(0.0, min(1.0, start * (1 - fade)))
    if strength <= 0.02:
        return
    plume = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    d = ImageDraw.Draw(plume, "RGBA")

    # Origin is just left of the mouth. The plume extends left and slightly down,
    # avoiding the face/neck/shoulder connection that previously hid seams.
    mouth = (204, 258)
    length = int(95 + 270 * strength)
    wobble = math.sin(p * math.tau * 3) * 8
    tip_x = max(-190, mouth[0] - length)
    y = mouth[1] + wobble * 0.25

    outer = [
        (mouth[0] + 6, y - 17),
        (mouth[0] - length * 0.28, y - 31 - wobble * 0.2),
        (tip_x, y - 13),
        (tip_x - 30, y + 2),
        (tip_x, y + 17),
        (mouth[0] - length * 0.28, y + 30 + wobble * 0.2),
        (mouth[0] + 6, y + 16),
    ]
    inner = [
        (mouth[0] - 4, y - 6),
        (mouth[0] - length * 0.42, y - 12),
        (tip_x + 30, y - 4),
        (tip_x + 4, y + 5),
        (mouth[0] - length * 0.44, y + 11),
        (mouth[0] - 4, y + 5),
    ]
    d.polygon(outer, fill=(198, 74, 20, int(196 * strength)))
    d.polygon(inner, fill=(255, 190, 70, int(220 * strength)))
    d.line([(mouth[0], y), (tip_x + 30, y + 3)], fill=(255, 239, 122, int(180 * strength)), width=5)
    for i in range(12):
        t = i / 11
        ex = mouth[0] - length * (0.1 + 0.78 * t)
        ey = y + math.sin(t * math.tau * 1.6 + p * 9) * 16
        r = 2 + (i % 3)
        d.ellipse((ex - r, ey - r, ex + r, ey + r), fill=(255, 150, 36, int(130 * strength * (1 - t * 0.4))))
    plume = plume.filter(ImageFilter.GaussianBlur(1.1))
    frame.alpha_composite(plume)


def frame_background() -> Image.Image:
    bg = Image.new("RGBA", CANVAS, (34, 25, 22, 255))
    d = ImageDraw.Draw(bg, "RGBA")
    d.rectangle((0, 0, CANVAS[0], CANVAS[1]), fill=(35, 25, 22, 255))
    d.ellipse((120, 414, 770, 514), fill=(0, 0, 0, 72))
    return bg


def render_frame(idx: int, base: Image.Image, layers: Dict[str, dict]) -> Image.Image:
    p = idx / FRAME_COUNT
    frame = frame_background()

    # No full-base underpaint here: even a faint copy was visible as a ghosted duplicate in review.
    # Local bridge glazes below handle seam repair without making a second creature silhouette.
    paint_continuity_bridges(frame, p, over=False)

    for name in LAYER_ORDER:
        layer = layers[name]
        cfg = layer_motion(name, p)
        frame.alpha_composite(transform_layer(layer["image"], layer["pivot"], **cfg))
        if name == "body_core":
            draw_core_glow(frame, p)
        if name == "head_neck":
            # Fire should originate at the mouth and not cover the neck/body seam.
            draw_fire_plume(frame, p)

    paint_continuity_bridges(frame, p, over=True)
    return frame


def make_contact_sheet(frames: Iterable[Image.Image]) -> Image.Image:
    samples = [0, 8, 16, 24, 32, 40, 52, 64]
    imgs = list(frames)
    cell_w, cell_h = 480, 270
    sheet = Image.new("RGBA", (cell_w * 2, cell_h * 4), (22, 18, 16, 255))
    d = ImageDraw.Draw(sheet, "RGBA")
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", 13)
    except Exception:
        font = ImageFont.load_default()
    for n, idx in enumerate(samples):
        thumb = imgs[idx].resize((cell_w, cell_h), Image.Resampling.LANCZOS)
        x = (n % 2) * cell_w
        y = (n // 2) * cell_h
        sheet.alpha_composite(thumb, (x, y))
        d.rectangle((x, y, x + cell_w - 1, y + cell_h - 1), outline=(255, 113, 34, 255), width=2)
        d.text((x + 8, y + 8), f"{VERSION} frame {idx}", fill=(255, 215, 150, 255), font=font)
    return sheet.convert("RGB")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    FRAMES_DIR.mkdir(parents=True, exist_ok=True)
    base = Image.open(BASE_IMAGE).convert("RGBA")
    if base.size != CANVAS:
        base = base.resize(CANVAS, Image.Resampling.LANCZOS)
    layers = load_layers(base)
    frames = []
    for idx in range(FRAME_COUNT):
        frame = render_frame(idx, base, layers)
        frame_path = FRAMES_DIR / f"frame_{idx:03d}.png"
        frame.save(frame_path)
        frames.append(frame.convert("P", palette=Image.Palette.ADAPTIVE, colors=192))

    frames[0].save(
        GIF_PATH,
        save_all=True,
        append_images=frames[1:],
        duration=int(1000 / FPS),
        loop=0,
        optimize=False,
        disposal=2,
    )
    rgb_frames = [Image.open(FRAMES_DIR / f"frame_{idx:03d}.png").convert("RGBA") for idx in range(FRAME_COUNT)]
    make_contact_sheet(rgb_frames).save(SHEET_PATH)
    MANIFEST_OUT.write_text(json.dumps({
        "version": VERSION,
        "source": str(BASE_IMAGE.relative_to(ROOT)),
        "principle": "same cohesive base painting, subtle broad-layer motion, repaired overlap margins, painted seam bridges",
        "frameCount": FRAME_COUNT,
        "fps": FPS,
        "outputs": {
            "gif": str(GIF_PATH.relative_to(ROOT)),
            "sheet": str(SHEET_PATH.relative_to(ROOT)),
            "frames": str(FRAMES_DIR.relative_to(ROOT)),
        },
        "stakeholderFixes": [
            "Reduced broad cut movement so wing/head/tail do not separate from torso.",
            "Added same-painting overlap margins behind every moving layer to prevent cutout gaps.",
            "Removed full-body underpaint to avoid ghosted double silhouettes.",
            "Added shoulder, hip, neck, and tail-base smoke/shadow bridges.",
            "Moved fire plume to mouth lane so it no longer hides face/neck seam.",
            "Unifies glow treatment across chest and lantern with warm overlap glazes."
        ],
        "finalArtNote": "Still a proof. Final rig needs hand-painted overlap margins in Krita/Spine, not only procedural seam bridges.",
    }, indent=2) + "\n")
    print(GIF_PATH)
    print(SHEET_PATH)
    print(MANIFEST_OUT)


if __name__ == "__main__":
    main()
