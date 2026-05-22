# Dragon Evolution Branch Map

Date: 2026-05-11
Owner: Aurelith, Product / Game Design Strategist with Veyra art-direction inputs
Project phase: v0.1.0-alpha product/design map, not an implementation request

## Product stance

Evolution should solve the player problem that long-term dragon growth can currently read as a stat milestone instead of a companion becoming a different kind of mythic creature. The branch map should make each evolution choice feel like a visible identity/build commitment: the dragon keeps its lineage, grows up, and chooses a fantasy that changes how future skill offers, stats, and battle feedback are framed.

Recommendation: treat evolution as a layered tag system that unlocks presentation and build identity over time, not as 120 bespoke combat systems on day one.

Evidence sources:

- `docs/DRAGON_EVOLUTION_BRANCHES_STATS_SKILLS_2026-05-11.md`: Topnotch direction, starter eggs, 3-way Drake paths, 2-way later splits, stage pacing, battle-screen needs, stat/skill examples.
- `docs/VEYRA_CAPYBARA_DRAGON_ART_DIRECTION_2026-05-11.md`: silhouette continuity, phone readability, evolution-map visual language, Reduced Motion expectations.
- `docs/CAPYBARA_GO_PRODUCT_BRIEF_2026-05-11.md`: first-session adventure foundation and no-balance/no-currency guardrails.
- `docs/PRODUCT_REVIEW_2026-05-09.md`: playtest interpretation that evolution needs stronger presentation and emotional payoff, but skipped-time notes are not clean balance evidence.
- `docs/DRAKE_PATH_VISUAL_DISTINCTION_2026-05-11.md` and `docs/EVOLUTION_PATH_PLACEHOLDER_ART_2026-05-11.md`: placeholder silhouette/count contracts for 15 Drake paths, 30 Young paths, 60 Dragon paths, and 120 Ancient capstones.

Tradeoff: this preserves retention and delight by giving players long-term aspiration, but it deliberately parks most mechanical depth so v0.1.0-alpha does not sprawl beyond the readable first adventure/combat loop.

## Naming note: stages

Topnotch's confirmed progression language uses Hatchling -> Drake -> Young Dragon -> Dragon -> Ancient Dragon. This map also supports the requested Hatchling -> Drake -> Wyrm -> Elder -> Ancient/Mythic framing by mapping:

- Hatchling = starter baby form.
- Drake = first identity choice.
- Wyrm = Young Dragon tier: branch body plan and build identity become serious.
- Elder = Dragon tier: city-scale mastery, reliable vs risky specialization.
- Ancient/Mythic = Ancient Dragon tier: capstone myth, majestic vs forbidden final identity.

Implementation copy can use `Young Dragon` for player-friendly clarity and `Wyrm`/`Elder` as branch flavor where it makes the fantasy stronger.

## Core branch architecture

The scalable structure should be:

1. Egg element tag: Fire, Water, Earth, Light, Dark.
2. Drake archetype tag: the first visible path choice; one of three per egg.
3. Wyrm / Young specialization tag: two-way split from the chosen Drake path.
4. Elder / Dragon mastery tag: two-way split from the Wyrm path.
5. Ancient/Mythic capstone tag: two-way split from the Elder path.

This produces the Topnotch-requested tree:

- 5 hatchlings.
- 15 Drake paths.
- 30 Wyrm / Young paths.
- 60 Elder / Dragon paths.
- 120 Ancient/Mythic capstones.

Product rule: the tree can be large on paper, but the implemented system should start from tags, preview cards, silhouette contracts, and skill-pool weighting. Do not hand-build 120 unique systems before the Fire adventure/combat slice earns attention.

## Stage map

### 1. Hatchling — first companion promise

Timing target: from start until roughly 2-4 hours of play.

Player problem solved: the player needs to understand `this is my dragon` and the dragon's starting element before any complex buildcraft appears.

Visual identity:

- Large head and readable eyes.
- Cute first, elemental second, combat-ready third.
- One dominant silhouette feature that survives later forms.
- Fire: forward-curving horns, ember mischief.
- Water/Frost source: large flowing fins, dreamy softness.
- Earth/Bone source: chunky crystal/stone mass, dependable warmth.
- Light/Gold/Storm source: rounded radiant crest, halo/wing clarity.
- Dark/Shadow/Venom/Void source: crescent tail, smoke/rift shape, mischievous low posture.

Mechanical identity:

- A starter element tag and one or two readable tendencies only.
- No deep branch lock-in yet beyond egg choice.
- Early battle feedback should teach HP, enemy HP, current attack/element flavor, and maybe one element proc.

Stat preference:

- Fire: Attack / Breath Damage / Burn flavor.
- Water: HP / Healing / Soak flavor.
- Earth: HP / Defense / Block flavor.
- Light: Crit support / Healing / Radiance flavor.
- Dark: Dodge / Drain / Curse flavor.

Skill tags:

- `element:fire`, `element:water`, `element:earth`, `element:light`, `element:dark`.
- `role:intro`, `rarity:common`, `presentation:first-run`.
- Keep choices simple: Spark Bite, Bubble Jet, Stone Snout, Gleam Claw, Shadow Nibble-style hooks.

Unlock moment:

- Egg selection and early hatch presentation.
- First battle feedback should show the chosen element in a tiny, readable way.
- First evolution preview should tease three Drake seals without asking for the decision immediately.

Implement now vs parked:

- Implement now: starter identity text, silhouette/portrait display, one element tag, Drake preview surface.
- Park: full permanent skill tree, rerolls, rare unlock rules, balance tuning, multi-dragon collection decisions.

Tradeoff: clarity and companion attachment improve; complexity stays low by avoiding too many early stats and permanent systems.

### 2. Drake — first real identity choice

Timing target: roughly 2-4 hours.

Player problem solved: the first evolution needs to feel game-changing and worth returning for, not merely `+stats`.

Visual identity:

- Same companion, longer body, stronger limbs, more confident posture.
- Three choices per egg must differ by silhouette before color.
- Use branch seals around the current dragon: branch name, large silhouette, one build tag, one short promise.
- At phone size, branch options must pass the 128px mental-thumbnail test.

Mechanical identity:

- Drake choice starts weighting run skill offers and branch-specific passive previews.
- Mechanical effects should begin as bounded tags or presentation until battle feedback proves readable.
- The player should be able to describe the path in one phrase: `burn attacker`, `smoke dodger`, `magma tank`, etc.

Stat preference:

- One primary stat lane, one secondary stat lane, one obvious weakness per branch.
- Do not expose a stat spreadsheet on the branch card.

Skill tags:

- `stage:drake`.
- `archetype:<path-name>`.
- One role tag: `damage`, `evasion`, `tank`, `sustain`, `control`, `crit`, `drain`, `debuff`, `loot`.
- One feedback tag: `burn`, `slow`, `block`, `crit`, `dodge`, `heal`, `curse`, etc.

Unlock moment:

- First evolution ceremony after the player has seen enough fights for the choice to make sense.
- Show three branch seals with silhouette thumbnails, short promise, stat lean, and future Wyrm preview teaser.
- The choice should be framed as the dragon choosing a path with the player, not as equipping a passive card.

Implement now vs parked:

- Implement now: preview all 15 Drake paths with placeholder silhouettes and branch tags; make the chosen branch visible in dragon info.
- Park: math-heavy passives, branch-specific enemy tuning, full skill weighting, respec economy.

Tradeoff: retention/delight improves through a clear first goal; balance risk is contained by starting with preview and tag surfaces.

### 3. Wyrm / Young Dragon — build identity becomes serious

Timing target: roughly 3-7 days after Drake.

Player problem solved: players who return for days need a second, more personal choice that feels like a build, not just a bigger model.

Visual identity:

- First major body-plan divergence is allowed.
- Wings, tail, horns, armor, fins, smoke, thorns, crystals, halos, or rift effects become structural.
- Lineage anchors must remain: face/eyes, posture rhythm, and dominant motif from hatchling/Drake.
- Adventure scale moves from forest adventuring toward raiding towns.

Mechanical identity:

- Each Drake splits into one intensify path and one twist/hybrid path.
- This tier can begin to define run skill pools more strongly.
- Wyrm branch should shape how the player reads combat feedback: shield cycle, burn spread, dodge counter, crit storm, lifesteal, etc.

Stat preference:

- Two strong stat lanes, one support stat, one cost/weakness.
- Examples: Burn Damage + Breath Damage + Combo, but lower Defense; Shield Power + Defense + Control, but lower Speed.

Skill tags:

- `stage:wyrm` or `stage:young`.
- `specialization:intensify` or `specialization:hybrid`.
- Branch tags should start influencing roguelike 3-choice offers.

Unlock moment:

- The first long-term return milestone after several sessions.
- Branch selection should appear after the player has used or previewed their Drake identity enough to understand what they are deepening.
- Include a `Your dragon is becoming...` moment with a branch promise and one new visual motif.

Implement now vs parked:

- Implement now: data schema direction and preview contracts only; maybe one Fire example path after Fire slice validation.
- Park: complete 30-path mechanical implementation, Wyrm-specific boss tuning, rare materials, long quest chains.

Tradeoff: this gives mid-term retention direction, but implementing it before first-session proof would dilute the current Fire adventure/combat focus.

### 4. Elder / Dragon — mastery and scale

Timing target: roughly one month.

Player problem solved: long-term players need a prestige-feeling commitment that changes the scale of fantasy from adventuring to city-level dragon power.

Visual identity:

- Confident, large, city-raid silhouette.
- More wing/tail/crest dominance, but still companion-coded and readable.
- Elder forms should not become hostile boss monsters; the player should still recognize their friend.
- Adventure scale: raiding cities, battlements, royal vaults, mage towers.

Mechanical identity:

- Each Wyrm path splits into reliable/scaling mastery vs explosive/risky/specialized mastery.
- This is where buildcraft can justify stronger passives if the lower tiers have been validated.
- Skill offers should heavily reflect branch tags while still allowing a small common pool.

Stat preference:

- Reliable mastery: defensive consistency, scaling sustain, predictable damage, boss survival.
- Risky mastery: burst damage, crit/rage spikes, execute thresholds, self-damage/overheat/fragility costs.

Skill tags:

- `stage:elder` or `stage:dragon`.
- `mastery:reliable`, `mastery:risky`, `mastery:boss`, `mastery:mob`, `mastery:sustain`, `mastery:burst`.
- Branch-specific ultimate tag can be introduced here if mechanics exist.

Unlock moment:

- A high-ceremony evolution: dragon portrait/silhouette grows, adventure scale copy changes, battle info button shows the mastery name.
- This should unlock branch-specific ultimate preview if ultimates are implemented by then.

Implement now vs parked:

- Implement now: parked design direction and placeholder file compatibility.
- Park: ultimates, city-scale encounters, mastery math, month-long materials, prestige UI.

Tradeoff: huge aspiration value, but high dev cost and balance risk; should not compete with early loop readability.

### 5. Ancient/Mythic — capstone legend

Timing target: roughly 3-6 months.

Player problem solved: endgame players need an identity-defining myth that makes their dragon feel singular and worth months of care.

Visual identity:

- Ancient silhouette can be massive, rune-crowned, aura-backed, skeletal, celestial, volcanic, void-torn, or gold-hoarded.
- Mythic capstones should remain readable and emotionally attached, not just larger/noisier.
- Adventure scale: kingdoms, sky citadels, divine temples, rival ancient dragons, world bosses.

Mechanical identity:

- Each Elder path splits into majestic mastery vs dangerous/forbidden legend.
- Ancient tags can unlock final passives, ultimate upgrades, cosmetic aura, and long-term quest identity.
- Avoid making every capstone a damage race; defensive, control, hoard, and companion-protection fantasies matter too.

Stat preference:

- Majestic capstone: consistency, safety, broad mastery, heroic/mythic payoff.
- Forbidden capstone: extreme output, strange rules, sharper downside, darker narrative promise.

Skill tags:

- `stage:ancient`, `stage:mythic`.
- `capstone:majestic`, `capstone:forbidden`.
- `legend:<branch-name>`.
- Optional `aura`, `ultimate`, `questline`, `world-boss` tags for future content.

Unlock moment:

- Major ceremony and status change, not a small menu confirm.
- Should show before/after lineage, capstone seal, myth title, and what this dragon is now known for.

Implement now vs parked:

- Implement now: nothing beyond placeholder contracts and data shape awareness.
- Park: 120 capstone mechanics, Ancient materials, world bosses, seasonal progression, prestige loops.

Tradeoff: long-term retention fantasy is strong, but implementing any Ancient mechanics now would be feature sprawl for v0.1.0-alpha.

## Branch families requested for this map

The user-facing branch families below should be used as major identity/build lanes across the tree. They are not all starter eggs; some are branch families within Water, Light, Dark, Earth, or future hybrid paths.

### Fire

Player problem solved: players who want aggression and spectacle need an obvious damage fantasy.

Visual identity:

- Horn curves, ember teardrops, flame mane, volcanic cracks, ash smoke.
- Motion personality: quick, restless, cheeky; fire comes from the mouth/throat, not detached UI beams.
- Risk: too demonic, too angry, flames hiding face.

Mechanical identity:

- Direct damage, Burn, breath attacks, crit/burst, rage/ultimate charge.
- Branches include Flame, Smoke, Magma and later Inferno, Volcanic, Ashen, Cinderfang, Lava, Obsidian lines.

Stat preference:

- Attack, Breath Damage, Burn Chance/Damage, Crit Damage, Rage Generation.
- Weakness can be Defense, HP, or overheat/self-risk depending path.

Skill tags:

- `element:fire`, `burn`, `breath`, `crit`, `rage`, `overheat`, `explosion`, `ash`, `magma`.

Unlock moments:

- Hatchling: tiny flame identity.
- Drake: Flame/Smoke/Magma path choice.
- Wyrm+: burn stacking vs armor melt vs dodge-crit vs shield-burn variants.

Implement now:

- Fire should be the first branch preview to make tangible because the active project direction prioritizes the focused Fire adventure/combat slice.

Park:

- Burn math, overheat downside, ultimate rage loops until combat feedback and stat visibility are validated.

### Storm

Player problem solved: players who like speed, crits, and chain reactions need a fast, electric identity.

Visual identity:

- Zigzag horns/feathers, cloud curls, streamer wings, forked tail, radiant lightning if coming from Light/Stormlight.
- Motion personality: snappy arcs and quick flashes; avoid unreadable thin lines on phone.

Mechanical identity:

- Speed, crit, combo, chain-light bursts, initiative/tempo.
- Most natural source in current tree: Light -> Stormlight Drake -> Tempest/Star lines.
- Could also hybridize with Water/Soak later if the team adds lightning synergy.

Stat preference:

- Speed, Crit Chance, Combo Chance, Crit Damage, Rage Generation.
- Weakness: Defense, bad luck variance, fragility.

Skill tags:

- `element:storm`, `element:light`, `speed`, `crit`, `combo`, `chain`, `tempo`, `radiance`.

Unlock moments:

- Drake: Stormlight path choice.
- Wyrm: Tempest speed/combo vs Star crit/radiant burst split.
- Elder+: reliable chain-lightning vs fragile heaven-piercing burst.

Implement now:

- Show as a branch family/tag in preview and skill taxonomy.

Park:

- True speed cadence changes and chain-lightning mechanics until battle timing and stat feedback are robust.

### Frost

Player problem solved: players who like control, shields, and safe progression need a cold defensive-control fantasy distinct from Water healing.

Visual identity:

- Angular ice spikes, frost aura, crystalline tail, pale blue value contrast.
- Motion personality: slow pressure, brittle shatter, shield growth.
- Risk: becoming generic blue recolor or hiding face with pale fog.

Mechanical identity:

- Shields, Slow, Freeze, crit-shatter, boss survival.
- Current source: Water -> Frost Drake -> Glacier/Hailstorm.

Stat preference:

- Defense, Shield Power, Control/Slow/Freeze Chance, Crit Damage for Shatter paths.
- Weakness: Speed, sometimes raw Attack.

Skill tags:

- `element:frost`, `shield`, `slow`, `freeze`, `shatter`, `control`, `boss-survival`.

Unlock moments:

- Drake: Frost path choice after Water hatchling.
- Wyrm: Glacier shield/freeze vs Hailstorm shard/crit split.
- Elder+: Icewall reliable shield vs Shatterstorm crit-control.

Implement now:

- Preview tag and silhouette contract.

Park:

- Freeze rules, shield cycling, Slow timing until core combat state supports readable control.

### Shadow / Venom

Player problem solved: players who want sneaky, evasive, debuff-heavy builds need a fantasy that feels clever and risky without becoming unreadable dark noise.

Visual identity:

- Crescents, smoke/rift slivers, low posture, blade tail, venomroot thorns, sickly green accent only where readable.
- Risk: black-on-dark loss, too sinister for companion tone, effect noise covering face.

Mechanical identity:

- Shadow: dodge, crit, ambush, curse, counter magic.
- Venom: poison/venomroot attrition, thorns, debuffs, root snares.
- Current sources: Dark -> Shadow/Curse and Earth -> Thorn -> Venomroot.

Stat preference:

- Dodge, Crit Chance, Curse Chance, Skill Damage, Thorn/Venom Damage, Counter.
- Weakness: Defense, HP, sometimes Speed for curse-control variants.

Skill tags:

- `element:shadow`, `element:dark`, `venom`, `curse`, `dodge`, `ambush`, `debuff`, `thorns`, `execute`, `lifesteal`.

Unlock moments:

- Drake: Shadow path for Dark; Thorn path for Earth can later twist into Venomroot.
- Wyrm: Night/Voidstep for stealth vs magic counter; Briar/Venomroot for thorns vs venom debuffs.
- Elder+: assassin, execute, attrition, forbidden void variants.

Implement now:

- Preview tags and visual contrast rules.

Park:

- Poison/venom tick systems, curse layering, execute thresholds until effect icons/status readability exists.

### Gold

Player problem solved: players who love hoards, luck, reward spikes, and treasure identity need a progression fantasy that is not monetization clutter.

Visual identity:

- Coin glints, scale seals, hoard pile, warm gold/cream, crowned-but-cute posture.
- Must feel like dragon hoard pride, not casino UI or paid-shop pressure.

Mechanical identity:

- Loot/Hoard Bonus, luck, reward conversion, maybe crit/support if coming from Light.
- Current tree has no explicit Gold egg; Gold should be a branch family that can emerge from Light, Earth/Crystal, or future hoard/relic systems.

Stat preference:

- Loot/Hoard Bonus, Crit Chance/Luck, Shield Power or HP if hoard-guardian, possibly XP/reward quality.
- Weakness: lower direct damage or slower combat clear.

Skill tags:

- `element:gold`, `hoard`, `loot`, `luck`, `relic`, `reward`, `guardian`, `radiance`.

Unlock moments:

- Best introduced after treasure/hoard systems are readable.
- Could appear as a Light/Dawn or Earth/Crystal hybrid branch, not as an early full system.

Implement now:

- Do not implement as mechanics. Mention as parked branch family and ensure treasure/hoard visual language can support it later.

Park:

- Loot scaling, reward economy, hoard bonus balance, gold branch selection until hoard/relic loop exists and is validated.

### Ancient

Player problem solved: players who want wisdom, runes, myth, and old-world magic need a non-elemental prestige fantasy separate from raw damage.

Visual identity:

- Rune rings, fossil marks, older horn crowns, weathered scales, slow aura, temple/sky-citadel motifs.
- Motion personality: rare, slow, deliberate; never constant visual noise.

Mechanical identity:

- Skill Damage, ultimate/rage, boss resilience, knowledge/rune effects, rare control.
- Ancient can be a capstone flavor across many lines rather than one starter element.

Stat preference:

- Skill Damage, Rage Generation, Defense or Control depending line.
- Weakness: slower tempo, fewer raw reward bonuses, expensive long-term investment.

Skill tags:

- `element:ancient`, `rune`, `ultimate`, `skill-damage`, `boss`, `control`, `mythic`.

Unlock moments:

- Elder and Ancient/Mythic tiers.
- Should feel earned through long-term progression, not offered in the first session.

Implement now:

- Use as tag language for future capstones and placeholder contracts.

Park:

- Ancient material economy, ultimate systems, runic boss mechanics, world-boss identity.

### Bone / Void

Player problem solved: players who want forbidden, eerie, high-risk legends need a darker capstone fantasy without making the companion feel disposable or villain-only.

Visual identity:

- Bone plates, fossil ribs, crescent void gaps, violet rift glow, skeletal crests, negative-space wing tears.
- Must preserve face/eyes and lineage anchor; avoid black/purple mush at phone size.

Mechanical identity:

- Void: dodge/teleport/counter magic, curse, execute, boss debuffs, reality-break effects.
- Bone: armor, thorns, death-resilience, lifesteal, necrotic sustain/control.
- Natural sources: Dark -> Shadow/Curse -> Voidstep/Reaper; Earth/Bone hybrid could emerge from fossil/ancient defensive paths.

Stat preference:

- Curse Chance, Skill Damage, Dodge, Lifesteal, Execute, Damage Reduction, Counter.
- Weakness: risky sustain, lower healing received, self-cost, lower direct defense depending path.

Skill tags:

- `element:void`, `element:bone`, `curse`, `execute`, `lifesteal`, `death-save`, `counter-magic`, `forbidden`, `rift`.

Unlock moments:

- Wyrm can tease Voidstep/Reaper; Ancient/Mythic can deliver full Void/Bone capstones.
- Should be framed as forbidden mastery, not a starter identity for v0.1.0.

Implement now:

- Preview taxonomy only, plus phone-contrast rules.

Park:

- Teleport/evasion logic, execute math, death-save loops, necrotic/void status effects.

## Cross-branch stat and skill taxonomy

Use broad tags that can support many branches without bespoke code per capstone:

Core stat tags:

- `hp`, `attack`, `defense`, `speed`.

Offense tags:

- `crit-chance`, `crit-damage`, `combo`, `skill-damage`, `breath-damage`, `element-damage`, `rage-generation`.

Defense tags:

- `block-chance`, `block-power`, `dodge-chance`, `damage-reduction`, `shield-power`, `healing-received`.

Element/proc tags:

- `burn`, `soak`, `slow`, `freeze`, `thorns`, `radiance`, `curse`, `lifesteal`, `venom`, `void`, `hoard`, `rune`.

Role tags:

- `damage`, `tank`, `sustain`, `evasion`, `control`, `debuff`, `crit`, `burst`, `loot`, `boss`, `mob-clear`, `ultimate`.

Presentation tags:

- `mouth-origin-breath`, `static-reduced-motion`, `silhouette-first`, `phone-readable`, `lineage-anchor`.

Product rule: each branch preview card should show at most one primary role, one stat lean, one skill tag, and one readable promise. Detailed stat sheets belong behind the info button.

## Evolution UI recommendations

First evolution preview should use:

- Center: current dragon portrait/silhouette.
- Branches: 2-3 large seals with silhouette thumbnails.
- Each seal: name, silhouette, one build tag, one short promise.
- Optional stat lean: `High Attack`, `Shield Control`, `Dodge Crit`, not numeric modifiers.
- Locked future tiers: visible as faint seals to create aspiration, not as a dense full tree.

Reduced Motion:

- No pulsing seals, sweeping particles, or animated branch lines.
- Use static selected ring, check/stamp, and clear text.

Phone readability:

- Branch silhouette must differ before text.
- Current dragon face remains visible.
- Avoid full 120-node tree in active gameplay; use progressive disclosure.

## What should be implemented now

Recommended v0.1.0-alpha scope after/alongside the focused Fire adventure/combat work:

1. Data shape only:
   - Evolution branch entries can be defined by element, stage, archetype/specialization/mastery/capstone tags, stat lean labels, skill tags, visual motif labels, and unlock stage.
   - Keep save compatibility by deriving previews from static data until a migration is explicitly planned.

2. Preview UI only:
   - Show five starter egg identities if that surface already exists.
   - Show three locked Drake previews per egg using placeholder silhouettes and short build promises.
   - Make chosen/current branch identity visible in an info surface.

3. Fire-first proof:
   - Because the active chain prioritizes a Fire starter adventure/combat slice, wire or mock only enough Fire -> Flame/Smoke/Magma preview to make the first evolution aspiration legible.
   - Do not branch all battle math yet.

4. Skill-tag compatibility:
   - Ensure future skill choices can display branch/element tags without needing the full mechanical effects.
   - First 3-choice run skill surface can show dragon-flavored choices, but math-affecting modifiers need explicit proof and approval.

5. Acceptance checks:
   - Player can identify their dragon's current stage and next possible evolution path without a guide.
   - Branches differ by silhouette and promise, not just color or numbers.
   - The Fire branch preview makes a player want to reach Drake.
   - No balance values, currencies, monetization surfaces, dependencies, or save schema are changed for preview-only work.

## What should stay parked

Park these until after the first adventure/combat slice is validated on iPhone:

- Full 120 Ancient/Mythic mechanical branch implementation.
- Numeric branch stat tuning.
- Permanent skill trees and reroll economy.
- Respec permanence rules.
- New currencies/materials for evolution.
- Gold/hoard reward scaling mechanics.
- Venom/curse/freeze/void tick/status systems.
- Ultimates, rage meters, world bosses, city raids, Ancient questlines.
- Any monetization, ad, red-dot, or paid-pack pressure attached to evolution.

Reason: the current evidence says first-session readability, activity density, and emotional payoff are the player problem. Deep branch systems will help retention later, but implementing them before the loop is readable risks complexity without delight.

## Decision gates for future implementation

Before adding mechanical branch effects, require:

1. Phone proof that the Fire adventure/combat surface is readable and emotionally promising.
2. A testable route/combat/stat surface where HP, enemy HP, skill picks, and info button are visible.
3. A scoped branch implementation plan naming exact files and save-compatibility behavior.
4. A no-balance-change plan or an explicit Aurelith + Logan-approved balance change with evidence.
5. Reduced Motion handling for any evolution ceremony, branch seal, or battle feedback effect.

## Aurelith recommendation

Proceed with evolution as a previewable identity map, not as a full mechanic build-out. The next useful implementation is a Fire-first Drake preview/aspiration surface only after the focused Fire adventure/combat slice is stable enough that the player has a reason to care about reaching Drake.

Player problem solved: this turns evolution from an abstract future stat gate into a visible promise that `my little dragon can become my kind of dragon`.

Tradeoff: retention and delight improve through aspiration, while immediate complexity is contained by parking deep mechanics until iPhone evidence proves the core loop earns attention.
