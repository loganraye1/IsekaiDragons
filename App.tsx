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
  getOfflineGoldReward,
  getOfflineRewardMultiplier,
  getQuestRewardMultiplier,
  getQuestIntervalMs,
  getDragonSoulMultiplier,
  getTreasureDropChance,
  getBattleDamage,
  getBattleRewardGold,
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
import AdventureScreen, { AdventureJourneyScene, CapybaraAdventureBoard } from "./src/components/AdventureScreen";
import DenScreen, { SectionCard, EmptyState, PrimaryButton, StatsPanelContent, UpgradesPanelContent, AdventurePanelContent, GoalsPanelContent, RebirthPanelContent, EvolutionChoiceModal, ReincarnationConfirmModal } from "./src/components/DenScreen";
import { OnboardingModal, DailyLoginRewardModal, JourneyEventModal, AchievementsModal, DailyGoalsModal, LootPopup, ReturnPresenceToast, PresenceDebugOverlay, PresenceVisualCue, type PresenceTestOverrides } from "./src/components/Modals";
import { getAutoCompletedGuidedStepIds, GuidedPlaytestOverlay, BalanceDebugPanel, TestChecklist, createBalanceSnapshotExport, DevToggleButton, HatchlingReviewModal, DrakeContinuityReviewPanel, PlaytestNotesPanel, guidedPlaytestSteps } from "./src/components/DevTools";
import HatchlingJourneyStage from "./src/components/HatchlingJourneyStage";
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
    reward: "+28 gold, +5 gold",
    enemy: "boar"
  },
  {
    title: "Reach the first dragon shrine",
    description: "A willow wisp tests whether the hatchling can focus its breath.",
    reward: "+10 gold, +8% evolution",
    enemy: "wisp"
  },
  {
    title: "Challenge the rift path",
    description: "The rift chimera appears as the first true boss objective.",
    reward: "+50 XP, +25 gold",
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
        const offlineReward = getOfflineGoldReward(stateRef.current, awayDurationMs);
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
