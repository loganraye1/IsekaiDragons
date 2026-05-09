export const BALANCE_VERSION = "0.1.0";

export const BALANCE = {
  // Essence targets by stage. Wyrm remains terminal in code; its value is kept for future/post-Wyrm tuning.
  evolutionCosts: {
    egg: 0,
    hatchling: 300,
    drake: 7500,
    dragon: 60000,
    wyrm: 240000
  },
  upgrades: {
    // Idle economy upgrade pricing. `costGrowth` compounds per owned level.
    idle: {
      manaSprout: { baseCost: 40, costGrowth: 1.9 },
      crystalNest: { baseCost: 300, costGrowth: 2.05 },
      ancientRoot: { baseCost: 1400, costGrowth: 2.25 }
    },
    // Maximum idle upgrade levels by dragon stage. Wyrm uses high caps so it effectively has no MVP cap.
    idleCapsByStage: {
      egg: { manaSprout: 3, crystalNest: 0, ancientRoot: 0 },
      hatchling: { manaSprout: 6, crystalNest: 2, ancientRoot: 0 },
      drake: { manaSprout: 10, crystalNest: 4, ancientRoot: 1 },
      dragon: { manaSprout: 15, crystalNest: 8, ancientRoot: 4 },
      wyrm: { manaSprout: 999, crystalNest: 999, ancientRoot: 999 }
    },
    // Legacy/stat upgrade pricing used by the older adventure screens.
    statUpgrade: {
      healthBaseCost: 35,
      otherBaseCost: 45,
      statValueMultiplier: 2.6,
      purchaseScaling: 12
    }
  },
  questRewardScaling: {
    // Multiplies quest essence rewards as the current area advances.
    areaMultipliers: {
      mysticMeadow: 1,
      emberWoods: 1.25,
      tideCavern: 1.5,
      stonebackHills: 1.8,
      skyRuins: 2.15,
      voidNest: 2.6
    },
    // Per-copy Ancient Coin bonus to quest rewards.
    ancientCoinBonus: 0.05,
    // Evolution branch multiplier for Ashwing Drake.
    ashwingTraitMultiplier: 1.2
  },
  essenceRewards: {
    // Applied to auto quest and battle essence rewards to slow early economy compounding.
    autoProgressionMultiplier: 0.4
  },
  enemyHpScaling: {
    // Auto-battle enemy HP starts here before area and defeated-count scaling.
    baseHp: 160,
    // Exponential HP growth per area index.
    areaGrowth: 1.65,
    // Flat HP added for every enemy already defeated in the area.
    defeatedBaseGrowth: 45,
    // Extra defeated-count HP scaling for later areas.
    defeatedAreaGrowth: 20,
    // Multiplies final auto-battle HP after area and defeated-count scaling.
    hpMultiplier: 1.5
  },
  dropRates: {
    treasure: {
      // Base treasure chance from quest/battle progression before multipliers.
      baseChance: 0.025,
      // Added chance per point of quest power.
      powerScale: 0.001,
      // Final cap after element, trait, and equipment multipliers.
      maxChance: 0.1,
      // Cap on the pre-multiplier base chance.
      baseChanceCap: 0.08,
      // Earth element treasure chance multiplier.
      earthMultiplier: 1.2,
      // Gemscale evolution trait treasure chance multiplier.
      gemscaleMultiplier: 1.25
    },
    equipment: {
      // Base equipment drop chance on auto-battle enemy defeat.
      baseChance: 0.008,
      // Added equipment chance per area index.
      areaBonus: 0.003,
      // Final equipment drop chance cap.
      maxChance: 0.025
    },
    shards: {
      // Elemental shard drop chance from quest actions.
      baseChance: 0.16,
      // Added shard chance per point of quest power.
      powerScale: 0.008,
      // Final shard drop chance cap.
      maxChance: 0.42
    },
    treasureRarity: {
      // Rarity odds for treasure drops; later areas add the area bonus values.
      legendaryBase: 0.015,
      legendaryAreaBonus: 0.012,
      epicBase: 0.08,
      epicAreaBonus: 0.025,
      rareBase: 0.24,
      rareAreaBonus: 0.035
    },
    equipmentRarity: {
      // Rarity odds for equipment drops; later areas add the area bonus values.
      legendaryBase: 0.01,
      legendaryAreaBonus: 0.015,
      epicBase: 0.05,
      epicAreaBonus: 0.035,
      rareBase: 0.2,
      rareAreaBonus: 0.04
    }
  },
  reincarnation: {
    // Lifetime essence is divided by this before square-rooting to grant souls.
    lifetimeEssenceDivisor: 100000,
    // Permanent all-essence multiplier added by each Dragon Soul.
    soulBonusPerSoul: 0.05
  },
  softProgressionAssist: {
    // At 80% of the next evolution cost, rewards get this subtle multiplier.
    rewardAssistThreshold: 0.8,
    rewardAssistMultiplier: 1.1,
    // At 95% of the next evolution cost, taps feel more exciting.
    excitementThreshold: 0.95,
    baseCriticalTapChance: 0.08,
    excitedCriticalTapChance: 0.18,
    baseTapBounceScale: 1.12,
    excitedTapBounceScale: 1.18
  },
  battleRewardSoftCap: {
    // Defeats up to this count use full defeated-count reward scaling.
    firstThreshold: 10,
    // Between firstThreshold and secondThreshold, additional defeated-count reward scaling is reduced by 50%.
    firstReduction: 0.5,
    // After this count, additional defeated-count reward scaling is reduced by 70%.
    secondThreshold: 25,
    secondReduction: 0.7
  }
} as const;
