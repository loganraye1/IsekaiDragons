import { adventureNodes, dragonForms, encounters, quests, shopItems } from "./content";
import { BALANCE } from "./balance";
import {
  AchievementId,
  AreaId,
  AutoBattleState,
  AdventureNode,
  AdventureReward,
  AdventureRun,
  BattleResult,
  DragonElement,
  DragonStage,
  DailyGoalId,
  EquipmentBonusType,
  EquipmentItem,
  EquipmentRarity,
  EquipmentSlot,
  EvolutionTraitId,
  GameAction,
  GameSettings,
  GameState,
  IdleQuestId,
  IdleUpgradeId,
  JourneyEventEffect,
  JourneyEventEffectType,
  JourneyEventId,
  PlaytestNote,
  Stats,
  TreasureRarity,
  TreasureId
} from "./types";

const baseStats: Stats = {
  attack: 12,
  health: 95,
  defense: 5,
  speed: 5
};

const defaultSettings: GameSettings = {
  hapticsEnabled: true,
  reducedMotion: false,
  numberFormat: "compact"
};

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
    tapDragon50: { progress: 0, claimed: false },
    completeQuest5: { progress: 0, claimed: false },
    buyUpgrade3: { progress: 0, claimed: false },
    earnTreasure1: { progress: 0, claimed: false }
  };
}

export const idleUpgradeDefinitions: Record<IdleUpgradeId, { name: string; baseCost: number; costGrowth: number; epsBonus: number }> = {
  manaSprout: {
    name: "Mana Sprout",
    baseCost: BALANCE.upgrades.idle.manaSprout.baseCost,
    costGrowth: BALANCE.upgrades.idle.manaSprout.costGrowth,
    epsBonus: 1
  },
  crystalNest: {
    name: "Crystal Nest",
    baseCost: BALANCE.upgrades.idle.crystalNest.baseCost,
    costGrowth: BALANCE.upgrades.idle.crystalNest.costGrowth,
    epsBonus: 5
  },
  ancientRoot: {
    name: "Ancient Root",
    baseCost: BALANCE.upgrades.idle.ancientRoot.baseCost,
    costGrowth: BALANCE.upgrades.idle.ancientRoot.costGrowth,
    epsBonus: 25
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
  tap: "Tap bonus",
  eps: "EPS bonus",
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
    bonuses: ["Quest actions every 8s", "+20% tap essence", "Aggressive loot bursts"],
    lootTone: "The hoard burns brighter"
  },
  water: {
    title: "Water Flow",
    bonuses: ["+15% EPS", "+25% offline rewards", "Calm mystical loot"],
    lootTone: "The tide reveals"
  },
  earth: {
    title: "Earth Endurance",
    bonuses: ["15% cheaper upgrades", "+20% treasure chance", "Ancient sturdy loot"],
    lootTone: "The old stone yields"
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
  tapDragon50: { title: "Tap dragon 50 times", target: 50, reward: { essence: 120, shards: { fire: 1 } } },
  completeQuest5: { title: "Complete 5 quest actions", target: 5, reward: { essence: 180, shards: { water: 1 } } },
  buyUpgrade3: { title: "Buy 3 upgrades", target: 3, reward: { essence: 220, shards: { earth: 1 } } },
  earnTreasure1: { title: "Earn 1 treasure", target: 1, reward: { essence: 300, shards: { fire: 1, water: 1, earth: 1 } } }
};

export const dailyGoalOrder: DailyGoalId[] = ["tapDragon50", "completeQuest5", "buyUpgrade3", "earnTreasure1"];

export const dailyLoginRewardDefinitions: Record<number, { title: string; reward: RewardDefinition }> = {
  1: { title: "Essence Cache", reward: { essence: 150 } },
  2: { title: "Elemental Shards", reward: { shards: { fire: 1, water: 1, earth: 1 } } },
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
  ]
};

export const initialGameState: GameState = {
  dragon: {
    name: "Unnamed Egg",
    stage: "egg",
    element: null,
    level: 1,
    xp: 0,
    evolution: 0,
    stats: baseStats,
    chosenTraits: []
  },
  player: {
    gold: 80,
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
    earth: 0
  },
  selectedEvolutionTraits: {},
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
  phase: "egg",
  currentQuestionIndex: 0,
  journeyStep: 0,
  activeScreen: "egg",
  lastBattle: null,
  adventureRun: null,
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
  earth: { health: 14, defense: 6 }
};

const elementAdvantage: Record<DragonElement, DragonElement> = {
  fire: "earth",
  water: "fire",
  earth: "water"
};

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
  return BALANCE.upgrades.idleCapsByStage[state.dragon.stage][upgradeId];
}

export function isIdleUpgradeCapped(state: GameState, upgradeId: IdleUpgradeId) {
  return (state.idleUpgrades[upgradeId] ?? 0) >= getIdleUpgradeCap(state, upgradeId);
}

export function getEssencePerSecond(state: GameState) {
  const base = idleUpgradeOrder.reduce((total, upgradeId) => {
    const level = state.idleUpgrades[upgradeId] ?? 0;
    return total + level * idleUpgradeDefinitions[upgradeId].epsBonus;
  }, 0);
  const treasureMultiplier = 1 + (state.treasures.glowingScale ?? 0) * 0.05 + (state.treasures.manaPearl ?? 0) * 0.04;
  const elementMultiplier = state.dragon.element === "water" ? 1.15 : 1;
  const traitMultiplier = hasEvolutionTrait(state, "tideheartDrake") ? 1.2 : 1;
  return Math.round(base * treasureMultiplier * elementMultiplier * traitMultiplier * getDragonSoulMultiplier(state) * getEquipmentBonusMultiplier(state, "eps") * getJourneyEventEffectMultiplier(state, "eps") * 10) / 10;
}

export function getTapEssence(state: GameState) {
  const stageBonus = state.dragon.stage === "wyrm" ? 10 : state.dragon.stage === "dragon" ? 8 : state.dragon.stage === "drake" ? 4 : 1;
  const base = stageBonus + Math.floor(getEssencePerSecond(state) / 20);
  const treasureMultiplier = 1 + (state.treasures.tinyCrown ?? 0) * 0.05 + (state.treasures.phoenixEmber ?? 0) * 0.08;
  const elementMultiplier = state.dragon.element === "fire" ? 1.2 : 1;
  const traitMultiplier = hasEvolutionTrait(state, "flameclawDrake") ? 1.25 : 1;
  return Math.max(1, Math.floor(base * treasureMultiplier * elementMultiplier * traitMultiplier * getDragonSoulMultiplier(state) * getEquipmentBonusMultiplier(state, "tap") * getJourneyEventEffectMultiplier(state, "tap")));
}

export function getQuestIntervalMs(state: GameState) {
  return state.dragon.element === "fire" ? 8000 : 10000;
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

export function getBattleDamage(state: GameState) {
  const elementMultiplier = state.dragon.element === "fire" ? 1.15 : 1;
  const treasureMultiplier = 1 + (state.treasures.dragonFang ?? 0) * 0.05;
  return Math.max(1, Math.floor(getDragonPower(state) * 0.22 * elementMultiplier * treasureMultiplier * getEquipmentBonusMultiplier(state, "battleDamage") * getJourneyEventEffectMultiplier(state, "battleDamage")));
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

function pickEquipmentRarity(areaId: AreaId): EquipmentRarity {
  const areaIndex = Math.max(0, areaOrder.indexOf(areaId));
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

function createEquipmentItem(areaId: AreaId): EquipmentItem {
  const slot = equipmentSlots[Math.floor(Math.random() * equipmentSlots.length)] ?? "horn";
  const rarity = pickEquipmentRarity(areaId);
  const bonusTypes: EquipmentBonusType[] = ["tap", "eps", "questReward", "battleDamage", "treasureDrop"];
  const bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)] ?? "tap";
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

function pickTreasure(areaId: AreaId = "mysticMeadow") {
  const areaIndex = Math.max(0, areaOrder.indexOf(areaId));
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
      earth: state.elementalShards.earth + (reward.shards?.earth ?? 0)
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
  const scores: Record<DragonElement, number> = { fire: 0, water: 0, earth: 0 };
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
    speed: stats.speed + (boost.speed ?? 0)
  };
}

function createAdventureRun(step = 1): AdventureRun {
  return {
    id: `run-${Date.now()}`,
    step,
    maxSteps: 5,
    nodes: getAdventureChoices(step),
    visitedNodeIds: [],
    pendingNodeId: null,
    status: "active",
    message: "Choose a route and guide your dragon toward the rift boss."
  };
}

function getAdventureChoices(step: number) {
  const nodesForStep = adventureNodes.filter((node) => node.step === step);
  return nodesForStep.length > 0 ? nodesForStep : adventureNodes.filter((node) => node.kind === "boss");
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
    nodes: getAdventureChoices(nextStep),
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
    reward.evolution ? `${reward.evolution}% evolution` : null,
    reward.statBoost ? formatStatBoost(reward.statBoost) : null
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "No reward";
}

function formatStatBoost(boost: Partial<Stats>) {
  return (Object.entries(boost) as Array<[keyof Stats, number]>)
    .map(([stat, amount]) => `+${amount} ${stat}`)
    .join(", ");
}

function applyAdventureReward(state: GameState, reward: AdventureReward, fallbackEvolution = 0): GameState {
  const withCurrencies: GameState = {
    ...state,
    dragon: {
      ...state.dragon,
      stats: reward.statBoost ? addStats(state.dragon.stats, reward.statBoost) : state.dragon.stats
    },
    player: {
      ...state.player,
      gold: state.player.gold + (reward.gold ?? 0),
      essence: state.player.essence + (reward.essence ?? 0)
    }
  };

  return levelUpDragon(withCurrencies, reward.xp ?? 0, reward.evolution ?? fallbackEvolution);
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

function chooseElement(answers: Record<string, DragonElement>): DragonElement {
  return getLeadingElement(answers);
}

function scaleStats(stats: Stats, difficulty: number): Stats {
  return {
    attack: Math.round(stats.attack * difficulty),
    health: Math.round(stats.health * difficulty),
    defense: Math.round(stats.defense * difficulty),
    speed: Math.round(stats.speed * Math.max(0.9, difficulty * 0.96))
  };
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
  const advantage = elementAdvantage[dragonElement] === encounter.element ? 1.22 : 1;
  const disadvantage = elementAdvantage[encounter.element] === dragonElement ? 0.9 : 1;
  let playerHp = state.dragon.stats.health;
  let enemyHp = encounter.stats.health;
  const rounds: string[] = [];

  for (let round = 1; round <= 8 && playerHp > 0 && enemyHp > 0; round += 1) {
    const playerDamage = Math.max(
      4,
      Math.round((state.dragon.stats.attack * advantage + state.dragon.stats.speed * 0.6) - encounter.stats.defense)
    );
    enemyHp = Math.max(0, enemyHp - playerDamage);
    rounds.push(`Round ${round}: Your dragon hits ${encounter.name} for ${playerDamage}.`);

    if (enemyHp <= 0) {
      break;
    }

    const enemyDamage = Math.max(
      3,
      Math.round((encounter.stats.attack * disadvantage + encounter.stats.speed * 0.4) - state.dragon.stats.defense)
    );
    playerHp = Math.max(0, playerHp - enemyDamage);
    rounds.push(`${encounter.name} strikes back for ${enemyDamage}.`);
  }

  if (playerHp > 0 && enemyHp > 0) {
    const wonByPressure = playerHp / state.dragon.stats.health >= enemyHp / encounter.stats.health;
    if (wonByPressure) {
      enemyHp = 0;
      rounds.push("Your dragon wins by overwhelming momentum.");
    } else {
      playerHp = 0;
      rounds.push("The encounter forces a retreat.");
    }
  }

  return {
    encounter,
    won: playerHp > 0,
    playerHp,
    enemyHp,
    rounds,
    nodeKind: node?.kind,
    title: node?.title,
    rewardSummary: node ? summarizeReward({ ...node.reward, gold: encounter.rewardGold, essence: encounter.rewardEssence, xp: encounter.rewardXp }) : undefined
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  state = action.type === "hydrate" || action.type === "resetGame" ? state : removeExpiredJourneyEffects(resetDailyIfNeeded(state));
  switch (action.type) {
    case "tapEgg": {
      if (state.phase !== "egg") {
        return state;
      }
      return {
        ...state,
        activeScreen: "egg",
        phase: "question"
      };
    }
    case "chooseEggAnswer": {
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
      const element = chooseElement(state.eggAnswers);
      const boostedStats = addStats(baseStats, elementStatBonus[element]);

      return syncAchievements({
        ...state,
        activeScreen: "egg",
        phase: "journey",
        journeyStep: 0,
        dragon: {
          ...state.dragon,
          name: `${element[0].toUpperCase()}${element.slice(1)} Dragon`,
          element,
          stage: "hatchling",
          evolution: 12,
          stats: boostedStats
        },
        journeyEvents: {
          activeEventId: null,
          nextEventAt: scheduleNextJourneyEvent(),
          activeEffects: []
        }
      });
    }
    case "finishHatching": {
      if (state.dragon.stage === "hatchling") {
        return {
          ...state,
          phase: "journey",
          activeScreen: "egg"
        };
      }
      return gameReducer(state, { type: "hatchDragon" });
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
    case "tapDragon": {
      const essenceGain = action.amount ?? getTapEssence(state);
      return syncAchievements(addDailyProgress({
        ...state,
        lifetimeEssence: state.lifetimeEssence + essenceGain,
        player: {
          ...state.player,
          essence: state.player.essence + essenceGain
        }
      }, "tapDragon50", 1));
    }
    case "collectPassiveEssence": {
      if (action.amount <= 0) {
        return state;
      }

      return syncAchievements({
        ...state,
        lifetimeEssence: state.lifetimeEssence + action.amount,
        player: {
          ...state.player,
          essence: state.player.essence + action.amount
        }
      });
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
      if (state.dragon.stage === "hatchling" && !action.traitId) {
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

      return {
        ...state,
        activeScreen: "adventure",
        adventureRun: createAdventureRun()
      };
    }
    case "selectAdventureNode": {
      const run = state.adventureRun?.status === "active" ? state.adventureRun : createAdventureRun();
      const node = run.nodes.find((item) => item.id === action.nodeId) ?? getAdventureNodeById(action.nodeId);
      if (!node) {
        return state;
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

      if (node.kind === "treasure" || node.kind === "camp" || node.kind === "shrine") {
        const rewardedState = applyAdventureReward(state, node.reward, 3);
        return {
          ...rewardedState,
          activeScreen: "adventure",
          adventureRun: getNextRunState(run, node.id, `${node.title} resolved. Gained ${summarizeReward(node.reward)}.`)
        };
      }

      const battle = createBattle(state, node);
      let nextState: GameState = {
        ...state,
        activeScreen: "battle",
        lastBattle: battle
      };

      if (!battle.won) {
        return {
          ...nextState,
          adventureRun: {
            ...run,
            visitedNodeIds: [...run.visitedNodeIds, node.id],
            pendingNodeId: null,
            status: "failed",
            message: `${node.title} forced a retreat. Train and begin another run.`
          }
        };
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
      nextState = applyAdventureReward(
        nextState,
        {
          ...node.reward,
          gold: battle.encounter.rewardGold,
          essence: battle.encounter.rewardEssence,
          xp: battle.encounter.rewardXp
        },
        node.kind === "boss" ? 18 : node.kind === "elite" ? 12 : 8
      );

      return {
        ...nextState,
        adventureRun: getNextRunState(
          run,
          node.id,
          node.kind === "boss" ? "Boss defeated. The rift calms and the run is complete." : `${node.title} cleared. Choose the next route.`,
          node.kind === "boss" ? "complete" : "active"
        )
      };
    }
    case "resolveAdventureChoice": {
      const run = state.adventureRun;
      const node = getAdventureNodeById(action.nodeId);
      const choice = node?.choices?.find((item) => item.id === action.choiceId);
      if (!run || !node || !choice || run.pendingNodeId !== node.id) {
        return state;
      }

      const rewardedState = applyAdventureReward(state, choice.reward, 4);
      return {
        ...rewardedState,
        activeScreen: "adventure",
        adventureRun: getNextRunState(run, node.id, `${choice.label}: gained ${summarizeReward(choice.reward)}.`)
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
        equipmentInventory: action.state.equipmentInventory ?? [],
        elementalShards: {
          ...initialGameState.elementalShards,
          ...(action.state.elementalShards ?? {})
        },
        selectedEvolutionTraits: {
          ...initialGameState.selectedEvolutionTraits,
          ...(action.state.selectedEvolutionTraits ?? {})
        },
        unlockedAchievements: action.state.unlockedAchievements ?? [],
        claimedAchievements: action.state.claimedAchievements ?? [],
        dailyGoals: {
          ...initialGameState.dailyGoals,
          ...(action.state.dailyGoals ?? {})
        },
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
          stats: {
            ...initialGameState.dragon.stats,
            ...(action.state.dragon?.stats ?? {})
          },
          chosenTraits: action.state.dragon?.chosenTraits ?? initialGameState.dragon.chosenTraits
        },
        lastBattle: action.state.lastBattle ?? null,
        adventureRun: action.state.adventureRun ?? null,
        eggAnswers: action.state.eggAnswers ?? {},
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
