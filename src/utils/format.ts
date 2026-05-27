import type { ReturnPresencePhase } from "../components/DragonDisplay";
import type { DragonElement, GameSettings, GameState, LootEvent, Stats } from "../types";

export function formatGameNumber(value: number | null | undefined, numberFormat: GameSettings["numberFormat"]) {
  const safeValue = typeof value === "number" && Number.isFinite(value) ? value : 0;
  if (numberFormat === "full") {
    return Number.isInteger(safeValue) ? `${safeValue}` : safeValue.toFixed(1);
  }
  const absolute = Math.abs(safeValue);
  if (absolute >= 1_000_000_000) return `${(safeValue / 1_000_000_000).toFixed(1)}B`;
  if (absolute >= 1_000_000) return `${(safeValue / 1_000_000).toFixed(1)}M`;
  if (absolute >= 10_000) return `${(safeValue / 1_000).toFixed(1)}K`;
  return Number.isInteger(safeValue) ? `${safeValue}` : safeValue.toFixed(1);
}

export function formatMultiplier(value: number) {
  return `${value.toFixed(2)}x`;
}

export function formatPercent(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}

export function formatStat(stat: keyof Stats) {
  switch (stat) {
    case "critChance": return "Crit";
    case "critDamage": return "Crit DMG";
    default: return stat[0].toUpperCase() + stat.slice(1);
  }
}

export function formatBoost(boost: Partial<Stats>) {
  return Object.entries(boost)
    .map(([key, value]) => `+${value} ${formatStat(key as keyof Stats)}`)
    .join(", ");
}

export function formatStatValue(stat: keyof Stats, value: number) {
  return stat === "critChance" || stat === "critDamage" ? `${value}%` : value;
}

export function formatReward(
  reward: { essence?: number; dragonSouls?: number; shards?: Partial<Record<DragonElement, number>> },
  numberFormat: GameSettings["numberFormat"] = "compact"
) {
  const parts = [
    reward.essence ? `+${formatGameNumber(reward.essence, numberFormat)} essence` : null,
    reward.dragonSouls ? `+${formatGameNumber(reward.dragonSouls, numberFormat)} souls` : null,
    reward.shards
      ? (Object.entries(reward.shards) as Array<[DragonElement, number]>)
          .map(([element, amount]) => `+${formatGameNumber(amount, numberFormat)} ${element} shard`)
          .join(", ")
      : null,
  ].filter(Boolean);
  return parts.join(" | ");
}

export function formatDailyLoginReward(
  day: number,
  reward: { essence?: number; dragonSouls?: number; shards?: Partial<Record<DragonElement, number>> },
  numberFormat: GameSettings["numberFormat"]
) {
  if (day === 3) return "Random treasure";
  return formatReward(reward, numberFormat);
}

export function capitalizeElement(element: DragonElement) {
  return `${element[0].toUpperCase()}${element.slice(1)}`;
}

export function formatReturnPhase(phase: ReturnPresencePhase | "complete") {
  return phase === "sleeping" ? "resting" : phase;
}

export function formatPresenceAwayDuration(awayDurationMs: number) {
  return awayDurationMs >= 60 * 60 * 1000 ? "1 hour" : `${Math.round(awayDurationMs / 60000)} min`;
}

export function getTodayKeyForUi() {
  return new Date().toISOString().slice(0, 10);
}

export function isValidBackupState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GameState>;
  return Boolean(candidate.dragon && candidate.player && candidate.idleUpgrades && candidate.treasures && candidate.elementalShards);
}

export function getLeadingEggElement(state: GameState): DragonElement {
  const scores: Record<DragonElement, number> = { fire: 0, water: 0, earth: 0, light: 0, dark: 0 };
  Object.values(state.eggAnswers).forEach((element) => { scores[element] += 1; });
  const [leader] = (Object.entries(scores) as Array<[DragonElement, number]>).sort((a, b) => b[1] - a[1]);
  return leader?.[1] > 0 ? leader[0] : "fire";
}

export function shouldShowLootPopup(_event: LootEvent | null | undefined) {
  return false;
}
