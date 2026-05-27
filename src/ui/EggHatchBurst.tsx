import { Animated, StyleSheet, View } from "react-native";

const hatchBurstParticles = [
  { x: -58, y: -46, size: 5, delay: 0.04, rotate: "-24deg" },
  { x: 58, y: -48, size: 5, delay: 0.1, rotate: "24deg" },
  { x: -44, y: 50, size: 4, delay: 0.18, rotate: "-12deg" },
  { x: 44, y: 52, size: 4, delay: 0.22, rotate: "14deg" }
];

const hatchBurstRays = [
  { rotate: "-42deg", delay: 0.04 },
  { rotate: "0deg", delay: 0.1 },
  { rotate: "42deg", delay: 0.16 }
];

export default function EggHatchBurst({ progress, color, accentColor }: { progress: Animated.Value; color: string; accentColor: string }) {
  const bloomOpacity = progress.interpolate({ inputRange: [0, 0.14, 0.56, 1], outputRange: [0, 0.42, 0.16, 0], extrapolate: "clamp" });
  const bloomScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.75], extrapolate: "clamp" });
  const ringOpacity = progress.interpolate({ inputRange: [0, 0.2, 0.72, 1], outputRange: [0, 0.48, 0.14, 0], extrapolate: "clamp" });
  const ringScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1.45], extrapolate: "clamp" });

  return (
    <View pointerEvents="none" style={styles.hatchBurstLayer}>
      <Animated.View style={[styles.hatchBloom, { backgroundColor: color, opacity: bloomOpacity, transform: [{ scale: bloomScale }] }]} />
      <Animated.View style={[styles.hatchShockRing, { borderColor: color, opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
      {hatchBurstRays.map((ray) => {
        const rayOpacity = progress.interpolate({ inputRange: [ray.delay, ray.delay + 0.16, 0.74, 1], outputRange: [0, 0.32, 0.08, 0], extrapolate: "clamp" });
        const rayScaleY = progress.interpolate({ inputRange: [ray.delay, ray.delay + 0.34, 1], outputRange: [0.18, 0.82, 0.48], extrapolate: "clamp" });
        return (
          <Animated.View key={ray.rotate} style={[styles.hatchLightRay, { backgroundColor: accentColor, opacity: rayOpacity, transform: [{ rotate: ray.rotate }, { scaleY: rayScaleY }] }]} />
        );
      })}
      {hatchBurstParticles.map((particle, index) => {
        const particleOpacity = progress.interpolate({ inputRange: [particle.delay, particle.delay + 0.14, 0.78, 1], outputRange: [0, 0.62, 0.36, 0], extrapolate: "clamp" });
        const translateX = progress.interpolate({ inputRange: [particle.delay, 1], outputRange: [0, particle.x], extrapolate: "clamp" });
        const translateY = progress.interpolate({ inputRange: [particle.delay, 1], outputRange: [0, particle.y], extrapolate: "clamp" });
        const particleScale = progress.interpolate({ inputRange: [particle.delay, particle.delay + 0.18, 1], outputRange: [0.25, 0.88, 0.48], extrapolate: "clamp" });
        return (
          <Animated.View
            key={`${particle.x}-${particle.y}-${index}`}
            style={[
              styles.hatchShellSpark,
              {
                backgroundColor: index % 2 === 0 ? color : accentColor,
                height: particle.size,
                opacity: particleOpacity,
                transform: [{ translateX }, { translateY }, { rotate: particle.rotate }, { scale: particleScale }],
                width: particle.size
              }
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  hatchBurstLayer: {
    alignItems: "center",
    height: 260,
    justifyContent: "center",
    position: "absolute",
    width: 260,
    zIndex: 4
  },
  hatchBloom: {
    borderRadius: 999,
    height: 96,
    position: "absolute",
    width: 96
  },
  hatchShockRing: {
    borderRadius: 999,
    borderWidth: 2,
    height: 138,
    position: "absolute",
    width: 138
  },
  hatchLightRay: {
    borderRadius: 999,
    height: 116,
    position: "absolute",
    top: 14,
    width: 5
  },
  hatchShellSpark: {
    borderRadius: 3,
    position: "absolute"
  }
});
