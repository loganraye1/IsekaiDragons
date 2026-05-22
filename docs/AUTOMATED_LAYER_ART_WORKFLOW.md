# Automated Layer Art Workflow — Fire Hatchling

Status: proposed install/integration  
Owner: Pyraxis + Veyra  
Date: 2026-05-10

## Problem

Two automated attempts failed quality validation:

1. **Clipped flat-PNG overlays** moved pieces of the existing cutout but looked sloppy and not lifelike.
2. **Generated per-layer images** did not preserve exact alignment/identity and rendered as disconnected pieces.

Conclusion: the workflow must preserve the approved image's exact canvas, scale, and registration. Automation should assist masking/exporting, not regenerate each layer independently.

## Recommended Tool

Use **Krita** as the layer-art automation host.

Why Krita:

- Free/open-source and scriptable with Python.
- Native layer/mask workflow for raster art.
- Can preserve exact canvas alignment.
- Supports manual correction when automation misses seams.
- Better fit for painted dragon layer cleanup than ImageMagick/Pillow alone.

Not recommended as primary:

- **Image generation alone** — too inconsistent for exact aligned layers.
- **Pillow alone** — useful for preprocessing/export, weak for art-directed masks.
- **Aseprite** — great for pixel art, less suited to painterly dragon art and paid.
- **Photoshop** — strong but likely heavier/licensing-dependent.
- **Blender** — powerful, but wrong tool for this 2D raster layer task.

## Install Candidate

```powershell
winget install --source winget --id KDE.Krita --exact --accept-package-agreements --accept-source-agreements
```

## Installed / Local Setup

The normal winget installer was blocked/canceled by the Windows installer/UAC path from this Discord session. A portable Krita build was installed instead:

```txt
tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/krita.exe
```

Krita CLI export works when run with:

```powershell
$env:QT_QPA_PLATFORM='offscreen'
```

## Workflow Shape

1. Start from `assets/dragons/fire-hatchling-cutout.png`.
2. Create a Krita document at the exact original canvas size: `1536x1024`.
3. Add the approved cutout as locked reference layer.
4. Create layer groups:
   - `body`
   - `head`
   - `wing-near`
   - `wing-far`
   - `tail`
   - optional `legs-paws`
5. Use scripted rough masks / alpha selections to seed each layer.
6. Use Krita tools/manual or scripted cleanup to paint hidden overlap areas.
7. Export every layer as transparent PNG at exact full-canvas registration.
8. Integrate exported layers in `App.tsx`.
9. Validate on iPhone through Expo Go.

## Current Automation Files

Create the Krita/OpenRaster workflow project:

```powershell
python tools/create_fire_hatchling_krita_project.py
```

Outputs:

```txt
assets/dragons/layers/fire-hatchling/krita-workflow/fire-hatchling-layer-workflow.ora
assets/dragons/layers/fire-hatchling/krita-workflow/fire-hatchling-layer-workflow-contact.png
```

Export edited Krita/OpenRaster layers back to exact-canvas PNGs:

```powershell
python tools/export_fire_hatchling_krita_layers.py
```

Build the current automated exact-canvas validation candidate directly from the approved cutout:

```powershell
python tools/build_fire_hatchling_exact_layers.py
```

Measure the current manual layer set against the approved cutout and create a visual diff proof:

```powershell
python tools/measure_fire_hatchling_layers.py
```

Outputs:

```txt
assets/dragons/layers/fire-hatchling/manual/body.png
assets/dragons/layers/fire-hatchling/manual/head.png
assets/dragons/layers/fire-hatchling/manual/wing-near.png
assets/dragons/layers/fire-hatchling/manual/wing-far.png
assets/dragons/layers/fire-hatchling/manual/tail.png
assets/dragons/layers/fire-hatchling/manual/manual-layer-contact-proof.png
assets/dragons/layers/fire-hatchling/manual/manual-rest-composite.png
assets/dragons/layers/fire-hatchling/manual/manual-rest-diff.png
assets/dragons/layers/fire-hatchling/manual/manual-layer-quality-report.txt
```

Open the workflow in Krita:

```powershell
& "tools/krita-portable/krita-x64-5.3.1/krita-x64-5.3.1/bin/krita.exe" "assets/dragons/layers/fire-hatchling/krita-workflow/fire-hatchling-layer-workflow.ora"
```

Important: keep every layer at the full `1536x1024` canvas size. Do not crop layer exports.

Current app integration points `App.tsx` at the `manual/` layer set. This candidate preserves exact canvas registration and avoids independently generated mismatched pieces. The current app renderer uses the approved full cutout as the anchored body/base, then overlays head/wing/tail regions with subtle opacity and tiny independent transforms. This avoids the broken-pieces failure mode, but still needs iPhone feel validation for ghosting/seam quality.

## Automation Boundary

Automation should handle:

- document creation
- layer setup
- reference placement
- rough mask placement
- exact full-canvas PNG export
- repeatable validation contact sheets

Human/art-direction pass may still be needed for:

- seam cleanup
- hidden-area painting behind head/wings/tail
- preserving expression and silhouette
- deciding if motion feels lifelike

## Success Criteria

- Layers align perfectly when stacked with no disconnected pieces.
- Small head/wing/tail/body motion reads as one living dragon, not a collage.
- Reduced Motion still freezes/disables independent layer animation.
- `npm.cmd run typecheck` passes after integration.
- Topnotch validates on iPhone that it is clearly better than the stable single cutout.
