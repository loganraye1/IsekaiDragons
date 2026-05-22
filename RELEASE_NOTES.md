# Isekai Dragons Release Notes

## v0.1.0-alpha

Locked baseline for the first real-device playtest pass. This build is a vertical slice, not a content-complete game.

### Core Gameplay Loop

- Choose an elemental dragon path, hatch the egg, and progress through Hatchling, Drake, Dragon, and Wyrm stages.
- Tap the dragon for Essence, buy idle upgrades, and collect passive Essence per second.
- Auto adventure progresses quests, battles enemies, advances areas, and grants loot.
- Loot includes treasures and equipment with passive bonuses.
- Evolution branch choices add permanent identity bonuses.
- Rebirth is visible but locked until Wyrm, then resets progress for Dragon Souls.
- Onboarding, daily login rewards, achievements, daily goals, Settings, save import/export, and dev balance tools are included.

### Current Balance Targets

- Balance version: `0.1.0`.
- First 15-minute target is stable enough for MVP testing.
- Expected 15-minute result: Drake, Ember Woods, about 8-12 defeated enemies, 1 treasure, 0-1 equipment, EPS around 30-80, and Rebirth locked.
- Latest deterministic reducer check landed at Drake, Ember Woods, 8 defeats, 1 treasure, 0 equipment, 48.3 EPS, and Rebirth locked.

### Known Limitations

- Hatchling dragon art is production-approved for Fire, Water, and Earth; later evolution stages are still pending.
- Non-hatchling art direction is still mixed and placeholder-heavy.
- Music and SFX hooks exist, but no final audio pass has been completed.
- Some animations and transitions need real-device feel testing.
- Balance has only been validated through deterministic reducer tests, not broad player testing.
- Web preview can be limited by Expo/Lottie dependency behavior; iPhone/Expo Go is the primary test path.

### Placeholder Systems And Art

- Drake, Dragon, Wyrm, egg, enemy, treasure, and equipment visuals should be replaced with cohesive production art.
- Approved hatchlings should be used as the continuity reference for all future dragon evolution art.
- Lottie-ready effect hooks are present, but final effect assets are not locked.
- Equipment icons and treasure presentation are functional placeholders.

### Frozen Balance Rules

- Do not tune early-game balance during the art/audio polish pass.
- Do not add new mechanics before real-device testing.
- Only revisit balance after real iPhone playtests show repeated problems.
- Keep `BALANCE_VERSION` at `0.1.0` until a deliberate balance revision is made.

### Planned Polish Roadmap

- Replace placeholder art with cohesive dragon, background, loot, and equipment art.
- Add ambient music and core SFX for tap, upgrade, evolve, loot, gear drop, and Rebirth.
- Smooth evolution transitions and add stronger stage-change presentation.
- Add subtle background parallax and visual depth.
- Test on a real iPhone for touch feel, readability, haptics, battery/performance, and idle timing.
- Record a short gameplay clip or GIF.
- Get 3-5 people to play the first 15 minutes before adding more systems.
