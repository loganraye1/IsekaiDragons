#!/usr/bin/env python3
"""Build an editor-safe Spine project from cropped regions.

The earlier first-pass project used full-canvas transparent attachments on bones
without setup-pose positions. Spine could round-trip the animation data, but the
editor Dopesheet/playback was not usable. This version uses conventional cropped
region attachments and bone positions at each layer pivot so Spine's editor sees
normal keyed bones.
"""
from __future__ import annotations

import json
import math
import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CREATURE_ROOT = ROOT / "assets/dragons/living-forge-fire-hatchling"
SOURCE_ROOT = CREATURE_ROOT / "spine-source"
LAYER_DIR = SOURCE_ROOT / "layers"
MANIFEST = SOURCE_ROOT / "import-manifest.json"
PROJECT_ROOT = CREATURE_ROOT / "spine-project"
SAFE_ROOT = CREATURE_ROOT / "spine-editor-safe"
SAFE_LAYERS = SAFE_ROOT / "layers"
SAFE_JSON = PROJECT_ROOT / "living-forge-fire-hatchling.editor-safe.spine.json"
SAFE_SPINE = PROJECT_ROOT / "living-forge-fire-hatchling.editor-safe.spine"
SUMMARY = PROJECT_ROOT / "editor-safe-rig-summary.json"
SPINE_EXE = r"C:\Program Files\Spine\Spine.exe"
CANVAS_W = 960
CANVAS_H = 540
CENTER_X = CANVAS_W / 2
CENTER_Y = CANVAS_H / 2

PARENTS = {
    "tail": "body",
    "tail_lantern": "tail",
    "scarf": "body",
    "rear_wing": "body",
    "front_leg": "body",
    "back_leg": "body",
    "chest_core_glow": "body",
    "chest_core": "body",
    "neck": "body",
    "head": "neck",
    "jaw": "head",
    "mouth_flame_seed": "head",
    "attack_plume": "head",
    "smoke": "body",
    "embers": "body",
}
BLEND = {"chest_core_glow", "tail_lantern", "mouth_flame_seed", "attack_plume", "embers"}

ANIMATIONS = {
    "idle_loop": {"duration": 1.0, "frames": [0, 0.25, 0.5, 0.75, 1.0]},
    "attack_forge_breath": {"duration": 1.25, "frames": [0, 0.18, 0.36, 0.62, 0.9, 1.25]},
    "hit_recoil": {"duration": 0.5, "frames": [0, 0.08, 0.18, 0.32, 0.5]},
    "crit_forge_burst": {"duration": 1.5, "frames": [0, 0.18, 0.42, 0.7, 1.05, 1.5]},
    "DIAGNOSTIC_big_motion_should_be_obvious": {"duration": 1.0, "frames": [0, 0.25, 0.5, 0.75, 1.0]},
}


def role(entry: dict) -> str:
    return (entry.get("spineSlot") or entry["file"][3:].removesuffix(".png")).replace("-", "_")


def attach(entry: dict) -> str:
    return entry["file"].removesuffix(".png")


def slot(role_name: str) -> str:
    return f"slot_{role_name}"


def ease(t: float) -> float:
    t = max(0, min(1, t))
    return 0.5 - 0.5 * math.cos(math.pi * t)


def out(t: float) -> float:
    t = max(0, min(1, t))
    return 1 - (1 - t) * (1 - t)


def pulse(t: float) -> float:
    return math.sin(t * math.tau)


def transform(anim: str, role_name: str, p: float) -> dict:
    cfg = {"x": 0.0, "y": 0.0, "rotation": 0.0, "scaleX": 1.0, "scaleY": 1.0, "alpha": 1.0}
    if anim == "DIAGNOSTIC_big_motion_should_be_obvious":
        wave = math.sin(p * math.tau)
        if role_name in {"body", "neck", "head", "jaw", "tail", "rear_wing"}:
            mult = {"body": 1, "neck": 1.2, "head": 1.35, "jaw": 1.5, "tail": -0.9, "rear_wing": 0.8}[role_name]
            cfg.update(x=70 * wave * mult, y=28 * abs(wave), rotation=18 * wave * mult)
        if role_name in {"attack_plume", "mouth_flame_seed", "chest_core_glow"}:
            cfg.update(alpha=0.15 + 0.85 * abs(wave), scaleX=1 + 0.4 * abs(wave), scaleY=1 + 0.4 * abs(wave))
        return cfg
    if anim == "idle_loop":
        b = pulse(p)
        if role_name == "body": cfg.update(y=4*b)
        elif role_name in {"neck", "head", "jaw"}: cfg.update(x=2*b, y=2*b, rotation=-2*b)
        elif role_name == "tail": cfg.update(x=-5*b, rotation=-5*b)
        elif role_name == "rear_wing": cfg.update(rotation=4*b)
        elif role_name in {"scarf", "smoke"}: cfg.update(x=-8*b, y=5*b, alpha=.55+.35*(.5+.5*b))
        elif role_name in {"attack_plume", "mouth_flame_seed"}: cfg.update(alpha=0.05)
        elif role_name in {"chest_core_glow", "tail_lantern", "embers"}: cfg.update(alpha=.55+.4*(.5+.5*b))
    elif anim == "attack_forge_breath":
        brace = ease(p/.25); charge = ease((p-.18)/.24); fire = out((p-.36)/.26); recover = ease((p-.72)/.28)
        forward = 26*brace - 14*recover
        if role_name == "body": cfg.update(x=-12*brace+8*recover, y=-3*brace, rotation=2*brace-1*recover)
        elif role_name == "neck": cfg.update(x=-forward, y=2*brace, rotation=3*brace-2*recover)
        elif role_name == "head": cfg.update(x=-forward-18*fire, y=2*brace-2*fire, rotation=2*brace-2*recover)
        elif role_name == "jaw": cfg.update(x=-forward-20*fire, y=-6*fire, rotation=-22*fire+8*recover)
        elif role_name == "tail": cfg.update(x=16*brace, rotation=-12*brace+6*recover)
        elif role_name == "rear_wing": cfg.update(rotation=-7*brace+4*recover)
        elif role_name == "attack_plume": cfg.update(x=-120*fire, y=-1*fire, alpha=max(0,min(1,fire*(1.25-recover))), scaleX=.35+1.65*fire, scaleY=.48+.42*fire)
        elif role_name == "mouth_flame_seed": cfg.update(x=-36*fire, y=-1*fire, alpha=max(.1,fire), scaleX=1+.45*fire, scaleY=1+.35*fire)
        elif role_name in {"chest_core_glow", "embers"}: cfg.update(alpha=max(.25, max(charge,fire)))
    elif anim == "hit_recoil":
        r = math.sin(min(p,.5)/.5*math.pi) * (1-.45*ease(max(0,p-.45)/.55))
        if role_name != "shadow": cfg.update(x=26*r, y=5*r, rotation=-5*r)
        if role_name in {"head","jaw","neck"}: cfg.update(x=36*r, y=8*r, rotation=-10*r)
        if role_name == "tail": cfg.update(x=-20*r, rotation=12*r)
        if role_name in {"attack_plume", "mouth_flame_seed"}:
            cfg.update(alpha=0.0, scaleX=0.2, scaleY=0.2)
    elif anim == "crit_forge_burst":
        charge=ease(p/.32); burst=out((p-.28)/.24); recover=ease((p-.68)/.32)
        if role_name == "body": cfg.update(x=-18*charge+10*recover, rotation=3*charge)
        elif role_name == "neck": cfg.update(x=-34*charge-26*burst+18*recover, y=3*charge-2*burst, rotation=5*charge-3*recover)
        elif role_name == "head": cfg.update(x=-42*charge-48*burst+24*recover, y=3*charge-3*burst, rotation=4*charge-3*recover)
        elif role_name == "jaw": cfg.update(x=-42*charge-50*burst+24*recover, y=-12*burst, rotation=-30*burst+10*recover)
        elif role_name == "tail": cfg.update(x=22*charge-12*recover, rotation=-16*charge+7*recover)
        elif role_name == "attack_plume": cfg.update(x=-185*burst, y=-2*burst, alpha=max(0,min(1,burst*(1.2-recover))), scaleX=.45+2.1*burst, scaleY=.48+.65*burst)
        elif role_name == "mouth_flame_seed": cfg.update(x=-44*burst, y=-1*burst, alpha=max(charge, burst), scaleX=1+.45*burst, scaleY=1+.35*burst)
        elif role_name in {"mouth_flame_seed","chest_core_glow","tail_lantern","embers"}: cfg.update(alpha=max(.3, charge, burst), scaleX=1+.35*max(charge,burst), scaleY=1+.35*max(charge,burst))
    return cfg


def color(alpha: float) -> str:
    return f"FFFFFF{max(0,min(255,round(alpha*255))):02X}"


def win(path: Path) -> str:
    s = str(path)
    if s.startswith("/mnt/c/"):
        return "C:\\" + s[len("/mnt/c/"):].replace("/", "\\")
    return s.replace("/", "\\")


def main() -> None:
    PROJECT_ROOT.mkdir(parents=True, exist_ok=True)
    SAFE_LAYERS.mkdir(parents=True, exist_ok=True)
    raw = json.loads(MANIFEST.read_text())["layers"]
    layers = []
    for e in raw:
        src = LAYER_DIR / e["file"]
        if not src.exists():
            continue
        x1, y1, x2, y2 = e["bbox"]
        crop_name = e["file"]
        Image.open(src).convert("RGBA").crop((x1, y1, x2, y2)).save(SAFE_LAYERS / crop_name)
        e = dict(e)
        e["role"] = role(e)
        e["cropWidth"] = x2 - x1
        e["cropHeight"] = y2 - y1
        layers.append(e)

    # Add root and body early; non-root bones are located at their canvas pivot.
    bones = [{"name": "root"}]
    seen = {"root"}
    by_role = {e["role"]: e for e in layers}
    ordered_roles = ["body"] + [e["role"] for e in layers if e["role"] != "body"]
    for r in ordered_roles:
        if r not in by_role or r in seen:
            continue
        parent = PARENTS.get(r, "root")
        if parent not in seen and parent in by_role:
            pe = by_role[parent]
            px, py = pe["pivot"]
            bones.append({"name": parent, "parent": "root", "x": round(px-CENTER_X,2), "y": round(CENTER_Y-py,2), "length": 50})
            seen.add(parent)
        px, py = by_role[r]["pivot"]
        bones.append({"name": r, "parent": parent if parent in seen else "root", "x": round(px-CENTER_X,2), "y": round(CENTER_Y-py,2), "length": 50})
        seen.add(r)

    slots = []
    attachments = {}
    for e in layers:
        r = e["role"]
        name = attach(e)
        sname = slot(r)
        slots.append({"name": sname, "bone": r, "attachment": name, "blend": "additive" if r in BLEND else "normal"})
        x1, y1, x2, y2 = e["bbox"]
        px, py = e["pivot"]
        cx = (x1 + x2) / 2
        cy = (y1 + y2) / 2
        attachments.setdefault(sname, {})[name] = {
            "type": "region",
            "path": name,
            "x": round(cx - px, 2),
            "y": round(py - cy, 2),
            "width": e["cropWidth"],
            "height": e["cropHeight"],
        }

    animations = {}
    for anim, cfg in ANIMATIONS.items():
        duration = cfg["duration"]
        anim_bones = {}
        anim_slots = {}
        for e in layers:
            r = e["role"]
            translate=[]; rotate=[]; scale=[]; rgba=[]
            for t in cfg["frames"]:
                p = t / duration if duration else 0
                tr = transform(anim, r, p)
                key_time = {"time": round(t,3)} if t else {}
                translate.append({**key_time, "x": round(tr["x"],2), "y": round(tr["y"],2)})
                rotate.append({**key_time, "value": round(tr["rotation"],2)})
                scale.append({**key_time, "x": round(tr["scaleX"],3), "y": round(tr["scaleY"],3)})
                rgba.append({**key_time, "color": color(tr["alpha"])})
            anim_bones[r] = {"translate": translate, "rotate": rotate, "scale": scale}
            anim_slots[slot(r)] = {"rgba": rgba}
        animations[anim] = {"bones": anim_bones, "slots": anim_slots}

    data = {
        "skeleton": {"hash": "editor-safe-generated", "spine": "4.2.43", "x": -CENTER_X, "y": -CENTER_Y, "width": CANVAS_W, "height": CANVAS_H, "fps": 24, "images": "../spine-editor-safe/layers/"},
        "bones": bones,
        "slots": slots,
        "skins": [{"name": "default", "attachments": attachments}],
        "animations": animations,
    }
    SAFE_JSON.write_text(json.dumps(data, indent=2) + "\n")
    if SAFE_SPINE.exists():
        SAFE_SPINE.unlink()
    cmd = f"& '{SPINE_EXE}' -i '{win(SAFE_JSON)}' -o '{win(SAFE_SPINE)}' -r"
    res = subprocess.run(["powershell.exe", "-NoProfile", "-Command", cmd], cwd=ROOT, text=True, capture_output=True, timeout=180)
    out_text = (res.stdout or "") + (res.stderr or "")
    out_text = "\n".join("Licensed to: [redacted]" if line.startswith("Licensed to:") else line for line in out_text.splitlines())
    SUMMARY.write_text(json.dumps({
        "source": str(SAFE_JSON),
        "project": str(SAFE_SPINE),
        "layerMode": "cropped-region-attachments-with-bone-pivots",
        "animations": list(ANIMATIONS),
        "spineImportReturnCode": res.returncode,
        "spineProjectExists": SAFE_SPINE.exists(),
        "spineOutput": out_text,
    }, indent=2) + "\n")
    print(out_text)
    print(json.dumps({"json": str(SAFE_JSON), "spine": str(SAFE_SPINE), "exists": SAFE_SPINE.exists()}, indent=2))

if __name__ == "__main__":
    main()
