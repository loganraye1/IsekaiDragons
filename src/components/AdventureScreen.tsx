import { type ReactNode, useEffect, useRef } from "react";
import { Animated, Easing, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { adventureNodes, elementTheme, encounters } from "../content";
import {
  dragonSkillDrafts,
  fireStarterAdventureMilestones,
  productiveWorkNowSlices,
  v02UpdateObjectives,
  equipmentBonusLabels,
  equipmentRarityDefinitions,
  getAdventureNodeById,
  getDragonPower,
  getNextAdventureDifficultyId,
  getEvolutionChapterRequirement,
  getRunCardBoostedStats,
  getNodeKindLabel,
  idleQuestDefinitions,
  idleQuestOrder,
  areaDefinitions,
  getQuestIntervalMs,
  treasureDefinitions,
  treasureOrder
} from "../game";
import { enemyImages, sceneImages } from "../constants/assets";
import DragonImage from "./DragonImage";
import { gameStageToArtStage } from "../constants/dragonArt";
import { uiTheme } from "../constants/theme";
import { SafeExpoImage } from "../ui/SafeMedia";
import { getAutoBattleEnemyImageKey, BattleTacticPreview } from "./BattleScreen";
import type { AdventureDifficultyId, AdventureNode, AreaId, GameAction, GameSettings, GameState, Stats } from "../types";
import { formatGameNumber, formatStat, formatBoost } from "../utils/format";

function formatAdventureReward(reward: {
  gold?: number;
  xp?: number;
  evolution?: number;
  statBoost?: Partial<Stats>;
}) {
  const parts = [
    reward.gold ? `${reward.gold}g` : null,
    reward.xp ? `${reward.xp} XP` : null,
    reward.evolution && reward.evolution >= 10 ? "major boss reward" : null,
    reward.statBoost ? formatBoost(reward.statBoost) : null
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "story progress";
}

function getSceneColor(scene: AdventureNode["scene"]) {
  switch (scene) {
    case "forest":
      return "rgba(58,103,50,0.92)";
    case "ruins":
      return "rgba(91,75,111,0.92)";
    case "cave":
      return "rgba(38,69,103,0.92)";
    case "shrine":
      return "rgba(88,91,156,0.92)";
    case "camp":
      return "rgba(127,74,37,0.92)";
    case "boss":
      return "rgba(116,36,45,0.94)";
    default:
      return "rgba(255,255,255,0.1)";
  }
}

function getAdventureNodeIcon(kind: AdventureNode["kind"]) {
  switch (kind) {
    case "battle":
      return "⚔️";
    case "elite":
      return "💢";
    case "treasure":
      return "🎁";
    case "shrine":
      return "🔮";
    case "camp":
      return "⛺";
    case "shop":
      return "🛒";
    case "boss":
      return "👑";
    default:
      return "•";
  }
}

function getAdventureNodeTone(kind: AdventureNode["kind"]) {
  switch (kind) {
    case "battle":
      return "#ff8a4d";
    case "elite":
      return "#ff5f7a";
    case "treasure":
      return "#f8d987";
    case "shrine":
      return "#b88cff";
    case "camp":
      return "#8fffd2";
    case "shop":
      return "#8ff7ff";
    case "boss":
      return "#ff3d55";
    default:
      return "#f8d987";
  }
}


function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionCardTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionCardSubtitle}>{subtitle}</Text> : null}
      <View style={styles.sectionCardBody}>{children}</View>
    </View>
  );
}

function FireStarterFocusPills() {
  const visibleMilestones = fireStarterAdventureMilestones.filter((milestone) => milestone.phase !== "research");
  return (
    <View style={styles.fireStarterFocusPillRow}>
      <Text style={styles.fireStarterFocusLead}>Fire plan</Text>
      {visibleMilestones.map((milestone) => (
        <Text key={milestone.id} style={styles.fireStarterFocusPill}>{milestone.phase}</Text>
      ))}
    </View>
  );
}

function FireStarterFocusPanel() {
  return (
    <SectionCard title="Fire Starter Expedition Focus" subtitle="Capybara Go research translated into dragon-first implementation targets">
      {fireStarterAdventureMilestones.map((milestone) => (
        <View key={milestone.id} style={styles.rewardRowCompact}>
          <View style={styles.progressRewardCopy}>
            <Text style={styles.traitTitle}>{milestone.title}</Text>
            <Text style={styles.traitText}>Capybara lesson: {milestone.capybaraLesson}</Text>
            <Text style={styles.rewardSummaryText}>Dragon twist: {milestone.dragonTwist}</Text>
            <Text style={styles.panelMutedText}>Visible proof: {milestone.visibleProof}</Text>
          </View>
        </View>
      ))}
    </SectionCard>
  );
}

function ProductiveWorkNowPanel() {
  return (
    <SectionCard title="Next 10-Minute Production Slice" subtitle="What Topnotch can inspect right now before the next deeper build pass">
      {productiveWorkNowSlices.map((slice) => (
        <View key={slice.id} style={styles.rewardRowCompact}>
          <View style={styles.progressRewardCopy}>
            <Text style={styles.traitTitle}>{slice.lane}</Text>
            <Text style={styles.traitText}>Production target: {slice.productionTarget}</Text>
            <Text style={styles.rewardSummaryText}>Visible deliverable: {slice.visibleDeliverable}</Text>
            <Text style={styles.panelMutedText}>Next hook: {slice.nextHook}</Text>
          </View>
        </View>
      ))}
    </SectionCard>
  );
}

const focusedFireRouteBriefStops = [
  { step: "Stop 1", label: "Feed", detail: "Buy spiced feed to teach the first attack bump." },
  { step: "Stop 3 fight", label: "Slimes", detail: "First bridge fight proves route stops become combat." },
  { step: "Stop 4", label: "Ember cache", detail: "Treasure adds hoard pressure and evolution heat." },
  { step: "Stop 6 fight", label: "Boar charge", detail: "Defense, block, and crit timing start to matter." },
  { step: "Stop 12 elite skill draft", label: "Ruin Knight", detail: "Elite gate unlocks the first Fire build draft." }
];

function FocusedFireRouteBriefPanel() {
  return (
    <View style={styles.focusedFireBriefPanel}>
      <View style={styles.focusedFireBriefHeader}>
        <Text style={styles.focusedFireBriefKicker}>Fire starter slice</Text>
        <Text style={styles.focusedFireBriefTitle}>First 12-stop Fire onboarding route</Text>
      </View>
      <Text style={styles.focusedFireBriefSummary}>Route → fight → chest is framed around ember growth: feed the hatchling, hit the bridge fight, secure hoard fuel, then reach the elite skill-draft gate.</Text>
      <View style={styles.focusedFireStopGrid}>
        {focusedFireRouteBriefStops.map((stop) => (
          <View key={stop.step} style={styles.focusedFireStopChip}>
            <Text style={styles.focusedFireStopStep}>{stop.step}</Text>
            <Text style={styles.focusedFireStopLabel}>{stop.label}</Text>
            <Text style={styles.focusedFireStopDetail}>{stop.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const waterMoonwellRouteBriefStops = [
  { step: "Stop 11", label: "Kelp camp", detail: "Water route opens on sustain, block, dodge, and tide tempo instead of generic travel." },
  { step: "Stop 12 fight", label: "Reef slimes", detail: "Elite bridge fight proves Tide Spiral, dodge, and block in the first Water combat stop." },
  { step: "Stop 13", label: "Pearlflow Trader", detail: "Pearl charms push Guardian/Raider/Mystic Water builds and loot identity." },
  { step: "Stop 18 fight", label: "Moonwell Gate", detail: "Manta guardian becomes the flashy Water combat checkpoint before route payoff." },
  { step: "Stop 20", label: "Tidal hoard", detail: "Pearls, shell coins, and damp relics sell the route as dragon adventure loot." }
];

function WaterMoonwellRouteBriefPanel() {
  return (
    <View style={styles.focusedFireBriefPanel}>
      <View style={styles.focusedFireBriefHeader}>
        <Text style={styles.focusedFireBriefKicker}>Moonwell route</Text>
        <Text style={styles.focusedFireBriefTitle}>Water Moonwell Tide Path</Text>
      </View>
      <Text style={styles.focusedFireBriefSummary}>The next 10-stop route slice turns Water into a readable dragon build: graceful tide movement, pearl-shop choices, reef fights, dodge/block stat pressure, and a moonlit hoard finish.</Text>
      <View style={styles.focusedFireStopGrid}>
        {waterMoonwellRouteBriefStops.map((stop) => (
          <View key={stop.step} style={[styles.focusedFireStopChip, { borderColor: "rgba(88,199,255,0.36)" }]}>
            <Text style={[styles.focusedFireStopStep, { color: "#8ff7ff" }]}>{stop.step}</Text>
            <Text style={styles.focusedFireStopLabel}>{stop.label}</Text>
            <Text style={styles.focusedFireStopDetail}>{stop.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const earthCrystalCragRouteBriefStops = [
  { step: "Stop 21 fight", label: "Crag basecamp", detail: "Earth route opens with Gemhide pressure, defense, block, and chunky bracing." },
  { step: "Stop 22", label: "Gemhide camp", detail: "Post-fight saddlebags and stone training make the hoard feel heavy." },
  { step: "Stop 23", label: "Rune market", detail: "Bulwark vs Shatter runes preview Guardian/Raider/Mystic Earth builds." },
  { step: "Stop 27 fight", label: "Crystal Golem Gate", detail: "Flashy combat checkpoint sells Crystal Break, heavy shakes, and shielded enemies." },
  { step: "Stop 30", label: "Titan hoard", detail: "Boss-scale stone guardian turns the route finish into a heavy relic payoff." }
];

function EarthCrystalCragRouteBriefPanel() {
  return (
    <View style={styles.focusedFireBriefPanel}>
      <View style={styles.focusedFireBriefHeader}>
        <Text style={styles.focusedFireBriefKicker}>Crystal Crag route</Text>
        <Text style={styles.focusedFireBriefTitle}>Earth Crystal Crag Path</Text>
      </View>
      <Text style={styles.focusedFireBriefSummary}>The next 10-stop route slice makes Earth feel crunchy and tactical: heavy bracing, rune choices, gemhide fights, defense/block stat pressure, armor-breaking Crystal Break moments, and a titan-stone hoard finish.</Text>
      <View style={styles.focusedFireStopGrid}>
        {earthCrystalCragRouteBriefStops.map((stop) => (
          <View key={stop.step} style={[styles.focusedFireStopChip, { borderColor: "rgba(171,219,133,0.38)" }]}>
            <Text style={[styles.focusedFireStopStep, { color: "#b8f28b" }]}>{stop.step}</Text>
            <Text style={styles.focusedFireStopLabel}>{stop.label}</Text>
            <Text style={styles.focusedFireStopDetail}>{stop.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const lightSunbeamSpiresRouteBriefStops = [
  { step: "Stop 31", label: "Sunbeam arrival", detail: "Light opens with golden bridges, healing identity, crit clarity, and heroic tempo." },
  { step: "Stop 32", label: "Halo market", detail: "Guardian/Raider/Mystic charms frame Light as shield, pierce, or radiant speed." },
  { step: "Stop 33 fight", label: "Radiant wisps", detail: "First Light combat checkpoint proves speed, dodge, and readable beam flashes." },
  { step: "Stop 36 elite", label: "Sun Lancer Duel", detail: "A spear-bright mirror fight sells Sunbeam Lance, halo shields, and crit sparks." },
  { step: "Stop 40", label: "Aurora crown", detail: "Boss-scale hoard finish turns Light into a treasure-shine payoff, not generic support." }
];

function LightSunbeamSpiresRouteBriefPanel() {
  return (
    <View style={styles.focusedFireBriefPanel}>
      <View style={styles.focusedFireBriefHeader}>
        <Text style={styles.focusedFireBriefKicker}>Sunbeam route</Text>
        <Text style={styles.focusedFireBriefTitle}>Light Sunbeam Spires Path</Text>
      </View>
      <Text style={styles.focusedFireBriefSummary}>The next 10-stop route slice makes Light playable and distinct: halo protection, sun-lance burst, aurora recovery, crit-focused combat readability, and a bright crown-hoard boss finish.</Text>
      <View style={styles.focusedFireStopGrid}>
        {lightSunbeamSpiresRouteBriefStops.map((stop) => (
          <View key={stop.step} style={[styles.focusedFireStopChip, { borderColor: "rgba(255,229,143,0.42)" }]}>
            <Text style={[styles.focusedFireStopStep, { color: "#ffe58f" }]}>{stop.step}</Text>
            <Text style={styles.focusedFireStopLabel}>{stop.label}</Text>
            <Text style={styles.focusedFireStopDetail}>{stop.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function AdventureJourneyScene({ state, onReturnToDen, focused = false }: { state: GameState; onReturnToDen: () => void; focused?: boolean }) {
  const element = state.dragon.element ?? "fire";
  const run = state.adventureRun;
  const pendingNode = run?.pendingNodeId ? getAdventureNodeById(run.pendingNodeId) : null;
  const currentNode = pendingNode ?? run?.nodes.find((node) => node.step === run.step) ?? run?.nodes[0] ?? null;
  const isFightStop = Boolean(pendingNode && (pendingNode.kind === "battle" || pendingNode.kind === "elite" || pendingNode.kind === "boss"));
  const showEnemyEncounter = !focused || isFightStop;
  const enemyImageKey = currentNode?.encounterId
    ? getAutoBattleEnemyImageKey(encounters.find((item) => item.id === currentNode.encounterId)?.name ?? state.autoBattle.enemyName, state.autoBattle.areaId)
    : getAutoBattleEnemyImageKey(state.autoBattle.enemyName, state.autoBattle.areaId);
  const safeEnemyMaxHp = Math.max(1, state.autoBattle.enemyMaxHp);
  const enemyHpPercent = Math.max(0, Math.min(100, Math.round((state.autoBattle.enemyHp / safeEnemyMaxHp) * 100)));
  const routeStep = state.autoBattle.defeatedCount % 4;
  const totalTreasures = treasureOrder.reduce((total, treasureId) => total + (state.treasures[treasureId] ?? 0), 0);
  const adventureAreaScenes: Record<AreaId, AdventureNode["scene"]> = {
    mysticMeadow: "forest",
    emberWoods: "camp",
    tideCavern: "cave",
    stonebackHills: "ruins",
    skyRuins: "shrine",
    voidNest: "boss"
  };
  const travelProgress = useRef(new Animated.Value(0)).current;
  const backgroundPan = useRef(new Animated.Value(0)).current;
  const battlePulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const targetProgress = isFightStop ? 1 : Math.min(0.74, Math.max(0.18, ((run?.step ?? 1) % 6) / 6 + 0.18));

    if (state.settings.reducedMotion) {
      if (isFightStop) {
        travelProgress.setValue(1);
        battlePulse.setValue(1);
      } else {
        travelProgress.setValue(targetProgress);
        battlePulse.setValue(0);
      }
      backgroundPan.setValue(0);
      return;
    }

    travelProgress.stopAnimation();
    backgroundPan.stopAnimation();
    battlePulse.stopAnimation();
    travelProgress.setValue(0);
    backgroundPan.setValue(0);
    battlePulse.setValue(0);

    const travelAnimation = Animated.timing(travelProgress, {
      toValue: targetProgress,
      duration: isFightStop ? 420 : 620,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true
    });
    const backgroundAnimation = Animated.timing(backgroundPan, {
      toValue: isFightStop ? 0.48 : 0.28,
      duration: isFightStop ? 420 : 620,
      easing: Easing.linear,
      useNativeDriver: true
    });
    const battleAnimation = isFightStop
      ? Animated.loop(
        Animated.sequence([
          Animated.timing(battlePulse, { toValue: 1, duration: 170, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(battlePulse, { toValue: 0, duration: 170, easing: Easing.in(Easing.quad), useNativeDriver: true })
        ])
      )
      : Animated.timing(battlePulse, { toValue: 0.25, duration: 620, easing: Easing.out(Easing.quad), useNativeDriver: true });

    Animated.parallel([travelAnimation, backgroundAnimation]).start(() => {
      if (isFightStop) {
        battleAnimation.start();
      }
    });
    if (!isFightStop) {
      battleAnimation.start();
    }

    return () => {
      travelAnimation.stop();
      backgroundAnimation.stop();
      battleAnimation.stop();
    };
  }, [backgroundPan, battlePulse, isFightStop, run?.step, state.settings.reducedMotion, travelProgress]);

  const walkerStyle = {
    transform: [
      {
        translateX: travelProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 120]
        })
      },
      {
        translateY: battlePulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -9]
        })
      }
    ]
  };
  const clashStyle = {
    opacity: battlePulse.interpolate({
      inputRange: [0, 0.45, 1],
      outputRange: [0.25, 1, 0.35]
    }),
    transform: [
      {
        scale: battlePulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.72, 1.24]
        })
      }
    ]
  };
  const backgroundStyle = {
    transform: [
      {
        translateX: backgroundPan.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -72]
        })
      }
    ]
  };

  return (
    <View style={[styles.adventureJourneyStage, focused && styles.adventureJourneyStageFocused]}>
      <Animated.View style={[styles.adventureJourneyMovingBackdrop, backgroundStyle]}>
        <SafeExpoImage source={sceneImages[adventureAreaScenes[state.currentArea]]} style={styles.adventureJourneyBackdrop} contentFit="cover" transition={200} />
      </Animated.View>
      <LinearGradient colors={["rgba(8,6,17,0.12)", "rgba(8,6,17,0.82)"]} style={styles.adventureJourneyScrim} />
      <View style={styles.adventureRouteLine}>
        <View style={[styles.adventureRouteNode, routeStep >= 0 && styles.adventureRouteNodeActive]} />
        <View style={[styles.adventureRouteNode, routeStep >= 1 && styles.adventureRouteNodeActive]} />
        <View style={[styles.adventureRouteNode, routeStep >= 2 && styles.adventureRouteNodeActive]} />
        <View style={[styles.adventureRouteNode, styles.adventureRouteNodeDen]} />
      </View>
      <Animated.View style={[styles.adventureDragonWalker, walkerStyle]}>
        <DragonImage
            element={element}
            stage={gameStageToArtStage(state.dragon.stage)}
            style={[styles.adventureDragonSprite, styles.adventureDragonSpriteFacingRight] as any}
            resizeMode="contain"
          />
      </Animated.View>
      {showEnemyEncounter ? (
        <View style={styles.adventureEnemyEncounter}>
          <Animated.View style={[styles.adventureClashBurst, clashStyle]} />
          <Image source={enemyImages[enemyImageKey]} style={styles.adventureEnemySprite} resizeMode="contain" />
          <Text style={styles.adventureEnemyName}>{state.autoBattle.enemyName}</Text>
          <View style={styles.adventureEnemyHpTrack}>
            <View style={[styles.adventureEnemyHpFill, { width: `${enemyHpPercent}%` as any }]} />
          </View>
        </View>
      ) : null}
      {!focused ? (
        <View style={styles.adventureDenReturn}>
          <Text style={styles.adventureDenIcon}>🏠</Text>
          <Text style={styles.adventureDenText}>{totalTreasures} treasures secured</Text>
          <Pressable onPress={onReturnToDen} style={styles.adventureDenButton}>
            <Text style={styles.adventureDenButtonText}>Return to Den</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function AdventureQuestPanel({ state }: { state: GameState }) {
  const area = areaDefinitions[state.currentArea];
  const questIntervalSeconds = getQuestIntervalMs(state) / 1000;
  return (
    <View style={styles.adventureQuestPanel}>
      <View style={styles.adventurePanelHeader}>
        <View>
          <Text style={styles.choiceNumber}>Current Area</Text>
          <Text style={styles.adventureAreaName}>{area.name}</Text>
        </View>
        <Text style={styles.adventureTimerText}>Auto quest: {questIntervalSeconds}s</Text>
      </View>

      <View style={styles.questRows}>
        {idleQuestOrder.map((questId) => {
          const quest = idleQuestDefinitions[questId];
          const progress = Math.min(state.idleQuestProgress[questId] ?? 0, quest.target);
          const percent = `${Math.round((progress / quest.target) * 100)}%`;
          return (
            <View key={questId} style={styles.questRow}>
              <View style={styles.questRowTop}>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <Text style={styles.questCount}>
                  {progress}/{quest.target}
                </Text>
              </View>
              <View style={styles.questTrack}>
                <View style={[styles.questFill, { width: percent as any }]} />
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.treasureInventory}>
        {treasureOrder.map((treasureId) => {
          const treasure = treasureDefinitions[treasureId];
          const count = state.treasures[treasureId] ?? 0;
          return (
            <View key={treasureId} style={styles.treasureChip}>
              <Text style={styles.treasureName}>{treasure.name} x{count}</Text>
              <Text style={styles.treasureBonus}>{treasure.bonus}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function RewardChips({ rewardText }: { rewardText: string }) {
  return (
    <View style={styles.rewardChipRow}>
      {rewardText.split(", ").map((part) => (
        <View key={part} style={styles.rewardChip}>
          <Text style={styles.rewardChipText}>{part}</Text>
        </View>
      ))}
    </View>
  );
}

function AdventureRewardLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.adventureRewardLine}>
      <Text style={styles.adventureRewardLineLabel}>{label}</Text>
      <Text style={styles.adventureRewardLineValue}>{value}</Text>
    </View>
  );
}

function ShadowPressureReadout({ focused = false }: { focused?: boolean }) {
  return (
    <View style={[styles.shadowPressureReadout, focused && styles.shadowPressureReadoutFocused]}>
      <Text style={styles.shadowPressureKicker}>Shadow pressure</Text>
      <Text numberOfLines={focused ? 1 : 2} style={styles.shadowPressureText}>Dark foes ramp from guarded ambushes into late-route pressure. Watch Light/Dark advantage, protect Chapter HP, then strike through the veil.</Text>
    </View>
  );
}

function FireSkillChoiceRecap({ node, focused = false }: { node: AdventureNode; focused?: boolean }) {
  if (node.kind !== "elite") {
    return null;
  }

  const fireSkillChoices = [
    { name: "Ash Warden", hook: "block + defense", payoff: "protect the hoard with counter-burns" },
    { name: "Inferno Raider", hook: "attack + crit", payoff: "burst through enemies with Overheat Fang" },
    { name: "Sunscale Guide", hook: "speed + dodge", payoff: "read the route and control tempo" }
  ];

  return (
    <View style={[styles.fireSkillChoiceRecap, focused && styles.fireSkillChoiceRecapFocused]}>
      <Text style={styles.fireSkillChoiceKicker}>Skill reward ahead</Text>
      <Text style={styles.fireSkillChoiceTitle}>Win this elite fight to choose a new run skill.</Text>
      <View style={styles.fireSkillChoiceGrid}>
        {fireSkillChoices.map((choice) => (
          <View key={choice.name} style={styles.fireSkillChoiceChip}>
            <Text style={styles.fireSkillChoiceName}>{choice.name}</Text>
            <Text style={styles.fireSkillChoiceHook}>{choice.hook}</Text>
            {!focused ? <Text style={styles.fireSkillChoicePayoff}>{choice.payoff}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function AdventureNodeStrip({ nodes, currentNode, clearedNodeIds }: { nodes: AdventureNode[]; currentNode: AdventureNode; clearedNodeIds: string[] }) {
  const currentStep = currentNode.step;
  const currentIndex = Math.max(0, nodes.findIndex((node) => node.step === currentStep));
  const visibleNodes = nodes.slice(Math.max(0, currentIndex - 2), currentIndex + 6);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.capybaraRouteScroll} contentContainerStyle={styles.capybaraRouteRail}>
      {visibleNodes.map((node, index) => {
        const current = node.id === currentNode.id;
        const cleared = clearedNodeIds.includes(node.id);
        const tone = getAdventureNodeTone(node.kind);
        return (
          <View key={node.id} style={styles.capybaraRouteNodeWrap}>
            <View style={[styles.capybaraRouteNode, current && styles.capybaraRouteNodeCurrent, cleared && styles.capybaraRouteNodeCleared, { borderColor: current ? tone : "rgba(255,255,255,0.26)" }]}>
              <Text style={styles.capybaraRouteNodeIcon}>{cleared ? "✓" : getAdventureNodeIcon(node.kind)}</Text>
            </View>
            <Text style={[styles.capybaraRouteStep, current && { color: tone }]}>#{node.step}</Text>
            {index < visibleNodes.length - 1 ? <View style={[styles.capybaraRouteConnector, cleared && { backgroundColor: tone }]} /> : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

function AdventureSkillDraftCard({ state, dispatch, focused = false }: { state: GameState; dispatch?: (action: GameAction) => void; focused?: boolean }) {
  const offer = state.lastSkillDraftOffer;
  const runActive = state.adventureRun?.status === "active";
  if (!offer || offer.chosenSkillId || !runActive) {
    return null;
  }

  const offeredSkills = offer.skillIds
    .map((skillId) => dragonSkillDrafts.find((skill) => skill.id === skillId))
    .filter(Boolean) as typeof dragonSkillDrafts;

  return (
    <View style={[styles.fireSkillChoiceRecap, focused && styles.fireSkillChoiceRecapFocused]}>
      <Text style={styles.fireSkillChoiceKicker}>Choose a skill</Text>
      <Text style={styles.fireSkillChoiceTitle}>Pick one run skill for the road ahead.</Text>
      <View style={styles.fireSkillChoiceGrid}>
        {offeredSkills.map((skill) => (
          <Pressable
            key={skill.id}
            disabled={!dispatch}
            onPress={() => dispatch?.({ type: "selectActiveSkill", skillId: skill.id })}
            style={styles.fireSkillChoiceChip}
          >
            <Text style={styles.fireSkillChoiceName}>{skill.name}</Text>
            <Text style={styles.fireSkillChoiceHook}>{skill.trigger}</Text>
            {!focused ? <Text style={styles.fireSkillChoicePayoff}>{skill.effect}</Text> : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function CurrentAdventureEventCard({
  node,
  runStatus,
  isPending,
  dispatch,
  primaryLabel,
  onPrimaryPress,
  focused = false
}: {
  node: AdventureNode;
  runStatus: "idle" | "active" | "complete" | "failed";
  isPending: boolean;
  dispatch?: (action: GameAction) => void;
  primaryLabel: string;
  onPrimaryPress: () => void;
  focused?: boolean;
}) {
  const tone = getAdventureNodeTone(node.kind);
  const encounter = encounters.find((item) => item.id === node.encounterId);
  const choices = node.choices?.map((choice) => choice);
  const isFightEvent = node.kind === "battle" || node.kind === "elite" || node.kind === "boss";
  const recoveryPreview = node.kind === "shrine"
    ? "Recovery waypoint: shrine blessing restores at least 75% Chapter HP."
    : node.kind === "camp"
      ? "Recovery waypoint: camp rest restores at least 55% Chapter HP."
      : null;
  const showFocusedFightCard = focused && isPending && isFightEvent;

  if (showFocusedFightCard) {
    return (
      <View style={[styles.focusedCombatStopCard, { borderColor: tone }]}>
        <View style={styles.focusedCombatStopHeader}>
          <View style={[styles.focusedCombatStopIcon, { backgroundColor: tone }]}>
            <Text style={styles.capybaraEventIcon}>{getAdventureNodeIcon(node.kind)}</Text>
          </View>
          <View style={styles.focusedCombatStopCopy}>
            <Text style={styles.focusedCombatStopKicker}>Fight Stop</Text>
            <Text style={styles.focusedCombatStopTitle} numberOfLines={1}>{node.title}</Text>
          </View>
          <Text style={styles.focusedCombatStopStep}>#{node.step}</Text>
        </View>
        <Text style={styles.focusedCombatStopText} numberOfLines={2}>{encounter ? `${encounter.name} blocks node ${node.step}.` : node.description}</Text>
        {node.chapter === 3 ? <ShadowPressureReadout focused /> : null}
        <Pressable onPress={onPrimaryPress} style={styles.focusedCombatStopCta}>
          <Text style={styles.capybaraPrimaryCtaText}>{primaryLabel}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.capybaraEventCard, focused && styles.capybaraEventCardFocused, { borderColor: focused ? "rgba(248,217,135,0.26)" : tone }]}>
      <View style={styles.capybaraEventTopRow}>
        <View style={[styles.capybaraEventIconBadge, { backgroundColor: tone }]}>
          <Text style={styles.capybaraEventIcon}>{getAdventureNodeIcon(node.kind)}</Text>
        </View>
        <View style={styles.capybaraEventTitleBlock}>
          <Text style={[styles.capybaraEventKicker, focused && styles.capybaraEventKickerFocused]}>{runStatus === "idle" ? "Chapter start" : isPending ? "Active Stop" : "Next Stop"}</Text>
          <Text style={[styles.capybaraEventTitle, focused && styles.capybaraEventTitleFocused]}>{node.title}</Text>
        </View>
        <Text style={[styles.capybaraEventStep, focused && styles.capybaraEventStepFocused]}>#{node.step}</Text>
      </View>
      <Text numberOfLines={focused ? 2 : 2} style={[styles.capybaraEventText, focused && styles.capybaraEventTextFocused]}>{runStatus === "idle" ? "The Ember Gate opens under warm ashfall." : node.description}</Text>
      {node.chapter === 3 ? <ShadowPressureReadout focused={focused} /> : null}
      {recoveryPreview ? <Text style={[styles.capybaraEnemyHint, focused && styles.capybaraEnemyHintFocused]} numberOfLines={focused ? 1 : 2}>{recoveryPreview}</Text> : null}
      {encounter && !focused ? <Text style={styles.capybaraEnemyHint}>Enemy base: {encounter.name} • x{node.difficulty.toFixed(2)}</Text> : null}
      {focused && encounter ? <Text style={[styles.capybaraEnemyHint, styles.capybaraEnemyHintFocused]} numberOfLines={1}>Enemy: {encounter.name}</Text> : null}
      {encounter ? <BattleTacticPreview node={node} encounter={encounter} focused={focused} /> : null}
      <FireSkillChoiceRecap node={node} focused={focused} />
      {choices?.length && (!focused || isPending) ? (
        <View style={styles.capybaraChoiceGrid}>
          {node.choices?.map((choice) => (
            <Pressable
              key={choice.id}
              disabled={!dispatch || !isPending}
              onPress={() => dispatch?.({ type: "resolveAdventureChoice", nodeId: node.id, choiceId: choice.id })}
              style={[styles.capybaraChoiceButton, focused && styles.capybaraChoiceButtonFocused, !isPending && styles.capybaraChoiceButtonDisabled]}
            >
              <Text style={[styles.capybaraChoiceTitle, focused && styles.capybaraChoiceTitleFocused]}>{choice.label}</Text>
              <Text numberOfLines={focused ? 1 : undefined} style={[styles.capybaraChoiceText, focused && styles.capybaraChoiceTextFocused]}>{choice.description}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <Pressable onPress={onPrimaryPress} style={[styles.capybaraPrimaryCta, focused && styles.capybaraPrimaryCtaFocused, { backgroundColor: "#f8d987" }]}>
        <Text style={styles.capybaraPrimaryCtaText}>{primaryLabel}</Text>
      </Pressable>
    </View>
  );
}

function AdventureNodeCard({ node, dispatch, reducedMotion = false }: { node: AdventureNode; dispatch: (action: GameAction) => void; reducedMotion?: boolean }) {
  const entry = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const theme = elementTheme[node.element ?? "fire"];
  const encounter = encounters.find((item) => item.id === node.encounterId);
  const reward = formatAdventureReward(node.reward);
  const isHighStakes = node.kind === "elite" || node.kind === "boss";

  useEffect(() => {
    if (reducedMotion) {
      entry.setValue(1);
      return;
    }

    Animated.timing(entry, { toValue: 1, duration: 360, useNativeDriver: true }).start();
  }, [entry, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      pulse.setValue(0);
      return;
    }

    if (!isHighStakes) {
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [isHighStakes, pulse, reducedMotion]);

  const translateY = entry.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  return (
    <Animated.View style={{ opacity: entry, transform: [{ translateY }, { scale: glowScale }] }}>
      <Pressable
        onPress={() => dispatch({ type: "selectAdventureNode", nodeId: node.id })}
        onPressIn={() => {
          if (!reducedMotion) {
            Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true }).start();
          }
        }}
        onPressOut={() => {
          if (!reducedMotion) {
            Animated.spring(pressScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
          }
        }}
      >
        <Animated.View style={[styles.nodeCard, { borderColor: theme.primary, transform: [{ scale: pressScale }] }]}>
          <ImageBackground source={sceneImages[node.scene]} style={styles.nodeImageBackground} imageStyle={styles.nodeImage}>
            <LinearGradient colors={["rgba(8,6,17,0.1)", getSceneColor(node.scene), "rgba(8,6,17,0.96)"]} style={styles.nodeOverlay}>
              <View style={styles.nodeHeader}>
                <View style={[styles.nodeBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.elementChipText}>{getNodeKindLabel(node.kind)}</Text>
                </View>
                <Text style={styles.nodeDifficulty}>x{node.difficulty.toFixed(2)}</Text>
              </View>
              <Text style={styles.nodeTitle}>{node.title}</Text>
              <Text style={styles.bodyText}>{node.description}</Text>
              {encounter ? <Text style={styles.hintText}>Enemy base: {encounter.name}</Text> : null}
              {node.choices?.length ? <Text style={styles.hintText}>Choices: {node.choices.map((choice) => choice.label).join(" / ")}</Text> : null}
              <RewardChips rewardText={reward} />
            </LinearGradient>
          </ImageBackground>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function EventChoicePanel({ node, dispatch }: { node: AdventureNode; dispatch: (action: GameAction) => void }) {
  return (
    <ImageBackground source={sceneImages[node.scene]} style={styles.eventPanel} imageStyle={styles.eventPanelImage}>
      <LinearGradient colors={["rgba(8,6,17,0.2)", "rgba(8,6,17,0.96)"]} style={styles.eventPanelOverlay}>
        <Text style={styles.choiceNumber}>{getNodeKindLabel(node.kind)} Event</Text>
        <Text style={styles.panelTitle}>{node.title}</Text>
        <Text style={styles.bodyText}>{node.description}</Text>
        {node.choices?.map((choice) => (
          <Pressable
            key={choice.id}
            onPress={() => dispatch({ type: "resolveAdventureChoice", nodeId: node.id, choiceId: choice.id })}
            style={styles.eventChoiceCard}
          >
            <Text style={styles.answerTitle}>{choice.label}</Text>
            <Text style={styles.answerDescription}>{choice.description}</Text>
            <RewardChips rewardText={formatAdventureReward(choice.reward)} />
          </Pressable>
        ))}
      </LinearGradient>
    </ImageBackground>
  );
}

function RouteTracker({ currentStep, maxSteps, clearedSteps }: { currentStep: number; maxSteps: number; clearedSteps: number }) {
  return (
    <View style={styles.routeTracker}>
      {Array.from({ length: maxSteps }).map((_, index) => {
        const step = index + 1;
        const cleared = step <= clearedSteps;
        const current = step === currentStep;
        const boss = step === maxSteps;
        return (
          <View key={step} style={styles.routeStepWrap}>
            <View style={[styles.routeStep, cleared && styles.routeStepCleared, current && styles.routeStepCurrent, boss && styles.routeStepBoss]}>
              <Text style={styles.routeStepText}>{boss ? "B" : step}</Text>
            </View>
            {step < maxSteps ? <View style={[styles.routeLine, cleared && styles.routeLineCleared]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

function ConciseAdventureStatusLine({ progressLabel, message, progress }: { progressLabel: string; message: string; progress: number }) {
  return (
    <View style={styles.conciseAdventureStatusLine}>
      <Text style={styles.conciseAdventureStatusTitle} numberOfLines={1}>{progressLabel}</Text>
      <Text style={styles.conciseAdventureStatusText} numberOfLines={1}>{message}</Text>
      <Text style={styles.conciseAdventureStatusPercent}>{Math.round(progress * 100)}%</Text>
    </View>
  );
}

function V02UpdateObjectivePanel({ compact = false }: { compact?: boolean }) {
  const objectives = Array.isArray(v02UpdateObjectives) ? v02UpdateObjectives : [];
  const completeCount = objectives.filter((objective) => objective.status === "implemented").length;
  const progress = completeCount / Math.max(1, objectives.length);

  return (
    <View style={[styles.v02DashboardPanel, compact && styles.v02DashboardPanelCompact]}>
      <View style={styles.v02DashboardHeader}>
        <View>
          <Text style={styles.v02DashboardKicker}>Version objectives</Text>
          <Text style={styles.v02DashboardTitle}>Isekai Dragons v0.2 — Adventure Path Update</Text>
        </View>
        <View style={styles.v02DashboardBadge}>
          <Text style={styles.v02DashboardBadgeText}>{completeCount}/{objectives.length}</Text>
        </View>
      </View>
      <Text style={styles.v02DashboardSummary}>Visual dashboard: adventure path, flashy combat, meaningful stats, Fire starter identity, skills, rewards, art direction, evolution preview, and automation.</Text>
      <View style={styles.v02DashboardTrack}>
        <View style={[styles.v02DashboardFill, { width: `${Math.round(progress * 100)}%` as any }]} />
      </View>
      <View style={styles.v02ObjectiveGrid}>
        {objectives.map((objective) => (
          <View key={objective.id} style={styles.v02ObjectiveCard}>
            <View style={styles.v02ObjectiveTopRow}>
              <Text style={styles.v02ObjectiveStatus}>✓</Text>
              <Text style={styles.v02ObjectiveTitle}>{objective.title}</Text>
            </View>
            {!compact ? <Text style={styles.v02ObjectiveProof}>{objective.playerProof}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function AdventureCombatLoopStrip({ activeStep, compact = false }: { activeStep: "route" | "fight" | "result"; compact?: boolean }) {
  const steps: Array<{ key: "route" | "fight" | "result"; label: string; detail: string; icon: string }> = [
    { key: "route", icon: "🗺️", label: "Adventure Route", detail: "Travel to the next stop" },
    { key: "fight", icon: "⚔️", label: "Combat Stop", detail: "Enemy blocks the path" },
    { key: "result", icon: "🎁", label: "Return Chest", detail: "Claim loot and grow" }
  ];

  if (compact) {
    const active = steps.find((step) => step.key === activeStep) ?? steps[0];
    return (
      <View style={[styles.adventureCombatLoopStrip, styles.adventureCombatLoopStripCompact]}>
        <Text style={styles.adventureCombatLoopKicker}>Loop: Route → Fight → Chest</Text>
        <View style={styles.adventureCombatLoopCompactActive}>
          <Text style={styles.adventureCombatLoopIcon}>{active.icon}</Text>
          <Text style={styles.adventureCombatLoopLabelActive}>{active.label}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.adventureCombatLoopStrip, compact && styles.adventureCombatLoopStripCompact]}>
      <Text style={styles.adventureCombatLoopKicker}>Dragon Expedition Loop</Text>
      <View style={styles.adventureCombatLoopSteps}>
        {steps.map((step) => {
          const active = step.key === activeStep;
          return (
            <View key={step.key} style={[styles.adventureCombatLoopStep, active && styles.adventureCombatLoopStepActive]}>
              <Text style={styles.adventureCombatLoopIcon}>{step.icon}</Text>
              <View style={styles.adventureCombatLoopCopy}>
                <Text style={[styles.adventureCombatLoopLabel, active && styles.adventureCombatLoopLabelActive]}>{step.label}</Text>
                <Text style={styles.adventureCombatLoopDetail}>{step.detail}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function AdventureRewardRecap({ state, focused = false, onReturnToDen }: { state: GameState; focused?: boolean; onReturnToDen?: () => void }) {
  const reward = state.lastAdventureRewards;
  if (!reward) {
    return null;
  }

  const run = state.adventureRun;
  const equipment = reward.equipmentDrop;
  const treasureName = reward.treasureDrop ? treasureDefinitions[reward.treasureDrop].name : null;
  const hoardCount = treasureOrder.reduce((total, treasureId) => total + (state.treasures[treasureId] ?? 0), 0);
  const evolutionChapterTarget = getEvolutionChapterRequirement(state.dragon.stage);
  const completedRuns = state.completedAdventureRuns ?? 0;
  const evolutionLine = evolutionChapterTarget
    ? `${reward.evolutionProgress} • Ch ${completedRuns}/${evolutionChapterTarget} to evolve`
    : reward.evolutionProgress;
  const chapterMatch = run?.title.match(/Chapter (\d+)/);
  const chapterNumber = chapterMatch ? chapterMatch[1] : "1";
  const chapterResult = run?.status === "failed" ? "Retreat logged" : "Chapter cleared";
  const stopsCleared = run ? Math.min(run.step, run.maxSteps) : 0;
  const hpLine = run ? `${Math.max(0, run.currentHp)}/${run.maxHp} HP held` : "Ready for the next road";
  const summaryStats = [
    { label: "Road", value: run ? `${stopsCleared}/${run.maxSteps} stops` : "Route sealed" },
    { label: "Vitality", value: hpLine },
    { label: "Hoard", value: `${hoardCount} relics` }
  ];

  if (focused) {
    return (
      <View style={[styles.adventureRewardRecapCard, styles.adventureRewardRecapCardFocused]}>
        <View style={styles.adventureRewardHeaderRow}>
          <Text style={styles.adventureRewardIcon}>🎁</Text>
          <View style={styles.adventureRewardTitleBlock}>
            <Text style={[styles.capybaraEventKicker, styles.capybaraEventKickerFocused]}>Chapter {chapterNumber} Summary</Text>
            <Text style={styles.adventureRewardTitle} numberOfLines={1}>{reward.lootGained.join(" • ")}</Text>
          </View>
          <Text style={styles.adventureRewardHoardCount}>Hoard {hoardCount}</Text>
        </View>
        <Text style={styles.adventureRewardCompactLine} numberOfLines={1}>{chapterResult} • {reward.statsImproved.join(" • ")} • {evolutionLine}</Text>
        {onReturnToDen ? (
          <Pressable onPress={onReturnToDen} style={styles.capybaraFocusedReturnPill}>
            <Text style={styles.capybaraFocusedReturnText}>Back to Den</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.adventureRewardRecapCard}>
      <View style={styles.adventureRewardHeaderRow}>
        <Text style={styles.adventureRewardIcon}>{run?.status === "failed" ? "🛡️" : "🏆"}</Text>
        <View style={styles.adventureRewardTitleBlock}>
          <Text style={styles.capybaraEventKicker}>Chapter {chapterNumber} Summary</Text>
          <Text style={styles.adventureRewardTitle}>{chapterResult}</Text>
        </View>
        <Text style={styles.adventureRewardHoardCount}>Hoard {hoardCount}</Text>
      </View>
      <Text style={styles.adventureRewardHeroLine}>Return chest opened: {reward.lootGained.join(" • ")}</Text>
      <View style={styles.adventureSummaryStatRow}>
        {summaryStats.map((item) => (
          <View key={item.label} style={styles.adventureSummaryStatPill}>
            <Text style={styles.adventureSummaryStatLabel}>{item.label}</Text>
            <Text style={styles.adventureSummaryStatValue}>{item.value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.adventureRewardGrid}>
        <AdventureRewardLine label="Stats improved" value={reward.statsImproved.join(" • ")} />
        <AdventureRewardLine label="Hoard progress" value={treasureName ? `${reward.hoardProgress} — ${treasureName}` : reward.hoardProgress} />
        <AdventureRewardLine label="Evolution progress" value={evolutionLine} />
        {equipment ? <AdventureRewardLine label="Gear drop" value={`${equipmentRarityDefinitions[equipment.rarity].label} ${equipment.name}: +${equipment.bonusPercent}% ${equipmentBonusLabels[equipment.bonusType]}`} /> : null}
        <AdventureRewardLine label="Next road" value={reward.nextRecommendedAdventure} />
      </View>
      {onReturnToDen ? (
        <Pressable onPress={onReturnToDen} style={styles.adventureRewardDenButton}>
          <Text style={styles.adventureRewardDenButtonText}>Back to Den</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function CapybaraAdventureBoard({
  state,
  dispatch,
  onReturnToDen,
  compact = false,
  focused = false
}: {
  state: GameState;
  dispatch?: (action: GameAction) => void;
  onReturnToDen?: () => void;
  compact?: boolean;
  focused?: boolean;
}) {
  const run = state.adventureRun;
  const element = state.dragon.element ?? "fire";
  const theme = elementTheme[element];
  const pendingNode = run?.pendingNodeId ? getAdventureNodeById(run.pendingNodeId) : null;
  const activeNode = pendingNode ?? run?.nodes.find((node) => node.step === run.step) ?? run?.nodes[0] ?? adventureNodes[0];
  const heroScene = activeNode?.scene ?? (run?.status === "complete" ? "boss" : "forest");
  const power = getDragonPower(state);
  const totalTreasures = treasureOrder.reduce((total, treasureId) => total + (state.treasures[treasureId] ?? 0), 0);
  const chapterMatch = run?.title.match(/Chapter (\d+)/);
  const chapterLabel = chapterMatch ? `Chapter ${chapterMatch[1]}` : "Chapter 1";
  const displayMaxSteps = run && chapterLabel === "Chapter 1" ? Math.max(run.maxSteps, 60) : run?.maxSteps;
  const progressLabel = run ? `${chapterLabel} • Stop ${run.step}/${displayMaxSteps}` : "Chapter 1 ready";
  const progress = run ? Math.min(1, Math.max(0, (run.step - 1) / (displayMaxSteps ?? run.maxSteps))) : 0;
  const boostedStats = getRunCardBoostedStats(state);
  const chapterHpCurrent = run?.currentHp ?? state.dragon.stats.health;
  const chapterHpMax = run?.maxHp ?? state.dragon.stats.health;
  const chapterHpLabel = `Chapter HP ${chapterHpCurrent}/${chapterHpMax}`;
  const persistentChapterStats = [
    { label: "Health", value: `${chapterHpCurrent}/${chapterHpMax}` },
    { label: "Attack", value: `${boostedStats.attack}` },
    { label: "Defense", value: `${boostedStats.defense}` }
  ];
  const message = run?.message ?? "The Ember Gate opens. Choose a route stop and keep the hatchling moving.";
  const hasPendingSkillDraft = Boolean(state.lastSkillDraftOffer && !state.lastSkillDraftOffer.chosenSkillId && run?.status === "active");
  const isFightNode = activeNode.kind === "battle" || activeNode.kind === "elite" || activeNode.kind === "boss";
  const nextDifficultyId: AdventureDifficultyId = run?.status === "complete" ? getNextAdventureDifficultyId(run.difficultyId) : "hatchlingTrail";
  const nextChapterNumber = nextDifficultyId === "drakeExpedition" ? 2 : nextDifficultyId === "shadowVale" ? 3 : nextDifficultyId === "ancientRift" ? 10 : 1;
  const ctaLabel = !dispatch
    ? "Return to Den"
    : !run || run.status === "failed" || run.status === "complete"
      ? run?.status === "complete" ? `Start Chapter ${nextChapterNumber}` : "Begin Chapter 1"
      : pendingNode
        ? isFightNode
          ? "Fight enemy"
          : pendingNode.choices?.length ? "Choose" : pendingNode.kind === "shrine" ? "Pray" : pendingNode.kind === "camp" ? "Rest" : "Claim"
        : isFightNode
          ? "Fight"
          : "Enter Event";
  const ctaAction = () => {
    if (!dispatch) {
      onReturnToDen?.();
      return;
    }
    if (!run || run.status === "failed" || run.status === "complete") {
      dispatch({ type: "startAdventureRun", difficultyId: nextDifficultyId });
      return;
    }
    if (activeNode) {
      dispatch({ type: "selectAdventureNode", nodeId: activeNode.id });
    }
  };

  return (
    <View style={[styles.capybaraAdventureShell, compact && styles.capybaraAdventureShellCompact, focused && styles.capybaraAdventureShellFocused]}>
      <View style={[styles.capybaraTopHud, focused && styles.capybaraTopHudFocused]}>
        {!focused ? (
          <>
            <View style={styles.capybaraHudCapsule}>
              <Text style={styles.capybaraHudIcon}>⚡</Text>
              <View>
                <Text style={styles.capybaraHudLabel}>Power</Text>
                <Text style={styles.capybaraHudValue}>{formatGameNumber(power, state.settings.numberFormat)}</Text>
              </View>
            </View>
            <View style={[styles.capybaraHudCapsule, { borderColor: theme.primary }]}>
              <Text style={styles.capybaraHudIcon}>💎</Text>
              <View>
                <Text style={styles.capybaraHudLabel}>Loot</Text>
                <Text style={styles.capybaraHudValue}>{totalTreasures}</Text>
              </View>
            </View>
            <View style={[styles.capybaraHudCapsule, styles.capybaraHudCapsuleHp]}>
              <Text style={styles.capybaraHudIcon}>❤️</Text>
              <View>
                <Text style={styles.capybaraHudLabel}>Chapter HP</Text>
                <Text style={styles.capybaraHudValue}>{chapterHpCurrent}/{chapterHpMax}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.capybaraFocusedMiniHud}>
            <Text style={styles.capybaraFocusedMiniHudText}>{progressLabel}</Text>
            <Text style={[styles.capybaraFocusedMiniHudText, { color: theme.primary }]}>{theme.label} • {chapterHpLabel}</Text>
          </View>
        )}
        {dispatch ? (
          <Pressable onPress={() => dispatch({ type: "setScreen", screen: "den" })} style={styles.capybaraFocusedReturnPill}>
            <Text style={styles.capybaraFocusedReturnText}>Back to Den</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={[styles.persistentChapterStatsRow, focused && styles.persistentChapterStatsRowFocused]}>
        {persistentChapterStats.map((stat) => (
          <View key={stat.label} style={[styles.persistentChapterStatPill, stat.label === "Health" && styles.persistentChapterStatPillHealth]}>
            <Text style={styles.persistentChapterStatLabel}>{stat.label}</Text>
            <Text style={styles.persistentChapterStatValue}>{stat.value}</Text>
          </View>
        ))}
      </View>
      {run?.status === "active" ? (
        <View style={styles.runXpBarRow}>
          <Text style={styles.runXpLevelLabel}>Lv {state.runLevel?.level ?? 0}</Text>
          <View style={styles.runXpTrack}>
            <View style={[styles.runXpFill, { width: `${Math.min(100, ((state.runLevel?.xp ?? 0) / 100) * 100)}%` as any }]} />
          </View>
          <Text style={styles.runXpValueLabel}>{state.runLevel?.xp ?? 0}/100</Text>
        </View>
      ) : null}

      <ImageBackground source={sceneImages[heroScene]} style={[styles.capybaraSceneFrame, focused && styles.capybaraSceneFrameFocused]} imageStyle={styles.capybaraSceneImage}>
        <LinearGradient colors={["rgba(255,248,226,0.12)", "rgba(13,29,58,0.38)", "rgba(8,6,17,0.84)"]} style={styles.capybaraSceneScrim}>
          {!focused ? (
            <View style={styles.capybaraChapterRow}>
              <View style={styles.capybaraChapterBadge}>
                <Text style={styles.capybaraChapterText}>{progressLabel}</Text>
              </View>
              <View style={[styles.capybaraElementBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.elementChipText}>{theme.label}</Text>
              </View>
            </View>
          ) : null}
          <AdventureJourneyScene state={state} focused={focused} onReturnToDen={onReturnToDen ?? (() => dispatch?.({ type: "setScreen", screen: "den" }))} />
        </LinearGradient>
      </ImageBackground>

      {!focused ? <AdventureCombatLoopStrip activeStep={pendingNode && isFightNode ? "fight" : "route"} compact={focused} /> : null}
      {!focused ? <FocusedFireRouteBriefPanel /> : null}
      {!focused ? <WaterMoonwellRouteBriefPanel /> : null}
      {!focused ? <EarthCrystalCragRouteBriefPanel /> : null}
      {!focused ? <LightSunbeamSpiresRouteBriefPanel /> : null}
      {!focused ? <ProductiveWorkNowPanel /> : null}
      {!focused ? <V02UpdateObjectivePanel compact={focused} /> : null}

      {!focused ? (
        <View style={styles.capybaraProgressCard}>
          <View style={styles.capybaraProgressHeader}>
            <Text style={styles.capybaraBoardTitle}>{run?.status === "complete" ? "Rift Cleared" : run?.status === "failed" ? "Run Failed" : "Adventure Board"}</Text>
            <Text style={styles.capybaraBoardMeta}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.capybaraProgressTrack}>
            <View style={[styles.capybaraProgressFill, { backgroundColor: theme.primary, width: `${Math.max(8, progress * 100)}%` as any }]} />
          </View>
          <Text numberOfLines={2} style={styles.capybaraMessage}>{message}</Text>
          <AdventureNodeStrip nodes={run?.nodes ?? adventureNodes.slice(0, 8)} currentNode={activeNode} clearedNodeIds={run?.visitedNodeIds ?? []} />
        </View>
      ) : null}

      {hasPendingSkillDraft ? <AdventureSkillDraftCard state={state} dispatch={dispatch} focused={focused} /> : null}
      {!hasPendingSkillDraft ? <CurrentAdventureEventCard focused={focused} node={activeNode} runStatus={run?.status ?? "idle"} isPending={Boolean(pendingNode)} dispatch={dispatch} primaryLabel={ctaLabel} onPrimaryPress={ctaAction} /> : null}
      {(run?.status === "complete" || run?.status === "failed") && state.lastAdventureRewards ? <AdventureRewardRecap state={state} focused={focused} onReturnToDen={() => dispatch?.({ type: "setScreen", screen: "den" })} /> : null}
    </View>
  );
}

export { AdventureJourneyScene, CapybaraAdventureBoard };

export default function AdventureScreen({ state, dispatch }: { state: GameState; dispatch: (action: GameAction) => void }) {
  return <CapybaraAdventureBoard state={state} dispatch={dispatch} focused />;
}

const styles = StyleSheet.create({
  elementChipText: {
    color: "#160c2f",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1
  },
  sectionCard: {
    backgroundColor: uiTheme.colors.panelRaised,
    borderColor: uiTheme.colors.border,
    borderRadius: uiTheme.radius.lg,
    borderWidth: 1,
    padding: 15,
    ...uiTheme.shadow
  },
  sectionCardTitle: {
    color: uiTheme.colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  sectionCardSubtitle: {
    color: uiTheme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4
  },
  sectionCardBody: {
    marginTop: 12
  },
  panelMutedText: {
    color: uiTheme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18
  },
  rewardRowCompact: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.075)",
    borderRadius: uiTheme.radius.md,
    flexDirection: "row",
    gap: 10,
    marginBottom: 9,
    padding: 12
  },
  adventureQuestPanel: {
    backgroundColor: "rgba(10,7,21,0.82)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 24,
    borderWidth: 1,
    bottom: 238,
    left: 14,
    padding: 12,
    position: "absolute",
    right: 14,
    zIndex: 11
  },
  adventureJourneyStage: {
    backgroundColor: "rgba(10,7,21,0.82)",
    borderColor: "rgba(248,217,135,0)",
    borderRadius: 0,
    borderWidth: 0,
    flex: 1,
    overflow: "hidden",
    position: "relative"
  },
  adventureJourneyStageFocused: {
    minHeight: 0
  },
  adventureJourneyBackdrop: {
    height: "100%",
    left: 0,
    opacity: 0.78,
    position: "absolute",
    top: 0,
    width: "100%"
  },
  adventureJourneyMovingBackdrop: {
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: "125%"
  },
  adventureJourneyScrim: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  adventureRouteLine: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 999,
    flexDirection: "row",
    height: 8,
    justifyContent: "space-between",
    left: 24,
    paddingHorizontal: 2,
    position: "absolute",
    right: 24,
    top: 44,
    zIndex: 7
  },
  adventureRouteNode: {
    backgroundColor: "rgba(255,255,255,0.42)",
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    borderWidth: 1,
    height: 16,
    width: 16
  },
  adventureRouteNodeActive: {
    backgroundColor: uiTheme.colors.gold,
    borderColor: "rgba(255,255,255,0.86)"
  },
  adventureRouteNodeDen: {
    backgroundColor: "#7fffc1",
    borderColor: "rgba(255,255,255,0.86)"
  },
  adventureDragonWalker: {
    alignItems: "center",
    left: 8,
    position: "absolute",
    top: "27%",
    width: 198,
    zIndex: 4
  },
  adventureDragonSprite: {
    height: 180,
    width: 198
  },
  adventureDragonSpriteFacingRight: {
    transform: [{ scaleX: -1 }]
  },
  adventureEnemyEncounter: {
    alignItems: "center",
    position: "absolute",
    right: 6,
    top: "25%",
    width: 176,
    zIndex: 3
  },
  adventureClashBurst: {
    backgroundColor: "rgba(255,214,94,0.42)",
    borderColor: "rgba(255,255,255,0.72)",
    borderRadius: 999,
    borderWidth: 2,
    height: 118,
    position: "absolute",
    top: 14,
    width: 118
  },
  adventureEnemySprite: {
    height: 162,
    width: 176
  },
  adventureEnemyName: {
    color: uiTheme.colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginTop: -4,
    textAlign: "center"
  },
  adventureEnemyHpTrack: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    height: 8,
    marginTop: 5,
    overflow: "hidden",
    width: 112
  },
  adventureEnemyHpFill: {
    backgroundColor: "#ff784f",
    borderRadius: 999,
    height: "100%"
  },
  adventureDenReturn: {
    alignItems: "center",
    backgroundColor: "rgba(10,7,21,0.75)",
    borderColor: "rgba(127,255,193,0.34)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
    position: "absolute",
    right: 12,
    top: 8,
    zIndex: 9
  },
  adventureDenIcon: {
    fontSize: 13
  },
  adventureDenText: {
    color: uiTheme.colors.muted,
    fontSize: 8,
    fontWeight: "800",
    marginTop: 0
  },
  adventureDenButton: {
    backgroundColor: "rgba(127,255,193,0.2)",
    borderColor: "rgba(127,255,193,0.44)",
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 0,
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  adventureDenButtonText: {
    color: "#b8ffd9",
    fontSize: 8,
    fontWeight: "900"
  },
  traitTitle: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900"
  },
  traitText: {
    color: "#b9aee3",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4
  },
  progressRewardCopy: {
    flex: 1
  },
  rewardSummaryText: {
    color: "#f8d987",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 6
  },
  adventurePanelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  adventureAreaName: {
    color: "#fff8ef",
    fontSize: 18,
    fontWeight: "900"
  },
  adventureTimerText: {
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900"
  },
  questRows: {
    gap: 7
  },
  questRow: {
    gap: 4
  },
  questRowTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  questTitle: {
    color: "#e9ddff",
    fontSize: 12,
    fontWeight: "800"
  },
  questCount: {
    color: "#b9aee3",
    fontSize: 11,
    fontWeight: "900"
  },
  questTrack: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    height: 7,
    overflow: "hidden"
  },
  questFill: {
    backgroundColor: "#8fffd2",
    borderRadius: 999,
    height: "100%"
  },
  treasureInventory: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10
  },
  treasureChip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: 13,
    minWidth: "31%",
    padding: 7
  },
  treasureName: {
    color: "#fff8ef",
    fontSize: 10,
    fontWeight: "900"
  },
  treasureBonus: {
    color: "#b9aee3",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2
  },
  scrollContent: {
    paddingBottom: 30
  },
  sectionTitle: {
    color: "#fff8ef",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8
  },
  bodyText: {
    color: "#d8cfef",
    fontSize: 14,
    lineHeight: 21
  },
  panel: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 12,
    padding: 16
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
  capybaraAdventureShell: {
    backgroundColor: "#fff1cf",
    borderColor: "#f8d987",
    borderRadius: 28,
    borderWidth: 2,
    gap: 8,
    marginTop: 4,
    overflow: "hidden",
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  },
  capybaraAdventureShellCompact: {
    marginBottom: 12
  },
  capybaraAdventureShellFocused: {
    backgroundColor: "rgba(7,10,24,0.92)",
    borderColor: "rgba(248,217,135,0.24)",
    borderWidth: 1,
    gap: 5,
    padding: 7,
    shadowColor: "#050816",
    shadowOpacity: 0.32
  },
  capybaraTopHud: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "space-between"
  },
  capybaraTopHudFocused: {
    alignItems: "center",
    flexWrap: "nowrap"
  },
  capybaraFocusedMiniHud: {
    alignItems: "center",
    backgroundColor: "rgba(248,217,135,0.1)",
    borderColor: "rgba(248,217,135,0.26)",
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  capybaraFocusedMiniHudText: {
    color: "#f8d987",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  fireStarterFocusPillRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5
  },
  fireStarterFocusLead: {
    color: "#f8d987",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  fireStarterFocusPill: {
    backgroundColor: "rgba(248,217,135,0.14)",
    borderColor: "rgba(248,217,135,0.32)",
    borderRadius: 999,
    borderWidth: 1,
    color: "#fff8ef",
    fontSize: 10,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 4,
    textTransform: "uppercase"
  },
  focusedFireBriefPanel: {
    backgroundColor: "rgba(69,21,31,0.72)",
    borderColor: "rgba(255,120,79,0.36)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 10
  },
  focusedFireBriefHeader: {
    gap: 2
  },
  focusedFireBriefKicker: {
    color: "#ffb347",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  focusedFireBriefTitle: {
    color: "#fff8ef",
    fontSize: 14,
    fontWeight: "900"
  },
  focusedFireBriefSummary: {
    color: "#ffd9bf",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 15
  },
  focusedFireStopGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  focusedFireStopChip: {
    backgroundColor: "rgba(255,248,239,0.08)",
    borderColor: "rgba(255,179,71,0.24)",
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: "31%",
    flexGrow: 1,
    minWidth: 92,
    paddingHorizontal: 8,
    paddingVertical: 7
  },
  focusedFireStopStep: {
    color: "#ffb347",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  focusedFireStopLabel: {
    color: "#fff8ef",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 1
  },
  focusedFireStopDetail: {
    color: "#d8cfef",
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 12,
    marginTop: 2
  },
  capybaraHudCapsule: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "rgba(93,57,28,0.2)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    flexGrow: 1,
    gap: 7,
    minWidth: 0,
    paddingHorizontal: 9,
    paddingVertical: 5,
    shadowColor: "#6f431f",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  capybaraHudCapsuleHp: {
    borderColor: "rgba(255,95,122,0.42)"
  },
  persistentChapterStatsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 7
  },
  runXpBarRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 6
  },
  runXpLevelLabel: {
    color: "#a89cff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
    minWidth: 28
  },
  runXpTrack: {
    backgroundColor: "rgba(8,6,17,0.76)",
    borderColor: "rgba(124,106,247,0.34)",
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    height: 7,
    overflow: "hidden"
  },
  runXpFill: {
    backgroundColor: "#7c6af7",
    borderRadius: 999,
    height: "100%"
  },
  runXpValueLabel: {
    color: "#7c7490",
    fontSize: 9,
    fontWeight: "700",
    minWidth: 30,
    textAlign: "right"
  },
  persistentChapterStatsRowFocused: {
    marginTop: 5
  },
  persistentChapterStatPill: {
    alignItems: "center",
    backgroundColor: "rgba(8,6,17,0.76)",
    borderColor: "rgba(248,217,135,0.34)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  persistentChapterStatPillHealth: {
    borderColor: "rgba(255,95,122,0.52)"
  },
  persistentChapterStatLabel: {
    color: "#f8d987",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  persistentChapterStatValue: {
    color: "#fff8ef",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 1
  },
  capybaraFocusedReturnPill: {
    alignItems: "center",
    backgroundColor: "#160c2f",
    borderColor: "rgba(248,217,135,0.72)",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  capybaraFocusedReturnText: {
    color: "#f8d987",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  capybaraHudIcon: {
    fontSize: 18
  },
  capybaraHudLabel: {
    color: "#7a542e",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  capybaraHudValue: {
    color: "#302018",
    fontSize: 13,
    fontWeight: "900"
  },
  capybaraSceneFrame: {
    borderRadius: 28,
    minHeight: 378,
    overflow: "hidden"
  },
  capybaraSceneFrameFocused: {
    height: 250,
    minHeight: 230
  },
  capybaraSceneImage: {
    borderRadius: 28
  },
  capybaraSceneScrim: {
    flex: 1,
    padding: 10
  },
  capybaraChapterRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    zIndex: 2
  },
  capybaraChapterBadge: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderColor: "#f8d987",
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 13,
    paddingVertical: 7
  },
  capybaraChapterText: {
    color: "#3a2618",
    fontSize: 12,
    fontWeight: "900"
  },
  capybaraElementBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  capybaraProgressCard: {
    backgroundColor: "#ffffff",
    borderColor: "rgba(93,57,28,0.14)",
    borderRadius: 18,
    borderWidth: 1,
    padding: 9
  },
  capybaraProgressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  capybaraBoardTitle: {
    color: "#302018",
    fontSize: 15,
    fontWeight: "900"
  },
  capybaraBoardMeta: {
    color: "#7a542e",
    fontSize: 12,
    fontWeight: "900"
  },
  capybaraProgressTrack: {
    backgroundColor: "#ead8bc",
    borderRadius: 999,
    height: 8,
    marginTop: 6,
    overflow: "hidden"
  },
  capybaraProgressFill: {
    borderRadius: 999,
    height: "100%"
  },
  capybaraMessage: {
    color: "#6b5239",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
    marginTop: 6
  },
  capybaraRouteScroll: {
    marginTop: 8
  },
  capybaraRouteRail: {
    alignItems: "center",
    paddingRight: 12
  },
  capybaraRouteNodeWrap: {
    alignItems: "center",
    flexDirection: "row"
  },
  capybaraRouteNode: {
    alignItems: "center",
    backgroundColor: "#f3e2c3",
    borderRadius: 999,
    borderWidth: 2,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  capybaraRouteNodeCurrent: {
    backgroundColor: "#ffffff",
    shadowColor: "#f8d987",
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    transform: [{ scale: 1.08 }]
  },
  capybaraRouteNodeCleared: {
    backgroundColor: "#e9ffd8"
  },
  capybaraRouteNodeIcon: {
    fontSize: 16
  },
  capybaraRouteStep: {
    bottom: -17,
    color: "#8b6a45",
    fontSize: 10,
    fontWeight: "900",
    left: -33,
    position: "absolute"
  },
  capybaraRouteConnector: {
    backgroundColor: "#d8bea0",
    borderRadius: 999,
    height: 5,
    marginHorizontal: 4,
    width: 18
  },
  conciseAdventureStatusLine: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(248,217,135,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  conciseAdventureStatusTitle: {
    color: "#f8d987",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  conciseAdventureStatusText: {
    color: "#fff8ef",
    flex: 1,
    fontSize: 10,
    fontWeight: "800"
  },
  conciseAdventureStatusPercent: {
    color: "#8fffd2",
    fontSize: 11,
    fontWeight: "900"
  },
  v02DashboardPanel: {
    backgroundColor: "rgba(15,23,42,0.92)",
    borderColor: "rgba(143,247,255,0.36)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    marginTop: 10,
    padding: 12
  },
  v02DashboardPanelCompact: {
    gap: 6,
    marginTop: 6,
    padding: 9
  },
  v02DashboardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between"
  },
  v02DashboardKicker: {
    color: "#8ff7ff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  v02DashboardTitle: {
    color: "#fff8ef",
    fontSize: 15,
    fontWeight: "900"
  },
  v02DashboardBadge: {
    backgroundColor: "#8fffd2",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  v02DashboardBadgeText: {
    color: "#071018",
    fontSize: 12,
    fontWeight: "900"
  },
  v02DashboardSummary: {
    color: "rgba(255,248,239,0.76)",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16
  },
  v02DashboardTrack: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    height: 8,
    overflow: "hidden"
  },
  v02DashboardFill: {
    backgroundColor: "#8fffd2",
    borderRadius: 999,
    height: "100%"
  },
  v02ObjectiveGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7
  },
  v02ObjectiveCard: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 15,
    borderWidth: 1,
    flexBasis: "48%",
    flexGrow: 1,
    gap: 4,
    padding: 8
  },
  v02ObjectiveTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  v02ObjectiveStatus: {
    color: "#8fffd2",
    fontSize: 12,
    fontWeight: "900"
  },
  v02ObjectiveTitle: {
    color: "#fff8ef",
    flex: 1,
    fontSize: 11,
    fontWeight: "900"
  },
  v02ObjectiveProof: {
    color: "rgba(255,248,239,0.68)",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 14
  },
  adventureCombatLoopStrip: {
    backgroundColor: "rgba(8,6,17,0.84)",
    borderColor: "rgba(248,217,135,0.32)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    marginTop: 10,
    padding: 11
  },
  adventureCombatLoopStripCompact: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  adventureCombatLoopCompactActive: {
    alignItems: "center",
    backgroundColor: "rgba(248,217,135,0.16)",
    borderColor: "rgba(248,217,135,0.42)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  adventureCombatLoopKicker: {
    color: "#f8d987",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  adventureCombatLoopSteps: {
    flexDirection: "row",
    gap: 7
  },
  adventureCombatLoopStep: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 50,
    paddingHorizontal: 8,
    paddingVertical: 7
  },
  adventureCombatLoopStepActive: {
    backgroundColor: "rgba(248,217,135,0.18)",
    borderColor: "rgba(248,217,135,0.62)"
  },
  adventureCombatLoopIcon: {
    fontSize: 16
  },
  adventureCombatLoopCopy: {
    flex: 1
  },
  adventureCombatLoopLabel: {
    color: "#fff8ef",
    fontSize: 10,
    fontWeight: "900"
  },
  adventureCombatLoopLabelActive: {
    color: "#f8d987"
  },
  adventureCombatLoopDetail: {
    color: "rgba(255,248,239,0.72)",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 2
  },
  adventureRewardRecapCard: {
    backgroundColor: "#211136",
    borderColor: "rgba(248,217,135,0.45)",
    borderRadius: 26,
    borderWidth: 2,
    gap: 12,
    marginTop: 12,
    padding: 14,
    shadowColor: "#f8d987",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  adventureRewardRecapCardFocused: {
    backgroundColor: "rgba(8,11,26,0.94)",
    borderColor: "rgba(248,217,135,0.26)",
    borderWidth: 1,
    gap: 5,
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: "#050816",
    shadowOpacity: 0.28
  },
  adventureRewardHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  adventureRewardIcon: {
    fontSize: 26
  },
  adventureRewardTitleBlock: {
    flex: 1
  },
  adventureRewardTitle: {
    color: "#fff8ef",
    fontSize: 18,
    fontWeight: "900"
  },
  adventureRewardHoardCount: {
    backgroundColor: "rgba(248,217,135,0.18)",
    borderRadius: 999,
    color: "#f8d987",
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  adventureRewardHeroLine: {
    backgroundColor: "rgba(248,217,135,0.12)",
    borderColor: "rgba(248,217,135,0.24)",
    borderRadius: 18,
    borderWidth: 1,
    color: "#fff8ef",
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 18,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  adventureSummaryStatRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  adventureSummaryStatPill: {
    backgroundColor: "rgba(8,11,26,0.38)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 96,
    paddingHorizontal: 10,
    paddingVertical: 9
  },
  adventureSummaryStatLabel: {
    color: "#f8d987",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  adventureSummaryStatValue: {
    color: "#fff8ef",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 3
  },
  adventureRewardGrid: {
    gap: 8
  },
  adventureRewardLine: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    padding: 10
  },
  adventureRewardLineLabel: {
    color: "#f8d987",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  adventureRewardLineValue: {
    color: "#fff8ef",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 3
  },
  adventureRewardDenButton: {
    alignItems: "center",
    backgroundColor: "#f8d987",
    borderRadius: 18,
    marginTop: 2,
    paddingVertical: 12
  },
  adventureRewardDenButtonText: {
    color: "#2b180d",
    fontSize: 13,
    fontWeight: "900"
  },
  adventureRewardCompactLine: {
    color: "#d8cfef",
    fontSize: 11,
    fontWeight: "800"
  },
  capybaraEventCard: {
    backgroundColor: "#fffaf0",
    borderRadius: 28,
    borderWidth: 2,
    marginBottom: 10,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7
  },
  capybaraEventCardFocused: {
    backgroundColor: "rgba(8,11,26,0.94)",
    borderColor: "rgba(248,217,135,0.26)",
    borderWidth: 1,
    marginBottom: 2,
    padding: 10,
    shadowColor: "#050816",
    shadowOpacity: 0.3
  },
  focusedCombatStopCard: {
    backgroundColor: "rgba(8,11,26,0.96)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    marginBottom: 2,
    padding: 10,
    shadowColor: "#050816",
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 7 }
  },
  focusedCombatStopHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9
  },
  focusedCombatStopIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  focusedCombatStopCopy: {
    flex: 1
  },
  focusedCombatStopKicker: {
    color: "#ff9d7c",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  focusedCombatStopTitle: {
    color: "#fff8ef",
    fontSize: 18,
    fontWeight: "900"
  },
  focusedCombatStopStep: {
    color: "#d8cfef",
    fontSize: 13,
    fontWeight: "900"
  },
  focusedCombatStopText: {
    color: "#d8cfef",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16
  },
  focusedCombatStopCta: {
    alignItems: "center",
    backgroundColor: "#f8d987",
    borderColor: "rgba(255,248,239,0.62)",
    borderRadius: 20,
    borderWidth: 2,
    paddingVertical: 10
  },
  capybaraEventTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  capybaraEventIconBadge: {
    alignItems: "center",
    borderRadius: 18,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  capybaraEventIcon: {
    fontSize: 22
  },
  capybaraEventTitleBlock: {
    flex: 1
  },
  capybaraEventKicker: {
    color: "#9c6a32",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  capybaraEventKickerFocused: {
    color: "#f8d987"
  },
  capybaraEventTitle: {
    color: "#2f1f18",
    fontSize: 20,
    fontWeight: "900"
  },
  capybaraEventTitleFocused: {
    color: "#fff8ef"
  },
  capybaraEventStep: {
    color: "#8b6a45",
    fontSize: 13,
    fontWeight: "900"
  },
  capybaraEventStepFocused: {
    color: "#d8cfef"
  },
  capybaraEventText: {
    color: "#5f4732",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 10
  },
  capybaraEventTextFocused: {
    color: "#d8cfef",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6
  },
  capybaraEnemyHint: {
    color: "#a64040",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8
  },
  capybaraEnemyHintFocused: {
    color: "#ff9d7c",
    fontSize: 11,
    marginTop: 5
  },
  capybaraChoiceGrid: {
    gap: 8,
    marginTop: 10
  },
  capybaraChoiceButton: {
    backgroundColor: "#fff1cf",
    borderColor: "rgba(93,57,28,0.16)",
    borderRadius: 18,
    borderWidth: 1,
    padding: 11
  },
  capybaraChoiceButtonFocused: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(248,217,135,0.18)"
  },
  capybaraChoiceButtonDisabled: {
    opacity: 0.72
  },
  capybaraChoiceTitle: {
    color: "#3a2618",
    fontSize: 14,
    fontWeight: "900"
  },
  capybaraChoiceTitleFocused: {
    color: "#fff8ef"
  },
  capybaraChoiceText: {
    color: "#72583d",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3
  },
  capybaraChoiceTextFocused: {
    color: "#d8cfef"
  },
  fireSkillChoiceRecap: {
    backgroundColor: "rgba(255,120,79,0.12)",
    borderColor: "rgba(255,120,79,0.32)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 7,
    marginTop: 10,
    padding: 10
  },
  shadowPressureReadout: {
    backgroundColor: "rgba(139,92,246,0.14)",
    borderColor: "rgba(217,204,255,0.28)",
    borderRadius: 15,
    borderWidth: 1,
    gap: 3,
    marginTop: 8,
    padding: 8
  },
  shadowPressureReadoutFocused: {
    marginTop: 6,
    paddingVertical: 6
  },
  shadowPressureKicker: {
    color: "#d9ccff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  shadowPressureText: {
    color: "#f3edff",
    fontSize: 11,
    fontWeight: "800"
  },
  fireSkillChoiceRecapFocused: {
    backgroundColor: "rgba(255,120,79,0.1)",
    gap: 5,
    padding: 8
  },
  fireSkillChoiceKicker: {
    color: "#ff784f",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  fireSkillChoiceTitle: {
    color: "#fff8ef",
    fontSize: 12,
    fontWeight: "900"
  },
  fireSkillChoiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  fireSkillChoiceChip: {
    backgroundColor: "rgba(255,248,239,0.08)",
    borderColor: "rgba(255,179,71,0.22)",
    borderRadius: 13,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    paddingHorizontal: 7,
    paddingVertical: 6
  },
  fireSkillChoiceName: {
    color: "#ffb347",
    fontSize: 11,
    fontWeight: "900"
  },
  fireSkillChoiceHook: {
    color: "#fff8ef",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2
  },
  fireSkillChoicePayoff: {
    color: "#d8cfef",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 13,
    marginTop: 2
  },
  capybaraPrimaryCta: {
    alignItems: "center",
    borderColor: "#6d431f",
    borderRadius: 22,
    borderWidth: 2,
    marginTop: 13,
    paddingVertical: 13,
    shadowColor: "#6d431f",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4
  },
  capybaraPrimaryCtaFocused: {
    borderColor: "rgba(255,248,239,0.62)",
    marginTop: 7,
    paddingVertical: 10,
    shadowColor: "#f8d987",
    shadowOpacity: 0.22
  },
  capybaraPrimaryCtaText: {
    color: "#2f1f18",
    fontSize: 16,
    fontWeight: "900"
  },
  nodeCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 12,
    overflow: "hidden"
  },
  nodeImageBackground: {
    minHeight: 190
  },
  nodeImage: {
    borderRadius: 22
  },
  nodeOverlay: {
    justifyContent: "flex-end",
    minHeight: 190,
    padding: 16
  },
  nodeHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  nodeBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  nodeDifficulty: {
    color: "#fff8ef",
    fontSize: 12,
    fontWeight: "900"
  },
  nodeTitle: {
    color: "#fff8ef",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6
  },
  eventChoiceCard: {
    backgroundColor: "rgba(0,0,0,0.18)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 12,
    padding: 13
  },
  eventPanel: {
    borderRadius: 24,
    marginTop: 12,
    minHeight: 300,
    overflow: "hidden"
  },
  eventPanelImage: {
    borderRadius: 24
  },
  eventPanelOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16
  },
  routeTracker: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 14
  },
  routeStepWrap: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1
  },
  routeStep: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  routeStepCleared: {
    backgroundColor: "rgba(248,217,135,0.92)"
  },
  routeStepCurrent: {
    borderColor: "#fff8ef",
    borderWidth: 2
  },
  routeStepBoss: {
    backgroundColor: "rgba(255,120,79,0.92)"
  },
  routeStepText: {
    color: "#160c2f",
    fontSize: 12,
    fontWeight: "900"
  },
  routeLine: {
    backgroundColor: "rgba(255,255,255,0.22)",
    flex: 1,
    height: 3
  },
  routeLineCleared: {
    backgroundColor: "rgba(248,217,135,0.92)"
  },
  rewardChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12
  },
  rewardChip: {
    backgroundColor: "rgba(255,248,239,0.16)",
    borderColor: "rgba(255,248,239,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  rewardChipText: {
    color: "#fff8ef",
    fontSize: 12,
    fontWeight: "800"
  },
  answerTitle: {
    color: "#fff8ef",
    fontSize: 16,
    fontWeight: "900"
  },
  answerDescription: {
    color: "#cfc5ee",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  hintText: {
    color: "#bdb2df",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8
  },
});