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
import EggAwakeningStage from "./src/components/EggAwakeningStage";
import BattleScreen, { getAutoBattleEnemyImageKey, BattleTacticPreview } from "./src/components/BattleScreen";
import QuestScreen, { QuestProgressList } from "./src/components/QuestScreen";
import ShopScreen from "./src/components/ShopScreen";
import UpgradeScreen from "./src/components/UpgradeScreen";
import AdventureScreen, { AdventureJourneyScene, CapybaraAdventureBoard } from "./src/components/AdventureScreen";
import DenScreen, { SectionCard, EmptyState, PrimaryButton, StatsPanelContent, UpgradesPanelContent, AdventurePanelContent, GoalsPanelContent, RebirthPanelContent, EvolutionChoiceModal, ReincarnationConfirmModal } from "./src/components/DenScreen";
import { OnboardingModal, DailyLoginRewardModal, JourneyEventModal, AchievementsModal, DailyGoalsModal, LootPopup, ReturnPresenceToast, PresenceDebugOverlay, PresenceVisualCue, shouldShowLootPopup, type PresenceTestOverrides } from "./src/components/Modals";
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



type GameSoundEvent = "tap" | "criticalTap" | "upgrade" | "evolve" | "treasureDrop" | "gearDrop" | "reincarnate" | "dailyReward";

function playGameSound(_event: GameSoundEvent) {
  // Sound-ready hook: wire Expo AV or another audio layer here when assets exist.
}

type JourneyObjective = {
  title: string;
  description: string;
  reward: string;
  enemy?: EnemyImageKey;
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

function getDragonPathTradeoffCopy(path: (typeof dragonPathDefinitions)[DragonPathId]) {
  const offense = Math.round(path.battleModifier.damageMultiplier * 100);
  const mitigation = Math.round(path.battleModifier.damageReduction * 100);
  return `Offense ${offense}% | Mitigation ${mitigation}% | Tempo ${path.battleModifier.tempoLabel}`;
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

function formatBoost(boost: Partial<Stats>) {
  return Object.entries(boost)
    .map(([key, value]) => `+${value} ${formatStat(key as keyof Stats)}`)
    .join(", ");
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
  adventureDenTitle: {
    color: uiTheme.colors.text,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
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
  focusedCombatStopReward: {
    color: "#ffb347",
    fontSize: 11,
    fontWeight: "900"
  },
  nodeKind: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase"
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
