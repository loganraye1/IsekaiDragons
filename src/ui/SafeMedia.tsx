import { useState, type ReactNode } from "react";
import { Image as ExpoImage } from "expo-image";
import LottieView from "lottie-react-native";
import { StyleSheet, Text, View, type ImageSourcePropType } from "react-native";

export function SafeExpoImage({
  source,
  style,
  contentFit = "contain",
  transition,
  fallback
}: {
  source: ImageSourcePropType;
  style: any;
  contentFit?: "cover" | "contain";
  transition?: number;
  fallback?: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return fallback ? <>{fallback}</> : (
      <View style={[style, styles.assetFallback]}>
        <Text style={styles.assetFallbackText}>Asset loading...</Text>
      </View>
    );
  }

  return <ExpoImage source={source} style={style} contentFit={contentFit} transition={transition} onError={() => setFailed(true)} />;
}

export function SafeLottie({
  source,
  style,
  autoPlay = true,
  loop = false
}: {
  source: any;
  style: any;
  autoPlay?: boolean;
  loop?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !source) {
    return null;
  }

  return <LottieView source={source} autoPlay={autoPlay} loop={loop} style={style} onAnimationFailure={() => setFailed(true)} />;
}

const styles = StyleSheet.create({
  assetFallback: {
    alignItems: "center",
    backgroundColor: "rgba(18,11,38,0.7)",
    justifyContent: "center"
  },
  assetFallbackText: {
    color: "#b9aee3",
    fontSize: 12,
    fontWeight: "700"
  }
});
