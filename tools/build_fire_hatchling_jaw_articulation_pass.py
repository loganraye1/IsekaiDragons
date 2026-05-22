#!/usr/bin/env python3
"""Fire Hatchling jaw articulation mechanics-truth production slice.

Creates separated jaw art, a jaw-controller Spine proof JSON, and a rough mechanics
validation prototype focused on pressure-release valve behavior rather than polish.
"""
from __future__ import annotations

import json
import math
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "assets/dragons/living-forge-fire-hatchling/spine-production-director-pass-v1-neck-underlap/layers"
SRC_JSON = ROOT / "assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.director-pass-v1-neck-underlap.spine.json"
OUT_DIR = ROOT / "assets/dragons/living-forge-fire-hatchling/spine-production-mechanics-truth-v3-jaw-articulation"
LAYER_DIR = OUT_DIR / "layers"
PROJECT_DIR = ROOT / "assets/dragons/living-forge-fire-hatchling/spine-project"
SPINE_JSON = PROJECT_DIR / "living-forge-fire-hatchling.mechanics-truth-v3-jaw-articulation.spine.json"
SPINE_FILE = PROJECT_DIR / "living-forge-fire-hatchling.mechanics-truth-v3-jaw-articulation.spine"
ART_DIR = ROOT / "artifacts/spine/fire-hatchling/mechanics-truth-v3-jaw-articulation"
SPINE_EXE = r"C:\Program Files\Spine\Spine.exe"

HEAD_NAME = "05_head_neck"
UPPER_NAME = "05a_upper_head_neck"
LOWER_NAME = "05b_lower_jaw_pressure_valve"
MOUTH_GLOW_NAME = "05c_jaw_pressure_glow"
HINGE = (120, 166)  # local coordinates in 320x293 head layer
CANVAS = (960, 540)
HEAD_PLACEMENT = (170, 115)  # review/prototype placement only


def win(path: Path) -> str:
    return subprocess.check_output(["wslpath", "-w", str(path)], text=True).strip()


def ensure_clean() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    LAYER_DIR.mkdir(parents=True, exist_ok=True)
    ART_DIR.mkdir(parents=True, exist_ok=True)
    PROJECT_DIR.mkdir(parents=True, exist_ok=True)


def copy_base_layers() -> None:
    for p in SRC_DIR.glob("*.png"):
        shutil.copy2(p, LAYER_DIR / p.name)


def make_jaw_masks(head: Image.Image) -> tuple[Image.Image, Image.Image, Image.Image]:
    alpha = head.getchannel("A")
    lower_mask = Image.new("L", head.size, 0)
    d = ImageDraw.Draw(lower_mask)
    # lower muzzle/chin wedge. Kept intentionally local: mechanics proxy, not polish.
    lower_poly = [
        (58, 174), (93, 164), (123, 166), (152, 178), (190, 198),
        (205, 224), (178, 244), (132, 258), (83, 235), (47, 205),
    ]
    d.polygon(lower_poly, fill=255)
    d.ellipse((63, 178, 150, 239), fill=255)
    d.ellipse((110, 176, 210, 246), fill=255)
    lower_mask = ImageChops.multiply(lower_mask.filter(ImageFilter.GaussianBlur(1.1)), alpha)
    lower_mask = lower_mask.point(lambda v: 255 if v > 22 else 0).filter(ImageFilter.GaussianBlur(0.65))

    hinge_mask = Image.new("L", head.size, 0)
    hd = ImageDraw.Draw(hinge_mask)
    hd.ellipse((HINGE[0] - 11, HINGE[1] - 11, HINGE[0] + 11, HINGE[1] + 11), fill=255)
    hinge_mask = hinge_mask.filter(ImageFilter.GaussianBlur(4))
    lower_mask = ImageChops.lighter(lower_mask, ImageChops.multiply(hinge_mask, alpha))

    upper_alpha = ImageChops.subtract(alpha, lower_mask.point(lambda v: min(255, int(v * 1.15))))
    upper_alpha = ImageChops.lighter(upper_alpha, alpha.point(lambda v: 255 if v > 0 else 0).filter(ImageFilter.MinFilter(3)).point(lambda v: 0))
    # Keep a tiny overlap at hinge so separation has underpaint continuity.
    hinge_overlap = ImageChops.multiply(hinge_mask, alpha)
    upper_alpha = ImageChops.lighter(upper_alpha, hinge_overlap.point(lambda v: min(255, int(v * 0.45))))

    pressure_mask = Image.new("L", head.size, 0)
    pd = ImageDraw.Draw(pressure_mask)
    pd.polygon([(68, 180), (118, 168), (182, 196), (150, 214), (85, 204)], fill=210)
    pd.ellipse((70, 172, 185, 220), fill=180)
    pressure_mask = ImageChops.multiply(pressure_mask.filter(ImageFilter.GaussianBlur(5)), alpha)
    return upper_alpha, lower_mask, pressure_mask


def apply_alpha(src: Image.Image, alpha: Image.Image) -> Image.Image:
    out = src.copy()
    out.putalpha(alpha)
    return out


def rotate_about(img: Image.Image, angle: float, pivot: tuple[int, int], expand_size: tuple[int, int] | None = None) -> Image.Image:
    # PIL affine inverse rotation around pivot, preserving original canvas size.
    w, h = img.size
    px, py = pivot
    rad = math.radians(angle)
    cos_a, sin_a = math.cos(rad), math.sin(rad)
    a = cos_a
    b = sin_a
    c = px - cos_a * px - sin_a * py
    d = -sin_a
    e = cos_a
    f = py + sin_a * px - cos_a * py
    return img.transform((w, h), Image.Transform.AFFINE, (a, b, c, d, e, f), resample=Image.Resampling.BICUBIC)


def create_jaw_layers() -> dict:
    head = Image.open(SRC_DIR / f"{HEAD_NAME}.png").convert("RGBA")
    upper_alpha, lower_alpha, pressure_alpha = make_jaw_masks(head)
    upper = apply_alpha(head, upper_alpha)
    lower = apply_alpha(head, lower_alpha)

    glow = Image.new("RGBA", head.size, (255, 92, 20, 0))
    glow.putalpha(pressure_alpha.point(lambda v: int(v * 0.75)))
    glow = Image.alpha_composite(Image.new("RGBA", head.size, (255, 180, 64, 0)), glow)

    # Save replacement and components. Keep original for reference only.
    upper.save(LAYER_DIR / f"{UPPER_NAME}.png")
    lower.save(LAYER_DIR / f"{LOWER_NAME}.png")
    glow.save(LAYER_DIR / f"{MOUTH_GLOW_NAME}.png")

    # A no-lower-jaw head_neck replacement lets the lower jaw actually separate in Spine.
    upper.save(LAYER_DIR / f"{HEAD_NAME}.png")

    guide = Image.new("RGBA", (head.width * 2 + 80, head.height + 90), (28, 24, 21, 255))
    gd = ImageDraw.Draw(guide)
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", 16)
        title = ImageFont.truetype("DejaVuSans.ttf", 24)
    except OSError:
        font = title = None
    guide.alpha_composite(upper, (30, 60))
    guide.alpha_composite(lower, (head.width + 50, 60))
    gd.text((30, 18), "Upper head/neck: jaw removed, hinge overlap retained", fill=(255, 224, 170), font=title)
    gd.text((head.width + 50, 18), "Lower jaw: pressure-release valve component", fill=(255, 224, 170), font=title)
    for offx in (30, head.width + 50):
        x, y = offx + HINGE[0], 60 + HINGE[1]
        gd.ellipse((x - 8, y - 8, x + 8, y + 8), outline=(0, 255, 255), width=3)
        gd.line((x - 18, y, x + 18, y), fill=(0, 255, 255), width=2)
        gd.line((x, y - 18, x, y + 18), fill=(0, 255, 255), width=2)
    gd.text((30, head.height + 64), "Mechanics intent: jaw opens only after chest compression + neck pressure, then recoils/settles.", fill=(235, 210, 185), font=font)
    guide.convert("RGB").save(ART_DIR / "jaw-separation-guide.jpg", quality=94)

    return {
        "headSize": head.size,
        "hingeLocal": HINGE,
        "upperLayer": f"layers/{UPPER_NAME}.png",
        "lowerLayer": f"layers/{LOWER_NAME}.png",
        "pressureGlowLayer": f"layers/{MOUTH_GLOW_NAME}.png",
    }


def update_spine_json(meta: dict) -> None:
    data = json.loads(SRC_JSON.read_text())
    data["skeleton"]["hash"] = "mechanics-truth-v3-jaw-articulation"
    data["skeleton"]["images"] = win(LAYER_DIR) + "\\"

    bones = data["bones"]
    if not any(b["name"] == "lower_jaw_hinge" for b in bones):
        bones.append({"name": "lower_jaw_hinge", "parent": "head_neck", "x": -178, "y": -16})
    if not any(b["name"] == "jaw_pressure" for b in bones):
        bones.append({"name": "jaw_pressure", "parent": "lower_jaw_hinge", "x": 0, "y": 0})

    slots = data["slots"]
    # Ensure slot_head_neck points to upper/no-lower replacement path (same attachment name path unchanged).
    insert_at = next((i for i, s in enumerate(slots) if s["name"] == "slot_head_neck"), len(slots)) + 1
    if not any(s["name"] == "slot_jaw_pressure_glow" for s in slots):
        slots.insert(insert_at, {"name": "slot_jaw_pressure_glow", "bone": "jaw_pressure", "attachment": MOUTH_GLOW_NAME})
        insert_at += 1
    if not any(s["name"] == "slot_lower_jaw" for s in slots):
        slots.insert(insert_at, {"name": "slot_lower_jaw", "bone": "lower_jaw_hinge", "attachment": LOWER_NAME})

    attachments = data["skins"][0]["attachments"]
    # Original head attachment remains named 05_head_neck and path now points to no-lower-jaw file copied over.
    lower_attach = {
        "type": "region",
        "path": LOWER_NAME,
        "x": -56.0,
        "y": 37.5,
        "width": 320,
        "height": 293,
    }
    glow_attach = {
        "type": "region",
        "path": MOUTH_GLOW_NAME,
        "x": -56.0,
        "y": 37.5,
        "width": 320,
        "height": 293,
    }
    attachments["slot_lower_jaw"] = {LOWER_NAME: lower_attach}
    attachments["slot_jaw_pressure_glow"] = {MOUTH_GLOW_NAME: glow_attach}

    animations = data.setdefault("animations", {})
    animations["mechanics_truth_jaw_pressure_release"] = {
        "bones": {
            "body_core": {
                "translate": [
                    {"time": 0.0, "x": 0, "y": 0, "curve": "smooth"},
                    {"time": 0.16, "x": -5, "y": -8, "curve": "smooth"},
                    {"time": 0.32, "x": 3, "y": 5, "curve": "stepped"},
                    {"time": 0.46, "x": -2, "y": -2, "curve": "smooth"},
                    {"time": 0.64, "x": 0, "y": 0, "curve": "smooth"},
                ],
                "scale": [
                    {"time": 0.0, "x": 1, "y": 1, "curve": "smooth"},
                    {"time": 0.16, "x": 1.035, "y": 0.965, "curve": "smooth"},
                    {"time": 0.32, "x": 0.985, "y": 1.025, "curve": "smooth"},
                    {"time": 0.64, "x": 1, "y": 1, "curve": "smooth"},
                ],
            },
            "neck_base_deform": {
                "translate": [
                    {"time": 0.0, "x": 0, "y": 0, "curve": "smooth"},
                    {"time": 0.16, "x": -8, "y": -3, "curve": "smooth"},
                    {"time": 0.28, "x": 13, "y": 4, "curve": "smooth"},
                    {"time": 0.46, "x": -4, "y": -2, "curve": "smooth"},
                    {"time": 0.64, "x": 0, "y": 0, "curve": "smooth"},
                ]
            },
            "head_neck": {
                "rotate": [
                    {"time": 0.0, "value": 0, "curve": "smooth"},
                    {"time": 0.16, "value": -4, "curve": "smooth"},
                    {"time": 0.28, "value": 6, "curve": "stepped"},
                    {"time": 0.46, "value": -2, "curve": "smooth"},
                    {"time": 0.64, "value": 0, "curve": "smooth"},
                ]
            },
            "jaw_pressure": {
                "scale": [
                    {"time": 0.0, "x": 0.2, "y": 0.2, "curve": "smooth"},
                    {"time": 0.16, "x": 0.55, "y": 0.55, "curve": "smooth"},
                    {"time": 0.24, "x": 1.0, "y": 1.0, "curve": "smooth"},
                    {"time": 0.34, "x": 0.15, "y": 0.15, "curve": "smooth"},
                    {"time": 0.64, "x": 0.0, "y": 0.0, "curve": "smooth"},
                ]
            },
            "lower_jaw_hinge": {
                "rotate": [
                    {"time": 0.0, "value": 0, "curve": "smooth"},
                    {"time": 0.16, "value": -3, "curve": "smooth"},
                    {"time": 0.24, "value": 11, "curve": "smooth"},
                    {"time": 0.30, "value": 26, "curve": "stepped"},
                    {"time": 0.40, "value": 10, "curve": "smooth"},
                    {"time": 0.54, "value": -2, "curve": "smooth"},
                    {"time": 0.64, "value": 0, "curve": "smooth"},
                ],
                "translate": [
                    {"time": 0.0, "x": 0, "y": 0, "curve": "smooth"},
                    {"time": 0.16, "x": -1, "y": 1, "curve": "smooth"},
                    {"time": 0.30, "x": 4, "y": -3, "curve": "stepped"},
                    {"time": 0.46, "x": -2, "y": 1, "curve": "smooth"},
                    {"time": 0.64, "x": 0, "y": 0, "curve": "smooth"},
                ],
            },
            "tail_lantern": {
                "rotate": [
                    {"time": 0.0, "value": 0, "curve": "smooth"},
                    {"time": 0.32, "value": 0, "curve": "smooth"},
                    {"time": 0.46, "value": -7, "curve": "smooth"},
                    {"time": 0.64, "value": 0, "curve": "smooth"},
                ]
            },
        },
    }
    SPINE_JSON.write_text(json.dumps(data, indent=2) + "\n")


def export_spine() -> tuple[int, str]:
    cmd = ["powershell.exe", "-NoProfile", "-Command", f"& '{SPINE_EXE}' -i '{win(SPINE_JSON)}' -o '{win(SPINE_FILE)}' -r"]
    proc = subprocess.run(cmd, text=True, capture_output=True, timeout=120)
    return proc.returncode, (proc.stdout + proc.stderr)


def make_review_frames() -> dict:
    # Use existing full composite if available as base mechanics body, overlay articulated jaw components on top.
    base_path = ROOT / "artifacts/spine/fire-hatchling/deformation-phase-v2-clean-mechanics/mobile-size-attack-pose-frame012-v2.jpg"
    if base_path.exists():
        base = Image.open(base_path).convert("RGBA").resize(CANVAS, Image.Resampling.LANCZOS)
    else:
        base = Image.new("RGBA", CANVAS, (24, 21, 19, 255))
    upper = Image.open(LAYER_DIR / f"{HEAD_NAME}.png").convert("RGBA")
    lower = Image.open(LAYER_DIR / f"{LOWER_NAME}.png").convert("RGBA")
    glow = Image.open(LAYER_DIR / f"{MOUTH_GLOW_NAME}.png").convert("RGBA")

    states = [
        ("01 compression_closed", 0, 0.25, "chest compresses; jaw stays sealed"),
        ("02 pressure_build", -4, 0.65, "heat buildup pushes into neck pressure"),
        ("03 snap_open", 32, 1.00, "jaw releases furnace pressure"),
        ("04 recoil_catch", 12, 0.45, "recoil travels back into neck/torso"),
        ("05 settle_closed", 0, 0.10, "jaw settles after discharge"),
    ]
    frames = []
    for idx, (label, angle, glow_strength, note) in enumerate(states, 1):
        frame = Image.new("RGBA", CANVAS, (24, 21, 19, 255))
        # darken base so jaw mechanics overlay reads as annotation/proof, not polish.
        dim = ImageEnhance.Brightness(base).enhance(0.54)
        frame.alpha_composite(dim, (0, 0))
        # crude body pressure annotation.
        draw = ImageDraw.Draw(frame)
        chest = (415, 300)
        neck = (340, 240)
        mouth = (HEAD_PLACEMENT[0] + 100, HEAD_PLACEMENT[1] + 185)
        draw.line((chest, neck, mouth), fill=(255, 118, 34, 220), width=5)
        if idx <= 2:
            draw.ellipse((chest[0]-42, chest[1]-30, chest[0]+42, chest[1]+30), outline=(255, 126, 42, 230), width=4)
        if idx == 3:
            draw.polygon([(mouth[0]-6, mouth[1]-12), (mouth[0]-80, mouth[1]-34), (mouth[0]-72, mouth[1]+10)], fill=(255, 100, 24, 190))
        # Place upper head, then glow, then rotated jaw.
        frame.alpha_composite(upper, HEAD_PLACEMENT)
        if glow_strength > 0:
            g = glow.copy()
            g.putalpha(g.getchannel("A").point(lambda v: int(v * glow_strength)))
            frame.alpha_composite(g, HEAD_PLACEMENT)
        rlower = rotate_about(lower, angle, HINGE)
        frame.alpha_composite(rlower, HEAD_PLACEMENT)
        # Mechanics-truth close-up inset: makes jaw valve behavior reviewable without
        # pretending this is final combat presentation polish.
        crop = frame.crop((HEAD_PLACEMENT[0] + 25, HEAD_PLACEMENT[1] + 120, HEAD_PLACEMENT[0] + 230, HEAD_PLACEMENT[1] + 255))
        crop = crop.resize((328, 216), Image.Resampling.LANCZOS)
        frame.alpha_composite(Image.new("RGBA", (344, 232), (12, 10, 9, 220)), (596, 290))
        frame.alpha_composite(crop, (604, 298))
        draw.rectangle((604, 298, 932, 514), outline=(0, 240, 255, 255), width=2)
        draw.text((610, 302), "jaw valve inset", fill=(0, 240, 255, 255), font=small if 'small' in locals() else None)
        hx, hy = HEAD_PLACEMENT[0] + HINGE[0], HEAD_PLACEMENT[1] + HINGE[1]
        draw.ellipse((hx - 6, hy - 6, hx + 6, hy + 6), fill=(0, 240, 255, 255))
        try:
            font = ImageFont.truetype("DejaVuSans.ttf", 22)
            small = ImageFont.truetype("DejaVuSans.ttf", 16)
        except OSError:
            font = small = None
        draw.text((24, 22), label, fill=(255, 224, 170), font=font)
        draw.text((24, 54), note, fill=(235, 210, 185), font=small)
        draw.text((24, 500), "Energy Source Rule: chest compression → heat buildup → neck pressure → jaw release → recoil discharge", fill=(255, 170, 95), font=small)
        frames.append(frame.convert("RGB"))

    contact = Image.new("RGB", (1500, 900), (24, 21, 19))
    cd = ImageDraw.Draw(contact)
    try:
        title = ImageFont.truetype("DejaVuSans.ttf", 30)
    except OSError:
        title = None
    cd.text((30, 24), "Mechanics Truth v3 — Jaw Articulation as Furnace Pressure Valve", fill=(255, 224, 170), font=title)
    for i, frame in enumerate(frames):
        thumb = frame.copy()
        thumb.thumbnail((460, 255), Image.Resampling.LANCZOS)
        x = 30 + (i % 3) * 490
        y = 85 + (i // 3) * 340
        contact.paste(thumb, (x, y))
        cd.rectangle((x - 2, y - 2, x + 462, y + 257), outline=(255, 126, 42), width=2)
    contact_path = ART_DIR / "jaw-articulation-mechanics-contact-sheet.jpg"
    contact.save(contact_path, quality=94)

    gif_path = ART_DIR / "jaw-articulation-pressure-release-prototype.gif"
    frames[0].save(gif_path, save_all=True, append_images=frames[1:], duration=[180, 160, 120, 160, 220], loop=0)

    sil_frames = []
    for frame in frames:
        rgba = frame.convert("RGBA")
        # silhouette of bright jaw/head overlay + base alpha approximated from non-bg luminance.
        gray = rgba.convert("L")
        mask = gray.point(lambda v: 255 if v > 35 else 0).filter(ImageFilter.MaxFilter(5))
        sil = Image.new("RGB", CANVAS, (244, 242, 236))
        sd = ImageDraw.Draw(sil)
        sil.paste((0, 0, 0), mask=mask)
        sil_frames.append(sil)
    sil_path = ART_DIR / "jaw-articulation-silhouette.gif"
    sil_frames[0].save(sil_path, save_all=True, append_images=sil_frames[1:], duration=[180, 160, 120, 160, 220], loop=0)

    mobile = frames[2].resize((480, 270), Image.Resampling.LANCZOS)
    mobile_path = ART_DIR / "mobile-50-jaw-snap-open.jpg"
    mobile.save(mobile_path, quality=94)
    return {"contact": contact_path, "gif": gif_path, "silhouette": sil_path, "mobile": mobile_path}


def write_manifest(jaw_meta: dict, spine_code: int, spine_log: str, artifacts: dict) -> None:
    manifest = {
        "name": "mechanics-truth-v3-jaw-articulation",
        "activeDirective": "docs/FIRE_HATCHLING_MECHANICS_TRUTH_AUTOMATION_DIRECTIVE_2026-05-14.md",
        "sourceOfTruth": "automation baseline lowest score: Jaw Articulation — 2.5/10",
        "phase": "mechanics truth, not polish",
        "energySourceRule": ["chest compression", "heat buildup", "neck pressure", "jaw release", "recoil discharge"],
        "jaw": {
            **jaw_meta,
            "controllerBones": ["lower_jaw_hinge", "jaw_pressure"],
            "timingStates": ["compression/closed", "pressure build", "snap/open", "recoil settle"],
            "intent": "lower jaw behaves as a pressure-release valve for the internal furnace, not cosmetic mouth opening",
        },
        "proofHealth": {
            "spineJson": str(SPINE_JSON.relative_to(ROOT)),
            "spineFile": str(SPINE_FILE.relative_to(ROOT)),
            "spineImportExitCode": spine_code,
            "spineImportLogTail": spine_log[-1800:],
            "layers": str(LAYER_DIR.relative_to(ROOT)),
            "artifacts": {k: str(v.relative_to(ROOT)) for k, v in artifacts.items()},
        },
        "notPolish": ["no plume beauty", "no ember refinement", "no presentation cleanup", "no easing finesse"],
    }
    (OUT_DIR / "jaw-articulation-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")


def main() -> None:
    ensure_clean()
    copy_base_layers()
    jaw_meta = create_jaw_layers()
    update_spine_json(jaw_meta)
    spine_code, spine_log = export_spine()
    artifacts = make_review_frames()
    write_manifest(jaw_meta, spine_code, spine_log, artifacts)
    print(json.dumps({"spineExit": spine_code, "spineFile": str(SPINE_FILE), "artifacts": {k: str(v) for k, v in artifacts.items()}}, indent=2))


if __name__ == "__main__":
    main()
