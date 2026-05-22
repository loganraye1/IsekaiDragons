# Drake Continuity Review Guide

Owner: Veyra  
Status: phone-test rubric for Fire / Water / Earth Drake validation  
Last updated: 2026-05-09

## Purpose

Validate the production-integrated Drake assets on a real phone before any Dragon or Wyrm stage generation begins.

The review target is simple:

> "Aww, they grew up."

A Drake passes only if it feels like the same companion matured from the approved hatchling, not a replacement monster with the same element.

## Evidence anchors

Use these files as the continuity baseline:

- Hatchlings: `assets/dragons/fire_hatchling.png`, `assets/dragons/water_hatchling.png`, `assets/dragons/earth_hatchling.png`
- Drakes: `assets/dragons/fire_drake.png`, `assets/dragons/water_drake.png`, `assets/dragons/earth_drake.png`
- Art bible: `docs/HATCHLING_ART_BIBLE.md`
- Dragon asset rules: `assets/dragons/README.md`
- Concept notes: `assets/dragons/concepts/README.md`
- Prior audit: `docs/ART_AUDIT_2026-05-09.md`

## Test setup

Run the Drake Continuity Review or equivalent dev-only comparison flow in Expo Go on the target phone.

Test each element in these conditions:

1. Hatchling visible at normal gameplay size.
2. Drake visible at normal gameplay size.
3. Hatchling and Drake compared close together, if the tool supports side-by-side review.
4. Aura / glow enabled.
5. Aura / glow disabled, if the tool supports it.
6. HUD visible.
7. HUD hidden or minimally obstructing, if available.
8. Low-brightness phone setting or dim-screen condition.
9. Idle motion active.
10. Motion visually frozen or observed during a still moment.
11. At least one neutral / default background.
12. Element-relevant background where available:
    - Fire: Ember Woods
    - Water: Tide Cavern
    - Earth: Stoneback Hills

If the exact review tool does not expose every toggle yet, record that as **Not available** rather than guessing.

## Global pass / fail criteria

### Pass

A Drake passes when all of these are true on phone:

- The dominant hatchling silhouette feature is still immediately recognizable.
- The emotional personality matured without being erased.
- The face and eyes remain readable at phone size.
- The posture language feels evolved from the hatchling.
- The element is readable without relying only on color.
- The Drake still feels companion-like, not enemy-like.
- Glow / aura does not cover the face or dominant silhouette.
- At 128px mental-thumbnail scale, the family resemblance remains clear.
- The first emotional reaction is closer to "they grew up" than "that is a new creature."

### Fail

A Drake fails if any of these happen:

- It reads as a replacement monster rather than the same companion matured.
- The dominant hatchling feature is missing, minimized, or visually overwhelmed.
- The face / eyes are hard to read on phone.
- Detail density creates noise at gameplay size.
- The emotional personality flips into a different character archetype.
- The silhouette becomes too similar to another element in grayscale / low brightness.
- Aura, lighting, or background contrast hides the identity read.
- The Drake looks more like an enemy, boss, mount, or generic fantasy dragon than the player's companion.

## Element rubrics

### Fire Drake

Continuity anchor: `assets/dragons/fire_hatchling.png` -> `assets/dragons/fire_drake.png`

Hatchling baseline:

- Dominant silhouette: forward-curving horns.
- Personality: restless, eager, mischievous, chaotic-cute.
- Emotional arc: chaotic ambition -> confident pride.

Pass criteria:

- Forward-curving horns remain the first or second silhouette read.
- Expression still suggests mischievous ambition, now with more confidence.
- Posture feels alert, eager, and slightly forward-driving.
- Fire energy supports the character without swallowing the face.
- The Drake feels proud and energetic, not cruel, demonic, or villainous.

Fail signals:

- Horns become generic spikes or disappear into flame noise.
- Face reads angry / hostile instead of chaotic-cute grown into pride.
- Body posture becomes too heavy, boss-like, or enemy-coded.
- Flame effects become the main read instead of the dragon.

Screenshot prompts:

- Fire hatchling normal gameplay size, aura on.
- Fire Drake normal gameplay size, aura on.
- Fire hatchling and Fire Drake comparison view, if available.
- Fire Drake on Ember Woods background.
- Fire Drake in low brightness / dim-screen condition.
- Fire Drake still frame where the horns and eyes are clearly visible.

Reviewer question:

> Does this feel like my chaotic little fire gremlin grew into a proud Drake?

### Water Drake

Continuity anchor: `assets/dragons/water_hatchling.png` -> `assets/dragons/water_drake.png`

Hatchling baseline:

- Dominant silhouette: large flowing fin silhouette.
- Personality: dreamy, drifting, soft, sleepy calm.
- Emotional arc: dreamy mysticism -> graceful wisdom.

Pass criteria:

- Flowing fin shapes remain the dominant silhouette feature.
- Expression and posture preserve gentle, sleepy mysticism while adding grace.
- Curves and fins feel fluid, not sharp or aggressive.
- Water / glow effects stay soft enough to keep eyes and face readable.
- The Drake feels wise and companionable, not serpentine-generic or sea-monster hostile.

Fail signals:

- Fins shrink into minor decoration or become unreadable at phone size.
- The Drake becomes too sleek, sharp, or predatory.
- The sleepy / dreamy identity is lost in favor of generic aquatic fantasy detail.
- Blue palette carries the element alone while silhouette no longer says Water.

Screenshot prompts:

- Water hatchling normal gameplay size, aura on.
- Water Drake normal gameplay size, aura on.
- Water hatchling and Water Drake comparison view, if available.
- Water Drake on Tide Cavern background.
- Water Drake in low brightness / dim-screen condition.
- Water Drake still frame where fins, eyes, and soft facial read are visible.

Reviewer question:

> Does this feel like my sleepy mystical water companion became graceful and wise?

### Earth Drake

Continuity anchor: `assets/dragons/earth_hatchling.png` -> `assets/dragons/earth_drake.png`

Hatchling baseline:

- Dominant silhouette: chunky crystal shoulder masses.
- Personality: grounded, sturdy, warm, protective.
- Emotional arc: stubborn comfort -> dependable protection.

Pass criteria:

- Crystal shoulder masses remain large, chunky, and readable.
- Proportions feel sturdy and grounded without becoming visually sluggish.
- Expression still has cozy stubbornness, matured into dependable protection.
- Rock / crystal detail is simplified enough for phone readability.
- The Drake feels like a guardian companion, not a golem, armored enemy, or unrelated beast.

Fail signals:

- Crystal shoulders become too small, too busy, or merge with background rocks.
- The face becomes hidden beneath armor / crystals.
- The silhouette becomes generic bulky dragon instead of Earth's specific chunky shoulder identity.
- Detail density makes it noisy at 128px / phone gameplay size.

Screenshot prompts:

- Earth hatchling normal gameplay size, aura on.
- Earth Drake normal gameplay size, aura on.
- Earth hatchling and Earth Drake comparison view, if available.
- Earth Drake on Stoneback Hills background.
- Earth Drake in low brightness / dim-screen condition.
- Earth Drake still frame where crystal shoulders, eyes, and protective posture are visible.

Reviewer question:

> Does this feel like my stubborn cozy Earth hatchling grew into a dependable guardian?

## Phone review scorecard

Use one row per element.

| Element | Dominant silhouette preserved? | Face readable? | Personality matured? | Element readable without color? | Companion feel? | Aura / HUD safe? | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Fire | Pass / Fail / NA | Pass / Fail / NA | Pass / Fail / NA | Pass / Fail / NA | Pass / Fail / NA | Pass / Fail / NA | Pass / Fail |
| Water | Pass / Fail / NA | Pass / Fail / NA | Pass / Fail / NA | Pass / Fail / NA | Pass / Fail / NA | Pass / Fail / NA | Pass / Fail |
| Earth | Pass / Fail / NA | Pass / Fail / NA | Pass / Fail / NA | Pass / Fail / NA | Pass / Fail / NA | Pass / Fail / NA | Pass / Fail |

A final element verdict should be **Fail** if any required category fails. Use **NA** only for unavailable tool states, not subjective uncertainty.

## Required screenshot package

For each element, capture at least these six screenshots:

1. Hatchling normal gameplay size.
2. Drake normal gameplay size.
3. Hatchling / Drake comparison, if available.
4. Drake with aura / glow enabled.
5. Drake on element-relevant background.
6. Drake in low-brightness or dim-screen condition.

Recommended filenames for review evidence:

- `fire_drake_review_01_hatchling.png`
- `fire_drake_review_02_drake.png`
- `fire_drake_review_03_compare.png`
- `fire_drake_review_04_aura.png`
- `fire_drake_review_05_ember_woods.png`
- `fire_drake_review_06_low_brightness.png`
- Repeat with `water_...` and `earth_...` prefixes.

## Decision rules

- If all three Drakes pass: approve the Drake stage as the current evolution baseline and proceed to Dragon-stage briefs.
- If one Drake fails: pause later-stage generation for that element and produce a targeted replacement brief.
- If two or more Drakes fail: pause all Dragon / Wyrm generation and revisit the Drake continuity art direction as a set.
- If the phone review tool is missing key states: file an implementation follow-up, but still judge available phone evidence.

## Final reviewer notes template

```md
## Drake Continuity Review Notes

Device:
Build / branch:
Date:
Reviewer:

### Fire
Verdict: Pass / Fail
Strongest continuity read:
Biggest risk:
Screenshot paths:
Decision:

### Water
Verdict: Pass / Fail
Strongest continuity read:
Biggest risk:
Screenshot paths:
Decision:

### Earth
Verdict: Pass / Fail
Strongest continuity read:
Biggest risk:
Screenshot paths:
Decision:

### Overall decision
Proceed to Dragon-stage briefs? Yes / No
Follow-up tasks:
```
