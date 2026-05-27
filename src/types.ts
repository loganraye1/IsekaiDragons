export type DragonElement = "fire" | "water" | "earth" | "light" | "dark";

export type DragonSkillArchetype = "fire" | "frost" | "storm" | "shadow" | "gold" | "ancient";

export type DragonSkillDraft = {
  id: string;
  archetype: DragonSkillArchetype;
  elementFocus: DragonElement;
  roleFocus: "guardian" | "raider" | "mystic";
  name: string;
  trigger: string;
  effect: string;
  synergy: string;
  pathPayoff: string;
  activeBonus: {
    damageMultiplier: number;
    damageReduction: number;
    combatEffect: string;
  };
  statHooks: Array<keyof Stats>;
};

export type ActiveSkillSummary = {
  id: string;
  name: string;
  elementFocus: DragonSkillDraft["elementFocus"];
  roleFocus: DragonSkillDraft["roleFocus"];
  trigger: string;
  combatEffect: string;
};

export type EliteSkillDraftOffer = {
  sourceNodeId: string;
  sourceNodeTitle: string;
  offeredAt: number;
  skillIds: string[];
  chosenSkillId: string | null;
  reason: string;
};

export type SupportingSystemRecommendation = {
  id: string;
  lane: "gear-relics" | "hoard" | "idle" | "daily-starter" | "automation";
  name: string;
  purpose: string;
  inGameProof: string;
  nextHook: string;
};

export type ProductiveWorkNowSlice = {
  id: string;
  lane: "Adventure path" | "Flashy battle" | "Impact stats" | "Fire evolution";
  productionTarget: string;
  visibleDeliverable: string;
  nextHook: string;
};

export type FireStarterAdventureMilestone = {
  id: string;
  phase: "research" | "route" | "combat" | "evolution";
  title: string;
  capybaraLesson: string;
  dragonTwist: string;
  visibleProof: string;
};

export type DragonStage = "egg" | "hatchling" | "drake" | "dragon" | "wyrm";

export type DragonPathId =
  | "fireGuardian"
  | "fireRaider"
  | "fireMystic"
  | "waterGuardian"
  | "waterRaider"
  | "waterMystic"
  | "earthGuardian"
  | "earthRaider"
  | "earthMystic"
  | "lightGuardian"
  | "lightRaider"
  | "lightMystic"
  | "darkGuardian"
  | "darkRaider"
  | "darkMystic";

export type ScreenKey = "den" | "egg" | "adventure" | "battle" | "upgrade" | "quests" | "shop";

export type AdventureNodeKind = "battle" | "elite" | "treasure" | "shrine" | "camp" | "shop" | "boss";

export type AdventureDifficultyId = "hatchlingTrail" | "drakeExpedition" | "shadowVale" | "ancientRift";

export type GamePhase = "egg" | "question" | "hatching" | "journey";

export type NumberFormat = "compact" | "full";

export type AreaId = "mysticMeadow" | "emberWoods" | "tideCavern" | "stonebackHills" | "skyRuins" | "voidNest";

export type IdleQuestId = "defeatSlimes" | "gatherCrystals" | "findScale";

export type TreasureId =
  | "tinyCrown"
  | "glowingScale"
  | "ancientCoin"
  | "dragonFang"
  | "manaPearl"
  | "worldrootSeed"
  | "phoenixEmber"
  | "leviathanTear"
  | "titanStone";

export type TreasureRarity = "common" | "rare" | "epic" | "legendary";

export type EquipmentSlot = "horn" | "scales" | "claws" | "relic";

export type EquipmentRarity = "common" | "rare" | "epic" | "legendary";

export type EquipmentBonusType = "adventureLoot" | "questReward" | "battleDamage" | "treasureDrop";

export type EquipmentItem = {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  bonusType: EquipmentBonusType;
  bonusPercent: number;
  sellValue: number;
};

export type EvolutionTraitId =
  | "flameclawDrake"
  | "ashwingDrake"
  | "tideheartDrake"
  | "mistveilDrake"
  | "ironrootDrake"
  | "gemscaleDrake"
  | "haloheartDrake"
  | "sunlanceDrake"
  | "voidscaleDrake"
  | "nightfangDrake";

export type AchievementId =
  | "firstHatch"
  | "firstDrake"
  | "firstDragon"
  | "firstWyrm"
  | "soulbound"
  | "treasureHoarder"
  | "essenceTycoon";

export type DailyGoalId = "completeAdventure1" | "completeQuest5" | "buyUpgrade3" | "earnTreasure1";

export type DailyGoalState = {
  progress: number;
  claimed: boolean;
};

export type AutoBattleState = {
  areaId: AreaId;
  enemyName: string;
  enemyHp: number;
  enemyMaxHp: number;
  defeatedCount: number;
};

export type LootEvent = {
  id: number;
  message: string;
  treasureId?: TreasureId;
  equipmentId?: string;
  shard?: DragonElement;
};

export type Stats = {
  attack: number;
  health: number;
  defense: number;
  speed: number;
  block: number;
  dodge: number;
  critChance: number;
  critDamage: number;
};

export type EggChoice = {
  id: string;
  prompt: string;
  answers: Array<{
    id: string;
    label: string;
    description: string;
    element: DragonElement;
  }>;
};

export type DragonForm = {
  stage: DragonStage;
  element: DragonElement;
  name: string;
  title: string;
  description: string;
  aura: string;
};

export type Encounter = {
  id: string;
  stage: number;
  name: string;
  element: DragonElement;
  stats: Stats;
  rewardGold: number;
  rewardXp: number;
};

export type AdventureReward = {
  gold?: number;
  gems?: number;
  xp?: number;
  evolution?: number;
  statBoost?: Partial<Stats>;
};

export type AdventureEventChoice = {
  id: string;
  label: string;
  description: string;
  reward: AdventureReward;
};

export type AdventureNode = {
  id: string;
  step: number;
  chapter?: number;
  chapterStop?: number;
  evolutionMilestone?: boolean;
  kind: AdventureNodeKind;
  title: string;
  description: string;
  scene: "forest" | "ruins" | "cave" | "shrine" | "camp" | "boss";
  element?: DragonElement;
  encounterId?: string;
  difficulty: number;
  reward: AdventureReward;
  choices?: AdventureEventChoice[];
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  target: number;
  rewardGold: number;
  metric: "battlesWon" | "upgradesBought" | "stagesCleared";
};

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  statBoost: Partial<Stats>;
};

export type DragonState = {
  name: string;
  stage: DragonStage;
  element: DragonElement | null;
  path: DragonPathId | null;
  level: number;
  xp: number;
  evolution: number;
  stats: Stats;
  chosenTraits: string[];
};

export type PlayerState = {
  gold: number;
  gems: number;
  inventory: string[];
  unlockedStage: number;
  battlesWon: number;
  upgradesBought: number;
  stagesCleared: number;
  claimedQuests: string[];
};

export type BattleDamageSummary = {
  playerDamage: number;
  enemyCounterDamage: number;
  totalPlayerDamage: number;
  totalEnemyCounterDamage: number;
};

export type BattleResult = {
  encounter: Encounter;
  won: boolean;
  playerHp: number;
  enemyHp: number;
  battleStartHp?: number;
  rounds: string[];
  damageSummary?: BattleDamageSummary;
  activeSkill?: ActiveSkillSummary;
  nodeKind?: AdventureNodeKind;
  title?: string;
  rewardSummary?: string;
};

export type AdventureRewardBundle = {
  lootGained: string[];
  statsImproved: string[];
  hoardProgress: string;
  evolutionProgress: string;
  nextRecommendedAdventure: string;
  treasureDrop?: TreasureId;
  equipmentDrop?: EquipmentItem;
};

export type AdventureRun = {
  id: string;
  difficultyId: AdventureDifficultyId;
  title: string;
  background: AdventureNode["scene"];
  enemyFamilies: string[];
  step: number;
  maxSteps: number;
  currentHp: number;
  maxHp: number;
  nodes: AdventureNode[];
  visitedNodeIds: string[];
  pendingNodeId: string | null;
  status: "idle" | "active" | "complete" | "failed";
  message: string;
};

export type GameSettings = {
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  numberFormat: NumberFormat;
};

export type PlaytestNote = {
  id: string;
  text: string;
  timestamp: number;
  stage: DragonStage;
  element: DragonElement | null;
  essence: number;
  area: AreaId;
  defeatedCount: number;
};

export type GuidedPlaytestState = {
  active: boolean;
  completedStepIds: string[];
  startedAt: number | null;
};

export type JourneyEventId =
  | "wanderingMerchant"
  | "injuredAdventurer"
  | "ancientShrine"
  | "treasureGoblin"
  | "elementalStorm"
  | "sleepingBeast"
  | "lostCaravan"
  | "dragonMemory";

export type JourneyEventEffectType = "eps" | "tap" | "criticalTap" | "battleDamage" | "questReward" | "upgradeCost";

export type JourneyEventEffect = {
  id: string;
  label: string;
  type: JourneyEventEffectType;
  multiplier: number;
  expiresAt: number;
};

export type JourneyEventState = {
  activeEventId: JourneyEventId | null;
  nextEventAt: number;
  activeEffects: JourneyEventEffect[];
};

export type StoryCard = {
  id: string;
  title: string;
  body: string;
  type: "intro" | "outro";
  chapterId: AdventureDifficultyId;
};

export type OfflineRewardBundle = {
  gold: number;
  gems: number;
  equipmentItem: EquipmentItem | null;
  treasureId: TreasureId | null;
};

export type ReturnPresenceState = {
  active: boolean;
  startedAt: number | null;
  awayDurationMs: number;
  line: string;
  offlineReward: number;
  pendingOfflineReward: number;
  offlineBundle: OfflineRewardBundle | null;
  rewardApplied: boolean;
  lastSaveDateBefore: number | null;
  lastSaveDateAfter: number | null;
};

export type GameState = {
  dragon: DragonState;
  player: PlayerState;
  currentArea: AreaId;
  idleQuestProgress: Record<IdleQuestId, number>;
  treasures: Record<TreasureId, number>;
  equippedItems: Partial<Record<EquipmentSlot, EquipmentItem>>;
  equipmentInventory: EquipmentItem[];
  elementalShards: Record<DragonElement, number>;
  selectedEvolutionTraits: Partial<Record<DragonStage, EvolutionTraitId>>;
  selectedActiveSkillId: string | null;
  dragonSouls: number;
  totalReincarnations: number;
  unlockedAchievements: AchievementId[];
  claimedAchievements: AchievementId[];
  dailyGoals: Record<DailyGoalId, DailyGoalState>;
  dailyResetDate: string;
  autoBattle: AutoBattleState;
  lastLoot: LootEvent | null;
  lastSavedAt: number;
  eggAnswers: Record<string, DragonElement>;
  eggTaps: number;
  phase: GamePhase;
  currentQuestionIndex: number;
  journeyStep: number;
  activeScreen: ScreenKey;
  lastBattle: BattleResult | null;
  adventureRun: AdventureRun | null;
  adventureCompletions: Record<AdventureDifficultyId, number>;
  completedAdventureRuns: number;
  lastAdventureRewards: AdventureRewardBundle | null;
  lastSkillDraftOffer: EliteSkillDraftOffer | null;
  tutorialCompleted: boolean;
  lastLoginRewardDate: string | null;
  loginStreakDay: number;
  settings: GameSettings;
  playtestNotes: PlaytestNote[];
  guidedPlaytest: GuidedPlaytestState;
  journeyEvents: JourneyEventState;
  returnPresence: ReturnPresenceState;
  statUpgrades: { attack: number; defense: number; health: number };
  pendingStoryCard: StoryCard | null;
};

export type GameAction =
  | { type: "selectEgg"; element: DragonElement }
  | { type: "tapEgg" }
  | { type: "chooseEggAnswer"; choiceId: string; element: DragonElement; trait: string }
  | { type: "hatchDragon" }
  | { type: "finishHatching" }
  | { type: "selectDragonPath"; pathId: DragonPathId }
  | { type: "selectActiveSkill"; skillId: string }
  | { type: "advanceJourney" }
  | { type: "evolveDragon"; traitId?: EvolutionTraitId }
  | { type: "autoQuestAction" }
  | { type: "reincarnate" }
  | { type: "claimAchievement"; achievementId: AchievementId }
  | { type: "claimDailyGoal"; goalId: DailyGoalId }
  | { type: "equipItem"; itemId: string }
  | { type: "sellItem"; itemId: string }
  | { type: "completeTutorial" }
  | { type: "claimDailyLoginReward" }
  | { type: "updateSettings"; settings: Partial<GameSettings> }
  | { type: "addPlaytestNote"; text: string }
  | { type: "clearPlaytestNotes" }
  | { type: "startGuidedPlaytest" }
  | { type: "endGuidedPlaytest" }
  | { type: "completeGuidedPlaytestSteps"; stepIds: string[] }
  | { type: "toggleGuidedPlaytestStep"; stepId: string }
  | { type: "triggerJourneyEvent"; eventId?: JourneyEventId }
  | { type: "resolveJourneyEvent"; choiceId: string }
  | { type: "completeReturnPresence" }
  | { type: "startReturnPresenceTest"; awayDurationMs: number; withRewards?: boolean }
  | { type: "startAdventureRun"; difficultyId?: AdventureDifficultyId; startStep?: number }
  | { type: "selectAdventureNode"; nodeId: string }
  | { type: "resolveAdventureChoice"; nodeId: string; choiceId: string }
  | { type: "runAdventure" }
  | { type: "buyUpgrade"; stat: keyof Stats }
  | { type: "upgradeStats"; stat: "attack" | "defense" | "health" }
  | { type: "dismissStoryCard" }
  | { type: "claimQuest"; questId: string }
  | { type: "buyShopItem"; itemId: string }
  | { type: "setScreen"; screen: ScreenKey }
  | { type: "resetGame" }
  | { type: "hydrate"; state: GameState };
