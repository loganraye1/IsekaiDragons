import type { ImageSourcePropType } from "react-native";

export type FireHatchlingSpineAnimationId = "idle_loop" | "attack_forge_breath" | "hit_recoil" | "crit_forge_burst";

export type FireHatchlingSpineAnimation = {
  id: FireHatchlingSpineAnimationId;
  fps: number;
  loop: boolean;
  canvas: readonly [number, number];
  anchor: { x: number; y: number };
  frames: ImageSourcePropType[];
  source: "temporary-proof-frames" | "spine-export";
};

const idleLoopFrames: ImageSourcePropType[] = [
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_000.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_001.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_002.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_003.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_004.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_005.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_006.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_007.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_008.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_009.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_010.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_011.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_012.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_013.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_014.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_015.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_016.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_017.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_018.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_019.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_020.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_021.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_022.png"),
  require("../../assets/dragons/fire-hatchling-canon-source/spine-frame-export/idle_loop/frame_023.png")
];

const attackForgeBreathFrames: ImageSourcePropType[] = [
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_000.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_001.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_002.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_003.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_004.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_005.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_006.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_007.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_008.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_009.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_010.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_011.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_012.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_013.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_014.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_015.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_016.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_017.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_018.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_019.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_020.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_021.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_022.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_023.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_024.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_025.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_026.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_027.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_028.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_029.png")
];

const hitRecoilFrames: ImageSourcePropType[] = [
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/hit_recoil/frame_000.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/hit_recoil/frame_001.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/hit_recoil/frame_002.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/hit_recoil/frame_003.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/hit_recoil/frame_004.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/hit_recoil/frame_005.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/hit_recoil/frame_006.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/hit_recoil/frame_007.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/hit_recoil/frame_008.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/hit_recoil/frame_009.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/hit_recoil/frame_010.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/hit_recoil/frame_011.png")
];

const critForgeBurstFrames: ImageSourcePropType[] = [
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_000.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_001.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_002.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_003.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_004.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_005.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_006.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_007.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_008.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_009.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_010.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_011.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_012.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_013.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_014.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_015.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_016.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_017.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_018.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_019.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_020.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_021.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_022.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_023.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_024.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_025.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_026.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_027.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_028.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_029.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_030.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_031.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_032.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_033.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_034.png"),
  require("../../assets/dragons/living-forge-fire-hatchling/spine-export/crit_forge_burst/frame_035.png")
];

const base = {
  fps: 24,
  canvas: [960, 540] as const,
  anchor: { x: 300, y: 332 },
  source: "spine-export" as const
};

export const fireHatchlingSpineAnimations: Record<FireHatchlingSpineAnimationId, FireHatchlingSpineAnimation> = {
  idle_loop: { ...base, id: "idle_loop", loop: true, frames: idleLoopFrames },
  attack_forge_breath: { ...base, id: "attack_forge_breath", loop: false, frames: attackForgeBreathFrames },
  hit_recoil: { ...base, id: "hit_recoil", loop: false, frames: hitRecoilFrames },
  crit_forge_burst: { ...base, id: "crit_forge_burst", loop: false, frames: critForgeBurstFrames }
};

export function getFireHatchlingSpineAnimationForExchange(actor: "dragon" | "enemy" | "skill" | "dodge" | "result" | null | undefined, label = ""): FireHatchlingSpineAnimationId {
  if (actor === "enemy") {
    return "hit_recoil";
  }
  if (actor === "skill" || label.includes("CRIT")) {
    return "crit_forge_burst";
  }
  if (actor === "dragon") {
    return "attack_forge_breath";
  }
  return "idle_loop";
}
