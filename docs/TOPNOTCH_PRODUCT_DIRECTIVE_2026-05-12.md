# Topnotch Product Directive — 2026-05-12

Source: Discord thread feedback from Topnotch.

## Priority Order

1. Combat feel
2. Adventure path
3. UI polish
4. Monetization/events
5. Stats/skills
6. Evolution map
7. Art direction

## Permission Level

- Bold structural changes are allowed.
- Prefer substantive, visible improvements over conservative polish when the tradeoff matters.

## Capybara Go Reference Guardrail

- Use Capybara Go as a structural/product reference, not as a source to copy assets, layouts, copy, icons, or protected expression.
- Safe pattern: extract mechanics and UX principles, then re-skin/recompose them around original dragon fantasy.
- Good references to study: adventure path cadence, combat readability, skill-choice pacing, equipment/stat readability, event loops, progression pressure.

## Fantasy Direction

- Cute-to-epic dragon growth: yes.
- Tone: epic fantasy.
- Pokémon-like elemental evolution: yes.
- D&D-style ancient dragon endgame: yes.
- Kaiju / monster-raising feel: yes.
- Genre lean: more roguelite than idle RPG.
- Idle rewards are acceptable, but no tapping-for-rewards loop.
- Hard no: do not let the game become an idle incremental game.

## Starter Dragon Direction

- Fire should be the first fully fleshed-out starter path.
- Water, Earth, Light, and Dark can be iterated after Fire establishes the model.

## Reference Layout Notes — Home Screen

Topnotch likes the attached Capybara Go-style home layout as a reference. Extract the reusable layout principles without copying exact assets, icons, text, or protected visual expression.

Reusable principles:

- A large illustrated world/hub background that makes the home screen feel like a living place, not a menu.
- The player's main creature/dragon should be large and centered as the emotional anchor.
- Persistent top resource/status bar with profile, stamina/energy, premium currency, gold/coins, and power/combat rating.
- Strong central progression CTA near the bottom/middle, equivalent to a large “Start Adventure” button.
- Bottom navigation for major systems, with Adventure visually emphasized as the primary tab.
- Left and right vertical side rails for events/offers/limited-time systems, but avoid overwhelming the core dragon/adventure focus.
- Badge/exclamation notification language for available actions and claims.
- Current stage/location label near the upper center, with best/longest progress as a retention/status flex.
- Dragon version should use original fantasy hub theming: roost, hoard, forge, hatchery, elemental shrines, airship/portal, ancient ruins, guild hall.

## Reference Layout Notes — Adventure Path

Topnotch likes the attached adventure path screen as a reference. Extract the reusable layout/UX principles without copying exact assets, icons, text, or protected visual expression.

Reusable principles:

- Top horizontal path/progress strip showing current day/stop, next encounters, mystery nodes, and boss endpoint.
- Large character/dragon scene area in the upper half for immediate fantasy payoff.
- Party/companions can appear beside or behind the main dragon, but the dragon remains the hero.
- Compact stat strip between scene and narrative: EXP/level, HP, ATK, DEF, and later key combat stats.
- Narrative card stack below the scene that explains where the player is and what decision is available.
- Clear primary CTA for the next action, e.g. “Choose Skill,” “Enter Battle,” “Claim Hoard,” or “Advance.”
- Side buttons can track major/minor fortune/event counters, but Isekai Dragons should theme these as dragon-specific choices such as Major Omen, Minor Omen, Hoard Chance, Ancient Relic, Elemental Trial.
- The adventure loop should feel roguelite: choose a route/skill/reward, resolve encounters, build a run, reach a boss. It should not become idle incremental tapping.

## Reference Layout Notes — Skill Selection

Topnotch likes the attached skill selection screen as a reference. Extract the reusable skill-choice clarity without copying exact assets, icons, text, or protected visual expression.

Reusable principles:

- Skill selection should appear as a focused modal/overlay on top of the current adventure/battle context, with the background dimmed but still visible.
- The header should be oversized and instantly readable, e.g. “Choose Skill,” “Choose Dragon Trait,” or “Choose Flame Mutation.”
- A large character/dragon flourish at the top can make the choice moment feel celebratory, but should use original dragon art and animations.
- Present three large selectable skill cards in a vertical stack for thumb-friendly mobile reading.
- Each card should include rarity, icon, skill name, and a one-sentence effect.
- Important keywords should be color-highlighted, e.g. Burn, Block, Crit, Dodge, Shield, Execute, Hatchling, Drake, Hoard, Rage, Fire Strike.
- The cards should make mechanical impact obvious in plain language: “Fire Breath hits all enemies,” “Gain +18% Block,” “Crits ignite Burn,” etc.
- Include a limited reroll/refresh button with clear remaining count. Theme it as Reroll Fate, Consult the Hoard, Dragon Omen, or Reforge Choices.
- Include a Skills/Codex button so players can inspect their current build before choosing.
- The choice should support roguelite run-building: pick one, alter the run, then continue. It should not be a passive idle-upgrade claim.
- Fire starter path should get the first polished skill set: Burn stacking, Fire Breath upgrades, Rage ignition, ash armor/block, crit-to-burn, execute at low HP, hoard-fueled flame relic synergies.

## Reference Layout Notes — Shop / Monetization

Topnotch likes the attached shop menu as a reference. Extract the reusable store clarity and offer hierarchy without copying exact assets, icons, text, pricing, or protected visual expression.

Reusable principles:

- Keep the persistent top resource bar visible in shop screens so players always understand currencies and where purchases apply.
- Use large horizontal offer panels with clear title, reward icons, quantity labels, value callout, and one obvious purchase CTA.
- Segment the shop into readable sections such as Chapter Pack, Limited Chest, Current Rate-Up, Value Picks, Pack Shop, Top-Up, and Treasure/Hoard.
- Chapter/progression packs should be tied to adventure progress, but Isekai Dragons should theme them as Dragon Chapter Packs, Drake Milestone Packs, Ancient Trial Packs, or Fire Path Packs.
- Limited chest/gacha-like offers should show transparent pity/progress information, e.g. progress bar toward guaranteed choice/reward.
- Rate-up section should show the currently featured equipment/relics as a horizontal row, with rarity labels and a countdown timer.
- Purchase buttons should clearly distinguish single draw/open vs multi draw/open and show required currency counts.
- Use badges/exclamation marks only for meaningful availability: free claim, new offer, expiring timer, enough currency, guaranteed reward ready. Avoid notification spam.
- Bottom shop tabs should make monetization categories obvious and thumb-friendly.
- Dragon-themed adaptations: Hoard Shop, Relic Hoard, Hatchery Offers, Forge Packs, Ancient Relic Rate-Up, Elemental Shrine Top-Up, Fire Path Pack.
- Monetization should support the roguelite dragon fantasy and progression clarity, not push the game toward idle-incremental habits or tapping loops.
- For early implementation, prioritize UI structure and placeholder economy clarity before real-money logic.

## Reference Layout Notes — Equipment / Loadout

Topnotch likes the attached equipment menu as a reference. Extract the reusable loadout clarity and upgrade flow without copying exact assets, icons, text, or protected visual expression.

Reusable principles:

- Keep the top resource/status bar persistent so equipment upgrades feel connected to currencies and progression.
- Make the dragon/hero large in the center as the visual payoff for gear changes.
- Place equipped item slots around the character so players can understand the full build at a glance.
- Each equipped slot should show category icon, rarity color, level, star/gem sockets, enhancement tier, and upgrade-ready badge where relevant.
- Support named loadouts so players can swap builds later, e.g. Fire Breath Build, Tank Drake Build, Crit Burn Build, Hoard Farmer.
- Show the total power/combat rating near the character, with core stat strips beneath: HP, ATK, DEF first; later add Block, Dodge, Crit, Crit Damage, Speed, Burn Power, Skill Damage.
- Provide category tabs for dragon progression systems, adapted as Dragon, Companions, Relics, Mounts, Artifacts, Specialization, Hoard.
- Separate equipment from gems/runes so the player understands item gear vs socket upgrades.
- Inventory grid should use large readable cards with rarity color, category icon, level, duplicate/enhancement count, lock/protection state, and upgrade/merge indicators.
- Include clear management actions: Sort by Quality, Dismantle, Workshop/Forge. For Isekai Dragons theme these as Sort Hoard, Smelt, Forge, Reforge, Infuse Gem.
- Badge/exclamation marks should mean actionable upgrades only: better item, enough materials, new slot unlocked, merge available, socket available.
- Early implementation should prioritize readable equipment structure and visible stat impact over deep item economy.
- Fire path equipment fantasy should include claws, scales/armor, horn/crown, ember core, wing mantle, flame relic, hoard trinket, and ash-forged gear.

## Reference Layout Notes — Skill Tree / Specialization

Topnotch likes the attached skill tree/specialization screen as a reference. Extract the reusable progression clarity without copying exact assets, icons, labels, or protected visual expression.

Reusable principles:

- Show specialization paths as large character/class nodes arranged around a central upgrade/action node.
- Make the currently active specialization unmistakable with a strong “Active” label, glow, or highlighted base.
- Each specialization node should show name, portrait/icon, level marker, and actionable badge when upgrades or changes are available.
- Include swap/change controls beneath inactive nodes so players understand builds can be switched.
- Keep a persistent resource bar at the top for upgrade currencies and premium currencies.
- Include a help button for explaining specialization rules and a legacy/history button for inherited/account-wide bonuses.
- Use a “new world/content available” prompt sparingly for unlocked adventure regions or evolution tiers.
- Bottom panel should summarize the selected upgrade in plain language: upgrade name, level, progress count, stat effect, timer if applicable, and a clear CTA.
- If timed enhancements exist, they should feel like strategic training/research/rituals, not idle tapping. Speed-up should be optional and transparent.
- Bottom navigation should keep specialization as one major progression pillar alongside shop/equipment/adventure/treasure.
- Dragon-themed adaptation: replace generic classes with dragon bloodlines, stances, or evolution disciplines such as Flame Tyrant, Ash Warden, Hoard Lord, Storm Wing, Venom Fang, Sunscale, Night Terror.
- Fire path first: initial specialization set should support readable build identities such as Burn DPS, Tank/Block Drake, Crit Igniter, Fire Breath Caster, Hoard Relic Scaling.
- Skill tree upgrades should produce visible combat differences, not just tiny hidden percentage increases.

## Reference Layout Notes — Detailed Skill Tree

Topnotch likes the attached detailed skill tree screen as a reference. Extract the reusable branching/tree clarity without copying exact assets, icons, labels, or protected visual expression.

Reusable principles:

- Use a scrollable branching node map with clear connector paths so players understand prerequisites and future goals.
- Mix small stat nodes with larger build-defining active/passive nodes.
- Small nodes should clearly communicate stat category and progress count, e.g. HP 10/10, ATK 5/5, DEF 5/5.
- Major nodes should have larger frames, names, ranks/tiers, progress counts, and a stronger visual treatment.
- Connector paths should visibly distinguish unlocked/completed, available, and locked routes.
- Selecting any node should update a bottom detail panel with the current enhancement, level, progress, stat effect, time/cost if applicable, and one clear CTA.
- Time-based upgrades can exist as training/ritual/research, but should not turn into tap-to-idle progression. Speed-up should be optional and transparent.
- Dragon-themed adaptation: Fire Breath branch, Ash Armor branch, Ember Heart branch, Hoard Instinct branch, Wing Speed branch, Ancient Bloodline branch.
- Fire path first should include early nodes for HP/ATK/DEF readability, then major nodes like Fire Breath, Burn Mastery, Ash Shield, Crit Ignition, Inferno Execute.
- Skill-tree upgrades should produce visible combat changes and unlock new battle animations where possible.

## Reference Layout Notes — Chest / Reward Opening

Topnotch likes the attached chest menu as a reference. Extract the reusable reward-opening clarity without copying exact assets, icons, text, rates, or protected visual expression.

Reusable principles:

- Keep the persistent resource bar visible so chest opening feels connected to currencies and inventory.
- Use a large central chest/reward object on a pedestal or stage to make opening feel ceremonial.
- Top progress/pity bar should clearly show points earned, points needed, and the next guaranteed/claimable reward.
- Chest info panel should state chest name, reward categories, and approximate rates/rarities in plain language.
- Include an info/help button near the rates for transparency.
- Show inactive/locked chest state clearly when a chest type cannot currently be claimed or opened.
- Primary CTA should be large and singular: Open x1, Open x10, Claim Hoard, Hatch Relic, etc.
- Chest carousel should show all chest types, owned quantities, selected state, and meaningful badges.
- Dragon-themed adaptation: Wood Hoard, Silver Hoard, Gold Hoard, Beast/Companion Hoard, Amethyst Relic Hoard, Ancient Dragon Hoard, Fire Shrine Cache.
- Reward opening should support adventure/combat/equipment progression and not become the primary idle-incremental loop.
- If rates or pity exist, they should be transparent and readable from the same screen.

## Reference Layout Notes — 4x Combat Video

Topnotch provided a 19.35s, 60fps combat video at 4x speed as a combat feel reference. Extract reusable pacing/readability principles without copying exact assets, animations, UI text, or protected visual expression.

Reusable principles:

- Combat should remain readable at high speed: big sprites, simple lanes, clear side-vs-side staging, and minimal camera confusion.
- The battlefield should occupy the top half with large hero/dragon/enemy silhouettes; narrative/progression cards can remain below but should not steal attention during battle.
- Keep a compact top route/progress strip visible during battle so the player knows the current day/encounter/next nodes.
- Use a persistent bottom stat/resource strip for EXP/level, HP, ATK, DEF/currency, but keep it compact enough that the battlefield stays dominant.
- Include obvious speed controls such as x1/x2/x4 and auto/progress controls. High speed should accelerate timing without hiding critical outcomes.
- Start-of-fight callouts such as “First move!” help explain initiative/speed.
- Round labels such as Round 1/15, Round 2/15 help orient fast auto-combat.
- Hits, crits, skill names, and damage numbers should be large, color-coded, and positioned near the impact point.
- Skill activations should get readable name callouts before/with the effect, e.g. Fire Breath, Ember Aegis, Afterimage Dive, Overheat Fang.
- Effects should use short, punchy impact windows: shield bubble, arc slash, impact flash, hit spark, burn burst, poison cloud, coin/loot burst.
- Rewards should resolve quickly after victory with a clear recap card and a single next-step CTA, e.g. Next Day / Continue Adventure.
- For Isekai Dragons, implement this as fast readable dragon auto-combat: large dragon and enemy sprites, attack/counterattack cadence, visible HP drops, crit/block/dodge/burn callouts, skill-trigger labels, and reduced-motion-safe alternatives.
- Priority implementation targets: 4x battle timing support, combat event log-to-visual callouts, round/initiative labels, speed control, larger damage numbers, reward recap, and deterministic automated proof that callouts appear for crit/block/dodge/skill/burn events.

## Reference Notes — Fire Dragon Evolution PDF

Topnotch provided `fire_dragon_evolution_reference.pdf` as Fire starter evolution direction. Use it as an original-art direction guide, not a source to copy exact images.

Reusable principles:

- Evolution should escalate silhouette, elemental intensity, and emotional fantasy from cute starter to ancient god-beast.
- Hatchling: cute starter creature energy, rounded silhouette, oversized expressive face/eyes, small ember tail/horn/flame motifs, approachable companion feel.
- Drake: adolescent/rebellious phase, leaner body, sharper claws/horns, faster/aggressive motion language, first clear combat identity.
- Young Dragon: heroic and combat-ready, full wings, stronger chest/core silhouette, balanced speed and power, readable adventurer/party-leader vibe.
- Dragon: legendary volcanic apex form, massive wingspan, thicker armor plates/scales, regal dominant posture, more intense flame/volcanic effects.
- Ancient Dragon: primordial god-beast scale, magma veins, colossal presence, mythic silhouette, ancient energy, less “pet” and more world-threatening legendary creature.
- Fire path implementation should preserve continuity across stages: same core color language and motif family, but each tier adds sharper shape language, larger scale, stronger elemental effects, and clearer combat role.
- Good mechanical pairing: Hatchling = basic Burn/Fire Spark; Drake = speed/crit aggression; Young Dragon = Fire Breath and balanced combat; Dragon = volcanic armor + inferno burst; Ancient = magma aura, battlefield-scale burn, mythic dominance.

## Current UI Critique — 2026-05-12 Screenshot

Topnotch flagged the current UI as feeling “a bit everywhere.” This is accurate and should be treated as a priority UI consolidation problem, not just polish.

Observed issues from the current phone screenshot:

- Too many surfaces compete at once: top identity bar, power/loot pills, run status, route rail, quest progress bubble, combat HUD, adventure board, preview node card, bottom nav, and partially hidden shop content.
- The battle/adventure scene lacks a single hero focus because cards overlap the dragon/enemy art and obscure the battlefield.
- Text overlaps or stacks poorly around quest progress / rewards, making the screen feel broken even if systems are working.
- The bottom navigation floats over active content and hides the next card/action, so the screen reads as unfinished.
- The visual language mixes cream cards, dark glass panels, cyan pills, yellow outlines, translucent bubbles, and heavy typography without a clear hierarchy.
- The route appears twice: as an in-scene travel rail and as a separate Adventure Board card, creating duplication.
- The current selected creature is Water in the screenshot, but Fire is the priority starter path; polish should focus on Fire first unless testing element switching.

Immediate UI direction:

- Consolidate into one primary screen mode at a time: Home, Adventure Run, Combat, Reward/Recap, Menu.
- For Adventure/Combat, make the battlefield the hero surface: large dragon/enemy, compact top route strip, compact battle HUD, one CTA/status line.
- Remove or collapse duplicate panels. If the in-scene route rail is visible, the separate Adventure Board should be a collapsed strip or secondary tab, not another large card.
- Move bottom nav out of content overlap using safe-area padding or hide it during focused run/combat screens.
- Reduce visible cards above the fold to 1–2 high-priority panels.
- Use one coherent card style per screen: either dark combat glass over art or light parchment cards, not both stacked in the same hero area.
- Fix text overlap before adding more content; readable hierarchy beats feature density.
- Next UI implementation target: a focused Capybara-style Adventure/Combat layout with compact top progress, large battlefield, readable combat callouts, and a bottom action/recap area that does not overlap navigation.

## Product / Architecture Operating Bar

Topnotch expects disciplined product and engineering framing, not just feature stitching.

Before building a major slice, answer:

- What player/product problem are we solving?
- How will we measure success in-game or through automation/evals?
- What are the explicit non-goals / things not to build?

Architecture guardrails:

- Design beyond “12-factor app” basics: account for LLM orchestration, vector/search layers, rate limits, retries, async workflows, and failure recovery where those systems enter the product/tooling.
- Keep architecture frugal: token cost, latency, memory, bundle size, generated artifacts, and operational overhead all count.
- Use TDD-style guardrails for nondeterministic systems: regression tests, prompt snapshots, deterministic artifacts, and eval frameworks are required proof surfaces, not nice-to-haves.
- Apply Well-Architected pillars even outside AWS: security, reliability, performance efficiency, cost optimization, and operational excellence.

## Working North Star

Capybara Go-style adventure readability + flashy turn combat + roguelite choices + original dragon evolution/build fantasy.

Every major change should be checked against:

- Does combat feel more readable, flashy, and consequential?
- Does the adventure path create clear forward momentum?
- Is the UI clearer and more satisfying?
- Do stats/skills visibly alter battle outcomes?
- Does it deepen the Fire dragon path first before spreading thinly across all elements?
- Does it avoid idle-incremental/tapping-for-rewards design?
