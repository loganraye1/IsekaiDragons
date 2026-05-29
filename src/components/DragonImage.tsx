// src/components/DragonImage.tsx
//
// Drop-in dragon sprite. Resolves the right art from dragonArt.ts based on
// element/stage/class/path. If that art isn't in the map yet, it shows an
// optional placeholder (or a neutral box) instead of crashing.
//
// Usage:
//   <DragonImage element="fire" stage="egg" size={140} />
//   <DragonImage element="dark" stage="young" dragonClass="mystic" path="elemental" size={180} />

import React from 'react';
import { Image, View, Text, StyleSheet, ImageSourcePropType, StyleProp, ImageStyle } from 'react-native';
import {
  getDragonArt,
  DragonElement,
  DragonStage,
  DragonClass,
  DragonPath,
} from '../constants/dragonArt';

type Props = {
  element: DragonElement;
  stage: DragonStage;
  dragonClass?: DragonClass;
  path?: DragonPath;
  size?: number;
  /** Shown when the requested art isn't registered yet. */
  placeholder?: ImageSourcePropType;
  /** Applied to the Image (or fallback View). Accepts ImageStyle props like tintColor. */
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'contain' | 'cover';
};

export default function DragonImage({
  element,
  stage,
  dragonClass,
  path,
  size = 160,
  placeholder,
  style,
  resizeMode = 'contain',
}: Props) {
  const source = getDragonArt({ element, stage, dragonClass, path });
  const dims = { width: size, height: size };

  if (source) {
    return <Image source={source} style={[dims, style as any]} resizeMode={resizeMode} />;
  }
  if (placeholder) {
    return <Image source={placeholder} style={[dims, style as any]} resizeMode={resizeMode} />;
  }

  // Last-resort neutral placeholder so the layout never breaks.
  const label = [element, stage, path, dragonClass].filter(Boolean).join(' ');
  return (
    <View style={[styles.ph, dims, style as any]}>
      <Text style={styles.phText}>{label}</Text>
      <Text style={styles.phSub}>art pending</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ph: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2a36',
    backgroundColor: '#15151f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  phText: { color: '#cdb6ff', fontSize: 11, textAlign: 'center', textTransform: 'capitalize' },
  phSub: { color: '#6b6878', fontSize: 9, marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' },
});
