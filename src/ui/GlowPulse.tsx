import { useEffect } from "react";
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";
import { StyleSheet } from "react-native";

export default function GlowPulse({
  color,
  style,
  duration = 1400,
  minOpacity = 0.12,
  maxOpacity = 0.28
}: {
  color: string;
  style?: any;
  duration?: number;
  minOpacity?: number;
  maxOpacity?: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: color,
    opacity: minOpacity + progress.value * (maxOpacity - minOpacity),
    transform: [{ scale: 0.96 + progress.value * 0.12 }]
  }));

  return <Reanimated.View pointerEvents="none" style={[styles.glowPulse, style, animatedStyle]} />;
}

const styles = StyleSheet.create({
  glowPulse: {
    borderRadius: 160,
    height: 250,
    position: "absolute",
    width: 250
  }
});
