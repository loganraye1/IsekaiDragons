# Fire Hatchling Hand-Painted Transparent Parts — Pass 01

Date: 2026-05-14

## Goal

Start converting the approved Living Forge Fire Hatchling motion proof into a true finished-art pipeline with higher-quality hand-painted, transparent, rig-ready parts.

## Created Artifacts

- `assets/dragons/living-forge-fire-hatchling/hand-painted-parts/`
  - 23 transparent PNG cut parts
  - `hand-painted-parts-manifest.json`
  - `transparent-parts-contact-sheet.png`

## Source

- `artifacts/spine/fire-hatchling/hand-painted-pass/living-forge-hand-painted-parts-sheet.png`

## Pass 01 Status

This pass is useful as a starting layer extraction and visual-quality target, but it is not final rig quality yet.

### Good

- Transparent PNGs were created.
- Parts are visible on checkerboard review backgrounds.
- Painterly quality is closer to the intended final product than the procedural proof frames.
- Key identity motifs are present: furnace glow, smoky horn/head shapes, volcanic plates, lantern/flame pieces, forge plume.

### Needs Cleanup / Regeneration

- `00_main_body_composite.png` is still a full-dragon composite, not a clean torso-only rig layer.
- Several auto-cut parts include small surrounding fragments from the generated sheet.
- Head/neck/jaw parts need clearer anatomical separation and shared-canvas pivots.
- Legs/claws need dedicated clean parts instead of partial fragments.
- Tail and lantern should be split into base / mid / tip / lantern with clean overlap margins.
- Forge plume should be separated from the larger attack-scene cluster.
- Final layers need consistent canvas sizing for Spine/Expo frame export.

## Next Production Step

Use this pass as the reference board, then produce a cleaned layer set:

1. torso/body only
2. head
3. lower jaw
4. neck
5. front leg
6. rear leg
7. near wing
8. far wing
9. tail base
10. tail mid
11. tail tip lantern
12. furnace core glow
13. smoke mane/scarf
14. mouth flame seed
15. forge plume
16. ember/smoke VFX

After cleanup, feed those into the existing approved motion rig and regenerate the high-quality GIF.
