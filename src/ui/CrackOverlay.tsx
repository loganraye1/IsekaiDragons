import { Animated, StyleSheet, View } from "react-native";

export default function CrackOverlay({ breaking }: { breaking: Animated.Value }) {
  const openingOpacity = breaking.interpolate({ inputRange: [0, 0.32, 0.58, 1], outputRange: [0, 0, 0.48, 0.12] });
  const openingScale = breaking.interpolate({ inputRange: [0, 0.58, 1], outputRange: [0.5, 1, 1.35] });

  return (
    <View pointerEvents="none" style={styles.crackLayer}>
      <Animated.View
        style={[
          styles.missingShellGap,
          styles.missingShellGapTop,
          {
            opacity: openingOpacity,
            transform: [{ rotate: "-18deg" }, { scale: openingScale }]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.missingShellGap,
          styles.missingShellGapLeft,
          {
            opacity: openingOpacity,
            transform: [{ rotate: "32deg" }, { scale: openingScale }]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.missingShellGap,
          styles.missingShellGapRight,
          {
            opacity: openingOpacity,
            transform: [{ rotate: "-36deg" }, { scale: openingScale }]
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  crackLayer: {
    height: 190,
    position: "absolute",
    width: 150,
    zIndex: 2
  },
  missingShellGap: {
    backgroundColor: "rgba(255,240,198,0.16)",
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    borderWidth: 1,
    position: "absolute",
    shadowColor: "#ffd36d",
    shadowOpacity: 0.22,
    shadowRadius: 6
  },
  missingShellGapTop: {
    height: 54,
    left: 56,
    top: 30,
    width: 34
  },
  missingShellGapLeft: {
    height: 44,
    left: 40,
    top: 88,
    width: 48
  },
  missingShellGapRight: {
    height: 46,
    left: 78,
    top: 90,
    width: 50
  }
});
