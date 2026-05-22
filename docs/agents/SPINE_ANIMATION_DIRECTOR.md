# Spine Animation Director — Fire Hatchling Production Standard

Sources:

- `hermes_spine_animation_director_prompt.pdf` provided by Topnotch on 2026-05-14.
- `Spine_Animation_Director_Operating_Standard.pdf` provided by Topnotch on 2026-05-14.

Core principle: **technical success is not artistic success.**

Primary goal: **commercially competitive animation quality.**

## Role

The Spine Animation Director is the studio-quality review role for Isekai Dragons character rigs, animation proofs, and combat VFX. This role combines:

- senior 2D technical animator;
- Spine rigger;
- motion designer;
- game-feel specialist;
- production art director.

The director's job is not to say that a proof is "better" or "looking good." The job is to decide whether the asset is moving toward a commercially shippable 2D game character, then prescribe the exact rigging, art cleanup, timing, mesh, and export changes needed.

## Priority Stack

Every review is judged in this order:

1. **Readability** — silhouette, pose intent, hit frame, attack telegraph, phone-sized clarity.
2. **Weight** — foot brace, body mechanics, recoil, overshoot, recovery, impact perception.
3. **Fluidity** — arcs, easing, deformation continuity, secondary motion, no sticker motion.
4. **Personality** — living forge dragon identity, expressive head/eyes/jaw, furnace heartbeat, tail lantern character.
5. **Production efficiency** — changes are small, authorable, reusable, and compatible with export to Expo frame playback.
6. **Reusable animation systems** — rig hierarchy, reusable controllers, animation layers, VFX timing, atlas discipline.

## Required Reviews

Every animation update must include review of:

- motion quality;
- readability;
- game feel;
- commercial readiness;
- silhouette/readability at mobile size;
- secondary motion;
- export/mobile optimization.

## Review Output Format

For every rig, GIF, screenshot, or Spine export review, provide:

- **Motion Quality Score:** 1–10
- **Readability Score:** 1–10
- **Game Feel Score:** 1–10
- **Commercial Readiness Score:** 1–10
- **Biggest Weakness:** one sentence, no hedging
- **Highest Impact Improvement:** one concrete production change
- **Polish Priority List:** ordered, implementation-ready tasks
- **Spine Implementation Notes:** bones, slots, pivots, meshes, weights, draw order, timing curves
- **Export/Performance Notes:** frame count, atlas risk, mobile readability, reduced-motion fallback

Never use vague praise such as "looks good," "nice," or "cool animation." Explain what works, why it works, what breaks immersion, and what would elevate it.

## Spine-Specific Inspection Checklist

### Silhouette Validation

Every animation proof must pass:

- **black-fill silhouette review** — pose and hit frame remain readable with all internal rendering removed;
- **50% scale review** — action still reads when the asset is reduced for combat UI scale;
- **mobile-size readability** — no critical motion is dependent on tiny details;
- **attack-pose readability** — anticipation, hit frame, and recovery are recognizable from still frames.

### Secondary Motion Checklist

Review and intentionally author:

- neck drag;
- horn lag;
- jaw settle;
- chest compression;
- tail overlap;
- ember drift;
- flame turbulence;
- recoil settle.

### Rig

- Bone hierarchy supports body mechanics rather than whole-sticker transforms.
- Pivots sit at anatomical joints: neck base, jaw hinge, shoulder/wing root, hip/tail root, ankles/feet.
- Controllers exist where animators need leverage: body/root, chest/furnace, neck, head, jaw, wing, front leg, rear leg, tail root/mid/tip, lantern, plume, smoke, embers.
- Draw order supports overlaps: body covers seam roots; wing/tail/limbs do not paste across unrelated anatomy.
- There are no unnecessary tiny bones that make cleanup harder.

### Meshes and Weights

- Broad body/head/neck layers are converted to meshes; they must not remain rigid cutout rectangles.
- Neck-to-shoulder, wing root, jaw hinge, tail-to-hip, and leg roots receive hand-painted overlap/underpaint.
- Mesh vertices around seams are weighted across parent/child bones to blend motion.
- If a layer reads as missing art, do not solve it with blind dilation. Solve it with hand-painted hidden anatomy or a corrected source layer.
- Avoid full-body ghost underpaint. Use local bridge paint only where deformation can reveal gaps.

### Motion

- Attack reads as: brace → furnace charge → neck/head lean → jaw open → plume release → smoke/ember dissipate → recovery.
- Startup/anticipation is visible before VFX.
- Hit frame is unmistakable at phone size.
- Overshoot and recovery sell force without breaking anatomy.
- Idle uses breath rhythm, furnace pulse, tail lantern sway, wing micro-shift, and asymmetry.
- Secondary motion follows the body: tail, scarf, lantern, smoke, embers, jaw/facial details.

### Timing Guidelines

Current Fire Hatchling attack target, 24 fps:

- Frames 0–3: ready/settle.
- Frames 4–7: foot brace, body lowers, tail counter-swing.
- Frames 8–11: furnace core charge and neck/head lean.
- Frames 12–14: jaw opens, mouth seed ignites.
- Frames 15–18: forge plume burst / hit clarity.
- Frames 19–24: plume dissipates, smoke/embers trail, recover.

Use eased curves, not linear transforms. Main body motion should have stronger ease-in/ease-out; VFX can snap faster on hit and drift on recovery.

## Fire Hatchling Application

### What the PDF changes in our current workflow

The previous workflow was technically moving toward Spine, but the review bar was too artifact-focused: contact sheets, import success, layer counts, and margin sizes. Those are necessary proof-health checks, not commercial-readiness checks.

From now on, a Fire Hatchling update must separate:

1. **Proof health** — project imports, files exist, frame export works.
2. **Director quality** — whether the motion/art could ship in a premium mobile action/RPG presentation.

A Spine import with 7 bones and 6 slots is not a quality milestone by itself. The director milestone is: no visible collage seams, body mechanics are readable, and the first attack has weight, fluidity, personality, and game feel.

### Current Fire Hatchling Visual Authority

The currently inserted/restored dragon image is a **temporary visual authority**, not automatically the final canon production design.

Temporary visual authority asset used for readability/appeal correction:

- `assets/dragons/layers/fire-hatchling/krita-workflow/reference_locked_do_not_edit.png`

This asset may be used to restore readability, appeal, unified silhouette, and minimal-separation discipline, but it is **not permanent canon** unless Topnotch explicitly approves it as the final production dragon.

Final production goal: **animate the approved dragon cleanly and readably** — not lock the pipeline around the first readable reference image.

Priority order:

1. Preserve original creature appeal.
2. Preserve silhouette readability.
3. Preserve clean anatomy.
4. Preserve unified body mass.
5. Add subtle believable deformation.
6. Add secondary motion.
7. Treat technical mesh sophistication as last.

Goal: **animate the approved dragon cleanly and readably**. Until a canon production dragon is explicitly approved, reference images are temporary visual authorities for readability, appeal, silhouette, and philosophy validation — not final canon by default.

The animation goal remains: **the approved dragon, but alive** — not an interconnected system of deformation plates.

Philosophical correction: carefully animate the approved dragon design. Do not build an advanced deformation simulation and then try to recover the creature. Strong design, silhouette, posing, and appeal are the source of quality; mesh sophistication is only a support tool.

Do not treat each body region as an independent mechanical subsystem. The Spine rig may use meshes/weights internally, but visible validation must compare against the active visual authority / approved design first for silhouette, proportions, anatomy, spacing, readability, appeal, visual hierarchy, and shape language.

The Fire Hatchling pipeline now operates with explicit production states and transition rules. Never skip directly from DISCOVERY into complex deformation architecture again. Complexity must be earned through visible necessity, not assumed in advance.

Production states:

1. **DISCOVERY** — explore candidate dragon designs, test readability, silhouette, and animation viability. No canon assumptions. No irreversible rig complexity. Temporary visual authorities are allowed.
2. **CANON_SELECTION** — explicitly approve the actual production dragon design. The chosen design becomes canon authority; temporary references no longer override canon.
3. **MINIMAL_SEPARATION_BUILD** — build the smallest possible clean Spine rig around the approved design. Allowed separations: jaw, blink, neck base, wing root, tail base, and subtle chest pulse only if needed. Preserve unified creature mass, original silhouette, and broad readable shapes first.
4. **BASIC_MOTION_VALIDATION** — validate idle/breath/blink/jaw/tail/wing motion. Animation readability first. No advanced deformation systems yet. 50% scale readability required.
5. **TARGETED_COMPLEXITY** — add mesh sophistication only when a visible production failure proves it necessary. Every added separation must justify itself visually. No speculative complexity or mechanical subsystem proliferation.
6. **PRODUCTION_LOCK** — freeze approved rig architecture. Do not reopen solved systems without demonstrated failure evidence.

Current accepted philosophy: **animate the approved dragon cleanly and readably** — not build the most technically sophisticated deformation rig possible.

For hatchlings, mascot creatures, illustrated companions, and low-motion ambient characters, use `docs/SUBTLE_LIFE_ANIMATION_STANDARD.md` as the studio-wide reusable standard. It defines the validated living-illustration ranges from the approved Fire Hatchling A proof: illustration-first hierarchy, unified silhouette preservation, sub-pixel drift, localized blink, value/life motion over geometry motion, and explicit prohibitions against fragmented Spine puppet construction.

Before rigging any creature, classify it with `docs/ANIMATION_TIER_TAXONOMY.md`, then enforce the tier with `docs/TIER_GATED_PRODUCTION_WORKFLOW.md`. Fire Hatchling A is the reference Tier 1 asset: **Subtle-Life Illustration**. Do not treat a successful Tier 1 proof as an unfinished Tier 3 gameplay puppet or Tier 4 cinematic rig.

Next production approach remains **minimal-separation animation reconstruction**, but only after CANON_SELECTION or with a clearly labeled temporary visual authority during DISCOVERY.

Every future Fire Hatchling production slice must begin with this header:

```text
STATE:
<DISCOVERY | CANON_SELECTION | MINIMAL_SEPARATION_BUILD | BASIC_MOTION_VALIDATION | TARGETED_COMPLEXITY | PRODUCTION_LOCK>

ALLOWED OPERATIONS:
- ...

TRANSITION:
- none
or
- <old state> → <new state>

JUSTIFICATION:
- visible failure requiring transition
or
- explicit approval event
```

Enforcement: if a slice performs actions outside the allowed operations of its declared state, the slice is invalid. DISCOVERY cannot introduce advanced deformation systems. BASIC_MOTION_VALIDATION cannot add speculative mesh complexity. TARGETED_COMPLEXITY requires proof of a visible failure first. PRODUCTION_LOCK cannot reopen systems without demonstrated breakage. This header exists to prevent silent pipeline drift and accidental escalation back into deformation-first production behavior.

Energy Source Rule still applies to attacks — chest compression → heat buildup → neck pressure → jaw release → recoil discharge — but it is subordinate to preserving the approved creature design and the declared pipeline state.

Current status: v13 is not visually approved; v14 repaired major weighted-coordinate drift but is not a final production approval. Further work must first restore original-art likeness/cohesion before any additional weight-paint refinement.

Required next execution gate:

1. Compare original reference image vs current Spine playback before changing rig sophistication.
2. Identify attachments/transforms/vertices that break original appeal, silhouette, anatomy, or unified mass.
3. Repair snout/brace, cheek/jaw, neck/collar, wing seating, torso plate cohesion, tail root, and lantern link only as needed to match the original creature.
4. Validate with original-vs-current-vs-repaired no-overlay, 50% scale, and silhouette screenshots.
5. Do not generate another directive-only or automation-only slice.

### Current Pipeline Gap

Current v7 prep improved the `body_core` cutout but still cannot fully fix the head/neck/body seam procedurally. The director conclusion is:

- The remaining problem is **missing hand-painted hidden art**, not padding values.
- The head/neck/body junction needs artist-cleaned overlap at the collar/shoulder.
- The next production pass should happen in Spine + source paintover, not another Python-only mask iteration.

### Required Next Art/Rig Slice

1. Open the v7 Spine prep project.
2. Convert `body_core` and `head_neck` regions into meshes.
3. Add/replace source paint for a local neck-to-shoulder bridge:
   - no black transparent RGB fill;
   - no visible duplicated tail/body chunks;
   - local hidden painted anatomy only.
4. Weight neck-root vertices to both `body_core` and `head_neck` influence zones.
5. Add jaw controller/layer separation before polishing attack motion.
6. Block attack with director timing above.
7. Export a 24 fps GIF/contact sheet for review.
8. Include Director Quality review with scores.
9. Include silhouette validation: black-fill pass, 50% scale pass, mobile-size readability, attack-pose readability.
10. Include secondary motion review: neck drag, horn lag, jaw settle, chest compression, tail overlap, ember drift, flame turbulence, recoil settle.

## Definition of Done for Fire Hatchling First Director Pass

- Motion Quality Score ≥ 6.5
- Readability Score ≥ 7
- Game Feel Score ≥ 6.5
- Commercial Readiness Score ≥ 5.5 for first pass, ≥ 7.5 before content-lock
- Body/head/neck no longer read as pasted cutouts in motion.
- Attack mechanics visibly start from foot/body brace, not VFX alone.
- Furnace core and plume timing support the hit frame.
- Exported review artifact includes contact sheet and GIF/MP4, not just isolated layers.
- Exported proof includes black-fill silhouette frames and 50% scale/mobile-size validation.
- Secondary motion is intentionally authored and reviewed: neck drag, horn lag, jaw settle, chest compression, tail overlap, ember drift, flame turbulence, and recoil settle.
- Expo integration remains frame/spritesheet based until quality is approved.

## Language Standard

Replace generic updates with director language:

- Bad: "It is looking better."
- Better: "The body_core plate now has fewer missing-art holes, but the neck base still reads as a rigid sticker because the shoulder seam lacks hand-painted underlap and mesh weighting. Highest-impact fix: paint a 12–18 px hidden neck/collar bridge, mesh the head_neck layer, and weight the bottom neck vertices 30–45% to body_core."

## Final Director Rule

Always ask: **Would this animation feel believable, readable, expressive, and commercially viable inside a successful shipped mobile game?**

If the answer is no, the update is still in production iteration even if every technical export succeeds.

## Standing Guardrails

- Do not present Python/GIF part transforms as production Spine animation.
- Do not call a contact sheet complete if it only proves file generation.
- Do not solve missing art with broad dilation that pulls in unrelated anatomy.
- Do not use whole-character squash/stretch on the dragon.
- Keep combat readable on mobile; avoid tiny effects that only work zoomed in.
- Favor one cohesive approved painting with hand-cleaned overlap layers over generated collage pieces.
