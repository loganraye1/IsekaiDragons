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
    game.includes('adventureRun: createAdventureRun(action.startStep ?? 1, nextDifficultyId, state.dragon.stats.health)') &&
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
check('battle-images-use-fast-runtime-assets-and-priority-preload',
  app.includes('./assets/optimized/battle/forest-path-fast.jpg') &&
    app.includes('./assets/optimized/battle/briar-boar-cutout-fast.png') &&
    app.includes('const battleFireHatchlingImage = require("./assets/optimized/battle/fire-hatchling-battle-fast.png")') &&
    app.includes('const criticalBattleImages = [') &&
    app.includes('battleFireHatchlingImage,') &&
    app.includes('const heavyAnimationPreload = setTimeout') &&
    app.includes('}, 2500);'),
  'battle uses small runtime images and preloads critical backgrounds/enemies/dragon before delayed heavy animation frames');
check('battle-stop-shows-tactic-readout-before-fight-cta',
  app.includes('function BattleTacticPreview') &&
    app.includes('Fight readout') &&
    app.includes('Element advantage: press the breath attack.') &&
    app.includes('Enemy pressure: block, dodge, then counter.') &&
    app.includes('Even matchup: stats decide the exchange.') &&
    app.includes('{ label: "ATK", detail: playerAdvantage ? "advantage breath" : shadowVale ? "veil pierce" : "steady bite" }') &&
    app.includes('{ label: "DEF", detail: enemyAdvantage ? "brace counter" : shadowVale ? "guard HP" : "hold ground" }') &&
    app.includes('{ label: "SPD", detail: node.difficulty >= 1 ? "first swing" : "safe opener" }') &&
    app.includes('{encounter ? <BattleTacticPreview node={node} encounter={encounter} focused={focused} /> : null}') &&
    app.includes('getElementMatchupMultiplier(node.element ?? "fire", encounter.element)'),
  'battle/elite/boss stops show a compact ATK/DEF/SPD tactic readout so the next fight is readable before tapping the CTA');
check('battle-feel-pass-two-shows-live-damage-and-turn-ownership',
  app.includes('const enemyDamageBadgeText = activeExchange?.playerDamage ? `HIT -${activeExchange.playerDamage}` : null') &&
    app.includes('const dragonDamageBadgeText = activeExchange?.enemyDamage ? `HURT -${activeExchange.enemyDamage}` : null') &&
    app.includes('Dragon hit: -${activeExchange.playerDamage} enemy HP') &&
    app.includes('Enemy counter: -${activeExchange.enemyDamage} hatchling HP') &&
    app.includes('battleExchangeReadoutRow') &&
    app.includes('battleExchangePillActiveDragon') &&
    app.includes('battleExchangePillActiveEnemy') &&
    app.includes('battleDamageBadgeEnemy') &&
    app.includes('battleDamageBadgeDragon') &&
    app.includes('damageFloatTranslateY') &&
    app.includes('damageFloatScale'),
  'battle screen shows floating HIT/HURT damage badges plus turn-ownership pills so exchanges read clearly on phone');
check('combat-feel-pass-adds-impact-pause-recoil-and-arena-shake',
  app.includes('const battleArenaShake = exchangePulse.interpolate') &&
    app.includes('const targetRecoilTranslateX = exchangePulse.interpolate') &&
    app.includes('const hitPauseScale = exchangePulse.interpolate') &&
    app.includes('inputRange: [0, 0.34, 0.5, 0.66, 1]') &&
    app.includes('outputRange: [0, 0, 10, -4, 0]') &&
    app.includes('styles.battleArenaCombatants, !exchangeComplete && { transform: [{ translateX: battleArenaShake }] }') &&
    app.includes('targetRecoilTranslateX') &&
    app.includes('hitPauseScale') &&
    app.includes('battleImpactRing') &&
    app.includes('battleImpactSpark'),
  'battle exchanges have a stronger phone-readable impact beat: lunge, hit-pause scale, target recoil, arena shake, and impact sparks');
check('combat-damage-popups-linger-long-enough-to-read',
  app.includes('Animated.timing(exchangePulse, { toValue: 1, duration: 720, useNativeDriver: true })') &&
    app.includes('Animated.timing(exchangePulse, { toValue: 0, duration: 420, useNativeDriver: true })') &&
    app.includes('const hitFlashOpacity = exchangePulse.interpolate({ inputRange: [0, 0.18, 0.62, 0.86, 1], outputRange: [0, 1, 1, 0.7, 0] })') &&
    app.includes('const damageFloatTranslateY = exchangePulse.interpolate({ inputRange: [0, 0.62, 1], outputRange: [12, -24, -34] })') &&
    app.includes('const damageFloatScale = exchangePulse.interpolate({ inputRange: [0, 0.18, 0.62, 1], outputRange: [0.68, 1.18, 1.08, 0.96] })'),
  'combat HIT/HURT pop-up numbers linger at full opacity through the impact beat so they are readable on phone');
check('battle-start-gate-prevents-instant-auto-completion',
  app.includes('const [battleStarted, setBattleStarted] = useState(false)') &&
    app.includes('const exchangeComplete = battleStarted && currentExchangeIndex >= battleEvents.length') &&
    app.includes('Square up — tap Start Battle when ready') &&
    app.includes('setBattleStarted(true);') &&
    app.includes('!battleStarted ? "Start Battle"') &&
    app.includes('{exchangeComplete ? <BattleFlashCalloutRail battle={battle} stats={state.dragon.stats} element={element} /> : null}'),
  'battle screen opens in a ready state with a Start Battle CTA instead of auto-running into completed combat');
check('battle-outcome-banner-clarifies-result-and-next-action',
  app.includes('function BattleOutcomeBanner') &&
    app.includes('{exchangeComplete ? <BattleOutcomeBanner battle={battle} continueScreen={continueScreen} /> : null}') &&
    app.includes('Victory strike') &&
    app.includes('Forced back') &&
    app.includes('Spoils ready in the return chest') &&
    app.includes('Next: press deeper into the chapter') &&
    app.includes('battleOutcomeBannerWin') &&
    app.includes('battleOutcomeBannerLoss'),
  'completed battles show one compact result banner with win/loss, reward/regen copy, and next action');
check('battle-phone-layout-keeps-hud-clear-of-hp-labels',
  app.includes('minHeight: 292') &&
    app.includes('height: 220') &&
    app.includes('width: 178') &&
    app.includes('height: 226') &&
    app.includes('width: 184') &&
    app.includes('marginTop: 6') &&
    app.includes('paddingVertical: 8'),
  'battle arena uses compact phone-sized sprites and delayed battle tells so the live HUD does not overlap HP labels');
check('completed-battle-summary-hides-live-exchange-hud',
  app.includes('{!exchangeComplete ? (\n            <View style={styles.battleFightHud}>') &&
    app.includes('{exchangeComplete ? <BattleOutcomeBanner battle={battle} continueScreen={continueScreen} /> : null}') &&
    app.includes('{exchangeComplete ? <BattleFlashCalloutRail battle={battle} stats={state.dragon.stats} element={element} /> : null}'),
  'completed battles hide the live turn readout before showing outcome/tell cards so the phone summary does not overlap');
check('chapter-hp-persists-across-adventure-fights',
  types.includes('currentHp: number;') &&
    types.includes('maxHp: number;') &&
    game.includes('function getAdventureHpAfterFight') &&
    game.includes('state.adventureRun.currentHp') &&
    game.includes('withAdventureHp(run, getAdventureHpAfterFight(run, battle, node))') &&
    game.includes('withAdventureHp(run, 0)') &&
    game.includes('return run.maxHp;') &&
    app.includes('Chapter HP {animatedHp.playerHp}/{chapterMaxHp}') &&
    app.includes('const chapterHpLabel = `Chapter HP ${chapterHpCurrent}/${chapterHpMax}`'),
  'chapter HP starts full, carries between fight wins with small recovery, hits zero on chapter defeat, and only resets on boss/chapter completion');
check('health-attack-defense-stay-visible-throughout-chapter',
  app.includes('const persistentChapterStats = [') &&
    app.includes('{ label: "Health", value: `${chapterHpCurrent}/${chapterHpMax}` }') &&
    app.includes('{ label: "Attack", value: `${state.dragon.stats.attack}` }') &&
    app.includes('{ label: "Defense", value: `${state.dragon.stats.defense}` }') &&
    app.includes('styles.persistentChapterStatsRow') &&
    app.includes('const battlePersistentStats = [') &&
    app.includes('{ label: "Health", value: `${animatedHp.playerHp}/${chapterMaxHp}` }') &&
    app.includes('styles.battlePersistentStatsRow') &&
    app.includes('Health {animatedHp.playerHp}/{chapterMaxHp} • Attack {state.dragon.stats.attack} • Defense {state.dragon.stats.defense}'),
  'Health, Attack, and Defense remain visible in the adventure board and battle screen throughout the chapter');
check('battle-screen-uses-pre-fight-chapter-hp-not-post-fight-recovery',
  types.includes('battleStartHp?: number;') &&
    game.includes('const battleStartHp = playerHp;') &&
    game.includes('battleStartHp,') &&
    app.includes('const chapterStartHp = battle.battleStartHp ??') &&
    app.includes('dragonStartHp: chapterStartHp'),
  'battle animation starts from the HP the dragon had before the fight, not the already-updated post-fight adventureRun HP');
check('chapter-two-completion-continues-into-chapter-three',
  types.includes('"shadowVale"') &&
    game.includes('title: "Chapter 3: Shadow Vale"') &&
    game.includes('export function getNextAdventureDifficultyId') &&
    game.includes('["hatchlingTrail", "drakeExpedition", "shadowVale", "ancientRift"]') &&
    app.includes('getNextAdventureDifficultyId(run.difficultyId)') &&
    app.includes('nextDifficultyId === "shadowVale" ? 3') &&
    app.includes('dispatch({ type: "startAdventureRun", difficultyId: nextDifficultyId })'),
  'Chapter 2 completion now offers and starts Chapter 3 instead of dead-ending back to the den or replaying Chapter 1');
check('chapter-three-shadow-vale-has-distinct-dark-route-identity',
  game.includes('const shadowValeStopTitles = [') &&
    game.includes('"Nightglass Ambush"') &&
    game.includes('"Shadow Hoard Warden"') &&
    game.includes('element: shadowVale ? "dark" : node.element') &&
    game.includes('Dark pressure gathers at stop') &&
    game.includes('function getAdventureEnemyPressureMultiplier(node?: AdventureNode)') &&
    game.includes('return Math.round((0.94 + routeProgress * 0.14) * 100) / 100;') &&
    game.includes('enemyPressureMultiplier *') &&
    game.includes('Shadow pressure: enemy damage ramps from guarded early ambushes') &&
    app.includes('function ShadowPressureReadout') &&
    app.includes('Shadow pressure') &&
    app.includes('Dark foes ramp from guarded ambushes into late-route pressure.') &&
    app.includes('Shadow Vale: Light/Dark pressure can swing the fight.') &&
    app.includes('shadowVale ? "veil pierce"') &&
    app.includes('shadowVale ? "guard HP"'),
  'Chapter 3 is not just a blank continuation: it rethemes nodes to dark Shadow Vale pressure and surfaces a phone-visible readout');
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
    !app.includes('Chapter 1 is a full-length 60-stop adventure') &&
    !game.includes('description: `${node.description} ${difficulty.description}`') &&
    !app.includes('Temporary route effect') &&
    !content.includes('Chapter 1 stretches into a full 60-stop adventure') &&
    !content.includes('Gain permanent health before the road grows dangerous'),
  'visible adventure cards use fantasy copy, not test-plan/meta copy or repeated difficulty-summary append text');
check('chapter-one-is-full-length-60-stop-adventure',
  game.includes('title: "Chapter 1: Ember Gate"') &&
    game.includes('nodeCount: 60') &&
    game.includes('clear ${difficulty.nodeCount} chapter stops') &&
    content.includes('const chapterOneExtendedStops: AdventureNode[]') &&
    content.includes('step: 60') &&
    content.includes('title: "Ember Gate Hoard Tyrant"'),
  'Chapter 1 is modeled as a full 60-stop adventure with late boss pressure, not a 10-stop evolution run');
check('chapter-one-boss-and-elite-gates-are-at-15-30-45-60',
  content.includes('id: "sky-manta-reef-dive",\n    step: 15,\n    kind: "elite"') &&
    content.includes('id: "titan-stone-hoard",\n    step: 30,\n    kind: "elite"') &&
    content.includes('id: "chapter-one-stop-45",\n    step: 45,\n    chapter: 1,\n    chapterStop: 45,\n    kind: "elite"') &&
    content.includes('id: "chapter-one-stop-60",\n    step: 60,\n    chapter: 1,\n    chapterStop: 60,\n    kind: "boss"') &&
    !content.includes('id: "ruin-knight-gate",\n    step: 10,\n    kind: "boss"') &&
    !content.includes('id: "chapter-one-stop-50",\n    step: 50,\n    chapter: 1,\n    chapterStop: 50,\n    kind: "boss"'),
  'Chapter 1 holds boss pressure until Stop 60, with elite gates at Stops 15, 30, and 45');
check('chapter-boss-gates-before-final-stop-do-not-end-sixty-stop-runs',
  game.includes('function isChapterFinalBoss(run: AdventureRun, node: AdventureNode)') &&
    game.includes('return node.kind === "boss" && run.step >= run.maxSteps;') &&
    game.includes('const chapterFinalBoss = isChapterFinalBoss(run, node);') &&
    game.includes('chapterFinalBoss ? "complete" : "active"') &&
    game.includes('chapterFinalBoss ? "Boss defeated. Chapter summary unlocked."') &&
    !game.includes('node.kind === "boss" ? "complete" : "active"') &&
    !game.includes('node.kind === "boss" ? "Boss defeated. Chapter summary unlocked."'),
  'boss gates before the configured max step advance the chapter instead of ending Chapter 1 at Stop 10');
check('camp-and-shrine-waypoints-restore-chapter-hp-for-long-runs',
  game.includes('function getAdventureHpAfterRecoveryStop(run: AdventureRun, node: AdventureNode)') &&
    game.includes('const shrineFloor = Math.ceil(run.maxHp * 0.75);') &&
    game.includes('const campFloor = Math.ceil(run.maxHp * 0.55);') &&
    game.includes('function withAdventureRecoveryStop(run: AdventureRun, node: AdventureNode)') &&
    game.includes('const recoveredRun = withAdventureRecoveryStop(run, node);') &&
    game.includes('Shrine light restored Chapter HP') &&
    game.includes('Camp rest restored Chapter HP') &&
    app.includes('Recovery waypoint: shrine blessing restores at least 75% Chapter HP.') &&
    app.includes('Recovery waypoint: camp rest restores at least 55% Chapter HP.') &&
    app.includes('pendingNode.kind === "shrine" ? "Pray" : pendingNode.kind === "camp" ? "Rest" : "Claim"'),
  'Camp and Shrine stops are visible recovery waypoints that refill Chapter HP enough to support 60-stop roguelite routes');
check('chapter-ten-stop-ten-supports-evolution-and-multiple-bosses',
  game.includes('chapter: 10') &&
    game.includes('title: "Chapter 10: Ancient Rift"') &&
    game.includes('Chapter 10 is a 60-stop mythic adventure with multiple bosses') &&
    game.includes('evolutionMilestone: difficulty.chapter === 10 && step === 10 && node.kind === "boss"'),
  'Chapter 10 is the future evolution chapter and can contain multiple boss gates while only Stop 10 grants evolution progress');
check('chapter-summary-surfaces-road-stats-and-clear-next-action',
  app.includes('Chapter {chapterNumber} Summary') &&
    app.includes('const chapterResult = run?.status === "failed" ? "Retreat logged" : "Chapter cleared";') &&
    app.includes('Return chest opened: {reward.lootGained.join(" • ")}') &&
    app.includes('styles.adventureSummaryStatRow') &&
    app.includes('Road') &&
    app.includes('Vitality') &&
    app.includes('Next road') &&
    app.includes('adventureRewardDenButton') &&
    app.includes('Back to Den'),
  'chapter victory/retreat summaries present loot, route stats, HP, hoard progress, and a clear return-to-den action');
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
    game.includes('normalizeAdventureRun(action.state.adventureRun,') &&
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
    game.includes('chapterFinalBoss && state.lastSkillDraftOffer?.skillIds.includes(state.selectedActiveSkillId ?? "") ? null') &&
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
