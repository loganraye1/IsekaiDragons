# Animation Tier Taxonomy

**Status:** Studio-wide pre-production classification standard  
**Purpose:** Assign the correct animation philosophy before rigging begins  
**Primary guardrail:** Do not let low-motion creatures drift into gameplay-puppet or cinematic-rig escalation.

---

## Why This Exists

Isekai Dragons uses multiple creature presentation styles. Not every creature should receive the same rigging philosophy.

A hatchling companion, an ambient menu dragon, a combat unit, and a cinematic boss may all be “animated creatures,” but they require different production tiers.

This taxonomy prevents the common failure where a charming illustrated creature is overbuilt into a segmented puppet before the team has decided whether it actually needs that level of motion.

Before any creature enters production, assign its animation tier.

---

## Tier Summary

| Tier | Name | Core Philosophy | Reference |
|---|---|---|---|
| Tier 0 | Static Illustration | Approved art only | Icons, portraits, cards |
| Tier 1 | Subtle-Life Illustration | Living painting | Fire Hatchling A |
| Tier 2 | Ambient Animated Creature | Low-motion creature loop | Menu/idling companions |
| Tier 3 | Gameplay Puppet | Responsive game unit | Combat actors |
| Tier 4 | Cinematic/Feature Animation | Performance animation | Boss intros, trailers |

---

# Tier 0 — Static Illustration

## Intended Use

Use Tier 0 when the asset only needs to appear as an illustration, icon, portrait, collectible, card, inventory image, story image, or reduced-motion fallback.

## Motion Philosophy

No motion is required.

The approved still image is the final deliverable.

## Acceptable Rig Complexity

None.

No rig is needed unless export tooling requires a wrapper.

## Acceptable Separation Level

None.

The image should remain whole.

## Acceptable Deformation Level

None.

## Silhouette Rules

The silhouette must match the approved art exactly.

## Performance Expectations

Lowest possible runtime cost:

- single image
- static sprite
- compressed texture
- no loop evaluation

## Readability Expectations

Must read clearly at intended display size. If the asset appears in inventory or UI, validate at actual UI scale.

## Production Cost Expectations

Lowest cost.

Expected work:

- art approval
- crop/export cleanup
- compression check
- UI readability check

## Example Creature Types

- inventory dragon portraits
- evolution cards
- journal illustrations
- static quest art
- reduced-motion fallback images

---

# Tier 1 — Subtle-Life Illustration

## Intended Use

Use Tier 1 for hatchlings, mascot creatures, illustrated companions, low-motion ambient characters, and charm-focused idle presentation where the approved illustration should remain visually dominant.

**Fire Hatchling A is the reference example for Tier 1.**

Tier 1 is for creatures that should feel alive without looking rigged.

## Motion Philosophy

The creature behaves like:

- a lightly animated illustration
- a cohesive organism
- a subtle living painting

The viewer should notice life after a few seconds, not immediately.

The goal is:

> The creature still looks almost identical to the approved illustration, but faintly alive.

## Acceptable Rig Complexity

Very low.

Acceptable:

- full-body base image
- localized eyelid/blink layer
- root-level breath drift
- value/glow pulses
- optional guide-only anchors

Avoid building a full creature rig.

## Acceptable Separation Level

Minimal.

Preferred separation order:

1. eyelid/blink only
2. optional very small breath support via root/body transform
3. optional value-only scarf/flame treatment

Do not separate body chunks, neck, wings, tail, jaw, legs, horns, plates, or cloth chains for Tier 1 unless a visible failure proves the tier was misclassified.

## Acceptable Deformation Level

None to extremely minimal.

Preferred:

- no mesh deformation
- no weighted deformation systems
- no geometry-based secondary chains

Value/life motion is preferred over geometry motion.

## Silhouette Rules

The unified silhouette is sacred.

Silhouette should remain almost unchanged across the loop.

Required validation:

- approved still vs animated still
- 50% readability screenshot
- frame-strip review
- black-fill silhouette if outer motion is introduced

## Performance Expectations

Very light runtime cost.

Expected outputs may be:

- short GIF/proof loop
- sprite sequence
- lightweight Spine setup with very few slots
- static fallback frame

Animation should not require expensive mesh evaluation or many independent parts.

## Readability Expectations

At 50% scale:

- face appeal remains intact
- character identity remains identical
- silhouette remains one organism
- motion does not call attention to rigging

## Production Cost Expectations

Low.

Expected work:

- approved source preservation
- one localized separation if needed
- subtle timing proof
- side-by-side still comparison
- amplitude notes
- 50% readability validation

Stop once the creature feels faintly alive.

## Example Creature Types

- Fire Hatchling A
- starter hatchlings
- egg companions
- idle menu mascot
- cozy camp companion
- low-motion pet portrait
- companion selection screen creature

---

# Tier 2 — Ambient Animated Creature

## Intended Use

Use Tier 2 for creatures that remain mostly ambient but need more visible motion than Tier 1.

These may appear in:

- home/base screens
- habitat scenes
- idle camp scenes
- evolution preview scenes
- non-combat companion loops
- collection displays

## Motion Philosophy

The creature is still charm-first and readable, but motion may be more visible than Tier 1.

Motion can include:

- breathing
- blink
- mild head/neck drift
- small tail sway
- small wing settle
- soft cloth/scarf follow-through
- elemental glow/flicker

The creature should feel relaxed and alive, not combat-ready.

## Acceptable Rig Complexity

Low to moderate.

Acceptable:

- full-body base plus a few broad separations
- head/neck as one broad mass if cleanly prepared
- tail base/tip only if silhouette remains cohesive
- wing as broad ambient layer if already clean
- one or two small secondary elements

## Acceptable Separation Level

Broad separations only.

Allowed when needed:

- eyelids
- head/neck as a single broad group
- tail base or tail tip
- wing root as one broad layer
- scarf as one piece if hidden art exists
- flame/glow as a small overlay if it does not dominate

Avoid micro-parts and plate zones.

## Acceptable Deformation Level

Minimal to light.

Acceptable:

- light mesh on broad masses
- simple bend/settle at root areas
- small weighted transitions if hidden art exists

Not acceptable:

- mechanics-truth attack deformation
- complex joint systems
- full-chain recoil systems
- cinematic deformation passes

## Silhouette Rules

Silhouette can move slightly but must remain clean and readable.

Rules:

- no double silhouettes
- no detached appendage read
- no flickering seams
- no over-sway that changes creature identity

## Performance Expectations

Moderate-light.

Runtime should support menu/habitat use without heavy animation overhead.

Expected:

- short loops
- small number of animated bones/slots
- limited mesh use
- easy reduced-motion fallback

## Readability Expectations

Must remain readable at intended UI size and 50% scale.

Motion should enhance mood, not become a gameplay signal.

## Production Cost Expectations

Low to moderate.

More costly than Tier 1 due to additional separations and cleanup, but still not a full gameplay rig.

## Example Creature Types

- habitat dragon idle
- campfire companion loop
- evolution preview idle
- shop/menu dragon
- low-stakes NPC creature
- collection display creature

---

# Tier 3 — Gameplay Puppet

## Intended Use

Use Tier 3 for creatures that must respond to gameplay.

Examples:

- combat units
- player dragon battle avatars
- enemy creatures
- dodge/hit/recoil actors
- skill-casting units
- action-state characters

## Motion Philosophy

The creature is a readable gameplay actor.

Motion must communicate:

- intent
- anticipation
- impact
- damage/recoil
- recovery
- skill identity
- readable state changes

Charm still matters, but clarity and responsiveness are now central.

## Acceptable Rig Complexity

Moderate to high.

Acceptable:

- real bone hierarchy
- broad body part separations
- action controllers
- draw-order management
- attack/recoil timing systems
- combat-specific VFX slots

Rigging should be purposeful and tied to gameplay readability.

## Acceptable Separation Level

Moderate.

Allowed:

- body core
- head/neck
- jaw when needed for attacks
- wings
- legs
- tail root/tip
- weapon/elemental attachments
- VFX anchors

Still avoid unnecessary micro-plates unless the design explicitly requires them.

## Acceptable Deformation Level

Moderate.

Allowed:

- weighted meshes
- seam underlap
- torso compression
- head/neck weighting
- jaw/cheek deformation
- recoil propagation
- tail/wing follow-through

Deformation should solve visible gameplay motion problems, not showcase technical rigging.

## Silhouette Rules

Silhouette may change significantly during attacks, but key poses must remain readable.

Required validation:

- anticipation silhouette
- hit-frame silhouette
- recovery silhouette
- 50% combat scale
- reduced-motion fallback

## Performance Expectations

Moderate.

Must be compatible with runtime combat constraints:

- limited draw calls
- atlas discipline
- controlled frame counts
- sprite-sheet or Spine export strategy
- readable reduced-motion fallback

## Readability Expectations

High.

At phone combat scale, the player must understand:

- what the creature is doing
- when the hit happens
- where the force comes from
- when the action resolves

## Production Cost Expectations

Moderate to high.

Requires:

- proper layer prep
- action rigging
- animation blocking
- silhouette validation
- polish pass
- performance/export pass

## Example Creature Types

- main battle dragon
- enemy monster
- boss minion
- skill-casting companion
- player-controlled pet in combat
- recurring gameplay creature

---

# Tier 4 — Cinematic / Feature Animation

## Intended Use

Use Tier 4 for high-impact presentation where animation quality is the content.

Examples:

- boss intro
- trailer shot
- story cinematic
- evolution reveal
- rare summon animation
- premium marketing animation

## Motion Philosophy

The creature becomes a performance.

Motion may include:

- acting beats
- expressive body mechanics
- cinematic anticipation
- large deformation
- camera-aware staging
- dramatic secondary motion
- bespoke VFX timing

Tier 4 is not a default creature standard. It is for moments where cinematic quality justifies the cost.

## Acceptable Rig Complexity

High.

Acceptable:

- complex Spine rigs
- shot-specific rig additions
- custom controllers
- multiple deformation zones
- detailed facial or jaw systems
- cloth/tail/wing chains
- VFX integration

## Acceptable Separation Level

High, but art-directed.

Allowed:

- many broad parts
- specialized expression pieces
- separate VFX elements
- shot-specific overlays
- multiple cloth/wing/tail controls

Even here, segmentation must serve the performance and preserve appeal.

## Acceptable Deformation Level

High.

Allowed:

- advanced weighted meshes
- expressive squash/stretch
- complex recoil
- facial deformation
- cloth/wing/tail arcs
- shot-specific silhouette changes

## Silhouette Rules

Silhouette can change dramatically, but must be intentionally staged.

Every major pose must read from a still frame.

## Performance Expectations

Highest cost.

Often acceptable as:

- pre-rendered sequence
- cinematic sprite sheet
- one-off Spine scene
- trailer-only render

Should not be assumed suitable for repeated lightweight gameplay use.

## Readability Expectations

Very high.

Must read as a premium performance, not just more moving parts.

## Production Cost Expectations

Highest.

Requires:

- art direction
- blocking
- rig specialization
- polish
- VFX
- export planning
- QA on target presentation context

## Example Creature Types

- ancient dragon boss intro
- evolution transformation reveal
- rare summon dragon appearance
- campaign trailer creature
- story cutscene dragon
- premium marketing animation

---

## Tier Selection Questions

Before rigging begins, answer:

1. Where will the creature appear?
2. Does it need to communicate gameplay state?
3. Does the approved illustration need to remain visually dominant?
4. Should motion be noticed immediately or only after a few seconds?
5. Is silhouette change part of the design, or a risk?
6. Is this a reusable gameplay actor or a presentation-only moment?
7. What is the acceptable production cost?
8. What is the acceptable runtime cost?

If the creature is charm-first, low-motion, and illustration-dominant, choose Tier 1.

Do not choose Tier 3 or Tier 4 just because the rigging tools can support it.

---

## Escalation Rules

### Tier 1 to Tier 2

Escalate only if the creature needs visible ambient behavior beyond faint life, such as tail/wing/scarf motion that genuinely improves the scene.

### Tier 2 to Tier 3

Escalate only if the creature must communicate gameplay state, attacks, hit reactions, or player-readable action beats.

### Tier 3 to Tier 4

Escalate only if the animation itself is a premium cinematic deliverable.

### No Escalation Without Need

Never escalate because:

- the previous proof succeeded
- more motion is possible
- the rig could be more impressive
- the tool supports more bones/meshes
- an agent wants to continue production momentum

Escalate only when the current tier cannot satisfy the intended use.

---

## Fire Hatchling A Classification

**Fire Hatchling A is Tier 1 — Subtle-Life Illustration.**

Reference behavior:

- approved source remains dominant
- unified silhouette preserved
- localized blink only
- sub-pixel breath drift
- value-based scarf/flame life
- no body segmentation
- no deformation escalation
- no gameplay-puppet behavior

Fire Hatchling A should not be escalated further unless its intended use changes.

If later used as a combat unit, create a separate Tier 3 combat asset plan instead of mutating the Tier 1 living-illustration proof.

---

## Final Rule

Assign the animation tier before rigging begins.

Then obey the tier.

A correct Tier 1 proof is not an unfinished Tier 3 rig.  
A correct Tier 3 combat rig is not a failed Tier 1 illustration.  
A cinematic Tier 4 shot is not the baseline for every creature.

Use the tier to protect the creature's purpose, charm, readability, cost, and production sanity.
