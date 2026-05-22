# Fire Hatchling — Weighted Deformation Truth Directive

Source: Topnotch director review acceptance on 2026-05-14.

## Phase

Mechanics Truth Phase — specifically **weighted deformation truth**.

This is not polish, VFX refinement, easing cleanup, plume beauty, or presentation work.

## Accepted Previous Result

The v5 recoil hierarchy pass is accepted. Recoil propagation improved correctly from **3.8 → 4.8**. The hatchling now begins to read as force traveling through the body, with mass reacting in sequence and tail/lantern participating as stabilizers.

## Current Weakness

The creature still behaves like:

> connected rigid sections

rather than:

> connected deforming body mass

## Current Weakest Mechanics Category

**Anatomical Weighting — 4.1 / 10**

## Current Objective

Convert the recoil/timing hierarchy into believable weighted deformation and mass redistribution.

Highest-value goal:

> Move from “connected rigid parts with good timing” to “believable deforming creature anatomy with internal force propagation.”

## Required Production Slice

1. Convert recoil hierarchy into weighted Spine mesh deformation.
2. Improve lower-neck / chest weighting:
   - recoil visibly deforms body mass;
   - neck-root vertices compress/stretch;
   - chest absorbs force;
   - underlap deforms with torso influence.
3. Add mass preservation behavior:
   - chest expands slightly after compression release;
   - neck underside stretches subtly;
   - shoulder mass shifts under force;
   - tail root thickens slightly during counterbalance;
   - cheek/jaw mass redistributes during compression.
4. Preserve timing hierarchy:
   - jaw impulse;
   - neck transfer;
   - chest absorption;
   - torso displacement;
   - tail stabilization;
   - lantern lag;
   - settle oscillation.
5. Avoid:
   - rigid mesh plates;
   - sliding overlays;
   - disconnected deformation islands;
   - uniform squash;
   - perfectly synchronized movement.

## Required Review Additions

### Mass Preservation Review

Evaluate:

- body mass redistribution;
- compression volume retention;
- stretch/compression credibility;
- torso absorption quality;
- soft-mass deformation quality.

### Weighted Deformation Review

Evaluate:

- neck-root mesh influence;
- chest deformation continuity;
- underlap deformation stability;
- recoil-driven mesh response;
- tail-root weighting quality.

### Creature Biomechanics Review

Determine whether:

- the creature feels less segmented;
- force visibly deforms body mass;
- recoil affects anatomy instead of only transforms;
- compression/stretch feels biological;
- the hatchling feels physically alive.
