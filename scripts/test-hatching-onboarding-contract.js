#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const gamePath = path.join(projectRoot, 'src', 'game.ts');
const typesPath = path.join(projectRoot, 'src', 'types.ts');
const game = fs.readFileSync(gamePath, 'utf8');
const types = fs.readFileSync(typesPath, 'utf8');
const app = fs.readFileSync(path.join(projectRoot, 'App.tsx'), 'utf8');
const content = fs.readFileSync(path.join(projectRoot, 'src', 'content.ts'), 'utf8');
const fireSpineAnimations = fs.readFileSync(path.join(projectRoot, 'src', 'data', 'fireHatchlingSpineAnimations.ts'), 'utf8');

const checks = [];
function check(id, pass, detail) {
  checks.push({ id, pass: Boolean(pass), detail });
}
function section(source, start, end) {
  const s = source.indexOf(start);
  if (s === -1) return '';
  const e = source.indexOf(end, s + start.length);
  return e === -1 ? source.slice(s) : source.slice(s, e);
}

const initialState = section(game, 'export const initialGameState: GameState = {', '};\n\nconst elementStatBonus');
const selectEgg = section(game, 'case "selectEgg":', 'case "tapEgg":');
const tapEgg = section(game, 'case "tapEgg":', 'case "chooseEggAnswer":');
const hatchDragon = section(game, 'case "hatchDragon":', 'case "finishHatching":');
const finishHatching = section(game, 'case "finishHatching":', 'case "advanceJourney":');
const hydrate = section(game, 'case "hydrate":', 'return hydrated;');

check('fresh-save-starts-in-egg-phase',
  initialState.includes('eggTaps: 0') && initialState.includes('phase: "egg"') && initialState.includes('activeScreen: "egg"'),
  'initialGameState keeps fresh saves on egg screen with zero taps');
check('types-support-selected-egg-flow',
  types.includes('eggTaps: number;') && types.includes('{ type: "selectEgg"; element: DragonElement }') && types.includes('\"dark\"'),
  'GameState and GameAction expose eggTaps plus selectEgg and the Light/Dark starter pair');
check('egg-selection-records-selected-element',
  selectEgg.includes('state.dragon.stage !== "egg"') && selectEgg.includes('eggAnswers: { selectedEgg: action.element }') && selectEgg.includes('eggTaps: 0') && selectEgg.includes('element: action.element'),
  'selectEgg is guarded, resets taps, records selected element, and assigns dragon element');
check('egg-taps-clamp-at-three',
  tapEgg.includes('Math.min(3, (state.eggTaps ?? 0) + 1)') && tapEgg.includes('eggTaps: nextEggTaps'),
  'tapEgg clamps tap count at three');
check('third-tap-enters-hatching',
  tapEgg.includes('phase: nextEggTaps >= 3 ? "hatching" : "egg"') && tapEgg.includes('tapThree: state.dragon.element'),
  'third selected-egg tap writes tapThree and enters hatching');
check('finish-hatching-routes-to-hatchling-journey-den',
  finishHatching.includes('state.phase !== "hatching" && state.dragon.stage !== "hatchling"') && finishHatching.includes('return gameReducer(state, { type: "hatchDragon" })') && hatchDragon.includes('stage: "hatchling"') && hatchDragon.includes('phase: "journey"') && hatchDragon.includes('activeScreen: "den"'),
  'finishHatching delegates to hatchDragon and lands on hatchling journey den screen');
check('hatch-starts-as-neutral-base-hatchling',
  hatchDragon.includes('name: `${element[0].toUpperCase()} Hatchling`') && hatchDragon.includes('path: null') && hatchDragon.includes('selectedActiveSkillId: null') && hatchDragon.includes('stats: boostedStats') && hatchDragon.includes('tutorialCompleted: true') && hatchDragon.includes('lastLoginRewardDate: state.lastLoginRewardDate ?? getTodayKey()'),
  'hatchDragon lands in the den as an element hatchling without defaulting into Raider/Guardian/Mystic archetypes or first-session blocking popups');
check('post-hatch-tutorial-overlay-is-not-blocking-den',
  app.includes('const shouldShowTutorialOverlay = !state.tutorialCompleted && state.dragon.stage === "egg" && state.activeScreen === "egg"') && app.includes('visible={shouldShowTutorialOverlay}'),
  'tutorial overlay is scoped to egg onboarding only and cannot cover the post-hatch den reveal');
check('fire-hatch-preview-and-den-use-no-mouth-flame-idle-sprite-instead-of-old-layered-cutout-path',
  app.includes('const hatchlingImages: Record<DragonElement, ImageSourcePropType> = {\n  fire: require("./assets/dragons/fire-hatchling-canon-source/fire-hatchling-idle-no-mouth-flame-cutout-v2.png")') &&
    app.includes('source={hatchlingImages[focusedElement]}') &&
    app.includes('const useFireSpineFrameDragon =') &&
    app.includes('fire-hatchling-idle-no-mouth-flame-cutout-v2.png') &&
    app.includes('useFireDenHeroTreatment') &&
    app.includes('fireDenNestGlow') &&
    !app.includes('{useLayeredFireHatchling ?'),
  'fire egg-hatch preview and den rendering both use the no-mouth-flame idle cutout with clean wing/tail transparency instead of the old mouth-breath hatchling cutout or layered animation path');
check('loot-popups-are-suppressed',
  app.includes('function shouldShowLootPopup(_event: LootEvent | null | undefined)') && app.includes('return false;'),
  'shard/gear/loot found popups are suppressed so they do not cover the main screen');
check('daily-login-does-not-cover-first-den-reveal',
  app.includes('const shouldShowDailyLoginReward = state.lastLoginRewardDate !== getTodayKeyForUi() && state.completedAdventureRuns > 0') && app.includes('visible={shouldShowDailyLoginReward}'),
  'daily login reward is delayed until after the player has at least one completed adventure run');
check('startup-return-presence-and-event-windows-are-suppressed',
  app.includes('const shouldShowReturnPresenceToast = false') &&
    app.includes('const shouldShowJourneyEventModal = false') &&
    app.includes('{shouldShowJourneyEventModal ? <JourneyEventModal state={state} dispatch={dispatch} /> : null}') &&
    !app.includes('dispatch({ type: "triggerJourneyEvent" });'),
  'return presence toasts and timed journey event windows are not allowed to pop over the initial den/dragon reveal');
check('fire-den-uses-new-fire-cave-art-while-other-starters-remain-cave-like',
  app.includes('const elementDenBackgrounds: Record<DragonElement, ImageSourcePropType>') &&
    app.includes('fire: require("./assets/den/fire-hatchling-den-v1.png")') &&
    app.includes('water: sceneImages.cave') &&
    app.includes('earth: sceneImages.cave') &&
    app.includes('light: sceneImages.cave') &&
    app.includes('dark: sceneImages.cave') &&
    app.includes('state.activeScreen === "den" ? denBackgroundSource : sceneImages.forest'),
  'fire starter den uses the new fire-element cave artwork while remaining starter dens stay cave-like placeholders');
check('first-playable-fire-loop-uses-clear-chapter-language-from-den',
  types.includes('{ type: "startAdventureRun"; difficultyId?: AdventureDifficultyId; startStep?: number }') &&
    game.includes('adventureRun: createAdventureRun(action.startStep ?? 1, action.difficultyId ?? "hatchlingTrail")') &&
    app.includes('Chapter 1') &&
    app.includes('Ember Gate: prep → fight → chest') &&
    app.includes('Start Chapter 1') &&
    app.includes('dispatch({ type: "startAdventureRun", difficultyId: "hatchlingTrail", startStep: 1 })') &&
    app.includes('Begin Chapter 1') &&
    app.includes('Chapter start') &&
    content.includes('id: "slime-crossing"') && content.includes('step: 3') && content.includes('kind: "battle"') && game.includes('nodeCount: 60'),
  'post-hatch den/adventure start uses Chapter 1 language and a clear prep → fight → chest mental model instead of vague text events');
check('focused-fire-combat-loop-has-fight-screen-return-chest-and-preloaded-assets',
  app.includes('Fight Stop') &&
    app.includes('Fight enemy') &&
    app.includes('Fighting...') &&
    app.includes('BattleFlashCalloutRail battle={battle}') &&
    app.includes('Fire Breath') &&
    app.includes('Enemy Counter') &&
    app.includes('AdventureRewardRecap state={state} focused={focused} onReturnToDen') &&
    app.includes('Back to Den') &&
    app.includes('function preloadImageSource') &&
    app.includes('fireHatchlingSpineAnimations') &&
    app.includes('Image.prefetch(resolved.uri)'),
  'focused adventure loop shows fight/chest payoff and preloads combat dragon/enemy/background assets before judging animation');
check('evolution-is-chapter-10-stop-10-milestone-not-chapter-1-reward',
  game.includes('function isChapterEvolutionMilestone') &&
    game.includes('node?.chapter === 10 && node?.chapterStop === 10 && node?.kind === "boss"') &&
    game.includes('const evolutionGain = isChapterEvolutionMilestone(context.node) ? (permanentReward.evolution ?? fallbackEvolution) : 0') &&
    game.includes('Locked until Chapter 10 Stop 10 evolution boss') &&
    app.includes('true evolution waits for Chapter 10 Stop 10') &&
    app.includes('Chapter 1 • 60 stops'),
  'evolution progress is reserved for Chapter 10 Stop 10 rather than Chapter 1 or random route text events');
check('player-facing-adventure-copy-removes-meta-test-language',
  !app.includes('Chapter rewards stay hidden until victory or defeat') &&
    !app.includes('Rewards stay hidden until the chapter summary') &&
    !app.includes('Temporary route effect') &&
    !content.includes('Chapter 1 stretches into a full 60-stop adventure') &&
    !content.includes('Gain permanent health before the road grows dangerous'),
  'visible adventure cards use fantasy copy, not test-plan/meta copy');
check('chapter-one-is-full-length-60-stop-adventure',
  game.includes('title: "Chapter 1: Ember Gate"') &&
    game.includes('nodeCount: 60') &&
    game.includes('clear ${difficulty.nodeCount} chapter stops') &&
    content.includes('const chapterOneExtendedStops: AdventureNode[]') &&
    content.includes('step: 60') &&
    content.includes('title: "Ember Gate Hoard Tyrant"'),
  'Chapter 1 is modeled as a full 60-stop adventure with late boss pressure, not a 10-stop evolution run');
check('chapter-ten-stop-ten-supports-evolution-and-multiple-bosses',
  game.includes('chapter: 10') &&
    game.includes('title: "Chapter 10: Ancient Rift"') &&
    game.includes('Chapter 10 is a 60-stop mythic adventure with multiple bosses') &&
    game.includes('evolutionMilestone: difficulty.chapter === 10 && step === 10 && node.kind === "boss"'),
  'Chapter 10 is the future evolution chapter and can contain multiple boss gates while only Stop 10 grants evolution progress');
check('roguelite-adventure-hides-loot-until-chapter-summary',
  !app.includes('Chapter rewards stay hidden until victory or defeat') &&
    !app.includes('Rewards stay hidden until the chapter summary') &&
    !app.includes('Temporary route effect — final loot appears only on the chapter summary') &&
    app.includes('(run?.status === "complete" || run?.status === "failed") && state.lastAdventureRewards') &&
    game.includes('if (context.status === "active") {\n    return state;\n  }') &&
    !game.includes('Temporary route effect applied; final loot appears on the chapter summary') &&
    !game.includes('rewards stay hidden until chapter summary'),
  'route rewards are not surfaced as Return Chest loot until chapter victory/defeat summary');
check('hydrated-adventure-runs-normalize-to-current-chapter-length',
  game.includes('function normalizeAdventureRun') &&
    game.includes('maxSteps: difficulty.nodeCount') &&
    game.includes('adventureRun: normalizeAdventureRun(action.state.adventureRun)') &&
    app.includes('const chapterLabel = chapterMatch ? `Chapter ${chapterMatch[1]}` : "Chapter 1"'),
  'old saved runs with 10-stop maxSteps are normalized to the current 60-stop chapter length before the HUD renders');
check('skill-selection-is-a-temporary-active-run-draft',
  app.includes('Choose a skill') &&
    app.includes('Pick one run skill for the road ahead.') &&
    app.includes('hasPendingSkillDraft') &&
    game.includes('const isActiveRunDraftChoice = Boolean') &&
    game.includes('state.adventureRun?.status === "active"') &&
    game.includes('Temporary run skill picked:') &&
    game.includes('Choose one temporary run skill from') &&
    game.includes('node.kind === "boss" && state.lastSkillDraftOffer?.skillIds.includes(state.selectedActiveSkillId ?? "") ? null') &&
    game.includes('(node.kind === "elite" || node.step === 6)') &&
    game.includes('lastLoot: null'),
  'elite skill draft is a visible selectable adventure-only screen/card and is cleared at chapter end');
check('hydrate-preserves-egg-taps',
  hydrate.includes('eggTaps: action.state.eggTaps ?? initialGameState.eggTaps'),
  'hydrate preserves selected-egg tap count for old/new saves');
check('hydrate-normalizes-starter-hatchling-away-from-default-raider-path',
  hydrate.includes('shouldNormalizeStarterHatchling') && hydrate.includes('selectedActiveSkillId: shouldNormalizeStarterHatchling ? null') && hydrate.includes('path: shouldNormalizeStarterHatchling ? null') && hydrate.includes('starterHatchlingStats'),
  'saved first-session hatchlings are migrated back to neutral base hatchlings instead of preserving an old default Raider path');
check('tutorial-completion-reducer-remains-deterministic',
  game.includes('case "completeTutorial"') && game.includes('tutorialCompleted: true'),
  'completeTutorial reducer action remains deterministic; skip/final-next UI is intentionally outside this no-App.tsx commit');
check('starter-screen-uses-light-dark-and-described-branches',
  app.includes('label: "Light"') && app.includes('label: "Dark"') && !app.includes('label: "Dawn"') && !app.includes('label: "Storm"') && app.includes('description: "Guardian branch.') && app.includes('Type chart'),
  'onboarding presents Light/Dark starters, described first branches, and the type chart');
check('element-type-chart-contract',
  game.includes('fire: ["earth"]') && game.includes('earth: ["water"]') && game.includes('water: ["fire"]') && game.includes('light: ["dark"]') && game.includes('dark: ["light"]') && game.includes('getElementMatchupMultiplier'),
  'type chart encodes Fire>Earth>Water>Fire and Light/Dark mutual attack bonuses');

const failed = checks.filter((item) => !item.pass);
console.log('hatching-onboarding-contract:', failed.length ? 'FAIL' : 'PASS');
for (const item of checks) {
  console.log(`- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.detail}`);
}
if (failed.length) {
  process.exitCode = 1;
}
