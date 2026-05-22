# Subtle Life Animation Standard

**Status:** Studio-wide reference standard  
**Derived from:** Approved Fire Hatchling A subtle-life proof  
**Applies to:** hatchlings, mascot creatures, illustrated companions, low-motion ambient characters  
**Does not apply to:** high-action combat rigs, cinematic creatures, heavily articulated bosses

---

## Purpose

This standard defines how to make an approved illustrated creature feel faintly alive without turning it into a fragmented Spine puppet.

The goal is not “more animation.” The goal is:

> The creature still looks almost identical to the approved illustration, but after a few seconds the viewer notices it is alive.

This standard exists to prevent future artists or agents from drifting into unnecessary segmentation, deformation showcases, or armor-plate puppet construction when the character only needs quiet ambient life.

---

## Core Philosophy

### 1. Illustration First

The approved source illustration is the visual truth.

Animation must support the illustration, not redesign it.

A successful subtle-life pass should preserve:

- original face appeal
- original silhouette
- original proportions
- original pose read
- original scarf/clothing cohesion
- original elemental identity
- original charm

If the animation makes the creature feel technically more complex but less charming, the pass failed.

### 2. Cohesive Organism, Not Modular Puppet

The creature should behave like:

- a lightly animated illustration
- a cohesive organism
- a subtle living painting

It should not behave like:

- disconnected body plates
- an over-articulated cutout puppet
- a segmented armor rig
- a deformation demo
- a collection of independently moving parts

### 3. Minimal Separation Only

Separate only what is necessary to create a life signal.

For hatchlings and mascot creatures, the preferred order is:

1. blink/eyelid
2. whole-body breath/root drift
3. tiny value-based flame/glow life
4. optional scarf/clothing value or sub-pixel follow-through
5. optional micro head stabilization

Do not separate additional body parts unless a visible failure proves it is necessary.

---

## Target Motion Character

Subtle-life creatures should feel:

- alive
- breathing
- attentive
- calm
- present
- companion-like

They should not feel:

- bouncy
- rubbery
- busy
- twitchy
- combat-ready
- puppet-like
- technically demonstrative

A good rule:

> The motion should be noticed after a few seconds, not immediately.

---

## Acceptable Motion Amplitudes

These ranges are based on the successful Fire Hatchling A proof and should be used as starting limits.

### Whole-Body Idle / Breath

Acceptable range:

- horizontal drift: `±0.25–0.5 px` at source resolution
- vertical drift: `±0.4–0.8 px` at source resolution
- scale X: approximately `±0.1–0.25%`
- scale Y: approximately `±0.15–0.35%`

Recommended default:

- scale X: `±0.18%`
- scale Y: `±0.28%`
- vertical drift: `±0.65 px`
- horizontal drift: `±0.35 px`

Validation:

- still frames should remain almost indistinguishable from the approved source
- outer silhouette should not visibly wobble
- creature should not squash/stretch like a sticker

### Micro Head Stabilization

Acceptable range:

- usually achieved through whole-body/root drift, not separate head extraction
- no visible independent head bob unless explicitly required
- if used, should be sub-pixel or barely perceptible

Do not extract the head for subtle-life mascot animation unless a specific failure proves it is necessary.

---

## Blink Standard

Blink is the primary life signal for illustrated companions.

### Acceptable Blink Timing

Recommended loop length:

- `2.5–4.0 seconds`

Recommended blink duration:

- `5–9 frames` at 24 fps
- approximately `0.20–0.38 seconds`

Recommended default:

- one blink in a 3-second loop
- approximately 7 frames / 0.29 seconds

### Blink Behavior

A good blink should:

- keep the open-eye frame unchanged
- use a localized eyelid separation
- preserve face appeal
- preserve eye placement and gaze direction
- avoid flattening the face into a dead patch
- read naturally at 50% scale

### Blink Warnings

Reduce or revise the blink if:

- the eyelid looks like a sticker or red blot
- the character loses charm while blinking
- the blink draws more attention than the whole creature
- the face changes identity
- the eye shape appears repainted rather than briefly closed

Fix blink problems by refining eyelid shape/color/timing, not by adding rig complexity.

---

## Scarf / Cloth Standard

Scarves, collars, ribbons, or cloth on low-motion companions should remain cohesive with the illustration.

### Preferred Behavior

Acceptable:

- tiny value pulse/glaze
- tiny lighting warmth change
- nearly invisible follow-through suggestion
- sub-pixel movement only if the cloth is already cleanly separable

Recommended default:

- value/glaze pulse only
- no geometry displacement
- no independent scarf layer unless already present and clean

### Prohibited Behavior

Do not:

- cut scarf into multiple fabric segments
- invent hidden underpaint behind scarf
- make scarf flap like a secondary animation chain
- detach scarf from body/neck visually
- let scarf motion compete with face appeal

If a scarf needs real motion but lacks hidden art, mark it as future artist-prep work. Do not fake reconstruction painting.

---

## Flame / Glow Standard

Elemental life should usually be value-based before geometry-based.

### Preferred Behavior

Acceptable:

- low-alpha warmth pulse inside existing flame/glow shapes
- subtle brightness variation in already-painted fire regions
- tiny ember/lava value shimmer if already present in the illustration

Recommended default:

- color/value pulse only
- no silhouette movement
- no new flame pieces
- no separate VFX system

### Prohibited Behavior

Do not:

- detach flame into separate animated ribbons unless the asset is built for it
- move the flame silhouette during subtle-life validation
- add procedural flame turbulence that changes the source read
- make fire motion louder than the creature

For high-action attacks, use a separate combat animation standard. This subtle-life standard is for ambient companion life only.

---

## Silhouette Preservation Rules

A subtle-life pass must preserve the approved silhouette.

Required checks:

1. Open still vs animated still side-by-side
2. 50% scale readability screenshot
3. black-fill or silhouette review when motion affects outer shape
4. frame-strip review across the loop

Pass criteria:

- silhouette remains unified
- no double edges
- no floating pieces
- no visible cut lines
- no independent body chunks
- no new appendage motion that changes the creature identity

If the silhouette begins to look modular, reduce motion immediately.

Do not solve silhouette problems by adding more deformation systems.

---

## Readability Preservation Rules

At 50% scale, the creature must still read as:

- the same approved character
- one unified organism
- same face/gaze appeal
- same elemental identity
- same major pose

Motion should not depend on tiny details to communicate life. The life signal should come from:

- blink
- faint breath
- tiny value motion
- calm timing

Do not rely on micro scale cracks, tiny cloth edges, or hidden mesh mechanics as the main read.

---

## Prohibited Segmentation Behaviors

For this standard, do not perform:

- body chunk separation
- neck segmentation
- tail segmentation
- wing reconstruction
- jaw extraction
- torso plate cutting
- scale/armor plate zones
- separate leg/foot idle chains
- independent horn motion
- independent scarf chain animation
- flame ribbon reconstruction
- hidden underpaint invention
- fake reconstruction painting

These are not subtle-life operations. They belong only in a targeted complexity or high-action rig standard after a visible production failure justifies them.

---

## Prohibited Rig Escalation Patterns

Avoid these failure patterns:

### “Allowed Means Simultaneous”

If blink, scarf, breath, and flame are all allowed, that does not mean all should become new separated systems.

Use the smallest proof that validates life.

### “Fix Appeal With More Rig”

If the face loses charm, do not add bones, meshes, or deformation zones.

Return to the approved still image and reduce motion.

### “Secondary Motion Chain Creep”

Tiny scarf or flame life should not become:

- scarf chain rig
- tail chain rig
- wing follow-through rig
- horn lag system
- full cloth simulation

### “Puppet Construction Drift”

If the creature starts to feel like parts moving around a base image, stop.

The standard is living illustration, not puppet engineering.

---

## Living Illustration Validation Criteria

A pass succeeds when all are true:

- approved illustration remains visually dominant
- no-overlay still frame looks almost identical to source
- 50% frame remains readable
- face appeal is preserved
- silhouette stays unified
- blink feels natural and localized
- breath is felt more than seen
- scarf/flame motion is subtle and value-based unless cleanly separable
- no body or plate fragmentation appears
- motion is calm and companion-like

A pass fails when any are true:

- the creature reads as modular
- body parts appear disconnected
- the motion calls attention to rigging
- the blink harms face charm
- scarf/flame becomes a separate showpiece
- silhouette changes more than the approved art direction allows
- the still frame no longer looks like the approved illustration

---

## Recommended Deliverables

Every subtle-life proof should include:

1. short looping GIF
2. side-by-side still comparison
3. 50% readability screenshot
4. frame-strip or preview capture
5. motion amplitude notes
6. list of intentionally unanimated parts
7. explicit validation answer:

> Does the creature still feel like a cohesive illustration after motion is added?

If the answer is no, reduce motion complexity. Do not add rig sophistication.

---

## Standard Starting Recipe

For a hatchling or mascot companion:

1. Start with the approved full illustration as the base.
2. Add one localized eyelid/blink layer if needed.
3. Use root-level breath only:
   - `±0.18%` X scale
   - `±0.28%` Y scale
   - less than 1 px drift
4. Add one blink in a 3-second loop.
5. Add value-only flame/glow pulse if elemental art exists.
6. Add scarf/clothing value pulse only if it does not detach the cloth.
7. Export GIF and still comparison.
8. Validate at 50% scale.
9. Stop if the proof already feels alive.

Do not continue improving just because more animation is possible.

---

## Fire Hatchling A Reference Values

The accepted Fire Hatchling A proof used:

- loop length: 3 seconds
- framerate: 24 fps
- root drift X: about `±0.35 px`
- root drift Y: about `±0.65 px`
- scale X: about `±0.18%`
- scale Y: about `±0.28%`
- blink: one blink, about 7 frames / 0.29 seconds
- scarf: value/glaze pulse only
- flame: low-alpha color pulse inside existing flame colors
- new geometry: none beyond existing localized eyelid layer
- body segmentation: none
- deformation mesh escalation: none

This is the baseline for future hatchling/companion subtle-life proofs.

---

## Final Rule

When in doubt, choose less animation.

A subtle-life pass is successful when the approved illustration remains itself.

> Living painting first.  
> Animation second.  
> Rig complexity only when visibly necessary.
