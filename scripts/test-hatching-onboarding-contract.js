#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const gamePath = path.join(projectRoot, 'src', 'game.ts');
const typesPath = path.join(projectRoot, 'src', 'types.ts');
const game = fs.readFileSync(gamePath, 'utf8');
const types = fs.readFileSync(typesPath, 'utf8');

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
  types.includes('eggTaps: number;') && types.includes('{ type: "selectEgg"; element: DragonElement }'),
  'GameState and GameAction expose eggTaps plus selectEgg');
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
const hasMinimalDefaultTraitWiring =
  hatchDragon.includes('defaultPathTrait') &&
  hatchDragon.includes('defaultSkillTrait') &&
  hatchDragon.includes('chosenTraits: Array.from(new Set([...state.dragon.chosenTraits, defaultPathTrait, defaultSkillTrait]))');
const hasFullDefaultPathSkillWiring =
  hatchDragon.includes('getDefaultDragonPath(element)') &&
  hatchDragon.includes('defaultActiveSkill') &&
  hatchDragon.includes('selectedActiveSkillId: defaultActiveSkill?.id ?? state.selectedActiveSkillId');
check('default-path-and-skill-setup-remains-wired',
  hasMinimalDefaultTraitWiring || hasFullDefaultPathSkillWiring,
  'hatchDragon records deterministic default path and starter skill wiring without broad UI dependencies');
check('hydrate-preserves-egg-taps',
  hydrate.includes('eggTaps: action.state.eggTaps ?? initialGameState.eggTaps'),
  'hydrate preserves selected-egg tap count for old/new saves');
check('tutorial-completion-reducer-remains-deterministic',
  game.includes('case "completeTutorial"') && game.includes('tutorialCompleted: true'),
  'completeTutorial reducer action remains deterministic; skip/final-next UI is intentionally outside this no-App.tsx commit');

const failed = checks.filter((item) => !item.pass);
console.log('hatching-onboarding-contract:', failed.length ? 'FAIL' : 'PASS');
for (const item of checks) {
  console.log(`- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.detail}`);
}
if (failed.length) {
  process.exitCode = 1;
}
