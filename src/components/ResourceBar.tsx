import { StyleSheet, Text, View } from "react-native";
import { getXpToLevel } from "../game";
import type { GameState } from "../types";

function Resource({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.resource}>
      <Text style={styles.resourceLabel}>{label}</Text>
      <Text style={styles.resourceValue}>{value}</Text>
    </View>
  );
}

export default function ResourceBar({ state }: { state: GameState }) {
  const xpNeeded = getXpToLevel(state.dragon.level);
  return (
    <View style={styles.resourceBar}>
      <Resource label="Gold" value={state.player.gold} />
      <Resource label="Essence" value={state.player.essence} />
      <Resource label="Level" value={state.dragon.level} />
      <Resource label="XP" value={`${state.dragon.xp}/${xpNeeded}`} />
    </View>
  );
}

const styles = StyleSheet.create({
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
  }
});
