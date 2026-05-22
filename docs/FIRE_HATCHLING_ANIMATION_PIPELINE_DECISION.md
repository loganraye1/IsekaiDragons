# Fire Hatchling — Animation Pipeline Decision

Topnotch concern: we keep going back and forth because we are trying to solve concept art, layer export, rigging, animation, and game integration in one loop.

## Decision

Use a **two-track pipeline**:

1. **Now / inside the Expo app:** keep using transparent PNG layers + manifest pivots + React Native/Animated or Reanimated transforms.
2. **Production art tooling:** move final high-quality rigging to **Rive** first, with Spine as a later option if we need deeper skeletal/game-runtime tooling.

## Why Rive Helps

Rive is designed around vector/2D interactive animations and state machines. Its React Native runtime supports state machine playback and inputs, which maps well to our combat states:

- Idle
- Windup
- Attack
- Hit
- Block
- Dodge
- Crit
- Evolution flare

For this project, Rive likely helps more than another image generator because our problem is not only making prettier images — it is keeping the same character consistent while animating separate parts.

## Spine If We Change Testing Process

If we change the testing process away from Expo Go-only review, Spine becomes a stronger candidate and may be the better long-term animation authoring tool.

Spine is purpose-built for 2D skeletal game animation: bones, mesh deformation, IK, dopesheet timing, layered animations, and compact runtime exports. That is exactly the class of problem we have with the Fire hatchling: keeping one polished character consistent while moving head, jaw, scarf, wing, tail, legs, chest glow, and attack FX independently.

The blocker is not Spine quality. The blocker is **React Native / Expo runtime integration**. Spine's browser player expects browser/WebGL/DOM APIs; React Native/Expo does not provide a normal DOM/WebGL environment. A forum discussion from Esoteric notes the web player does not work directly in React Native/Expo because React Native lacks full browser WebGL and DOM support. So Spine is best if we adjust testing/integration around it.

### Spine-friendly testing options

1. **Author/test in Spine desktop first**
   - Artist/agent exports preview GIF/MP4/spritesheet for Discord review.
   - App integration waits until animation quality is approved.

2. **Use Spine for source-of-truth animation, export spritesheets for Expo**
   - Lowest-risk with current Expo app.
   - We animate in Spine, then export attack/idle/hit frame strips or atlases consumed by React Native.

3. **Move combat rendering to a custom/native renderer later**
   - Higher engineering cost.
   - Enables actual Spine runtime playback instead of spritesheet playback.

## Rive vs Spine Decision

- **Rive first** if the priority is fastest React Native state-machine integration.
- **Spine first** if the priority is best game-character animation authoring and we are willing to review via exported GIF/MP4/spritesheets before direct app playback.

Given Topnotch's feedback quality bar, Spine is likely better for the Fire dragon animation craft if we change testing to: Spine preview → exported spritesheet/GIF proof → Expo playback from exported frames.

## Immediate Steps Toward Animation

### Step 1 — Lock a reference-aligned layer list

Required final Fire hatchling layers:

- body
- belly/chest furnace glow
- head
- lower jaw
- neck
- scarf
- rear wing membrane/ribs
- front leg
- back leg
- compact curled tail
- tail lantern/tip
- mouth flame seed
- attack plume
- smoke/ember particles

### Step 2 — Repaint the layer pack closer to the reference

Current layer pack exists at:

`assets/dragons/living-forge-fire-hatchling/layers-v1/`

But it still needs a reference-aligned repaint:

- bigger expressive head,
- cream scarf layer,
- shorter curled tail,
- dark cracked lava body,
- orange wing membrane,
- integrated glowing belly/chest plates,
- clearer jaw/mouth.

### Step 3 — Animate with current manifest rig

The app can animate the PNG layers already. Current proof:

`artifacts/test-run/latest/living-forge-fire-hatchling-hq-layer-rig-attack.gif`

### Step 4 — Rive spike

Create a small Rive experiment with the same layers and state machine inputs:

- `idle`
- `attackTrigger`
- `hitTrigger`
- `critTrigger`

Success criteria:

- Rive file can play idle and attack on desktop.
- React Native runtime can load it in Expo/dev build or clearly documents why Expo Go blocks it.
- State machine trigger can be fired from combat state.

## Recommendation

Pivot the production animation plan to **Spine authoring with exported frame/spritesheet playback in Expo first**.

Do not block Fire hatchling quality on direct Spine runtime integration yet. Keep the PNG layer rig in the app for immediate previews, use Spine as the source-of-truth animation tool, export GIF/MP4/contact sheets for review, then export frame sequences or spritesheets for Expo playback. Revisit direct Spine runtime support only after the animation quality is approved.

Detailed implementation plan:

`docs/FIRE_HATCHLING_SPINE_IMPLEMENTATION_STEPS.md`
