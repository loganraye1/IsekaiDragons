import { adventureNodes, dragonForms, encounters, quests, shopItems } from "./content";

declare const __DEV__: boolean;
import { BALANCE } from "./balance";
import {
  AchievementId,
  ActiveSkillSummary,
  AreaId,
  AutoBattleState,
  AdventureDifficultyId,
  AdventureNode,
  AdventureReward,
  AdventureRewardBundle,
  AdventureRun,
  BattleResult,
  DragonElement,
  DragonSkillDraft,
  DragonPathId,
  DragonStage,
  DailyGoalId,
  DailyGoalState,
  EquipmentBonusType,
  EquipmentItem,
  EquipmentRarity,
  EquipmentSlot,
  EliteSkillDraftOffer,
  EvolutionTraitId,
  FireStarterAdventureMilestone,
  GameAction,
  GameSettings,
  GameState,
  IdleQuestId,
  IdleUpgradeId,
  JourneyEventEffect,
  JourneyEventEffectType,
  JourneyEventId,
  PlaytestNote,
  ProductiveWorkNowSlice,
  Stats,
  SupportingSystemRecommendation,
  TreasureRarity,
  TreasureId
} from "./types";

const baseStats: Stats = {
  attack: 12,
  health: 95,
  defense: 5,
  speed: 5,
  block: 6,
  dodge: 5,
  critChance: 8,
  critDamage: 150
};

const defaultSettings: GameSettings = {
  hapticsEnabled: true,
  reducedMotion: false,
  numberFormat: "compact"
};

export const dragonSkillDrafts: DragonSkillDraft[] = [
  {
    id: "fire-ember-aegis",
    archetype: "fire",
    elementFocus: "fire",
    roleFocus: "guardian",
    name: "Ember Aegis",
    trigger: "When you block",
    effect: "Bank flame into a shield pulse that scorches attackers while softening the blow.",
    synergy: "Best with defense, block, health, and fire guardian mitigation.",
    pathPayoff: "Guardian payoff: makes fire wardens feel like burning shields that punish enemy contact.",
    activeBonus: { damageMultiplier: 1.03, damageReduction: 0.07, combatEffect: "+3% damage / +7% mitigation from Ember Aegis burn-shield" },
    statHooks: ["defense", "block", "health"]
  },
  {
    id: "fire-overheat",
    archetype: "fire",
    elementFocus: "fire",
    roleFocus: "raider",
    name: "Overheat Fang",
    trigger: "After a CRIT",
    effect: "Next breath hit burns hotter and gains bonus attack scaling.",
    synergy: "Best with crit chance, crit damage, and raider path burst.",
    pathPayoff: "Raider payoff: turns the high-offense fire evolution path into explosive crit breath chains.",
    activeBonus: { damageMultiplier: 1.1, damageReduction: 0, combatEffect: "+10% damage from Overheat Fang crit-breath pressure" },
    statHooks: ["attack", "critChance", "critDamage"]
  },
  {
    id: "fire-sunscale-read",
    archetype: "ancient",
    elementFocus: "fire",
    roleFocus: "mystic",
    name: "Sunscale Read",
    trigger: "Every third combat round",
    effect: "Read heat shimmer patterns to rotate between bite pressure and ember guard.",
    synergy: "Best with attack, defense, and tempo-focused fire mystic builds.",
    pathPayoff: "Mystic payoff: lets fire sages trade burst for predictive pressure and safer rotations.",
    activeBonus: { damageMultiplier: 1.06, damageReduction: 0.025, combatEffect: "+6% damage / +2.5% mitigation from Sunscale Read prediction" },
    statHooks: ["attack", "defense", "speed"]
  },
  {
    id: "frost-glacier-guard",
    archetype: "frost",
    elementFocus: "water",
    roleFocus: "guardian",
    name: "Glacier Guard",
    trigger: "When you block",
    effect: "Gain a frost shell that softens the next enemy strike.",
    synergy: "Best with defense, block, and guardian path mitigation.",
    pathPayoff: "Guardian payoff: converts water shield evolutions into repeatable damage smoothing.",
    activeBonus: { damageMultiplier: 1.015, damageReduction: 0.08, combatEffect: "+1.5% damage / +8% mitigation from Glacier Guard frost shell" },
    statHooks: ["defense", "block", "health"]
  },
  {
    id: "water-storm-surge",
    archetype: "storm",
    elementFocus: "water",
    roleFocus: "raider",
    name: "Surge Rush Combo",
    trigger: "After a speed tempo proc",
    effect: "Chain a second short surf slash before the enemy fully recovers.",
    synergy: "Best with speed, attack, and dodge to keep pressure moving.",
    pathPayoff: "Raider payoff: turns water raiders into fast combo evolutions that win through tempo.",
    activeBonus: { damageMultiplier: 1.07, damageReduction: 0.015, combatEffect: "+7% damage / +1.5% mitigation from Surge Rush combo tempo" },
    statHooks: ["speed", "attack", "dodge"]
  },
  {
    id: "storm-afterimage",
    archetype: "storm",
    elementFocus: "water",
    roleFocus: "mystic",
    name: "Afterimage Dive",
    trigger: "When you dodge",
    effect: "Counter with a fast wing slash before the next breath.",
    synergy: "Best with speed, dodge, and tempo-focused paths.",
    pathPayoff: "Mystic payoff: rewards water tempo evolutions with dodge-to-counter turns.",
    activeBonus: { damageMultiplier: 1.045, damageReduction: 0.045, combatEffect: "+4.5% damage / +4.5% mitigation from Afterimage Dive counters" },
    statHooks: ["speed", "dodge", "attack"]
  },
  {
    id: "gold-hoardflare",
    archetype: "gold",
    elementFocus: "earth",
    roleFocus: "guardian",
    name: "Hoardflare Dividend",
    trigger: "After earning treasure or equipment",
    effect: "Briefly boosts battle rewards and crit damage sparkle.",
    synergy: "Best with treasure drops, crit damage, and hoard progression.",
    pathPayoff: "Guardian payoff: lets earth hoard-build evolutions snowball safely after loot drops.",
    activeBonus: { damageMultiplier: 1.04, damageReduction: 0.05, combatEffect: "+4% damage / +5% mitigation from Hoardflare Dividend treasure guard" },
    statHooks: ["critDamage", "attack", "health"]
  },
  {
    id: "earth-crystal-break",
    archetype: "shadow",
    elementFocus: "earth",
    roleFocus: "raider",
    name: "Crystal Break",
    trigger: "Opening hit of a battle",
    effect: "Drive gem claws through armor for a sharper first strike.",
    synergy: "Best with attack, crit damage, and braced raider builds.",
    pathPayoff: "Raider payoff: makes earth raiders feel like armor-breaking bruisers instead of fragile glass cannons.",
    activeBonus: { damageMultiplier: 1.09, damageReduction: 0.02, combatEffect: "+9% damage / +2% mitigation from Crystal Break armor pierce" },
    statHooks: ["attack", "critDamage", "defense"]
  },
  {
    id: "ancient-rune-cycle",
    archetype: "ancient",
    elementFocus: "earth",
    roleFocus: "mystic",
    name: "Ancient Rune Cycle",
    trigger: "Every third combat round",
    effect: "Cycles between attack, block, and dodge blessings.",
    synergy: "Best with balanced mystic builds that use every combat stat.",
    pathPayoff: "Mystic payoff: makes earth root evolutions rotate offense, mitigation, and avoidance.",
    activeBonus: { damageMultiplier: 1.055, damageReduction: 0.035, combatEffect: "+5.5% damage / +3.5% mitigation from Ancient Rune Cycle rotation" },
    statHooks: ["attack", "block", "dodge"]
  },
  {
    id: "light-halo-guard",
    archetype: "gold",
    elementFocus: "light",
    roleFocus: "guardian",
    name: "Halo Guard",
    trigger: "When you block or fall below half HP",
    effect: "Raise a warm halo shield that softens the blow and makes protection readable.",
    synergy: "Best with health, block, defense, and Light guardian sustain.",
    pathPayoff: "Guardian payoff: turns Light protectors into visible shield-and-heal dragons instead of vague support.",
    activeBonus: { damageMultiplier: 1.025, damageReduction: 0.085, combatEffect: "+2.5% damage / +8.5% mitigation from Halo Guard radiance" },
    statHooks: ["health", "block", "defense"]
  },
  {
    id: "light-sunbeam-lance",
    archetype: "gold",
    elementFocus: "light",
    roleFocus: "raider",
    name: "Sunbeam Lance",
    trigger: "After a CRIT",
    effect: "Focus a second beam through the crit spark for a clean piercing hit.",
    synergy: "Best with attack, crit chance, crit damage, and speed.",
    pathPayoff: "Raider payoff: makes Light damage feel precise, flashy, and heroic instead of soft.",
    activeBonus: { damageMultiplier: 1.085, damageReduction: 0.01, combatEffect: "+8.5% damage / +1% mitigation from Sunbeam Lance crit focus" },
    statHooks: ["attack", "critChance", "critDamage"]
  },
  {
    id: "light-aurora-renewal",
    archetype: "ancient",
    elementFocus: "light",
    roleFocus: "mystic",
    name: "Aurora Renewal",
    trigger: "Every third combat round",
    effect: "Rotate a soft aurora pulse between recovery, speed, and a cleansing ray.",
    synergy: "Best with health, speed, dodge, and mystic tempo builds.",
    pathPayoff: "Mystic payoff: gives Light sages a clear recovery-tempo loop for long route survival.",
    activeBonus: { damageMultiplier: 1.045, damageReduction: 0.05, combatEffect: "+4.5% damage / +5% mitigation from Aurora Renewal pulse" },
    statHooks: ["health", "speed", "dodge"]
  }
];

export const productiveWorkNowSlices: ProductiveWorkNowSlice[] = [
  {
    id: "adventure-next-loop",
    lane: "Adventure path",
    productionTarget: "Turn the current 40-node route into an easier-to-review Capybara-style sequence: stop, fight, reward, recap.",
    visibleDeliverable: "Adventure path card now calls out the route loop and the next Dark-route handoff instead of hiding it in planning notes.",
    nextHook: "Add Dark Shadow Vale as the next 10-stop route slice after this visible proof stays green."
  },
  {
    id: "battle-flash-pass",
    lane: "Flashy battle",
    productionTarget: "Make every fight read faster with path-colored attack, brace, crit, block, dodge, and hit labels.",
    visibleDeliverable: "Battle card names the current flashy feedback contract so Topnotch can judge fight readability on phone.",
    nextHook: "Add element-specific breath/beam/impact variants for Fire, Water, Earth, Light, and Dark."
  },
  {
    id: "impact-stat-pass",
    lane: "Impact stats",
    productionTarget: "Keep ATK, DEF, HP, speed, block, dodge, crit, and crit damage tied to visible outcomes instead of passive numbers.",
    visibleDeliverable: "Stats card summarizes which combat levers are live and which stat hooks should become skill decisions next.",
    nextHook: "Add gear/relic affixes that visibly push guardian, raider, or mystic playstyles."
  },
  {
    id: "fire-forge-art-pass",
    lane: "Fire evolution",
    productionTarget: "Keep Fire as the flagship Living Forge Dragon with furnace chest, smoke mane, volcanic armor, and tail lantern motifs.",
    visibleDeliverable: "Fire evolution card keeps the approved art identity visible beside the gameplay roadmap.",
    nextHook: "Convert the best Living Forge concepts into final app-ready branch assets."
  }
];

export const supportingSystemRecommendations: SupportingSystemRecommendation[] = [
  {
    id: "gear-relic-foundation",
    lane: "gear-relics",
    name: "Gear + Relic Drops",
    purpose: "Make every fight capable of dropping something exciting beyond currency.",
    inGameProof: "Equipment inventory, equipped slots, treasure collection log, rarity colors, and sell/equip actions are wired.",
    nextHook: "Add set bonuses that reinforce guardian / raider / mystic evolution paths."
  },
  {
    id: "dragon-hoard-progression",
    lane: "hoard",
    name: "Dragon Hoard Progression",
    purpose: "Turn collected treasure into a visible dragon fantasy instead of a hidden multiplier table.",
    inGameProof: "Treasures persist through reincarnation and feed tap essence, EPS, offline rewards, battle rewards, and upgrade cost math.",
    nextHook: "Add a hoard room scene with piles, pedestals, and milestone unlocks."
  },
  {
    id: "idle-return-loop",
    lane: "idle",
    name: "Idle + Return Rewards",
    purpose: "Keep Capybara-style progress moving while the player is away.",
    inGameProof: "Idle upgrades generate EPS, offline rewards apply on return, and the dragon greets the player with return-presence copy.",
    nextHook: "Let adventure path depth increase the next offline reward chest."
  },
  {
    id: "daily-starter-loop",
    lane: "daily-starter",
    name: "Daily + Starter Rewards",
    purpose: "Give early players clear short-term reasons to return and claim progress.",
    inGameProof: "Daily login rewards, daily goals, achievements, and guided playtest prompts already create claimable starter structure.",
    nextHook: "Add a seven-day hatchling calendar with cosmetic egg-shell and banner rewards."
  },
  {
    id: "game-feel-regression-harness",
    lane: "automation",
    name: "Game-feel Regression Harness",
    purpose: "Stop flashy combat, adventure stops, and crunchy evolution identity from quietly regressing.",
    inGameProof: "npm run test:auto validates animation, route design, stat math, skill drafts, artifacts, and proof-chain consistency.",
    nextHook: "Add simulator screenshot capture once a stable device/browser target is available."
  }
];

export const v02UpdateObjectives = [
  {
    id: "adventure-path",
    status: "implemented",
    title: "Capybara-style adventure path",
    objective: "Make the main loop a visible route with travel, event stops, fight stops, and boss pressure.",
    playerProof: "Adventure screen now leads with Adventure Route → Combat Stop → Return Chest and a 30-node stop cadence.",
    nextHook: "Add alternate biomes and branching route choices after the Fire proof route feels right."
  },
  {
    id: "flashy-combat",
    status: "implemented",
    title: "Flashier readable combat",
    objective: "Make battles larger, faster, and easier to read at a glance.",
    playerProof: "Full-screen arena, HP bars, active skill recap, crit/block/dodge labels, and decisive four-exchange quick battles are visible.",
    nextHook: "Add bespoke attack animations per starter element."
  },
  {
    id: "impactful-stats",
    status: "implemented",
    title: "Impactful stats",
    objective: "Ensure ATK, DEF, block, dodge, crit, crit damage, speed, and HP have obvious battle meaning.",
    playerProof: "Stats page, battle logs, adventure HUD, and the v0.2 combat readout explain why hits land, spike, block, or miss.",
    nextHook: "Add pre/post upgrade previews that forecast expected damage and survival changes."
  },
  {
    id: "fire-starter",
    status: "implemented",
    title: "Fire starter first",
    objective: "Use Fire as the proof-of-concept starter with aggressive, burn, and crit-forward identity.",
    playerProof: "Fire Starter Expedition Focus maps Capybara lessons into ember route, fire combat, and evolution pressure targets.",
    nextHook: "Build Fire-only route events with more character dialogue and named rivals."
  },
  {
    id: "evolution-preview",
    status: "implemented",
    title: "Evolution map preview",
    objective: "Show that growth is a long-term dragon transformation path, not only level-up numbers.",
    playerProof: "Evolution Path Preview exposes element tabs, stage tabs, branch cards, hero art, and guardian/raider/mystic fantasy copy.",
    nextHook: "Lock real evolution choices behind milestone adventures and irreversible branch confirmation."
  },
  {
    id: "skill-foundation",
    status: "implemented",
    title: "Skills foundation",
    objective: "Connect active/passive skill fantasy to combat stats and evolution roles.",
    playerProof: "Skill Draft Preview lets players slot role-matched active skills and combat logs show skill trigger recaps.",
    nextHook: "Add a three-choice skill draft reward after elite fights."
  },
  {
    id: "reward-loop",
    status: "implemented",
    title: "Return chest reward loop",
    objective: "Make every run visibly return loot, stats, hoard progress, and evolution progress.",
    playerProof: "Adventure Return Chest summarizes loot gained, stats improved, hoard progress, evolution progress, gear drops, and next run guidance.",
    nextHook: "Add animated chest opening and rare relic reveal moments."
  },
  {
    id: "art-direction",
    status: "implemented",
    title: "Dragon art direction pass",
    objective: "Push the look toward cute-to-epic fantasy dragons with readable fire/glow/impact effects.",
    playerProof: "Adventure and battle now use large dragon/enemy staging, elemental badges, scene art, bright callouts, and stronger fantasy panels.",
    nextHook: "Replace placeholder UI art with a consistent illustrated dragon-book frame kit."
  },
  {
    id: "automation",
    status: "implemented",
    title: "Automated update verification",
    objective: "Prevent the v0.2 gameplay update from regressing into invisible constants.",
    playerProof: "npm run test:auto checks route stops, combat readability, stat hooks, skills, evolution preview, artifacts, and this v0.2 objective surface.",
    nextHook: "Add device screenshot tests when simulator/browser capture is stable."
  }
];

export const fireStarterAdventureMilestones: FireStarterAdventureMilestone[] = [
  {
    id: "capybara-research-loop",
    phase: "research",
    title: "Capybara Go loop to adapt",
    capybaraLesson: "Adventure is the main power ramp: short route pushes, frequent stops, gear/skill choices, and AFK returns make progress feel constant.",
    dragonTwist: "Every stop should read as a hatchling expedition that feeds hoard, evolution heat, and a chosen fire build instead of generic animal upgrades.",
    visibleProof: "Adventure Route → Combat Stop → Return Chest is already visible on route, battle, and reward surfaces."
  },
  {
    id: "fire-starter-route",
    phase: "route",
    title: "Fire starter first expedition",
    capybaraLesson: "The first route should teach stop cadence before it asks for deep optimization.",
    dragonTwist: "Lead with ember feed, bridge slimes, ember caches, claw drills, and a first elite gate so the player feels the Fire hatchling getting sharper.",
    visibleProof: "The 30-node adventure route includes shops, shrines, camps, treasures, fights, elites, and a boss with typed rewards."
  },
  {
    id: "impactful-fire-combat",
    phase: "combat",
    title: "Impactful fire combat stats",
    capybaraLesson: "Stats feel good when combat explains why a hit won: crit, block, dodge, speed, and gear all need readable payoffs.",
    dragonTwist: "Fire builds should visibly split into Ash Warden mitigation, Overheat Fang crit burst, and Sunscale Read tempo control.",
    visibleProof: "Battle results show active skill, skill trigger recap, HP bars, quick-battle pacing, and reward summary."
  },
  {
    id: "evolution-choice-pressure",
    phase: "evolution",
    title: "Evolution choices as build identity",
    capybaraLesson: "Long-term retention comes from permanent growth paths layered on top of short runs.",
    dragonTwist: "Fire evolution should ask: guard the hoard, raid harder, or read ancient flame patterns — each with stat hooks and skill synergy.",
    visibleProof: "Skill Draft Preview and dragon path choices already expose guardian / raider / mystic payoffs."
  }
];

const journeyEventMinDelayMs = 45 * 1000;
const journeyEventMaxDelayMs = 90 * 1000;
const journeyEventEffectDurationMs = 60 * 1000;
const returnPresenceThresholdMs = 10 * 60 * 1000;

const returnPresenceLines = [
  "I missed you.",
  "Look what I found!",
  "I kept your treasure safe.",
  "I think I'm getting stronger...",
  "While exploring, I found this!"
];

export const dragonPathDefinitions: Record<DragonPathId, {
  element: DragonElement;
  role: "guardian" | "raider" | "mystic";
  name: string;
  vow: string;
  description: string;
  bonus: string;
  combatVerb: string;
  combatStyle: string;
  statBoost: Partial<Stats>;
  battleModifier: {
    damageMultiplier: number;
    damageReduction: number;
    tempoLabel: string;
  };
}> = {
  fireGuardian: {
    element: "fire",
    role: "guardian",
    name: "Ash Warden",
    vow: "Protect others.",
    description: "Your hatchling banks its flame into a shield-warm ember glow.",
    bonus: "+8 health, +2 defense",
    combatVerb: "Ember Guard",
    combatStyle: "Protective counters: steadier damage with stronger mitigation.",
    statBoost: { health: 8, defense: 2 },
    battleModifier: { damageMultiplier: 1.04, damageReduction: 0.14, tempoLabel: "guards the line" }
  },
  fireRaider: {
    element: "fire",
    role: "raider",
    name: "Inferno Raider",
    vow: "Grow stronger.",
    description: "Your hatchling snaps forward, eager to turn sparks into a blazing charge.",
    bonus: "+3 attack, +1 speed",
    combatVerb: "Fire Rush",
    combatStyle: "Aggressive opener: highest damage with light mitigation.",
    statBoost: { attack: 3, speed: 1 },
    battleModifier: { damageMultiplier: 1.14, damageReduction: 0.04, tempoLabel: "presses the assault" }
  },
  fireMystic: {
    element: "fire",
    role: "mystic",
    name: "Sunscale Guide",
    vow: "Understand the world.",
    description: "Your hatchling studies the flame, learning to light the safest path ahead.",
    bonus: "+2 attack, +2 defense",
    combatVerb: "Guiding Flame",
    combatStyle: "Balanced reading: reliable damage and modest mitigation.",
    statBoost: { attack: 2, defense: 2 },
    battleModifier: { damageMultiplier: 1.09, damageReduction: 0.09, tempoLabel: "reads the enemy" }
  },
  waterGuardian: {
    element: "water",
    role: "guardian",
    name: "Reef Guardian",
    vow: "Protect others.",
    description: "Your hatchling gathers a calm tide around anyone who stands beside it.",
    bonus: "+10 health, +1 defense",
    combatVerb: "Reef Guard",
    combatStyle: "Tidal guard: absorbs pressure before answering.",
    statBoost: { health: 10, defense: 1 },
    battleModifier: { damageMultiplier: 1.03, damageReduction: 0.16, tempoLabel: "turns the tide" }
  },
  waterRaider: {
    element: "water",
    role: "raider",
    name: "Tide Runner",
    vow: "Grow stronger.",
    description: "Your hatchling darts like racing surf, chasing momentum before enemies can blink.",
    bonus: "+2 attack, +2 speed",
    combatVerb: "Surge Rush",
    combatStyle: "Fast combo: surging damage with slippery defense.",
    statBoost: { attack: 2, speed: 2 },
    battleModifier: { damageMultiplier: 1.12, damageReduction: 0.06, tempoLabel: "chains momentum" }
  },
  waterMystic: {
    element: "water",
    role: "mystic",
    name: "Tide Mystic",
    vow: "Understand the world.",
    description: "Your hatchling listens to moonlit currents and learns to bend the battlefield.",
    bonus: "+1 attack, +3 defense",
    combatVerb: "Moon Tide",
    combatStyle: "Control flow: measured damage with predictive mitigation.",
    statBoost: { attack: 1, defense: 3 },
    battleModifier: { damageMultiplier: 1.08, damageReduction: 0.11, tempoLabel: "bends the flow" }
  },
  earthGuardian: {
    element: "earth",
    role: "guardian",
    name: "Stoneback Sentinel",
    vow: "Protect others.",
    description: "Your hatchling plants its claws and promises nothing fragile will fall behind it.",
    bonus: "+12 health, +1 defense",
    combatVerb: "Stone Guard",
    combatStyle: "Fortress stance: low-risk strikes with the strongest mitigation.",
    statBoost: { health: 12, defense: 1 },
    battleModifier: { damageMultiplier: 1.02, damageReduction: 0.18, tempoLabel: "anchors the fight" }
  },
  earthRaider: {
    element: "earth",
    role: "raider",
    name: "Crystal Fang",
    vow: "Grow stronger.",
    description: "Your hatchling's claws glint like gems, hungry for decisive strikes and treasure.",
    bonus: "+3 attack, +1 defense",
    combatVerb: "Crystal Fang",
    combatStyle: "Heavy break: sharp damage while staying braced.",
    statBoost: { attack: 3, defense: 1 },
    battleModifier: { damageMultiplier: 1.13, damageReduction: 0.07, tempoLabel: "breaks armor" }
  },
  earthMystic: {
    element: "earth",
    role: "mystic",
    name: "Rootspeaker",
    vow: "Understand the world.",
    description: "Your hatchling listens beneath the soil, following old roots toward hidden power.",
    bonus: "+6 health, +2 defense",
    combatVerb: "Root Bind",
    combatStyle: "Battlefield control: steady damage and root-wrapped mitigation.",
    statBoost: { health: 6, defense: 2 },
    battleModifier: { damageMultiplier: 1.07, damageReduction: 0.12, tempoLabel: "binds the opening" }
  },
  lightGuardian: {
    element: "light",
    role: "guardian",
    name: "Halo Warden",
    vow: "Protect others.",
    description: "Your hatchling gathers a sunrise ring around the party and refuses to let the light go out.",
    bonus: "+10 health, +2 block",
    combatVerb: "Halo Guard",
    combatStyle: "Radiant guard: visible shields and recovery-leaning mitigation.",
    statBoost: { health: 10, block: 2 },
    battleModifier: { damageMultiplier: 1.025, damageReduction: 0.17, tempoLabel: "raises a halo" }
  },
  lightRaider: {
    element: "light",
    role: "raider",
    name: "Sunlance Striker",
    vow: "Grow stronger.",
    description: "Your hatchling focuses every sparkle into a sharp, decisive beam strike.",
    bonus: "+2 attack, +2 crit chance",
    combatVerb: "Sunbeam Lance",
    combatStyle: "Precise burst: crit-forward beam hits with clean visual payoff.",
    statBoost: { attack: 2, critChance: 2 },
    battleModifier: { damageMultiplier: 1.13, damageReduction: 0.05, tempoLabel: "focuses the beam" }
  },
  lightMystic: {
    element: "light",
    role: "mystic",
    name: "Aurora Seer",
    vow: "Understand the world.",
    description: "Your hatchling reads aurora bands, learning when to heal, dodge, or pierce.",
    bonus: "+6 health, +2 speed",
    combatVerb: "Aurora Cycle",
    combatStyle: "Sustain tempo: rotating recovery, speed, and cleansing rays.",
    statBoost: { health: 6, speed: 2 },
    battleModifier: { damageMultiplier: 1.07, damageReduction: 0.1, tempoLabel: "cycles aurora" }
  },
  darkGuardian: {
    element: "dark",
    role: "guardian",
    name: "Void Warden",
    vow: "Protect through fear.",
    description: "Your hatchling pulls danger into a moonless ward before it reaches allies.",
    bonus: "+9 health, +2 block",
    combatVerb: "Void Guard",
    combatStyle: "Curse guard: shields through debuffs and shadow mitigation.",
    statBoost: { health: 9, block: 2 },
    battleModifier: { damageMultiplier: 1.03, damageReduction: 0.165, tempoLabel: "folds the blow" }
  },
  darkRaider: {
    element: "dark",
    role: "raider",
    name: "Nightfang Stalker",
    vow: "Strike unseen.",
    description: "Your hatchling vanishes between sparks, then returns with a curse-marked bite.",
    bonus: "+2 attack, +2 crit chance",
    combatVerb: "Nightfang",
    combatStyle: "Ambush burst: high crit pressure with fragile but flashy sustain.",
    statBoost: { attack: 2, critChance: 2 },
    battleModifier: { damageMultiplier: 1.135, damageReduction: 0.04, tempoLabel: "marks the prey" }
  },
  darkMystic: {
    element: "dark",
    role: "mystic",
    name: "Eclipse Seer",
    vow: "Know hidden things.",
    description: "Your hatchling reads the silence between stars and times every curse.",
    bonus: "+5 health, +2 speed",
    combatVerb: "Eclipse Hex",
    combatStyle: "Debuff tempo: curses, dodge windows, and patient shadow recovery.",
    statBoost: { health: 5, speed: 2 },
    battleModifier: { damageMultiplier: 1.075, damageReduction: 0.095, tempoLabel: "turns the eclipse" }
  }
};

export function getDragonPathChoices(element: DragonElement) {
  return (Object.keys(dragonPathDefinitions) as DragonPathId[]).filter((pathId) => dragonPathDefinitions[pathId].element === element);
}

function getDefaultDragonPath(element: DragonElement): DragonPathId {
  const raiderPath = getDragonPathChoices(element).find((pathId) => dragonPathDefinitions[pathId].role === "raider");
  return raiderPath ?? getDragonPathChoices(element)[0] ?? "fireRaider";
}

export function getDragonPathBattleModifier(state: GameState) {
  const pathId = state.dragon.path;
  if (!pathId) {
    return { damageMultiplier: 1, damageReduction: 0, tempoLabel: "fights on instinct", combatVerb: "Dragon Strike" };
  }

  const path = dragonPathDefinitions[pathId];
  return {
    ...path.battleModifier,
    combatVerb: path.combatVerb
  };
}

export const ACTIVE_SKILL_CROSS_PATH_ESSENCE_COST = 250;

function createEliteSkillDraftOffer(state: GameState, node: AdventureNode): EliteSkillDraftOffer {
  const path = state.dragon.path ? dragonPathDefinitions[state.dragon.path] : null;
  const element = path?.element ?? state.dragon.element ?? "fire";
  const role = path?.role ?? "raider";
  const prioritized = [
    ...dragonSkillDrafts.filter((skill) => skill.elementFocus === element && skill.roleFocus === role),
    ...dragonSkillDrafts.filter((skill) => skill.elementFocus === element && skill.roleFocus !== role),
    ...dragonSkillDrafts.filter((skill) => skill.elementFocus !== element && skill.roleFocus === role),
    ...dragonSkillDrafts
  ];
  const skillIds = Array.from(new Set(prioritized.map((skill) => skill.id))).slice(0, 3);

  return {
    sourceNodeId: node.id,
    sourceNodeTitle: node.title,
    offeredAt: Date.now(),
    skillIds,
    chosenSkillId: null,
    reason: node.kind === "elite"
      ? "Elite victory: choose one run skill for the rest of this adventure."
      : "Battle insight: choose one run skill for the rest of this adventure."
  };
}

export function getActiveSkillUnlockState(state: GameState, skill: DragonSkillDraft) {
  const pathId = state.dragon.path;
  const runDraftOffer = state.adventureRun?.status === "active" && state.lastSkillDraftOffer?.skillIds.includes(skill.id)
    ? state.lastSkillDraftOffer
    : null;
  if (runDraftOffer?.chosenSkillId === skill.id || (runDraftOffer && !runDraftOffer.chosenSkillId)) {
    return {
      unlocked: true,
      requirement: runDraftOffer.chosenSkillId === skill.id
        ? `Temporary run skill picked: ${runDraftOffer.sourceNodeTitle}.`
        : `Choose one temporary run skill from ${runDraftOffer.sourceNodeTitle}.`,
      isPathDefault: false,
      cost: 0
    };
  }

  if (!pathId) {
    return {
      unlocked: false,
      requirement: "Choose a dragon path first or earn a temporary adventure skill draft.",
      isPathDefault: false,
      cost: 0
    };
  }

  const path = dragonPathDefinitions[pathId];
  const isPathDefault = skill.elementFocus === path.element && skill.roleFocus === path.role;
  if (isPathDefault) {
    return {
      unlocked: true,
      requirement: "Unlocked: default path skill.",
      isPathDefault,
      cost: 0
    };
  }

  if (state.lastSkillDraftOffer?.skillIds.includes(skill.id)) {
    if (state.lastSkillDraftOffer.chosenSkillId === skill.id) {
      return {
        unlocked: true,
        requirement: `Draft picked: ${state.lastSkillDraftOffer.sourceNodeTitle}.`,
        isPathDefault,
        cost: 0
      };
    }

    if (!state.lastSkillDraftOffer.chosenSkillId) {
      return {
        unlocked: true,
        requirement: `Choose one draft skill from ${state.lastSkillDraftOffer.sourceNodeTitle}.`,
        isPathDefault,
        cost: 0
      };
    }

    return {
      unlocked: false,
      requirement: `Locked: draft pick already spent on ${state.lastSkillDraftOffer.chosenSkillId}.`,
      isPathDefault,
      cost: 0
    };
  }

  const unlocked = state.lifetimeEssence >= ACTIVE_SKILL_CROSS_PATH_ESSENCE_COST;
  return {
    unlocked,
    requirement: unlocked
      ? `Unlocked: ${ACTIVE_SKILL_CROSS_PATH_ESSENCE_COST} lifetime essence cross-path training.`
      : `Requires ${ACTIVE_SKILL_CROSS_PATH_ESSENCE_COST} lifetime essence to slot cross-path skills.`,
    isPathDefault,
    cost: ACTIVE_SKILL_CROSS_PATH_ESSENCE_COST
  };
}

export function getActiveDragonSkill(state: GameState): DragonSkillDraft | null {
  const selectedSkill = state.selectedActiveSkillId
    ? dragonSkillDrafts.find((skill) => skill.id === state.selectedActiveSkillId)
    : null;
  if (selectedSkill && getActiveSkillUnlockState(state, selectedSkill).unlocked) {
    return selectedSkill;
  }

  const pathId = state.dragon.path;
  if (!pathId) {
    return null;
  }

  const path = dragonPathDefinitions[pathId];
  return dragonSkillDrafts.find((skill) => skill.elementFocus === path.element && skill.roleFocus === path.role) ??
    dragonSkillDrafts.find((skill) => skill.roleFocus === path.role) ??
    null;
}

export function getActiveSkillBattleBonus(skill: DragonSkillDraft | null) {
  if (!skill) {
    return { damageMultiplier: 1, damageReduction: 0, combatEffect: "No active skill slotted yet." };
  }

  return skill.activeBonus;
}

function resolveActiveSkillTriggeredDamage(
  skill: DragonSkillDraft | null,
  playerCrit: boolean,
  playerDamage: number,
  round: number,
  enemyDefense: number
) {
  if (skill?.id === "fire-overheat" && playerCrit) {
    const damage = Math.max(1, Math.round(playerDamage * 0.18));
    return {
      damage,
      log: `Skill trigger: ${skill.name} crit-breath ignites for ${damage} bonus damage.`
    };
  }

  if (skill?.id === "earth-crystal-break" && round === 1) {
    const damage = Math.max(2, Math.round(enemyDefense * 0.35 + playerDamage * 0.08));
    return {
      damage,
      log: `Skill trigger: ${skill.name} opening hit shatters armor for ${damage} armor-pierce damage.`
    };
  }

  return { damage: 0, log: "" };
}

function resolveActiveSkillBlockCounter(skill: DragonSkillDraft | null, blocked: boolean, rawEnemyDamage: number, enemyDamage: number) {
  if (skill?.id === "fire-ember-aegis" && blocked) {
    const preventedDamage = Math.max(0, rawEnemyDamage - enemyDamage);
    const damage = Math.max(2, Math.round(preventedDamage * 0.5 + enemyDamage * 0.25));
    return {
      damage,
      log: `Skill trigger: ${skill.name} counter-burns the attacker for ${damage} counter-burn damage.`
    };
  }

  return { damage: 0, log: "" };
}

function resolveActiveSkillDodgeCounter(skill: DragonSkillDraft | null, dodged: boolean, dragonProfile: { speedTempo: number; attack: number }) {
  if (skill?.id === "storm-afterimage" && dodged) {
    const damage = Math.max(2, Math.round(dragonProfile.speedTempo * 0.55 + dragonProfile.attack * 0.12));
    return {
      damage,
      log: `Skill trigger: ${skill.name} snaps back for ${damage} afterimage slash damage.`
    };
  }

  return { damage: 0, log: "" };
}

function summarizeActiveSkill(skill: DragonSkillDraft | null, combatEffect: string): ActiveSkillSummary | undefined {
  if (!skill) {
    return undefined;
  }

  return {
    id: skill.id,
    name: skill.name,
    elementFocus: skill.elementFocus,
    roleFocus: skill.roleFocus,
    trigger: skill.trigger,
    combatEffect
  };
}

type JourneyEventChoiceDefinition = {
  id: string;
  label: string;
  detail: string;
  costEssence?: number;
  requiredElement?: DragonElement;
  effect?: {
    label: string;
    type: JourneyEventEffectType;
    multiplier: number;
  };
  reward?: {
    essence?: number;
    treasure?: boolean;
  };
  risk?: {
    essenceLossPercent?: number;
  };
};

export const journeyEventDefinitions: Record<JourneyEventId, { title: string; description: string; choices: JourneyEventChoiceDefinition[] }> = {
  wanderingMerchant: {
    title: "Wandering Merchant",
    description: "A hooded trader offers a crystal that hums near your dragon.",
    choices: [
      { id: "buyCrystal", label: "Buy crystal", detail: "Spend 120 essence for +20% EPS for 60s.", costEssence: 120, effect: { label: "Merchant Crystal", type: "eps", multiplier: 1.2 } },
      { id: "ignoreMerchant", label: "Ignore", detail: "Keep moving. Nothing happens." },
      { id: "intimidateMerchant", label: "Intimidate", detail: "Fire: +25% battle damage for 60s. Otherwise risk losing essence.", requiredElement: "fire", effect: { label: "Frightened Foes", type: "battleDamage", multiplier: 1.25 }, risk: { essenceLossPercent: 0.08 } }
    ]
  },
  injuredAdventurer: {
    title: "Injured Adventurer",
    description: "A wounded traveler asks for a spark of dragon magic.",
    choices: [
      { id: "helpAdventurer", label: "Help", detail: "Gain +15% quest rewards for 60s.", effect: { label: "Hero's Thanks", type: "questReward", multiplier: 1.15 } },
      { id: "takeMap", label: "Take map", detail: "Find a guaranteed treasure.", reward: { treasure: true } },
      { id: "walkPast", label: "Walk past", detail: "No delay. No reward." }
    ]
  },
  ancientShrine: {
    title: "Ancient Shrine",
    description: "Old runes pulse with a power your dragon recognizes.",
    choices: [
      { id: "prayForGrowth", label: "Pray", detail: "+20% EPS for 60s.", effect: { label: "Shrine Growth", type: "eps", multiplier: 1.2 } },
      { id: "absorbEnergy", label: "Absorb", detail: "+25% tap essence for 60s.", effect: { label: "Stored Spark", type: "tap", multiplier: 1.25 } },
      { id: "leaveShrine", label: "Leave", detail: "Avoid disturbing the shrine." }
    ]
  },
  treasureGoblin: {
    title: "Treasure Goblin",
    description: "A goblin jingles a pouch and bolts for the brush.",
    choices: [
      { id: "chaseGoblin", label: "Chase", detail: "Guaranteed treasure.", reward: { treasure: true } },
      { id: "blastGoblin", label: "Blast path", detail: "+30% battle damage for 60s.", effect: { label: "Battle Frenzy", type: "battleDamage", multiplier: 1.3 } },
      { id: "letGoblinGo", label: "Let go", detail: "+80 essence for staying focused.", reward: { essence: 80 } }
    ]
  },
  elementalStorm: {
    title: "Elemental Storm",
    description: "Wild magic cracks across the sky.",
    choices: [
      { id: "rideStorm", label: "Ride it", detail: "+15% EPS for 60s.", effect: { label: "Storm Charge", type: "eps", multiplier: 1.15 } },
      { id: "shieldNest", label: "Shield nest", detail: "Upgrades 15% cheaper for 60s.", effect: { label: "Settled Winds", type: "upgradeCost", multiplier: 0.85 } },
      { id: "waitStorm", label: "Wait", detail: "Quest rewards -15% for 60s.", effect: { label: "Storm Delay", type: "questReward", multiplier: 0.85 } }
    ]
  },
  sleepingBeast: {
    title: "Sleeping Beast",
    description: "A huge beast sleeps beside the trail.",
    choices: [
      { id: "sneakPast", label: "Sneak", detail: "Upgrades 10% cheaper for 60s.", effect: { label: "Quiet Focus", type: "upgradeCost", multiplier: 0.9 } },
      { id: "wakeBeast", label: "Wake it", detail: "+35% battle damage for 60s.", effect: { label: "Battle Frenzy", type: "battleDamage", multiplier: 1.35 } },
      { id: "feedBeast", label: "Feed it", detail: "Lose 10% essence, then gain +20% quest rewards for 60s.", risk: { essenceLossPercent: 0.1 }, effect: { label: "Beast's Favor", type: "questReward", multiplier: 1.2 } }
    ]
  },
  lostCaravan: {
    title: "Lost Caravan",
    description: "Merchants are stuck at a fork in the road.",
    choices: [
      { id: "guideCaravan", label: "Guide", detail: "+100 essence.", reward: { essence: 100 } },
      { id: "tradeSupplies", label: "Trade", detail: "Spend 80 essence. Upgrades 20% cheaper for 60s.", costEssence: 80, effect: { label: "Caravan Supplies", type: "upgradeCost", multiplier: 0.8 } },
      { id: "searchWagons", label: "Search", detail: "Small gamble: lose 8% essence or find treasure.", risk: { essenceLossPercent: 0.08 }, reward: { treasure: true } }
    ]
  },
  dragonMemory: {
    title: "Dragon Memory",
    description: "A flash of an ancient dragon life burns behind your eyes.",
    choices: [
      { id: "rememberHunt", label: "The hunt", detail: "+30% critical tap chance for 60s.", effect: { label: "Memory of Claws", type: "criticalTap", multiplier: 1.3 } },
      { id: "rememberHoard", label: "The hoard", detail: "Guaranteed treasure.", reward: { treasure: true } },
      { id: "forgetMemory", label: "Let it fade", detail: "+60 essence.", reward: { essence: 60 } }
    ]
  }
};

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayKey() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().slice(0, 10);
}

export function hasPendingDailyLoginReward(state: GameState) {
  return state.lastLoginRewardDate !== getTodayKey();
}

export function getPendingDailyLoginRewardDay(state: GameState) {
  if (!hasPendingDailyLoginReward(state)) {
    return state.loginStreakDay || 1;
  }

  const continuesStreak = state.lastLoginRewardDate === getYesterdayKey();
  if (!continuesStreak) {
    return 1;
  }

  return state.loginStreakDay >= 5 ? 1 : state.loginStreakDay + 1;
}

function createDailyGoals() {
  return {
    completeAdventure1: { progress: 0, claimed: false },
    completeQuest5: { progress: 0, claimed: false },
    buyUpgrade3: { progress: 0, claimed: false },
    earnTreasure1: { progress: 0, claimed: false }
  };
}

function normalizeDailyGoal(goal: Partial<DailyGoalState> | undefined): DailyGoalState {
  return {
    progress: Number(goal?.progress ?? 0),
    claimed: Boolean(goal?.claimed ?? false)
  };
}

function normalizeDailyGoals(goals: Partial<Record<DailyGoalId, Partial<DailyGoalState> | undefined>> | undefined): Record<DailyGoalId, DailyGoalState> {
  return {
    completeAdventure1: normalizeDailyGoal(goals?.completeAdventure1),
    completeQuest5: normalizeDailyGoal(goals?.completeQuest5),
    buyUpgrade3: normalizeDailyGoal(goals?.buyUpgrade3),
    earnTreasure1: normalizeDailyGoal(goals?.earnTreasure1)
  };
}

export const idleUpgradeDefinitions: Record<IdleUpgradeId, { name: string; baseCost: number; costGrowth: number; adventureLootBonus: number }> = {
  manaSprout: {
    name: "Mana Sprout",
    baseCost: BALANCE.upgrades.idle.manaSprout.baseCost,
    costGrowth: BALANCE.upgrades.idle.manaSprout.costGrowth,
    adventureLootBonus: 1
  },
  crystalNest: {
    name: "Crystal Nest",
    baseCost: BALANCE.upgrades.idle.crystalNest.baseCost,
    costGrowth: BALANCE.upgrades.idle.crystalNest.costGrowth,
    adventureLootBonus: 5
  },
  ancientRoot: {
    name: "Ancient Root",
    baseCost: BALANCE.upgrades.idle.ancientRoot.baseCost,
    costGrowth: BALANCE.upgrades.idle.ancientRoot.costGrowth,
    adventureLootBonus: 25
  }
};

export const idleUpgradeOrder: IdleUpgradeId[] = ["manaSprout", "crystalNest", "ancientRoot"];

export const areaDefinitions: Record<AreaId, { name: string; rewardMultiplier: number; unlockDefeats: number }> = {
  mysticMeadow: { name: "Mystic Meadow", rewardMultiplier: BALANCE.questRewardScaling.areaMultipliers.mysticMeadow, unlockDefeats: 0 },
  emberWoods: { name: "Ember Woods", rewardMultiplier: BALANCE.questRewardScaling.areaMultipliers.emberWoods, unlockDefeats: 8 },
  tideCavern: { name: "Tide Cavern", rewardMultiplier: BALANCE.questRewardScaling.areaMultipliers.tideCavern, unlockDefeats: 20 },
  stonebackHills: { name: "Stoneback Hills", rewardMultiplier: BALANCE.questRewardScaling.areaMultipliers.stonebackHills, unlockDefeats: 40 },
  skyRuins: { name: "Sky Ruins", rewardMultiplier: BALANCE.questRewardScaling.areaMultipliers.skyRuins, unlockDefeats: 75 },
  voidNest: { name: "Void Nest", rewardMultiplier: BALANCE.questRewardScaling.areaMultipliers.voidNest, unlockDefeats: 125 }
};

export const areaOrder: AreaId[] = ["mysticMeadow", "emberWoods", "tideCavern", "stonebackHills", "skyRuins", "voidNest"];

export const autoBattleEnemyDefinitions: Record<AreaId, string[]> = {
  mysticMeadow: ["Slime", "Forest Imp", "Moss Sprite"],
  emberWoods: ["Ember Wolf", "Ash Goblin", "Cinder Stag"],
  tideCavern: ["Cave Crab", "Drowned Spirit", "Pearl Serpent"],
  stonebackHills: ["Rock Boar", "Stone Golem", "Basalt Ram"],
  skyRuins: ["Cloud Harpy", "Storm Sentinel", "Aether Drake"],
  voidNest: ["Voidling", "Nightmare Wyrm", "Rift Herald"]
};

export const idleQuestDefinitions: Record<IdleQuestId, { title: string; target: number; rewardEssence: number }> = {
  defeatSlimes: { title: "Defeat 10 slimes", target: 10, rewardEssence: 6 },
  gatherCrystals: { title: "Gather 25 essence crystals", target: 25, rewardEssence: 8 },
  findScale: { title: "Find 1 ancient scale", target: 1, rewardEssence: 18 }
};

export const idleQuestOrder: IdleQuestId[] = ["defeatSlimes", "gatherCrystals", "findScale"];

export const treasureRarityDefinitions: Record<TreasureRarity, { label: string; color: string }> = {
  common: { label: "Common", color: "#d8cfef" },
  rare: { label: "Rare", color: "#70d7ff" },
  epic: { label: "Epic", color: "#c58cff" },
  legendary: { label: "Legendary", color: "#f8d987" }
};

export const treasureDefinitions: Record<TreasureId, { name: string; bonus: string; rarity: TreasureRarity }> = {
  tinyCrown: { name: "Tiny Crown", bonus: "+5% tap essence", rarity: "common" },
  glowingScale: { name: "Glowing Scale", bonus: "+5% EPS", rarity: "common" },
  ancientCoin: { name: "Ancient Coin", bonus: "+5% quest rewards", rarity: "common" },
  dragonFang: { name: "Dragon Fang", bonus: "+5% battle damage", rarity: "rare" },
  manaPearl: { name: "Mana Pearl", bonus: "+4% EPS", rarity: "rare" },
  worldrootSeed: { name: "Worldroot Seed", bonus: "3% cheaper upgrades", rarity: "epic" },
  phoenixEmber: { name: "Phoenix Ember", bonus: "+8% tap essence", rarity: "epic" },
  leviathanTear: { name: "Leviathan Tear", bonus: "+8% offline rewards", rarity: "legendary" },
  titanStone: { name: "Titan Stone", bonus: "+8% battle rewards", rarity: "legendary" }
};

export const treasureOrder: TreasureId[] = [
  "tinyCrown",
  "glowingScale",
  "ancientCoin",
  "dragonFang",
  "manaPearl",
  "worldrootSeed",
  "phoenixEmber",
  "leviathanTear",
  "titanStone"
];

export const equipmentSlots: EquipmentSlot[] = ["horn", "scales", "claws", "relic"];

export const equipmentRarities: EquipmentRarity[] = ["common", "rare", "epic", "legendary"];

export const equipmentBonusLabels: Record<EquipmentBonusType, string> = {
  adventureLoot: "Adventure loot",
  questReward: "Quest rewards",
  battleDamage: "Battle damage",
  treasureDrop: "Treasure drop"
};

export const equipmentSlotLabels: Record<EquipmentSlot, string> = {
  horn: "Horn",
  scales: "Scales",
  claws: "Claws",
  relic: "Relic"
};

export const equipmentRarityDefinitions: Record<EquipmentRarity, { label: string; color: string; bonusRange: [number, number]; sellValue: number }> = {
  common: { label: "Common", color: "#d8cfef", bonusRange: [4, 7], sellValue: 40 },
  rare: { label: "Rare", color: "#70d7ff", bonusRange: [8, 12], sellValue: 120 },
  epic: { label: "Epic", color: "#c58cff", bonusRange: [13, 18], sellValue: 360 },
  legendary: { label: "Legendary", color: "#f8d987", bonusRange: [20, 28], sellValue: 950 }
};

export const elementBonusDefinitions: Record<DragonElement, { title: string; bonuses: string[]; lootTone: string }> = {
  fire: {
    title: "Fire Ferocity",
    bonuses: ["Quest actions every 8s", "+20% battle momentum", "Aggressive loot bursts"],
    lootTone: "The hoard burns brighter"
  },
  water: {
    title: "Water Flow",
    bonuses: ["+15% adventure loot flow", "+25% return rewards", "Calm mystical loot"],
    lootTone: "The tide reveals"
  },
  earth: {
    title: "Earth Endurance",
    bonuses: ["15% cheaper upgrades", "+20% treasure chance", "Ancient sturdy loot"],
    lootTone: "The old stone yields"
  },
  light: {
    title: "Light Radiance",
    bonuses: ["+10% crit clarity", "+15% recovery tempo", "Radiant hoard shine"],
    lootTone: "The light reveals"
  },
  dark: {
    title: "Dark Eclipse",
    bonuses: ["+10% curse pressure", "+15% ambush tempo", "Umbral hoard shine"],
    lootTone: "The eclipse reveals"
  }
};

export type EvolutionTraitDefinition = {
  id: EvolutionTraitId;
  name: string;
  bonus: string;
};

export type RewardDefinition = {
  essence?: number;
  dragonSouls?: number;
  shards?: Partial<Record<DragonElement, number>>;
};

export const achievementDefinitions: Record<AchievementId, { title: string; description: string; reward: RewardDefinition }> = {
  firstHatch: { title: "First Hatch", description: "Reach Hatchling.", reward: { essence: 50 } },
  firstDrake: { title: "First Drake", description: "Reach Drake.", reward: { essence: 150 } },
  firstDragon: { title: "First Dragon", description: "Reach Dragon.", reward: { dragonSouls: 1 } },
  firstWyrm: { title: "First Wyrm", description: "Reach Wyrm.", reward: { dragonSouls: 2 } },
  soulbound: { title: "Soulbound", description: "Reincarnate once.", reward: { dragonSouls: 1 } },
  treasureHoarder: { title: "Treasure Hoarder", description: "Collect 5 treasures.", reward: { essence: 500 } },
  essenceTycoon: { title: "Essence Tycoon", description: "Earn 100,000 lifetime essence.", reward: { dragonSouls: 3 } }
};

export const achievementOrder: AchievementId[] = [
  "firstHatch",
  "firstDrake",
  "firstDragon",
  "firstWyrm",
  "soulbound",
  "treasureHoarder",
  "essenceTycoon"
];

export const dailyGoalDefinitions: Record<DailyGoalId, { title: string; target: number; reward: RewardDefinition }> = {
  completeAdventure1: { title: "Complete 1 adventure", target: 1, reward: { essence: 120, shards: { fire: 1 } } },
  completeQuest5: { title: "Complete 5 quest actions", target: 5, reward: { essence: 180, shards: { water: 1 } } },
  buyUpgrade3: { title: "Buy 3 upgrades", target: 3, reward: { essence: 220, shards: { earth: 1 } } },
  earnTreasure1: { title: "Earn 1 treasure", target: 1, reward: { essence: 300, shards: { fire: 1, water: 1, earth: 1 } } }
};

export const dailyGoalOrder: DailyGoalId[] = ["completeAdventure1", "completeQuest5", "buyUpgrade3", "earnTreasure1"];

export const dailyLoginRewardDefinitions: Record<number, { title: string; reward: RewardDefinition }> = {
  1: { title: "Essence Cache", reward: { essence: 150 } },
  2: { title: "Elemental Shards", reward: { shards: { fire: 1, water: 1, earth: 1, light: 1, dark: 1 } } },
  3: { title: "Treasure Find", reward: {} },
  4: { title: "Greater Essence Cache", reward: { essence: 500 } },
  5: { title: "Dragon Soul", reward: { dragonSouls: 1 } }
};

export const evolutionTraitDefinitions: Record<DragonElement, EvolutionTraitDefinition[]> = {
  fire: [
    { id: "flameclawDrake", name: "Flameclaw Drake", bonus: "+25% tap essence" },
    { id: "ashwingDrake", name: "Ashwing Drake", bonus: "+20% quest rewards" }
  ],
  water: [
    { id: "tideheartDrake", name: "Tideheart Drake", bonus: "+20% EPS" },
    { id: "mistveilDrake", name: "Mistveil Drake", bonus: "+25% offline rewards" }
  ],
  earth: [
    { id: "ironrootDrake", name: "Ironroot Drake", bonus: "Upgrades cost 10% less" },
    { id: "gemscaleDrake", name: "Gemscale Drake", bonus: "+25% treasure drop chance" }
  ],
  light: [
    { id: "haloheartDrake", name: "Haloheart Drake", bonus: "+15% block and recovery identity" },
    { id: "sunlanceDrake", name: "Sunlance Drake", bonus: "+20% crit damage clarity" }
  ],
  dark: [
    { id: "voidscaleDrake", name: "Voidscale Drake", bonus: "+15% curse mitigation identity" },
    { id: "nightfangDrake", name: "Nightfang Drake", bonus: "+20% ambush crit clarity" }
  ]
};

export const initialGameState: GameState = {
  dragon: {
    name: "Unnamed Egg",
    stage: "egg",
    element: null,
    path: null,
    level: 1,
    xp: 0,
    evolution: 0,
    stats: baseStats,
    chosenTraits: []
  },
  player: {
    gold: 80,
    gems: 0,
    essence: 10,
    inventory: [],
    unlockedStage: 1,
    battlesWon: 0,
    upgradesBought: 0,
    stagesCleared: 0,
    claimedQuests: []
  },
  idleUpgrades: {
    manaSprout: 0,
    crystalNest: 0,
    ancientRoot: 0
  },
  currentArea: "mysticMeadow",
  idleQuestProgress: {
    defeatSlimes: 0,
    gatherCrystals: 0,
    findScale: 0
  },
  treasures: {
    tinyCrown: 0,
    glowingScale: 0,
    ancientCoin: 0,
    dragonFang: 0,
    manaPearl: 0,
    worldrootSeed: 0,
    phoenixEmber: 0,
    leviathanTear: 0,
    titanStone: 0
  },
  equippedItems: {},
  equipmentInventory: [],
  elementalShards: {
    fire: 0,
    water: 0,
    earth: 0,
    light: 0,
    dark: 0
  },
  selectedEvolutionTraits: {},
  selectedActiveSkillId: null,
  lifetimeEssence: 0,
  dragonSouls: 0,
  totalReincarnations: 0,
  unlockedAchievements: [],
  claimedAchievements: [],
  dailyGoals: createDailyGoals(),
  dailyResetDate: getTodayKey(),
  autoBattle: createAutoBattle("mysticMeadow"),
  lastLoot: null,
  lastSavedAt: Date.now(),
  eggAnswers: {},
  eggTaps: 0,
  phase: "egg",
  currentQuestionIndex: 0,
  journeyStep: 0,
  activeScreen: "egg",
  lastBattle: null,
  adventureRun: null,
  adventureCompletions: {
    hatchlingTrail: 0,
    drakeExpedition: 0,
    shadowVale: 0,
    ancientRift: 0
  },
  completedAdventureRuns: 0,
  lastAdventureRewards: null,
  lastSkillDraftOffer: null,
  tutorialCompleted: false,
  lastLoginRewardDate: null,
  loginStreakDay: 0,
  settings: defaultSettings,
  playtestNotes: [],
  guidedPlaytest: {
    active: false,
    completedStepIds: [],
    startedAt: null
  },
  journeyEvents: {
    activeEventId: null,
    nextEventAt: Date.now() + journeyEventMinDelayMs,
    activeEffects: []
  },
  returnPresence: {
    active: false,
    startedAt: null,
    awayDurationMs: 0,
    line: "",
    offlineReward: 0,
    pendingOfflineReward: 0,
    rewardApplied: false,
    lastSaveDateBefore: null,
    lastSaveDateAfter: null
  }
};

const elementStatBonus: Record<DragonElement, Partial<Stats>> = {
  fire: { attack: 8, speed: 2 },
  water: { health: 22, speed: 3 },
  earth: { health: 14, defense: 6 },
  light: { attack: 4, health: 12, critChance: 3, speed: 1 },
  dark: { attack: 5, health: 8, critChance: 3, speed: 2 }
};

export const elementAdvantage: Record<DragonElement, DragonElement[]> = {
  fire: ["earth"],
  earth: ["water"],
  water: ["fire"],
  light: ["dark"],
  dark: ["light"]
};

export function getElementMatchupMultiplier(attacker: DragonElement, defender: DragonElement) {
  return elementAdvantage[attacker]?.includes(defender) ? 1.22 : 1;
}

export function getDragonForm(stage: DragonStage, element: DragonElement | null) {
  const resolvedElement = element ?? "fire";
  return dragonForms.find((form) => form.stage === stage && form.element === resolvedElement) ?? dragonForms[0];
}

export function getUpgradeCost(state: GameState, stat: keyof Stats) {
  const statValue = state.dragon.stats[stat];
  const base = stat === "health" ? BALANCE.upgrades.statUpgrade.healthBaseCost : BALANCE.upgrades.statUpgrade.otherBaseCost;
  return applyUpgradeCostBonus(
    state,
    Math.round(base + statValue * BALANCE.upgrades.statUpgrade.statValueMultiplier + state.player.upgradesBought * BALANCE.upgrades.statUpgrade.purchaseScaling)
  );
}

export function getIdleUpgradeCost(state: GameState, upgradeId: IdleUpgradeId) {
  const upgrade = idleUpgradeDefinitions[upgradeId];
  const level = state.idleUpgrades[upgradeId] ?? 0;
  return applyUpgradeCostBonus(state, Math.floor(upgrade.baseCost * Math.pow(upgrade.costGrowth, level)));
}

function getJourneyEventDelayMs() {
  return journeyEventMinDelayMs + Math.floor(Math.random() * (journeyEventMaxDelayMs - journeyEventMinDelayMs));
}

export function scheduleNextJourneyEvent(now = Date.now()) {
  return now + getJourneyEventDelayMs();
}

function pickJourneyEventId(): JourneyEventId {
  const eventIds = Object.keys(journeyEventDefinitions) as JourneyEventId[];
  return eventIds[Math.floor(Math.random() * eventIds.length)] ?? "ancientShrine";
}

function pickReturnPresenceLine() {
  return returnPresenceLines[Math.floor(Math.random() * returnPresenceLines.length)] ?? "I missed you.";
}

function createReturnPresence(awayDurationMs: number, offlineReward: number, lastSaveDateBefore: number | null) {
  return {
    active: true,
    startedAt: Date.now(),
    awayDurationMs,
    line: pickReturnPresenceLine(),
    offlineReward,
    pendingOfflineReward: offlineReward,
    rewardApplied: false,
    lastSaveDateBefore,
    lastSaveDateAfter: null
  };
}

export function getActiveJourneyEffects(state: GameState, now = Date.now()) {
  return state.journeyEvents.activeEffects.filter((effect) => effect.expiresAt > now);
}

export function getJourneyEventEffectMultiplier(state: GameState, type: JourneyEventEffectType) {
  return getActiveJourneyEffects(state)
    .filter((effect) => effect.type === type)
    .reduce((multiplier, effect) => multiplier * effect.multiplier, 1);
}

function removeExpiredJourneyEffects(state: GameState, now = Date.now()) {
  const activeEffects = getActiveJourneyEffects(state, now);
  return activeEffects.length === state.journeyEvents.activeEffects.length
    ? state
    : {
        ...state,
        journeyEvents: {
          ...state.journeyEvents,
          activeEffects
        }
      };
}

export function getIdleUpgradeCap(state: GameState, upgradeId: IdleUpgradeId) {
  return BALANCE.upgrades.idleCapsByStage[state.dragon.stage]?.[upgradeId] ?? 0;
}

export function isIdleUpgradeCapped(state: GameState, upgradeId: IdleUpgradeId) {
  const cap = getIdleUpgradeCap(state, upgradeId);
  return cap > 0 && (state.idleUpgrades[upgradeId] ?? 0) >= cap;
}

export function getEssencePerSecond(state: GameState) {
  const base = idleUpgradeOrder.reduce((total, upgradeId) => {
    const level = state.idleUpgrades[upgradeId] ?? 0;
    return total + level * idleUpgradeDefinitions[upgradeId].adventureLootBonus;
  }, 0);
  const treasureMultiplier = 1 + (state.treasures.glowingScale ?? 0) * 0.05 + (state.treasures.manaPearl ?? 0) * 0.04;
  const elementMultiplier = state.dragon.element === "water" ? 1.15 : 1;
  const traitMultiplier = hasEvolutionTrait(state, "tideheartDrake") ? 1.2 : 1;
  return Math.round(base * treasureMultiplier * elementMultiplier * traitMultiplier * getDragonSoulMultiplier(state) * getEquipmentBonusMultiplier(state, "adventureLoot") * getJourneyEventEffectMultiplier(state, "eps") * 10) / 10;
}

export function getTapEssence(state: GameState) {
  const stageBonus = state.dragon.stage === "wyrm" ? 10 : state.dragon.stage === "dragon" ? 8 : state.dragon.stage === "drake" ? 4 : 1;
  const base = stageBonus + Math.floor(getEssencePerSecond(state) / 20);
  const treasureMultiplier = 1 + (state.treasures.tinyCrown ?? 0) * 0.05 + (state.treasures.phoenixEmber ?? 0) * 0.08;
  const elementMultiplier = state.dragon.element === "fire" ? 1.2 : 1;
  const traitMultiplier = hasEvolutionTrait(state, "flameclawDrake") ? 1.25 : 1;
  return Math.max(1, Math.floor(base * treasureMultiplier * elementMultiplier * traitMultiplier * getDragonSoulMultiplier(state) * getEquipmentBonusMultiplier(state, "adventureLoot") * getJourneyEventEffectMultiplier(state, "tap")));
}

export function getQuestIntervalMs(state: GameState) {
  const baseInterval = state.dragon.element === "fire" ? 2800 : 3400;
  const speedTempoBonus = Math.max(0, state.dragon.stats.speed) * 45;
  const stageTempoBonus =
    state.dragon.stage === "wyrm"
      ? 520
      : state.dragon.stage === "dragon"
        ? 380
        : state.dragon.stage === "drake"
          ? 220
          : 0;

  return Math.max(1600, Math.round(baseInterval - speedTempoBonus - stageTempoBonus));
}

export function getTreasureDropChance(state: GameState) {
  const power = getQuestPower(state);
  const baseChance = Math.min(BALANCE.dropRates.treasure.baseChanceCap, BALANCE.dropRates.treasure.baseChance + power * BALANCE.dropRates.treasure.powerScale);
  const elementMultiplier = state.dragon.element === "earth" ? BALANCE.dropRates.treasure.earthMultiplier : 1;
  const traitMultiplier = hasEvolutionTrait(state, "gemscaleDrake") ? BALANCE.dropRates.treasure.gemscaleMultiplier : 1;
  return Math.min(BALANCE.dropRates.treasure.maxChance, baseChance * elementMultiplier * traitMultiplier * getEquipmentBonusMultiplier(state, "treasureDrop"));
}

export function getOfflineEssenceReward(state: GameState, elapsedMs: number) {
  const seconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const cappedSeconds = Math.min(seconds, 60 * 60 * 8);
  return Math.floor(getEssencePerSecond(state) * cappedSeconds * getOfflineRewardMultiplier(state));
}

export function getDragonSoulMultiplier(state: GameState) {
  return 1 + state.dragonSouls * BALANCE.reincarnation.soulBonusPerSoul;
}

export function getReincarnationSoulsGained(state: GameState) {
  if (state.dragon.stage !== "wyrm") {
    return 0;
  }

  const totalPotentialSouls = Math.floor(Math.sqrt(state.lifetimeEssence / BALANCE.reincarnation.lifetimeEssenceDivisor));
  return Math.max(0, totalPotentialSouls - state.dragonSouls);
}

export function canReincarnate(state: GameState) {
  return state.dragon.stage === "wyrm";
}

export function getDragonPower(state: GameState) {
  const stagePower =
    state.dragon.stage === "wyrm"
      ? 900
      : state.dragon.stage === "dragon"
        ? 620
        : state.dragon.stage === "drake"
          ? 360
          : state.dragon.stage === "hatchling"
            ? 140
            : 40;
  const economyPower = getEssencePerSecond(state) * 9 + getTapEssence(state) * 28;
  const treasurePower = getTreasureTotal(state) * 35;
  const soulPower = state.dragonSouls * 75;
  return Math.max(1, Math.floor((stagePower + economyPower + treasurePower + soulPower) * getDragonSoulMultiplier(state)));
}

export function getCombatStatProfile(stats: Stats) {
  const critChance = Math.min(0.6, Math.max(0, stats.critChance) / 100 + stats.speed * 0.002);
  const critDamage = Math.max(1.1, stats.critDamage / 100);
  const blockChance = Math.min(0.5, Math.max(0, stats.block) / 100 + stats.defense * 0.006);
  const dodgeChance = Math.min(0.42, Math.max(0, stats.dodge) / 100 + stats.speed * 0.005);
  const blockReduction = Math.min(0.75, 0.28 + stats.defense * 0.018 + stats.block * 0.006);
  const speedTempo = Math.max(0, stats.speed) * 0.55;

  return {
    attack: stats.attack,
    health: stats.health,
    defense: stats.defense,
    speed: stats.speed,
    block: stats.block,
    dodge: stats.dodge,
    critChance,
    critDamage,
    blockChance,
    dodgeChance,
    blockReduction,
    speedTempo,
    critSummary: `${Math.round(critChance * 100)}% / ${Math.round(critDamage * 100)}%`,
    mitigationSummary: `${Math.round(blockChance * 100)}% block / ${Math.round(dodgeChance * 100)}% dodge`
  };
}

function rollCombatChance(chance: number) {
  return Math.random() < chance;
}

export function getBattleDamage(state: GameState) {
  const elementMultiplier = state.dragon.element === "fire" ? 1.15 : 1;
  const treasureMultiplier = 1 + (state.treasures.dragonFang ?? 0) * 0.05;
  const pathDamageMultiplier = getDragonPathBattleModifier(state).damageMultiplier;
  const profile = getCombatStatProfile(state.dragon.stats);
  const critMultiplier = 1 + profile.critChance * (profile.critDamage - 1);
  const statMultiplier = 1 + (profile.attack * 0.008) + (profile.speedTempo * 0.004);
  return Math.max(1, Math.floor(getDragonPower(state) * 0.18 * statMultiplier * critMultiplier * elementMultiplier * treasureMultiplier * pathDamageMultiplier * getEquipmentBonusMultiplier(state, "battleDamage") * getJourneyEventEffectMultiplier(state, "battleDamage")));
}

export function getBattleRewardEssence(state: GameState) {
  const areaIndex = areaOrder.indexOf(state.autoBattle.areaId);
  const areaMultiplier = Math.max(1, areaIndex + 1);
  const baseReward = 12 * areaMultiplier + getSoftCappedBattleRewardDefeats(state.autoBattle.defeatedCount) * (4 + areaMultiplier);
  const elementMultiplier = state.dragon.element === "earth" ? 1.1 : 1;
  const treasureMultiplier = 1 + (state.treasures.titanStone ?? 0) * 0.08;
  return Math.max(
    1,
    Math.floor(
      baseReward *
        BALANCE.essenceRewards.autoProgressionMultiplier *
        elementMultiplier *
        treasureMultiplier *
        getDragonSoulMultiplier(state) *
        getEquipmentBonusMultiplier(state, "questReward") *
        getJourneyEventEffectMultiplier(state, "questReward") *
        getNearEvolutionRewardAssistMultiplier(state)
    )
  );
}

function getSoftCappedBattleRewardDefeats(defeatedCount: number) {
  const { firstThreshold, firstReduction, secondThreshold, secondReduction } = BALANCE.battleRewardSoftCap;
  if (defeatedCount <= firstThreshold) {
    return defeatedCount;
  }

  const normalDefeats = firstThreshold;
  const midDefeats = Math.min(defeatedCount, secondThreshold) - firstThreshold;
  const lateDefeats = Math.max(0, defeatedCount - secondThreshold);
  return normalDefeats + midDefeats * (1 - firstReduction) + lateDefeats * (1 - secondReduction);
}

function applyUpgradeCostBonus(state: GameState, cost: number) {
  return Math.max(1, Math.floor(cost * getUpgradeCostMultiplier(state)));
}

export function getQuestRewardMultiplier(state: GameState) {
  return (
    BALANCE.essenceRewards.autoProgressionMultiplier *
    areaDefinitions[state.currentArea].rewardMultiplier *
    (1 + (state.treasures.ancientCoin ?? 0) * BALANCE.questRewardScaling.ancientCoinBonus) *
    (hasEvolutionTrait(state, "ashwingDrake") ? BALANCE.questRewardScaling.ashwingTraitMultiplier : 1) *
    getDragonSoulMultiplier(state) *
    getEquipmentBonusMultiplier(state, "questReward") *
    getJourneyEventEffectMultiplier(state, "questReward") *
    getNearEvolutionRewardAssistMultiplier(state)
  );
}

export function getEvolutionProgressRatio(state: GameState) {
  const nextCost = getNextEvolutionCost(state.dragon.stage);
  if (!nextCost || nextCost <= 0) {
    return 0;
  }
  return Math.min(1, state.player.essence / nextCost);
}

export function getNearEvolutionRewardAssistMultiplier(state: GameState) {
  return getEvolutionProgressRatio(state) >= BALANCE.softProgressionAssist.rewardAssistThreshold ? BALANCE.softProgressionAssist.rewardAssistMultiplier : 1;
}

export function isNearEvolutionExcitement(state: GameState) {
  return getEvolutionProgressRatio(state) >= BALANCE.softProgressionAssist.excitementThreshold;
}

export function getCriticalTapChance(state: GameState) {
  const baseChance = isNearEvolutionExcitement(state) ? BALANCE.softProgressionAssist.excitedCriticalTapChance : BALANCE.softProgressionAssist.baseCriticalTapChance;
  return Math.min(0.75, baseChance * getJourneyEventEffectMultiplier(state, "criticalTap"));
}

export function getUpgradeCostMultiplier(state: GameState) {
  const elementMultiplier = state.dragon.element === "earth" ? 0.85 : 1;
  const traitMultiplier = hasEvolutionTrait(state, "ironrootDrake") ? 0.9 : 1;
  const treasureMultiplier = Math.max(0.5, 1 - (state.treasures.worldrootSeed ?? 0) * 0.03);
  return elementMultiplier * traitMultiplier * treasureMultiplier * getJourneyEventEffectMultiplier(state, "upgradeCost");
}

export function getOfflineRewardMultiplier(state: GameState) {
  const elementMultiplier = state.dragon.element === "water" ? 1.25 : 1;
  const traitMultiplier = hasEvolutionTrait(state, "mistveilDrake") ? 1.25 : 1;
  const treasureMultiplier = 1 + (state.treasures.leviathanTear ?? 0) * 0.08;
  return elementMultiplier * traitMultiplier * treasureMultiplier;
}

export function getEquipmentBonusTotal(state: GameState, bonusType: EquipmentBonusType) {
  return Object.values(state.equippedItems ?? {}).reduce((total, item) => {
    return item?.bonusType === bonusType ? total + item.bonusPercent : total;
  }, 0);
}

function getEquipmentBonusMultiplier(state: GameState, bonusType: EquipmentBonusType) {
  return 1 + getEquipmentBonusTotal(state, bonusType) / 100;
}

function getEquipmentDropChance(state: GameState) {
  const areaIndex = Math.max(0, areaOrder.indexOf(state.currentArea));
  return Math.min(BALANCE.dropRates.equipment.maxChance, BALANCE.dropRates.equipment.baseChance + areaIndex * BALANCE.dropRates.equipment.areaBonus);
}

function pickEquipmentRarity(areaId: AreaId, lootTier = 0): EquipmentRarity {
  const areaIndex = Math.max(0, areaOrder.indexOf(areaId)) + Math.max(0, Math.floor(lootTier / 3));
  const roll = Math.random();
  const legendaryChance = BALANCE.dropRates.equipmentRarity.legendaryBase + areaIndex * BALANCE.dropRates.equipmentRarity.legendaryAreaBonus;
  const epicChance = BALANCE.dropRates.equipmentRarity.epicBase + areaIndex * BALANCE.dropRates.equipmentRarity.epicAreaBonus;
  const rareChance = BALANCE.dropRates.equipmentRarity.rareBase + areaIndex * BALANCE.dropRates.equipmentRarity.rareAreaBonus;

  if (roll < legendaryChance) {
    return "legendary";
  }
  if (roll < legendaryChance + epicChance) {
    return "epic";
  }
  if (roll < legendaryChance + epicChance + rareChance) {
    return "rare";
  }
  return "common";
}

function createEquipmentItem(areaId: AreaId, lootTier = 0): EquipmentItem {
  const slot = equipmentSlots[Math.floor(Math.random() * equipmentSlots.length)] ?? "horn";
  const rarity = pickEquipmentRarity(areaId, lootTier);
  const bonusTypes: EquipmentBonusType[] = ["adventureLoot", "questReward", "battleDamage", "treasureDrop"];
  const bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)] ?? "adventureLoot";
  const rarityDefinition = equipmentRarityDefinitions[rarity];
  const [minBonus, maxBonus] = rarityDefinition.bonusRange;
  const bonusPercent = minBonus + Math.floor(Math.random() * (maxBonus - minBonus + 1));
  const slotNames: Record<EquipmentSlot, string[]> = {
    horn: ["Moon Horn", "Cinder Horn", "Runed Horn"],
    scales: ["Guard Scales", "Gleam Scales", "Ancient Scales"],
    claws: ["Razor Claws", "Wild Claws", "Crystal Claws"],
    relic: ["Dragon Relic", "Lost Charm", "Elder Sigil"]
  };
  const name = slotNames[slot][Math.floor(Math.random() * slotNames[slot].length)] ?? equipmentSlotLabels[slot];

  return {
    id: `gear-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    name,
    slot,
    rarity,
    bonusType,
    bonusPercent,
    sellValue: rarityDefinition.sellValue + bonusPercent * 6
  };
}

export function getSelectedEvolutionTrait(state: GameState) {
  const traitId = state.selectedEvolutionTraits.drake;
  if (!traitId) {
    return null;
  }

  return getEvolutionTraitById(traitId);
}

export function getEvolutionTraitById(traitId: EvolutionTraitId) {
  return Object.values(evolutionTraitDefinitions)
    .flat()
    .find((trait) => trait.id === traitId) ?? null;
}

function hasEvolutionTrait(state: GameState, traitId: EvolutionTraitId) {
  return Object.values(state.selectedEvolutionTraits).includes(traitId);
}

export function getNextEvolutionCost(stage: DragonStage) {
  const nextStage = getManualNextStage(stage);
  return nextStage === stage ? null : BALANCE.evolutionCosts[nextStage];
}

function getManualNextStage(stage: DragonStage): DragonStage {
  switch (stage) {
    case "egg":
      return "hatchling";
    case "hatchling":
      return "drake";
    case "drake":
      return "dragon";
    case "dragon":
      return "wyrm";
    case "wyrm":
      return "wyrm";
    default:
      return stage;
  }
}

function getQuestPower(state: GameState) {
  const stagePower = state.dragon.stage === "wyrm" ? 10 : state.dragon.stage === "dragon" ? 8 : state.dragon.stage === "drake" ? 5 : 2;
  return stagePower + Math.floor(state.dragon.stats.attack / 10) + Math.floor(getEssencePerSecond(state) / 10);
}

function getNextArea(areaId: AreaId) {
  const currentIndex = areaOrder.indexOf(areaId);
  return areaOrder[Math.min(areaOrder.length - 1, currentIndex + 1)] ?? areaId;
}

function canUnlockArea(state: GameState, areaId: AreaId) {
  return state.autoBattle.defeatedCount >= areaDefinitions[areaId].unlockDefeats;
}

function createAutoBattle(areaId: AreaId, defeatedCount = 0): AutoBattleState {
  const enemies = autoBattleEnemyDefinitions[areaId];
  const enemyName = enemies[defeatedCount % enemies.length] ?? enemies[0];
  const areaIndex = areaOrder.indexOf(areaId);
  const enemyMaxHp = Math.floor(
    (BALANCE.enemyHpScaling.baseHp * Math.pow(BALANCE.enemyHpScaling.areaGrowth, Math.max(0, areaIndex)) +
      defeatedCount * (BALANCE.enemyHpScaling.defeatedBaseGrowth + areaIndex * BALANCE.enemyHpScaling.defeatedAreaGrowth)) *
      BALANCE.enemyHpScaling.hpMultiplier
  );
  return {
    areaId,
    enemyName,
    enemyHp: enemyMaxHp,
    enemyMaxHp,
    defeatedCount
  };
}

function getQuestIncrement(state: GameState, questId: IdleQuestId) {
  const power = getQuestPower(state);
  switch (questId) {
    case "defeatSlimes":
      return Math.max(1, Math.floor(power / 3));
    case "gatherCrystals":
      return Math.max(2, Math.floor(power / 2));
    case "findScale":
      return 1;
    default:
      return 1;
  }
}

function pickTreasure(areaId: AreaId = "mysticMeadow", lootTier = 0) {
  const areaIndex = Math.max(0, areaOrder.indexOf(areaId)) + Math.max(0, Math.floor(lootTier / 3));
  const roll = Math.random();
  const legendaryChance = BALANCE.dropRates.treasureRarity.legendaryBase + areaIndex * BALANCE.dropRates.treasureRarity.legendaryAreaBonus;
  const epicChance = BALANCE.dropRates.treasureRarity.epicBase + areaIndex * BALANCE.dropRates.treasureRarity.epicAreaBonus;
  const rareChance = BALANCE.dropRates.treasureRarity.rareBase + areaIndex * BALANCE.dropRates.treasureRarity.rareAreaBonus;
  const rarity: TreasureRarity =
    roll < legendaryChance
      ? "legendary"
      : roll < legendaryChance + epicChance
        ? "epic"
        : roll < legendaryChance + epicChance + rareChance
          ? "rare"
          : "common";
  const pool = treasureOrder.filter((treasureId) => treasureDefinitions[treasureId].rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)] ?? "tinyCrown";
}

function getTreasureTotal(state: GameState) {
  return treasureOrder.reduce((total, treasureId) => total + (state.treasures[treasureId] ?? 0), 0);
}

function resetDailyIfNeeded(state: GameState) {
  const today = getTodayKey();
  if (state.dailyResetDate === today) {
    return state;
  }

  return {
    ...state,
    dailyGoals: createDailyGoals(),
    dailyResetDate: today
  };
}

function addDailyProgress(state: GameState, goalId: DailyGoalId, amount: number) {
  const dailyState = resetDailyIfNeeded(state);
  const goal = dailyGoalDefinitions[goalId];
  const current = dailyState.dailyGoals[goalId] ?? { progress: 0, claimed: false };
  return {
    ...dailyState,
    dailyGoals: {
      ...dailyState.dailyGoals,
      [goalId]: {
        ...current,
        progress: Math.min(goal.target, current.progress + amount)
      }
    }
  };
}

function applyReward(state: GameState, reward: RewardDefinition) {
  const essence = reward.essence ?? 0;
  return syncAchievements({
    ...state,
    lifetimeEssence: state.lifetimeEssence + essence,
    dragonSouls: state.dragonSouls + (reward.dragonSouls ?? 0),
    elementalShards: {
      fire: state.elementalShards.fire + (reward.shards?.fire ?? 0),
      water: state.elementalShards.water + (reward.shards?.water ?? 0),
      earth: state.elementalShards.earth + (reward.shards?.earth ?? 0),
      light: state.elementalShards.light + (reward.shards?.light ?? 0),
      dark: (state.elementalShards.dark ?? 0) + (reward.shards?.dark ?? 0)
    },
    player: {
      ...state.player,
      essence: state.player.essence + essence
    }
  });
}

function applyDailyLoginReward(state: GameState) {
  if (!hasPendingDailyLoginReward(state)) {
    return state;
  }

  const rewardDay = getPendingDailyLoginRewardDay(state);
  const definition = dailyLoginRewardDefinitions[rewardDay] ?? dailyLoginRewardDefinitions[1];
  if (rewardDay === 3) {
    const treasureDrop = pickTreasure(state.currentArea);
    return syncAchievements({
      ...state,
      loginStreakDay: rewardDay,
      lastLoginRewardDate: getTodayKey(),
      treasures: {
        ...state.treasures,
        [treasureDrop]: (state.treasures[treasureDrop] ?? 0) + 1
      },
      lastLoot: {
        id: Date.now(),
        message: `Daily login reward: ${treasureDefinitions[treasureDrop].name}.`,
        treasureId: treasureDrop
      }
    });
  }

  return applyReward(
    {
      ...state,
      loginStreakDay: rewardDay,
      lastLoginRewardDate: getTodayKey(),
      lastLoot: {
        id: Date.now(),
        message: `Daily login reward claimed: ${definition.title}.`
      }
    },
    definition.reward
  );
}

function resolveJourneyEventChoice(state: GameState, choiceId: string) {
  const now = Date.now();
  const eventId = state.journeyEvents.activeEventId;
  const event = eventId ? journeyEventDefinitions[eventId] : null;
  const choice = event?.choices.find((entry) => entry.id === choiceId);
  if (!eventId || !event || !choice) {
    return state;
  }

  if (choice.costEssence && state.player.essence < choice.costEssence) {
    return {
      ...state,
      lastLoot: {
        id: now,
        message: "Not enough essence for that choice."
      }
    };
  }

  const elementMatches = !choice.requiredElement || state.dragon.element === choice.requiredElement;
  const appliedEffect = elementMatches ? choice.effect : undefined;
  const riskApplies = choice.risk && (!choice.requiredElement || !elementMatches || Math.random() < 0.5);
  const treasureDrop = choice.reward?.treasure && (!riskApplies || Math.random() < 0.5) ? pickTreasure(state.currentArea) : null;
  const essenceReward = choice.reward?.essence ?? 0;
  const essenceCost = choice.costEssence ?? 0;
  const essenceLoss = riskApplies ? Math.floor(state.player.essence * (choice.risk?.essenceLossPercent ?? 0)) : 0;
  const nextEffect: JourneyEventEffect | null = appliedEffect
    ? {
        id: `event-effect-${now}-${choice.id}`,
        label: appliedEffect.label,
        type: appliedEffect.type,
        multiplier: appliedEffect.multiplier,
        expiresAt: now + journeyEventEffectDurationMs
      }
    : null;

  const messages = [
    event.title,
    nextEffect ? nextEffect.label : null,
    treasureDrop ? `Found ${treasureDefinitions[treasureDrop].name}` : null,
    essenceReward > 0 ? `+${essenceReward} essence` : null,
    essenceCost > 0 ? `-${essenceCost} essence` : null,
    essenceLoss > 0 ? `Risk cost -${essenceLoss} essence` : null
  ].filter(Boolean);

  const nextState: GameState = {
    ...state,
    player: {
      ...state.player,
      essence: Math.max(0, state.player.essence - essenceCost - essenceLoss + essenceReward)
    },
    lifetimeEssence: state.lifetimeEssence + essenceReward,
    treasures: treasureDrop
      ? {
          ...state.treasures,
          [treasureDrop]: (state.treasures[treasureDrop] ?? 0) + 1
        }
      : state.treasures,
    journeyEvents: {
      activeEventId: null,
      nextEventAt: scheduleNextJourneyEvent(now),
      activeEffects: nextEffect ? [...getActiveJourneyEffects(state, now), nextEffect] : getActiveJourneyEffects(state, now)
    },
    lastLoot: {
      id: now,
      message: messages.join(" | "),
      treasureId: treasureDrop ?? undefined
    }
  };

  return treasureDrop ? addDailyProgress(syncAchievements(nextState), "earnTreasure1", 1) : syncAchievements(nextState);
}

function createPlaytestNote(state: GameState, text: string): PlaytestNote {
  return {
    id: `note-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    text: text.trim(),
    timestamp: Date.now(),
    stage: state.dragon.stage,
    element: state.dragon.element,
    essence: state.player.essence,
    area: state.currentArea,
    defeatedCount: state.autoBattle.defeatedCount
  };
}

function syncAchievements(state: GameState) {
  const unlocked = new Set(state.unlockedAchievements);
  if (state.dragon.stage !== "egg") {
    unlocked.add("firstHatch");
  }
  if (state.dragon.stage === "drake" || state.dragon.stage === "dragon" || state.dragon.stage === "wyrm") {
    unlocked.add("firstDrake");
  }
  if (state.dragon.stage === "dragon" || state.dragon.stage === "wyrm") {
    unlocked.add("firstDragon");
  }
  if (state.dragon.stage === "wyrm") {
    unlocked.add("firstWyrm");
  }
  if (state.totalReincarnations >= 1) {
    unlocked.add("soulbound");
  }
  if (getTreasureTotal(state) >= 5) {
    unlocked.add("treasureHoarder");
  }
  if (state.lifetimeEssence >= 100000) {
    unlocked.add("essenceTycoon");
  }

  return {
    ...state,
    unlockedAchievements: achievementOrder.filter((achievementId) => unlocked.has(achievementId))
  };
}

function formatElementLootMessage(state: GameState, questTitle: string, lootParts: Array<string | null>) {
  const element = state.dragon.element ?? "fire";
  const lootText = lootParts.filter(Boolean).join(", ");
  switch (element) {
    case "fire":
      return `${elementBonusDefinitions.fire.lootTone}: ${questTitle} crushed for ${lootText}!`;
    case "water":
      return `${elementBonusDefinitions.water.lootTone}: ${questTitle} flows into ${lootText}.`;
    case "earth":
      return `${elementBonusDefinitions.earth.lootTone}: ${questTitle} grants ${lootText}.`;
    default:
      return `${questTitle}: ${lootText}`;
  }
}

export function getQuestProgress(state: GameState, questId: string) {
  const quest = quests.find((item) => item.id === questId);
  if (!quest) {
    return 0;
  }
  return Math.min(state.player[quest.metric], quest.target);
}

export function getXpToLevel(level: number) {
  return 70 + level * 35;
}

export function getElementScores(answers: Record<string, DragonElement>) {
  const scores: Record<DragonElement, number> = { fire: 0, water: 0, earth: 0, light: 0, dark: 0 };
  Object.values(answers).forEach((element) => {
    scores[element] += 1;
  });
  return scores;
}

export function getLeadingElement(answers: Record<string, DragonElement>): DragonElement {
  const scores = getElementScores(answers);
  return (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as DragonElement) ?? "fire";
}

export function getAdventureNodeById(nodeId: string) {
  return adventureNodes.find((node) => node.id === nodeId);
}

export function getNodeKindLabel(kind: AdventureNode["kind"]) {
  switch (kind) {
    case "battle":
      return "Battle";
    case "elite":
      return "Elite";
    case "treasure":
      return "Treasure";
    case "shrine":
      return "Shrine";
    case "camp":
      return "Camp";
    case "shop":
      return "Shop";
    case "boss":
      return "Boss";
    default:
      return "Node";
  }
}

function applyAutoBattleAction(state: GameState) {
  const battle = state.autoBattle.areaId === state.currentArea ? state.autoBattle : createAutoBattle(state.currentArea);
  const damage = getBattleDamage({ ...state, autoBattle: battle });
  const nextHp = Math.max(0, battle.enemyHp - damage);

  if (nextHp > 0) {
    return {
      ...state,
      autoBattle: {
        ...battle,
        enemyHp: nextHp
      }
    };
  }

  const stateForReward = { ...state, autoBattle: battle };
  const rewardEssence = getBattleRewardEssence(stateForReward);
  const treasureDrop = Math.random() < getTreasureDropChance(stateForReward) ? pickTreasure(state.currentArea) : null;
  const equipmentDrop = Math.random() < getEquipmentDropChance(stateForReward) ? createEquipmentItem(state.currentArea) : null;
  const nextBattle = createAutoBattle(state.currentArea, battle.defeatedCount + 1);
  const victoryFlavor =
    state.dragon.element === "water"
      ? "A calm ward washes over your dragon."
      : state.dragon.element === "earth"
        ? "Stonebound strength turns victory into richer spoils."
        : "Flames tear through the enemy line.";
  const rewardParts = [
    `+${rewardEssence} essence`,
    treasureDrop ? treasureDefinitions[treasureDrop].name : null,
    equipmentDrop ? `${equipmentRarityDefinitions[equipmentDrop.rarity].label} ${equipmentDrop.name}` : null
  ].filter(Boolean);

  const rewardedState: GameState = {
    ...state,
    autoBattle: nextBattle,
    treasures: treasureDrop
      ? {
          ...state.treasures,
          [treasureDrop]: (state.treasures[treasureDrop] ?? 0) + 1
        }
      : state.treasures,
    equipmentInventory: equipmentDrop ? [equipmentDrop, ...(state.equipmentInventory ?? [])] : state.equipmentInventory,
    player: {
      ...state.player,
      essence: state.player.essence + rewardEssence
    },
    lifetimeEssence: state.lifetimeEssence + rewardEssence,
    lastLoot: {
      id: Date.now(),
      message: `${battle.enemyName} defeated. ${victoryFlavor} ${rewardParts.join(", ")}`,
      treasureId: treasureDrop ?? undefined,
      equipmentId: equipmentDrop?.id
    }
  };

  return treasureDrop ? addDailyProgress(rewardedState, "earnTreasure1", 1) : rewardedState;
}

function addStats(stats: Stats, boost: Partial<Stats>): Stats {
  return {
    attack: stats.attack + (boost.attack ?? 0),
    health: stats.health + (boost.health ?? 0),
    defense: stats.defense + (boost.defense ?? 0),
    speed: stats.speed + (boost.speed ?? 0),
    block: stats.block + (boost.block ?? 0),
    dodge: stats.dodge + (boost.dodge ?? 0),
    critChance: stats.critChance + (boost.critChance ?? 0),
    critDamage: stats.critDamage + (boost.critDamage ?? 0)
  };
}

export const adventureDifficultyDefinitions: Record<AdventureDifficultyId, { id: AdventureDifficultyId; chapter: number; title: string; nodeCount: 30 | 60; background: AdventureNode["scene"]; enemyFamilies: string[]; difficultyMultiplier: number; lootTierBonus: number; unlockCompletions: number; description: string }> = {
  hatchlingTrail: {
    id: "hatchlingTrail",
    chapter: 1,
    title: "Chapter 1: Ember Gate",
    nodeCount: 60,
    background: "forest",
    enemyFamilies: ["cinder slimes", "ember boars", "fire wisps", "coaljaw sentinels", "gatefire captains"],
    difficultyMultiplier: 0.78,
    lootTierBonus: 0,
    unlockCompletions: 0,
    // Contract note: full-length 60-stop Chapter 1 Fire adventure.
    description: "The Ember Gate road winds through trader tents, cinder crossings, shrines, treasure caches, elite ambushes, and a late hoard boss."
  },
  drakeExpedition: {
    id: "drakeExpedition",
    chapter: 2,
    title: "Chapter 2: Sunbeam Spires Path",
    nodeCount: 30,
    background: "cave",
    enemyFamilies: ["reef slimes", "sky mantas", "moonwell guardians", "gemhide boars", "crystal golems", "radiant wisps", "sun lancers"],
    difficultyMultiplier: 1,
    lootTierBonus: 2,
    unlockCompletions: 1,
    description: "A 30-day Drake Expedition that now chains Water Moonwell, Earth Crystal Crag, and Light Sunbeam Spires route identity: tide movement, rune markets, halo shops, radiant wisp crossings, Sun Lancer duels, crit/dodge/block pressure, and an aurora crown hoard payoff."
  },
  shadowVale: {
    id: "shadowVale",
    chapter: 3,
    title: "Chapter 3: Shadow Vale",
    nodeCount: 30,
    background: "ruins",
    enemyFamilies: ["duskmire slimes", "gloam bats", "nightglass sentinels", "shadow boars", "eclipse knights", "void wisps"],
    difficultyMultiplier: 1.12,
    lootTierBonus: 3,
    unlockCompletions: 2,
    description: "The next 30-stop chapter keeps the run moving after Sunbeam Spires with Dark-route pressure, eclipse camps, hidden shrines, and a shadow hoard boss before the long climb to Chapter 10."
  },
  ancientRift: {
    id: "ancientRift",
    chapter: 10,
    title: "Chapter 10: Ancient Rift",
    nodeCount: 60,
    background: "boss",
    enemyFamilies: ["rift heralds", "ancient wyrms", "void bosses"],
    difficultyMultiplier: 1.32,
    lootTierBonus: 5,
    unlockCompletions: 3,
    description: "Chapter 10 is a 60-stop mythic adventure with multiple bosses; the first true evolution trigger lives at Chapter 10 Stop 10."
  }
};

const adventureDifficultyOrder: AdventureDifficultyId[] = ["hatchlingTrail", "drakeExpedition", "shadowVale", "ancientRift"];

export function getNextAdventureDifficultyId(currentId?: AdventureDifficultyId): AdventureDifficultyId {
  const currentIndex = adventureDifficultyOrder.indexOf(currentId ?? "hatchlingTrail");
  return adventureDifficultyOrder[Math.min(adventureDifficultyOrder.length - 1, Math.max(0, currentIndex) + 1)] ?? "drakeExpedition";
}

function getAdventureDifficulty(id?: AdventureDifficultyId) {
  return adventureDifficultyDefinitions[id ?? "hatchlingTrail"] ?? adventureDifficultyDefinitions.hatchlingTrail;
}

function getAdventureLootTier(state: GameState, difficultyId: AdventureDifficultyId = "drakeExpedition") {
  const completedAdventureRuns = state.completedAdventureRuns ?? 0;
  const difficulty = getAdventureDifficulty(difficultyId);
  const trainingLoot = idleUpgradeOrder.reduce((total, upgradeId) => total + (state.idleUpgrades[upgradeId] ?? 0) * idleUpgradeDefinitions[upgradeId].adventureLootBonus, 0);
  return completedAdventureRuns * 2 + (state.adventureCompletions?.[difficultyId] ?? 0) * 3 + difficulty.lootTierBonus + Math.floor(trainingLoot / 10) + Math.floor(getEquipmentBonusTotal(state, "adventureLoot") / 5);
}

const shadowValeStopTitles = [
  "Gloamroot Crossing",
  "Duskmire Cache",
  "Nightglass Ambush",
  "Eclipse Shrine",
  "Umbral Camp",
  "Shadow Boar Ravine",
  "Moonless Market",
  "Void Wisp Veil",
  "Eclipse Knight Gate",
  "Shadow Hoard Warden"
];

function getShadowValeNodeTitle(node: AdventureNode, step: number) {
  if (node.kind === "boss") {
    return "Shadow Hoard Warden";
  }
  return shadowValeStopTitles[(step - 1) % shadowValeStopTitles.length] ?? `Shadow Vale Stop ${step}`;
}

function getShadowValeNodeDescription(node: AdventureNode, step: number) {
  if (node.kind === "battle" || node.kind === "elite" || node.kind === "boss") {
    return `Dark pressure gathers at stop ${step}; Light and Dark strikes hit harder, so read the enemy before committing.`;
  }
  if (node.kind === "camp") {
    return "A low purple campfire steadies the hatchling while shadow mist presses against the circle.";
  }
  if (node.kind === "shrine") {
    return "An eclipse shrine offers guarded recovery, but every blessing asks the dragon to face the dark.";
  }
  if (node.kind === "shop") {
    return "Nightglass traders sell quiet charms for surviving ambushes deeper in the vale.";
  }
  return "The Shadow Vale folds the path into moonless roots, hidden caches, and ambush signs.";
}

function scaleAdventureNodeForDifficulty(node: AdventureNode, step: number, difficultyId: AdventureDifficultyId): AdventureNode {
  const difficulty = getAdventureDifficulty(difficultyId);
  const cycle = Math.floor((step - 1) / 60);
  const shadowVale = difficultyId === "shadowVale";
  return {
    ...node,
    id: cycle > 0 || shadowVale ? `${node.id}-${difficultyId}-${step}` : node.id,
    step,
    chapter: difficulty.chapter,
    chapterStop: step,
    evolutionMilestone: difficulty.chapter === 10 && step === 10 && node.kind === "boss",
    scene: difficulty.background,
    element: shadowVale ? "dark" : node.element,
    title: shadowVale ? getShadowValeNodeTitle(node, step) : cycle > 0 ? `${difficulty.title}: ${node.title}` : node.title,
    description: shadowVale ? getShadowValeNodeDescription(node, step) : node.description,
    difficulty: Math.round((node.difficulty * difficulty.difficultyMultiplier + cycle * 0.12) * 100) / 100
  };
}

function createAdventureRun(step = 1, difficultyId: AdventureDifficultyId = "hatchlingTrail", maxHp = baseStats.health): AdventureRun {
  const difficulty = getAdventureDifficulty(difficultyId);
  return {
    id: `run-${Date.now()}`,
    difficultyId,
    title: difficulty.title,
    background: difficulty.background,
    enemyFamilies: difficulty.enemyFamilies,
    step,
    maxSteps: difficulty.nodeCount,
    currentHp: maxHp,
    maxHp,
    nodes: getAdventureChoices(step, difficultyId),
    visitedNodeIds: [],
    pendingNodeId: null,
    status: "active",
    message: `${difficulty.title}: clear ${difficulty.nodeCount} chapter stops. Prep rewards and fights build toward bosses; evolution waits for Chapter 10 Stop 10.`
  };
}

function normalizeAdventureRun(run: AdventureRun | null | undefined, dragonMaxHp = baseStats.health): AdventureRun | null {
  if (!run) {
    return null;
  }

  const difficulty = getAdventureDifficulty(run.difficultyId);
  const step = Math.min(Math.max(1, run.step ?? 1), difficulty.nodeCount);
  const maxHp = Math.max(1, run.maxHp ?? dragonMaxHp);
  const currentHp = Math.min(maxHp, Math.max(0, run.currentHp ?? maxHp));
  return {
    ...run,
    title: difficulty.title,
    background: difficulty.background,
    enemyFamilies: difficulty.enemyFamilies,
    step,
    maxSteps: difficulty.nodeCount,
    currentHp,
    maxHp,
    nodes: getAdventureChoices(step, run.difficultyId),
    pendingNodeId: run.pendingNodeId ?? null,
    status: run.status ?? "active",
    message: (run.message ?? `${difficulty.title}: clear ${difficulty.nodeCount} chapter stops.`).replace("10 stops", `${difficulty.nodeCount} stops`)
  };
}

function getAdventureChoices(step: number, difficultyId: AdventureDifficultyId = "drakeExpedition") {
  const difficulty = getAdventureDifficulty(difficultyId);
  const normalizedStep = ((step - 1) % difficulty.nodeCount) + 1;
  const nodesForStep = adventureNodes.filter((node) => node.step === normalizedStep);
  const fallback = adventureNodes.filter((node) => node.kind === "boss");
  return (nodesForStep.length > 0 ? nodesForStep : fallback).map((node) =>
    scaleAdventureNodeForDifficulty(
      step === difficulty.nodeCount && node.kind !== "boss" ? (adventureNodes.find((candidate) => candidate.kind === "boss") ?? node) : node,
      step,
      difficultyId
    )
  );
}

function isFightNode(node: AdventureNode) {
  return node.kind === "battle" || node.kind === "elite" || node.kind === "boss";
}

function isChapterFinalBoss(run: AdventureRun, node: AdventureNode) {
  return node.kind === "boss" && run.step >= run.maxSteps;
}

function isChapterEvolutionMilestone(node?: AdventureNode) {
  return Boolean(node?.evolutionMilestone || (node?.chapter === 10 && node?.chapterStop === 10 && node?.kind === "boss"));
}

function getAdventureHpAfterFight(run: AdventureRun, battle: BattleResult, node: AdventureNode) {
  if (!battle.won) {
    return 0;
  }
  if (node.kind === "boss") {
    return run.maxHp;
  }
  const recovery = Math.max(4, Math.ceil(run.maxHp * 0.12));
  return Math.min(run.maxHp, Math.max(1, battle.playerHp) + recovery);
}

function withAdventureHp(run: AdventureRun, currentHp: number) {
  return {
    ...run,
    currentHp: Math.min(run.maxHp, Math.max(0, currentHp))
  };
}

function getAdventureHpAfterRecoveryStop(run: AdventureRun, node: AdventureNode) {
  if (node.kind === "shrine") {
    const shrineBlessing = Math.ceil(run.maxHp * 0.5);
    const shrineFloor = Math.ceil(run.maxHp * 0.75);
    return Math.max(shrineFloor, run.currentHp + shrineBlessing);
  }
  if (node.kind === "camp") {
    const campMeal = Math.ceil(run.maxHp * 0.35);
    const campFloor = Math.ceil(run.maxHp * 0.55);
    return Math.max(campFloor, run.currentHp + campMeal);
  }
  return run.currentHp;
}

function withAdventureRecoveryStop(run: AdventureRun, node: AdventureNode) {
  return withAdventureHp(run, getAdventureHpAfterRecoveryStop(run, node));
}

function getNextRunState(run: AdventureRun, visitedNodeId: string, message: string, status: AdventureRun["status"] = "active") {
  if (status !== "active") {
    return {
      ...run,
      visitedNodeIds: [...run.visitedNodeIds, visitedNodeId],
      pendingNodeId: null,
      status,
      message
    };
  }

  const nextStep = Math.min(run.maxSteps, run.step + 1);
  return {
    ...run,
    step: nextStep,
    nodes: getAdventureChoices(nextStep, run.difficultyId),
    visitedNodeIds: [...run.visitedNodeIds, visitedNodeId],
    pendingNodeId: null,
    status,
    message
  };
}

function summarizeReward(reward: AdventureReward) {
  const parts = [
    reward.gold ? `${reward.gold} gold` : null,
    reward.essence ? `${reward.essence} essence` : null,
    reward.xp ? `${reward.xp} XP` : null,
    reward.evolution && reward.evolution >= 10 ? "major boss reward" : null,
    reward.statBoost ? formatStatBoost(reward.statBoost) : null
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "No reward";
}

function formatStatBoost(boost: Partial<Stats>) {
  return (Object.entries(boost) as Array<[keyof Stats, number]>)
    .map(([stat, amount]) => `+${amount} ${stat}`)
    .join(", ");
}

type AdventureRewardContext = {
  node?: AdventureNode;
  status?: AdventureRun["status"];
  nextStep?: number;
};

function shouldGrantAdventureTreasure(node?: AdventureNode) {
  return Boolean(node && (node.kind === "treasure" || node.kind === "elite" || node.kind === "boss"));
}

function shouldGrantAdventureEquipment(node?: AdventureNode) {
  return Boolean(node && (node.kind === "elite" || node.kind === "boss" || node.kind === "shop"));
}

function createAdventureRewardBundle(
  before: GameState,
  after: GameState,
  reward: AdventureReward,
  context: AdventureRewardContext,
  treasureDrop: TreasureId | null,
  equipmentDrop: EquipmentItem | null
): AdventureRewardBundle {
  const lootGained = [
    reward.gold ? `${reward.gold} gold` : null,
    reward.essence ? `${reward.essence} essence` : null,
    reward.xp ? `${reward.xp} XP` : null,
    treasureDrop ? treasureDefinitions[treasureDrop].name : null,
    equipmentDrop ? `${equipmentRarityDefinitions[equipmentDrop.rarity].label} ${equipmentDrop.name}` : null
  ].filter(Boolean) as string[];

  const statsImproved = (Object.keys(after.dragon.stats) as Array<keyof Stats>)
    .map((stat) => {
      const gained = after.dragon.stats[stat] - before.dragon.stats[stat];
      return gained > 0 ? `+${gained} ${stat}` : null;
    })
    .filter(Boolean) as string[];

  const beforeHoard = getTreasureTotal(before);
  const afterHoard = getTreasureTotal(after);
  const runMaxSteps = after.adventureRun?.maxSteps ?? 30;
  const nextStep = context.status === "complete" ? 1 : Math.min(runMaxSteps, context.nextStep ?? after.adventureRun?.step ?? 1);
  const nextRecommendedAdventure = context.status === "complete"
    ? "Return to the den, equip new loot, then start the next chapter."
    : `Push to stop ${nextStep}/${runMaxSteps}; evolution is reserved for Chapter 10 Stop 10.`;
  const evolutionProgress = isChapterEvolutionMilestone(context.node)
    ? `${before.dragon.evolution}% → ${after.dragon.evolution}% evolution`
    : "Locked until Chapter 10 Stop 10 evolution boss";

  return {
    lootGained: lootGained.length > 0 ? lootGained : ["Route knowledge gained"],
    statsImproved: statsImproved.length > 0 ? statsImproved : ["No stat jump yet — claim the next node for a visible upgrade."],
    hoardProgress: `${afterHoard} treasures secured${afterHoard > beforeHoard ? ` (+${afterHoard - beforeHoard})` : ""}`,
    evolutionProgress,
    nextRecommendedAdventure,
    treasureDrop: treasureDrop ?? undefined,
    equipmentDrop: equipmentDrop ?? undefined
  };
}

function applyAdventureReward(state: GameState, reward: AdventureReward, fallbackEvolution = 0, context: AdventureRewardContext = {}): GameState {
  if (context.status === "active") {
    return state;
  }

  const permanentReward = { ...reward, statBoost: undefined };
  const lootTier = getAdventureLootTier(state, context.node ? (state.adventureRun?.difficultyId ?? "drakeExpedition") : "drakeExpedition");
  const treasureDrop = shouldGrantAdventureTreasure(context.node) ? pickTreasure(state.currentArea, lootTier) : null;
  const equipmentDrop = shouldGrantAdventureEquipment(context.node) ? createEquipmentItem(state.currentArea, lootTier) : null;
  const withCurrencies: GameState = {
    ...state,
    dragon: {
      ...state.dragon,
      stats: permanentReward.statBoost ? addStats(state.dragon.stats, permanentReward.statBoost) : state.dragon.stats
    },
    treasures: treasureDrop
      ? {
          ...state.treasures,
          [treasureDrop]: (state.treasures[treasureDrop] ?? 0) + 1
        }
      : state.treasures,
    equipmentInventory: equipmentDrop ? [equipmentDrop, ...(state.equipmentInventory ?? [])] : state.equipmentInventory,
    player: {
      ...state.player,
      gold: state.player.gold + (permanentReward.gold ?? 0),
      gems: state.player.gems + (permanentReward.gems ?? 0),
      essence: state.player.essence + (permanentReward.essence ?? 0)
    }
  };

  const evolutionGain = isChapterEvolutionMilestone(context.node) ? (permanentReward.evolution ?? fallbackEvolution) : 0;
  const leveledState = levelUpDragon(withCurrencies, permanentReward.xp ?? 0, evolutionGain);
  const adventureRewardBundle = createAdventureRewardBundle(state, leveledState, permanentReward, context, treasureDrop, equipmentDrop);
  const rewardedState: GameState = {
    ...leveledState,
    lastAdventureRewards: adventureRewardBundle,
    lastLoot: {
      id: Date.now(),
      message: `Adventure Return Chest: ${adventureRewardBundle.lootGained.join(", ")} | ${adventureRewardBundle.hoardProgress} | ${adventureRewardBundle.evolutionProgress} | loot improves after completed adventures`,
      treasureId: treasureDrop ?? undefined,
      equipmentId: equipmentDrop?.id
    }
  };

  return treasureDrop ? addDailyProgress(rewardedState, "earnTreasure1", 1) : rewardedState;
}

function levelUpDragon(state: GameState, xpGain: number, evolutionGain: number): GameState {
  let xp = state.dragon.xp + xpGain;
  let level = state.dragon.level;
  let stats = state.dragon.stats;

  while (xp >= getXpToLevel(level)) {
    xp -= getXpToLevel(level);
    level += 1;
    stats = addStats(stats, { attack: 3, health: 12, defense: 1, speed: level % 2 === 0 ? 1 : 0 });
  }

  const evolution = Math.min(100, state.dragon.evolution + evolutionGain);
  const nextStage = getNextStage(state.dragon.stage, evolution, level);

  return {
    ...state,
    dragon: {
      ...state.dragon,
      level,
      xp,
      evolution,
      stage: nextStage,
      stats
    }
  };
}

function getNextStage(stage: DragonStage, evolution: number, level: number): DragonStage {
  if (level >= 8 && evolution >= 100) {
    return "wyrm";
  }
  if (level >= 4 && evolution >= 55) {
    return "drake";
  }
  if (stage === "egg" && evolution >= 10) {
    return "hatchling";
  }
  return stage;
}

function chooseElement(answers: Record<string, DragonElement>, selectedElement?: DragonElement | null): DragonElement {
  return selectedElement ?? getLeadingElement(answers);
}

function scaleStats(stats: Stats, difficulty: number): Stats {
  return {
    attack: Math.round(stats.attack * difficulty),
    health: Math.round(stats.health * difficulty),
    defense: Math.round(stats.defense * difficulty),
    speed: Math.round(stats.speed * Math.max(0.9, difficulty * 0.96)),
    block: Math.round(stats.block * Math.max(0.85, difficulty * 0.9)),
    dodge: Math.round(stats.dodge * Math.max(0.85, difficulty * 0.88)),
    critChance: Math.round(stats.critChance * Math.max(0.9, difficulty * 0.92)),
    critDamage: Math.round(stats.critDamage * Math.max(1, 1 + (difficulty - 1) * 0.12))
  };
}

function getAdventureEnemyPressureMultiplier(node?: AdventureNode) {
  if (node?.chapter !== 3) {
    return 1;
  }
  const routeProgress = Math.min(1, Math.max(0, ((node.chapterStop ?? node.step) - 1) / 29));
  return Math.round((0.94 + routeProgress * 0.14) * 100) / 100;
}

function createBattle(state: GameState, node?: AdventureNode): BattleResult {
  const baseEncounter =
    encounters.find((item) => item.id === node?.encounterId) ??
    encounters.find((item) => item.stage === state.player.unlockedStage) ??
    encounters[encounters.length - 1];
  const encounter = node
    ? {
        ...baseEncounter,
        name: node.title,
        element: node.element ?? baseEncounter.element,
        stats: scaleStats(baseEncounter.stats, node.difficulty),
        rewardGold: baseEncounter.rewardGold + (node.reward.gold ?? 0),
        rewardEssence: baseEncounter.rewardEssence + (node.reward.essence ?? 0),
        rewardXp: baseEncounter.rewardXp + (node.reward.xp ?? 0)
      }
    : baseEncounter;
  const dragonElement = state.dragon.element ?? "fire";
  const advantage = getElementMatchupMultiplier(dragonElement, encounter.element);
  const disadvantage = getElementMatchupMultiplier(encounter.element, dragonElement) > 1 ? 0.9 : 1;
  const pathBattleModifier = getDragonPathBattleModifier(state);
  const activeSkill = getActiveDragonSkill(state);
  const activeSkillBonus = getActiveSkillBattleBonus(activeSkill);
  const enemyPressureMultiplier = getAdventureEnemyPressureMultiplier(node);
  const dragonProfile = getCombatStatProfile(state.dragon.stats);
  const enemyProfile = getCombatStatProfile(encounter.stats);
  let playerHp = node && state.adventureRun?.status === "active"
    ? Math.min(state.adventureRun.maxHp, Math.max(1, state.adventureRun.currentHp))
    : state.dragon.stats.health;
  const battleStartHp = playerHp;
  let enemyHp = encounter.stats.health;
  const rounds: string[] = [];
  let latestPlayerDamage = 0;
  let latestEnemyCounterDamage = 0;
  let totalPlayerDamage = 0;
  let totalEnemyCounterDamage = 0;
  const quickBattleRounds = 4;
  const quickBattleDamageMultiplier = 1.85;

  rounds.push("Fast fight: decisive clashes resolve this battle in four rounds or less.");
  if (node?.chapter === 3) {
    rounds.push(`Shadow pressure: enemy damage ramps from guarded early ambushes to ${Math.round(enemyPressureMultiplier * 100)}% pressure at this stop.`);
  }

  for (let round = 1; round <= quickBattleRounds && playerHp > 0 && enemyHp > 0; round += 1) {
    const playerCrit = rollCombatChance(dragonProfile.critChance);
    const playerDamage = Math.max(
      4,
      Math.round(
        ((dragonProfile.attack * advantage + dragonProfile.speedTempo) - enemyProfile.defense) *
          pathBattleModifier.damageMultiplier *
          activeSkillBonus.damageMultiplier *
          quickBattleDamageMultiplier *
          (playerCrit ? dragonProfile.critDamage : 1)
      )
    );
    enemyHp = Math.max(0, enemyHp - playerDamage);
    latestPlayerDamage = playerDamage;
    totalPlayerDamage += playerDamage;
    rounds.push(`Round ${round}: ${pathBattleModifier.combatVerb} ${pathBattleModifier.tempoLabel}; your dragon ${playerCrit ? "CRIT " : ""}hits ${encounter.name} for ${playerDamage} (${Math.round(dragonProfile.critChance * 100)}% crit, ${Math.round(dragonProfile.critDamage * 100)}% crit damage).`);
    if (activeSkill) {
      rounds.push(`Active bonus: ${activeSkill.name} (${activeSkill.trigger}) is slotted — ${activeSkillBonus.combatEffect}.`);
    }
    const activeSkillTrigger = resolveActiveSkillTriggeredDamage(activeSkill, playerCrit, playerDamage, round, enemyProfile.defense);
    if (activeSkillTrigger.damage > 0) {
      enemyHp = Math.max(0, enemyHp - activeSkillTrigger.damage);
      totalPlayerDamage += activeSkillTrigger.damage;
      rounds.push(activeSkillTrigger.log);
    }

    if (enemyHp <= 0) {
      break;
    }

    if (rollCombatChance(dragonProfile.dodgeChance)) {
      rounds.push(`${encounter.name} lunges, but your dragon dodged with ${dragonProfile.speed} speed and ${Math.round(dragonProfile.dodgeChance * 100)}% dodge.`);
      const activeSkillDodgeCounter = resolveActiveSkillDodgeCounter(activeSkill, true, dragonProfile);
      if (activeSkillDodgeCounter.damage > 0) {
        enemyHp = Math.max(0, enemyHp - activeSkillDodgeCounter.damage);
        totalPlayerDamage += activeSkillDodgeCounter.damage;
        rounds.push(activeSkillDodgeCounter.log);
      }
      continue;
    }

    const enemyCrit = rollCombatChance(enemyProfile.critChance);
    const blocked = rollCombatChance(dragonProfile.blockChance);
    const rawEnemyDamage = Math.max(
      3,
      Math.round(
        ((enemyProfile.attack * disadvantage + enemyProfile.speedTempo) - dragonProfile.defense) *
          enemyPressureMultiplier *
          (1 - Math.min(0.85, pathBattleModifier.damageReduction + activeSkillBonus.damageReduction)) *
          (enemyCrit ? enemyProfile.critDamage : 1)
      )
    );
    const enemyDamage = blocked ? Math.max(1, Math.round(rawEnemyDamage * (1 - dragonProfile.blockReduction))) : rawEnemyDamage;
    playerHp = Math.max(0, playerHp - enemyDamage);
    latestEnemyCounterDamage = enemyDamage;
    totalEnemyCounterDamage += enemyDamage;
    rounds.push(`${encounter.name} strikes back for ${enemyDamage}${enemyCrit ? " CRIT" : ""}${blocked ? `; blocked ${rawEnemyDamage - enemyDamage} damage with ${Math.round(dragonProfile.blockChance * 100)}% block` : ""}.`);
    const activeSkillBlockCounter = resolveActiveSkillBlockCounter(activeSkill, blocked, rawEnemyDamage, enemyDamage);
    if (activeSkillBlockCounter.damage > 0) {
      enemyHp = Math.max(0, enemyHp - activeSkillBlockCounter.damage);
      rounds.push(activeSkillBlockCounter.log);
    }
  }

  if (playerHp > 0 && enemyHp > 0) {
    const wonByPressure = playerHp / state.dragon.stats.health >= enemyHp / encounter.stats.health;
    if (wonByPressure) {
      enemyHp = 0;
      rounds.push("Fast fight result: your dragon wins by overwhelming momentum.");
    } else {
      playerHp = 0;
      rounds.push("Fast fight result: the encounter forces a retreat.");
    }
  }

  return {
    encounter,
    won: playerHp > 0,
    playerHp,
    enemyHp,
    battleStartHp,
    rounds,
    damageSummary: {
      playerDamage: latestPlayerDamage,
      enemyCounterDamage: latestEnemyCounterDamage,
      totalPlayerDamage,
      totalEnemyCounterDamage
    },
    activeSkill: summarizeActiveSkill(activeSkill, activeSkillBonus.combatEffect),
    nodeKind: node?.kind,
    title: node?.title,
    rewardSummary: node ? summarizeReward({ ...node.reward, gold: encounter.rewardGold, essence: encounter.rewardEssence, xp: encounter.rewardXp }) : undefined
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  state = action.type === "hydrate" || action.type === "resetGame" ? state : removeExpiredJourneyEffects(resetDailyIfNeeded(state));
  switch (action.type) {
    case "selectEgg": {
      if ((state.phase !== "egg" && state.phase !== "question") || state.dragon.stage !== "egg") {
        return state;
      }

      return {
        ...state,
        activeScreen: "egg",
        eggAnswers: { selectedEgg: action.element },
        eggTaps: 0,
        currentQuestionIndex: 0,
        dragon: {
          ...state.dragon,
          element: action.element,
          evolution: 8,
          chosenTraits: [`${action.element} egg`]
        }
      };
    }
    case "tapEgg": {
      if ((state.phase !== "egg" && state.phase !== "question") || state.dragon.stage !== "egg" || !state.dragon.element) {
        return state;
      }

      const nextEggTaps = Math.min(3, (state.eggTaps ?? 0) + 1);
      const nextAnswers = {
        selectedEgg: state.dragon.element,
        tapOne: state.dragon.element,
        ...(nextEggTaps >= 2 ? { tapTwo: state.dragon.element } : {}),
        ...(nextEggTaps >= 3 ? { tapThree: state.dragon.element } : {})
      };

      return {
        ...state,
        activeScreen: "egg",
        eggTaps: nextEggTaps,
        eggAnswers: nextAnswers,
        phase: nextEggTaps >= 3 ? "hatching" : "egg",
        currentQuestionIndex: Math.min(nextEggTaps, 2),
        dragon: {
          ...state.dragon,
          evolution: Math.min(100, 8 + nextEggTaps * 26)
        }
      };
    }
    case "chooseEggAnswer": {
      if ((state.phase !== "egg" && state.phase !== "question") || state.dragon.stage !== "egg") {
        return state;
      }

      const nextAnswers = {
        ...state.eggAnswers,
        [action.choiceId]: action.element
      };
      const answeredCount = Object.keys(nextAnswers).length;
      const nextPhase = answeredCount >= 3 ? "hatching" : "egg";
      return {
        ...state,
        phase: nextPhase,
        currentQuestionIndex: Math.min(answeredCount, 2),
        eggAnswers: nextAnswers,
        dragon: {
          ...state.dragon,
          element: getLeadingElement(nextAnswers),
          evolution: Math.min(100, answeredCount * 28),
          chosenTraits: Array.from(new Set([...state.dragon.chosenTraits, action.trait]))
        }
      };
    }
    case "hatchDragon": {
      const legacyAnsweredCount = Object.keys(state.eggAnswers ?? {}).length;
      const canHatchSelectedEgg = Boolean(state.dragon.element) && (state.eggTaps ?? 0) >= 3;
      const canHatchLegacyQuiz = legacyAnsweredCount >= 3;
      if (state.dragon.stage !== "egg" || (!canHatchSelectedEgg && !canHatchLegacyQuiz)) {
        return state;
      }

      const element = chooseElement(state.eggAnswers, state.dragon.element);
      const boostedStats = addStats(baseStats, elementStatBonus[element]);

      return syncAchievements({
        ...state,
        selectedActiveSkillId: null,
        activeScreen: "den",
        phase: "journey",
        tutorialCompleted: true,
        lastLoginRewardDate: state.lastLoginRewardDate ?? getTodayKey(),
        journeyStep: 0,
        dragon: {
          ...state.dragon,
          name: `${element[0].toUpperCase()} Hatchling`,
          element,
          path: null,
          stage: "hatchling",
          evolution: 12,
          stats: boostedStats,
          chosenTraits: state.dragon.chosenTraits.filter((trait) => !trait.startsWith("path:"))
        },
        journeyEvents: {
          activeEventId: null,
          nextEventAt: scheduleNextJourneyEvent(),
          activeEffects: []
        }
      });
    }
    case "finishHatching": {
      if (state.phase !== "hatching" && state.dragon.stage !== "hatchling") {
        return state;
      }
      if (state.dragon.stage === "hatchling") {
        return {
          ...state,
          phase: "journey",
          activeScreen: "den"
        };
      }
      return gameReducer(state, { type: "hatchDragon" });
    }
    case "selectDragonPath": {
      const path = dragonPathDefinitions[action.pathId];
      if (!path || state.dragon.stage !== "hatchling" || state.dragon.path || state.dragon.element !== path.element) {
        return state;
      }

      const defaultActiveSkill = dragonSkillDrafts.find((skill) => skill.elementFocus === path.element && skill.roleFocus === path.role) ?? null;

      return {
        ...state,
        selectedActiveSkillId: defaultActiveSkill?.id ?? state.selectedActiveSkillId,
        dragon: {
          ...state.dragon,
          path: action.pathId,
          stats: addStats(state.dragon.stats, path.statBoost),
          chosenTraits: Array.from(new Set([...state.dragon.chosenTraits, `path:${action.pathId}`]))
        }
      };
    }
    case "selectActiveSkill": {
      const selectedSkill = dragonSkillDrafts.find((skill) => skill.id === action.skillId);
      const isActiveRunDraftChoice = Boolean(
        selectedSkill &&
          state.adventureRun?.status === "active" &&
          state.lastSkillDraftOffer?.skillIds.includes(selectedSkill.id) &&
          !state.lastSkillDraftOffer.chosenSkillId
      );
      if (!selectedSkill || (!isActiveRunDraftChoice && !getActiveSkillUnlockState(state, selectedSkill).unlocked)) {
        return state;
      }

      const shouldClaimEliteDraftChoice = isActiveRunDraftChoice ||
        (state.lastSkillDraftOffer?.skillIds.includes(selectedSkill.id) &&
        !state.lastSkillDraftOffer.chosenSkillId &&
        !(state.dragon.path && getActiveSkillUnlockState(state, selectedSkill).isPathDefault));

      return {
        ...state,
        lastSkillDraftOffer: shouldClaimEliteDraftChoice && state.lastSkillDraftOffer
          ? {
              ...state.lastSkillDraftOffer,
              chosenSkillId: selectedSkill.id
            }
          : state.lastSkillDraftOffer,
        selectedActiveSkillId: selectedSkill.id
      };
    }
    case "advanceJourney": {
      return {
        ...state,
        phase: "journey",
        journeyStep: Math.min(3, state.journeyStep + 1),
        dragon: {
          ...state.dragon,
          evolution: Math.min(100, state.dragon.evolution + 4)
        }
      };
    }
    case "buyIdleUpgrade": {
      const cost = getIdleUpgradeCost(state, action.upgradeId);
      if (state.player.essence < cost || isIdleUpgradeCapped(state, action.upgradeId)) {
        return state;
      }

      return addDailyProgress({
        ...state,
        idleUpgrades: {
          ...state.idleUpgrades,
          [action.upgradeId]: (state.idleUpgrades[action.upgradeId] ?? 0) + 1
        },
        player: {
          ...state.player,
          essence: state.player.essence - cost,
          upgradesBought: state.player.upgradesBought + 1
        }
      }, "buyUpgrade3", 1);
    }
    case "evolveDragon": {
      const cost = getNextEvolutionCost(state.dragon.stage);
      if (cost === null || state.player.essence < cost) {
        return state;
      }
      if (state.dragon.stage === "hatchling" && (!state.dragon.path || !action.traitId)) {
        return state;
      }

      return syncAchievements({
        ...state,
        dragon: {
          ...state.dragon,
          stage: getManualNextStage(state.dragon.stage),
          evolution: 0,
          stats: addStats(state.dragon.stats, { attack: 10, health: 35, defense: 4, speed: 2 })
        },
        selectedEvolutionTraits:
          state.dragon.stage === "hatchling" && action.traitId
            ? {
                ...state.selectedEvolutionTraits,
                drake: action.traitId
              }
            : state.selectedEvolutionTraits,
        player: {
          ...state.player,
          essence: state.player.essence - cost
        }
      });
    }
    case "autoQuestAction": {
      const incompleteQuestId = idleQuestOrder.find((questId) => {
        const quest = idleQuestDefinitions[questId];
        return (state.idleQuestProgress[questId] ?? 0) < quest.target;
      });

      if (!incompleteQuestId) {
        const nextArea = getNextArea(state.currentArea);
        const canAdvance = nextArea === state.currentArea || canUnlockArea(state, nextArea);
        if (!canAdvance) {
          return syncAchievements(applyAutoBattleAction(state));
        }
        if (nextArea === state.currentArea) {
          return syncAchievements(applyAutoBattleAction(state));
        }
        return {
          ...state,
          currentArea: nextArea,
          autoBattle: nextArea === state.currentArea ? state.autoBattle : createAutoBattle(nextArea),
          idleQuestProgress: {
            defeatSlimes: 0,
            gatherCrystals: 0,
            findScale: 0
          },
          lastLoot: {
            id: Date.now(),
            message: nextArea === state.currentArea ? "All area goals complete. Keep farming for loot." : `Advanced to ${areaDefinitions[nextArea].name}!`
          }
        };
      }

      const quest = idleQuestDefinitions[incompleteQuestId];
      const increment = getQuestIncrement(state, incompleteQuestId);
      const currentProgress = state.idleQuestProgress[incompleteQuestId] ?? 0;
      const nextProgress = Math.min(quest.target, currentProgress + increment);
      const rewardMultiplier = getQuestRewardMultiplier(state);
      const rewardEssence = Math.max(1, Math.floor(quest.rewardEssence * rewardMultiplier));
      const power = getQuestPower(state);
      const treasureDrop = Math.random() < getTreasureDropChance(state) ? pickTreasure(state.currentArea) : null;
      const shardDrop =
        Math.random() < Math.min(BALANCE.dropRates.shards.maxChance, BALANCE.dropRates.shards.baseChance + power * BALANCE.dropRates.shards.powerScale)
          ? (state.dragon.element ?? "fire")
          : null;
      const treasureName = treasureDrop ? treasureDefinitions[treasureDrop].name : null;
      const shardText = shardDrop ? `${shardDrop} shard` : null;
      const lootParts = [`+${rewardEssence} essence`, treasureName, shardText].filter(Boolean);

      const nextState: GameState = {
        ...state,
        idleQuestProgress: {
          ...state.idleQuestProgress,
          [incompleteQuestId]: nextProgress
        },
        treasures: treasureDrop
          ? {
              ...state.treasures,
              [treasureDrop]: (state.treasures[treasureDrop] ?? 0) + 1
            }
          : state.treasures,
        elementalShards: shardDrop
          ? {
              ...state.elementalShards,
              [shardDrop]: (state.elementalShards[shardDrop] ?? 0) + 1
            }
          : state.elementalShards,
        player: {
          ...state.player,
          essence: state.player.essence + rewardEssence
        },
        lifetimeEssence: state.lifetimeEssence + rewardEssence,
        lastLoot: {
          id: Date.now(),
          message: formatElementLootMessage(state, quest.title, lootParts),
          treasureId: treasureDrop ?? undefined,
          shard: shardDrop ?? undefined
        }
      };
      const withQuestProgress = addDailyProgress(nextState, "completeQuest5", 1);
      const withQuestTreasure = treasureDrop ? addDailyProgress(withQuestProgress, "earnTreasure1", 1) : withQuestProgress;
      return syncAchievements(applyAutoBattleAction(withQuestTreasure));
    }
    case "reincarnate": {
      if (!canReincarnate(state)) {
        return state;
      }

      const soulsGained = getReincarnationSoulsGained(state);
      return syncAchievements({
        ...initialGameState,
        player: {
          ...initialGameState.player,
          essence: 0
        },
        treasures: state.treasures,
        equippedItems: state.equippedItems,
        equipmentInventory: state.equipmentInventory,
        dragonSouls: state.dragonSouls + soulsGained,
        lifetimeEssence: state.lifetimeEssence,
        totalReincarnations: state.totalReincarnations + 1,
        tutorialCompleted: state.tutorialCompleted,
        lastLoginRewardDate: state.lastLoginRewardDate,
        loginStreakDay: state.loginStreakDay,
        settings: state.settings,
        journeyEvents: {
          activeEventId: null,
          nextEventAt: scheduleNextJourneyEvent(),
          activeEffects: []
        },
        returnPresence: initialGameState.returnPresence,
        lastSavedAt: Date.now(),
        lastLoot: {
          id: Date.now(),
          message: `Reincarnated stronger. +${soulsGained} Dragon Souls kept the hoard's memory.`
        }
      });
    }
    case "claimAchievement": {
      if (!state.unlockedAchievements.includes(action.achievementId) || state.claimedAchievements.includes(action.achievementId)) {
        return state;
      }

      return applyReward(
        {
          ...state,
          claimedAchievements: [...state.claimedAchievements, action.achievementId]
        },
        achievementDefinitions[action.achievementId].reward
      );
    }
    case "claimDailyGoal": {
      const goal = dailyGoalDefinitions[action.goalId];
      const progress = state.dailyGoals[action.goalId] ?? { progress: 0, claimed: false };
      if (progress.claimed || progress.progress < goal.target) {
        return state;
      }

      return applyReward(
        {
          ...state,
          dailyGoals: {
            ...state.dailyGoals,
            [action.goalId]: {
              ...progress,
              claimed: true
            }
          }
        },
        goal.reward
      );
    }
    case "equipItem": {
      const item = state.equipmentInventory.find((entry) => entry.id === action.itemId);
      if (!item) {
        return state;
      }

      const currentlyEquipped = state.equippedItems[item.slot];
      return {
        ...state,
        equippedItems: {
          ...state.equippedItems,
          [item.slot]: item
        },
        equipmentInventory: [
          ...state.equipmentInventory.filter((entry) => entry.id !== action.itemId),
          ...(currentlyEquipped ? [currentlyEquipped] : [])
        ]
      };
    }
    case "sellItem": {
      const inventoryItem = state.equipmentInventory.find((entry) => entry.id === action.itemId);
      const equippedEntry = Object.entries(state.equippedItems).find(([, item]) => item?.id === action.itemId) as [EquipmentSlot, EquipmentItem] | undefined;
      const item = inventoryItem ?? equippedEntry?.[1];
      if (!item) {
        return state;
      }

      const nextEquippedItems = { ...state.equippedItems };
      if (equippedEntry) {
        delete nextEquippedItems[equippedEntry[0]];
      }

      return syncAchievements({
        ...state,
        equippedItems: nextEquippedItems,
        equipmentInventory: state.equipmentInventory.filter((entry) => entry.id !== action.itemId),
        lifetimeEssence: state.lifetimeEssence + item.sellValue,
        player: {
          ...state.player,
          essence: state.player.essence + item.sellValue
        },
        lastLoot: {
          id: Date.now(),
          message: `Sold ${equipmentRarityDefinitions[item.rarity].label} ${item.name} for +${item.sellValue} essence.`
        }
      });
    }
    case "completeTutorial":
      return {
        ...state,
        tutorialCompleted: true
      };
    case "claimDailyLoginReward":
      return applyDailyLoginReward(state);
    case "updateSettings":
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings
        }
      };
    case "addPlaytestNote": {
      const text = action.text.trim();
      if (!text) {
        return state;
      }

      return {
        ...state,
        playtestNotes: [createPlaytestNote(state, text), ...state.playtestNotes].slice(0, 100)
      };
    }
    case "clearPlaytestNotes":
      return {
        ...state,
        playtestNotes: []
      };
    case "startGuidedPlaytest":
      return {
        ...state,
        guidedPlaytest: {
          active: true,
          completedStepIds: ["freshSave"],
          startedAt: Date.now()
        }
      };
    case "endGuidedPlaytest":
      return {
        ...state,
        guidedPlaytest: {
          ...state.guidedPlaytest,
          active: false
        }
      };
    case "completeGuidedPlaytestSteps": {
      if (!state.guidedPlaytest.active || action.stepIds.length === 0) {
        return state;
      }
      const completed = new Set(state.guidedPlaytest.completedStepIds);
      action.stepIds.forEach((stepId) => completed.add(stepId));
      return {
        ...state,
        guidedPlaytest: {
          ...state.guidedPlaytest,
          completedStepIds: Array.from(completed)
        }
      };
    }
    case "toggleGuidedPlaytestStep": {
      if (!state.guidedPlaytest.active) {
        return state;
      }
      const completed = new Set(state.guidedPlaytest.completedStepIds);
      if (completed.has(action.stepId)) {
        completed.delete(action.stepId);
      } else {
        completed.add(action.stepId);
      }
      return {
        ...state,
        guidedPlaytest: {
          ...state.guidedPlaytest,
          completedStepIds: Array.from(completed)
        }
      };
    }
    case "triggerJourneyEvent": {
      if (state.phase !== "journey" || state.journeyEvents.activeEventId) {
        return state;
      }

      return {
        ...state,
        journeyEvents: {
          ...state.journeyEvents,
          activeEventId: action.eventId ?? pickJourneyEventId()
        }
      };
    }
    case "resolveJourneyEvent":
      return resolveJourneyEventChoice(state, action.choiceId);
    case "completeReturnPresence": {
      const rewardToApply = state.returnPresence.rewardApplied ? 0 : state.returnPresence.pendingOfflineReward;
      const now = Date.now();
      if (__DEV__) {
        console.log("[ReturnPresence]", {
          awayDurationMs: state.returnPresence.awayDurationMs,
          calculatedOfflineEssence: state.returnPresence.offlineReward,
          pendingOfflineReward: state.returnPresence.pendingOfflineReward,
          returnPhase: "rewards",
          rewardApplied: rewardToApply > 0,
          lastSaveDateBefore: state.returnPresence.lastSaveDateBefore,
          lastSaveDateAfter: now
        });
      }
      return syncAchievements({
        ...state,
        returnPresence: {
          ...initialGameState.returnPresence,
          rewardApplied: rewardToApply > 0 || state.returnPresence.rewardApplied,
          lastSaveDateBefore: state.returnPresence.lastSaveDateBefore,
          lastSaveDateAfter: now
        },
        player: {
          ...state.player,
          essence: state.player.essence + rewardToApply
        },
        lifetimeEssence: state.lifetimeEssence + rewardToApply,
        lastSavedAt: now,
        lastLoot:
          rewardToApply > 0
            ? {
                id: now,
                message:
                  state.dragon.element === "water"
                    ? `The tide carried back +${rewardToApply} offline essence.`
                    : `Returned to +${rewardToApply} offline essence.`
              }
            : state.lastLoot
      });
    }
    case "startReturnPresenceTest": {
      const pendingOfflineReward = action.withRewards ? getOfflineEssenceReward(state, action.awayDurationMs) : 0;
      const lastSaveDateBefore = Date.now() - action.awayDurationMs;
      if (__DEV__) {
        console.log("[ReturnPresence]", {
          awayDurationMs: action.awayDurationMs,
          calculatedOfflineEssence: pendingOfflineReward,
          pendingOfflineReward,
          returnPhase: "resting",
          rewardApplied: false,
          lastSaveDateBefore,
          lastSaveDateAfter: null
        });
      }
      return {
        ...state,
        returnPresence: createReturnPresence(action.awayDurationMs, pendingOfflineReward, lastSaveDateBefore)
      };
    }
    case "startAdventureRun": {
      if (!state.dragon.element) {
        return { ...state, activeScreen: "egg" };
      }

      const nextDifficultyId = action.difficultyId ?? (state.adventureRun?.status === "complete"
        ? getNextAdventureDifficultyId(state.adventureRun.difficultyId)
        : "hatchlingTrail");

      return {
        ...state,
        activeScreen: "adventure",
        adventureRun: createAdventureRun(action.startStep ?? 1, nextDifficultyId, state.dragon.stats.health),
        lastAdventureRewards: null,
        lastSkillDraftOffer: null
      };
    }
    case "selectAdventureNode": {
      const run = state.adventureRun?.status === "active" ? state.adventureRun : createAdventureRun(1, "hatchlingTrail", state.dragon.stats.health);
      const node = run.nodes.find((item) => item.id === action.nodeId) ?? getAdventureNodeById(action.nodeId);
      if (!node) {
        return state;
      }

      if (run.pendingNodeId === node.id && isFightNode(node)) {
        const battle = createBattle(state, node);
        let nextState: GameState = {
          ...state,
          activeScreen: "battle",
          lastBattle: battle
        };

        if (!battle.won) {
          const failedRunState = {
            ...nextState,
            lastAdventureRewards: createAdventureRewardBundle(state, state, {}, { node, status: "failed", nextStep: run.step }, null, null),
            selectedActiveSkillId: state.lastSkillDraftOffer?.skillIds.includes(state.selectedActiveSkillId ?? "") ? null : state.selectedActiveSkillId,
            adventureRun: {
              ...withAdventureHp(run, 0),
              visitedNodeIds: [...run.visitedNodeIds, node.id],
              pendingNodeId: null,
              status: "failed" as const,
              message: `${node.title} forced a retreat. Chapter vitality returns at the den.`
            }
          };
          return failedRunState;
        }

        nextState = {
          ...nextState,
          player: {
            ...nextState.player,
            battlesWon: nextState.player.battlesWon + 1,
            stagesCleared: Math.max(nextState.player.stagesCleared, node.step),
            unlockedStage: Math.min(encounters.length, Math.max(nextState.player.unlockedStage, node.step + 1))
          }
        };
        const chapterFinalBoss = isChapterFinalBoss(run, node);
        nextState = applyAdventureReward(
          nextState,
          {
            ...node.reward,
            gold: battle.encounter.rewardGold,
            essence: battle.encounter.rewardEssence,
            xp: battle.encounter.rewardXp
          },
          chapterFinalBoss ? 18 : node.kind === "elite" || node.kind === "boss" ? 12 : 8,
          { node, status: chapterFinalBoss ? "complete" : "active", nextStep: Math.min(run.maxSteps, run.step + 1) }
        );

        if ((node.kind === "elite" || node.step === 6) && !nextState.lastSkillDraftOffer?.chosenSkillId) {
          const runSkillDraftOffer = createEliteSkillDraftOffer(nextState, node);
          nextState = {
            ...nextState,
            lastSkillDraftOffer: runSkillDraftOffer,
            lastLoot: null
          };
        }

        const completedAdventureRuns = chapterFinalBoss ? (nextState.completedAdventureRuns ?? 0) + 1 : nextState.completedAdventureRuns;
        const adventureCompletions = chapterFinalBoss
          ? {
              ...nextState.adventureCompletions,
              [run.difficultyId]: (nextState.adventureCompletions?.[run.difficultyId] ?? 0) + 1
            }
          : nextState.adventureCompletions;
        const completionProgressState = chapterFinalBoss ? addDailyProgress({ ...nextState, completedAdventureRuns, adventureCompletions }, "completeAdventure1", 1) : nextState;

        return {
          ...completionProgressState,
          selectedActiveSkillId: chapterFinalBoss && state.lastSkillDraftOffer?.skillIds.includes(state.selectedActiveSkillId ?? "") ? null : completionProgressState.selectedActiveSkillId,
          adventureRun: getNextRunState(
            withAdventureHp(run, getAdventureHpAfterFight(run, battle, node)),
            node.id,
            chapterFinalBoss ? "Boss defeated. Chapter summary unlocked." : `${node.title} cleared. Choose your next stop.`,
            chapterFinalBoss ? "complete" : "active"
          )
        };
      }

      if (run.pendingNodeId === node.id && !node.choices?.length) {
        const rewardedState = applyAdventureReward(state, node.reward, 3, { node, status: "active", nextStep: Math.min(run.maxSteps, run.step + 1) });
        const recoveredRun = withAdventureRecoveryStop(run, node);
        const recoveryMessage = node.kind === "shrine"
          ? `${node.title} blessed the hatchling. Chapter HP restored; choose your next stop.`
          : node.kind === "camp"
            ? `${node.title} gave the hatchling a safe meal. Chapter HP restored; choose your next stop.`
            : `${node.title} resolved. Choose your next stop.`;
        return {
          ...rewardedState,
          activeScreen: "adventure",
          adventureRun: getNextRunState(recoveredRun, node.id, recoveryMessage)
        };
      }

      if (node.choices?.length) {
        return {
          ...state,
          activeScreen: "adventure",
          adventureRun: {
            ...run,
            pendingNodeId: node.id,
            message: `${node.title}: choose how your dragon handles this event.`
          }
        };
      }

      if (node.kind === "treasure" || node.kind === "camp" || node.kind === "shrine" || node.kind === "shop") {
        return {
          ...state,
          activeScreen: "adventure",
          adventureRun: {
            ...run,
            pendingNodeId: node.id,
            message: `${node.title}: claim or choose before the route advances.`
          }
        };
      }

      if (isFightNode(node)) {
        return {
          ...state,
          activeScreen: "adventure",
          adventureRun: {
            ...run,
            pendingNodeId: node.id,
            message: `${node.title}: fight this enemy to keep moving.`
          }
        };
      }

      return state;
    }
    case "resolveAdventureChoice": {
      const run = state.adventureRun;
      const node = getAdventureNodeById(action.nodeId);
      const choice = node?.choices?.find((item) => item.id === action.choiceId);
      if (!run || !node || !choice || run.pendingNodeId !== node.id) {
        return state;
      }

      const rewardedState = applyAdventureReward(state, choice.reward, 4, { node, status: "active", nextStep: Math.min(run.maxSteps, run.step + 1) });
      const recoveredRun = withAdventureRecoveryStop(run, node);
      const recoveryMessage = node.kind === "shrine"
        ? `${choice.label} chosen. Shrine light restored Chapter HP; choose your next stop.`
        : node.kind === "camp"
          ? `${choice.label} chosen. Camp rest restored Chapter HP; choose your next stop.`
          : `${choice.label} chosen. Choose your next stop.`;
      return {
        ...rewardedState,
        activeScreen: "adventure",
        adventureRun: getNextRunState(recoveredRun, node.id, recoveryMessage)
      };
    }
    case "runAdventure": {
      if (!state.dragon.element) {
        return { ...state, activeScreen: "egg" };
      }

      const battle = createBattle(state);
      let nextState: GameState = {
        ...state,
        activeScreen: "battle",
        lastBattle: battle
      };

      if (!battle.won) {
        return nextState;
      }

      nextState = {
        ...nextState,
        player: {
          ...nextState.player,
          gold: nextState.player.gold + battle.encounter.rewardGold,
          essence: nextState.player.essence + battle.encounter.rewardEssence,
          unlockedStage: Math.min(encounters.length, nextState.player.unlockedStage + 1),
          battlesWon: nextState.player.battlesWon + 1,
          stagesCleared: Math.max(nextState.player.stagesCleared, battle.encounter.stage)
        }
      };

      return levelUpDragon(nextState, battle.encounter.rewardXp, 12 + battle.encounter.stage * 3);
    }
    case "buyUpgrade": {
      const cost = getUpgradeCost(state, action.stat);
      if (state.player.gold < cost) {
        return state;
      }
      const boost: Partial<Stats> =
        action.stat === "health" ? { health: 16 } : action.stat === "speed" ? { speed: 1 } : { [action.stat]: 3 };

      return {
        ...state,
        dragon: {
          ...state.dragon,
          stats: addStats(state.dragon.stats, boost),
          evolution: Math.min(100, state.dragon.evolution + 5)
        },
        player: {
          ...state.player,
          gold: state.player.gold - cost,
          upgradesBought: state.player.upgradesBought + 1
        }
      };
    }
    case "claimQuest": {
      const quest = quests.find((item) => item.id === action.questId);
      if (!quest || state.player.claimedQuests.includes(action.questId)) {
        return state;
      }
      if (state.player[quest.metric] < quest.target) {
        return state;
      }

      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold + quest.rewardGold,
          essence: state.player.essence + quest.rewardEssence,
          claimedQuests: [...state.player.claimedQuests, action.questId]
        }
      };
    }
    case "buyShopItem": {
      const item = shopItems.find((entry) => entry.id === action.itemId);
      if (!item || state.player.inventory.includes(item.id) || state.player.gold < item.cost) {
        return state;
      }

      return {
        ...state,
        dragon: {
          ...state.dragon,
          stats: addStats(state.dragon.stats, item.statBoost),
          evolution: Math.min(100, state.dragon.evolution + 7)
        },
        player: {
          ...state.player,
          gold: state.player.gold - item.cost,
          inventory: [...state.player.inventory, item.id]
        }
      };
    }
    case "setScreen":
      return { ...state, activeScreen: action.screen };
    case "resetGame":
      return {
        ...initialGameState,
        lastSavedAt: Date.now(),
        journeyEvents: {
          activeEventId: null,
          nextEventAt: scheduleNextJourneyEvent(),
          activeEffects: []
        },
        returnPresence: initialGameState.returnPresence
      };
    case "hydrate":
      const hydratedDragonStage = action.state.dragon?.stage ?? initialGameState.dragon.stage;
      const hydratedDragonElement = action.state.dragon?.element ?? initialGameState.dragon.element;
      const shouldNormalizeStarterHatchling = hydratedDragonStage === "hatchling" && (action.state.completedAdventureRuns ?? 0) === 0;
      const starterHatchlingStats = hydratedDragonElement ? addStats(baseStats, elementStatBonus[hydratedDragonElement]) : initialGameState.dragon.stats;
      const hydrated = {
        ...initialGameState,
        ...action.state,
        player: {
          ...initialGameState.player,
          ...action.state.player
        },
        idleUpgrades: {
          ...initialGameState.idleUpgrades,
          ...(action.state.idleUpgrades ?? {})
        },
        idleQuestProgress: {
          ...initialGameState.idleQuestProgress,
          ...(action.state.idleQuestProgress ?? {})
        },
        treasures: {
          ...initialGameState.treasures,
          ...(action.state.treasures ?? {})
        },
        equippedItems: action.state.equippedItems ?? {},
        adventureCompletions: {
          ...initialGameState.adventureCompletions,
          ...(action.state.adventureCompletions ?? {})
        },
        completedAdventureRuns: action.state.completedAdventureRuns ?? Object.values(action.state.adventureCompletions ?? {}).reduce((total, count) => total + Number(count ?? 0), 0),
        equipmentInventory: action.state.equipmentInventory ?? [],
        elementalShards: {
          ...initialGameState.elementalShards,
          ...(action.state.elementalShards ?? {})
        },
        selectedEvolutionTraits: {
          ...initialGameState.selectedEvolutionTraits,
          ...(action.state.selectedEvolutionTraits ?? {})
        },
        selectedActiveSkillId: shouldNormalizeStarterHatchling ? null : action.state.selectedActiveSkillId ?? initialGameState.selectedActiveSkillId,
        unlockedAchievements: action.state.unlockedAchievements ?? [],
        claimedAchievements: action.state.claimedAchievements ?? [],
        dailyGoals: normalizeDailyGoals(action.state.dailyGoals),
        autoBattle: action.state.autoBattle ?? createAutoBattle(action.state.currentArea ?? initialGameState.currentArea),
        dailyResetDate: action.state.dailyResetDate ?? getTodayKey(),
        lastLoginRewardDate: action.state.lastLoginRewardDate ?? null,
        loginStreakDay: action.state.loginStreakDay ?? 0,
        lifetimeEssence: action.state.lifetimeEssence ?? 0,
        dragonSouls: action.state.dragonSouls ?? 0,
        totalReincarnations: action.state.totalReincarnations ?? 0,
        settings: {
          ...initialGameState.settings,
          ...(action.state.settings ?? {})
        },
        playtestNotes: action.state.playtestNotes ?? [],
        guidedPlaytest: {
          ...initialGameState.guidedPlaytest,
          ...(action.state.guidedPlaytest ?? {}),
          completedStepIds: action.state.guidedPlaytest?.completedStepIds ?? []
        },
        journeyEvents: {
          ...initialGameState.journeyEvents,
          ...(action.state.journeyEvents ?? {}),
          activeEventId: action.state.journeyEvents?.activeEventId ?? null,
          nextEventAt: action.state.journeyEvents?.nextEventAt ?? scheduleNextJourneyEvent(),
          activeEffects: action.state.journeyEvents?.activeEffects ?? []
        },
        returnPresence: {
          ...initialGameState.returnPresence,
          ...(action.state.returnPresence ?? {}),
          active: false
        },
        dragon: {
          ...initialGameState.dragon,
          ...(action.state.dragon ?? {}),
          stats: shouldNormalizeStarterHatchling
            ? starterHatchlingStats
            : {
              ...initialGameState.dragon.stats,
              ...(action.state.dragon?.stats ?? {})
            },
          path: shouldNormalizeStarterHatchling ? null : action.state.dragon?.path ?? initialGameState.dragon.path,
          chosenTraits: shouldNormalizeStarterHatchling
            ? (action.state.dragon?.chosenTraits ?? initialGameState.dragon.chosenTraits).filter((trait) => !trait.startsWith("path:"))
            : action.state.dragon?.chosenTraits ?? initialGameState.dragon.chosenTraits
        },
        lastBattle: action.state.lastBattle ?? null,
        adventureRun: normalizeAdventureRun(action.state.adventureRun, shouldNormalizeStarterHatchling ? starterHatchlingStats.health : action.state.dragon?.stats?.health ?? initialGameState.dragon.stats.health),
        lastAdventureRewards: action.state.lastAdventureRewards ?? null,
        lastSkillDraftOffer: action.state.lastSkillDraftOffer
          ? {
              ...action.state.lastSkillDraftOffer,
              chosenSkillId: action.state.lastSkillDraftOffer.chosenSkillId ?? null
            }
          : null,
        eggAnswers: action.state.eggAnswers ?? {},
        eggTaps: action.state.eggTaps ?? initialGameState.eggTaps,
        activeScreen: action.state.activeScreen ?? initialGameState.activeScreen
      };
      const savedHasProgress =
        action.state.phase === "journey" ||
        (action.state.lifetimeEssence ?? 0) > 0 ||
        (action.state.dragonSouls ?? 0) > 0 ||
        (action.state.totalReincarnations ?? 0) > 0;
      const savedPendingReturn =
        (action.state.returnPresence?.pendingOfflineReward ?? 0) > 0 && !action.state.returnPresence?.rewardApplied
          ? action.state.returnPresence
          : null;
      const lastSaveDateBefore = action.state.lastSavedAt ?? Date.now();
      const elapsedSinceSaveMs = Date.now() - lastSaveDateBefore;
      const offlineReward = getOfflineEssenceReward(hydrated, elapsedSinceSaveMs);
      const shouldShowReturnPresence = savedHasProgress && elapsedSinceSaveMs >= returnPresenceThresholdMs;
      if (__DEV__) {
        console.log("[ReturnPresence]", {
          awayDurationMs: savedPendingReturn?.awayDurationMs ?? elapsedSinceSaveMs,
          calculatedOfflineEssence: savedPendingReturn?.pendingOfflineReward ?? offlineReward,
          pendingOfflineReward: savedPendingReturn?.pendingOfflineReward ?? (shouldShowReturnPresence ? offlineReward : 0),
          returnPhase: shouldShowReturnPresence || savedPendingReturn ? "resting" : "complete",
          rewardApplied: false,
          lastSaveDateBefore,
          lastSaveDateAfter: null
        });
      }
      return syncAchievements(resetDailyIfNeeded({
        ...hydrated,
        player: {
          ...hydrated.player,
          essence: shouldShowReturnPresence || savedPendingReturn ? hydrated.player.essence : hydrated.player.essence + offlineReward
        },
        lifetimeEssence: shouldShowReturnPresence || savedPendingReturn ? hydrated.lifetimeEssence : hydrated.lifetimeEssence + offlineReward,
        phase: action.state.phase ?? (action.state.dragon?.stage === "hatchling" ? "journey" : "egg"),
        currentQuestionIndex: action.state.currentQuestionIndex ?? Math.min(Object.keys(action.state.eggAnswers ?? {}).length, 2),
        journeyStep: action.state.journeyStep ?? 0,
        currentArea: action.state.currentArea ?? initialGameState.currentArea,
        tutorialCompleted: action.state.tutorialCompleted ?? savedHasProgress,
        returnPresence: savedPendingReturn
          ? {
              ...initialGameState.returnPresence,
              ...savedPendingReturn,
              active: true,
              startedAt: Date.now()
            }
          : shouldShowReturnPresence
            ? createReturnPresence(elapsedSinceSaveMs, offlineReward, lastSaveDateBefore)
            : initialGameState.returnPresence,
        lastLoot:
          offlineReward > 0 && !shouldShowReturnPresence && !savedPendingReturn
            ? {
                id: Date.now(),
                message:
                  hydrated.dragon.element === "water"
                    ? `The tide carried back +${offlineReward} offline essence.`
                    : `Returned to +${offlineReward} offline essence.`
              }
            : action.state.lastLoot ?? null,
        lastSavedAt: shouldShowReturnPresence || savedPendingReturn ? lastSaveDateBefore : Date.now()
      }));
    default:
      return state;
  }
}
