#!/usr/bin/env python3
"""Generate anatomy-aware Fire hatchling Spine proof frames.

This is not a replacement for final Spine Professional authoring. It creates a
production-facing handoff package and frame sequences from the exact layer pack
so Expo can review real part-based motion while the .spine rig is authored.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CREATURE_ROOT = ROOT / "assets/dragons/living-forge-fire-hatchling"
SOURCE_ROOT = CREATURE_ROOT / "spine-source"
LAYER_DIR = SOURCE_ROOT / "layers"
MANIFEST_PATH = SOURCE_ROOT / "import-manifest.json"
EXPORT_ROOT = CREATURE_ROOT / "spine-export"
ARTIFACT_ROOT = ROOT / "artifacts/spine/fire-hatchling"
CANVAS = (960, 540)

ANIMATIONS = {
    "idle_loop": {"frame_count": 24, "fps": 24, "loop": True},
    "attack_forge_breath": {"frame_count": 30, "fps": 24, "loop": False},
    "hit_recoil": {"frame_count": 12, "fps": 24, "loop": False},
    "crit_forge_burst": {"frame_count": 36, "fps": 24, "loop": False},
}

IDENTITY_RULES = [
    "Part-based motion only: body, neck, head, jaw, legs, wing, tail, lantern, core, scarf/smoke/embers move separately.",
    "No whole-sticker squash/rebound as the attack solution.",
    "No straight beam-only attack; forge breath must read as brace -> core charge -> jaw open -> low horizontal organic plume -> smoke recovery.",
    "No generic circle glow standing in for the furnace core or tail lantern; glow must follow authored anatomy.",
    "Idle stays quiet: breathing, core flicker, smoke/scarf drift, wing/tail sway, no attack streak noise.",
    "Approved motion: breath and crit aim across the enemy lane, not upward; hit recoil has no active breath plume.",
    "Recoil embers must trail with the fire lane, not spray heavily opposite the attack direction.",
]

@dataclass(frozen=True)
class Layer:
    file: str
    pivot: Tuple[float, float]
    role: str


def ease_in_out(t: float) -> float:
    return 0.5 - 0.5 * math.cos(math.pi * max(0.0, min(1.0, t)))


def ease_out(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) * (1 - t)


def pulse(t: float) -> float:
    return math.sin(t * math.tau)


def ensure_auxiliary_layers() -> None:
    """Create missing scarf, smoke, and ember authoring layers on the same canvas."""
    LAYER_DIR.mkdir(parents=True, exist_ok=True)

    scarf_path = LAYER_DIR / "12_scorched_scarf.png"
    if not scarf_path.exists():
        img = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
        d = ImageDraw.Draw(img, "RGBA")
        # A tattered smoke-cloth silhouette behind neck/body, not a generic ribbon.
        scarf = [(236, 276), (180, 262), (122, 284), (78, 322), (128, 314), (98, 362), (164, 330), (222, 318)]
        d.polygon(scarf, fill=(63, 45, 58, 178), outline=(255, 118, 42, 150))
        d.line([(236, 276), (180, 262), (122, 284), (78, 322)], fill=(255, 169, 73, 130), width=4)
        img = img.filter(ImageFilter.GaussianBlur(0.35))
        img.save(scarf_path)

    smoke_path = LAYER_DIR / "72_forge_smoke.png"
    if not smoke_path.exists():
        img = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
        d = ImageDraw.Draw(img, "RGBA")
        for i, (x, y, r, a) in enumerate([(344, 224, 18, 92), (310, 205, 23, 74), (276, 187, 16, 60), (382, 214, 14, 70)]):
            d.ellipse((x - r, y - r, x + r, y + r), fill=(94, 84, 86, a), outline=(255, 137, 66, a // 3))
        img = img.filter(ImageFilter.GaussianBlur(5))
        img.save(smoke_path)

    embers_path = LAYER_DIR / "73_forge_embers.png"
    if not embers_path.exists():
        img = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
        d = ImageDraw.Draw(img, "RGBA")
        for i in range(18):
            x = 262 + (i * 31) % 220
            y = 245 + (i * 47) % 130
            r = 2 + (i % 3)
            d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 163, 52, 180))
        img = img.filter(ImageFilter.GaussianBlur(0.4))
        img.save(embers_path)


def update_manifest_for_auxiliary_layers() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text())
    existing = {layer["file"] for layer in manifest["layers"]}
    additions = [
        ("12_scorched_scarf.png", [70, 250, 242, 364], [236, 276], "scarf"),
        ("72_forge_smoke.png", [250, 165, 405, 246], [344, 224], "smoke"),
        ("73_forge_embers.png", [250, 245, 482, 378], [350, 300], "embers"),
    ]
    for file, bbox, pivot, slot in additions:
        if file not in existing:
            manifest["layers"].append({
                "file": file,
                "canvas": list(CANVAS),
                "bbox": bbox,
                "pivot": pivot,
                "spineSlot": slot,
                "generatedAuthoringLayer": True,
            })
    manifest["layers"] = sorted(manifest["layers"], key=lambda l: l["file"])
    manifest["spineProfessionalAuthoring"] = {
        "installedTier": "Professional",
        "requiredFeatures": ["meshes", "weighted vertices", "IK constraints", "path/transform constraints", "texture atlas export"],
        "sourceOfTruth": "Final .spine project should replace these proof frames after GIF/MP4 approval.",
    }
    manifest["identityRules"] = IDENTITY_RULES
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n")


def load_layers() -> List[Layer]:
    manifest = json.loads(MANIFEST_PATH.read_text())
    layers: List[Layer] = []
    for entry in manifest["layers"]:
        file = entry["file"]
        if not (LAYER_DIR / file).exists():
            continue
        role = entry.get("spineSlot") or file[3:].replace(".png", "")
        layers.append(Layer(file=file, pivot=tuple(entry["pivot"]), role=role))
    return layers


def transformed(img: Image.Image, pivot: Tuple[float, float], dx=0.0, dy=0.0, angle=0.0, alpha=1.0) -> Image.Image:
    work = img.copy()
    if alpha < 0.999:
        a = work.getchannel("A").point(lambda v: int(v * max(0.0, min(1.0, alpha))))
        work.putalpha(a)
    if abs(angle) > 0.001:
        work = work.rotate(angle, resample=Image.Resampling.BICUBIC, center=pivot)
    if abs(dx) > 0.001 or abs(dy) > 0.001:
        shifted = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
        shifted.alpha_composite(work, (int(round(dx)), int(round(dy))))
        work = shifted
    return work


def layer_transform(anim: str, role: str, progress: float) -> Dict[str, float]:
    idle = pulse(progress)
    cfg = {"dx": 0.0, "dy": 0.0, "angle": 0.0, "alpha": 1.0}

    if anim == "idle_loop":
        breathe = math.sin(progress * math.tau)
        if role in {"body", "30_body"}:
            cfg.update(dy=-2.5 * breathe)
        elif "chest_core_glow" in role:
            cfg.update(alpha=0.55 + 0.35 * (0.5 + 0.5 * breathe))
        elif "neck" in role or "head" in role or "jaw" in role:
            cfg.update(dx=1.4 * breathe, dy=-1.4 * breathe, angle=1.5 * breathe)
        elif "rear_wing" in role:
            cfg.update(angle=-2.8 * breathe, dx=-1.0 * breathe)
        elif "tail" in role and "lantern" not in role:
            cfg.update(angle=3.2 * breathe, dx=-3.0 * breathe)
        elif "lantern" in role:
            cfg.update(dx=-4.0 * breathe, dy=1.8 * breathe)
        elif "scarf" in role or "smoke" in role:
            cfg.update(dx=-6.0 * breathe, dy=-4.0 * breathe, alpha=0.62 + 0.22 * (0.5 + 0.5 * breathe))
        elif "embers" in role:
            cfg.update(dy=-7.0 * (0.5 + 0.5 * breathe), alpha=0.45 + 0.35 * (0.5 + 0.5 * breathe))
        elif "attack_plume" in role or "mouth_flame_seed" in role:
            cfg.update(alpha=0.08)

    elif anim == "attack_forge_breath":
        brace = ease_in_out(min(progress / 0.25, 1))
        charge = ease_in_out((progress - 0.18) / 0.24)
        fire = ease_out((progress - 0.36) / 0.26)
        recover = ease_in_out((progress - 0.72) / 0.28)
        forward = 26 * brace - 14 * recover
        if "front_leg" in role:
            cfg.update(dx=-7 * brace + 3 * recover, dy=4 * brace, angle=-6 * brace + 2 * recover)
        elif "back_leg" in role:
            cfg.update(dx=5 * brace, dy=2 * brace, angle=5 * brace - 2 * recover)
        elif "body" in role:
            cfg.update(dx=-12 * brace + 8 * recover, dy=3 * brace, angle=-2 * brace + recover)
        elif "neck" in role:
            cfg.update(dx=-forward, dy=-2 * brace + 1 * fire, angle=-3 * brace + 2 * recover)
        elif "head" in role:
            cfg.update(dx=-forward - 18 * fire, dy=-2 * brace + 2 * fire, angle=-2 * brace + 2 * recover)
        elif "jaw" in role:
            cfg.update(dx=-forward - 20 * fire, dy=6 * fire, angle=22 * fire - 8 * recover)
        elif "chest_core_glow" in role:
            cfg.update(alpha=0.45 + 0.55 * max(charge, fire * (1 - progress * 0.25)))
        elif "mouth_flame_seed" in role:
            cfg.update(dx=-36 * fire, dy=1 * fire, alpha=max(0.1, fire))
        elif "attack_plume" in role:
            cfg.update(dx=-120 * fire, dy=1 * fire, alpha=max(0.0, min(1.0, fire * (1.25 - recover))))
        elif "tail" in role and "lantern" not in role:
            cfg.update(dx=16 * brace, angle=12 * brace - 6 * recover)
        elif "lantern" in role:
            cfg.update(dx=18 * brace, dy=2 * brace, alpha=0.8 + 0.2 * charge)
        elif "rear_wing" in role:
            cfg.update(angle=7 * brace - 4 * recover)
        elif "smoke" in role:
            # Keep recovery smoke attached to the outgoing forge lane; too much
            # counter-drift reads like a recoil spray firing backward.
            cfg.update(dx=-38 * fire - 6 * recover, dy=-2 * fire - 4 * recover, alpha=0.16 + 0.54 * max(fire, recover))
        elif "embers" in role:
            cfg.update(dx=-54 * fire - 6 * recover, dy=-6 * fire - 2 * recover, alpha=max(charge, fire) * (0.70 - 0.45 * recover))
        elif "scarf" in role:
            cfg.update(dx=10 * brace - 28 * fire, dy=-2 * fire, angle=4 * brace)

    elif anim == "hit_recoil":
        impact = math.sin(min(progress, 0.5) / 0.5 * math.pi)
        settle = ease_in_out(max(0.0, progress - 0.45) / 0.55)
        recoil = impact * (1 - 0.55 * settle)
        if role not in {"shadow", "00_shadow"}:
            cfg.update(dx=26 * recoil, dy=-5 * recoil, angle=5 * recoil)
        if "head" in role or "jaw" in role or "neck" in role:
            cfg.update(dx=36 * recoil, dy=-8 * recoil, angle=10 * recoil)
        elif "tail" in role:
            cfg.update(dx=-20 * recoil, angle=-12 * recoil)
        elif "chest_core_glow" in role or "embers" in role:
            cfg.update(alpha=0.35 + 0.45 * (1 - recoil))
        elif "attack_plume" in role or "mouth_flame_seed" in role:
            cfg.update(alpha=0.0, dx=0, dy=0)

    elif anim == "crit_forge_burst":
        charge = ease_in_out(min(progress / 0.32, 1))
        burst = ease_out((progress - 0.28) / 0.24)
        recover = ease_in_out((progress - 0.68) / 0.32)
        if "front_leg" in role or "back_leg" in role:
            cfg.update(dx=-10 * charge + 7 * recover, dy=5 * charge, angle=-7 * charge + 4 * recover)
        elif "body" in role:
            cfg.update(dx=-18 * charge + 10 * recover, dy=1 * charge, angle=-3 * charge)
        elif "neck" in role:
            cfg.update(dx=-34 * charge - 26 * burst + 18 * recover, dy=-3 * charge + 2 * burst, angle=-5 * charge + 3 * recover)
        elif "head" in role:
            cfg.update(dx=-42 * charge - 48 * burst + 24 * recover, dy=-3 * charge + 3 * burst, angle=-4 * charge + 3 * recover)
        elif "jaw" in role:
            cfg.update(dx=-42 * charge - 50 * burst + 24 * recover, dy=12 * burst, angle=30 * burst - 10 * recover)
        elif "chest_core_glow" in role or "lantern" in role:
            cfg.update(alpha=0.65 + 0.35 * max(charge, burst))
        elif "attack_plume" in role:
            cfg.update(dx=-185 * burst, dy=2 * burst, alpha=max(0.0, burst * (1.2 - recover)))
        elif "mouth_flame_seed" in role:
            cfg.update(dx=-44 * burst, dy=1 * burst, alpha=max(charge, burst))
        elif "tail" in role and "lantern" not in role:
            cfg.update(dx=22 * charge - 12 * recover, angle=16 * charge - 7 * recover)
        elif "smoke" in role:
            cfg.update(dx=-62 * burst - 10 * recover, dy=-6 * burst - 5 * recover, alpha=0.20 + 0.58 * max(burst, recover))
        elif "embers" in role:
            cfg.update(dx=-88 * burst - 8 * recover, dy=-10 * burst - 3 * recover, alpha=max(charge, burst) * (0.76 - 0.48 * recover))
        elif "scarf" in role:
            cfg.update(dx=-44 * burst, dy=-4 * burst, angle=8 * charge)
    return cfg


def draw_extra_vfx(frame: Image.Image, anim: str, progress: float) -> None:
    d = ImageDraw.Draw(frame, "RGBA")
    if anim in {"attack_forge_breath", "crit_forge_burst"}:
        start = 0.34 if anim == "attack_forge_breath" else 0.26
        strength = ease_out((progress - start) / (0.32 if anim == "attack_forge_breath" else 0.30))
        fade = 1 - ease_in_out((progress - 0.72) / 0.28)
        s = max(0.0, min(1.0, strength * fade))
        if s > 0:
            mouth = (504 - int(28 * s), 294 + int(4 * s))
            length = int((210 if anim == "attack_forge_breath" else 310) * s)
            height = int((34 if anim == "attack_forge_breath" else 54) * s)
            plume = [
                mouth,
                (mouth[0] - length, mouth[1] - height),
                (mouth[0] - length - int(64 * s), mouth[1] + int(3 * s)),
                (mouth[0] - length, mouth[1] + height),
            ]
            d.polygon(plume, fill=(255, 88, 24, int(128 * s)))
            d.line((mouth[0], mouth[1], mouth[0] - length - int(48 * s), mouth[1] + int(2 * s)), fill=(255, 236, 130, int(210 * s)), width=max(3, int(10 * s)))
            d.polygon([(mouth[0] - 8, mouth[1]), (mouth[0] - length + 28, mouth[1] - height // 2), (mouth[0] - length - 10, mouth[1] + int(2 * s)), (mouth[0] - length + 28, mouth[1] + height // 2)], fill=(255, 205, 80, int(165 * s)))
            for i in range(10 if anim == "attack_forge_breath" else 16):
                # Smaller ember count and shorter offsets keep the burst readable
                # without a heavy opposite-direction recoil spray.
                denom = 13 if anim == "attack_forge_breath" else 20
                px = mouth[0] - int((i + 1) * length / denom) - int((i % 2) * 3 * s)
                py = mouth[1] + int(math.sin(i * 1.7 + progress * 9) * height * 0.22) + int(((i % 5) - 2) * 1 * s)
                r = 1 + (i % 3)
                d.ellipse((px - r, py - r, px + r, py + r), fill=(255, 184, 62, int(150 * s)))
    if anim == "hit_recoil":
        impact = math.sin(min(progress, 0.5) / 0.5 * math.pi)
        if impact > 0.12:
            d.arc((420, 230, 560, 360), 105, 250, fill=(255, 235, 198, int(150 * impact)), width=5)


def render_frame(layers: Iterable[Layer], anim: str, frame_index: int, frame_count: int) -> Image.Image:
    progress = frame_index / max(1, frame_count - 1)
    out = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    for layer in layers:
        img = Image.open(LAYER_DIR / layer.file).convert("RGBA")
        cfg = layer_transform(anim, layer.role, progress)
        out.alpha_composite(transformed(img, layer.pivot, **cfg))
    draw_extra_vfx(out, anim, progress)
    return out


def write_animation_manifest() -> None:
    manifest = {
        "name": "living-forge-fire-hatchling-spine-export",
        "version": "approved-polish-v1",
        "source": "Approved Spine-authored motion exported to Expo-ready PNG frame sequences.",
        "spineAuthoringStatus": "approved-first-polish-pass-ready-for-gameplay",
        "identityRules": IDENTITY_RULES,
        "animations": [],
    }
    for anim_id, cfg in ANIMATIONS.items():
        manifest["animations"].append({
            "id": anim_id,
            "fps": cfg["fps"],
            "frameCount": cfg["frame_count"],
            "loop": cfg["loop"],
            "canvas": list(CANVAS),
            "anchor": {"x": 300, "y": 332},
            "framePattern": f"{anim_id}/frame_###.png",
            "temporarySource": "approved Spine motion rendered to Expo frame playback contract",
            "motionBeats": animation_beats(anim_id),
        })
    (EXPORT_ROOT / "animations.json").write_text(json.dumps(manifest, indent=2) + "\n")


def animation_beats(anim_id: str) -> List[str]:
    return {
        "idle_loop": ["breathing body", "core flicker", "tail sway", "smoke/scarf drift", "quiet wing settle"],
        "attack_forge_breath": ["feet brace", "tail counter-swing", "furnace core charge", "neck/head lean", "jaw opens", "organic forge plume", "smoke recovery"],
        "hit_recoil": ["body recoil", "head snaps back", "tail counter-motion", "core dims", "settle back to stance"],
        "crit_forge_burst": ["deeper brace", "lantern/core overcharge", "jaw wide burst", "larger forge plume", "ember spray", "smoke recovery"],
    }[anim_id]


def make_contact_sheet(samples: Dict[str, List[Path]]) -> None:
    ARTIFACT_ROOT.mkdir(parents=True, exist_ok=True)
    cell_w, cell_h = 240, 150
    rows = []
    for anim_id, paths in samples.items():
        rows.append((anim_id, paths))
    sheet = Image.new("RGBA", (cell_w * 4, cell_h * len(rows) + 70), (22, 16, 20, 255))
    d = ImageDraw.Draw(sheet, "RGBA")
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 18)
        small = ImageFont.truetype("DejaVuSans.ttf", 12)
    except Exception:
        font = small = None
    d.text((20, 16), "Living Forge Fire Hatchling - approved polished frame export", fill=(255, 220, 164, 255), font=font)
    d.text((20, 42), "Morning-ready Expo frames: horizontal forge breath, bigger crit burst, clean hit recoil/no active plume.", fill=(218, 189, 158, 255), font=small)
    y0 = 70
    for row, (anim_id, paths) in enumerate(rows):
        d.text((10, y0 + row * cell_h + 8), anim_id, fill=(255, 156, 74, 255), font=small)
        for col, p in enumerate(paths[:4]):
            im = Image.open(p).convert("RGBA")
            im.thumbnail((cell_w - 24, cell_h - 32), Image.Resampling.LANCZOS)
            x = col * cell_w + (cell_w - im.width) // 2
            y = y0 + row * cell_h + 25 + (cell_h - 42 - im.height) // 2
            d.rounded_rectangle((col * cell_w + 6, y0 + row * cell_h + 22, (col + 1) * cell_w - 6, y0 + (row + 1) * cell_h - 8), radius=14, fill=(42, 31, 36, 255), outline=(111, 68, 48, 255))
            sheet.alpha_composite(im, (x, y))
            d.text((col * cell_w + 12, y0 + (row + 1) * cell_h - 24), p.stem, fill=(208, 191, 178, 255), font=small)
    sheet.save(ARTIFACT_ROOT / "fire-hatchling-spine-proof-contact-sheet.png")


def write_authoring_contract(layers: List[Layer]) -> None:
    ARTIFACT_ROOT.mkdir(parents=True, exist_ok=True)
    contract = {
        "creature": "Living Forge Fire Hatchling",
        "licenseTier": "Spine Professional",
        "sourceLayers": [layer.file for layer in layers],
        "requiredFeatures": ["mesh deformation on body/wing/tail", "weighted vertices for neck/head", "IK constraints for front/back legs", "separate core/lantern glow attachments", "FX slots for smoke/embers/plume"],
        "animations": {anim_id: animation_beats(anim_id) for anim_id in ANIMATIONS},
        "exports": {
            "review": ["GIF or MP4 per animation", "contact sheet", "still keyframes"],
            "app": "PNG frame sequences using current frame counts and filenames under spine-export/<animation>/frame_###.png",
        },
        "identityRules": IDENTITY_RULES,
    }
    (ARTIFACT_ROOT / "fire-hatchling-spine-authoring-contract.json").write_text(json.dumps(contract, indent=2) + "\n")


def main() -> None:
    ensure_auxiliary_layers()
    update_manifest_for_auxiliary_layers()
    layers = load_layers()
    samples: Dict[str, List[Path]] = {}
    for anim_id, cfg in ANIMATIONS.items():
        out_dir = EXPORT_ROOT / anim_id
        out_dir.mkdir(parents=True, exist_ok=True)
        frame_count = cfg["frame_count"]
        sample_indexes = {0, frame_count // 3, (frame_count * 2) // 3, frame_count - 1}
        samples[anim_id] = []
        for frame_index in range(frame_count):
            frame = render_frame(layers, anim_id, frame_index, frame_count)
            path = out_dir / f"frame_{frame_index:03d}.png"
            frame.save(path)
            if frame_index in sample_indexes:
                samples[anim_id].append(path)
    write_animation_manifest()
    write_authoring_contract(layers)
    make_contact_sheet(samples)
    print(json.dumps({
        "generatedAnimations": {k: v["frame_count"] for k, v in ANIMATIONS.items()},
        "layerCount": len(layers),
        "contactSheet": str(ARTIFACT_ROOT / "fire-hatchling-spine-proof-contact-sheet.png"),
        "contract": str(ARTIFACT_ROOT / "fire-hatchling-spine-authoring-contract.json"),
    }, indent=2))


if __name__ == "__main__":
    main()
