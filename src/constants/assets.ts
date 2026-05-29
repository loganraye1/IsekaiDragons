import type { ImageSourcePropType } from "react-native";
import type { AdventureNode, DragonElement, DragonStage } from "../types";

export type ArtValidationBackgroundKey = "mysticMeadow" | "emberWoods" | "tideCavern" | "stonebackHills";
export type EnemyImageKey = "slime" | "boar" | "wisp" | "knight" | "manta" | "chimera";

export const eggImages: Record<DragonElement, ImageSourcePropType> = {
  fire: require("../../assets/dragons/fire/egg.png"),
  water: require("../../assets/dragons/water/egg.png"),
  earth: require("../../assets/dragons/earth/egg.png"),
  light: require("../../assets/dragons/light/egg.png"),
  dark: require("../../assets/dragons/dark/egg.png")
};

export const eggHatchAnimations: Partial<Record<DragonElement, { source: ImageSourcePropType; durationMs: number }>> = {
  fire: { source: require("../../assets/dragons/fire/egg-hatch.webp"), durationMs: 5300 }
};

export const eggCrackStageImages: Record<DragonElement, ImageSourcePropType[]> = {
  fire: [
    eggImages.fire,
    require("../../assets/eggs/optimized/fire-dragon-egg-crack-1.png"),
    require("../../assets/eggs/optimized/fire-dragon-egg-crack-2.png"),
    require("../../assets/eggs/optimized/fire-dragon-egg-crack-3.png")
  ],
  water: [
    eggImages.water,
    require("../../assets/eggs/optimized/water-dragon-egg-crack-1.png"),
    require("../../assets/eggs/optimized/water-dragon-egg-crack-2.png"),
    require("../../assets/eggs/optimized/water-dragon-egg-crack-3.png")
  ],
  earth: [
    eggImages.earth,
    require("../../assets/eggs/optimized/earth-dragon-egg-crack-1.png"),
    require("../../assets/eggs/optimized/earth-dragon-egg-crack-2.png"),
    require("../../assets/eggs/optimized/earth-dragon-egg-crack-3.png")
  ],
  light: [
    eggImages.light,
    require("../../assets/eggs/optimized/light-dragon-egg-crack-1.png"),
    require("../../assets/eggs/optimized/light-dragon-egg-crack-2.png"),
    require("../../assets/eggs/optimized/light-dragon-egg-crack-3.png")
  ],
  dark: [
    eggImages.dark,
    eggImages.dark,
    eggImages.dark,
    eggImages.dark
  ]
};

export const sceneImages: Record<AdventureNode["scene"], ImageSourcePropType> = {
  forest: require("../../assets/optimized/battle/forest-path-fast.jpg"),
  ruins: require("../../assets/optimized/battle/ruins-cavern-fast.jpg"),
  cave: require("../../assets/optimized/battle/ruins-cavern-fast.jpg"),
  shrine: require("../../assets/optimized/battle/ancient-shrine-fast.jpg"),
  camp: require("../../assets/optimized/battle/dragon-camp-fast.jpg"),
  boss: require("../../assets/optimized/battle/rift-boss-fast.jpg")
};

export const artValidationBackgrounds: Record<ArtValidationBackgroundKey, { label: string; source: ImageSourcePropType }> = {
  mysticMeadow: { label: "Mystic Meadow", source: sceneImages.forest },
  emberWoods: { label: "Ember Woods", source: sceneImages.camp },
  tideCavern: { label: "Tide Cavern", source: sceneImages.cave },
  stonebackHills: { label: "Stoneback Hills", source: sceneImages.ruins }
};

export const elementDenBackgrounds: Record<DragonElement, ImageSourcePropType> = {
  fire: require("../../assets/den/fire-hatchling-den-v1.png"),
  water: sceneImages.cave,
  earth: sceneImages.cave,
  light: sceneImages.cave,
  dark: sceneImages.cave
};

export const hatchlingImages: Record<DragonElement, ImageSourcePropType> = {
  fire: require("../../assets/dragons/fire-hatchling-canon-source/fire-hatchling-idle-no-mouth-flame-cutout-v2.png"),
  water: require("../../assets/dragons/water-hatchling-cutout.png"),
  earth: require("../../assets/dragons/earth-hatchling-cutout.png"),
  light: require("../../assets/dragons/fire-hatchling-cutout.png"),
  dark: require("../../assets/dragons/fire-hatchling-cutout.png")
};

export const approvedFireHatchlingSourceImage = require("../../assets/dragons/fire-hatchling-canon-source/fire-hatchling-idle-no-mouth-flame-cutout-v2.png");
export const battleFireHatchlingImage = require("../../assets/optimized/battle/fire-hatchling-battle-fast.png");

export const fireHatchlingLayerImages: Record<"body" | "head" | "wingNear" | "wingFar" | "tail", ImageSourcePropType> = {
  body: require("../../assets/dragons/layers/fire-hatchling/manual/body.png"),
  head: require("../../assets/dragons/layers/fire-hatchling/manual/head.png"),
  wingNear: require("../../assets/dragons/layers/fire-hatchling/manual/wing-near.png"),
  wingFar: require("../../assets/dragons/layers/fire-hatchling/manual/wing-far.png"),
  tail: require("../../assets/dragons/layers/fire-hatchling/manual/tail.png")
};

export const drakeImages: Record<DragonElement, ImageSourcePropType> = {
  fire: require("../../assets/dragons/fire-drake-cutout.png"),
  water: require("../../assets/dragons/water-drake-cutout.png"),
  earth: require("../../assets/dragons/earth-drake-cutout.png"),
  light: require("../../assets/dragons/fire-drake-cutout.png"),
  dark: require("../../assets/dragons/fire-drake-cutout.png")
};

export const dragonStageImages: Record<DragonStage, Record<DragonElement, ImageSourcePropType>> = {
  egg: eggImages,
  hatchling: hatchlingImages,
  drake: drakeImages,
  // Placeholder later paths: replace these with dragon/wyrm cutouts as art lands.
  dragon: hatchlingImages,
  wyrm: hatchlingImages
};

export function getDragonStageImage(stage: DragonStage, element: DragonElement) {
  return dragonStageImages[stage]?.[element] ?? hatchlingImages[element];
}

export const drakeConceptImages: Record<DragonElement, ImageSourcePropType> = {
  fire: require("../../assets/dragons/concepts/fire_drake_concept.png"),
  water: require("../../assets/dragons/concepts/water_drake_concept.png"),
  earth: require("../../assets/dragons/concepts/earth_drake_concept.png"),
  light: require("../../assets/dragons/concepts/fire_drake_concept.png"),
  dark: require("../../assets/dragons/concepts/fire_drake_concept.png")
};

export const auraEffects: Record<DragonElement, any> = {
  fire: require("../../assets/effects/fire_aura.json"),
  water: require("../../assets/effects/water_aura.json"),
  earth: require("../../assets/effects/earth_aura.json"),
  light: require("../../assets/effects/fire_aura.json"),
  dark: require("../../assets/effects/fire_aura.json")
};

export const evolutionBurstEffect = require("../../assets/effects/evolution_burst.json");

export const enemyImages: Record<EnemyImageKey, ImageSourcePropType> = {
  slime: require("../../assets/optimized/battle/bouncy-slime-cutout-fast.png"),
  boar: require("../../assets/optimized/battle/briar-boar-cutout-fast.png"),
  wisp: require("../../assets/optimized/battle/willow-wisp-cutout-fast.png"),
  knight: require("../../assets/optimized/battle/ruin-knight-cutout-fast.png"),
  manta: require("../../assets/optimized/battle/sky-manta-cutout-fast.png"),
  chimera: require("../../assets/optimized/battle/rift-chimera-cutout-fast.png")
};
