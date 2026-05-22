# Fire Hatchling Hand-Painted Individual Parts — Pass 01

Date: 2026-05-14

## Why this pass exists

The first hand-painted sheet extraction produced useful art direction, but the generated sheet included full-dragon composites and mixed fragments. That was not clean enough for a final Spine rig.

This pass generated individual single-purpose painted parts so the layer set is cleaner and more riggable.

## Output Folder

`assets/dragons/living-forge-fire-hatchling/hand-painted-individual-parts/`

Key files:

- `individual-parts-manifest.json`
- `individual-transparent-parts-contact-sheet.png`
- `individual-parts-rest-composite-proof.png`
- `individual-parts-attack-composite-proof.png`
- `trimmed/*.png` — transparent isolated parts
- `spine-canvas/*.png` — shared 960x540 canvas layers with anchors/pivots

## Current Parts

1. body torso
2. head
3. wing
4. tail with lantern
5. lower jaw
6. front leg
7. rear leg
8. forge plume

## Review Read

### Good

- Much cleaner than the sheet-extraction pass.
- Transparent alpha exists on every trimmed part.
- Body/head/wing/tail/plume are visually much closer to a polished hand-painted product.
- The attack proof reads as a strong horizontal forge plume.
- The style is premium enough to move into a rig proof.

### Needs Direction / Cleanup

- This pass reads more fierce/epic than cute hatchling. It may be better for Drake/young dragon unless softened.
- Missing dedicated neck, far wing, tail base/mid/tip split, smoke mane, furnace core overlay, and ember/smoke VFX layers.
- Body/head scale and expression need art-direction approval before final rigging.
- The forge plume is strong but currently covers the face heavily in the proof; rig timing should reveal jaw/charge before plume fills the lane.

## Next Step

Use this as the **painted quality baseline**, then build a first animated rig proof:

1. wire these `spine-canvas` layers into the existing approved idle/attack/hit/crit motion
2. keep the jaw/head/wing/tail/core as the first moving bones
3. export a short painted attack GIF
4. decide whether to soften the creature back toward hatchling or reserve this intensity for the next evolution stage
