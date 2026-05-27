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
    rewardXp: 16
  },
  {
    id: "boar",
    stage: 2,
    name: "Briar Boar",
    element: "earth",
    stats: { attack: 13, health: 62, defense: 5, speed: 3, block: 8, dodge: 2, critChance: 5, critDamage: 140 },
    rewardGold: 28,
    rewardXp: 24
  },
  {
    id: "willow-wisp",
    stage: 3,
    name: "Willow Wisp",
    element: "fire",
    stats: { attack: 18, health: 74, defense: 4, speed: 8, block: 4, dodge: 9, critChance: 9, critDamage: 155 },
    rewardGold: 42,
    rewardXp: 36
  },
  {
    id: "ruin-knight",
    stage: 4,
    name: "Ruin Knight",
    element: "earth",
    stats: { attack: 25, health: 116, defense: 9, speed: 5, block: 12, dodge: 4, critChance: 7, critDamage: 150 },
    rewardGold: 70,
    rewardXp: 58
  },
  {
    id: "sky-manta",
    stage: 5,
    name: "Sky Manta",
    element: "water",
    stats: { attack: 32, health: 142, defense: 10, speed: 10, block: 10, dodge: 10, critChance: 12, critDamage: 165 },
    rewardGold: 95,
    rewardXp: 82
  },
  {
    id: "sun-lancer",
    stage: 6,
    name: "Sun Lancer",
    element: "light",
    stats: { attack: 36, health: 156, defense: 9, speed: 12, block: 8, dodge: 12, critChance: 14, critDamage: 172 },
    rewardGold: 112,
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
    description: "Ashwing wolves hunt in tighter formation than pack instinct alone explains. Something is coordinating them from the tree line — not controlling, exactly. Nudging.",
    scene: "forest",
    element: "fire",
    encounterId: "boar",
    difficulty: 1.05,
    reward: { gold: 32, xp: 16 }
  },
  {
    id: "chapter-one-stop-42",
    step: 42,
    chapter: 1,
    chapterStop: 42,
    kind: "camp",
    title: "Smokebark Lean-To",
    description: "The lean-to was built by someone who knew the path would need a rest stop here. The ashes inside are old. Someone camped here long before the hatchling arrived and left in a hurry.",
    scene: "camp",
    element: "fire",
    difficulty: 1.06,
    reward: {},
    choices: [
      { id: "chapter-one-stop-42-power", label: "Search the old ashes", description: "Something in the cold hearth sparks a hotter stance for what's ahead.", reward: { statBoost: { attack: 2 }, xp: 18 } },
      { id: "chapter-one-stop-42-survive", label: "Reinforce before moving up", description: "The lean-to's shelter steadies the hatchling's scales before the path gets worse.", reward: { statBoost: { health: 12, defense: 1 }, gold: 8 } }
    ]
  },
  {
    id: "chapter-one-stop-43",
    step: 43,
    chapter: 1,
    chapterStop: 43,
    kind: "treasure",
    title: "Cinder Beetle Cache",
    description: "The beetles built their cache around something they found glowing in the dark. Whatever the original object was, the beetles relocated it long ago. What remains is the warmth they left behind — and everything they gathered around it.",
    scene: "cave",
    element: "fire",
    difficulty: 1.08,
    reward: { gold: 40, xp: 20 }
  },
  {
    id: "chapter-one-stop-44",
    step: 44,
    chapter: 1,
    chapterStop: 44,
    kind: "shrine",
    title: "Low Ember Oath Shrine",
    description: "The shrine marker is scorched on one side — an old burn, not recent. Something tested this spot before the hatchling found it. The flame inside still answers.",
    scene: "shrine",
    element: "fire",
    difficulty: 1.09,
    reward: {},
    choices: [
      { id: "chapter-one-stop-44-power", label: "Make the flame oath", description: "Swear to hit first and harder. The shrine accepts the bargain.", reward: { statBoost: { attack: 2 }, xp: 22 } },
      { id: "chapter-one-stop-44-survive", label: "Make the scale oath", description: "Swear to endure. The shrine seals the promise in fireproof resolve.", reward: { statBoost: { health: 12, defense: 1 }, gold: 10 } }
    ]
  },
  {
    id: "chapter-one-stop-45",
    step: 45,
    chapter: 1,
    chapterStop: 45,
    kind: "elite",
    title: "Coaljaw Sentinel",
    description: "The Sentinel was stationed at this ruin post before the path meant anything. It has been here long enough that the ruins grew around it. It doesn't know what it's guarding anymore — only that it must.",
    scene: "ruins",
    element: "fire",
    encounterId: "ruin-knight",
    difficulty: 1.11,
    reward: { gold: 48, xp: 24, statBoost: { attack: 2, defense: 1 } }
  },
  {
    id: "chapter-one-stop-46",
    step: 46,
    chapter: 1,
    chapterStop: 46,
    kind: "shop",
    title: "Hearthglass Tinker Cart",
    description: "The tinker has a cart full of heat-charms and a policy of not asking questions. He's been selling to travelers on this stretch since before the Vault went quiet. He noticed when it did.",
    scene: "camp",
    element: "fire",
    difficulty: 1.12,
    reward: {},
    choices: [
      { id: "chapter-one-stop-46-power", label: "Buy a heat-strike charm", description: "A heat charm sharpens the next few strikes with focused ember edge.", reward: { statBoost: { attack: 2 }, xp: 26 } },
      { id: "chapter-one-stop-46-survive", label: "Buy a shell-plate brace", description: "Reinforced plating makes the climb above more survivable.", reward: { statBoost: { health: 12, defense: 1 }, gold: 12 } }
    ]
  },
  {
    id: "chapter-one-stop-47",
    step: 47,
    chapter: 1,
    chapterStop: 47,
    kind: "battle",
    title: "Sootwing Manta Dive",
    description: "The manta crosses from the smoke canopy above and drives straight down. It used to ride thermals for pleasure. Now it dives with purpose — pointed, like something gave it a direction.",
    scene: "forest",
    element: "fire",
    encounterId: "sky-manta",
    difficulty: 1.14,
    reward: { gold: 56, xp: 28 }
  },
  {
    id: "chapter-one-stop-48",
    step: 48,
    chapter: 1,
    chapterStop: 48,
    kind: "treasure",
    title: "Glass Coal Pocket",
    description: "A pocket of compressed coal glass holds shapes that aren't random — they were arranged by something with patience and intent. The creature that arranged them either left or was taken. The hatchling inherits what it left.",
    scene: "cave",
    element: "fire",
    difficulty: 1.16,
    reward: { gold: 60, xp: 30 }
  },
  {
    id: "chapter-one-stop-49",
    step: 49,
    chapter: 1,
    chapterStop: 49,
    kind: "camp",
    title: "Sparkmoss Supper Camp",
    description: "The sparkmoss grows thicker this high on the path — it feeds on ember-heavy air. The hatchling eats, listens, and tries to count how many things in the Meadow are watching back.",
    scene: "camp",
    element: "fire",
    difficulty: 1.17,
    reward: {},
    choices: [
      { id: "chapter-one-stop-49-power", label: "Eat the spiced moss", description: "The sparkmoss burns going down and comes back as attack edge.", reward: { statBoost: { attack: 2 }, xp: 32 } },
      { id: "chapter-one-stop-49-survive", label: "Eat the plain moss", description: "Plain sparkmoss is slow fuel — it settles into defense and patience.", reward: { statBoost: { health: 12, defense: 1 }, gold: 15 } }
    ]
  },
  {
    id: "chapter-one-stop-50",
    step: 50,
    chapter: 1,
    chapterStop: 50,
    kind: "battle",
    title: "Gatefire Captain",
    description: "The Captain holds the inner gate with the patience of someone waiting for this fight specifically. The Vault's exit trail ends here. Winning means the path above is open. Something on the other side has been waiting for that too.",
    scene: "boss",
    element: "fire",
    encounterId: "ruin-knight",
    difficulty: 1.19,
    reward: { gold: 68, xp: 34, statBoost: { attack: 2, defense: 1 } }
  },
  {
    id: "chapter-one-stop-51",
    step: 51,
    chapter: 1,
    chapterStop: 51,
    kind: "shrine",
    title: "Flame Reader Shrine",
    description: "The flame bends toward the hatchling without wind to move it. It's been waiting to read something. What it reads determines what it offers back.",
    scene: "shrine",
    element: "fire",
    difficulty: 1.2,
    reward: {},
    choices: [
      { id: "chapter-one-stop-51-power", label: "Let the flame read your strike", description: "The flame mirrors back a sharper version of what the hatchling showed it.", reward: { statBoost: { attack: 2 }, xp: 36 } },
      { id: "chapter-one-stop-51-survive", label: "Let the flame read your guard", description: "The flame mirrors back a more durable version of what the hatchling showed it.", reward: { statBoost: { health: 12, defense: 1 }, gold: 17 } }
    ]
  },
  {
    id: "chapter-one-stop-52",
    step: 52,
    chapter: 1,
    chapterStop: 52,
    kind: "battle",
    title: "Kindle Slime Flood",
    description: "Slimes don't flood in numbers like this naturally. They're being pushed from behind by something the hatchling can't see yet — something that wants them moving in this direction.",
    scene: "forest",
    element: "fire",
    encounterId: "slime",
    difficulty: 1.22,
    reward: { gold: 76, xp: 38 }
  },
  {
    id: "chapter-one-stop-53",
    step: 53,
    chapter: 1,
    chapterStop: 53,
    kind: "shop",
    title: "Charcoal Charm Market",
    description: "The market clusters here because the path above feels wrong and nobody wants to go further alone. The hatchling is the only customer who seems to be heading up.",
    scene: "camp",
    element: "fire",
    difficulty: 1.23,
    reward: {},
    choices: [
      { id: "chapter-one-stop-53-power", label: "Buy a claw-edge charm", description: "Charcoal-ground edges sharpen strikes for the stretch above.", reward: { statBoost: { attack: 2 }, xp: 40 } },
      { id: "chapter-one-stop-53-survive", label: "Buy a smoke-ward charm", description: "A smoke ward diffuses incoming attacks before they fully land.", reward: { statBoost: { health: 12, defense: 1 }, gold: 19 } }
    ]
  },
  {
    id: "chapter-one-stop-54",
    step: 54,
    chapter: 1,
    chapterStop: 54,
    kind: "battle",
    title: "Wisp Chorus Duel",
    description: "Four wisps move in the pattern of a warding circle — protective, once. They've been repurposed. The hatchling is now what they're warding against.",
    scene: "ruins",
    element: "fire",
    encounterId: "willow-wisp",
    difficulty: 1.25,
    reward: { gold: 84, xp: 42, statBoost: { attack: 2, defense: 1 } }
  },
  {
    id: "chapter-one-stop-55",
    step: 55,
    chapter: 1,
    chapterStop: 55,
    kind: "treasure",
    title: "Dragon-Soot Reliquary",
    description: "The reliquary is sealed with a claw-mark that matches the hatchling's own grip exactly. The Elder Wyrm left things along this path. This is one of them.",
    scene: "cave",
    element: "fire",
    difficulty: 1.26,
    reward: { gold: 88, xp: 44 }
  },
  {
    id: "chapter-one-stop-56",
    step: 56,
    chapter: 1,
    chapterStop: 56,
    kind: "camp",
    title: "Red Canopy Rest",
    description: "Red-leaf branches filter the heat into something almost comfortable. The camp is calm. The calm is the suspicious part.",
    scene: "camp",
    element: "fire",
    difficulty: 1.27,
    reward: {},
    choices: [
      { id: "chapter-one-stop-56-power", label: "Train in the canopy heat", description: "Heat training under red leaves builds attack edge for what waits above.", reward: { statBoost: { attack: 2 }, xp: 46 } },
      { id: "chapter-one-stop-56-survive", label: "Rest in the canopy shade", description: "Rest conserves strength and sharpens scale defense for the harder path ahead.", reward: { statBoost: { health: 12, defense: 1 }, gold: 22 } }
    ]
  },
  {
    id: "chapter-one-stop-57",
    step: 57,
    chapter: 1,
    chapterStop: 57,
    kind: "battle",
    title: "Briarflame Boar Stampede",
    description: "The boars come through the burned brush all at once, their shadow edges visible now in daylight. Most of it is still angry, bewildered animal. The rest is something that borrowed the body.",
    scene: "forest",
    element: "fire",
    encounterId: "boar",
    difficulty: 1.29,
    reward: { gold: 96, xp: 48 }
  },
  {
    id: "chapter-one-stop-58",
    step: 58,
    chapter: 1,
    chapterStop: 58,
    kind: "shrine",
    title: "Ash Crown Trial Shrine",
    description: "The ash crown marks sit in a ring at the base of this shrine — proof of trials completed by creatures that didn't survive to carry the crowns away. The hatchling adds one more circle to the ring.",
    scene: "shrine",
    element: "fire",
    difficulty: 1.31,
    reward: {},
    choices: [
      { id: "chapter-one-stop-58-power", label: "Claim the striker crown", description: "The ash marks seal a promise of sharper, faster strikes for what's ahead.", reward: { statBoost: { attack: 2 }, xp: 50 } },
      { id: "chapter-one-stop-58-survive", label: "Claim the warden crown", description: "The ash marks seal a promise to endure what the path above delivers.", reward: { statBoost: { health: 12, defense: 1 }, gold: 24 } }
    ]
  },
  {
    id: "chapter-one-stop-59",
    step: 59,
    chapter: 1,
    chapterStop: 59,
    kind: "battle",
    title: "Ruin Knight Rematch",
    description: "The same ruin-armored figure from the road below, now following. It remembers the earlier fight — adjusts for it. That kind of memory shouldn't survive whatever claimed it.",
    scene: "ruins",
    element: "fire",
    encounterId: "ruin-knight",
    difficulty: 1.32,
    reward: { gold: 104, xp: 52, statBoost: { attack: 2, defense: 1 } }
  },
  {
    id: "chapter-one-stop-60",
    step: 60,
    chapter: 1,
    chapterStop: 60,
    kind: "boss",
    title: "Warden's Gate Hoard Tyrant",
    description: "The Hoard Tyrant has been collecting things the Void discarded — fragments of creatures that were changed and then abandoned. It built a hoard from what was left behind. The hatchling is about to inherit what it built.",
    scene: "boss",
    element: "fire",
    encounterId: "ruin-knight",
    difficulty: 1.33,
    reward: { gold: 108, xp: 54, statBoost: { attack: 2, defense: 1 } }
  }
];

export const adventureNodes: AdventureNode[] = [
  {
    id: "roadside-trader",
    step: 1,
    kind: "shop",
    title: "Warden's Gate Trader",
    description: "Past the Warden's Gate, a goblin trader has set up camp — the first sign the world continues past where the egg was sleeping. He's been here a while. He doesn't ask where the hatchling came from.",
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
    description: "A stone marker half-swallowed by warm roots — old work, built for something that hadn't hatched yet. It pulses when the hatchling approaches, as if it was left here waiting.",
    scene: "shrine",
    element: "fire",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "drink-calm-water", label: "Bank the hearth ember", description: "A steady ember hardens the heart for future fights.", reward: { statBoost: { health: 12 }, gold: 6 } },
      { id: "trace-runes", label: "Trace the flame runes", description: "Ancient heat tugs the hatchling toward drake evolution.", reward: { evolution: 8, xp: 12 } }
    ]
  },
  {
    id: "slime-crossing",
    step: 3,
    kind: "battle",
    title: "Cinder Slime Crossing",
    description: "These slimes used to scatter at the sound of footsteps. Something changed. They hold their ground at the bridge now, pressing inward like they're following an order they don't understand.",
    scene: "forest",
    element: "fire",
    encounterId: "slime",
    difficulty: 0.92,
    reward: { gold: 10, xp: 8, evolution: 4 }
  },
  {
    id: "ember-cache",
    step: 4,
    kind: "treasure",
    title: "Ember Brush Cache",
    description: "A hidden satchel glows beneath warm red leaves while tiny sparks drift from the clasp. Whoever left it here left it recently — the ember inside is still hot.",
    scene: "forest",
    element: "fire",
    difficulty: 1,
    reward: { gold: 36, evolution: 3 }
  },
  {
    id: "root-rest-camp",
    step: 5,
    kind: "camp",
    title: "Charcoal Root Rest Camp",
    description: "A soot-warmed shelter lets the hatchling breathe, sharpen claws, and listen. The Meadow is quieter than it should be this far from the Vault. Quiet usually means something is watching.",
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
    description: "The boar's bristles carry a faint shadow edge — barely visible, like smoke that forgot to rise. It was a Meadow creature once. Whatever claimed it hasn't finished the job yet.",
    scene: "forest",
    element: "fire",
    encounterId: "boar",
    difficulty: 1.02,
    reward: { gold: 14, xp: 10, evolution: 5 }
  },
  {
    id: "mossy-peddler",
    step: 7,
    kind: "shop",
    title: "Coalback Peddler",
    description: "A turtle-backed vendor with a tiny furnace trades heat charms for road stories. He's cheerful in the way of someone who hasn't seen the Vault side of the Meadow lately. The hatchling doesn't correct him.",
    scene: "camp",
    element: "fire",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "buy-ironroot", label: "Buy emberroot chew", description: "A bitter chew reinforces scales for the elite gate ahead.", reward: { statBoost: { defense: 2 }, gold: 5 } },
      { id: "swap-stories", label: "Swap campfire stories", description: "The peddler pays for a good hatchling tale.", reward: { gold: 32, xp: 8 } }
    ]
  },
  {
    id: "starlit-font",
    step: 8,
    kind: "shrine",
    title: "Sun-Spark Font",
    description: "Golden sparks ripple in a shallow basin. The font is old — older than the path that leads to it. It hums differently when the hatchling approaches than when anything else does.",
    scene: "shrine",
    element: "fire",
    difficulty: 1,
    reward: {},
    choices: [
      { id: "bathe-wings", label: "Bathe wings in sparks", description: "The dragon moves with cleaner rhythm and learns to slip attacks.", reward: { statBoost: { speed: 1, dodge: 2 }, xp: 16 } },
      { id: "offer-spark", label: "Offer a breath spark", description: "The font returns the spark as gold.", reward: { gold: 20, evolution: 5 } }
    ]
  },
  {
    id: "wisp-ambush",
    step: 9,
    kind: "battle",
    title: "Wildfire Wisp Ambush",
    description: "The wisps circle in patterns that don't quite make sense — they used to be playful. Whatever turned them doesn't fully control them yet. They fight like creatures following an instinct that isn't theirs anymore.",
    scene: "cave",
    element: "fire",
    encounterId: "willow-wisp",
    difficulty: 1.03,
    reward: { gold: 18, xp: 14, evolution: 6 }
  },
  {
    id: "ruin-knight-gate",
    step: 10,
    kind: "battle",
    title: "Ruin Knight Road Guard",
    description: "The armored figure hasn't moved from this post in a long time. It isn't hostile for the usual reasons — something is keeping it here, not duty or pay. It guards the road the way the Vault's wall used to guard the egg: because something told it to.",
    scene: "ruins",
    element: "fire",
    encounterId: "ruin-knight",
    difficulty: 1.12,
    reward: { gold: 62, xp: 28, evolution: 10, statBoost: { attack: 2, defense: 1 } }
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
    kind: "battle",
    title: "Reef Slime Crossing",
    description: "Glass-blue slimes flood the moon bridge, forcing the hatchling to prove dodge, block, and Tide Spiral reads cleanly in combat.",
    scene: "cave",
    element: "water",
    encounterId: "slime",
    difficulty: 0.9,
    reward: { gold: 54, xp: 26, evolution: 10, statBoost: { dodge: 2, defense: 1 } }
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
      { id: "trade-ripple-map", label: "Trade for a ripple map", description: "The trader marks safe currents and pays in route loot.", reward: { gold: 48 } }
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
      { id: "vow-moon-dash", label: "Vow moon dash", description: "Moonlit speed sets up crit windows and future skill synergy.", reward: { statBoost: { speed: 1, critChance: 2 }, xp: 34, gold: 10 } }
    ]
  },
  {
    id: "sky-manta-reef-dive",
    step: 15,
    kind: "elite",
    title: "Sky Manta Reef Dive",
    description: "A sky manta dives through floating coral so the Water hatchling's tempo and dodge bonuses become visible under pressure.",
    scene: "cave",
    element: "water",
    encounterId: "sky-manta",
    difficulty: 0.84,
    reward: { gold: 24, xp: 18, evolution: 8 }
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
    reward: { gold: 44, evolution: 7 }
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
      { id: "sip-reef-tonic", label: "Sip reef tonic", description: "A bright tonic sharpens attack without losing flow.", reward: { statBoost: { attack: 2, speed: 1 }, gold: 6 } }
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
    reward: { gold: 32, xp: 24, evolution: 9 }
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
      { id: "crescent-roar", label: "Crescent roar", description: "The shrine echoes back as experience and prepares the next skill draft.", reward: { xp: 42, gold: 12 } }
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
    reward: { gold: 84, evolution: 5 }
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
    reward: { gold: 42, xp: 32, evolution: 10, statBoost: { defense: 1, block: 2 } }
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
      { id: "buy-shatter-rune", label: "Buy shatter rune", description: "A jagged rune sharpens claws for Crystal Break raider bursts.", reward: { statBoost: { attack: 3, critDamage: 12 }, gold: 10 } }
    ]
  },
  {
    id: "prism-vow-shrine",
    step: 24,
    kind: "battle",
    title: "Prism Vow Shrine",
    description: "A faceted altar animates a basalt ram guardian to test whether the dragon's vow can survive heavy pressure.",
    scene: "ruins",
    element: "earth",
    encounterId: "boar",
    difficulty: 1.14,
    reward: { gold: 74, xp: 46, evolution: 12, statBoost: { attack: 1, defense: 2 } }
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
    reward: { gold: 68, evolution: 7 }
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
    reward: { gold: 86, xp: 56, evolution: 12, statBoost: { attack: 2, defense: 1 } }
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
      { id: "drink-root-tonic", label: "Drink root tonic", description: "A bitter tonic plants the hatchling's stance for blocks and counterattacks.", reward: { statBoost: { health: 16, block: 2 }, gold: 8 } }
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
      { id: "sharpen-prism-horns", label: "Sharpen prism horns", description: "Prism edges push decisive crit damage for the boss gate.", reward: { statBoost: { attack: 2, critDamage: 14 }, xp: 38, gold: 12 } }
    ]
  },
  {
    id: "titan-stone-hoard",
    step: 30,
    kind: "elite",
    title: "Titan Stone Hoard",
    description: "A colossal stone guardian rises from the hoard itself for the middle elite trial of defense, block, and armor-breaking damage.",
    scene: "boss",
    element: "earth",
    encounterId: "ruin-knight",
    difficulty: 1.28,
    reward: { gold: 170, xp: 92, evolution: 18, statBoost: { attack: 3, defense: 3, block: 2 } }
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
      { id: "buy-sun-lens", label: "Buy sun lens", description: "A focusing lens sharpens the next Sunbeam Lancing crit window.", reward: { statBoost: { attack: 2, critChance: 3 }, gold: 12 } }
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
    reward: { gold: 78, xp: 52, evolution: 10, statBoost: { speed: 1, critChance: 2 } }
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
    reward: { gold: 92, evolution: 8 }
  },
  {
    id: "sun-lancer-duel",
    step: 36,
    kind: "battle",
    title: "Sun Lancer Duel",
    description: "A spear-bright guardian mirrors the dragon's beams, creating an elite Light checkpoint for fast counterattacks, crit sparks, and halo shields.",
    scene: "boss",
    element: "light",
    encounterId: "sun-lancer",
    difficulty: 1.24,
    reward: { gold: 104, xp: 66, evolution: 12, statBoost: { attack: 2, speed: 1 } }
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
      { id: "practice-ray-steps", label: "Practice ray steps", description: "Footwork through light strips improves speed and dodge readability.", reward: { statBoost: { speed: 2, dodge: 2 }, gold: 10 } }
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
      { id: "buy-aurora-sigil", label: "Buy aurora sigil", description: "Aurora marks improve sustain and make recovery effects feel magical.", reward: { statBoost: { health: 14, defense: 1 }, gold: 14 } },
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
    reward: { gold: 128, xp: 78, evolution: 13, statBoost: { critChance: 2, critDamage: 10 } }
  },
  {
    id: "aurora-crown-hoard",
    step: 40,
    kind: "battle",
    title: "Aurora Crown Hoard",
    description: "The spire crown unfolds into an aurora guardian with a readable burst of halo shields, sunbeams, crits, and treasure shine.",
    scene: "boss",
    element: "light",
    encounterId: "sun-lancer",
    difficulty: 1.38,
    reward: { gold: 196, xp: 108, evolution: 20, statBoost: { attack: 3, speed: 2, critChance: 2 } }
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
    metric: "battlesWon"
  },
  {
    id: "sharpen-scales",
    title: "Sharpen the Scales",
    description: "Buy three upgrades for your growing dragon.",
    target: 3,
    rewardGold: 90,
    metric: "upgradesBought"
  },
  {
    id: "trailblazer",
    title: "Trailblazer",
    description: "Clear three adventure stages.",
    target: 3,
    rewardGold: 140,
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
