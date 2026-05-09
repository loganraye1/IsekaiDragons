import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
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
  useWindowDimensions,
  View
} from "react-native";
import { eggChoices, elementTheme, encounters, quests, shopItems } from "./src/content";
import { BALANCE } from "./src/balance";
import {
  gameReducer,
  canReincarnate,
  achievementDefinitions,
  achievementOrder,
  dailyGoalDefinitions,
  dailyGoalOrder,
  dailyLoginRewardDefinitions,
  equipmentBonusLabels,
  equipmentRarityDefinitions,
  equipmentSlotLabels,
  equipmentSlots,
  getEssencePerSecond,
  getCriticalTapChance,
  getAdventureNodeById,
  getDragonForm,
  getEvolutionProgressRatio,
  getElementScores,
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
  getTapEssence,
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
  initialGameState
} from "./src/game";
import { clearGameState, loadGameState, saveGameState } from "./src/storage";
import { HATCHLING_ART_VERSION } from "./src/artVersion";
import {
  AchievementId,
  AdventureNode,
  DailyGoalId,
  DragonElement,
  DragonStage,
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

const uiTheme = {
  colors: {
    ink: "#080611",
    panel: "#120b26",
    panelRaised: "rgba(255,255,255,0.09)",
    panelStrong: "rgba(10,7,21,0.92)",
    border: "rgba(255,255,255,0.14)",
    borderStrong: "rgba(248,217,135,0.36)",
    text: "#fff8ef",
    muted: "#b9aee3",
    faint: "#7f73ad",
    gold: "#f8d987",
    goldDark: "#1e1235",
    green: "#8fffd2",
    danger: "#ff784f"
  },
  radius: {
    sm: 14,
    md: 18,
    lg: 22,
    xl: 30
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  }
};

const tabs: Array<{ key: ScreenKey; label: string }> = [
  { key: "den", label: "Den" },
  { key: "adventure", label: "Adventure" },
  { key: "upgrade", label: "Upgrade" },
  { key: "quests", label: "Quests" },
  { key: "shop", label: "Shop" }
];

const eggImages: Record<DragonElement, ImageSourcePropType> = {
  fire: require("./assets/eggs/fire-dragon-egg.png"),
  water: require("./assets/eggs/water-dragon-egg.png"),
  earth: require("./assets/eggs/earth-dragon-egg.png")
};

const sceneImages: Record<AdventureNode["scene"], ImageSourcePropType> = {
  forest: require("./assets/adventure/forest-path.png"),
  ruins: require("./assets/adventure/ruins-cavern.png"),
  cave: require("./assets/adventure/ruins-cavern.png"),
  shrine: require("./assets/adventure/ancient-shrine.png"),
  camp: require("./assets/adventure/dragon-camp.png"),
  boss: require("./assets/adventure/rift-boss.png")
};

const artValidationBackgrounds: Record<ArtValidationBackgroundKey, { label: string; source: ImageSourcePropType }> = {
  mysticMeadow: { label: "Mystic Meadow", source: sceneImages.forest },
  emberWoods: { label: "Ember Woods", source: sceneImages.camp },
  tideCavern: { label: "Tide Cavern", source: sceneImages.cave },
  stonebackHills: { label: "Stoneback Hills", source: sceneImages.ruins }
};

const hatchlingImages: Record<DragonElement, ImageSourcePropType> = {
  fire: require("./assets/dragons/fire_hatchling.png"),
  water: require("./assets/dragons/water_hatchling.png"),
  earth: require("./assets/dragons/earth_hatchling.png")
};

const drakeImages: Record<DragonElement, ImageSourcePropType> = {
  fire: require("./assets/dragons/fire_drake.png"),
  water: require("./assets/dragons/water_drake.png"),
  earth: require("./assets/dragons/earth_drake.png")
};

const dragonStageImages: Record<DragonStage, Record<DragonElement, ImageSourcePropType>> = {
  egg: eggImages,
  hatchling: hatchlingImages,
  drake: drakeImages,
  // Placeholder later paths: replace these with dragon/wyrm cutouts as art lands.
  dragon: hatchlingImages,
  wyrm: hatchlingImages
};

function getDragonStageImage(stage: DragonStage, element: DragonElement) {
  return dragonStageImages[stage]?.[element] ?? hatchlingImages[element];
}

const drakeConceptImages: Record<DragonElement, ImageSourcePropType> = {
  fire: require("./assets/dragons/concepts/fire_drake_concept.png"),
  water: require("./assets/dragons/concepts/water_drake_concept.png"),
  earth: require("./assets/dragons/concepts/earth_drake_concept.png")
};

const auraEffects: Record<DragonElement, any> = {
  fire: require("./assets/effects/fire_aura.json"),
  water: require("./assets/effects/water_aura.json"),
  earth: require("./assets/effects/earth_aura.json")
};

const evolutionBurstEffect = require("./assets/effects/evolution_burst.json");

const APP_VERSION = "0.1.0-alpha";

type GameSoundEvent = "tap" | "criticalTap" | "upgrade" | "evolve" | "treasureDrop" | "gearDrop" | "reincarnate" | "dailyReward";
type ReturnPresencePhase = "sleeping" | "waking" | "greeting" | "rewards";
type AnticipationLevel = "calm" | "alert" | "excited";
type EvolutionMomentPhase = "glow" | "silhouette" | "reveal" | null;
type ArtValidationBackgroundKey = "mysticMeadow" | "emberWoods" | "tideCavern" | "stonebackHills";
type ArtValidationMode = {
  enabled: boolean;
  sizeMode: "normal" | "thumbnail";
  grayscale: boolean;
  disableAura: boolean;
  freezeIdle: boolean;
  lowBrightness: boolean;
  hudVisible: boolean;
  backgroundKey: ArtValidationBackgroundKey;
};
type PresenceTestOverrides = {
  idleElement: DragonElement | null;
  anticipationLevel: AnticipationLevel | null;
  returnPresence: GameState["returnPresence"] | null;
};

function playGameSound(_event: GameSoundEvent) {
  // Sound-ready hook: wire Expo AV or another audio layer here when assets exist.
}

type EnemyImageKey = "slime" | "boar" | "wisp" | "knight" | "manta" | "chimera";

type JourneyObjective = {
  title: string;
  description: string;
  reward: string;
  enemy?: EnemyImageKey;
};

const enemyImages: Record<EnemyImageKey, ImageSourcePropType> = {
  slime: require("./assets/enemies/bouncy-slime-cutout.png"),
  boar: require("./assets/enemies/briar-boar-cutout.png"),
  wisp: require("./assets/enemies/willow-wisp-cutout.png"),
  knight: require("./assets/enemies/ruin-knight-cutout.png"),
  manta: require("./assets/enemies/sky-manta-cutout.png"),
  chimera: require("./assets/enemies/rift-chimera-cutout.png")
};

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
  const pulse = useRef(new Animated.Value(0)).current;
  const stateRef = useRef(state);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const backgroundedAtRef = useRef<number | null>(null);

  const theme = state.dragon.element ? elementTheme[state.dragon.element] : elementTheme.fire;
  const form = getDragonForm(state.dragon.stage, state.dragon.element);

  const dispatch = useCallback((action: GameAction) => {
    if (state.settings.hapticsEnabled) {
      void Haptics.selectionAsync();
    }
    dispatchBase(action);
  }, [state.settings.hapticsEnabled]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
        if (awayDurationMs >= 10 * 60 * 1000) {
          dispatchBase({ type: "startReturnPresenceTest", awayDurationMs, withRewards: true });
        } else if (offlineReward > 0) {
          dispatchBase({ type: "collectPassiveEssence", amount: offlineReward });
        }
        backgroundedAtRef.current = null;
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (state.settings.reducedMotion) {
      pulse.setValue(0);
      return;
    }
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1300, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1300, useNativeDriver: true })
      ])
    ).start();
  }, [pulse, state.settings.reducedMotion]);

  const scale = state.settings.reducedMotion ? (1 as any) : pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

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
        {state.phase === "journey" ? (
          <View style={styles.guidedHeader}>
            <View>
              <Text style={styles.kicker}>Isekai Dragons</Text>
              <Text style={styles.title}>{form.name}</Text>
              <Text style={styles.subtitle}>{form.title}</Text>
            </View>
            <Pressable onPress={resetGame} style={styles.resetButton}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
          </View>
        ) : null}
        <GameStage state={state} dispatch={dispatch} pulseScale={scale} />
      </SafeAreaView>
    </LinearGradient>
  );
}

function ResourceBar({ state }: { state: GameState }) {
  const xpNeeded = getXpToLevel(state.dragon.level);
  return (
    <View style={styles.resourceBar}>
      <Resource label="Gold" value={state.player.gold} />
      <Resource label="Essence" value={state.player.essence} />
      <Resource label="Level" value={state.dragon.level} />
      <Resource label="XP" value={`${state.dragon.xp}/${xpNeeded}`} />
    </View>
  );
}

function GameStage({
  state,
  dispatch,
  pulseScale
}: {
  state: GameState;
  dispatch: (action: GameAction) => void;
  pulseScale: Animated.AnimatedInterpolation<number>;
}) {
  if (state.phase === "journey") {
    return <HatchlingJourneyStage state={state} dispatch={dispatch} />;
  }

  return <EggAwakeningStage state={state} dispatch={dispatch} pulseScale={pulseScale} />;
}

function EggAwakeningStage({
  state,
  dispatch,
  pulseScale
}: {
  state: GameState;
  dispatch: (action: GameAction) => void;
  pulseScale: Animated.AnimatedInterpolation<number>;
}) {
  const swirl = useRef(new Animated.Value(0)).current;
  const crack = useRef(new Animated.Value(0)).current;
  const crackProgress = useRef(new Animated.Value(0)).current;
  const eggJolt = useRef(new Animated.Value(0)).current;
  const scores = getElementScores(state.eggAnswers);
  const leadingElement = getLeadingElement(state.eggAnswers);
  const theme = elementTheme[leadingElement];
  const question = eggChoices[state.currentQuestionIndex] ?? eggChoices[eggChoices.length - 1];
  const answeredCount = Object.keys(state.eggAnswers).length;

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
      Animated.parallel([
        Animated.timing(crack, { toValue: 1, duration: 1900, useNativeDriver: true }),
        Animated.timing(crackProgress, { toValue: 1, duration: 650, useNativeDriver: true }),
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
    }
  }, [crack, crackProgress, dispatch, eggJolt, state.phase]);

  useEffect(() => {
    if (state.phase === "hatching") {
      return;
    }

    Animated.timing(crackProgress, {
      toValue: answeredCount / 3,
      duration: 360,
      useNativeDriver: true
    }).start();

    if (answeredCount > 0) {
      Animated.sequence([
        Animated.timing(eggJolt, { toValue: 1, duration: 90, useNativeDriver: true }),
        Animated.timing(eggJolt, { toValue: 0, duration: 110, useNativeDriver: true })
      ]).start();
    }
  }, [answeredCount, crackProgress, eggJolt, state.phase]);

  const rotation = swirl.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const reverseRotation = swirl.interpolate({ inputRange: [0, 1], outputRange: ["360deg", "0deg"] });
  const hatchScale = crack.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] });
  const hatchOpacity = crack.interpolate({ inputRange: [0, 1], outputRange: [1, 0.24] });
  const flashOpacity = crack.interpolate({ inputRange: [0, 0.35, 0.7, 1], outputRange: [0, 0.25, 1, 0.18] });
  const hatchlingRevealOpacity = crack.interpolate({ inputRange: [0, 0.58, 1], outputRange: [0, 0, 1] });
  const hatchlingRevealScale = crack.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1.12] });
  const eggShakeX = eggJolt.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -8, 7, -5, 0] });
  const eggShakeRotate = eggJolt.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: ["0deg", "-3deg", "3deg", "-2deg", "0deg"] });
  const shellSplit = crack.interpolate({ inputRange: [0, 0.42, 0.75, 1], outputRange: [0, 0, 22, 62] });
  const shellLift = crack.interpolate({ inputRange: [0, 0.42, 1], outputRange: [0, 0, -18] });
  const leftShellRotate = crack.interpolate({ inputRange: [0, 0.42, 1], outputRange: ["0deg", "0deg", "-18deg"] });
  const rightShellRotate = crack.interpolate({ inputRange: [0, 0.42, 1], outputRange: ["0deg", "0deg", "18deg"] });
  const splitShellOpacity = crack.interpolate({ inputRange: [0, 0.36, 0.9, 1], outputRange: [0, 0, 0.9, 0.2] });
  const brokenShellOpacity = crack.interpolate({ inputRange: [0, 0.34, 0.48, 0.9, 1], outputRange: [0, 0, 1, 0.78, 0] });

  return (
    <View style={styles.guidedStage}>
      <View style={styles.eggOnlyScene}>
        <ParticleField color={theme.secondary} count={12} />
        <LinearGradient colors={["#07030f", theme.dark, "#020104"]} style={styles.eggOnlyOverlay}>
          <View style={styles.titleScreenHeader}>
            <Text style={styles.kicker}>Isekai Dragons</Text>
            <Text style={styles.titleScreenVersion}>v{APP_VERSION}</Text>
          </View>

          <View style={styles.eggStageCenter}>
            <Animated.View style={[styles.swirlRing, { borderColor: theme.primary, transform: [{ rotate: rotation }, { scale: pulseScale }] }]} />
            <Animated.View style={[styles.swirlRingAlt, { borderColor: theme.secondary, transform: [{ rotate: reverseRotation }] }]} />
            <Animated.View style={[styles.evolutionRing, { opacity: flashOpacity, borderColor: theme.secondary, transform: [{ scale: hatchScale }] }]} />
            <Animated.View style={[styles.evolutionRingLarge, { opacity: flashOpacity, borderColor: "#fff8ef", transform: [{ scale: hatchScale }] }]} />
            <Animated.View style={[styles.energyMoteOrbit, { transform: [{ rotate: rotation }] }]}>
              <View style={[styles.energyMote, { backgroundColor: theme.primary }]} />
              <View style={[styles.energyMoteSmall, { backgroundColor: theme.secondary }]} />
            </Animated.View>
            <Animated.View style={[styles.energyMoteOrbitAlt, { transform: [{ rotate: reverseRotation }] }]}>
              <View style={[styles.energyMoteSmall, { backgroundColor: theme.primary }]} />
              <View style={[styles.energyMote, { backgroundColor: theme.secondary }]} />
            </Animated.View>
            <Animated.View pointerEvents="none" style={[styles.hatchFlash, { opacity: flashOpacity, backgroundColor: theme.secondary }]} />
            <GlowPulse color={theme.primary} />
            <Pressable disabled={state.phase !== "egg"} onPress={() => dispatch({ type: "tapEgg" })}>
              <FloatingLayer distance={12} scale={1.055} sway={1.3} duration={1450}>
                <Animated.View style={{ opacity: hatchOpacity, transform: [{ translateX: eggShakeX }, { rotate: eggShakeRotate }, { scale: hatchScale }] }}>
                  <View style={styles.focusEggWrap}>
                    <Image source={eggImages[leadingElement]} style={styles.focusEggImage} resizeMode="contain" />
                    <CrackOverlay progress={crackProgress} breaking={crack} />
                  </View>
                </Animated.View>
              </FloatingLayer>
            </Pressable>
            <ShellShard source={eggImages[leadingElement]} progress={crack} style={styles.shellShardTop} imageStyle={styles.shellShardTopImage} x={-42} y={-78} rotate="-28deg" />
            <ShellShard source={eggImages[leadingElement]} progress={crack} style={styles.shellShardUpperLeft} imageStyle={styles.shellShardUpperLeftImage} x={-80} y={-34} rotate="-42deg" />
            <ShellShard source={eggImages[leadingElement]} progress={crack} style={styles.shellShardUpperRight} imageStyle={styles.shellShardUpperRightImage} x={82} y={-36} rotate="38deg" />
            <ShellShard source={eggImages[leadingElement]} progress={crack} style={styles.shellShardMidLeft} imageStyle={styles.shellShardMidLeftImage} x={-94} y={18} rotate="-30deg" />
            <ShellShard source={eggImages[leadingElement]} progress={crack} style={styles.shellShardMidRight} imageStyle={styles.shellShardMidRightImage} x={92} y={26} rotate="34deg" />
            <Animated.View pointerEvents="none" style={[styles.brokenShellDarkCore, { opacity: brokenShellOpacity, transform: [{ scale: hatchScale }] }]} />
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
              <Image source={eggImages[leadingElement]} style={styles.shellHalfImage} resizeMode="contain" />
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
              <Image source={eggImages[leadingElement]} style={[styles.shellHalfImage, styles.shellRightImage]} resizeMode="contain" />
            </Animated.View>
            <Animated.Image
              source={hatchlingImages[leadingElement]}
              resizeMode="contain"
              style={[
                styles.evolutionHatchling,
                {
                  opacity: hatchlingRevealOpacity,
                  transform: [{ scale: hatchlingRevealScale }]
                }
              ]}
            />
          </View>

          {state.phase === "question" ? (
            <View style={styles.questionCard}>
              <Text style={styles.choiceNumber}>Question {Math.min(answeredCount + 1, 3)} / 3</Text>
              <Text style={styles.panelTitle}>{question.prompt}</Text>
              {question.answers.map((answer) => {
                const answerTheme = elementTheme[answer.element];
                return (
                  <Pressable
                    key={answer.id}
                    onPress={() =>
                      dispatch({
                        type: "chooseEggAnswer",
                        choiceId: question.id,
                        element: answer.element,
                        trait: answer.label
                      })
                    }
                    style={[styles.guidedAnswer, { borderColor: answerTheme.primary }]}
                  >
                    <Text style={[styles.answerTitle, { color: answerTheme.secondary }]}>{answer.label}</Text>
                    <Text style={styles.answerDescription}>{answer.description}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </LinearGradient>
      </View>
    </View>
  );
}

function CrackOverlay({ progress, breaking }: { progress: Animated.Value; breaking: Animated.Value }) {
  const missingShellOpacity = breaking.interpolate({ inputRange: [0, 0.32, 0.56, 1], outputRange: [0, 0, 0.92, 0.35] });
  const missingShellScale = breaking.interpolate({ inputRange: [0, 0.56, 1], outputRange: [0.55, 1, 1.35] });

  return (
    <View pointerEvents="none" style={styles.crackLayer}>
      <Animated.View
        style={[
          styles.missingShellGap,
          styles.missingShellGapTop,
          {
            opacity: missingShellOpacity,
            transform: [{ rotate: "-18deg" }, { scale: missingShellScale }]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.missingShellGap,
          styles.missingShellGapLeft,
          {
            opacity: missingShellOpacity,
            transform: [{ rotate: "32deg" }, { scale: missingShellScale }]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.missingShellGap,
          styles.missingShellGapRight,
          {
            opacity: missingShellOpacity,
            transform: [{ rotate: "-36deg" }, { scale: missingShellScale }]
          }
        ]}
      />
      <CrackSegment progress={progress} start={0.06} style={styles.crackMain} />
      <CrackSegment progress={progress} start={0.16} style={styles.crackBranchOne} />
      <CrackSegment progress={progress} start={0.38} style={styles.crackBranchTwo} />
      <CrackSegment progress={progress} start={0.5} style={styles.crackLower} />
      <CrackSegment progress={progress} start={0.68} style={styles.crackWide} />
      <CrackSegment progress={progress} start={0.76} style={styles.crackTop} />
      <CrackSegment progress={progress} start={0.84} style={styles.crackShard} />
      <Animated.View
        style={[
          styles.crackCore,
          {
            opacity: progress.interpolate({ inputRange: [0.88, 1], outputRange: [0, 1], extrapolate: "clamp" }),
            transform: [
              { rotate: "18deg" },
              { scale: progress.interpolate({ inputRange: [0.88, 1], outputRange: [0.45, 1], extrapolate: "clamp" }) }
            ]
          }
        ]}
      />
    </View>
  );
}

function ShellShard({
  source,
  progress,
  style,
  imageStyle,
  x,
  y,
  rotate
}: {
  source: ImageSourcePropType;
  progress: Animated.Value;
  style: object;
  imageStyle: object;
  x: number;
  y: number;
  rotate: string;
}) {
  const opacity = progress.interpolate({ inputRange: [0, 0.34, 0.46, 0.92, 1], outputRange: [0, 0, 1, 0.82, 0] });
  const translateX = progress.interpolate({ inputRange: [0, 0.42, 1], outputRange: [0, 0, x] });
  const translateY = progress.interpolate({ inputRange: [0, 0.42, 1], outputRange: [0, 0, y] });
  const spin = progress.interpolate({ inputRange: [0, 0.42, 1], outputRange: ["0deg", "0deg", rotate] });
  const scale = progress.interpolate({ inputRange: [0, 0.46, 1], outputRange: [0.9, 1, 0.72] });

  return (
    <Animated.View pointerEvents="none" style={[styles.shellShardClip, style, { opacity, transform: [{ translateX }, { translateY }, { rotate: spin }, { scale }] }]}>
      <Image source={source} style={[styles.shellShardImage, imageStyle]} resizeMode="contain" />
    </Animated.View>
  );
}

function CrackSegment({
  progress,
  start,
  style
}: {
  progress: Animated.Value;
  start: number;
  style: object;
}) {
  const reveal = progress.interpolate({
    inputRange: [start, Math.min(start + 0.16, 1)],
    outputRange: [0, 1],
    extrapolate: "clamp"
  });

  return (
    <Animated.View style={[styles.crackSegmentMask, { opacity: reveal, transform: [{ scaleY: reveal }] }]}>
      <View style={[styles.crackLine, style]} />
    </Animated.View>
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

function FloatingLayer({
  children,
  distance = 8,
  scale = 1.03,
  sway = 0,
  duration = 1600,
  delay = 0,
  style
}: {
  children: ReactNode;
  distance?: number;
  scale?: number;
  sway?: number;
  duration?: number;
  delay?: number;
  style?: object;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }), -1, true)
    );
  }, [delay, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -distance * progress.value },
      { rotate: `${-sway + progress.value * sway * 2}deg` },
      { scale: 1 + (scale - 1) * progress.value }
    ]
  }));

  return <Reanimated.View style={[style, animatedStyle]}>{children}</Reanimated.View>;
}

function GlowPulse({
  color,
  style,
  duration = 1400,
  minOpacity = 0.12,
  maxOpacity = 0.28
}: {
  color: string;
  style?: any;
  duration?: number;
  minOpacity?: number;
  maxOpacity?: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: color,
    opacity: minOpacity + progress.value * (maxOpacity - minOpacity),
    transform: [{ scale: 0.96 + progress.value * 0.12 }]
  }));

  return <Reanimated.View pointerEvents="none" style={[styles.glowPulse, style, animatedStyle]} />;
}

function ParallaxBackground({ source, opacity = 0.28 }: { source: ImageSourcePropType; opacity?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity,
    transform: [{ scale: 1.1 }, { translateX: -12 + progress.value * 24 }, { translateY: -8 + progress.value * 16 }]
  }));

  return <Reanimated.Image source={source} resizeMode="cover" style={[styles.parallaxLayer, animatedStyle]} />;
}

function ParticleField({ color, count = 8 }: { color: string; count?: number }) {
  return (
    <View pointerEvents="none" style={styles.particleField}>
      {Array.from({ length: count }).map((_, index) => (
        <ParticleDot key={index} color={color} index={index} />
      ))}
    </View>
  );
}

function ParticleDot({ color, index }: { color: string; index: number }) {
  const progress = useSharedValue(0);
  const left = 12 + ((index * 29) % 78);
  const top = 18 + ((index * 43) % 72);
  const size = 5 + (index % 3) * 2;

  useEffect(() => {
    progress.value = withDelay(
      index * 120,
      withRepeat(withSequence(withTiming(1, { duration: 1900 }), withTiming(0, { duration: 1900 })), -1)
    );
  }, [index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: color,
    height: size,
    left: `${left}%`,
    opacity: 0.18 + progress.value * 0.58,
    top: `${top}%`,
    transform: [{ translateY: -28 * progress.value }, { scale: 0.65 + progress.value * 0.55 }],
    width: size
  }));

  return <Reanimated.View style={[styles.particleDot, animatedStyle]} />;
}

function DragonDisplay({
  element,
  dragonSource,
  backgroundSource,
  children,
  onTap,
  floatingText,
  floatingTextKey = 0,
  showEvolutionBurst = false,
  dragonStage = "hatchling",
  dragonTransforms = [],
  reducedMotion = false,
  tapBounceScale = BALANCE.softProgressionAssist.baseTapBounceScale,
  anticipationLevel = "calm",
  returnPresencePhase = null,
  evolutionMomentPhase = null,
  behaviorElement = element,
  artValidationMode = defaultArtValidationMode,
  compact = false
}: {
  element: DragonElement;
  dragonSource: ImageSourcePropType;
  backgroundSource: ImageSourcePropType;
  children?: ReactNode;
  onTap?: () => void;
  floatingText?: string;
  floatingTextKey?: number;
  showEvolutionBurst?: boolean;
  dragonStage?: DragonStage;
  dragonTransforms?: any[];
  reducedMotion?: boolean;
  tapBounceScale?: number;
  anticipationLevel?: AnticipationLevel;
  returnPresencePhase?: ReturnPresencePhase | null;
  evolutionMomentPhase?: EvolutionMomentPhase;
  behaviorElement?: DragonElement;
  artValidationMode?: ArtValidationMode;
  compact?: boolean;
}) {
  const theme = elementTheme[element];
  const breath = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const isResting = returnPresencePhase === "sleeping";
  const isWaking = returnPresencePhase === "waking";
  const isGreeting = returnPresencePhase === "greeting";
  const isEvolutionReveal = evolutionMomentPhase === "reveal";
  const isEvolutionSilhouette = evolutionMomentPhase === "silhouette";
  const isEvolutionWarmup = evolutionMomentPhase === "glow";
  const validationEnabled = __DEV__ && artValidationMode.enabled;
  const thumbnailMode = validationEnabled && artValidationMode.sizeMode === "thumbnail";
  const grayscaleMode = validationEnabled && artValidationMode.grayscale;
  const auraDisabled = validationEnabled && artValidationMode.disableAura;
  const idleFrozen = reducedMotion || (validationEnabled && artValidationMode.freezeIdle);
  const motionProfile = getElementMotionProfile(behaviorElement, anticipationLevel, dragonStage);

  useEffect(() => {
    if (idleFrozen) {
      breath.setValue(0);
      return;
    }
    Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: motionProfile.duration, useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: motionProfile.duration, useNativeDriver: true })
      ])
    ).start();
  }, [breath, idleFrozen, motionProfile.duration]);

  const handleTap = () => {
    if (!reducedMotion) {
      bounce.setValue(0);
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 160, useNativeDriver: true })
      ]).start();
    }
    onTap?.();
  };

  const presenceMotionMultiplier = isResting ? 0.35 : isWaking ? 0.65 : 1;
  const breathScale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1 + (motionProfile.scale - 1) * presenceMotionMultiplier] });
  const breathLift = breath.interpolate({ inputRange: [0, 1], outputRange: [0, motionProfile.lift * presenceMotionMultiplier] });
  const breathSway = breath.interpolate({ inputRange: [0, 1], outputRange: [`${motionProfile.rotate * -1 * presenceMotionMultiplier}deg`, `${motionProfile.rotate * presenceMotionMultiplier}deg`] });
  const bounceScale = bounce.interpolate({ inputRange: [0, 1], outputRange: [1, tapBounceScale] });
  const stageScale = dragonStage === "wyrm" ? 1.42 : dragonStage === "dragon" ? 1.3 : dragonStage === "drake" ? 1.14 : 1;
  const elementGlowStyle = behaviorElement === "fire" ? styles.dragonDisplayGlowFire : behaviorElement === "water" ? styles.dragonDisplayGlowWater : styles.dragonDisplayGlowEarth;
  const presenceTransforms = isResting
    ? [{ translateY: 20 }, { rotate: behaviorElement === "earth" ? "0deg" : "-6deg" }, { scale: 0.93 }]
    : isWaking
      ? [{ translateY: -8 }, { rotate: behaviorElement === "fire" ? "3deg" : "0deg" }, { scaleY: 1.07 }, { scaleX: 0.98 }]
      : isGreeting
        ? [{ translateY: -6 }, { scale: 1.04 }]
        : isEvolutionReveal
          ? [{ translateY: -10 }, { scale: 1.08 }]
        : [];
  const showAuraFx = !reducedMotion && !auraDisabled;

  return (
    <View style={[styles.dragonDisplay, compact && styles.dragonDisplayCompact]}>
      <SafeExpoImage source={backgroundSource} style={styles.dragonDisplayBackground} contentFit="cover" transition={250} />
      <LinearGradient colors={["rgba(8,6,17,0.04)", "rgba(8,6,17,0.95)"]} style={styles.dragonDisplayOverlay}>
        {children}
        <Pressable onPress={handleTap} style={[styles.dragonTapTarget, compact && styles.dragonTapTargetCompact]}>
          {(isEvolutionWarmup || isEvolutionSilhouette || isEvolutionReveal) && !reducedMotion ? (
            <GlowPulse color={theme.secondary} duration={1900} minOpacity={0.18} maxOpacity={0.42} style={styles.evolutionWarmGlow} />
          ) : null}
          {showAuraFx ? (
            <GlowPulse
              color={theme.primary}
              duration={motionProfile.glowDuration}
              minOpacity={motionProfile.glowOpacity[0]}
              maxOpacity={motionProfile.glowOpacity[1]}
              style={[
                styles.dragonDisplayGlow,
                elementGlowStyle,
                anticipationLevel === "alert" && styles.dragonDisplayGlowAlert,
                anticipationLevel === "excited" && styles.dragonDisplayGlowExcited
              ]}
            />
          ) : auraDisabled ? null : <View style={[styles.dragonDisplayGlow, styles.staticDragonGlow, { backgroundColor: theme.primary }]} />}
          {showAuraFx ? <SafeLottie source={auraEffects[element]} autoPlay loop style={styles.dragonAuraEffect} /> : null}
          {showEvolutionBurst ? <SafeLottie source={evolutionBurstEffect} autoPlay loop={false} style={styles.evolutionBurstEffect} /> : null}
          <View style={[styles.dragonGroundShadow, thumbnailMode && styles.dragonGroundShadowValidation, compact && styles.dragonGroundShadowCompact, isResting && styles.dragonGroundShadowResting]} />
          <Animated.View
            style={[
              styles.dragonDisplaySprite,
              thumbnailMode && styles.dragonDisplaySpriteValidation,
              compact && !thumbnailMode && styles.dragonDisplaySpriteCompact,
              {
                transform: [
                  { translateY: breathLift },
                  { rotate: breathSway },
                  { scale: breathScale },
                  { scale: bounceScale },
                  { scale: stageScale },
                  ...presenceTransforms,
                  ...dragonTransforms
                ]
              }
            ]}
          >
            <SafeExpoImage
              source={dragonSource}
              style={[styles.dragonDisplayImage, grayscaleMode && styles.dragonDisplayImageValidation, isEvolutionSilhouette && styles.dragonDisplayImageSilhouette]}
              contentFit="contain"
              transition={180}
              fallback={<HatchlingArtFallback element={element} validationEnabled={grayscaleMode} />}
            />
          </Animated.View>
          {validationEnabled ? <Text style={styles.artValidationBadge}>{getArtValidationBadge(artValidationMode)}</Text> : null}
          {floatingText ? <FloatingText key={floatingTextKey} text={floatingText} color={theme.secondary} /> : null}
        </Pressable>
        {validationEnabled && artValidationMode.lowBrightness ? <View pointerEvents="none" style={styles.lowBrightnessOverlay} /> : null}
      </LinearGradient>
    </View>
  );
}

const defaultArtValidationMode: ArtValidationMode = {
  enabled: false,
  sizeMode: "normal",
  grayscale: false,
  disableAura: false,
  freezeIdle: false,
  lowBrightness: false,
  hudVisible: true,
  backgroundKey: "mysticMeadow"
};

function getArtValidationBadge(mode: ArtValidationMode) {
  return [
    mode.sizeMode === "thumbnail" ? "128px" : "normal",
    mode.grayscale ? "grayscale" : "color",
    mode.disableAura ? "aura off" : "aura on",
    mode.freezeIdle ? "frozen" : "motion",
    artValidationBackgrounds[mode.backgroundKey].label
  ].join(" | ");
}

function getElementMotionProfile(element: DragonElement, anticipationLevel: AnticipationLevel, dragonStage: DragonStage = "hatchling") {
  const anticipationMultiplier = anticipationLevel === "excited" ? 0.72 : anticipationLevel === "alert" ? 0.86 : 1;
  const anticipationLift = anticipationLevel === "excited" ? 1.25 : anticipationLevel === "alert" ? 1.12 : 1;
  type MotionProfile = { duration: number; lift: number; scale: number; rotate: number; glowDuration: number; glowOpacity: [number, number] };
  const profiles: Record<DragonElement, MotionProfile> = {
    fire: { duration: 860, lift: -7, scale: 1.038, rotate: 1.2, glowDuration: 1050, glowOpacity: [0.14, 0.34] },
    water: { duration: 1700, lift: -8, scale: 1.028, rotate: 0.35, glowDuration: 1850, glowOpacity: [0.1, 0.24] },
    earth: { duration: 1550, lift: -4, scale: 1.022, rotate: 0.18, glowDuration: 1650, glowOpacity: [0.11, 0.23] }
  };
  const drakeProfiles: Record<DragonElement, Partial<MotionProfile>> = {
    fire: { duration: 980, lift: -6, scale: 1.032, rotate: 0.85, glowDuration: 1250 },
    water: { duration: 1900, lift: -7, scale: 1.024, rotate: 0.24, glowDuration: 2050 },
    earth: { duration: 1800, lift: -3, scale: 1.018, rotate: 0.12, glowDuration: 1900 }
  };
  const profile = dragonStage === "drake" ? { ...profiles[element], ...drakeProfiles[element] } : profiles[element];
  return {
    duration: Math.max(520, Math.round(profile.duration * anticipationMultiplier)),
    lift: profile.lift * anticipationLift,
    scale: anticipationLevel === "excited" ? profile.scale + 0.018 : anticipationLevel === "alert" ? profile.scale + 0.01 : profile.scale,
    rotate: anticipationLevel === "excited" ? profile.rotate * 1.5 : profile.rotate,
    glowDuration: profile.glowDuration,
    glowOpacity: profile.glowOpacity
  };
}

function SafeExpoImage({
  source,
  style,
  contentFit = "contain",
  transition,
  fallback
}: {
  source: ImageSourcePropType;
  style: any;
  contentFit?: "cover" | "contain";
  transition?: number;
  fallback?: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return fallback ? <>{fallback}</> : (
      <View style={[style, styles.assetFallback]}>
        <Text style={styles.assetFallbackText}>Asset loading...</Text>
      </View>
    );
  }

  return <ExpoImage source={source} style={style} contentFit={contentFit} transition={transition} onError={() => setFailed(true)} />;
}

function HatchlingArtFallback({ element, validationEnabled }: { element: DragonElement; validationEnabled: boolean }) {
  const theme = elementTheme[element];
  const isFire = element === "fire";
  const isWater = element === "water";
  return (
    <View style={[styles.hatchlingFallback, validationEnabled && styles.hatchlingFallbackValidation]}>
      <View style={[styles.hatchlingFallbackWing, styles.hatchlingFallbackWingLeft, { backgroundColor: theme.primary }]} />
      <View style={[styles.hatchlingFallbackWing, styles.hatchlingFallbackWingRight, { backgroundColor: theme.primary }]} />
      <View style={[styles.hatchlingFallbackBody, { backgroundColor: validationEnabled ? "#8d8d8d" : theme.primary }]}>
        <View style={[styles.hatchlingFallbackBelly, { backgroundColor: validationEnabled ? "#d0d0d0" : theme.secondary }]} />
      </View>
      <View style={[styles.hatchlingFallbackHead, { backgroundColor: validationEnabled ? "#9b9b9b" : theme.primary }]}>
        <View style={[styles.hatchlingFallbackHorn, styles.hatchlingFallbackHornLeft, { backgroundColor: validationEnabled ? "#d7d7d7" : theme.secondary }]} />
        <View style={[styles.hatchlingFallbackHorn, styles.hatchlingFallbackHornRight, { backgroundColor: validationEnabled ? "#d7d7d7" : theme.secondary }]} />
        {isWater ? <View style={[styles.hatchlingFallbackFin, { backgroundColor: validationEnabled ? "#c7c7c7" : theme.secondary }]} /> : null}
        {isFire ? <View style={[styles.hatchlingFallbackCrest, { backgroundColor: validationEnabled ? "#eeeeee" : theme.secondary }]} /> : null}
        <View style={[styles.hatchlingFallbackEye, styles.hatchlingFallbackEyeLeft]} />
        <View style={[styles.hatchlingFallbackEye, styles.hatchlingFallbackEyeRight]} />
      </View>
      <View style={[styles.hatchlingFallbackTail, { backgroundColor: validationEnabled ? "#777" : theme.primary }]} />
    </View>
  );
}

function SafeLottie({
  source,
  style,
  autoPlay = true,
  loop = false
}: {
  source: any;
  style: any;
  autoPlay?: boolean;
  loop?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !source) {
    return null;
  }

  return <LottieView source={source} autoPlay={autoPlay} loop={loop} style={style} onAnimationFailure={() => setFailed(true)} />;
}

function FloatingText({ text, color }: { text: string; color: string }) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    float.setValue(0);
    Animated.timing(float, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, [float, text]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -52] });
  const opacity = float.interpolate({ inputRange: [0, 0.18, 1], outputRange: [0, 1, 0] });
  const scale = float.interpolate({ inputRange: [0, 0.22, 1], outputRange: [0.72, 1.12, 1] });

  return (
    <Animated.Text style={[styles.floatingText, { color, opacity, transform: [{ translateY }, { scale }] }]}>
      {text}
    </Animated.Text>
  );
}

type IdlePanelKey = "upgrades" | "adventure" | "goals" | "rebirth" | "settings";

const onboardingSteps = [
  "Tap your dragon to gain Essence.",
  "Buy upgrades to grow while idle.",
  "Adventure defeats enemies and finds loot.",
  "Evolve and eventually reincarnate for Dragon Souls."
];

const guidedPlaytestSteps = [
  { id: "freshSave", label: "Fresh save created" },
  { id: "tap20", label: "Tap dragon 20 times" },
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
  const eps = getEssencePerSecond(state);
  const tapEssence = getTapEssence(state);
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
    if (eps <= 0) {
      return;
    }

    const timer = setInterval(() => {
      dispatch({ type: "collectPassiveEssence", amount: eps });
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch, eps]);

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

  useEffect(() => {
    const timer = setInterval(() => {
      if (state.phase === "journey" && state.tutorialCompleted && state.lastLoginRewardDate === getTodayKeyForUi() && !effectiveReturnPresence?.active && !state.journeyEvents.activeEventId && Date.now() >= state.journeyEvents.nextEventAt) {
        dispatch({ type: "triggerJourneyEvent" });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch, state.phase, state.tutorialCompleted, state.lastLoginRewardDate, effectiveReturnPresence?.active, state.journeyEvents.activeEventId, state.journeyEvents.nextEventAt]);

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

  const tapDragon = () => {
    const criticalTapChance = getCriticalTapChance(state);
    const criticalTap = Math.random() < criticalTapChance;
    const gain = criticalTap ? tapEssence * 2 : tapEssence;
    runHaptic(() => Haptics.impactAsync(criticalTap ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light));
    playGameSound(criticalTap ? "criticalTap" : "tap");
    dispatch({ type: "tapDragon", amount: gain });
    setFloatingReward({ id: Date.now(), text: criticalTap ? `Critical Tap! +${formatGameNumber(gain, numberFormat)}` : `+${formatGameNumber(gain, numberFormat)} Essence` });
  };

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
    state.dailyGoals.tapDragon50.progress,
    state.dailyGoals.completeQuest5.progress,
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
        backgroundSource={__DEV__ && artValidationMode.enabled ? artValidationBackgrounds[artValidationMode.backgroundKey].source : sceneImages.forest}
        floatingText={floatingReward?.text}
        floatingTextKey={floatingReward?.id}
        showEvolutionBurst={burstKey > 0 && !state.settings.reducedMotion}
        dragonStage={state.dragon.stage}
        reducedMotion={state.settings.reducedMotion}
        tapBounceScale={nearEvolutionExcitement ? BALANCE.softProgressionAssist.excitedTapBounceScale : BALANCE.softProgressionAssist.baseTapBounceScale}
        anticipationLevel={effectiveAnticipationLevel}
        returnPresencePhase={effectiveReturnPresence?.active ? returnPresencePhase : null}
        evolutionMomentPhase={evolutionMomentPhase}
        behaviorElement={effectiveIdleElement}
        artValidationMode={artValidationMode}
        onTap={tapDragon}
      >
        {!state.settings.reducedMotion && (!__DEV__ || !artValidationMode.enabled || !artValidationMode.disableAura) ? <ParticleField color={theme.secondary} count={10} /> : null}
        {!__DEV__ || !artValidationMode.enabled || artValidationMode.hudVisible ? (
          <HudBar
            essence={formatGameNumber(state.player.essence, numberFormat)}
            eps={`+${formatGameNumber(eps, numberFormat)}`}
            souls={formatGameNumber(state.dragonSouls, numberFormat)}
            onLongPress={__DEV__ ? () => setShowDebugPanel(true) : undefined}
          />
        ) : null}

        <View style={styles.mainDragonInfo}>
          <Text style={[styles.mainDragonName, { color: theme.secondary }]}>{form.name}</Text>
          <Text style={styles.mainDragonMeta}>
            {theme.label} | {state.dragon.stage.toUpperCase()}
          </Text>
          <Text style={styles.mainTapHint}>Tap dragon for +{formatGameNumber(tapEssence, numberFormat)} essence</Text>
        </View>

        {effectiveReturnPresence?.active ? <ReturnPresenceToast state={state} presence={effectiveReturnPresence} phase={returnPresencePhase} /> : null}
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
        {state.lastLoot && !effectiveReturnPresence?.active ? <LootPopup key={state.lastLoot.id} event={state.lastLoot} /> : null}

        <BottomNav
          activePanel={activePanel}
          onSelect={(panel) => {
            setActivePanel(panel);
            if (__DEV__ && state.guidedPlaytest.active && panel === "goals") {
              dispatch({ type: "completeGuidedPlaytestSteps", stepIds: ["openGoals"] });
            }
            if (__DEV__ && state.guidedPlaytest.active && panel === "rebirth") {
              dispatch({ type: "completeGuidedPlaytestSteps", stepIds: ["openRebirth"] });
            }
          }}
        />
        <PanelSheet title={getPanelTitle(activePanel)} visible={activePanel !== null} onClose={() => setActivePanel(null)}>
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
              questIntervalMs={questIntervalMs}
              onEquipItem={(itemId) => dispatch({ type: "equipItem", itemId })}
              onSellItem={(itemId) => dispatch({ type: "sellItem", itemId })}
            />
          ) : null}
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
          visible={!state.tutorialCompleted}
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
        <DailyLoginRewardModal visible={state.lastLoginRewardDate !== getTodayKeyForUi()} state={state} onClaim={claimDailyLoginReward} />
        <JourneyEventModal state={state} dispatch={dispatch} />
      </DragonDisplay>
    </Animated.View>
  );
}

function getPanelTitle(panel: IdlePanelKey | null) {
  switch (panel) {
    case "upgrades":
      return "Upgrades";
    case "adventure":
      return "Adventure";
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

  if ((state.dailyGoals.tapDragon50?.progress ?? 0) >= 20) {
    completed.push("tap20");
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

function HudBar({ essence, eps, souls, onLongPress }: { essence: string; eps: string; souls: string; onLongPress?: () => void }) {
  return (
    <Pressable style={styles.hudBar} onLongPress={onLongPress} delayLongPress={850}>
      <StatPill icon="✦" label="Essence" value={essence} large />
      <StatPill icon="⏱" label="EPS" value={eps} />
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
    { key: "upgrades", label: "Upgrades", icon: "⬆" },
    { key: "adventure", label: "Adventure", icon: "⚔" },
    { key: "goals", label: "Goals", icon: "★" },
    { key: "rebirth", label: "Rebirth", icon: "◆" },
    { key: "settings", label: "Settings", icon: "⚙" }
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
    { label: "Tap gain", value: `${formatGameNumber(getTapEssence(state), numberFormat)} essence` },
    { label: "EPS", value: `${formatGameNumber(getEssencePerSecond(state), numberFormat)}` },
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
    "Tap essence works",
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
      tapGain: getTapEssence(state),
      essencePerSecond: getEssencePerSecond(state),
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
    earth: ""
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
                source={getDragonStageImage("hatchling", reviewElement)}
                reducedMotion={reducedMotion}
                validationMode={reviewValidationMode}
              />
              <DrakeContinuityCard
                title="Integrated Drake"
                element={reviewElement}
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
  source,
  reducedMotion,
  validationMode
}: {
  title: string;
  element: DragonElement;
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
      <Pressable onPress={addNote} disabled={!noteText.trim()} style={[styles.primaryPanelButton, !noteText.trim() && styles.disabledUpgradeCard]}>
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
      <Pressable onPress={() => dispatch({ type: "completeGuidedPlaytestSteps", stepIds: ["exportNotes"] })} style={styles.primaryPanelButton}>
        <Text style={styles.primaryPanelButtonText}>Export Playtest Notes</Text>
      </Pressable>
      <TextInput value={exportText} editable={false} multiline style={styles.backupTextInput} />

      <Pressable onPress={clearNotes} disabled={state.playtestNotes.length === 0} style={[styles.dangerButton, state.playtestNotes.length === 0 && styles.disabledUpgradeCard]}>
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
      <Pressable onPress={onToggle} style={[styles.toggleTrack, enabled && styles.toggleTrackOn]}>
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
          <Text style={styles.choiceNumber}>Journey Event</Text>
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

function formatGameNumber(value: number, numberFormat: GameSettings["numberFormat"]) {
  if (numberFormat === "full") {
    return Number.isInteger(value) ? `${value}` : value.toFixed(1);
  }
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (absolute >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (absolute >= 10_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
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
  questIntervalMs,
  onEquipItem,
  onSellItem
}: {
  state: GameState;
  questIntervalMs: number;
  onEquipItem: (itemId: string) => void;
  onSellItem: (itemId: string) => void;
}) {
  return (
    <>
      <SectionCard title="Auto Battle" subtitle={`${state.autoBattle.enemyName} | Defeated ${state.autoBattle.defeatedCount}`}>
        <AutoBattleSummary state={state} />
      </SectionCard>
      <SectionCard title="Quest Progress" subtitle={`${areaDefinitions[state.currentArea].name} | Auto quest: ${questIntervalMs / 1000}s`}>
        <QuestProgressList state={state} />
      </SectionCard>
      <SectionCard title="Treasures">
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
  const capped = isIdleUpgradeCapped(state, upgradeId);
  const cost = getIdleUpgradeCost(state, upgradeId);
  const disabled = state.player.essence < cost || capped;

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
        <Text style={styles.idleUpgradeName}>{upgrade.name}</Text>
        <Text style={styles.idleUpgradeLevel}>
          Level {formatGameNumber(level, state.settings.numberFormat)}/{formatGameNumber(cap, state.settings.numberFormat)}
        </Text>
        <Text style={styles.idleUpgradeBonus}>+{formatGameNumber(upgrade.epsBonus, state.settings.numberFormat)} EPS</Text>
        <Text style={styles.idleUpgradeCost}>{capped ? "Evolve to unlock more levels" : `${formatGameNumber(cost, state.settings.numberFormat)} Essence`}</Text>
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
      <Text style={styles.lootPopupTitle}>{event.equipmentId ? "Equipment Found!" : event.treasureId ? "Treasure Found!" : event.shard ? "Shard Found!" : "Quest Progress"}</Text>
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

function Resource({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.resource}>
      <Text style={styles.resourceLabel}>{label}</Text>
      <Text style={styles.resourceValue}>{value}</Text>
    </View>
  );
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
      <View style={styles.row}>
        <PrimaryButton label="Start Adventure" onPress={() => dispatch({ type: "setScreen", screen: "adventure" })} />
        <SecondaryButton label="Upgrade" onPress={() => dispatch({ type: "setScreen", screen: "upgrade" })} />
      </View>
    </View>
  );
}

function AdventureScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  const run = state.adventureRun;
  const displayElement = state.dragon.element ?? "fire";
  const theme = elementTheme[displayElement];
  const pendingNode = run?.pendingNodeId ? getAdventureNodeById(run.pendingNodeId) : null;
  const heroScene = pendingNode?.scene ?? run?.nodes[0]?.scene ?? (run?.status === "complete" ? "boss" : "forest");

  return (
    <View>
      <Text style={styles.sectionTitle}>Adventure Map</Text>
      <ImageBackground source={sceneImages[heroScene]} style={styles.mapHero} imageStyle={styles.mapHeroImage}>
        <LinearGradient colors={["rgba(8,6,17,0.12)", "rgba(8,6,17,0.96)"]} style={styles.mapHeroOverlay}>
          <View style={styles.mapHeroTopRow}>
            <Text style={styles.choiceNumber}>{run ? `Step ${run.step} / ${run.maxSteps}` : "No active run"}</Text>
            <View style={[styles.mapElementPill, { backgroundColor: theme.primary }]}>
              <Text style={styles.elementChipText}>{theme.label}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.mapTitle}>{run?.status === "complete" ? "Rift Cleared" : run?.status === "failed" ? "Run Failed" : "Choose Your Route"}</Text>
            <Text style={styles.bodyText}>
              {run?.message ?? "Start a run to pick routes, discover events, gather treasure, and challenge the rift boss."}
            </Text>
          </View>
          {run?.status === "active" ? (
            <>
              <RouteTracker currentStep={run.step} maxSteps={run.maxSteps} clearedSteps={run.visitedNodeIds.length} />
              <ProgressBar progress={(run.step - 1) / run.maxSteps} color={theme.primary} label={`${run.visitedNodeIds.length} nodes cleared`} />
            </>
          ) : null}
        </LinearGradient>
      </ImageBackground>

      {!run || run.status === "failed" || run.status === "complete" ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{run?.status === "complete" ? "Claim another legend" : "Begin a run"}</Text>
          <Text style={styles.bodyText}>
            A run is five steps long. Choose safer events for growth or risky fights for bigger rewards before the boss.
          </Text>
          <PrimaryButton label={run?.status === "complete" ? "Start New Run" : "Start Adventure Run"} onPress={() => dispatch({ type: "startAdventureRun" })} />
        </View>
      ) : pendingNode ? (
        <EventChoicePanel node={pendingNode} dispatch={dispatch} />
      ) : (
        <View>
          <Text style={styles.subsectionTitle}>Available Routes</Text>
          {run.nodes.map((node) => (
            <AdventureNodeCard key={node.id} node={node} dispatch={dispatch} />
          ))}
        </View>
      )}
    </View>
  );
}

function AdventureNodeCard({ node, dispatch }: { node: AdventureNode; dispatch: (action: GameAction) => void }) {
  const entry = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const theme = elementTheme[node.element ?? "fire"];
  const encounter = encounters.find((item) => item.id === node.encounterId);
  const reward = formatAdventureReward(node.reward);
  const isHighStakes = node.kind === "elite" || node.kind === "boss";

  useEffect(() => {
    Animated.timing(entry, { toValue: 1, duration: 360, useNativeDriver: true }).start();
  }, [entry]);

  useEffect(() => {
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
  }, [isHighStakes, pulse]);

  const translateY = entry.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  return (
    <Animated.View style={{ opacity: entry, transform: [{ translateY }, { scale: glowScale }] }}>
      <Pressable
        onPress={() => dispatch({ type: "selectAdventureNode", nodeId: node.id })}
        onPressIn={() => Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(pressScale, { toValue: 1, friction: 5, useNativeDriver: true }).start()}
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

function BattleScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  const battle = state.lastBattle;
  const continueScreen: ScreenKey = state.adventureRun?.status === "complete" ? "den" : "adventure";

  if (!battle) {
    return (
      <View>
        <Text style={styles.sectionTitle}>Battle Log</Text>
        <Text style={styles.bodyText}>No battle yet. Start an adventure to test your dragon.</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>{battle.won ? (battle.nodeKind === "boss" ? "Boss Defeated" : "Victory") : "Retreat"}</Text>
      <View style={styles.panel}>
        <Text style={styles.choiceNumber}>{battle.nodeKind ? getNodeKindLabel(battle.nodeKind) : "Battle"}</Text>
        <Text style={styles.panelTitle}>{battle.title ?? battle.encounter.name}</Text>
        <Text style={styles.bodyText}>
          Your HP: {battle.playerHp} | Enemy HP: {battle.enemyHp}
        </Text>
        {battle.won ? (
          <Text style={styles.rewardText}>
            Gained {battle.rewardSummary ?? `${battle.encounter.rewardGold} gold, ${battle.encounter.rewardEssence} essence, ${battle.encounter.rewardXp} XP`}
          </Text>
        ) : (
          <Text style={styles.hintText}>Upgrade your dragon or buy a den item before trying again.</Text>
        )}
        {state.adventureRun?.message ? <Text style={styles.hintText}>{state.adventureRun.message}</Text> : null}
      </View>
      <View style={styles.panel}>
        {battle.rounds.map((round, index) => (
          <Text key={`${round}-${index}`} style={styles.logLine}>
            {round}
          </Text>
        ))}
      </View>
      <PrimaryButton label={continueScreen === "den" ? "Return to Den" : "Continue Run"} onPress={() => dispatch({ type: "setScreen", screen: continueScreen })} />
    </View>
  );
}

function UpgradeScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  const stats = Object.keys(state.dragon.stats) as Array<keyof Stats>;

  return (
    <View>
      <Text style={styles.sectionTitle}>Train the Dragon</Text>
      {stats.map((stat) => {
        const cost = getUpgradeCost(state, stat);
        return (
          <View key={stat} style={styles.upgradeRow}>
            <View>
              <Text style={styles.upgradeName}>{formatStat(stat)}</Text>
              <Text style={styles.hintText}>Current: {state.dragon.stats[stat]}</Text>
            </View>
            <Pressable
              onPress={() => dispatch({ type: "buyUpgrade", stat })}
              disabled={state.player.gold < cost}
              style={[styles.buyButton, state.player.gold < cost && styles.disabledButton]}
            >
              <Text style={styles.buyButtonText}>{cost}g</Text>
            </Pressable>
          </View>
        );
      })}
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

function StatsGrid({ stats, compact = false }: { stats: Stats; compact?: boolean }) {
  return (
    <View style={[styles.statsGrid, compact && styles.compactStats]}>
      {(Object.keys(stats) as Array<keyof Stats>).map((stat) => (
        <View key={stat} style={styles.statCard}>
          <Text style={styles.statValue}>{stats[stat]}</Text>
          <Text style={styles.statLabel}>{formatStat(stat)}</Text>
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
  return stat[0].toUpperCase() + stat.slice(1);
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
    reward.evolution ? `${reward.evolution}% evo` : null,
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
  const scores: Record<DragonElement, number> = { fire: 0, water: 0, earth: 0 };

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
  subtitle: {
    color: "#dacff8",
    fontSize: 14,
    marginTop: 2
  },
  resetButton: {
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  resetText: {
    color: "#f5ddff",
    fontWeight: "700"
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
  mainDragonInfo: {
    alignItems: "center",
    left: 18,
    position: "absolute",
    right: 18,
    top: 100,
    zIndex: 12
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
  bottomNav: {
    backgroundColor: uiTheme.colors.panelStrong,
    borderColor: uiTheme.colors.borderStrong,
    borderRadius: 26,
    borderWidth: 1,
    bottom: 20,
    flexDirection: "row",
    gap: 7,
    left: 14,
    padding: 8,
    position: "absolute",
    right: 14,
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
    borderRadius: uiTheme.radius.md,
    flex: 1,
    paddingVertical: 10
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
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 2
  },
  bottomNavText: {
    color: uiTheme.colors.muted,
    fontSize: 11,
    fontWeight: "900"
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
  swirlRing: {
    borderRadius: 150,
    borderRightColor: "transparent",
    borderTopColor: "transparent",
    borderWidth: 3,
    height: 250,
    position: "absolute",
    width: 250
  },
  swirlRingAlt: {
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    borderRadius: 124,
    borderWidth: 2,
    height: 208,
    opacity: 0.78,
    position: "absolute",
    width: 208
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
  evolutionRing: {
    borderRadius: 180,
    borderWidth: 4,
    height: 320,
    position: "absolute",
    width: 320
  },
  evolutionRingLarge: {
    borderRadius: 220,
    borderWidth: 2,
    height: 390,
    position: "absolute",
    width: 390
  },
  focusEggWrap: {
    alignItems: "center",
    height: 250,
    justifyContent: "center",
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
  shellShardClip: {
    borderRadius: 18,
    height: 72,
    left: "50%",
    overflow: "hidden",
    position: "absolute",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 8,
    top: "50%",
    width: 72,
    zIndex: 5
  },
  shellShardImage: {
    height: 250,
    width: 250
  },
  shellShardTop: {
    height: 66,
    marginLeft: -36,
    marginTop: -118,
    width: 72
  },
  shellShardTopImage: {
    marginLeft: -89,
    marginTop: -7
  },
  shellShardUpperLeft: {
    height: 78,
    marginLeft: -94,
    marginTop: -78,
    width: 78
  },
  shellShardUpperLeftImage: {
    marginLeft: -31,
    marginTop: -47
  },
  shellShardUpperRight: {
    height: 78,
    marginLeft: 16,
    marginTop: -76,
    width: 78
  },
  shellShardUpperRightImage: {
    marginLeft: -141,
    marginTop: -49
  },
  shellShardMidLeft: {
    height: 86,
    marginLeft: -106,
    marginTop: -10,
    width: 82
  },
  shellShardMidLeftImage: {
    marginLeft: -19,
    marginTop: -115
  },
  shellShardMidRight: {
    height: 86,
    marginLeft: 24,
    marginTop: -6,
    width: 82
  },
  shellShardMidRightImage: {
    marginLeft: -149,
    marginTop: -119
  },
  brokenShellDarkCore: {
    backgroundColor: "#030104",
    borderRadius: 48,
    height: 82,
    position: "absolute",
    width: 92,
    zIndex: 3
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
  crackLayer: {
    height: 190,
    position: "absolute",
    width: 150,
    zIndex: 2
  },
  missingShellGap: {
    backgroundColor: "#020104",
    borderRadius: 10,
    position: "absolute"
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
  crackSegmentMask: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  crackLine: {
    backgroundColor: "#050307",
    borderRadius: 999,
    position: "absolute",
    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 2
  },
  crackMain: {
    height: 78,
    left: 72,
    top: 28,
    transform: [{ rotate: "8deg" }],
    width: 5
  },
  crackBranchOne: {
    height: 42,
    left: 58,
    top: 72,
    transform: [{ rotate: "-42deg" }],
    width: 4
  },
  crackBranchTwo: {
    height: 50,
    left: 86,
    top: 72,
    transform: [{ rotate: "44deg" }],
    width: 4
  },
  crackLower: {
    height: 48,
    left: 72,
    top: 102,
    transform: [{ rotate: "-8deg" }],
    width: 5
  },
  crackWide: {
    height: 58,
    left: 42,
    top: 118,
    transform: [{ rotate: "58deg" }],
    width: 4
  },
  crackTop: {
    height: 50,
    left: 76,
    top: 18,
    transform: [{ rotate: "-30deg" }],
    width: 4
  },
  crackShard: {
    height: 40,
    left: 102,
    top: 118,
    transform: [{ rotate: "-52deg" }],
    width: 4
  },
  crackCore: {
    backgroundColor: "#030104",
    borderRadius: 22,
    height: 42,
    left: 56,
    position: "absolute",
    top: 82,
    transform: [{ rotate: "18deg" }],
    width: 38
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
  }
});
