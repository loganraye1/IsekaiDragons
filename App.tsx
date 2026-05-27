import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import {
  Alert,
  AppState,
  type AppStateStatus,
  Animated,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type ImageSourcePropType,
  type ViewStyle,
  useWindowDimensions,
  View
} from "react-native";
import { adventureNodes, eggChoices, elementTheme, encounters, quests, shopItems } from "./src/content";
import { BALANCE } from "./src/balance";
import {
  gameReducer,
  dragonSkillDrafts,
  fireStarterAdventureMilestones,
  productiveWorkNowSlices,
  v02UpdateObjectives,
  supportingSystemRecommendations,
  canReincarnate,
  dragonPathDefinitions,
  achievementDefinitions,
  achievementOrder,
  dailyGoalDefinitions,
  dailyGoalOrder,
  dailyLoginRewardDefinitions,
  equipmentBonusLabels,
  equipmentRarityDefinitions,
  equipmentSlotLabels,
  equipmentSlots,
  getAdventureNodeById,
  getDragonForm,
  getEvolutionProgressRatio,
  getLeadingElement,
  getIdleUpgradeCost,
  getIdleUpgradeCap,
  getNextEvolutionCost,
  getPendingDailyLoginRewardDay,
  getOfflineEssenceReward,
  getOfflineRewardMultiplier,
  getQuestRewardMultiplier,
  getQuestIntervalMs,
  getDragonSoulMultiplier,
  getTreasureDropChance,
  getBattleDamage,
  getBattleRewardEssence,
  getDragonPower,
  getReincarnationSoulsGained,
  isNearEvolutionExcitement,
  getUpgradeCostMultiplier,
  getNodeKindLabel,
  getQuestProgress,
  getUpgradeCost,
  isIdleUpgradeCapped,
  getXpToLevel,
  areaDefinitions,
  elementBonusDefinitions,
  evolutionTraitDefinitions,
  getSelectedEvolutionTrait,
  idleQuestDefinitions,
  idleQuestOrder,
  idleUpgradeDefinitions,
  idleUpgradeOrder,
  journeyEventDefinitions,
  treasureDefinitions,
  treasureRarityDefinitions,
  treasureOrder,
  getActiveDragonSkill,
  getActiveSkillUnlockState,
  getElementMatchupMultiplier,
  getNextAdventureDifficultyId,
  initialGameState
} from "./src/game";
import { clearGameState, loadGameState, saveGameState } from "./src/storage";
import { APP_VERSION, tabs, uiTheme } from "./src/constants/theme";
import GameStage from "./src/components/GameStage";
import ResourceBar from "./src/components/ResourceBar";
import CrackOverlay from "./src/ui/CrackOverlay";
import EggHatchBurst from "./src/ui/EggHatchBurst";
import FloatingLayer from "./src/ui/FloatingLayer";
import GlowPulse from "./src/ui/GlowPulse";
import ParallaxBackground from "./src/ui/ParallaxBackground";
import ParticleField from "./src/ui/ParticleField";
import DragonDisplay, { type AnticipationLevel, type ReturnPresencePhase, type EvolutionMomentPhase, type DragonPathRevealAccent, type ArtValidationMode, defaultArtValidationMode } from "./src/components/DragonDisplay";
import { SafeExpoImage, SafeLottie } from "./src/ui/SafeMedia";
import {
  type ArtValidationBackgroundKey,
  type EnemyImageKey,
  approvedFireHatchlingSourceImage,
  artValidationBackgrounds,
  auraEffects,
  battleFireHatchlingImage,
  drakeConceptImages,
  drakeImages,
  dragonStageImages,
  eggCrackStageImages,
  eggImages,
  elementDenBackgrounds,
  enemyImages,
  evolutionBurstEffect,
  fireHatchlingLayerImages,
  getDragonStageImage,
  hatchlingImages,
  sceneImages
} from "./src/constants/assets";
import { HATCHLING_ART_VERSION } from "./src/artVersion";
import { SpineFrameDragon } from "./src/components/SpineFrameDragon";
import { fireHatchlingSpineAnimations } from "./src/data/fireHatchlingSpineAnimations";
import {
  evolutionPreviewElements,
  evolutionPreviewStages,
  getEvolutionPreviewElement,
  type EvolutionPreviewElementId,
  type EvolutionPreviewOption,
  type EvolutionPreviewStageId
} from "./src/evolutionPreview";
import {
  AchievementId,
  AdventureDifficultyId,
  AdventureNode,
  AreaId,
  BattleResult,
  DailyGoalId,
  DragonElement,
  DragonPathId,
  DragonStage,
  Encounter,
  EquipmentItem,
  EquipmentSlot,
  EvolutionTraitId,
  GameAction,
  GameSettings,
  GameState,
  IdleUpgradeId,
  LootEvent,
  ScreenKey,
  Stats
} from "./src/types";

const automatedProgressionActionTypes = new Set<GameAction["type"]>([
  "autoQuestAction",
  "triggerJourneyEvent",
  "completeReturnPresence"
]);

const shouldRunDispatchHaptic = (action: GameAction) => !automatedProgressionActionTypes.has(action.type);

function preloadImageSource(source: ImageSourcePropType) {
  const resolved = Image.resolveAssetSource(source);
  if (!resolved?.uri) {
    return;
  }
  Image.prefetch(resolved.uri).catch(() => undefined);
}

async function fetchJsonWithTimeout<T>(url: string, init: RequestInit, timeoutMs = 6000): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const rawText = await response.text();
    let parsed: T | { ok?: boolean; error?: string } = {};
    if (rawText.trim()) {
      try {
        parsed = JSON.parse(rawText) as T;
      } catch {
        parsed = { ok: response.ok, error: rawText.slice(0, 160) };
      }
    }
    if (!response.ok) {
      const message = typeof (parsed as { error?: unknown }).error === "string" ? (parsed as { error: string }).error : `Mission Control returned ${response.status}`;
      throw new Error(message);
    }
    return parsed as T;
  } finally {
    clearTimeout(timeout);
  }
}



type EggSelectorOption = {
  id: string;
  element: DragonElement;
  label: string;
  sigil: string;
  image: ImageSourcePropType;
  primary: string;
  secondary: string;
  identity: string;
  branches: Array<{ name: string; description: string }>;
  placeholder: string;
  style: ViewStyle;
};

const eggSelectorOptions: EggSelectorOption[] = [
  {
    id: "ember",
    element: "fire",
    label: "Fire",
    sigil: "F",
    image: eggImages.fire,
    primary: "#ff7a3d",
    secondary: "#ffd0a3",
    identity: "Fire is the aggressive starter: burn pressure, crit spikes, and fast fights. It gets a type edge into Earth enemies, so it feels like momentum breaking armor.",
    branches: [
      { name: "Ash Warden", description: "Guardian branch. Turns flame into shields, counter-burns, and safer boss trades." },
      { name: "Inferno Raider", description: "Raider branch. Pushes explosive openers, crit breath, and high-risk damage tempo." },
      { name: "Sunscale Guide", description: "Mystic branch. Reads heat shimmer for balanced offense, defense, and safer route decisions." }
    ],
    placeholder: "rgba(255,122,61,0.18)",
    style: { left: 134, top: 16, zIndex: 3 }
  },
  {
    id: "tide",
    element: "water",
    label: "Water",
    sigil: "W",
    image: eggImages.water,
    primary: "#5fd5ff",
    secondary: "#c8f4ff",
    identity: "Water is the control starter: healing tides, shields, dodges, and patient counterplay. It gets a type edge into Fire enemies, cooling burst damage into manageable trades.",
    branches: [
      { name: "Reef Guardian", description: "Guardian branch. Builds thick tide shields, recovery windows, and pressure absorption." },
      { name: "Tide Runner", description: "Raider branch. Uses surf-speed combos and slippery offense to chain momentum." },
      { name: "Tide Mystic", description: "Mystic branch. Bends the battlefield with moon tides, counters, and predictive mitigation." }
    ],
    placeholder: "rgba(95,213,255,0.16)",
    style: { left: 22, top: 98, zIndex: 2 }
  },
  {
    id: "light",
    element: "light",
    label: "Light",
    sigil: "L",
    image: eggImages.light,
    primary: "#ffe58f",
    secondary: "#fff7c2",
    identity: "Light is the heroic precision starter: halos, recovery, clean crit clarity, and radiant support. Light and Dark are rivals, each gaining attack bonuses into the other.",
    branches: [
      { name: "Halo Warden", description: "Guardian branch. Protects with visible shield rings, recovery, and ally-safe mitigation." },
      { name: "Sunlance Striker", description: "Raider branch. Focuses beams into sharp crit-forward burst with clear hit payoff." },
      { name: "Aurora Seer", description: "Mystic branch. Rotates recovery, speed, cleansing rays, and long-route sustain." }
    ],
    placeholder: "rgba(255,229,143,0.18)",
    style: { left: 65, top: 230, zIndex: 2 }
  },
  {
    id: "root",
    element: "earth",
    label: "Earth",
    sigil: "E",
    image: eggImages.earth,
    primary: "#7ee08a",
    secondary: "#d8ffd7",
    identity: "Earth is the bruiser starter: defense, thorns, hoard scaling, and heavy evolution bodies. It gets a type edge into Water enemies by anchoring against flow.",
    branches: [
      { name: "Stoneback Sentinel", description: "Guardian branch. Becomes the fortress path with the strongest mitigation and stable trades." },
      { name: "Crystal Fang", description: "Raider branch. Breaks armor with gem claws while staying tougher than a glass cannon." },
      { name: "Rootspeaker", description: "Mystic branch. Controls fights with roots, rune cycles, and steady defensive pressure." }
    ],
    placeholder: "rgba(126,224,138,0.16)",
    style: { left: 246, top: 98, zIndex: 2 }
  },
  {
    id: "dark",
    element: "dark",
    label: "Dark",
    sigil: "D",
    image: eggImages.dark,
    primary: "#8b5cf6",
    secondary: "#d9ccff",
    identity: "Dark is the eclipse starter: curses, ambushes, lifesteal pressure, and tactical debuffs. Dark and Light are rivals, each gaining attack bonuses into the other.",
    branches: [
      { name: "Void Warden", description: "Guardian branch. Protects by folding enemy force into shadow wards and curse shields." },
      { name: "Nightfang Stalker", description: "Raider branch. Opens from concealment with crit ambushes, curse marks, and sustain bites." },
      { name: "Eclipse Seer", description: "Mystic branch. Times debuffs, dodge windows, and shadow recovery around eclipse turns." }
    ],
    placeholder: "rgba(139,92,246,0.18)",
    style: { left: 203, top: 230, zIndex: 2 }
  }
];



type GameSoundEvent = "tap" | "criticalTap" | "upgrade" | "evolve" | "treasureDrop" | "gearDrop" | "reincarnate" | "dailyReward";
type PresenceTestOverrides = {
  idleElement: DragonElement | null;
  anticipationLevel: AnticipationLevel | null;
  returnPresence: GameState["returnPresence"] | null;
};

function playGameSound(_event: GameSoundEvent) {
  // Sound-ready hook: wire Expo AV or another audio layer here when assets exist.
}

type JourneyObjective = {
  title: string;
  description: string;
  reward: string;
  enemy?: EnemyImageKey;
};


function getAutoBattleEnemyImageKey(enemyName: string, areaId: AreaId): EnemyImageKey {
  const normalizedName = enemyName.toLowerCase();

  if (normalizedName.includes("slime") || normalizedName.includes("crab")) return "slime";
  if (normalizedName.includes("wisp") || normalizedName.includes("sprite") || normalizedName.includes("spirit")) return "wisp";
  if (normalizedName.includes("boar") || normalizedName.includes("wolf") || normalizedName.includes("stag") || normalizedName.includes("ram")) return "boar";
  if (normalizedName.includes("goblin") || normalizedName.includes("golem") || normalizedName.includes("sentinel")) return "knight";
  if (normalizedName.includes("serpent") || normalizedName.includes("harpy") || normalizedName.includes("drake")) return "manta";
  if (normalizedName.includes("void") || normalizedName.includes("nightmare") || normalizedName.includes("rift")) return "chimera";

  switch (areaId) {
    case "mysticMeadow":
      return "slime";
    case "emberWoods":
      return "boar";
    case "tideCavern":
      return "wisp";
    case "stonebackHills":
      return "boar";
    case "skyRuins":
      return "manta";
    case "voidNest":
      return "chimera";
    default:
      return "slime";
  }
}

const journeyObjectives: JourneyObjective[] = [
  {
    title: "Follow the glowing trail",
    description: "A bouncy slime blocks the first trail marker.",
    reward: "+12 XP, +8 gold",
    enemy: "slime"
  },
  {
    title: "Sniff out a treasure cache",
    description: "A briar boar guards a buried pouch of dragon coins.",
    reward: "+28 gold, +5 essence",
    enemy: "boar"
  },
  {
    title: "Reach the first dragon shrine",
    description: "A willow wisp tests whether the hatchling can focus its breath.",
    reward: "+10 essence, +8% evolution",
    enemy: "wisp"
  },
  {
    title: "Challenge the rift path",
    description: "The rift chimera appears as the first true boss objective.",
    reward: "+50 XP, +25 essence",
    enemy: "chimera"
  }
];

export default function App() {
  const [state, dispatchBase] = useReducer(gameReducer, initialGameState);
  const [loaded, setLoaded] = useState(false);
  const stateRef = useRef(state);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const backgroundedAtRef = useRef<number | null>(null);

  const theme = state.dragon.element ? elementTheme[state.dragon.element] : elementTheme.fire;
  const form = getDragonForm(state.dragon.stage, state.dragon.element);

  const dispatch = useCallback((action: GameAction) => {
    if (state.settings.hapticsEnabled && shouldRunDispatchHaptic(action)) {
      void Haptics.selectionAsync();
    }
    dispatchBase(action);
  }, [state.settings.hapticsEnabled]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const criticalBattleImages = [
      ...Object.values(sceneImages),
      ...Object.values(enemyImages),
      battleFireHatchlingImage,
      approvedFireHatchlingSourceImage,
      ...Object.values(hatchlingImages)
    ];
    criticalBattleImages.forEach(preloadImageSource);

    const heavyAnimationPreload = setTimeout(() => {
      Object.values(fireHatchlingSpineAnimations)
        .flatMap((animation) => animation.frames)
        .forEach(preloadImageSource);
    }, 2500);

    return () => clearTimeout(heavyAnimationPreload);
  }, []);

  useEffect(() => {
    loadGameState()
      .then((saved) => {
        if (saved) {
          dispatchBase({ type: "hydrate", state: saved });
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) {
      void saveGameState(state);
    }
  }, [loaded, state]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const previousAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (previousAppState === "active" && nextAppState.match(/inactive|background/)) {
        backgroundedAtRef.current = Date.now();
        void saveGameState(stateRef.current);
        return;
      }

      if (previousAppState.match(/inactive|background/) && nextAppState === "active" && backgroundedAtRef.current) {
        const awayDurationMs = Date.now() - backgroundedAtRef.current;
        const offlineReward = getOfflineEssenceReward(stateRef.current, awayDurationMs);
        if (__DEV__) {
          console.log("[ReturnPresence]", {
            awayDurationMs,
            calculatedOfflineEssence: offlineReward,
            pendingOfflineReward: awayDurationMs >= 10 * 60 * 1000 ? offlineReward : 0,
            returnPhase: awayDurationMs >= 10 * 60 * 1000 ? "resting" : "complete",
            rewardApplied: false,
            lastSaveDateBefore: backgroundedAtRef.current,
            lastSaveDateAfter: null
          });
        }
        // Startup/welcome-back notifications are intentionally suppressed so the den opens cleanly.
        // Offline reward state can still exist behind reducer/test hooks, but no automatic return toast is triggered.
        backgroundedAtRef.current = null;
      }
    });

    return () => subscription.remove();
  }, []);

  const focusedAdventureChrome = state.activeScreen === "adventure" || state.activeScreen === "battle";

  const resetGame = () => {
    Alert.alert("Reset your dragon?", "This clears local progress and returns to the egg.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          void clearGameState();
          dispatchBase({ type: "resetGame" });
        }
      }
    ]);
  };

  return (
    <LinearGradient colors={["#130b2a", theme.dark, "#080611"]} style={styles.app}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        {state.phase === "journey" && state.activeScreen !== "battle" ? (
          <View style={[styles.guidedHeader, focusedAdventureChrome && styles.guidedHeaderAdventure]}>
            <View>
              {!focusedAdventureChrome ? <Text style={styles.kicker}>Isekai Dragons</Text> : null}
              <Text style={[styles.title, focusedAdventureChrome && styles.titleAdventure]}>{form.name}</Text>
              <Text style={[styles.subtitle, focusedAdventureChrome && styles.subtitleAdventure]}>{form.title}</Text>
            </View>
            <Pressable onPress={resetGame} style={[styles.resetButton, focusedAdventureChrome && styles.resetButtonAdventure]}>
              <Text style={[styles.resetText, focusedAdventureChrome && styles.resetTextAdventure]}>Reset</Text>
            </Pressable>
          </View>
        ) : null}
        <GameStage state={state} dispatch={dispatch} JourneyStage={HatchlingJourneyStage} AwakeningStage={EggAwakeningStage} />
      </SafeAreaView>
    </LinearGradient>
  );
}


function EggAwakeningStage({
  state,
  dispatch
}: {
  state: GameState;
  dispatch: (action: GameAction) => void;
}) {
  const swirl = useRef(new Animated.Value(0)).current;
  const crack = useRef(new Animated.Value(0)).current;
  const crackProgress = useRef(new Animated.Value(0)).current;
  const eggJolt = useRef(new Animated.Value(0)).current;
  const hatchBurst = useRef(new Animated.Value(0)).current;
  const selectedElement = state.dragon.element;
  const focusedElement = selectedElement ?? "light";
  const theme = elementTheme[focusedElement];
  const eggTaps = state.eggTaps ?? 0;
  const visibleEggStage = state.phase === "hatching" ? 3 : Math.min(3, eggTaps);
  const focusedEggImage = eggCrackStageImages[focusedElement][visibleEggStage];
  const hasSelectedEgg = Boolean(selectedElement);
  const [selectedOriginId, setSelectedOriginId] = useState<string | null>(null);
  const selectedOriginOption = eggSelectorOptions.find((option) => option.element === selectedElement);
  const previewOriginOption = selectedOriginId ? eggSelectorOptions.find((option) => option.id === selectedOriginId) : null;
  const previewEvolutionElement = previewOriginOption ? evolutionPreviewElements.find((element) => element.id === previewOriginOption.element) : null;
  const highlightedOriginOption = selectedOriginOption ?? previewOriginOption ?? eggSelectorOptions[0];
  const [loadedEggSelectorImages, setLoadedEggSelectorImages] = useState<Record<string, boolean>>({});
  const nextTapLabel = eggTaps === 0 ? "Tap to wake the shell" : eggTaps === 1 ? "Tap again — the shell is splitting" : "One more tap to hatch";
  const markEggSelectorImageLoaded = useCallback((id: string) => {
    setLoadedEggSelectorImages((current) => (current[id] ? current : { ...current, [id]: true }));
  }, []);

  useEffect(() => {
    eggSelectorOptions.forEach((option) => {
      const resolved = Image.resolveAssetSource(option.image);
      if (!resolved?.uri) {
        return;
      }
      Image.prefetch(resolved.uri)
        .then(() => markEggSelectorImageLoaded(option.id))
        .catch(() => undefined);
    });
  }, [markEggSelectorImageLoaded]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(swirl, {
        toValue: 1,
        duration: 4200,
        useNativeDriver: true
      })
    ).start();
  }, [swirl]);

  useEffect(() => {
    if (state.phase === "hatching") {
      hatchBurst.setValue(0);
      Animated.parallel([
        Animated.timing(crack, { toValue: 1, duration: 1650, useNativeDriver: true }),
        Animated.timing(crackProgress, { toValue: 1, duration: 520, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(260),
          Animated.timing(hatchBurst, { toValue: 1, duration: 1120, useNativeDriver: true })
        ]),
        Animated.sequence([
          Animated.timing(eggJolt, { toValue: 1, duration: 130, useNativeDriver: true }),
          Animated.timing(eggJolt, { toValue: 0, duration: 90, useNativeDriver: true }),
          Animated.timing(eggJolt, { toValue: 1, duration: 95, useNativeDriver: true }),
          Animated.timing(eggJolt, { toValue: 0, duration: 80, useNativeDriver: true })
        ])
      ]).start(() => {
        dispatch({ type: "finishHatching" });
      });
    } else {
      crack.setValue(0);
      hatchBurst.setValue(0);
    }
  }, [crack, crackProgress, dispatch, eggJolt, hatchBurst, state.phase]);

  useEffect(() => {
    if (state.phase === "hatching") {
      return;
    }

    Animated.timing(crackProgress, {
      toValue: eggTaps / 3,
      duration: 360,
      useNativeDriver: true
    }).start();

    if (eggTaps > 0) {
      Animated.sequence([
        Animated.timing(eggJolt, { toValue: 1, duration: 90, useNativeDriver: true }),
        Animated.timing(eggJolt, { toValue: 0, duration: 110, useNativeDriver: true })
      ]).start();
    }
  }, [eggTaps, crackProgress, eggJolt, state.phase]);

  const rotation = swirl.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const reverseRotation = swirl.interpolate({ inputRange: [0, 1], outputRange: ["360deg", "0deg"] });
  const hatchScale = crack.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.08, 1.24] });
  const hatchOpacity = crack.interpolate({ inputRange: [0, 0.62, 1], outputRange: [1, 0.88, 0.18] });
  const flashOpacity = crack.interpolate({ inputRange: [0, 0.35, 0.66, 1], outputRange: [0, 0.12, 0.46, 0.08] });
  const shellChargeOpacity = crackProgress.interpolate({ inputRange: [0, 0.34, 0.68, 1], outputRange: [0.05, 0.12, 0.22, 0.42] });
  const shellChargeScale = crackProgress.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1.18] });
  const hatchlingRevealOpacity = crack.interpolate({ inputRange: [0, 0.58, 1], outputRange: [0, 0, 1] });
  const hatchlingRevealScale = crack.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1.12] });
  const eggShakeX = eggJolt.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -8, 7, -5, 0] });
  const eggShakeRotate = eggJolt.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: ["0deg", "-3deg", "3deg", "-2deg", "0deg"] });
  const shellSplit = crack.interpolate({ inputRange: [0, 0.42, 0.75, 1], outputRange: [0, 0, 22, 62] });
  const shellLift = crack.interpolate({ inputRange: [0, 0.42, 1], outputRange: [0, 0, -18] });
  const leftShellRotate = crack.interpolate({ inputRange: [0, 0.42, 1], outputRange: ["0deg", "0deg", "-18deg"] });
  const rightShellRotate = crack.interpolate({ inputRange: [0, 0.42, 1], outputRange: ["0deg", "0deg", "18deg"] });
  const splitShellOpacity = crack.interpolate({ inputRange: [0, 0.36, 0.9, 1], outputRange: [0, 0, 0.9, 0.2] });

  return (
    <View style={styles.guidedStage}>
      <View style={styles.eggOnlyScene}>
        <ParticleField color={theme.secondary} count={12} />
        <LinearGradient colors={["#07030f", theme.dark, "#020104"]} style={[styles.eggOnlyOverlay, !hasSelectedEgg && styles.eggOnlyOverlayOriginChoice]}>
          <View style={styles.titleScreenHeader}>
            <Text style={styles.kicker}>Isekai Dragons</Text>
            <Text style={styles.titleScreenVersion}>v{APP_VERSION}</Text>
          </View>

          {hasSelectedEgg ? <View style={styles.eggStageCenter}>
            <Animated.View style={[styles.energyMoteOrbit, { transform: [{ rotate: rotation }] }]}>
              <View style={[styles.energyMote, { backgroundColor: theme.primary }]} />
              <View style={[styles.energyMoteSmall, { backgroundColor: theme.secondary }]} />
            </Animated.View>
            <Animated.View style={[styles.energyMoteOrbitAlt, { transform: [{ rotate: reverseRotation }] }]}>
              <View style={[styles.energyMoteSmall, { backgroundColor: theme.primary }]} />
              <View style={[styles.energyMote, { backgroundColor: theme.secondary }]} />
            </Animated.View>
            <Animated.View pointerEvents="none" style={[styles.hatchFlash, { opacity: flashOpacity, backgroundColor: theme.secondary }]} />
            <Animated.View pointerEvents="none" style={[styles.shellChargeAura, { opacity: shellChargeOpacity, borderColor: theme.secondary, shadowColor: theme.primary, transform: [{ scale: shellChargeScale }] }]} />
            <EggHatchBurst progress={hatchBurst} color={theme.secondary} accentColor={theme.primary} />
            <GlowPulse color={theme.primary} />
            {hasSelectedEgg ? (
              <Pressable disabled={state.phase !== "egg" && state.phase !== "question"} onPress={() => dispatch({ type: "tapEgg" })}>
                <FloatingLayer distance={12} scale={1.055} sway={1.3} duration={1450}>
                  <Animated.View style={{ opacity: hatchOpacity, transform: [{ translateX: eggShakeX }, { rotate: eggShakeRotate }, { scale: hatchScale }] }}>
                    <View style={styles.focusEggWrap}>
                      <Image key={`focus-${focusedElement}-${visibleEggStage}`} source={focusedEggImage} style={styles.focusEggImage} resizeMode="contain" />
                      <Animated.View pointerEvents="none" style={[styles.shellSurfaceGlow, { opacity: shellChargeOpacity, backgroundColor: theme.secondary }]} />
                      <CrackOverlay breaking={crack} />
                    </View>
                  </Animated.View>
                </FloatingLayer>
              </Pressable>
            ) : null}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shellHalfClip,
                styles.shellLeftClip,
                {
                  opacity: splitShellOpacity,
                  transform: [{ translateX: Animated.multiply(shellSplit, -1) }, { translateY: shellLift }, { rotate: leftShellRotate }]
                }
              ]}
            >
                <Image key={`shell-left-${focusedElement}`} source={eggImages[focusedElement]} style={styles.shellHalfImage} resizeMode="contain" />
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shellHalfClip,
                styles.shellRightClip,
                {
                  opacity: splitShellOpacity,
                  transform: [{ translateX: shellSplit }, { translateY: shellLift }, { rotate: rightShellRotate }]
                }
              ]}
            >
              <Image key={`shell-right-${focusedElement}`} source={eggImages[focusedElement]} style={[styles.shellHalfImage, styles.shellRightImage]} resizeMode="contain" />
            </Animated.View>
            <Animated.Image
              source={hatchlingImages[focusedElement]}
              resizeMode="contain"
              style={[
                styles.evolutionHatchling,
                {
                  opacity: hatchlingRevealOpacity,
                  transform: [{ scale: hatchlingRevealScale }]
                }
              ]}
            />
          </View> : null}

          <View style={[styles.eggStartCard, !hasSelectedEgg && styles.eggStartCardOriginChoice]}>
            {hasSelectedEgg ? (
              <>
                <Text style={styles.choiceNumber}>Chosen origin</Text>
                <Text style={[styles.panelTitle, { color: highlightedOriginOption.secondary }]}>{`${highlightedOriginOption.label} Egg`}</Text>
                <Text style={styles.eggStartText}>{nextTapLabel}</Text>
              </>
            ) : (
              <>
                <Text style={styles.eggConstellationTitle}>
                  {previewOriginOption ? `${previewOriginOption.label} origin` : "Choose an origin egg"}
                </Text>
                <Text style={styles.eggConstellationHint}>
                  {previewOriginOption ? previewOriginOption.identity : "Choose one of five elemental origins."}
                </Text>
              </>
            )}
            {!hasSelectedEgg && !previewOriginOption ? (
              <View style={styles.eggSelectionFan}>
                <View pointerEvents="none" style={styles.eggPentagonLineTop} />
                <View pointerEvents="none" style={styles.eggPentagonLineUpperRight} />
                <View pointerEvents="none" style={styles.eggPentagonLineLowerRight} />
                <View pointerEvents="none" style={styles.eggPentagonLineLowerLeft} />
                <View pointerEvents="none" style={styles.eggPentagonLineUpperLeft} />
                {eggSelectorOptions.map((option) => {
                  const imageLoaded = Boolean(loadedEggSelectorImages[option.id]);
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setSelectedOriginId(option.id)}
                      style={[
                        styles.eggSelectionCard,
                        { borderColor: option.primary, shadowColor: option.primary },
                        option.style
                      ]}
                    >
                      <View style={[styles.eggSelectionPlaceholder, { backgroundColor: option.placeholder, borderColor: option.primary }]}>
                        <Text style={[styles.eggSelectionSigil, { color: option.secondary }]}>{option.sigil}</Text>
                      </View>
                      <Image
                        source={option.image}
                        style={[styles.eggSelectionImage, !imageLoaded && styles.eggSelectionImageLoading]}
                        resizeMode="contain"
                        onLoad={() => markEggSelectorImageLoaded(option.id)}
                      />
                      <View style={[styles.eggSelectionGlow, { backgroundColor: option.primary }]} />
                      <Text style={[styles.eggSelectionLabel, { color: option.secondary }]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : !hasSelectedEgg && previewOriginOption ? (
              <View style={[styles.originDetailCard, { borderColor: previewOriginOption.primary, shadowColor: previewOriginOption.primary }]}>
                <View style={styles.originDetailHeroRow}>
                  <View style={[styles.originDetailEggFrame, { borderColor: previewOriginOption.primary, backgroundColor: previewOriginOption.placeholder }]}>
                    <Image source={previewOriginOption.image} style={styles.originDetailEggImage} resizeMode="contain" />
                  </View>
                  <View style={styles.originDetailCopy}>
                    <Text style={[styles.originDetailLabel, { color: previewOriginOption.secondary }]}>{previewOriginOption.label}</Text>
                    <Text style={styles.originDetailIdentity}>{previewOriginOption.identity}</Text>
                  </View>
                </View>
                <Text style={styles.originBranchesTitle}>First three evolution branches</Text>
                {previewOriginOption.branches.map((branch, index) => {
                  const branchPreview = previewEvolutionElement?.branches[index];
                  return (
                    <View key={branch.name} style={styles.originBranchRow}>
                      <Text style={[styles.originBranchNumber, { color: previewOriginOption.secondary }]}>{index + 1}</Text>
                      {branchPreview ? (
                        <View style={[styles.originBranchImageFrame, { borderColor: previewOriginOption.primary }]}>
                          <Image source={branchPreview.drakeImage} style={styles.originBranchImage} resizeMode="contain" />
                        </View>
                      ) : null}
                      <View style={styles.originBranchCopy}>
                        <Text style={styles.originBranchText}>{branch.name}</Text>
                        <Text style={styles.originBranchDescription}>{branch.description}</Text>
                        {branchPreview ? <Text style={styles.originBranchPreviewLabel}>{`${branchPreview.label} drake preview`}</Text> : null}
                      </View>
                    </View>
                  );
                })}
                <View style={styles.originTypeChart}>
                  <Text style={styles.originTypeChartTitle}>Type chart</Text>
                  <View style={styles.originTypeChartCycle}>
                    <View style={[styles.originTypeChip, styles.originTypeChipFire]}>
                      <Text style={styles.originTypeChipText}>Fire</Text>
                    </View>
                    <Text style={styles.originTypeArrow}>›</Text>
                    <View style={[styles.originTypeChip, styles.originTypeChipEarth]}>
                      <Text style={styles.originTypeChipText}>Earth</Text>
                    </View>
                    <Text style={styles.originTypeArrow}>›</Text>
                    <View style={[styles.originTypeChip, styles.originTypeChipWater]}>
                      <Text style={styles.originTypeChipText}>Water</Text>
                    </View>
                    <Text style={styles.originTypeArrow}>›</Text>
                    <View style={[styles.originTypeChip, styles.originTypeChipFire]}>
                      <Text style={styles.originTypeChipText}>Fire</Text>
                    </View>
                  </View>
                  <View style={styles.originTypeRivalRow}>
                    <View style={[styles.originTypeChip, styles.originTypeChipLight]}>
                      <Text style={styles.originTypeChipDarkText}>Light</Text>
                    </View>
                    <Text style={styles.originTypeRivalArrow}>⇄</Text>
                    <View style={[styles.originTypeChip, styles.originTypeChipDark]}>
                      <Text style={styles.originTypeChipText}>Dark</Text>
                    </View>
                    <Text style={styles.originTypeBonusText}>mutual bonus</Text>
                  </View>
                </View>
                <View style={styles.originDetailActions}>
                  <Pressable style={styles.originBackButton} onPress={() => setSelectedOriginId(null)}>
                    <Text style={styles.originBackButtonText}>Go back</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.originConfirmButton, { backgroundColor: previewOriginOption.primary }]}
                    onPress={() => dispatch({ type: "selectEgg", element: previewOriginOption.element })}
                  >
                    <Text style={styles.originConfirmButtonText}>Choose this egg</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.eggTapProgressRow}>
                {[0, 1, 2].map((step) => (
                  <View key={step} style={[styles.eggTapProgressDot, step < eggTaps && { backgroundColor: theme.secondary, borderColor: theme.secondary }]} />
                ))}
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}




function EnergyMeters({ scores }: { scores: Record<DragonElement, number> }) {
  return (
    <View style={styles.energyMeters}>
      {(Object.keys(scores) as DragonElement[]).map((element) => {
        const theme = elementTheme[element];
        return (
          <View key={element} style={styles.energyMeter}>
            <Text style={[styles.energyMeterLabel, { color: theme.secondary }]}>{theme.label}</Text>
            <View style={styles.energyPips}>
              {Array.from({ length: 3 }).map((_, index) => (
                <View key={index} style={[styles.energyPip, index < scores[element] && { backgroundColor: theme.primary }]} />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}


function getDragonPathTradeoffCopy(path: (typeof dragonPathDefinitions)[DragonPathId]) {
  const offense = Math.round(path.battleModifier.damageMultiplier * 100);
  const mitigation = Math.round(path.battleModifier.damageReduction * 100);
  return `Offense ${offense}% | Mitigation ${mitigation}% | Tempo ${path.battleModifier.tempoLabel}`;
}

function getDragonPathCombatCue(path: (typeof dragonPathDefinitions)[DragonPathId]) {
  const styleCue = path.combatStyle.split(":")[0];
  return `${path.combatVerb} • ${styleCue} • ${path.battleModifier.tempoLabel}`;
}

function getDragonPathBraceCue(path: (typeof dragonPathDefinitions)[DragonPathId]) {
  const roleCue = path.role.charAt(0).toUpperCase() + path.role.slice(1);
  const mitigation = Math.round(path.battleModifier.damageReduction * 100);
  return `${roleCue} brace • ${path.combatVerb} • ${mitigation}% mitigation`;
}

function getDragonPathHitCue(path: (typeof dragonPathDefinitions)[DragonPathId]) {
  const roleCue = path.role.charAt(0).toUpperCase() + path.role.slice(1);
  const offense = Math.round(path.battleModifier.damageMultiplier * 100);
  return `${roleCue} hit • ${path.combatVerb} • ${offense}% power`;
}

function getDragonPathEvolutionRevealLine(path: (typeof dragonPathDefinitions)[DragonPathId]) {
  const offense = Math.round(path.battleModifier.damageMultiplier * 100);
  const mitigation = Math.round(path.battleModifier.damageReduction * 100);
  return `${path.name} awakened: ${path.combatVerb} now ${path.battleModifier.tempoLabel} (${offense}% power / ${mitigation}% mitigation).`;
}

function getDragonPathRevealAccent(path: (typeof dragonPathDefinitions)[DragonPathId]): DragonPathRevealAccent {
  const offense = Math.round(path.battleModifier.damageMultiplier * 100);
  const mitigation = Math.round(path.battleModifier.damageReduction * 100);
  const roleLabel = path.role.charAt(0).toUpperCase() + path.role.slice(1);
  return {
    role: path.role,
    roleLabel: `${roleLabel} path`,
    focusLabel: path.combatVerb,
    powerLabel: `${offense}% power`,
    guardLabel: `${mitigation}% mitigation`
  };
}

function DragonPathBadge({ pathId, element }: { pathId: DragonPathId; element: DragonElement }) {
  const path = dragonPathDefinitions[pathId];
  const theme = elementTheme[element];

  return (
    <View style={[styles.dragonPathBadge, { borderColor: theme.primary }]}>
      <Text style={[styles.dragonPathBadgeName, { color: theme.secondary }]}>{path.name}</Text>
      <Text style={styles.dragonPathBadgeText}>{path.vow} {path.bonus}</Text>
      <Text style={styles.dragonPathBadgeCombat}>{path.combatVerb}: {path.combatStyle}</Text>
      <Text style={styles.dragonPathBadgeCombat}>{getDragonPathTradeoffCopy(path)}</Text>
    </View>
  );
}

type CombatParticleSpec = { start: number; end: number; x: number; y: number; size: number; color: string; opacity: number; wobble: number };

const fireBreathParticleSpecs: CombatParticleSpec[] = [
  { start: 0.16, end: 0.68, x: -158, y: -28, size: 18, color: "rgba(255,74,30,0.78)", opacity: 0.92, wobble: -18 },
  { start: 0.2, end: 0.74, x: -188, y: 8, size: 14, color: "rgba(255,185,55,0.88)", opacity: 0.95, wobble: 14 },
  { start: 0.24, end: 0.78, x: -212, y: -10, size: 22, color: "rgba(255,102,31,0.68)", opacity: 0.86, wobble: -8 },
  { start: 0.3, end: 0.86, x: -236, y: 22, size: 12, color: "rgba(255,228,106,0.9)", opacity: 0.78, wobble: 20 },
  { start: 0.34, end: 0.9, x: -176, y: -46, size: 10, color: "rgba(255,127,36,0.72)", opacity: 0.76, wobble: -24 },
  { start: 0.4, end: 0.96, x: -260, y: -18, size: 16, color: "rgba(244,52,31,0.62)", opacity: 0.74, wobble: 10 },
  { start: 0.46, end: 0.94, x: -216, y: 38, size: 9, color: "rgba(255,210,84,0.84)", opacity: 0.7, wobble: 18 },
  { start: 0.5, end: 0.94, x: -132, y: 18, size: 11, color: "rgba(255,90,28,0.66)", opacity: 0.64, wobble: -12 }
];

const elementCombatFx: Record<DragonElement, {
  particles: CombatParticleSpec[];
  glowColor: string;
  hitColor: string;
  hpColor: string;
  enemyHitLabel: string;
  braceLabel: string;
}> = {
  fire: {
    glowColor: "rgba(255,214,94,0.9)",
    hitColor: "rgba(255,211,93,0.9)",
    hpColor: "#ff784f",
    enemyHitLabel: "Burned",
    braceLabel: "Dragon braces",
    particles: fireBreathParticleSpecs
  },
  water: {
    glowColor: "rgba(95,211,255,0.88)",
    hitColor: "rgba(91,220,255,0.88)",
    hpColor: "#5bdcff",
    enemyHitLabel: "Drenched",
    braceLabel: "Tide guard",
    particles: [
      { start: 0.14, end: 0.7, x: -150, y: -34, size: 12, color: "rgba(88,221,255,0.82)", opacity: 0.9, wobble: -30 },
      { start: 0.2, end: 0.78, x: -180, y: 8, size: 18, color: "rgba(147,240,255,0.72)", opacity: 0.88, wobble: 28 },
      { start: 0.25, end: 0.84, x: -218, y: -18, size: 10, color: "rgba(73,169,255,0.78)", opacity: 0.78, wobble: -24 },
      { start: 0.32, end: 0.92, x: -246, y: 26, size: 15, color: "rgba(181,249,255,0.72)", opacity: 0.72, wobble: 20 },
      { start: 0.42, end: 0.96, x: -190, y: -52, size: 8, color: "rgba(111,199,255,0.7)", opacity: 0.68, wobble: -36 }
    ]
  },
  earth: {
    glowColor: "rgba(171,230,93,0.86)",
    hitColor: "rgba(132,211,91,0.88)",
    hpColor: "#8ddf63",
    enemyHitLabel: "Crushed",
    braceLabel: "Stone guard",
    particles: [
      { start: 0.12, end: 0.68, x: -130, y: -12, size: 22, color: "rgba(126,97,61,0.82)", opacity: 0.88, wobble: -8 },
      { start: 0.18, end: 0.74, x: -168, y: 24, size: 16, color: "rgba(179,143,82,0.78)", opacity: 0.82, wobble: 10 },
      { start: 0.24, end: 0.82, x: -204, y: -30, size: 14, color: "rgba(117,207,82,0.78)", opacity: 0.78, wobble: -14 },
      { start: 0.34, end: 0.9, x: -236, y: 8, size: 20, color: "rgba(92,73,52,0.74)", opacity: 0.72, wobble: 8 },
      { start: 0.44, end: 0.96, x: -174, y: -48, size: 10, color: "rgba(205,178,101,0.72)", opacity: 0.68, wobble: -12 }
    ]
  },
  dark: {
    glowColor: "rgba(139,92,246,0.88)",
    hitColor: "rgba(191,169,255,0.9)",
    hpColor: "#8b5cf6",
    enemyHitLabel: "Cursed",
    braceLabel: "Void guard",
    particles: [
      { start: 0.1, end: 0.62, x: -142, y: -42, size: 10, color: "rgba(139,92,246,0.86)", opacity: 0.9, wobble: -10 },
      { start: 0.18, end: 0.74, x: -190, y: -8, size: 16, color: "rgba(50,35,90,0.88)", opacity: 0.86, wobble: 10 },
      { start: 0.28, end: 0.84, x: -228, y: 22, size: 12, color: "rgba(217,204,255,0.76)", opacity: 0.78, wobble: 16 },
      { start: 0.38, end: 0.92, x: -260, y: -18, size: 18, color: "rgba(100,60,190,0.72)", opacity: 0.72, wobble: -14 },
      { start: 0.46, end: 0.96, x: -176, y: 38, size: 9, color: "rgba(205,185,255,0.74)", opacity: 0.68, wobble: 20 }
    ]
  },
  light: {
    glowColor: "rgba(255,238,156,0.9)",
    hitColor: "rgba(255,247,194,0.92)",
    hpColor: "#ffe58f",
    enemyHitLabel: "Lanced",
    braceLabel: "Halo guard",
    particles: [
      { start: 0.1, end: 0.62, x: -142, y: -42, size: 10, color: "rgba(255,247,194,0.9)", opacity: 0.94, wobble: -10 },
      { start: 0.16, end: 0.7, x: -188, y: -8, size: 16, color: "rgba(255,229,143,0.86)", opacity: 0.9, wobble: 8 },
      { start: 0.24, end: 0.8, x: -226, y: 22, size: 12, color: "rgba(255,255,232,0.82)", opacity: 0.78, wobble: 16 },
      { start: 0.34, end: 0.9, x: -260, y: -18, size: 18, color: "rgba(255,207,89,0.72)", opacity: 0.72, wobble: -14 },
      { start: 0.44, end: 0.96, x: -176, y: 38, size: 9, color: "rgba(255,244,178,0.76)", opacity: 0.68, wobble: 20 }
    ]
  }
};

function FireBreathParticleTrail({ progress, element = "fire" }: { progress: Animated.Value; element?: DragonElement }) {
  return (
    <View pointerEvents="none" style={styles.fireBreathParticleTrail}>
      {elementCombatFx[element].particles.map((spec, index) => (
        <FireBreathParticle key={`${element}-${spec.x}-${index}`} progress={progress} spec={spec} index={index} />
      ))}
    </View>
  );
}

function FireBreathParticle({
  progress,
  spec,
  index
}: {
  progress: Animated.Value;
  spec: CombatParticleSpec;
  index: number;
}) {
  const mid = Math.min(spec.start + 0.18, spec.end - 0.08);
  const opacity = progress.interpolate({
    inputRange: [0, spec.start, mid, spec.end, 1],
    outputRange: [0, 0, spec.opacity, spec.opacity * 0.32, 0],
    extrapolate: "clamp"
  });
  const translateX = progress.interpolate({
    inputRange: [0, spec.start, spec.end, 1],
    outputRange: [8, 8, spec.x, spec.x + spec.wobble],
    extrapolate: "clamp"
  });
  const translateY = progress.interpolate({
    inputRange: [0, spec.start, mid, spec.end, 1],
    outputRange: [0, 0, spec.y, spec.y + (index % 2 === 0 ? -12 : 10), spec.y],
    extrapolate: "clamp"
  });
  const scale = progress.interpolate({
    inputRange: [0, spec.start, mid, spec.end, 1],
    outputRange: [0.18, 0.18, 1.28, 0.72, 0.22],
    extrapolate: "clamp"
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [index % 2 === 0 ? "-18deg" : "14deg", index % 2 === 0 ? "28deg" : "-24deg"]
  });

  return (
    <Animated.View
      style={[
        styles.fireBreathParticle,
        {
          backgroundColor: spec.color,
          height: spec.size,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }, { rotate }],
          width: spec.size
        }
      ]}
    />
  );
}



type IdlePanelKey = "stats" | "upgrades" | "adventure" | "evolution" | "goals" | "rebirth" | "settings";

const onboardingSteps = [
  "Choose adventures to earn loot and Essence.",
  "Use training and loot to grow between runs.",
  "Adventure defeats enemies and finds loot.",
  "Evolve and eventually reincarnate for Dragon Souls."
];

const guidedPlaytestSteps = [
  { id: "freshSave", label: "Fresh save created" },
  { id: "completeAdventure", label: "Complete one adventure" },
  { id: "buyFirstUpgrade", label: "Buy first upgrade" },
  { id: "chooseElement", label: "Choose Fire/Water/Earth path" },
  { id: "firstQuestAction", label: "Complete first quest action" },
  { id: "defeatFirstEnemy", label: "Defeat first enemy" },
  { id: "firstLootDrop", label: "Get first treasure or equipment drop" },
  { id: "reachDrake", label: "Reach Drake evolution" },
  { id: "chooseEvolutionBranch", label: "Choose evolution branch" },
  { id: "openGoals", label: "Open Goals panel" },
  { id: "openRebirth", label: "Open Rebirth panel" },
  { id: "exportNotes", label: "Export playtest notes" }
];

function HatchlingJourneyStage({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  const element = state.dragon.element ?? "fire";
  const theme = elementTheme[element];
  const form = getDragonForm(state.dragon.stage, element);
  const numberFormat = state.settings.numberFormat;
  const questIntervalMs = getQuestIntervalMs(state);
  const evolutionCost = getNextEvolutionCost(state.dragon.stage);
  const canEvolve = evolutionCost !== null && state.player.essence >= evolutionCost;
  const evolutionProgress = getEvolutionProgressRatio(state);
  const anticipationLevel: AnticipationLevel = evolutionProgress >= BALANCE.softProgressionAssist.excitementThreshold ? "excited" : evolutionProgress >= BALANCE.softProgressionAssist.rewardAssistThreshold ? "alert" : "calm";
  const nearEvolutionExcitement = isNearEvolutionExcitement(state);
  const [floatingReward, setFloatingReward] = useState<{ id: number; text: string } | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [sparkleUpgrade, setSparkleUpgrade] = useState<IdleUpgradeId | null>(null);
  const [showEvolutionChoices, setShowEvolutionChoices] = useState(false);
  const [showReincarnationConfirm, setShowReincarnationConfirm] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [activePanel, setActivePanel] = useState<IdlePanelKey | null>(null);
  const [evolutionMomentPhase, setEvolutionMomentPhase] = useState<EvolutionMomentPhase>(null);
  const [returnPresencePhase, setReturnPresencePhase] = useState<ReturnPresencePhase>("sleeping");
  const [presenceTestOverrides, setPresenceTestOverrides] = useState<PresenceTestOverrides>({
    idleElement: null,
    anticipationLevel: null,
    returnPresence: null
  });
  const [artValidationMode, setArtValidationMode] = useState<ArtValidationMode>({
    ...defaultArtValidationMode
  });
  const evolutionFeedback = useRef(new Animated.Value(0)).current;
  const effectiveAnticipationLevel = presenceTestOverrides.anticipationLevel ?? anticipationLevel;
  const effectiveReturnPresence = state.returnPresence.active ? state.returnPresence : presenceTestOverrides.returnPresence;
  const effectiveIdleElement = presenceTestOverrides.idleElement ?? element;
  const presenceTestActive = Boolean(presenceTestOverrides.idleElement || presenceTestOverrides.anticipationLevel || presenceTestOverrides.returnPresence);
  const shouldShowTutorialOverlay = !state.tutorialCompleted && state.dragon.stage === "egg" && state.activeScreen === "egg";
  const shouldShowDailyLoginReward = state.lastLoginRewardDate !== getTodayKeyForUi() && state.completedAdventureRuns > 0;
  const shouldShowReturnPresenceToast = false;
  const denBackgroundSource = elementDenBackgrounds[element];

  const evolutionFeedbackStyle = state.settings.reducedMotion
    ? undefined
    : {
    transform: [
      {
        translateX: evolutionFeedback.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [0, -7, 7, -5, 5, 0] })
      },
      {
        scale: evolutionFeedback.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.025, 1] })
      }
    ]
  };

  const runHaptic = (callback: () => Promise<void>) => {
    if (state.settings.hapticsEnabled) {
      void callback();
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({ type: "autoQuestAction" });
    }, questIntervalMs);

    return () => clearInterval(timer);
  }, [dispatch, questIntervalMs]);

  useEffect(() => {
    if (!effectiveReturnPresence?.active) {
      setReturnPresencePhase("sleeping");
      return;
    }

    const activePresence = effectiveReturnPresence;
    setActivePanel(null);
    setReturnPresencePhase("sleeping");
    const wakeTimer = setTimeout(() => setReturnPresencePhase("waking"), state.settings.reducedMotion ? 300 : 1000);
    const greetTimer = setTimeout(() => {
      setReturnPresencePhase("greeting");
      if (__DEV__) {
        console.log("[ReturnPresence]", {
          awayDurationMs: activePresence.awayDurationMs,
          calculatedOfflineEssence: activePresence.offlineReward,
          pendingOfflineReward: activePresence.pendingOfflineReward,
          returnPhase: "greeting",
          rewardApplied: activePresence.rewardApplied,
          lastSaveDateBefore: activePresence.lastSaveDateBefore,
          lastSaveDateAfter: activePresence.lastSaveDateAfter
        });
      }
      runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    }, state.settings.reducedMotion ? 700 : 1700);
    const rewardTimer = setTimeout(() => {
      setReturnPresencePhase("rewards");
      if (__DEV__) {
        console.log("[ReturnPresence]", {
          awayDurationMs: activePresence.awayDurationMs,
          calculatedOfflineEssence: activePresence.offlineReward,
          pendingOfflineReward: activePresence.pendingOfflineReward,
          returnPhase: "rewards",
          rewardApplied: false,
          lastSaveDateBefore: activePresence.lastSaveDateBefore,
          lastSaveDateAfter: activePresence.lastSaveDateAfter
        });
      }
      if (state.returnPresence.active) {
        dispatch({ type: "completeReturnPresence" });
      }
    }, state.settings.reducedMotion ? 1500 : 3000);
    const completeTimer = setTimeout(() => {
      setPresenceTestOverrides((current) => ({ ...current, returnPresence: null }));
    }, state.settings.reducedMotion ? 2600 : 4700);

    return () => {
      clearTimeout(wakeTimer);
      clearTimeout(greetTimer);
      clearTimeout(rewardTimer);
      clearTimeout(completeTimer);
    };
  }, [dispatch, effectiveReturnPresence?.active, effectiveReturnPresence?.startedAt, state.returnPresence.active, state.settings.reducedMotion, state.settings.hapticsEnabled]);

  // Event windows are intentionally disabled during the premium first-impression/den pass.
  // The reducer data can remain for future adventure tuning, but no timer should pop an event modal over the dragon.
  const shouldShowJourneyEventModal = false;

  useEffect(() => {
    if (effectiveAnticipationLevel !== "excited" || effectiveReturnPresence?.active) {
      return;
    }

    const lines = ["Something feels different...", "I think I'm changing!", "I'm almost ready!"];
    const timer = setInterval(() => {
      setFloatingReward({ id: Date.now(), text: lines[Math.floor(Math.random() * lines.length)] ?? lines[0] });
    }, 28000);

    return () => clearInterval(timer);
  }, [effectiveAnticipationLevel, effectiveReturnPresence?.active]);

  const buyIdleUpgrade = (upgradeId: IdleUpgradeId) => {
    const cost = getIdleUpgradeCost(state, upgradeId);
    if (state.player.essence < cost || isIdleUpgradeCapped(state, upgradeId)) {
      return;
    }

    runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    playGameSound("upgrade");
    dispatch({ type: "buyIdleUpgrade", upgradeId });
    setSparkleUpgrade(upgradeId);
    setTimeout(() => setSparkleUpgrade(null), 650);
  };

  const playEvolutionFeedback = () => {
    if (!state.settings.reducedMotion) {
      evolutionFeedback.setValue(0);
      Animated.timing(evolutionFeedback, { toValue: 1, duration: 520, useNativeDriver: true }).start();
    }
    runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    playGameSound("evolve");
  };

  const getPostEvolutionLine = (nextStage: DragonStage) => {
    if (nextStage !== "drake") {
      return "Evolution!";
    }
    if (state.dragon.path) {
      return getDragonPathEvolutionRevealLine(dragonPathDefinitions[state.dragon.path]);
    }
    if (element === "fire") {
      return Math.random() > 0.5 ? "I feel stronger now!" : "Look how much I've grown!";
    }
    if (element === "water") {
      return Math.random() > 0.5 ? "Everything feels clearer..." : "I think I understand more now.";
    }
    return Math.random() > 0.5 ? "I'll protect our treasures." : "I've grown sturdy and strong.";
  };

  const playWarmEvolutionSequence = (commitEvolution: () => void, nextStage: DragonStage) => {
    setEvolutionMomentPhase("glow");
    playEvolutionFeedback();
    setTimeout(() => setEvolutionMomentPhase("silhouette"), state.settings.reducedMotion ? 250 : 700);
    setTimeout(() => {
      commitEvolution();
      setEvolutionMomentPhase("reveal");
      setBurstKey(Date.now());
      runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
      setFloatingReward({ id: Date.now() + 1, text: getPostEvolutionLine(nextStage) });
    }, state.settings.reducedMotion ? 550 : 1250);
    setTimeout(() => setBurstKey(0), state.settings.reducedMotion ? 1200 : 2300);
    setTimeout(() => setEvolutionMomentPhase(null), state.settings.reducedMotion ? 1400 : 2800);
  };

  const logEvolvePress = (actionTaken: string) => {
    if (__DEV__) {
      console.log("[Evolve]", {
        stage: state.dragon.stage,
        element: state.dragon.element,
        essence: state.player.essence,
        nextEvolutionCost: evolutionCost,
        canEvolve,
        actionTaken
      });
    }
  };

  const evolveDragon = () => {
    if (!canEvolve) {
      logEvolvePress("blocked:not-enough-essence-or-terminal-stage");
      return;
    }
    setActivePanel(null);
    if (state.dragon.stage === "egg") {
      logEvolvePress("open-element-choice");
      dispatch({ type: "tapEgg" });
      return;
    }
    if (state.dragon.stage === "hatchling") {
      logEvolvePress("open-branch-choice");
      setTimeout(() => setShowEvolutionChoices(true), 0);
      return;
    }

    logEvolvePress("direct-evolve");
    const nextStage = state.dragon.stage === "drake" ? "dragon" : state.dragon.stage === "dragon" ? "wyrm" : "drake";
    playWarmEvolutionSequence(() => dispatch({ type: "evolveDragon" }), nextStage);
  };

  const chooseEvolutionTrait = (traitId: EvolutionTraitId) => {
    setShowEvolutionChoices(false);
    if (__DEV__) {
      console.log("[Evolve]", {
        stage: state.dragon.stage,
        element: state.dragon.element,
        essence: state.player.essence,
        nextEvolutionCost: evolutionCost,
        canEvolve,
        actionTaken: "branch-choice-confirmed",
        traitId
      });
    }
    playWarmEvolutionSequence(() => dispatch({ type: "evolveDragon", traitId }), "drake");
  };

  const reincarnate = () => {
    setShowReincarnationConfirm(false);
    runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    playGameSound("reincarnate");
    dispatch({ type: "reincarnate" });
  };

  const claimDailyLoginReward = () => {
    runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    playGameSound("dailyReward");
    dispatch({ type: "claimDailyLoginReward" });
  };

  useEffect(() => {
    if (!state.lastLoot?.treasureId && !state.lastLoot?.equipmentId) {
      return;
    }
    runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    playGameSound(state.lastLoot.equipmentId ? "gearDrop" : "treasureDrop");
  }, [state.lastLoot?.id, state.lastLoot?.treasureId, state.lastLoot?.equipmentId, state.settings.hapticsEnabled]);

  useEffect(() => {
    if (!__DEV__ || !state.guidedPlaytest.active) {
      return;
    }
    const autoCompleted = getAutoCompletedGuidedStepIds(state);
    const missing = autoCompleted.filter((stepId) => !state.guidedPlaytest.completedStepIds.includes(stepId));
    if (missing.length > 0) {
      dispatch({ type: "completeGuidedPlaytestSteps", stepIds: missing });
    }
  }, [
    state.guidedPlaytest.active,
    state.guidedPlaytest.completedStepIds,
    state.dailyGoals.completeAdventure1?.progress ?? 0,
    state.dailyGoals.completeQuest5?.progress ?? 0,
    state.idleUpgrades,
    state.dragon.element,
    state.dragon.stage,
    state.selectedEvolutionTraits,
    state.autoBattle.defeatedCount,
    state.treasures,
    state.equipmentInventory.length
  ]);

  const finishTutorial = () => {
    dispatch({ type: "completeTutorial" });
    setTutorialStep(0);
  };

  const resetSave = () => {
    Alert.alert("Reset save?", "This clears local progress and returns to the egg.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          void clearGameState();
          dispatch({ type: "resetGame" });
        }
      }
    ]);
  };

  return (
    <Animated.View style={[styles.guidedStage, evolutionFeedbackStyle]}>
      <DragonDisplay
        element={element}
        dragonSource={getDragonStageImage(state.dragon.stage, element)}
        backgroundSource={__DEV__ && artValidationMode.enabled ? artValidationBackgrounds[artValidationMode.backgroundKey].source : state.activeScreen === "den" ? denBackgroundSource : sceneImages.forest}
        floatingText={floatingReward?.text}
        floatingTextKey={floatingReward?.id}
        showEvolutionBurst={burstKey > 0 && !state.settings.reducedMotion}
        pathRevealAccent={state.dragon.path ? getDragonPathRevealAccent(dragonPathDefinitions[state.dragon.path]) : null}
        dragonStage={state.dragon.stage}
        reducedMotion={state.settings.reducedMotion}
        tapBounceScale={nearEvolutionExcitement ? BALANCE.softProgressionAssist.excitedTapBounceScale : BALANCE.softProgressionAssist.baseTapBounceScale}
        anticipationLevel={effectiveAnticipationLevel}
        returnPresencePhase={effectiveReturnPresence?.active ? returnPresencePhase : null}
        evolutionMomentPhase={evolutionMomentPhase}
        behaviorElement={effectiveIdleElement}
        artValidationMode={artValidationMode}
        showDragon={state.activeScreen === "den"}
      >
        {!state.settings.reducedMotion && (!__DEV__ || !artValidationMode.enabled || !artValidationMode.disableAura) ? <ParticleField color={theme.secondary} count={10} /> : null}
        {state.activeScreen === "den" && (!__DEV__ || !artValidationMode.enabled || artValidationMode.hudVisible) ? (
          <HudBar
            essence={formatGameNumber(state.player.essence, numberFormat)}
            souls={formatGameNumber(state.dragonSouls, numberFormat)}
            onLongPress={__DEV__ ? () => setShowDebugPanel(true) : undefined}
          />
        ) : null}

        {state.activeScreen !== "den" ? (
          <View style={styles.mainAdventurePathOverlay}>
            {state.activeScreen === "battle" ? (
              <BattleScreen state={state} dispatch={dispatch} />
            ) : state.activeScreen === "adventure" ? (
              <AdventureScreen state={state} dispatch={dispatch} />
            ) : (
              <AdventureJourneyScene state={state} onReturnToDen={() => dispatch({ type: "setScreen", screen: "den" })} />
            )}
          </View>
        ) : null}

        {state.activeScreen === "den" ? <View style={styles.mainDragonInfo}>
          <Text style={[styles.mainDragonName, { color: theme.secondary }]}>{form.name}</Text>
          <Text style={styles.mainDragonMeta}>
            {theme.label} | {state.dragon.stage.toUpperCase()}
          </Text>
          <Text style={styles.mainTapHint}>Adventure completions improve loot tiers and return chests.</Text>
          <Pressable onPress={() => dispatch({ type: "setScreen", screen: "adventure" })} style={styles.returnToAdventureButton}>
            <Text style={styles.returnToAdventureText}>Start Adventuring</Text>
          </Pressable>
        </View> : null}

        {shouldShowReturnPresenceToast && effectiveReturnPresence?.active ? <ReturnPresenceToast state={state} presence={effectiveReturnPresence} phase={returnPresencePhase} /> : null}
        {__DEV__ && presenceTestActive ? (
          <>
            <PresenceDebugOverlay
              overrides={presenceTestOverrides}
              returnPhase={effectiveReturnPresence?.active ? returnPresencePhase : "complete"}
              idleElement={effectiveIdleElement}
              anticipationLevel={effectiveAnticipationLevel}
              returnLine={effectiveReturnPresence?.line ?? ""}
            />
            <PresenceVisualCue
              overrides={presenceTestOverrides}
              returnPhase={effectiveReturnPresence?.active ? returnPresencePhase : "complete"}
              idleElement={effectiveIdleElement}
              anticipationLevel={effectiveAnticipationLevel}
              returnLine={effectiveReturnPresence?.line ?? ""}
            />
          </>
        ) : null}
        {state.lastLoot && !effectiveReturnPresence?.active && shouldShowLootPopup(state.lastLoot) ? <LootPopup key={state.lastLoot.id} event={state.lastLoot} /> : null}

        {state.activeScreen === "den" ? <BottomNav
          activePanel={activePanel}
          onSelect={(panel) => {
            if (panel === "adventure") {
              dispatch({ type: "setScreen", screen: "adventure" });
              setActivePanel(null);
              return;
            }
            setActivePanel(panel);
            if (__DEV__ && state.guidedPlaytest.active && panel === "goals") {
              dispatch({ type: "completeGuidedPlaytestSteps", stepIds: ["openGoals"] });
            }
            if (__DEV__ && state.guidedPlaytest.active && panel === "rebirth") {
              dispatch({ type: "completeGuidedPlaytestSteps", stepIds: ["openRebirth"] });
            }
          }}
        /> : null}
        <PanelSheet title={getPanelTitle(activePanel)} visible={activePanel !== null} onClose={() => setActivePanel(null)}>
          {activePanel === "stats" ? <StatsPanelContent state={state} /> : null}
          {activePanel === "upgrades" ? (
            <UpgradesPanelContent
              state={state}
              canEvolve={canEvolve}
              evolutionCost={evolutionCost}
              sparkleUpgrade={sparkleUpgrade}
              onEvolve={evolveDragon}
              onBuyUpgrade={buyIdleUpgrade}
            />
          ) : null}
          {activePanel === "adventure" ? (
            <AdventurePanelContent
              state={state}
              onReturnToDen={() => {
                dispatch({ type: "setScreen", screen: "den" });
                setActivePanel(null);
              }}
              onEquipItem={(itemId) => dispatch({ type: "equipItem", itemId })}
              onSellItem={(itemId) => dispatch({ type: "sellItem", itemId })}
            />
          ) : null}
          {activePanel === "evolution" ? <EvolutionTreePreviewPanel currentElement={element} /> : null}
          {activePanel === "goals" ? (
            <GoalsPanelContent
              state={state}
              onClaimAchievement={(achievementId) => dispatch({ type: "claimAchievement", achievementId })}
              onClaimDaily={(goalId) => dispatch({ type: "claimDailyGoal", goalId })}
            />
          ) : null}
          {activePanel === "rebirth" ? <RebirthPanelContent state={state} onReincarnate={() => setShowReincarnationConfirm(true)} /> : null}
          {activePanel === "settings" ? (
            <SettingsPanelContent
              state={state}
              dispatch={dispatch}
              onResetSave={resetSave}
              presenceTestOverrides={presenceTestOverrides}
              onPresenceTestChange={setPresenceTestOverrides}
              artValidationMode={artValidationMode}
              onArtValidationModeChange={setArtValidationMode}
            />
          ) : null}
        </PanelSheet>
        {__DEV__ && state.guidedPlaytest.active ? <GuidedPlaytestOverlay state={state} dispatch={dispatch} /> : null}
        <EvolutionChoiceModal
          visible={showEvolutionChoices}
          element={element}
          onClose={() => setShowEvolutionChoices(false)}
          onChoose={chooseEvolutionTrait}
        />
        <ReincarnationConfirmModal
          visible={showReincarnationConfirm}
          state={state}
          onClose={() => setShowReincarnationConfirm(false)}
          onConfirm={reincarnate}
        />
        <OnboardingModal
          visible={shouldShowTutorialOverlay}
          stepIndex={tutorialStep}
          steps={onboardingSteps}
          onSkip={finishTutorial}
          onNext={() => {
            if (tutorialStep >= onboardingSteps.length - 1) {
              finishTutorial();
              return;
            }
            setTutorialStep((step) => step + 1);
          }}
        />
        <BalanceDebugPanel visible={showDebugPanel} state={state} onClose={() => setShowDebugPanel(false)} onResetSave={resetSave} />
        <DailyLoginRewardModal visible={shouldShowDailyLoginReward} state={state} onClaim={claimDailyLoginReward} />
        {shouldShowJourneyEventModal ? <JourneyEventModal state={state} dispatch={dispatch} /> : null}
      </DragonDisplay>
    </Animated.View>
  );
}

function getPanelTitle(panel: IdlePanelKey | null) {
  switch (panel) {
    case "stats":
      return "Stats";
    case "upgrades":
      return "Upgrades";
    case "adventure":
      return "Adventure";
    case "evolution":
      return "Evolution Path Preview";
    case "goals":
      return "Goals";
    case "rebirth":
      return "Rebirth";
    case "settings":
      return "Settings";
    default:
      return "";
  }
}

function getAutoCompletedGuidedStepIds(state: GameState) {
  const completed: string[] = ["freshSave"];
  const totalIdleUpgrades = idleUpgradeOrder.reduce((total, upgradeId) => total + (state.idleUpgrades[upgradeId] ?? 0), 0);
  const totalTreasures = treasureOrder.reduce((total, treasureId) => total + (state.treasures[treasureId] ?? 0), 0);
  const reachedDrake = state.dragon.stage === "drake" || state.dragon.stage === "dragon" || state.dragon.stage === "wyrm";

  if ((state.dailyGoals.completeAdventure1?.progress ?? 0) >= 1) {
    completed.push("completeAdventure");
  }
  if (totalIdleUpgrades > 0) {
    completed.push("buyFirstUpgrade");
  }
  if (state.dragon.element) {
    completed.push("chooseElement");
  }
  if ((state.dailyGoals.completeQuest5?.progress ?? 0) > 0 || idleQuestOrder.some((questId) => (state.idleQuestProgress[questId] ?? 0) > 0)) {
    completed.push("firstQuestAction");
  }
  if (state.autoBattle.defeatedCount > 0) {
    completed.push("defeatFirstEnemy");
  }
  if (totalTreasures > 0 || state.equipmentInventory.length > 0 || Object.keys(state.equippedItems).length > 0) {
    completed.push("firstLootDrop");
  }
  if (reachedDrake) {
    completed.push("reachDrake");
  }
  if (state.selectedEvolutionTraits.drake) {
    completed.push("chooseEvolutionBranch");
  }

  return completed;
}

function GuidedPlaytestOverlay({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  const completed = new Set(state.guidedPlaytest.completedStepIds);
  const completedCount = guidedPlaytestSteps.filter((step) => completed.has(step.id)).length;

  return (
    <View style={styles.guidedPlaytestOverlay}>
      <View style={styles.guidedPlaytestHeader}>
        <Text style={styles.guidedPlaytestTitle}>Guided Playtest</Text>
        <Text style={styles.guidedPlaytestProgress}>
          {completedCount}/{guidedPlaytestSteps.length}
        </Text>
      </View>
      <ScrollView style={styles.guidedPlaytestList} contentContainerStyle={styles.guidedPlaytestListContent}>
        {guidedPlaytestSteps.map((step, index) => {
          const isComplete = completed.has(step.id);
          return (
            <Pressable key={step.id} onPress={() => dispatch({ type: "toggleGuidedPlaytestStep", stepId: step.id })} style={styles.guidedPlaytestRow}>
              <Text style={[styles.guidedPlaytestCheck, isComplete && styles.guidedPlaytestCheckDone]}>{isComplete ? "✓" : "□"}</Text>
              <Text style={[styles.guidedPlaytestText, isComplete && styles.guidedPlaytestTextDone]}>
                {index + 1}. {step.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable onPress={() => dispatch({ type: "endGuidedPlaytest" })} style={styles.guidedPlaytestEndButton}>
        <Text style={styles.guidedPlaytestEndText}>End Playtest</Text>
      </Pressable>
    </View>
  );
}

function HudBar({ essence, souls, onLongPress }: { essence: string; souls: string; onLongPress?: () => void }) {
  return (
    <Pressable style={styles.hudBar} onLongPress={onLongPress} delayLongPress={850}>
      <StatPill icon="✦" label="Essence" value={essence} large />
      <StatPill icon="◆" label="Souls" value={souls} />
    </Pressable>
  );
}

function StatPill({ icon, label, value, large = false }: { icon?: string; label: string; value: number | string; large?: boolean }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillLabel}>{icon ? `${icon} ${label}` : label}</Text>
      <Text style={[styles.statPillValue, large && styles.statPillValueLarge]}>{value}</Text>
    </View>
  );
}

function BottomNav({ activePanel, onSelect }: { activePanel: IdlePanelKey | null; onSelect: (panel: IdlePanelKey) => void }) {
  const items: Array<{ key: IdlePanelKey; label: string; icon: string }> = [
    { key: "stats", label: "Stats", icon: "▣" },
    { key: "upgrades", label: "Train", icon: "⬆" },
    { key: "adventure", label: "Path", icon: "⚔" },
    { key: "evolution", label: "Evo", icon: "🐉" },
    { key: "goals", label: "Goals", icon: "★" },
    { key: "rebirth", label: "Soul", icon: "◆" },
    { key: "settings", label: "Gear", icon: "⚙" }
  ];
  return (
    <View style={styles.bottomNav}>
      {items.map((item) => (
        <Pressable key={item.key} onPress={() => onSelect(item.key)} style={[styles.bottomNavButton, activePanel === item.key && styles.bottomNavButtonActive]}>
          <Text style={[styles.bottomNavIcon, activePanel === item.key && styles.bottomNavTextActive]}>{item.icon}</Text>
          <Text style={[styles.bottomNavText, activePanel === item.key && styles.bottomNavTextActive]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function EvolutionTreePreviewPanel({ currentElement }: { currentElement: DragonElement }) {
  const [selectedEvolutionElement, setSelectedEvolutionElement] = useState<EvolutionPreviewElementId>(currentElement);
  const [selectedEvolutionStage, setSelectedEvolutionStage] = useState<EvolutionPreviewStageId>("drake");
  const element = getEvolutionPreviewElement(selectedEvolutionElement);
  const [selectedEvolutionBranch, setSelectedEvolutionBranch] = useState(element.branches[0]?.id ?? "");
  const branch = element.branches.find((candidate) => candidate.id === selectedEvolutionBranch) ?? element.branches[0];
  const previewOptions = getEvolutionPreviewOptionsForStage(branch, selectedEvolutionStage);
  const heroImage = previewOptions[0]?.image ?? branch.drakeImage;
  const contactSheet = selectedEvolutionStage === "drake" ? null : element.stageContactSheets[selectedEvolutionStage];

  const selectElement = (elementId: EvolutionPreviewElementId) => {
    const nextElement = getEvolutionPreviewElement(elementId);
    setSelectedEvolutionElement(elementId);
    setSelectedEvolutionBranch(nextElement.branches[0]?.id ?? "");
  };

  return (
    <View style={styles.evolutionPreviewPanel}>
      <Text style={styles.evolutionPreviewKicker}>Full art coverage</Text>
      <Text style={styles.evolutionPreviewTitle}>Evolution Path Preview</Text>
      <Text style={styles.panelMutedText}>
        Browse the full placeholder tree before the player commits: five starter fantasies, three Drake branches each, then Young Dragon, Dragon, and Ancient Dragon futures.
      </Text>

      <View style={styles.evolutionPreviewElementTabs}>
        {evolutionPreviewElements.map((previewElement) => (
          <Pressable
            key={previewElement.id}
            onPress={() => selectElement(previewElement.id)}
            style={[
              styles.evolutionPreviewElementTab,
              selectedEvolutionElement === previewElement.id && { borderColor: previewElement.secondary, backgroundColor: `${previewElement.primary}33` }
            ]}
          >
            <Text style={[styles.evolutionPreviewElementText, selectedEvolutionElement === previewElement.id && { color: previewElement.secondary }]}>{previewElement.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.evolutionPreviewStageTabs}>
        {evolutionPreviewStages.map((stage) => (
          <Pressable
            key={stage.id}
            onPress={() => setSelectedEvolutionStage(stage.id)}
            style={[styles.evolutionPreviewStageTab, selectedEvolutionStage === stage.id && { borderColor: element.secondary, backgroundColor: `${element.primary}30` }]}
          >
            <Text style={[styles.evolutionPreviewStageLabel, selectedEvolutionStage === stage.id && { color: element.secondary }]}>{stage.label}</Text>
            <Text style={styles.evolutionPreviewStageCaption}>{stage.caption}</Text>
          </Pressable>
        ))}
      </View>

      <LinearGradient colors={[`${element.primary}44`, "rgba(9,6,22,0.94)"]} style={styles.evolutionPreviewHeroCard}>
        <View style={styles.evolutionPreviewHeroCopy}>
          <Text style={[styles.evolutionPreviewHeroKicker, { color: element.secondary }]}>Build fantasy</Text>
          <Text style={styles.evolutionPreviewHeroTitle}>{element.label} {branch.label} Path</Text>
          <Text style={styles.evolutionPreviewHeroText}>{branch.buildFantasy}. {element.fantasy}</Text>
          <Text style={styles.evolutionPreviewHeroNote}>Representative placeholder: {previewOptions[0]?.label ?? `${branch.label} Drake`}</Text>
        </View>
        <SafeExpoImage source={heroImage} style={styles.evolutionPreviewHeroImage} contentFit="contain" />
      </LinearGradient>

      <Text style={styles.debugSectionLabel}>First big choice</Text>
      <View style={styles.evolutionPreviewBranchGrid}>
        {element.branches.map((candidate) => (
          <Pressable
            key={candidate.id}
            onPress={() => setSelectedEvolutionBranch(candidate.id)}
            style={[
              styles.evolutionPreviewBranchCard,
              selectedEvolutionBranch === candidate.id && { borderColor: element.secondary, backgroundColor: `${element.primary}24` }
            ]}
          >
            <SafeExpoImage source={candidate.drakeImage} style={styles.evolutionPreviewBranchImage} contentFit="contain" />
            <Text style={[styles.evolutionPreviewBranchName, selectedEvolutionBranch === candidate.id && { color: element.secondary }]}>{candidate.label}</Text>
            <Text style={styles.evolutionPreviewBranchFantasy}>{candidate.buildFantasy}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.evolutionPreviewOptionPanel}>
        <Text style={styles.evolutionPreviewOptionTitle}>{selectedEvolutionStage === "ancient" ? "Capstone futures" : `${evolutionPreviewStages.find((stage) => stage.id === selectedEvolutionStage)?.label ?? "Stage"} options`}</Text>
        <Text style={styles.panelMutedText}>{previewOptions.length} placeholders available for the selected branch at this tier.</Text>
        <View style={styles.evolutionPreviewOptionGrid}>
          {previewOptions.slice(0, selectedEvolutionStage === "ancient" ? 8 : 4).map((option) => (
            <EvolutionPreviewOptionTile key={option.id} option={option} accent={element.secondary} />
          ))}
        </View>
      </View>

      {contactSheet ? (
        <View style={styles.evolutionPreviewContactSheetPanel}>
          <Text style={styles.evolutionPreviewOptionTitle}>Full art coverage</Text>
          <Text style={styles.panelMutedText}>Element contact sheet for quick branch review at this stage.</Text>
          <SafeExpoImage source={contactSheet} style={styles.evolutionPreviewContactSheet} contentFit="contain" />
        </View>
      ) : null}
    </View>
  );
}

function getEvolutionPreviewOptionsForStage(branch: { drakeImage: ImageSourcePropType; label: string; youngOptions: EvolutionPreviewOption[]; dragonOptions: EvolutionPreviewOption[]; ancientOptions: EvolutionPreviewOption[] }, stage: EvolutionPreviewStageId): EvolutionPreviewOption[] {
  if (stage === "drake") {
    return [{ id: `${branch.label.toLowerCase()}-drake`, label: `${branch.label} Drake`, image: branch.drakeImage }];
  }
  if (stage === "young") {
    return branch.youngOptions;
  }
  if (stage === "dragon") {
    return branch.dragonOptions;
  }
  return branch.ancientOptions;
}

function EvolutionPreviewOptionTile({ option, accent }: { option: EvolutionPreviewOption; accent: string }) {
  return (
    <View style={[styles.evolutionPreviewOptionTile, { borderColor: `${accent}66` }]}>
      <SafeExpoImage source={option.image} style={styles.evolutionPreviewOptionImage} contentFit="contain" />
      <Text style={styles.evolutionPreviewOptionLabel}>{option.label}</Text>
    </View>
  );
}

function PanelSheet({ title, visible, onClose, children }: { title: string; visible: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetScrim}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={styles.panelSheet}>
          <View style={styles.panelSheetHandle} />
          <View style={styles.panelSheetHeader}>
            <Text style={styles.panelSheetTitle}>{title}</Text>
            <Pressable onPress={onClose} style={styles.panelCloseButton}>
              <Text style={styles.panelCloseText}>Close</Text>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.panelSheetContent}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionCardTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionCardSubtitle}>{subtitle}</Text> : null}
      <View style={styles.sectionCardBody}>{children}</View>
    </View>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateDetail}>{detail}</Text>
    </View>
  );
}

function OnboardingModal({
  visible,
  stepIndex,
  steps,
  onSkip,
  onNext
}: {
  visible: boolean;
  stepIndex: number;
  steps: string[];
  onSkip: () => void;
  onNext: () => void;
}) {
  const isLastStep = stepIndex >= steps.length - 1;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.modalScrim}>
        <View style={styles.onboardingCard}>
          <Text style={styles.choiceNumber}>Dragon Basics</Text>
          <Text style={styles.onboardingTitle}>Step {stepIndex + 1}</Text>
          <Text style={styles.onboardingText}>{steps[stepIndex]}</Text>
          <View style={styles.onboardingDots}>
            {steps.map((_, index) => (
              <View key={index} style={[styles.onboardingDot, index === stepIndex && styles.onboardingDotActive]} />
            ))}
          </View>
          <View style={styles.modalButtonRow}>
            <Pressable onPress={onSkip} style={styles.modalSecondaryButton}>
              <Text style={styles.modalCancelText}>Skip</Text>
            </Pressable>
            <Pressable onPress={onNext} style={styles.modalPrimaryButton}>
              <Text style={styles.primaryPanelButtonText}>{isLastStep ? "Done" : "Next"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function BalanceDebugPanel({
  visible,
  state,
  onClose,
  onResetSave
}: {
  visible: boolean;
  state: GameState;
  onClose: () => void;
  onResetSave: () => void;
}) {
  const numberFormat = state.settings.numberFormat;
  const rows = [
    { label: "Completed runs", value: `${state.completedAdventureRuns ?? 0}` },
    { label: "Loot tier", value: `${(state.completedAdventureRuns ?? 0) * 2}` },
    { label: "Quest reward multiplier", value: formatMultiplier(getQuestRewardMultiplier(state)) },
    { label: "Battle damage", value: `${formatGameNumber(getBattleDamage(state), numberFormat)}` },
    { label: "Treasure drop chance", value: formatPercent(getTreasureDropChance(state)) },
    { label: "Upgrade cost multiplier", value: formatMultiplier(getUpgradeCostMultiplier(state)) },
    { label: "Offline reward multiplier", value: formatMultiplier(getOfflineRewardMultiplier(state)) },
    { label: "Evolution progress", value: formatPercent(getEvolutionProgressRatio(state)) }
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetScrim}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={styles.panelSheet}>
          <View style={styles.panelSheetHandle} />
          <View style={styles.panelSheetHeader}>
            <Text style={styles.panelSheetTitle}>Balance Debug</Text>
            <Pressable onPress={onClose} style={styles.panelCloseButton}>
              <Text style={styles.panelCloseText}>Close</Text>
            </Pressable>
          </View>
          <View style={styles.debugRows}>
            {rows.map((row) => (
              <View key={row.label} style={styles.debugRow}>
                <Text style={styles.debugLabel}>{row.label}</Text>
                <Text style={styles.debugValue}>{row.value}</Text>
              </View>
            ))}
          </View>
          <Pressable onPress={onResetSave} style={styles.debugResetButton}>
            <Text style={styles.debugResetText}>Reset Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function SettingsPanelContent({
  state,
  dispatch,
  onResetSave,
  presenceTestOverrides,
  onPresenceTestChange,
  artValidationMode,
  onArtValidationModeChange
}: {
  state: GameState;
  dispatch: (action: GameAction) => void;
  onResetSave: () => void;
  presenceTestOverrides: PresenceTestOverrides;
  onPresenceTestChange: (overrides: PresenceTestOverrides | ((current: PresenceTestOverrides) => PresenceTestOverrides)) => void;
  artValidationMode: ArtValidationMode;
  onArtValidationModeChange: (mode: ArtValidationMode | ((current: ArtValidationMode) => ArtValidationMode)) => void;
}) {
  const [exportText, setExportText] = useState(() => JSON.stringify(state, null, 2));
  const [balanceSnapshotText, setBalanceSnapshotText] = useState("");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [hatchlingReviewVisible, setHatchlingReviewVisible] = useState(false);
  const [hatchlingReviewInitialElement, setHatchlingReviewInitialElement] = useState<DragonElement>("fire");

  const updateSettings = (settings: Partial<GameSettings>) => dispatch({ type: "updateSettings", settings });
  const actualEvolutionProgress = getEvolutionProgressRatio(state);
  const displayedAnticipationLevel =
    presenceTestOverrides.anticipationLevel ??
    (actualEvolutionProgress >= BALANCE.softProgressionAssist.excitementThreshold ? "excited" : actualEvolutionProgress >= BALANCE.softProgressionAssist.rewardAssistThreshold ? "alert" : "calm");
  const displayedPresence = state.returnPresence.active ? state.returnPresence : presenceTestOverrides.returnPresence;
  const displayedIdleElement = presenceTestOverrides.idleElement ?? state.dragon.element ?? "fire";
  const displayedEvolutionProgress = presenceTestOverrides.anticipationLevel === "excited" ? 0.95 : presenceTestOverrides.anticipationLevel === "alert" ? 0.8 : actualEvolutionProgress;

  const simulateReturn = (awayDurationMs: number) => {
    const offlineReward = Math.max(1, getOfflineEssenceReward(state, awayDurationMs));
    onPresenceTestChange((current) => ({
      ...current,
      returnPresence: {
        active: true,
        startedAt: Date.now(),
        awayDurationMs,
        line: awayDurationMs >= 60 * 60 * 1000 ? "Look what I found!" : "I missed you.",
        offlineReward,
        pendingOfflineReward: 0,
        rewardApplied: false,
        lastSaveDateBefore: Date.now() - awayDurationMs,
        lastSaveDateAfter: null
      }
    }));
  };
  const openHatchlingReview = (initialElement: DragonElement = "fire") => {
    setHatchlingReviewInitialElement(initialElement);
    setHatchlingReviewVisible(true);
  };

  const importBackup = () => {
    try {
      const parsed = JSON.parse(importText) as unknown;
      if (!isValidBackupState(parsed)) {
        setImportError("Backup must include dragon, player, and saved progress fields.");
        return;
      }
      Alert.alert("Import backup?", "This replaces the current local save with the pasted backup.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: () => {
            setImportError(null);
            dispatch({ type: "hydrate", state: parsed });
          }
        }
      ]);
    } catch {
      setImportError("Backup JSON is not valid.");
    }
  };

  return (
    <>
      <SectionCard title="App Info" subtitle={`Version ${APP_VERSION}`}>
        <Text style={styles.panelMutedText}>Closed test build preparation. Settings and save tools are available here for QA.</Text>
      </SectionCard>

      <SectionCard title="Feedback">
        <SettingToggle
          title="Haptics"
          detail="Controls vibration feedback throughout the game."
          enabled={state.settings.hapticsEnabled}
          onToggle={() => updateSettings({ hapticsEnabled: !state.settings.hapticsEnabled })}
        />
        <SettingToggle
          title="Reduced Motion"
          detail="Disables shake, pulse, particles, and heavier animations."
          enabled={state.settings.reducedMotion}
          onToggle={() => updateSettings({ reducedMotion: !state.settings.reducedMotion })}
        />
      </SectionCard>

      <SectionCard title="Numbers" subtitle="Choose compact or full values">
        <View style={styles.segmentedControl}>
          {(["compact", "full"] as const).map((format) => (
            <Pressable
              key={format}
              onPress={() => updateSettings({ numberFormat: format })}
              style={[styles.segmentButton, state.settings.numberFormat === format && styles.segmentButtonActive]}
            >
              <Text style={[styles.segmentButtonText, state.settings.numberFormat === format && styles.bottomNavTextActive]}>{format.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </SectionCard>

      {__DEV__ ? (
        <>
          <SectionCard title="Hatchling Emotional Review" subtitle="Dev-only art approval tools">
            <Text style={styles.panelMutedText}>Use this screen to validate emotional readability, silhouette clarity, and attachment feel on a real phone.</Text>
            <View style={styles.presenceTestGrid}>
              <Pressable onPress={() => openHatchlingReview()} style={styles.primaryPanelButton}>
                <Text style={styles.primaryPanelButtonText}>Open Hatchling Review</Text>
              </Pressable>
              <Pressable
                onPress={() => onArtValidationModeChange((current) => ({ ...current, enabled: !current.enabled }))}
                style={artValidationMode.enabled ? styles.dangerButton : styles.presenceTestButton}
              >
                <Text style={artValidationMode.enabled ? styles.dangerButtonText : styles.primaryPanelButtonText}>Toggle Art Validation Mode</Text>
              </Pressable>
              {(["fire", "water", "earth"] as DragonElement[]).map((previewElement) => (
                <Pressable key={previewElement} onPress={() => openHatchlingReview(previewElement)} style={styles.presenceTestButton}>
                  <Text style={styles.primaryPanelButtonText}>Quick {previewElement[0].toUpperCase() + previewElement.slice(1)} Preview</Text>
                </Pressable>
              ))}
            </View>
          </SectionCard>
          <DrakeContinuityReviewPanel reducedMotion={state.settings.reducedMotion} />
          <SectionCard title="Emotional Presence Test" subtitle="Dev-only companion feel checks">
            <Text style={styles.panelMutedText}>Visual-only tests check animation/lines. Reward tests also apply offline essence.</Text>
            <View style={styles.debugRows}>
              <View style={styles.debugRow}>
                <Text style={styles.debugLabel}>Away duration</Text>
                <Text style={styles.debugValue}>{displayedPresence ? `${Math.round(displayedPresence.awayDurationMs / 60000)} min` : "None"}</Text>
              </View>
              <View style={styles.debugRow}>
                <Text style={styles.debugLabel}>Return line</Text>
                <Text style={styles.debugValue}>{displayedPresence?.line || "None"}</Text>
              </View>
              <View style={styles.debugRow}>
                <Text style={styles.debugLabel}>Idle behavior profile</Text>
                <Text style={styles.debugValue}>{displayedIdleElement}</Text>
              </View>
              <View style={styles.debugRow}>
                <Text style={styles.debugLabel}>Evolution progress</Text>
                <Text style={styles.debugValue}>{formatPercent(displayedEvolutionProgress)}</Text>
              </View>
              <View style={styles.debugRow}>
                <Text style={styles.debugLabel}>Anticipation tier</Text>
                <Text style={styles.debugValue}>{displayedAnticipationLevel}</Text>
              </View>
            </View>
            <View style={styles.presenceTestGrid}>
              <Pressable onPress={() => simulateReturn(10 * 60 * 1000)} style={styles.presenceTestButton}>
                <Text style={styles.primaryPanelButtonText}>Visual only: 10-minute return</Text>
              </Pressable>
              <Pressable onPress={() => simulateReturn(60 * 60 * 1000)} style={styles.presenceTestButton}>
                <Text style={styles.primaryPanelButtonText}>Visual only: 1-hour return</Text>
              </Pressable>
              <Pressable onPress={() => dispatch({ type: "startReturnPresenceTest", awayDurationMs: 10 * 60 * 1000, withRewards: true })} style={styles.presenceTestButton}>
                <Text style={styles.primaryPanelButtonText}>Test: 10-minute return + rewards</Text>
              </Pressable>
              <Pressable onPress={() => dispatch({ type: "startReturnPresenceTest", awayDurationMs: 60 * 60 * 1000, withRewards: true })} style={styles.presenceTestButton}>
                <Text style={styles.primaryPanelButtonText}>Test: 1-hour return + rewards</Text>
              </Pressable>
              {(["fire", "water", "earth"] as DragonElement[]).map((forcedElement) => (
                <Pressable key={forcedElement} onPress={() => onPresenceTestChange((current) => ({ ...current, idleElement: forcedElement, returnPresence: null }))} style={styles.presenceTestButton}>
                  <Text style={styles.primaryPanelButtonText}>Force {forcedElement[0].toUpperCase() + forcedElement.slice(1)} idle behavior</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => onPresenceTestChange((current) => ({ ...current, anticipationLevel: "alert", returnPresence: null }))} style={styles.presenceTestButton}>
                <Text style={styles.primaryPanelButtonText}>Force 80% evolution anticipation</Text>
              </Pressable>
              <Pressable onPress={() => onPresenceTestChange((current) => ({ ...current, anticipationLevel: "excited", returnPresence: null }))} style={styles.presenceTestButton}>
                <Text style={styles.primaryPanelButtonText}>Force 95% evolution anticipation</Text>
              </Pressable>
              <Pressable onPress={() => onPresenceTestChange({ idleElement: null, anticipationLevel: null, returnPresence: null })} style={styles.dangerButton}>
                <Text style={styles.dangerButtonText}>Reset presence test overrides</Text>
              </Pressable>
            </View>
          </SectionCard>
          <SectionCard title="Art Validation Mode" subtitle="Dev-only hatchling readability checks">
            <Text style={styles.panelMutedText}>
              Toggle realistic stress tests for the main dragon view without changing gameplay.
            </Text>
            <View style={styles.presenceTestGrid}>
              <Pressable
                onPress={() => onArtValidationModeChange((current) => ({ ...current, enabled: !current.enabled }))}
                style={artValidationMode.enabled ? styles.dangerButton : styles.primaryPanelButton}
              >
                <Text style={artValidationMode.enabled ? styles.dangerButtonText : styles.primaryPanelButtonText}>
                  {artValidationMode.enabled ? "Disable Art Validation Mode" : "Enable Art Validation Mode"}
                </Text>
              </Pressable>
              <DevToggleButton
                label={artValidationMode.sizeMode === "thumbnail" ? "128px thumbnail mode" : "Normal gameplay size"}
                active={artValidationMode.sizeMode === "thumbnail"}
                onPress={() => onArtValidationModeChange((current) => ({ ...current, sizeMode: current.sizeMode === "thumbnail" ? "normal" : "thumbnail" }))}
              />
              <DevToggleButton
                label="Grayscale mode"
                active={artValidationMode.grayscale}
                onPress={() => onArtValidationModeChange((current) => ({ ...current, grayscale: !current.grayscale }))}
              />
              <DevToggleButton
                label="Disable aura FX"
                active={artValidationMode.disableAura}
                onPress={() => onArtValidationModeChange((current) => ({ ...current, disableAura: !current.disableAura }))}
              />
              <Pressable
                onPress={() => onArtValidationModeChange((current) => ({ ...current, freezeIdle: !current.freezeIdle }))}
                style={artValidationMode.freezeIdle ? styles.dangerButton : styles.presenceTestButton}
              >
                <Text style={artValidationMode.freezeIdle ? styles.dangerButtonText : styles.primaryPanelButtonText}>
                  {artValidationMode.freezeIdle ? "Unfreeze idle animation" : "Freeze idle animation"}
                </Text>
              </Pressable>
              <DevToggleButton
                label="Low brightness simulation overlay"
                active={artValidationMode.lowBrightness}
                onPress={() => onArtValidationModeChange((current) => ({ ...current, lowBrightness: !current.lowBrightness }))}
              />
              <DevToggleButton
                label={artValidationMode.hudVisible ? "HUD visible" : "HUD hidden"}
                active={!artValidationMode.hudVisible}
                onPress={() => onArtValidationModeChange((current) => ({ ...current, hudVisible: !current.hudVisible }))}
              />
              <Text style={styles.debugSectionLabel}>Background cycle</Text>
              {(Object.keys(artValidationBackgrounds) as ArtValidationBackgroundKey[]).map((backgroundKey) => (
                <Pressable
                  key={backgroundKey}
                  onPress={() => onArtValidationModeChange((current) => ({ ...current, backgroundKey }))}
                  style={artValidationMode.backgroundKey === backgroundKey ? styles.dangerButton : styles.presenceTestButton}
                >
                  <Text style={artValidationMode.backgroundKey === backgroundKey ? styles.dangerButtonText : styles.primaryPanelButtonText}>
                    {artValidationBackgrounds[backgroundKey].label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </SectionCard>
          <HatchlingReviewModal
            visible={hatchlingReviewVisible}
            initialElement={hatchlingReviewInitialElement}
            reducedMotion={state.settings.reducedMotion}
            onClose={() => setHatchlingReviewVisible(false)}
          />
          <SectionCard title="Guided Playtest" subtitle="Dev-only structured test flow">
            <Pressable
              onPress={() => dispatch({ type: state.guidedPlaytest.active ? "endGuidedPlaytest" : "startGuidedPlaytest" })}
              style={state.guidedPlaytest.active ? styles.dangerButton : styles.primaryPanelButton}
            >
              <Text style={state.guidedPlaytest.active ? styles.dangerButtonText : styles.primaryPanelButtonText}>
                {state.guidedPlaytest.active ? "End Guided Playtest" : "Start Guided Playtest"}
              </Text>
            </Pressable>
            <Text style={styles.panelMutedText}>
              {state.guidedPlaytest.active
                ? `${state.guidedPlaytest.completedStepIds.length}/${guidedPlaytestSteps.length} steps completed.`
                : "Starts a small overlay checklist that can auto-complete common QA milestones."}
            </Text>
          </SectionCard>
          <SectionCard title="Playtest Notes" subtitle="Dev-only tester feedback capture">
            <PlaytestNotesPanel state={state} dispatch={dispatch} />
          </SectionCard>
          <SectionCard title="Balance Snapshot" subtitle="Dev-only JSON for ChatGPT review">
            <Pressable onPress={() => setBalanceSnapshotText(createBalanceSnapshotExport(state))} style={styles.primaryPanelButton}>
              <Text style={styles.primaryPanelButtonText}>Export Balance Snapshot</Text>
            </Pressable>
            <TextInput
              value={balanceSnapshotText}
              editable={false}
              multiline
              placeholder="Tap export to generate a balance review snapshot."
              placeholderTextColor={uiTheme.colors.faint}
              style={styles.backupTextInput}
            />
          </SectionCard>
          <SectionCard title="Test Checklist" subtitle="Temporary QA and balance pass">
            <TestChecklist />
          </SectionCard>
        </>
      ) : null}

      <SectionCard title="Backup Export" subtitle="JSON text for manual backup">
        <Pressable onPress={() => setExportText(JSON.stringify(state, null, 2))} style={styles.primaryPanelButton}>
          <Text style={styles.primaryPanelButtonText}>Refresh Export</Text>
        </Pressable>
        <TextInput value={exportText} editable={false} multiline style={styles.backupTextInput} />
      </SectionCard>

      <SectionCard title="Backup Import" subtitle="Paste a JSON backup to restore">
        <TextInput
          value={importText}
          onChangeText={(text) => {
            setImportText(text);
            setImportError(null);
          }}
          multiline
          placeholder="Paste backup JSON here"
          placeholderTextColor={uiTheme.colors.faint}
          style={styles.backupTextInput}
        />
        {importError ? <Text style={styles.importErrorText}>{importError}</Text> : null}
        <Pressable onPress={importBackup} style={styles.primaryPanelButton}>
          <Text style={styles.primaryPanelButtonText}>Import Backup</Text>
        </Pressable>
      </SectionCard>

      <SectionCard title="Danger Zone" subtitle="Irreversible local save tools">
        <Text style={styles.panelMutedText}>Resetting clears local progress and returns to the egg. Export a backup first if you want to keep this save.</Text>
        <Pressable onPress={onResetSave} style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>Reset Save</Text>
        </Pressable>
      </SectionCard>

      <SectionCard title="Credits">
        <Text style={styles.panelMutedText}>Isekai Dragons prototype. Built with Expo, React Native, generated 2D fantasy assets, and Lottie-ready effect hooks.</Text>
      </SectionCard>
    </>
  );
}

function TestChecklist() {
  const items = [
    "New save flow",
    "Adventure loot progression works",
    "Upgrades buy correctly",
    "Fire/Water/Earth bonuses apply",
    "Evolution branch modal works",
    "Quest timer works",
    "Battles spawn/defeat enemies",
    "Treasures and equipment drop",
    "Daily goals reset correctly",
    "Reincarnation reset preserves intended data",
    "Import/export works"
  ];

  return (
    <View style={styles.testChecklist}>
      {items.map((item) => (
        <View key={item} style={styles.testChecklistRow}>
          <Text style={styles.testChecklistBox}>□</Text>
          <Text style={styles.panelMutedText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function createBalanceSnapshotExport(state: GameState) {
  const totalIdleUpgradeLevels = idleUpgradeOrder.reduce((total, upgradeId) => total + (state.idleUpgrades[upgradeId] ?? 0), 0);
  const totalTreasures = treasureOrder.reduce((total, treasureId) => total + (state.treasures[treasureId] ?? 0), 0);
  const equippedItems = Object.values(state.equippedItems).filter(Boolean);
  const completedGuidedSteps = new Set(state.guidedPlaytest.completedStepIds);

  const snapshot = {
    purpose: "Isekai Dragons balance snapshot for ChatGPT review",
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    saveSummary: {
      phase: state.phase,
      stage: state.dragon.stage,
      element: state.dragon.element,
      level: state.dragon.level,
      essence: state.player.essence,
      lifetimeEssence: state.lifetimeEssence,
      dragonSouls: state.dragonSouls,
      totalReincarnations: state.totalReincarnations,
      currentArea: state.currentArea,
      currentAreaName: areaDefinitions[state.currentArea].name,
      defeatedCount: state.autoBattle.defeatedCount,
      currentEnemy: state.autoBattle.enemyName,
      enemyHp: state.autoBattle.enemyHp,
      enemyMaxHp: state.autoBattle.enemyMaxHp,
      totalIdleUpgradeLevels,
      totalTreasures,
      equipmentInventoryCount: state.equipmentInventory.length,
      equippedItemCount: equippedItems.length,
      selectedEvolutionTraits: state.selectedEvolutionTraits,
      dailyGoals: state.dailyGoals,
      loginStreakDay: state.loginStreakDay
    },
    calculatedValues: {
      completedAdventureRuns: state.completedAdventureRuns ?? 0,
      adventureCompletions: state.adventureCompletions,
      questRewardMultiplier: getQuestRewardMultiplier(state),
      battleDamage: getBattleDamage(state),
      battleRewardEssence: getBattleRewardEssence(state),
      dragonPower: getDragonPower(state),
      treasureDropChance: getTreasureDropChance(state),
      upgradeCostMultiplier: getUpgradeCostMultiplier(state),
      offlineRewardMultiplier: getOfflineRewardMultiplier(state),
      nextEvolutionCost: getNextEvolutionCost(state.dragon.stage),
      reincarnationSoulsGainedNow: getReincarnationSoulsGained(state)
    },
    balanceValues: BALANCE,
    saveTiming: {
      lastSavedAt: state.lastSavedAt,
      lastSavedAtIso: new Date(state.lastSavedAt).toISOString(),
      timeSinceSaveStartMs: state.guidedPlaytest.startedAt ? Date.now() - state.guidedPlaytest.startedAt : null,
      timeSinceSaveStartNote: state.guidedPlaytest.startedAt ? "Using guided playtest start time." : "Save start time is not available for this save."
    },
    guidedPlaytest: {
      active: state.guidedPlaytest.active,
      startedAt: state.guidedPlaytest.startedAt,
      completedStepIds: state.guidedPlaytest.completedStepIds,
      checklist: guidedPlaytestSteps.map((step) => ({
        ...step,
        completed: completedGuidedSteps.has(step.id)
      }))
    },
    playtestNotes: state.playtestNotes
  };

  return JSON.stringify(snapshot, null, 2);
}

const hatchlingReviewChecklist = [
  "Element readable instantly",
  "Personality readable instantly",
  "Eyes readable during motion",
  "Silhouette survives grayscale",
  "Reads at 128px",
  "Aura does not obscure face",
  "Idle motion feels alive",
  "Emotionally appealing",
  "Feels like a companion"
];

const drakeContinuityChecklist = [
  "Same companion recognizable",
  "Dominant silhouette preserved",
  "Emotional personality preserved",
  "Feels like same companion grown up",
  "Evolution feels emotional",
  "Drake feels more mature",
  "Hatchling charm preserved",
  "Growth/maturity readable",
  "Reads at phone size",
  "Works in grayscale",
  "“Aww, they grew up.”"
];

function DevToggleButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={active ? styles.dangerButton : styles.presenceTestButton}>
      <Text style={active ? styles.dangerButtonText : styles.primaryPanelButtonText}>{label}</Text>
    </Pressable>
  );
}

function HatchlingReviewModal({
  visible,
  initialElement,
  reducedMotion,
  onClose
}: {
  visible: boolean;
  initialElement: DragonElement;
  reducedMotion: boolean;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const [grayscale, setGrayscale] = useState(false);
  const [thumbnail, setThumbnail] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [regenNotes, setRegenNotes] = useState<Record<DragonElement, string>>({
    fire: "",
    water: "",
    earth: "",
    light: "",
    dark: ""
  });
  const reviewValidationMode: ArtValidationMode = {
    ...defaultArtValidationMode,
    enabled: true,
    sizeMode: thumbnail ? "thumbnail" : "normal",
    grayscale,
    hudVisible: false
  };
  const toggleCheck = (id: string) => setCheckedItems((current) => ({ ...current, [id]: !current[id] }));
  const focusWidth = Math.max(280, width - 32);
  const initialIndex = (["fire", "water", "earth"] as DragonElement[]).indexOf(initialElement);
  const initialOffset = Math.max(0, initialIndex) * focusWidth;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.hatchlingReviewModal}>
        <View style={styles.hatchlingReviewHeader}>
          <View style={styles.hatchlingReviewHeaderText}>
            <Text style={styles.hatchlingReviewModalTitle}>Hatchling Emotional Review</Text>
            <Text style={styles.hatchlingApprovalLabel}>Production Approved • {HATCHLING_ART_VERSION}</Text>
            <Text style={styles.panelMutedText}>Use this screen to validate emotional readability, silhouette clarity, and attachment feel on a real phone.</Text>
          </View>
          <Pressable onPress={onClose} style={styles.hatchlingReviewExitButton}>
            <Text style={styles.hatchlingReviewExitText}>EXIT</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.hatchlingReviewModalContent}>
          <View style={styles.reviewToggleRow}>
            <DevToggleButton label={grayscale ? "Grayscale on" : "Normal color mode"} active={grayscale} onPress={() => setGrayscale((value) => !value)} />
            <DevToggleButton label={thumbnail ? "128px preview on" : "Gameplay size preview"} active={thumbnail} onPress={() => setThumbnail((value) => !value)} />
          </View>
          <Text style={styles.debugSectionLabel}>Swipe focus view</Text>
          <ScrollView
            key={`${initialElement}-${focusWidth}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: initialOffset, y: 0 }}
          >
            {(["fire", "water", "earth"] as DragonElement[]).map((reviewElement) => {
              const theme = elementTheme[reviewElement];
              return (
                <View key={reviewElement} style={[styles.hatchlingFocusCard, { width: focusWidth }]}>
                  <Text style={[styles.hatchlingReviewModalTitle, { color: theme.secondary }]}>{theme.label}</Text>
                  <Text style={styles.panelMutedText}>{getHatchlingReviewPrompt(reviewElement)}</Text>
                  <View style={styles.hatchlingFocusDisplayWrap}>
                    <DragonDisplay
                      element={reviewElement}
                      dragonSource={getDragonStageImage("hatchling", reviewElement)}
                      backgroundSource={artValidationBackgrounds.mysticMeadow.source}
                      reducedMotion={reducedMotion}
                      behaviorElement={reviewElement}
                      artValidationMode={reviewValidationMode}
                      compact
                    />
                  </View>
                  <TextInput
                    value={regenNotes[reviewElement]}
                    onChangeText={(text) => setRegenNotes((current) => ({ ...current, [reviewElement]: text }))}
                    placeholder="Quick regen notes: eyes too small, aura too bright..."
                    placeholderTextColor="#8f84b5"
                    multiline
                    style={styles.hatchlingReviewNotes}
                  />
                </View>
              );
            })}
          </ScrollView>
          <Text style={styles.debugSectionLabel}>Side-by-side comparison</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hatchlingReviewRow}>
            {(["fire", "water", "earth"] as DragonElement[]).map((reviewElement) => {
              const theme = elementTheme[reviewElement];
              return (
                <View key={reviewElement} style={styles.hatchlingReviewCard}>
                  <Text style={[styles.hatchlingReviewTitle, { color: theme.secondary }]}>{theme.label}</Text>
                  <View style={styles.hatchlingReviewDisplayWrap}>
                    <DragonDisplay
                      element={reviewElement}
                      dragonSource={getDragonStageImage("hatchling", reviewElement)}
                      backgroundSource={artValidationBackgrounds.mysticMeadow.source}
                      reducedMotion={reducedMotion}
                      behaviorElement={reviewElement}
                      artValidationMode={reviewValidationMode}
                      compact
                    />
                  </View>
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.reviewChecklist}>
            {(["fire", "water", "earth"] as DragonElement[]).map((reviewElement) => (
              <View key={reviewElement} style={styles.reviewChecklistGroup}>
                <Text style={styles.debugSectionLabel}>{elementTheme[reviewElement].label}</Text>
                {hatchlingReviewChecklist.map((item) => {
                  const id = `${reviewElement}-${item}`;
                  return (
                    <Pressable key={id} onPress={() => toggleCheck(id)} style={styles.reviewCheckRow}>
                      <Text style={styles.reviewCheckMark}>{checkedItems[id] ? "x" : "□"}</Text>
                      <Text style={styles.reviewCheckText}>{item}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
            <Pressable onPress={() => toggleCheck("overall-check-later")} style={styles.reviewCheckRow}>
              <Text style={styles.reviewCheckMark}>{checkedItems["overall-check-later"] ? "x" : "□"}</Text>
              <Text style={styles.reviewCheckText}>“I want to check on this dragon later.”</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function getHatchlingReviewPrompt(element: DragonElement) {
  if (element === "fire") {
    return "Check chaotic-gremlin charm, horn silhouette, eye readability, and whether the pose feels mischievous rather than aggressive.";
  }
  if (element === "water") {
    return "Check sleepy companion appeal, fin silhouette, soft eye read, and whether the shape survives grayscale.";
  }
  return "Check cozy guardian warmth, crystal shoulder clarity, sturdy silhouette, and whether details stay simple at phone size.";
}

function DrakeContinuityReviewPanel({ reducedMotion }: { reducedMotion: boolean }) {
  const [grayscale, setGrayscale] = useState(false);
  const [thumbnail, setThumbnail] = useState(false);
  const [auraOff, setAuraOff] = useState(true);
  const [freezeIdle, setFreezeIdle] = useState(false);
  const [previewElement, setPreviewElement] = useState<DragonElement>("fire");
  const [previewStage, setPreviewStage] = useState<"hatchling" | "drake">("hatchling");
  const [previewPhase, setPreviewPhase] = useState<EvolutionMomentPhase>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const reviewValidationMode: ArtValidationMode = {
    ...defaultArtValidationMode,
    enabled: true,
    sizeMode: thumbnail ? "thumbnail" : "normal",
    grayscale,
    disableAura: auraOff,
    freezeIdle,
    hudVisible: false
  };
  const toggleCheck = (id: string) => setCheckedItems((current) => ({ ...current, [id]: !current[id] }));
  const testEvolutionPreview = () => {
    setPreviewStage("hatchling");
    setPreviewPhase("glow");
    setTimeout(() => setPreviewPhase("silhouette"), 700);
    setTimeout(() => {
      setPreviewStage("drake");
      setPreviewPhase("reveal");
    }, 1250);
    setTimeout(() => setPreviewPhase(null), 2800);
  };

  return (
    <SectionCard title="Drake Continuity Review" subtitle="Concept-only: not production integrated">
      <Text style={styles.panelMutedText}>Validate whether each Drake feels like the same companion grown up, not a redesigned monster. Do not generate Dragons or Wyrms until this passes.</Text>
      <View style={styles.reviewToggleRow}>
        <DevToggleButton label={thumbnail ? "128px preview on" : "Gameplay size preview"} active={thumbnail} onPress={() => setThumbnail((value) => !value)} />
        <DevToggleButton label={grayscale ? "Grayscale on" : "Normal color mode"} active={grayscale} onPress={() => setGrayscale((value) => !value)} />
        <DevToggleButton label={auraOff ? "Aura off" : "Aura on"} active={auraOff} onPress={() => setAuraOff((value) => !value)} />
        <DevToggleButton label={freezeIdle ? "Idle frozen" : "Idle moving"} active={freezeIdle} onPress={() => setFreezeIdle((value) => !value)} />
      </View>
      <View style={styles.drakeContinuityBlock}>
        <Text style={styles.debugSectionLabel}>Integrated Gameplay Preview</Text>
        <Text style={styles.panelMutedText}>Test anticipation to evolve to post-evolve idle in the same visual context as gameplay.</Text>
        <View style={styles.reviewToggleRow}>
          {(["fire", "water", "earth"] as DragonElement[]).map((elementOption) => (
            <DevToggleButton key={elementOption} label={elementOption[0].toUpperCase() + elementOption.slice(1)} active={previewElement === elementOption} onPress={() => setPreviewElement(elementOption)} />
          ))}
          <Pressable onPress={testEvolutionPreview} style={styles.primaryPanelButton}>
            <Text style={styles.primaryPanelButtonText}>Test Evolution Transition</Text>
          </Pressable>
        </View>
        <View style={styles.hatchlingFocusDisplayWrap}>
          <DragonDisplay
            element={previewElement}
            dragonSource={previewStage === "hatchling" ? getDragonStageImage("hatchling", previewElement) : drakeImages[previewElement]}
            backgroundSource={artValidationBackgrounds.mysticMeadow.source}
            reducedMotion={reducedMotion}
            behaviorElement={previewElement}
            dragonStage={previewStage}
            anticipationLevel={previewStage === "hatchling" ? "excited" : "calm"}
            evolutionMomentPhase={previewPhase}
            artValidationMode={reviewValidationMode}
            compact
          />
        </View>
      </View>
      {(["fire", "water", "earth"] as DragonElement[]).map((reviewElement) => {
        const theme = elementTheme[reviewElement];
        return (
          <View key={reviewElement} style={styles.drakeContinuityBlock}>
            <Text style={[styles.hatchlingReviewTitle, { color: theme.secondary }]}>{theme.label}: Hatchling {">"} Drake</Text>
            <Text style={styles.panelMutedText}>{getDrakeContinuityPrompt(reviewElement)}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drakeContinuityPair}>
              <DrakeContinuityCard
                title="Approved Hatchling"
                element={reviewElement}
                stage="hatchling"
                source={getDragonStageImage("hatchling", reviewElement)}
                reducedMotion={reducedMotion}
                validationMode={reviewValidationMode}
              />
              <DrakeContinuityCard
                title="Integrated Drake"
                element={reviewElement}
                stage="drake"
                source={drakeImages[reviewElement]}
                reducedMotion={reducedMotion}
                validationMode={reviewValidationMode}
              />
            </ScrollView>
            <View style={styles.reviewChecklistGroup}>
              {drakeContinuityChecklist.map((item) => {
                const id = `drake-${reviewElement}-${item}`;
                return (
                  <Pressable key={id} onPress={() => toggleCheck(id)} style={styles.reviewCheckRow}>
                    <Text style={styles.reviewCheckMark}>{checkedItems[id] ? "x" : "□"}</Text>
                    <Text style={styles.reviewCheckText}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </SectionCard>
  );
}

function DrakeContinuityCard({
  title,
  element,
  stage,
  source,
  reducedMotion,
  validationMode
}: {
  title: string;
  element: DragonElement;
  stage: DragonStage;
  source: ImageSourcePropType;
  reducedMotion: boolean;
  validationMode: ArtValidationMode;
}) {
  return (
    <View style={styles.drakeContinuityCard}>
      <Text style={styles.drakeContinuityCardTitle}>{title}</Text>
      <View style={styles.hatchlingReviewDisplayWrap}>
        <DragonDisplay
          element={element}
          dragonSource={source}
          backgroundSource={artValidationBackgrounds.mysticMeadow.source}
          reducedMotion={reducedMotion}
          behaviorElement={element}
          dragonStage={stage}
          artValidationMode={validationMode}
          compact
        />
      </View>
    </View>
  );
}

function getDrakeContinuityPrompt(element: DragonElement) {
  if (element === "fire") {
    return "Target: chaotic ambition becomes confident pride. Preserve forward-curving horns, energetic posture, and mischievous confidence.";
  }
  if (element === "water") {
    return "Target: dreamy mysticism becomes graceful wisdom. Preserve flowing fins, sleepy softness, and calm drifting posture.";
  }
  return "Target: stubborn comfort becomes dependable protection. Preserve crystal shoulder masses, grounded posture, and warm guardian energy.";
}

function PlaytestNotesPanel({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  const [noteText, setNoteText] = useState("");
  const [missionControlUrl, setMissionControlUrl] = useState("http://192.168.1.183:3030/api/playtest-notes");
  const [sendStatus, setSendStatus] = useState("");
  const exportText = JSON.stringify(state.playtestNotes, null, 2);

  const addNote = () => {
    if (!noteText.trim()) {
      return;
    }
    dispatch({ type: "addPlaytestNote", text: noteText });
    setNoteText("");
  };

  const clearNotes = () => {
    Alert.alert("Clear playtest notes?", "This removes all locally saved playtest notes.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear Notes",
        style: "destructive",
        onPress: () => dispatch({ type: "clearPlaytestNotes" })
      }
    ]);
  };

  const sendNotesToMissionControl = async () => {
    if (state.playtestNotes.length === 0) {
      setSendStatus("No notes to send yet.");
      return;
    }
    if (!missionControlUrl.trim()) {
      setSendStatus("Enter the Mission Control URL first.");
      return;
    }

    setSendStatus("Sending notes...");
    try {
      const result = await fetchJsonWithTimeout<{ ok?: boolean; imported?: number; error?: string }>(missionControlUrl.trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "isekai-dragons-expo-go", notes: state.playtestNotes })
      });
      if (!result.ok) {
        throw new Error(result.error ?? "Mission Control did not confirm the upload");
      }
      dispatch({ type: "completeGuidedPlaytestSteps", stepIds: ["exportNotes"] });
      setSendStatus(`Sent ${result.imported ?? state.playtestNotes.length} note(s) to Mission Control.`);
    } catch (error) {
      setSendStatus(`Could not send notes: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  };

  return (
    <View style={styles.playtestNotesPanel}>
      <TextInput
        value={noteText}
        onChangeText={setNoteText}
        multiline
        maxLength={240}
        placeholder="Short note for this moment..."
        placeholderTextColor={uiTheme.colors.faint}
        style={styles.playtestNoteInput}
      />
      <Pressable
        onPress={addNote}
        disabled={!noteText.trim()}
        accessibilityRole="button"
        accessibilityLabel="Add playtest note"
        accessibilityHint="Saves the current typed note to the local playtest log."
        hitSlop={8}
        style={[styles.primaryPanelButton, !noteText.trim() && styles.disabledUpgradeCard]}
      >
        <Text style={styles.primaryPanelButtonText}>Add Note</Text>
      </Pressable>

      <Text style={styles.equipmentSubhead}>Saved Notes</Text>
      <ScrollView nestedScrollEnabled style={styles.playtestNotesList} contentContainerStyle={styles.playtestNotesListContent}>
        {state.playtestNotes.length > 0 ? (
          state.playtestNotes.map((note) => (
            <View key={note.id} style={styles.playtestNoteRow}>
              <Text style={styles.traitTitle}>{note.text}</Text>
              <Text style={styles.traitText}>
                {new Date(note.timestamp).toLocaleString()} | {note.element ?? "none"} {note.stage} | {formatGameNumber(note.essence, state.settings.numberFormat)} essence
              </Text>
              <Text style={styles.traitText}>
                {areaDefinitions[note.area]?.name ?? note.area} | Defeated {formatGameNumber(note.defeatedCount, state.settings.numberFormat)}
              </Text>
            </View>
          ))
        ) : (
          <EmptyState title="No notes yet" detail="Add short notes while playtesting to capture context automatically." />
        )}
      </ScrollView>

      <Text style={styles.equipmentSubhead}>Export Playtest Notes</Text>
      <Pressable
        onPress={() => dispatch({ type: "completeGuidedPlaytestSteps", stepIds: ["exportNotes"] })}
        accessibilityRole="button"
        accessibilityLabel="Mark playtest notes exported"
        accessibilityHint="Marks the playtest note export checklist step complete."
        hitSlop={8}
        style={styles.primaryPanelButton}
      >
        <Text style={styles.primaryPanelButtonText}>Export Playtest Notes</Text>
      </Pressable>
      <Text style={styles.traitText}>Mission Control URL</Text>
      <TextInput
        value={missionControlUrl}
        onChangeText={setMissionControlUrl}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="http://your-laptop-ip:3030/api/playtest-notes"
        placeholderTextColor={uiTheme.colors.faint}
        style={styles.playtestNoteInput}
      />
      <Pressable
        onPress={sendNotesToMissionControl}
        disabled={state.playtestNotes.length === 0}
        accessibilityRole="button"
        accessibilityLabel="Send playtest notes to Mission Control"
        accessibilityHint="Uploads saved playtest notes to the configured Mission Control URL."
        hitSlop={8}
        style={[styles.primaryPanelButton, state.playtestNotes.length === 0 && styles.disabledUpgradeCard]}
      >
        <Text style={styles.primaryPanelButtonText}>Send Notes to Mission Control</Text>
      </Pressable>
      {sendStatus ? <Text style={styles.traitText}>{sendStatus}</Text> : null}
      <TextInput value={exportText} editable={false} multiline style={styles.backupTextInput} />

      <Pressable
        onPress={clearNotes}
        disabled={state.playtestNotes.length === 0}
        accessibilityRole="button"
        accessibilityLabel="Clear playtest notes"
        accessibilityHint="Opens confirmation before deleting locally saved playtest notes."
        hitSlop={8}
        style={[styles.dangerButton, state.playtestNotes.length === 0 && styles.disabledUpgradeCard]}
      >
        <Text style={styles.dangerButtonText}>Clear Notes</Text>
      </Pressable>
    </View>
  );
}

function SettingToggle({
  title,
  detail,
  enabled,
  onToggle
}: {
  title: string;
  detail: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.progressRewardCopy}>
        <Text style={styles.traitTitle}>{title}</Text>
        <Text style={styles.traitText}>{detail}</Text>
      </View>
      <Pressable
        onPress={onToggle}
        accessibilityRole="switch"
        accessibilityState={{ checked: enabled }}
        accessibilityLabel={title}
        accessibilityHint={detail}
        hitSlop={8}
        style={[styles.toggleTrack, enabled && styles.toggleTrackOn]}
      >
        <View style={[styles.toggleKnob, enabled && styles.toggleKnobOn]} />
      </Pressable>
    </View>
  );
}

function isValidBackupState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<GameState>;
  return Boolean(candidate.dragon && candidate.player && candidate.idleUpgrades && candidate.treasures && candidate.elementalShards);
}

function DailyLoginRewardModal({ visible, state, onClaim }: { visible: boolean; state: GameState; onClaim: () => void }) {
  const rewardDay = getPendingDailyLoginRewardDay(state);
  const reward = dailyLoginRewardDefinitions[rewardDay] ?? dailyLoginRewardDefinitions[1];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClaim}>
      <View style={styles.modalScrim}>
        <View style={styles.onboardingCard}>
          <Text style={styles.choiceNumber}>Daily Login</Text>
          <Text style={styles.onboardingTitle}>Day {rewardDay}</Text>
          <Text style={styles.onboardingText}>{reward.title}</Text>
          <Text style={styles.rewardSummaryText}>{formatDailyLoginReward(rewardDay, reward.reward, state.settings.numberFormat)}</Text>
          <View style={styles.dailyLoginTrack}>
            {[1, 2, 3, 4, 5].map((day) => (
              <View key={day} style={[styles.dailyLoginDay, day === rewardDay && styles.dailyLoginDayActive]}>
                <Text style={[styles.dailyLoginDayText, day === rewardDay && styles.bottomNavTextActive]}>{day}</Text>
              </View>
            ))}
          </View>
          <Pressable onPress={onClaim} style={styles.modalPrimaryButton}>
            <Text style={styles.primaryPanelButtonText}>Claim Reward</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function JourneyEventModal({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  const eventId = state.journeyEvents.activeEventId;
  const event = eventId ? journeyEventDefinitions[eventId] : null;
  const numberFormat = state.settings.numberFormat;

  if (!event) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => dispatch({ type: "resolveJourneyEvent", choiceId: event.choices[event.choices.length - 1]?.id ?? "" })}>
      <View style={styles.modalScrim}>
        <View style={styles.journeyEventCard}>
          <Text style={styles.choiceNumber}>Event</Text>
          <Text style={styles.modalTitle}>{event.title}</Text>
          <Text style={styles.bodyText}>{event.description}</Text>
          <View style={styles.journeyEventChoices}>
            {event.choices.map((choice) => {
              const disabled = Boolean(choice.costEssence && state.player.essence < choice.costEssence);
              const costText = choice.costEssence ? ` Cost: ${formatGameNumber(choice.costEssence, numberFormat)} essence.` : "";
              const elementText = choice.requiredElement ? ` ${choice.requiredElement.toUpperCase()} bonus.` : "";
              return (
                <Pressable
                  key={choice.id}
                  disabled={disabled}
                  onPress={() => dispatch({ type: "resolveJourneyEvent", choiceId: choice.id })}
                  style={[styles.journeyEventChoice, disabled && styles.disabledUpgradeCard]}
                >
                  <Text style={styles.traitTitle}>{choice.label}</Text>
                  <Text style={styles.traitText}>
                    {choice.detail}
                    {costText}
                    {elementText}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function formatDailyLoginReward(day: number, reward: { essence?: number; dragonSouls?: number; shards?: Partial<Record<DragonElement, number>> }, numberFormat: GameSettings["numberFormat"]) {
  if (day === 3) {
    return "Random treasure";
  }
  return formatReward(reward, numberFormat);
}

function formatGameNumber(value: number | null | undefined, numberFormat: GameSettings["numberFormat"]) {
  const safeValue = typeof value === "number" && Number.isFinite(value) ? value : 0;
  if (numberFormat === "full") {
    return Number.isInteger(safeValue) ? `${safeValue}` : safeValue.toFixed(1);
  }
  const absolute = Math.abs(safeValue);
  if (absolute >= 1_000_000_000) {
    return `${(safeValue / 1_000_000_000).toFixed(1)}B`;
  }
  if (absolute >= 1_000_000) {
    return `${(safeValue / 1_000_000).toFixed(1)}M`;
  }
  if (absolute >= 10_000) {
    return `${(safeValue / 1_000).toFixed(1)}K`;
  }
  return Number.isInteger(safeValue) ? `${safeValue}` : safeValue.toFixed(1);
}

function formatMultiplier(value: number) {
  return `${value.toFixed(2)}x`;
}

function formatPercent(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}

function getTodayKeyForUi() {
  return new Date().toISOString().slice(0, 10);
}

function StatsPanelContent({ state }: { state: GameState }) {
  const path = state.dragon.path ? dragonPathDefinitions[state.dragon.path] : null;
  const numberFormat = state.settings.numberFormat;
  const battleDamage = getBattleDamage(state);
  const dragonPower = getDragonPower(state);
  const combatRows: Array<{ title: string; detail: string; value: string }> = [
    {
      title: "Attack",
      detail: "Raises every breath and claw hit.",
      value: `${state.dragon.stats.attack}`
    },
    {
      title: "Defense",
      detail: "Cuts incoming damage before block/dodge results.",
      value: `${state.dragon.stats.defense}`
    },
    {
      title: "Speed",
      detail: "Improves tempo and slightly improves crit/dodge feel.",
      value: `${state.dragon.stats.speed}`
    },
    {
      title: "Block",
      detail: "Chance to reduce an enemy hit instead of eating the full blow.",
      value: `${state.dragon.stats.block}%`
    },
    {
      title: "Dodge",
      detail: "Chance to fully avoid an enemy hit.",
      value: `${state.dragon.stats.dodge}%`
    },
    {
      title: "Crit / Crit DMG",
      detail: "Chance to spike damage and how hard the spike lands.",
      value: `${state.dragon.stats.critChance}% / ${state.dragon.stats.critDamage}%`
    }
  ];

  return (
    <>
      <SectionCard title="Dragon Stats" subtitle={`${state.dragon.name} | Lv ${state.dragon.level} | Power ${formatGameNumber(dragonPower, numberFormat)}`}>
        <StatsGrid stats={state.dragon.stats} />
      </SectionCard>
      <SectionCard title="Combat Impact" subtitle={`Estimated hit: ${formatGameNumber(battleDamage, numberFormat)} damage`}>
        {combatRows.map((row) => (
          <View key={row.title} style={styles.rewardRowCompact}>
            <View style={styles.progressRewardCopy}>
              <Text style={styles.traitTitle}>{row.title}</Text>
              <Text style={styles.traitText}>{row.detail}</Text>
            </View>
            <Text style={styles.questCount}>{row.value}</Text>
          </View>
        ))}
      </SectionCard>
      <SectionCard title="Build Identity" subtitle={path ? path.name : "Choose an evolution path to unlock a role"}>
        {path ? (
          <>
            <Text style={styles.traitTitle}>{path.role.toUpperCase()} • {path.combatStyle}</Text>
            <Text style={styles.traitText}>{path.description}</Text>
            <Text style={styles.rewardSummaryText}>{getDragonPathTradeoffCopy(path)}</Text>
          </>
        ) : (
          <Text style={styles.panelMutedText}>Your first Drake evolution will add a guardian, raider, or mystic combat identity here.</Text>
        )}
      </SectionCard>
    </>
  );
}

function UpgradesPanelContent({
  state,
  canEvolve,
  evolutionCost,
  sparkleUpgrade,
  onEvolve,
  onBuyUpgrade
}: {
  state: GameState;
  canEvolve: boolean;
  evolutionCost: number | null;
  sparkleUpgrade: IdleUpgradeId | null;
  onEvolve: () => void;
  onBuyUpgrade: (upgradeId: IdleUpgradeId) => void;
}) {
  const element = state.dragon.element ?? "fire";
  const theme = elementTheme[element];
  const elementBonus = elementBonusDefinitions[element];
  const trait = getSelectedEvolutionTrait(state);
  const numberFormat = state.settings.numberFormat;

  return (
    <>
      <SectionCard
        title="Evolution"
        subtitle={evolutionCost === null ? "Your dragon is fully evolved." : `${formatGameNumber(Math.floor(state.player.essence), numberFormat)} / ${formatGameNumber(evolutionCost, numberFormat)} essence`}
      >
        {evolutionCost !== null ? (
          <Pressable onPress={onEvolve} disabled={!canEvolve} style={[styles.primaryPanelButton, !canEvolve && styles.disabledUpgradeCard]}>
            <Text style={styles.primaryPanelButtonText}>Evolve</Text>
          </Pressable>
        ) : null}
      </SectionCard>
      <SectionCard title="Element Bonus" subtitle={elementBonus.title}>
        <Text style={[styles.panelMutedText, { color: theme.secondary }]}>{elementBonus.bonuses.join(" | ")}</Text>
      </SectionCard>
      <SectionCard title="Evolution Trait" subtitle={trait ? trait.name : "Choose a Drake path"}>
        <Text style={styles.panelMutedText}>{trait ? trait.bonus : "Your first branch unlocks when evolving from Hatchling to Drake."}</Text>
      </SectionCard>
      <SectionCard title="Upgrade Cards">
        <View style={styles.panelUpgradeGrid}>
          {idleUpgradeOrder.map((upgradeId) => (
            <IdleUpgradeCard
              key={upgradeId}
              upgradeId={upgradeId}
              state={state}
              activeSparkle={sparkleUpgrade === upgradeId}
              onBuy={() => onBuyUpgrade(upgradeId)}
            />
          ))}
        </View>
      </SectionCard>
    </>
  );
}

function AdventurePanelContent({
  state,
  onReturnToDen,
  onEquipItem,
  onSellItem
}: {
  state: GameState;
  onReturnToDen: () => void;
  onEquipItem: (itemId: string) => void;
  onSellItem: (itemId: string) => void;
}) {
  return (
    <>
      <CapybaraAdventureBoard state={state} onReturnToDen={onReturnToDen} compact />
      <SectionCard title="Adventure Rewards" subtitle="Hoard, gear, and collection growth from the route">
        <TreasureInventory state={state} />
      </SectionCard>
      <SectionCard title="Collection Log" subtitle="Discovered treasures and their bonuses">
        <TreasureCollectionLog state={state} />
      </SectionCard>
      <SectionCard title="Equipment" subtitle="Enemy drops that boost your dragon">
        <EquipmentPanel state={state} onEquipItem={onEquipItem} onSellItem={onSellItem} />
      </SectionCard>
    </>
  );
}

function FireStarterFocusPills() {
  const visibleMilestones = fireStarterAdventureMilestones.filter((milestone) => milestone.phase !== "research");
  return (
    <View style={styles.fireStarterFocusPillRow}>
      <Text style={styles.fireStarterFocusLead}>Fire plan</Text>
      {visibleMilestones.map((milestone) => (
        <Text key={milestone.id} style={styles.fireStarterFocusPill}>{milestone.phase}</Text>
      ))}
    </View>
  );
}

function FireStarterFocusPanel() {
  return (
    <SectionCard title="Fire Starter Expedition Focus" subtitle="Capybara Go research translated into dragon-first implementation targets">
      {fireStarterAdventureMilestones.map((milestone) => (
        <View key={milestone.id} style={styles.rewardRowCompact}>
          <View style={styles.progressRewardCopy}>
            <Text style={styles.traitTitle}>{milestone.title}</Text>
            <Text style={styles.traitText}>Capybara lesson: {milestone.capybaraLesson}</Text>
            <Text style={styles.rewardSummaryText}>Dragon twist: {milestone.dragonTwist}</Text>
            <Text style={styles.panelMutedText}>Visible proof: {milestone.visibleProof}</Text>
          </View>
        </View>
      ))}
    </SectionCard>
  );
}

function ProductiveWorkNowPanel() {
  return (
    <SectionCard title="Next 10-Minute Production Slice" subtitle="What Topnotch can inspect right now before the next deeper build pass">
      {productiveWorkNowSlices.map((slice) => (
        <View key={slice.id} style={styles.rewardRowCompact}>
          <View style={styles.progressRewardCopy}>
            <Text style={styles.traitTitle}>{slice.lane}</Text>
            <Text style={styles.traitText}>Production target: {slice.productionTarget}</Text>
            <Text style={styles.rewardSummaryText}>Visible deliverable: {slice.visibleDeliverable}</Text>
            <Text style={styles.panelMutedText}>Next hook: {slice.nextHook}</Text>
          </View>
        </View>
      ))}
    </SectionCard>
  );
}

const focusedFireRouteBriefStops = [
  { step: "Stop 1", label: "Feed", detail: "Buy spiced feed to teach the first attack bump." },
  { step: "Stop 3 fight", label: "Slimes", detail: "First bridge fight proves route stops become combat." },
  { step: "Stop 4", label: "Ember cache", detail: "Treasure adds hoard pressure and evolution heat." },
  { step: "Stop 6 fight", label: "Boar charge", detail: "Defense, block, and crit timing start to matter." },
  { step: "Stop 12 elite skill draft", label: "Ruin Knight", detail: "Elite gate unlocks the first Fire build draft." }
];

function FocusedFireRouteBriefPanel() {
  return (
    <View style={styles.focusedFireBriefPanel}>
      <View style={styles.focusedFireBriefHeader}>
        <Text style={styles.focusedFireBriefKicker}>Fire starter slice</Text>
        <Text style={styles.focusedFireBriefTitle}>First 12-stop Fire onboarding route</Text>
      </View>
      <Text style={styles.focusedFireBriefSummary}>Route → fight → chest is framed around ember growth: feed the hatchling, hit the bridge fight, secure hoard fuel, then reach the elite skill-draft gate.</Text>
      <View style={styles.focusedFireStopGrid}>
        {focusedFireRouteBriefStops.map((stop) => (
          <View key={stop.step} style={styles.focusedFireStopChip}>
            <Text style={styles.focusedFireStopStep}>{stop.step}</Text>
            <Text style={styles.focusedFireStopLabel}>{stop.label}</Text>
            <Text style={styles.focusedFireStopDetail}>{stop.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const waterMoonwellRouteBriefStops = [
  { step: "Stop 11", label: "Kelp camp", detail: "Water route opens on sustain, block, dodge, and tide tempo instead of generic travel." },
  { step: "Stop 12 fight", label: "Reef slimes", detail: "Elite bridge fight proves Tide Spiral, dodge, and block in the first Water combat stop." },
  { step: "Stop 13", label: "Pearlflow Trader", detail: "Pearl charms push Guardian/Raider/Mystic Water builds and loot identity." },
  { step: "Stop 18 fight", label: "Moonwell Gate", detail: "Manta guardian becomes the flashy Water combat checkpoint before route payoff." },
  { step: "Stop 20", label: "Tidal hoard", detail: "Pearls, shell coins, and damp relics sell the route as dragon adventure loot." }
];

function WaterMoonwellRouteBriefPanel() {
  return (
    <View style={styles.focusedFireBriefPanel}>
      <View style={styles.focusedFireBriefHeader}>
        <Text style={styles.focusedFireBriefKicker}>Moonwell route</Text>
        <Text style={styles.focusedFireBriefTitle}>Water Moonwell Tide Path</Text>
      </View>
      <Text style={styles.focusedFireBriefSummary}>The next 10-stop route slice turns Water into a readable dragon build: graceful tide movement, pearl-shop choices, reef fights, dodge/block stat pressure, and a moonlit hoard finish.</Text>
      <View style={styles.focusedFireStopGrid}>
        {waterMoonwellRouteBriefStops.map((stop) => (
          <View key={stop.step} style={[styles.focusedFireStopChip, { borderColor: "rgba(88,199,255,0.36)" }]}>
            <Text style={[styles.focusedFireStopStep, { color: "#8ff7ff" }]}>{stop.step}</Text>
            <Text style={styles.focusedFireStopLabel}>{stop.label}</Text>
            <Text style={styles.focusedFireStopDetail}>{stop.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const earthCrystalCragRouteBriefStops = [
  { step: "Stop 21 fight", label: "Crag basecamp", detail: "Earth route opens with Gemhide pressure, defense, block, and chunky bracing." },
  { step: "Stop 22", label: "Gemhide camp", detail: "Post-fight saddlebags and stone training make the hoard feel heavy." },
  { step: "Stop 23", label: "Rune market", detail: "Bulwark vs Shatter runes preview Guardian/Raider/Mystic Earth builds." },
  { step: "Stop 27 fight", label: "Crystal Golem Gate", detail: "Flashy combat checkpoint sells Crystal Break, heavy shakes, and shielded enemies." },
  { step: "Stop 30", label: "Titan hoard", detail: "Boss-scale stone guardian turns the route finish into a heavy relic payoff." }
];

function EarthCrystalCragRouteBriefPanel() {
  return (
    <View style={styles.focusedFireBriefPanel}>
      <View style={styles.focusedFireBriefHeader}>
        <Text style={styles.focusedFireBriefKicker}>Crystal Crag route</Text>
        <Text style={styles.focusedFireBriefTitle}>Earth Crystal Crag Path</Text>
      </View>
      <Text style={styles.focusedFireBriefSummary}>The next 10-stop route slice makes Earth feel crunchy and tactical: heavy bracing, rune choices, gemhide fights, defense/block stat pressure, armor-breaking Crystal Break moments, and a titan-stone hoard finish.</Text>
      <View style={styles.focusedFireStopGrid}>
        {earthCrystalCragRouteBriefStops.map((stop) => (
          <View key={stop.step} style={[styles.focusedFireStopChip, { borderColor: "rgba(171,219,133,0.38)" }]}>
            <Text style={[styles.focusedFireStopStep, { color: "#b8f28b" }]}>{stop.step}</Text>
            <Text style={styles.focusedFireStopLabel}>{stop.label}</Text>
            <Text style={styles.focusedFireStopDetail}>{stop.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const lightSunbeamSpiresRouteBriefStops = [
  { step: "Stop 31", label: "Sunbeam arrival", detail: "Light opens with golden bridges, healing identity, crit clarity, and heroic tempo." },
  { step: "Stop 32", label: "Halo market", detail: "Guardian/Raider/Mystic charms frame Light as shield, pierce, or radiant speed." },
  { step: "Stop 33 fight", label: "Radiant wisps", detail: "First Light combat checkpoint proves speed, dodge, and readable beam flashes." },
  { step: "Stop 36 elite", label: "Sun Lancer Duel", detail: "A spear-bright mirror fight sells Sunbeam Lance, halo shields, and crit sparks." },
  { step: "Stop 40", label: "Aurora crown", detail: "Boss-scale hoard finish turns Light into a treasure-shine payoff, not generic support." }
];

function LightSunbeamSpiresRouteBriefPanel() {
  return (
    <View style={styles.focusedFireBriefPanel}>
      <View style={styles.focusedFireBriefHeader}>
        <Text style={styles.focusedFireBriefKicker}>Sunbeam route</Text>
        <Text style={styles.focusedFireBriefTitle}>Light Sunbeam Spires Path</Text>
      </View>
      <Text style={styles.focusedFireBriefSummary}>The next 10-stop route slice makes Light playable and distinct: halo protection, sun-lance burst, aurora recovery, crit-focused combat readability, and a bright crown-hoard boss finish.</Text>
      <View style={styles.focusedFireStopGrid}>
        {lightSunbeamSpiresRouteBriefStops.map((stop) => (
          <View key={stop.step} style={[styles.focusedFireStopChip, { borderColor: "rgba(255,229,143,0.42)" }]}>
            <Text style={[styles.focusedFireStopStep, { color: "#ffe58f" }]}>{stop.step}</Text>
            <Text style={styles.focusedFireStopLabel}>{stop.label}</Text>
            <Text style={styles.focusedFireStopDetail}>{stop.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function GoalsPanelContent({
  state,
  onClaimAchievement,
  onClaimDaily
}: {
  state: GameState;
  onClaimAchievement: (achievementId: AchievementId) => void;
  onClaimDaily: (goalId: DailyGoalId) => void;
}) {
  return (
    <>
      <SectionCard title="Achievements" subtitle="Permanent milestones">
        {achievementOrder.map((achievementId) => {
          const achievement = achievementDefinitions[achievementId];
          const unlocked = state.unlockedAchievements.includes(achievementId);
          const claimed = state.claimedAchievements.includes(achievementId);
          return (
            <RewardRow
              key={achievementId}
              title={achievement.title}
              detail={achievement.description}
              reward={formatReward(achievement.reward, state.settings.numberFormat)}
              buttonLabel={claimed ? "Claimed" : unlocked ? "Claim" : "Locked"}
              disabled={!unlocked || claimed}
              onPress={() => onClaimAchievement(achievementId)}
            />
          );
        })}
      </SectionCard>
      <SectionCard title="Daily Goals" subtitle={`Resets: ${state.dailyResetDate}`}>
        {dailyGoalOrder.map((goalId) => {
          const goal = dailyGoalDefinitions[goalId];
          const progress = state.dailyGoals[goalId] ?? { progress: 0, claimed: false };
          const ready = progress.progress >= goal.target;
          return (
            <RewardRow
              key={goalId}
              title={goal.title}
              detail={`${Math.min(progress.progress, goal.target)} / ${goal.target}`}
              reward={formatReward(goal.reward, state.settings.numberFormat)}
              buttonLabel={progress.claimed ? "Claimed" : ready ? "Claim" : "Progress"}
              disabled={!ready || progress.claimed}
              onPress={() => onClaimDaily(goalId)}
            />
          );
        })}
      </SectionCard>
      <SectionCard title="Recommended Systems Roadmap" subtitle="Supporting loops that make the dragon RPG feel sticky">
        {supportingSystemRecommendations.map((system) => (
          <View key={system.id} style={styles.rewardRowCompact}>
            <View style={styles.progressRewardCopy}>
              <Text style={styles.traitTitle}>{system.name}</Text>
              <Text style={styles.traitText}>{system.purpose}</Text>
              <Text style={styles.rewardSummaryText}>{system.inGameProof}</Text>
              <Text style={styles.panelMutedText}>Next: {system.nextHook}</Text>
            </View>
          </View>
        ))}
      </SectionCard>
    </>
  );
}

function RebirthPanelContent({ state, onReincarnate }: { state: GameState; onReincarnate: () => void }) {
  const unlocked = canReincarnate(state);
  const soulsGained = getReincarnationSoulsGained(state);
  const bonusPercent = Math.round((getDragonSoulMultiplier(state) - 1) * 100);
  const numberFormat = state.settings.numberFormat;

  return (
    <>
      <SectionCard title="Dragon Souls" subtitle={`${state.dragonSouls} souls | +${bonusPercent}% all essence`}>
        <View style={styles.panelStatsRow}>
          <StatPill icon="✦" label="Lifetime" value={formatGameNumber(Math.floor(state.lifetimeEssence), numberFormat)} />
          <StatPill icon="↻" label="Rebirths" value={formatGameNumber(state.totalReincarnations, numberFormat)} />
        </View>
      </SectionCard>
      <SectionCard title="Reincarnation" subtitle={unlocked ? `Gain ${soulsGained} Dragon Souls now` : "Reach Wyrm to unlock Rebirth"}>
        <Text style={styles.panelMutedText}>Resets essence, stage, element, upgrades, area progress, quest progress, and evolution trait. Treasures stay.</Text>
        <Pressable onPress={onReincarnate} disabled={!unlocked} style={[styles.primaryPanelButton, !unlocked && styles.disabledUpgradeCard]}>
          <Text style={styles.primaryPanelButtonText}>{unlocked ? "Reincarnate" : "Reach Wyrm"}</Text>
        </Pressable>
      </SectionCard>
    </>
  );
}

function RewardRow({
  title,
  detail,
  reward,
  buttonLabel,
  disabled,
  onPress
}: {
  title: string;
  detail: string;
  reward: string;
  buttonLabel: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.rewardRowCompact}>
      <View style={styles.progressRewardCopy}>
        <Text style={styles.traitTitle}>{title}</Text>
        <Text style={styles.traitText}>{detail}</Text>
        <Text style={styles.rewardSummaryText}>{reward}</Text>
      </View>
      <Pressable onPress={onPress} disabled={disabled} style={[styles.claimButton, disabled && styles.disabledUpgradeCard]}>
        <Text style={styles.claimButtonText}>{buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

function AdventureJourneyScene({ state, onReturnToDen, focused = false }: { state: GameState; onReturnToDen: () => void; focused?: boolean }) {
  const element = state.dragon.element ?? "fire";
  const run = state.adventureRun;
  const pendingNode = run?.pendingNodeId ? getAdventureNodeById(run.pendingNodeId) : null;
  const currentNode = pendingNode ?? run?.nodes.find((node) => node.step === run.step) ?? run?.nodes[0] ?? null;
  const isFightStop = Boolean(pendingNode && (pendingNode.kind === "battle" || pendingNode.kind === "elite" || pendingNode.kind === "boss"));
  const showEnemyEncounter = !focused || isFightStop;
  const enemyImageKey = currentNode?.encounterId
    ? getAutoBattleEnemyImageKey(encounters.find((item) => item.id === currentNode.encounterId)?.name ?? state.autoBattle.enemyName, state.autoBattle.areaId)
    : getAutoBattleEnemyImageKey(state.autoBattle.enemyName, state.autoBattle.areaId);
  const safeEnemyMaxHp = Math.max(1, state.autoBattle.enemyMaxHp);
  const enemyHpPercent = Math.max(0, Math.min(100, Math.round((state.autoBattle.enemyHp / safeEnemyMaxHp) * 100)));
  const routeStep = state.autoBattle.defeatedCount % 4;
  const totalTreasures = treasureOrder.reduce((total, treasureId) => total + (state.treasures[treasureId] ?? 0), 0);
  const adventureAreaScenes: Record<AreaId, AdventureNode["scene"]> = {
    mysticMeadow: "forest",
    emberWoods: "camp",
    tideCavern: "cave",
    stonebackHills: "ruins",
    skyRuins: "shrine",
    voidNest: "boss"
  };
  const travelProgress = useRef(new Animated.Value(0)).current;
  const backgroundPan = useRef(new Animated.Value(0)).current;
  const battlePulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const targetProgress = isFightStop ? 1 : Math.min(0.74, Math.max(0.18, ((run?.step ?? 1) % 6) / 6 + 0.18));

    if (state.settings.reducedMotion) {
      if (isFightStop) {
        travelProgress.setValue(1);
        battlePulse.setValue(1);
      } else {
        travelProgress.setValue(targetProgress);
        battlePulse.setValue(0);
      }
      backgroundPan.setValue(0);
      return;
    }

    travelProgress.stopAnimation();
    backgroundPan.stopAnimation();
    battlePulse.stopAnimation();
    travelProgress.setValue(0);
    backgroundPan.setValue(0);
    battlePulse.setValue(0);

    const travelAnimation = Animated.timing(travelProgress, {
      toValue: targetProgress,
      duration: isFightStop ? 420 : 620,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true
    });
    const backgroundAnimation = Animated.timing(backgroundPan, {
      toValue: isFightStop ? 0.48 : 0.28,
      duration: isFightStop ? 420 : 620,
      easing: Easing.linear,
      useNativeDriver: true
    });
    const battleAnimation = isFightStop
      ? Animated.loop(
        Animated.sequence([
          Animated.timing(battlePulse, { toValue: 1, duration: 170, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(battlePulse, { toValue: 0, duration: 170, easing: Easing.in(Easing.quad), useNativeDriver: true })
        ])
      )
      : Animated.timing(battlePulse, { toValue: 0.25, duration: 620, easing: Easing.out(Easing.quad), useNativeDriver: true });

    Animated.parallel([travelAnimation, backgroundAnimation]).start(() => {
      if (isFightStop) {
        battleAnimation.start();
      }
    });
    if (!isFightStop) {
      battleAnimation.start();
    }

    return () => {
      travelAnimation.stop();
      backgroundAnimation.stop();
      battleAnimation.stop();
    };
  }, [backgroundPan, battlePulse, isFightStop, run?.step, state.settings.reducedMotion, travelProgress]);

  const walkerStyle = {
    transform: [
      {
        translateX: travelProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 120]
        })
      },
      {
        translateY: battlePulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -9]
        })
      }
    ]
  };
  const clashStyle = {
    opacity: battlePulse.interpolate({
      inputRange: [0, 0.45, 1],
      outputRange: [0.25, 1, 0.35]
    }),
    transform: [
      {
        scale: battlePulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.72, 1.24]
        })
      }
    ]
  };
  const backgroundStyle = {
    transform: [
      {
        translateX: backgroundPan.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -72]
        })
      }
    ]
  };

  return (
    <View style={[styles.adventureJourneyStage, focused && styles.adventureJourneyStageFocused]}>
      <Animated.View style={[styles.adventureJourneyMovingBackdrop, backgroundStyle]}>
        <SafeExpoImage source={sceneImages[adventureAreaScenes[state.currentArea]]} style={styles.adventureJourneyBackdrop} contentFit="cover" transition={200} />
      </Animated.View>
      <LinearGradient colors={["rgba(8,6,17,0.12)", "rgba(8,6,17,0.82)"]} style={styles.adventureJourneyScrim} />
      <View style={styles.adventureRouteLine}>
        <View style={[styles.adventureRouteNode, routeStep >= 0 && styles.adventureRouteNodeActive]} />
        <View style={[styles.adventureRouteNode, routeStep >= 1 && styles.adventureRouteNodeActive]} />
        <View style={[styles.adventureRouteNode, routeStep >= 2 && styles.adventureRouteNodeActive]} />
        <View style={[styles.adventureRouteNode, styles.adventureRouteNodeDen]} />
      </View>
      <Animated.View style={[styles.adventureDragonWalker, walkerStyle]}>
        <SafeExpoImage source={getDragonStageImage(state.dragon.stage, element)} style={[styles.adventureDragonSprite, styles.adventureDragonSpriteFacingRight]} contentFit="contain" />
      </Animated.View>
      {showEnemyEncounter ? (
        <View style={styles.adventureEnemyEncounter}>
          <Animated.View style={[styles.adventureClashBurst, clashStyle]} />
          <Image source={enemyImages[enemyImageKey]} style={styles.adventureEnemySprite} resizeMode="contain" />
          <Text style={styles.adventureEnemyName}>{state.autoBattle.enemyName}</Text>
          <View style={styles.adventureEnemyHpTrack}>
            <View style={[styles.adventureEnemyHpFill, { width: `${enemyHpPercent}%` as any }]} />
          </View>
        </View>
      ) : null}
      {!focused ? (
        <View style={styles.adventureDenReturn}>
          <Text style={styles.adventureDenIcon}>🏠</Text>
          <Text style={styles.adventureDenText}>{totalTreasures} treasures secured</Text>
          <Pressable onPress={onReturnToDen} style={styles.adventureDenButton}>
            <Text style={styles.adventureDenButtonText}>Return to Den</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function AutoBattleSummary({ state }: { state: GameState }) {
  const hpPercent = `${Math.round((state.autoBattle.enemyHp / state.autoBattle.enemyMaxHp) * 100)}%`;
  const rewardEssence = getBattleRewardEssence(state);
  const damage = getBattleDamage(state);
  const power = getDragonPower(state);
  const numberFormat = state.settings.numberFormat;

  return (
    <View>
      <View style={styles.autoBattleHeader}>
        <Text style={styles.autoBattleEnemy}>{state.autoBattle.enemyName}</Text>
        <Text style={styles.autoBattlePower}>Power {formatGameNumber(power, numberFormat)}</Text>
      </View>
      <View style={styles.enemyHpTrack}>
        <View style={[styles.enemyHpFill, { width: hpPercent as any }]} />
      </View>
      <Text style={styles.panelMutedText}>
        HP {formatGameNumber(state.autoBattle.enemyHp, numberFormat)}/{formatGameNumber(state.autoBattle.enemyMaxHp, numberFormat)} | Hit {formatGameNumber(damage, numberFormat)} | Reward +{formatGameNumber(rewardEssence, numberFormat)} essence
      </Text>
    </View>
  );
}

function FireBreathCombatVisual({ state, element = state.dragon.element ?? "fire" }: { state: GameState; element?: DragonElement }) {
  const reducedMotion = state.settings.reducedMotion;
  const enemyImageKey = getAutoBattleEnemyImageKey(state.autoBattle.enemyName, state.autoBattle.areaId);
  const combatFx = elementCombatFx[element];
  const critBadgeLabel = `CRIT ${state.dragon.stats.critChance}% • Crit DMG ${state.dragon.stats.critDamage}%`;
  const dodgeBadgeLabel = `DODGE ${state.dragon.stats.dodge}% • SPD ${state.dragon.stats.speed}`;
  const blockBadgeLabel = `BLOCK ${state.dragon.stats.block}% • DEF ${state.dragon.stats.defense}`;
  const safeEnemyMaxHp = Math.max(1, state.autoBattle.enemyMaxHp);
  const enemyHpPercent = Math.max(0, Math.min(100, Math.round((state.autoBattle.enemyHp / safeEnemyMaxHp) * 100)));
  const dragonMaxHp = Math.max(1, state.dragon.stats.health);
  const dragonHpPercent = 100;
  const breathPulse = useRef(new Animated.Value(0)).current;
  const hitPulse = useRef(new Animated.Value(0)).current;
  const enemyAttackPulse = useRef(new Animated.Value(0)).current;
  const enemyIdle = useRef(new Animated.Value(0)).current;
  const dragonHitPulse = useRef(new Animated.Value(0)).current;
  const previousEnemyHp = useRef(Number.POSITIVE_INFINITY);
  const previousDefeatedCount = useRef(state.autoBattle.defeatedCount);

  useEffect(() => {
    if (reducedMotion) {
      enemyIdle.stopAnimation();
      enemyIdle.setValue(0);
      return;
    }

    enemyIdle.setValue(0);
    const idleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(enemyIdle, { toValue: 1, duration: 1450, useNativeDriver: true }),
        Animated.timing(enemyIdle, { toValue: 0, duration: 1450, useNativeDriver: true })
      ])
    );

    idleAnimation.start();

    return () => {
      idleAnimation.stop();
    };
  }, [enemyIdle, reducedMotion]);

  useEffect(() => {
    const enemyHpDecreased = state.autoBattle.enemyHp < previousEnemyHp.current;
    const defeatedCountChanged = state.autoBattle.defeatedCount !== previousDefeatedCount.current;

    previousEnemyHp.current = state.autoBattle.enemyHp;
    previousDefeatedCount.current = state.autoBattle.defeatedCount;

    if (reducedMotion || (!enemyHpDecreased && !defeatedCountChanged)) {
      if (reducedMotion) {
        breathPulse.stopAnimation();
        hitPulse.stopAnimation();
        enemyAttackPulse.stopAnimation();
        dragonHitPulse.stopAnimation();
        breathPulse.setValue(0);
        hitPulse.setValue(0);
        enemyAttackPulse.setValue(0);
        dragonHitPulse.setValue(0);
      }
      return;
    }

    breathPulse.stopAnimation();
    hitPulse.stopAnimation();
    enemyAttackPulse.stopAnimation();
    dragonHitPulse.stopAnimation();
    breathPulse.setValue(0);
    hitPulse.setValue(0);
    enemyAttackPulse.setValue(0);
    dragonHitPulse.setValue(0);
    const attackAnimation = Animated.sequence([
      Animated.timing(breathPulse, { toValue: 0.3, duration: 60, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(breathPulse, { toValue: 1, duration: 165, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(24),
          Animated.timing(hitPulse, { toValue: 1, duration: 60, useNativeDriver: true }),
          Animated.timing(hitPulse, { toValue: 0, duration: 70, useNativeDriver: true })
        ])
      ]),
      Animated.delay(10),
      Animated.parallel([
        Animated.timing(enemyAttackPulse, { toValue: 1, duration: 175, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(36),
          Animated.timing(dragonHitPulse, { toValue: 1, duration: 55, useNativeDriver: true }),
          Animated.timing(dragonHitPulse, { toValue: 0, duration: 70, useNativeDriver: true })
        ])
      ])
    ]);

    attackAnimation.start(({ finished }) => {
      if (finished) {
        breathPulse.setValue(0);
        enemyAttackPulse.setValue(0);
        dragonHitPulse.setValue(0);
      }
    });

    return () => {
      attackAnimation.stop();
    };
  }, [breathPulse, dragonHitPulse, enemyAttackPulse, hitPulse, reducedMotion, state.autoBattle.defeatedCount, state.autoBattle.enemyHp]);

  const glowStyle = reducedMotion
    ? undefined
    : {
      opacity: breathPulse.interpolate({ inputRange: [0, 0.3, 0.72, 1], outputRange: [0, 0.95, 0.5, 0] }),
      transform: [{ scale: breathPulse.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.48, 1.42, 0.78] }) }]
    };
  const enemySpriteStyle = reducedMotion
    ? undefined
    : {
      transform: [
        { translateY: enemyIdle.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) },
        { rotate: enemyIdle.interpolate({ inputRange: [0, 1], outputRange: ["-0.8deg", "1.4deg"] }) },
        { scale: enemyIdle.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] }) }
      ]
    };
  const enemyHitStyle = reducedMotion
    ? undefined
    : {
      transform: [
        { translateY: enemyIdle.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
        { translateX: hitPulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -14, 0] }) },
        { translateX: enemyAttackPulse.interpolate({ inputRange: [0, 0.42, 1], outputRange: [0, 42, 0] }) },
        { rotate: hitPulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["0deg", "-2deg", "0deg"] }) },
        { scale: hitPulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.09, 1] }) },
        { scale: enemyAttackPulse.interpolate({ inputRange: [0, 0.42, 1], outputRange: [1, 1.14, 1] }) }
      ]
    };
  const hitFlashStyle = reducedMotion
    ? undefined
    : {
      opacity: hitPulse.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, 0.55, 0] })
    };
  const dragonTurnLabelStyle = reducedMotion
    ? undefined
    : {
      opacity: breathPulse.interpolate({ inputRange: [0, 0.08, 0.46, 0.66], outputRange: [0, 1, 1, 0] }),
      transform: [{ translateY: breathPulse.interpolate({ inputRange: [0, 0.46, 1], outputRange: [8, 0, -4] }) }]
    };
  const enemyHitLabelStyle = reducedMotion
    ? undefined
    : {
      opacity: hitPulse.interpolate({ inputRange: [0, 0.28, 1], outputRange: [0, 1, 0] }),
      transform: [{ scale: hitPulse.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.92, 1.06, 1] }) }]
    };
  const enemyTurnLabelStyle = reducedMotion
    ? undefined
    : {
      opacity: enemyAttackPulse.interpolate({ inputRange: [0, 0.08, 0.72, 1], outputRange: [0, 1, 1, 0] }),
      transform: [{ translateX: enemyAttackPulse.interpolate({ inputRange: [0, 0.42, 1], outputRange: [-6, 0, 8] }) }]
    };
  const enemyStrikeStyle = reducedMotion
    ? undefined
    : {
      opacity: enemyAttackPulse.interpolate({ inputRange: [0, 0.12, 0.62, 1], outputRange: [0, 1, 0.85, 0] }),
      transform: [
        { translateX: enemyAttackPulse.interpolate({ inputRange: [0, 1], outputRange: [-20, 160] }) },
        { translateY: enemyAttackPulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -16, 6] }) },
        { scale: enemyAttackPulse.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.72, 1.1, 0.9] }) },
        { rotate: "-14deg" }
      ]
    };
  const dragonHpCardStyle = reducedMotion
    ? undefined
    : {
      transform: [
        { translateX: dragonHitPulse.interpolate({ inputRange: [0, 0.35, 0.7, 1], outputRange: [0, -5, 5, 0] }) },
        { scale: dragonHitPulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.035, 1] }) }
      ]
    };
  const dragonHitFlashStyle = reducedMotion
    ? undefined
    : {
      opacity: dragonHitPulse.interpolate({ inputRange: [0, 0.38, 1], outputRange: [0, 0.52, 0] })
    };
  const dragonBraceLabelStyle = reducedMotion
    ? undefined
    : {
      opacity: enemyAttackPulse.interpolate({ inputRange: [0, 0.34, 0.78, 1], outputRange: [0, 0, 1, 0] }),
      transform: [{ scale: enemyAttackPulse.interpolate({ inputRange: [0, 0.62, 1], outputRange: [0.92, 1.04, 1] }) }]
    };
  const critBadgeStyle = reducedMotion
    ? undefined
    : {
      opacity: hitPulse.interpolate({ inputRange: [0, 0.18, 0.7, 1], outputRange: [0, 1, 1, 0] }),
      transform: [
        { translateY: hitPulse.interpolate({ inputRange: [0, 0.42, 1], outputRange: [10, -4, -14] }) },
        { scale: hitPulse.interpolate({ inputRange: [0, 0.36, 1], outputRange: [0.9, 1.12, 1] }) }
      ]
    };
  const defenseBadgeStyle = reducedMotion
    ? undefined
    : {
      opacity: enemyAttackPulse.interpolate({ inputRange: [0, 0.24, 0.82, 1], outputRange: [0, 1, 1, 0] }),
      transform: [{ translateY: enemyAttackPulse.interpolate({ inputRange: [0, 0.46, 1], outputRange: [8, 0, -8] }) }]
    };

  return (
    <View pointerEvents="none" style={styles.fireBreathCombatLayer}>
      {!reducedMotion ? <Animated.View style={[styles.fireBreathMouthGlow, { backgroundColor: combatFx.glowColor }, glowStyle]} /> : null}
      {!reducedMotion ? <FireBreathParticleTrail progress={breathPulse} element={element} /> : null}
      {!reducedMotion ? <Animated.Text numberOfLines={2} style={[styles.combatTurnLabel, styles.combatTurnLabelDragon, dragonTurnLabelStyle]}>{state.dragon.path ? getDragonPathCombatCue(dragonPathDefinitions[state.dragon.path]) : "Dragon attacks"}</Animated.Text> : null}
      {!reducedMotion ? <Animated.Text numberOfLines={2} style={[styles.combatTurnLabel, styles.combatTurnLabelEnemyHit, enemyHitLabelStyle]}>{state.dragon.path ? getDragonPathHitCue(dragonPathDefinitions[state.dragon.path]) : combatFx.enemyHitLabel}</Animated.Text> : null}
      {!reducedMotion ? <Animated.Text numberOfLines={1} style={[styles.combatStatFxBadge, styles.combatStatFxBadgeCrit, critBadgeStyle]}>{critBadgeLabel}</Animated.Text> : null}
      {!reducedMotion ? <Animated.Text style={[styles.combatTurnLabel, styles.combatTurnLabelEnemy, enemyTurnLabelStyle]}>Enemy attacks</Animated.Text> : null}
      {!reducedMotion ? <Animated.Text numberOfLines={2} style={[styles.combatTurnLabel, styles.combatTurnLabelDragonBrace, dragonBraceLabelStyle]}>{state.dragon.path ? getDragonPathBraceCue(dragonPathDefinitions[state.dragon.path]) : combatFx.braceLabel}</Animated.Text> : null}
      {!reducedMotion ? <Animated.Text numberOfLines={1} style={[styles.combatStatFxBadge, styles.combatStatFxBadgeDodge, defenseBadgeStyle]}>{dodgeBadgeLabel}</Animated.Text> : null}
      {!reducedMotion ? <Animated.Text numberOfLines={1} style={[styles.combatStatFxBadge, styles.combatStatFxBadgeBlock, defenseBadgeStyle]}>{blockBadgeLabel}</Animated.Text> : null}
      {!reducedMotion ? <Animated.View style={[styles.enemyStrikeSlash, enemyStrikeStyle]}><Text style={styles.enemyStrikeSlashText}>⚔</Text></Animated.View> : null}
      <Animated.View style={[styles.fireBreathDragonHpCard, dragonHpCardStyle]}>
        {!reducedMotion ? <Animated.View style={[styles.fireBreathDragonHitFlash, dragonHitFlashStyle]} /> : null}
        <Text style={styles.fireBreathDragonName}>Dragon HP</Text>
        <View style={styles.fireBreathDragonHpTrack}>
          <View style={[styles.fireBreathDragonHpFill, { backgroundColor: combatFx.hpColor, width: `${dragonHpPercent}%` as any }]} />
        </View>
        <Text style={styles.fireBreathDragonMeta}>{dragonMaxHp}/{dragonMaxHp} • DEF {state.dragon.stats.defense}</Text>
      </Animated.View>
      <Animated.View style={[styles.fireBreathEnemyCard, enemyHitStyle]}>
        <View style={styles.fireBreathEnemyShadow} />
        <Animated.View style={[styles.fireBreathEnemySpriteFrame, enemySpriteStyle]}>
          <Image source={enemyImages[enemyImageKey]} style={styles.fireBreathEnemyImage} resizeMode="contain" />
        </Animated.View>
        {!reducedMotion ? <Animated.View style={[styles.fireBreathHitSparks, { borderColor: combatFx.hitColor, backgroundColor: combatFx.hitColor }, hitFlashStyle]} /> : null}
        <Text style={styles.fireBreathEnemyName} numberOfLines={1}>{state.autoBattle.enemyName}</Text>
        <View style={styles.fireBreathHpTrack}>
          <View style={[styles.fireBreathHpFill, { backgroundColor: combatFx.hpColor, width: `${enemyHpPercent}%` as any }]} />
        </View>
        <Text style={styles.fireBreathEnemyMeta}>Defeated {state.autoBattle.defeatedCount}</Text>
      </Animated.View>
    </View>
  );
}

function QuestProgressList({ state }: { state: GameState }) {
  return (
    <View style={styles.questRows}>
      {idleQuestOrder.map((questId) => {
        const quest = idleQuestDefinitions[questId];
        const progress = Math.min(state.idleQuestProgress[questId] ?? 0, quest.target);
        const percent = `${Math.round((progress / quest.target) * 100)}%`;
        return (
          <View key={questId} style={styles.questRow}>
            <View style={styles.questRowTop}>
              <Text style={styles.questTitle}>{quest.title}</Text>
              <Text style={styles.questCount}>
                {progress}/{quest.target}
              </Text>
            </View>
            <View style={styles.questTrack}>
              <View style={[styles.questFill, { width: percent as any }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function TreasureInventory({ state }: { state: GameState }) {
  const totalTreasures = treasureOrder.reduce((total, treasureId) => total + (state.treasures[treasureId] ?? 0), 0);
  if (totalTreasures === 0) {
    return <EmptyState title="No treasures yet" detail="Auto battles and quests can uncover your first relic." />;
  }

  return (
    <View style={styles.treasureInventory}>
      {treasureOrder.filter((treasureId) => (state.treasures[treasureId] ?? 0) > 0).map((treasureId) => {
        const treasure = treasureDefinitions[treasureId];
        const count = state.treasures[treasureId] ?? 0;
        const rarity = treasureRarityDefinitions[treasure.rarity];
        return (
          <View key={treasureId} style={[styles.treasureChip, { borderColor: rarity.color }]}>
            <Text style={styles.treasureName}>
              {treasure.name} x{count}
            </Text>
            <Text style={[styles.treasureRarity, { color: rarity.color }]}>{rarity.label}</Text>
            <Text style={styles.treasureBonus}>{treasure.bonus}</Text>
          </View>
        );
      })}
    </View>
  );
}

function TreasureCollectionLog({ state }: { state: GameState }) {
  return (
    <View style={styles.collectionLog}>
      {treasureOrder.map((treasureId) => {
        const treasure = treasureDefinitions[treasureId];
        const rarity = treasureRarityDefinitions[treasure.rarity];
        const count = state.treasures[treasureId] ?? 0;
        const discovered = count > 0;
        return (
          <View key={treasureId} style={[styles.collectionRow, !discovered && styles.collectionRowLocked]}>
            <View style={styles.progressRewardCopy}>
              <Text style={[styles.traitTitle, !discovered && styles.collectionLockedText]}>{discovered ? treasure.name : "???"}</Text>
              <Text style={[styles.treasureRarity, { color: discovered ? rarity.color : uiTheme.colors.faint }]}>{rarity.label}</Text>
              <Text style={[styles.traitText, !discovered && styles.collectionLockedText]}>{discovered ? treasure.bonus : "Undiscovered treasure"}</Text>
            </View>
            <Text style={[styles.questCount, discovered && { color: rarity.color }]}>x{count}</Text>
          </View>
        );
      })}
    </View>
  );
}

function EquipmentPanel({
  state,
  onEquipItem,
  onSellItem
}: {
  state: GameState;
  onEquipItem: (itemId: string) => void;
  onSellItem: (itemId: string) => void;
}) {
  return (
    <View style={styles.equipmentPanel}>
      <Text style={styles.equipmentSubhead}>Equipped</Text>
      <View style={styles.equipmentList}>
        {equipmentSlots.map((slot) => {
          const item = state.equippedItems[slot];
          return item ? (
            <EquipmentRow key={slot} item={item} slot={slot} equipped onSellItem={onSellItem} />
          ) : (
            <View key={slot} style={styles.equipmentEmptySlot}>
              <Text style={styles.equipmentSlotLabel}>{equipmentSlotLabels[slot]}</Text>
              <Text style={styles.equipmentEmptyText}>Empty slot</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.equipmentSubhead}>Inventory</Text>
      {state.equipmentInventory.length > 0 ? (
        <View style={styles.equipmentList}>
          {state.equipmentInventory.map((item) => (
            <EquipmentRow key={item.id} item={item} onEquipItem={onEquipItem} onSellItem={onSellItem} />
          ))}
        </View>
      ) : (
        <EmptyState title="No equipment drops yet" detail="Defeat enemies in Auto Battle for a chance at gear." />
      )}
    </View>
  );
}

function EquipmentRow({
  item,
  slot,
  equipped = false,
  onEquipItem,
  onSellItem
}: {
  item: EquipmentItem;
  slot?: EquipmentSlot;
  equipped?: boolean;
  onEquipItem?: (itemId: string) => void;
  onSellItem: (itemId: string) => void;
}) {
  const rarity = equipmentRarityDefinitions[item.rarity];
  const displaySlot = slot ?? item.slot;
  return (
    <View style={[styles.equipmentRow, equipped && styles.equipmentRowEquipped, { borderColor: rarity.color }]}>
      <View style={styles.progressRewardCopy}>
        <Text style={styles.equipmentSlotLabel}>{equipmentSlotLabels[displaySlot]}</Text>
        <Text style={styles.traitTitle}>{item.name}</Text>
        <Text style={[styles.equipmentRarityText, { color: rarity.color }]}>{rarity.label}</Text>
        <Text style={styles.traitText}>{formatEquipmentBonus(item)}</Text>
      </View>
      <View style={styles.equipmentActions}>
        {!equipped && onEquipItem ? (
          <Pressable onPress={() => onEquipItem(item.id)} style={styles.claimButton}>
            <Text style={styles.claimButtonText}>Equip</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={() => onSellItem(item.id)} style={styles.equipmentSellButton}>
          <Text style={styles.equipmentSellText}>Sell +{item.sellValue}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatEquipmentBonus(item: EquipmentItem) {
  return `+${item.bonusPercent}% ${equipmentBonusLabels[item.bonusType]}`;
}

function IdleUpgradeCard({
  upgradeId,
  state,
  activeSparkle,
  onBuy
}: {
  upgradeId: IdleUpgradeId;
  state: GameState;
  activeSparkle: boolean;
  onBuy: () => void;
}) {
  const press = useRef(new Animated.Value(0)).current;
  const upgrade = idleUpgradeDefinitions[upgradeId];
  const level = state.idleUpgrades[upgradeId] ?? 0;
  const cap = getIdleUpgradeCap(state, upgradeId);
  const safeCap = Number.isFinite(cap) ? cap : 0;
  const capped = safeCap > 0 && level >= safeCap;
  const cost = getIdleUpgradeCost(state, upgradeId);
  const safeCost = Number.isFinite(cost) ? cost : 0;
  const lootBonus = Number.isFinite(upgrade?.adventureLootBonus) ? upgrade.adventureLootBonus : 0;
  const disabled = state.player.essence < safeCost || capped;

  const buy = () => {
    if (disabled) {
      return;
    }

    if (!state.settings.reducedMotion) {
      press.setValue(0);
      Animated.sequence([
        Animated.timing(press, { toValue: 1, duration: 110, useNativeDriver: true }),
        Animated.timing(press, { toValue: 0, duration: 170, useNativeDriver: true })
      ]).start();
    }
    onBuy();
  };

  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] });

  return (
    <Animated.View style={[styles.upgradeCardWrap, { transform: [{ scale }] }]}>
      {activeSparkle && !state.settings.reducedMotion ? <SafeLottie source={evolutionBurstEffect} autoPlay loop={false} style={styles.upgradeSparkle} /> : null}
      <Pressable onPress={buy} disabled={disabled} style={[styles.idleUpgradeCard, disabled && styles.disabledUpgradeCard]}>
        <Text style={styles.idleUpgradeName}>{upgrade?.name ?? "Training Upgrade"}</Text>
        <Text style={styles.idleUpgradeLevel}>
          Level {formatGameNumber(level, state.settings.numberFormat)}/{formatGameNumber(safeCap, state.settings.numberFormat)}
        </Text>
        <Text style={styles.idleUpgradeBonus}>+{formatGameNumber(lootBonus, state.settings.numberFormat)} loot score</Text>
        <Text style={styles.idleUpgradeCost}>{capped ? "Evolve to unlock more levels" : `${formatGameNumber(safeCost, state.settings.numberFormat)} Essence`}</Text>
      </Pressable>
    </Animated.View>
  );
}

function ElementBonusCard({ element, questIntervalMs }: { element: DragonElement; questIntervalMs: number }) {
  const theme = elementTheme[element];
  const bonus = elementBonusDefinitions[element];
  return (
    <View style={[styles.elementBonusCard, { borderColor: theme.primary }]}>
      <View>
        <Text style={styles.choiceNumber}>Element Bonus</Text>
        <Text style={[styles.elementBonusTitle, { color: theme.secondary }]}>{bonus.title}</Text>
      </View>
      <Text style={styles.elementBonusText}>{bonus.bonuses.join("  |  ")}</Text>
      <Text style={styles.elementBonusMeta}>Quest action every {questIntervalMs / 1000}s</Text>
    </View>
  );
}

function EvolutionTraitCard({ state }: { state: GameState }) {
  const trait = getSelectedEvolutionTrait(state);
  if (!trait) {
    return (
      <View style={styles.evolutionTraitCard}>
        <Text style={styles.choiceNumber}>Evolution Trait</Text>
        <Text style={styles.traitTitle}>Choose a Drake path</Text>
        <Text style={styles.traitText}>Your first branch unlocks when evolving from Hatchling to Drake.</Text>
      </View>
    );
  }

  return (
    <View style={styles.evolutionTraitCard}>
      <Text style={styles.choiceNumber}>Evolution Trait</Text>
      <Text style={styles.traitTitle}>{trait.name}</Text>
      <Text style={styles.traitText}>{trait.bonus}</Text>
    </View>
  );
}

function EvolutionChoiceModal({
  visible,
  element,
  onClose,
  onChoose
}: {
  visible: boolean;
  element: DragonElement;
  onClose: () => void;
  onChoose: (traitId: EvolutionTraitId) => void;
}) {
  const theme = elementTheme[element];
  const choices = evolutionTraitDefinitions[element];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalScrim}>
        <View style={styles.evolutionModal}>
          <Text style={styles.choiceNumber}>Choose Evolution Branch</Text>
          <Text style={[styles.modalTitle, { color: theme.secondary }]}>Drake Path</Text>
          <Text style={styles.bodyText}>Pick one build trait. It will be saved and applied to your idle bonuses.</Text>
          <View style={styles.traitChoiceRow}>
            {choices.map((choice) => (
              <Pressable key={choice.id} onPress={() => onChoose(choice.id)} style={[styles.traitChoiceCard, { borderColor: theme.primary }]}>
                <Text style={styles.traitChoiceName}>{choice.name}</Text>
                <Text style={styles.traitChoiceBonus}>{choice.bonus}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={onClose} style={styles.modalCancelButton}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function ReincarnationPanel({ state, onPress }: { state: GameState; onPress: () => void }) {
  const unlocked = canReincarnate(state);
  const soulsGained = getReincarnationSoulsGained(state);
  const bonusPercent = Math.round((getDragonSoulMultiplier(state) - 1) * 100);
  return (
    <View style={styles.reincarnationPanel}>
      <View>
        <Text style={styles.choiceNumber}>Reincarnation</Text>
        <Text style={styles.reincarnationTitle}>{state.dragonSouls} Dragon Souls</Text>
        <Text style={styles.traitText}>Permanent essence bonus: +{bonusPercent}%</Text>
      </View>
      <View style={styles.reincarnationAction}>
        <Text style={styles.reincarnationGain}>{unlocked ? `+${soulsGained} souls now` : "Reach Wyrm to unlock Rebirth"}</Text>
        <Pressable onPress={onPress} disabled={!unlocked} style={[styles.reincarnationButton, !unlocked && styles.disabledUpgradeCard]}>
          <Text style={styles.reincarnationButtonText}>{unlocked ? "Reincarnate" : "Reach Wyrm"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ReincarnationConfirmModal({
  visible,
  state,
  onClose,
  onConfirm
}: {
  visible: boolean;
  state: GameState;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const soulsGained = getReincarnationSoulsGained(state);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalScrim}>
        <View style={styles.evolutionModal}>
          <Text style={styles.choiceNumber}>Confirm Reincarnation</Text>
          <Text style={styles.modalTitle}>Begin Again Stronger?</Text>
          <Text style={styles.bodyText}>
            This resets essence, stage, element, upgrades, area progress, quest progress, and evolution trait. Treasures stay.
          </Text>
          <Text style={styles.reincarnationModalReward}>Gain {soulsGained} Dragon Souls</Text>
          <View style={styles.modalButtonRow}>
            <Pressable onPress={onClose} style={styles.modalSecondaryButton}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.modalPrimaryButton}>
              <Text style={styles.evolveButtonText}>Reincarnate</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AutoBattlePanel({ state }: { state: GameState }) {
  const hpPercent = `${Math.round((state.autoBattle.enemyHp / state.autoBattle.enemyMaxHp) * 100)}%`;
  const rewardEssence = getBattleRewardEssence(state);
  const damage = getBattleDamage(state);
  const power = getDragonPower(state);
  const flavor =
    state.dragon.element === "fire"
      ? "Fire damage +15%"
      : state.dragon.element === "water"
        ? "Victories restore a calm ward"
        : "Battle essence rewards +10%";

  return (
    <View style={styles.autoBattlePanel}>
      <View style={styles.autoBattleHeader}>
        <View>
          <Text style={styles.choiceNumber}>Auto Battle</Text>
          <Text style={styles.autoBattleEnemy}>{state.autoBattle.enemyName}</Text>
        </View>
        <Text style={styles.autoBattlePower}>Power {power}</Text>
      </View>
      <View style={styles.enemyHpTrack}>
        <View style={[styles.enemyHpFill, { width: hpPercent as any }]} />
      </View>
      <View style={styles.autoBattleFooter}>
        <Text style={styles.autoBattleText}>
          HP {state.autoBattle.enemyHp}/{state.autoBattle.enemyMaxHp} | Defeated {state.autoBattle.defeatedCount}
        </Text>
        <Text style={styles.autoBattleText}>Hit {damage} | Reward +{rewardEssence} essence</Text>
      </View>
      <Text style={styles.autoBattleFlavor}>{flavor}</Text>
    </View>
  );
}

function AchievementsModal({
  visible,
  state,
  onClose,
  onClaim
}: {
  visible: boolean;
  state: GameState;
  onClose: () => void;
  onClaim: (achievementId: keyof typeof achievementDefinitions) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalScrim}>
        <View style={styles.progressModal}>
          <Text style={styles.choiceNumber}>Achievements</Text>
          <Text style={styles.modalTitle}>Milestones</Text>
          <ScrollView style={styles.progressModalList}>
            {achievementOrder.map((achievementId) => {
              const achievement = achievementDefinitions[achievementId];
              const unlocked = state.unlockedAchievements.includes(achievementId);
              const claimed = state.claimedAchievements.includes(achievementId);
              return (
                <View key={achievementId} style={[styles.progressRewardRow, !unlocked && styles.lockedRewardRow]}>
                  <View style={styles.progressRewardCopy}>
                    <Text style={styles.traitTitle}>{achievement.title}</Text>
                    <Text style={styles.traitText}>{achievement.description}</Text>
                    <Text style={styles.rewardSummaryText}>{formatReward(achievement.reward)}</Text>
                  </View>
                  <Pressable onPress={() => onClaim(achievementId)} disabled={!unlocked || claimed} style={[styles.claimButton, (!unlocked || claimed) && styles.disabledUpgradeCard]}>
                    <Text style={styles.claimButtonText}>{claimed ? "Claimed" : unlocked ? "Claim" : "Locked"}</Text>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
          <Pressable onPress={onClose} style={styles.modalCancelButton}>
            <Text style={styles.modalCancelText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function DailyGoalsModal({
  visible,
  state,
  onClose,
  onClaim
}: {
  visible: boolean;
  state: GameState;
  onClose: () => void;
  onClaim: (goalId: keyof typeof dailyGoalDefinitions) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalScrim}>
        <View style={styles.progressModal}>
          <Text style={styles.choiceNumber}>Daily Goals</Text>
          <Text style={styles.modalTitle}>Today</Text>
          <Text style={styles.traitText}>Resets: {state.dailyResetDate}</Text>
          <ScrollView style={styles.progressModalList}>
            {dailyGoalOrder.map((goalId) => {
              const goal = dailyGoalDefinitions[goalId];
              const progress = state.dailyGoals[goalId] ?? { progress: 0, claimed: false };
              const ready = progress.progress >= goal.target;
              return (
                <View key={goalId} style={styles.progressRewardRow}>
                  <View style={styles.progressRewardCopy}>
                    <Text style={styles.traitTitle}>{goal.title}</Text>
                    <Text style={styles.traitText}>
                      {Math.min(progress.progress, goal.target)} / {goal.target}
                    </Text>
                    <View style={styles.questTrack}>
                      <View style={[styles.questFill, { width: `${Math.round((Math.min(progress.progress, goal.target) / goal.target) * 100)}%` as any }]} />
                    </View>
                    <Text style={styles.rewardSummaryText}>{formatReward(goal.reward)}</Text>
                  </View>
                  <Pressable onPress={() => onClaim(goalId)} disabled={!ready || progress.claimed} style={[styles.claimButton, (!ready || progress.claimed) && styles.disabledUpgradeCard]}>
                    <Text style={styles.claimButtonText}>{progress.claimed ? "Claimed" : ready ? "Claim" : "Progress"}</Text>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
          <Pressable onPress={onClose} style={styles.modalCancelButton}>
            <Text style={styles.modalCancelText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function formatReward(reward: { essence?: number; dragonSouls?: number; shards?: Partial<Record<DragonElement, number>> }, numberFormat: GameSettings["numberFormat"] = "compact") {
  const parts = [
    reward.essence ? `+${formatGameNumber(reward.essence, numberFormat)} essence` : null,
    reward.dragonSouls ? `+${formatGameNumber(reward.dragonSouls, numberFormat)} souls` : null,
    reward.shards
      ? (Object.entries(reward.shards) as Array<[DragonElement, number]>)
          .map(([element, amount]) => `+${formatGameNumber(amount, numberFormat)} ${element} shard`)
          .join(", ")
      : null
  ].filter(Boolean);
  return parts.join(" | ");
}

function AdventureQuestPanel({ state }: { state: GameState }) {
  const area = areaDefinitions[state.currentArea];
  const questIntervalSeconds = getQuestIntervalMs(state) / 1000;
  return (
    <View style={styles.adventureQuestPanel}>
      <View style={styles.adventurePanelHeader}>
        <View>
          <Text style={styles.choiceNumber}>Current Area</Text>
          <Text style={styles.adventureAreaName}>{area.name}</Text>
        </View>
        <Text style={styles.adventureTimerText}>Auto quest: {questIntervalSeconds}s</Text>
      </View>

      <View style={styles.questRows}>
        {idleQuestOrder.map((questId) => {
          const quest = idleQuestDefinitions[questId];
          const progress = Math.min(state.idleQuestProgress[questId] ?? 0, quest.target);
          const percent = `${Math.round((progress / quest.target) * 100)}%`;
          return (
            <View key={questId} style={styles.questRow}>
              <View style={styles.questRowTop}>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <Text style={styles.questCount}>
                  {progress}/{quest.target}
                </Text>
              </View>
              <View style={styles.questTrack}>
                <View style={[styles.questFill, { width: percent as any }]} />
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.treasureInventory}>
        {treasureOrder.map((treasureId) => {
          const treasure = treasureDefinitions[treasureId];
          const count = state.treasures[treasureId] ?? 0;
          return (
            <View key={treasureId} style={styles.treasureChip}>
              <Text style={styles.treasureName}>{treasure.name} x{count}</Text>
              <Text style={styles.treasureBonus}>{treasure.bonus}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function shouldShowLootPopup(_event: LootEvent | null | undefined) {
  return false;
}

function LootPopup({ event }: { event: LootEvent }) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    float.setValue(0);
    Animated.timing(float, { toValue: 1, duration: 2400, useNativeDriver: true }).start();
  }, [event.id, float]);

  const opacity = float.interpolate({ inputRange: [0, 0.12, 0.82, 1], outputRange: [0, 1, 1, 0] });
  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [12, -24] });

  return (
    <Animated.View style={[styles.lootPopup, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.lootPopupTitle}>{event.equipmentId ? "Equipment Found!" : event.treasureId ? "Treasure Found!" : event.shard ? "Shard Found!" : "Route Reward"}</Text>
      <Text style={styles.lootPopupText}>{event.message}</Text>
    </Animated.View>
  );
}

function ReturnPresenceToast({ state, presence, phase }: { state: GameState; presence: GameState["returnPresence"]; phase: ReturnPresencePhase }) {
  const theme = state.dragon.element ? elementTheme[state.dragon.element] : elementTheme.fire;
  const numberFormat = state.settings.numberFormat;
  const showReward = phase === "rewards" && presence.offlineReward > 0;
  const copy =
    phase === "sleeping"
      ? "Resting..."
      : phase === "waking"
        ? "..."
        : phase === "greeting"
          ? presence.line
          : showReward
            ? `Brought back +${formatGameNumber(presence.offlineReward, numberFormat)} Essence`
            : presence.line;

  return (
    <View style={[styles.returnPresenceToast, { borderColor: theme.primary }]}>
      <Text style={[styles.returnPresenceEmote, { color: theme.secondary }]}>{phase === "sleeping" ? "Zzz" : phase === "waking" ? "!" : "♡"}</Text>
      <Text style={styles.returnPresenceText}>{copy}</Text>
    </View>
  );
}

function PresenceDebugOverlay({
  overrides,
  returnPhase,
  idleElement,
  anticipationLevel,
  returnLine
}: {
  overrides: PresenceTestOverrides;
  returnPhase: ReturnPresencePhase | "complete";
  idleElement: DragonElement;
  anticipationLevel: AnticipationLevel;
  returnLine: string;
}) {
  const forcedStates = [
    overrides.returnPresence ? `Simulated Return: ${formatPresenceAwayDuration(overrides.returnPresence.awayDurationMs)}` : null,
    overrides.idleElement ? `Forced Element Idle: ${capitalizeElement(overrides.idleElement)}` : null,
    overrides.anticipationLevel === "alert" ? "Forced Anticipation: 80%" : overrides.anticipationLevel === "excited" ? "Forced Anticipation: 95%" : null
  ].filter(Boolean);

  return (
    <View pointerEvents="none" style={styles.presenceDebugOverlay}>
      <Text style={styles.presenceDebugTitle}>TEST MODE</Text>
      <Text style={styles.presenceDebugText}>State: {forcedStates.join(" | ") || "None"}</Text>
      <Text style={styles.presenceDebugText}>Return: {formatReturnPhase(returnPhase)}</Text>
      <Text style={styles.presenceDebugText}>Idle: {capitalizeElement(idleElement)}</Text>
      <Text style={styles.presenceDebugText}>Anticipation: {anticipationLevel}</Text>
      <Text style={styles.presenceDebugText}>Line: {returnLine || "None"}</Text>
    </View>
  );
}

function PresenceVisualCue({
  overrides,
  returnPhase,
  idleElement,
  anticipationLevel,
  returnLine
}: {
  overrides: PresenceTestOverrides;
  returnPhase: ReturnPresencePhase | "complete";
  idleElement: DragonElement;
  anticipationLevel: AnticipationLevel;
  returnLine: string;
}) {
  const returnCue =
    overrides.returnPresence && returnPhase === "sleeping"
      ? "Zzz..."
      : overrides.returnPresence && returnPhase === "waking"
        ? "stretch..."
        : overrides.returnPresence && returnPhase === "greeting"
          ? returnLine
          : null;
  const anticipationCue = overrides.anticipationLevel === "excited" ? "I'm almost ready!" : overrides.anticipationLevel === "alert" ? "Something feels different..." : null;
  const idleCue = overrides.idleElement === "fire" ? "🔥 restless" : overrides.idleElement === "water" ? "💧 drifting" : overrides.idleElement === "earth" ? "⛰️ grounded" : null;
  const cue = returnCue ?? anticipationCue ?? idleCue;

  if (!cue) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.presenceVisualCue}>
      <Text style={styles.presenceVisualCueText}>{cue}</Text>
    </View>
  );
}

function capitalizeElement(element: DragonElement) {
  return `${element[0].toUpperCase()}${element.slice(1)}`;
}

function formatReturnPhase(phase: ReturnPresencePhase | "complete") {
  return phase === "sleeping" ? "resting" : phase;
}

function formatPresenceAwayDuration(awayDurationMs: number) {
  return awayDurationMs >= 60 * 60 * 1000 ? "1 hour" : `${Math.round(awayDurationMs / 60000)} min`;
}


function TabBar({ active, dispatch }: { active: ScreenKey; dispatch: (action: GameAction) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => dispatch({ type: "setScreen", screen: tab.key })}
          style={[styles.tab, active === tab.key && styles.activeTab]}
        >
          <Text style={[styles.tabText, active === tab.key && styles.activeTabText]}>{tab.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function EggScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  const answeredCount = Object.keys(state.eggAnswers).length;
  const canHatch = answeredCount === eggChoices.length;
  const previewElement = useMemo(() => getLeadingEggElement(state), [state]);
  const previewTheme = elementTheme[previewElement];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>Shape the egg</Text>
      <Text style={styles.bodyText}>
        Your first choices decide whether the egg awakens as fire, water, or earth. Pick the instincts that feel right.
      </Text>

      <ImageBackground source={eggImages[previewElement]} style={styles.eggHero} imageStyle={styles.eggHeroImage}>
        <LinearGradient colors={["rgba(8,6,17,0.05)", "rgba(8,6,17,0.95)"]} style={styles.eggHeroOverlay}>
          <Text style={styles.choiceNumber}>Current resonance</Text>
          <Text style={[styles.eggHeroTitle, { color: previewTheme.secondary }]}>{previewTheme.label} Egg</Text>
          <Text style={styles.eggHeroText}>
            The shell shifts as your choices gather around {previewTheme.label.toLowerCase()} energy.
          </Text>
        </LinearGradient>
      </ImageBackground>

      {eggChoices.map((choice, index) => (
        <View key={choice.id} style={styles.panel}>
          <Text style={styles.choiceNumber}>Choice {index + 1}</Text>
          <Text style={styles.panelTitle}>{choice.prompt}</Text>
          {choice.answers.map((answer) => {
            const selected = state.eggAnswers[choice.id] === answer.element;
            const theme = elementTheme[answer.element];
            return (
              <Pressable
                key={answer.id}
                onPress={() =>
                  dispatch({
                    type: "chooseEggAnswer",
                    choiceId: choice.id,
                    element: answer.element,
                    trait: answer.label
                  })
                }
                style={[styles.answerCard, selected && { borderColor: theme.primary, backgroundColor: theme.dark }]}
              >
                <ImageBackground source={eggImages[answer.element]} style={styles.answerImageBackground} imageStyle={styles.answerImage}>
                  <LinearGradient colors={["rgba(8,6,17,0.22)", "rgba(8,6,17,0.9)"]} style={styles.answerOverlay}>
                    <Text style={[styles.answerTitle, selected && { color: theme.secondary }]}>{answer.label}</Text>
                    <Text style={styles.answerDescription}>{answer.description}</Text>
                  </LinearGradient>
                </ImageBackground>
              </Pressable>
            );
          })}
        </View>
      ))}

      <PrimaryButton
        label={canHatch ? "Hatch your dragon" : `Choose ${eggChoices.length - answeredCount} more`}
        disabled={!canHatch}
        onPress={() => dispatch({ type: "hatchDragon" })}
      />
    </ScrollView>
  );
}

function DenScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  const form = getDragonForm(state.dragon.stage, state.dragon.element);
  const theme = state.dragon.element ? elementTheme[state.dragon.element] : elementTheme.fire;
  const evolutionCopy =
    state.dragon.stage === "wyrm" ? "Final form awakened" : `${state.dragon.evolution}% toward the next evolution`;

  return (
    <View>
      <Text style={styles.sectionTitle}>Dragon Den</Text>
      <View style={styles.panel}>
        <Text style={[styles.elementBadge, { color: theme.secondary }]}>{theme.label} Affinity</Text>
        <Text style={styles.panelTitle}>{form.name}</Text>
        <Text style={styles.bodyText}>{form.description}</Text>
        <ProgressBar progress={state.dragon.evolution / 100} color={theme.primary} label={evolutionCopy} />
      </View>
      <StatsGrid stats={state.dragon.stats} />
      <View style={styles.panel}>
        <Text style={styles.choiceNumber}>Chapter 1 • 60 stops</Text>
        <Text style={styles.panelTitle}>Ember Gate: prep → fight → chest</Text>
        <Text style={styles.bodyText}>Follow the Ember Gate road through prep stops, fights, elites, and chests. Build your hatchling now; true evolution waits for Chapter 10 Stop 10.</Text>
      </View>
      <View style={styles.row}>
        <PrimaryButton label="Start Chapter 1" onPress={() => dispatch({ type: "startAdventureRun", difficultyId: "hatchlingTrail", startStep: 1 })} />
        <SecondaryButton label="Upgrade" onPress={() => dispatch({ type: "setScreen", screen: "upgrade" })} />
      </View>
    </View>
  );
}

function AdventureScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  return <CapybaraAdventureBoard state={state} dispatch={dispatch} focused />;
}

function getAdventureNodeIcon(kind: AdventureNode["kind"]) {
  switch (kind) {
    case "battle":
      return "⚔️";
    case "elite":
      return "💢";
    case "treasure":
      return "🎁";
    case "shrine":
      return "🔮";
    case "camp":
      return "⛺";
    case "shop":
      return "🛒";
    case "boss":
      return "👑";
    default:
      return "•";
  }
}

function getAdventureNodeTone(kind: AdventureNode["kind"]) {
  switch (kind) {
    case "battle":
      return "#ff8a4d";
    case "elite":
      return "#ff5f7a";
    case "treasure":
      return "#f8d987";
    case "shrine":
      return "#b88cff";
    case "camp":
      return "#8fffd2";
    case "shop":
      return "#8ff7ff";
    case "boss":
      return "#ff3d55";
    default:
      return "#f8d987";
  }
}

function CapybaraAdventureBoard({
  state,
  dispatch,
  onReturnToDen,
  compact = false,
  focused = false
}: {
  state: GameState;
  dispatch?: (action: GameAction) => void;
  onReturnToDen?: () => void;
  compact?: boolean;
  focused?: boolean;
}) {
  const run = state.adventureRun;
  const element = state.dragon.element ?? "fire";
  const theme = elementTheme[element];
  const pendingNode = run?.pendingNodeId ? getAdventureNodeById(run.pendingNodeId) : null;
  const activeNode = pendingNode ?? run?.nodes.find((node) => node.step === run.step) ?? run?.nodes[0] ?? adventureNodes[0];
  const heroScene = activeNode?.scene ?? (run?.status === "complete" ? "boss" : "forest");
  const power = getDragonPower(state);
  const totalTreasures = treasureOrder.reduce((total, treasureId) => total + (state.treasures[treasureId] ?? 0), 0);
  const chapterMatch = run?.title.match(/Chapter (\d+)/);
  const chapterLabel = chapterMatch ? `Chapter ${chapterMatch[1]}` : "Chapter 1";
  const displayMaxSteps = run && chapterLabel === "Chapter 1" ? Math.max(run.maxSteps, 60) : run?.maxSteps;
  const progressLabel = run ? `${chapterLabel} • Stop ${run.step}/${displayMaxSteps}` : "Chapter 1 ready";
  const progress = run ? Math.min(1, Math.max(0, (run.step - 1) / (displayMaxSteps ?? run.maxSteps))) : 0;
  const chapterHpCurrent = run?.currentHp ?? state.dragon.stats.health;
  const chapterHpMax = run?.maxHp ?? state.dragon.stats.health;
  const chapterHpLabel = `Chapter HP ${chapterHpCurrent}/${chapterHpMax}`;
  const persistentChapterStats = [
    { label: "Health", value: `${chapterHpCurrent}/${chapterHpMax}` },
    { label: "Attack", value: `${state.dragon.stats.attack}` },
    { label: "Defense", value: `${state.dragon.stats.defense}` }
  ];
  const message = run?.message ?? "The Ember Gate opens. Choose a route stop and keep the hatchling moving.";
  const hasPendingSkillDraft = Boolean(state.lastSkillDraftOffer && !state.lastSkillDraftOffer.chosenSkillId && run?.status === "active");
  const isFightNode = activeNode.kind === "battle" || activeNode.kind === "elite" || activeNode.kind === "boss";
  const nextDifficultyId: AdventureDifficultyId = run?.status === "complete" ? getNextAdventureDifficultyId(run.difficultyId) : "hatchlingTrail";
  const nextChapterNumber = nextDifficultyId === "drakeExpedition" ? 2 : nextDifficultyId === "shadowVale" ? 3 : nextDifficultyId === "ancientRift" ? 10 : 1;
  const ctaLabel = !dispatch
    ? "Return to Den"
    : !run || run.status === "failed" || run.status === "complete"
      ? run?.status === "complete" ? `Start Chapter ${nextChapterNumber}` : "Begin Chapter 1"
      : pendingNode
        ? isFightNode
          ? "Fight enemy"
          : pendingNode.choices?.length ? "Choose" : pendingNode.kind === "shrine" ? "Pray" : pendingNode.kind === "camp" ? "Rest" : "Claim"
        : isFightNode
          ? "Fight"
          : "Enter Event";
  const ctaAction = () => {
    if (!dispatch) {
      onReturnToDen?.();
      return;
    }
    if (!run || run.status === "failed" || run.status === "complete") {
      dispatch({ type: "startAdventureRun", difficultyId: nextDifficultyId });
      return;
    }
    if (activeNode) {
      dispatch({ type: "selectAdventureNode", nodeId: activeNode.id });
    }
  };

  return (
    <View style={[styles.capybaraAdventureShell, compact && styles.capybaraAdventureShellCompact, focused && styles.capybaraAdventureShellFocused]}>
      <View style={[styles.capybaraTopHud, focused && styles.capybaraTopHudFocused]}>
        {!focused ? (
          <>
            <View style={styles.capybaraHudCapsule}>
              <Text style={styles.capybaraHudIcon}>⚡</Text>
              <View>
                <Text style={styles.capybaraHudLabel}>Power</Text>
                <Text style={styles.capybaraHudValue}>{formatGameNumber(power, state.settings.numberFormat)}</Text>
              </View>
            </View>
            <View style={[styles.capybaraHudCapsule, { borderColor: theme.primary }]}>
              <Text style={styles.capybaraHudIcon}>💎</Text>
              <View>
                <Text style={styles.capybaraHudLabel}>Loot</Text>
                <Text style={styles.capybaraHudValue}>{totalTreasures}</Text>
              </View>
            </View>
            <View style={[styles.capybaraHudCapsule, styles.capybaraHudCapsuleHp]}>
              <Text style={styles.capybaraHudIcon}>❤️</Text>
              <View>
                <Text style={styles.capybaraHudLabel}>Chapter HP</Text>
                <Text style={styles.capybaraHudValue}>{chapterHpCurrent}/{chapterHpMax}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.capybaraFocusedMiniHud}>
            <Text style={styles.capybaraFocusedMiniHudText}>{progressLabel}</Text>
            <Text style={[styles.capybaraFocusedMiniHudText, { color: theme.primary }]}>{theme.label} • {chapterHpLabel}</Text>
          </View>
        )}
        {dispatch ? (
          <Pressable onPress={() => dispatch({ type: "setScreen", screen: "den" })} style={styles.capybaraFocusedReturnPill}>
            <Text style={styles.capybaraFocusedReturnText}>Back to Den</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={[styles.persistentChapterStatsRow, focused && styles.persistentChapterStatsRowFocused]}>
        {persistentChapterStats.map((stat) => (
          <View key={stat.label} style={[styles.persistentChapterStatPill, stat.label === "Health" && styles.persistentChapterStatPillHealth]}>
            <Text style={styles.persistentChapterStatLabel}>{stat.label}</Text>
            <Text style={styles.persistentChapterStatValue}>{stat.value}</Text>
          </View>
        ))}
      </View>

      <ImageBackground source={sceneImages[heroScene]} style={[styles.capybaraSceneFrame, focused && styles.capybaraSceneFrameFocused]} imageStyle={styles.capybaraSceneImage}>
        <LinearGradient colors={["rgba(255,248,226,0.12)", "rgba(13,29,58,0.38)", "rgba(8,6,17,0.84)"]} style={styles.capybaraSceneScrim}>
          {!focused ? (
            <View style={styles.capybaraChapterRow}>
              <View style={styles.capybaraChapterBadge}>
                <Text style={styles.capybaraChapterText}>{progressLabel}</Text>
              </View>
              <View style={[styles.capybaraElementBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.elementChipText}>{theme.label}</Text>
              </View>
            </View>
          ) : null}
          <AdventureJourneyScene state={state} focused={focused} onReturnToDen={onReturnToDen ?? (() => dispatch?.({ type: "setScreen", screen: "den" }))} />
        </LinearGradient>
      </ImageBackground>

      {!focused ? <AdventureCombatLoopStrip activeStep={pendingNode && isFightNode ? "fight" : "route"} compact={focused} /> : null}
      {!focused ? <FocusedFireRouteBriefPanel /> : null}
      {!focused ? <WaterMoonwellRouteBriefPanel /> : null}
      {!focused ? <EarthCrystalCragRouteBriefPanel /> : null}
      {!focused ? <LightSunbeamSpiresRouteBriefPanel /> : null}
      {!focused ? <ProductiveWorkNowPanel /> : null}
      {!focused ? <V02UpdateObjectivePanel compact={focused} /> : null}

      {!focused ? (
        <View style={styles.capybaraProgressCard}>
          <View style={styles.capybaraProgressHeader}>
            <Text style={styles.capybaraBoardTitle}>{run?.status === "complete" ? "Rift Cleared" : run?.status === "failed" ? "Run Failed" : "Adventure Board"}</Text>
            <Text style={styles.capybaraBoardMeta}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.capybaraProgressTrack}>
            <View style={[styles.capybaraProgressFill, { backgroundColor: theme.primary, width: `${Math.max(8, progress * 100)}%` as any }]} />
          </View>
          <Text numberOfLines={2} style={styles.capybaraMessage}>{message}</Text>
          <AdventureNodeStrip nodes={run?.nodes ?? adventureNodes.slice(0, 8)} currentNode={activeNode} clearedNodeIds={run?.visitedNodeIds ?? []} />
        </View>
      ) : null}

      {hasPendingSkillDraft ? <AdventureSkillDraftCard state={state} dispatch={dispatch} focused={focused} /> : null}
      {!hasPendingSkillDraft ? <CurrentAdventureEventCard focused={focused} node={activeNode} runStatus={run?.status ?? "idle"} isPending={Boolean(pendingNode)} dispatch={dispatch} primaryLabel={ctaLabel} onPrimaryPress={ctaAction} /> : null}
      {(run?.status === "complete" || run?.status === "failed") && state.lastAdventureRewards ? <AdventureRewardRecap state={state} focused={focused} onReturnToDen={() => dispatch?.({ type: "setScreen", screen: "den" })} /> : null}
    </View>
  );
}

function ConciseAdventureStatusLine({ progressLabel, message, progress }: { progressLabel: string; message: string; progress: number }) {
  return (
    <View style={styles.conciseAdventureStatusLine}>
      <Text style={styles.conciseAdventureStatusTitle} numberOfLines={1}>{progressLabel}</Text>
      <Text style={styles.conciseAdventureStatusText} numberOfLines={1}>{message}</Text>
      <Text style={styles.conciseAdventureStatusPercent}>{Math.round(progress * 100)}%</Text>
    </View>
  );
}

function V02UpdateObjectivePanel({ compact = false }: { compact?: boolean }) {
  const objectives = Array.isArray(v02UpdateObjectives) ? v02UpdateObjectives : [];
  const completeCount = objectives.filter((objective) => objective.status === "implemented").length;
  const progress = completeCount / Math.max(1, objectives.length);

  return (
    <View style={[styles.v02DashboardPanel, compact && styles.v02DashboardPanelCompact]}>
      <View style={styles.v02DashboardHeader}>
        <View>
          <Text style={styles.v02DashboardKicker}>Version objectives</Text>
          <Text style={styles.v02DashboardTitle}>Isekai Dragons v0.2 — Adventure Path Update</Text>
        </View>
        <View style={styles.v02DashboardBadge}>
          <Text style={styles.v02DashboardBadgeText}>{completeCount}/{objectives.length}</Text>
        </View>
      </View>
      <Text style={styles.v02DashboardSummary}>Visual dashboard: adventure path, flashy combat, meaningful stats, Fire starter identity, skills, rewards, art direction, evolution preview, and automation.</Text>
      <View style={styles.v02DashboardTrack}>
        <View style={[styles.v02DashboardFill, { width: `${Math.round(progress * 100)}%` as any }]} />
      </View>
      <View style={styles.v02ObjectiveGrid}>
        {objectives.map((objective) => (
          <View key={objective.id} style={styles.v02ObjectiveCard}>
            <View style={styles.v02ObjectiveTopRow}>
              <Text style={styles.v02ObjectiveStatus}>✓</Text>
              <Text style={styles.v02ObjectiveTitle}>{objective.title}</Text>
            </View>
            {!compact ? <Text style={styles.v02ObjectiveProof}>{objective.playerProof}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function AdventureCombatLoopStrip({ activeStep, compact = false }: { activeStep: "route" | "fight" | "result"; compact?: boolean }) {
  const steps: Array<{ key: "route" | "fight" | "result"; label: string; detail: string; icon: string }> = [
    { key: "route", icon: "🗺️", label: "Adventure Route", detail: "Travel to the next stop" },
    { key: "fight", icon: "⚔️", label: "Combat Stop", detail: "Enemy blocks the path" },
    { key: "result", icon: "🎁", label: "Return Chest", detail: "Claim loot and grow" }
  ];

  if (compact) {
    const active = steps.find((step) => step.key === activeStep) ?? steps[0];
    return (
      <View style={[styles.adventureCombatLoopStrip, styles.adventureCombatLoopStripCompact]}>
        <Text style={styles.adventureCombatLoopKicker}>Loop: Route → Fight → Chest</Text>
        <View style={styles.adventureCombatLoopCompactActive}>
          <Text style={styles.adventureCombatLoopIcon}>{active.icon}</Text>
          <Text style={styles.adventureCombatLoopLabelActive}>{active.label}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.adventureCombatLoopStrip, compact && styles.adventureCombatLoopStripCompact]}>
      <Text style={styles.adventureCombatLoopKicker}>Dragon Expedition Loop</Text>
      <View style={styles.adventureCombatLoopSteps}>
        {steps.map((step) => {
          const active = step.key === activeStep;
          return (
            <View key={step.key} style={[styles.adventureCombatLoopStep, active && styles.adventureCombatLoopStepActive]}>
              <Text style={styles.adventureCombatLoopIcon}>{step.icon}</Text>
              <View style={styles.adventureCombatLoopCopy}>
                <Text style={[styles.adventureCombatLoopLabel, active && styles.adventureCombatLoopLabelActive]}>{step.label}</Text>
                <Text style={styles.adventureCombatLoopDetail}>{step.detail}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function AdventureRewardRecap({ state, focused = false, onReturnToDen }: { state: GameState; focused?: boolean; onReturnToDen?: () => void }) {
  const reward = state.lastAdventureRewards;
  if (!reward) {
    return null;
  }

  const run = state.adventureRun;
  const equipment = reward.equipmentDrop;
  const treasureName = reward.treasureDrop ? treasureDefinitions[reward.treasureDrop].name : null;
  const hoardCount = treasureOrder.reduce((total, treasureId) => total + (state.treasures[treasureId] ?? 0), 0);
  const nextEvolutionCost = getNextEvolutionCost(state.dragon.stage);
  const evolutionLine = nextEvolutionCost
    ? `${reward.evolutionProgress} • ${Math.max(0, nextEvolutionCost - state.dragon.evolution)} evolution to next form`
    : reward.evolutionProgress;
  const chapterMatch = run?.title.match(/Chapter (\d+)/);
  const chapterNumber = chapterMatch ? chapterMatch[1] : "1";
  const chapterResult = run?.status === "failed" ? "Retreat logged" : "Chapter cleared";
  const stopsCleared = run ? Math.min(run.step, run.maxSteps) : 0;
  const hpLine = run ? `${Math.max(0, run.currentHp)}/${run.maxHp} HP held` : "Ready for the next road";
  const summaryStats = [
    { label: "Road", value: run ? `${stopsCleared}/${run.maxSteps} stops` : "Route sealed" },
    { label: "Vitality", value: hpLine },
    { label: "Hoard", value: `${hoardCount} relics` }
  ];

  if (focused) {
    return (
      <View style={[styles.adventureRewardRecapCard, styles.adventureRewardRecapCardFocused]}>
        <View style={styles.adventureRewardHeaderRow}>
          <Text style={styles.adventureRewardIcon}>🎁</Text>
          <View style={styles.adventureRewardTitleBlock}>
            <Text style={[styles.capybaraEventKicker, styles.capybaraEventKickerFocused]}>Chapter {chapterNumber} Summary</Text>
            <Text style={styles.adventureRewardTitle} numberOfLines={1}>{reward.lootGained.join(" • ")}</Text>
          </View>
          <Text style={styles.adventureRewardHoardCount}>Hoard {hoardCount}</Text>
        </View>
        <Text style={styles.adventureRewardCompactLine} numberOfLines={1}>{chapterResult} • {reward.statsImproved.join(" • ")} • {evolutionLine}</Text>
        {onReturnToDen ? (
          <Pressable onPress={onReturnToDen} style={styles.capybaraFocusedReturnPill}>
            <Text style={styles.capybaraFocusedReturnText}>Back to Den</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.adventureRewardRecapCard}>
      <View style={styles.adventureRewardHeaderRow}>
        <Text style={styles.adventureRewardIcon}>{run?.status === "failed" ? "🛡️" : "🏆"}</Text>
        <View style={styles.adventureRewardTitleBlock}>
          <Text style={styles.capybaraEventKicker}>Chapter {chapterNumber} Summary</Text>
          <Text style={styles.adventureRewardTitle}>{chapterResult}</Text>
        </View>
        <Text style={styles.adventureRewardHoardCount}>Hoard {hoardCount}</Text>
      </View>
      <Text style={styles.adventureRewardHeroLine}>Return chest opened: {reward.lootGained.join(" • ")}</Text>
      <View style={styles.adventureSummaryStatRow}>
        {summaryStats.map((item) => (
          <View key={item.label} style={styles.adventureSummaryStatPill}>
            <Text style={styles.adventureSummaryStatLabel}>{item.label}</Text>
            <Text style={styles.adventureSummaryStatValue}>{item.value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.adventureRewardGrid}>
        <AdventureRewardLine label="Stats improved" value={reward.statsImproved.join(" • ")} />
        <AdventureRewardLine label="Hoard progress" value={treasureName ? `${reward.hoardProgress} — ${treasureName}` : reward.hoardProgress} />
        <AdventureRewardLine label="Evolution progress" value={evolutionLine} />
        {equipment ? <AdventureRewardLine label="Gear drop" value={`${equipmentRarityDefinitions[equipment.rarity].label} ${equipment.name}: +${equipment.bonusPercent}% ${equipmentBonusLabels[equipment.bonusType]}`} /> : null}
        <AdventureRewardLine label="Next road" value={reward.nextRecommendedAdventure} />
      </View>
      {onReturnToDen ? (
        <Pressable onPress={onReturnToDen} style={styles.adventureRewardDenButton}>
          <Text style={styles.adventureRewardDenButtonText}>Back to Den</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function AdventureRewardLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.adventureRewardLine}>
      <Text style={styles.adventureRewardLineLabel}>{label}</Text>
      <Text style={styles.adventureRewardLineValue}>{value}</Text>
    </View>
  );
}

function AdventureNodeStrip({ nodes, currentNode, clearedNodeIds }: { nodes: AdventureNode[]; currentNode: AdventureNode; clearedNodeIds: string[] }) {
  const currentStep = currentNode.step;
  const currentIndex = Math.max(0, nodes.findIndex((node) => node.step === currentStep));
  const visibleNodes = nodes.slice(Math.max(0, currentIndex - 2), currentIndex + 6);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.capybaraRouteScroll} contentContainerStyle={styles.capybaraRouteRail}>
      {visibleNodes.map((node, index) => {
        const current = node.id === currentNode.id;
        const cleared = clearedNodeIds.includes(node.id);
        const tone = getAdventureNodeTone(node.kind);
        return (
          <View key={node.id} style={styles.capybaraRouteNodeWrap}>
            <View style={[styles.capybaraRouteNode, current && styles.capybaraRouteNodeCurrent, cleared && styles.capybaraRouteNodeCleared, { borderColor: current ? tone : "rgba(255,255,255,0.26)" }]}>
              <Text style={styles.capybaraRouteNodeIcon}>{cleared ? "✓" : getAdventureNodeIcon(node.kind)}</Text>
            </View>
            <Text style={[styles.capybaraRouteStep, current && { color: tone }]}>#{node.step}</Text>
            {index < visibleNodes.length - 1 ? <View style={[styles.capybaraRouteConnector, cleared && { backgroundColor: tone }]} /> : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

function CurrentAdventureEventCard({
  node,
  runStatus,
  isPending,
  dispatch,
  primaryLabel,
  onPrimaryPress,
  focused = false
}: {
  node: AdventureNode;
  runStatus: "idle" | "active" | "complete" | "failed";
  isPending: boolean;
  dispatch?: (action: GameAction) => void;
  primaryLabel: string;
  onPrimaryPress: () => void;
  focused?: boolean;
}) {
  const tone = getAdventureNodeTone(node.kind);
  const encounter = encounters.find((item) => item.id === node.encounterId);
  const choices = node.choices?.map((choice) => choice);
  const isFightEvent = node.kind === "battle" || node.kind === "elite" || node.kind === "boss";
  const recoveryPreview = node.kind === "shrine"
    ? "Recovery waypoint: shrine blessing restores at least 75% Chapter HP."
    : node.kind === "camp"
      ? "Recovery waypoint: camp rest restores at least 55% Chapter HP."
      : null;
  const showFocusedFightCard = focused && isPending && isFightEvent;

  if (showFocusedFightCard) {
    return (
      <View style={[styles.focusedCombatStopCard, { borderColor: tone }]}>
        <View style={styles.focusedCombatStopHeader}>
          <View style={[styles.focusedCombatStopIcon, { backgroundColor: tone }]}>
            <Text style={styles.capybaraEventIcon}>{getAdventureNodeIcon(node.kind)}</Text>
          </View>
          <View style={styles.focusedCombatStopCopy}>
            <Text style={styles.focusedCombatStopKicker}>Fight Stop</Text>
            <Text style={styles.focusedCombatStopTitle} numberOfLines={1}>{node.title}</Text>
          </View>
          <Text style={styles.focusedCombatStopStep}>#{node.step}</Text>
        </View>
        <Text style={styles.focusedCombatStopText} numberOfLines={2}>{encounter ? `${encounter.name} blocks node ${node.step}.` : node.description}</Text>
        {node.chapter === 3 ? <ShadowPressureReadout focused /> : null}
        <Pressable onPress={onPrimaryPress} style={styles.focusedCombatStopCta}>
          <Text style={styles.capybaraPrimaryCtaText}>{primaryLabel}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.capybaraEventCard, focused && styles.capybaraEventCardFocused, { borderColor: focused ? "rgba(248,217,135,0.26)" : tone }]}>
      <View style={styles.capybaraEventTopRow}>
        <View style={[styles.capybaraEventIconBadge, { backgroundColor: tone }]}>
          <Text style={styles.capybaraEventIcon}>{getAdventureNodeIcon(node.kind)}</Text>
        </View>
        <View style={styles.capybaraEventTitleBlock}>
          <Text style={[styles.capybaraEventKicker, focused && styles.capybaraEventKickerFocused]}>{runStatus === "idle" ? "Chapter start" : isPending ? "Active Stop" : "Next Stop"}</Text>
          <Text style={[styles.capybaraEventTitle, focused && styles.capybaraEventTitleFocused]}>{node.title}</Text>
        </View>
        <Text style={[styles.capybaraEventStep, focused && styles.capybaraEventStepFocused]}>#{node.step}</Text>
      </View>
      <Text numberOfLines={focused ? 2 : 2} style={[styles.capybaraEventText, focused && styles.capybaraEventTextFocused]}>{runStatus === "idle" ? "The Ember Gate opens under warm ashfall." : node.description}</Text>
      {node.chapter === 3 ? <ShadowPressureReadout focused={focused} /> : null}
      {recoveryPreview ? <Text style={[styles.capybaraEnemyHint, focused && styles.capybaraEnemyHintFocused]} numberOfLines={focused ? 1 : 2}>{recoveryPreview}</Text> : null}
      {encounter && !focused ? <Text style={styles.capybaraEnemyHint}>Enemy base: {encounter.name} • x{node.difficulty.toFixed(2)}</Text> : null}
      {focused && encounter ? <Text style={[styles.capybaraEnemyHint, styles.capybaraEnemyHintFocused]} numberOfLines={1}>Enemy: {encounter.name}</Text> : null}
      {encounter ? <BattleTacticPreview node={node} encounter={encounter} focused={focused} /> : null}
      <FireSkillChoiceRecap node={node} focused={focused} />
      {choices?.length && (!focused || isPending) ? (
        <View style={styles.capybaraChoiceGrid}>
          {node.choices?.map((choice) => (
            <Pressable
              key={choice.id}
              disabled={!dispatch || !isPending}
              onPress={() => dispatch?.({ type: "resolveAdventureChoice", nodeId: node.id, choiceId: choice.id })}
              style={[styles.capybaraChoiceButton, focused && styles.capybaraChoiceButtonFocused, !isPending && styles.capybaraChoiceButtonDisabled]}
            >
              <Text style={[styles.capybaraChoiceTitle, focused && styles.capybaraChoiceTitleFocused]}>{choice.label}</Text>
              <Text numberOfLines={focused ? 1 : undefined} style={[styles.capybaraChoiceText, focused && styles.capybaraChoiceTextFocused]}>{choice.description}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <Pressable onPress={onPrimaryPress} style={[styles.capybaraPrimaryCta, focused && styles.capybaraPrimaryCtaFocused, { backgroundColor: "#f8d987" }]}>
        <Text style={styles.capybaraPrimaryCtaText}>{primaryLabel}</Text>
      </Pressable>
    </View>
  );
}

function ShadowPressureReadout({ focused = false }: { focused?: boolean }) {
  return (
    <View style={[styles.shadowPressureReadout, focused && styles.shadowPressureReadoutFocused]}>
      <Text style={styles.shadowPressureKicker}>Shadow pressure</Text>
      <Text numberOfLines={focused ? 1 : 2} style={styles.shadowPressureText}>Dark foes ramp from guarded ambushes into late-route pressure. Watch Light/Dark advantage, protect Chapter HP, then strike through the veil.</Text>
    </View>
  );
}

function BattleTacticPreview({ node, encounter, focused = false }: { node: AdventureNode; encounter: Encounter; focused?: boolean }) {
  const playerAdvantage = getElementMatchupMultiplier(node.element ?? "fire", encounter.element) > 1;
  const enemyAdvantage = getElementMatchupMultiplier(encounter.element, node.element ?? "fire") > 1;
  const shadowVale = node.chapter === 3;
  const tacticChips = [
    { label: "ATK", detail: playerAdvantage ? "advantage breath" : shadowVale ? "veil pierce" : "steady bite" },
    { label: "DEF", detail: enemyAdvantage ? "brace counter" : shadowVale ? "guard HP" : "hold ground" },
    { label: "SPD", detail: node.difficulty >= 1 ? "first swing" : "safe opener" }
  ];

  return (
    <View style={[styles.battleTacticPreview, focused && styles.battleTacticPreviewFocused]}>
      <Text style={styles.battleTacticKicker}>Fight readout</Text>
      <Text numberOfLines={focused ? 1 : 2} style={styles.battleTacticTitle}>
        {shadowVale ? "Shadow Vale: Light/Dark pressure can swing the fight." : playerAdvantage ? "Element advantage: press the breath attack." : enemyAdvantage ? "Enemy pressure: block, dodge, then counter." : "Even matchup: stats decide the exchange."}
      </Text>
      <View style={styles.battleTacticChipRow}>
        {tacticChips.map((chip) => (
          <View key={chip.label} style={styles.battleTacticChip}>
            <Text style={styles.battleTacticChipLabel}>{chip.label}</Text>
            <Text numberOfLines={1} style={styles.battleTacticChipText}>{chip.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function AdventureSkillDraftCard({ state, dispatch, focused = false }: { state: GameState; dispatch?: (action: GameAction) => void; focused?: boolean }) {
  const offer = state.lastSkillDraftOffer;
  const runActive = state.adventureRun?.status === "active";
  if (!offer || offer.chosenSkillId || !runActive) {
    return null;
  }

  const offeredSkills = offer.skillIds
    .map((skillId) => dragonSkillDrafts.find((skill) => skill.id === skillId))
    .filter(Boolean) as typeof dragonSkillDrafts;

  return (
    <View style={[styles.fireSkillChoiceRecap, focused && styles.fireSkillChoiceRecapFocused]}>
      <Text style={styles.fireSkillChoiceKicker}>Choose a skill</Text>
      <Text style={styles.fireSkillChoiceTitle}>Pick one run skill for the road ahead.</Text>
      <View style={styles.fireSkillChoiceGrid}>
        {offeredSkills.map((skill) => (
          <Pressable
            key={skill.id}
            disabled={!dispatch}
            onPress={() => dispatch?.({ type: "selectActiveSkill", skillId: skill.id })}
            style={styles.fireSkillChoiceChip}
          >
            <Text style={styles.fireSkillChoiceName}>{skill.name}</Text>
            <Text style={styles.fireSkillChoiceHook}>{skill.trigger}</Text>
            {!focused ? <Text style={styles.fireSkillChoicePayoff}>{skill.effect}</Text> : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function FireSkillChoiceRecap({ node, focused = false }: { node: AdventureNode; focused?: boolean }) {
  if (node.kind !== "elite") {
    return null;
  }

  const fireSkillChoices = [
    { name: "Ash Warden", hook: "block + defense", payoff: "protect the hoard with counter-burns" },
    { name: "Inferno Raider", hook: "attack + crit", payoff: "burst through enemies with Overheat Fang" },
    { name: "Sunscale Guide", hook: "speed + dodge", payoff: "read the route and control tempo" }
  ];

  return (
    <View style={[styles.fireSkillChoiceRecap, focused && styles.fireSkillChoiceRecapFocused]}>
      <Text style={styles.fireSkillChoiceKicker}>Skill reward ahead</Text>
      <Text style={styles.fireSkillChoiceTitle}>Win this elite fight to choose a new run skill.</Text>
      <View style={styles.fireSkillChoiceGrid}>
        {fireSkillChoices.map((choice) => (
          <View key={choice.name} style={styles.fireSkillChoiceChip}>
            <Text style={styles.fireSkillChoiceName}>{choice.name}</Text>
            <Text style={styles.fireSkillChoiceHook}>{choice.hook}</Text>
            {!focused ? <Text style={styles.fireSkillChoicePayoff}>{choice.payoff}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function AdventureNodeCard({ node, dispatch, reducedMotion = false }: { node: AdventureNode; dispatch: (action: GameAction) => void; reducedMotion?: boolean }) {
  const entry = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const theme = elementTheme[node.element ?? "fire"];
  const encounter = encounters.find((item) => item.id === node.encounterId);
  const reward = formatAdventureReward(node.reward);
  const isHighStakes = node.kind === "elite" || node.kind === "boss";

  useEffect(() => {
    if (reducedMotion) {
      entry.setValue(1);
      return;
    }

    Animated.timing(entry, { toValue: 1, duration: 360, useNativeDriver: true }).start();
  }, [entry, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      pulse.setValue(0);
      return;
    }

    if (!isHighStakes) {
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [isHighStakes, pulse, reducedMotion]);

  const translateY = entry.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  return (
    <Animated.View style={{ opacity: entry, transform: [{ translateY }, { scale: glowScale }] }}>
      <Pressable
        onPress={() => dispatch({ type: "selectAdventureNode", nodeId: node.id })}
        onPressIn={() => {
          if (!reducedMotion) {
            Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true }).start();
          }
        }}
        onPressOut={() => {
          if (!reducedMotion) {
            Animated.spring(pressScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
          }
        }}
      >
        <Animated.View style={[styles.nodeCard, { borderColor: theme.primary, transform: [{ scale: pressScale }] }]}>
          <ImageBackground source={sceneImages[node.scene]} style={styles.nodeImageBackground} imageStyle={styles.nodeImage}>
            <LinearGradient colors={["rgba(8,6,17,0.1)", getSceneColor(node.scene), "rgba(8,6,17,0.96)"]} style={styles.nodeOverlay}>
              <View style={styles.nodeHeader}>
                <View style={[styles.nodeBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.elementChipText}>{getNodeKindLabel(node.kind)}</Text>
                </View>
                <Text style={styles.nodeDifficulty}>x{node.difficulty.toFixed(2)}</Text>
              </View>
              <Text style={styles.nodeTitle}>{node.title}</Text>
              <Text style={styles.bodyText}>{node.description}</Text>
              {encounter ? <Text style={styles.hintText}>Enemy base: {encounter.name}</Text> : null}
              {node.choices?.length ? <Text style={styles.hintText}>Choices: {node.choices.map((choice) => choice.label).join(" / ")}</Text> : null}
              <RewardChips rewardText={reward} />
            </LinearGradient>
          </ImageBackground>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function EventChoicePanel({ node, dispatch }: { node: AdventureNode; dispatch: (action: GameAction) => void }) {
  return (
    <ImageBackground source={sceneImages[node.scene]} style={styles.eventPanel} imageStyle={styles.eventPanelImage}>
      <LinearGradient colors={["rgba(8,6,17,0.2)", "rgba(8,6,17,0.96)"]} style={styles.eventPanelOverlay}>
        <Text style={styles.choiceNumber}>{getNodeKindLabel(node.kind)} Event</Text>
        <Text style={styles.panelTitle}>{node.title}</Text>
        <Text style={styles.bodyText}>{node.description}</Text>
        {node.choices?.map((choice) => (
          <Pressable
            key={choice.id}
            onPress={() => dispatch({ type: "resolveAdventureChoice", nodeId: node.id, choiceId: choice.id })}
            style={styles.eventChoiceCard}
          >
            <Text style={styles.answerTitle}>{choice.label}</Text>
            <Text style={styles.answerDescription}>{choice.description}</Text>
            <RewardChips rewardText={formatAdventureReward(choice.reward)} />
          </Pressable>
        ))}
      </LinearGradient>
    </ImageBackground>
  );
}

function RouteTracker({ currentStep, maxSteps, clearedSteps }: { currentStep: number; maxSteps: number; clearedSteps: number }) {
  return (
    <View style={styles.routeTracker}>
      {Array.from({ length: maxSteps }).map((_, index) => {
        const step = index + 1;
        const cleared = step <= clearedSteps;
        const current = step === currentStep;
        const boss = step === maxSteps;
        return (
          <View key={step} style={styles.routeStepWrap}>
            <View style={[styles.routeStep, cleared && styles.routeStepCleared, current && styles.routeStepCurrent, boss && styles.routeStepBoss]}>
              <Text style={styles.routeStepText}>{boss ? "B" : step}</Text>
            </View>
            {step < maxSteps ? <View style={[styles.routeLine, cleared && styles.routeLineCleared]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

function RewardChips({ rewardText }: { rewardText: string }) {
  return (
    <View style={styles.rewardChipRow}>
      {rewardText.split(", ").map((part) => (
        <View key={part} style={styles.rewardChip}>
          <Text style={styles.rewardChipText}>{part}</Text>
        </View>
      ))}
    </View>
  );
}

function getBattleSkillTriggerLines(rounds: string[]): string[] {
  return rounds.filter((round) => round.includes("Skill trigger:"));
}

function BattleFlashCalloutRail({ battle, stats, element, title = "BATTLE TELLS" }: { battle: BattleResult; stats: Stats; element: DragonElement; title?: string }) {
  const roundText = battle.rounds.join(" ");
  const isFireDragon = element === "fire";
  const isBossPressure = battle.nodeKind === "boss" || battle.nodeKind === "elite";
  const callouts = [
    {
      label: isFireDragon ? "Fire Breath" : "Dragon Breath",
      icon: isFireDragon ? "🔥" : "🐉",
      active: true,
      detail: `${battle.damageSummary?.playerDamage ?? 0} total damage`
    },
    {
      label: "Burn Pressure",
      icon: "♨️",
      active: isFireDragon || roundText.toLowerCase().includes("burn") || roundText.toLowerCase().includes("ember"),
      detail: isFireDragon ? "ember identity online" : "elemental DOT hook"
    },
    {
      label: "Crit Spike",
      icon: "💥",
      active: roundText.includes("CRIT") || stats.critChance >= 10,
      detail: `${stats.critChance}% / ${stats.critDamage}%`
    },
    {
      label: "Block Spark",
      icon: "🛡",
      active: roundText.includes("blocked") || stats.block >= 8,
      detail: `${stats.block}% block reads as shield flash`
    },
    {
      label: "Dodge Afterimage",
      icon: "🌀",
      active: roundText.includes("dodged") || stats.dodge >= 8,
      detail: `${stats.dodge}% dodge reads as motion`
    },
    {
      label: "Speed / First Move",
      icon: "⚡",
      active: stats.speed >= battle.encounter.stats.speed,
      detail: `${stats.speed} speed sets attack cadence`
    },
    {
      label: isBossPressure ? "Heavy Hit Warning" : "Enemy Counter",
      icon: isBossPressure ? "⚠️" : "🗡️",
      active: isBossPressure || (battle.damageSummary?.enemyCounterDamage ?? 0) > 0,
      detail: `${battle.damageSummary?.enemyCounterDamage ?? 0} counter damage`
    }
  ];

  return (
    <View style={styles.battleFlashCalloutRail}>
      <Text style={styles.battleFlashCalloutKicker}>{title}</Text>
      <View style={styles.battleFlashCalloutGrid}>
        {callouts.map((callout) => (
          <View key={callout.label} style={[styles.battleFlashCalloutCard, callout.active && styles.battleFlashCalloutCardActive]}>
            <Text style={styles.battleFlashCalloutIcon}>{callout.icon}</Text>
            <Text style={styles.battleFlashCalloutLabel}>{callout.label}</Text>
            <Text style={styles.battleFlashCalloutDetail}>{callout.active ? callout.detail : "ready next fight"}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

type BattleExchangeEvent = {
  actor: "dragon" | "enemy" | "skill" | "dodge" | "result";
  label: string;
  playerDamage: number;
  enemyDamage: number;
};

function parseBattleExchangeDamage(line: string, pattern: RegExp) {
  const match = line.match(pattern);
  return match?.[1] ? Number(match[1]) : 0;
}

function getBattleExchangeEvents(battle: BattleResult): BattleExchangeEvent[] {
  const events = battle.rounds
    .map((round): BattleExchangeEvent | null => {
      if (round.startsWith("Round ")) {
        return {
          actor: "dragon",
          label: round.replace(/^Round \d+: /, ""),
          playerDamage: parseBattleExchangeDamage(round, / for (\d+)/),
          enemyDamage: 0
        };
      }
      if (round.includes("Skill trigger:")) {
        return {
          actor: "skill",
          label: round.replace("Skill trigger: ", ""),
          playerDamage: parseBattleExchangeDamage(round, /(?:for|deals|adds) (\d+)/i),
          enemyDamage: 0
        };
      }
      if (round.includes("strikes back for")) {
        return {
          actor: "enemy",
          label: round,
          playerDamage: 0,
          enemyDamage: parseBattleExchangeDamage(round, /strikes back for (\d+)/)
        };
      }
      if (round.includes("dodged")) {
        return {
          actor: "dodge",
          label: round,
          playerDamage: 0,
          enemyDamage: 0
        };
      }
      if (round.startsWith("Fast fight result:")) {
        return {
          actor: "result",
          label: round.replace("Fast fight result: ", ""),
          playerDamage: 0,
          enemyDamage: 0
        };
      }
      return null;
    })
    .filter((event): event is BattleExchangeEvent => Boolean(event));

  return events.length > 0
    ? events
    : [
        {
          actor: battle.won ? "dragon" : "enemy",
          label: battle.won ? "Your dragon surges forward for the finishing hit." : "The enemy forces your dragon back.",
          playerDamage: battle.damageSummary?.playerDamage ?? 0,
          enemyDamage: battle.damageSummary?.enemyCounterDamage ?? 0
        }
      ];
}

function getAnimatedBattleHp({
  battle,
  events,
  currentExchangeIndex,
  dragonMaxHp,
  dragonStartHp,
  enemyMaxHp
}: {
  battle: BattleResult;
  events: BattleExchangeEvent[];
  currentExchangeIndex: number;
  dragonMaxHp: number;
  dragonStartHp: number;
  enemyMaxHp: number;
}) {
  if (currentExchangeIndex >= events.length) {
    return { playerHp: battle.playerHp, enemyHp: battle.enemyHp };
  }

  const visibleEvents = events.slice(0, Math.max(0, currentExchangeIndex + 1));
  const playerDamage = visibleEvents.reduce((total, event) => total + event.enemyDamage, 0);
  const enemyDamage = visibleEvents.reduce((total, event) => total + event.playerDamage, 0);

  return {
    playerHp: Math.max(battle.playerHp, dragonStartHp - playerDamage),
    enemyHp: Math.max(battle.enemyHp, enemyMaxHp - enemyDamage)
  };
}

function BattleScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  const battle = state.lastBattle;
  const continueScreen: ScreenKey = state.adventureRun?.status === "complete" ? "den" : "adventure";
  const element = state.dragon.element ?? "fire";
  const theme = elementTheme[element];
  const exchangePulse = useRef(new Animated.Value(0)).current;
  const enemyDeathPulse = useRef(new Animated.Value(1)).current;
  const battleEvents = useMemo(() => (battle ? getBattleExchangeEvents(battle) : []), [battle]);
  const [battleStarted, setBattleStarted] = useState(false);
  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(-1);
  const activeExchange = currentExchangeIndex >= 0 && currentExchangeIndex < battleEvents.length ? battleEvents[currentExchangeIndex] : null;
  const exchangeComplete = battleStarted && currentExchangeIndex >= battleEvents.length;
  const previousExchangeBattleId = useRef<string | null>(null);

  useEffect(() => {
    setBattleStarted(false);
    setCurrentExchangeIndex(-1);
  }, [battle]);

  useEffect(() => {
    if (!battle || !battleStarted) {
      setCurrentExchangeIndex(-1);
      return;
    }
    if (state.settings.reducedMotion) {
      setCurrentExchangeIndex(battleEvents.length);
      return;
    }

    setCurrentExchangeIndex(-1);
    let nextIndex = 0;
    const interval = setInterval(() => {
      setCurrentExchangeIndex(nextIndex);
      nextIndex += 1;
      if (nextIndex > battleEvents.length) {
        clearInterval(interval);
      }
    }, 650);

    return () => clearInterval(interval);
  }, [battle, battleEvents, battleStarted, state.settings.reducedMotion]);

  useEffect(() => {
    if (!activeExchange || state.settings.reducedMotion) {
      exchangePulse.setValue(0);
      return;
    }

    exchangePulse.setValue(0);
    Animated.sequence([
      // Snap to impact fast, ease back with overshoot
      Animated.timing(exchangePulse, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(exchangePulse, { toValue: 0, duration: 380, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
    ]).start();
  }, [activeExchange, exchangePulse, state.settings.reducedMotion]);

  // Enemy death: slide off-screen and fade when a new enemy spawns
  useEffect(() => {
    if (state.settings.reducedMotion) return;
    const battleId = battle?.encounter?.name ?? null;
    if (previousExchangeBattleId.current !== null && previousExchangeBattleId.current !== battleId) {
      enemyDeathPulse.setValue(1);
    }
    previousExchangeBattleId.current = battleId;
  }, [battle?.encounter?.name, enemyDeathPulse, state.settings.reducedMotion]);

  useEffect(() => {
    if (!exchangeComplete || !battle?.won || state.settings.reducedMotion) return;
    enemyDeathPulse.setValue(1);
    Animated.sequence([
      Animated.delay(120),
      Animated.parallel([
        Animated.timing(enemyDeathPulse, { toValue: 0, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true })
      ])
    ]).start(() => enemyDeathPulse.setValue(1));
  }, [exchangeComplete, battle?.won, enemyDeathPulse, state.settings.reducedMotion]);

  const dragonLunge = exchangePulse.interpolate({ inputRange: [0, 1], outputRange: [0, 72] });
  const enemyLunge = exchangePulse.interpolate({ inputRange: [0, 1], outputRange: [0, -60] });
  const battleArenaShake = exchangePulse.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [0, -10, 14, -8, 5, 0] });
  const targetRecoilTranslateX = exchangePulse.interpolate({ inputRange: [0, 0.2, 0.5, 0.75, 1], outputRange: [0, 0, 22, -8, 0] });
  const dragonTargetRecoilTranslateX = exchangePulse.interpolate({ inputRange: [0, 0.2, 0.5, 0.75, 1], outputRange: [0, 0, -18, 7, 0] });
  const hitPauseScale = exchangePulse.interpolate({ inputRange: [0, 0.2, 0.45, 0.65, 1], outputRange: [1, 1.06, 0.88, 1.04, 1] });
  const hitFlashOpacity = exchangePulse.interpolate({ inputRange: [0, 0.08, 0.30, 0.55, 1], outputRange: [0, 1, 0.9, 0.2, 0] });
  const damageFloatTranslateY = exchangePulse.interpolate({ inputRange: [0, 0.62, 1], outputRange: [12, -32, -44] });
  const damageFloatScale = exchangePulse.interpolate({ inputRange: [0, 0.12, 0.55, 1], outputRange: [0.5, 1.28, 1.08, 0.96] });
  const dragonAttackActive = activeExchange?.actor === "dragon" || activeExchange?.actor === "skill";
  const enemyAttackActive = activeExchange?.actor === "enemy";
  const dragonSideMotion = dragonAttackActive ? dragonLunge : enemyAttackActive ? dragonTargetRecoilTranslateX : 0;
  const enemySideMotion = enemyAttackActive ? enemyLunge : dragonAttackActive ? targetRecoilTranslateX : 0;

  if (!battle) {
    return (
      <View>
        <Text style={styles.sectionTitle}>Battle Log</Text>
        <Text style={styles.bodyText}>No battle yet. Start an adventure to test your dragon.</Text>
      </View>
    );
  }

  const enemyImageKey = getAutoBattleEnemyImageKey(battle.encounter.name, state.currentArea);
  const chapterMaxHp = state.adventureRun?.maxHp ?? state.dragon.stats.health;
  const chapterStartHp = battle.battleStartHp ?? (state.adventureRun?.status === "active"
    ? Math.min(chapterMaxHp, Math.max(1, state.adventureRun.currentHp))
    : state.dragon.stats.health);
  const animatedHp = getAnimatedBattleHp({
    battle,
    events: battleEvents,
    currentExchangeIndex,
    dragonMaxHp: chapterMaxHp,
    dragonStartHp: chapterStartHp,
    enemyMaxHp: battle.encounter.stats.health
  });
  const enemyHpPercent = `${Math.max(0, Math.min(100, Math.round((animatedHp.enemyHp / Math.max(1, battle.encounter.stats.health)) * 100)))}%`;
  const playerHpPercent = `${Math.max(0, Math.min(100, Math.round((animatedHp.playerHp / Math.max(1, chapterMaxHp)) * 100)))}%`;
  const areaSceneMap: Record<AreaId, AdventureNode["scene"]> = {
    mysticMeadow: "forest",
    emberWoods: "camp",
    tideCavern: "cave",
    stonebackHills: "ruins",
    skyRuins: "shrine",
    voidNest: "boss"
  };
  const battleScene: AdventureNode["scene"] = battle.nodeKind === "boss" ? "boss" : battle.nodeKind === "elite" ? "ruins" : areaSceneMap[state.currentArea];
  const fightCue = !battleStarted
    ? "Square up — tap Start Battle when ready"
    : exchangeComplete
      ? (battle.won ? "Enemy staggered — press the attack" : "Your dragon is pushed back")
      : activeExchange?.label ?? "Fight starts — your dragon advances";
  const useFireBattleHeroImage = element === "fire" && state.dragon.stage === "hatchling";
  const enemyDamageBadgeText = activeExchange?.playerDamage ? `HIT -${activeExchange.playerDamage}` : null;
  const dragonDamageBadgeText = activeExchange?.enemyDamage ? `HURT -${activeExchange.enemyDamage}` : null;
  const dragonExchangeSummary = activeExchange?.playerDamage
    ? `Dragon hit: -${activeExchange.playerDamage} enemy HP`
    : dragonAttackActive
      ? "Dragon presses forward"
      : "Dragon ready";
  const enemyExchangeSummary = activeExchange?.enemyDamage
    ? `Enemy counter: -${activeExchange.enemyDamage} hatchling HP`
    : enemyAttackActive
      ? "Enemy counter incoming"
      : activeExchange?.actor === "dodge"
        ? "Counter dodged"
        : "Enemy bracing";
  const battlePersistentStats = [
    { label: "Health", value: `${animatedHp.playerHp}/${chapterMaxHp}` },
    { label: "Attack", value: `${state.dragon.stats.attack}` },
    { label: "Defense", value: `${state.dragon.stats.defense}` }
  ];

  return (
    <View style={styles.battleFullScreenArena}>
      <ImageBackground source={sceneImages[battleScene]} style={styles.battleArenaScene} imageStyle={styles.battleArenaImage}>
        <LinearGradient colors={["rgba(8,6,17,0.02)", "rgba(8,6,17,0.32)", "rgba(8,6,17,0.9)"]} style={styles.battleArenaScrim}>
          <View style={styles.battleArenaHud}>
            <View style={[styles.battleArenaBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.battleArenaBadgeText}>Fight</Text>
            </View>
            <Text style={styles.battleArenaKind}>{battle.nodeKind ? getNodeKindLabel(battle.nodeKind) : "Battle"}</Text>
          </View>
          <View style={styles.battlePersistentStatsRow}>
            {battlePersistentStats.map((stat) => (
              <View key={stat.label} style={[styles.battlePersistentStatPill, stat.label === "Health" && styles.battlePersistentStatPillHealth]}>
                <Text style={styles.battlePersistentStatLabel}>{stat.label}</Text>
                <Text style={styles.battlePersistentStatValue}>{stat.value}</Text>
              </View>
            ))}
          </View>

          <Animated.View style={[styles.battleArenaCombatants, !exchangeComplete && { transform: [{ translateX: battleArenaShake }] }]}>
            <Animated.View style={[styles.battleDragonSide, !exchangeComplete && { transform: [{ translateX: dragonSideMotion }, { scale: hitPauseScale }] }]}>
              <View style={[styles.battleDragonAura, { borderColor: theme.primary, backgroundColor: `${theme.primary}33` }]} />
              {useFireBattleHeroImage ? (
                <SafeExpoImage source={battleFireHatchlingImage} style={[styles.battleDragonHeroSprite, styles.battleDragonFacingRight]} contentFit="contain" />
              ) : (
                <SafeExpoImage source={getDragonStageImage(state.dragon.stage, element)} style={[styles.battleDragonHeroSprite, styles.battleDragonFacingRight]} contentFit="contain" />
              )}
              {dragonAttackActive ? <Animated.View style={[styles.battleImpactSlash, styles.battleDragonProjectile, { opacity: hitFlashOpacity }]} /> : null}
              {activeExchange ? <Animated.View style={[styles.battleImpactRing, styles.battleImpactRingDragon, { opacity: hitFlashOpacity, transform: [{ scale: damageFloatScale }] }]} /> : null}
              {enemyAttackActive ? <Animated.View style={[styles.battleImpactSpark, styles.battleImpactSparkDragon, { opacity: hitFlashOpacity }]} /> : null}
              {dragonDamageBadgeText ? (
                <Animated.View style={[styles.battleDamageBadge, styles.battleDamageBadgeDragon, { opacity: hitFlashOpacity, transform: [{ translateY: damageFloatTranslateY }, { scale: damageFloatScale }] }]}>
                  <Text style={styles.battleDamageBadgeText}>{dragonDamageBadgeText}</Text>
                </Animated.View>
              ) : null}
              <Text style={styles.battleCombatantName}>Your {state.dragon.stage}</Text>
              <View style={styles.battleHpTrack}>
                <View style={[styles.battleHpFill, { width: playerHpPercent as any, backgroundColor: theme.primary }]} />
              </View>
              <Text style={styles.battleHpText}>Chapter HP {animatedHp.playerHp}/{chapterMaxHp}</Text>
            </Animated.View>

            <View style={styles.battleVersusBurst}>
              <Text style={styles.battleVersusText}>VS</Text>
            </View>

            <Animated.View style={[styles.battleEnemySide, !exchangeComplete && { transform: [{ translateX: enemySideMotion }, { scale: hitPauseScale }] }, { opacity: enemyDeathPulse, transform: [{ translateX: enemyDeathPulse.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }) }] }]}>
              <Image source={enemyImages[enemyImageKey]} style={styles.battleEnemyBossSprite} resizeMode="contain" />
              {enemyAttackActive ? <Animated.View style={[styles.battleImpactSlash, styles.battleEnemyProjectile, { opacity: hitFlashOpacity }]} /> : null}
              {activeExchange ? <Animated.View style={[styles.battleImpactRing, styles.battleImpactRingEnemy, { opacity: hitFlashOpacity, transform: [{ scale: damageFloatScale }] }]} /> : null}
              {dragonAttackActive ? <Animated.View style={[styles.battleImpactSpark, styles.battleImpactSparkEnemy, { opacity: hitFlashOpacity }]} /> : null}
              {enemyDamageBadgeText ? (
                <Animated.View style={[styles.battleDamageBadge, styles.battleDamageBadgeEnemy, { opacity: hitFlashOpacity, transform: [{ translateY: damageFloatTranslateY }, { scale: damageFloatScale }] }]}>
                  <Text style={styles.battleDamageBadgeText}>{enemyDamageBadgeText}</Text>
                </Animated.View>
              ) : null}
              <Text style={styles.battleCombatantName}>{battle.title ?? battle.encounter.name}</Text>
              <View style={styles.battleHpTrack}>
                <View style={[styles.battleHpFill, { width: enemyHpPercent as any, backgroundColor: "#ff5f7a" }]} />
              </View>
              <Text style={styles.battleHpText}>Enemy HP {animatedHp.enemyHp}/{battle.encounter.stats.health}</Text>
            </Animated.View>
          </Animated.View>

          {!exchangeComplete ? (
            <View style={styles.battleFightHud}>
              <Text style={styles.battleFightCue} numberOfLines={1}>{fightCue}</Text>
              <View style={styles.battleExchangeReadoutRow}>
                <View style={[styles.battleExchangePill, dragonAttackActive && styles.battleExchangePillActiveDragon]}>
                  <Text style={styles.battleExchangePillKicker}>Your turn</Text>
                  <Text style={styles.battleExchangePillText} numberOfLines={1}>{dragonExchangeSummary}</Text>
                </View>
                <View style={[styles.battleExchangePill, enemyAttackActive && styles.battleExchangePillActiveEnemy]}>
                  <Text style={styles.battleExchangePillKicker}>Enemy turn</Text>
                  <Text style={styles.battleExchangePillText} numberOfLines={1}>{enemyExchangeSummary}</Text>
                </View>
              </View>
              {battle.activeSkill ? (
                <Text style={styles.battleSkillText} numberOfLines={1}>Active skill: {battle.activeSkill.name} • {battle.activeSkill.combatEffect}</Text>
              ) : null}
              <Text style={styles.battleFightStats} numberOfLines={1}>Health {animatedHp.playerHp}/{chapterMaxHp} • Attack {state.dragon.stats.attack} • Defense {state.dragon.stats.defense} • CRIT {state.dragon.stats.critChance}% • BLOCK {state.dragon.stats.block}% • DODGE {state.dragon.stats.dodge}%</Text>
            </View>
          ) : null}

          {exchangeComplete ? <BattleOutcomeBanner battle={battle} continueScreen={continueScreen} /> : null}
          {exchangeComplete ? <BattleFlashCalloutRail battle={battle} stats={state.dragon.stats} element={element} /> : null}

          <Pressable
            disabled={battleStarted && !exchangeComplete}
            onPress={() => {
              if (!battleStarted) {
                setBattleStarted(true);
                return;
              }
              dispatch({ type: "setScreen", screen: continueScreen });
            }}
            style={[styles.battleArenaContinueButton, battleStarted && !exchangeComplete && styles.battleArenaContinueButtonDisabled]}
          >
            <Text style={styles.battleArenaContinueText}>{!battleStarted ? "Start Battle" : exchangeComplete ? (continueScreen === "den" ? "Return to Den" : "Continue Run") : "Fighting..."}</Text>
          </Pressable>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

function BattleOutcomeBanner({ battle, continueScreen }: { battle: BattleResult; continueScreen: ScreenKey }) {
  const title = battle.won ? "Victory strike" : "Forced back";
  const rewardLine = battle.won ? battle.rewardSummary ?? "Spoils ready in the return chest" : "Regroup, train, and try the road again";
  const nextLine = continueScreen === "den" ? "Next: return to the den" : "Next: press deeper into the chapter";

  return (
    <View style={[styles.battleOutcomeBanner, battle.won ? styles.battleOutcomeBannerWin : styles.battleOutcomeBannerLoss]}>
      <View style={styles.battleOutcomeIconWrap}>
        <Text style={styles.battleOutcomeIcon}>{battle.won ? "⚔️" : "🛡️"}</Text>
      </View>
      <View style={styles.battleOutcomeCopy}>
        <Text style={styles.battleOutcomeKicker}>{battle.won ? "Enemy broken" : "Dragon protected"}</Text>
        <Text style={styles.battleOutcomeTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.battleOutcomeLine} numberOfLines={1}>{rewardLine}</Text>
        <Text style={styles.battleOutcomeNext} numberOfLines={1}>{nextLine}</Text>
      </View>
    </View>
  );
}

function UpgradeScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  return <FocusedTrainingPanel state={state} dispatch={dispatch} />;
}

function FocusedTrainingPanel({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  const priorityStats: Array<keyof Stats> = ["attack", "defense", "critChance", "speed"];
  const selectedSkill = getActiveDragonSkill(state);

  return (
    <View style={styles.focusedTrainingPanel}>
      <Text style={styles.sectionTitle}>Train for next fight</Text>
      <Text style={styles.bodyText} numberOfLines={1}>Pick one impactful combat upgrade, then test it on the route.</Text>
      <View style={styles.focusedTrainingGrid}>
        {priorityStats.map((stat) => {
          const cost = getUpgradeCost(state, stat);
          return (
            <Pressable
              key={stat}
              onPress={() => dispatch({ type: "buyUpgrade", stat })}
              disabled={state.player.gold < cost}
              style={[styles.focusedTrainingStatCard, state.player.gold < cost && styles.disabledButton]}
            >
              <Text style={styles.statValue}>{formatStatValue(stat, state.dragon.stats[stat])}</Text>
              <Text style={styles.statLabel}>{formatStat(stat)}</Text>
              <Text style={styles.statHint} numberOfLines={1}>{combatStatTips[stat]}</Text>
              <Text style={styles.buyButtonText}>{cost}g</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.focusedTrainingSkillRow}>
        <View style={styles.focusedTrainingSkillCopy}>
          <Text style={styles.skillDraftArchetype}>ACTIVE SKILL</Text>
          <Text style={styles.skillDraftName} numberOfLines={1}>{selectedSkill ? selectedSkill.name : "Path default active skill"}</Text>
          <Text style={styles.skillDraftHooks} numberOfLines={1}>{selectedSkill ? selectedSkill.effect : "Win elite fights to unlock build picks."}</Text>
        </View>
      </View>
      <SkillDraftPanel state={state} dispatch={dispatch} />
    </View>
  );
}

function SkillDraftPanel({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  const selectedSkill = getActiveDragonSkill(state);
  const eliteDraftSkills = state.lastSkillDraftOffer
    ? state.lastSkillDraftOffer.skillIds
        .map((skillId) => dragonSkillDrafts.find((skill) => skill.id === skillId))
        .filter(Boolean)
    : [];
  const chosenDraftSkill = state.lastSkillDraftOffer?.chosenSkillId
    ? dragonSkillDrafts.find((skill) => skill.id === state.lastSkillDraftOffer?.chosenSkillId)
    : null;

  const visibleSkills = state.lastSkillDraftOffer
    ? dragonSkillDrafts.filter((skill) => state.lastSkillDraftOffer?.skillIds.includes(skill.id))
    : dragonSkillDrafts.slice(0, 3);

  return (
    <View style={styles.skillDraftPanel}>
      <Text style={styles.panelTitle}>Skill Draft</Text>
      <Text style={styles.bodyText} numberOfLines={1}>Three clear build picks, not a full encyclopedia.</Text>
      <Text style={styles.skillDraftHooks} numberOfLines={1}>Skill slot: {selectedSkill ? `${selectedSkill.name} (${selectedSkill.elementFocus.toUpperCase()} ${selectedSkill.roleFocus.toUpperCase()})` : "Path default active skill"}</Text>
      {state.lastSkillDraftOffer ? (
        <View style={styles.skillDraftCardSelected}>
          <Text style={styles.skillDraftArchetype}>ELITE SKILL DRAFT REWARD</Text>
          <Text style={styles.skillDraftName}>{state.lastSkillDraftOffer.sourceNodeTitle}</Text>
          <Text style={styles.skillDraftLine}>{state.lastSkillDraftOffer.reason}</Text>
          <Text style={styles.skillDraftHooks}>Draft choices: {eliteDraftSkills.map((skill) => skill?.name).join(" / ")}</Text>
          <Text style={styles.skillDraftHooks}>Draft picked: {chosenDraftSkill ? `${chosenDraftSkill.name} is now the active build reward.` : "Choose one skill below to lock in this elite reward."}</Text>
        </View>
      ) : (
        <Text style={styles.skillDraftHooks}>Elite fights now unlock a three-choice skill draft reward for testing new builds.</Text>
      )}
      <View style={styles.skillDraftGrid}>
        {visibleSkills.map((skill) => {
          const isSlotted = selectedSkill?.id === skill.id;
          const unlockState = getActiveSkillUnlockState(state, skill);
          const isLocked = !unlockState.unlocked;
          const isUnclaimedEliteDraftChoice = Boolean(
            state.lastSkillDraftOffer?.skillIds.includes(skill.id) && !state.lastSkillDraftOffer.chosenSkillId && !unlockState.isPathDefault
          );
          return (
            <View key={skill.id} style={[styles.skillDraftCard, isSlotted && styles.skillDraftCardSelected]}>
              <Text style={styles.skillDraftArchetype}>{skill.elementFocus.toUpperCase()} · {skill.archetype.toUpperCase()} · {skill.roleFocus.toUpperCase()} BUILD</Text>
              <Text style={styles.skillDraftName}>{skill.name}</Text>
              <Text style={styles.skillDraftLine} numberOfLines={1}>Trigger: {skill.trigger}</Text>
              <Text style={styles.skillDraftLine} numberOfLines={1}>{skill.effect}</Text>
              <Text style={styles.skillDraftSynergy} numberOfLines={1}>{skill.synergy}</Text>
              <Text style={styles.skillDraftHooks} numberOfLines={1}>Bonus: {Math.round((skill.activeBonus.damageMultiplier - 1) * 1000) / 10}% DMG / {Math.round(skill.activeBonus.damageReduction * 1000) / 10}% MIT</Text>
              <Text style={styles.skillDraftHooks} numberOfLines={1}>Hooks: {skill.statHooks.map(formatStat).join(" / ")}</Text>
              <PrimaryButton
                label={isSlotted ? "Active skill slotted" : isLocked ? "Skill locked" : isUnclaimedEliteDraftChoice ? "Choose draft skill" : "Slot active skill"}
                disabled={isSlotted || isLocked}
                onPress={() => dispatch({ type: "selectActiveSkill", skillId: skill.id })}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

function QuestScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Dragon Quests</Text>
      {quests.map((quest) => {
        const progress = getQuestProgress(state, quest.id);
        const claimed = state.player.claimedQuests.includes(quest.id);
        const ready = progress >= quest.target && !claimed;
        return (
          <View key={quest.id} style={styles.panel}>
            <Text style={styles.panelTitle}>{quest.title}</Text>
            <Text style={styles.bodyText}>{quest.description}</Text>
            <ProgressBar progress={progress / quest.target} color="#f4d36a" label={`${progress}/${quest.target}`} />
            <PrimaryButton
              label={claimed ? "Claimed" : ready ? `Claim ${quest.rewardGold}g` : "In progress"}
              disabled={!ready}
              onPress={() => dispatch({ type: "claimQuest", questId: quest.id })}
            />
          </View>
        );
      })}
    </View>
  );
}

function ShopScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Wyrm Market</Text>
      {shopItems.map((item) => {
        const owned = state.player.inventory.includes(item.id);
        const canBuy = state.player.gold >= item.cost && !owned;
        return (
          <View key={item.id} style={styles.panel}>
            <Text style={styles.panelTitle}>{item.name}</Text>
            <Text style={styles.bodyText}>{item.description}</Text>
            <Text style={styles.hintText}>Boost: {formatBoost(item.statBoost)}</Text>
            <PrimaryButton
              label={owned ? "Owned" : `Buy for ${item.cost}g`}
              disabled={!canBuy}
              onPress={() => dispatch({ type: "buyShopItem", itemId: item.id })}
            />
          </View>
        );
      })}
    </View>
  );
}

const combatStatTips: Record<keyof Stats, string> = {
  attack: "Bigger hits",
  health: "More HP",
  defense: "Less damage taken",
  speed: "Tempo + dodge",
  block: "Chance to reduce hits",
  dodge: "Chance to avoid hits",
  critChance: "CRIT frequency",
  critDamage: "Crit DMG burst"
};

function StatsGrid({ stats, compact = false }: { stats: Stats; compact?: boolean }) {
  return (
    <View style={[styles.statsGrid, compact && styles.compactStats]}>
      {(Object.keys(stats) as Array<keyof Stats>).map((stat) => (
        <View key={stat} style={styles.statCard}>
          <Text style={styles.statValue}>{formatStatValue(stat, stats[stat])}</Text>
          <Text style={styles.statLabel}>{formatStat(stat)}</Text>
          <Text style={styles.statHint}>{combatStatTips[stat]}</Text>
        </View>
      ))}
    </View>
  );
}

function ProgressBar({ progress, color, label }: { progress: number; color: string; label: string }) {
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(4, Math.min(100, progress * 100))}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.progressLabel}>{label}</Text>
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.primaryButton, disabled && styles.disabledButton]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryButton}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function formatStat(stat: keyof Stats) {
  switch (stat) {
    case "critChance":
      return "Crit";
    case "critDamage":
      return "Crit DMG";
    default:
      return stat[0].toUpperCase() + stat.slice(1);
  }
}

function formatStatValue(stat: keyof Stats, value: number) {
  return stat === "critChance" || stat === "critDamage" ? `${value}%` : value;
}

function formatBoost(boost: Partial<Stats>) {
  return Object.entries(boost)
    .map(([key, value]) => `+${value} ${formatStat(key as keyof Stats)}`)
    .join(", ");
}

function formatAdventureReward(reward: {
  gold?: number;
  essence?: number;
  xp?: number;
  evolution?: number;
  statBoost?: Partial<Stats>;
}) {
  const parts = [
    reward.gold ? `${reward.gold}g` : null,
    reward.essence ? `${reward.essence} essence` : null,
    reward.xp ? `${reward.xp} XP` : null,
    reward.evolution && reward.evolution >= 10 ? "major boss reward" : null,
    reward.statBoost ? formatBoost(reward.statBoost) : null
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "story progress";
}

function getSceneColor(scene: AdventureNode["scene"]) {
  switch (scene) {
    case "forest":
      return "rgba(58,103,50,0.92)";
    case "ruins":
      return "rgba(91,75,111,0.92)";
    case "cave":
      return "rgba(38,69,103,0.92)";
    case "shrine":
      return "rgba(88,91,156,0.92)";
    case "camp":
      return "rgba(127,74,37,0.92)";
    case "boss":
      return "rgba(116,36,45,0.94)";
    default:
      return "rgba(255,255,255,0.1)";
  }
}

function getLeadingEggElement(state: GameState): DragonElement {
  const scores: Record<DragonElement, number> = { fire: 0, water: 0, earth: 0, light: 0, dark: 0 };

  Object.values(state.eggAnswers).forEach((element) => {
    scores[element] += 1;
  });

  const [leader] = (Object.entries(scores) as Array<[DragonElement, number]>).sort((a, b) => b[1] - a[1]);
  return leader?.[1] > 0 ? leader[0] : "fire";
}

const styles = StyleSheet.create({
  app: {
    flex: 1
  },
  safe: {
    flex: 1,
    paddingBottom: 10,
    paddingHorizontal: 18,
    paddingTop: 4
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 14
  },
  guidedHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 8
  },
  guidedHeaderAdventure: {
    backgroundColor: "rgba(8,6,17,0.55)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 4,
    marginTop: 0,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  kicker: {
    color: "#a99bd9",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  title: {
    color: "#fff8ef",
    fontSize: 28,
    fontWeight: "900"
  },
  titleAdventure: {
    fontSize: 16,
    lineHeight: 19
  },
  subtitle: {
    color: "#dacff8",
    fontSize: 14,
    marginTop: 2
  },
  subtitleAdventure: {
    fontSize: 9,
    fontWeight: "800",
    marginTop: 0
  },
  resetButton: {
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  resetButtonAdventure: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  resetText: {
    color: "#f5ddff",
    fontWeight: "700"
  },
  resetTextAdventure: {
    fontSize: 11,
    fontWeight: "900"
  },
  floatingResetButton: {
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    position: "absolute",
    right: 18,
    top: 8,
    zIndex: 10
  },
  dragonCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 14,
    minHeight: 210,
    overflow: "hidden"
  },
  dragonImageBackground: {
    flex: 1,
    justifyContent: "flex-end",
    minHeight: 210
  },
  dragonImage: {
    borderRadius: 28
  },
  dragonCardOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16
  },
  elementChip: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  elementChipText: {
    color: "#160c2f",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1
  },
  dragonCopy: {
    marginTop: 76
  },
  dragonStage: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5
  },
  dragonDescription: {
    color: "#fff8ef",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4
  },
  aura: {
    color: "#cfc5ee",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6
  },
  resourceBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12
  },
  resource: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    flex: 1,
    padding: 10
  },
  resourceLabel: {
    color: "#a99bd9",
    fontSize: 11,
    fontWeight: "700"
  },
  resourceValue: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2
  },
  content: {
    flex: 1
  },
  guidedStage: {
    flex: 1,
    paddingBottom: 16
  },
  guidedScene: {
    borderRadius: 30,
    flex: 1,
    overflow: "hidden"
  },
  guidedSceneImage: {
    borderRadius: 30
  },
  dragonDisplay: {
    borderRadius: uiTheme.radius.xl,
    flex: 1,
    overflow: "hidden",
    ...uiTheme.shadow
  },
  dragonDisplayCompact: {
    borderRadius: uiTheme.radius.lg,
    minHeight: 220
  },
  dragonDisplayBackground: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  dragonDisplayOverlay: {
    flex: 1,
    position: "relative"
  },
  dragonTapTarget: {
    alignItems: "center",
    bottom: 190,
    height: 270,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0
  },
  dragonTapTargetCompact: {
    bottom: 10,
    height: 190
  },
  hudBar: {
    flexDirection: "row",
    gap: 10,
    left: 14,
    position: "absolute",
    right: 14,
    top: 18,
    zIndex: 20
  },
  statPill: {
    backgroundColor: uiTheme.colors.panelStrong,
    borderColor: uiTheme.colors.borderStrong,
    borderRadius: uiTheme.radius.lg,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    ...uiTheme.shadow
  },
  statPillLabel: {
    color: uiTheme.colors.gold,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  statPillValue: {
    color: uiTheme.colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 2
  },
  statPillValueLarge: {
    fontSize: 26
  },
  dragonPathChoicePanel: {
    backgroundColor: "rgba(10,7,21,0.9)",
    borderColor: uiTheme.colors.borderStrong,
    borderRadius: 22,
    borderWidth: 1,
    bottom: 94,
    left: 16,
    padding: 12,
    position: "absolute",
    right: 16,
    zIndex: 18,
    ...uiTheme.shadow
  },
  dragonPathKicker: {
    color: uiTheme.colors.gold,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  dragonPathTitle: {
    color: uiTheme.colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3
  },
  dragonPathIntro: {
    color: uiTheme.colors.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 4
  },
  dragonPathChoiceRows: {
    gap: 8,
    marginTop: 10
  },
  dragonPathChoiceCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 9
  },
  dragonPathChoiceVow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  dragonPathChoiceName: {
    color: uiTheme.colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2
  },
  dragonPathChoiceDescription: {
    color: uiTheme.colors.muted,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15,
    marginTop: 2
  },
  dragonPathChoiceCombat: {
    color: uiTheme.colors.info,
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 14,
    marginTop: 4
  },
  dragonPathChoiceTradeoff: {
    color: uiTheme.colors.gold,
    fontSize: 9,
    fontWeight: "900",
    lineHeight: 13,
    marginTop: 3
  },
  dragonPathChoiceBonus: {
    color: uiTheme.colors.gold,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 4
  },
  dragonPathBadge: {
    backgroundColor: "rgba(10,7,21,0.68)",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 7,
    maxWidth: 270,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  dragonPathBadgeName: {
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase"
  },
  dragonPathBadgeText: {
    color: uiTheme.colors.muted,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
    textAlign: "center"
  },
  dragonPathBadgeCombat: {
    color: uiTheme.colors.info,
    fontSize: 9,
    fontWeight: "900",
    lineHeight: 12,
    marginTop: 3,
    textAlign: "center"
  },
  fireBreathCombatLayer: {
    bottom: 190,
    height: 270,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 11
  },
  fireBreathEnemyCard: {
    alignItems: "center",
    minHeight: 132,
    paddingHorizontal: 9,
    paddingVertical: 8,
    position: "absolute",
    left: 14,
    top: 78,
    width: 118
  },
  fireBreathEnemyShadow: {
    backgroundColor: "rgba(0,0,0,0.34)",
    borderRadius: 999,
    height: 12,
    marginTop: 54,
    position: "absolute",
    width: 76
  },
  fireBreathEnemySpriteFrame: {
    alignItems: "center",
    height: 66,
    justifyContent: "center",
    marginBottom: 3,
    width: 88
  },
  fireBreathEnemyImage: {
    height: 62,
    width: 84
  },
  fireBreathHitSparks: {
    borderColor: "rgba(255,211,93,0.9)",
    borderLeftWidth: 0,
    borderRadius: 999,
    borderRightWidth: 3,
    borderTopWidth: 2,
    height: 78,
    left: 18,
    position: "absolute",
    top: 2,
    transform: [{ rotate: "-18deg" }],
    width: 78
  },
  fireBreathEnemyName: {
    color: uiTheme.colors.text,
    fontSize: 11,
    fontWeight: "900",
    maxWidth: 98,
    textAlign: "center"
  },
  fireBreathEnemyMeta: {
    color: uiTheme.colors.gold,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 5,
    textTransform: "uppercase"
  },
  fireBreathDragonHpCard: {
    alignItems: "center",
    backgroundColor: "rgba(6,8,20,0.7)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 62,
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: "absolute",
    right: 18,
    top: 182,
    width: 136,
    zIndex: 12
  },
  fireBreathDragonHitFlash: {
    backgroundColor: "rgba(255,120,79,0.34)",
    borderColor: "rgba(255,255,255,0.42)",
    borderRadius: 16,
    borderWidth: 1,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  fireBreathDragonName: {
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  fireBreathDragonHpTrack: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    height: 8,
    marginTop: 6,
    overflow: "hidden",
    width: 110
  },
  fireBreathDragonHpFill: {
    borderRadius: 999,
    height: "100%"
  },
  fireBreathDragonMeta: {
    color: uiTheme.colors.muted,
    fontSize: 9,
    fontWeight: "900",
    marginTop: 5,
    textTransform: "uppercase"
  },
  enemyStrikeSlash: {
    alignItems: "center",
    backgroundColor: "rgba(255,91,110,0.26)",
    borderColor: "rgba(255,220,220,0.72)",
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    left: 94,
    position: "absolute",
    top: 145,
    width: 58,
    zIndex: 14
  },
  enemyStrikeSlashText: {
    color: "#ffd5d8",
    fontSize: 22,
    fontWeight: "900"
  },
  fireBreathHpTrack: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    height: 7,
    marginTop: 7,
    overflow: "hidden",
    width: 94
  },
  fireBreathHpFill: {
    backgroundColor: "#ff784f",
    borderRadius: 999,
    height: "100%"
  },
  fireBreathParticleTrail: {
    height: 1,
    left: "47%",
    position: "absolute",
    top: 132,
    width: 1
  },
  fireBreathParticle: {
    borderRadius: 999,
    position: "absolute"
  },
  combatTurnLabel: {
    backgroundColor: "rgba(10,8,22,0.72)",
    borderColor: "rgba(255,232,163,0.34)",
    borderRadius: 999,
    borderWidth: 1,
    color: uiTheme.colors.text,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: "absolute",
    textTransform: "uppercase",
    zIndex: 12
  },
  combatTurnLabelDragon: {
    maxWidth: 172,
    right: 30,
    textAlign: "center",
    top: 78
  },
  combatTurnLabelEnemyHit: {
    color: uiTheme.colors.gold,
    left: 30,
    maxWidth: 172,
    textAlign: "center",
    top: 52
  },
  combatTurnLabelEnemy: {
    left: 20,
    top: 178
  },
  combatTurnLabelDragonBrace: {
    color: "#ffd6a4",
    maxWidth: 172,
    right: 34,
    textAlign: "center",
    top: 168
  },
  combatStatFxBadge: {
    backgroundColor: "rgba(4,8,18,0.82)",
    borderRadius: 999,
    borderWidth: 1,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: "absolute",
    textTransform: "uppercase",
    zIndex: 13
  },
  combatStatFxBadgeCrit: {
    borderColor: "rgba(255,214,94,0.7)",
    color: "#ffe27a",
    left: 24,
    top: 28
  },
  combatStatFxBadgeDodge: {
    borderColor: "rgba(112,215,255,0.66)",
    color: "#a7f3ff",
    right: 24,
    top: 198
  },
  combatStatFxBadgeBlock: {
    borderColor: "rgba(196,255,168,0.62)",
    color: "#d9f99d",
    right: 30,
    top: 224
  },
  fireBreathMouthGlow: {
    backgroundColor: "rgba(255,214,94,0.9)",
    borderColor: "rgba(255,124,54,0.72)",
    borderRadius: 999,
    borderWidth: 2,
    height: 26,
    left: "47%",
    position: "absolute",
    top: 119,
    width: 26
  },
  mainDragonInfo: {
    alignItems: "center",
    bottom: 98,
    left: 16,
    position: "absolute",
    right: 16,
    zIndex: 12
  },
  mainAdventurePathOverlay: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 20
  },
  mainAdventurePathContent: {
    paddingBottom: 0
  },
  mainDragonName: {
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8
  },
  mainDragonMeta: {
    color: uiTheme.colors.text,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 4,
    textTransform: "uppercase"
  },
  mainTapHint: {
    color: uiTheme.colors.muted,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "center"
  },
  returnToAdventureButton: {
    backgroundColor: "rgba(248,217,135,0.18)",
    borderColor: "rgba(248,217,135,0.42)",
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  returnToAdventureText: {
    color: uiTheme.colors.gold,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  bottomNav: {
    backgroundColor: "rgba(6,5,15,0.9)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 18,
    borderWidth: 1,
    bottom: 6,
    flexDirection: "row",
    gap: 3,
    left: 8,
    padding: 4,
    position: "absolute",
    right: 8,
    zIndex: 30,
    ...uiTheme.shadow
  },
  guidedPlaytestOverlay: {
    backgroundColor: "rgba(10,7,21,0.92)",
    borderColor: "rgba(248,217,135,0.36)",
    borderRadius: 20,
    borderWidth: 1,
    left: 14,
    maxHeight: 250,
    padding: 12,
    position: "absolute",
    right: 14,
    top: 178,
    zIndex: 28,
    ...uiTheme.shadow
  },
  guidedPlaytestHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  guidedPlaytestTitle: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900"
  },
  guidedPlaytestProgress: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900"
  },
  guidedPlaytestList: {
    maxHeight: 152
  },
  guidedPlaytestListContent: {
    gap: 6
  },
  guidedPlaytestRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  guidedPlaytestCheck: {
    color: "#b9aee3",
    fontSize: 13,
    fontWeight: "900",
    width: 18
  },
  guidedPlaytestCheckDone: {
    color: "#8fffd2"
  },
  guidedPlaytestText: {
    color: "#d8cfef",
    flex: 1,
    fontSize: 11,
    fontWeight: "800"
  },
  guidedPlaytestTextDone: {
    color: "#8fffd2"
  },
  guidedPlaytestEndButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
    paddingVertical: 8
  },
  guidedPlaytestEndText: {
    color: "#ffb39d",
    fontSize: 11,
    fontWeight: "900"
  },
  bottomNavButton: {
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
    minHeight: 38,
    paddingVertical: 3
  },
  bottomNavButtonActive: {
    backgroundColor: uiTheme.colors.gold,
    shadowColor: uiTheme.colors.gold,
    shadowOpacity: 0.32,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5
  },
  bottomNavIcon: {
    color: uiTheme.colors.muted,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 0
  },
  bottomNavText: {
    color: uiTheme.colors.muted,
    fontSize: 7,
    fontWeight: "900",
    lineHeight: 9
  },
  bottomNavTextActive: {
    color: uiTheme.colors.goldDark
  },
  sheetScrim: {
    flex: 1,
    justifyContent: "flex-end"
  },
  sheetBackdrop: {
    backgroundColor: "rgba(0,0,0,0.48)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  panelSheet: {
    backgroundColor: uiTheme.colors.panel,
    borderColor: uiTheme.colors.borderStrong,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    maxHeight: "76%",
    paddingHorizontal: 16,
    paddingTop: 10,
    ...uiTheme.shadow
  },
  panelSheetHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(248,217,135,0.55)",
    borderRadius: 999,
    height: 5,
    marginBottom: 12,
    width: 48
  },
  panelSheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  panelSheetTitle: {
    color: uiTheme.colors.text,
    fontSize: 26,
    fontWeight: "900"
  },
  panelCloseButton: {
    borderColor: uiTheme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  panelCloseText: {
    color: uiTheme.colors.muted,
    fontWeight: "900"
  },
  panelSheetContent: {
    gap: 12,
    paddingBottom: 38
  },
  sectionCard: {
    backgroundColor: uiTheme.colors.panelRaised,
    borderColor: uiTheme.colors.border,
    borderRadius: uiTheme.radius.lg,
    borderWidth: 1,
    padding: 15,
    ...uiTheme.shadow
  },
  sectionCardTitle: {
    color: uiTheme.colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  sectionCardSubtitle: {
    color: uiTheme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4
  },
  sectionCardBody: {
    marginTop: 12
  },
  panelMutedText: {
    color: uiTheme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18
  },
  primaryPanelButton: {
    alignItems: "center",
    backgroundColor: uiTheme.colors.gold,
    borderRadius: uiTheme.radius.md,
    paddingHorizontal: 18,
    paddingVertical: 13,
    ...uiTheme.shadow
  },
  primaryPanelButtonText: {
    color: uiTheme.colors.goldDark,
    fontSize: 15,
    fontWeight: "900"
  },
  presenceTestGrid: {
    gap: 8
  },
  presenceTestButton: {
    alignItems: "center",
    backgroundColor: uiTheme.colors.gold,
    borderRadius: uiTheme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  debugSectionLabel: {
    color: uiTheme.colors.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 6,
    textTransform: "uppercase"
  },
  reviewToggleRow: {
    gap: 8,
    marginTop: 12
  },
  hatchlingReviewModal: {
    backgroundColor: uiTheme.colors.ink,
    flex: 1
  },
  hatchlingReviewHeader: {
    alignItems: "flex-start",
    backgroundColor: uiTheme.colors.panelStrong,
    borderBottomColor: uiTheme.colors.borderStrong,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 16
  },
  hatchlingReviewHeaderText: {
    flex: 1
  },
  hatchlingReviewModalTitle: {
    color: uiTheme.colors.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4
  },
  hatchlingApprovalLabel: {
    color: uiTheme.colors.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: "uppercase"
  },
  hatchlingReviewExitButton: {
    backgroundColor: "#ffb39d",
    borderRadius: uiTheme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  hatchlingReviewExitText: {
    color: "#3b170e",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1
  },
  hatchlingReviewModalContent: {
    gap: 12,
    padding: 16,
    paddingBottom: 38
  },
  hatchlingFocusCard: {
    paddingRight: 10
  },
  hatchlingFocusDisplayWrap: {
    height: 330,
    marginTop: 10
  },
  hatchlingReviewRow: {
    gap: 12,
    paddingVertical: 12
  },
  hatchlingReviewCard: {
    backgroundColor: "rgba(255,255,255,0.055)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: uiTheme.radius.lg,
    borderWidth: 1,
    padding: 10,
    width: 220
  },
  hatchlingReviewTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center"
  },
  hatchlingReviewDisplayWrap: {
    height: 230
  },
  hatchlingReviewNotes: {
    backgroundColor: "rgba(5,4,12,0.42)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: uiTheme.radius.md,
    borderWidth: 1,
    color: uiTheme.colors.text,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 10,
    minHeight: 64,
    padding: 10,
    textAlignVertical: "top"
  },
  reviewChecklist: {
    gap: 10,
    marginTop: 8
  },
  reviewChecklistGroup: {
    gap: 4
  },
  drakeContinuityBlock: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: uiTheme.radius.lg,
    borderWidth: 1,
    gap: 8,
    marginTop: 12,
    padding: 10
  },
  drakeContinuityPair: {
    gap: 10,
    paddingVertical: 8
  },
  drakeContinuityCard: {
    width: 210
  },
  drakeContinuityCardTitle: {
    color: uiTheme.colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 6,
    textAlign: "center"
  },
  reviewCheckRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 3
  },
  reviewCheckMark: {
    color: uiTheme.colors.gold,
    fontSize: 15,
    fontWeight: "900",
    width: 18
  },
  reviewCheckText: {
    color: uiTheme.colors.text,
    flex: 1,
    fontSize: 12,
    fontWeight: "800"
  },
  panelUpgradeGrid: {
    flexDirection: "row",
    gap: 8
  },
  panelStatsRow: {
    flexDirection: "row",
    gap: 10
  },
  rewardRowCompact: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.075)",
    borderRadius: uiTheme.radius.md,
    flexDirection: "row",
    gap: 10,
    marginBottom: 9,
    padding: 12
  },
  emptyState: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: uiTheme.radius.md,
    borderStyle: "dashed",
    borderWidth: 1,
    padding: 18
  },
  emptyStateTitle: {
    color: uiTheme.colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  emptyStateDetail: {
    color: uiTheme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 5,
    textAlign: "center"
  },
  dragonDisplayGlow: {
    borderRadius: 999,
    height: 218,
    position: "absolute",
    width: 218
  },
  dragonDisplayGlowFire: {
    height: 236,
    width: 236
  },
  dragonDisplayGlowWater: {
    height: 222,
    width: 222
  },
  dragonDisplayGlowEarth: {
    height: 208,
    width: 208
  },
  dragonDisplayGlowAlert: {
    height: 248,
    width: 248
  },
  dragonDisplayGlowExcited: {
    height: 272,
    width: 272
  },
  staticDragonGlow: {
    borderRadius: 999,
    opacity: 0.18,
    position: "absolute"
  },
  fireDenNestGlow: {
    backgroundColor: "rgba(255, 128, 36, 0.22)",
    borderColor: "rgba(255, 205, 118, 0.3)",
    borderRadius: 999,
    borderWidth: 1,
    bottom: 18,
    height: 74,
    position: "absolute",
    shadowColor: "#fb923c",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.42,
    shadowRadius: 24,
    transform: [{ scaleX: 3.1 }],
    width: 130,
    zIndex: 2
  },
  dragonAuraEffect: {
    height: 300,
    position: "absolute",
    width: 300
  },
  evolutionBurstEffect: {
    height: 330,
    position: "absolute",
    width: 330,
    zIndex: 4
  },
  evolutionWarmGlow: {
    height: 310,
    position: "absolute",
    width: 310,
    zIndex: 2
  },
  evolutionPathAccentLayer: {
    height: 230,
    position: "absolute",
    width: 300,
    zIndex: 7
  },
  evolutionPathAccentPill: {
    backgroundColor: "rgba(8,6,17,0.76)",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: "absolute",
    shadowColor: "#fef3c7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10
  },
  evolutionPathAccentPillLeft: {
    left: 8,
    top: 34
  },
  evolutionPathAccentPillRight: {
    bottom: 42,
    right: 8
  },
  evolutionPathAccentPillGuardian: {
    borderColor: "rgba(125,211,252,0.82)"
  },
  evolutionPathAccentPillRaider: {
    borderColor: "rgba(251,113,133,0.84)"
  },
  evolutionPathAccentPillMystic: {
    borderColor: "rgba(196,181,253,0.84)"
  },
  evolutionPathAccentKicker: {
    color: "#fef3c7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  evolutionPathAccentText: {
    color: "#fff7ed",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 2
  },
  dragonGroundShadow: {
    backgroundColor: "rgba(2,1,8,0.42)",
    borderRadius: 999,
    bottom: 24,
    height: 28,
    position: "absolute",
    transform: [{ scaleX: 2.6 }],
    width: 92,
    zIndex: 3
  },
  dragonGroundShadowResting: {
    bottom: 18,
    opacity: 0.55,
    transform: [{ scaleX: 2.9 }]
  },
  dragonGroundShadowValidation: {
    bottom: 48,
    height: 18,
    transform: [{ scaleX: 1.7 }],
    width: 70
  },
  dragonGroundShadowCompact: {
    bottom: 20,
    height: 18,
    transform: [{ scaleX: 1.8 }],
    width: 70
  },
  dragonDisplaySprite: {
    height: 220,
    width: 220,
    zIndex: 5
  },
  fireDenDragonDisplaySprite: {
    height: 340,
    width: 340
  },
  dragonDisplaySpriteCompact: {
    height: 158,
    width: 158
  },
  dragonDisplaySpriteValidation: {
    height: 128,
    width: 128
  },
  dragonDisplayImage: {
    height: "100%",
    width: "100%"
  },
  layeredFireHatchlingCanvas: {
    height: "100%",
    position: "relative",
    width: "100%"
  },
  layeredFireFullImage: {
    height: "100%",
    left: 0,
    position: "absolute",
    top: 0,
    width: "100%"
  },
  layeredFireUnderlay: {
    opacity: 0.42
  },
  layeredFirePart: {
    overflow: "hidden",
    position: "absolute"
  },
  layeredFireHead: {
    height: 78,
    left: 57,
    top: 12,
    width: 106,
    zIndex: 8
  },
  layeredFireHeadImage: {
    height: 220,
    left: -57,
    position: "absolute",
    top: -12,
    width: 220
  },
  layeredFireWingNear: {
    height: 110,
    left: 110,
    top: 58,
    width: 82,
    zIndex: 7
  },
  layeredFireWingNearImage: {
    height: 220,
    left: -110,
    position: "absolute",
    top: -58,
    width: 220
  },
  layeredFireWingFar: {
    height: 92,
    left: 34,
    opacity: 0.82,
    top: 70,
    width: 76,
    zIndex: 4
  },
  layeredFireWingFarImage: {
    height: 220,
    left: -34,
    position: "absolute",
    top: -70,
    width: 220
  },
  layeredFireBody: {
    height: 108,
    left: 48,
    top: 76,
    width: 126,
    zIndex: 6
  },
  layeredFireBodyImage: {
    height: 220,
    left: -48,
    position: "absolute",
    top: -76,
    width: 220
  },
  layeredFireTail: {
    height: 78,
    left: 22,
    top: 124,
    width: 82,
    zIndex: 5
  },
  layeredFireTailImage: {
    height: 220,
    left: -22,
    position: "absolute",
    top: -124,
    width: 220
  },
  dragonDisplayImageValidation: {
    tintColor: "#9a9a9a"
  },
  dragonDisplayImageSilhouette: {
    opacity: 0.38,
    tintColor: "#fff1bd"
  },
  artValidationBadge: {
    backgroundColor: "rgba(5,4,12,0.82)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    bottom: -6,
    color: "#e8e8e8",
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: "absolute",
    textTransform: "uppercase",
    zIndex: 8
  },
  lowBrightnessOverlay: {
    backgroundColor: "rgba(0,0,0,0.48)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 7
  },
  assetFallback: {
    alignItems: "center",
    backgroundColor: "rgba(18,11,38,0.7)",
    justifyContent: "center"
  },
  assetFallbackText: {
    color: "#b9aee3",
    fontSize: 12,
    fontWeight: "900"
  },
  hatchlingFallback: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    position: "relative",
    width: "100%"
  },
  hatchlingFallbackValidation: {
    opacity: 0.95
  },
  hatchlingFallbackWing: {
    borderRadius: 28,
    height: 74,
    opacity: 0.78,
    position: "absolute",
    top: 86,
    width: 58
  },
  hatchlingFallbackWingLeft: {
    left: 24,
    transform: [{ rotate: "-26deg" }]
  },
  hatchlingFallbackWingRight: {
    right: 24,
    transform: [{ rotate: "26deg" }]
  },
  hatchlingFallbackBody: {
    alignItems: "center",
    borderRadius: 54,
    height: 112,
    justifyContent: "center",
    marginTop: 62,
    width: 96
  },
  hatchlingFallbackBelly: {
    borderRadius: 36,
    height: 74,
    opacity: 0.78,
    width: 48
  },
  hatchlingFallbackHead: {
    alignItems: "center",
    borderRadius: 58,
    height: 100,
    justifyContent: "center",
    position: "absolute",
    top: 30,
    width: 116
  },
  hatchlingFallbackHorn: {
    borderRadius: 18,
    height: 38,
    position: "absolute",
    top: -16,
    width: 18
  },
  hatchlingFallbackHornLeft: {
    left: 24,
    transform: [{ rotate: "-28deg" }]
  },
  hatchlingFallbackHornRight: {
    right: 24,
    transform: [{ rotate: "28deg" }]
  },
  hatchlingFallbackFin: {
    borderRadius: 20,
    height: 44,
    position: "absolute",
    top: -20,
    width: 28
  },
  hatchlingFallbackCrest: {
    borderRadius: 18,
    height: 36,
    position: "absolute",
    top: -18,
    width: 22
  },
  hatchlingFallbackEye: {
    backgroundColor: "#fff8ef",
    borderRadius: 999,
    height: 18,
    position: "absolute",
    top: 42,
    width: 18
  },
  hatchlingFallbackEyeLeft: {
    left: 32
  },
  hatchlingFallbackEyeRight: {
    right: 32
  },
  hatchlingFallbackTail: {
    borderRadius: 24,
    bottom: 22,
    height: 34,
    position: "absolute",
    right: 36,
    transform: [{ rotate: "-24deg" }],
    width: 80
  },
  floatingText: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.5,
    position: "absolute",
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { height: 2, width: 0 },
    textShadowRadius: 6,
    top: 54,
    zIndex: 8
  },
  idleHud: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    padding: 16,
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 10
  },
  goalButtonsRow: {
    flexDirection: "row",
    gap: 8,
    left: 16,
    position: "absolute",
    right: 16,
    top: 78,
    zIndex: 12
  },
  goalButton: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 8
  },
  goalButtonText: {
    color: "#fff8ef",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center"
  },
  essencePill: {
    backgroundColor: "rgba(11,7,24,0.76)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  essenceLabel: {
    color: "#b9aee3",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  essenceValue: {
    color: "#fff8ef",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2
  },
  idleTitleBlock: {
    left: 18,
    position: "absolute",
    right: 18,
    top: 92,
    zIndex: 9
  },
  idleUpgradePanel: {
    backgroundColor: "rgba(10,7,21,0.9)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 28,
    borderWidth: 1,
    bottom: 14,
    left: 14,
    padding: 12,
    position: "absolute",
    right: 14,
    zIndex: 12
  },
  adventureQuestPanel: {
    backgroundColor: "rgba(10,7,21,0.82)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 24,
    borderWidth: 1,
    bottom: 238,
    left: 14,
    padding: 12,
    position: "absolute",
    right: 14,
    zIndex: 11
  },
  autoBattlePanel: {
    backgroundColor: "rgba(10,7,21,0.84)",
    borderColor: "rgba(255,120,79,0.24)",
    borderRadius: 22,
    borderWidth: 1,
    bottom: 448,
    left: 14,
    padding: 11,
    position: "absolute",
    right: 14,
    zIndex: 11
  },
  adventureJourneyStage: {
    backgroundColor: "rgba(10,7,21,0.82)",
    borderColor: "rgba(248,217,135,0)",
    borderRadius: 0,
    borderWidth: 0,
    flex: 1,
    overflow: "hidden",
    position: "relative"
  },
  adventureJourneyStageFocused: {
    minHeight: 0
  },
  adventureJourneyBackdrop: {
    height: "100%",
    left: 0,
    opacity: 0.78,
    position: "absolute",
    top: 0,
    width: "100%"
  },
  adventureJourneyMovingBackdrop: {
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: "125%"
  },
  adventureJourneyScrim: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  adventureStopStatusBanner: {
    backgroundColor: "rgba(7,10,24,0.82)",
    borderColor: "rgba(143,247,255,0.42)",
    borderRadius: 999,
    borderWidth: 1,
    left: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: "absolute",
    right: 126,
    top: 8,
    zIndex: 6
  },
  adventureStopStatusBannerCombat: {
    backgroundColor: "rgba(58,13,20,0.82)",
    borderColor: "rgba(255,120,79,0.58)"
  },
  adventureStopStatusBannerFocused: {
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    right: 10,
    top: 8
  },
  adventureStopStatusTitle: {
    color: uiTheme.colors.gold,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  adventureStopStatusDetail: {
    color: uiTheme.colors.text,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2
  },
  adventureRouteLine: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 999,
    flexDirection: "row",
    height: 8,
    justifyContent: "space-between",
    left: 24,
    paddingHorizontal: 2,
    position: "absolute",
    right: 24,
    top: 44,
    zIndex: 7
  },
  adventureRouteNode: {
    backgroundColor: "rgba(255,255,255,0.42)",
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    borderWidth: 1,
    height: 16,
    width: 16
  },
  adventureRouteNodeActive: {
    backgroundColor: uiTheme.colors.gold,
    borderColor: "rgba(255,255,255,0.86)"
  },
  adventureRouteNodeDen: {
    backgroundColor: "#7fffc1",
    borderColor: "rgba(255,255,255,0.86)"
  },
  adventureDragonWalker: {
    alignItems: "center",
    left: 8,
    position: "absolute",
    top: "27%",
    width: 198,
    zIndex: 4
  },
  adventureDragonSprite: {
    height: 180,
    width: 198
  },
  adventureDragonSpriteFacingRight: {
    transform: [{ scaleX: -1 }]
  },
  adventureWalkerLabel: {
    backgroundColor: "rgba(10,7,21,0.72)",
    borderRadius: 999,
    fontSize: 10,
    fontWeight: "900",
    marginTop: -7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    textTransform: "uppercase"
  },
  adventureLaneTag: {
    backgroundColor: "rgba(248,217,135,0.9)",
    borderRadius: 999,
    color: "#201331",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginBottom: -4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    textTransform: "uppercase",
    zIndex: 5
  },
  adventureEnemyEncounter: {
    alignItems: "center",
    position: "absolute",
    right: 6,
    top: "25%",
    width: 176,
    zIndex: 3
  },
  adventureClashBurst: {
    backgroundColor: "rgba(255,214,94,0.42)",
    borderColor: "rgba(255,255,255,0.72)",
    borderRadius: 999,
    borderWidth: 2,
    height: 118,
    position: "absolute",
    top: 14,
    width: 118
  },
  adventureEnemySprite: {
    height: 162,
    width: 176
  },
  adventureEnemyName: {
    color: uiTheme.colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginTop: -4,
    textAlign: "center"
  },
  adventureEnemyHpTrack: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    height: 8,
    marginTop: 5,
    overflow: "hidden",
    width: 112
  },
  adventureEnemyHpFill: {
    backgroundColor: "#ff784f",
    borderRadius: 999,
    height: "100%"
  },
  adventureCombatFloaters: {
    alignItems: "center",
    left: 24,
    position: "absolute",
    right: 24,
    top: "18%",
    zIndex: 10
  },
  adventureDamageNumberFloaters: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    width: "74%",
    zIndex: 12
  },
  adventureEnemyDamageNumber: {
    color: "#ffd65e",
    fontSize: 18,
    fontWeight: "900",
    textShadowColor: "rgba(255,120,79,0.92)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10
  },
  adventureDragonDamageNumber: {
    color: "#bfdbfe",
    fontSize: 15,
    fontWeight: "900",
    textShadowColor: "rgba(96,165,250,0.86)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8
  },
  adventureDragonAttackCallout: {
    backgroundColor: "rgba(255,214,94,0.9)",
    borderColor: "rgba(255,255,255,0.8)",
    borderRadius: 999,
    borderWidth: 1,
    color: "#211423",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
    maxWidth: "78%",
    paddingHorizontal: 10,
    paddingVertical: 5,
    textAlign: "center",
    textTransform: "uppercase"
  },
  adventureEnemyCounterCallout: {
    backgroundColor: "rgba(255,95,122,0.88)",
    borderColor: "rgba(255,255,255,0.72)",
    borderRadius: 999,
    borderWidth: 1,
    color: "#fff8ef",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4,
    maxWidth: "76%",
    paddingHorizontal: 10,
    paddingVertical: 5,
    textAlign: "center",
    textTransform: "uppercase"
  },
  adventureStatCalloutRow: {
    flexDirection: "row",
    gap: 5,
    marginTop: 5
  },
  adventureStatCalloutCrit: {
    backgroundColor: "rgba(255,214,94,0.22)",
    borderRadius: 999,
    color: uiTheme.colors.gold,
    fontSize: 9,
    fontWeight: "900",
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  adventureStatCalloutBlock: {
    backgroundColor: "rgba(96,165,250,0.22)",
    borderRadius: 999,
    color: "#bfdbfe",
    fontSize: 9,
    fontWeight: "900",
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  adventureStatCalloutDodge: {
    backgroundColor: "rgba(167,139,250,0.22)",
    borderRadius: 999,
    color: "#ddd6fe",
    fontSize: 9,
    fontWeight: "900",
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  adventureEnemyCounterSlash: {
    alignItems: "center",
    height: 52,
    justifyContent: "center",
    left: 122,
    position: "absolute",
    top: "36%",
    width: 52,
    zIndex: 11
  },
  adventureEnemyCounterSlashText: {
    color: "#fff8ef",
    fontSize: 32,
    fontWeight: "900",
    textShadowColor: "rgba(255,95,122,0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10
  },
  adventureCombatHud: {
    backgroundColor: "rgba(5,8,18,0.88)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 22,
    borderWidth: 1,
    bottom: 58,
    gap: 7,
    left: 12,
    padding: 8,
    position: "absolute",
    right: 12,
    zIndex: 8
  },
  adventureCombatHudFocused: {
    bottom: 10,
    gap: 5,
    padding: 7
  },
  adventureCombatHudHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  adventureCombatHudTitle: {
    color: uiTheme.colors.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  adventureCombatHudTempo: {
    fontSize: 10,
    fontWeight: "900"
  },
  adventureCombatBarsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  adventureCombatFighterCard: {
    flex: 1,
    gap: 4
  },
  adventureCombatName: {
    color: uiTheme.colors.text,
    fontSize: 11,
    fontWeight: "900"
  },
  adventureCombatHpTrack: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    height: 9,
    overflow: "hidden"
  },
  adventureCombatDragonHpFill: {
    borderRadius: 999,
    height: "100%"
  },
  adventureCombatEnemyHpFill: {
    backgroundColor: "#ff5f7a",
    borderRadius: 999,
    height: "100%"
  },
  adventureCombatMeta: {
    color: uiTheme.colors.muted,
    fontSize: 9,
    fontWeight: "800"
  },
  adventureCombatVs: {
    color: "#fff8ef",
    fontSize: 12,
    fontWeight: "900"
  },
  adventureCombatPathTradeoff: {
    backgroundColor: "rgba(248,217,135,0.1)",
    borderColor: "rgba(248,217,135,0.34)",
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
    padding: 6
  },
  adventureCombatPathTradeoffLabel: {
    color: uiTheme.colors.gold,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  adventureCombatPathTradeoffValue: {
    color: "#fff8ef",
    fontSize: 9,
    fontWeight: "900"
  },
  adventureCombatPillRow: {
    flexDirection: "row",
    gap: 6
  },
  adventureCombatPill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    borderWidth: 1,
    color: uiTheme.colors.text,
    flex: 1,
    fontSize: 9,
    fontWeight: "900",
    paddingVertical: 4,
    textAlign: "center"
  },
  adventureDenReturn: {
    alignItems: "center",
    backgroundColor: "rgba(10,7,21,0.75)",
    borderColor: "rgba(127,255,193,0.34)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
    position: "absolute",
    right: 12,
    top: 8,
    zIndex: 9
  },
  adventureDenIcon: {
    fontSize: 13
  },
  adventureDenTitle: {
    color: uiTheme.colors.text,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  adventureDenText: {
    color: uiTheme.colors.muted,
    fontSize: 8,
    fontWeight: "800",
    marginTop: 0
  },
  adventureDenButton: {
    backgroundColor: "rgba(127,255,193,0.2)",
    borderColor: "rgba(127,255,193,0.44)",
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 0,
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  adventureDenButtonText: {
    color: "#b8ffd9",
    fontSize: 8,
    fontWeight: "900"
  },
  autoBattleHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  autoBattleEnemy: {
    color: "#fff8ef",
    fontSize: 17,
    fontWeight: "900"
  },
  autoBattlePower: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900"
  },
  enemyHpTrack: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    height: 9,
    marginTop: 8,
    overflow: "hidden"
  },
  enemyHpFill: {
    backgroundColor: "#ff784f",
    borderRadius: 999,
    height: "100%"
  },
  autoBattleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7
  },
  autoBattleText: {
    color: "#e9ddff",
    fontSize: 10,
    fontWeight: "800"
  },
  autoBattleFlavor: {
    color: "#b9aee3",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4
  },
  elementBonusCard: {
    backgroundColor: "rgba(10,7,21,0.78)",
    borderRadius: 20,
    borderWidth: 1,
    bottom: 548,
    left: 14,
    padding: 11,
    position: "absolute",
    right: 14,
    zIndex: 11
  },
  evolutionTraitCard: {
    backgroundColor: "rgba(10,7,21,0.78)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 20,
    borderWidth: 1,
    bottom: 638,
    left: 14,
    padding: 11,
    position: "absolute",
    right: 14,
    zIndex: 11
  },
  reincarnationPanel: {
    alignItems: "center",
    backgroundColor: "rgba(10,7,21,0.8)",
    borderColor: "rgba(248,217,135,0.34)",
    borderRadius: 20,
    borderWidth: 1,
    bottom: 728,
    flexDirection: "row",
    justifyContent: "space-between",
    left: 14,
    padding: 11,
    position: "absolute",
    right: 14,
    zIndex: 11
  },
  reincarnationTitle: {
    color: "#f8d987",
    fontSize: 15,
    fontWeight: "900"
  },
  reincarnationAction: {
    alignItems: "flex-end",
    gap: 6
  },
  reincarnationGain: {
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "900"
  },
  reincarnationButton: {
    backgroundColor: "#f8d987",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  reincarnationButtonText: {
    color: "#1e1235",
    fontSize: 11,
    fontWeight: "900"
  },
  reincarnationModalReward: {
    color: "#f8d987",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 14,
    textAlign: "center"
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 16
  },
  modalPrimaryButton: {
    backgroundColor: "#f8d987",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 11
  },
  modalSecondaryButton: {
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 11
  },
  traitTitle: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900"
  },
  traitText: {
    color: "#b9aee3",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4
  },
  modalScrim: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.62)",
    flex: 1,
    justifyContent: "center",
    padding: 20
  },
  evolutionModal: {
    backgroundColor: "#120b26",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    width: "100%"
  },
  journeyEventCard: {
    backgroundColor: "#130a28",
    borderColor: "rgba(248,217,135,0.45)",
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    padding: 18,
    width: "100%",
    ...uiTheme.shadow
  },
  journeyEventChoices: {
    gap: 10,
    marginTop: 4
  },
  journeyEventChoice: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    borderWidth: 1,
    padding: 12
  },
  onboardingCard: {
    backgroundColor: "#120b26",
    borderColor: "rgba(248,217,135,0.36)",
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    width: "100%",
    ...uiTheme.shadow
  },
  onboardingTitle: {
    color: "#fff8ef",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 6
  },
  onboardingText: {
    color: "#d8cfef",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 26,
    marginTop: 12
  },
  onboardingDots: {
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 18
  },
  onboardingDot: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    height: 8,
    width: 8
  },
  onboardingDotActive: {
    backgroundColor: "#f8d987",
    width: 22
  },
  dailyLoginTrack: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 18
  },
  dailyLoginDay: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 14,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  dailyLoginDayActive: {
    backgroundColor: "#f8d987",
    borderColor: "#f8d987"
  },
  dailyLoginDayText: {
    color: "#d8cfef",
    fontSize: 14,
    fontWeight: "900"
  },
  progressModal: {
    backgroundColor: "#120b26",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 28,
    borderWidth: 1,
    maxHeight: "82%",
    padding: 18,
    width: "100%"
  },
  progressModalList: {
    marginTop: 12
  },
  progressRewardRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 9,
    padding: 11
  },
  lockedRewardRow: {
    opacity: 0.65
  },
  progressRewardCopy: {
    flex: 1
  },
  rewardSummaryText: {
    color: "#f8d987",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 6
  },
  debugRows: {
    gap: 9,
    paddingBottom: 14
  },
  debugRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.075)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 11
  },
  debugLabel: {
    color: "#b9aee3",
    fontSize: 12,
    fontWeight: "900"
  },
  debugValue: {
    color: "#f8d987",
    fontSize: 14,
    fontWeight: "900"
  },
  debugResetButton: {
    alignItems: "center",
    backgroundColor: "#ff784f",
    borderRadius: 18,
    marginBottom: 32,
    paddingVertical: 13
  },
  debugResetText: {
    color: "#fff8ef",
    fontSize: 14,
    fontWeight: "900"
  },
  dangerButton: {
    alignItems: "center",
    backgroundColor: "#ff784f",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 13
  },
  dangerButtonText: {
    color: "#fff8ef",
    fontSize: 14,
    fontWeight: "900"
  },
  settingRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.075)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    padding: 12
  },
  toggleTrack: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    height: 30,
    justifyContent: "center",
    paddingHorizontal: 3,
    width: 54
  },
  toggleTrackOn: {
    backgroundColor: "#f8d987"
  },
  toggleKnob: {
    backgroundColor: "#d8cfef",
    borderRadius: 999,
    height: 24,
    width: 24
  },
  toggleKnobOn: {
    alignSelf: "flex-end",
    backgroundColor: "#1e1235"
  },
  segmentedControl: {
    backgroundColor: "rgba(255,255,255,0.075)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 7
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    paddingVertical: 10
  },
  segmentButtonActive: {
    backgroundColor: "#f8d987"
  },
  segmentButtonText: {
    color: "#d8cfef",
    fontSize: 12,
    fontWeight: "900"
  },
  testChecklist: {
    gap: 8
  },
  testChecklistRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.055)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 10
  },
  testChecklistBox: {
    color: "#f8d987",
    fontSize: 16,
    fontWeight: "900"
  },
  playtestNotesPanel: {
    gap: 12
  },
  playtestNoteInput: {
    backgroundColor: "rgba(0,0,0,0.24)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    color: "#fff8ef",
    fontSize: 13,
    fontWeight: "800",
    minHeight: 82,
    padding: 12,
    textAlignVertical: "top"
  },
  playtestNotesList: {
    maxHeight: 240
  },
  playtestNotesListContent: {
    gap: 8
  },
  playtestNoteRow: {
    backgroundColor: "rgba(255,255,255,0.075)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    padding: 11
  },
  backupTextInput: {
    backgroundColor: "rgba(0,0,0,0.24)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 10,
    maxHeight: 180,
    minHeight: 110,
    padding: 12,
    textAlignVertical: "top"
  },
  importErrorText: {
    color: "#ff784f",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8
  },
  claimButton: {
    backgroundColor: "#f8d987",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  claimButtonText: {
    color: "#1e1235",
    fontSize: 11,
    fontWeight: "900"
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 6
  },
  traitChoiceRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  traitChoiceCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    minHeight: 126,
    padding: 12
  },
  traitChoiceName: {
    color: "#fff8ef",
    fontSize: 16,
    fontWeight: "900"
  },
  traitChoiceBonus: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 10
  },
  modalCancelButton: {
    alignSelf: "center",
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  modalCancelText: {
    color: "#b9aee3",
    fontWeight: "900"
  },
  elementBonusTitle: {
    fontSize: 16,
    fontWeight: "900"
  },
  elementBonusText: {
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 6
  },
  elementBonusMeta: {
    color: "#b9aee3",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 5,
    textTransform: "uppercase"
  },
  adventurePanelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  adventureAreaName: {
    color: "#fff8ef",
    fontSize: 18,
    fontWeight: "900"
  },
  adventureTimerText: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900"
  },
  questRows: {
    gap: 7
  },
  questRow: {
    gap: 4
  },
  questRowTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  questTitle: {
    color: "#e9ddff",
    fontSize: 12,
    fontWeight: "800"
  },
  questCount: {
    color: "#b9aee3",
    fontSize: 11,
    fontWeight: "900"
  },
  questTrack: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    height: 7,
    overflow: "hidden"
  },
  questFill: {
    backgroundColor: "#8fffd2",
    borderRadius: 999,
    height: "100%"
  },
  treasureInventory: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10
  },
  treasureChip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: 13,
    minWidth: "31%",
    padding: 7
  },
  treasureName: {
    color: "#fff8ef",
    fontSize: 10,
    fontWeight: "900"
  },
  treasureRarity: {
    fontSize: 9,
    fontWeight: "900",
    marginTop: 2,
    textTransform: "uppercase"
  },
  treasureBonus: {
    color: "#b9aee3",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2
  },
  collectionLog: {
    gap: 8
  },
  collectionRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.075)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 11
  },
  collectionRowLocked: {
    backgroundColor: "rgba(255,255,255,0.035)",
    opacity: 0.62
  },
  collectionLockedText: {
    color: "#7f73ad"
  },
  equipmentPanel: {
    gap: 10
  },
  equipmentSubhead: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  equipmentList: {
    gap: 8
  },
  equipmentRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.075)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 11
  },
  equipmentRowEquipped: {
    backgroundColor: "rgba(248,217,135,0.1)"
  },
  equipmentEmptySlot: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    padding: 11
  },
  equipmentSlotLabel: {
    color: "#f8d987",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  equipmentEmptyText: {
    color: "#b9aee3",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3
  },
  equipmentRarityText: {
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3
  },
  equipmentActions: {
    alignItems: "flex-end",
    gap: 7
  },
  equipmentSellButton: {
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  equipmentSellText: {
    color: "#d8cfef",
    fontSize: 10,
    fontWeight: "900"
  },
  lootPopup: {
    alignSelf: "center",
    backgroundColor: "rgba(255,248,239,0.94)",
    borderRadius: 18,
    maxWidth: "82%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: "absolute",
    top: 160,
    zIndex: 20
  },
  lootPopupTitle: {
    color: "#1e1235",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center"
  },
  lootPopupText: {
    color: "#37265a",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
    textAlign: "center"
  },
  returnPresenceToast: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(18,11,38,0.9)",
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: "82%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: "absolute",
    top: 150,
    zIndex: 21,
    ...uiTheme.shadow
  },
  returnPresenceEmote: {
    fontSize: 14,
    fontWeight: "900"
  },
  returnPresenceText: {
    color: uiTheme.colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
    textAlign: "center"
  },
  presenceDebugOverlay: {
    backgroundColor: "rgba(8,6,17,0.88)",
    borderColor: "rgba(248,217,135,0.6)",
    borderRadius: 14,
    borderWidth: 1,
    left: 12,
    maxWidth: "72%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: "absolute",
    top: 86,
    zIndex: 30
  },
  presenceDebugTitle: {
    color: uiTheme.colors.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 3
  },
  presenceDebugText: {
    color: uiTheme.colors.text,
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 14
  },
  presenceVisualCue: {
    alignSelf: "center",
    backgroundColor: "rgba(255,248,239,0.95)",
    borderColor: "rgba(248,217,135,0.85)",
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: "absolute",
    top: 270,
    zIndex: 29,
    ...uiTheme.shadow
  },
  presenceVisualCueText: {
    color: uiTheme.colors.goldDark,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center"
  },
  evolveRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    marginBottom: 10
  },
  evolveButton: {
    backgroundColor: "#f8d987",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  evolveButtonText: {
    color: "#1e1235",
    fontWeight: "900"
  },
  upgradeCards: {
    flexDirection: "row",
    gap: 8
  },
  upgradeCardWrap: {
    flex: 1
  },
  idleUpgradeCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 118,
    overflow: "hidden",
    padding: 10
  },
  disabledUpgradeCard: {
    opacity: 0.48
  },
  idleUpgradeName: {
    color: "#fff8ef",
    fontSize: 13,
    fontWeight: "900"
  },
  idleUpgradeLevel: {
    color: "#b9aee3",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 5
  },
  idleUpgradeBonus: {
    color: "#8fffd2",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8
  },
  idleUpgradeCost: {
    color: "#f8d987",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 6
  },
  upgradeSparkle: {
    height: 90,
    left: "50%",
    marginLeft: -45,
    marginTop: -45,
    position: "absolute",
    top: "50%",
    width: 90,
    zIndex: 5
  },
  eggOnlyScene: {
    borderRadius: 30,
    flex: 1,
    overflow: "hidden"
  },
  eggOnlyOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 18
  },
  eggOnlyOverlayOriginChoice: {
    justifyContent: "flex-start"
  },
  parallaxLayer: {
    bottom: -18,
    left: -18,
    position: "absolute",
    right: -18,
    top: -18
  },
  particleField: {
    bottom: 0,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    top: 0
  },
  particleDot: {
    borderRadius: 999,
    position: "absolute",
    shadowColor: "#fff",
    shadowOpacity: 0.6,
    shadowRadius: 8
  },
  glowPulse: {
    borderRadius: 160,
    height: 250,
    position: "absolute",
    width: 250
  },
  guidedSceneOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 18
  },
  energyHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  energyElement: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  titleScreenHeader: {
    alignItems: "center",
    gap: 4,
    paddingTop: 8
  },
  titleScreenVersion: {
    color: uiTheme.colors.gold,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  eggStageCenter: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 260
  },
  energyMoteOrbit: {
    height: 230,
    justifyContent: "space-between",
    position: "absolute",
    width: 230
  },
  energyMoteOrbitAlt: {
    height: 186,
    justifyContent: "space-between",
    position: "absolute",
    transform: [{ rotate: "40deg" }],
    width: 186
  },
  energyMote: {
    borderRadius: 999,
    height: 16,
    shadowColor: "#fff",
    shadowOpacity: 0.9,
    shadowRadius: 10,
    width: 16
  },
  energyMoteSmall: {
    alignSelf: "flex-end",
    borderRadius: 999,
    height: 10,
    opacity: 0.82,
    width: 10
  },
  hatchFlash: {
    borderRadius: 150,
    height: 270,
    position: "absolute",
    width: 270
  },
  focusEggWrap: {
    alignItems: "center",
    height: 250,
    justifyContent: "center",
    position: "relative",
    width: 250
  },
  focusEggImage: {
    height: 250,
    width: 250
  },
  evolutionHatchling: {
    height: 280,
    position: "absolute",
    width: 280
  },
  shellHalfClip: {
    height: 250,
    overflow: "hidden",
    position: "absolute",
    width: 125
  },
  shellLeftClip: {
    left: "50%",
    marginLeft: -125
  },
  shellRightClip: {
    left: "50%"
  },
  shellHalfImage: {
    height: 250,
    width: 250
  },
  shellRightImage: {
    marginLeft: -125
  },
  shellChargeAura: {
    borderRadius: 999,
    borderWidth: 2,
    height: 222,
    position: "absolute",
    width: 182,
    zIndex: 1,
    shadowOpacity: 0.62,
    shadowRadius: 22
  },
  shellSurfaceGlow: {
    borderRadius: 999,
    height: 122,
    left: 63,
    opacity: 0.24,
    position: "absolute",
    top: 56,
    width: 112,
    zIndex: 1
  },
  hatchBurstLayer: {
    alignItems: "center",
    height: 260,
    justifyContent: "center",
    position: "absolute",
    width: 260,
    zIndex: 4
  },
  hatchBloom: {
    borderRadius: 999,
    height: 96,
    position: "absolute",
    width: 96
  },
  hatchShockRing: {
    borderRadius: 999,
    borderWidth: 2,
    height: 138,
    position: "absolute",
    width: 138
  },
  hatchLightRay: {
    borderRadius: 999,
    height: 116,
    position: "absolute",
    top: 14,
    width: 5
  },
  hatchShellSpark: {
    borderRadius: 3,
    position: "absolute"
  },
  crackLayer: {
    height: 190,
    position: "absolute",
    width: 150,
    zIndex: 2
  },
  missingShellGap: {
    backgroundColor: "rgba(255,240,198,0.16)",
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    borderWidth: 1,
    position: "absolute",
    shadowColor: "#ffd36d",
    shadowOpacity: 0.22,
    shadowRadius: 6
  },
  missingShellGapTop: {
    height: 54,
    left: 56,
    top: 30,
    width: 34
  },
  missingShellGapLeft: {
    height: 44,
    left: 40,
    top: 88,
    width: 48
  },
  missingShellGapRight: {
    height: 46,
    left: 78,
    top: 90,
    width: 50
  },
  hatchingText: {
    color: "#fff8ef",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10
  },
  energyMeters: {
    flexDirection: "row",
    gap: 8
  },
  energyMeter: {
    backgroundColor: "rgba(0,0,0,0.24)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    padding: 10
  },
  energyMeterLabel: {
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 7,
    textTransform: "uppercase"
  },
  energyPips: {
    flexDirection: "row",
    gap: 5
  },
  energyPip: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    flex: 1,
    height: 8
  },
  eggStartCard: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    marginTop: -8,
    paddingHorizontal: 0,
    paddingVertical: 0
  },
  eggStartCardOriginChoice: {
    marginTop: 18
  },
  eggStartText: {
    color: "#cfc5ee",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
    marginTop: 6,
    textAlign: "center"
  },
  eggConstellationTitle: {
    color: "#fff8ef",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
    textTransform: "uppercase"
  },
  eggConstellationHint: {
    color: "#cfc5ee",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 5,
    opacity: 0.86,
    textAlign: "center"
  },
  eggSelectionFan: {
    alignSelf: "center",
    height: 352,
    marginTop: 16,
    overflow: "visible",
    position: "relative",
    width: 360
  },
  eggPentagonLineTop: {
    backgroundColor: "rgba(255,248,239,0.16)",
    height: 2,
    left: 55,
    position: "absolute",
    top: 103,
    transform: [{ rotate: "-36deg" }],
    width: 139
  },
  eggPentagonLineUpperRight: {
    backgroundColor: "rgba(255,248,239,0.16)",
    height: 2,
    left: 167,
    position: "absolute",
    top: 103,
    transform: [{ rotate: "36deg" }],
    width: 139
  },
  eggPentagonLineLowerRight: {
    backgroundColor: "rgba(255,248,239,0.16)",
    height: 2,
    left: 201,
    position: "absolute",
    top: 210,
    transform: [{ rotate: "108deg" }],
    width: 139
  },
  eggPentagonLineLowerLeft: {
    backgroundColor: "rgba(255,248,239,0.16)",
    height: 2,
    left: 111,
    position: "absolute",
    top: 276,
    width: 138
  },
  eggPentagonLineUpperLeft: {
    backgroundColor: "rgba(255,248,239,0.16)",
    height: 2,
    left: 20,
    position: "absolute",
    top: 210,
    transform: [{ rotate: "-108deg" }],
    width: 139
  },
  eggSelectionCard: {
    alignItems: "center",
    backgroundColor: "rgba(7,8,18,0.66)",
    borderRadius: 999,
    borderWidth: 1,
    height: 92,
    justifyContent: "center",
    overflow: "visible",
    padding: 4,
    position: "absolute",
    shadowOpacity: 0.42,
    shadowRadius: 14,
    width: 92
  },
  eggSelectionPlaceholder: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    bottom: 5,
    justifyContent: "center",
    left: 5,
    opacity: 0.9,
    position: "absolute",
    right: 5,
    top: 5
  },
  eggSelectionSigil: {
    fontSize: 22,
    fontWeight: "900",
    opacity: 0.42
  },
  eggSelectionImage: {
    height: 80,
    width: 80
  },
  eggSelectionImageLoading: {
    opacity: 0.86
  },
  eggSelectionGlow: {
    borderRadius: 999,
    bottom: 8,
    height: 8,
    opacity: 0.32,
    position: "absolute",
    width: 46
  },
  eggSelectionLabel: {
    bottom: -20,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    position: "absolute",
    textAlign: "center",
    textTransform: "uppercase"
  },
  originDetailCard: {
    backgroundColor: "rgba(6,5,16,0.82)",
    borderRadius: 26,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
    shadowOpacity: 0.32,
    shadowRadius: 18,
    width: "92%"
  },
  originDetailHeroRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14
  },
  originDetailEggFrame: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 98,
    justifyContent: "center",
    width: 98
  },
  originDetailEggImage: {
    height: 88,
    width: 88
  },
  originDetailCopy: {
    flex: 1
  },
  originDetailLabel: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1.6,
    textTransform: "uppercase"
  },
  originDetailIdentity: {
    color: "#e8ddff",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
    marginTop: 5
  },
  originBranchesTitle: {
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginTop: 14,
    textTransform: "uppercase"
  },
  originBranchRow: {
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    flexDirection: "row",
    gap: 10,
    marginTop: 7,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  originBranchNumber: {
    fontSize: 12,
    fontWeight: "900",
    width: 16
  },
  originBranchImageFrame: {
    alignItems: "center",
    backgroundColor: "rgba(4,5,12,0.52)",
    borderRadius: 14,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    overflow: "hidden",
    width: 54
  },
  originBranchImage: {
    height: 50,
    width: 50
  },
  originBranchCopy: {
    flex: 1
  },
  originBranchText: {
    color: "#fff8ef",
    fontSize: 13,
    fontWeight: "900"
  },
  originBranchDescription: {
    color: "#cec5ee",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15,
    marginTop: 2
  },
  originBranchPreviewLabel: {
    color: "#9f95c8",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginTop: 4,
    textTransform: "uppercase"
  },
  originTypeChart: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
    padding: 10
  },
  originTypeChartTitle: {
    color: "#fff8ef",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  originTypeChartCycle: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 8
  },
  originTypeRivalRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 8
  },
  originTypeChip: {
    alignItems: "center",
    borderRadius: 999,
    minWidth: 54,
    paddingHorizontal: 9,
    paddingVertical: 6
  },
  originTypeChipFire: {
    backgroundColor: "rgba(255,122,61,0.92)"
  },
  originTypeChipEarth: {
    backgroundColor: "rgba(126,224,138,0.9)"
  },
  originTypeChipWater: {
    backgroundColor: "rgba(95,213,255,0.9)"
  },
  originTypeChipLight: {
    backgroundColor: "rgba(255,229,143,0.92)"
  },
  originTypeChipDark: {
    backgroundColor: "rgba(139,92,246,0.92)"
  },
  originTypeChipText: {
    color: "#130b18",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  originTypeChipDarkText: {
    color: "#21180c",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  originTypeArrow: {
    color: "#fff8ef",
    fontSize: 17,
    fontWeight: "900",
    marginHorizontal: -1
  },
  originTypeRivalArrow: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900"
  },
  originTypeBonusText: {
    color: "#cec5ee",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  originDetailActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  originBackButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 16,
    flex: 1,
    paddingVertical: 12
  },
  originBackButtonText: {
    color: "#e8ddff",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  originConfirmButton: {
    alignItems: "center",
    borderRadius: 16,
    flex: 1.4,
    paddingVertical: 12
  },
  originConfirmButtonText: {
    color: "#160914",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  eggTapProgressRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 14
  },
  eggTapProgressDot: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    height: 10
  },
  questionCard: {
    backgroundColor: "rgba(8,6,17,0.84)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 24,
    borderWidth: 1,
    padding: 16
  },
  guidedAnswer: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 10,
    padding: 13
  },
  tapPromptCard: {
    backgroundColor: "rgba(8,6,17,0.78)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 24,
    borderWidth: 1,
    padding: 16
  },
  journeyOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 18
  },
  journeyTitle: {
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 6
  },
  pathScene: {
    minHeight: 330,
    justifyContent: "flex-end"
  },
  objectivePath: {
    backgroundColor: "rgba(8,6,17,0.62)",
    borderRadius: 22,
    gap: 12,
    padding: 14
  },
  objectiveWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  objectiveDot: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    height: 18,
    width: 18
  },
  objectiveText: {
    color: "#cfc5ee",
    flex: 1,
    fontSize: 13,
    fontWeight: "800"
  },
  hatchlingImage: {
    height: 210,
    width: 210
  },
  hatchlingMotionLayer: {
    bottom: 50,
    height: 210,
    left: 14,
    position: "absolute",
    width: 210
  },
  hatchlingGlow: {
    height: 180,
    left: 15,
    top: 20,
    width: 180
  },
  enemyMotionLayer: {
    height: 170,
    position: "absolute",
    right: 6,
    top: 32,
    width: 170
  },
  enemyImageInside: {
    height: 170,
    width: 170
  },
  enemyGlow: {
    height: 150,
    left: 10,
    top: 12,
    width: 150
  },
  attackStreak: {
    borderRadius: 999,
    bottom: 142,
    height: 12,
    left: 142,
    position: "absolute",
    shadowColor: "#fff",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    width: 118
  },
  journeyCard: {
    backgroundColor: "rgba(8,6,17,0.84)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 24,
    borderWidth: 1,
    padding: 16
  },
  scrollContent: {
    paddingBottom: 30
  },
  tabs: {
    gap: 8,
    paddingBottom: 12
  },
  tab: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 9
  },
  activeTab: {
    backgroundColor: "#fff8ef"
  },
  tabText: {
    color: "#d9cff5",
    fontWeight: "800"
  },
  activeTabText: {
    color: "#160c2f"
  },
  sectionTitle: {
    color: "#fff8ef",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8
  },
  bodyText: {
    color: "#d8cfef",
    fontSize: 14,
    lineHeight: 21
  },
  panel: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 12,
    padding: 16
  },
  eggHero: {
    borderRadius: 26,
    height: 230,
    justifyContent: "flex-end",
    marginTop: 14,
    overflow: "hidden"
  },
  eggHeroImage: {
    borderRadius: 26
  },
  eggHeroOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 18
  },
  eggHeroTitle: {
    fontSize: 28,
    fontWeight: "900"
  },
  eggHeroText: {
    color: "#fff8ef",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 4
  },
  choiceNumber: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 4,
    textTransform: "uppercase"
  },
  panelTitle: {
    color: "#fff8ef",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8
  },
  subsectionTitle: {
    color: "#fff8ef",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 16
  },
  mapHero: {
    borderRadius: 26,
    minHeight: 220,
    overflow: "hidden"
  },
  mapHeroImage: {
    borderRadius: 26
  },
  mapHeroOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 18
  },
  mapHeroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  mapElementPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  mapTitle: {
    color: "#fff8ef",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 6
  },
  capybaraAdventureShell: {
    backgroundColor: "#fff1cf",
    borderColor: "#f8d987",
    borderRadius: 28,
    borderWidth: 2,
    gap: 8,
    marginTop: 4,
    overflow: "hidden",
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  },
  capybaraAdventureShellCompact: {
    marginBottom: 12
  },
  capybaraAdventureShellFocused: {
    backgroundColor: "rgba(7,10,24,0.92)",
    borderColor: "rgba(248,217,135,0.24)",
    borderWidth: 1,
    gap: 5,
    padding: 7,
    shadowColor: "#050816",
    shadowOpacity: 0.32
  },
  capybaraTopHud: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "space-between"
  },
  capybaraTopHudFocused: {
    alignItems: "center",
    flexWrap: "nowrap"
  },
  capybaraFocusedMiniHud: {
    alignItems: "center",
    backgroundColor: "rgba(248,217,135,0.1)",
    borderColor: "rgba(248,217,135,0.26)",
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  capybaraFocusedMiniHudText: {
    color: "#f8d987",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  fireStarterFocusPillRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5
  },
  fireStarterFocusLead: {
    color: "#f8d987",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  fireStarterFocusPill: {
    backgroundColor: "rgba(248,217,135,0.14)",
    borderColor: "rgba(248,217,135,0.32)",
    borderRadius: 999,
    borderWidth: 1,
    color: "#fff8ef",
    fontSize: 10,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 4,
    textTransform: "uppercase"
  },
  focusedFireBriefPanel: {
    backgroundColor: "rgba(69,21,31,0.72)",
    borderColor: "rgba(255,120,79,0.36)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 10
  },
  focusedFireBriefHeader: {
    gap: 2
  },
  focusedFireBriefKicker: {
    color: "#ffb347",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  focusedFireBriefTitle: {
    color: "#fff8ef",
    fontSize: 14,
    fontWeight: "900"
  },
  focusedFireBriefSummary: {
    color: "#ffd9bf",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 15
  },
  focusedFireStopGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  focusedFireStopChip: {
    backgroundColor: "rgba(255,248,239,0.08)",
    borderColor: "rgba(255,179,71,0.24)",
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: "31%",
    flexGrow: 1,
    minWidth: 92,
    paddingHorizontal: 8,
    paddingVertical: 7
  },
  focusedFireStopStep: {
    color: "#ffb347",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  focusedFireStopLabel: {
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 1
  },
  focusedFireStopDetail: {
    color: "#d8cfef",
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 12,
    marginTop: 2
  },
  capybaraHudCapsule: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "rgba(93,57,28,0.2)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    flexGrow: 1,
    gap: 7,
    minWidth: 0,
    paddingHorizontal: 9,
    paddingVertical: 5,
    shadowColor: "#6f431f",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  capybaraHudCapsuleHp: {
    borderColor: "rgba(255,95,122,0.42)"
  },
  persistentChapterStatsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 7
  },
  persistentChapterStatsRowFocused: {
    marginTop: 5
  },
  persistentChapterStatPill: {
    alignItems: "center",
    backgroundColor: "rgba(8,6,17,0.76)",
    borderColor: "rgba(248,217,135,0.34)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  persistentChapterStatPillHealth: {
    borderColor: "rgba(255,95,122,0.52)"
  },
  persistentChapterStatLabel: {
    color: "#f8d987",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  persistentChapterStatValue: {
    color: "#fff8ef",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 1
  },
  capybaraFocusedReturnPill: {
    alignItems: "center",
    backgroundColor: "#160c2f",
    borderColor: "rgba(248,217,135,0.72)",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  capybaraFocusedReturnText: {
    color: "#f8d987",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  capybaraHudIcon: {
    fontSize: 18
  },
  capybaraHudLabel: {
    color: "#7a542e",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  capybaraHudValue: {
    color: "#302018",
    fontSize: 13,
    fontWeight: "900"
  },
  capybaraSceneFrame: {
    borderRadius: 28,
    minHeight: 378,
    overflow: "hidden"
  },
  capybaraSceneFrameFocused: {
    height: 250,
    minHeight: 230
  },
  capybaraSceneImage: {
    borderRadius: 28
  },
  capybaraSceneScrim: {
    flex: 1,
    padding: 10
  },
  capybaraChapterRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    zIndex: 2
  },
  capybaraChapterBadge: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderColor: "#f8d987",
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 13,
    paddingVertical: 7
  },
  capybaraChapterText: {
    color: "#3a2618",
    fontSize: 12,
    fontWeight: "900"
  },
  capybaraElementBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  capybaraProgressCard: {
    backgroundColor: "#ffffff",
    borderColor: "rgba(93,57,28,0.14)",
    borderRadius: 18,
    borderWidth: 1,
    padding: 9
  },
  capybaraProgressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  capybaraBoardTitle: {
    color: "#302018",
    fontSize: 15,
    fontWeight: "900"
  },
  capybaraBoardMeta: {
    color: "#7a542e",
    fontSize: 12,
    fontWeight: "900"
  },
  capybaraProgressTrack: {
    backgroundColor: "#ead8bc",
    borderRadius: 999,
    height: 8,
    marginTop: 6,
    overflow: "hidden"
  },
  capybaraProgressFill: {
    borderRadius: 999,
    height: "100%"
  },
  capybaraMessage: {
    color: "#6b5239",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
    marginTop: 6
  },
  capybaraRouteScroll: {
    marginTop: 8
  },
  capybaraRouteRail: {
    alignItems: "center",
    paddingRight: 12
  },
  capybaraRouteNodeWrap: {
    alignItems: "center",
    flexDirection: "row"
  },
  capybaraRouteNode: {
    alignItems: "center",
    backgroundColor: "#f3e2c3",
    borderRadius: 999,
    borderWidth: 2,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  capybaraRouteNodeCurrent: {
    backgroundColor: "#ffffff",
    shadowColor: "#f8d987",
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    transform: [{ scale: 1.08 }]
  },
  capybaraRouteNodeCleared: {
    backgroundColor: "#e9ffd8"
  },
  capybaraRouteNodeIcon: {
    fontSize: 16
  },
  capybaraRouteStep: {
    bottom: -17,
    color: "#8b6a45",
    fontSize: 10,
    fontWeight: "900",
    left: -33,
    position: "absolute"
  },
  capybaraRouteConnector: {
    backgroundColor: "#d8bea0",
    borderRadius: 999,
    height: 5,
    marginHorizontal: 4,
    width: 18
  },
  capybaraFocusedRouteSummary: {
    backgroundColor: "rgba(7,10,24,0.82)",
    borderColor: "rgba(248,217,135,0.28)",
    borderRadius: 999,
    borderWidth: 1,
    gap: 1,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  capybaraFocusedRouteTitle: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  capybaraFocusedRouteText: {
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "800"
  },
  conciseAdventureStatusLine: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(248,217,135,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  conciseAdventureStatusTitle: {
    color: "#f8d987",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  conciseAdventureStatusText: {
    color: "#fff8ef",
    flex: 1,
    fontSize: 10,
    fontWeight: "800"
  },
  conciseAdventureStatusPercent: {
    color: "#8fffd2",
    fontSize: 11,
    fontWeight: "900"
  },
  v02DashboardPanel: {
    backgroundColor: "rgba(15,23,42,0.92)",
    borderColor: "rgba(143,247,255,0.36)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    marginTop: 10,
    padding: 12
  },
  v02DashboardPanelCompact: {
    gap: 6,
    marginTop: 6,
    padding: 9
  },
  v02DashboardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between"
  },
  v02DashboardKicker: {
    color: "#8ff7ff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  v02DashboardTitle: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900"
  },
  v02DashboardBadge: {
    backgroundColor: "#8fffd2",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  v02DashboardBadgeText: {
    color: "#071018",
    fontSize: 12,
    fontWeight: "900"
  },
  v02DashboardSummary: {
    color: "rgba(255,248,239,0.76)",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16
  },
  v02DashboardTrack: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    height: 8,
    overflow: "hidden"
  },
  v02DashboardFill: {
    backgroundColor: "#8fffd2",
    borderRadius: 999,
    height: "100%"
  },
  v02ObjectiveGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7
  },
  v02ObjectiveCard: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 15,
    borderWidth: 1,
    flexBasis: "48%",
    flexGrow: 1,
    gap: 4,
    padding: 8
  },
  v02ObjectiveTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  v02ObjectiveStatus: {
    color: "#8fffd2",
    fontSize: 12,
    fontWeight: "900"
  },
  v02ObjectiveTitle: {
    color: "#fff8ef",
    flex: 1,
    fontSize: 11,
    fontWeight: "900"
  },
  v02ObjectiveProof: {
    color: "rgba(255,248,239,0.68)",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 14
  },
  adventureCombatLoopStrip: {
    backgroundColor: "rgba(8,6,17,0.84)",
    borderColor: "rgba(248,217,135,0.32)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    marginTop: 10,
    padding: 11
  },
  adventureCombatLoopStripCompact: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  adventureCombatLoopCompactActive: {
    alignItems: "center",
    backgroundColor: "rgba(248,217,135,0.16)",
    borderColor: "rgba(248,217,135,0.42)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  adventureCombatLoopKicker: {
    color: "#f8d987",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  adventureCombatLoopSteps: {
    flexDirection: "row",
    gap: 7
  },
  adventureCombatLoopStep: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 50,
    paddingHorizontal: 8,
    paddingVertical: 7
  },
  adventureCombatLoopStepActive: {
    backgroundColor: "rgba(248,217,135,0.18)",
    borderColor: "rgba(248,217,135,0.62)"
  },
  adventureCombatLoopIcon: {
    fontSize: 16
  },
  adventureCombatLoopCopy: {
    flex: 1
  },
  adventureCombatLoopLabel: {
    color: "#fff8ef",
    fontSize: 10,
    fontWeight: "900"
  },
  adventureCombatLoopLabelActive: {
    color: "#f8d987"
  },
  adventureCombatLoopDetail: {
    color: "rgba(255,248,239,0.72)",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 2
  },
  adventureRewardRecapCard: {
    backgroundColor: "#211136",
    borderColor: "rgba(248,217,135,0.45)",
    borderRadius: 26,
    borderWidth: 2,
    gap: 12,
    marginTop: 12,
    padding: 14,
    shadowColor: "#f8d987",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  adventureRewardRecapCardFocused: {
    backgroundColor: "rgba(8,11,26,0.94)",
    borderColor: "rgba(248,217,135,0.26)",
    borderWidth: 1,
    gap: 5,
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: "#050816",
    shadowOpacity: 0.28
  },
  adventureRewardHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  adventureRewardIcon: {
    fontSize: 26
  },
  adventureRewardTitleBlock: {
    flex: 1
  },
  adventureRewardTitle: {
    color: "#fff8ef",
    fontSize: 18,
    fontWeight: "900"
  },
  adventureRewardHoardCount: {
    backgroundColor: "rgba(248,217,135,0.18)",
    borderRadius: 999,
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  adventureRewardHeroLine: {
    backgroundColor: "rgba(248,217,135,0.12)",
    borderColor: "rgba(248,217,135,0.24)",
    borderRadius: 18,
    borderWidth: 1,
    color: "#fff8ef",
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 18,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  adventureSummaryStatRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  adventureSummaryStatPill: {
    backgroundColor: "rgba(8,11,26,0.38)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 96,
    paddingHorizontal: 10,
    paddingVertical: 9
  },
  adventureSummaryStatLabel: {
    color: "#f8d987",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  adventureSummaryStatValue: {
    color: "#fff8ef",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 3
  },
  adventureRewardGrid: {
    gap: 8
  },
  adventureRewardLine: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    padding: 10
  },
  adventureRewardLineLabel: {
    color: "#f8d987",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  adventureRewardLineValue: {
    color: "#fff8ef",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 3
  },
  adventureRewardDenButton: {
    alignItems: "center",
    backgroundColor: "#f8d987",
    borderRadius: 18,
    marginTop: 2,
    paddingVertical: 12
  },
  adventureRewardDenButtonText: {
    color: "#2b180d",
    fontSize: 13,
    fontWeight: "900"
  },
  adventureRewardCompactLine: {
    color: "#d8cfef",
    fontSize: 11,
    fontWeight: "800"
  },
  capybaraEventCard: {
    backgroundColor: "#fffaf0",
    borderRadius: 28,
    borderWidth: 2,
    marginBottom: 10,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7
  },
  capybaraEventCardFocused: {
    backgroundColor: "rgba(8,11,26,0.94)",
    borderColor: "rgba(248,217,135,0.26)",
    borderWidth: 1,
    marginBottom: 2,
    padding: 10,
    shadowColor: "#050816",
    shadowOpacity: 0.3
  },
  focusedCombatStopCard: {
    backgroundColor: "rgba(8,11,26,0.96)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    marginBottom: 2,
    padding: 10,
    shadowColor: "#050816",
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 7 }
  },
  focusedCombatStopHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9
  },
  focusedCombatStopIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  focusedCombatStopCopy: {
    flex: 1
  },
  focusedCombatStopKicker: {
    color: "#ff9d7c",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  focusedCombatStopTitle: {
    color: "#fff8ef",
    fontSize: 18,
    fontWeight: "900"
  },
  focusedCombatStopStep: {
    color: "#d8cfef",
    fontSize: 13,
    fontWeight: "900"
  },
  focusedCombatStopText: {
    color: "#d8cfef",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16
  },
  focusedCombatStopReward: {
    color: "#ffb347",
    fontSize: 11,
    fontWeight: "900"
  },
  focusedCombatStopCta: {
    alignItems: "center",
    backgroundColor: "#f8d987",
    borderColor: "rgba(255,248,239,0.62)",
    borderRadius: 20,
    borderWidth: 2,
    paddingVertical: 10
  },
  capybaraEventTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  capybaraEventIconBadge: {
    alignItems: "center",
    borderRadius: 18,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  capybaraEventIcon: {
    fontSize: 22
  },
  capybaraEventTitleBlock: {
    flex: 1
  },
  capybaraEventKicker: {
    color: "#9c6a32",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  capybaraEventKickerFocused: {
    color: "#f8d987"
  },
  capybaraEventTitle: {
    color: "#2f1f18",
    fontSize: 20,
    fontWeight: "900"
  },
  capybaraEventTitleFocused: {
    color: "#fff8ef"
  },
  capybaraEventStep: {
    color: "#8b6a45",
    fontSize: 13,
    fontWeight: "900"
  },
  capybaraEventStepFocused: {
    color: "#d8cfef"
  },
  capybaraEventText: {
    color: "#5f4732",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 10
  },
  capybaraEventTextFocused: {
    color: "#d8cfef",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6
  },
  capybaraEnemyHint: {
    color: "#a64040",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8
  },
  capybaraEnemyHintFocused: {
    color: "#ff9d7c",
    fontSize: 11,
    marginTop: 5
  },
  capybaraChoiceGrid: {
    gap: 8,
    marginTop: 10
  },
  capybaraChoiceButton: {
    backgroundColor: "#fff1cf",
    borderColor: "rgba(93,57,28,0.16)",
    borderRadius: 18,
    borderWidth: 1,
    padding: 11
  },
  capybaraChoiceButtonFocused: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(248,217,135,0.18)"
  },
  capybaraChoiceButtonDisabled: {
    opacity: 0.72
  },
  capybaraChoiceTitle: {
    color: "#3a2618",
    fontSize: 14,
    fontWeight: "900"
  },
  capybaraChoiceTitleFocused: {
    color: "#fff8ef"
  },
  capybaraChoiceText: {
    color: "#72583d",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3
  },
  capybaraChoiceTextFocused: {
    color: "#d8cfef"
  },
  fireSkillChoiceRecap: {
    backgroundColor: "rgba(255,120,79,0.12)",
    borderColor: "rgba(255,120,79,0.32)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 7,
    marginTop: 10,
    padding: 10
  },
  shadowPressureReadout: {
    backgroundColor: "rgba(139,92,246,0.14)",
    borderColor: "rgba(217,204,255,0.28)",
    borderRadius: 15,
    borderWidth: 1,
    gap: 3,
    marginTop: 8,
    padding: 8
  },
  shadowPressureReadoutFocused: {
    marginTop: 6,
    paddingVertical: 6
  },
  shadowPressureKicker: {
    color: "#d9ccff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  shadowPressureText: {
    color: "#f3edff",
    fontSize: 11,
    fontWeight: "800"
  },
  battleTacticPreview: {
    backgroundColor: "rgba(248,217,135,0.12)",
    borderColor: "rgba(248,217,135,0.26)",
    borderRadius: 16,
    borderWidth: 1,
    gap: 7,
    marginTop: 9,
    padding: 9
  },
  battleTacticPreviewFocused: {
    backgroundColor: "rgba(255,255,255,0.07)",
    gap: 5,
    padding: 8
  },
  battleTacticKicker: {
    color: "#f8d987",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  battleTacticTitle: {
    color: "#fff8ef",
    fontSize: 12,
    fontWeight: "900"
  },
  battleTacticChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  battleTacticChip: {
    backgroundColor: "rgba(255,248,239,0.08)",
    borderColor: "rgba(248,217,135,0.18)",
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    paddingHorizontal: 7,
    paddingVertical: 5
  },
  battleTacticChipLabel: {
    color: "#ffb347",
    fontSize: 10,
    fontWeight: "900"
  },
  battleTacticChipText: {
    color: "#d8cfef",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 1
  },
  fireSkillChoiceRecapFocused: {
    backgroundColor: "rgba(255,120,79,0.1)",
    gap: 5,
    padding: 8
  },
  fireSkillChoiceKicker: {
    color: "#ff784f",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  fireSkillChoiceTitle: {
    color: "#fff8ef",
    fontSize: 12,
    fontWeight: "900"
  },
  fireSkillChoiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  fireSkillChoiceChip: {
    backgroundColor: "rgba(255,248,239,0.08)",
    borderColor: "rgba(255,179,71,0.22)",
    borderRadius: 13,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    paddingHorizontal: 7,
    paddingVertical: 6
  },
  fireSkillChoiceName: {
    color: "#ffb347",
    fontSize: 11,
    fontWeight: "900"
  },
  fireSkillChoiceHook: {
    color: "#fff8ef",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2
  },
  fireSkillChoicePayoff: {
    color: "#d8cfef",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 13,
    marginTop: 2
  },
  capybaraPrimaryCta: {
    alignItems: "center",
    borderColor: "#6d431f",
    borderRadius: 22,
    borderWidth: 2,
    marginTop: 13,
    paddingVertical: 13,
    shadowColor: "#6d431f",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4
  },
  capybaraPrimaryCtaFocused: {
    borderColor: "rgba(255,248,239,0.62)",
    marginTop: 7,
    paddingVertical: 10,
    shadowColor: "#f8d987",
    shadowOpacity: 0.22
  },
  capybaraPrimaryCtaText: {
    color: "#2f1f18",
    fontSize: 16,
    fontWeight: "900"
  },
  nodeCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 12,
    overflow: "hidden"
  },
  nodeImageBackground: {
    minHeight: 190
  },
  nodeImage: {
    borderRadius: 22
  },
  nodeOverlay: {
    justifyContent: "flex-end",
    minHeight: 190,
    padding: 16
  },
  nodeHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  nodeKind: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  nodeBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  nodeDifficulty: {
    color: "#fff8ef",
    fontSize: 12,
    fontWeight: "900"
  },
  nodeTitle: {
    color: "#fff8ef",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6
  },
  eventChoiceCard: {
    backgroundColor: "rgba(0,0,0,0.18)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 12,
    padding: 13
  },
  eventPanel: {
    borderRadius: 24,
    marginTop: 12,
    minHeight: 300,
    overflow: "hidden"
  },
  eventPanelImage: {
    borderRadius: 24
  },
  eventPanelOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16
  },
  routeTracker: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 14
  },
  routeStepWrap: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1
  },
  routeStep: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  routeStepCleared: {
    backgroundColor: "rgba(248,217,135,0.92)"
  },
  routeStepCurrent: {
    borderColor: "#fff8ef",
    borderWidth: 2
  },
  routeStepBoss: {
    backgroundColor: "rgba(255,120,79,0.92)"
  },
  routeStepText: {
    color: "#160c2f",
    fontSize: 12,
    fontWeight: "900"
  },
  routeLine: {
    backgroundColor: "rgba(255,255,255,0.22)",
    flex: 1,
    height: 3
  },
  routeLineCleared: {
    backgroundColor: "rgba(248,217,135,0.92)"
  },
  rewardChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12
  },
  rewardChip: {
    backgroundColor: "rgba(255,248,239,0.16)",
    borderColor: "rgba(255,248,239,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  rewardChipText: {
    color: "#fff8ef",
    fontSize: 12,
    fontWeight: "800"
  },
  answerCard: {
    backgroundColor: "rgba(0,0,0,0.16)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 10,
    minHeight: 112,
    overflow: "hidden"
  },
  answerImageBackground: {
    flex: 1,
    justifyContent: "flex-end",
    minHeight: 112
  },
  answerImage: {
    borderRadius: 18
  },
  answerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 13
  },
  answerTitle: {
    color: "#fff8ef",
    fontSize: 16,
    fontWeight: "900"
  },
  answerDescription: {
    color: "#cfc5ee",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#fff8ef",
    borderRadius: 18,
    flex: 1,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  primaryButtonText: {
    color: "#160c2f",
    fontSize: 15,
    fontWeight: "900"
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  secondaryButtonText: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900"
  },
  disabledButton: {
    opacity: 0.45
  },
  elementBadge: {
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 4
  },
  progressWrap: {
    marginTop: 14
  },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    height: 10,
    overflow: "hidden"
  },
  progressFill: {
    borderRadius: 999,
    height: "100%"
  },
  progressLabel: {
    color: "#cfc5ee",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12
  },
  compactStats: {
    marginBottom: 4
  },
  statCard: {
    backgroundColor: "rgba(0,0,0,0.16)",
    borderRadius: 16,
    minWidth: "47%",
    padding: 12
  },
  statValue: {
    color: "#fff8ef",
    fontSize: 20,
    fontWeight: "900"
  },
  statLabel: {
    color: "#a99bd9",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2
  },
  statHint: {
    color: "#f8d987",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3
  },
  skillDraftPanel: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 8,
    padding: 10
  },
  skillDraftGrid: {
    gap: 7,
    marginTop: 8
  },
  skillDraftCard: {
    backgroundColor: "rgba(0,0,0,0.16)",
    borderColor: "rgba(248,217,135,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    padding: 9
  },
  skillDraftCardSelected: {
    backgroundColor: "rgba(248,217,135,0.12)",
    borderColor: "rgba(248,217,135,0.72)"
  },
  skillDraftArchetype: {
    color: "#f8d987",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1
  },
  skillDraftName: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 3
  },
  skillDraftLine: {
    color: "#d8cfef",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4
  },
  skillDraftSynergy: {
    color: "#a7f3ff",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
    marginTop: 6
  },
  skillDraftPayoff: {
    color: "#fde68a",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
    marginTop: 6
  },
  skillDraftHooks: {
    color: "#f8d987",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.4,
    marginTop: 8,
    textTransform: "uppercase"
  },
  hintText: {
    color: "#bdb2df",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8
  },
  rewardText: {
    color: "#f8d987",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 8
  },
  logLine: {
    color: "#d8cfef",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6
  },
  battleFullScreenArena: {
    flex: 1,
    height: "100%"
  },
  battleArenaScene: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden"
  },
  battleArenaImage: {
    borderRadius: 0
  },
  battleArenaScrim: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 14,
    paddingHorizontal: 12,
    paddingTop: 14
  },
  battleArenaHud: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  battleArenaBadge: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  battleArenaBadgeText: {
    color: "#24150f",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  battleArenaKind: {
    color: "#fff8ef",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  battlePersistentStatsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8
  },
  battlePersistentStatPill: {
    alignItems: "center",
    backgroundColor: "rgba(8,6,17,0.78)",
    borderColor: "rgba(248,217,135,0.38)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  battlePersistentStatPillHealth: {
    borderColor: "rgba(255,95,122,0.58)"
  },
  battlePersistentStatLabel: {
    color: "#f8d987",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  battlePersistentStatValue: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 1
  },
  battleArenaCombatants: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2
  },
  battleDragonSide: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 292
  },
  battleEnemySide: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 292
  },
  battleDragonAura: {
    borderRadius: 999,
    borderWidth: 3,
    height: 188,
    opacity: 0.62,
    position: "absolute",
    top: 32,
    width: 188
  },
  battleDragonHeroSprite: {
    height: 220,
    width: 178
  },
  battleDragonFacingRight: {
    transform: [{ scaleX: -1 }]
  },
  battleEnemyBossSprite: {
    height: 226,
    width: 184
  },
  battleImpactSlash: {
    borderRadius: 999,
    height: 12,
    position: "absolute",
    top: 116,
    width: 92,
    zIndex: 4
  },
  battleImpactRing: {
    borderColor: "rgba(255,248,239,0.88)",
    borderRadius: 999,
    borderWidth: 3,
    height: 96,
    position: "absolute",
    top: 74,
    width: 96,
    zIndex: 5
  },
  battleImpactRingDragon: {
    left: 44
  },
  battleImpactRingEnemy: {
    right: 42
  },
  battleImpactSpark: {
    backgroundColor: "rgba(255,248,239,0.96)",
    borderRadius: 999,
    height: 18,
    position: "absolute",
    shadowColor: "#fff8ef",
    shadowOpacity: 0.9,
    shadowRadius: 16,
    top: 112,
    width: 18,
    zIndex: 7
  },
  battleImpactSparkDragon: {
    left: 64
  },
  battleImpactSparkEnemy: {
    right: 62
  },
  battleDamageBadge: {
    alignItems: "center",
    backgroundColor: "rgba(32,19,49,0.92)",
    borderColor: "rgba(255,248,239,0.92)",
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: "absolute",
    shadowColor: "#fff8ef",
    shadowOpacity: 0.55,
    shadowRadius: 10,
    zIndex: 6
  },
  battleDamageBadgeDragon: {
    left: 42,
    top: 86
  },
  battleDamageBadgeEnemy: {
    right: 34,
    top: 84
  },
  battleDamageBadgeText: {
    color: "#fff8ef",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.4
  },
  battleDragonProjectile: {
    backgroundColor: "#a7f3ff",
    right: -34,
    shadowColor: "#6be8ff",
    shadowOpacity: 0.95,
    shadowRadius: 16,
    transform: [{ rotate: "-8deg" }]
  },
  battleEnemyProjectile: {
    backgroundColor: "#ff6a7a",
    left: -26,
    shadowColor: "#ff6a7a",
    shadowOpacity: 0.9,
    shadowRadius: 14,
    transform: [{ rotate: "8deg" }]
  },
  battleVersusBurst: {
    alignItems: "center",
    backgroundColor: "rgba(255,216,119,0.9)",
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    borderWidth: 3,
    height: 72,
    justifyContent: "center",
    marginHorizontal: -4,
    shadowColor: "#ffd66f",
    shadowOpacity: 0.8,
    shadowRadius: 18,
    width: 72,
    zIndex: 3
  },
  battleVersusText: {
    color: "#2f1f18",
    fontSize: 22,
    fontWeight: "900"
  },
  battleCombatantName: {
    color: "#fff8ef",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 8,
    textAlign: "center"
  },
  battleHpTrack: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    height: 12,
    marginTop: 9,
    overflow: "hidden",
    width: "82%"
  },
  battleHpFill: {
    borderRadius: 999,
    height: "100%"
  },
  battleHpText: {
    color: "#f7e7c0",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 6
  },
  battleFightHud: {
    backgroundColor: "rgba(8,6,17,0.72)",
    borderColor: "rgba(248,217,135,0.32)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 3,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  battleFightCue: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center"
  },
  battleExchangeReadoutRow: {
    flexDirection: "row",
    gap: 8
  },
  battleExchangePill: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 9,
    paddingVertical: 6
  },
  battleExchangePillActiveDragon: {
    backgroundColor: "rgba(255,122,61,0.22)",
    borderColor: "rgba(255,179,71,0.55)"
  },
  battleExchangePillActiveEnemy: {
    backgroundColor: "rgba(255,95,122,0.2)",
    borderColor: "rgba(255,95,122,0.55)"
  },
  battleExchangePillKicker: {
    color: "#f8d987",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  battleExchangePillText: {
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 1
  },
  battleFightStats: {
    color: "#a7f3ff",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center"
  },
  battleOutcomeBanner: {
    alignItems: "center",
    backgroundColor: "rgba(8,6,17,0.78)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  battleOutcomeBannerWin: {
    borderColor: "rgba(143,255,210,0.48)"
  },
  battleOutcomeBannerLoss: {
    borderColor: "rgba(255,120,79,0.48)"
  },
  battleOutcomeIconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(255,248,239,0.12)",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  battleOutcomeIcon: {
    fontSize: 21
  },
  battleOutcomeCopy: {
    flex: 1
  },
  battleOutcomeKicker: {
    color: "#f8d987",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  battleOutcomeTitle: {
    color: "#fff8ef",
    fontSize: 16,
    fontWeight: "900"
  },
  battleOutcomeLine: {
    color: "#f7e7c0",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 1
  },
  battleOutcomeNext: {
    color: "#8ff7ff",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 1
  },
  battleArenaContinueButton: {
    alignItems: "center",
    backgroundColor: "#fff8ef",
    borderColor: "rgba(248,217,135,0.7)",
    borderRadius: 24,
    borderWidth: 2,
    marginTop: 8,
    paddingVertical: 14,
    shadowColor: "#f8d987",
    shadowOpacity: 0.26,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4
  },
  battleArenaContinueButtonDisabled: {
    opacity: 0.72
  },
  battleArenaContinueText: {
    color: "#201331",
    fontSize: 17,
    fontWeight: "900"
  },
  battleRewardPlate: {
    backgroundColor: "rgba(8,6,17,0.72)",
    borderColor: "rgba(255,232,163,0.24)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 5,
    padding: 8
  },
  battleOnePageSummary: {
    alignItems: "center",
    gap: 2
  },
  battleRewardText: {
    color: uiTheme.colors.gold,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center"
  },
  battleSkillText: {
    color: "#a7f3ff",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6,
    textAlign: "center"
  },
  v02CombatReadoutPanel: {
    backgroundColor: "rgba(248,217,135,0.12)",
    borderColor: "rgba(248,217,135,0.34)",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  battleSkillTriggerPanel: {
    backgroundColor: "rgba(167,243,255,0.1)",
    borderColor: "rgba(167,243,255,0.32)",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  battleSkillTriggerPanelCompact: {
    backgroundColor: "rgba(167,243,255,0.1)",
    borderColor: "rgba(167,243,255,0.32)",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  battleFlashCalloutRail: {
    backgroundColor: "rgba(255,120,79,0.12)",
    borderColor: "rgba(255,179,71,0.36)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 7,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  battleFlashCalloutKicker: {
    color: "#ffb347",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
    textTransform: "uppercase"
  },
  battleFlashCalloutGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  battleFlashCalloutCard: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    opacity: 0.7,
    paddingHorizontal: 6,
    paddingVertical: 6
  },
  battleFlashCalloutCardActive: {
    backgroundColor: "rgba(255,179,71,0.16)",
    borderColor: "rgba(255,179,71,0.44)",
    opacity: 1
  },
  battleFlashCalloutIcon: {
    fontSize: 16,
    textAlign: "center"
  },
  battleFlashCalloutLabel: {
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center"
  },
  battleFlashCalloutDetail: {
    color: "#ffd9bf",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
    textAlign: "center"
  },
  battleSkillTriggerTitle: {
    color: "#a7f3ff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 3,
    textAlign: "center",
    textTransform: "uppercase"
  },
  battleSkillTriggerLine: {
    color: "#fff8ef",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center"
  },
  battleMessageText: {
    color: uiTheme.colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
    textAlign: "center"
  },
  battleLogPanel: {
    backgroundColor: "rgba(17,13,34,0.82)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    borderWidth: 1,
    padding: 9
  },
  battleLogPanelCompact: {
    maxHeight: 92,
    overflow: "hidden"
  },
  battleQuickResultTitle: {
    color: uiTheme.colors.gold,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  battleQuickResultMeta: {
    color: uiTheme.colors.info,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
    marginTop: 2
  },
  upgradeRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 14
  },
  upgradeName: {
    color: "#fff8ef",
    fontSize: 17,
    fontWeight: "900"
  },
  buyButton: {
    backgroundColor: "#fff8ef",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  buyButtonText: {
    color: "#160c2f",
    fontWeight: "900"
  },
  focusedTrainingPanel: {
    gap: 8,
    height: "100%",
    padding: 10
  },
  focusedTrainingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  focusedTrainingStatCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(248,217,135,0.16)",
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    padding: 10
  },
  focusedTrainingSkillRow: {
    backgroundColor: "rgba(248,217,135,0.1)",
    borderColor: "rgba(248,217,135,0.24)",
    borderRadius: 16,
    borderWidth: 1,
    padding: 10
  },
  focusedTrainingSkillCopy: {
    gap: 2
  },
  evolutionPreviewPanel: {
    gap: 16,
    paddingBottom: 18
  },
  evolutionPreviewKicker: {
    color: uiTheme.colors.gold,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase"
  },
  evolutionPreviewTitle: {
    color: uiTheme.colors.text,
    fontSize: 26,
    fontWeight: "900"
  },
  evolutionPreviewElementTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  evolutionPreviewElementTab: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  evolutionPreviewElementText: {
    color: uiTheme.colors.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  evolutionPreviewStageTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9
  },
  evolutionPreviewStageTab: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 124,
    padding: 11
  },
  evolutionPreviewStageLabel: {
    color: uiTheme.colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  evolutionPreviewStageCaption: {
    color: uiTheme.colors.faint,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3
  },
  evolutionPreviewHeroCard: {
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 210,
    overflow: "hidden",
    padding: 16
  },
  evolutionPreviewHeroCopy: {
    flex: 1.05,
    gap: 7,
    justifyContent: "center"
  },
  evolutionPreviewHeroKicker: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  evolutionPreviewHeroTitle: {
    color: uiTheme.colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  evolutionPreviewHeroText: {
    color: uiTheme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19
  },
  evolutionPreviewHeroNote: {
    color: uiTheme.colors.gold,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4
  },
  evolutionPreviewHeroImage: {
    alignSelf: "center",
    height: 190,
    width: 160
  },
  evolutionPreviewBranchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  evolutionPreviewBranchCard: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.11)",
    borderRadius: 18,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 135,
    padding: 10,
    width: "30%"
  },
  evolutionPreviewBranchImage: {
    height: 96,
    width: "100%"
  },
  evolutionPreviewBranchName: {
    color: uiTheme.colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 6,
    textAlign: "center"
  },
  evolutionPreviewBranchFantasy: {
    color: uiTheme.colors.faint,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
    textAlign: "center"
  },
  evolutionPreviewOptionPanel: {
    backgroundColor: "rgba(8,6,17,0.45)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 22,
    borderWidth: 1,
    padding: 12
  },
  evolutionPreviewOptionTitle: {
    color: uiTheme.colors.text,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 4
  },
  evolutionPreviewOptionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10
  },
  evolutionPreviewOptionTile: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 128,
    padding: 8,
    width: "47%"
  },
  evolutionPreviewOptionImage: {
    height: 118,
    width: "100%"
  },
  evolutionPreviewOptionLabel: {
    color: uiTheme.colors.text,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 5,
    textAlign: "center"
  },
  evolutionPreviewContactSheetPanel: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 22,
    borderWidth: 1,
    padding: 12
  },
  evolutionPreviewContactSheet: {
    height: 360,
    marginTop: 10,
    width: "100%"
  }
});
