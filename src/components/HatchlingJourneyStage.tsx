import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  Animated,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type ImageSourcePropType,
  View
} from "react-native";
import {
  dragonPathDefinitions,
  getQuestIntervalMs,
  getNextEvolutionCost,
  getEvolutionProgressRatio,
  isNearEvolutionExcitement,
  getDragonForm,
  getIdleUpgradeCost,
  isIdleUpgradeCapped,
  getOfflineEssenceReward
} from "../game";
import { clearGameState } from "../storage";
import { BALANCE } from "../balance";
import { elementTheme, eggChoices } from "../content";
import { APP_VERSION, tabs, uiTheme } from "../constants/theme";
import { type ArtValidationBackgroundKey, artValidationBackgrounds, elementDenBackgrounds, getDragonStageImage, eggImages, sceneImages } from "../constants/assets";
import {
  evolutionPreviewElements,
  evolutionPreviewStages,
  getEvolutionPreviewElement,
  type EvolutionPreviewElementId,
  type EvolutionPreviewOption,
  type EvolutionPreviewStageId
} from "../evolutionPreview";
import DragonDisplay, { type AnticipationLevel, type ReturnPresencePhase, type EvolutionMomentPhase, type DragonPathRevealAccent, type ArtValidationMode, defaultArtValidationMode } from "./DragonDisplay";
import BattleScreen from "./BattleScreen";
import AdventureScreen, { AdventureJourneyScene } from "./AdventureScreen";
import { SectionCard, PrimaryButton, StatsPanelContent, UpgradesPanelContent, AdventurePanelContent, GoalsPanelContent, RebirthPanelContent, EvolutionChoiceModal, ReincarnationConfirmModal } from "./DenScreen";
import { OnboardingModal, DailyLoginRewardModal, JourneyEventModal, ReturnPresenceToast, PresenceDebugOverlay, PresenceVisualCue, LootPopup, type PresenceTestOverrides } from "./Modals";
import { BalanceDebugPanel, GuidedPlaytestOverlay, getAutoCompletedGuidedStepIds, guidedPlaytestSteps, DrakeContinuityReviewPanel, HatchlingReviewModal, DevToggleButton, PlaytestNotesPanel, createBalanceSnapshotExport, TestChecklist } from "./DevTools";
import { SafeExpoImage } from "../ui/SafeMedia";
import ParticleField from "../ui/ParticleField";
import type { DragonElement, DragonPathId, DragonStage, EvolutionTraitId, GameAction, GameSettings, GameState, IdleUpgradeId, ScreenKey } from "../types";
import { formatGameNumber, formatMultiplier, formatPercent, getTodayKeyForUi, isValidBackupState, getLeadingEggElement, shouldShowLootPopup } from "../utils/format";

type GameSoundEvent = "tap" | "criticalTap" | "upgrade" | "evolve" | "treasureDrop" | "gearDrop" | "reincarnate" | "dailyReward";

function playGameSound(_event: GameSoundEvent) {
  // Sound-ready hook: wire Expo AV or another audio layer here when assets exist.
}

export function getDragonPathTradeoffCopy(path: (typeof dragonPathDefinitions)[DragonPathId]) {
  const offense = Math.round(path.battleModifier.damageMultiplier * 100);
  const mitigation = Math.round(path.battleModifier.damageReduction * 100);
  return `Offense ${offense}% | Mitigation ${mitigation}% | Tempo ${path.battleModifier.tempoLabel}`;
}

export function getDragonPathEvolutionRevealLine(path: (typeof dragonPathDefinitions)[DragonPathId]) {
  const offense = Math.round(path.battleModifier.damageMultiplier * 100);
  const mitigation = Math.round(path.battleModifier.damageReduction * 100);
  return `${path.name} awakened: ${path.combatVerb} now ${path.battleModifier.tempoLabel} (${offense}% power / ${mitigation}% mitigation).`;
}

export function getDragonPathRevealAccent(path: (typeof dragonPathDefinitions)[DragonPathId]): DragonPathRevealAccent {
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

export function DragonPathBadge({ pathId, element }: { pathId: DragonPathId; element: DragonElement }) {
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


export default function HatchlingJourneyStage({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
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

export function getPanelTitle(panel: IdlePanelKey | null) {
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


export function HudBar({ essence, souls, onLongPress }: { essence: string; souls: string; onLongPress?: () => void }) {
  return (
    <Pressable style={styles.hudBar} onLongPress={onLongPress} delayLongPress={850}>
      <StatPill icon="✦" label="Essence" value={essence} large />
      <StatPill icon="◆" label="Souls" value={souls} />
    </Pressable>
  );
}

export function StatPill({ icon, label, value, large = false }: { icon?: string; label: string; value: number | string; large?: boolean }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillLabel}>{icon ? `${icon} ${label}` : label}</Text>
      <Text style={[styles.statPillValue, large && styles.statPillValueLarge]}>{value}</Text>
    </View>
  );
}

export function BottomNav({ activePanel, onSelect }: { activePanel: IdlePanelKey | null; onSelect: (panel: IdlePanelKey) => void }) {
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

export function EvolutionTreePreviewPanel({ currentElement }: { currentElement: DragonElement }) {
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

export function getEvolutionPreviewOptionsForStage(branch: { drakeImage: ImageSourcePropType; label: string; youngOptions: EvolutionPreviewOption[]; dragonOptions: EvolutionPreviewOption[]; ancientOptions: EvolutionPreviewOption[] }, stage: EvolutionPreviewStageId): EvolutionPreviewOption[] {
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

export function EvolutionPreviewOptionTile({ option, accent }: { option: EvolutionPreviewOption; accent: string }) {
  return (
    <View style={[styles.evolutionPreviewOptionTile, { borderColor: `${accent}66` }]}>
      <SafeExpoImage source={option.image} style={styles.evolutionPreviewOptionImage} contentFit="contain" />
      <Text style={styles.evolutionPreviewOptionLabel}>{option.label}</Text>
    </View>
  );
}

export function PanelSheet({ title, visible, onClose, children }: { title: string; visible: boolean; onClose: () => void; children: ReactNode }) {
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


export function SettingsPanelContent({
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


export function SettingToggle({
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

export function TabBar({ active, dispatch }: { active: ScreenKey; dispatch: (action: GameAction) => void }) {
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

export function EggScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
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

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: "#fff8ef"
  },
  activeTabText: {
    color: "#160c2f"
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
  answerDescription: {
    color: "#cfc5ee",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4
  },
  answerImage: {
    borderRadius: 18
  },
  answerImageBackground: {
    flex: 1,
    justifyContent: "flex-end",
    minHeight: 112
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
  bodyText: {
    color: "#d8cfef",
    fontSize: 14,
    lineHeight: 21
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
  choiceNumber: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 4,
    textTransform: "uppercase"
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
  debugLabel: {
    color: "#b9aee3",
    fontSize: 12,
    fontWeight: "900"
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
  debugRows: {
    gap: 9,
    paddingBottom: 14
  },
  debugSectionLabel: {
    color: uiTheme.colors.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 6,
    textTransform: "uppercase"
  },
  debugValue: {
    color: "#f8d987",
    fontSize: 14,
    fontWeight: "900"
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
  dragonPathBadgeCombat: {
    color: uiTheme.colors.info,
    fontSize: 9,
    fontWeight: "900",
    lineHeight: 12,
    marginTop: 3,
    textAlign: "center"
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
  eggHeroText: {
    color: "#fff8ef",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 4
  },
  eggHeroTitle: {
    fontSize: 28,
    fontWeight: "900"
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
  evolutionPreviewBranchFantasy: {
    color: uiTheme.colors.faint,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
    textAlign: "center"
  },
  evolutionPreviewBranchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
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
  evolutionPreviewContactSheet: {
    height: 360,
    marginTop: 10,
    width: "100%"
  },
  evolutionPreviewContactSheetPanel: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 22,
    borderWidth: 1,
    padding: 12
  },
  evolutionPreviewElementTab: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  evolutionPreviewElementTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  evolutionPreviewElementText: {
    color: uiTheme.colors.muted,
    fontSize: 13,
    fontWeight: "900"
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
  evolutionPreviewHeroImage: {
    alignSelf: "center",
    height: 190,
    width: 160
  },
  evolutionPreviewHeroKicker: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  evolutionPreviewHeroNote: {
    color: uiTheme.colors.gold,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4
  },
  evolutionPreviewHeroText: {
    color: uiTheme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19
  },
  evolutionPreviewHeroTitle: {
    color: uiTheme.colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  evolutionPreviewKicker: {
    color: uiTheme.colors.gold,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase"
  },
  evolutionPreviewOptionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10
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
  evolutionPreviewOptionPanel: {
    backgroundColor: "rgba(8,6,17,0.45)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 22,
    borderWidth: 1,
    padding: 12
  },
  evolutionPreviewOptionTile: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 128,
    padding: 8,
    width: "47%"
  },
  evolutionPreviewOptionTitle: {
    color: uiTheme.colors.text,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 4
  },
  evolutionPreviewPanel: {
    gap: 16,
    paddingBottom: 18
  },
  evolutionPreviewStageCaption: {
    color: uiTheme.colors.faint,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3
  },
  evolutionPreviewStageLabel: {
    color: uiTheme.colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  evolutionPreviewStageTab: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 124,
    padding: 11
  },
  evolutionPreviewStageTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9
  },
  evolutionPreviewTitle: {
    color: uiTheme.colors.text,
    fontSize: 26,
    fontWeight: "900"
  },
  guidedStage: {
    flex: 1,
    paddingBottom: 16
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
  importErrorText: {
    color: "#ff784f",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8
  },
  mainAdventurePathOverlay: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 20
  },
  mainDragonInfo: {
    alignItems: "center",
    bottom: 98,
    left: 16,
    position: "absolute",
    right: 16,
    zIndex: 12
  },
  mainDragonMeta: {
    color: uiTheme.colors.text,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 4,
    textTransform: "uppercase"
  },
  mainDragonName: {
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8
  },
  mainTapHint: {
    color: uiTheme.colors.muted,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "center"
  },
  panel: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 12,
    padding: 16
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
  panelMutedText: {
    color: uiTheme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18
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
  panelSheetContent: {
    gap: 12,
    paddingBottom: 38
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
  panelTitle: {
    color: "#fff8ef",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8
  },
  presenceTestButton: {
    alignItems: "center",
    backgroundColor: uiTheme.colors.gold,
    borderRadius: uiTheme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  presenceTestGrid: {
    gap: 8
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
  progressRewardCopy: {
    flex: 1
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
  scrollContent: {
    paddingBottom: 30
  },
  sectionTitle: {
    color: "#fff8ef",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8
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
  segmentedControl: {
    backgroundColor: "rgba(255,255,255,0.075)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 7
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
  sheetBackdrop: {
    backgroundColor: "rgba(0,0,0,0.48)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  sheetScrim: {
    flex: 1,
    justifyContent: "flex-end"
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
  tab: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 9
  },
  tabText: {
    color: "#d9cff5",
    fontWeight: "800"
  },
  tabs: {
    gap: 8,
    paddingBottom: 12
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
  traitText: {
    color: "#b9aee3",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4
  },
  traitTitle: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900"
  },
});
