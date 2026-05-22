# Caldrin Capybara-Style Adventure Validation Packet

Date: 2026-05-11
Owner: Caldrin
Milestone: v0.1.0-alpha real-device playtest readiness
Scope: validation criteria for the first adventure-path implementation slice before subjective feel work widens.

## Purpose

This packet gives Logan/Topnotch and Dragonforge a concrete gate for judging whether the new Capybara Go-inspired adventure path feels like a Dragon adventure, not a passive timer or a vague UI improvement.

It should be used after Pyraxis ships the first route/adventure path skeleton and before the crew expands into stat-impact tuning, skill drafting, evolutions, relics, monetization, or broader balance changes.

## Sources inspected

- `docs/DRAGONFORGE_OPERATING_INDEX.md`
- `docs/CREW_OPERATING_SYSTEM.md`
- `docs/agents/WORKSPACE.md`
- `docs/agents/CALDRIN_PROJECT_MANAGER.md`
- `docs/CAPYBARA_GO_DRAGON_WORKFLOW_2026-05-11.md`
- `docs/CAPYBARA_GO_PRODUCT_BRIEF_2026-05-11.md`
- `docs/FIRST_IPHONE_PLAYTEST_CHECKLIST.md`
- `MEMORY.md`
- `memory/2026-05-11.md`

## Guardrails for this validation

- Validate on iPhone through Expo Go when possible.
- Preserve balance freeze unless Aurelith + Logan approve evidence-based tuning later.
- Treat Capybara Go as a structural reference only; Dragon identity must remain centered on the dragon, element, hoard/reward fantasy, and readable first-session progression.
- Do not ask, “Is it better?” Ask what the player saw, understood, expected, and wanted next.
- Do not start the next scope lane from borderline/fail evidence. Convert the result into one tiny follow-up task with one owner.

## Setup before playtest

Use this packet for a focused 5-10 minute pass through the new adventure path slice.

Expected first-slice shape from Aurelith's product brief: a tiny visible route of 6-8 nodes, roughly Start → Fight → Fight → Treasure → Choice → Fight → Boss → Return/Reward, using existing auto-battle/reward surfaces where possible.

Tester conditions:

- Device: iPhone through Expo Go preferred.
- Save state: fresh save or reset progress if testing the first-session path.
- Settings: default motion first; repeat the most visually active route/fight moment with Reduced Motion enabled if animation is involved.
- Observer: note exact player words where possible. Do not paraphrase into “liked/disliked” only.

Minimum screen moments to inspect:

1. Adventure/path entry point.
2. First visible route stop.
3. First fight stop.
4. First non-fight choice or reward stop, if implemented.
5. First reward/payoff after a stop.
6. Any boss/end marker if included in the slice.
7. Dragon identity throughout: where the dragon is, what it is doing, and whether it feels like the actor.

## Exact playtest questions

Ask these in order. Prefer observation first, then short questions. Do not explain the intended design until after the response is captured.

### A. Route stops

1. “Without me explaining it, what do you think this path/route is showing?”
2. “What made you realize the dragon had reached a stop, if anything?”
3. “Point to the next place you expect the dragon to go.”
4. “Did the path feel like progress through an adventure, or did it feel like a timer/menu? What on screen caused that?”
5. “Were any route symbols, labels, or stop types too small or unclear on the phone?”

### B. Fights

1. “When the route hit a fight, what did you think was happening?”
2. “Could you tell who the dragon was fighting and whether the enemy was winning or losing?”
3. “Did the fight feel connected to the route stop, or like a separate unrelated panel?”
4. “What combat result did you notice first: enemy HP, defeated count, loot, animation, label, or something else?”
5. “Did any fight feedback imply a new manual combat mechanic or player damage system that was not actually there?”

### C. Choices

Use only if the implementation includes choice/event nodes.

1. “What do you think this choice will change for this run?”
2. “Which option would you pick first, and why?”
3. “Did the options feel like Dragon/adventure decisions or generic menu bonuses?”
4. “Could you understand the tradeoff without reading it twice?”
5. “After choosing, did the result make sense and feel acknowledged?”

### D. Rewards

1. “What reward did you think you earned at this stop?”
2. “Did the reward feel connected to what just happened on the path?”
3. “Did you understand whether the reward helps this run, permanent dragon growth, hoard/relic progress, or something else?”
4. “Was the reward visible enough on the phone before the next thing happened?”
5. “Did the reward make you want to continue to the next stop?”

### E. Dragon identity

1. “During the path, did the dragon feel like the main character or like decoration beside menus?”
2. “What was the dragon doing that made it feel alive or adventure-bound?”
3. “Did the element/type of the dragon matter visually or emotionally in this slice?”
4. “Would you describe this as a dragon adventure after one minute? Why or why not?”
5. “What one screen moment most hurt the dragon fantasy?”

### F. Final focused decision question

Ask this exact decision question after the observation questions:

“Did this route/fight/choice/reward flow make the first session feel more like a dragon adventure, without making the screen confusing or implying unapproved new mechanics?”

Allowed answers:

- Pass
- Borderline
- Fail

If Logan/Topnotch answers with a nuanced sentence, classify it using the rubric below and capture the sentence verbatim.

## Pass / borderline / fail rubric

### PASS

Use Pass only if all required signals are true:

- Route: player can explain the path as a sequence of adventure stops without being taught.
- Stops: player notices when the dragon reaches a stop and can point to what comes next.
- Fights: player understands a fight is happening, who/what is being fought, and that it is auto-resolving.
- Choices/rewards: player understands at least one non-fight stop or reward as part of the adventure loop, not an unrelated menu pop.
- Dragon identity: dragon feels like the actor moving through the adventure, not merely a tap target or background mascot.
- Phone readability: major route/fight/reward information is readable on iPhone without zooming or repeated explanation.
- Scope safety: no strong impression that new manual combat, player damage, balance retune, or monetization was introduced.

Pass wording examples:

- “I can tell the dragon is moving from fight to reward to choice.”
- “This feels like an adventure now, and I know what the next stop means.”
- “The dragon feels more like the one doing the run.”

### BORDERLINE

Use Borderline if the path is directionally right but one small issue blocks confident continuation:

- Route idea is understood, but stop symbols or next-step flow are unclear.
- Fights are visible, but connection between route stop and fight panel is weak.
- Rewards are noticed, but their type or importance is unclear.
- Choices are interesting, but text/tradeoffs are too vague or too small.
- Dragon identity improved, but still competes with menus or passive timer feel.
- Screen is readable in default motion but one busy moment needs simplification or Reduced Motion check.
- Tester says “better” but cannot name what changed besides general polish.

Borderline wording examples:

- “I get it, but I don’t know what that icon means.”
- “It’s more adventure-like, but the fight and path feel disconnected.”
- “The reward popped up too fast for me to care.”

### FAIL

Use Fail if any of these are true:

- Player cannot explain what the path is doing after one minute.
- Route still reads as a passive timer, generic menu, or unrelated progress bar.
- Fight state is not understandable on iPhone.
- Rewards or choices are missed entirely or feel meaningless.
- Dragon feels less central than before, or the path makes it feel more like decoration.
- Visuals imply unapproved mechanics such as manual turn combat, player HP/damage, new attack abilities, or balance changes.
- Screen is too busy, too small, or too confusing to validate adventure feel.
- Tester needs designer explanation before the slice makes sense.

Fail wording examples:

- “I don’t know what I’m looking at.”
- “It still feels like waiting for numbers.”
- “The dragon is not the one adventuring; the UI is.”

## What each result unlocks next

### If PASS

Unlocks:

- Aurelith may approve the adventure path foundation as the baseline for the next implementation slice.
- Pyraxis may proceed to the next smallest scoped implementation only after Ember confirms the next owner/task.
- Recommended next slice: stat-impact combat presentation or route-node automation tests, depending on current engineering readiness.

Does not unlock:

- Balance retunes.
- Save schema changes.
- New monetization clutter.
- Broad skill/evolution/relic systems in one pass.

Next owner decision:

- Aurelith: decide whether the next value is “make fights visibly stat-driven” or “make route stops structurally testable.”
- Pyraxis: implement only the approved slice.
- Caldrin: keep result in playtest log and prepare the next specific validation packet.

### If BORDERLINE

Unlocks exactly one constrained polish or clarity pass.

Allowed follow-up types:

- Route icon/label readability pass.
- Clearer stop-arrival feedback.
- Stronger fight-to-route transition.
- Reward timing/readability fix.
- Choice copy simplification.
- Dragon-presence emphasis inside the existing slice.

Does not unlock:

- A second unrelated feature.
- Combat formula or economy changes.
- New route node categories beyond the planned skeleton.

Next owner decision:

- Caldrin: convert the single blocker into one tiny task with pass criteria.
- Aurelith: confirm that the blocker is product clarity, not a request for new mechanics.
- Pyraxis/Veyra: act only if the blocker is engineering or visual readability.

### If FAIL

Unlocks a stop/rethink branch, not more scope.

Allowed follow-up types:

- Revert/simplify the route presentation to the smallest understandable path.
- Produce a product/design clarification doc before more code.
- Ask Veyra for a phone-readability route mock if visual language failed.
- Ask Forgehand for an implementation-surface blocker map if the slice cannot safely express the intended flow.

Does not unlock:

- More systems layered on top of an unclear route.
- Balance tuning to compensate for confusion.
- Skill drafting, evolution branching, relics/hoard, or idle rewards.

Next owner decision:

- Aurelith: decide what failed: concept, visual hierarchy, interaction clarity, or scope overload.
- Ember: route exactly one corrective task.
- Caldrin: preserve the failed evidence so the same vague “make it better” loop does not repeat.

## Result capture template

Copy this block into the playtest observation or Mission Control work log after testing.

```md
## Capybara-style adventure path validation result

Date/time:
Tester/device:
Build/context:
Save state:
Reduced Motion checked: yes/no/not applicable

Final classification: PASS / BORDERLINE / FAIL

Route stops:
- What the tester thought the path showed:
- Did they notice stop arrival? yes/no/partial
- Could they point to next stop? yes/no/partial
- Readability issues:

Fights:
- What the tester thought was happening:
- Enemy/HP/outcome clarity:
- Did fight feel connected to the route? yes/no/partial
- Any false mechanic implication:

Choices:
- Choice node present? yes/no
- If yes, what the tester thought options changed:
- Was tradeoff understood? yes/no/partial

Rewards:
- Reward noticed first:
- Reward category understood: run/permanent/hoard/relic/unclear/not applicable
- Did reward motivate next stop? yes/no/partial

Dragon identity:
- Did dragon feel like main character? yes/no/partial
- Strongest dragon-fantasy moment:
- Weakest dragon-fantasy moment:

Exact quotes:
- "..."
- "..."

Decision:
- What this result unlocks next:
- One next owner:
- One tiny next task:
- Proof gate for next task:
```

## Anti-vague-feedback rules

Do not ask:

- “Is it better?”
- “Do you like it?”
- “Does it feel good?”
- “Should we keep going?”
- “Is the adventure more fun?”

Ask instead:

- “What do you think this route is showing?”
- “What did you notice changed when the dragon hit the stop?”
- “Point to what you expect to happen next.”
- “What reward did you think you earned?”
- “What made the dragon feel like the actor?”
- “What implied a mechanic that is not actually there?”

Decision discipline:

- If the answer is vague praise, classify Borderline until the tester can name the visible cause.
- If the answer requires designer explanation, classify Fail for first-session clarity.
- If the tester identifies one concrete clarity issue but the loop works, classify Borderline and authorize only one polish pass.
- If the tester understands route, fight, reward, and dragon role without prompting, classify Pass even if there are small polish wishes.

## One-minute milestone status format

Use this format when reporting back to Ember/Logan:

“Adventure path validation is [PASS/BORDERLINE/FAIL]. Evidence: [one sentence with exact observed route/fight/reward/dragon signal]. Next: [one owner] will [one tiny task] with proof gate [specific check]. No balance, save, dependency, or monetization changes are unlocked by this result.”
