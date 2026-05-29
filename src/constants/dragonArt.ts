// src/constants/dragonArt.ts
//
// Central registry for all dragon art across the evolution tree.
//
// WHY IT LOOKS LIKE THIS: Expo's bundler (Metro) only understands STATIC
// require() strings — you cannot build the path at runtime
// (e.g. require(`../../assets/dragons/${el}.png`) will fail to bundle).
// So every image is listed explicitly here, and getDragonArt() does a
// safe lookup into the map. This is the standard React Native pattern.
//
// To add art: drop the file into assets/dragons/... (see import-dragon-art.ps1
// for the naming), then add its require() line below. Only list files that
// EXIST — a require() pointing at a missing file crashes the whole bundle.

import type { ImageSourcePropType } from 'react-native';

export type DragonElement = 'fire' | 'water' | 'earth' | 'dark' | 'light';
export type DragonClass = 'guardian' | 'raider' | 'mystic';
export type DragonPath = 'physical' | 'elemental';
export type DragonStage = 'egg' | 'hatchling' | 'drake' | 'young';

type DrakeMap = Record<DragonClass, ImageSourcePropType>;
type YoungMap = Record<DragonPath, Record<DragonClass, ImageSourcePropType>>;
type ElementArt = {
  egg: ImageSourcePropType;
  hatchling: ImageSourcePropType;
  drake: DrakeMap;
  young: YoungMap;
};

// ---------------------------------------------------------------------------
// THE MAP — paths match what import-dragon-art.ps1 produces.
// ---------------------------------------------------------------------------
export const DRAGON_ART: Record<DragonElement, ElementArt> = {
  fire: {
    egg: require('../../assets/dragons/fire/egg.png'),
    hatchling: require('../../assets/dragons/fire/hatchling.png'),
    drake: {
      guardian: require('../../assets/dragons/fire/drake/guardian.png'),
      raider: require('../../assets/dragons/fire/drake/raider.png'),
      mystic: require('../../assets/dragons/fire/drake/mystic.png'),
    },
    young: {
      physical: {
        guardian: require('../../assets/dragons/fire/young/physical-guardian.png'),
        raider: require('../../assets/dragons/fire/young/physical-raider.png'),
        mystic: require('../../assets/dragons/fire/young/physical-mystic.png'),
      },
      elemental: {
        guardian: require('../../assets/dragons/fire/young/elemental-guardian.png'),
        raider: require('../../assets/dragons/fire/young/elemental-raider.png'),
        mystic: require('../../assets/dragons/fire/young/elemental-mystic.png'),
      },
    },
  },
  water: {
    egg: require('../../assets/dragons/water/egg.png'),
    hatchling: require('../../assets/dragons/water/hatchling.png'),
    drake: {
      guardian: require('../../assets/dragons/water/drake/guardian.png'),
      raider: require('../../assets/dragons/water/drake/raider.png'),
      mystic: require('../../assets/dragons/water/drake/mystic.png'),
    },
    young: {
      physical: {
        guardian: require('../../assets/dragons/water/young/physical-guardian.png'),
        raider: require('../../assets/dragons/water/young/physical-raider.png'),
        mystic: require('../../assets/dragons/water/young/physical-mystic.png'),
      },
      elemental: {
        guardian: require('../../assets/dragons/water/young/elemental-guardian.png'),
        raider: require('../../assets/dragons/water/young/elemental-raider.png'),
        mystic: require('../../assets/dragons/water/young/elemental-mystic.png'),
      },
    },
  },
  earth: {
    egg: require('../../assets/dragons/earth/egg.png'),
    hatchling: require('../../assets/dragons/earth/hatchling.png'),
    drake: {
      guardian: require('../../assets/dragons/earth/drake/guardian.png'),
      raider: require('../../assets/dragons/earth/drake/raider.png'),
      mystic: require('../../assets/dragons/earth/drake/mystic.png'),
    },
    young: {
      physical: {
        guardian: require('../../assets/dragons/earth/young/physical-guardian.png'),
        raider: require('../../assets/dragons/earth/young/physical-raider.png'),
        mystic: require('../../assets/dragons/earth/young/physical-mystic.png'),
      },
      elemental: {
        guardian: require('../../assets/dragons/earth/young/elemental-guardian.png'),
        raider: require('../../assets/dragons/earth/young/elemental-raider.png'),
        mystic: require('../../assets/dragons/earth/young/elemental-mystic.png'),
      },
    },
  },
  dark: {
    egg: require('../../assets/dragons/dark/egg.png'),
    hatchling: require('../../assets/dragons/dark/hatchling.png'),
    drake: {
      guardian: require('../../assets/dragons/dark/drake/guardian.png'),
      raider: require('../../assets/dragons/dark/drake/raider.png'),
      mystic: require('../../assets/dragons/dark/drake/mystic.png'),
    },
    young: {
      physical: {
        guardian: require('../../assets/dragons/dark/young/physical-guardian.png'),
        raider: require('../../assets/dragons/dark/young/physical-raider.png'),
        mystic: require('../../assets/dragons/dark/young/physical-mystic.png'),
      },
      elemental: {
        guardian: require('../../assets/dragons/dark/young/elemental-guardian.png'),
        raider: require('../../assets/dragons/dark/young/elemental-raider.png'),
        mystic: require('../../assets/dragons/dark/young/elemental-mystic.png'),
      },
    },
  },
  light: {
    egg: require('../../assets/dragons/light/egg.png'),
    hatchling: require('../../assets/dragons/light/hatchling.png'),
    drake: {
      guardian: require('../../assets/dragons/light/drake/guardian.png'),
      raider: require('../../assets/dragons/light/drake/raider.png'),
      mystic: require('../../assets/dragons/light/drake/mystic.png'),
    },
    young: {
      physical: {
        guardian: require('../../assets/dragons/light/young/physical-guardian.png'),
        raider: require('../../assets/dragons/light/young/physical-raider.png'),
        mystic: require('../../assets/dragons/light/young/physical-mystic.png'),
      },
      elemental: {
        guardian: require('../../assets/dragons/light/young/elemental-guardian.png'),
        raider: require('../../assets/dragons/light/young/elemental-raider.png'),
        mystic: require('../../assets/dragons/light/young/elemental-mystic.png'),
      },
    },
  },
};

export type DragonArtQuery = {
  element: DragonElement;
  stage: DragonStage;
  dragonClass?: DragonClass; // required for 'drake' and 'young'
  path?: DragonPath;         // required for 'young'
};

/**
 * Safe lookup. Returns undefined if the requested art isn't registered yet,
 * so callers can fall back to a placeholder instead of crashing.
 * Inputs are case-insensitive.
 */
export function getDragonArt(q: DragonArtQuery): ImageSourcePropType | undefined {
  const element = q.element?.toLowerCase() as DragonElement;
  const el = DRAGON_ART[element];
  if (!el) return undefined;

  switch (q.stage) {
    case 'egg':
      return el.egg;
    case 'hatchling':
      return el.hatchling;
    case 'drake': {
      const c = q.dragonClass?.toLowerCase() as DragonClass;
      return c ? el.drake[c] : undefined;
    }
    case 'young': {
      const p = q.path?.toLowerCase() as DragonPath;
      const c = q.dragonClass?.toLowerCase() as DragonClass;
      return p && c ? el.young[p]?.[c] : undefined;
    }
    default:
      return undefined;
  }
}
