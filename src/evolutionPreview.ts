import type { ImageSourcePropType } from "react-native";

export type EvolutionPreviewStageId = "drake" | "young" | "dragon" | "ancient";
export type EvolutionPreviewElementId = "fire" | "water" | "earth" | "light" | "dark";

export type EvolutionPreviewOption = {
  id: string;
  label: string;
  image: ImageSourcePropType;
};

export type EvolutionPreviewBranch = {
  id: string;
  label: string;
  buildFantasy: string;
  drakeImage: ImageSourcePropType;
  youngOptions: EvolutionPreviewOption[];
  dragonOptions: EvolutionPreviewOption[];
  ancientOptions: EvolutionPreviewOption[];
};

export type EvolutionPreviewElement = {
  id: EvolutionPreviewElementId;
  label: string;
  primary: string;
  secondary: string;
  fantasy: string;
  stageContactSheets: Record<Exclude<EvolutionPreviewStageId, "drake">, ImageSourcePropType>;
  branches: EvolutionPreviewBranch[];
};

export const evolutionPreviewStages: Array<{ id: EvolutionPreviewStageId; label: string; caption: string }> = [
  { id: "drake", label: "Drake", caption: "First big choice" },
  { id: "young", label: "Young", caption: "Two specializations per Drake" },
  { id: "dragon", label: "Dragon", caption: "Four mature builds per Drake" },
  { id: "ancient", label: "Ancient", caption: "Capstone futures" },
];

export const evolutionPreviewElements: EvolutionPreviewElement[] = [
  {
    id: "fire",
    label: "Fire",
    primary: "#ff784f",
    secondary: "#ffd45d",
    fantasy: "Aggressive burn pressure and molten bruiser bodies.",
    stageContactSheets: {
      young: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/element-sheets/fire_young_path_contact_sheet.png"),
      dragon: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/element-sheets/fire_dragon_path_contact_sheet.png"),
      ancient: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/element-sheets/fire_ancient_path_contact_sheet.png"),
    },
    branches: [
      {
        id: "fire_flame",
        label: "Flame",
        buildFantasy: "pure damage / burn tempo",
        drakeImage: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/fire_flame_drake_path_placeholder.png"),
        youngOptions: [
          { id: "fire_flame_inferno_young_dragon_placeholder", label: "Inferno", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/fire_flame_inferno_young_dragon_placeholder.png") },
          { id: "fire_flame_volcanic_young_dragon_placeholder", label: "Volcanic", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/fire_flame_volcanic_young_dragon_placeholder.png") },
        ],
        dragonOptions: [
          { id: "fire_flame_inferno_avatar_dragon_placeholder", label: "Inferno Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/fire_flame_inferno_avatar_dragon_placeholder.png") },
          { id: "fire_flame_inferno_sovereign_dragon_placeholder", label: "Inferno Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/fire_flame_inferno_sovereign_dragon_placeholder.png") },
          { id: "fire_flame_volcanic_ravager_dragon_placeholder", label: "Volcanic Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/fire_flame_volcanic_ravager_dragon_placeholder.png") },
          { id: "fire_flame_volcanic_warden_dragon_placeholder", label: "Volcanic Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/fire_flame_volcanic_warden_dragon_placeholder.png") },
        ],
        ancientOptions: [
          { id: "fire_flame_ancient_inferno_sovereign_dragon_placeholder", label: "Ancient Inferno Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_flame_ancient_inferno_sovereign_dragon_placeholder.png") },
          { id: "fire_flame_ancient_volcanic_warden_dragon_placeholder", label: "Ancient Volcanic Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_flame_ancient_volcanic_warden_dragon_placeholder.png") },
          { id: "fire_flame_doom_inferno_avatar_dragon_placeholder", label: "Doom Inferno Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_flame_doom_inferno_avatar_dragon_placeholder.png") },
          { id: "fire_flame_doom_volcanic_ravager_dragon_placeholder", label: "Doom Volcanic Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_flame_doom_volcanic_ravager_dragon_placeholder.png") },
          { id: "fire_flame_elder_inferno_sovereign_dragon_placeholder", label: "Elder Inferno Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_flame_elder_inferno_sovereign_dragon_placeholder.png") },
          { id: "fire_flame_elder_volcanic_warden_dragon_placeholder", label: "Elder Volcanic Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_flame_elder_volcanic_warden_dragon_placeholder.png") },
          { id: "fire_flame_primordial_inferno_avatar_dragon_placeholder", label: "Primordial Inferno Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_flame_primordial_inferno_avatar_dragon_placeholder.png") },
          { id: "fire_flame_primordial_volcanic_ravager_dragon_placeholder", label: "Primordial Volcanic Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_flame_primordial_volcanic_ravager_dragon_placeholder.png") },
        ]
      },
      {
        id: "fire_smoke",
        label: "Smoke",
        buildFantasy: "evasion / ambush",
        drakeImage: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/fire_smoke_drake_path_placeholder.png"),
        youngOptions: [
          { id: "fire_smoke_ashen_young_dragon_placeholder", label: "Ashen", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/fire_smoke_ashen_young_dragon_placeholder.png") },
          { id: "fire_smoke_cinderfang_young_dragon_placeholder", label: "Cinderfang", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/fire_smoke_cinderfang_young_dragon_placeholder.png") },
        ],
        dragonOptions: [
          { id: "fire_smoke_ashen_avatar_dragon_placeholder", label: "Ashen Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/fire_smoke_ashen_avatar_dragon_placeholder.png") },
          { id: "fire_smoke_ashen_sovereign_dragon_placeholder", label: "Ashen Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/fire_smoke_ashen_sovereign_dragon_placeholder.png") },
          { id: "fire_smoke_cinderfang_ravager_dragon_placeholder", label: "Cinderfang Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/fire_smoke_cinderfang_ravager_dragon_placeholder.png") },
          { id: "fire_smoke_cinderfang_warden_dragon_placeholder", label: "Cinderfang Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/fire_smoke_cinderfang_warden_dragon_placeholder.png") },
        ],
        ancientOptions: [
          { id: "fire_smoke_ancient_ashen_sovereign_dragon_placeholder", label: "Ancient Ashen Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_smoke_ancient_ashen_sovereign_dragon_placeholder.png") },
          { id: "fire_smoke_ancient_cinderfang_warden_dragon_placeholder", label: "Ancient Cinderfang Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_smoke_ancient_cinderfang_warden_dragon_placeholder.png") },
          { id: "fire_smoke_doom_ashen_avatar_dragon_placeholder", label: "Doom Ashen Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_smoke_doom_ashen_avatar_dragon_placeholder.png") },
          { id: "fire_smoke_doom_cinderfang_ravager_dragon_placeholder", label: "Doom Cinderfang Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_smoke_doom_cinderfang_ravager_dragon_placeholder.png") },
          { id: "fire_smoke_elder_ashen_sovereign_dragon_placeholder", label: "Elder Ashen Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_smoke_elder_ashen_sovereign_dragon_placeholder.png") },
          { id: "fire_smoke_elder_cinderfang_warden_dragon_placeholder", label: "Elder Cinderfang Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_smoke_elder_cinderfang_warden_dragon_placeholder.png") },
          { id: "fire_smoke_primordial_ashen_avatar_dragon_placeholder", label: "Primordial Ashen Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_smoke_primordial_ashen_avatar_dragon_placeholder.png") },
          { id: "fire_smoke_primordial_cinderfang_ravager_dragon_placeholder", label: "Primordial Cinderfang Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_smoke_primordial_cinderfang_ravager_dragon_placeholder.png") },
        ]
      },
      {
        id: "fire_magma",
        label: "Magma",
        buildFantasy: "armor / heavy hits",
        drakeImage: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/fire_magma_drake_path_placeholder.png"),
        youngOptions: [
          { id: "fire_magma_lava_young_dragon_placeholder", label: "Lava", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/fire_magma_lava_young_dragon_placeholder.png") },
          { id: "fire_magma_obsidian_young_dragon_placeholder", label: "Obsidian", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/fire_magma_obsidian_young_dragon_placeholder.png") },
        ],
        dragonOptions: [
          { id: "fire_magma_lava_avatar_dragon_placeholder", label: "Lava Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/fire_magma_lava_avatar_dragon_placeholder.png") },
          { id: "fire_magma_lava_sovereign_dragon_placeholder", label: "Lava Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/fire_magma_lava_sovereign_dragon_placeholder.png") },
          { id: "fire_magma_obsidian_ravager_dragon_placeholder", label: "Obsidian Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/fire_magma_obsidian_ravager_dragon_placeholder.png") },
          { id: "fire_magma_obsidian_warden_dragon_placeholder", label: "Obsidian Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/fire_magma_obsidian_warden_dragon_placeholder.png") },
        ],
        ancientOptions: [
          { id: "fire_magma_ancient_lava_sovereign_dragon_placeholder", label: "Ancient Lava Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_magma_ancient_lava_sovereign_dragon_placeholder.png") },
          { id: "fire_magma_ancient_obsidian_warden_dragon_placeholder", label: "Ancient Obsidian Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_magma_ancient_obsidian_warden_dragon_placeholder.png") },
          { id: "fire_magma_doom_lava_avatar_dragon_placeholder", label: "Doom Lava Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_magma_doom_lava_avatar_dragon_placeholder.png") },
          { id: "fire_magma_doom_obsidian_ravager_dragon_placeholder", label: "Doom Obsidian Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_magma_doom_obsidian_ravager_dragon_placeholder.png") },
          { id: "fire_magma_elder_lava_sovereign_dragon_placeholder", label: "Elder Lava Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_magma_elder_lava_sovereign_dragon_placeholder.png") },
          { id: "fire_magma_elder_obsidian_warden_dragon_placeholder", label: "Elder Obsidian Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_magma_elder_obsidian_warden_dragon_placeholder.png") },
          { id: "fire_magma_primordial_lava_avatar_dragon_placeholder", label: "Primordial Lava Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_magma_primordial_lava_avatar_dragon_placeholder.png") },
          { id: "fire_magma_primordial_obsidian_ravager_dragon_placeholder", label: "Primordial Obsidian Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/fire_magma_primordial_obsidian_ravager_dragon_placeholder.png") },
        ]
      },
    ]
  },
  {
    id: "water",
    label: "Water",
    primary: "#5bdcff",
    secondary: "#b8f3ff",
    fantasy: "Control, evasive flow, frost locks, and misty sustain.",
    stageContactSheets: {
      young: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/element-sheets/water_young_path_contact_sheet.png"),
      dragon: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/element-sheets/water_dragon_path_contact_sheet.png"),
      ancient: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/element-sheets/water_ancient_path_contact_sheet.png"),
    },
    branches: [
      {
        id: "water_tide",
        label: "Tide",
        buildFantasy: "flow sustain",
        drakeImage: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/water_tide_drake_path_placeholder.png"),
        youngOptions: [
          { id: "water_tide_river_young_dragon_placeholder", label: "River", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/water_tide_river_young_dragon_placeholder.png") },
          { id: "water_tide_wavecrash_young_dragon_placeholder", label: "Wavecrash", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/water_tide_wavecrash_young_dragon_placeholder.png") },
        ],
        dragonOptions: [
          { id: "water_tide_river_avatar_dragon_placeholder", label: "River Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/water_tide_river_avatar_dragon_placeholder.png") },
          { id: "water_tide_river_sovereign_dragon_placeholder", label: "River Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/water_tide_river_sovereign_dragon_placeholder.png") },
          { id: "water_tide_wavecrash_ravager_dragon_placeholder", label: "Wavecrash Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/water_tide_wavecrash_ravager_dragon_placeholder.png") },
          { id: "water_tide_wavecrash_warden_dragon_placeholder", label: "Wavecrash Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/water_tide_wavecrash_warden_dragon_placeholder.png") },
        ],
        ancientOptions: [
          { id: "water_tide_ancient_river_sovereign_dragon_placeholder", label: "Ancient River Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_tide_ancient_river_sovereign_dragon_placeholder.png") },
          { id: "water_tide_ancient_wavecrash_warden_dragon_placeholder", label: "Ancient Wavecrash Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_tide_ancient_wavecrash_warden_dragon_placeholder.png") },
          { id: "water_tide_doom_river_avatar_dragon_placeholder", label: "Doom River Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_tide_doom_river_avatar_dragon_placeholder.png") },
          { id: "water_tide_doom_wavecrash_ravager_dragon_placeholder", label: "Doom Wavecrash Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_tide_doom_wavecrash_ravager_dragon_placeholder.png") },
          { id: "water_tide_elder_river_sovereign_dragon_placeholder", label: "Elder River Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_tide_elder_river_sovereign_dragon_placeholder.png") },
          { id: "water_tide_elder_wavecrash_warden_dragon_placeholder", label: "Elder Wavecrash Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_tide_elder_wavecrash_warden_dragon_placeholder.png") },
          { id: "water_tide_primordial_river_avatar_dragon_placeholder", label: "Primordial River Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_tide_primordial_river_avatar_dragon_placeholder.png") },
          { id: "water_tide_primordial_wavecrash_ravager_dragon_placeholder", label: "Primordial Wavecrash Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_tide_primordial_wavecrash_ravager_dragon_placeholder.png") },
        ]
      },
      {
        id: "water_frost",
        label: "Frost",
        buildFantasy: "block / slow control",
        drakeImage: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/water_frost_drake_path_placeholder.png"),
        youngOptions: [
          { id: "water_frost_glacier_young_dragon_placeholder", label: "Glacier", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/water_frost_glacier_young_dragon_placeholder.png") },
          { id: "water_frost_hailstorm_young_dragon_placeholder", label: "Hailstorm", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/water_frost_hailstorm_young_dragon_placeholder.png") },
        ],
        dragonOptions: [
          { id: "water_frost_glacier_avatar_dragon_placeholder", label: "Glacier Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/water_frost_glacier_avatar_dragon_placeholder.png") },
          { id: "water_frost_glacier_sovereign_dragon_placeholder", label: "Glacier Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/water_frost_glacier_sovereign_dragon_placeholder.png") },
          { id: "water_frost_hailstorm_ravager_dragon_placeholder", label: "Hailstorm Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/water_frost_hailstorm_ravager_dragon_placeholder.png") },
          { id: "water_frost_hailstorm_warden_dragon_placeholder", label: "Hailstorm Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/water_frost_hailstorm_warden_dragon_placeholder.png") },
        ],
        ancientOptions: [
          { id: "water_frost_ancient_glacier_sovereign_dragon_placeholder", label: "Ancient Glacier Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_frost_ancient_glacier_sovereign_dragon_placeholder.png") },
          { id: "water_frost_ancient_hailstorm_warden_dragon_placeholder", label: "Ancient Hailstorm Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_frost_ancient_hailstorm_warden_dragon_placeholder.png") },
          { id: "water_frost_doom_glacier_avatar_dragon_placeholder", label: "Doom Glacier Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_frost_doom_glacier_avatar_dragon_placeholder.png") },
          { id: "water_frost_doom_hailstorm_ravager_dragon_placeholder", label: "Doom Hailstorm Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_frost_doom_hailstorm_ravager_dragon_placeholder.png") },
          { id: "water_frost_elder_glacier_sovereign_dragon_placeholder", label: "Elder Glacier Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_frost_elder_glacier_sovereign_dragon_placeholder.png") },
          { id: "water_frost_elder_hailstorm_warden_dragon_placeholder", label: "Elder Hailstorm Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_frost_elder_hailstorm_warden_dragon_placeholder.png") },
          { id: "water_frost_primordial_glacier_avatar_dragon_placeholder", label: "Primordial Glacier Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_frost_primordial_glacier_avatar_dragon_placeholder.png") },
          { id: "water_frost_primordial_hailstorm_ravager_dragon_placeholder", label: "Primordial Hailstorm Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_frost_primordial_hailstorm_ravager_dragon_placeholder.png") },
        ]
      },
      {
        id: "water_mist",
        label: "Mist",
        buildFantasy: "dodge / misdirection",
        drakeImage: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/water_mist_drake_path_placeholder.png"),
        youngOptions: [
          { id: "water_mist_cloud_young_dragon_placeholder", label: "Cloud", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/water_mist_cloud_young_dragon_placeholder.png") },
          { id: "water_mist_mirage_young_dragon_placeholder", label: "Mirage", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/water_mist_mirage_young_dragon_placeholder.png") },
        ],
        dragonOptions: [
          { id: "water_mist_cloud_avatar_dragon_placeholder", label: "Cloud Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/water_mist_cloud_avatar_dragon_placeholder.png") },
          { id: "water_mist_cloud_sovereign_dragon_placeholder", label: "Cloud Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/water_mist_cloud_sovereign_dragon_placeholder.png") },
          { id: "water_mist_mirage_ravager_dragon_placeholder", label: "Mirage Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/water_mist_mirage_ravager_dragon_placeholder.png") },
          { id: "water_mist_mirage_warden_dragon_placeholder", label: "Mirage Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/water_mist_mirage_warden_dragon_placeholder.png") },
        ],
        ancientOptions: [
          { id: "water_mist_ancient_cloud_sovereign_dragon_placeholder", label: "Ancient Cloud Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_mist_ancient_cloud_sovereign_dragon_placeholder.png") },
          { id: "water_mist_ancient_mirage_warden_dragon_placeholder", label: "Ancient Mirage Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_mist_ancient_mirage_warden_dragon_placeholder.png") },
          { id: "water_mist_doom_cloud_avatar_dragon_placeholder", label: "Doom Cloud Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_mist_doom_cloud_avatar_dragon_placeholder.png") },
          { id: "water_mist_doom_mirage_ravager_dragon_placeholder", label: "Doom Mirage Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_mist_doom_mirage_ravager_dragon_placeholder.png") },
          { id: "water_mist_elder_cloud_sovereign_dragon_placeholder", label: "Elder Cloud Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_mist_elder_cloud_sovereign_dragon_placeholder.png") },
          { id: "water_mist_elder_mirage_warden_dragon_placeholder", label: "Elder Mirage Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_mist_elder_mirage_warden_dragon_placeholder.png") },
          { id: "water_mist_primordial_cloud_avatar_dragon_placeholder", label: "Primordial Cloud Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_mist_primordial_cloud_avatar_dragon_placeholder.png") },
          { id: "water_mist_primordial_mirage_ravager_dragon_placeholder", label: "Primordial Mirage Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/water_mist_primordial_mirage_ravager_dragon_placeholder.png") },
        ]
      },
    ]
  },
  {
    id: "earth",
    label: "Earth",
    primary: "#8ddf63",
    secondary: "#d9f99d",
    fantasy: "Durable stone, thorn counterplay, and crystal scaling.",
    stageContactSheets: {
      young: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/element-sheets/earth_young_path_contact_sheet.png"),
      dragon: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/element-sheets/earth_dragon_path_contact_sheet.png"),
      ancient: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/element-sheets/earth_ancient_path_contact_sheet.png"),
    },
    branches: [
      {
        id: "earth_stone",
        label: "Stone",
        buildFantasy: "defense / guard",
        drakeImage: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/earth_stone_drake_path_placeholder.png"),
        youngOptions: [
          { id: "earth_stone_ironhide_young_dragon_placeholder", label: "Ironhide", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/earth_stone_ironhide_young_dragon_placeholder.png") },
          { id: "earth_stone_mountain_young_dragon_placeholder", label: "Mountain", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/earth_stone_mountain_young_dragon_placeholder.png") },
        ],
        dragonOptions: [
          { id: "earth_stone_ironhide_ravager_dragon_placeholder", label: "Ironhide Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/earth_stone_ironhide_ravager_dragon_placeholder.png") },
          { id: "earth_stone_ironhide_warden_dragon_placeholder", label: "Ironhide Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/earth_stone_ironhide_warden_dragon_placeholder.png") },
          { id: "earth_stone_mountain_avatar_dragon_placeholder", label: "Mountain Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/earth_stone_mountain_avatar_dragon_placeholder.png") },
          { id: "earth_stone_mountain_sovereign_dragon_placeholder", label: "Mountain Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/earth_stone_mountain_sovereign_dragon_placeholder.png") },
        ],
        ancientOptions: [
          { id: "earth_stone_ancient_ironhide_warden_dragon_placeholder", label: "Ancient Ironhide Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_stone_ancient_ironhide_warden_dragon_placeholder.png") },
          { id: "earth_stone_ancient_mountain_sovereign_dragon_placeholder", label: "Ancient Mountain Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_stone_ancient_mountain_sovereign_dragon_placeholder.png") },
          { id: "earth_stone_doom_ironhide_ravager_dragon_placeholder", label: "Doom Ironhide Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_stone_doom_ironhide_ravager_dragon_placeholder.png") },
          { id: "earth_stone_doom_mountain_avatar_dragon_placeholder", label: "Doom Mountain Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_stone_doom_mountain_avatar_dragon_placeholder.png") },
          { id: "earth_stone_elder_ironhide_warden_dragon_placeholder", label: "Elder Ironhide Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_stone_elder_ironhide_warden_dragon_placeholder.png") },
          { id: "earth_stone_elder_mountain_sovereign_dragon_placeholder", label: "Elder Mountain Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_stone_elder_mountain_sovereign_dragon_placeholder.png") },
          { id: "earth_stone_primordial_ironhide_ravager_dragon_placeholder", label: "Primordial Ironhide Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_stone_primordial_ironhide_ravager_dragon_placeholder.png") },
          { id: "earth_stone_primordial_mountain_avatar_dragon_placeholder", label: "Primordial Mountain Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_stone_primordial_mountain_avatar_dragon_placeholder.png") },
        ]
      },
      {
        id: "earth_thorn",
        label: "Thorn",
        buildFantasy: "counter / bleed",
        drakeImage: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/earth_thorn_drake_path_placeholder.png"),
        youngOptions: [
          { id: "earth_thorn_briar_young_dragon_placeholder", label: "Briar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/earth_thorn_briar_young_dragon_placeholder.png") },
          { id: "earth_thorn_venomroot_young_dragon_placeholder", label: "Venomroot", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/earth_thorn_venomroot_young_dragon_placeholder.png") },
        ],
        dragonOptions: [
          { id: "earth_thorn_briar_avatar_dragon_placeholder", label: "Briar Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/earth_thorn_briar_avatar_dragon_placeholder.png") },
          { id: "earth_thorn_briar_sovereign_dragon_placeholder", label: "Briar Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/earth_thorn_briar_sovereign_dragon_placeholder.png") },
          { id: "earth_thorn_venomroot_ravager_dragon_placeholder", label: "Venomroot Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/earth_thorn_venomroot_ravager_dragon_placeholder.png") },
          { id: "earth_thorn_venomroot_warden_dragon_placeholder", label: "Venomroot Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/earth_thorn_venomroot_warden_dragon_placeholder.png") },
        ],
        ancientOptions: [
          { id: "earth_thorn_ancient_briar_sovereign_dragon_placeholder", label: "Ancient Briar Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_thorn_ancient_briar_sovereign_dragon_placeholder.png") },
          { id: "earth_thorn_ancient_venomroot_warden_dragon_placeholder", label: "Ancient Venomroot Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_thorn_ancient_venomroot_warden_dragon_placeholder.png") },
          { id: "earth_thorn_doom_briar_avatar_dragon_placeholder", label: "Doom Briar Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_thorn_doom_briar_avatar_dragon_placeholder.png") },
          { id: "earth_thorn_doom_venomroot_ravager_dragon_placeholder", label: "Doom Venomroot Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_thorn_doom_venomroot_ravager_dragon_placeholder.png") },
          { id: "earth_thorn_elder_briar_sovereign_dragon_placeholder", label: "Elder Briar Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_thorn_elder_briar_sovereign_dragon_placeholder.png") },
          { id: "earth_thorn_elder_venomroot_warden_dragon_placeholder", label: "Elder Venomroot Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_thorn_elder_venomroot_warden_dragon_placeholder.png") },
          { id: "earth_thorn_primordial_briar_avatar_dragon_placeholder", label: "Primordial Briar Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_thorn_primordial_briar_avatar_dragon_placeholder.png") },
          { id: "earth_thorn_primordial_venomroot_ravager_dragon_placeholder", label: "Primordial Venomroot Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_thorn_primordial_venomroot_ravager_dragon_placeholder.png") },
        ]
      },
      {
        id: "earth_crystal",
        label: "Crystal",
        buildFantasy: "crit / scaling",
        drakeImage: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/earth_crystal_drake_path_placeholder.png"),
        youngOptions: [
          { id: "earth_crystal_gem_young_dragon_placeholder", label: "Gem", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/earth_crystal_gem_young_dragon_placeholder.png") },
          { id: "earth_crystal_prism_young_dragon_placeholder", label: "Prism", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/earth_crystal_prism_young_dragon_placeholder.png") },
        ],
        dragonOptions: [
          { id: "earth_crystal_gem_avatar_dragon_placeholder", label: "Gem Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/earth_crystal_gem_avatar_dragon_placeholder.png") },
          { id: "earth_crystal_gem_sovereign_dragon_placeholder", label: "Gem Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/earth_crystal_gem_sovereign_dragon_placeholder.png") },
          { id: "earth_crystal_prism_ravager_dragon_placeholder", label: "Prism Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/earth_crystal_prism_ravager_dragon_placeholder.png") },
          { id: "earth_crystal_prism_warden_dragon_placeholder", label: "Prism Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/earth_crystal_prism_warden_dragon_placeholder.png") },
        ],
        ancientOptions: [
          { id: "earth_crystal_ancient_gem_sovereign_dragon_placeholder", label: "Ancient Gem Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_ancient_gem_sovereign_dragon_placeholder.png") },
          { id: "earth_crystal_ancient_prism_warden_dragon_placeholder", label: "Ancient Prism Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_ancient_prism_warden_dragon_placeholder.png") },
          { id: "earth_crystal_doom_gem_avatar_dragon_placeholder", label: "Doom Gem Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_doom_gem_avatar_dragon_placeholder.png") },
          { id: "earth_crystal_doom_prism_ravager_dragon_placeholder", label: "Doom Prism Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_doom_prism_ravager_dragon_placeholder.png") },
          { id: "earth_crystal_elder_gem_sovereign_dragon_placeholder", label: "Elder Gem Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_elder_gem_sovereign_dragon_placeholder.png") },
          { id: "earth_crystal_elder_prism_warden_dragon_placeholder", label: "Elder Prism Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_elder_prism_warden_dragon_placeholder.png") },
          { id: "earth_crystal_primordial_gem_avatar_dragon_placeholder", label: "Primordial Gem Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_primordial_gem_avatar_dragon_placeholder.png") },
          { id: "earth_crystal_primordial_prism_ravager_dragon_placeholder", label: "Primordial Prism Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/earth_crystal_primordial_prism_ravager_dragon_placeholder.png") },
        ]
      },
    ]
  },
  {
    id: "light",
    label: "Light",
    primary: "#f8d987",
    secondary: "#fff8c9",
    fantasy: "Radiant tempo, stormlight crits, and sacred protection.",
    stageContactSheets: {
      young: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/element-sheets/light_young_path_contact_sheet.png"),
      dragon: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/element-sheets/light_dragon_path_contact_sheet.png"),
      ancient: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/element-sheets/light_ancient_path_contact_sheet.png"),
    },
    branches: [
      {
        id: "light_radiant",
        label: "Radiant",
        buildFantasy: "balanced radiant growth",
        drakeImage: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/light_dawn_drake_path_placeholder.png"),
        youngOptions: [
          { id: "light_dawn_guardian_young_dragon_placeholder", label: "Guardian", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/light_dawn_guardian_young_dragon_placeholder.png") },
          { id: "light_dawn_solar_young_dragon_placeholder", label: "Solar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/light_dawn_solar_young_dragon_placeholder.png") },
        ],
        dragonOptions: [
          { id: "light_dawn_guardian_ravager_dragon_placeholder", label: "Guardian Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/light_dawn_guardian_ravager_dragon_placeholder.png") },
          { id: "light_dawn_guardian_warden_dragon_placeholder", label: "Guardian Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/light_dawn_guardian_warden_dragon_placeholder.png") },
          { id: "light_dawn_solar_avatar_dragon_placeholder", label: "Solar Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/light_dawn_solar_avatar_dragon_placeholder.png") },
          { id: "light_dawn_solar_sovereign_dragon_placeholder", label: "Solar Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/light_dawn_solar_sovereign_dragon_placeholder.png") },
        ],
        ancientOptions: [
          { id: "light_dawn_ancient_guardian_warden_dragon_placeholder", label: "Ancient Guardian Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_dawn_ancient_guardian_warden_dragon_placeholder.png") },
          { id: "light_dawn_ancient_solar_sovereign_dragon_placeholder", label: "Ancient Solar Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_dawn_ancient_solar_sovereign_dragon_placeholder.png") },
          { id: "light_dawn_doom_guardian_ravager_dragon_placeholder", label: "Doom Guardian Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_dawn_doom_guardian_ravager_dragon_placeholder.png") },
          { id: "light_dawn_doom_solar_avatar_dragon_placeholder", label: "Doom Solar Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_dawn_doom_solar_avatar_dragon_placeholder.png") },
          { id: "light_dawn_elder_guardian_warden_dragon_placeholder", label: "Elder Guardian Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_dawn_elder_guardian_warden_dragon_placeholder.png") },
          { id: "light_dawn_elder_solar_sovereign_dragon_placeholder", label: "Elder Solar Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_dawn_elder_solar_sovereign_dragon_placeholder.png") },
          { id: "light_dawn_primordial_guardian_ravager_dragon_placeholder", label: "Primordial Guardian Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_dawn_primordial_guardian_ravager_dragon_placeholder.png") },
          { id: "light_dawn_primordial_solar_avatar_dragon_placeholder", label: "Primordial Solar Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_dawn_primordial_solar_avatar_dragon_placeholder.png") },
        ]
      },
      {
        id: "light_stormlight",
        label: "Stormlight",
        buildFantasy: "speed / crit lightning",
        drakeImage: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/light_stormlight_drake_path_placeholder.png"),
        youngOptions: [
          { id: "light_stormlight_star_young_dragon_placeholder", label: "Star", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/light_stormlight_star_young_dragon_placeholder.png") },
          { id: "light_stormlight_tempest_young_dragon_placeholder", label: "Tempest", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/light_stormlight_tempest_young_dragon_placeholder.png") },
        ],
        dragonOptions: [
          { id: "light_stormlight_star_ravager_dragon_placeholder", label: "Star Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/light_stormlight_star_ravager_dragon_placeholder.png") },
          { id: "light_stormlight_star_warden_dragon_placeholder", label: "Star Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/light_stormlight_star_warden_dragon_placeholder.png") },
          { id: "light_stormlight_tempest_avatar_dragon_placeholder", label: "Tempest Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/light_stormlight_tempest_avatar_dragon_placeholder.png") },
          { id: "light_stormlight_tempest_sovereign_dragon_placeholder", label: "Tempest Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/light_stormlight_tempest_sovereign_dragon_placeholder.png") },
        ],
        ancientOptions: [
          { id: "light_stormlight_ancient_star_warden_dragon_placeholder", label: "Ancient Star Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_stormlight_ancient_star_warden_dragon_placeholder.png") },
          { id: "light_stormlight_ancient_tempest_sovereign_dragon_placeholder", label: "Ancient Tempest Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_stormlight_ancient_tempest_sovereign_dragon_placeholder.png") },
          { id: "light_stormlight_doom_star_ravager_dragon_placeholder", label: "Doom Star Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_stormlight_doom_star_ravager_dragon_placeholder.png") },
          { id: "light_stormlight_doom_tempest_avatar_dragon_placeholder", label: "Doom Tempest Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_stormlight_doom_tempest_avatar_dragon_placeholder.png") },
          { id: "light_stormlight_elder_star_warden_dragon_placeholder", label: "Elder Star Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_stormlight_elder_star_warden_dragon_placeholder.png") },
          { id: "light_stormlight_elder_tempest_sovereign_dragon_placeholder", label: "Elder Tempest Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_stormlight_elder_tempest_sovereign_dragon_placeholder.png") },
          { id: "light_stormlight_primordial_star_ravager_dragon_placeholder", label: "Primordial Star Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_stormlight_primordial_star_ravager_dragon_placeholder.png") },
          { id: "light_stormlight_primordial_tempest_avatar_dragon_placeholder", label: "Primordial Tempest Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_stormlight_primordial_tempest_avatar_dragon_placeholder.png") },
        ]
      },
      {
        id: "light_sacred",
        label: "Sacred",
        buildFantasy: "barrier / blessing",
        drakeImage: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/light_sacred_drake_path_placeholder.png"),
        youngOptions: [
          { id: "light_sacred_judgment_young_dragon_placeholder", label: "Judgment", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/light_sacred_judgment_young_dragon_placeholder.png") },
          { id: "light_sacred_seraph_young_dragon_placeholder", label: "Seraph", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/light_sacred_seraph_young_dragon_placeholder.png") },
        ],
        dragonOptions: [
          { id: "light_sacred_judgment_ravager_dragon_placeholder", label: "Judgment Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/light_sacred_judgment_ravager_dragon_placeholder.png") },
          { id: "light_sacred_judgment_warden_dragon_placeholder", label: "Judgment Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/light_sacred_judgment_warden_dragon_placeholder.png") },
          { id: "light_sacred_seraph_avatar_dragon_placeholder", label: "Seraph Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/light_sacred_seraph_avatar_dragon_placeholder.png") },
          { id: "light_sacred_seraph_sovereign_dragon_placeholder", label: "Seraph Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/light_sacred_seraph_sovereign_dragon_placeholder.png") },
        ],
        ancientOptions: [
          { id: "light_sacred_ancient_judgment_warden_dragon_placeholder", label: "Ancient Judgment Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_sacred_ancient_judgment_warden_dragon_placeholder.png") },
          { id: "light_sacred_ancient_seraph_sovereign_dragon_placeholder", label: "Ancient Seraph Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_sacred_ancient_seraph_sovereign_dragon_placeholder.png") },
          { id: "light_sacred_doom_judgment_ravager_dragon_placeholder", label: "Doom Judgment Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_sacred_doom_judgment_ravager_dragon_placeholder.png") },
          { id: "light_sacred_doom_seraph_avatar_dragon_placeholder", label: "Doom Seraph Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_sacred_doom_seraph_avatar_dragon_placeholder.png") },
          { id: "light_sacred_elder_judgment_warden_dragon_placeholder", label: "Elder Judgment Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_sacred_elder_judgment_warden_dragon_placeholder.png") },
          { id: "light_sacred_elder_seraph_sovereign_dragon_placeholder", label: "Elder Seraph Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_sacred_elder_seraph_sovereign_dragon_placeholder.png") },
          { id: "light_sacred_primordial_judgment_ravager_dragon_placeholder", label: "Primordial Judgment Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_sacred_primordial_judgment_ravager_dragon_placeholder.png") },
          { id: "light_sacred_primordial_seraph_avatar_dragon_placeholder", label: "Primordial Seraph Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/light_sacred_primordial_seraph_avatar_dragon_placeholder.png") },
        ]
      },
    ]
  },
  {
    id: "dark",
    label: "Dark",
    primary: "#b778ff",
    secondary: "#ffc4f6",
    fantasy: "Shadow dodge, blood drain, curse marks, and lethal capstones.",
    stageContactSheets: {
      young: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/element-sheets/dark_young_path_contact_sheet.png"),
      dragon: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/element-sheets/dark_dragon_path_contact_sheet.png"),
      ancient: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/element-sheets/dark_ancient_path_contact_sheet.png"),
    },
    branches: [
      {
        id: "dark_shadow",
        label: "Shadow",
        buildFantasy: "dodge / execute",
        drakeImage: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/dark_shadow_drake_path_placeholder.png"),
        youngOptions: [
          { id: "dark_shadow_night_young_dragon_placeholder", label: "Night", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/dark_shadow_night_young_dragon_placeholder.png") },
          { id: "dark_shadow_voidstep_young_dragon_placeholder", label: "Voidstep", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/dark_shadow_voidstep_young_dragon_placeholder.png") },
        ],
        dragonOptions: [
          { id: "dark_shadow_night_avatar_dragon_placeholder", label: "Night Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/dark_shadow_night_avatar_dragon_placeholder.png") },
          { id: "dark_shadow_night_sovereign_dragon_placeholder", label: "Night Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/dark_shadow_night_sovereign_dragon_placeholder.png") },
          { id: "dark_shadow_voidstep_ravager_dragon_placeholder", label: "Voidstep Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/dark_shadow_voidstep_ravager_dragon_placeholder.png") },
          { id: "dark_shadow_voidstep_warden_dragon_placeholder", label: "Voidstep Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/dark_shadow_voidstep_warden_dragon_placeholder.png") },
        ],
        ancientOptions: [
          { id: "dark_shadow_ancient_night_sovereign_dragon_placeholder", label: "Ancient Night Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_ancient_night_sovereign_dragon_placeholder.png") },
          { id: "dark_shadow_ancient_voidstep_warden_dragon_placeholder", label: "Ancient Voidstep Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_ancient_voidstep_warden_dragon_placeholder.png") },
          { id: "dark_shadow_doom_night_avatar_dragon_placeholder", label: "Doom Night Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_doom_night_avatar_dragon_placeholder.png") },
          { id: "dark_shadow_doom_voidstep_ravager_dragon_placeholder", label: "Doom Voidstep Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_doom_voidstep_ravager_dragon_placeholder.png") },
          { id: "dark_shadow_elder_night_sovereign_dragon_placeholder", label: "Elder Night Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_elder_night_sovereign_dragon_placeholder.png") },
          { id: "dark_shadow_elder_voidstep_warden_dragon_placeholder", label: "Elder Voidstep Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_elder_voidstep_warden_dragon_placeholder.png") },
          { id: "dark_shadow_primordial_night_avatar_dragon_placeholder", label: "Primordial Night Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_primordial_night_avatar_dragon_placeholder.png") },
          { id: "dark_shadow_primordial_voidstep_ravager_dragon_placeholder", label: "Primordial Voidstep Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_shadow_primordial_voidstep_ravager_dragon_placeholder.png") },
        ]
      },
      {
        id: "dark_blood",
        label: "Blood",
        buildFantasy: "lifesteal / ferocity",
        drakeImage: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/dark_blood_drake_path_placeholder.png"),
        youngOptions: [
          { id: "dark_blood_ravager_young_dragon_placeholder", label: "Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/dark_blood_ravager_young_dragon_placeholder.png") },
          { id: "dark_blood_vampiric_young_dragon_placeholder", label: "Vampiric", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/dark_blood_vampiric_young_dragon_placeholder.png") },
        ],
        dragonOptions: [
          { id: "dark_blood_ravager_ravager_dragon_placeholder", label: "Ravager Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/dark_blood_ravager_ravager_dragon_placeholder.png") },
          { id: "dark_blood_ravager_warden_dragon_placeholder", label: "Ravager Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/dark_blood_ravager_warden_dragon_placeholder.png") },
          { id: "dark_blood_vampiric_avatar_dragon_placeholder", label: "Vampiric Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/dark_blood_vampiric_avatar_dragon_placeholder.png") },
          { id: "dark_blood_vampiric_sovereign_dragon_placeholder", label: "Vampiric Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/dark_blood_vampiric_sovereign_dragon_placeholder.png") },
        ],
        ancientOptions: [
          { id: "dark_blood_ancient_ravager_warden_dragon_placeholder", label: "Ancient Ravager Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_ancient_ravager_warden_dragon_placeholder.png") },
          { id: "dark_blood_ancient_vampiric_sovereign_dragon_placeholder", label: "Ancient Vampiric Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_ancient_vampiric_sovereign_dragon_placeholder.png") },
          { id: "dark_blood_doom_ravager_ravager_dragon_placeholder", label: "Doom Ravager Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_doom_ravager_ravager_dragon_placeholder.png") },
          { id: "dark_blood_doom_vampiric_avatar_dragon_placeholder", label: "Doom Vampiric Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_doom_vampiric_avatar_dragon_placeholder.png") },
          { id: "dark_blood_elder_ravager_warden_dragon_placeholder", label: "Elder Ravager Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_elder_ravager_warden_dragon_placeholder.png") },
          { id: "dark_blood_elder_vampiric_sovereign_dragon_placeholder", label: "Elder Vampiric Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_elder_vampiric_sovereign_dragon_placeholder.png") },
          { id: "dark_blood_primordial_ravager_ravager_dragon_placeholder", label: "Primordial Ravager Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_primordial_ravager_ravager_dragon_placeholder.png") },
          { id: "dark_blood_primordial_vampiric_avatar_dragon_placeholder", label: "Primordial Vampiric Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_blood_primordial_vampiric_avatar_dragon_placeholder.png") },
        ]
      },
      {
        id: "dark_curse",
        label: "Curse",
        buildFantasy: "debuff / doom marks",
        drakeImage: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/drake-paths/dark_curse_drake_path_placeholder.png"),
        youngOptions: [
          { id: "dark_curse_hex_young_dragon_placeholder", label: "Hex", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/dark_curse_hex_young_dragon_placeholder.png") },
          { id: "dark_curse_reaper_young_dragon_placeholder", label: "Reaper", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/young/dark_curse_reaper_young_dragon_placeholder.png") },
        ],
        dragonOptions: [
          { id: "dark_curse_hex_avatar_dragon_placeholder", label: "Hex Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/dark_curse_hex_avatar_dragon_placeholder.png") },
          { id: "dark_curse_hex_sovereign_dragon_placeholder", label: "Hex Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/dark_curse_hex_sovereign_dragon_placeholder.png") },
          { id: "dark_curse_reaper_ravager_dragon_placeholder", label: "Reaper Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/dark_curse_reaper_ravager_dragon_placeholder.png") },
          { id: "dark_curse_reaper_warden_dragon_placeholder", label: "Reaper Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/dragon/dark_curse_reaper_warden_dragon_placeholder.png") },
        ],
        ancientOptions: [
          { id: "dark_curse_ancient_hex_sovereign_dragon_placeholder", label: "Ancient Hex Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_ancient_hex_sovereign_dragon_placeholder.png") },
          { id: "dark_curse_ancient_reaper_warden_dragon_placeholder", label: "Ancient Reaper Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_ancient_reaper_warden_dragon_placeholder.png") },
          { id: "dark_curse_doom_hex_avatar_dragon_placeholder", label: "Doom Hex Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_doom_hex_avatar_dragon_placeholder.png") },
          { id: "dark_curse_doom_reaper_ravager_dragon_placeholder", label: "Doom Reaper Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_doom_reaper_ravager_dragon_placeholder.png") },
          { id: "dark_curse_elder_hex_sovereign_dragon_placeholder", label: "Elder Hex Sovereign", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_elder_hex_sovereign_dragon_placeholder.png") },
          { id: "dark_curse_elder_reaper_warden_dragon_placeholder", label: "Elder Reaper Warden", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_elder_reaper_warden_dragon_placeholder.png") },
          { id: "dark_curse_primordial_hex_avatar_dragon_placeholder", label: "Primordial Hex Avatar", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_primordial_hex_avatar_dragon_placeholder.png") },
          { id: "dark_curse_primordial_reaper_ravager_dragon_placeholder", label: "Primordial Reaper Ravager", image: require("../assets/dragons/placeholders/evolution-branches-2026-05-11/evolution-paths/ancient/dark_curse_primordial_reaper_ravager_dragon_placeholder.png") },
        ]
      },
    ]
  },
];

export function getEvolutionPreviewElement(id: EvolutionPreviewElementId) {
  return evolutionPreviewElements.find((element) => element.id === id) ?? evolutionPreviewElements[0];
}
