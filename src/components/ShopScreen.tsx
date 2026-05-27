import { Pressable, StyleSheet, Text, View } from "react-native";
import { shopItems } from "../content";
import type { GameAction, GameState, Stats } from "../types";
import { formatStat, formatBoost } from "../utils/format";

function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.primaryButton, disabled && styles.disabledButton]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export default function ShopScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Wyrm Market</Text>
      {shopItems.map((item) => {
        const owned = state.player.inventory.includes(item.id);
        const canBuy = state.player.gold >= item.cost && !owned;
        return (
          <View key={item.id} style={styles.panel}>
            <Text style={styles.panelTitle}>{item.name}</Text>
            <Text style={styles.bodyText}>{item.description}</Text>
            <Text style={styles.hintText}>Boost: {formatBoost(item.statBoost)}</Text>
            <PrimaryButton
              label={owned ? "Owned" : `Buy for ${item.cost}g`}
              disabled={!canBuy}
              onPress={() => dispatch({ type: "buyShopItem", itemId: item.id })}
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
  hintText: {
    color: "#bdb2df",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8
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
  }
});
