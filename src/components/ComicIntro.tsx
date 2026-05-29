// src/components/ComicIntro.tsx
//
// Shared origin intro shown ONCE, after the egg hatches, before the den.
// Flow:  Egg → Hatch → <ComicIntro /> → Den
//
// Text is pulled from docs/story/story-spine.md (the isekai / Warden's Vault
// origin). Art is placeholder for now — drop illustrated panels in later by
// setting `image` on each panel in ORIGIN_PANELS (or pass your own `panels`).
//
// Usage (gate it behind a "seen intro" flag in saved state):
//   {phase === 'intro' && (
//     <ComicIntro
//       accentColor={elementTheme[element].primary}
//       onComplete={() => dispatch({ type: 'finishIntro' })}
//     />
//   )}

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Animated,
  StyleSheet,
  ImageSourcePropType,
  useWindowDimensions,
} from 'react-native';

export type ComicPanel = {
  /** Illustrated panel art. Leave undefined to show a labeled placeholder. */
  image?: ImageSourcePropType;
  /** Narration caption (kept short for mobile). */
  text: string;
  /** Tiny scene label shown on the placeholder while art is pending. */
  sceneLabel?: string;
};

// ── Origin story panels (canon: story-spine.md) ────────────────────────────
export const ORIGIN_PANELS: ComicPanel[] = [
  {
    image: require('../../assets/comic/ComicIntroPanel1.png'),
    sceneLabel: 'The End',
    text: 'In your world, your story ended. The last thing you felt was the dark, and falling.',
  },
  {
    image: require('../../assets/comic/ComicIntroPanel2.png'),
    sceneLabel: 'The Crossing',
    text: 'But you did not end. Your soul was pulled across — into a realm of magic, deep beneath the Mystic Meadow, into the sealed dark of the Warden\u2019s Vault.',
  },
  {
    image: require('../../assets/comic/ComicIntroPanel3.png'),
    sceneLabel: 'The Truth',
    text: 'You did not wake as a hero. The Elder Wyrm hid one last egg here — a nursery, not a prison. The soul it cradles is yours. You are the dragon now.',
  },
  {
    image: require('../../assets/comic/ComicIntroPanel4.png'),
    sceneLabel: 'The Awakening',
    text: 'The shell breaks. In the dark, Shadow Minions stir — testing whether you are prey, or heir. Two destinies wait ahead. Rise.',
  },
];

type Props = {
  onComplete: () => void;
  panels?: ComicPanel[];
  accentColor?: string;
};

export default function ComicIntro({ onComplete, panels = ORIGIN_PANELS, accentColor = '#b14ee0' }: Props) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;
  const hint = useRef(new Animated.Value(0)).current;
  const isLast = index === panels.length - 1;

  // fade + slide each panel in
  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 440, useNativeDriver: true }).start();
  }, [index, fade]);

  // pulsing "tap to continue" hint
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hint, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(hint, { toValue: 0.25, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [hint]);

  function advance() {
    const next = index + 1;
    Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      if (next >= panels.length) onComplete();
      else setIndex(next);
    });
  }

  const panel = panels[index];
  const slideY = fade.interpolate({ inputRange: [0, 1], outputRange: [22, 0] });
  const captionShift = fade.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  return (
    <Pressable style={styles.root} onPress={advance}>
      {/* skip */}
      <Pressable
        style={({ pressed }) => [styles.skip, { borderColor: accentColor, opacity: pressed ? 0.6 : 1 }]}
        onPress={onComplete}
        hitSlop={12}
      >
        <Text style={[styles.skipText, { color: accentColor }]}>SKIP</Text>
      </Pressable>

      {/* panel art */}
      <Animated.View
        style={[
          styles.panel,
          { width: Math.min(width - 40, 520), borderColor: accentColor, opacity: fade, transform: [{ translateY: slideY }] },
        ]}
      >
        {panel.image ? (
          <Image source={panel.image} style={styles.panelImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={[styles.placeholderLabel, { color: accentColor }]}>{panel.sceneLabel ?? 'Panel'}</Text>
            <Text style={styles.placeholderSub}>art pending</Text>
          </View>
        )}
        {/* corner flourishes for a paneled, inked feel */}
        <View style={[styles.corner, styles.cTL, { borderColor: accentColor }]} />
        <View style={[styles.corner, styles.cBR, { borderColor: accentColor }]} />
      </Animated.View>

      {/* narration caption box */}
      <Animated.View
        style={[styles.caption, { opacity: fade, transform: [{ translateY: captionShift }] }]}
      >
        <Text style={styles.captionText}>{panel.text}</Text>
      </Animated.View>

      {/* progress dots */}
      <View style={styles.dots}>
        {panels.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === index && { backgroundColor: accentColor, width: 22 },
            ]}
          />
        ))}
      </View>

      {/* tap hint */}
      <Animated.Text style={[styles.hint, { opacity: hint }]}>
        {isLast ? 'Tap to begin' : 'Tap to continue'}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050509',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  skip: {
    position: 'absolute',
    top: 52,
    right: 20,
    borderWidth: 1,
    borderRadius: 99,
    paddingVertical: 5,
    paddingHorizontal: 14,
    zIndex: 5,
  },
  skipText: { fontSize: 11, fontWeight: '800', letterSpacing: 2 },

  panel: {
    aspectRatio: 1,
    maxHeight: 420,
    borderWidth: 2,
    borderRadius: 6,
    backgroundColor: '#0c0c14',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.7,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  panelImage: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0c0c14',
  },
  placeholderLabel: { fontSize: 18, fontWeight: '900', letterSpacing: 3, textTransform: 'uppercase' },
  placeholderSub: { color: '#5c5a68', fontSize: 11, letterSpacing: 2, marginTop: 6, textTransform: 'uppercase' },

  corner: { position: 'absolute', width: 18, height: 18, borderColor: '#fff' },
  cTL: { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2 },
  cBR: { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2 },

  caption: {
    marginTop: 22,
    maxWidth: 520,
    backgroundColor: '#11111b',
    borderLeftWidth: 3,
    borderColor: '#e9e6df',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 4,
  },
  captionText: {
    color: '#ece9e2',
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },

  dots: { flexDirection: 'row', gap: 7, marginTop: 26 },
  dot: { width: 8, height: 8, borderRadius: 99, backgroundColor: '#2c2b38' },

  hint: {
    position: 'absolute',
    bottom: 44,
    color: '#8a8798',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
