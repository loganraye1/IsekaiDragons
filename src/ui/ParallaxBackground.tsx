import { useEffect } from "react";
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";
import { StyleSheet, type ImageSourcePropType } from "react-native";

export default function ParallaxBackground({ source, opacity = 0.28 }: { source: ImageSourcePropType; opacity?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity,
    transform: [{ scale: 1.1 }, { translateX: -12 + progress.value * 24 }, { translateY: -8 + progress.value * 16 }]
  }));

  return <Reanimated.Image source={source} resizeMode="cover" style={[styles.parallaxLayer, animatedStyle]} />;
}

const styles = StyleSheet.create({
  parallaxLayer: {
    bottom: -18,
    left: -18,
    position: "absolute",
    right: -18,
    top: -18
  }
});
