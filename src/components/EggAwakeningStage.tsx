import { useState, useCallback, useEffect, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { elementTheme } from "../content";
import { eggCrackStageImages, eggHatchAnimations, eggImages, hatchlingImages } from "../constants/assets";
import { SafeExpoImage } from "../ui/SafeMedia";
import { APP_VERSION, uiTheme } from "../constants/theme";
import type { DragonElement, GameAction, GameState } from "../types";
import type { DragonClass } from "../constants/dragonArt";
import { evolutionPreviewElements } from "../evolutionPreview";
import DragonImage from "./DragonImage";
import CrackOverlay from "../ui/CrackOverlay";
import EggHatchBurst from "../ui/EggHatchBurst";
import FloatingLayer from "../ui/FloatingLayer";
import GlowPulse from "../ui/GlowPulse";
import ParticleField from "../ui/ParticleField";

type EggSelectorOption = {
  id: string;
  element: DragonElement;
  label: string;
  sigil: string;
  image: ImageSourcePropType;
  primary: string;
  secondary: string;
  identity: string;
  branches: Array<{ name: string; description: string }>;
  placeholder: string;
  style: ViewStyle;
};

// Branch order is guardian(0)/raider(1)/mystic(2) for all five elements — each
// branch.description starts with "Guardian branch."/"Raider branch."/"Mystic branch."
// If the data order ever changes, derive the class from branch.description instead.
const DRAKE_CLASS_BY_INDEX: DragonClass[] = ['guardian', 'raider', 'mystic'];

const eggSelectorOptions: EggSelectorOption[] = [
  {
    id: "ember",
    element: "fire",
    label: "Fire",
    sigil: "F",
    image: eggImages.fire,
    primary: "#ff7a3d",
    secondary: "#ffd0a3",
    identity: "Fire is the aggressive starter: burn pressure, crit spikes, and fast fights. It gets a type edge into Earth enemies, so it feels like momentum breaking armor.",
    branches: [
      { name: "Ash Warden", description: "Guardian branch. Turns flame into shields, counter-burns, and safer boss trades." },
      { name: "Inferno Raider", description: "Raider branch. Pushes explosive openers, crit breath, and high-risk damage tempo." },
      { name: "Sunscale Guide", description: "Mystic branch. Reads heat shimmer for balanced offense, defense, and safer route decisions." }
    ],
    placeholder: "rgba(255,122,61,0.18)",
    style: { left: 134, top: 16, zIndex: 3 }
  },
  {
    id: "tide",
    element: "water",
    label: "Water",
    sigil: "W",
    image: eggImages.water,
    primary: "#5fd5ff",
    secondary: "#c8f4ff",
    identity: "Water is the control starter: healing tides, shields, dodges, and patient counterplay. It gets a type edge into Fire enemies, cooling burst damage into manageable trades.",
    branches: [
      { name: "Reef Guardian", description: "Guardian branch. Builds thick tide shields, recovery windows, and pressure absorption." },
      { name: "Tide Runner", description: "Raider branch. Uses surf-speed combos and slippery offense to chain momentum." },
      { name: "Tide Mystic", description: "Mystic branch. Bends the battlefield with moon tides, counters, and predictive mitigation." }
    ],
    placeholder: "rgba(95,213,255,0.16)",
    style: { left: 22, top: 98, zIndex: 2 }
  },
  {
    id: "light",
    element: "light",
    label: "Light",
    sigil: "L",
    image: eggImages.light,
    primary: "#ffe58f",
    secondary: "#fff7c2",
    identity: "Light is the heroic precision starter: halos, recovery, clean crit clarity, and radiant support. Light and Dark are rivals, each gaining attack bonuses into the other.",
    branches: [
      { name: "Halo Warden", description: "Guardian branch. Protects with visible shield rings, recovery, and ally-safe mitigation." },
      { name: "Sunlance Striker", description: "Raider branch. Focuses beams into sharp crit-forward burst with clear hit payoff." },
      { name: "Aurora Seer", description: "Mystic branch. Rotates recovery, speed, cleansing rays, and long-route sustain." }
    ],
    placeholder: "rgba(255,229,143,0.18)",
    style: { left: 65, top: 230, zIndex: 2 }
  },
  {
    id: "root",
    element: "earth",
    label: "Earth",
    sigil: "E",
    image: eggImages.earth,
    primary: "#7ee08a",
    secondary: "#d8ffd7",
    identity: "Earth is the bruiser starter: defense, thorns, hoard scaling, and heavy evolution bodies. It gets a type edge into Water enemies by anchoring against flow.",
    branches: [
      { name: "Stoneback Sentinel", description: "Guardian branch. Becomes the fortress path with the strongest mitigation and stable trades." },
      { name: "Crystal Fang", description: "Raider branch. Breaks armor with gem claws while staying tougher than a glass cannon." },
      { name: "Rootspeaker", description: "Mystic branch. Controls fights with roots, rune cycles, and steady defensive pressure." }
    ],
    placeholder: "rgba(126,224,138,0.16)",
    style: { left: 246, top: 98, zIndex: 2 }
  },
  {
    id: "dark",
    element: "dark",
    label: "Dark",
    sigil: "D",
    image: eggImages.dark,
    primary: "#8b5cf6",
    secondary: "#d9ccff",
    identity: "Dark is the eclipse starter: curses, ambushes, lifesteal pressure, and tactical debuffs. Dark and Light are rivals, each gaining attack bonuses into the other.",
    branches: [
      { name: "Void Warden", description: "Guardian branch. Protects by folding enemy force into shadow wards and curse shields." },
      { name: "Nightfang Stalker", description: "Raider branch. Opens from concealment with crit ambushes, curse marks, and sustain bites." },
      { name: "Eclipse Seer", description: "Mystic branch. Times debuffs, dodge windows, and shadow recovery around eclipse turns." }
    ],
    placeholder: "rgba(139,92,246,0.18)",
    style: { left: 203, top: 230, zIndex: 2 }
  }
];

export function EnergyMeters({ scores }: { scores: Record<DragonElement, number> }) {
  return (
    <View style={styles.energyMeters}>
      {(Object.keys(scores) as DragonElement[]).map((element) => {
        const theme = elementTheme[element];
        return (
          <View key={element} style={styles.energyMeter}>
            <Text style={[styles.energyMeterLabel, { color: theme.secondary }]}>{theme.label}</Text>
            <View style={styles.energyPips}>
              {Array.from({ length: 3 }).map((_, index) => (
                <View key={index} style={[styles.energyPip, index < scores[element] && { backgroundColor: theme.primary }]} />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function EggAwakeningStage({
  state,
  dispatch
}: {
  state: GameState;
  dispatch: (action: GameAction) => void;
}) {
  const swirl = useRef(new Animated.Value(0)).current;
  const crack = useRef(new Animated.Value(0)).current;
  const crackProgress = useRef(new Animated.Value(0)).current;
  const eggJolt = useRef(new Animated.Value(0)).current;
  const hatchBurst = useRef(new Animated.Value(0)).current;
  const hatchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedElement = state.dragon.element;
  const focusedElement = selectedElement ?? "light";
  const theme = elementTheme[focusedElement];
  const eggTaps = state.eggTaps ?? 0;
  const visibleEggStage = state.phase === "hatching" ? 3 : Math.min(3, eggTaps);
  // CRACK FRAMES: swap back to per-stage source when animation art is wired —
  //   const focusedEggImage = eggCrackStageImages[focusedElement][visibleEggStage];
  const focusedEggImage = eggImages[focusedElement];
  const hatchAnim = eggHatchAnimations[focusedElement];
  const hasSelectedEgg = Boolean(selectedElement);
  const [selectedOriginId, setSelectedOriginId] = useState<string | null>(null);
  const selectedOriginOption = eggSelectorOptions.find((option) => option.element === selectedElement);
  const previewOriginOption = selectedOriginId ? eggSelectorOptions.find((option) => option.id === selectedOriginId) : null;
  const previewEvolutionElement = previewOriginOption ? evolutionPreviewElements.find((element) => element.id === previewOriginOption.element) : null;
  const highlightedOriginOption = selectedOriginOption ?? previewOriginOption ?? eggSelectorOptions[0];
  const [loadedEggSelectorImages, setLoadedEggSelectorImages] = useState<Record<string, boolean>>({});
  const nextTapLabel = eggTaps === 0 ? "Tap to wake the shell" : eggTaps === 1 ? "Tap again — the shell is splitting" : "One more tap to hatch";
  const showHatchClip = state.phase === "hatching" && !!hatchAnim;
  const markEggSelectorImageLoaded = useCallback((id: string) => {
    setLoadedEggSelectorImages((current) => (current[id] ? current : { ...current, [id]: true }));
  }, []);

  useEffect(() => {
    eggSelectorOptions.forEach((option) => {
      const resolved = Image.resolveAssetSource(option.image);
      if (!resolved?.uri) {
        return;
      }
      Image.prefetch(resolved.uri)
        .then(() => markEggSelectorImageLoaded(option.id))
        .catch(() => undefined);
    });
  }, [markEggSelectorImageLoaded]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(swirl, {
        toValue: 1,
        duration: 4200,
        useNativeDriver: true
      })
    ).start();
  }, [swirl]);

  useEffect(() => {
    if (state.phase === "hatching") {
      hatchBurst.setValue(0);
      if (hatchAnim) {
        crack.setValue(0);
        hatchTimerRef.current = setTimeout(() => {
          dispatch({ type: "finishHatching" });
        }, hatchAnim.durationMs);
      } else {
        Animated.parallel([
          Animated.timing(crack, { toValue: 1, duration: 1650, useNativeDriver: true }),
          Animated.timing(crackProgress, { toValue: 1, duration: 520, useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(260),
            Animated.timing(hatchBurst, { toValue: 1, duration: 1120, useNativeDriver: true })
          ]),
          Animated.sequence([
            Animated.timing(eggJolt, { toValue: 1, duration: 130, useNativeDriver: true }),
            Animated.timing(eggJolt, { toValue: 0, duration: 90, useNativeDriver: true }),
            Animated.timing(eggJolt, { toValue: 1, duration: 95, useNativeDriver: true }),
            Animated.timing(eggJolt, { toValue: 0, duration: 80, useNativeDriver: true })
          ])
        ]).start(() => {
          dispatch({ type: "finishHatching" });
        });
      }
    } else {
      crack.setValue(0);
      hatchBurst.setValue(0);
    }
    return () => {
      if (hatchTimerRef.current !== null) {
        clearTimeout(hatchTimerRef.current);
        hatchTimerRef.current = null;
      }
    };
  }, [crack, crackProgress, dispatch, eggJolt, hatchAnim, hatchBurst, state.phase]);

  useEffect(() => {
    if (state.phase === "hatching") {
      return;
    }

    Animated.timing(crackProgress, {
      toValue: eggTaps / 3,
      duration: 360,
      useNativeDriver: true
    }).start();

    if (eggTaps > 0) {
      Animated.sequence([
        Animated.timing(eggJolt, { toValue: 1, duration: 90, useNativeDriver: true }),
        Animated.timing(eggJolt, { toValue: 0, duration: 110, useNativeDriver: true })
      ]).start();
    }
  }, [eggTaps, crackProgress, eggJolt, state.phase]);

  const rotation = swirl.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const reverseRotation = swirl.interpolate({ inputRange: [0, 1], outputRange: ["360deg", "0deg"] });
  const hatchScale = crack.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.08, 1.24] });
  const hatchOpacity = crack.interpolate({ inputRange: [0, 0.62, 1], outputRange: [1, 0.88, 0.18] });
  const flashOpacity = crack.interpolate({ inputRange: [0, 0.35, 0.66, 1], outputRange: [0, 0.12, 0.46, 0.08] });
  const shellChargeOpacity = crackProgress.interpolate({ inputRange: [0, 0.34, 0.68, 1], outputRange: [0.05, 0.12, 0.22, 0.42] });
  const shellChargeScale = crackProgress.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1.18] });
  const hatchlingRevealOpacity = crack.interpolate({ inputRange: [0, 0.58, 1], outputRange: [0, 0, 1] });
  const hatchlingRevealScale = crack.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1.12] });
  const eggShakeX = eggJolt.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -8, 7, -5, 0] });
  const eggShakeRotate = eggJolt.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: ["0deg", "-3deg", "3deg", "-2deg", "0deg"] });
  const shellSplit = crack.interpolate({ inputRange: [0, 0.42, 0.75, 1], outputRange: [0, 0, 22, 62] });
  const shellLift = crack.interpolate({ inputRange: [0, 0.42, 1], outputRange: [0, 0, -18] });
  const leftShellRotate = crack.interpolate({ inputRange: [0, 0.42, 1], outputRange: ["0deg", "0deg", "-18deg"] });
  const rightShellRotate = crack.interpolate({ inputRange: [0, 0.42, 1], outputRange: ["0deg", "0deg", "18deg"] });
  const splitShellOpacity = crack.interpolate({ inputRange: [0, 0.36, 0.9, 1], outputRange: [0, 0, 0.9, 0.2] });

  return (
    <View style={styles.guidedStage}>
      <View style={styles.eggOnlyScene}>
        {!showHatchClip ? <ParticleField color={theme.secondary} count={12} /> : null}
        <LinearGradient colors={["#07030f", theme.dark, "#020104"]} style={[styles.eggOnlyOverlay, !hasSelectedEgg && styles.eggOnlyOverlayOriginChoice]}>
          <View style={styles.titleScreenHeader}>
            <Text style={styles.kicker}>Isekai Dragons</Text>
            <Text style={styles.titleScreenVersion}>v{APP_VERSION}</Text>
          </View>

          {hasSelectedEgg ? <View style={styles.eggStageCenter}>
            {!showHatchClip ? (
              <>
                <Animated.View style={[styles.energyMoteOrbit, { transform: [{ rotate: rotation }] }]}>
                  <View style={[styles.energyMote, { backgroundColor: theme.primary }]} />
                  <View style={[styles.energyMoteSmall, { backgroundColor: theme.secondary }]} />
                </Animated.View>
                <Animated.View style={[styles.energyMoteOrbitAlt, { transform: [{ rotate: reverseRotation }] }]}>
                  <View style={[styles.energyMoteSmall, { backgroundColor: theme.primary }]} />
                  <View style={[styles.energyMote, { backgroundColor: theme.secondary }]} />
                </Animated.View>
              </>
            ) : null}
            <Animated.View pointerEvents="none" style={[styles.hatchFlash, { opacity: flashOpacity, backgroundColor: theme.secondary }]} />
            {!showHatchClip ? <Animated.View pointerEvents="none" style={[styles.shellChargeAura, { opacity: shellChargeOpacity, borderColor: theme.secondary, shadowColor: theme.primary, transform: [{ scale: shellChargeScale }] }]} /> : null}
            <EggHatchBurst progress={hatchBurst} color={theme.secondary} accentColor={theme.primary} />
            {!showHatchClip ? <GlowPulse color={theme.primary} /> : null}
            <View>
              <FloatingLayer distance={12} scale={1.055} sway={1.3} duration={1450}>
                <Animated.View style={{ opacity: hatchOpacity, transform: [{ translateX: eggShakeX }, { rotate: eggShakeRotate }, { scale: hatchScale }] }}>
                  <View style={styles.focusEggWrap}>
                    <Image key={`focus-${focusedElement}-${visibleEggStage}`} source={focusedEggImage} style={styles.focusEggImage} resizeMode="contain" />
                    <Animated.View pointerEvents="none" style={[styles.shellSurfaceGlow, { opacity: shellChargeOpacity, backgroundColor: theme.secondary }]} />
                    <CrackOverlay breaking={crack} />
                  </View>
                </Animated.View>
              </FloatingLayer>
            </View>
            {!showHatchClip ? (
              <>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.shellHalfClip,
                    styles.shellLeftClip,
                    {
                      opacity: splitShellOpacity,
                      transform: [{ translateX: Animated.multiply(shellSplit, -1) }, { translateY: shellLift }, { rotate: leftShellRotate }]
                    }
                  ]}
                >
                  <Image key={`shell-left-${focusedElement}`} source={eggImages[focusedElement]} style={styles.shellHalfImage} resizeMode="contain" />
                </Animated.View>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.shellHalfClip,
                    styles.shellRightClip,
                    {
                      opacity: splitShellOpacity,
                      transform: [{ translateX: shellSplit }, { translateY: shellLift }, { rotate: rightShellRotate }]
                    }
                  ]}
                >
                  <Image key={`shell-right-${focusedElement}`} source={eggImages[focusedElement]} style={[styles.shellHalfImage, styles.shellRightImage]} resizeMode="contain" />
                </Animated.View>
                <Animated.Image
                  source={hatchlingImages[focusedElement]}
                  resizeMode="contain"
                  style={[
                    styles.evolutionHatchling,
                    {
                      opacity: hatchlingRevealOpacity,
                      transform: [{ scale: hatchlingRevealScale }]
                    }
                  ]}
                />
              </>
            ) : null}
          </View> : null}

          <View style={[styles.eggStartCard, !hasSelectedEgg && styles.eggStartCardOriginChoice]}>
            {hasSelectedEgg ? (
              <>
                <Text style={styles.choiceNumber}>Chosen origin</Text>
                <Text style={[styles.panelTitle, { color: highlightedOriginOption.secondary }]}>{`${highlightedOriginOption.label} Egg`}</Text>
                <Text style={styles.eggStartText}>{nextTapLabel}</Text>
              </>
            ) : (
              <>
                <Text style={styles.eggConstellationTitle}>
                  {previewOriginOption ? `${previewOriginOption.label} origin` : "Choose an origin egg"}
                </Text>
                <Text style={styles.eggConstellationHint}>
                  {previewOriginOption ? previewOriginOption.identity : "Choose one of five elemental origins."}
                </Text>
              </>
            )}
            {!hasSelectedEgg && !previewOriginOption ? (
              <View style={styles.eggSelectionFan}>
                <View pointerEvents="none" style={styles.eggPentagonLineTop} />
                <View pointerEvents="none" style={styles.eggPentagonLineUpperRight} />
                <View pointerEvents="none" style={styles.eggPentagonLineLowerRight} />
                <View pointerEvents="none" style={styles.eggPentagonLineLowerLeft} />
                <View pointerEvents="none" style={styles.eggPentagonLineUpperLeft} />
                {eggSelectorOptions.map((option) => {
                  const imageLoaded = Boolean(loadedEggSelectorImages[option.id]);
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setSelectedOriginId(option.id)}
                      style={[
                        styles.eggSelectionCard,
                        { borderColor: option.primary, shadowColor: option.primary },
                        option.style
                      ]}
                    >
                      <View style={[styles.eggSelectionPlaceholder, { backgroundColor: option.placeholder, borderColor: option.primary }]}>
                        <Text style={[styles.eggSelectionSigil, { color: option.secondary }]}>{option.sigil}</Text>
                      </View>
                      <Image
                        source={option.image}
                        style={[styles.eggSelectionImage, !imageLoaded && styles.eggSelectionImageLoading]}
                        resizeMode="contain"
                        onLoad={() => markEggSelectorImageLoaded(option.id)}
                      />
                      <View style={[styles.eggSelectionGlow, { backgroundColor: option.primary }]} />
                      <Text style={[styles.eggSelectionLabel, { color: option.secondary }]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : !hasSelectedEgg && previewOriginOption ? (
              <View style={[styles.originDetailCard, { borderColor: previewOriginOption.primary, shadowColor: previewOriginOption.primary }]}>
                <View style={styles.originDetailHeroRow}>
                  <View style={[styles.originDetailEggFrame, { borderColor: previewOriginOption.primary, backgroundColor: previewOriginOption.placeholder }]}>
                    <Image source={previewOriginOption.image} style={styles.originDetailEggImage} resizeMode="contain" />
                  </View>
                  <View style={styles.originDetailCopy}>
                    <Text style={[styles.originDetailLabel, { color: previewOriginOption.secondary }]}>{previewOriginOption.label}</Text>
                    <Text style={styles.originDetailIdentity}>{previewOriginOption.identity}</Text>
                  </View>
                </View>
                <Text style={styles.originBranchesTitle}>First three evolution branches</Text>
                {previewOriginOption.branches.map((branch, index) => {
                  const drakeClass = DRAKE_CLASS_BY_INDEX[index];
                  return (
                    <View key={branch.name} style={styles.originBranchRow}>
                      <Text style={[styles.originBranchNumber, { color: previewOriginOption.secondary }]}>{index + 1}</Text>
                      <View style={[styles.originBranchImageFrame, { borderColor: previewOriginOption.primary }]}>
                        <DragonImage element={previewOriginOption.element} stage="drake" dragonClass={drakeClass} style={styles.originBranchImage} resizeMode="contain" />
                      </View>
                      <View style={styles.originBranchCopy}>
                        <Text style={styles.originBranchText}>{branch.name}</Text>
                        <Text style={styles.originBranchDescription}>{branch.description}</Text>
                        <Text style={styles.originBranchPreviewLabel}>{`${drakeClass.charAt(0).toUpperCase()}${drakeClass.slice(1)} drake`}</Text>
                      </View>
                    </View>
                  );
                })}
                <View style={styles.originTypeChart}>
                  <Text style={styles.originTypeChartTitle}>Type chart</Text>
                  <View style={styles.originTypeChartCycle}>
                    <View style={[styles.originTypeChip, styles.originTypeChipFire]}>
                      <Text style={styles.originTypeChipText}>Fire</Text>
                    </View>
                    <Text style={styles.originTypeArrow}>›</Text>
                    <View style={[styles.originTypeChip, styles.originTypeChipEarth]}>
                      <Text style={styles.originTypeChipText}>Earth</Text>
                    </View>
                    <Text style={styles.originTypeArrow}>›</Text>
                    <View style={[styles.originTypeChip, styles.originTypeChipWater]}>
                      <Text style={styles.originTypeChipText}>Water</Text>
                    </View>
                    <Text style={styles.originTypeArrow}>›</Text>
                    <View style={[styles.originTypeChip, styles.originTypeChipFire]}>
                      <Text style={styles.originTypeChipText}>Fire</Text>
                    </View>
                  </View>
                  <View style={styles.originTypeRivalRow}>
                    <View style={[styles.originTypeChip, styles.originTypeChipLight]}>
                      <Text style={styles.originTypeChipDarkText}>Light</Text>
                    </View>
                    <Text style={styles.originTypeRivalArrow}>⇄</Text>
                    <View style={[styles.originTypeChip, styles.originTypeChipDark]}>
                      <Text style={styles.originTypeChipText}>Dark</Text>
                    </View>
                    <Text style={styles.originTypeBonusText}>mutual bonus</Text>
                  </View>
                </View>
                <View style={styles.originDetailActions}>
                  <Pressable style={styles.originBackButton} onPress={() => setSelectedOriginId(null)}>
                    <Text style={styles.originBackButtonText}>Go back</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.originConfirmButton, { backgroundColor: previewOriginOption.primary }]}
                    onPress={() => dispatch({ type: "selectEgg", element: previewOriginOption.element })}
                  >
                    <Text style={styles.originConfirmButtonText}>Choose this egg</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.eggTapProgressRow}>
                {[0, 1, 2].map((step) => (
                  <View key={step} style={[styles.eggTapProgressDot, step < eggTaps && { backgroundColor: theme.secondary, borderColor: theme.secondary }]} />
                ))}
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
      {state.phase === "hatching" && hatchAnim ? (
        <View style={styles.hatchClipFullscreen}>
          <SafeExpoImage source={hatchAnim.source} contentFit="contain" style={StyleSheet.absoluteFillObject} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  guidedStage: {
    flex: 1,
    paddingBottom: 16
  },
  hatchClipFullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000"
  },
  eggOnlyScene: {
    borderRadius: 30,
    flex: 1,
    overflow: "hidden"
  },
  eggOnlyOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 18
  },
  eggOnlyOverlayOriginChoice: {
    justifyContent: "flex-start"
  },
  titleScreenHeader: {
    alignItems: "center",
    gap: 4,
    paddingTop: 8
  },
  kicker: {
    color: "#a99bd9",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  titleScreenVersion: {
    color: uiTheme.colors.gold,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  eggStageCenter: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 260
  },
  energyMoteOrbit: {
    height: 230,
    justifyContent: "space-between",
    position: "absolute",
    width: 230
  },
  energyMoteOrbitAlt: {
    height: 186,
    justifyContent: "space-between",
    position: "absolute",
    transform: [{ rotate: "40deg" }],
    width: 186
  },
  energyMote: {
    borderRadius: 999,
    height: 16,
    shadowColor: "#fff",
    shadowOpacity: 0.9,
    shadowRadius: 10,
    width: 16
  },
  energyMoteSmall: {
    alignSelf: "flex-end",
    borderRadius: 999,
    height: 10,
    opacity: 0.82,
    width: 10
  },
  hatchFlash: {
    borderRadius: 150,
    height: 270,
    position: "absolute",
    width: 270
  },
  shellChargeAura: {
    borderRadius: 999,
    borderWidth: 2,
    height: 222,
    position: "absolute",
    width: 182,
    zIndex: 1,
    shadowOpacity: 0.62,
    shadowRadius: 22
  },
  focusEggWrap: {
    alignItems: "center",
    height: 250,
    justifyContent: "center",
    position: "relative",
    width: 250
  },
  focusEggImage: {
    height: 250,
    width: 250
  },
  shellSurfaceGlow: {
    borderRadius: 999,
    height: 122,
    left: 63,
    opacity: 0.24,
    position: "absolute",
    top: 56,
    width: 112,
    zIndex: 1
  },
  shellHalfClip: {
    height: 250,
    overflow: "hidden",
    position: "absolute",
    width: 125
  },
  shellLeftClip: {
    left: "50%",
    marginLeft: -125
  },
  shellRightClip: {
    left: "50%"
  },
  shellHalfImage: {
    height: 250,
    width: 250
  },
  shellRightImage: {
    marginLeft: -125
  },
  evolutionHatchling: {
    height: 280,
    position: "absolute",
    width: 280
  },
  eggStartCard: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    marginTop: -8,
    paddingHorizontal: 0,
    paddingVertical: 0
  },
  eggStartCardOriginChoice: {
    marginTop: 18
  },
  choiceNumber: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 4,
    textTransform: "uppercase"
  },
  panelTitle: {
    color: "#fff8ef",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8
  },
  eggStartText: {
    color: "#cfc5ee",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
    marginTop: 6,
    textAlign: "center"
  },
  eggConstellationTitle: {
    color: "#fff8ef",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
    textTransform: "uppercase"
  },
  eggConstellationHint: {
    color: "#cfc5ee",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 5,
    opacity: 0.86,
    textAlign: "center"
  },
  eggSelectionFan: {
    alignSelf: "center",
    height: 352,
    marginTop: 16,
    overflow: "visible",
    position: "relative",
    width: 360
  },
  eggPentagonLineTop: {
    backgroundColor: "rgba(255,248,239,0.16)",
    height: 2,
    left: 55,
    position: "absolute",
    top: 103,
    transform: [{ rotate: "-36deg" }],
    width: 139
  },
  eggPentagonLineUpperRight: {
    backgroundColor: "rgba(255,248,239,0.16)",
    height: 2,
    left: 167,
    position: "absolute",
    top: 103,
    transform: [{ rotate: "36deg" }],
    width: 139
  },
  eggPentagonLineLowerRight: {
    backgroundColor: "rgba(255,248,239,0.16)",
    height: 2,
    left: 201,
    position: "absolute",
    top: 210,
    transform: [{ rotate: "108deg" }],
    width: 139
  },
  eggPentagonLineLowerLeft: {
    backgroundColor: "rgba(255,248,239,0.16)",
    height: 2,
    left: 111,
    position: "absolute",
    top: 276,
    width: 138
  },
  eggPentagonLineUpperLeft: {
    backgroundColor: "rgba(255,248,239,0.16)",
    height: 2,
    left: 20,
    position: "absolute",
    top: 210,
    transform: [{ rotate: "-108deg" }],
    width: 139
  },
  eggSelectionCard: {
    alignItems: "center",
    backgroundColor: "rgba(7,8,18,0.66)",
    borderRadius: 999,
    borderWidth: 1,
    height: 92,
    justifyContent: "center",
    overflow: "visible",
    padding: 4,
    position: "absolute",
    shadowOpacity: 0.42,
    shadowRadius: 14,
    width: 92
  },
  eggSelectionPlaceholder: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    bottom: 5,
    justifyContent: "center",
    left: 5,
    opacity: 0.9,
    position: "absolute",
    right: 5,
    top: 5
  },
  eggSelectionSigil: {
    fontSize: 22,
    fontWeight: "900",
    opacity: 0.42
  },
  eggSelectionImage: {
    height: 80,
    width: 80
  },
  eggSelectionImageLoading: {
    opacity: 0.86
  },
  eggSelectionGlow: {
    borderRadius: 999,
    bottom: 8,
    height: 8,
    opacity: 0.32,
    position: "absolute",
    width: 46
  },
  eggSelectionLabel: {
    bottom: -20,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    position: "absolute",
    textAlign: "center",
    textTransform: "uppercase"
  },
  originDetailCard: {
    backgroundColor: "rgba(6,5,16,0.82)",
    borderRadius: 26,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
    shadowOpacity: 0.32,
    shadowRadius: 18,
    width: "92%"
  },
  originDetailHeroRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14
  },
  originDetailEggFrame: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 98,
    justifyContent: "center",
    width: 98
  },
  originDetailEggImage: {
    height: 88,
    width: 88
  },
  originDetailCopy: {
    flex: 1
  },
  originDetailLabel: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1.6,
    textTransform: "uppercase"
  },
  originDetailIdentity: {
    color: "#e8ddff",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
    marginTop: 5
  },
  originBranchesTitle: {
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginTop: 14,
    textTransform: "uppercase"
  },
  originBranchRow: {
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    flexDirection: "row",
    gap: 10,
    marginTop: 7,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  originBranchNumber: {
    fontSize: 12,
    fontWeight: "900",
    width: 16
  },
  originBranchImageFrame: {
    alignItems: "center",
    backgroundColor: "rgba(4,5,12,0.52)",
    borderRadius: 14,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    overflow: "hidden",
    width: 54
  },
  originBranchImage: {
    height: 50,
    width: 50
  },
  originBranchCopy: {
    flex: 1
  },
  originBranchText: {
    color: "#fff8ef",
    fontSize: 13,
    fontWeight: "900"
  },
  originBranchDescription: {
    color: "#cec5ee",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15,
    marginTop: 2
  },
  originBranchPreviewLabel: {
    color: "#9f95c8",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginTop: 4,
    textTransform: "uppercase"
  },
  originTypeChart: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
    padding: 10
  },
  originTypeChartTitle: {
    color: "#fff8ef",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  originTypeChartCycle: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 8
  },
  originTypeRivalRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 8
  },
  originTypeChip: {
    alignItems: "center",
    borderRadius: 999,
    minWidth: 54,
    paddingHorizontal: 9,
    paddingVertical: 6
  },
  originTypeChipFire: {
    backgroundColor: "rgba(255,122,61,0.92)"
  },
  originTypeChipEarth: {
    backgroundColor: "rgba(126,224,138,0.9)"
  },
  originTypeChipWater: {
    backgroundColor: "rgba(95,213,255,0.9)"
  },
  originTypeChipLight: {
    backgroundColor: "rgba(255,229,143,0.92)"
  },
  originTypeChipDark: {
    backgroundColor: "rgba(139,92,246,0.92)"
  },
  originTypeChipText: {
    color: "#130b18",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  originTypeChipDarkText: {
    color: "#21180c",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  originTypeArrow: {
    color: "#fff8ef",
    fontSize: 17,
    fontWeight: "900",
    marginHorizontal: -1
  },
  originTypeRivalArrow: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900"
  },
  originTypeBonusText: {
    color: "#cec5ee",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  originDetailActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  originBackButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 16,
    flex: 1,
    paddingVertical: 12
  },
  originBackButtonText: {
    color: "#e8ddff",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  originConfirmButton: {
    alignItems: "center",
    borderRadius: 16,
    flex: 1.4,
    paddingVertical: 12
  },
  originConfirmButtonText: {
    color: "#160914",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  eggTapProgressRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 14
  },
  eggTapProgressDot: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    height: 10
  },
  energyMeters: {
    flexDirection: "row",
    gap: 8
  },
  energyMeter: {
    backgroundColor: "rgba(0,0,0,0.24)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    padding: 10
  },
  energyMeterLabel: {
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 7,
    textTransform: "uppercase"
  },
  energyPips: {
    flexDirection: "row",
    gap: 5
  },
  energyPip: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    flex: 1,
    height: 8
  }
});
