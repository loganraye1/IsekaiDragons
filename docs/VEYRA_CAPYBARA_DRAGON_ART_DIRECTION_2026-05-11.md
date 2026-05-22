# Veyra Capybara-Style Dragon Art Direction

Date: 2026-05-11  
Owner: Veyra / Art Director  
Project: Isekai Dragons v0.1.0-alpha, Expo Go / iPhone-first  
Status: implementation direction for Pyraxis first slice

## Purpose

Define the visual language that makes the Capybara-style adventure loop feel like Isekai Dragons instead of a generic clone.

The emotional promise is still: **I am raising a dragon companion who grows with me.** The Capybara-style structure should become a dragon expedition: route travel, readable auto-battle, elemental growth choices, hoard rewards, relic identity, and compact phone-safe spectacle.

## Source anchors inspected

- `docs/DRAGONFORGE_OPERATING_INDEX.md`
- `docs/agents/WORKSPACE.md`
- `docs/CAPYBARA_GO_DRAGON_WORKFLOW_2026-05-11.md`
- `docs/CREW_OPERATING_SYSTEM.md`
- `docs/agents/VEYRA_ART_DIRECTOR.md`
- `MEMORY.md`
- `memory/2026-05-11.md`
- `docs/HATCHLING_ART_BIBLE.md`
- `docs/VISIBLE_COMBAT_INTEGRATION_MAP.md`
- `docs/FIRE_BREATH_ATTACK_VERTICAL_SLICE_PLAN_2026-05-10.md`
- `docs/DRAKE_CONTINUITY_REVIEW_GUIDE.md`

## Non-negotiable art constraints

- Do not replace approved Fire, Water, or Earth hatchlings without deliberate style-reset approval.
- Hatchling continuity anchors:
  - Fire: forward-curving horns; restless, eager, mischievous; chaotic ambition becoming confident pride.
  - Water: large flowing fin silhouette; dreamy, drifting, soft; dreamy mysticism becoming graceful wisdom.
  - Earth: chunky crystal shoulder masses; grounded, sturdy, warm; stubborn comfort becoming dependable protection.
- Every dragon read must survive a 128px mental-thumbnail test.
- Face and eyes must remain readable through aura, UI, battle VFX, route overlays, and low brightness.
- Effects support the dragon; effects do not become the main character.
- Reduced Motion must always preserve information while removing looping or punchy movement.
- First implementation slices should be presentation-only unless product approval explicitly authorizes mechanic or balance changes.

## North-star visual sentence

A run should feel like: **a small beloved dragon padding along a magical route, stopping at storybook danger and treasure, then expressing its element in quick readable bursts that make stats and growth feel visible.**

Avoid: generic RPG map icons, over-rendered fantasy clutter, UI that looks like a monetization dashboard, or battle effects that imply new mechanics not present in the state model.

---

# 1. Route / adventure map visual language

## Purpose

Make the new adventure path read as a dragon expedition, not a passive timer or a copy of another game. The route is the player's visible proof that the dragon is going somewhere.

## Composition

For the first slice, use a compact horizontal or gently arcing path strip that can fit above or behind the existing journey/battle surface without fighting the dragon. It should show:

- Current dragon position.
- 3-6 upcoming nodes, not the entire chapter if space is tight.
- One destination/boss node as a stronger silhouette when near enough.
- Stop types that are recognizable by large icon shape, not small detail.

Preferred feel: storybook expedition ribbon / floating isekai path / parchment-meets-magic trail. Use warm outline language and soft fantasy materials, but keep the path simple enough for iPhone.

## Node shape language

Use shape first, color second, icon detail third:

- Fight: small claw-scratch mark, crossed tiny fang/slash, or red-orange spark node.
- Elite: fight node with a small horned crest or double-ring outline.
- Boss: large gate, skull-dragon silhouette, volcanic/water/crystal seal depending chapter.
- Treasure: rounded chest or coin-hoard mound.
- Shrine: vertical obelisk / rune stone / dragon-scale altar.
- Camp: warm lantern / nest / little campfire.
- Shop: pouch / tiny wagon / hanging sign.
- Choice event: forked signpost, question rune, or split-path marker.

Important: nodes should feel diegetic to a dragon world. Treasure is not just a generic chest; it can be a hoard nugget or glinting egg-shaped cache. Shrines are dragon-scale altars, not abstract stars.

## Route materials and palette

Use area-specific route dressing without changing the node grammar:

- Mystic Meadow: moss path, soft blue-green runes, dew sparkle restraint.
- Ember Woods: ember leaves, warm orange path sparks, charred roots.
- Tide Cavern: shell stones, dim aqua glints, water ripple under nodes.
- Stoneback Hills: chunky stones, amber dust, crystal chips.
- Sky Ruins: floating broken tiles, pale gold wind ribbons.
- Void Nest: dark violet gaps, restrained rift glow, avoid visual noise.

The route should never make enemy/HP or dragon face hard to read. Use background-level opacity for route dressing and foreground-level opacity only for current node and next node.

## Current position marker

Use the player's dragon as the emotional marker when feasible, but the first implementation may use a small dragon-footprint/chibi head pin to avoid layout risk.

Preferred marker stages:

1. First slice: small dragon-head or footprint pin matching current element.
2. Later: tiny side-view dragon marker with one idle tick.
3. Only after validation: animated travel hop from node to node.

The marker must inherit element identity:

- Fire: tiny horned pin + ember flick.
- Water: finned pin + soft ripple.
- Earth: crystal-shoulder pin + dust puff.

## Route animation feel

Normal motion:

- Current node breathes/glows gently, 0.8-1.2 seconds.
- Completed node gives a tiny stamp / sparkle, not a confetti storm.
- Movement from node to node is a short hop, slide, or footprint trail.
- Boss node may pulse slowly when visible.

Reduced Motion:

- No pulsing route glow.
- No moving marker travel animation.
- Use static current-node ring, completed checkmark/stamp, and clear text.

## Acceptance checks for Pyraxis

A first route slice is directionally correct if:

- Player can identify current node and next node in under 2 seconds.
- Node type is readable without relying on tiny text.
- Route feels like a dragon expedition through a magical world.
- The dragon companion still remains the emotional focal point.
- Reduced Motion keeps all route information with static emphasis only.

---

# 2. Battle readability and animation feel

## Purpose

Auto-battle should feel alive while staying honest: existing state drives visible presentation. Do not imply manual combat, new cooldowns, player damage, altered speed, burn statuses, or new turn systems unless product explicitly authorizes those mechanics.

## Battle layout priority

On phone, priority order is:

1. Dragon face / silhouette.
2. Enemy cutout and enemy HP.
3. Current feedback event: breath, crit, block, dodge, speed, elemental, ultimate.
4. Defeated count / reward readout.
5. Decorative battlefield dressing.

If all five compete, remove decoration first.

## Core timing language

Use punchy but readable beats. The player should understand cause and effect:

- Anticipation: 120-250ms.
- Action: 250-500ms depending effect.
- Impact: 120-250ms.
- Recovery/readability hold: 250-600ms.

The current Fire Breath note from `memory/2026-05-11.md` is binding: Fire breath should read as **mouth-origin particles**, not a detached beam/light cone/line. Effects travel one way and reset invisibly; they do not rewind back after the fire goes out.

## Breath attack

Purpose: make the dragon's elemental identity visible during auto-battle.

Fire hatchling:

- Origin: mouth/throat, accounting for current sprite facing direction.
- Shape: short chaotic-cute particle spray or compact flame puff; not a laser beam.
- Motion: eager build-up, burst toward enemy, tiny ember fade.
- Color: warm orange/yellow core with soft red edge; avoid face-covering bloom.
- Personality: mischievous little gremlin trying hard, not a boss monster.

Water hatchling:

- Origin: mouth/fin wave gesture.
- Shape: rounded bubble stream, ribbon splash, or soft crescent wave.
- Motion: dreamy swell, drift, pop/splash at enemy.
- Personality: sleepy mystical force, not aggressive pressure washer.

Earth hatchling:

- Origin: stomp / shoulder crystal pulse / ground rumble.
- Shape: pebble arc, crystal shard bump, dust puff along floor.
- Motion: grounded thump, small quake, enemy jolt.
- Personality: protective stubborn shove, not spiky projectile storm.

Reduced Motion breath:

- No traveling particles.
- Show static element badge/glow near dragon and a brief HP/readout change.
- Optional single-frame impact icon if it does not animate.

## Hit impact

Purpose: confirm that the enemy was affected.

Normal motion:

- Enemy image nudges 3-6px or scales 0.97-1.03 briefly.
- HP bar ticks down with a clear color fill change.
- Small hit flash behind enemy, not over enemy face/details.
- Defeat uses a tiny dissolve/pop and immediate clarity for the next enemy.

Reduced Motion:

- No shake/nudge/dissolve animation.
- HP bar snaps or gently changes state without animated travel.
- Use static `Hit` / `Defeated` label if needed.

Avoid current known risk: after defeat, state can swap to the next full-HP enemy quickly. Do not let lingering attack/counter labels appear to target the new enemy incorrectly. Effects should either end before enemy swap visibility or key cleanly to the enemy/defeated-count transition.

## Crit

Visual goal: crit feels like a sharp lucky spike, not a new ability.

Normal motion:

- Star/claw burst at enemy impact point.
- Larger damage number or `CRIT` badge if combat text exists.
- 1-2 frame brighter flash; no full-screen shake.
- Dragon may do a tiny proud pop for Fire, serene glint for Water, firm stomp for Earth.

Elemental personality:

- Fire crit: jagged ember star, quick proud snap.
- Water crit: bright bubble prism pop, soft but surprising.
- Earth crit: chunky crystal crack badge, heavy confident thud.

Reduced Motion:

- Static `CRIT` badge and HP change only.

## Block

Visual goal: defense stat feels visible and satisfying.

Normal motion:

- Shield/scale plate appears between enemy and dragon.
- Dragon barely moves; enemy impact is absorbed.
- Use muted thud ring rather than flashy attack burst.

Elemental personality:

- Fire block: quick crossed ember scales, bratty defiance.
- Water block: translucent bubble shield, soft absorb.
- Earth block: crystal shoulder flare / stone guard, dependable.

Reduced Motion:

- Static shield icon + `Blocked` label; no bounce.

## Dodge

Visual goal: speed/evasion feels visible without losing dragon position.

Normal motion:

- Dragon ghost/afterimage shifts 4-10px then returns.
- Enemy attack swipes through a translucent silhouette.
- Keep motion small; no large teleport off-screen.

Elemental personality:

- Fire dodge: quick mischievous sidestep ember smear.
- Water dodge: soft drift/phase ripple.
- Earth dodge: minimal lean/brace-step; Earth should not become acrobatic.

Reduced Motion:

- Static `Dodged` label and a small faded afterimage icon; no movement.

## Speed / haste

Visual goal: speed affects cadence, but do not imply changed tick timing unless the game state supports it.

Presentation-only safe version:

- Show wind/tempo accent when an attack event occurs.
- Use tiny speed chevrons near dragon or action label.
- Avoid increasing animation frequency beyond existing auto-battle ticks.

Elemental variants:

- Fire: eager ember streaks.
- Water: flowing current lines.
- Earth: determined dust puffs / heavy momentum marks.

Reduced Motion:

- Static speed icon or `Swift` tag only.

## Elemental effects

Use a consistent family: element shape language should be recognizable across route, battle, skills, relics, and evolution.

Fire:

- Shapes: horn curves, ember teardrops, short triangular lick shapes.
- Motion: quick, restless, cheeky.
- Color: orange/red/gold with restrained bloom.

Water:

- Shapes: fins, ripples, bubbles, crescents.
- Motion: slow drift into sudden soft pop.
- Color: aqua/blue/violet with soft transparency.

Earth:

- Shapes: chunky crystals, rounded stones, shield plates.
- Motion: low amplitude, heavy, protective.
- Color: moss/amber/stone/teal crystal accents.

Future elements can follow the same system:

- Storm: zigzag feathers/cloud curls, snappy arcs.
- Shadow: crescent smoke/rift slivers, avoid black-on-dark loss.
- Gold: coin glints/scale seals, reward identity not casino clutter.
- Ancient: rune rings/fossil marks, rare and slower.

## Ultimate

Visual goal: a special moment that still fits the phone and does not bury the UI.

First-slice ultimate direction should be defined but not implemented until mechanics/state exist.

Normal motion ultimate structure:

1. Screen focus dims background slightly.
2. Dragon silhouette/face remains visible.
3. Element crest appears behind or beneath dragon.
4. Single large element action resolves toward enemy/boss.
5. Return to normal battlefield quickly.

Element-specific ultimate feel:

- Fire: `Little Inferno Roar` — horn silhouette glows, mouth-origin flame bloom becomes a compact dragon-shaped flare.
- Water: `Moonpool Tide` — fins spread, circular ripple expands, bubbles lift enemy impact.
- Earth: `Stoneback Oath` — crystal shoulders flare, stone plates rise, heavy protective counter-thud.

Reduced Motion ultimate:

- Static element crest, text label, HP/result update.
- No screen shake, no sweeping particles, no repeated pulses.

## Battle acceptance checks for Pyraxis

A first battle-feedback slice is directionally correct if:

- Breath/hit feedback has visible cause and effect.
- The effect originates from the dragon, not from empty space.
- Enemy art/name/HP/defeated count stay readable.
- Fire breath specifically reads as mouth-origin particles, not beam/line/cone-only.
- Motion never blocks the dragon face for more than a brief beat.
- Reduced Motion removes moving effects while preserving HP, enemy, and event meaning.

---

# 3. Evolution silhouettes and elemental identity

## Purpose

Evolution is the long-term emotional spine. It should answer: **my companion grew up and chose a path.** It must not feel like a random creature replacement.

## Continuity rule

Every later form carries forward:

- Dominant hatchling silhouette feature.
- Face/eye readability.
- Posture language.
- Element-specific behavior rhythm.
- Emotional personality matured, not erased.

## Stage silhouette targets

Hatchling:

- Large head/eyes; simple body; single dominant element feature.
- Reads cute first, elemental second, combat-ready third.

Drake:

- Slightly longer body and stronger limbs.
- Dominant feature remains first or second read.
- Reads `they grew up`, not `new monster`.

Dragon:

- More confident posture and wing/tail presence.
- Still companion-coded: readable face, warmth, not enemy/boss aggression.
- Element feature becomes structural, not just decorative.

Wyrm / advanced branch:

- Branch-specific silhouette is allowed, but must preserve lineage.
- If a branch changes body plan, carry face, posture rhythm, and dominant element motif even harder.

## Element evolution arcs

Fire:

- Hatchling: chaotic-cute, forward-curving horns.
- Drake: proud little brawler, horns still obvious, posture forward.
- Dragon: confident flame companion, horn silhouette and expressive face remain readable.
- Branch risk: too demonic, too angry, flames swallowing face.

Water:

- Hatchling: sleepy mystical fin baby.
- Drake: graceful wise swimmer, large flowing fins remain dominant.
- Dragon: serene tide guardian, soft curves and sleepy wisdom persist.
- Branch risk: too sharp/predatory, generic sea serpent, fins becoming minor trim.

Earth:

- Hatchling: cozy stubborn crystal shoulders.
- Drake: dependable guardian, chunky crystals remain readable.
- Dragon: warm stone protector, mass and shoulders communicate safety.
- Branch risk: becoming a golem/armor pile, face hidden, too noisy at phone size.

## Evolution map visual language

When evolution choices appear, present them as branch seals around the current dragon, not as disconnected stat cards.

First-slice direction:

- Center: current dragon portrait or silhouette.
- Branches: 2-3 large seals with silhouette thumbnails.
- Each branch seal has:
  - branch name,
  - one large silhouette icon,
  - one elemental/build tag,
  - one short readable promise.

Avoid long stat soup. Build identity should be visual and verbal:

- Fire examples: `Blazehorn`, `Ashwing`, `Cinderheart`.
- Water examples: `Moonfin`, `Tideveil`, `Dreamcurrent`.
- Earth examples: `Crystalback`, `Mossguard`, `Stoneheart`.

Do not implement branch names as final canon without product approval; use these as tone references.

## Evolution acceptance checks

- At phone size, branch silhouettes differ before reading text.
- Each branch still looks like the same dragon lineage.
- Element identity works in grayscale through silhouette and shape.
- The player reaction should be closer to `aww, they grew up` than `I got a stronger unit`.

---

# 4. Enemy, treasure, hoard, and relic UI motifs

## Enemy visual motifs

Enemies should be readable foils, not equal-detail protagonists. They can be charming, strange, or dangerous, but should not steal the companion bond.

Use current available enemy cutout family as the first-slice anchor:

- Bouncy slime: soft low-threat intro.
- Briar boar: grounded physical threat.
- Willow wisp: magical/ethereal threat.
- Ruin knight: armored elite / ancient threat.
- Sky manta: aerial/sky threat.
- Rift chimera: void/boss-like threat.

Enemy hierarchy:

- Common enemies: one dominant shape, 1-2 colors, simple idle.
- Elites: stronger outline, small crest/ring, slightly larger silhouette.
- Bosses: larger framing, unique intro badge, restrained background seal.

Avoid heavy enemy card backgrounds/aura/card flash for now; `memory/2026-05-11.md` specifically says enemy presentation should stay simpler while preserving readable enemy art/name/HP/defeated count.

## Treasure motif

Treasure should feel like dragon hoard growth, not generic reward spam.

Shape language:

- Coins as scale-like ovals or stamped dragon tokens.
- Gems as chunky readable crystals, not tiny sparkle dust.
- Chests can be egg-like caches, claw-marked lockboxes, or small hoard nests.
- Reward burst should be a small spill/ping, not full-screen casino confetti.

First-slice treasure node:

- Icon: small rounded hoard pile with 2-3 readable coins/gems.
- Open state: lid/pop or glow reveal.
- Reduced Motion: static opened icon + reward text.

## Hoard UI motif

The hoard is the player's permanent pride shelf. It should communicate accumulation and care.

Visual direction:

- Nest-like base, warm cave shelf, or magical inventory alcove.
- Relics sit as large readable keepsakes, not tiny grid noise.
- Use `new` glints sparingly and away from dragon face.
- Permanent progression should feel cozy/proud, not transactional.

Potential hoard surfaces:

- Hoard summary card: coins/gems/relic count with a small pile illustration.
- Reward return panel: `Your dragon brought back...` with 2-3 large reward icons.
- Relic shelf: horizontal carousel of large relic icons.

## Relic motif

Relics should read as dragon-world artifacts with silhouette-first design.

Relic families:

- Scale relics: shield/defense/element resistance.
- Fang relics: attack/crit/pierce.
- Egg relics: growth/idle/reward.
- Rune relics: skill/ancient/magic.
- Hoard relics: gold/luck/treasure.

Phone-readable icon rules:

- 64px minimum icon design target; 48px still recognizable.
- One dominant object per relic.
- One accent element only.
- No tiny inscriptions unless they form a big simple rune.
- Strong outline or value contrast for low brightness.

## UI motif acceptance checks

- Treasure and relics feel specific to dragons/hoards.
- Enemy visuals remain secondary to dragon companion identity.
- Reward UI is satisfying without monetization clutter.
- Icons remain readable at 48-64px.

---

# 5. Phone readability constraints

## Screen priority rules

When screen space is constrained, cut in this order:

1. Decorative background particles.
2. Extra route dressing.
3. Secondary labels.
4. Nonessential enemy aura/card effects.
5. Animation amplitude.

Do not cut:

- Dragon face readability.
- Current enemy HP/name when in battle context.
- Current route/node state when on adventure path.
- Choice/reward confirmation text.

## Size and contrast targets

- Main dragon: face and dominant silhouette readable at normal gameplay size and at 128px mental-thumbnail scale.
- Enemy: silhouette readable around 72-96px if used in compact battle UI.
- Route nodes: large enough to identify node type without reading tiny text.
- Relic icons: designed for 64px, still recognizable at 48px.
- Text labels: use sparingly; no paragraph blocks inside active battle surface.

## Detail density

Use the Hatchling Art Bible hierarchy everywhere:

1. Large readable shapes.
2. Medium identity details.
3. Tiny details only if they do not carry meaning.

Avoid:

- Thin line particles.
- Dense scale/noise patterns.
- Many small sparkles near HP bars.
- Low-contrast purple/black effects in dark zones.
- Glows covering eyes.

## Motion limits

- Idle bobbing: 5-10px max visual movement, matching art bible tolerance.
- Hit nudge: 3-6px for enemy, 4-10px for dodge afterimage only if readable.
- Route pulse: slow and subtle; no constant blinking.
- Battle effects: short event-driven bursts only, not continuous loops.

## Readability proof checks

For any implemented visual slice, validate:

- iPhone normal brightness.
- iPhone low brightness / dim screen.
- Normal motion.
- Reduced Motion.
- Dragon face visible during still and animation peak.
- Enemy HP readable during hit/defeat.
- Route current/next node readable within 2 seconds.

---

# 6. Reduced Motion expectations

Reduced Motion is not an afterthought. It is a parallel presentation mode.

## General rule

Reduced Motion keeps information and removes movement. It may use:

- Static icons.
- Text labels.
- Instant state changes.
- Non-pulsing outlines.
- Single-frame emphasis.

It should not use:

- Looping idle bob.
- Traveling breath particles.
- Screen shake.
- Enemy shake/nudge.
- Pulsing node glow.
- Repeated sparkle/confetti.
- Sweep transitions.

## Route Reduced Motion

- Static current-node ring.
- Completed node check/stamp appears without animation.
- No marker hop/slide.
- Boss node uses static stronger outline.

## Battle Reduced Motion

- Static enemy cutout/name/HP/defeated count.
- Breath replaced by static element badge or label.
- Crit/block/dodge/speed use static badges.
- Ultimate uses static crest + result text.

## Reward Reduced Motion

- Reward icon appears already open/revealed.
- No spilling coins, sparkle loops, or chest bounce.

## Acceptance check

A Reduced Motion player should still understand what happened, but nothing should feel like it is moving, pulsing, shaking, or demanding attention.

---

# 7. First implementation slice recommendation for Pyraxis

## Recommended slice

Implement the smallest route-and-battle presentation improvement that can use existing state and current art without save/balance risk:

1. Adventure route strip / current node display using static placeholder node data if product/route data contract exists, or a docs-backed skeleton if not yet coded.
2. Fire hatchling battle feedback refinement should preserve the current implementation guardrails:
   - read-only presentation in `App.tsx`,
   - keyed to existing `state.autoBattle.enemyHp` / `defeatedCount`,
   - Fire hatchling only unless expanded deliberately,
   - mouth-origin particles,
   - simple enemy presentation,
   - Reduced Motion static enemy + HP/readout.
3. Keep route symbols and battle effects in the same element language so the system starts forming one art family.

## Integration path

For code implementation, use existing engineering map guidance:

- Likely file: `App.tsx` for first presentation layer.
- Likely battle data source: existing `state.autoBattle.enemyName`, `enemyHp`, `enemyMaxHp`, `defeatedCount`, `areaId`.
- Likely enemy assets: existing `assets/enemies/*-cutout.png` mapped by helper.
- Do not edit `src/balance.ts`, combat formulas, reward formulas, auto-battle timing, save schema, dependencies, or haptics for this art slice.
- Gate all motion behind `state.settings.reducedMotion`.
- Proof after code changes: `npm run typecheck` from WSL, plus iPhone Expo validation for subjective feel.

## Pyraxis should not need to guess

If Pyraxis implements a first slice from this doc, choose these defaults:

- Route style: compact magical dragon expedition path with large node icons.
- Current node marker: static element dragon-head/footprint pin first, not a full moving dragon.
- Fight node icon: claw/spark.
- Treasure node icon: hoard pile.
- Boss node icon: larger dragon-gate/seal.
- Fire breath: mouth-origin particles, one-way travel, no rewind, no detached beam.
- Enemy treatment: simple cutout/name/HP/defeated count; no active enemy aura/card flash.
- Crit/block/dodge/speed: small event badges and tiny motion only in normal mode.
- Reduced Motion: static information-only state.

## Definition of done for the first art-directed slice

A first Pyraxis slice is acceptable when:

- It visibly makes the loop feel more like a dragon adventure.
- It preserves approved hatchling identity and phone readability.
- It does not introduce or imply unapproved mechanics.
- Normal motion feels lively but compact.
- Reduced Motion is calm, static, and informative.
- The implementation proof names changed files and passes the agreed proof command.
- Caldrin can ask a direct iPhone validation question without needing more art interpretation.

## Suggested validation question

After implementation, ask Logan on iPhone:

> Does the new route/battle presentation make this feel like your dragon is going on an adventure, without making the screen too busy or making combat seem mechanically changed?

Pass:

- Dragon adventure fantasy is clearer.
- Dragon identity remains readable and affectionate.
- Enemy/HP/route state are understandable.
- Motion is not distracting.

Borderline:

- Adventure fantasy is clearer, but one area is too busy, too fast, too vague, or too generic.

Fail:

- It feels like generic mobile RPG UI, hides the dragon, confuses combat mechanics, or is uncomfortable in Reduced Motion.
