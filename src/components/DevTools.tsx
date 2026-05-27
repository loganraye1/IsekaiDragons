import { useState } from "react";
import { Alert, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, type ImageSourcePropType, useWindowDimensions, View } from "react-native";
import {
  idleUpgradeOrder,
  treasureOrder,
  idleQuestOrder,
  areaDefinitions,
  getQuestRewardMultiplier,
  getBattleDamage,
  getTreasureDropChance,
  getUpgradeCostMultiplier,
  getOfflineRewardMultiplier,
  getEvolutionProgressRatio,
  getNextEvolutionCost,
  getBattleRewardEssence,
  getDragonPower,
  getReincarnationSoulsGained,
} from "../game";
import { BALANCE } from "../balance";
import { elementTheme } from "../content";
import { APP_VERSION, uiTheme } from "../constants/theme";
import { artValidationBackgrounds, getDragonStageImage, drakeImages } from "../constants/assets";
import { HATCHLING_ART_VERSION } from "../artVersion";
import DragonDisplay, { type ArtValidationMode, defaultArtValidationMode, type EvolutionMomentPhase } from "./DragonDisplay";
import { SectionCard, EmptyState } from "./DenScreen";
import type { DragonElement, DragonStage, GameAction, GameSettings, GameState } from "../types";
import { formatGameNumber, formatMultiplier, formatPercent } from "../utils/format";

// ─── Exported constant ───────────────────────────────────────────────────────

export const guidedPlaytestSteps = [
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

// ─── Local constants ─────────────────────────────────────────────────────────

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

// ─── Local utilities ─────────────────────────────────────────────────────────

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

// ─── Components ──────────────────────────────────────────────────────────────

export function getAutoCompletedGuidedStepIds(state: GameState) {
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

export function GuidedPlaytestOverlay({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
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

export function BalanceDebugPanel({
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

export function TestChecklist() {
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

export function createBalanceSnapshotExport(state: GameState) {
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

export function DevToggleButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={active ? styles.dangerButton : styles.presenceTestButton}>
      <Text style={active ? styles.dangerButtonText : styles.primaryPanelButtonText}>{label}</Text>
    </Pressable>
  );
}

export function HatchlingReviewModal({
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
              <Text style={styles.reviewCheckText}>"I want to check on this dragon later."</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export function getHatchlingReviewPrompt(element: DragonElement) {
  if (element === "fire") {
    return "Check chaotic-gremlin charm, horn silhouette, eye readability, and whether the pose feels mischievous rather than aggressive.";
  }
  if (element === "water") {
    return "Check sleepy companion appeal, fin silhouette, soft eye read, and whether the shape survives grayscale.";
  }
  return "Check cozy guardian warmth, crystal shoulder clarity, sturdy silhouette, and whether details stay simple at phone size.";
}

export function DrakeContinuityReviewPanel({ reducedMotion }: { reducedMotion: boolean }) {
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

export function DrakeContinuityCard({
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

export function getDrakeContinuityPrompt(element: DragonElement) {
  if (element === "fire") {
    return "Target: chaotic ambition becomes confident pride. Preserve forward-curving horns, energetic posture, and mischievous confidence.";
  }
  if (element === "water") {
    return "Target: dreamy mysticism becomes graceful wisdom. Preserve flowing fins, sleepy softness, and calm drifting posture.";
  }
  return "Target: stubborn comfort becomes dependable protection. Preserve crystal shoulder masses, grounded posture, and warm guardian energy.";
}

export function PlaytestNotesPanel({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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
  disabledUpgradeCard: {
    opacity: 0.48
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
  drakeContinuityPair: {
    gap: 10,
    paddingVertical: 8
  },
  equipmentSubhead: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
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
  guidedPlaytestHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  guidedPlaytestList: {
    maxHeight: 152
  },
  guidedPlaytestListContent: {
    gap: 6
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
  guidedPlaytestProgress: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900"
  },
  guidedPlaytestRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
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
  guidedPlaytestTitle: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900"
  },
  hatchlingApprovalLabel: {
    color: uiTheme.colors.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: "uppercase"
  },
  hatchlingFocusCard: {
    paddingRight: 10
  },
  hatchlingFocusDisplayWrap: {
    height: 330,
    marginTop: 10
  },
  hatchlingReviewCard: {
    backgroundColor: "rgba(255,255,255,0.055)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: uiTheme.radius.lg,
    borderWidth: 1,
    padding: 10,
    width: 220
  },
  hatchlingReviewDisplayWrap: {
    height: 230
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
  hatchlingReviewModal: {
    backgroundColor: uiTheme.colors.ink,
    flex: 1
  },
  hatchlingReviewModalContent: {
    gap: 12,
    padding: 16,
    paddingBottom: 38
  },
  hatchlingReviewModalTitle: {
    color: uiTheme.colors.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4
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
  hatchlingReviewRow: {
    gap: 12,
    paddingVertical: 12
  },
  hatchlingReviewTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center"
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
  playtestNoteRow: {
    backgroundColor: "rgba(255,255,255,0.075)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    padding: 11
  },
  playtestNotesList: {
    maxHeight: 240
  },
  playtestNotesListContent: {
    gap: 8
  },
  playtestNotesPanel: {
    gap: 12
  },
  presenceTestButton: {
    alignItems: "center",
    backgroundColor: uiTheme.colors.gold,
    borderRadius: uiTheme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10
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
  reviewChecklistGroup: {
    gap: 4
  },
  reviewChecklist: {
    gap: 10,
    marginTop: 8
  },
  reviewCheckMark: {
    color: uiTheme.colors.gold,
    fontSize: 15,
    fontWeight: "900",
    width: 18
  },
  reviewCheckRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 3
  },
  reviewCheckText: {
    color: uiTheme.colors.text,
    flex: 1,
    fontSize: 12,
    fontWeight: "800"
  },
  reviewToggleRow: {
    gap: 8,
    marginTop: 12
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
  testChecklist: {
    gap: 8
  },
  testChecklistBox: {
    color: "#f8d987",
    fontSize: 16,
    fontWeight: "900"
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
