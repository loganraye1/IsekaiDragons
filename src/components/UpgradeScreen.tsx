import { Pressable, StyleSheet, Text, View } from "react-native";
import { dragonSkillDrafts, getActiveDragonSkill, getActiveSkillUnlockState, getUpgradeCost } from "../game";
import type { GameAction, GameState, Stats } from "../types";
import { formatStat, formatStatValue } from "../utils/format";

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

function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.primaryButton, disabled && styles.disabledButton]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
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

export default function UpgradeScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  return <FocusedTrainingPanel state={state} dispatch={dispatch} />;
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
  skillDraftHooks: {
    color: "#f8d987",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.4,
    marginTop: 8,
    textTransform: "uppercase"
  }
});
