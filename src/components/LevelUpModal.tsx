import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RunCard, RunCardRarity } from "../types";

const RARITY_COLOR: Record<RunCardRarity, string> = {
  common: "#9a9a9a",
  rare: "#4e9fff",
  mythic: "#d4a017"
};

const RARITY_BORDER: Record<RunCardRarity, string> = {
  common: "#3a3a3a",
  rare: "#2a4a7a",
  mythic: "#6a4a00"
};

const RARITY_BG: Record<RunCardRarity, string> = {
  common: "#1a1a1a",
  rare: "#0e1a2e",
  mythic: "#1a1200"
};

function formatStatEffect(key: string, value: number): string {
  const sign = value >= 0 ? "+" : "";
  const labels: Record<string, string> = {
    attack: "ATK",
    health: "HP",
    defense: "DEF",
    speed: "SPD",
    block: "BLK",
    dodge: "DDG",
    critChance: "CRIT%",
    critDamage: "CRIT DMG"
  };
  return `${sign}${value} ${labels[key] ?? key}`;
}

function RunCardView({ card, onSelect }: { card: RunCard; onSelect: () => void }) {
  const color = RARITY_COLOR[card.rarity];
  const border = RARITY_BORDER[card.rarity];
  const bg = RARITY_BG[card.rarity];

  return (
    <Pressable style={[styles.card, { backgroundColor: bg, borderColor: border }]} onPress={onSelect}>
      <View style={[styles.rarityBar, { backgroundColor: color }]} />
      <View style={styles.cardBody}>
        <Text style={[styles.rarityLabel, { color }]}>{card.rarity.toUpperCase()}</Text>
        <Text style={styles.cardName}>{card.name}</Text>
        <Text style={styles.cardDesc}>{card.description}</Text>
        <View style={styles.statRow}>
          {Object.entries(card.statEffects).map(([key, value]) => (
            <Text key={key} style={[styles.statPill, { color: (value ?? 0) >= 0 ? "#7adb78" : "#f07070" }]}>
              {formatStatEffect(key, value ?? 0)}
            </Text>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

export default function LevelUpModal({
  cards,
  level,
  onSelect
}: {
  cards: RunCard[] | null;
  level: number;
  onSelect: (cardId: string) => void;
}) {
  if (!cards) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.scrim}>
        <View style={styles.panel}>
          <Text style={styles.header}>Level Up!</Text>
          <Text style={styles.subheader}>Run Level {level} — Choose a boon</Text>
          <ScrollView contentContainerStyle={styles.cardList} showsVerticalScrollIndicator={false}>
            {cards.map((card) => (
              <RunCardView key={card.id} card={card} onSelect={() => onSelect(card.id)} />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  panel: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#0e0e14",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2e2c3e",
    overflow: "hidden",
    paddingBottom: 16
  },
  header: {
    color: "#f0edff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    paddingTop: 22,
    paddingBottom: 2
  },
  subheader: {
    color: "#7c6af7",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textAlign: "center",
    paddingBottom: 16
  },
  cardList: {
    paddingHorizontal: 14,
    gap: 10
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden"
  },
  rarityBar: {
    height: 3
  },
  cardBody: {
    padding: 14
  },
  rarityLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    paddingBottom: 4
  },
  cardName: {
    color: "#f0edff",
    fontSize: 16,
    fontWeight: "700",
    paddingBottom: 4
  },
  cardDesc: {
    color: "#b8b4d0",
    fontSize: 13,
    lineHeight: 19,
    paddingBottom: 8
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  statPill: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5
  }
});
