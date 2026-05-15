export type DragonElement = "fire" | "water" | "earth";

export type DragonStage = "egg" | "hatchling" | "drake" | "dragon" | "wyrm";

export type ScreenKey = "den" | "egg" | "adventure" | "battle" | "upgrade" | "quests" | "shop";

export type AdventureNodeKind = "battle" | "elite" | "treasure" | "shrine" | "camp" | "boss";

export type GamePhase = "egg" | "question" | "hatching" | "journey";

export type NumberFormat = "compact" | "full";

export type IdleUpgradeId = "manaSprout" | "crystalNest" | "ancientRoot";

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

export type EquipmentBonusType = "tap" | "eps" | "questReward" | "battleDamage" | "treasureDrop";

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
  | "gemscaleDrake";

export type AchievementId =
  | "firstHatch"
  | "firstDrake"
  | "firstDragon"
  | "firstWyrm"
  | "soulbound"
  | "treasureHoarder"
  | "essenceTycoon";

export type DailyGoalId = "tapDragon50" | "completeQuest5" | "buyUpgrade3" | "earnTreasure1";

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
  rewardEssence: number;
  rewardXp: number;
};

export type AdventureReward = {
  gold?: number;
  essence?: number;
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
  rewardEssence: number;
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
  level: number;
  xp: number;
  evolution: number;
  stats: Stats;
  chosenTraits: string[];
};

export type PlayerState = {
  gold: number;
  essence: number;
  inventory: string[];
  unlockedStage: number;
  battlesWon: number;
  upgradesBought: number;
  stagesCleared: number;
  claimedQuests: string[];
};

export type BattleResult = {
  encounter: Encounter;
  won: boolean;
  playerHp: number;
  enemyHp: number;
  rounds: string[];
  nodeKind?: AdventureNodeKind;
  title?: string;
  rewardSummary?: string;
};

export type AdventureRun = {
  id: string;
  step: number;
  maxSteps: number;
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

export type ReturnPresenceState = {
  active: boolean;
  startedAt: number | null;
  awayDurationMs: number;
  line: string;
  offlineReward: number;
  pendingOfflineReward: number;
  rewardApplied: boolean;
  lastSaveDateBefore: number | null;
  lastSaveDateAfter: number | null;
};

export type GameState = {
  dragon: DragonState;
  player: PlayerState;
  idleUpgrades: Record<IdleUpgradeId, number>;
  currentArea: AreaId;
  idleQuestProgress: Record<IdleQuestId, number>;
  treasures: Record<TreasureId, number>;
  equippedItems: Partial<Record<EquipmentSlot, EquipmentItem>>;
  equipmentInventory: EquipmentItem[];
  elementalShards: Record<DragonElement, number>;
  selectedEvolutionTraits: Partial<Record<DragonStage, EvolutionTraitId>>;
  lifetimeEssence: number;
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
  tutorialCompleted: boolean;
  lastLoginRewardDate: string | null;
  loginStreakDay: number;
  settings: GameSettings;
  playtestNotes: PlaytestNote[];
  guidedPlaytest: GuidedPlaytestState;
  journeyEvents: JourneyEventState;
  returnPresence: ReturnPresenceState;
};

export type GameAction =
  | { type: "selectEgg"; element: DragonElement }
  | { type: "tapEgg" }
  | { type: "chooseEggAnswer"; choiceId: string; element: DragonElement; trait: string }
  | { type: "hatchDragon" }
  | { type: "finishHatching" }
  | { type: "advanceJourney" }
  | { type: "tapDragon"; amount?: number }
  | { type: "collectPassiveEssence"; amount: number }
  | { type: "buyIdleUpgrade"; upgradeId: IdleUpgradeId }
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
  | { type: "startAdventureRun" }
  | { type: "selectAdventureNode"; nodeId: string }
  | { type: "resolveAdventureChoice"; nodeId: string; choiceId: string }
  | { type: "runAdventure" }
  | { type: "buyUpgrade"; stat: keyof Stats }
  | { type: "claimQuest"; questId: string }
  | { type: "buyShopItem"; itemId: string }
  | { type: "setScreen"; screen: ScreenKey }
  | { type: "resetGame" }
  | { type: "hydrate"; state: GameState };
