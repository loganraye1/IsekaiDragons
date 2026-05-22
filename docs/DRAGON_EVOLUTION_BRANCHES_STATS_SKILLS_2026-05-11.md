# Dragon Evolution Branches, Stats, and Skills

Date: 2026-05-11
Source: Topnotch direction in Dragonforge Discord
Status: Product/design proposal for implementation planning

## Confirmed Direction

The game should feel like a **cute hatchling growing into a mythical dragon**.

Adventure scale should evolve with the dragon:

1. **Hatchling** — dungeon crawling
   - Small, cute, scrappy.
   - Encounters feel like cave rooms, ruins, tunnels, mushroom grottos, underground shrines.
2. **Drake** — forest adventuring
   - More confident and mobile.
   - Encounters feel like wild trails, monster dens, bandit camps, ancient groves.
3. **Young Dragon** — raiding towns
   - Dragon fantasy becomes more dominant.
   - Encounters include guards, watchtowers, caravans, town squares, treasure houses.
4. **Dragon** — raiding cities
   - Large-scale fantasy threat.
   - Encounters include city gates, battlements, guild halls, royal vaults, mage towers.
5. **Ancient Dragon** — mythical domination
   - Endgame identity.
   - Encounters become kingdoms, sky citadels, divine temples, rival ancient dragons, world bosses.

## Evolution Timeline Targets

Evolution pacing should create long-term attachment without making early progression feel stalled.

- **Hatchling → Drake:** 2–4 hours
- **Drake → Young Dragon:** 3–7 days
- **Young Dragon → Dragon:** about 1 month
- **Dragon → Ancient Dragon:** 3–6 months

Design implication:

- Hatchling and Drake need frequent visible progress.
- Young Dragon is where build identity becomes serious.
- Dragon is the long midgame prestige goal.
- Ancient Dragon is aspirational/endgame and can support very rare materials, long quest chains, and seasonal progression.

## Battle Screen Direction

Battle chapters should focus almost entirely on combat.

Required battle screen elements:

- Dragon HP bar
- Enemy/boss HP bar
- Roguelike experience bar for the current chapter/run
- Level-up moment offering **3 skill choices**
- Skill choices from both:
  - general skill pool
  - evolution/element-specific skill pool
- Info button for:
  - current stat profile
  - selected skills
  - active passives/status effects
  - evolution branch identity

Recommended layout:

- Top: chapter/battle progress, enemy name/type, enemy HP
- Center: large battle scene with dragon and enemy taking most of the screen
- Bottom: dragon HP, roguelike XP bar, skill icons/status row
- Corner: compact info button, pause/settings/reduced-motion if needed

## Stat Model

Stats should be readable, impactful, and visually expressed in battle.

### Core Stats

- **HP** — survivability; visible as dragon health bar.
- **Attack** — base damage for claws, bite, tail, and many skills.
- **Defense** — flat/percent damage reduction; visible via smaller incoming numbers.
- **Speed** — turn frequency, attack cadence, and some dodge/initiative checks.

### Offensive Build Stats

- **Crit Chance** — chance for critical hit.
- **Crit Damage** — critical damage multiplier.
- **Combo Chance** — chance to add an extra hit after an attack.
- **Skill Damage** — boosts active/passive skill effects.
- **Breath Damage** — boosts elemental breath attacks.
- **Element Damage** — boosts fire/water/earth/light/dark effects.

### Defensive Build Stats

- **Block Chance** — chance to reduce incoming damage.
- **Block Power** — amount reduced when block triggers.
- **Dodge Chance** — chance to avoid an attack entirely.
- **Damage Reduction** — general percent mitigation.
- **Shield Power** — amount of temporary barrier gained from skills.
- **Healing Received** — improves healing effects.

### Proc / Identity Stats

- **Burn Chance / Burn Damage** — fire damage over time.
- **Soak Chance** — water debuff that increases lightning/frost/impact effects if those are added later.
- **Thorn Chance / Thorn Damage** — earth retaliation.
- **Radiance Chance** — light-triggered heal/crit/blind effects.
- **Curse Chance** — dark-triggered weakness/drain/execute effects.
- **Rage Generation** — fills ultimate meter faster.
- **Loot/Hoard Bonus** — gold/material/relic reward scaling.

## Visual Feedback Rules

Every important stat should show up in battle.

- Crit: bigger damage number, sharp flash, hit-stop, burst.
- Block: scale/shield flash, reduced incoming number, “BLOCK”.
- Dodge: wing hop/slide, miss text, enemy whiff animation.
- Speed: visibly faster attack cadence or initiative ticks.
- Combo: rapid second claw/bite hit with “COMBO”.
- Counter: tail swipe after enemy hit.
- Lifesteal/drain: green or purple healing number returning to dragon.
- Shield: visible temporary barrier on HP bar.
- Rage: glowing meter and dramatic ultimate trigger.
- Element procs: persistent icons/effects on enemies.

---

# Evolution Architecture

## Requested Branch Shape

Start with **5 egg elements**:

1. Fire
2. Water
3. Earth
4. Light
5. Dark

Each egg evolves as:

- Hatchling: 1 starting element identity
- Drake: choose 1 of 3 paths
- Young Dragon: each Drake path splits into 2 paths
- Dragon: each Young Dragon path splits into 2 paths
- Ancient Dragon: each Dragon path splits into 2 final paths

This creates:

- 5 Hatchlings
- 15 Drake paths
- 30 Young Dragon paths
- 60 Dragon paths
- 120 Ancient Dragon capstones

Implementation recommendation:

- Do **not** hand-build 120 fully unique systems immediately.
- Build a scalable tag system:
  - egg element
  - drake archetype
  - young specialization
  - dragon mastery
  - ancient capstone
- Let each tier add a small number of stats, skill tags, passives, and visual traits.
- This makes 120 end states possible without requiring 120 bespoke combat engines.

---

# Starting Eggs

## Fire Egg — Ember Hatchling

Fantasy: playful baby fire dragon learning to control flame.

Base stat lean:

- High Attack
- Medium HP
- Low Defense
- Medium Speed
- Early Burn Chance

Starter skills:

- **Spark Bite:** basic attack has a small chance to Burn.
- **Tiny Flame Breath:** breath attack deals fire damage to one enemy.
- **Warm Scales:** small resistance to damage while Burn is active on an enemy.

Early feel:

- Aggressive, flashy, slightly fragile.
- Best for players who like damage, explosions, and big crits.

## Water Egg — Tide Hatchling

Fantasy: cute slippery dragon with bubbles, mist, and healing water.

Base stat lean:

- Medium Attack
- High HP
- Medium Defense
- Medium Speed
- Early Healing/Soak utility

Starter skills:

- **Bubble Jet:** water hit with a chance to Soak.
- **Mist Mend:** small self-heal after several turns.
- **Slippery Scales:** tiny Dodge boost while above half HP.

Early feel:

- Durable, forgiving, sustain-oriented.
- Best for players who like healing, control, and safe progression.

## Earth Egg — Moss Hatchling

Fantasy: stout little dragon with stone scales, roots, and stubborn defense.

Base stat lean:

- Medium Attack
- High HP
- High Defense
- Low Speed
- Early Block/Thorns

Starter skills:

- **Pebble Slam:** earth hit with bonus damage if the dragon blocked recently.
- **Stone Snout:** chance to Block incoming damage.
- **Briar Scales:** blocked hits can return small thorn damage.

Early feel:

- Tanky, steady, chunky.
- Best for players who like shields, defense, and retaliation.

## Light Egg — Dawn Hatchling

Fantasy: radiant hatchling with holy sparkle, courage, and lucky bursts.

Base stat lean:

- Medium Attack
- Medium HP
- Medium Defense
- High Crit support
- Light healing/blind utility

Starter skills:

- **Gleam Claw:** attack with increased Crit Chance.
- **Guiding Glow:** small heal or shield after leveling up during a run.
- **Flashburst:** chance to Blind/interrupt an enemy attack.

Early feel:

- Heroic, lucky, clean, bursty-supportive.
- Best for players who like crits, clutch saves, and radiant effects.

## Dark Egg — Umbral Hatchling

Fantasy: mischievous shadow baby dragon that drains, curses, and hides.

Base stat lean:

- Medium Attack
- Medium HP
- Low Defense
- High Dodge/Drain potential
- Early Curse/Lifesteal

Starter skills:

- **Shadow Nibble:** small lifesteal attack.
- **Creeping Curse:** chance to reduce enemy Attack.
- **Fade Step:** small Dodge boost after taking damage.

Early feel:

- Sneaky, risky, snowbally.
- Best for players who like drain, curses, executes, and evasive builds.

---

# Drake Paths

Each hatchling should choose one of three Drake paths after roughly 2–4 hours.

Each Drake path should feel like the first real identity choice.

## Fire → Drake Paths

### 1. Flame Drake

Role: direct fire damage and Burn.

Stat lean:

- Attack +++
- Breath Damage ++
- Burn Chance ++
- Defense -

Signature passive:

- **Kindled Hunger:** Burned enemies take increased damage from bite/claw attacks.

Skill pool examples:

- **Flame Fan:** breath hits all enemies lightly.
- **Searing Bite:** bite refreshes Burn duration.
- **Ash Snack:** heal a little when a Burned enemy dies.

Young Dragon split:

- **Inferno Young Dragon:** Burn stacking and explosions.
- **Volcanic Young Dragon:** slower, heavier fire hits with armor melt.

### 2. Smoke Drake

Role: evasion, blind, dodge-counter.

Stat lean:

- Speed ++
- Dodge ++
- Crit Chance +
- HP -

Signature passive:

- **Smoke Veil:** after dodging, next attack has bonus Crit Chance.

Skill pool examples:

- **Cinder Dash:** dodge grants a small fire counter.
- **Blinding Smoke:** chance to make enemy attacks miss.
- **Backdraft:** dodging can trigger a weak breath attack.

Young Dragon split:

- **Ashen Young Dragon:** dodge, blind, evasive attrition.
- **Cinderfang Young Dragon:** dodge into crit/combo aggression.

### 3. Magma Drake

Role: bruiser, fire + earth durability.

Stat lean:

- HP ++
- Defense ++
- Attack +
- Speed -

Signature passive:

- **Molten Scales:** blocked hits can Burn the attacker.

Skill pool examples:

- **Lava Hide:** gain shield when applying Burn.
- **Molten Slam:** heavy attack that scales with Defense.
- **Cracked Ground:** chance to slow enemy Speed.

Young Dragon split:

- **Lava Young Dragon:** tanky Burn and shields.
- **Obsidian Young Dragon:** block, thorns, anti-crit armor.

## Water → Drake Paths

### 1. Tide Drake

Role: sustain and steady water damage.

Stat lean:

- HP ++
- Healing ++
- Breath Damage +
- Crit -

Signature passive:

- **Flow State:** every few turns, heal a small percent of missing HP.

Skill pool examples:

- **Tidal Breath:** water breath applies Soak.
- **Renewing Mist:** heal after level-up skill picks.
- **Undertow:** Soaked enemies lose Speed.

Young Dragon split:

- **River Young Dragon:** healing, cleansing, survivability.
- **Wavecrash Young Dragon:** water burst and knockback-style control.

### 2. Frost Drake

Role: shields, slow, freeze control.

Stat lean:

- Defense ++
- Shield Power ++
- Control ++
- Speed -

Signature passive:

- **Rime Guard:** gain shield when slowing or freezing an enemy.

Skill pool examples:

- **Frost Breath:** chance to Slow.
- **Ice Shell:** shield at battle start.
- **Shatter:** crits deal bonus damage to Slowed enemies.

Young Dragon split:

- **Glacier Young Dragon:** massive shields and freeze.
- **Hailstorm Young Dragon:** multi-hit frost shards and crit-shatter.

### 3. Mist Drake

Role: dodge, healing, evasive utility.

Stat lean:

- Dodge ++
- Speed ++
- Healing +
- Attack -

Signature passive:

- **Vapor Form:** first lethal hit in a run can leave the dragon at 1 HP with a mist shield. Long cooldown.

Skill pool examples:

- **Mist Step:** Dodge grants healing.
- **Fog Bank:** reduce enemy accuracy.
- **Hidden Current:** after dodging, next breath applies Soak.

Young Dragon split:

- **Cloud Young Dragon:** evasive support and blinds.
- **Mirage Young Dragon:** dodge into counter/crit illusions.

## Earth → Drake Paths

### 1. Stone Drake

Role: pure defense and block.

Stat lean:

- Defense +++
- Block Chance ++
- HP ++
- Speed --

Signature passive:

- **Stonewall:** block cannot reduce damage below a useful minimum, but always triggers a visible shield flash.

Skill pool examples:

- **Granite Guard:** increase Block Power.
- **Heavy Tail:** counterattack after blocking.
- **Fortify:** gain Defense each battle, capped for the run.

Young Dragon split:

- **Mountain Young Dragon:** maximum tank, shields, boss survival.
- **Ironhide Young Dragon:** block/counter specialist.

### 2. Thorn Drake

Role: retaliation and bleed/poison-like nature damage.

Stat lean:

- HP ++
- Thorn Damage ++
- Counter ++
- Speed -

Signature passive:

- **Briar Back:** enemies that hit the dragon take thorn damage.

Skill pool examples:

- **Root Snare:** chance to slow enemies after countering.
- **Bramble Armor:** thorns scale with Defense.
- **Splinter Bite:** attacks increase thorn damage taken by the target.

Young Dragon split:

- **Briar Young Dragon:** thorns, roots, attrition.
- **Venomroot Young Dragon:** poison/debuff hybrid.

### 3. Crystal Drake

Role: defense plus crit/reflection.

Stat lean:

- Defense ++
- Crit Damage ++
- Reflect +
- HP +

Signature passive:

- **Prism Scales:** blocked hits charge the next crit or breath.

Skill pool examples:

- **Crystal Spike:** crits pierce some Defense.
- **Prismatic Guard:** shield reflects a percent of damage.
- **Shard Burst:** shield break damages enemy.

Young Dragon split:

- **Gem Young Dragon:** crit/reflect hybrid.
- **Prism Young Dragon:** elemental amplification and skill damage.

## Light → Drake Paths

### 1. Dawn Drake

Role: healing, shields, safe progression.

Stat lean:

- Healing ++
- Shield Power ++
- HP +
- Attack -

Signature passive:

- **First Light:** once per battle, falling below 30% HP grants a shield and heal.

Skill pool examples:

- **Sunbeam:** light breath with bonus vs cursed/dark enemies.
- **Hope Spark:** heal when choosing a skill.
- **Radiant Guard:** shield improves Crit Chance briefly.

Young Dragon split:

- **Solar Young Dragon:** healing and radiant damage.
- **Guardian Young Dragon:** shields, protection, revive-lite effects.

### 2. Stormlight Drake

Role: crit, speed, radiant lightning.

Stat lean:

- Speed ++
- Crit Chance ++
- Combo +
- Defense -

Signature passive:

- **Flashpoint:** crits can trigger a small chain-light burst.

Skill pool examples:

- **Lightning Gleam:** crits deal bonus light damage.
- **Quick Halo:** Speed increases Crit Chance slightly.
- **Triple Spark:** combo hits build Radiance.

Young Dragon split:

- **Tempest Young Dragon:** speed/combo/lightning.
- **Star Young Dragon:** crit damage and radiant bursts.

### 3. Sacred Drake

Role: anti-dark, cleanse, boss resilience.

Stat lean:

- Defense +
- Healing +
- Skill Damage ++
- Crit +

Signature passive:

- **Consecration:** bosses deal slightly reduced damage while Radiance is active.

Skill pool examples:

- **Cleanse Flame:** remove a debuff and heal.
- **Judgment Bite:** bonus damage to elites/bosses.
- **Sacred Aura:** periodic shield pulse.

Young Dragon split:

- **Seraph Young Dragon:** cleanse, revive, radiant aura.
- **Judgment Young Dragon:** boss damage and execution thresholds.

## Dark → Drake Paths

### 1. Shadow Drake

Role: dodge, crit, stealth strikes.

Stat lean:

- Dodge ++
- Crit Chance ++
- Speed +
- Defense -

Signature passive:

- **From the Dark:** after dodging, next hit deals bonus dark damage.

Skill pool examples:

- **Night Slash:** crits apply Curse.
- **Fade:** gain Dodge after taking damage.
- **Ambush Bite:** first attack in battle has high Crit Chance.

Young Dragon split:

- **Night Young Dragon:** dodge/crit assassin.
- **Voidstep Young Dragon:** dodge/teleport/counter magic.

### 2. Blood Drake

Role: lifesteal, self-damage risk, drain.

Stat lean:

- Lifesteal +++
- Attack ++
- HP +
- Defense -

Signature passive:

- **Blood Feast:** overhealing can become a temporary shield.

Skill pool examples:

- **Drain Bite:** lifesteal attack.
- **Crimson Pact:** spend HP for bonus damage.
- **Predator Rush:** killing an enemy grants Speed briefly.

Young Dragon split:

- **Vampiric Young Dragon:** heavy lifesteal and sustain.
- **Ravager Young Dragon:** high-risk self-damage burst.

### 3. Curse Drake

Role: debuffs, damage over time, execute.

Stat lean:

- Skill Damage ++
- Curse Chance ++
- Boss Control +
- Speed -

Signature passive:

- **Hex Mark:** cursed enemies take increasing damage from repeated hits.

Skill pool examples:

- **Weakening Hex:** reduce enemy Attack.
- **Doom Whisper:** low-health enemies take bonus damage.
- **Soul Tax:** enemies lose HP when they buff or attack.

Young Dragon split:

- **Hex Young Dragon:** layered curses and debuffs.
- **Reaper Young Dragon:** execute thresholds and soul gain.

---

# Young Dragon, Dragon, and Ancient Structure

Because the full tree reaches 120 ancient endings, use a repeatable specialization model.

Each **Drake path** splits into two **Young Dragon** paths:

- One path should intensify the obvious fantasy.
- One path should hybridize or twist it.

Each **Young Dragon** splits into two **Dragon** paths:

- One path should be reliable/scaling.
- One path should be explosive/risky/specialized.

Each **Dragon** splits into two **Ancient Dragon** capstones:

- One path should be the majestic/mythic mastery version.
- One path should be the dangerous/legendary/forbidden version.

## Example Full Branches

### Fire Example: Flame Drake → Inferno Young Dragon

Dragon split:

1. **Wildfire Dragon**
   - Build: spreading Burn, multi-enemy fights, mob clearing.
   - Stats: Burn Damage, Combo, Breath Damage.
   - Skills:
     - **Wildfire Spread:** Burn can jump to another enemy.
     - **Kindling Combo:** combo hits deal bonus damage to Burning enemies.

   Ancient split:
   - **Ancient Phoenixfire Dragon**
     - Safer capstone: Burn heals the dragon slightly when enemies fall.
     - Theme: rebirth, radiant flame, survivability.
   - **Ancient Worldfire Dragon**
     - Dangerous capstone: Burn can stack very high and explode, but defensive stats are lower.
     - Theme: apocalypse flame.

2. **Hellflare Dragon**
   - Build: huge breath attacks and boss melting.
   - Stats: Breath Damage, Crit Damage, Rage Generation.
   - Skills:
     - **Hellflare Breath:** ultimate breath consumes Burn stacks for burst damage.
     - **Furnace Heart:** rage fills faster while enemies are Burning.

   Ancient split:
   - **Ancient Sun-Eater Dragon**
     - Mythic mastery: massive breath, self-shield after ultimate.
   - **Ancient Calamity Dragon**
     - Forbidden mastery: extreme boss damage, self-overheat risk.

### Water Example: Frost Drake → Glacier Young Dragon

Dragon split:

1. **Icewall Dragon**
   - Build: shields, freeze, boss survival.
   - Stats: Shield Power, Defense, Freeze Chance.
   - Skills:
     - **Glacier Wall:** shield grows when enemy is slowed.
     - **Permafrost:** freeze lasts longer on elites/bosses, but at reduced strength.

   Ancient split:
   - **Ancient Crown-Glacier Dragon**
     - Mythic mastery: nearly unbreakable shield cycles.
   - **Ancient Absolute-Zero Dragon**
     - Forbidden mastery: freeze-control focus with lower damage.

2. **Shatterstorm Dragon**
   - Build: frost crits and shard explosions.
   - Stats: Crit Chance, Crit Damage, Skill Damage.
   - Skills:
     - **Shatter Crit:** crits against slowed enemies burst for AoE frost damage.
     - **Hail Barrage:** combo hits launch frost shards.

   Ancient split:
   - **Ancient Aurora Dragon**
     - Majestic mastery: balanced crits, shields, and visual spectacle.
   - **Ancient Whiteout Dragon**
     - Dangerous mastery: high crit storm, lower sustain.

### Earth Example: Stone Drake → Mountain Young Dragon

Dragon split:

1. **Titanhide Dragon**
   - Build: pure tank, block, boss endurance.
   - Stats: HP, Defense, Block Power.
   - Skills:
     - **Titanhide:** damage cannot exceed a percent of max HP from normal hits.
     - **Immovable:** blocking charges a heavy tail counter.

   Ancient split:
   - **Ancient Worldback Dragon**
     - Majestic mastery: enormous HP/Defense and team/companion protection later.
   - **Ancient Mountain-Eater Dragon**
     - Dangerous mastery: converts Defense into damage, slower but devastating.

2. **Quake Dragon**
   - Build: slow heavy hits, stun/interrupt, defense-scaling damage.
   - Stats: Defense, Attack, Counter.
   - Skills:
     - **Quake Stomp:** heavy hit can interrupt enemy action.
     - **Faultline:** every block increases next earth attack.

   Ancient split:
   - **Ancient Earthshaker Dragon**
     - Mythic mastery: reliable quake control.
   - **Ancient Cataclysm Dragon**
     - Forbidden mastery: huge delayed damage and self-slow.

### Light Example: Stormlight Drake → Tempest Young Dragon

Dragon split:

1. **Thunderhalo Dragon**
   - Build: speed, crit, chain light bursts.
   - Stats: Speed, Crit Chance, Combo.
   - Skills:
     - **Thunderhalo:** every third crit chains radiant lightning.
     - **Bright Tempo:** Speed increases roguelike XP gain slightly after battles.

   Ancient split:
   - **Ancient Starstorm Dragon**
     - Majestic mastery: radiant chain-lightning spectacle.
   - **Ancient Heavenpiercer Dragon**
     - Dangerous mastery: extreme crit burst, fragile if unlucky.

2. **Comet Dragon**
   - Build: huge crit damage and ultimate impacts.
   - Stats: Crit Damage, Rage Generation, Skill Damage.
   - Skills:
     - **Cometfall:** ultimate deals bonus damage based on crit stats.
     - **Radiant Impact:** crits build ultimate charge.

   Ancient split:
   - **Ancient Celestial Dragon**
     - Mythic mastery: balanced crit/rage/heal.
   - **Ancient Judgment Star Dragon**
     - Forbidden mastery: boss-execution light damage.

### Dark Example: Blood Drake → Vampiric Young Dragon

Dragon split:

1. **Nightfeast Dragon**
   - Build: lifesteal sustain, kill chaining.
   - Stats: Lifesteal, Attack, Speed.
   - Skills:
     - **Nightfeast:** kills grant temporary attack speed and healing.
     - **Blood Shield:** overhealing becomes shield.

   Ancient split:
   - **Ancient Crimson Moon Dragon**
     - Majestic/dark mastery: sustain monster with moonlit visuals.
   - **Ancient Devourer Dragon**
     - Forbidden mastery: execute and consume enemies for scaling power.

2. **Bloodrage Dragon**
   - Build: self-damage, rage, burst.
   - Stats: Attack, Rage Generation, Crit Damage.
   - Skills:
     - **Bloodrage:** spending HP grants rage.
     - **Ravenous Crit:** crits heal more when below half HP.

   Ancient split:
   - **Ancient Sanguine Dragon**
     - Mythic mastery: controlled blood magic, sustain/burst balance.
   - **Ancient Abyssal Hunger Dragon**
     - Dangerous mastery: extreme damage at low HP.

---

# General Roguelike Skill Pool

These can appear for any evolution path.

## Common Skills

- **Tough Scales:** +Max HP.
- **Sharpened Claws:** +Attack.
- **Guarded Stance:** +Defense.
- **Quick Wings:** +Speed.
- **Lucky Bite:** +Crit Chance.
- **Heavy Fangs:** +Crit Damage.
- **Second Swipe:** +Combo Chance.
- **Scale Block:** +Block Chance.
- **Wing Dodge:** +Dodge Chance.
- **Treasure Nose:** +Gold/loot from this run.

## Rare Skills

- **Rage Spark:** gain more ultimate meter.
- **Battle Snack:** heal after each fight.
- **Boss Grudge:** bonus damage to elites/bosses.
- **Finisher:** bonus damage to low-HP enemies.
- **Momentum:** winning quickly grants Speed for the next battle.
- **Thick Hide:** reduce all incoming damage by a small percent.
- **Veteran Instinct:** first hit in each battle has increased Crit Chance.

## Epic Skills

- **Dragon Fury:** unlock or enhance a temporary ultimate.
- **Hoard Fever:** rewards improve, but enemies hit slightly harder.
- **Last Stand:** below 30% HP, gain Attack and Defense.
- **Perfect Guard:** first block each battle negates extra damage.
- **Predator Chain:** defeating an enemy grants an immediate follow-up attack.
- **Elemental Awakening:** increases current evolution element effects.

---

# Element Skill Pools

## Fire Skills

- **Burning Breath:** breath applies Burn.
- **Wildfire:** Burn can spread.
- **Explosive Ash:** Burned enemies explode on death.
- **Molten Claws:** attacks against Burning enemies deal bonus damage.
- **Furnace Heart:** Burn ticks grant rage.

## Water Skills

- **Soaking Breath:** apply Soak.
- **Renewing Mist:** periodic healing.
- **Tidal Pull:** Soaked enemies lose Speed.
- **Bubble Shield:** gain shield after water skills.
- **Deep Current:** healing also boosts next attack.

## Earth Skills

- **Stone Guard:** increased Block Power.
- **Briar Scales:** attackers take thorn damage.
- **Root Snare:** chance to slow after being hit.
- **Quake Tail:** counterattacks can stun/interrupt.
- **Crystal Shell:** shield reflects damage.

## Light Skills

- **Radiant Claw:** increased Crit Chance.
- **Guiding Glow:** heal/shield after level-up.
- **Blinding Flash:** chance to make enemy miss.
- **Judgment:** bonus damage to elites/bosses.
- **Halo Burst:** crits create small radiant AoE.

## Dark Skills

- **Drain Bite:** lifesteal.
- **Creeping Curse:** reduce enemy Attack.
- **Fade Step:** Dodge after taking damage.
- **Soul Mark:** repeated hits increase damage taken.
- **Execute:** bonus damage to low-HP enemies.

---

# Recommended First Implementation Slice

Do not try to implement the full tree first.

First playable slice:

1. Five selectable eggs:
   - Fire, Water, Earth, Light, Dark
2. Hatchling battle screen focus:
   - dragon HP bar
   - enemy HP bar
   - roguelike XP bar
   - level-up 3-skill pick
   - info button for stats and selected skills
3. One Drake choice preview per element:
   - show the three future Drake paths, locked until evolution
4. First dungeon-crawling chapter theme:
   - rooms/fights/treasures/shrines/boss
5. Implement only enough stats to prove impact:
   - HP, Attack, Defense, Speed
   - Crit Chance, Crit Damage
   - Block Chance, Dodge Chance
   - one element proc per egg

Success criteria:

- Player understands their chosen egg identity within 2 minutes.
- Battles take most of the screen and feel active.
- Leveling during a run creates a clear 3-choice roguelike moment.
- Stats and skills selected are visible from the info button.
- The first Drake evolution preview makes the player want to keep playing.

## Open Design Questions

These can be answered later; implementation should not block on them yet.

- Should players own one dragon at a time or collect multiple dragons?
- Can eggs/evolution branches be changed later, or are they permanent per dragon?
- Should Ancient Dragon be one final choice or allow prestige into a new egg cycle?
- Should Light/Dark be rarer unlocks or equal starter eggs? Current direction says all five are starter eggs.
- Should skill choices be purely random, weighted by branch tags, or include rerolls?

## Implementation Guardrails

- Keep first build data-driven.
- Use tags for skills/evolutions instead of hardcoding every branch.
- Add automation that verifies:
  - five egg options exist
  - each egg has three Drake paths
  - battle screen exposes HP, XP, 3 skill choices, info button
  - stat profile includes the agreed stat names
  - skill picks are stored and visible
- Avoid adding monetization UI during this slice.
- Avoid hiding core battle behind map UI; battle is the main screen for chapters.
