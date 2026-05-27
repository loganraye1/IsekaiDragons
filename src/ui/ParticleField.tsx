import { useEffect } from "react";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { StyleSheet, View } from "react-native";

function ParticleDot({ color, index }: { color: string; index: number }) {
  const progress = useSharedValue(0);
  const left = 12 + ((index * 29) % 78);
  const top = 18 + ((index * 43) % 72);
  const size = 5 + (index % 3) * 2;

  useEffect(() => {
    progress.value = withDelay(
      index * 120,
      withRepeat(withSequence(withTiming(1, { duration: 1900 }), withTiming(0, { duration: 1900 })), -1)
    );
  }, [index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: color,
    height: size,
    left: `${left}%`,
    opacity: 0.18 + progress.value * 0.58,
    top: `${top}%`,
    transform: [{ translateY: -28 * progress.value }, { scale: 0.65 + progress.value * 0.55 }],
    width: size
  }));

  return <Reanimated.View style={[styles.particleDot, animatedStyle]} />;
}

export default function ParticleField({ color, count = 8 }: { color: string; count?: number }) {
  return (
    <View pointerEvents="none" style={styles.particleField}>
      {Array.from({ length: count }).map((_, index) => (
        <ParticleDot key={index} color={color} index={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particleField: {
    bottom: 0,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    top: 0
  },
  particleDot: {
    borderRadius: 999,
    position: "absolute",
    shadowColor: "#fff",
    shadowOpacity: 0.6,
    shadowRadius: 8
  }
});
