# Fire Hatchling Cohesive Art Pivot

Date: 2026-05-14

## Stakeholder Correction

Topnotch correctly called out that the individual generated pieces looked like "a bunch of hobbled together pieces."

That means the previous approach is rejected for final creature art:

- Do **not** generate body/head/wing/tail as independent images and assemble them.
- Do **not** combine mismatched parts just because they are transparent.
- Do **not** call a parts collage a finished product.

## Corrected Production Rule

The finished fire hatchling must start from **one cohesive approved painting** of the creature. Only after that should we cut the painting into rig layers.

Correct order:

1. Generate/paint one complete coherent hatchling.
2. Get approval on the full creature silhouette, anatomy, expression, palette, and identity motifs.
3. Cut that exact painting into layers: body, head, jaw, wing, legs, tail, lantern, core, smoke, VFX.
4. Paint hidden overlap margins where cuts expose gaps.
5. Rig the cut layers with the approved Spine motion.
6. Export the hand-painted animated GIF.

## New Candidate Base

Created a cohesive single-painting candidate:

- `artifacts/spine/fire-hatchling/cohesive-painted-base/cohesive-living-forge-hatchling-base.png`
- `assets/dragons/living-forge-fire-hatchling/cohesive-painted-base/living-forge-hatchling-cohesive-base-transparent-v2.png`
- `assets/dragons/living-forge-fire-hatchling/cohesive-painted-base/living-forge-hatchling-cohesive-base-transparent-review-v2.png`

## Current Read

The cohesive base is a much better direction than the hobbled-parts assembly. It reads as one creature with consistent style.

However, the auto-matte transparent extraction is **not final**:

- some leg/body areas were eaten by the matte
- smoke/wing overlap needs careful layer painting
- final part cutting should use manual masks or an art tool, not only automatic background removal

## Next Step

Use the cohesive base image for approval. If approved, do a manual/semi-manual layer cut from that one painting and repair overlap margins before rigging.
