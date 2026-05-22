# Capybara Go Adaptation Product Brief

Date: 2026-05-11
Owner: Aurelith, Product / Game Design Strategist
Project phase: v0.1.0-alpha first-session adventure foundation

## Product Recommendation

Use Capybara Go as a pacing and structure reference, not as a feature checklist. The player problem to solve is that Isekai Dragons already has dragon growth, combat, loot, and progression, but the first session can fall into passive waiting before those systems feel like an adventure with a companion.

Recommendation: build the next slice around a visible dragon expedition path: the dragon moves from stop to stop, auto-battle resolves fights with readable feedback, the player occasionally chooses a temporary skill/reward, and the run pays back into permanent dragon growth. Keep the implementation thin enough to preserve Expo Go stability and save compatibility.

Evidence source:
- `docs/CAPYBARA_GO_DRAGON_WORKFLOW_2026-05-11.md` north-star loop and lane backlog.
- `docs/PRODUCT_REVIEW_2026-05-09.md` playtest interpretation: presentation/activity density is the issue; balance is not clean evidence.
- `memory/2026-05-11.md` Fire Breath validation notes: readable combat presentation matters, but effects must remain presentation-only until validated.
- `README.md` current 15-minute balance target: Drake, Ember Woods, 8-12 defeats, 1 treasure, 0-1 equipment, Rebirth locked.

## Mechanics to Adapt

### 1. Adventure path

Adapt: a short, visible path of route nodes that the dragon travels across during the early session.

Player problem solved: turns passive idle waiting into a readable journey: “my dragon is going somewhere and discovering things.”

Implementation shape:
- Route has a small fixed sequence for the first slice.
- Nodes use clear icons/labels: Fight, Treasure, Choice, Boss.
- Dragon position advances after each resolved stop.
- The path should be visible enough that the player understands progress without reading a guide.

Tradeoff:
- Retention and clarity improve because the session gains forward motion.
- Dev cost and UI complexity increase, so the first slice should use a tiny node set instead of a full procedural map.

### 2. Stops

Adapt: discrete stops that briefly interrupt travel and explain what happened.

Player problem solved: gives the first 5 minutes rhythm: anticipate, stop, resolve, collect, move on.

Implementation shape:
- Fight stop: uses current auto-battle/enemy surface.
- Treasure stop: grants a small visible reward using existing reward types.
- Choice stop: offers one constrained selection, preferably a temporary run skill.
- Boss stop: acts as the run endpoint for the first implementation slice.

Tradeoff:
- Delight and comprehension improve through clear beats.
- More stop types can sprawl quickly; avoid shop/camp/shrine/elite until the base path proves readable.

### 3. Auto-battle

Adapt: mostly automatic fight resolution, but present it as the dragon acting, not as a timer.

Player problem solved: keeps idle accessibility while making the dragon companion feel alive and brave.

Implementation shape:
- Continue using existing combat timing/math unless a later evidence gate approves changes.
- Show enemy name, HP, damage/hit feedback, defeated count, and a simple action label if validation supports it.
- Reduced Motion must preserve readable state changes without animation overload.

Tradeoff:
- Lower complexity than manual combat and preserves the idle-RPG promise.
- Risk: if feedback is too subtle, it still feels passive; if too busy, it overwhelms the phone screen.

### 4. Skill choices

Adapt: occasional 3-choice offers that create temporary run identity.

Player problem solved: gives the player a lightweight decision and makes repeat runs feel different.

Implementation shape for first slice:
- One choice event during the intro path.
- Choices should be thematically dragon-coded, e.g. Fire, Frost, Storm, Shadow, Gold, Ancient.
- First implementation can make the choice presentation-only or very lightly wired to existing feedback tags if engineering risk is high.
- Save permanent skill trees for later.

Tradeoff:
- Delight and replay interest improve.
- Complexity and balance risk rise if skills immediately affect math; start with low-risk presentation or clearly bounded modifiers only after approval.

### 5. Reward cadence

Adapt: frequent small rewards with visible payoff after stops.

Player problem solved: gives players a reason to keep watching the path and reinforces “my dragon is getting stronger.”

Implementation shape:
- Every stop should produce a tiny acknowledgement: defeat count, essence, treasure, equipment chance, or run progress.
- Boss completion should create a clear return/payoff moment.
- Rewards should use existing currencies/items where possible.

Tradeoff:
- Retention improves through a faster feedback loop.
- Too many rewards/currencies will damage clarity, so reward messages should be simple and tied to current systems.

### 6. Layered progression

Adapt: the idea that a run feeds longer-term growth, but expose only the layers the player can understand in the first session.

Player problem solved: connects short adventure action to the core fantasy of raising a dragon over time.

Implementation shape:
- First layer: route progress and immediate rewards.
- Second layer: dragon growth/evolution progress already present in the game.
- Later layers: relics, hoard, idle depth, evolution branches, and build identity.

Tradeoff:
- Long-term retention improves when players see both run and permanent goals.
- Clarity suffers if all layers are introduced at once.

## Mechanics to Simplify or Avoid

### Avoid monetization clutter

Do not adapt gacha-store density, ad prompts, paid packs, red-dot pressure, or offer clutter for v0.1.0-alpha.

Reason: the current player problem is not monetization or sink/source economy; it is first-session readability, activity density, and emotional attachment.

Tradeoff: sacrifices early monetization scaffolding, protects trust and clarity.

### Avoid too many currencies too early

Do not add separate adventure tokens, skill dust, shrine coins, boss medals, event tickets, or new upgrade materials in the first slice.

Reason: new currencies create UI and save complexity before the adventure loop has proven it earns attention.

Tradeoff: less progression depth now, much lower comprehension cost.

### Avoid opaque stat soup

Do not surface a large stat sheet or stack invisible modifiers before the player can see what stats do.

Reason: stats only matter when players can connect them to battle outcomes. Capybara-style stat depth should come after visible combat feedback makes ATK/DEF/block/dodge/crit/speed legible.

Tradeoff: slower path to crunchy builds, stronger foundation for meaningful future buildcraft.

### Avoid balance retunes from reference envy

Do not retune enemy HP, rewards, evolution costs, run length, or drop rates just because Capybara Go uses a different cadence.

Reason: current playtest data included skip-ahead behavior and is not clean balance evidence.

Tradeoff: pacing may remain imperfect for one slice, but the team avoids masking presentation problems with unproven math changes.

## First 5-Minute Player Target

By minute 5, a new player should be able to say:

1. “My dragon is traveling along an adventure path.”
2. “Stops mean something: fights, rewards, choices, and a boss.”
3. “Combat is mostly automatic, but I can see my dragon acting and enemies losing HP.”
4. “Choosing a skill changes the flavor of this run, even if the first version is simple.”
5. “Rewards from the run help my dragon grow toward evolution/stronger future attempts.”

Emotional target: the player should feel like they are raising a small dragon companion on its first dangerous expedition, not managing a spreadsheet or waiting for a timer.

## Next Implementable Slice

Next slice: Adventure Path Skeleton v1.

Smallest useful implementation:
- Add a visible first-run route with 6-8 nodes.
- Node mix: Start, Fight, Fight, Treasure, Choice, Fight, Boss, Return/Reward.
- Reuse existing auto-battle/enemy/reward state where possible.
- Add one temporary skill-choice stop with three dragon-flavored choices, but keep math effects deferred unless Pyraxis/Forgehand can prove a no-risk presentation-only implementation.
- End with a clear boss/return/payoff message.

Why this slice first: it solves the highest-priority player problem from the workflow: the first session needs to feel like an adventure before the team invests in deeper stats, relics, shops, or evolution branches.

## Acceptance Criteria for Adventure Path Skeleton v1

Player-facing criteria:
- The route is visible on phone without hiding the dragon companion or core action area.
- The dragon visibly advances between stops.
- Each stop type has a plain-language label and one clear outcome.
- Fight stops show enemy HP changing or defeat feedback through existing/presentation-only combat surfaces.
- Treasure stop produces a simple reward acknowledgement.
- Choice stop offers exactly three choices and records the selected run flavor for the current run display.
- Boss stop clearly reads as the endpoint of the path.
- Return/payoff message connects the run to dragon growth.

Technical/product criteria:
- Expo Go compatibility is preserved; no native-only dependency.
- Save compatibility is preserved, or any new state is optional/derived with a documented migration plan.
- No balance values are changed in `src/balance.ts` for the first slice.
- No new currencies are added.
- Reduced Motion has a readable static/low-motion route state.
- The implementation has an engineering proof gate: `npm run test:auto` if route logic tests exist or are added, `npm run typecheck`, and `git diff --check -- <changed files>`.
- A Caldrin validation packet asks whether the first 5 minutes now read as an adventure rather than a passive timer.

## Explicit Non-Goals

- No monetization systems, ads, shop offers, battle passes, daily deal surfaces, or red-dot pressure.
- No broad stat rebalance, reward rebalance, evolution cost changes, drop-rate changes, or enemy-scaling changes.
- No full procedural map generation.
- No shop/camp/shrine/elite/event deck until the basic route proves understandable.
- No permanent skill tree or relic system in the first slice.
- No new manual combat controls.
- No save-breaking schema changes without an explicit migration plan.
- No public marketing claims based on this prototype slice.

## Balance Guardrails

- Treat current v0.1.0 balance as frozen until repeated real-device evidence supports a specific change.
- Use Capybara Go for rhythm, not numbers.
- If a choice or skill needs a mechanical effect, prefer bounded, easily reversible presentation tags first; require Aurelith + Logan approval before math-affecting modifiers.
- Keep the first validation question qualitative: “Does this make the first minutes feel like a dragon adventure?” not “Are rewards tuned correctly?”
- Any future tuning proposal must name the playtest evidence source, affected values, expected player problem solved, and rollback plan.

## Handoff

Aurelith recommends handing the next slice to Forgehand/Caldrin before Pyraxis implementation:

1. Forgehand: map exact source files/types for Adventure Path Skeleton v1 and define the safest no-balance implementation seam.
2. Caldrin: convert this brief into a first-5-minute validation packet.
3. Pyraxis: implement only after the route data contract and proof gates are explicit.

Product decision: proceed with Adventure Path Skeleton v1 as the next implementable slice, constrained to visible route/stops/reward presentation and protected by no-balance/no-currency/no-monetization guardrails.
