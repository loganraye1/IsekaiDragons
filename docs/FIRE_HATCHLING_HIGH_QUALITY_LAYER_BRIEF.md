# Fire Hatchling — High-Quality Layer Art Brief

Yes: the current `layers-v1` pack is only a prototype rig/export structure. Production needs high-quality painted transparent layer images using the same layer breakdown and pivots.

## Goal

Create final-quality Living Forge Fire Hatchling layers that can animate without looking like a sticker or rough puppet.

The final art should preserve the approved identity:

- cute mischievous ember dragon hatchling,
- furnace-heart chest core,
- asymmetric chipped obsidian horn + flame horn nub,
- smoke scarf around the neck,
- cracked charcoal-orange scales,
- coal-lantern tail,
- readable mobile RPG silhouette,
- clean alpha edges for React Native compositing.

## Required Final PNG Layers

Export every layer as transparent PNG at the same canvas size, with the dragon in matching registration/alignment.

Recommended canvas: `2048x1152` master art, then downscale/runtime export to `960x540` or app-required sizes.

Back-to-front draw order:

1. `00_shadow.png`
2. `10_tail.png`
3. `11_tail_lantern.png`
4. `20_rear_wing.png`
5. `30_body.png`
6. `31_front_leg.png`
7. `32_back_leg.png`
8. `40_chest_core_glow.png`
9. `41_chest_core.png`
10. `50_neck.png`
11. `60_head.png`
12. `61_jaw.png`
13. `70_mouth_flame_seed.png`
14. `71_attack_plume.png`

## Paint Requirements Per Layer

### Body
- Main cute hatchling torso with cracked charcoal-orange scales.
- Enough volume and lighting that it does not feel like a flat sticker.
- Leave neck, jaw, tail, legs, and chest core separable.

### Head
- Expressive eyes and mischievous face.
- One chipped obsidian horn nub and one flame-shaped horn nub.
- Mouth opening must align with separate jaw layer.

### Jaw
- Separate lower jaw / mouth interior so attacks can open naturally.
- Include small warm inner-mouth glow, but not a beam.

### Neck
- Separate flexible connector between body and head.
- Should overlap under head/body cleanly during lean motion.

### Chest Core / Glow
- `41_chest_core` is the drawn furnace-heart shape: cracked gem/forge core, not a circle.
- `40_chest_core_glow` is a soft glow layer shaped around the authored core, not a circular overlay.

### Tail / Lantern
- Tail should have enough curve and volume to counter-swing.
- Lantern tail must be a real drawn coal-lantern/furnace shape, not a generic glow dot.

### Wing / Legs
- Wing should sit behind body and lift subtly during charge.
- Legs/feet should brace and shift weight during attack.

### FX Layers
- Mouth flame seed should be a small ignition shape attached to the mouth.
- Attack plume should be a short organic fire plume/burst, not a straight beam.
- FX can have multiple runtime particles later, but the base painted plume should show direction and style.

## Export Rules

- Transparent PNGs only.
- No baked text, labels, UI, or background.
- Keep all layers on the same full canvas for easy registration.
- Also provide trimmed versions only if the manifest records trim offsets.
- No random full-screen flashes baked into art.
- No circle placeholders for core or lantern.
- No one-piece flattened sticker exports for animation.

## Acceptance Criteria

A final layer pack is accepted when:

- the composite preview looks like the polished approved hatchling,
- each separated layer is high-quality enough to show alone,
- pivots align with the manifest,
- jaw/head/tail/chest/legs can move independently,
- the attack animation reads as dragon-caused motion: brace → charge → mouth ignition → plume → recover.
