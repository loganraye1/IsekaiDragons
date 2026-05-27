import { useRef, type ReactNode } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  achievementDefinitions,
  achievementOrder,
  canReincarnate,
  dailyGoalDefinitions,
  dailyGoalOrder,
  dragonPathDefinitions,
  elementBonusDefinitions,
  equipmentBonusLabels,
  equipmentRarityDefinitions,
  equipmentSlotLabels,
  equipmentSlots,
  evolutionTraitDefinitions,
  getBattleDamage,
  getBattleRewardGold,
  getDragonForm,
  getDragonPower,
  getDragonSoulMultiplier,
  getReincarnationSoulsGained,
  getSelectedEvolutionTrait,
  getStatUpgradeCost,
  supportingSystemRecommendations,
  treasureDefinitions,
  treasureOrder,
  treasureRarityDefinitions,
} from "../game";
import { elementTheme } from "../content";
import { uiTheme } from "../constants/theme";
import { evolutionBurstEffect } from "../constants/assets";
import { SafeLottie } from "../ui/SafeMedia";
import { CapybaraAdventureBoard } from "./AdventureScreen";
import type {
  AchievementId,
  DailyGoalId,
  DragonElement,
  DragonPathId,
  EquipmentItem,
  EquipmentSlot,
  EvolutionTraitId,
  GameAction,
  GameSettings,
  GameState,
  Stats,
} from "../types";
import { formatGameNumber, formatStat, formatStatValue, formatReward } from "../utils/format";

// ─── Local utilities ─────────────────────────────────────────────────────────

function formatEquipmentBonus(item: EquipmentItem) {
  return `+${item.bonusPercent}% ${equipmentBonusLabels[item.bonusType]}`;
}

function getDragonPathTradeoffCopy(path: (typeof dragonPathDefinitions)[DragonPathId]) {
  const offense = Math.round(path.battleModifier.damageMultiplier * 100);
  const mitigation = Math.round(path.battleModifier.damageReduction * 100);
  return `Offense ${offense}% | Mitigation ${mitigation}% | Tempo ${path.battleModifier.tempoLabel}`;
}

// ─── Local constants ──────────────────────────────────────────────────────────

const combatStatTips: Record<keyof Stats, string> = {
  attack: "Bigger hits",
  health: "More HP",
  defense: "Less damage taken",
  speed: "Tempo + dodge",
  block: "Chance to reduce hits",
  dodge: "Chance to avoid hits",
  critChance: "CRIT frequency",
  critDamage: "Crit DMG burst",
};

// ─── Tiny shared primitives ───────────────────────────────────────────────────

function StatPill({ icon, label, value, large = false }: { icon?: string; label: string; value: number | string; large?: boolean }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillLabel}>{icon ? `${icon} ${label}` : label}</Text>
      <Text style={[styles.statPillValue, large && styles.statPillValueLarge]}>{value}</Text>
    </View>
  );
}

// ─── Layout primitives ────────────────────────────────────────────────────────

export function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionCardTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionCardSubtitle}>{subtitle}</Text> : null}
      <View style={styles.sectionCardBody}>{children}</View>
    </View>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateDetail}>{detail}</Text>
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
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

// ─── Reward row ───────────────────────────────────────────────────────────────

export function RewardRow({
  title,
  detail,
  reward,
  buttonLabel,
  disabled,
  onPress,
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

// ─── Battle / auto battle ─────────────────────────────────────────────────────

export function AutoBattleSummary({ state }: { state: GameState }) {
  const hpPercent = `${Math.round((state.autoBattle.enemyHp / state.autoBattle.enemyMaxHp) * 100)}%`;
  const rewardGold = getBattleRewardGold(state);
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
        HP {formatGameNumber(state.autoBattle.enemyHp, numberFormat)}/{formatGameNumber(state.autoBattle.enemyMaxHp, numberFormat)} | Hit {formatGameNumber(damage, numberFormat)} | Reward +{formatGameNumber(rewardGold, numberFormat)} gold
      </Text>
    </View>
  );
}

export function AutoBattlePanel({ state }: { state: GameState }) {
  const hpPercent = `${Math.round((state.autoBattle.enemyHp / state.autoBattle.enemyMaxHp) * 100)}%`;
  const rewardGold = getBattleRewardGold(state);
  const damage = getBattleDamage(state);
  const power = getDragonPower(state);
  const flavor =
    state.dragon.element === "fire"
      ? "Fire damage +15%"
      : state.dragon.element === "water"
        ? "Victories restore a calm ward"
        : "Battle gold rewards +10%";

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
        <Text style={styles.autoBattleText}>Hit {damage} | Reward +{rewardGold} gold</Text>
      </View>
      <Text style={styles.autoBattleFlavor}>{flavor}</Text>
    </View>
  );
}

// ─── Loot / equipment ─────────────────────────────────────────────────────────

export function TreasureInventory({ state }: { state: GameState }) {
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
            <Text style={styles.treasureName}>{treasure.name} x{count}</Text>
            <Text style={[styles.treasureRarity, { color: rarity.color }]}>{rarity.label}</Text>
            <Text style={styles.treasureBonus}>{treasure.bonus}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function TreasureCollectionLog({ state }: { state: GameState }) {
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

export function EquipmentPanel({
  state,
  onEquipItem,
  onSellItem,
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

export function EquipmentRow({
  item,
  slot,
  equipped = false,
  onEquipItem,
  onSellItem,
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

// ─── Upgrade cards ────────────────────────────────────────────────────────────

export function ElementBonusCard({ element, questIntervalMs }: { element: DragonElement; questIntervalMs: number }) {
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

export function EvolutionTraitCard({ state }: { state: GameState }) {
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

// ─── Modals ───────────────────────────────────────────────────────────────────

export function EvolutionChoiceModal({
  visible,
  element,
  onClose,
  onChoose,
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

export function ReincarnationConfirmModal({
  visible,
  state,
  onClose,
  onConfirm,
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
            This resets gold, stage, element, upgrades, area progress, quest progress, and evolution trait. Treasures stay.
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

// ─── Reincarnation panel ──────────────────────────────────────────────────────

export function ReincarnationPanel({ state, onPress }: { state: GameState; onPress: () => void }) {
  const unlocked = canReincarnate(state);
  const soulsGained = getReincarnationSoulsGained(state);
  const bonusPercent = Math.round((getDragonSoulMultiplier(state) - 1) * 100);
  return (
    <View style={styles.reincarnationPanel}>
      <View>
        <Text style={styles.choiceNumber}>Reincarnation</Text>
        <Text style={styles.reincarnationTitle}>{state.dragonSouls} Dragon Souls</Text>
        <Text style={styles.traitText}>Permanent gold bonus: +{bonusPercent}%</Text>
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

// ─── Panel content components ─────────────────────────────────────────────────

export function StatsPanelContent({ state }: { state: GameState }) {
  const path = state.dragon.path ? dragonPathDefinitions[state.dragon.path] : null;
  const numberFormat = state.settings.numberFormat;
  const battleDamage = getBattleDamage(state);
  const dragonPower = getDragonPower(state);
  const combatRows: Array<{ title: string; detail: string; value: string }> = [
    { title: "Attack", detail: "Raises every breath and claw hit.", value: `${state.dragon.stats.attack}` },
    { title: "Defense", detail: "Cuts incoming damage before block/dodge results.", value: `${state.dragon.stats.defense}` },
    { title: "Speed", detail: "Improves tempo and slightly improves crit/dodge feel.", value: `${state.dragon.stats.speed}` },
    { title: "Block", detail: "Chance to reduce an enemy hit instead of eating the full blow.", value: `${state.dragon.stats.block}%` },
    { title: "Dodge", detail: "Chance to fully avoid an enemy hit.", value: `${state.dragon.stats.dodge}%` },
    { title: "Crit / Crit DMG", detail: "Chance to spike damage and how hard the spike lands.", value: `${state.dragon.stats.critChance}% / ${state.dragon.stats.critDamage}%` },
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

export function EvolutionPanelContent({
  state,
  canEvolve,
  evolutionCost,
  onEvolve,
}: {
  state: GameState;
  canEvolve: boolean;
  evolutionCost: number | null;
  onEvolve: () => void;
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
        subtitle={evolutionCost === null ? "Your dragon is fully evolved." : `${formatGameNumber(Math.floor(state.player.gold), numberFormat)} / ${formatGameNumber(evolutionCost, numberFormat)} gold`}
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
    </>
  );
}

const STAT_UPGRADE_LABELS: Record<"attack" | "defense" | "health", string> = {
  attack: "Attack",
  defense: "Defense",
  health: "Health"
};

const STAT_UPGRADE_BONUS: Record<"attack" | "defense" | "health", string> = {
  attack: "+5 ATK per level",
  defense: "+3 DEF per level",
  health: "+10 HP per level"
};

export function StatUpgradePanel({
  state,
  onUpgrade,
}: {
  state: GameState;
  onUpgrade: (stat: "attack" | "defense" | "health") => void;
}) {
  const numberFormat = state.settings.numberFormat;
  const upgrades = state.statUpgrades ?? { attack: 0, defense: 0, health: 0 };
  const stats: Array<"attack" | "defense" | "health"> = ["attack", "defense", "health"];

  return (
    <>
      {stats.map((stat) => {
        const level = upgrades[stat];
        const cost = getStatUpgradeCost(stat, level);
        const canAfford = state.player.gold >= cost;
        return (
          <SectionCard
            key={stat}
            title={`${STAT_UPGRADE_LABELS[stat]} (Lv ${level})`}
            subtitle={STAT_UPGRADE_BONUS[stat]}
          >
            <Pressable
              onPress={() => onUpgrade(stat)}
              disabled={!canAfford}
              style={[styles.primaryPanelButton, !canAfford && styles.disabledUpgradeCard]}
            >
              <Text style={styles.primaryPanelButtonText}>
                Train — {formatGameNumber(cost, numberFormat)} gold
              </Text>
            </Pressable>
          </SectionCard>
        );
      })}
    </>
  );
}

export function AdventurePanelContent({
  state,
  onReturnToDen,
  onEquipItem,
  onSellItem,
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

export function GoalsPanelContent({
  state,
  onClaimAchievement,
  onClaimDaily,
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

export function RebirthPanelContent({ state, onReincarnate }: { state: GameState; onReincarnate: () => void }) {
  const unlocked = canReincarnate(state);
  const soulsGained = getReincarnationSoulsGained(state);
  const bonusPercent = Math.round((getDragonSoulMultiplier(state) - 1) * 100);
  const numberFormat = state.settings.numberFormat;

  return (
    <>
      <SectionCard title="Dragon Souls" subtitle={`${state.dragonSouls} souls | +${bonusPercent}% all gold`}>
        <View style={styles.panelStatsRow}>
          <StatPill icon="◆" label="Souls" value={formatGameNumber(state.totalReincarnations, numberFormat)} />
        </View>
      </SectionCard>
      <SectionCard title="Reincarnation" subtitle={unlocked ? `Gain ${soulsGained} Dragon Souls now` : "Reach Wyrm to unlock Rebirth"}>
        <Text style={styles.panelMutedText}>Resets gold, stage, element, upgrades, area progress, quest progress, and evolution trait. Treasures stay.</Text>
        <Pressable onPress={onReincarnate} disabled={!unlocked} style={[styles.primaryPanelButton, !unlocked && styles.disabledUpgradeCard]}>
          <Text style={styles.primaryPanelButtonText}>{unlocked ? "Reincarnate" : "Reach Wyrm"}</Text>
        </Pressable>
      </SectionCard>
    </>
  );
}

// ─── DenScreen (legacy screen, kept for old flow compatibility) ───────────────

export default function DenScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: uiTheme.colors.panelRaised,
    borderColor: uiTheme.colors.border,
    borderRadius: uiTheme.radius.lg,
    borderWidth: 1,
    padding: 15,
    ...uiTheme.shadow,
  },
  sectionCardTitle: {
    color: uiTheme.colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  sectionCardSubtitle: {
    color: uiTheme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
  sectionCardBody: {
    marginTop: 12,
  },
  emptyState: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: uiTheme.radius.md,
    borderStyle: "dashed",
    borderWidth: 1,
    padding: 18,
  },
  emptyStateTitle: {
    color: uiTheme.colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  emptyStateDetail: {
    color: uiTheme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 5,
    textAlign: "center",
  },
  panelMutedText: {
    color: uiTheme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },
  primaryPanelButton: {
    alignItems: "center",
    backgroundColor: uiTheme.colors.gold,
    borderRadius: uiTheme.radius.md,
    paddingHorizontal: 18,
    paddingVertical: 13,
    ...uiTheme.shadow,
  },
  primaryPanelButtonText: {
    color: uiTheme.colors.goldDark,
    fontSize: 15,
    fontWeight: "900",
  },
  statPill: {
    backgroundColor: uiTheme.colors.panelStrong,
    borderColor: uiTheme.colors.borderStrong,
    borderRadius: uiTheme.radius.lg,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    ...uiTheme.shadow,
  },
  statPillLabel: {
    color: uiTheme.colors.gold,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statPillValue: {
    color: uiTheme.colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 2,
  },
  statPillValueLarge: {
    fontSize: 26,
  },
  panelStatsRow: {
    flexDirection: "row",
    gap: 10,
  },
  panelUpgradeGrid: {
    flexDirection: "row",
    gap: 8,
  },
  rewardRowCompact: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.075)",
    borderRadius: uiTheme.radius.md,
    flexDirection: "row",
    gap: 10,
    marginBottom: 9,
    padding: 12,
  },
  progressRewardCopy: {
    flex: 1,
  },
  traitTitle: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900",
  },
  traitText: {
    color: "#b9aee3",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },
  questCount: {
    color: "#b9aee3",
    fontSize: 11,
    fontWeight: "900",
  },
  questTrack: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    height: 7,
    overflow: "hidden",
  },
  questFill: {
    backgroundColor: "#8fffd2",
    borderRadius: 999,
    height: "100%",
  },
  rewardSummaryText: {
    color: "#f8d987",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 6,
  },
  claimButton: {
    backgroundColor: "#f8d987",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  claimButtonText: {
    color: "#1e1235",
    fontSize: 11,
    fontWeight: "900",
  },
  disabledUpgradeCard: {
    opacity: 0.48,
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
    zIndex: 11,
  },
  autoBattleHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  autoBattleEnemy: {
    color: "#fff8ef",
    fontSize: 17,
    fontWeight: "900",
  },
  autoBattlePower: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900",
  },
  enemyHpTrack: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    height: 9,
    marginTop: 8,
    overflow: "hidden",
  },
  enemyHpFill: {
    backgroundColor: "#ff784f",
    borderRadius: 999,
    height: "100%",
  },
  autoBattleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
  },
  autoBattleText: {
    color: "#e9ddff",
    fontSize: 10,
    fontWeight: "800",
  },
  autoBattleFlavor: {
    color: "#b9aee3",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
  },
  treasureInventory: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  treasureChip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: 13,
    minWidth: "31%",
    padding: 7,
  },
  treasureName: {
    color: "#fff8ef",
    fontSize: 10,
    fontWeight: "900",
  },
  treasureRarity: {
    fontSize: 9,
    fontWeight: "900",
    marginTop: 2,
    textTransform: "uppercase",
  },
  treasureBonus: {
    color: "#b9aee3",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
  },
  collectionLog: {
    gap: 8,
  },
  collectionRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.075)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 11,
  },
  collectionRowLocked: {
    backgroundColor: "rgba(255,255,255,0.035)",
    opacity: 0.62,
  },
  collectionLockedText: {
    color: "#7f73ad",
  },
  equipmentPanel: {
    gap: 10,
  },
  equipmentSubhead: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  equipmentList: {
    gap: 8,
  },
  equipmentRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.075)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 11,
  },
  equipmentRowEquipped: {
    backgroundColor: "rgba(248,217,135,0.1)",
  },
  equipmentEmptySlot: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    padding: 11,
  },
  equipmentSlotLabel: {
    color: "#f8d987",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  equipmentEmptyText: {
    color: "#b9aee3",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
  },
  equipmentRarityText: {
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3,
  },
  equipmentActions: {
    alignItems: "flex-end",
    gap: 7,
  },
  equipmentSellButton: {
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  equipmentSellText: {
    color: "#d8cfef",
    fontSize: 10,
    fontWeight: "900",
  },
  upgradeSparkle: {
    height: 90,
    left: "50%",
    marginLeft: -45,
    marginTop: -45,
    position: "absolute",
    top: "50%",
    width: 90,
    zIndex: 5,
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
    zIndex: 11,
  },
  choiceNumber: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  elementBonusTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  elementBonusText: {
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 6,
  },
  elementBonusMeta: {
    color: "#b9aee3",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 5,
    textTransform: "uppercase",
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
    zIndex: 11,
  },
  modalScrim: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.62)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  evolutionModal: {
    backgroundColor: "#120b26",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    width: "100%",
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 6,
  },
  bodyText: {
    color: "#d8cfef",
    fontSize: 14,
    lineHeight: 21,
  },
  traitChoiceRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  traitChoiceCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    minHeight: 126,
    padding: 12,
  },
  traitChoiceName: {
    color: "#fff8ef",
    fontSize: 16,
    fontWeight: "900",
  },
  traitChoiceBonus: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 10,
  },
  modalCancelButton: {
    alignSelf: "center",
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalCancelText: {
    color: "#b9aee3",
    fontWeight: "900",
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
    zIndex: 11,
  },
  reincarnationTitle: {
    color: "#f8d987",
    fontSize: 15,
    fontWeight: "900",
  },
  reincarnationAction: {
    alignItems: "flex-end",
    gap: 6,
  },
  reincarnationGain: {
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "900",
  },
  reincarnationButton: {
    backgroundColor: "#f8d987",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reincarnationButtonText: {
    color: "#1e1235",
    fontSize: 11,
    fontWeight: "900",
  },
  reincarnationModalReward: {
    color: "#f8d987",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 14,
    textAlign: "center",
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 16,
  },
  modalPrimaryButton: {
    backgroundColor: "#f8d987",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  modalSecondaryButton: {
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  evolveButtonText: {
    color: "#1e1235",
    fontWeight: "900",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  compactStats: {
    marginBottom: 4,
  },
  statCard: {
    backgroundColor: "rgba(0,0,0,0.16)",
    borderRadius: 16,
    minWidth: "47%",
    padding: 12,
  },
  statValue: {
    color: "#fff8ef",
    fontSize: 20,
    fontWeight: "900",
  },
  statLabel: {
    color: "#a99bd9",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  statHint: {
    color: "#f8d987",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginTop: 4,
    textTransform: "uppercase",
  },
  progressWrap: {
    marginTop: 14,
  },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    height: 10,
    overflow: "hidden",
  },
  progressFill: {
    borderRadius: 999,
    height: "100%",
  },
  progressLabel: {
    color: "#cfc5ee",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#fff8ef",
    borderRadius: 18,
    flex: 1,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: "#160c2f",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.45,
  },
  sectionTitle: {
    color: "#fff8ef",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  panel: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 12,
    padding: 16,
  },
  elementBadge: {
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 4,
  },
  panelTitle: {
    color: "#fff8ef",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
});
