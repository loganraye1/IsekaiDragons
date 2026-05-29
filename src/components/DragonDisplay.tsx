import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { elementTheme } from "../content";
import { BALANCE } from "../balance";
import {
  type ArtValidationBackgroundKey,
  artValidationBackgrounds,
  auraEffects,
  evolutionBurstEffect,
} from "../constants/assets";
import { uiTheme } from "../constants/theme";
import type { DragonElement, DragonStage } from "../types";
import type { DragonClass, DragonPath } from "../constants/dragonArt";
import { gameStageToArtStage } from "../constants/dragonArt";
import DragonImage from "./DragonImage";
import GlowPulse from "../ui/GlowPulse";
import { SafeExpoImage, SafeLottie } from "../ui/SafeMedia";

// ─── Exported types ───────────────────────────────────────────────────────────

export type AnticipationLevel = "calm" | "alert" | "excited";
export type ReturnPresencePhase = "sleeping" | "waking" | "greeting" | "rewards";
export type EvolutionMomentPhase = "glow" | "silhouette" | "reveal" | null;

export type DragonPathRevealAccent = {
  role: "guardian" | "raider" | "mystic";
  roleLabel: string;
  focusLabel: string;
  powerLabel: string;
  guardLabel: string;
};

export type ArtValidationMode = {
  enabled: boolean;
  sizeMode: "normal" | "thumbnail";
  grayscale: boolean;
  disableAura: boolean;
  freezeIdle: boolean;
  lowBrightness: boolean;
  hudVisible: boolean;
  backgroundKey: ArtValidationBackgroundKey;
};

export const defaultArtValidationMode: ArtValidationMode = {
  enabled: false,
  sizeMode: "normal",
  grayscale: false,
  disableAura: false,
  freezeIdle: false,
  lowBrightness: false,
  hudVisible: true,
  backgroundKey: "mysticMeadow"
};

// ─── Private helpers ──────────────────────────────────────────────────────────

function getArtValidationBadge(mode: ArtValidationMode) {
  return [
    mode.sizeMode === "thumbnail" ? "128px" : "normal",
    mode.grayscale ? "grayscale" : "color",
    mode.disableAura ? "aura off" : "aura on",
    mode.freezeIdle ? "frozen" : "motion",
    artValidationBackgrounds[mode.backgroundKey].label
  ].join(" | ");
}

function getElementMotionProfile(element: DragonElement, anticipationLevel: AnticipationLevel, dragonStage: DragonStage = "hatchling") {
  const anticipationMultiplier = anticipationLevel === "excited" ? 0.72 : anticipationLevel === "alert" ? 0.86 : 1;
  const anticipationLift = anticipationLevel === "excited" ? 1.25 : anticipationLevel === "alert" ? 1.12 : 1;
  type MotionProfile = { duration: number; lift: number; scale: number; rotate: number; glowDuration: number; glowOpacity: [number, number] };
  const profiles: Record<DragonElement, MotionProfile> = {
    fire: { duration: 960, lift: -8, scale: 1.035, rotate: 1.1, glowDuration: 1150, glowOpacity: [0.15, 0.34] },
    water: { duration: 1580, lift: -8, scale: 1.026, rotate: 0.45, glowDuration: 1850, glowOpacity: [0.11, 0.26] },
    earth: { duration: 1480, lift: -5, scale: 1.022, rotate: 0.28, glowDuration: 1650, glowOpacity: [0.12, 0.25] },
    light: { duration: 1180, lift: -9, scale: 1.03, rotate: 0.62, glowDuration: 1500, glowOpacity: [0.16, 0.32] },
    dark: { duration: 1240, lift: -7, scale: 1.028, rotate: -0.7, glowDuration: 1560, glowOpacity: [0.14, 0.31] }
  };
  const drakeProfiles: Record<DragonElement, Partial<MotionProfile>> = {
    fire: { duration: 1060, lift: -7, scale: 1.03, rotate: 0.8, glowDuration: 1300 },
    water: { duration: 1800, lift: -7, scale: 1.022, rotate: 0.34, glowDuration: 2050 },
    earth: { duration: 1700, lift: -4, scale: 1.018, rotate: 0.22, glowDuration: 1900 },
    light: { duration: 1320, lift: -8, scale: 1.026, rotate: 0.48, glowDuration: 1680 },
    dark: { duration: 1400, lift: -6, scale: 1.024, rotate: -0.52, glowDuration: 1760 }
  };
  const profile = dragonStage === "drake" ? { ...profiles[element], ...drakeProfiles[element] } : profiles[element];
  return {
    duration: Math.max(520, Math.round(profile.duration * anticipationMultiplier)),
    lift: profile.lift * anticipationLift,
    scale: anticipationLevel === "excited" ? profile.scale + 0.018 : anticipationLevel === "alert" ? profile.scale + 0.01 : profile.scale,
    rotate: anticipationLevel === "excited" ? profile.rotate * 1.5 : profile.rotate,
    glowDuration: profile.glowDuration,
    glowOpacity: profile.glowOpacity
  };
}

function FloatingText({ text, color }: { text: string; color: string }) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    float.setValue(0);
    Animated.timing(float, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, [float, text]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -52] });
  const opacity = float.interpolate({ inputRange: [0, 0.18, 1], outputRange: [0, 1, 0] });
  const scale = float.interpolate({ inputRange: [0, 0.22, 1], outputRange: [0.72, 1.12, 1] });

  return (
    <Animated.Text style={[styles.floatingText, { color, opacity, transform: [{ translateY }, { scale }] }]}>
      {text}
    </Animated.Text>
  );
}

// ─── DragonDisplay ────────────────────────────────────────────────────────────

export default function DragonDisplay({
  element,
  dragonSource,
  backgroundSource,
  children,
  onTap,
  floatingText,
  floatingTextKey = 0,
  showEvolutionBurst = false,
  pathRevealAccent = null,
  dragonStage = "hatchling",
  dragonClass,
  dragonPath,
  dragonTransforms = [],
  reducedMotion = false,
  tapBounceScale = BALANCE.softProgressionAssist.baseTapBounceScale,
  anticipationLevel = "calm",
  returnPresencePhase = null,
  evolutionMomentPhase = null,
  behaviorElement = element,
  artValidationMode = defaultArtValidationMode,
  compact = false,
  showDragon = true
}: {
  element: DragonElement;
  dragonSource?: ImageSourcePropType;
  backgroundSource: ImageSourcePropType;
  children?: ReactNode;
  onTap?: () => void;
  floatingText?: string;
  floatingTextKey?: number;
  showEvolutionBurst?: boolean;
  pathRevealAccent?: DragonPathRevealAccent | null;
  dragonStage?: DragonStage;
  dragonClass?: DragonClass;
  dragonPath?: DragonPath;
  dragonTransforms?: any[];
  reducedMotion?: boolean;
  tapBounceScale?: number;
  anticipationLevel?: AnticipationLevel;
  returnPresencePhase?: ReturnPresencePhase | null;
  evolutionMomentPhase?: EvolutionMomentPhase;
  behaviorElement?: DragonElement;
  artValidationMode?: ArtValidationMode;
  compact?: boolean;
  showDragon?: boolean;
}) {
  const theme = elementTheme[element];
  const breath = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const isResting = returnPresencePhase === "sleeping";
  const isWaking = returnPresencePhase === "waking";
  const isGreeting = returnPresencePhase === "greeting";
  const isEvolutionReveal = evolutionMomentPhase === "reveal";
  const isEvolutionSilhouette = evolutionMomentPhase === "silhouette";
  const isEvolutionWarmup = evolutionMomentPhase === "glow";
  const validationEnabled = __DEV__ && artValidationMode.enabled;
  const thumbnailMode = validationEnabled && artValidationMode.sizeMode === "thumbnail";
  const grayscaleMode = validationEnabled && artValidationMode.grayscale;
  const auraDisabled = validationEnabled && artValidationMode.disableAura;
  const idleFrozen = reducedMotion || (validationEnabled && artValidationMode.freezeIdle);
  const motionProfile = getElementMotionProfile(behaviorElement, anticipationLevel, dragonStage);

  useEffect(() => {
    if (idleFrozen) {
      breath.setValue(0);
      return;
    }
    Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: motionProfile.duration, useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: motionProfile.duration, useNativeDriver: true })
      ])
    ).start();
  }, [breath, idleFrozen, motionProfile.duration]);

  const handleTap = () => {
    if (!reducedMotion) {
      bounce.setValue(0);
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 160, useNativeDriver: true })
      ]).start();
    }
    onTap?.();
  };

  const presenceMotionMultiplier = isResting ? 0.35 : isWaking ? 0.65 : 1;
  const breathScale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1 + (motionProfile.scale - 1) * presenceMotionMultiplier] });
  const breathLift = breath.interpolate({ inputRange: [0, 1], outputRange: [0, motionProfile.lift * presenceMotionMultiplier] });
  const breathSway = breath.interpolate({ inputRange: [0, 1], outputRange: [`${motionProfile.rotate * -1 * presenceMotionMultiplier}deg`, `${motionProfile.rotate * presenceMotionMultiplier}deg`] });
  const bounceScale = bounce.interpolate({ inputRange: [0, 0.45, 1], outputRange: [1, tapBounceScale + 0.012, 1] });
  const bounceLift = bounce.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, -8, 0] });
  const bounceRotate = bounce.interpolate({ inputRange: [0, 0.35, 0.7, 1], outputRange: ["0deg", behaviorElement === "earth" ? "-1deg" : "-2deg", behaviorElement === "water" ? "1.5deg" : "2deg", "0deg"] });
  const stageScale = dragonStage === "wyrm" ? 1.42 : dragonStage === "dragon" ? 1.3 : dragonStage === "drake" ? 1.14 : 1;
  const elementGlowStyle = behaviorElement === "fire" ? styles.dragonDisplayGlowFire : behaviorElement === "water" ? styles.dragonDisplayGlowWater : styles.dragonDisplayGlowEarth;
  const presenceTransforms = isResting
    ? [{ translateY: 20 }, { rotate: behaviorElement === "earth" ? "0deg" : "-6deg" }, { scale: 0.93 }]
    : isWaking
      ? [{ translateY: -8 }, { rotate: behaviorElement === "fire" ? "3deg" : "0deg" }, { scaleY: 1.07 }, { scaleX: 0.98 }]
      : isGreeting
        ? [{ translateY: -6 }, { scale: 1.04 }]
        : isEvolutionReveal
          ? [{ translateY: -10 }, { scale: 1.08 }]
        : [];
  const showAuraFx = !reducedMotion && !auraDisabled;
  const artStage = gameStageToArtStage(dragonStage);

  return (
    <View style={[styles.dragonDisplay, compact && styles.dragonDisplayCompact]}>
      <SafeExpoImage source={backgroundSource} style={styles.dragonDisplayBackground} contentFit="cover" transition={250} />
      <LinearGradient colors={["rgba(8,6,17,0.04)", "rgba(8,6,17,0.95)"]} style={styles.dragonDisplayOverlay}>
        {children}
        {showDragon ? <Pressable onPress={handleTap} style={[styles.dragonTapTarget, compact && styles.dragonTapTargetCompact]}>
          {(isEvolutionWarmup || isEvolutionSilhouette || isEvolutionReveal) && !reducedMotion ? (
            <GlowPulse color={theme.secondary} duration={1900} minOpacity={0.18} maxOpacity={0.42} style={styles.evolutionWarmGlow} />
          ) : null}
          {showAuraFx ? (
            <GlowPulse
              color={theme.primary}
              duration={motionProfile.glowDuration}
              minOpacity={motionProfile.glowOpacity[0]}
              maxOpacity={motionProfile.glowOpacity[1]}
              style={[
                styles.dragonDisplayGlow,
                elementGlowStyle,
                anticipationLevel === "alert" && styles.dragonDisplayGlowAlert,
                anticipationLevel === "excited" && styles.dragonDisplayGlowExcited
              ]}
            />
          ) : auraDisabled ? null : <View style={[styles.dragonDisplayGlow, styles.staticDragonGlow, { backgroundColor: theme.primary }]} />}
          {showAuraFx ? <SafeLottie source={auraEffects[element]} autoPlay loop style={styles.dragonAuraEffect} /> : null}
          {showEvolutionBurst ? <SafeLottie source={evolutionBurstEffect} autoPlay loop={false} style={styles.evolutionBurstEffect} /> : null}
          {isEvolutionReveal && pathRevealAccent && !reducedMotion ? (
            <View pointerEvents="none" style={styles.evolutionPathAccentLayer}>
              <View
                style={[
                  styles.evolutionPathAccentPill,
                  styles.evolutionPathAccentPillLeft,
                  pathRevealAccent.role === "guardian" && styles.evolutionPathAccentPillGuardian,
                  pathRevealAccent.role === "raider" && styles.evolutionPathAccentPillRaider,
                  pathRevealAccent.role === "mystic" && styles.evolutionPathAccentPillMystic
                ]}
              >
                <Text style={styles.evolutionPathAccentKicker}>{pathRevealAccent.roleLabel}</Text>
                <Text style={styles.evolutionPathAccentText}>{pathRevealAccent.powerLabel}</Text>
              </View>
              <View
                style={[
                  styles.evolutionPathAccentPill,
                  styles.evolutionPathAccentPillRight,
                  pathRevealAccent.role === "guardian" && styles.evolutionPathAccentPillGuardian,
                  pathRevealAccent.role === "raider" && styles.evolutionPathAccentPillRaider,
                  pathRevealAccent.role === "mystic" && styles.evolutionPathAccentPillMystic
                ]}
              >
                <Text style={styles.evolutionPathAccentKicker}>{pathRevealAccent.focusLabel}</Text>
                <Text style={styles.evolutionPathAccentText}>{pathRevealAccent.guardLabel}</Text>
              </View>
            </View>
          ) : null}
          <View style={[styles.dragonGroundShadow, thumbnailMode && styles.dragonGroundShadowValidation, compact && styles.dragonGroundShadowCompact, isResting && styles.dragonGroundShadowResting]} />
          <Animated.View
            style={[
              styles.dragonDisplaySprite,
              thumbnailMode && styles.dragonDisplaySpriteValidation,
              compact && !thumbnailMode && styles.dragonDisplaySpriteCompact,
              {
                transform: [
                  { translateY: breathLift },
                  { translateY: bounceLift },
                  { rotate: breathSway },
                  { rotate: bounceRotate },
                  { scale: breathScale },
                  { scale: bounceScale },
                  { scale: stageScale },
                  ...presenceTransforms,
                  ...dragonTransforms
                ]
              }
            ]}
          >
            <DragonImage
              element={element}
              stage={artStage}
              dragonClass={dragonClass}
              path={dragonPath}
              placeholder={dragonSource}
              style={[
                styles.dragonDisplayImage,
                grayscaleMode && styles.dragonDisplayImageValidation,
                isEvolutionSilhouette && styles.dragonDisplayImageSilhouette,
              ] as any}
            />
          </Animated.View>
          {validationEnabled ? <Text style={styles.artValidationBadge}>{getArtValidationBadge(artValidationMode)}</Text> : null}
          {floatingText ? <FloatingText key={floatingTextKey} text={floatingText} color={theme.secondary} /> : null}
        </Pressable> : null}
        {validationEnabled && artValidationMode.lowBrightness ? <View pointerEvents="none" style={styles.lowBrightnessOverlay} /> : null}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  dragonDisplay: {
    borderRadius: uiTheme.radius.xl,
    flex: 1,
    overflow: "hidden",
    ...uiTheme.shadow
  },
  dragonDisplayCompact: {
    borderRadius: uiTheme.radius.lg,
    minHeight: 220
  },
  dragonDisplayBackground: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  dragonDisplayOverlay: {
    flex: 1,
    position: "relative"
  },
  dragonTapTarget: {
    alignItems: "center",
    bottom: 190,
    height: 270,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0
  },
  dragonTapTargetCompact: {
    bottom: 10,
    height: 190
  },
  dragonDisplayGlow: {
    borderRadius: 999,
    height: 218,
    position: "absolute",
    width: 218
  },
  dragonDisplayGlowFire: {
    height: 236,
    width: 236
  },
  dragonDisplayGlowWater: {
    height: 222,
    width: 222
  },
  dragonDisplayGlowEarth: {
    height: 208,
    width: 208
  },
  dragonDisplayGlowAlert: {
    height: 248,
    width: 248
  },
  dragonDisplayGlowExcited: {
    height: 272,
    width: 272
  },
  staticDragonGlow: {
    borderRadius: 999,
    opacity: 0.18,
    position: "absolute"
  },
  dragonAuraEffect: {
    height: 300,
    position: "absolute",
    width: 300
  },
  evolutionBurstEffect: {
    height: 330,
    position: "absolute",
    width: 330,
    zIndex: 4
  },
  evolutionWarmGlow: {
    height: 310,
    position: "absolute",
    width: 310,
    zIndex: 2
  },
  evolutionPathAccentLayer: {
    height: 230,
    position: "absolute",
    width: 300,
    zIndex: 7
  },
  evolutionPathAccentPill: {
    backgroundColor: "rgba(8,6,17,0.76)",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: "absolute",
    shadowColor: "#fef3c7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10
  },
  evolutionPathAccentPillLeft: {
    left: 8,
    top: 34
  },
  evolutionPathAccentPillRight: {
    bottom: 42,
    right: 8
  },
  evolutionPathAccentPillGuardian: {
    borderColor: "rgba(125,211,252,0.82)"
  },
  evolutionPathAccentPillRaider: {
    borderColor: "rgba(251,113,133,0.84)"
  },
  evolutionPathAccentPillMystic: {
    borderColor: "rgba(196,181,253,0.84)"
  },
  evolutionPathAccentKicker: {
    color: "#fef3c7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  evolutionPathAccentText: {
    color: "#fff7ed",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 2
  },
  dragonGroundShadow: {
    backgroundColor: "rgba(2,1,8,0.42)",
    borderRadius: 999,
    bottom: 24,
    height: 28,
    position: "absolute",
    transform: [{ scaleX: 2.6 }],
    width: 92,
    zIndex: 3
  },
  dragonGroundShadowResting: {
    bottom: 18,
    opacity: 0.55,
    transform: [{ scaleX: 2.9 }]
  },
  dragonGroundShadowValidation: {
    bottom: 48,
    height: 18,
    transform: [{ scaleX: 1.7 }],
    width: 70
  },
  dragonGroundShadowCompact: {
    bottom: 20,
    height: 18,
    transform: [{ scaleX: 1.8 }],
    width: 70
  },
  dragonDisplaySprite: {
    height: 220,
    width: 220,
    zIndex: 5
  },
  dragonDisplaySpriteCompact: {
    height: 158,
    width: 158
  },
  dragonDisplaySpriteValidation: {
    height: 128,
    width: 128
  },
  dragonDisplayImage: {
    height: "100%",
    width: "100%"
  },
  dragonDisplayImageValidation: {
    tintColor: "#9a9a9a"
  },
  dragonDisplayImageSilhouette: {
    opacity: 0.38,
    tintColor: "#fff1bd"
  },
  artValidationBadge: {
    backgroundColor: "rgba(5,4,12,0.82)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    bottom: -6,
    color: "#e8e8e8",
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: "absolute",
    textTransform: "uppercase",
    zIndex: 8
  },
  lowBrightnessOverlay: {
    backgroundColor: "rgba(0,0,0,0.48)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 7
  },
  floatingText: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.5,
    position: "absolute",
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { height: 2, width: 0 },
    textShadowRadius: 6,
    top: 54,
    zIndex: 8
  },
});
