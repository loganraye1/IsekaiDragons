#!/usr/bin/env python3
"""Build a cohesive-base Spine production-prep package.

This is the corrected path after stakeholder feedback rejected rough cutout GIFs:
- source layers come from ONE cohesive approved painting, not independently generated parts
- broad pieces include same-painting overlap margins for mesh deformation
- output is a real importable Spine project for artist/mesh cleanup, not a Python proof GIF
"""
from __future__ import annotations

import json
import math
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CREATURE = ROOT / "assets/dragons/living-forge-fire-hatchling"
BASE_DIR = CREATURE / "cohesive-painted-base"
BASE_IMAGE = BASE_DIR / "living-forge-hatchling-cohesive-base-transparent-v2.png"
CUT_MANIFEST = BASE_DIR / "cohesive-proof-layer-manifest.json"
PROD_VERSION = "v7-body-cleanfill-head-original"
PROD_ROOT = CREATURE / f"spine-production-cohesive-{PROD_VERSION}"
PROD_LAYERS = PROD_ROOT / "layers"
PROD_MANIFEST = PROD_ROOT / "cohesive-spine-production-manifest.json"
PROJECT_ROOT = CREATURE / "spine-project"
SPINE_JSON = PROJECT_ROOT / f"living-forge-fire-hatchling.cohesive-production-prep-{PROD_VERSION}.spine.json"
SPINE_FILE = PROJECT_ROOT / f"living-forge-fire-hatchling.cohesive-production-prep-{PROD_VERSION}.spine"
SUMMARY = PROJECT_ROOT / f"cohesive-production-prep-{PROD_VERSION}-summary.json"
ARTIFACT_ROOT = ROOT / f"artifacts/spine/fire-hatchling/cohesive-production-prep-{PROD_VERSION}"
CONTACT_SHEET = ARTIFACT_ROOT / "cohesive-production-layer-contact-sheet.png"
SPINE_EXE = r"C:\Program Files\Spine\Spine.exe"
CANVAS = (960, 540)
CENTER = (CANVAS[0] / 2, CANVAS[1] / 2)

ORDER = ["tail_lantern", "rear_leg", "body_core", "wing", "front_leg", "head_neck"]
PARENTS = {
    "body_core": "root",
    "wing": "body_core",
    "head_neck": "body_core",
    "front_leg": "body_core",
    "rear_leg": "body_core",
    "tail_lantern": "body_core",
}
PADDING_BY_LAYER = {
    # Keep margins narrow: enough hidden paint for mesh deformation, not whole neighboring anatomy.
    "head_neck": 12,
    "wing": 14,
    "tail_lantern": 12,
    "front_leg": 9,
    "rear_leg": 9,
    "body_core": 6,
}


def win(path: Path) -> str:
    text = str(path)
    if text.startswith("/mnt/") and len(text) > 6:
        drive = text[5].upper()
        rest = text[7:].replace("/", "\\")
        return f"{drive}:\\{rest}"
    return text.replace("/", "\\")


def expanded_bbox(alpha: Image.Image, pad: int) -> Tuple[int, int, int, int]:
    bbox = alpha.getbbox()
    if not bbox:
        return (0, 0, 1, 1)
    x1, y1, x2, y2 = bbox
    return (max(0, x1 - pad), max(0, y1 - pad), min(CANVAS[0], x2 + pad), min(CANVAS[1], y2 + pad))


def _scaled_points(points: List[Tuple[float, float]], sx: float, sy: float) -> List[Tuple[int, int]]:
    return [(round(x * sx), round(y * sy)) for x, y in points]


def painted_bridge_alpha(name: str, base: Image.Image, source_alphas: Dict[str, Image.Image], sx: float, sy: float) -> Image.Image | None:
    """Manual broad masks for layers whose auto-cutouts removed too much visible paint.

    These are not final hidden-art paintovers; they are production-prep bridge plates so the
    Spine artist starts from one cohesive painted mass rather than sparse, holey cutouts.
    Coordinates are authored against the original cohesive painting and scaled to the Spine canvas.
    """
    base_alpha = base.getchannel("A")
    shape = Image.new("L", CANVAS, 0)
    draw = ImageDraw.Draw(shape)

    if name == "body_core":
        # Torso, shoulder, hip, and tail-root as one continuous mass. This replaces the sparse
        # auto body mask that looked like missing art around the neck/body contact.
        for box in [(285, 215, 585, 420), (225, 225, 405, 420)]:
            x1, y1, x2, y2 = box
            draw.ellipse((round(x1 * sx), round(y1 * sy), round(x2 * sx), round(y2 * sy)), fill=255)
        for poly in [
            [(305, 225), (425, 205), (575, 248), (595, 322), (520, 370), (355, 348), (265, 292)],
            [(280, 315), (410, 352), (545, 360), (560, 412), (360, 436), (242, 390)],
            [(520, 292), (620, 288), (625, 360), (548, 386)],
            [(282, 190), (395, 202), (430, 268), (388, 326), (292, 310), (248, 248)],
        ]:
            draw.polygon(_scaled_points(poly, sx, sy), fill=255)
        alpha = ImageChops.multiply(shape.filter(ImageFilter.GaussianBlur(0.45)), base_alpha.filter(ImageFilter.MaxFilter(5)))
        # Cut adjacent articulated pieces more aggressively in their centers, but leave a narrow
        # underlap at seams so mesh deformation won't reveal holes.
        subtract = Image.new("L", CANVAS, 0)
        for neighbor, strength in [
            ("head_neck", 0.82),
            ("wing", 1.0),
            ("front_leg", 0.78),
            ("rear_leg", 0.78),
            ("tail_lantern", 1.0),
        ]:
            local = source_alphas[neighbor].point(lambda v, s=strength: round(v * s))
            subtract = ImageChops.lighter(subtract, local)
        alpha = ImageChops.subtract(alpha, subtract)
        return alpha.filter(ImageFilter.GaussianBlur(0.35)).point(lambda v: min(255, round(v * 1.25)))

    if name == "head_neck":
        # Keep the original head/neck extraction for now. Attempts to procedurally widen it
        # pulled in too much body or exposed transparent RGB. The remaining neck repair should be
        # a hand paint-over in Spine/source art, not another automatic mask expansion.
        return None

    return None


def make_overlap_layer(mask_layer: Image.Image, base: Image.Image, pad: int) -> Image.Image:
    """Create same-painting repaired layer with feathered hidden overlap margins."""
    alpha = mask_layer.getchannel("A")
    expanded = alpha.filter(ImageFilter.MaxFilter(pad * 2 + 1)).filter(ImageFilter.GaussianBlur(1.4))
    original = alpha.point(lambda v: 255 if v > 4 else 0)
    # Subtle ring only: this is a mesh safety margin, not a second copy of adjacent anatomy.
    margin = Image.composite(Image.new("L", CANVAS, 0), expanded.point(lambda v: int(v * 0.28)), original)
    texture = base.filter(ImageFilter.GaussianBlur(0.2)).copy()
    texture.putalpha(margin)
    out = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    out.alpha_composite(texture)
    out.alpha_composite(mask_layer)
    return out


def build_layers() -> List[dict]:
    PROD_LAYERS.mkdir(parents=True, exist_ok=True)
    PROJECT_ROOT.mkdir(parents=True, exist_ok=True)
    ARTIFACT_ROOT.mkdir(parents=True, exist_ok=True)

    base = Image.open(BASE_IMAGE).convert("RGBA")
    original_base_size = base.size
    sx = CANVAS[0] / original_base_size[0]
    sy = CANVAS[1] / original_base_size[1]
    if base.size != CANVAS:
        base = base.resize(CANVAS, Image.Resampling.LANCZOS)
    manifest = json.loads(CUT_MANIFEST.read_text())
    by_name = {entry["name"]: entry for entry in manifest["layers"]}
    source_alphas: Dict[str, Image.Image] = {}
    for name, entry in by_name.items():
        source_alphas[name] = Image.open(ROOT / entry["file"]).convert("RGBA").getchannel("A").point(lambda v: 255 if v > 4 else 0)
    layers: List[dict] = []

    for idx, name in enumerate(ORDER):
        entry = by_name[name]
        source = Image.open(ROOT / entry["file"]).convert("RGBA")
        bridge_alpha = painted_bridge_alpha(name, base, source_alphas, sx, sy)
        if bridge_alpha is not None:
            source = base.copy()
            source.putalpha(bridge_alpha)
        pad = PADDING_BY_LAYER[name]
        repaired = make_overlap_layer(source, base, pad)
        bbox = expanded_bbox(repaired.getchannel("A"), 2)
        crop = repaired.crop(bbox)
        file_name = f"{idx:02d}_{name}.png"
        crop.save(PROD_LAYERS / file_name)
        layers.append({
            "name": name,
            "file": file_name,
            "sourceFile": entry["file"],
            "bbox": list(bbox),
            "pivot": entry["pivot"],
            "parent": PARENTS[name],
            "overlapPadding": pad,
            "cropWidth": bbox[2] - bbox[0],
            "cropHeight": bbox[3] - bbox[1],
            "meshAuthoringNote": "Convert region to mesh in Spine; keep overlap margin hidden behind parent/body during deformation.",
        })

    PROD_MANIFEST.write_text(json.dumps({
        "name": "living-forge-fire-hatchling-cohesive-spine-production-prep",
        "source": str(BASE_IMAGE.relative_to(ROOT)),
        "principle": "one cohesive painting cut into broad Spine mesh layers with same-painting overlap margins",
        "notAReviewGif": True,
        "layers": layers,
        "productionTodo": [
            "Open .spine in Spine Professional and convert major regions to meshes.",
            "Pin/weight wing root, neck base, hip/tail base, and leg overlaps before keying final motion.",
            "Paint any remaining hidden anatomy by hand if mesh deformation exposes gaps.",
            "Export the next review animation from Spine, not from Python part transforms."
        ]
    }, indent=2) + "\n")
    return layers


def bone(role: str) -> str:
    return role.replace("-", "_")


def slot(role: str) -> str:
    return f"slot_{bone(role)}"


def transform(anim: str, role: str, p: float) -> dict:
    cfg = {"x": 0.0, "y": 0.0, "rotation": 0.0, "scaleX": 1.0, "scaleY": 1.0}
    wave = math.sin(p * math.tau)
    if anim == "idle_loop":
        if role == "body_core": cfg.update(y=2.0 * wave)
        elif role == "head_neck": cfg.update(x=2.0 * wave, y=1.2 * wave, rotation=-1.6 * wave)
        elif role == "wing": cfg.update(rotation=3.2 * wave, y=-1.0 * wave)
        elif role == "tail_lantern": cfg.update(x=-4.0 * wave, rotation=-3.4 * wave)
    elif anim == "attack_forge_breath_blocking":
        brace = max(0, min(1, (p - 0.08) / 0.22))
        fire = max(0, min(1, (p - 0.34) / 0.22))
        recover = max(0, min(1, (p - 0.68) / 0.25))
        brace = 0.5 - 0.5 * math.cos(math.pi * brace)
        fire = 1 - (1 - fire) * (1 - fire)
        recover = 0.5 - 0.5 * math.cos(math.pi * recover)
        if role == "body_core": cfg.update(x=-10 * brace + 7 * recover, y=3 * brace, rotation=-1.8 * brace + 1.0 * recover)
        elif role == "head_neck": cfg.update(x=-12 * brace - 24 * fire + 18 * recover, y=-2 * brace + 2 * fire, rotation=-5 * brace + 4 * recover)
        elif role == "wing": cfg.update(rotation=12 * brace - 8 * recover, x=-2 * brace)
        elif role == "front_leg": cfg.update(x=-7 * brace + 4 * recover, y=5 * brace, rotation=-8 * brace + 4 * recover)
        elif role == "rear_leg": cfg.update(x=5 * brace - 2 * recover, y=2 * brace, rotation=6 * brace - 3 * recover)
        elif role == "tail_lantern": cfg.update(x=14 * brace - 8 * recover, rotation=14 * brace - 7 * recover)
    return cfg


def build_spine_json(layers: List[dict]) -> None:
    bones = [{"name": "root"}]
    # Spine requires parents before children; draw order below still uses layer order.
    bone_entries = sorted(layers, key=lambda e: 0 if e["name"] == "body_core" else 1)
    for entry in bone_entries:
        x, y = entry["pivot"]
        parent = entry["parent"]
        bones.append({"name": bone(entry["name"]), "parent": parent if parent == "root" else bone(parent), "x": x - CENTER[0], "y": CENTER[1] - y})

    slots = []
    skin_attachments: Dict[str, dict] = {}
    for entry in layers:
        role = entry["name"]
        slots.append({"name": slot(role), "bone": bone(role), "attachment": entry["file"].removesuffix(".png")})
        x1, y1, x2, y2 = entry["bbox"]
        pivot_x, pivot_y = entry["pivot"]
        skin_attachments[slot(role)] = {
            entry["file"].removesuffix(".png"): {
                "type": "region",
                "path": entry["file"].removesuffix(".png"),
                "x": ((x1 + x2) / 2) - pivot_x,
                "y": pivot_y - ((y1 + y2) / 2),
                "width": entry["cropWidth"],
                "height": entry["cropHeight"],
            }
        }

    animations = {}
    for anim, duration in {"idle_loop": 1.0, "attack_forge_breath_blocking": 1.15}.items():
        frames = [0, 0.25, 0.5, 0.75, 1.0] if anim == "idle_loop" else [0, 0.10, 0.34, 0.56, 0.78, 1.0]
        bones_anim = {}
        for entry in layers:
            role = entry["name"]
            translate, rotate, scale = [], [], []
            for p in frames:
                t = p * duration
                cfg = transform(anim, role, p)
                translate.append({"time": round(t, 4), "x": round(cfg["x"], 3), "y": round(-cfg["y"], 3), "curve": "smooth"})
                rotate.append({"time": round(t, 4), "value": round(-cfg["rotation"], 3), "curve": "smooth"})
                scale.append({"time": round(t, 4), "x": round(cfg["scaleX"], 3), "y": round(cfg["scaleY"], 3), "curve": "smooth"})
            bones_anim[bone(role)] = {"translate": translate, "rotate": rotate, "scale": scale}
        animations[anim] = {"bones": bones_anim}

    data = {
        "skeleton": {"hash": "cohesive-production-prep", "spine": "4.2.43", "x": 0, "y": 0, "width": CANVAS[0], "height": CANVAS[1], "images": win(PROD_LAYERS) + "\\"},
        "bones": bones,
        "slots": slots,
        "skins": [{"name": "default", "attachments": skin_attachments}],
        "animations": animations,
    }
    SPINE_JSON.write_text(json.dumps(data, indent=2) + "\n")


def make_contact_sheet(layers: List[dict]) -> None:
    cell_w, cell_h = 320, 220
    sheet = Image.new("RGBA", (cell_w * 3, cell_h * 2), (28, 24, 22, 255))
    draw = ImageDraw.Draw(sheet, "RGBA")
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", 14)
    except Exception:
        font = ImageFont.load_default()
    for i, entry in enumerate(layers):
        img = Image.open(PROD_LAYERS / entry["file"]).convert("RGBA")
        # Checker background per cell.
        x = (i % 3) * cell_w
        y = (i // 3) * cell_h
        for yy in range(y, y + cell_h, 16):
            for xx in range(x, x + cell_w, 16):
                color = (54, 48, 44, 255) if ((xx + yy) // 16) % 2 else (38, 34, 32, 255)
                draw.rectangle((xx, yy, xx + 15, yy + 15), fill=color)
        img.thumbnail((cell_w - 30, cell_h - 45), Image.Resampling.LANCZOS)
        sheet.alpha_composite(img, (x + (cell_w - img.width) // 2, y + 30 + (cell_h - 45 - img.height) // 2))
        draw.rectangle((x, y, x + cell_w - 1, y + cell_h - 1), outline=(255, 129, 45, 255), width=2)
        draw.text((x + 10, y + 8), f"{entry['name']} | margin {entry['overlapPadding']}px", fill=(255, 224, 170, 255), font=font)
    sheet.convert("RGB").save(CONTACT_SHEET)


def import_spine() -> dict:
    cmd = ["powershell.exe", "-NoProfile", "-Command", f"& '{SPINE_EXE}' -i '{win(SPINE_JSON)}' -o '{win(SPINE_FILE)}' -r"]
    proc = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True, timeout=180)
    stdout = "\n".join("Licensed to: [redacted]" if line.startswith("Licensed to:") else line for line in proc.stdout.splitlines())
    stderr = "\n".join("Licensed to: [redacted]" if line.startswith("Licensed to:") else line for line in proc.stderr.splitlines())
    return {"returncode": proc.returncode, "stdout": stdout, "stderr": stderr, "spineExists": SPINE_FILE.exists()}


def main() -> None:
    layers = build_layers()
    build_spine_json(layers)
    make_contact_sheet(layers)
    import_result = import_spine()
    summary = {
        "spineProject": str(SPINE_FILE.relative_to(ROOT)),
        "spineJson": str(SPINE_JSON.relative_to(ROOT)),
        "productionLayers": str(PROD_LAYERS.relative_to(ROOT)),
        "manifest": str(PROD_MANIFEST.relative_to(ROOT)),
        "contactSheet": str(CONTACT_SHEET.relative_to(ROOT)),
        "layerCount": len(layers),
        "importResult": import_result,
    }
    SUMMARY.write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary, indent=2))
    if import_result["returncode"] != 0 or not import_result["spineExists"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
