import { useEffect, type ReactNode } from "react";
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming
} from "react-native-reanimated";

export default function FloatingLayer({
  children,
  distance = 8,
  scale = 1.03,
  sway = 0,
  duration = 1600,
  delay = 0,
  style
}: {
  children: ReactNode;
  distance?: number;
  scale?: number;
  sway?: number;
  duration?: number;
  delay?: number;
  style?: object;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }), -1, true)
    );
  }, [delay, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -distance * progress.value },
      { rotate: `${-sway + progress.value * sway * 2}deg` },
      { scale: 1 + (scale - 1) * progress.value }
    ]
  }));

  return <Reanimated.View style={[style, animatedStyle]}>{children}</Reanimated.View>;
}
