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
  }
];

export const encounters: Encounter[] = [
  {
    id: "slime",
    stage: 1,
    name: "Bouncy Slime",
    element: "water",
    stats: { attack: 8, health: 42, defense: 2, speed: 4 },
    rewardGold: 18,
    rewardEssence: 4,
    rewardXp: 16
  },
  {
    id: "boar",
    stage: 2,
    name: "Briar Boar",
    element: "earth",
    stats: { attack: 13, health: 62, defense: 5, speed: 3 },
    rewardGold: 28,
    rewardEssence: 7,
    rewardXp: 24
  },
  {
    id: "willow-wisp",
    stage: 3,
    name: "Willow Wisp",
    element: "fire",
    stats: { attack: 18, health: 74, defense: 4, speed: 8 },
    rewardGold: 42,
    rewardEssence: 10,
    rewardXp: 36
  },
  {
    id: "ruin-knight",
    stage: 4,
    name: "Ruin Knight",
    element: "earth",
    stats: { attack: 25, health: 116, defense: 9, speed: 5 },
    rewardGold: 70,
    rewardEssence: 16,
    rewardXp: 58
  },
  {
    id: "sky-manta",
    stage: 5,
    name: "Sky Manta",
    element: "water",
    stats: { attack: 32, health: 142, defense: 10, speed: 10 },
    rewardGold: 95,
    rewardEssence: 24,
    rewardXp: 82
  }
];

export const adventureNodes: AdventureNode[] = [
  {
    id: "glimmer-woods",
    step: 1,
    kind: "battle",
    title: "Glimmer Woods",
    description: "A soft trail full of bouncing slimes and low branches.",
    scene: "forest",
    element: "water",
    encounterId: "slime",
    difficulty: 1,
    reward: { gold: 10, essence: 2, xp: 8, evolution: 4 }
  },
  {
    id: "ember-brush",
    step: 1,
    kind: "treasure",
    title: "Ember Brush Cache",
    description: "A hidden satchel glows beneath warm red leaves.",
    scene: "forest",
    element: "fire",
    difficulty: 1,
    reward: { gold: 36, essence: 6, evolution: 3 }
  },
  {
    id: "root-rest",
    step: 1,
    kind: "camp",
    title: "Root Rest Camp",
    description: "A mossy shelter offers a quiet moment to recover or train.",
    scene: "camp",
    element: "earth",
    difficulty: 1,
    reward: {},
    choices: [
      {
        id: "hearty-meal",
        label: "Cook a hearty meal",
        description: "Gain permanent health before the road grows dangerous.",
        reward: { statBoost: { health: 16 }, evolution: 4 }
      },
      {
        id: "claw-drills",
        label: "Run claw drills",
        description: "Trade rest for sharper strikes.",
        reward: { statBoost: { attack: 3 }, xp: 12 }
      }
    ]
  },
  {
    id: "briar-charge",
    step: 2,
    kind: "battle",
    title: "Briar Charge",
    description: "A boar crashes through thorny brush toward your dragon.",
    scene: "forest",
    element: "earth",
    encounterId: "boar",
    difficulty: 1.08,
    reward: { gold: 14, essence: 4, xp: 10, evolution: 5 }
  },
  {
    id: "moonwell-shrine",
    step: 2,
    kind: "shrine",
    title: "Moonwell Shrine",
    description: "Three dragon statues wait around a pool of starlight.",
    scene: "shrine",
    element: "water",
    difficulty: 1,
    reward: {},
    choices: [
      {
        id: "drink-moonwater",
        label: "Drink moonwater",
        description: "The dragon's scales shine with renewed vitality.",
        reward: { statBoost: { health: 22 }, essence: 8 }
      },
      {
        id: "touch-stone",
        label: "Touch the old stone",
        description: "Ancient instinct pulls the dragon closer to evolution.",
        reward: { evolution: 14, xp: 18 }
      }
    ]
  },
  {
    id: "ruin-coin",
    step: 2,
    kind: "treasure",
    title: "Ruin Coin Hoard",
    description: "A cracked idol spills coins from another world.",
    scene: "ruins",
    element: "earth",
    difficulty: 1,
    reward: { gold: 62, essence: 5 }
  },
  {
    id: "wisp-ambush",
    step: 3,
    kind: "battle",
    title: "Wisp Ambush",
    description: "Blue flame spirits circle the trail in playful menace.",
    scene: "cave",
    element: "fire",
    encounterId: "willow-wisp",
    difficulty: 1.12,
    reward: { gold: 18, essence: 6, xp: 14, evolution: 6 }
  },
  {
    id: "ruin-knight-elite",
    step: 3,
    kind: "elite",
    title: "Elite Ruin Knight",
    description: "A silent armored guardian blocks a shortcut to treasure.",
    scene: "ruins",
    element: "earth",
    encounterId: "ruin-knight",
    difficulty: 0.92,
    reward: { gold: 54, essence: 14, xp: 26, evolution: 10, statBoost: { defense: 2 } }
  },
  {
    id: "sparkling-cavern",
    step: 3,
    kind: "treasure",
    title: "Sparkling Cavern",
    description: "Gemlight dances over dragon-shaped fossils.",
    scene: "cave",
    element: "water",
    difficulty: 1,
    reward: { gold: 44, essence: 16, evolution: 7 }
  },
  {
    id: "sky-manta-reef",
    step: 4,
    kind: "battle",
    title: "Floating Reef",
    description: "A sky manta glides above broken islands of stone.",
    scene: "cave",
    element: "water",
    encounterId: "sky-manta",
    difficulty: 0.96,
    reward: { gold: 24, essence: 8, xp: 18, evolution: 8 }
  },
  {
    id: "dragon-camp",
    step: 4,
    kind: "camp",
    title: "Dragon Campfire",
    description: "An old adventurer leaves supplies beside a blue campfire.",
    scene: "camp",
    element: "fire",
    difficulty: 1,
    reward: {},
    choices: [
      {
        id: "reinforce-scales",
        label: "Reinforce scales",
        description: "Ash and oil harden into a protective coat.",
        reward: { statBoost: { defense: 3 }, evolution: 5 }
      },
      {
        id: "wing-sprints",
        label: "Practice wing sprints",
        description: "Quick movement helps in longer fights.",
        reward: { statBoost: { speed: 1 }, xp: 20 }
      }
    ]
  },
  {
    id: "ancient-shrine",
    step: 4,
    kind: "shrine",
    title: "Ancient Dragon Shrine",
    description: "A mural shows fire, tide, and root dragons saving a fallen kingdom.",
    scene: "shrine",
    element: "earth",
    difficulty: 1,
    reward: {},
    choices: [
      {
        id: "offer-essence",
        label: "Offer essence",
        description: "Spend nothing, but receive a focused stat blessing.",
        reward: { statBoost: { attack: 2, defense: 2 }, evolution: 7 }
      },
      {
        id: "study-mural",
        label: "Study the mural",
        description: "Learn from the ancient route and gain experience.",
        reward: { xp: 34, essence: 10 }
      }
    ]
  },
  {
    id: "rift-boss",
    step: 5,
    kind: "boss",
    title: "Rift-Touched Chimera",
    description: "A boss beast stitched from flame, tide, and stone guards the run's final gate.",
    scene: "boss",
    element: "fire",
    encounterId: "ruin-knight",
    difficulty: 1.35,
    reward: { gold: 160, essence: 42, xp: 90, evolution: 18, statBoost: { attack: 4, health: 18 } }
  }
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
    description: "A spicy treat that permanently boosts attack.",
    cost: 120,
    statBoost: { attack: 5 }
  },
  {
    id: "moon-kelp",
    name: "Moon Kelp",
    description: "A calming snack that boosts health and speed.",
    cost: 150,
    statBoost: { health: 18, speed: 1 }
  },
  {
    id: "ironbark-charm",
    name: "Ironbark Charm",
    description: "A den charm that toughens your dragon's scales.",
    cost: 180,
    statBoost: { defense: 4 }
  }
];
