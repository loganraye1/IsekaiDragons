import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Image, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { elementTheme } from "../content";
import { dragonPathDefinitions, getElementMatchupMultiplier, getNodeKindLabel, getRunCardBoostedStats } from "../game";
import { enemyImages, sceneImages, type EnemyImageKey } from "../constants/assets";
import DragonImage from "./DragonImage";
import { gameStageToArtStage } from "../constants/dragonArt";
import { uiTheme } from "../constants/theme";
import type { AreaId, AdventureNode, BattleResult, DragonElement, DragonPathId, Encounter, GameAction, GameState, ScreenKey, Stats } from "../types";

export function getAutoBattleEnemyImageKey(enemyName: string, areaId: AreaId): EnemyImageKey {
  const normalizedName = enemyName.toLowerCase();

  if (normalizedName.includes("slime") || normalizedName.includes("crab")) return "slime";
  if (normalizedName.includes("wisp") || normalizedName.includes("sprite") || normalizedName.includes("spirit")) return "wisp";
  if (normalizedName.includes("boar") || normalizedName.includes("wolf") || normalizedName.includes("stag") || normalizedName.includes("ram")) return "boar";
  if (normalizedName.includes("goblin") || normalizedName.includes("golem") || normalizedName.includes("sentinel")) return "knight";
  if (normalizedName.includes("serpent") || normalizedName.includes("harpy") || normalizedName.includes("drake")) return "manta";
  if (normalizedName.includes("void") || normalizedName.includes("nightmare") || normalizedName.includes("rift")) return "chimera";

  switch (areaId) {
    case "mysticMeadow":
      return "slime";
    case "emberWoods":
      return "boar";
    case "tideCavern":
      return "wisp";
    case "stonebackHills":
      return "boar";
    case "skyRuins":
      return "manta";
    case "voidNest":
      return "chimera";
    default:
      return "slime";
  }
}

function getDragonPathCombatCue(path: (typeof dragonPathDefinitions)[DragonPathId]) {
  const styleCue = path.combatStyle.split(":")[0];
  return `${path.combatVerb} • ${styleCue} • ${path.battleModifier.tempoLabel}`;
}

function getDragonPathBraceCue(path: (typeof dragonPathDefinitions)[DragonPathId]) {
  const roleCue = path.role.charAt(0).toUpperCase() + path.role.slice(1);
  const mitigation = Math.round(path.battleModifier.damageReduction * 100);
  return `${roleCue} brace • ${path.combatVerb} • ${mitigation}% mitigation`;
}

function getDragonPathHitCue(path: (typeof dragonPathDefinitions)[DragonPathId]) {
  const roleCue = path.role.charAt(0).toUpperCase() + path.role.slice(1);
  const offense = Math.round(path.battleModifier.damageMultiplier * 100);
  return `${roleCue} hit • ${path.combatVerb} • ${offense}% power`;
}

type CombatParticleSpec = { start: number; end: number; x: number; y: number; size: number; color: string; opacity: number; wobble: number };

const fireBreathParticleSpecs: CombatParticleSpec[] = [
  { start: 0.16, end: 0.68, x: -158, y: -28, size: 18, color: "rgba(255,74,30,0.78)", opacity: 0.92, wobble: -18 },
  { start: 0.2, end: 0.74, x: -188, y: 8, size: 14, color: "rgba(255,185,55,0.88)", opacity: 0.95, wobble: 14 },
  { start: 0.24, end: 0.78, x: -212, y: -10, size: 22, color: "rgba(255,102,31,0.68)", opacity: 0.86, wobble: -8 },
  { start: 0.3, end: 0.86, x: -236, y: 22, size: 12, color: "rgba(255,228,106,0.9)", opacity: 0.78, wobble: 20 },
  { start: 0.34, end: 0.9, x: -176, y: -46, size: 10, color: "rgba(255,127,36,0.72)", opacity: 0.76, wobble: -24 },
  { start: 0.4, end: 0.96, x: -260, y: -18, size: 16, color: "rgba(244,52,31,0.62)", opacity: 0.74, wobble: 10 },
  { start: 0.46, end: 0.94, x: -216, y: 38, size: 9, color: "rgba(255,210,84,0.84)", opacity: 0.7, wobble: 18 },
  { start: 0.5, end: 0.94, x: -132, y: 18, size: 11, color: "rgba(255,90,28,0.66)", opacity: 0.64, wobble: -12 }
];

const elementCombatFx: Record<DragonElement, {
  particles: CombatParticleSpec[];
  glowColor: string;
  hitColor: string;
  hpColor: string;
  enemyHitLabel: string;
  braceLabel: string;
}> = {
  fire: {
    glowColor: "rgba(255,214,94,0.9)",
    hitColor: "rgba(255,211,93,0.9)",
    hpColor: "#ff784f",
    enemyHitLabel: "Burned",
    braceLabel: "Dragon braces",
    particles: fireBreathParticleSpecs
  },
  water: {
    glowColor: "rgba(95,211,255,0.88)",
    hitColor: "rgba(91,220,255,0.88)",
    hpColor: "#5bdcff",
    enemyHitLabel: "Drenched",
    braceLabel: "Tide guard",
    particles: [
      { start: 0.14, end: 0.7, x: -150, y: -34, size: 12, color: "rgba(88,221,255,0.82)", opacity: 0.9, wobble: -30 },
      { start: 0.2, end: 0.78, x: -180, y: 8, size: 18, color: "rgba(147,240,255,0.72)", opacity: 0.88, wobble: 28 },
      { start: 0.25, end: 0.84, x: -218, y: -18, size: 10, color: "rgba(73,169,255,0.78)", opacity: 0.78, wobble: -24 },
      { start: 0.32, end: 0.92, x: -246, y: 26, size: 15, color: "rgba(181,249,255,0.72)", opacity: 0.72, wobble: 20 },
      { start: 0.42, end: 0.96, x: -190, y: -52, size: 8, color: "rgba(111,199,255,0.7)", opacity: 0.68, wobble: -36 }
    ]
  },
  earth: {
    glowColor: "rgba(171,230,93,0.86)",
    hitColor: "rgba(132,211,91,0.88)",
    hpColor: "#8ddf63",
    enemyHitLabel: "Crushed",
    braceLabel: "Stone guard",
    particles: [
      { start: 0.12, end: 0.68, x: -130, y: -12, size: 22, color: "rgba(126,97,61,0.82)", opacity: 0.88, wobble: -8 },
      { start: 0.18, end: 0.74, x: -168, y: 24, size: 16, color: "rgba(179,143,82,0.78)", opacity: 0.82, wobble: 10 },
      { start: 0.24, end: 0.82, x: -204, y: -30, size: 14, color: "rgba(117,207,82,0.78)", opacity: 0.78, wobble: -14 },
      { start: 0.34, end: 0.9, x: -236, y: 8, size: 20, color: "rgba(92,73,52,0.74)", opacity: 0.72, wobble: 8 },
      { start: 0.44, end: 0.96, x: -174, y: -48, size: 10, color: "rgba(205,178,101,0.72)", opacity: 0.68, wobble: -12 }
    ]
  },
  dark: {
    glowColor: "rgba(139,92,246,0.88)",
    hitColor: "rgba(191,169,255,0.9)",
    hpColor: "#8b5cf6",
    enemyHitLabel: "Cursed",
    braceLabel: "Void guard",
    particles: [
      { start: 0.1, end: 0.62, x: -142, y: -42, size: 10, color: "rgba(139,92,246,0.86)", opacity: 0.9, wobble: -10 },
      { start: 0.18, end: 0.74, x: -190, y: -8, size: 16, color: "rgba(50,35,90,0.88)", opacity: 0.86, wobble: 10 },
      { start: 0.28, end: 0.84, x: -228, y: 22, size: 12, color: "rgba(217,204,255,0.76)", opacity: 0.78, wobble: 16 },
      { start: 0.38, end: 0.92, x: -260, y: -18, size: 18, color: "rgba(100,60,190,0.72)", opacity: 0.72, wobble: -14 },
      { start: 0.46, end: 0.96, x: -176, y: 38, size: 9, color: "rgba(205,185,255,0.74)", opacity: 0.68, wobble: 20 }
    ]
  },
  light: {
    glowColor: "rgba(255,238,156,0.9)",
    hitColor: "rgba(255,247,194,0.92)",
    hpColor: "#ffe58f",
    enemyHitLabel: "Lanced",
    braceLabel: "Halo guard",
    particles: [
      { start: 0.1, end: 0.62, x: -142, y: -42, size: 10, color: "rgba(255,247,194,0.9)", opacity: 0.94, wobble: -10 },
      { start: 0.16, end: 0.7, x: -188, y: -8, size: 16, color: "rgba(255,229,143,0.86)", opacity: 0.9, wobble: 8 },
      { start: 0.24, end: 0.8, x: -226, y: 22, size: 12, color: "rgba(255,255,232,0.82)", opacity: 0.78, wobble: 16 },
      { start: 0.34, end: 0.9, x: -260, y: -18, size: 18, color: "rgba(255,207,89,0.72)", opacity: 0.72, wobble: -14 },
      { start: 0.44, end: 0.96, x: -176, y: 38, size: 9, color: "rgba(255,244,178,0.76)", opacity: 0.68, wobble: 20 }
    ]
  }
};

function FireBreathParticle({
  progress,
  spec,
  index
}: {
  progress: Animated.Value;
  spec: CombatParticleSpec;
  index: number;
}) {
  const mid = Math.min(spec.start + 0.18, spec.end - 0.08);
  const opacity = progress.interpolate({
    inputRange: [0, spec.start, mid, spec.end, 1],
    outputRange: [0, 0, spec.opacity, spec.opacity * 0.32, 0],
    extrapolate: "clamp"
  });
  const translateX = progress.interpolate({
    inputRange: [0, spec.start, spec.end, 1],
    outputRange: [8, 8, spec.x, spec.x + spec.wobble],
    extrapolate: "clamp"
  });
  const translateY = progress.interpolate({
    inputRange: [0, spec.start, mid, spec.end, 1],
    outputRange: [0, 0, spec.y, spec.y + (index % 2 === 0 ? -12 : 10), spec.y],
    extrapolate: "clamp"
  });
  const scale = progress.interpolate({
    inputRange: [0, spec.start, mid, spec.end, 1],
    outputRange: [0.18, 0.18, 1.28, 0.72, 0.22],
    extrapolate: "clamp"
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [index % 2 === 0 ? "-18deg" : "14deg", index % 2 === 0 ? "28deg" : "-24deg"]
  });

  return (
    <Animated.View
      style={[
        styles.fireBreathParticle,
        {
          backgroundColor: spec.color,
          height: spec.size,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }, { rotate }],
          width: spec.size
        }
      ]}
    />
  );
}

function FireBreathParticleTrail({ progress, element = "fire" }: { progress: Animated.Value; element?: DragonElement }) {
  return (
    <View pointerEvents="none" style={styles.fireBreathParticleTrail}>
      {elementCombatFx[element].particles.map((spec, index) => (
        <FireBreathParticle key={`${element}-${spec.x}-${index}`} progress={progress} spec={spec} index={index} />
      ))}
    </View>
  );
}

function FireBreathCombatVisual({ state, element = state.dragon.element ?? "fire" }: { state: GameState; element?: DragonElement }) {
  const reducedMotion = state.settings.reducedMotion;
  const enemyImageKey = getAutoBattleEnemyImageKey(state.autoBattle.enemyName, state.autoBattle.areaId);
  const combatFx = elementCombatFx[element];
  const bs = getRunCardBoostedStats(state);
  const critBadgeLabel = `CRIT ${bs.critChance}% • Crit DMG ${bs.critDamage}%`;
  const dodgeBadgeLabel = `DODGE ${bs.dodge}% • SPD ${bs.speed}`;
  const blockBadgeLabel = `BLOCK ${bs.block}% • DEF ${bs.defense}`;
  const safeEnemyMaxHp = Math.max(1, state.autoBattle.enemyMaxHp);
  const enemyHpPercent = Math.max(0, Math.min(100, Math.round((state.autoBattle.enemyHp / safeEnemyMaxHp) * 100)));
  const dragonMaxHp = Math.max(1, bs.health);
  const dragonHpPercent = 100;
  const breathPulse = useRef(new Animated.Value(0)).current;
  const hitPulse = useRef(new Animated.Value(0)).current;
  const enemyAttackPulse = useRef(new Animated.Value(0)).current;
  const enemyIdle = useRef(new Animated.Value(0)).current;
  const dragonHitPulse = useRef(new Animated.Value(0)).current;
  const previousEnemyHp = useRef(Number.POSITIVE_INFINITY);
  const previousDefeatedCount = useRef(state.autoBattle.defeatedCount);

  useEffect(() => {
    if (reducedMotion) {
      enemyIdle.stopAnimation();
      enemyIdle.setValue(0);
      return;
    }

    enemyIdle.setValue(0);
    const idleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(enemyIdle, { toValue: 1, duration: 1450, useNativeDriver: true }),
        Animated.timing(enemyIdle, { toValue: 0, duration: 1450, useNativeDriver: true })
      ])
    );

    idleAnimation.start();

    return () => {
      idleAnimation.stop();
    };
  }, [enemyIdle, reducedMotion]);

  useEffect(() => {
    const enemyHpDecreased = state.autoBattle.enemyHp < previousEnemyHp.current;
    const defeatedCountChanged = state.autoBattle.defeatedCount !== previousDefeatedCount.current;

    previousEnemyHp.current = state.autoBattle.enemyHp;
    previousDefeatedCount.current = state.autoBattle.defeatedCount;

    if (reducedMotion || (!enemyHpDecreased && !defeatedCountChanged)) {
      if (reducedMotion) {
        breathPulse.stopAnimation();
        hitPulse.stopAnimation();
        enemyAttackPulse.stopAnimation();
        dragonHitPulse.stopAnimation();
        breathPulse.setValue(0);
        hitPulse.setValue(0);
        enemyAttackPulse.setValue(0);
        dragonHitPulse.setValue(0);
      }
      return;
    }

    breathPulse.stopAnimation();
    hitPulse.stopAnimation();
    enemyAttackPulse.stopAnimation();
    dragonHitPulse.stopAnimation();
    breathPulse.setValue(0);
    hitPulse.setValue(0);
    enemyAttackPulse.setValue(0);
    dragonHitPulse.setValue(0);
    const attackAnimation = Animated.sequence([
      Animated.timing(breathPulse, { toValue: 0.3, duration: 60, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(breathPulse, { toValue: 1, duration: 165, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(24),
          Animated.timing(hitPulse, { toValue: 1, duration: 60, useNativeDriver: true }),
          Animated.timing(hitPulse, { toValue: 0, duration: 70, useNativeDriver: true })
        ])
      ]),
      Animated.delay(10),
      Animated.parallel([
        Animated.timing(enemyAttackPulse, { toValue: 1, duration: 175, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(36),
          Animated.timing(dragonHitPulse, { toValue: 1, duration: 55, useNativeDriver: true }),
          Animated.timing(dragonHitPulse, { toValue: 0, duration: 70, useNativeDriver: true })
        ])
      ])
    ]);

    attackAnimation.start(({ finished }) => {
      if (finished) {
        breathPulse.setValue(0);
        enemyAttackPulse.setValue(0);
        dragonHitPulse.setValue(0);
      }
    });

    return () => {
      attackAnimation.stop();
    };
  }, [breathPulse, dragonHitPulse, enemyAttackPulse, hitPulse, reducedMotion, state.autoBattle.defeatedCount, state.autoBattle.enemyHp]);

  const glowStyle = reducedMotion
    ? undefined
    : {
      opacity: breathPulse.interpolate({ inputRange: [0, 0.3, 0.72, 1], outputRange: [0, 0.95, 0.5, 0] }),
      transform: [{ scale: breathPulse.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.48, 1.42, 0.78] }) }]
    };
  const enemySpriteStyle = reducedMotion
    ? undefined
    : {
      transform: [
        { translateY: enemyIdle.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) },
        { rotate: enemyIdle.interpolate({ inputRange: [0, 1], outputRange: ["-0.8deg", "1.4deg"] }) },
        { scale: enemyIdle.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] }) }
      ]
    };
  const enemyHitStyle = reducedMotion
    ? undefined
    : {
      transform: [
        { translateY: enemyIdle.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
        { translateX: hitPulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -14, 0] }) },
        { translateX: enemyAttackPulse.interpolate({ inputRange: [0, 0.42, 1], outputRange: [0, 42, 0] }) },
        { rotate: hitPulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["0deg", "-2deg", "0deg"] }) },
        { scale: hitPulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.09, 1] }) },
        { scale: enemyAttackPulse.interpolate({ inputRange: [0, 0.42, 1], outputRange: [1, 1.14, 1] }) }
      ]
    };
  const hitFlashStyle = reducedMotion
    ? undefined
    : {
      opacity: hitPulse.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, 0.55, 0] })
    };
  const dragonTurnLabelStyle = reducedMotion
    ? undefined
    : {
      opacity: breathPulse.interpolate({ inputRange: [0, 0.08, 0.46, 0.66], outputRange: [0, 1, 1, 0] }),
      transform: [{ translateY: breathPulse.interpolate({ inputRange: [0, 0.46, 1], outputRange: [8, 0, -4] }) }]
    };
  const enemyHitLabelStyle = reducedMotion
    ? undefined
    : {
      opacity: hitPulse.interpolate({ inputRange: [0, 0.28, 1], outputRange: [0, 1, 0] }),
      transform: [{ scale: hitPulse.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.92, 1.06, 1] }) }]
    };
  const enemyTurnLabelStyle = reducedMotion
    ? undefined
    : {
      opacity: enemyAttackPulse.interpolate({ inputRange: [0, 0.08, 0.72, 1], outputRange: [0, 1, 1, 0] }),
      transform: [{ translateX: enemyAttackPulse.interpolate({ inputRange: [0, 0.42, 1], outputRange: [-6, 0, 8] }) }]
    };
  const enemyStrikeStyle = reducedMotion
    ? undefined
    : {
      opacity: enemyAttackPulse.interpolate({ inputRange: [0, 0.12, 0.62, 1], outputRange: [0, 1, 0.85, 0] }),
      transform: [
        { translateX: enemyAttackPulse.interpolate({ inputRange: [0, 1], outputRange: [-20, 160] }) },
        { translateY: enemyAttackPulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -16, 6] }) },
        { scale: enemyAttackPulse.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.72, 1.1, 0.9] }) },
        { rotate: "-14deg" }
      ]
    };
  const dragonHpCardStyle = reducedMotion
    ? undefined
    : {
      transform: [
        { translateX: dragonHitPulse.interpolate({ inputRange: [0, 0.35, 0.7, 1], outputRange: [0, -5, 5, 0] }) },
        { scale: dragonHitPulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.035, 1] }) }
      ]
    };
  const dragonHitFlashStyle = reducedMotion
    ? undefined
    : {
      opacity: dragonHitPulse.interpolate({ inputRange: [0, 0.38, 1], outputRange: [0, 0.52, 0] })
    };
  const dragonBraceLabelStyle = reducedMotion
    ? undefined
    : {
      opacity: enemyAttackPulse.interpolate({ inputRange: [0, 0.34, 0.78, 1], outputRange: [0, 0, 1, 0] }),
      transform: [{ scale: enemyAttackPulse.interpolate({ inputRange: [0, 0.62, 1], outputRange: [0.92, 1.04, 1] }) }]
    };
  const critBadgeStyle = reducedMotion
    ? undefined
    : {
      opacity: hitPulse.interpolate({ inputRange: [0, 0.18, 0.7, 1], outputRange: [0, 1, 1, 0] }),
      transform: [
        { translateY: hitPulse.interpolate({ inputRange: [0, 0.42, 1], outputRange: [10, -4, -14] }) },
        { scale: hitPulse.interpolate({ inputRange: [0, 0.36, 1], outputRange: [0.9, 1.12, 1] }) }
      ]
    };
  const defenseBadgeStyle = reducedMotion
    ? undefined
    : {
      opacity: enemyAttackPulse.interpolate({ inputRange: [0, 0.24, 0.82, 1], outputRange: [0, 1, 1, 0] }),
      transform: [{ translateY: enemyAttackPulse.interpolate({ inputRange: [0, 0.46, 1], outputRange: [8, 0, -8] }) }]
    };

  return (
    <View pointerEvents="none" style={styles.fireBreathCombatLayer}>
      {!reducedMotion ? <Animated.View style={[styles.fireBreathMouthGlow, { backgroundColor: combatFx.glowColor }, glowStyle]} /> : null}
      {!reducedMotion ? <FireBreathParticleTrail progress={breathPulse} element={element} /> : null}
      {!reducedMotion ? <Animated.Text numberOfLines={2} style={[styles.combatTurnLabel, styles.combatTurnLabelDragon, dragonTurnLabelStyle]}>{state.dragon.path ? getDragonPathCombatCue(dragonPathDefinitions[state.dragon.path]) : "Dragon attacks"}</Animated.Text> : null}
      {!reducedMotion ? <Animated.Text numberOfLines={2} style={[styles.combatTurnLabel, styles.combatTurnLabelEnemyHit, enemyHitLabelStyle]}>{state.dragon.path ? getDragonPathHitCue(dragonPathDefinitions[state.dragon.path]) : combatFx.enemyHitLabel}</Animated.Text> : null}
      {!reducedMotion ? <Animated.Text numberOfLines={1} style={[styles.combatStatFxBadge, styles.combatStatFxBadgeCrit, critBadgeStyle]}>{critBadgeLabel}</Animated.Text> : null}
      {!reducedMotion ? <Animated.Text style={[styles.combatTurnLabel, styles.combatTurnLabelEnemy, enemyTurnLabelStyle]}>Enemy attacks</Animated.Text> : null}
      {!reducedMotion ? <Animated.Text numberOfLines={2} style={[styles.combatTurnLabel, styles.combatTurnLabelDragonBrace, dragonBraceLabelStyle]}>{state.dragon.path ? getDragonPathBraceCue(dragonPathDefinitions[state.dragon.path]) : combatFx.braceLabel}</Animated.Text> : null}
      {!reducedMotion ? <Animated.Text numberOfLines={1} style={[styles.combatStatFxBadge, styles.combatStatFxBadgeDodge, defenseBadgeStyle]}>{dodgeBadgeLabel}</Animated.Text> : null}
      {!reducedMotion ? <Animated.Text numberOfLines={1} style={[styles.combatStatFxBadge, styles.combatStatFxBadgeBlock, defenseBadgeStyle]}>{blockBadgeLabel}</Animated.Text> : null}
      {!reducedMotion ? <Animated.View style={[styles.enemyStrikeSlash, enemyStrikeStyle]}><Text style={styles.enemyStrikeSlashText}>⚔</Text></Animated.View> : null}
      <Animated.View style={[styles.fireBreathDragonHpCard, dragonHpCardStyle]}>
        {!reducedMotion ? <Animated.View style={[styles.fireBreathDragonHitFlash, dragonHitFlashStyle]} /> : null}
        <Text style={styles.fireBreathDragonName}>Dragon HP</Text>
        <View style={styles.fireBreathDragonHpTrack}>
          <View style={[styles.fireBreathDragonHpFill, { backgroundColor: combatFx.hpColor, width: `${dragonHpPercent}%` as any }]} />
        </View>
        <Text style={styles.fireBreathDragonMeta}>{dragonMaxHp}/{dragonMaxHp} • DEF {bs.defense}</Text>
      </Animated.View>
      <Animated.View style={[styles.fireBreathEnemyCard, enemyHitStyle]}>
        <View style={styles.fireBreathEnemyShadow} />
        <Animated.View style={[styles.fireBreathEnemySpriteFrame, enemySpriteStyle]}>
          <Image source={enemyImages[enemyImageKey]} style={styles.fireBreathEnemyImage} resizeMode="contain" />
        </Animated.View>
        {!reducedMotion ? <Animated.View style={[styles.fireBreathHitSparks, { borderColor: combatFx.hitColor, backgroundColor: combatFx.hitColor }, hitFlashStyle]} /> : null}
        <Text style={styles.fireBreathEnemyName} numberOfLines={1}>{state.autoBattle.enemyName}</Text>
        <View style={styles.fireBreathHpTrack}>
          <View style={[styles.fireBreathHpFill, { backgroundColor: combatFx.hpColor, width: `${enemyHpPercent}%` as any }]} />
        </View>
        <Text style={styles.fireBreathEnemyMeta}>Defeated {state.autoBattle.defeatedCount}</Text>
      </Animated.View>
    </View>
  );
}

export function BattleTacticPreview({ node, encounter, focused = false }: { node: AdventureNode; encounter: Encounter; focused?: boolean }) {
  const playerAdvantage = getElementMatchupMultiplier(node.element ?? "fire", encounter.element) > 1;
  const enemyAdvantage = getElementMatchupMultiplier(encounter.element, node.element ?? "fire") > 1;
  const shadowVale = node.chapter === 3;
  const tacticChips = [
    { label: "ATK", detail: playerAdvantage ? "advantage breath" : shadowVale ? "veil pierce" : "steady bite" },
    { label: "DEF", detail: enemyAdvantage ? "brace counter" : shadowVale ? "guard HP" : "hold ground" },
    { label: "SPD", detail: node.difficulty >= 1 ? "first swing" : "safe opener" }
  ];

  return (
    <View style={[styles.battleTacticPreview, focused && styles.battleTacticPreviewFocused]}>
      <Text style={styles.battleTacticKicker}>Fight readout</Text>
      <Text numberOfLines={focused ? 1 : 2} style={styles.battleTacticTitle}>
        {shadowVale ? "Shadow Vale: Light/Dark pressure can swing the fight." : playerAdvantage ? "Element advantage: press the breath attack." : enemyAdvantage ? "Enemy pressure: block, dodge, then counter." : "Even matchup: stats decide the exchange."}
      </Text>
      <View style={styles.battleTacticChipRow}>
        {tacticChips.map((chip) => (
          <View key={chip.label} style={styles.battleTacticChip}>
            <Text style={styles.battleTacticChipLabel}>{chip.label}</Text>
            <Text numberOfLines={1} style={styles.battleTacticChipText}>{chip.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function getBattleSkillTriggerLines(rounds: string[]): string[] {
  return rounds.filter((round) => round.includes("Skill trigger:"));
}

function BattleFlashCalloutRail({ battle, stats, element, title = "BATTLE TELLS" }: { battle: BattleResult; stats: Stats; element: DragonElement; title?: string }) {
  const roundText = battle.rounds.join(" ");
  const isFireDragon = element === "fire";
  const isBossPressure = battle.nodeKind === "boss" || battle.nodeKind === "elite";
  const callouts = [
    {
      label: isFireDragon ? "Fire Breath" : "Dragon Breath",
      icon: isFireDragon ? "🔥" : "🐉",
      active: true,
      detail: `${battle.damageSummary?.playerDamage ?? 0} total damage`
    },
    {
      label: "Burn Pressure",
      icon: "♨️",
      active: isFireDragon || roundText.toLowerCase().includes("burn") || roundText.toLowerCase().includes("ember"),
      detail: isFireDragon ? "ember identity online" : "elemental DOT hook"
    },
    {
      label: "Crit Spike",
      icon: "💥",
      active: roundText.includes("CRIT") || stats.critChance >= 10,
      detail: `${stats.critChance}% / ${stats.critDamage}%`
    },
    {
      label: "Block Spark",
      icon: "🛡",
      active: roundText.includes("blocked") || stats.block >= 8,
      detail: `${stats.block}% block reads as shield flash`
    },
    {
      label: "Dodge Afterimage",
      icon: "🌀",
      active: roundText.includes("dodged") || stats.dodge >= 8,
      detail: `${stats.dodge}% dodge reads as motion`
    },
    {
      label: "Speed / First Move",
      icon: "⚡",
      active: stats.speed >= battle.encounter.stats.speed,
      detail: `${stats.speed} speed sets attack cadence`
    },
    {
      label: isBossPressure ? "Heavy Hit Warning" : "Enemy Counter",
      icon: isBossPressure ? "⚠️" : "🗡️",
      active: isBossPressure || (battle.damageSummary?.enemyCounterDamage ?? 0) > 0,
      detail: `${battle.damageSummary?.enemyCounterDamage ?? 0} counter damage`
    }
  ];

  return (
    <View style={styles.battleFlashCalloutRail}>
      <Text style={styles.battleFlashCalloutKicker}>{title}</Text>
      <View style={styles.battleFlashCalloutGrid}>
        {callouts.map((callout) => (
          <View key={callout.label} style={[styles.battleFlashCalloutCard, callout.active && styles.battleFlashCalloutCardActive]}>
            <Text style={styles.battleFlashCalloutIcon}>{callout.icon}</Text>
            <Text style={styles.battleFlashCalloutLabel}>{callout.label}</Text>
            <Text style={styles.battleFlashCalloutDetail}>{callout.active ? callout.detail : "ready next fight"}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

type BattleExchangeEvent = {
  actor: "dragon" | "enemy" | "skill" | "dodge" | "result";
  label: string;
  playerDamage: number;
  enemyDamage: number;
};

function parseBattleExchangeDamage(line: string, pattern: RegExp) {
  const match = line.match(pattern);
  return match?.[1] ? Number(match[1]) : 0;
}

function getBattleExchangeEvents(battle: BattleResult): BattleExchangeEvent[] {
  const events = battle.rounds
    .map((round): BattleExchangeEvent | null => {
      if (round.startsWith("Round ")) {
        return {
          actor: "dragon",
          label: round.replace(/^Round \d+: /, ""),
          playerDamage: parseBattleExchangeDamage(round, / for (\d+)/),
          enemyDamage: 0
        };
      }
      if (round.includes("Skill trigger:")) {
        return {
          actor: "skill",
          label: round.replace("Skill trigger: ", ""),
          playerDamage: parseBattleExchangeDamage(round, /(?:for|deals|adds) (\d+)/i),
          enemyDamage: 0
        };
      }
      if (round.includes("strikes back for")) {
        return {
          actor: "enemy",
          label: round,
          playerDamage: 0,
          enemyDamage: parseBattleExchangeDamage(round, /strikes back for (\d+)/)
        };
      }
      if (round.includes("dodged")) {
        return {
          actor: "dodge",
          label: round,
          playerDamage: 0,
          enemyDamage: 0
        };
      }
      if (round.startsWith("Fast fight result:")) {
        return {
          actor: "result",
          label: round.replace("Fast fight result: ", ""),
          playerDamage: 0,
          enemyDamage: 0
        };
      }
      return null;
    })
    .filter((event): event is BattleExchangeEvent => Boolean(event));

  return events.length > 0
    ? events
    : [
        {
          actor: battle.won ? "dragon" : "enemy",
          label: battle.won ? "Your dragon surges forward for the finishing hit." : "The enemy forces your dragon back.",
          playerDamage: battle.damageSummary?.playerDamage ?? 0,
          enemyDamage: battle.damageSummary?.enemyCounterDamage ?? 0
        }
      ];
}

function getAnimatedBattleHp({
  battle,
  events,
  currentExchangeIndex,
  dragonMaxHp,
  dragonStartHp,
  enemyMaxHp
}: {
  battle: BattleResult;
  events: BattleExchangeEvent[];
  currentExchangeIndex: number;
  dragonMaxHp: number;
  dragonStartHp: number;
  enemyMaxHp: number;
}) {
  if (currentExchangeIndex >= events.length) {
    return { playerHp: battle.playerHp, enemyHp: battle.enemyHp };
  }

  const visibleEvents = events.slice(0, Math.max(0, currentExchangeIndex + 1));
  const playerDamage = visibleEvents.reduce((total, event) => total + event.enemyDamage, 0);
  const enemyDamage = visibleEvents.reduce((total, event) => total + event.playerDamage, 0);

  return {
    playerHp: Math.max(battle.playerHp, dragonStartHp - playerDamage),
    enemyHp: Math.max(battle.enemyHp, enemyMaxHp - enemyDamage)
  };
}

function BattleOutcomeBanner({ battle, continueScreen }: { battle: BattleResult; continueScreen: ScreenKey }) {
  const title = battle.won ? "Victory strike" : "Forced back";
  const rewardLine = battle.won ? battle.rewardSummary ?? "Spoils ready in the return chest" : "Regroup, train, and try the road again";
  const nextLine = continueScreen === "den" ? "Next: return to the den" : "Next: press deeper into the chapter";

  return (
    <View style={[styles.battleOutcomeBanner, battle.won ? styles.battleOutcomeBannerWin : styles.battleOutcomeBannerLoss]}>
      <View style={styles.battleOutcomeIconWrap}>
        <Text style={styles.battleOutcomeIcon}>{battle.won ? "⚔️" : "🛡️"}</Text>
      </View>
      <View style={styles.battleOutcomeCopy}>
        <Text style={styles.battleOutcomeKicker}>{battle.won ? "Enemy broken" : "Dragon protected"}</Text>
        <Text style={styles.battleOutcomeTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.battleOutcomeLine} numberOfLines={1}>{rewardLine}</Text>
        <Text style={styles.battleOutcomeNext} numberOfLines={1}>{nextLine}</Text>
      </View>
    </View>
  );
}

export default function BattleScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  const battle = state.lastBattle;
  const continueScreen: ScreenKey = state.adventureRun?.status === "complete" ? "den" : "adventure";
  const element = state.dragon.element ?? "fire";
  const theme = elementTheme[element];
  const exchangePulse = useRef(new Animated.Value(0)).current;
  const enemyDeathPulse = useRef(new Animated.Value(1)).current;
  const battleEvents = useMemo(() => (battle ? getBattleExchangeEvents(battle) : []), [battle]);
  const [battleStarted, setBattleStarted] = useState(false);
  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(-1);
  const activeExchange = currentExchangeIndex >= 0 && currentExchangeIndex < battleEvents.length ? battleEvents[currentExchangeIndex] : null;
  const exchangeComplete = battleStarted && currentExchangeIndex >= battleEvents.length;
  const previousExchangeBattleId = useRef<string | null>(null);

  useEffect(() => {
    setBattleStarted(false);
    setCurrentExchangeIndex(-1);
  }, [battle]);

  useEffect(() => {
    if (!battle || !battleStarted) {
      setCurrentExchangeIndex(-1);
      return;
    }
    if (state.settings.reducedMotion) {
      setCurrentExchangeIndex(battleEvents.length);
      return;
    }

    setCurrentExchangeIndex(-1);
    let nextIndex = 0;
    const interval = setInterval(() => {
      setCurrentExchangeIndex(nextIndex);
      nextIndex += 1;
      if (nextIndex > battleEvents.length) {
        clearInterval(interval);
      }
    }, 650);

    return () => clearInterval(interval);
  }, [battle, battleEvents, battleStarted, state.settings.reducedMotion]);

  useEffect(() => {
    if (!activeExchange || state.settings.reducedMotion) {
      exchangePulse.setValue(0);
      return;
    }

    exchangePulse.setValue(0);
    Animated.sequence([
      Animated.timing(exchangePulse, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(exchangePulse, { toValue: 0, duration: 380, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
    ]).start();
  }, [activeExchange, exchangePulse, state.settings.reducedMotion]);

  useEffect(() => {
    if (state.settings.reducedMotion) return;
    const battleId = battle?.encounter?.name ?? null;
    if (previousExchangeBattleId.current !== null && previousExchangeBattleId.current !== battleId) {
      enemyDeathPulse.setValue(1);
    }
    previousExchangeBattleId.current = battleId;
  }, [battle?.encounter?.name, enemyDeathPulse, state.settings.reducedMotion]);

  useEffect(() => {
    if (!exchangeComplete || !battle?.won || state.settings.reducedMotion) return;
    enemyDeathPulse.setValue(1);
    Animated.sequence([
      Animated.delay(120),
      Animated.parallel([
        Animated.timing(enemyDeathPulse, { toValue: 0, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true })
      ])
    ]).start(() => enemyDeathPulse.setValue(1));
  }, [exchangeComplete, battle?.won, enemyDeathPulse, state.settings.reducedMotion]);

  const dragonLunge = exchangePulse.interpolate({ inputRange: [0, 1], outputRange: [0, 72] });
  const enemyLunge = exchangePulse.interpolate({ inputRange: [0, 1], outputRange: [0, -60] });
  const battleArenaShake = exchangePulse.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [0, -10, 14, -8, 5, 0] });
  const targetRecoilTranslateX = exchangePulse.interpolate({ inputRange: [0, 0.2, 0.5, 0.75, 1], outputRange: [0, 0, 22, -8, 0] });
  const dragonTargetRecoilTranslateX = exchangePulse.interpolate({ inputRange: [0, 0.2, 0.5, 0.75, 1], outputRange: [0, 0, -18, 7, 0] });
  const hitPauseScale = exchangePulse.interpolate({ inputRange: [0, 0.2, 0.45, 0.65, 1], outputRange: [1, 1.06, 0.88, 1.04, 1] });
  const hitFlashOpacity = exchangePulse.interpolate({ inputRange: [0, 0.08, 0.30, 0.55, 1], outputRange: [0, 1, 0.9, 0.2, 0] });
  const damageFloatTranslateY = exchangePulse.interpolate({ inputRange: [0, 0.62, 1], outputRange: [12, -32, -44] });
  const damageFloatScale = exchangePulse.interpolate({ inputRange: [0, 0.12, 0.55, 1], outputRange: [0.5, 1.28, 1.08, 0.96] });
  const dragonAttackActive = activeExchange?.actor === "dragon" || activeExchange?.actor === "skill";
  const enemyAttackActive = activeExchange?.actor === "enemy";
  const dragonSideMotion = dragonAttackActive ? dragonLunge : enemyAttackActive ? dragonTargetRecoilTranslateX : 0;
  const enemySideMotion = enemyAttackActive ? enemyLunge : dragonAttackActive ? targetRecoilTranslateX : 0;

  if (!battle) {
    return (
      <View>
        <Text style={styles.sectionTitle}>Battle Log</Text>
        <Text style={styles.bodyText}>No battle yet. Start an adventure to test your dragon.</Text>
      </View>
    );
  }

  const enemyImageKey = getAutoBattleEnemyImageKey(battle.encounter.name, state.currentArea);
  const boostedStats = getRunCardBoostedStats(state);
  const chapterMaxHp = state.adventureRun?.maxHp ?? state.dragon.stats.health;
  const chapterStartHp = battle.battleStartHp ?? (state.adventureRun?.status === "active"
    ? Math.min(chapterMaxHp, Math.max(1, state.adventureRun.currentHp))
    : state.dragon.stats.health);
  const animatedHp = getAnimatedBattleHp({
    battle,
    events: battleEvents,
    currentExchangeIndex,
    dragonMaxHp: chapterMaxHp,
    dragonStartHp: chapterStartHp,
    enemyMaxHp: battle.encounter.stats.health
  });
  const enemyHpPercent = `${Math.max(0, Math.min(100, Math.round((animatedHp.enemyHp / Math.max(1, battle.encounter.stats.health)) * 100)))}%`;
  const playerHpPercent = `${Math.max(0, Math.min(100, Math.round((animatedHp.playerHp / Math.max(1, chapterMaxHp)) * 100)))}%`;
  const areaSceneMap: Record<AreaId, AdventureNode["scene"]> = {
    mysticMeadow: "forest",
    emberWoods: "camp",
    tideCavern: "cave",
    stonebackHills: "ruins",
    skyRuins: "shrine",
    voidNest: "boss"
  };
  const battleScene: AdventureNode["scene"] = battle.nodeKind === "boss" ? "boss" : battle.nodeKind === "elite" ? "ruins" : areaSceneMap[state.currentArea];
  const fightCue = !battleStarted
    ? "Square up — tap Start Battle when ready"
    : exchangeComplete
      ? (battle.won ? "Enemy staggered — press the attack" : "Your dragon is pushed back")
      : activeExchange?.label ?? "Fight starts — your dragon advances";
const enemyDamageBadgeText = activeExchange?.playerDamage ? `HIT -${activeExchange.playerDamage}` : null;
  const dragonDamageBadgeText = activeExchange?.enemyDamage ? `HURT -${activeExchange.enemyDamage}` : null;
  const dragonExchangeSummary = activeExchange?.playerDamage
    ? `Dragon hit: -${activeExchange.playerDamage} enemy HP`
    : dragonAttackActive
      ? "Dragon presses forward"
      : "Dragon ready";
  const enemyExchangeSummary = activeExchange?.enemyDamage
    ? `Enemy counter: -${activeExchange.enemyDamage} hatchling HP`
    : enemyAttackActive
      ? "Enemy counter incoming"
      : activeExchange?.actor === "dodge"
        ? "Counter dodged"
        : "Enemy bracing";
  const battlePersistentStats = [
    { label: "Health", value: `${animatedHp.playerHp}/${chapterMaxHp}` },
    { label: "Attack", value: `${boostedStats.attack}` },
    { label: "Defense", value: `${boostedStats.defense}` }
  ];

  return (
    <View style={styles.battleFullScreenArena}>
      <ImageBackground source={sceneImages[battleScene]} style={styles.battleArenaScene} imageStyle={styles.battleArenaImage}>
        <LinearGradient colors={["rgba(8,6,17,0.02)", "rgba(8,6,17,0.32)", "rgba(8,6,17,0.9)"]} style={styles.battleArenaScrim}>
          <View style={styles.battleArenaHud}>
            <View style={[styles.battleArenaBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.battleArenaBadgeText}>Fight</Text>
            </View>
            <Text style={styles.battleArenaKind}>{battle.nodeKind ? getNodeKindLabel(battle.nodeKind) : "Battle"}</Text>
          </View>
          <View style={styles.battlePersistentStatsRow}>
            {battlePersistentStats.map((stat) => (
              <View key={stat.label} style={[styles.battlePersistentStatPill, stat.label === "Health" && styles.battlePersistentStatPillHealth]}>
                <Text style={styles.battlePersistentStatLabel}>{stat.label}</Text>
                <Text style={styles.battlePersistentStatValue}>{stat.value}</Text>
              </View>
            ))}
          </View>

          <Animated.View style={[styles.battleArenaCombatants, !exchangeComplete && { transform: [{ translateX: battleArenaShake }] }]}>
            <Animated.View style={[styles.battleDragonSide, !exchangeComplete && { transform: [{ translateX: dragonSideMotion }, { scale: hitPauseScale }] }]}>
              <View style={[styles.battleDragonAura, { borderColor: theme.primary, backgroundColor: `${theme.primary}33` }]} />
              <DragonImage
                  element={element}
                  stage={gameStageToArtStage(state.dragon.stage)}
                  dragonClass={state.dragon.path ? dragonPathDefinitions[state.dragon.path].role : undefined}
                  style={[styles.battleDragonHeroSprite, styles.battleDragonFacingRight] as any}
                  resizeMode="contain"
                />
              {dragonAttackActive ? <Animated.View style={[styles.battleImpactSlash, styles.battleDragonProjectile, { opacity: hitFlashOpacity }]} /> : null}
              {activeExchange ? <Animated.View style={[styles.battleImpactRing, styles.battleImpactRingDragon, { opacity: hitFlashOpacity, transform: [{ scale: damageFloatScale }] }]} /> : null}
              {enemyAttackActive ? <Animated.View style={[styles.battleImpactSpark, styles.battleImpactSparkDragon, { opacity: hitFlashOpacity }]} /> : null}
              {dragonDamageBadgeText ? (
                <Animated.View style={[styles.battleDamageBadge, styles.battleDamageBadgeDragon, { opacity: hitFlashOpacity, transform: [{ translateY: damageFloatTranslateY }, { scale: damageFloatScale }] }]}>
                  <Text style={styles.battleDamageBadgeText}>{dragonDamageBadgeText}</Text>
                </Animated.View>
              ) : null}
              <Text style={styles.battleCombatantName}>Your {state.dragon.stage}</Text>
              <View style={styles.battleHpTrack}>
                <View style={[styles.battleHpFill, { width: playerHpPercent as any, backgroundColor: theme.primary }]} />
              </View>
              <Text style={styles.battleHpText}>Chapter HP {animatedHp.playerHp}/{chapterMaxHp}</Text>
            </Animated.View>

            <View style={styles.battleVersusBurst}>
              <Text style={styles.battleVersusText}>VS</Text>
            </View>

            <Animated.View style={[styles.battleEnemySide, !exchangeComplete && { transform: [{ translateX: enemySideMotion }, { scale: hitPauseScale }] }, { opacity: enemyDeathPulse, transform: [{ translateX: enemyDeathPulse.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }) }] }]}>
              <Image source={enemyImages[enemyImageKey]} style={styles.battleEnemyBossSprite} resizeMode="contain" />
              {enemyAttackActive ? <Animated.View style={[styles.battleImpactSlash, styles.battleEnemyProjectile, { opacity: hitFlashOpacity }]} /> : null}
              {activeExchange ? <Animated.View style={[styles.battleImpactRing, styles.battleImpactRingEnemy, { opacity: hitFlashOpacity, transform: [{ scale: damageFloatScale }] }]} /> : null}
              {dragonAttackActive ? <Animated.View style={[styles.battleImpactSpark, styles.battleImpactSparkEnemy, { opacity: hitFlashOpacity }]} /> : null}
              {enemyDamageBadgeText ? (
                <Animated.View style={[styles.battleDamageBadge, styles.battleDamageBadgeEnemy, { opacity: hitFlashOpacity, transform: [{ translateY: damageFloatTranslateY }, { scale: damageFloatScale }] }]}>
                  <Text style={styles.battleDamageBadgeText}>{enemyDamageBadgeText}</Text>
                </Animated.View>
              ) : null}
              <Text style={styles.battleCombatantName}>{battle.title ?? battle.encounter.name}</Text>
              <View style={styles.battleHpTrack}>
                <View style={[styles.battleHpFill, { width: enemyHpPercent as any, backgroundColor: "#ff5f7a" }]} />
              </View>
              <Text style={styles.battleHpText}>Enemy HP {animatedHp.enemyHp}/{battle.encounter.stats.health}</Text>
            </Animated.View>
          </Animated.View>

          {!exchangeComplete ? (
            <View style={styles.battleFightHud}>
              <Text style={styles.battleFightCue} numberOfLines={1}>{fightCue}</Text>
              <View style={styles.battleExchangeReadoutRow}>
                <View style={[styles.battleExchangePill, dragonAttackActive && styles.battleExchangePillActiveDragon]}>
                  <Text style={styles.battleExchangePillKicker}>Your turn</Text>
                  <Text style={styles.battleExchangePillText} numberOfLines={1}>{dragonExchangeSummary}</Text>
                </View>
                <View style={[styles.battleExchangePill, enemyAttackActive && styles.battleExchangePillActiveEnemy]}>
                  <Text style={styles.battleExchangePillKicker}>Enemy turn</Text>
                  <Text style={styles.battleExchangePillText} numberOfLines={1}>{enemyExchangeSummary}</Text>
                </View>
              </View>
              {battle.activeSkill ? (
                <Text style={styles.battleSkillText} numberOfLines={1}>Active skill: {battle.activeSkill.name} • {battle.activeSkill.combatEffect}</Text>
              ) : null}
              <Text style={styles.battleFightStats} numberOfLines={1}>Health {animatedHp.playerHp}/{chapterMaxHp} • Attack {boostedStats.attack} • Defense {boostedStats.defense} • CRIT {boostedStats.critChance}% • BLOCK {boostedStats.block}% • DODGE {boostedStats.dodge}%</Text>
            </View>
          ) : null}

          {exchangeComplete ? <BattleOutcomeBanner battle={battle} continueScreen={continueScreen} /> : null}
          {exchangeComplete ? <BattleFlashCalloutRail battle={battle} stats={boostedStats} element={element} /> : null}

          <Pressable
            disabled={battleStarted && !exchangeComplete}
            onPress={() => {
              if (!battleStarted) {
                setBattleStarted(true);
                return;
              }
              dispatch({ type: "setScreen", screen: continueScreen });
            }}
            style={[styles.battleArenaContinueButton, battleStarted && !exchangeComplete && styles.battleArenaContinueButtonDisabled]}
          >
            <Text style={styles.battleArenaContinueText}>{!battleStarted ? "Start Battle" : exchangeComplete ? (continueScreen === "den" ? "Return to Den" : "Continue Run") : "Fighting..."}</Text>
          </Pressable>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: uiTheme.colors.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.4,
    marginBottom: 8
  },
  bodyText: {
    color: uiTheme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginBottom: 6
  },
  fireBreathCombatLayer: {
    bottom: 190,
    height: 270,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 11
  },
  fireBreathEnemyCard: {
    alignItems: "center",
    minHeight: 132,
    paddingHorizontal: 9,
    paddingVertical: 8,
    position: "absolute",
    left: 14,
    top: 78,
    width: 118
  },
  fireBreathEnemyShadow: {
    backgroundColor: "rgba(0,0,0,0.34)",
    borderRadius: 999,
    height: 12,
    marginTop: 54,
    position: "absolute",
    width: 76
  },
  fireBreathEnemySpriteFrame: {
    alignItems: "center",
    height: 66,
    justifyContent: "center",
    marginBottom: 3,
    width: 88
  },
  fireBreathEnemyImage: {
    height: 62,
    width: 84
  },
  fireBreathHitSparks: {
    borderColor: "rgba(255,211,93,0.9)",
    borderLeftWidth: 0,
    borderRadius: 999,
    borderRightWidth: 3,
    borderTopWidth: 2,
    height: 78,
    left: 18,
    position: "absolute",
    top: 2,
    transform: [{ rotate: "-18deg" }],
    width: 78
  },
  fireBreathEnemyName: {
    color: uiTheme.colors.text,
    fontSize: 11,
    fontWeight: "900",
    maxWidth: 98,
    textAlign: "center"
  },
  fireBreathEnemyMeta: {
    color: uiTheme.colors.gold,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 5,
    textTransform: "uppercase"
  },
  fireBreathDragonHpCard: {
    alignItems: "center",
    backgroundColor: "rgba(6,8,20,0.7)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 62,
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: "absolute",
    right: 18,
    top: 182,
    width: 136,
    zIndex: 12
  },
  fireBreathDragonHitFlash: {
    backgroundColor: "rgba(255,120,79,0.34)",
    borderColor: "rgba(255,255,255,0.42)",
    borderRadius: 16,
    borderWidth: 1,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  fireBreathDragonName: {
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  fireBreathDragonHpTrack: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    height: 8,
    marginTop: 6,
    overflow: "hidden",
    width: 110
  },
  fireBreathDragonHpFill: {
    borderRadius: 999,
    height: "100%"
  },
  fireBreathDragonMeta: {
    color: uiTheme.colors.muted,
    fontSize: 9,
    fontWeight: "900",
    marginTop: 5,
    textTransform: "uppercase"
  },
  enemyStrikeSlash: {
    alignItems: "center",
    backgroundColor: "rgba(255,91,110,0.26)",
    borderColor: "rgba(255,220,220,0.72)",
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    left: 94,
    position: "absolute",
    top: 145,
    width: 58,
    zIndex: 14
  },
  enemyStrikeSlashText: {
    color: "#ffd5d8",
    fontSize: 22,
    fontWeight: "900"
  },
  fireBreathHpTrack: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    height: 7,
    marginTop: 7,
    overflow: "hidden",
    width: 94
  },
  fireBreathHpFill: {
    backgroundColor: "#ff784f",
    borderRadius: 999,
    height: "100%"
  },
  fireBreathParticleTrail: {
    height: 1,
    left: "47%",
    position: "absolute",
    top: 132,
    width: 1
  },
  fireBreathParticle: {
    borderRadius: 999,
    position: "absolute"
  },
  combatTurnLabel: {
    backgroundColor: "rgba(10,8,22,0.72)",
    borderColor: "rgba(255,232,163,0.34)",
    borderRadius: 999,
    borderWidth: 1,
    color: uiTheme.colors.text,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: "absolute",
    textTransform: "uppercase",
    zIndex: 12
  },
  combatTurnLabelDragon: {
    maxWidth: 172,
    right: 30,
    textAlign: "center",
    top: 78
  },
  combatTurnLabelEnemyHit: {
    color: uiTheme.colors.gold,
    left: 30,
    maxWidth: 172,
    textAlign: "center",
    top: 52
  },
  combatTurnLabelEnemy: {
    left: 20,
    top: 178
  },
  combatTurnLabelDragonBrace: {
    color: "#ffd6a4",
    maxWidth: 172,
    right: 34,
    textAlign: "center",
    top: 168
  },
  combatStatFxBadge: {
    backgroundColor: "rgba(4,8,18,0.82)",
    borderRadius: 999,
    borderWidth: 1,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: "absolute",
    textTransform: "uppercase",
    zIndex: 13
  },
  combatStatFxBadgeCrit: {
    borderColor: "rgba(255,214,94,0.7)",
    color: "#ffe27a",
    left: 24,
    top: 28
  },
  combatStatFxBadgeDodge: {
    borderColor: "rgba(112,215,255,0.66)",
    color: "#a7f3ff",
    right: 24,
    top: 198
  },
  combatStatFxBadgeBlock: {
    borderColor: "rgba(196,255,168,0.62)",
    color: "#d9f99d",
    right: 30,
    top: 224
  },
  fireBreathMouthGlow: {
    backgroundColor: "rgba(255,214,94,0.9)",
    borderColor: "rgba(255,124,54,0.72)",
    borderRadius: 999,
    borderWidth: 2,
    height: 26,
    left: "47%",
    position: "absolute",
    top: 119,
    width: 26
  },
  battleTacticPreview: {
    backgroundColor: "rgba(248,217,135,0.12)",
    borderColor: "rgba(248,217,135,0.26)",
    borderRadius: 16,
    borderWidth: 1,
    gap: 7,
    marginTop: 9,
    padding: 9
  },
  battleTacticPreviewFocused: {
    backgroundColor: "rgba(255,255,255,0.07)",
    gap: 5,
    padding: 8
  },
  battleTacticKicker: {
    color: "#f8d987",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  battleTacticTitle: {
    color: "#fff8ef",
    fontSize: 12,
    fontWeight: "900"
  },
  battleTacticChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  battleTacticChip: {
    backgroundColor: "rgba(255,248,239,0.08)",
    borderColor: "rgba(248,217,135,0.18)",
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    paddingHorizontal: 7,
    paddingVertical: 5
  },
  battleTacticChipLabel: {
    color: "#ffb347",
    fontSize: 10,
    fontWeight: "900"
  },
  battleTacticChipText: {
    color: "#d8cfef",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 1
  },
  battleFullScreenArena: {
    flex: 1,
    height: "100%"
  },
  battleArenaScene: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden"
  },
  battleArenaImage: {
    borderRadius: 0
  },
  battleArenaScrim: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 14,
    paddingHorizontal: 12,
    paddingTop: 14
  },
  battleArenaHud: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  battleArenaBadge: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  battleArenaBadgeText: {
    color: "#24150f",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  battleArenaKind: {
    color: "#fff8ef",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  battlePersistentStatsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8
  },
  battlePersistentStatPill: {
    alignItems: "center",
    backgroundColor: "rgba(8,6,17,0.78)",
    borderColor: "rgba(248,217,135,0.38)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  battlePersistentStatPillHealth: {
    borderColor: "rgba(255,95,122,0.58)"
  },
  battlePersistentStatLabel: {
    color: "#f8d987",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  battlePersistentStatValue: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 1
  },
  battleArenaCombatants: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2
  },
  battleDragonSide: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 292
  },
  battleEnemySide: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 292
  },
  battleDragonAura: {
    borderRadius: 999,
    borderWidth: 3,
    height: 188,
    opacity: 0.62,
    position: "absolute",
    top: 32,
    width: 188
  },
  battleDragonHeroSprite: {
    height: 220,
    width: 178
  },
  battleDragonFacingRight: {
    transform: [{ scaleX: -1 }]
  },
  battleEnemyBossSprite: {
    height: 226,
    width: 184
  },
  battleImpactSlash: {
    borderRadius: 999,
    height: 12,
    position: "absolute",
    top: 116,
    width: 92,
    zIndex: 4
  },
  battleImpactRing: {
    borderColor: "rgba(255,248,239,0.88)",
    borderRadius: 999,
    borderWidth: 3,
    height: 96,
    position: "absolute",
    top: 74,
    width: 96,
    zIndex: 5
  },
  battleImpactRingDragon: {
    left: 44
  },
  battleImpactRingEnemy: {
    right: 42
  },
  battleImpactSpark: {
    backgroundColor: "rgba(255,248,239,0.96)",
    borderRadius: 999,
    height: 18,
    position: "absolute",
    shadowColor: "#fff8ef",
    shadowOpacity: 0.9,
    shadowRadius: 16,
    top: 112,
    width: 18,
    zIndex: 7
  },
  battleImpactSparkDragon: {
    left: 64
  },
  battleImpactSparkEnemy: {
    right: 62
  },
  battleDamageBadge: {
    alignItems: "center",
    backgroundColor: "rgba(32,19,49,0.92)",
    borderColor: "rgba(255,248,239,0.92)",
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: "absolute",
    shadowColor: "#fff8ef",
    shadowOpacity: 0.55,
    shadowRadius: 10,
    zIndex: 6
  },
  battleDamageBadgeDragon: {
    left: 42,
    top: 86
  },
  battleDamageBadgeEnemy: {
    right: 34,
    top: 84
  },
  battleDamageBadgeText: {
    color: "#fff8ef",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.4
  },
  battleDragonProjectile: {
    backgroundColor: "#a7f3ff",
    right: -34,
    shadowColor: "#6be8ff",
    shadowOpacity: 0.95,
    shadowRadius: 16,
    transform: [{ rotate: "-8deg" }]
  },
  battleEnemyProjectile: {
    backgroundColor: "#ff6a7a",
    left: -26,
    shadowColor: "#ff6a7a",
    shadowOpacity: 0.9,
    shadowRadius: 14,
    transform: [{ rotate: "8deg" }]
  },
  battleVersusBurst: {
    alignItems: "center",
    backgroundColor: "rgba(255,216,119,0.9)",
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    borderWidth: 3,
    height: 72,
    justifyContent: "center",
    marginHorizontal: -4,
    shadowColor: "#ffd66f",
    shadowOpacity: 0.8,
    shadowRadius: 18,
    width: 72,
    zIndex: 3
  },
  battleVersusText: {
    color: "#2f1f18",
    fontSize: 22,
    fontWeight: "900"
  },
  battleCombatantName: {
    color: "#fff8ef",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 8,
    textAlign: "center"
  },
  battleHpTrack: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    height: 12,
    marginTop: 9,
    overflow: "hidden",
    width: "82%"
  },
  battleHpFill: {
    borderRadius: 999,
    height: "100%"
  },
  battleHpText: {
    color: "#f7e7c0",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 6
  },
  battleFightHud: {
    backgroundColor: "rgba(8,6,17,0.72)",
    borderColor: "rgba(248,217,135,0.32)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 3,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  battleFightCue: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center"
  },
  battleExchangeReadoutRow: {
    flexDirection: "row",
    gap: 8
  },
  battleExchangePill: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 9,
    paddingVertical: 6
  },
  battleExchangePillActiveDragon: {
    backgroundColor: "rgba(255,122,61,0.22)",
    borderColor: "rgba(255,179,71,0.55)"
  },
  battleExchangePillActiveEnemy: {
    backgroundColor: "rgba(255,95,122,0.2)",
    borderColor: "rgba(255,95,122,0.55)"
  },
  battleExchangePillKicker: {
    color: "#f8d987",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  battleExchangePillText: {
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 1
  },
  battleFightStats: {
    color: "#a7f3ff",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center"
  },
  battleOutcomeBanner: {
    alignItems: "center",
    backgroundColor: "rgba(8,6,17,0.78)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  battleOutcomeBannerWin: {
    borderColor: "rgba(143,255,210,0.48)"
  },
  battleOutcomeBannerLoss: {
    borderColor: "rgba(255,120,79,0.48)"
  },
  battleOutcomeIconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(255,248,239,0.12)",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  battleOutcomeIcon: {
    fontSize: 21
  },
  battleOutcomeCopy: {
    flex: 1
  },
  battleOutcomeKicker: {
    color: "#f8d987",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  battleOutcomeTitle: {
    color: "#fff8ef",
    fontSize: 16,
    fontWeight: "900"
  },
  battleOutcomeLine: {
    color: "#f7e7c0",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 1
  },
  battleOutcomeNext: {
    color: "#8ff7ff",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 1
  },
  battleArenaContinueButton: {
    alignItems: "center",
    backgroundColor: "#fff8ef",
    borderColor: "rgba(248,217,135,0.7)",
    borderRadius: 24,
    borderWidth: 2,
    marginTop: 8,
    paddingVertical: 14,
    shadowColor: "#f8d987",
    shadowOpacity: 0.26,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4
  },
  battleArenaContinueButtonDisabled: {
    opacity: 0.72
  },
  battleArenaContinueText: {
    color: "#201331",
    fontSize: 17,
    fontWeight: "900"
  },
  battleFlashCalloutRail: {
    backgroundColor: "rgba(255,120,79,0.12)",
    borderColor: "rgba(255,179,71,0.36)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 7,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  battleFlashCalloutKicker: {
    color: "#ffb347",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
    textTransform: "uppercase"
  },
  battleFlashCalloutGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  battleFlashCalloutCard: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    opacity: 0.7,
    paddingHorizontal: 6,
    paddingVertical: 6
  },
  battleFlashCalloutCardActive: {
    backgroundColor: "rgba(255,179,71,0.16)",
    borderColor: "rgba(255,179,71,0.44)",
    opacity: 1
  },
  battleFlashCalloutIcon: {
    fontSize: 16,
    textAlign: "center"
  },
  battleFlashCalloutLabel: {
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center"
  },
  battleFlashCalloutDetail: {
    color: "#ffd9bf",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
    textAlign: "center"
  },
  battleSkillText: {
    color: "#a7f3ff",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6,
    textAlign: "center"
  }
});
