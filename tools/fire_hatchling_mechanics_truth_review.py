#!/usr/bin/env python3
"""Generate Fire Hatchling mechanics-truth review artifacts.

This is an automation scaffold for the Mechanics Truth + Automation directive.
It does not decide artistic truth from pixels alone; it standardizes the required
review package after each pass so Hermes/director reviews stop drifting back into
proof-health-only updates.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
DIRECTIVE = "docs/FIRE_HATCHLING_MECHANICS_TRUTH_AUTOMATION_DIRECTIVE_2026-05-14.md"


DEFAULT_SCORES = {
    "motion_quality": 4.2,
    "readability": 5.4,
    "game_feel": 4.4,
    "commercial_readiness": 3.4,
    "compression_volume": 4.0,
    "anatomical_weighting": 3.0,
    "jaw_articulation": 2.5,
    "recoil_propagation": 3.5,
    "energy_source_rule": 4.0,
}


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def load_json(path: Path | None) -> dict[str, Any]:
    if not path:
        return {}
    return json.loads(path.read_text())


def image_size(path: Path | None) -> tuple[int, int] | None:
    if not path or not path.exists():
        return None
    with Image.open(path) as im:
        return im.size


def make_summary_sheet(out: Path, pass_name: str, contact: Path | None, silhouette: Path | None, mobile: Path | None, scores: dict[str, float]) -> Path:
    out.mkdir(parents=True, exist_ok=True)
    sheet = Image.new("RGB", (1400, 960), (24, 21, 19))
    draw = ImageDraw.Draw(sheet)
    try:
        title_font = ImageFont.truetype("DejaVuSans.ttf", 30)
        font = ImageFont.truetype("DejaVuSans.ttf", 18)
        small = ImageFont.truetype("DejaVuSans.ttf", 15)
    except OSError:
        title_font = font = small = None

    draw.text((28, 22), f"Fire Hatchling Mechanics Truth Review — {pass_name}", fill=(255, 224, 170), font=title_font)
    draw.text((28, 64), "Energy Source Rule: chest compression → heat buildup → neck pressure → jaw release → recoil discharge", fill=(235, 205, 170), font=font)

    thumbs = [("Contact / Mechanics", contact), ("Silhouette", silhouette), ("Mobile / 50%", mobile)]
    x = 28
    for label, path in thumbs:
        y = 120
        draw.text((x, y - 26), label, fill=(255, 224, 170), font=font)
        draw.rectangle((x - 3, y - 3, x + 430, y + 250), outline=(255, 126, 42), width=2)
        if path and path.exists():
            with Image.open(path).convert("RGB") as im:
                im.thumbnail((420, 238), Image.Resampling.LANCZOS)
                sheet.paste(im, (x + (420 - im.width) // 2, y + (238 - im.height) // 2))
        else:
            draw.text((x + 28, y + 108), "missing artifact", fill=(210, 90, 70), font=font)
        x += 455

    y = 430
    draw.text((28, y), "Mechanics Truth Scores", fill=(255, 224, 170), font=title_font)
    y += 50
    for key in ["compression_volume", "anatomical_weighting", "jaw_articulation", "recoil_propagation", "energy_source_rule"]:
        value = scores.get(key, 0)
        label = key.replace("_", " ").title()
        draw.text((42, y), f"{label}: {value:.1f}/10", fill=(235, 215, 190), font=font)
        bar_x = 360
        draw.rectangle((bar_x, y + 4, bar_x + 300, y + 20), fill=(55, 45, 37))
        draw.rectangle((bar_x, y + 4, bar_x + int(300 * value / 10), y + 20), fill=(255, 126, 42))
        y += 42

    y += 10
    draw.text((28, y), "Director Quality", fill=(255, 224, 170), font=title_font)
    y += 50
    for key in ["motion_quality", "readability", "game_feel", "commercial_readiness"]:
        value = scores.get(key, 0)
        label = key.replace("_", " ").title()
        draw.text((42, y), f"{label}: {value:.1f}/10", fill=(235, 215, 190), font=font)
        y += 34

    draw.text((760, 430), "Automation Rule", fill=(255, 224, 170), font=title_font)
    notes = [
        "Proof health is not progress by itself.",
        "Progress must improve internal creature mechanics.",
        "Reject polish-only work until mechanics truth rises.",
        "Next slice must be derived from lowest mechanics score.",
    ]
    yy = 485
    for note in notes:
        draw.text((780, yy), f"• {note}", fill=(235, 215, 190), font=font)
        yy += 42

    output = out / "mechanics-truth-summary-sheet.jpg"
    sheet.save(output, quality=94)
    return output


def build_review_md(pass_name: str, out: Path, artifacts: dict[str, str], scores: dict[str, float], notes: dict[str, str]) -> Path:
    lowest = min(["compression_volume", "anatomical_weighting", "jaw_articulation", "recoil_propagation", "energy_source_rule"], key=lambda k: scores.get(k, 0))
    content = f"""# Fire Hatchling — Mechanics Truth Automated Review: {pass_name}

Directive: `{DIRECTIVE}`

## Proof Health

- Mechanics/contact artifact: `{artifacts.get('contact_sheet', 'missing')}`
- Silhouette artifact: `{artifacts.get('silhouette', 'missing')}`
- Mobile/50% artifact: `{artifacts.get('mobile', 'missing')}`
- Summary sheet: `{artifacts.get('summary_sheet', 'missing')}`

Proof health is recorded only so the pass is reviewable. It is not considered meaningful progress by itself.

## Director Quality

- **Motion Quality:** {scores['motion_quality']:.1f} / 10
- **Readability:** {scores['readability']:.1f} / 10
- **Game Feel:** {scores['game_feel']:.1f} / 10
- **Commercial Readiness:** {scores['commercial_readiness']:.1f} / 10

## Mechanics Truth Validation

### Compression Volume — {scores['compression_volume']:.1f} / 10

{notes.get('compression_volume', 'Chest/neck compression must visibly preserve volume before extension.')}

### Anatomical Weighting — {scores['anatomical_weighting']:.1f} / 10

{notes.get('anatomical_weighting', 'Lower neck, collar, and underlap need shared torso/neck-base influence rather than rigid sticker pivots.')}

### Jaw Articulation — {scores['jaw_articulation']:.1f} / 10

{notes.get('jaw_articulation', 'Jaw needs separated art/controller with open, compression, overshoot, and settle timing.')}

### Recoil Propagation — {scores['recoil_propagation']:.1f} / 10

{notes.get('recoil_propagation', 'Recoil should travel jaw/head → neck root → torso → tail/lantern.')}

### Energy Source Rule — {scores['energy_source_rule']:.1f} / 10

{notes.get('energy_source_rule', 'Attack energy must originate from chest compression → heat buildup → neck pressure → jaw release → recoil discharge.')}

## Silhouette Validation

- **Black-fill readability:** {notes.get('black_fill', 'Needs validation on the supplied silhouette artifact.')}
- **50% scale readability:** {notes.get('scale_50', 'Needs validation at mobile combat size.')}
- **Attack readability:** {notes.get('attack_readability', 'Key attack poses must read before final VFX polish.')}

## Commercial Risk Analysis

- **Still amateur:** {notes.get('amateur', 'Layer transforms are still visible until real Spine mesh deformation and jaw separation are authored.')}
- **Currently professional:** {notes.get('professional', 'The pipeline now evaluates mechanics truth and energy origin instead of proof-health-only outputs.')}
- **Largest immersion break:** {notes.get('immersion_break', 'The creature may still lack believable internal spine/ribcage pressure.')}
- **Highest-value improvement:** {notes.get('highest_value', 'Improve the lowest mechanics category: ' + lowest.replace('_', ' ') + '.')}

## Automatic Next Slice

- **Next production objective:** improve `{lowest}` while preserving the Energy Source Rule.
- **Highest-value deformation task:** {notes.get('next_deformation', 'Author true Spine mesh weighting at neck/chest/jaw control points.')}
- **Highest-value readability improvement:** {notes.get('next_readability', 'Make chest compression and recoil travel readable at mobile size without relying on final plume polish.')}
- **Next Spine implementation task:** {notes.get('next_spine', 'Convert body_core/head_neck/underlap to meshes, separate jaw art, then recreate mechanics timing inside Spine.')}
"""
    path = out / "mechanics-truth-automated-review.md"
    path.write_text(content)
    return path


def build_next_slice(pass_name: str, out: Path, scores: dict[str, float]) -> Path:
    lowest = min(["compression_volume", "anatomical_weighting", "jaw_articulation", "recoil_propagation", "energy_source_rule"], key=lambda k: scores.get(k, 0))
    task_map = {
        "compression_volume": "create chest/ribcage mesh compression that preserves volume before neck extension",
        "anatomical_weighting": "weight lower neck + underlap vertices into torso/neck-base influence",
        "jaw_articulation": "separate jaw art and add hinge/controller timing for open/compress/settle",
        "recoil_propagation": "author delayed recoil wave jaw/head → neck root → torso → tail/lantern",
        "energy_source_rule": "make attack start from chest compression and visible heat buildup before jaw release",
    }
    content = f"""# Fire Hatchling — Automatic Next Slice Directive

Generated from mechanics-truth automated review for `{pass_name}`.

## Phase

Mechanics Truth Phase — not polish.

## Primary Target

Improve **{lowest.replace('_', ' ')}**.

## Required Work

{task_map[lowest]}.

## Energy Source Rule

The next pass must preserve:

1. chest compression;
2. heat buildup;
3. neck pressure;
4. jaw release;
5. recoil discharge.

## Do Not Spend Time On

- plume beauty polish;
- ember cosmetic polish;
- presentation-only exports;
- easing finesse;
- mask expansion unrelated to deformation.

## Review Must Include

- Proof Health;
- Director Quality;
- Mechanics Truth Validation;
- Silhouette Validation;
- Commercial Risk Analysis;
- Automatic Next Slice Generation.
"""
    path = out / "automatic-next-slice-directive.md"
    path.write_text(content)
    return path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pass-name", required=True)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--contact-sheet", type=Path)
    parser.add_argument("--silhouette", type=Path)
    parser.add_argument("--mobile", type=Path)
    parser.add_argument("--metadata", type=Path)
    parser.add_argument("--scores", type=Path)
    args = parser.parse_args()

    out = args.out if args.out.is_absolute() else ROOT / args.out
    out.mkdir(parents=True, exist_ok=True)

    metadata = load_json(args.metadata if args.metadata and args.metadata.exists() else None)
    score_overrides = load_json(args.scores if args.scores and args.scores.exists() else None)
    scores = {**DEFAULT_SCORES, **{k: float(v) for k, v in score_overrides.items()}}
    notes = metadata.get("review_notes", {}) if isinstance(metadata.get("review_notes", {}), dict) else {}

    contact = args.contact_sheet if args.contact_sheet and args.contact_sheet.exists() else None
    silhouette = args.silhouette if args.silhouette and args.silhouette.exists() else None
    mobile = args.mobile if args.mobile and args.mobile.exists() else None

    summary = make_summary_sheet(out, args.pass_name, contact, silhouette, mobile, scores)
    artifacts = {
        "contact_sheet": rel(contact) if contact else "missing",
        "silhouette": rel(silhouette) if silhouette else "missing",
        "mobile": rel(mobile) if mobile else "missing",
        "summary_sheet": rel(summary),
    }
    review = build_review_md(args.pass_name, out, artifacts, scores, notes)
    next_slice = build_next_slice(args.pass_name, out, scores)

    manifest = {
        "passName": args.pass_name,
        "directive": DIRECTIVE,
        "artifacts": {**artifacts, "review": rel(review), "nextSlice": rel(next_slice)},
        "scores": scores,
        "lowestMechanicsScore": min(["compression_volume", "anatomical_weighting", "jaw_articulation", "recoil_propagation", "energy_source_rule"], key=lambda k: scores.get(k, 0)),
    }
    manifest_path = out / "mechanics-truth-automation-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
