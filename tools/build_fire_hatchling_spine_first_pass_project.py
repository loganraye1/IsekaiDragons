#!/usr/bin/env python3
"""Build a first-pass importable Spine skeleton JSON package.

The resulting JSON is intentionally a starter rig, not the final hand-polished
Spine project. It uses the full-canvas layer PNGs, per-layer pivots, slots,
bones, and keyed animation timelines so Spine Professional can import a real
starting point rather than a blank project.
"""

from __future__ import annotations

import json
import math
import subprocess
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

ROOT = Path(__file__).resolve().parents[1]
CREATURE_ROOT = ROOT / "assets/dragons/living-forge-fire-hatchling"
SOURCE_ROOT = CREATURE_ROOT / "spine-source"
LAYER_DIR = SOURCE_ROOT / "layers"
MANIFEST_PATH = SOURCE_ROOT / "import-manifest.json"
PROJECT_ROOT = CREATURE_ROOT / "spine-project"
RIG_JSON = PROJECT_ROOT / "living-forge-fire-hatchling.first-pass.spine.json"
SPINE_PROJECT = PROJECT_ROOT / "living-forge-fire-hatchling.first-pass.spine"
RIG_SUMMARY = PROJECT_ROOT / "first-pass-rig-summary.json"
DOC_PATH = ROOT / "docs/FIRE_HATCHLING_SPINE_FIRST_PASS_RIG.md"
SPINE_EXE = r"C:\Program Files\Spine\Spine.exe"
CANVAS_WIDTH = 960
CANVAS_HEIGHT = 540
CENTER_X = CANVAS_WIDTH / 2
CENTER_Y = CANVAS_HEIGHT / 2

ANIMATIONS = {
    "idle_loop": {"duration": 1.0, "frames": [0, 0.25, 0.5, 0.75, 1.0], "loop": True},
    "attack_forge_breath": {"duration": 1.25, "frames": [0, 0.18, 0.36, 0.62, 0.9, 1.25], "loop": False},
    "hit_recoil": {"duration": 0.5, "frames": [0, 0.08, 0.18, 0.32, 0.5], "loop": False},
    "crit_forge_burst": {"duration": 1.5, "frames": [0, 0.18, 0.42, 0.7, 1.05, 1.5], "loop": False},
}

IDENTITY_RULES = [
    "No whole-sticker squash: motion comes from separate anatomy bones.",
    "No beam-only attack: brace, charge, jaw open, plume, smoke recovery are keyed separately.",
    "Core and lantern glow stay attached to authored anatomy, not generic circles.",
    "Idle remains readable and quiet: breath, core flicker, smoke/scarf drift, wing/tail sway.",
]

PARENT_BY_ROLE = {
    "shadow": "root",
    "tail": "body",
    "tail_lantern": "tail",
    "scorched_scarf": "body",
    "rear_wing": "body",
    "body": "root",
    "front_leg": "body",
    "back_leg": "body",
    "chest_core_glow": "body",
    "chest_core": "body",
    "neck": "body",
    "head": "neck",
    "jaw": "head",
    "mouth_flame_seed": "head",
    "attack_plume": "head",
    "forge_smoke": "body",
    "forge_embers": "body",
}

BLEND_BY_ROLE = {
    "chest_core_glow": "additive",
    "tail_lantern": "additive",
    "mouth_flame_seed": "additive",
    "attack_plume": "additive",
    "forge_embers": "additive",
}


def role_from_file(file_name: str) -> str:
    return file_name.removesuffix(".png")[3:]


def bone_name(role: str) -> str:
    return role.replace("-", "_")


def slot_name(role: str) -> str:
    return f"slot_{bone_name(role)}"


def attachment_name(file_name: str) -> str:
    return file_name.removesuffix(".png")


def ease_in_out(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 0.5 - 0.5 * math.cos(math.pi * t)


def ease_out(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) * (1 - t)


def pulse(t: float) -> float:
    return math.sin(t * math.tau)


def transform_for(anim: str, role: str, progress: float) -> Dict[str, float]:
    cfg = {"x": 0.0, "y": 0.0, "rotation": 0.0, "alpha": 1.0, "scaleX": 1.0, "scaleY": 1.0}
    if anim == "idle_loop":
        breathe = pulse(progress)
        if role == "body":
            cfg.update(y=2.5 * breathe)
        elif role == "chest_core_glow":
            cfg.update(alpha=0.55 + 0.35 * (0.5 + 0.5 * breathe), scaleX=1.0 + 0.035 * breathe, scaleY=1.0 + 0.035 * breathe)
        elif role in {"neck", "head", "jaw"}:
            cfg.update(x=1.4 * breathe, y=1.4 * breathe, rotation=-1.5 * breathe)
        elif role == "rear_wing":
            cfg.update(rotation=2.8 * breathe, x=-1.0 * breathe)
        elif role == "tail":
            cfg.update(rotation=-3.2 * breathe, x=-3.0 * breathe)
        elif role == "tail_lantern":
            cfg.update(x=-4.0 * breathe, y=-1.8 * breathe, alpha=0.75 + 0.2 * (0.5 + 0.5 * breathe))
        elif role in {"scorched_scarf", "forge_smoke"}:
            cfg.update(x=-6.0 * breathe, y=4.0 * breathe, alpha=0.62 + 0.22 * (0.5 + 0.5 * breathe))
        elif role == "forge_embers":
            cfg.update(y=7.0 * (0.5 + 0.5 * breathe), alpha=0.45 + 0.35 * (0.5 + 0.5 * breathe))
        elif role in {"attack_plume", "mouth_flame_seed"}:
            cfg.update(alpha=0.05)
    elif anim == "attack_forge_breath":
        brace = ease_in_out(min(progress / 0.25, 1))
        charge = ease_in_out((progress - 0.18) / 0.24)
        fire = ease_out((progress - 0.36) / 0.26)
        recover = ease_in_out((progress - 0.72) / 0.28)
        forward = 16 * brace - 10 * recover
        if role == "front_leg":
            cfg.update(x=-5 * brace, y=-3 * brace, rotation=5 * brace)
        elif role == "back_leg":
            cfg.update(x=4 * brace, y=-2 * brace, rotation=-4 * brace)
        elif role == "body":
            cfg.update(x=-7 * brace + 5 * recover, y=-2 * brace, rotation=2.2 * brace - 1.4 * recover)
        elif role == "neck":
            cfg.update(x=-forward, y=4 * brace, rotation=8 * brace - 4 * recover)
        elif role == "head":
            cfg.update(x=-forward - 8 * fire, y=5 * brace, rotation=9 * brace - 5 * recover)
        elif role == "jaw":
            cfg.update(x=-forward - 8 * fire, y=-3 * fire, rotation=-20 * fire + 8 * recover)
        elif role == "chest_core_glow":
            cfg.update(alpha=0.45 + 0.55 * max(charge, fire * (1 - progress * 0.25)), scaleX=1 + 0.16 * charge, scaleY=1 + 0.16 * charge)
        elif role == "mouth_flame_seed":
            cfg.update(x=-forward - 16 * fire, alpha=max(0.15, fire), scaleX=0.85 + 0.45 * fire, scaleY=0.85 + 0.45 * fire)
        elif role == "attack_plume":
            cfg.update(x=-34 * fire, y=2 * fire, alpha=max(0.0, min(1.0, fire * (1.2 - recover))), scaleX=0.35 + 0.9 * fire, scaleY=0.55 + 0.45 * fire)
        elif role == "tail":
            cfg.update(x=7 * brace, rotation=-8 * brace + 4 * recover)
        elif role == "tail_lantern":
            cfg.update(x=9 * brace, y=-2 * brace, alpha=0.8 + 0.2 * charge)
        elif role == "rear_wing":
            cfg.update(rotation=-6 * brace + 3 * recover)
        elif role == "forge_smoke":
            cfg.update(x=-20 * fire - 16 * recover, y=8 * fire + 10 * recover, alpha=0.2 + 0.7 * recover)
        elif role == "forge_embers":
            cfg.update(x=-36 * fire, y=18 * fire, alpha=max(charge, fire) * (1 - 0.35 * recover))
        elif role == "scorched_scarf":
            cfg.update(x=10 * brace - 16 * fire, y=3 * fire, rotation=-4 * brace)
    elif anim == "hit_recoil":
        impact = math.sin(min(progress, 0.5) / 0.5 * math.pi)
        settle = ease_in_out(max(0.0, progress - 0.45) / 0.55)
        recoil = impact * (1 - 0.55 * settle)
        if role != "shadow":
            cfg.update(x=18 * recoil, y=3 * recoil, rotation=-3 * recoil)
        if role in {"head", "jaw", "neck"}:
            cfg.update(x=24 * recoil, y=5 * recoil, rotation=-7 * recoil)
        elif role == "tail":
            cfg.update(x=-12 * recoil, rotation=7 * recoil)
        elif role in {"chest_core_glow", "forge_embers"}:
            cfg.update(alpha=0.35 + 0.45 * (1 - recoil))
        elif role in {"attack_plume", "mouth_flame_seed"}:
            cfg.update(alpha=0.0)
    elif anim == "crit_forge_burst":
        charge = ease_in_out(min(progress / 0.32, 1))
        burst = ease_out((progress - 0.28) / 0.24)
        recover = ease_in_out((progress - 0.68) / 0.32)
        if role in {"front_leg", "back_leg"}:
            cfg.update(x=-8 * charge + 6 * recover, y=-4 * charge, rotation=6 * charge - 4 * recover)
        elif role == "body":
            cfg.update(x=-11 * charge + 8 * recover, y=-1 * charge, rotation=3 * charge)
        elif role == "neck":
            cfg.update(x=-20 * charge - 16 * burst + 15 * recover, y=7 * charge, rotation=12 * charge - 4 * recover)
        elif role == "head":
            cfg.update(x=-25 * charge - 26 * burst + 18 * recover, y=9 * charge, rotation=13 * charge - 4 * recover)
        elif role == "jaw":
            cfg.update(x=-25 * charge - 28 * burst + 18 * recover, y=-8 * burst, rotation=-27 * burst + 9 * recover)
        elif role in {"chest_core_glow", "tail_lantern"}:
            cfg.update(alpha=0.65 + 0.35 * max(charge, burst), scaleX=1 + 0.22 * max(charge, burst), scaleY=1 + 0.22 * max(charge, burst))
        elif role == "attack_plume":
            cfg.update(x=-66 * burst, y=6 * burst, alpha=max(0.0, burst * (1.15 - recover)), scaleX=0.45 + 1.25 * burst, scaleY=0.55 + 0.65 * burst)
        elif role == "mouth_flame_seed":
            cfg.update(x=-38 * burst, alpha=max(charge, burst), scaleX=1 + 0.5 * burst, scaleY=1 + 0.5 * burst)
        elif role == "tail":
            cfg.update(x=14 * charge - 8 * recover, rotation=-12 * charge + 5 * recover)
        elif role == "forge_smoke":
            cfg.update(x=-40 * burst - 32 * recover, y=20 * burst + 12 * recover, alpha=0.25 + 0.75 * max(burst, recover))
        elif role == "forge_embers":
            cfg.update(x=-70 * burst, y=40 * burst, alpha=max(charge, burst) * (1 - 0.25 * recover))
        elif role == "scorched_scarf":
            cfg.update(x=-24 * burst, y=6 * burst, rotation=-8 * charge)
    return cfg


def color_from_alpha(alpha: float) -> str:
    a = max(0, min(255, round(alpha * 255)))
    return f"FFFFFF{a:02X}"


def load_manifest_layers() -> List[dict]:
    manifest = json.loads(MANIFEST_PATH.read_text())
    layers = []
    for entry in manifest["layers"]:
        file_name = entry["file"]
        if (LAYER_DIR / file_name).exists():
            layer = dict(entry)
            layer["role"] = entry.get("spineSlot") or role_from_file(file_name)
            layers.append(layer)
    return layers


def make_spine_json(layers: List[dict]) -> dict:
    bones = [{"name": "root"}]
    seen_bones = {"root"}

    # Add body first so anatomy children can parent to it.
    role_order = [layer["role"] for layer in layers]
    for role in role_order:
        name = bone_name(role)
        if name in seen_bones:
            continue
        parent_role = PARENT_BY_ROLE.get(role, "root")
        parent_name = bone_name(parent_role) if parent_role != "root" else "root"
        if parent_name not in seen_bones:
            bones.append({"name": parent_name, "parent": "root"})
            seen_bones.add(parent_name)
        pivot_x, pivot_y = layer_lookup_pivot(layers, role)
        bones.append({
            "name": name,
            "parent": parent_name,
            "x": round(pivot_x - CENTER_X, 2),
            "y": round(CENTER_Y - pivot_y, 2),
            "length": 60,
            "color": "FF9955FF",
        })
        seen_bones.add(name)

    slots = []
    skin_attachments = {}
    for layer in layers:
        role = layer["role"]
        file_name = layer["file"]
        slot = slot_name(role)
        attachment = attachment_name(file_name)
        slots.append({
            "name": slot,
            "bone": bone_name(role),
            "attachment": attachment,
            "blend": BLEND_BY_ROLE.get(role, "normal"),
        })
        pivot_x, pivot_y = layer["pivot"]
        skin_attachments.setdefault(slot, {})[attachment] = {
            "type": "region",
            "path": file_name.removesuffix(".png"),
            "x": round(CENTER_X - pivot_x, 2),
            "y": round(pivot_y - CENTER_Y, 2),
            "width": CANVAS_WIDTH,
            "height": CANVAS_HEIGHT,
        }

    animations = {}
    for anim_name, cfg in ANIMATIONS.items():
        duration = cfg["duration"]
        bone_timelines = {}
        slot_timelines = {}
        for layer in layers:
            role = layer["role"]
            bname = bone_name(role)
            sname = slot_name(role)
            translate = []
            rotate = []
            scale = []
            color = []
            for t in cfg["frames"]:
                progress = t / duration if duration else 0
                tr = transform_for(anim_name, role, progress)
                translate.append({"time": round(t, 3), "x": round(tr["x"], 2), "y": round(tr["y"], 2), "curve": "smooth"})
                rotate.append({"time": round(t, 3), "value": round(tr["rotation"], 2), "curve": "smooth"})
                if abs(tr["scaleX"] - 1) > 0.001 or abs(tr["scaleY"] - 1) > 0.001 or role in {"attack_plume", "mouth_flame_seed", "chest_core_glow", "tail_lantern"}:
                    scale.append({"time": round(t, 3), "x": round(tr["scaleX"], 3), "y": round(tr["scaleY"], 3), "curve": "smooth"})
                color.append({"time": round(t, 3), "color": color_from_alpha(tr["alpha"]), "curve": "smooth"})
            bone_timelines[bname] = {"translate": translate, "rotate": rotate}
            if scale:
                bone_timelines[bname]["scale"] = scale
            slot_timelines[sname] = {"rgba": color}
        animations[anim_name] = {"bones": bone_timelines, "slots": slot_timelines}

    return {
        "skeleton": {
            "hash": "first-pass-generated",
            "spine": "4.3.00",
            "x": -CENTER_X,
            "y": -CENTER_Y,
            "width": CANVAS_WIDTH,
            "height": CANVAS_HEIGHT,
            "fps": 24,
            "images": "../spine-source/layers/",
        },
        "bones": bones,
        "slots": slots,
        "skins": [{"name": "default", "attachments": skin_attachments}],
        "animations": animations,
    }


def layer_lookup_pivot(layers: List[dict], role: str) -> Tuple[float, float]:
    for layer in layers:
        if layer["role"] == role:
            return tuple(layer["pivot"])
    return CENTER_X, CENTER_Y


def sanitize_spine_output(output: str) -> str:
    return "\n".join(
        "Licensed to: [redacted]" if line.startswith("Licensed to:") else line
        for line in output.splitlines()
    )


def write_docs(layers: List[dict], imported: bool, spine_output: str) -> None:
    DOC_PATH.write_text("""# Fire Hatchling First-Pass Spine Rig

## What this is

This is a generated starter Spine rig for the Living Forge Fire Hatchling. It is meant to be opened in Spine Professional and polished by hand, not treated as the final animation pass.

## Files

- Importable skeleton JSON: `assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.first-pass.spine.json`
- Spine project target: `assets/dragons/living-forge-fire-hatchling/spine-project/living-forge-fire-hatchling.first-pass.spine`
- Rig summary: `assets/dragons/living-forge-fire-hatchling/spine-project/first-pass-rig-summary.json`
- Source images: `assets/dragons/living-forge-fire-hatchling/spine-source/layers/`

## Built animations

- `idle_loop`
- `attack_forge_breath`
- `hit_recoil`
- `crit_forge_burst`

## Manual polish checklist in Spine Professional

1. Open the generated `.spine` project if import succeeded; otherwise import the `.spine.json` into a new project.
2. Confirm each slot image is registered on the same canvas.
3. Convert key anatomy regions into meshes:
   - body
   - rear wing
   - neck
   - head
   - jaw
   - tail
   - scarf/smoke if needed
4. Add/clean constraints:
   - IK on front/back legs
   - transform/path-like follow-through on tail and scarf
5. Polish curves:
   - idle should loop seamlessly
   - attack should read brace -> charge -> jaw open -> plume -> recovery
   - crit should feel larger than attack without becoming a generic screen flash
6. Export PNG sequences back into `spine-export/<animation>/frame_###.png` using the existing frame counts.

## Reject rules

- No whole-sticker squash.
- No beam-only attack.
- No generic circles for core/lantern identity.
- No random idle attack streaks.

## Spine CLI import status

```text
%s
```
""" % (spine_output.strip() or ("Imported successfully." if imported else "Not imported.")))


def to_windows_path(path: Path) -> str:
    text = str(path)
    if text.startswith("/mnt/") and len(text) > 6:
        drive = text[5].upper()
        rest = text[7:].replace("/", "\\")
        return f"{drive}:\\{rest}"
    return text.replace("/", "\\")


def main() -> None:
    PROJECT_ROOT.mkdir(parents=True, exist_ok=True)
    layers = load_manifest_layers()
    spine_json = make_spine_json(layers)
    RIG_JSON.write_text(json.dumps(spine_json, indent=2) + "\n")

    if SPINE_PROJECT.exists():
        SPINE_PROJECT.unlink()

    imported = False
    spine_output = ""
    try:
        rig_json_windows = to_windows_path(RIG_JSON)
        spine_project_windows = to_windows_path(SPINE_PROJECT)
        command = f"& '{SPINE_EXE}' -i '{rig_json_windows}' -o '{spine_project_windows}' -r"
        result = subprocess.run([
            "powershell.exe",
            "-NoProfile",
            "-Command",
            command,
        ], cwd=ROOT, text=True, capture_output=True, timeout=180)
        spine_output = sanitize_spine_output((result.stdout or "") + (result.stderr or ""))
        imported = result.returncode == 0 and SPINE_PROJECT.exists()
    except Exception as exc:
        spine_output = repr(exc)

    summary = {
        "generated": True,
        "importedBySpineCli": imported,
        "layerCount": len(layers),
        "slotCount": len(spine_json["slots"]),
        "boneCount": len(spine_json["bones"]),
        "animationIds": list(ANIMATIONS.keys()),
        "identityRules": IDENTITY_RULES,
        "jsonPath": str(RIG_JSON),
        "spineProjectPath": str(SPINE_PROJECT),
        "spineCliOutput": spine_output.strip(),
    }
    RIG_SUMMARY.write_text(json.dumps(summary, indent=2) + "\n")
    write_docs(layers, imported, spine_output)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
