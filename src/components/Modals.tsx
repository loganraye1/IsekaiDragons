import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  achievementDefinitions,
  achievementOrder,
  dailyGoalDefinitions,
  dailyGoalOrder,
  dailyLoginRewardDefinitions,
  getPendingDailyLoginRewardDay,
  journeyEventDefinitions,
} from "../game";
import { elementTheme } from "../content";
import { uiTheme } from "../constants/theme";
import type { AnticipationLevel, ReturnPresencePhase } from "./DragonDisplay";
import type {
  DragonElement,
  GameAction,
  GameSettings,
  GameState,
  LootEvent,
} from "../types";
import { formatGameNumber, formatReward, formatDailyLoginReward, capitalizeElement, formatReturnPhase, formatPresenceAwayDuration, shouldShowLootPopup } from "../utils/format";

// ─── Exported type ───────────────────────────────────────────────────────────

export type PresenceTestOverrides = {
  idleElement: DragonElement | null;
  anticipationLevel: AnticipationLevel | null;
  returnPresence: GameState["returnPresence"] | null;
};



// ─── Components ──────────────────────────────────────────────────────────────

export function OnboardingModal({
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

export function DailyLoginRewardModal({ visible, state, onClaim }: { visible: boolean; state: GameState; onClaim: () => void }) {
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

export function JourneyEventModal({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
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
              const disabled = Boolean(choice.costGold && state.player.gold < choice.costGold);
              const costText = choice.costGold ? ` Cost: ${formatGameNumber(choice.costGold, numberFormat)} gold.` : "";
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

export function AchievementsModal({
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

export function DailyGoalsModal({
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

export function LootPopup({ event }: { event: LootEvent }) {
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

export function ReturnPresenceToast({ state, presence, phase }: { state: GameState; presence: GameState["returnPresence"]; phase: ReturnPresencePhase }) {
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

export function PresenceDebugOverlay({
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

export function PresenceVisualCue({
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  bodyText: {
    color: "#d8cfef",
    fontSize: 14,
    lineHeight: 21
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
  dailyLoginTrack: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 18
  },
  disabledUpgradeCard: {
    opacity: 0.48
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
  journeyEventChoice: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    borderWidth: 1,
    padding: 12
  },
  journeyEventChoices: {
    gap: 10,
    marginTop: 4
  },
  lockedRewardRow: {
    opacity: 0.65
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
  lootPopupText: {
    color: "#37265a",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
    textAlign: "center"
  },
  lootPopupTitle: {
    color: "#1e1235",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center"
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 16
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
  modalPrimaryButton: {
    backgroundColor: "#f8d987",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 11
  },
  modalScrim: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.62)",
    flex: 1,
    justifyContent: "center",
    padding: 20
  },
  modalSecondaryButton: {
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 11
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 6
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
  onboardingDots: {
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 18
  },
  onboardingText: {
    color: "#d8cfef",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 26,
    marginTop: 12
  },
  onboardingTitle: {
    color: "#fff8ef",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 6
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
  presenceDebugText: {
    color: uiTheme.colors.text,
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 14
  },
  presenceDebugTitle: {
    color: uiTheme.colors.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 3
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
  primaryPanelButtonText: {
    color: uiTheme.colors.goldDark,
    fontSize: 15,
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
  progressRewardCopy: {
    flex: 1
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
  questFill: {
    backgroundColor: "#8fffd2",
    borderRadius: 999,
    height: "100%"
  },
  questTrack: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    height: 7,
    overflow: "hidden"
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
  rewardSummaryText: {
    color: "#f8d987",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 6
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
