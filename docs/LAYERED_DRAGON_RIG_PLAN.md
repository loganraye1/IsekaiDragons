# Layered Dragon Rig Plan — Fire Hatchling POC

Owner: Veyra  
Handoff to: Pyraxis  
Purpose: replace whole-sprite bobbing with subtle separated-part motion so the dragon feels alive without becoming too active.

## Context

Logan validated that the transparent cutout fix makes the dragon blend much better into the background. The follow-up whole-sprite idle/tap motion made the dragon feel more alive, but a bit too active — like the whole image is moving as one sticker.

Follow-up validation: Logan/Topnotch still reads the dragon as sticker-like because individual dragon parts do not move. This means whole-sprite motion is not enough and the layered-rig POC has not satisfied the goal until head/wing/tail/body motion is visibly separated.

Second validation: Topnotch tested the rough clipped-overlay Fire hatchling POC on iPhone and said the cutouts feel very sloppy and not very lifelike. Treat rectangular/clipped reuse of the flat PNG as a failed quality path. Use the stable single cutout until true source-layer art exists.

The next quality step is a layered rig: body, head, wings, legs, and tail moving differently in small offsets.

## Guardrails

- Preserve the approved Fire hatchling identity.
- Do not redesign the dragon.
- Do not change balance or mechanics.
- Motion must stay subtle: 5–10px standard idle movement maximum.
- Eyes and horns must remain readable during motion.
- Reduced Motion must freeze/disable layered movement.
- Expo Go performance matters more than fancy animation.

## Fire Hatchling Identity Anchors

From the Hatchling Art Bible:

- Personality: chaotic-cute, eager, mischievous.
- Dominant silhouette: forward-curving horns.
- Emotional read: ambitious little companion, not aggressive monster.
- Motion language: quick reactions, restless energy, but not constant shaking.

## Recommended Layer Split

### Required POC layers

1. **Body / torso base**
   - Includes belly and main mass.
   - Slow breathing scale only.
   - Should be the anchor layer.

2. **Head + horns**
   - Slight independent nod/tilt.
   - Keep eyes visible.
   - Tiny offset gives the biggest emotional payoff.

3. **Near wing**
   - Gentle delayed lift/settle.
   - Small rotation around shoulder.

4. **Far wing**
   - Same as near wing, lower opacity/behind body if needed.
   - Slightly different timing so wings do not move mechanically together.

5. **Tail**
   - Small sway/curve illusion with rotation/translate.
   - Fire can have a slightly quicker tail twitch on tap.

### Nice-to-have later layers

6. **Front legs / paws**
   - Tiny settle on tap.
   - Optional for POC.

7. **Back legs**
   - Mostly static; small breathing-follow motion only.

8. **Glow/accent layer**
   - Keep existing aura first.
   - Do not add noisy sparkles until body rig feels good.

## Can the current PNG be sliced?

Short answer: **yes technically, but the rough POC failed the quality bar.**

The current transparent Fire hatchling cutout can likely be sliced manually into approximate rectangular/transparent layer PNGs. This is enough to test whether layered motion feels better than whole-sprite bobbing.

Risks:

- Overlap seams may show if layers are cut too tightly.
- Hidden areas behind wings/head may not exist in the flat art.
- Legs may be hard to separate cleanly without repainting.

Original recommendation:

- POC should slice broad forgiving shapes with overlap, not precise paper-doll seams.
- Keep body underneath as the full/mostly-full sprite if needed, then overlay animated head/wings/tail cutouts. This can fake layered motion while avoiding holes.
- If the POC validates well on iPhone, create or generate true layered source art later.

Updated recommendation after iPhone validation:

- Do not continue investing in clipped-overlay slicing from the flat PNG for playtest quality.
- Request/source true layer assets with natural overlap and hidden-area paint.
- Keep the approved single cutout in the app until those assets exist.

## POC Implementation Recommendation

### Asset path proposal

Create:

```txt
assets/dragons/layers/fire-hatchling/body.png
assets/dragons/layers/fire-hatchling/head.png
assets/dragons/layers/fire-hatchling/wing-near.png
assets/dragons/layers/fire-hatchling/wing-far.png
assets/dragons/layers/fire-hatchling/tail.png
```

Optional if slicing is too rough:

```txt
assets/dragons/layers/fire-hatchling/full-underlay.png
```

### Component path proposal

Add a small Fire-only layered renderer first, not a full generalized rig system:

```tsx
LayeredFireHatchling
```

Use it only when:

- element is `fire`
- stage is `hatchling`
- not in validation thumbnail mode unless safe
- assets exist

Fallback to current single cutout for all other cases.

## Motion Spec

### Idle

Body:
- scale: 1 → 1.012 → 1
- translateY: 0 → -2px → 0
- duration: ~1500ms

Head:
- rotate: -1deg → 1.5deg → -1deg
- translateY: 0 → -3px → 0
- slight phase offset from body

Near wing:
- rotate: -2deg → 3deg → -2deg
- translateY: 1px → -3px → 1px
- duration slightly quicker than body

Far wing:
- rotate: 1deg → -2deg → 1deg
- translateY: 0 → -2px → 0
- offset timing from near wing

Tail:
- rotate: -2deg → 2deg → -2deg
- translateX: -1px → 2px → -1px
- slow enough to feel alive, not wagging constantly

### Tap reaction

Body:
- tiny squash/pop only, not a big jump

Head:
- quick curious nod

Wings:
- small flutter once

Tail:
- quick twitch once

### Reduced Motion

Render static layer positions or fall back to current single cutout. No looping independent part motion.

## Done Condition for Pyraxis POC

Pyraxis is done when:

1. Fire hatchling can render through the layered component in the main den.
2. Motion is visibly separated by part, not only whole-sprite bobbing; Logan should be able to tell that head/wings/tail/body are moving differently.
3. Reduced Motion disables loops.
4. `npm.cmd run typecheck` passes.
5. Mission Control work log records changed files and proof.
6. Caldrin can ask Logan: “Does Fire hatchling feel more alive without feeling too busy?”

## Handoff: Veyra → Pyraxis

Reason:
Whole-sprite movement improved life but felt too active. Logan specifically asked for separated wings/legs/head motion.

Requested output:
Create a Fire hatchling layered-animation proof-of-concept using broad sliced layers or a safe overlay technique.

Evidence:
- `docs/HATCHLING_ART_BIBLE.md`
- `docs/CREW_OPERATING_SYSTEM.md`
- `docs/agents/WORKSPACE.md`
- Current assets: `assets/dragons/fire-hatchling-cutout.png`, `assets/dragons/fire_hatchling.png`
- Feedback: dragon blends better but feels too static; then whole-sprite motion felt too active.

Done condition:
A Fire hatchling layered renderer exists, typecheck passes, and Logan can validate feel on iPhone.

Blockers:
If current PNG cannot be sliced cleanly enough, document the blocker and request generated/source-layer art instead of forcing a bad rig.
