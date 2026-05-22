# Tier-Gated Production Workflow

**Status:** Studio-wide enforceable production workflow  
**Purpose:** Prevent animation escalation drift by requiring every creature asset to declare its intended animation tier before rigging or separation work begins.  
**Companion docs:**

- `docs/ANIMATION_TIER_TAXONOMY.md`
- `docs/SUBTLE_LIFE_ANIMATION_STANDARD.md`

---

## Core Rule

Every creature asset must declare its animation tier before any rigging, separation, mesh, or animation work begins.

A higher tier is **not** automatically better.

The correct tier is the one that matches:

- gameplay purpose
- presentation role
- readability target
- production budget
- maintenance cost
- artistic intent

A successful Tier 1 asset is not an unfinished Tier 3 asset.  
A successful Tier 3 asset is not a failed Tier 1 illustration.  
A Tier 4 cinematic shot is not the default standard for ordinary creatures.

---

## Required Production Header

Every creature animation task must begin with this header:

```text
CREATURE:
<asset name>

DECLARED ANIMATION TIER:
<Tier 0 | Tier 1 | Tier 2 | Tier 3 | Tier 4>

INTENDED USE:
<where this appears in game/presentation>

ALLOWED OPERATIONS:
- ...

FORBIDDEN OPERATIONS:
- ...

REQUIRED VALIDATION PROOFS:
- ...

ESCALATION STATUS:
none
or
<Tier X → Tier Y, with explicit trigger/evidence>

JUSTIFICATION:
- gameplay purpose
- presentation role
- readability target
- production budget
- maintenance cost
- artistic intent
```

If a task does not declare the tier, it cannot begin rigging or separation work.

---

## Workflow Overview

### 1. Tier Classification

Before production begins, classify the asset using `docs/ANIMATION_TIER_TAXONOMY.md`.

Required classification questions:

1. Where does the creature appear?
2. Is it static, ambient, gameplay-reactive, or cinematic?
3. Does it need to communicate gameplay state?
4. Should motion be noticed immediately or only after a few seconds?
5. Must the approved illustration remain visually dominant?
6. What size will it appear at?
7. What is the maximum acceptable runtime cost?
8. What is the maximum acceptable production cost?
9. Is this asset reusable, one-off, or presentation-only?
10. What is the artistic intent: charm, ambience, combat readability, or performance?

Classification must be written down before separation begins.

### 2. Allowed Operations

Use the declared tier to define the maximum allowed operations.

Allowed does not mean required.

For example, Tier 1 may allow a localized eyelid separation, but that does not mean every Tier 1 creature requires one.

### 3. Forbidden Operations

Each tier must explicitly list forbidden operations.

If a requested operation appears in the forbidden list, stop and either:

- remove that operation; or
- request formal tier reclassification with evidence.

### 4. Required Validation Proofs

Every tier has required proof artifacts. Proofs must validate that the asset still satisfies the tier philosophy.

Validation should test:

- silhouette
- scale/readability
- motion density
- runtime/export target
- whether the asset still matches its intended role

### 5. Escalation Approval Rules

Escalation requires evidence that the current tier cannot satisfy the asset's intended use.

Escalation is not allowed because more animation is possible.

### 6. Reclassification Conditions

Reclassify only if the intended use changes or the current tier demonstrably fails.

Examples:

- a Tier 1 hatchling becomes a battle unit
- a Tier 2 ambient creature needs gameplay hit reactions
- a Tier 3 gameplay actor needs a trailer-only cinematic performance

### 7. Production Stop Conditions

Stop production immediately if the asset begins violating its tier.

Examples:

- a Tier 1 subtle-life illustration starts reading like a puppet
- a Tier 2 ambient creature gains combat-only mechanics
- a Tier 3 gameplay puppet becomes too expensive for runtime use
- a Tier 4 cinematic rig is being used as the default gameplay asset

---

# Tier 0 — Static Illustration Workflow

## Required Inputs

- approved final illustration
- intended display size
- crop/export spec
- UI placement or usage context
- reduced-motion/static fallback requirements if relevant

## Maximum Allowed Rig Complexity

None.

A wrapper or export container is allowed only if required by tooling.

## Allowed Operations

- crop cleanup
- transparency cleanup
- export sizing
- compression testing
- static UI placement proof
- color/profile check

## Forbidden Operations

- layer separation
- bones
- meshes
- animation timelines
- deformation
- blink/breath/glow motion
- puppet rig setup

## Required Review Checkpoints

1. approved still matches source
2. actual UI-size readability check
3. export/compression check
4. transparent edge check if used over UI

## Expected Deliverables

- final static image
- UI-size preview
- compressed/exported version
- optional reduced-motion fallback note

## Acceptable Export Targets

- PNG
- WebP
- static atlas region
- static React Native image asset

## Acceptable Runtime Cost

Lowest.

- single image draw
- no animation loop
- no rig evaluation

## Acceptable Motion Density

Zero.

## Stop Conditions

Stop if anyone begins adding motion, separation, or rigging without reclassification.

---

# Tier 1 — Subtle-Life Illustration Workflow

## Required Inputs

- approved source illustration
- intended presentation context
- intended display size and 50% validation size
- list of allowed life signals
- confirmation that the source illustration should remain visually dominant

Reference example:

- Fire Hatchling A

## Maximum Allowed Rig Complexity

Very low.

Maximum expected setup:

- one full-body base
- one localized blink/eyelid layer if needed
- root-level breath/drift
- value-only flame/glow/scarf treatment
- no secondary animation chains

## Allowed Operations

- localized eyelid/blink separation
- sub-pixel root/body breath drift
- micro head/body stabilization through root motion
- value/glaze pulse for scarf/cloth
- low-alpha value pulse for flame/glow
- timing/easing polish
- side-by-side still validation
- 50% readability validation

## Forbidden Operations

- body chunk separation
- neck segmentation
- tail segmentation
- wing reconstruction
- jaw extraction
- torso plate cutting
- scale/armor zones
- separate leg/foot idle chains
- scarf chain rig
- flame ribbon reconstruction
- hidden underpaint invention
- fake reconstruction painting
- deformation mesh escalation
- gameplay attack rigging
- cinematic performance rigging

## Required Review Checkpoints

1. approved source still preserved
2. no-overlay animated still nearly identical to source
3. 50% readability screenshot
4. frame strip / preview capture
5. motion amplitude notes
6. intentionally unanimated parts list
7. explicit answer: “Does this still feel like a cohesive illustration?”

## Expected Deliverables

- short looping GIF
- side-by-side still comparison
- 50% readability screenshot
- frame strip / preview capture
- motion amplitude notes
- source/layer manifest

## Acceptable Export Targets

- short GIF for review
- small sprite sequence
- lightweight Spine file with very few slots
- static fallback frame

## Acceptable Runtime Cost

Low.

No expensive mesh systems. No numerous independent animated parts.

## Acceptable Motion Density

Very low.

Baseline ranges:

- loop: 2.5–4.0 seconds
- root drift: less than 1 px
- scale: less than about 0.35%
- blink: one localized blink per loop
- scarf/flame: value motion preferred over geometry motion

## Stop Conditions

Stop immediately if:

- the creature reads as a puppet
- the silhouette fragments
- the still frame no longer matches the approved illustration
- blink harms face appeal
- scarf/flame motion becomes a showpiece
- additional separations are being added “just in case”

---

# Tier 2 — Ambient Animated Creature Workflow

## Required Inputs

- approved source or layer-ready art
- ambient scene context
- expected loop duration
- intended display size
- list of ambient behaviors needed
- reduced-motion/static fallback target

## Maximum Allowed Rig Complexity

Low to moderate.

Maximum expected setup:

- full-body base or broad body groups
- eyelids
- head/neck as one broad mass if needed
- tail base/tip if cleanly supported
- wing root as one broad layer if needed
- scarf/cloth as one broad piece if hidden art exists
- limited light mesh only on broad masses

## Allowed Operations

- blink
- breathing
- mild head/neck drift
- small tail sway
- small wing settle
- soft scarf/cloth follow-through
- elemental glow/flicker
- light mesh bending on broad clean regions
- simple loop timing polish

## Forbidden Operations

- micro-plate separation
- combat attack mechanics
- hit reaction systems
- jaw/cheek combat deformation
- recoil propagation systems
- cinematic acting beats
- many independent secondary chains
- high-cost deformation rigs

## Required Review Checkpoints

1. scene-context loop review
2. 50% readability screenshot
3. silhouette stability review
4. reduced-motion fallback review
5. runtime cost estimate
6. proof that motion supports ambience, not gameplay signaling

## Expected Deliverables

- ambient loop GIF or MP4
- frame strip
- 50% readability screenshot
- silhouette/motion check
- reduced-motion/static fallback
- export/runtime note

## Acceptable Export Targets

- optimized GIF/MP4 for review
- sprite sequence
- Spine loop with limited bones/slots
- runtime-friendly atlas/spritesheet

## Acceptable Runtime Cost

Moderate-light.

Suitable for menu/habitat/background presentation without combat-level animation overhead.

## Acceptable Motion Density

Low.

Motion can be visible but should remain ambient. It should not communicate attacks, damage, or gameplay state.

## Stop Conditions

Stop if:

- motion becomes gameplay signaling
- broad ambient parts become many small puppet pieces
- runtime cost approaches gameplay/combat rig cost
- the asset requires combat-state controllers

---

# Tier 3 — Gameplay Puppet Workflow

## Required Inputs

- approved gameplay design
- combat/presentation role
- state list: idle, attack, hit, recoil, death, skill, etc.
- target combat scale
- performance budget
- export strategy
- required VFX anchors
- reduced-motion fallback plan

## Maximum Allowed Rig Complexity

Moderate to high.

Maximum expected setup:

- real bone hierarchy
- body core
- head/neck
- jaw if needed
- wings/legs/tail where gameplay requires them
- VFX anchors
- weighted meshes where visible mechanics require them
- action-state timelines

## Allowed Operations

- broad body part separation
- jaw/wing/tail/limb separation where needed
- weighted meshes
- seam underlap
- torso compression
- recoil propagation
- combat anticipation/hit/recovery timing
- gameplay VFX timing
- draw-order changes for attacks

## Forbidden Operations

- cinematic-only polish that harms runtime budget
- unbounded micro-part segmentation
- deformation systems with no gameplay readability value
- VFX that obscure hit-frame readability
- rig additions that cannot be maintained across gameplay states

## Required Review Checkpoints

1. combat-scale readability
2. anticipation/hit/recovery still frames
3. black-fill silhouette review
4. reduced-motion fallback
5. runtime/export budget check
6. gameplay state coverage
7. proof that rig complexity improves readability or responsiveness

## Expected Deliverables

- gameplay animation loops/states
- attack/recoil/hit frame strips
- 50% combat-scale screenshots
- silhouette validation
- export/runtime budget note
- Spine/atlas/spritesheet package

## Acceptable Export Targets

- Spine runtime package if supported
- sprite sheets
- frame sequences
- optimized atlases
- reduced-motion fallback frames

## Acceptable Runtime Cost

Moderate to high, but bounded by gameplay performance.

Must remain practical for repeated use in combat.

## Acceptable Motion Density

Moderate to high.

Motion should clearly communicate gameplay state and action timing.

## Stop Conditions

Stop if:

- animation becomes cinematic at the expense of responsiveness
- runtime cost exceeds gameplay budget
- key gameplay states are unreadable at phone scale
- rig complexity is added without improving state clarity

---

# Tier 4 — Cinematic / Feature Animation Workflow

## Required Inputs

- shot brief
- story/presentation goal
- camera/framing context
- target duration
- approved art direction
- export target
- production budget approval
- whether the result is reusable or shot-specific

## Maximum Allowed Rig Complexity

High.

Maximum expected setup:

- shot-specific controls
- expression pieces
- advanced weighted meshes
- cloth/tail/wing chains
- cinematic VFX
- camera-aware staging
- bespoke timing

## Allowed Operations

- complex performance rigging
- shot-specific separations
- facial/acting deformation
- dramatic silhouette changes
- cinematic VFX
- large secondary motion
- trailer/evolution/summon-specific presentation work

## Forbidden Operations

- using a Tier 4 rig as the default gameplay baseline without approval
- unbudgeted cinematic complexity
- sacrificing pose readability for effect density
- building one-off shot complexity into reusable low-tier assets

## Required Review Checkpoints

1. shot animatic/blocking review
2. key pose readability
3. silhouette staging review
4. performance/acting review
5. VFX integration review
6. export/render review
7. cost approval check

## Expected Deliverables

- cinematic GIF/MP4/render
- key pose sheet
- shot-specific rig/export package
- VFX timing notes
- final render/export files

## Acceptable Export Targets

- pre-rendered video
- cinematic sprite sheet
- one-off Spine scene
- trailer render
- high-quality presentation sequence

## Acceptable Runtime Cost

Highest, but justified by one-off or premium presentation use.

Not assumed suitable for repeated gameplay runtime.

## Acceptable Motion Density

High.

Motion may be dense, dramatic, and performance-driven if readability remains strong.

## Stop Conditions

Stop if:

- the cinematic rig is being generalized into low-tier production
- shot cost exceeds approved scope
- pose readability collapses under effects
- animation complexity no longer serves the presentation goal

---

## Escalation Triggers

Escalation requires written evidence that the current tier cannot satisfy the intended use.

### Tier 1 → Tier 2

Valid triggers:

- The creature appears in an ambient scene where faint life is too static.
- The scene requires visibly readable idle behavior beyond blink/breath.
- A tail, wing, scarf, or head motion is necessary for environmental mood.
- The asset must sustain attention longer than a Tier 1 living-painting loop.
- The intended display size makes Tier 1 value motion too subtle to read.

Required evidence:

- Tier 1 proof output
- note explaining what fails in scene context
- proposed Tier 2 behaviors
- confirmation that gameplay state is still not required

Invalid triggers:

- “It looks good, keep going.”
- “More animation would be cooler.”
- “We already have Spine open.”
- “The tool supports tail bones.”

### Tier 2 → Tier 3

Valid triggers:

- The creature must attack, defend, get hit, recoil, cast, dodge, die, or communicate gameplay state.
- The player must read intent, hit timing, impact, or recovery.
- Ambient looping cannot support required interaction clarity.
- VFX needs gameplay-timed anchors.
- The creature becomes a reusable combat actor.

Required evidence:

- gameplay state list
- target combat scale
- required action readability notes
- runtime/export budget
- proof that Tier 2 ambient motion cannot communicate the needed state

Invalid triggers:

- “The ambient loop feels nice, add attacks.”
- “The creature may someday fight.”
- “Combat rigging is more complete.”
- “We can reuse this as a battle unit without a separate plan.”

### Tier 3 → Tier 4

Valid triggers:

- The animation is a boss intro, trailer shot, evolution reveal, rare summon, or story cinematic.
- The animation itself is the premium deliverable.
- Gameplay runtime constraints are not the primary constraint.
- Shot-specific acting, camera staging, or cinematic deformation is required.

Required evidence:

- shot brief
- approved budget/scope
- target duration/export
- statement that this is cinematic/presentation use, not default gameplay baseline

Invalid triggers:

- “The combat animation could be more impressive.”
- “Bosses deserve Tier 4 by default.”
- “Cinematic quality should be everywhere.”
- “The Tier 3 rig succeeded, so keep escalating.”

---

## Reclassification Conditions

Reclassification is allowed only when at least one of these changes:

- gameplay purpose
- presentation role
- readability target
- display size/context
- production budget
- runtime budget
- artistic intent
- reuse expectation

Reclassification must produce a new header and new validation requirements.

Do not silently mutate an existing lower-tier asset into a higher-tier asset.

Example:

- Fire Hatchling A Tier 1 living-illustration proof should not be mutated into a combat rig.
- If Fire Hatchling A needs combat behavior later, create a separate Tier 3 combat asset plan.

---

## Invalid Escalation Patterns

These patterns provide no meaningful production value and should be rejected.

### Success-Based Escalation

Invalid:

> The proof worked, so continue adding more animation.

Correct:

> If the proof satisfies the tier, stop.

### Tool-Driven Escalation

Invalid:

> Spine supports meshes/bones, so add them.

Correct:

> Add rig complexity only when the tier and visible failure require it.

### Completeness Fallacy

Invalid:

> A creature is incomplete until it has head, tail, wing, jaw, and body controls.

Correct:

> A creature is complete when it satisfies its declared use.

### Future-Proofing Overbuild

Invalid:

> Add combat-ready structure now in case we need it later.

Correct:

> Build the current tier. Reclassify later if the use changes.

### Presentation Drift

Invalid:

> Add cinematic polish to a gameplay asset until it feels premium.

Correct:

> Gameplay assets prioritize readable state, runtime cost, and maintainability.

### Charm-Destructive Rigging

Invalid:

> Keep the more advanced rig even though the creature lost appeal.

Correct:

> Preserve the artistic intent. Reduce complexity or re-anchor to source.

### Fragmentation-as-Progress

Invalid:

> More separated parts means better production.

Correct:

> More separated parts means more seams, cost, maintenance, and puppet risk unless justified.

---

## Global Production Stop Conditions

Stop immediately if any of these occur:

- no animation tier is declared
- task requests forbidden operations for the declared tier
- silhouette/readability fails and the proposed fix is more complexity instead of tier review
- runtime cost exceeds the tier budget
- production cost exceeds intended asset value
- asset begins serving a different role than declared
- animation harms the approved artistic intent
- the asset starts reading as a higher-tier rig without approval

When stopped, the next step is not “continue with care.”

The next step is one of:

1. reduce motion/complexity to fit the current tier
2. request formal reclassification with evidence
3. split into separate assets for separate uses
4. return to approved source art and restart validation

---

## Enforcement Checklist

Before work begins:

- [ ] Tier declared
- [ ] Intended use declared
- [ ] Allowed operations listed
- [ ] Forbidden operations listed
- [ ] Required proofs listed
- [ ] Export target declared
- [ ] Runtime budget declared
- [ ] Motion density target declared

During work:

- [ ] No forbidden operations performed
- [ ] No silent tier escalation
- [ ] No extra separations added “just in case”
- [ ] Motion density stays within tier
- [ ] Art intent remains intact

Before reporting success:

- [ ] Required proofs produced
- [ ] Runtime/export target remains valid
- [ ] Readability target passes
- [ ] Silhouette target passes
- [ ] Production cost remains appropriate
- [ ] Validation explicitly answers whether the asset still matches its declared tier

---

## Final Rule

The tier is a production contract.

Do not overbuild low-motion illustration assets.  
Do not underbuild gameplay actors that need readable states.  
Do not turn every successful proof into a higher-tier rig.

Correct tiering protects:

- charm
- readability
- runtime performance
- production budget
- maintainability
- artistic intent
