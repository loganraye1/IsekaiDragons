import { AdventureNode, DragonElement, DragonForm, EggChoice, Encounter, Quest, ShopItem } from "./types";

export const elementTheme: Record<
  DragonElement,
  {
    label: string;
    icon: string;
    primary: string;
    secondary: string;
    dark: string;
    attackName: string;
  }
> = {
  fire: {
    label: "Fire",
    icon: "F",
    primary: "#ff784f",
    secondary: "#ffb347",
    dark: "#45151f",
    attackName: "Cinder Burst"
  },
  water: {
    label: "Water",
    icon: "W",
    primary: "#58c7ff",
    secondary: "#8ff7ff",
    dark: "#0d2944",
    attackName: "Tide Spiral"
  },
  earth: {
    label: "Earth",
    icon: "E",
    primary: "#9fd06f",
    secondary: "#f4d36a",
    dark: "#24361b",
    attackName: "Stone Bloom"
  },
  light: {
    label: "Light",
    icon: "L",
    primary: "#ffe58f",
    secondary: "#fff7c2",
    dark: "#3d3211",
    attackName: "Sunbeam Lancing"
  },
  dark: {
    label: "Dark",
    icon: "D",
    primary: "#8b5cf6",
    secondary: "#d9ccff",
    dark: "#151022",
    attackName: "Umbral Rend"
  }
};

export const eggChoices: EggChoice[] = [
  {
    id: "storm",
    prompt: "A storm shakes your hidden nest. What does the egg dream of?",
    answers: [
      {
        id: "spark",
        label: "Crackling sparks",
        description: "The shell warms with a fearless pulse.",
        element: "fire"
      },
      {
        id: "rain",
        label: "Silver rain",
        description: "The shell hums in rhythm with every droplet.",
        element: "water"
      },
      {
        id: "roots",
        label: "Ancient roots",
        description: "The shell settles deep into steady earth.",
        element: "earth"
      },
      {
        id: "sunshower",
        label: "Sunlit rain",
        description: "The shell glows like dawn breaking through storm clouds.",
        element: "light"
      }
    ]
  },
  {
    id: "visitor",
    prompt: "A tiny spirit taps the shell and offers a blessing.",
    answers: [
      {
        id: "ember",
        label: "Burn bright",
        description: "Power surges fastest when danger is close.",
        element: "fire"
      },
      {
        id: "current",
        label: "Flow around harm",
        description: "Patience turns pressure into motion.",
        element: "water"
      },
      {
        id: "granite",
        label: "Endure anything",
        description: "A calm heart becomes an unbroken shield.",
        element: "earth"
      },
      {
        id: "halo",
        label: "Protect with light",
        description: "A warm halo promises courage, recovery, and clarity.",
        element: "light"
      }
    ]
  },
  {
    id: "first-light",
    prompt: "At dawn, the shell begins to glow.",
    answers: [
      {
        id: "sun",
        label: "Chase the sun",
        description: "A restless dragon wants the horizon.",
        element: "fire"
      },
      {
        id: "moon",
        label: "Follow the moon",
        description: "A graceful dragon trusts the quiet path.",
        element: "water"
      },
      {
        id: "mountain",
        label: "Guard the mountain",
        description: "A loyal dragon protects the place it loves.",
        element: "earth"
      },
      {
        id: "aurora",
        label: "Follow the aurora",
        description: "A radiant dragon reads the sky for hope and timing.",
        element: "light"
      }
    ]
  }
];

export const dragonForms: DragonForm[] = [
  {
    stage: "egg",
    element: "fire",
    name: "Ember Egg",
    title: "Restless Shell",
    description: "A warm egg with glowing hairline cracks.",
    aura: "Heat shimmers around the nest."
  },
  {
    stage: "egg",
    element: "water",
    name: "Tide Egg",
    title: "Moonlit Shell",
    description: "A smooth egg beaded with impossible dew.",
    aura: "Soft waves echo inside the shell."
  },
  {
    stage: "egg",
    element: "earth",
    name: "Moss Egg",
    title: "Ancient Shell",
    description: "A heavy egg wrapped in tiny glowing vines.",
    aura: "The ground steadies beneath it."
  },
  {
    stage: "egg",
    element: "light",
    name: "Light Egg",
    title: "Sunlit Shell",
    description: "A pale gold egg with sunrise rays moving under the shell.",
    aura: "Warm motes circle the nest like tiny lanterns."
  },
  {
    stage: "hatchling",
    element: "fire",
    name: "Fire Hatchling",
    title: "Little Flame",
    description: "A bold hatchling that sneezes sparks when excited.",
    aura: "Each flap leaves a trail of embers."
  },
  {
    stage: "hatchling",
    element: "water",
    name: "Water Hatchling",
    title: "River Pup",
    description: "A sleek hatchling with fins along its tail.",
    aura: "Mist gathers when it curls up to sleep."
  },
  {
    stage: "hatchling",
    element: "earth",
    name: "Earth Hatchling",
    title: "Pebble Guard",
    description: "A sturdy hatchling with gem-bright horns.",
    aura: "Small flowers bloom in its footprints."
  },
  {
    stage: "hatchling",
    element: "light",
    name: "Light Hatchling",
    title: "Halo Pup",
    description: "A gentle hatchling with sunray frills and bright curious eyes.",
    aura: "Every hop leaves a glimmering halo print."
  },
  {
    stage: "drake",
    element: "fire",
    name: "Fire Drake",
    title: "Ashwing Striker",
    description: "Fast, fierce, and happiest in impossible odds.",
    aura: "Its wings glow like forge doors."
  },
  {
    stage: "drake",
    element: "water",
    name: "Water Serpent",
    title: "Mooncurrent Dancer",
    description: "A flowing dragon that bends around enemy attacks.",
    aura: "Constellations ripple across its scales."
  },
  {
    stage: "drake",
    element: "earth",
    name: "Earth Wyrm",
    title: "Groveback Sentinel",
    description: "A grounded protector with living armor.",
    aura: "Roots and stone rise when it roars."
  },
  {
    stage: "drake",
    element: "light",
    name: "Light Drake",
    title: "Suncrest Guide",
    description: "A radiant drake that turns courage into healing light.",
    aura: "Feather-like rays flare when allies are threatened."
  },
  {
    stage: "dragon",
    element: "fire",
    name: "Fire Dragon",
    title: "Blazing Sovereign",
    description: "A proud dragon whose roar sends sparks across the sky.",
    aura: "Heat rolls from its wings in royal waves."
  },
  {
    stage: "dragon",
    element: "water",
    name: "Water Dragon",
    title: "Tide Sovereign",
    description: "A graceful dragon that gathers moonlit currents around its claws.",
    aura: "A calm tide circles every step."
  },
  {
    stage: "dragon",
    element: "earth",
    name: "Earth Dragon",
    title: "Stone Sovereign",
    description: "A mighty dragon with scales like ancient mountain plates.",
    aura: "The ground answers its steady breath."
  },
  {
    stage: "dragon",
    element: "light",
    name: "Light Dragon",
    title: "Halo Sovereign",
    description: "A noble dragon wrapped in dawn armor and cleansing flame.",
    aura: "Sun rings orbit its horns before every decisive strike."
  },
  {
    stage: "wyrm",
    element: "fire",
    name: "Solar Wyrm",
    title: "Crown of Cinders",
    description: "A radiant dragon born to split the dark.",
    aura: "The sky blushes when it wakes."
  },
  {
    stage: "wyrm",
    element: "water",
    name: "Abyss Wyrm",
    title: "Pearl of Tides",
    description: "A serene dragon with the patience of oceans.",
    aura: "Time seems to slow inside its mist."
  },
  {
    stage: "wyrm",
    element: "earth",
    name: "Worldroot Wyrm",
    title: "Heart of Stone",
    description: "A gentle giant carrying forests on its back.",
    aura: "The den becomes a sanctuary around it."
  },
  {
    stage: "wyrm",
    element: "light",
    name: "Aurora Wyrm",
    title: "Light of Legends",
    description: "A mythic dragon whose wings turn night into gold.",
    aura: "The whole den glows like sunrise before it moves."
  }
  ,{
    stage: "egg",
    element: "dark",
    name: "Umbral Egg",
    title: "Moonless Shell",
    description: "A violet-black egg with starry cracks and a quiet pull.",
    aura: "Shadow motes orbit the nest like a tiny eclipse."
  },
  {
    stage: "hatchling",
    element: "dark",
    name: "Dark Hatchling",
    title: "Shade Pup",
    description: "A watchful hatchling that slips between moonlit shadows.",
    aura: "Tiny eclipse sparks trail behind every step."
  },
  {
    stage: "drake",
    element: "dark",
    name: "Dark Drake",
    title: "Eclipse Stalker",
    description: "A cunning drake that wins through curses, ambushes, and lifesteal pressure.",
    aura: "The air dims around its claws before each strike."
  },
  {
    stage: "dragon",
    element: "dark",
    name: "Dark Dragon",
    title: "Night Sovereign",
    description: "A regal dragon whose shadow bends into blades and wards.",
    aura: "Moonless rings orbit its horns before every curse."
  },
  {
    stage: "wyrm",
    element: "dark",
    name: "Eclipse Wyrm",
    title: "Midnight of Legends",
    description: "A mythic dragon that turns fear into focused power.",
    aura: "The den becomes a starless sky when it wakes."
  }
];

export const encounters: Encounter[] = [
  {
    id: "slime",
    stage: 1,
    name: "Bouncy Slime",
    element: "water",
    stats: { attack: 8, health: 42, defense: 2, speed: 4, block: 3, dodge: 3, critChance: 4, critDamage: 135 },
    rewardGold: 18,
    rewardEssence: 4,
    rewardXp: 16
  },
  {
    id: "boar",
    stage: 2,
    name: "Briar Boar",
    element: "earth",
    stats: { attack: 13, health: 62, defense: 5, speed: 3, block: 8, dodge: 2, critChance: 5, critDamage: 140 },
    rewardGold: 28,
    rewardEssence: 7,
    rewardXp: 24
  },
  {
    id: "willow-wisp",
    stage: 3,
    name: "Willow Wisp",
    element: "fire",
    stats: { attack: 18, health: 74, defense: 4, speed: 8, block: 4, dodge: 9, critChance: 9, critDamage: 155 },
    rewardGold: 42,
    rewardEssence: 10,
    rewardXp: 36
  },
  {
    id: "ruin-knight",
    stage: 4,
    name: "Ruin Knight",
    element: "earth",
    stats: { attack: 25, health: 116, defense: 9, speed: 5, block: 12, dodge: 4, critChance: 7, critDamage: 150 },
    rewardGold: 70,
    rewardEssence: 16,
    rewardXp: 58
  },
  {
    id: "sky-manta",
    stage: 5,
    name: "Sky Manta",
    element: "water",
    stats: { attack: 32, health: 142, defense: 10, speed: 10, block: 10, dodge: 10, critChance: 12, critDamage: 165 },
    rewardGold: 95,
    rewardEssence: 24,
    rewardXp: 82
  },
  {
    id: "sun-lancer",
    stage: 6,
    name: "Sun Lancer",
    element: "light",
    stats: { attack: 36, health: 156, defense: 9, speed: 12, block: 8, dodge: 12, critChance: 14, critDamage: 172 },
    rewardGold: 112,
    rewardEssence: 28,
    rewardXp: 92
  }
];

const chapterOneExtendedStops: AdventureNode[] = [
  {
    id: "chapter-one-stop-41",
    step: 41,
    chapter: 1,
    chapterStop: 41,
    kind: "battle",
    title: "Ashwind Wolf Pack",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "forest",
    element: "fire",
    encounterId: "boar",
    difficulty: 1.05,
    reward: { gold: 32, essence: 7, xp: 16 }
  },
  {
    id: "chapter-one-stop-42",
    step: 42,
    chapter: 1,
    chapterStop: 42,
    kind: "camp",
    title: "Smokebark Lean-To",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "camp",
    element: "fire",
    difficulty: 1.06,
    reward: {},
    choices: [
      { id: "chapter-one-stop-42-power", label: "Choose ember power", description: "Choose a hotter stance for the next stretch.", reward: { statBoost: { attack: 2 }, xp: 18 } },
      { id: "chapter-one-stop-42-survive", label: "Choose scale guard", description: "Reinforce scales before the path gets meaner.", reward: { statBoost: { health: 12, defense: 1 }, essence: 8 } }
    ]
  },
  {
    id: "chapter-one-stop-43",
    step: 43,
    chapter: 1,
    chapterStop: 43,
    kind: "treasure",
    title: "Cinder Beetle Cache",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "cave",
    element: "fire",
    difficulty: 1.08,
    reward: { gold: 40, essence: 9, xp: 20 }
  },
  {
    id: "chapter-one-stop-44",
    step: 44,
    chapter: 1,
    chapterStop: 44,
    kind: "shrine",
    title: "Low Ember Oath Shrine",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "shrine",
    element: "fire",
    difficulty: 1.09,
    reward: {},
    choices: [
      { id: "chapter-one-stop-44-power", label: "Choose ember power", description: "Choose a hotter stance for the next stretch.", reward: { statBoost: { attack: 2 }, xp: 22 } },
      { id: "chapter-one-stop-44-survive", label: "Choose scale guard", description: "Reinforce scales before the path gets meaner.", reward: { statBoost: { health: 12, defense: 1 }, essence: 10 } }
    ]
  },
  {
    id: "chapter-one-stop-45",
    step: 45,
    chapter: 1,
    chapterStop: 45,
    kind: "elite",
    title: "Coaljaw Sentinel",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "ruins",
    element: "fire",
    encounterId: "ruin-knight",
    difficulty: 1.11,
    reward: { gold: 48, essence: 11, xp: 24, statBoost: { attack: 2, defense: 1 } }
  },
  {
    id: "chapter-one-stop-46",
    step: 46,
    chapter: 1,
    chapterStop: 46,
    kind: "shop",
    title: "Hearthglass Tinker Cart",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "camp",
    element: "fire",
    difficulty: 1.12,
    reward: {},
    choices: [
      { id: "chapter-one-stop-46-power", label: "Choose ember power", description: "Choose a hotter stance for the next stretch.", reward: { statBoost: { attack: 2 }, xp: 26 } },
      { id: "chapter-one-stop-46-survive", label: "Choose scale guard", description: "Reinforce scales before the path gets meaner.", reward: { statBoost: { health: 12, defense: 1 }, essence: 12 } }
    ]
  },
  {
    id: "chapter-one-stop-47",
    step: 47,
    chapter: 1,
    chapterStop: 47,
    kind: "battle",
    title: "Sootwing Manta Dive",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "forest",
    element: "fire",
    encounterId: "sky-manta",
    difficulty: 1.14,
    reward: { gold: 56, essence: 13, xp: 28 }
  },
  {
    id: "chapter-one-stop-48",
    step: 48,
    chapter: 1,
    chapterStop: 48,
    kind: "treasure",
    title: "Glass Coal Pocket",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "cave",
    element: "fire",
    difficulty: 1.16,
    reward: { gold: 60, essence: 14, xp: 30 }
  },
  {
    id: "chapter-one-stop-49",
    step: 49,
    chapter: 1,
    chapterStop: 49,
    kind: "camp",
    title: "Sparkmoss Supper Camp",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "camp",
    element: "fire",
    difficulty: 1.17,
    reward: {},
    choices: [
      { id: "chapter-one-stop-49-power", label: "Choose ember power", description: "Choose a hotter stance for the next stretch.", reward: { statBoost: { attack: 2 }, xp: 32 } },
      { id: "chapter-one-stop-49-survive", label: "Choose scale guard", description: "Reinforce scales before the path gets meaner.", reward: { statBoost: { health: 12, defense: 1 }, essence: 15 } }
    ]
  },
  {
    id: "chapter-one-stop-50",
    step: 50,
    chapter: 1,
    chapterStop: 50,
    kind: "boss",
    title: "Gatefire Captain",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "boss",
    element: "fire",
    encounterId: "ruin-knight",
    difficulty: 1.19,
    reward: { gold: 68, essence: 16, xp: 34, statBoost: { attack: 2, defense: 1 } }
  },
  {
    id: "chapter-one-stop-51",
    step: 51,
    chapter: 1,
    chapterStop: 51,
    kind: "shrine",
    title: "Flame Reader Shrine",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "shrine",
    element: "fire",
    difficulty: 1.2,
    reward: {},
    choices: [
      { id: "chapter-one-stop-51-power", label: "Choose ember power", description: "Choose a hotter stance for the next stretch.", reward: { statBoost: { attack: 2 }, xp: 36 } },
      { id: "chapter-one-stop-51-survive", label: "Choose scale guard", description: "Reinforce scales before the path gets meaner.", reward: { statBoost: { health: 12, defense: 1 }, essence: 17 } }
    ]
  },
  {
    id: "chapter-one-stop-52",
    step: 52,
    chapter: 1,
    chapterStop: 52,
    kind: "battle",
    title: "Kindle Slime Flood",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "forest",
    element: "fire",
    encounterId: "slime",
    difficulty: 1.22,
    reward: { gold: 76, essence: 18, xp: 38 }
  },
  {
    id: "chapter-one-stop-53",
    step: 53,
    chapter: 1,
    chapterStop: 53,
    kind: "shop",
    title: "Charcoal Charm Market",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "camp",
    element: "fire",
    difficulty: 1.23,
    reward: {},
    choices: [
      { id: "chapter-one-stop-53-power", label: "Choose ember power", description: "Choose a hotter stance for the next stretch.", reward: { statBoost: { attack: 2 }, xp: 40 } },
      { id: "chapter-one-stop-53-survive", label: "Choose scale guard", description: "Reinforce scales before the path gets meaner.", reward: { statBoost: { health: 12, defense: 1 }, essence: 19 } }
    ]
  },
  {
    id: "chapter-one-stop-54",
    step: 54,
    chapter: 1,
    chapterStop: 54,
    kind: "elite",
    title: "Wisp Chorus Duel",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "ruins",
    element: "fire",
    encounterId: "willow-wisp",
    difficulty: 1.25,
    reward: { gold: 84, essence: 20, xp: 42, statBoost: { attack: 2, defense: 1 } }
  },
  {
    id: "chapter-one-stop-55",
    step: 55,
    chapter: 1,
    chapterStop: 55,
    kind: "treasure",
    title: "Dragon-Soot Reliquary",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "cave",
    element: "fire",
    difficulty: 1.26,
    reward: { gold: 88, essence: 21, xp: 44 }
  },
  {
    id: "chapter-one-stop-56",
    step: 56,
    chapter: 1,
    chapterStop: 56,
    kind: "camp",
    title: "Red Canopy Rest",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "camp",
    element: "fire",
    difficulty: 1.27,
    reward: {},
    choices: [
      { id: "chapter-one-stop-56-power", label: "Choose ember power", description: "Choose a hotter stance for the next stretch.", reward: { statBoost: { attack: 2 }, xp: 46 } },
      { id: "chapter-one-stop-56-survive", label: "Choose scale guard", description: "Reinforce scales before the path gets meaner.", reward: { statBoost: { health: 12, defense: 1 }, essence: 22 } }
    ]
  },
  {
    id: "chapter-one-stop-57",
    step: 57,
    chapter: 1,
    chapterStop: 57,
    kind: "battle",
    title: "Briarflame Boar Stampede",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "forest",
    element: "fire",
    encounterId: "boar",
    difficulty: 1.29,
    reward: { gold: 96, essence: 23, xp: 48 }
  },
  {
    id: "chapter-one-stop-58",
    step: 58,
    chapter: 1,
    chapterStop: 58,
    kind: "shrine",
    title: "Ash Crown Trial Shrine",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "shrine",
    element: "fire",
    difficulty: 1.31,
    reward: {},
    choices: [
      { id: "chapter-one-stop-58-power", label: "Choose ember power", description: "Choose a hotter stance for the next stretch.", reward: { statBoost: { attack: 2 }, xp: 50 } },
      { id: "chapter-one-stop-58-survive", label: "Choose scale guard", description: "Reinforce scales before the path gets meaner.", reward: { statBoost: { health: 12, defense: 1 }, essence: 24 } }
    ]
  },
  {
    id: "chapter-one-stop-59",
    step: 59,
    chapter: 1,
    chapterStop: 59,
    kind: "elite",
    title: "Ruin Knight Rematch",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "ruins",
    element: "fire",
    encounterId: "ruin-knight",
    difficulty: 1.32,
    reward: { gold: 104, essence: 25, xp: 52, statBoost: { attack: 2, defense: 1 } }
  },
  {
    id: "chapter-one-stop-60",
    step: 60,
    chapter: 1,
    chapterStop: 60,
    kind: "boss",
    title: "Ember Gate Hoard Tyrant",
    description: "The Ember Gate path narrows under hot branches while distant claws scrape stone.",
    scene: "boss",
    element: "fire",
    encounterId: "ruin-knight",
    difficulty: 1.33,
    reward: { gold: 108, essence: 26, xp: 54, statBoost: { attack: 2, defense: 1 } }
  }
];

export const adventureNodes: AdventureNode[] = [
  {
    id: "roadside-trader",
    step: 1,
    kind: "shop",
    title: "Ash Orchard Gate Trader",
    description: "At the Ash Orchard Gate, a goblin merchant sells pepper-feed and first-run route charms for a Fire hatchling.",
    scene: "camp",
    element: "fire",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "buy-spiced-feed", label: "Buy spiced feed", description: "Spend a few coins on heat-rich feed for stronger bites.", reward: { statBoost: { attack: 2 }, evolution: 3 } },
      { id: "haggle-map", label: "Haggle for an ember map", description: "Talk the price down and leave with Fire-route notes.", reward: { gold: 18, xp: 10 } }
    ]
  },
  {
    id: "moonwell-prayer",
    step: 2,
    kind: "shrine",
    title: "Kindling Shrine",
    description: "A warm shrine asks whether your hatchling will guard the flame or chase faster evolution sparks.",
    scene: "shrine",
    element: "fire",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "drink-calm-water", label: "Bank the hearth ember", description: "A steady ember hardens the heart for future fights.", reward: { statBoost: { health: 12 }, essence: 6 } },
      { id: "trace-runes", label: "Trace the flame runes", description: "Ancient heat tugs the hatchling toward drake evolution.", reward: { evolution: 8, xp: 12 } }
    ]
  },
  {
    id: "slime-crossing",
    step: 3,
    kind: "battle",
    title: "Cinder Slime Crossing",
    description: "Cinder slimes bubble across the first bridge and teach the hatchling its first readable Fire Breath fight.",
    scene: "forest",
    element: "fire",
    encounterId: "slime",
    difficulty: 0.92,
    reward: { gold: 10, essence: 3, xp: 8, evolution: 4 }
  },
  {
    id: "ember-cache",
    step: 4,
    kind: "treasure",
    title: "Ember Brush Cache",
    description: "A hidden satchel glows beneath warm red leaves while tiny sparks drift from the clasp.",
    scene: "forest",
    element: "fire",
    difficulty: 1,
    reward: { gold: 36, essence: 6, evolution: 3 }
  },
  {
    id: "root-rest-camp",
    step: 5,
    kind: "camp",
    title: "Charcoal Root Rest Camp",
    description: "A soot-warmed shelter lets the hatchling breathe, sharpen claws, and listen for the next threat.",
    scene: "camp",
    element: "fire",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "hearty-meal", label: "Cook a coal-roasted meal", description: "Eat well and toughen up for this run.", reward: { statBoost: { health: 16 }, evolution: 4 } },
      { id: "claw-drills", label: "Run ember claw drills", description: "Trade rest for sharper strikes and cleaner crit timing.", reward: { statBoost: { attack: 3, critChance: 2 }, xp: 12 } }
    ]
  },
  {
    id: "briar-boar-charge",
    step: 6,
    kind: "battle",
    title: "Ember Boar Charge",
    description: "A soot-bristled boar crashes through burnt brush so block, dodge, and defense can visibly matter.",
    scene: "forest",
    element: "fire",
    encounterId: "boar",
    difficulty: 1.02,
    reward: { gold: 14, essence: 4, xp: 10, evolution: 5 }
  },
  {
    id: "mossy-peddler",
    step: 7,
    kind: "shop",
    title: "Coalback Peddler",
    description: "A turtle-backed vendor with a tiny furnace trades heat charms for road stories.",
    scene: "camp",
    element: "fire",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "buy-ironroot", label: "Buy emberroot chew", description: "A bitter chew reinforces scales for the elite gate ahead.", reward: { statBoost: { defense: 2 }, essence: 5 } },
      { id: "swap-stories", label: "Swap campfire stories", description: "The peddler pays for a good hatchling tale.", reward: { gold: 32, xp: 8 } }
    ]
  },
  {
    id: "starlit-font",
    step: 8,
    kind: "shrine",
    title: "Sun-Spark Font",
    description: "Golden sparks ripple in a shallow basin and preview the coming Guardian/Raider/Mystic skill choice.",
    scene: "shrine",
    element: "fire",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "bathe-wings", label: "Bathe wings in sparks", description: "The dragon moves with cleaner rhythm and learns to slip attacks.", reward: { statBoost: { speed: 1, dodge: 2 }, xp: 16 } },
      { id: "offer-spark", label: "Offer a breath spark", description: "The font returns the spark as essence.", reward: { essence: 20, evolution: 5 } }
    ]
  },
  {
    id: "wisp-ambush",
    step: 9,
    kind: "battle",
    title: "Wildfire Wisp Ambush",
    description: "Playful flame spirits circle the trail, baiting crits, dodges, and fast Fire Breath timing before the boss gate.",
    scene: "cave",
    element: "fire",
    encounterId: "willow-wisp",
    difficulty: 1.03,
    reward: { gold: 18, essence: 6, xp: 14, evolution: 6 }
  },
  {
    id: "ruin-knight-gate",
    step: 10,
    kind: "boss",
    title: "Ruin Knight of the Ember Gate",
    description: "A silent armored guardian blocks the first drake-evolution pressure point and previews the Fire skill draft payoff.",
    scene: "ruins",
    element: "fire",
    encounterId: "ruin-knight",
    difficulty: 1.12,
    reward: { gold: 62, essence: 14, xp: 28, evolution: 10, statBoost: { attack: 2, defense: 1 } }
  },
  {
    id: "moonwell-kelp-camp",
    step: 11,
    kind: "camp",
    title: "Moonwell Tide Path Camp",
    description: "The Water hatchling curls beside glowing kelp lanterns while the tide teaches flow, sustain, and patient tempo.",
    scene: "camp",
    element: "water",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "braid-moon-kelp", label: "Braid moon-kelp armor", description: "Soft kelp plates train block timing without losing Water's graceful movement.", reward: { statBoost: { defense: 2, block: 2 }, evolution: 5 } },
      { id: "drift-current-drills", label: "Drift-current drills", description: "Practice slipping around pressure for dodge and speed payoff.", reward: { statBoost: { speed: 1, dodge: 3 }, xp: 20 } }
    ]
  },
  {
    id: "reef-slime-crossing",
    step: 12,
    kind: "elite",
    title: "Reef Slime Crossing",
    description: "Glass-blue slimes flood the moon bridge, forcing the hatchling to prove dodge, block, and Tide Spiral reads cleanly in combat.",
    scene: "cave",
    element: "water",
    encounterId: "slime",
    difficulty: 0.9,
    reward: { gold: 54, essence: 14, xp: 26, evolution: 10, statBoost: { dodge: 2, defense: 1 } }
  },
  {
    id: "pearlflow-trader",
    step: 13,
    kind: "shop",
    title: "Pearlflow Trader",
    description: "A manta-cart merchant trades pearl charms that make the Water route feel like a build choice instead of a palette swap.",
    scene: "camp",
    element: "water",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "buy-pearl-guard", label: "Buy pearl guard charm", description: "A shell charm adds defense and block for Guardian-style water builds.", reward: { statBoost: { defense: 2, block: 2 }, evolution: 4 } },
      { id: "trade-ripple-map", label: "Trade for a ripple map", description: "The trader marks safe currents and pays in route loot.", reward: { gold: 48, essence: 8 } }
    ]
  },
  {
    id: "moonwell-vow-shrine",
    step: 14,
    kind: "shrine",
    title: "Moonwell Vow Shrine",
    description: "A silver basin asks whether this dragon will become a tidal guardian, reef raider, or mist mystic.",
    scene: "shrine",
    element: "water",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "vow-calm-current", label: "Vow calm current", description: "Calm water hardens into reliable mitigation.", reward: { statBoost: { health: 16, defense: 2 }, evolution: 7 } },
      { id: "vow-moon-dash", label: "Vow moon dash", description: "Moonlit speed sets up crit windows and future skill synergy.", reward: { statBoost: { speed: 1, critChance: 2 }, xp: 34, essence: 10 } }
    ]
  },
  {
    id: "sky-manta-reef-dive",
    step: 15,
    kind: "battle",
    title: "Sky Manta Reef Dive",
    description: "A sky manta dives through floating coral so the Water hatchling's tempo and dodge bonuses become visible under pressure.",
    scene: "cave",
    element: "water",
    encounterId: "sky-manta",
    difficulty: 0.84,
    reward: { gold: 24, essence: 8, xp: 18, evolution: 8 }
  },
  {
    id: "moon-pearl-cache",
    step: 16,
    kind: "treasure",
    title: "Moon-Pearl Cache",
    description: "A clam-shaped hoard opens only after the hatchling circles it in the right tide rhythm.",
    scene: "cave",
    element: "water",
    difficulty: 1,
    reward: { gold: 44, essence: 16, evolution: 7 }
  },
  {
    id: "tideglass-lantern-shop",
    step: 17,
    kind: "shop",
    title: "Tideglass Lantern Shop",
    description: "Lantern fish spirits sell glowglass that makes Water crits, dodges, and return-chest loot feel magical.",
    scene: "camp",
    element: "water",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "buy-tideglass-lantern", label: "Buy tideglass lantern", description: "The lantern flashes when hidden pearls are near.", reward: { gold: 40, evolution: 5 } },
      { id: "sip-reef-tonic", label: "Sip reef tonic", description: "A bright tonic sharpens attack without losing flow.", reward: { statBoost: { attack: 2, speed: 1 }, essence: 6 } }
    ]
  },
  {
    id: "moonwell-tide-gate",
    step: 18,
    kind: "battle",
    title: "Moonwell Tide Gate",
    description: "A moonlit gate surges shut behind a manta guardian, marking the Water route's flashy combat check before the final shrine.",
    scene: "shrine",
    element: "water",
    encounterId: "sky-manta",
    difficulty: 1.18,
    reward: { gold: 32, essence: 10, xp: 24, evolution: 9 }
  },
  {
    id: "quiet-spring-mastery",
    step: 19,
    kind: "shrine",
    title: "Quiet Spring Mastery",
    description: "The spring reflects future Water evolutions: shell-armored guardian, razor-fin raider, or moon-mist mystic.",
    scene: "shrine",
    element: "water",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "patient-tide-breath", label: "Patient tide breath", description: "Slow breathing makes the dragon harder to hurt and harder to pin down.", reward: { statBoost: { health: 18, dodge: 2 }, evolution: 4 } },
      { id: "crescent-roar", label: "Crescent roar", description: "The shrine echoes back as experience and prepares the next skill draft.", reward: { xp: 42, essence: 12 } }
    ]
  },
  {
    id: "tidal-hoard-nest",
    step: 20,
    kind: "treasure",
    title: "Tidal Hoard Nest",
    description: "A nest of pearls, shell coins, and damp relics sells the Water route fantasy as loot-first dragon adventure.",
    scene: "cave",
    element: "water",
    difficulty: 1,
    reward: { gold: 84, essence: 12, evolution: 5 }
  },
  {
    id: "crystal-crag-basecamp",
    step: 21,
    kind: "battle",
    title: "Crystal Crag Basecamp",
    description: "A crystal-plated boar charges the glittering ravine basecamp, forcing the Earth hatchling to brace, block, and answer with armor-breaking claws.",
    scene: "ruins",
    element: "earth",
    encounterId: "boar",
    difficulty: 1.06,
    reward: { gold: 42, essence: 12, xp: 32, evolution: 10, statBoost: { defense: 1, block: 2 } }
  },
  {
    id: "gemhide-boar-charge",
    step: 22,
    kind: "camp",
    title: "Gemhide Boar Charge",
    description: "After the charge, the camp packs gemhide plates and stone saddlebags so Earth feels heavier than the Water route.",
    scene: "camp",
    element: "earth",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "pack-stone-saddlebags", label: "Pack stone saddlebags", description: "Weighted bags build stamina and make future treasure hauls feel earned.", reward: { statBoost: { health: 20, defense: 1 }, evolution: 5 } },
      { id: "brace-under-falling-gems", label: "Brace under falling gems", description: "Practice blocking crystal rain until the hatchling stops flinching.", reward: { statBoost: { block: 3, defense: 2 }, xp: 22 } }
    ]
  },
  {
    id: "faultline-rune-market",
    step: 23,
    kind: "shop",
    title: "Faultline Rune Market",
    description: "Rune sellers carve Guardian, Raider, and Mystic choices into stone tablets that preview Earth build identity.",
    scene: "ruins",
    element: "earth",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "buy-bulwark-rune", label: "Buy bulwark rune", description: "A square rune settles into the scales for sturdy Guardian pressure.", reward: { statBoost: { defense: 3, block: 2 }, evolution: 5 } },
      { id: "buy-shatter-rune", label: "Buy shatter rune", description: "A jagged rune sharpens claws for Crystal Break raider bursts.", reward: { statBoost: { attack: 3, critDamage: 12 }, essence: 10 } }
    ]
  },
  {
    id: "prism-vow-shrine",
    step: 24,
    kind: "elite",
    title: "Prism Vow Shrine",
    description: "A faceted altar animates a basalt ram guardian to test whether the dragon's vow can survive heavy pressure.",
    scene: "ruins",
    element: "earth",
    encounterId: "boar",
    difficulty: 1.14,
    reward: { gold: 74, essence: 18, xp: 46, evolution: 12, statBoost: { attack: 1, defense: 2 } }
  },
  {
    id: "basalt-ram-bulwark",
    step: 25,
    kind: "shrine",
    title: "Basalt Ram Bulwark",
    description: "The defeated bulwark leaves a stone shield shrine where the dragon chooses mountain guardian, crystal raider, or worldroot mystic pressure.",
    scene: "shrine",
    element: "earth",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "vow-granite-shell", label: "Vow granite shell", description: "The vow thickens scales and turns Earth into visible mitigation.", reward: { statBoost: { health: 18, defense: 2 }, evolution: 7 } },
      { id: "vow-prism-claw", label: "Vow prism claw", description: "The vow focuses first-hit burst and critical payoff.", reward: { statBoost: { attack: 2, critChance: 2, critDamage: 8 }, xp: 36 } }
    ]
  },
  {
    id: "glimmerstone-cache",
    step: 26,
    kind: "treasure",
    title: "Glimmerstone Cache",
    description: "Gem pockets crack open only when the hatchling taps the right faultline with its claws.",
    scene: "cave",
    element: "earth",
    difficulty: 1,
    reward: { gold: 68, essence: 18, evolution: 7 }
  },
  {
    id: "crystal-golem-gate",
    step: 27,
    kind: "battle",
    title: "Crystal Golem Gate",
    description: "A giant gem guardian locks the crag gate, creating the flashy Earth combat checkpoint for Crystal Break, block sparks, and heavy impact shakes.",
    scene: "ruins",
    element: "earth",
    encounterId: "ruin-knight",
    difficulty: 1.22,
    reward: { gold: 86, essence: 22, xp: 56, evolution: 12, statBoost: { attack: 2, defense: 1 } }
  },
  {
    id: "rootbound-miner-shop",
    step: 28,
    kind: "shop",
    title: "Rootbound Miner Shop",
    description: "Mole miners trade pick charms and root tonics that make Earth loot feel heavy, crunchy, and build-defining after the Crystal Golem Gate.",
    scene: "camp",
    element: "earth",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "buy-pick-charm", label: "Buy pick charm", description: "A tiny pickaxe charm improves hoard discovery and armor piercing.", reward: { gold: 54, statBoost: { attack: 2 } } },
      { id: "drink-root-tonic", label: "Drink root tonic", description: "A bitter tonic plants the hatchling's stance for blocks and counterattacks.", reward: { statBoost: { health: 16, block: 2 }, essence: 8 } }
    ]
  },
  {
    id: "worldroot-mastery-shrine",
    step: 29,
    kind: "shrine",
    title: "Worldroot Mastery Shrine",
    description: "Roots wrap a crystal heart and reflect future Earth evolutions: ironhide warden, prism ravager, or gem sovereign.",
    scene: "shrine",
    element: "earth",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "bind-worldroot-scales", label: "Bind worldroot scales", description: "Root marks make the dragon harder to move and harder to kill.", reward: { statBoost: { health: 22, defense: 2 }, evolution: 6 } },
      { id: "sharpen-prism-horns", label: "Sharpen prism horns", description: "Prism edges push decisive crit damage for the boss gate.", reward: { statBoost: { attack: 2, critDamage: 14 }, xp: 38, essence: 12 } }
    ]
  },
  {
    id: "titan-stone-hoard",
    step: 30,
    kind: "boss",
    title: "Titan Stone Hoard",
    description: "A colossal stone guardian rises from the hoard itself, ending the Earth slice with a boss-scale test of defense, block, and armor-breaking damage.",
    scene: "boss",
    element: "earth",
    encounterId: "ruin-knight",
    difficulty: 1.28,
    reward: { gold: 170, essence: 42, xp: 92, evolution: 18, statBoost: { attack: 3, defense: 3, block: 2 } }
  },
  {
    id: "sunbeam-spires-arrival",
    step: 31,
    kind: "camp",
    title: "Sunbeam Spires Arrival",
    description: "Golden bridges and floating chapel bells introduce the Light route as a bright, readable adventure slice about healing, crit clarity, and heroic tempo.",
    scene: "camp",
    element: "light",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "polish-dawn-scales", label: "Polish dawn scales", description: "Reflective scales turn near-misses into readable dodge and crit setup.", reward: { statBoost: { dodge: 2, critChance: 2 }, evolution: 5 } },
      { id: "rest-under-suncloth", label: "Rest under suncloth", description: "Warm cloth banners recover stamina for the spire climb.", reward: { statBoost: { health: 20, speed: 1 }, xp: 24 } }
    ]
  },
  {
    id: "halo-lantern-market",
    step: 32,
    kind: "shop",
    title: "Halo Lantern Market",
    description: "Lantern vendors sell Guardian, Raider, and Mystic charms so Light immediately reads as support, piercing beams, or radiant speed.",
    scene: "shrine",
    element: "light",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "buy-halo-ward", label: "Buy halo ward", description: "A circular charm improves block and makes protection visible around the hatchling.", reward: { statBoost: { block: 2, defense: 2 }, evolution: 5 } },
      { id: "buy-sun-lens", label: "Buy sun lens", description: "A focusing lens sharpens the next Sunbeam Lancing crit window.", reward: { statBoost: { attack: 2, critChance: 3 }, essence: 12 } }
    ]
  },
  {
    id: "radiant-wisp-crossing",
    step: 33,
    kind: "battle",
    title: "Radiant Wisp Crossing",
    description: "A swarm of radiant wisps blocks the bridge, making the first Light fight about clear flashes, speed pressure, and dodge-readable beams.",
    scene: "ruins",
    element: "light",
    encounterId: "willow-wisp",
    difficulty: 1.16,
    reward: { gold: 78, essence: 20, xp: 52, evolution: 10, statBoost: { speed: 1, critChance: 2 } }
  },
  {
    id: "dawn-vow-shrine",
    step: 34,
    kind: "shrine",
    title: "Dawn Vow Shrine",
    description: "The shrine asks whether the dragon protects allies with halos, pierces enemies with lances, or bends sunlight into recovery.",
    scene: "shrine",
    element: "light",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "vow-sheltering-halo", label: "Vow sheltering halo", description: "A guardian vow adds visible protection and sustain identity.", reward: { statBoost: { health: 18, block: 2 }, evolution: 7 } },
      { id: "vow-piercing-ray", label: "Vow piercing ray", description: "A raider vow turns crit damage into a clean Sunbeam payoff.", reward: { statBoost: { attack: 2, critDamage: 12 }, xp: 34 } }
    ]
  },
  {
    id: "glasswing-relic-cache",
    step: 35,
    kind: "treasure",
    title: "Glasswing Relic Cache",
    description: "Transparent wings, polished coins, and tiny prism crowns make the Light hoard feel delicate, valuable, and collectible.",
    scene: "cave",
    element: "light",
    difficulty: 1,
    reward: { gold: 92, essence: 22, evolution: 8 }
  },
  {
    id: "sun-lancer-duel",
    step: 36,
    kind: "elite",
    title: "Sun Lancer Duel",
    description: "A spear-bright guardian mirrors the dragon's beams, creating an elite Light checkpoint for fast counterattacks, crit sparks, and halo shields.",
    scene: "boss",
    element: "light",
    encounterId: "sun-lancer",
    difficulty: 1.24,
    reward: { gold: 104, essence: 28, xp: 66, evolution: 12, statBoost: { attack: 2, speed: 1 } }
  },
  {
    id: "suncloth-sky-camp",
    step: 37,
    kind: "camp",
    title: "Suncloth Sky Camp",
    description: "The camp hangs between spires with suncloth hammocks, making the route pause feel gentle instead of generic.",
    scene: "camp",
    element: "light",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "nap-in-suncloth", label: "Nap in suncloth", description: "A warm recovery beat pushes Mystic sustain and max health.", reward: { statBoost: { health: 24 }, evolution: 6 } },
      { id: "practice-ray-steps", label: "Practice ray steps", description: "Footwork through light strips improves speed and dodge readability.", reward: { statBoost: { speed: 2, dodge: 2 }, essence: 10 } }
    ]
  },
  {
    id: "prism-sigil-shop",
    step: 38,
    kind: "shop",
    title: "Prism Sigil Shop",
    description: "Sigil makers turn loot into build identity: halo guards, sun-lance burst, and aurora recovery hooks for the next evolution layer.",
    scene: "shrine",
    element: "light",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "buy-aurora-sigil", label: "Buy aurora sigil", description: "Aurora marks improve sustain and make recovery effects feel magical.", reward: { statBoost: { health: 14, defense: 1 }, essence: 14 } },
      { id: "buy-prism-edge", label: "Buy prism edge", description: "Prism edges sharpen decisive crit hits before the boss spire.", reward: { statBoost: { attack: 2, critDamage: 14 }, xp: 40 } }
    ]
  },
  {
    id: "eclipse-gate-breaker",
    step: 39,
    kind: "battle",
    title: "Eclipse Gate Breaker",
    description: "A shadowed gate tries to swallow the route's brightness, setting up high-contrast Light combat where beams, shields, and crit flashes are easy to read.",
    scene: "ruins",
    element: "light",
    encounterId: "sun-lancer",
    difficulty: 1.3,
    reward: { gold: 128, essence: 34, xp: 78, evolution: 13, statBoost: { critChance: 2, critDamage: 10 } }
  },
  {
    id: "aurora-crown-hoard",
    step: 40,
    kind: "boss",
    title: "Aurora Crown Hoard",
    description: "The spire crown unfolds into a boss-scale aurora guardian, ending the Light slice with a readable burst of halo shields, sunbeams, crits, and treasure shine.",
    scene: "boss",
    element: "light",
    encounterId: "sun-lancer",
    difficulty: 1.38,
    reward: { gold: 196, essence: 50, xp: 108, evolution: 20, statBoost: { attack: 3, speed: 2, critChance: 2 } }
  }
  ,...chapterOneExtendedStops
];
export const quests: Quest[] = [
  {
    id: "first-win",
    title: "First Little Legend",
    description: "Win your first adventure battle.",
    target: 1,
    rewardGold: 60,
    rewardEssence: 12,
    metric: "battlesWon"
  },
  {
    id: "sharpen-scales",
    title: "Sharpen the Scales",
    description: "Buy three upgrades for your growing dragon.",
    target: 3,
    rewardGold: 90,
    rewardEssence: 18,
    metric: "upgradesBought"
  },
  {
    id: "trailblazer",
    title: "Trailblazer",
    description: "Clear three adventure stages.",
    target: 3,
    rewardGold: 140,
    rewardEssence: 28,
    metric: "stagesCleared"
  }
];

export const shopItems: ShopItem[] = [
  {
    id: "ruby-feed",
    name: "Ruby Feed",
    description: "A spicy treat that permanently boosts attack and crit rate.",
    cost: 120,
    statBoost: { attack: 5, critChance: 2 }
  },
  {
    id: "moon-kelp",
    name: "Moon Kelp",
    description: "A calming snack that boosts health, speed, and dodge.",
    cost: 150,
    statBoost: { health: 18, speed: 1, dodge: 3 }
  },
  {
    id: "ironbark-charm",
    name: "Ironbark Charm",
    description: "A den charm that toughens scales and improves block chance.",
    cost: 180,
    statBoost: { defense: 4, block: 4 }
  }
];
