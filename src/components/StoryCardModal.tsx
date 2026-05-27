import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { StoryCard } from "../types";

export default function StoryCardModal({ card, onDismiss }: { card: StoryCard | null; onDismiss: () => void }) {
  if (!card) return null;

  const isOutro = card.type === "outro";

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.scrim}>
        <View style={styles.card}>
          <View style={[styles.accent, isOutro && styles.accentOutro]} />
          <Text style={styles.typeLabel}>{isOutro ? "Chapter Complete" : "Chapter Begins"}</Text>
          <Text style={styles.title}>{card.title}</Text>
          <View style={styles.divider} />
          <Text style={styles.body}>{card.body}</Text>
          <Pressable style={styles.button} onPress={onDismiss}>
            <Text style={styles.buttonText}>{isOutro ? "Onward" : "Begin"}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#0e0e14",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2e2c3e",
    overflow: "hidden"
  },
  accent: {
    height: 3,
    backgroundColor: "#7c6af7"
  },
  accentOutro: {
    backgroundColor: "#c9943a"
  },
  typeLabel: {
    color: "#7c6af7",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 4
  },
  title: {
    color: "#f0edff",
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 24,
    paddingBottom: 16,
    lineHeight: 28
  },
  divider: {
    height: 1,
    backgroundColor: "#2e2c3e",
    marginHorizontal: 24,
    marginBottom: 16
  },
  body: {
    color: "#b8b4d0",
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 24,
    paddingBottom: 24
  },
  button: {
    margin: 16,
    marginTop: 0,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#1e1c2e",
    borderWidth: 1,
    borderColor: "#3e3a58",
    alignItems: "center"
  },
  buttonText: {
    color: "#f0edff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1
  }
});
