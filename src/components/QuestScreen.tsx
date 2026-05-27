import { Pressable, StyleSheet, Text, View } from "react-native";
import { quests } from "../content";
import { getQuestProgress, idleQuestDefinitions, idleQuestOrder } from "../game";
import { uiTheme } from "../constants/theme";
import type { GameAction, GameState } from "../types";

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

export function QuestProgressList({ state }: { state: GameState }) {
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

export default function QuestScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
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

const styles = StyleSheet.create({
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
  panelTitle: {
    color: "#fff8ef",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8
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
  disabledButton: {
    opacity: 0.45
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
    color: uiTheme.colors.muted,
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
  }
});
