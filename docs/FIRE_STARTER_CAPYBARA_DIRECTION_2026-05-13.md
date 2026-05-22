# Fire Starter Capybara-Style Direction — 2026-05-13

## Decision

Proceed with a Capybara Go-inspired adventure loop, but make the identity **crunchy elemental dragon evolution**: each build choice should visibly change combat feedback, stat meaning, and eventual dragon form.

## Capybara Go benchmark lessons

Research sources reviewed:

- https://www.mumuplayer.com/blog/capybara-go-beginners-guide.html
- https://capybara-go.game-vault.net/wiki/Guide:Ultimate_Beginners_Guide
- https://www.ldcloud.net/blog/capybara-go-beginner-guide

Reusable loop:

1. Start an adventure/chapter.
2. Move through a sequence of clear stops.
3. Resolve fights, elites, treasure, healing, shops, and random events.
4. Offer temporary skill/build choices during the run.
5. Convert run rewards into permanent progression.
6. Retry stronger with clearer build identity.

What to adapt:

- Obvious next action at all times.
- Short auto-battle exchanges.
- Randomized event/skill moments.
- Strong reward recap and permanent upgrades.
- Multiple progression layers that unlock gradually.

What not to copy:

- Flat stat grind as the main fantasy.
- Aggressive monetization-first screen clutter.
- Static combat presentation where stats feel hidden.
- Evolution/talent systems that are mostly numeric.

## Dragon twist

The Fire starter should begin cute and readable, then become increasingly mythic:

1. Ember Egg
2. Fire Hatchling
3. Fire Drake
4. Young Fire Dragon
5. Fire Dragon
6. Ancient Solar Dragon

Each stage should eventually alter:

- Silhouette and pose.
- Breath/impact VFX.
- Preferred stat build.
- Skill draft options.
- Route event interactions.
- Boss/elite payoff copy.

## First visible implementation slice

Implemented first: **battle readability callouts** on the fight-only battle screen.

Why this slice:

- It makes ATK/DEF/block/dodge/crit/crit damage/speed easier to understand without retuning balance.
- It uses existing battle data and save state.
- It gives Topnotch a phone-visible proof point immediately.

Visible callouts now covered in battle:

- Fire Breath / Dragon Breath
- Burn Pressure
- Crit Spike
- Block Spark
- Dodge Afterimage
- Speed / First Move
- Heavy Hit Warning / Enemy Counter

## Art direction board

Best generated no-text board for direction:

https://v3b.fal.media/files/b/0a9a1164/8FP3MwkBIF2qvTEHPRO1z_OIpY68Aw.png

Use this as a silhouette/progression north star, not final production art. Labels should be rendered by the app UI rather than baked into generated images.

Earlier labeled board had useful layout, but generated text errors; do not use it as final UI.

## Verification

Commands run:

- `npm run typecheck` — PASS
- `npm run test:auto` — PASS
- `git diff --check -- App.tsx scripts/test-animation-visual.js` — PASS for tracked file checks
- `git diff --no-index --check /dev/null scripts/test-animation-visual.js` — PASS for untracked harness file whitespace

Generated proof artifact:

- `artifacts/test-run/latest/report.json`
