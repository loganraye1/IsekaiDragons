# Isekai Dragons Art Board — Topnotch Review

Date: 2026-05-13
Owner: Topnotch / Dragonforge
Purpose: A practical art board and implementation guide for keeping Isekai Dragons visually consistent while we expand Fire into Water, Earth, Light, and Dark.

---

## 1. North Star

**Isekai Dragons should look like cute elemental hatchlings growing into mythic, kaiju-scale fantasy dragons through readable, crunchy evolution choices.**

The game can borrow Capybara Go's approachable adventure rhythm, but the art fantasy should not be “cute animal with numbers.” It should be:

> **My dragon is changing shape, gaining elemental identity, and becoming my legendary build.**

Every art decision should support one of these player reads:

1. **Companion attachment** — the dragon is cute, readable, and expressive.
2. **Element identity** — Fire, Water, Earth, Light, and Dark are recognizable at phone size.
3. **Evolution payoff** — every stage feels bigger, more confident, and more mythic.
4. **Build identity** — Guardian / Raider / Mystic-style choices are visible in silhouette, combat VFX, and stat feedback.
5. **Adventure fantasy** — the world scale grows from small dungeon paths to towns, cities, and mythic domination.

---

## 2. Global Style Rules

### Phone Readability

All dragon art must pass the **128px thumbnail test**:

- Face/eyes readable.
- Main horns/crest readable.
- Element motif readable.
- Limb count not confusing.
- Silhouette distinguishable from the prior stage.

If an image only works when viewed large, it is not ready for the game board.

### Creature Anatomy Rules

Use these as hard review checks after the hatchling/drake/young-dragon arm issue:

- Hatchling: cute compact body; **two visible forearms/claws** when posed front/three-quarter.
- Drake: four-limb read should be clear; if wings exist, they must not replace arms visually.
- Young Dragon: can have larger wings and longer body, but must not read as having an extra third arm.
- Dragon / Ancient: extra decorative spikes, wing fingers, and aura shapes are okay only if they do not look like accidental limbs.
- Contact sheets should be reviewed after generator changes, not just individual PNGs.

### No-Text Art Boards

Generated art should avoid baked-in labels/text. If a board needs labels, render them in Markdown, app UI, or design tooling. AI-generated text is too error-prone.

### VFX Hierarchy

Effects support the dragon; they do not cover the dragon.

Priority order:

1. Dragon face and pose.
2. Enemy / route objective.
3. Current combat or evolution effect.
4. Stat feedback text/badges.
5. Decorative atmosphere.

---

## 3. Evolution Stage Language

| Stage | Player Fantasy | Scale / Setting | Silhouette Goal | Art Notes |
|---|---|---|---|---|
| Egg | Mystery and choice | Den / shrine | Iconic shell, element cracks | Big readable element mark; no clutter. |
| Hatchling | Cute companion | Dungeon crawling | Round, expressive, small claws | Cute first. Element motif should be obvious but not overpowered. |
| Drake | First real build | Forest adventuring | Longer body, stronger legs, first crest/wing confidence | This is the first “my build changed” moment. |
| Young Dragon | Dominant monster | Raiding towns | Bigger wings, stronger neck, sharper role silhouette | Build identity becomes serious: tanky, aggressive, mystical. |
| Dragon | City-scale threat | Raiding cities | Large mature fantasy dragon | More majestic and dangerous; readable at battle-screen size. |
| Ancient | Mythic capstone | Kingdoms / gods / rival ancients | Colossal, legendary aura, iconic horns | Endgame aspirational form; should feel collectible and rare. |

---

## 4. Element Boards

## Fire — Ember / Flame / Smoke / Magma

**Core fantasy:** mischievous hatchling becoming an explosive, molten, or ash-cloaked dragon.

**Palette:** ember orange, hot yellow, soot red, charcoal black, molten gold.

**Shape language:** forward horns, flame tufts, jagged heat fins, ember tail, cracked lava plates for heavy builds.

**Combat VFX:** mouth-origin fire particles, ember spray, burn ticks, crit sparks, molten block flash.

**Route fantasy:** Ash Orchard, Cinder Slime Crossing, Ember Boar Charge, ruined fire gate, volcanic forest.

**Build branches:**

- **Flame / Raider:** pure burn tempo, crit pressure, fast damage spikes.
- **Smoke / Mystic:** evasive ash, ambush, dodge-afterimage, confusing enemy attacks.
- **Magma / Guardian:** armor, block, heavy hits, molten shield feedback.

**Current implementation status:** Fire is the reference slice. First 10-stop Fire Hatchling Trail is implemented as the default playtest route.

---

## Water — Tide / Frost / Mist

**Core fantasy:** gentle, dreamy hatchling becoming a graceful sustain/control dragon.

**Palette:** aqua, deep blue, white foam, pale cyan, moonlit teal.

**Shape language:** large flowing fins, soft whiskers, curved wave horns, smooth body, translucent fin edges.

**Combat VFX:** bubble stream, splash crescent, mist dodge, frost block, healing droplets returning to dragon.

**Route fantasy:** Tide Cavern, Moonwell pools, shell-stone bridge, drowned ruins, foggy river shrine.

**Build branches:**

- **Tide / Guardian:** sustain, healing, soak, safer progression.
- **Frost / Raider or control tank:** block/slow/freeze, sharp ice hits.
- **Mist / Mystic:** dodge, misdirection, evasive flow.

**Implementation target next:** Water should be the next non-Fire route because it contrasts Fire clearly and proves the system handles sustain/control fantasy.

**First route idea:** **Moonwell Tide Path**

1. Shell Cart Trader — shop choice: heal charm vs bubble attack charm.
2. Moonwell Ripple Shrine — shrine choice: sustain vs evolution spark.
3. Bubble Slime Ford — fight teaching splash/bubble VFX.
4. Pearl Cache — treasure / hoard payoff.
5. Driftwood Rest — camp choice: HP/heal vs dodge.
6. Frostback Boar — fight teaching block/slow.
7. Mist Lantern Peddler — shop.
8. Fog Mirror Shrine — choice previewing Tide/Frost/Mist.
9. Willow Wisp Reflection — fight with dodge/crit readouts.
10. Moonwell Gate Guardian — boss/evolution pressure.

---

## Earth — Stone / Thorn / Crystal

**Core fantasy:** stout, stubborn hatchling becoming a fortress, thorn beast, or crystal colossus.

**Palette:** moss green, warm brown, amber, stone gray, emerald crystal, gold dust.

**Shape language:** chunky shoulders, squat power stance, crystal plates, root-like horns, heavy paws.

**Combat VFX:** stomp shockwave, pebble arc, thorn counter, crystal shield, dust puff, heavy block badge.

**Route fantasy:** Stoneback Hills, moss tunnels, crystal quarry, root shrine, ancient earthworks.

**Build branches:**

- **Stone / Guardian:** defense, block, guard, shield wall.
- **Thorn / Raider:** counter, bleed/poison-thorn pressure, retaliation.
- **Crystal / Mystic:** scaling, prism shields, gem burst, controlled power.

**Implementation target:** Earth after Water. It proves defensive stats and counterplay feel impactful.

**First route idea:** **Stoneback Root Path**

1. Root-Market Trader — buy bark armor or claw stone.
2. Mossheart Shrine — HP/defense vs evolution.
3. Pebble Slime Hollow — fight teaching stomp impact.
4. Amber Nugget Cache — treasure.
5. Burrow Rest Camp — health/block choice.
6. Briarback Boar — fight teaching thorn/counter.
7. Crystal Mason — shop.
8. Prism Root Shrine — branch preview.
9. Ruin Wisp in Stone — fight with crystal flash.
10. Stoneback Gate Beast — boss/evolution pressure.

---

## Light — Dawn / Sacred / Stormlight

**Core fantasy:** radiant hatchling becoming a holy, solar, or celestial storm dragon.

**Palette:** warm white, gold, dawn pink, sky blue, star yellow, soft violet shadows.

**Shape language:** halo crests, feather-like light fins, clean elegant horns, sunburst tail/aura.

**Combat VFX:** radiant slash, healing flash, blind sparkle, solar crit, star-ring shield, lightning-light burst for Stormlight.

**Route fantasy:** Dawn Abbey, sky ruins, sunlit bridges, floating temple, celestial gate.

**Build branches:**

- **Dawn / Guardian:** healing, protection, renewal, safe scaling.
- **Sacred / Raider:** judgment, smite, high burst, holy crits.
- **Stormlight / Mystic:** speed, lightning, star tempo, initiative.

**Implementation target:** Light after Earth. It should feel heroic and premium, but avoid becoming generic angel art.

**First route idea:** **Dawnspire Pilgrimage**

1. Abbey Relic Trader — protection charm vs smite charm.
2. Sunscale Shrine — heal vs evolution.
3. Gleam Slime Steps — fight teaching radiant hit.
4. Star Coin Cache — treasure.
5. Cloud-Nest Rest — speed/heal choice.
6. Oath Boar Charge — fight with block/blind readout.
7. Halo Peddler — shop.
8. Stormlight Font — branch preview.
9. Wisp of Judgment — fight with crit/speed.
10. Dawnspire Gate Seraph — boss/evolution pressure.

---

## Dark — Shadow / Blood / Curse

**Core fantasy:** cute-but-spooky hatchling becoming a shadow, vampiric, or curse-wielding ancient monster.

**Palette:** deep purple, black-blue, crimson, ghost violet, silver moon, toxic magenta accents.

**Shape language:** crescent horns, shadow wisps, batlike wing edge, long tail, rune scars, subtle fangs.

**Combat VFX:** shadow blink, purple curse sigil, drain number returning to dragon, execute flash, blood-red crit slash.

**Route fantasy:** Void Nest, moon graveyard, cursed ruins, black market, eclipse shrine.

**Build branches:**

- **Shadow / Mystic:** dodge, stealth, voidstep, afterimage.
- **Blood / Raider:** lifesteal, crit, execute, risky damage.
- **Curse / Guardian/control:** weakness, mitigation through debuffs, hex shields.

**Implementation target:** Dark last of the four because it needs the strongest guardrails: spooky and powerful, but still cute-to-epic and not horror/gore.

**First route idea:** **Moonshadow Nest Path**

1. Black Lantern Trader — shadow charm vs fang charm.
2. Eclipse Shrine — drain vs evolution.
3. Gloom Slime Crossing — fight teaching shadow hit.
4. Moon Coin Cache — treasure.
5. Grave-Root Camp — lifesteal/defense choice.
6. Hollow Boar Charge — fight teaching dodge/drain.
7. Masked Peddler — shop.
8. Hex Mirror Shrine — branch preview.
9. Cursed Wisp — fight with curse/crit readouts.
10. Eclipse Gate Reaper — boss/evolution pressure.

---

## 5. Route Stop Grammar

Use the same stop structure for every element so implementation scales:

| Stop Type | Visual Icon | Gameplay Purpose | Art Direction |
|---|---|---|---|
| Shop | wagon / pouch / vendor creature | Small build choice | Vendor should match element biome. |
| Shrine | altar / rune / font | Evolution pressure or stat identity | Strongest branch-preview moment before boss. |
| Fight | enemy cutout | Combat readability | Enemy should reinforce the element route. |
| Treasure | cache / hoard / chest | Reward loop | Prefer dragon-hoard language over generic chest. |
| Camp | nest / lantern / rest spot | Safe stat choice | Cute dragon-care moment. |
| Elite | gate knight / miniboss | Skill draft / branch preview | Should feel like build identity test. |
| Boss | gate guardian | Evolution pressure | Big silhouette; route capstone. |

---

## 6. Battle VFX Cheat Sheet

| Stat / Event | Fire | Water | Earth | Light | Dark |
|---|---|---|---|---|---|
| Attack | ember bite | splash bite | stone claw | radiant slash | shadow claw |
| Crit | spark burst | water-pop spike | crystal crack flash | solar flare | crimson slash |
| Block | molten guard | ice shell | stone shield | star barrier | hex ward |
| Dodge | smoke step | mist slide | dust sidestep | light blink | shadowstep |
| Speed | flame dash | current surge | rolling charge | stormlight streak | void flicker |
| Skill Proc | burn tick | heal/soak | thorn/counter | blind/heal | drain/curse |

---

## 7. Implementation Order

Recommended order after Fire:

1. **Water** — proves sustain, healing, bubble/mist/frost contrast.
2. **Earth** — proves defense, block, counter, chunky silhouette.
3. **Light** — proves heroic/premium fantasy and speed/radiance.
4. **Dark** — proves spooky power fantasy with cute-to-epic guardrails.

For each element, implement in the same slice shape:

1. Create a 10-stop starter route using the route grammar above.
2. Add route brief copy so Topnotch can inspect what changed in-game.
3. Add/verify battle VFX language for that element.
4. Ensure evolution preview branches already map to the correct element/path names.
5. Add/update automation checks:
   - route defaults or selectable difficulty exists,
   - first ten nodes are element-themed,
   - fight/shop/shrine/camp/treasure mix is present,
   - build preview copy is visible,
   - typecheck and `test:auto` pass.
6. Generate/review a contact sheet for hatchling → drake → young dragon anatomy.

---

## 8. Current Asset Anchors

Existing placeholder/evolution assets are under:

- `assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/`
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/`
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/`
- `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/`
- contact sheets: `assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/*_path_contact_sheet.png`

Current generated placeholder tree covers:

- 15 Drake paths
- 30 Young Dragon paths
- 60 Dragon paths
- 120 Ancient Dragon capstones

Use these as production targets and branch-map placeholders, not final art.

---

## 9. Art Review Checklist

Before accepting an element pass, answer:

- Can I identify the element in 2 seconds?
- Can I identify the stage in 2 seconds?
- Does the silhouette feel meaningfully different from the prior stage?
- Does the dragon still feel cute-to-epic rather than generic monster art?
- Are arms/legs/wings readable, with no missing/extra limb confusion?
- Does the VFX start from the correct source: mouth, claw, stomp, shield, aura, etc.?
- Does the route feel like a dragon adventure, not a generic RPG board?
- Are labels handled by UI/docs rather than baked into generated art?
- Does Reduced Motion preserve the information without excessive movement?

---

## 10. Immediate Next Step

Use this document as the art/product board for the next implementation pass:

**Next slice: Water — Moonwell Tide Path**

Deliverable should include:

- 10-stop Water starter route.
- Water-focused route brief panel/copy.
- Water VFX/readability pass: bubbles, mist dodge, frost block, sustain/heal identity.
- Water contact-sheet review for hatchling → drake → young dragon anatomy.
- `npm run typecheck` PASS.
- `npm run test:auto` PASS.

After Water passes, repeat the same pattern for Earth, Light, and Dark.
