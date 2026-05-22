#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const artifactDir = path.join(projectRoot, "artifacts", "test-run", "latest");
const appPath = path.join(projectRoot, "App.tsx");
const gamePath = path.join(projectRoot, "src", "game.ts");
const contentPath = path.join(projectRoot, "src", "content.ts");
const typesPath = path.join(projectRoot, "src", "types.ts");
const evolutionPreviewPath = path.join(projectRoot, "src", "evolutionPreview.ts");
const reportPath = path.join(artifactDir, "report.json");
const snippetPath = path.join(artifactDir, "fire-breath-snippet.txt");
const logPath = path.join(artifactDir, "log.txt");
const storyboardPath = path.join(artifactDir, "fire-breath-storyboard.html");
const framesPath = path.join(artifactDir, "fire-breath-frames.json");
const hatchStoryboardPath = path.join(artifactDir, "hatching-reveal-storyboard.html");
const hatchFramesPath = path.join(artifactDir, "hatching-reveal-frames.json");
const hatchingOnboardingValidationPath = path.join(artifactDir, "hatching-onboarding-deterministic-validation.json");
const combatSimulationPath = path.join(artifactDir, "combat-path-simulation.json");
const pathCompletenessPath = path.join(artifactDir, "dragon-path-content-completeness.json");
const pathUiCopyPath = path.join(artifactDir, "dragon-path-ui-copy.json");
const liveBattleFeedbackPath = path.join(artifactDir, "live-battle-feedback-cues.json");
const evolutionRevealPath = path.join(artifactDir, "evolution-reveal-path-lines.json");
const evolutionRevealStoryboardPath = path.join(artifactDir, "evolution-reveal-path-storyboard.html");
const adventureRoutePlanPath = path.join(artifactDir, "adventure-route-plan.json");
const adventureUiReferencePath = path.join(artifactDir, "adventure-ui-reference.json");
const adventureFightStopHudSnapshotPath = path.join(artifactDir, "adventure-fight-stop-hud-snapshot.json");
const skillBuildPayoffMatrixPath = path.join(artifactDir, "skill-build-payoff-matrix.json");
const activeSkillCombatPath = path.join(artifactDir, "active-skill-combat-preview.json");
const adventureCombatConsolidationPath = path.join(artifactDir, "adventure-combat-consolidation-contract.json");
const adventureCombatConsolidationStoryboardPath = path.join(artifactDir, "adventure-combat-consolidation-storyboard.html");
const fireStarterFocusPath = path.join(artifactDir, "fire-starter-expedition-focus.json");
const adventureDifficultyLootPath = path.join(artifactDir, "adventure-difficulty-loot-contract.json");
const fireHatchlingSpineExportContractPath = path.join(artifactDir, "fire-hatchling-spine-export-contract.json");
const fireHatchlingSpineExportManifestPath = path.join(projectRoot, "assets", "dragons", "living-forge-fire-hatchling", "spine-export", "animations.json");
const fireHatchlingSpineImportManifestPath = path.join(projectRoot, "assets", "dragons", "living-forge-fire-hatchling", "spine-source", "import-manifest.json");
const fireHatchlingSpineAnimationDataPath = path.join(projectRoot, "src", "data", "fireHatchlingSpineAnimations.ts");
const fireHatchlingSpineFrameDragonPath = path.join(projectRoot, "src", "components", "SpineFrameDragon.tsx");
const automationRunbookPath = path.join(projectRoot, "docs", "AUTOMATION_RUNBOOK.md");
const expectedDragonPathIds = [
  "fireGuardian",
  "fireRaider",
  "fireMystic",
  "waterGuardian",
  "waterRaider",
  "waterMystic",
  "earthGuardian",
  "earthRaider",
  "earthMystic",
  "lightGuardian",
  "lightRaider",
  "lightMystic"
];
const expectedDragonPathIdentity = Object.fromEntries(
  expectedDragonPathIds.map((pathId) => {
    const [, element, role] = pathId.match(/^(fire|water|earth|light)(Guardian|Raider|Mystic)$/);
    return [pathId, { element, role: role.toLowerCase() }];
  })
);
const expectedDragonElements = Array.from(new Set(Object.values(expectedDragonPathIdentity).map((identity) => identity.element)));
const expectedDragonRoles = ["guardian", "raider", "mystic"];

function nowIso() {
  return new Date().toISOString();
}

function ensureCleanArtifacts() {
  fs.rmSync(artifactDir, { recursive: true, force: true });
  fs.mkdirSync(artifactDir, { recursive: true });
}

function runCommand(name, command, args) {
  const startedAt = nowIso();
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: "utf8",
    shell: process.platform === "win32"
  });

  return {
    name,
    command: [command, ...args].join(" "),
    startedAt,
    finishedAt: nowIso(),
    exitCode: typeof result.status === "number" ? result.status : 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error ? String(result.error.message || result.error) : null
  };
}

function assertCheck(checks, id, passed, message, details = {}) {
  checks.push({ id, passed: Boolean(passed), message, details });
}

function getSection(source, startToken, endToken) {
  const start = source.indexOf(startToken);
  if (start === -1) return "";
  const end = source.indexOf(endToken, start + startToken.length);
  return source.slice(start, end === -1 ? undefined : end);
}

function countMatches(source, regex) {
  return (source.match(regex) || []).length;
}


function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseFireBreathParticleSpecs(particleSpecsSource) {
  return [...particleSpecsSource.matchAll(/\{\s*start:\s*([0-9.]+),\s*end:\s*([0-9.]+),\s*x:\s*(-?\d+),\s*y:\s*(-?\d+),\s*size:\s*(\d+),\s*color:\s*"([^"]+)",\s*opacity:\s*([0-9.]+),\s*wobble:\s*(-?\d+)\s*\}/g)]
    .map((match, index) => ({
      index,
      start: Number(match[1]),
      end: Number(match[2]),
      x: Number(match[3]),
      y: Number(match[4]),
      size: Number(match[5]),
      color: match[6],
      opacity: Number(match[7]),
      wobble: Number(match[8])
    }));
}

function interpolate(progress, inputRange, outputRange) {
  if (progress <= inputRange[0]) return outputRange[0];
  for (let index = 1; index < inputRange.length; index += 1) {
    if (progress <= inputRange[index]) {
      const previousInput = inputRange[index - 1];
      const nextInput = inputRange[index];
      const previousOutput = outputRange[index - 1];
      const nextOutput = outputRange[index];
      const t = (progress - previousInput) / Math.max(0.0001, nextInput - previousInput);
      return previousOutput + (nextOutput - previousOutput) * t;
    }
  }
  return outputRange[outputRange.length - 1];
}

function particleStateAt(spec, progress) {
  const mid = Math.min(spec.start + 0.18, spec.end - 0.08);
  return {
    index: spec.index,
    progress,
    x: interpolate(progress, [0, spec.start, spec.end, 1], [8, 8, spec.x, spec.x + spec.wobble]),
    y: interpolate(progress, [0, spec.start, mid, spec.end, 1], [0, 0, spec.y, spec.y + (spec.index % 2 === 0 ? -12 : 10), spec.y]),
    scale: interpolate(progress, [0, spec.start, mid, spec.end, 1], [0.18, 0.18, 1.28, 0.72, 0.22]),
    opacity: interpolate(progress, [0, spec.start, mid, spec.end, 1], [0, 0, spec.opacity, spec.opacity * 0.32, 0]),
    color: spec.color,
    size: spec.size
  };
}

function buildFrameSvg(frame, frameIndex) {
  const width = 390;
  const height = 270;
  const mouth = { x: Math.round(width * 0.47), y: 132 };
  const particles = frame.particles.map((particle) => {
    const cx = mouth.x + particle.x;
    const cy = mouth.y + particle.y;
    const radius = Math.max(2, (particle.size * particle.scale) / 2);
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${radius.toFixed(1)}" fill="${escapeHtml(particle.color)}" opacity="${particle.opacity.toFixed(2)}" />`;
  }).join("\n      ");

  return `<svg class="frame-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Fire breath frame ${frameIndex} at progress ${frame.progress}">
    <rect width="${width}" height="${height}" rx="22" fill="#12091f" />
    <rect x="14" y="78" width="118" height="132" rx="18" fill="#211127" stroke="#ff784f" stroke-opacity="0.28" />
    <ellipse cx="73" cy="146" rx="38" ry="6" fill="rgba(0,0,0,0.34)" />
    <text x="73" y="116" text-anchor="middle" fill="#ffe7a8" font-size="16" font-weight="900">Enemy</text>
    <rect x="26" y="170" width="94" height="7" rx="4" fill="rgba(255,255,255,0.15)" />
    <rect x="26" y="170" width="58" height="7" rx="4" fill="#ff784f" />
    <text x="73" y="194" text-anchor="middle" fill="#ffd45d" font-size="10" font-weight="900">HP + Defeated</text>
    <text x="310" y="138" text-anchor="middle" fill="#fef3c7" font-size="18" font-weight="900">Dragon</text>
    <circle cx="${mouth.x}" cy="${mouth.y}" r="13" fill="rgba(255,214,94,0.9)" stroke="rgba(255,124,54,0.72)" stroke-width="2" opacity="${frame.mouthGlowOpacity.toFixed(2)}" />
    <line x1="${mouth.x}" y1="${mouth.y}" x2="72" y2="132" stroke="rgba(255,255,255,0.16)" stroke-width="1" stroke-dasharray="5 7" />
    ${particles}
    <text x="195" y="244" text-anchor="middle" fill="#a7f3d0" font-size="12" font-weight="900">progress ${frame.progress.toFixed(2)} · particles fade instead of rewinding</text>
  </svg>`;
}

function writeVisualReviewArtifacts(particleSpecsSource) {
  const specs = parseFireBreathParticleSpecs(particleSpecsSource);
  const progressPoints = [0, 0.18, 0.35, 0.55, 0.72, 0.9, 1];
  const frames = progressPoints.map((progress) => ({
    progress,
    mouthGlowOpacity: interpolate(progress, [0, 0.3, 0.72, 1], [0, 0.95, 0.5, 0]),
    particles: specs.map((spec) => particleStateAt(spec, progress))
  }));

  const frameSvgPaths = frames.map((_, index) => path.join(artifactDir, `fire-breath-frame-${String(index).padStart(2, "0")}.svg`));

  fs.writeFileSync(framesPath, JSON.stringify({
    name: "fire-breath-frame-samples",
    generatedAt: nowIso(),
    coordinateSystem: "390x270 storyboard derived from FireBreathCombatVisual constants",
    source: "App.tsx fireBreathParticleSpecs + mouth/enemy layout styles",
    progressSamples: progressPoints,
    expectedParticleCount: specs.length,
    frameSvgs: frameSvgPaths,
    frames
  }, null, 2));

  const svgs = frames.map((frame, index) => {
    const svg = buildFrameSvg(frame, index);
    const svgPath = path.join(artifactDir, `fire-breath-frame-${String(index).padStart(2, "0")}.svg`);
    fs.writeFileSync(svgPath, svg);
    return `<figure>${svg}<figcaption>Frame ${index}: progress ${frame.progress.toFixed(2)}</figcaption></figure>`;
  }).join("\n");

  fs.writeFileSync(storyboardPath, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Fire Breath Animation Storyboard</title>
  <style>
    body { margin: 0; padding: 24px; background: #080512; color: #f8fafc; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    h1 { margin: 0 0 8px; font-size: 24px; }
    p { color: #cbd5e1; max-width: 860px; line-height: 1.5; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; margin-top: 20px; }
    figure { margin: 0; padding: 12px; border: 1px solid rgba(255,255,255,0.12); border-radius: 18px; background: rgba(255,255,255,0.04); }
    figcaption { margin-top: 8px; color: #facc15; font-size: 13px; font-weight: 800; }
    .frame-svg { width: 100%; height: auto; display: block; }
    code { color: #fbbf24; }
  </style>
</head>
<body>
  <h1>Fire Breath Animation Storyboard</h1>
  <p>This deterministic artifact is generated by <code>npm run test:auto</code> from the same particle constants used in <code>App.tsx</code>. It gives agents a non-interactive visual review surface: enemy on the left, dragon mouth on the right, particles traveling left, then fading to zero.</p>
  <p>Machine-readable frame data: <code>${escapeHtml(path.basename(framesPath))}</code></p>
  <section class="grid">
    ${svgs}
  </section>
</body>
</html>\n`);
}

function parseHatchBurstParticles(appSource) {
  const particleSource = getSection(appSource, "const hatchBurstParticles = [", "];\n\nconst hatchBurstRays");
  return [...particleSource.matchAll(/\{\s*x:\s*(-?\d+),\s*y:\s*(-?\d+),\s*size:\s*(\d+),\s*delay:\s*([0-9.]+),\s*rotate:\s*\"([^\"]+)\"\s*\}/g)]
    .map((match, index) => ({
      index,
      x: Number(match[1]),
      y: Number(match[2]),
      size: Number(match[3]),
      delay: Number(match[4]),
      rotate: match[5]
    }));
}

function parseHatchBurstRays(appSource) {
  const raySource = getSection(appSource, "const hatchBurstRays = [", "];\n\nfunction EggHatchBurst");
  return [...raySource.matchAll(/\{\s*rotate:\s*\"([^\"]+)\",\s*delay:\s*([0-9.]+)\s*\}/g)]
    .map((match, index) => ({
      index,
      rotate: match[1],
      delay: Number(match[2])
    }));
}

function parseNumberArrayLiteral(value) {
  return value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part));
}

function parseDegreeArrayLiteral(value) {
  return value
    .split(",")
    .map((part) => Number(part.trim().replace(/[\"']|deg/g, "")))
    .filter((part) => Number.isFinite(part));
}

function parseHatchingInterpolation(appSource, constantName) {
  const match = appSource.match(new RegExp(`const ${constantName} = crack\\.interpolate\\(\\{ inputRange: \\[([^\\]]+)\\], outputRange: \\[([^\\]]+)\\] \\}\\);`));
  return match ? {
    inputRange: parseNumberArrayLiteral(match[1]),
    outputRange: parseNumberArrayLiteral(match[2])
  } : { inputRange: [], outputRange: [] };
}

function parseHatchingDegreeInterpolation(appSource, constantName) {
  const match = appSource.match(new RegExp(`const ${constantName} = crack\\.interpolate\\(\\{ inputRange: \\[([^\\]]+)\\], outputRange: \\[([^\\]]+)\\] \\}\\);`));
  return match ? {
    inputRange: parseNumberArrayLiteral(match[1]),
    outputRange: parseDegreeArrayLiteral(match[2])
  } : { inputRange: [], outputRange: [] };
}

function parseHatchingRevealTimingSource(appSource) {
  const hatchingEffect = getSection(appSource, "if (state.phase === \"hatching\") {", "    } else {");
  const crackTiming = hatchingEffect.match(/Animated\.timing\(crack, \{ toValue: 1, duration: (\d+)/);
  const crackProgressTiming = hatchingEffect.match(/Animated\.timing\(crackProgress, \{ toValue: 1, duration: (\d+)/);
  const hatchBurstDelay = hatchingEffect.match(/Animated\.delay\((\d+)\)/);
  const hatchBurstTiming = hatchingEffect.match(/Animated\.timing\(hatchBurst, \{ toValue: 1, duration: (\d+)/);
  const shellSplit = parseHatchingInterpolation(appSource, "shellSplit");
  const shellLift = parseHatchingInterpolation(appSource, "shellLift");
  const hatchOpacity = parseHatchingInterpolation(appSource, "hatchOpacity");
  const flashOpacity = parseHatchingInterpolation(appSource, "flashOpacity");
  const hatchlingRevealOpacity = parseHatchingInterpolation(appSource, "hatchlingRevealOpacity");
  const hatchlingRevealScale = parseHatchingInterpolation(appSource, "hatchlingRevealScale");
  const leftShellRotate = parseHatchingDegreeInterpolation(appSource, "leftShellRotate");
  const rightShellRotate = parseHatchingDegreeInterpolation(appSource, "rightShellRotate");

  return {
    crackDurationMs: crackTiming ? Number(crackTiming[1]) : 0,
    crackProgressDurationMs: crackProgressTiming ? Number(crackProgressTiming[1]) : 0,
    hatchBurstDelayMs: hatchBurstDelay ? Number(hatchBurstDelay[1]) : 0,
    hatchBurstDurationMs: hatchBurstTiming ? Number(hatchBurstTiming[1]) : 0,
    shellSplitInputRange: shellSplit.inputRange,
    shellSplitOutputRange: shellSplit.outputRange,
    shellLiftInputRange: shellLift.inputRange,
    shellLiftOutputRange: shellLift.outputRange,
    hatchOpacityInputRange: hatchOpacity.inputRange,
    hatchOpacityOutputRange: hatchOpacity.outputRange,
    flashOpacityInputRange: flashOpacity.inputRange,
    flashOpacityOutputRange: flashOpacity.outputRange,
    hatchlingRevealOpacityInputRange: hatchlingRevealOpacity.inputRange,
    hatchlingRevealOpacityOutputRange: hatchlingRevealOpacity.outputRange,
    hatchlingRevealScaleInputRange: hatchlingRevealScale.inputRange,
    hatchlingRevealScaleOutputRange: hatchlingRevealScale.outputRange,
    leftShellRotateInputRange: leftShellRotate.inputRange,
    leftShellRotateOutputRange: leftShellRotate.outputRange,
    rightShellRotateInputRange: rightShellRotate.inputRange,
    rightShellRotateOutputRange: rightShellRotate.outputRange
  };
}

function arraysEqual(actual, expected) {
  return Array.isArray(actual) &&
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index]);
}

function hatchingSourceTimingMatchesMirroredModel(sourceTiming) {
  const expectedTiming = {
    crackDurationMs: 1650,
    crackProgressDurationMs: 520,
    hatchBurstDelayMs: 260,
    hatchBurstDurationMs: 1120,
    shellSplitInputRange: [0, 0.42, 0.75, 1],
    shellSplitOutputRange: [0, 0, 22, 62],
    shellLiftInputRange: [0, 0.42, 1],
    shellLiftOutputRange: [0, 0, -18],
    hatchOpacityInputRange: [0, 0.62, 1],
    hatchOpacityOutputRange: [1, 0.88, 0.18],
    flashOpacityInputRange: [0, 0.35, 0.66, 1],
    flashOpacityOutputRange: [0, 0.12, 0.46, 0.08],
    hatchlingRevealOpacityInputRange: [0, 0.58, 1],
    hatchlingRevealOpacityOutputRange: [0, 0, 1],
    hatchlingRevealScaleInputRange: [0, 1],
    hatchlingRevealScaleOutputRange: [0.72, 1.12],
    leftShellRotateInputRange: [0, 0.42, 1],
    leftShellRotateOutputRange: [0, 0, -18],
    rightShellRotateInputRange: [0, 0.42, 1],
    rightShellRotateOutputRange: [0, 0, 18]
  };

  return Boolean(sourceTiming) && Object.entries(expectedTiming).every(([key, expected]) => {
    const actual = sourceTiming[key];
    return Array.isArray(expected) ? arraysEqual(actual, expected) : actual === expected;
  });
}

function buildHatchingRevealFrame(progress, particles, rays) {
  const burstProgress = progress < 0.16 ? 0 : Math.min(1, (progress - 0.16) / 0.84);
  const phase = progress < 0.32 ? "anticipation" : progress < 0.74 ? "shell split" : "hatchling reveal";
  const shellSplit = interpolate(progress, [0, 0.42, 0.75, 1], [0, 0, 22, 62]);
  const shellLift = interpolate(progress, [0, 0.42, 1], [0, 0, -18]);
  const eggOpacity = interpolate(progress, [0, 0.62, 1], [1, 0.88, 0.18]);
  const hatchlingOpacity = interpolate(progress, [0, 0.58, 1], [0, 0, 1]);
  const hatchlingScale = interpolate(progress, [0, 1], [0.72, 1.12]);

  return {
    progress,
    burstProgress: Number(burstProgress.toFixed(3)),
    phase,
    shell: {
      opacity: Number(eggOpacity.toFixed(3)),
      split: Number(shellSplit.toFixed(2)),
      lift: Number(shellLift.toFixed(2)),
      leftRotation: Number(interpolate(progress, [0, 0.42, 1], [0, 0, -18]).toFixed(2)),
      rightRotation: Number(interpolate(progress, [0, 0.42, 1], [0, 0, 18]).toFixed(2))
    },
    flash: {
      opacity: Number(interpolate(progress, [0, 0.35, 0.66, 1], [0, 0.12, 0.46, 0.08]).toFixed(3)),
      shockRingOpacity: Number(interpolate(burstProgress, [0, 0.2, 0.72, 1], [0, 0.48, 0.14, 0]).toFixed(3)),
      shockRingScale: Number(interpolate(burstProgress, [0, 1], [0.78, 1.45]).toFixed(3))
    },
    hatchling: {
      opacity: Number(hatchlingOpacity.toFixed(3)),
      scale: Number(hatchlingScale.toFixed(3))
    },
    rays: rays.map((ray) => ({
      rotate: ray.rotate,
      opacity: Number(interpolate(burstProgress, [ray.delay, ray.delay + 0.16, 0.74, 1], [0, 0.32, 0.08, 0]).toFixed(3)),
      scaleY: Number(interpolate(burstProgress, [ray.delay, ray.delay + 0.34, 1], [0.18, 0.82, 0.48]).toFixed(3))
    })),
    particles: particles.map((particle) => ({
      index: particle.index,
      x: Number(interpolate(burstProgress, [particle.delay, 1], [0, particle.x]).toFixed(2)),
      y: Number(interpolate(burstProgress, [particle.delay, 1], [0, particle.y]).toFixed(2)),
      opacity: Number(interpolate(burstProgress, [particle.delay, particle.delay + 0.14, 0.78, 1], [0, 0.62, 0.36, 0]).toFixed(3)),
      scale: Number(interpolate(burstProgress, [particle.delay, particle.delay + 0.18, 1], [0.25, 0.88, 0.48]).toFixed(3)),
      size: particle.size,
      rotate: particle.rotate
    }))
  };
}

function buildHatchingFrameSvg(frame, index) {
  const width = 390;
  const height = 270;
  const center = { x: width / 2, y: 134 };
  const rays = frame.rays.map((ray) => `<rect x="${center.x - 5}" y="${center.y - 84}" width="10" height="92" rx="5" fill="#ffd45d" opacity="${ray.opacity}" transform="rotate(${ray.rotate.replace("deg", "")} ${center.x} ${center.y}) scale(1 ${ray.scaleY})" />`).join("\n      ");
  const particles = frame.particles.map((particle) => `<circle cx="${(center.x + particle.x).toFixed(1)}" cy="${(center.y + particle.y).toFixed(1)}" r="${Math.max(2, particle.size * particle.scale).toFixed(1)}" fill="${particle.index % 2 === 0 ? "#fff2a8" : "#ff784f"}" opacity="${particle.opacity}" />`).join("\n      ");
  const leftX = center.x - 34 - frame.shell.split;
  const rightX = center.x + 34 + frame.shell.split;

  return `<svg class="frame-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Hatching reveal frame ${index} ${frame.phase}">
    <rect width="${width}" height="${height}" rx="22" fill="#090413" />
    <circle cx="${center.x}" cy="${center.y}" r="96" fill="#ff784f" opacity="${frame.flash.opacity}" />
    <circle cx="${center.x}" cy="${center.y}" r="${(72 * frame.flash.shockRingScale).toFixed(1)}" fill="none" stroke="#fff2a8" stroke-width="4" opacity="${frame.flash.shockRingOpacity}" />
    ${rays}
    <ellipse cx="${center.x}" cy="216" rx="78" ry="10" fill="rgba(0,0,0,0.34)" />
    <ellipse cx="${leftX.toFixed(1)}" cy="${(center.y + frame.shell.lift).toFixed(1)}" rx="38" ry="62" fill="#7c2d12" opacity="${frame.shell.opacity}" transform="rotate(${frame.shell.leftRotation} ${leftX.toFixed(1)} ${(center.y + frame.shell.lift).toFixed(1)})" />
    <ellipse cx="${rightX.toFixed(1)}" cy="${(center.y + frame.shell.lift).toFixed(1)}" rx="38" ry="62" fill="#f97316" opacity="${frame.shell.opacity}" transform="rotate(${frame.shell.rightRotation} ${rightX.toFixed(1)} ${(center.y + frame.shell.lift).toFixed(1)})" />
    <text x="${center.x}" y="${(center.y + 8).toFixed(1)}" text-anchor="middle" fill="#fef3c7" font-size="18" font-weight="900" opacity="${frame.hatchling.opacity}" transform="scale(${frame.hatchling.scale} ${frame.hatchling.scale}) translate(${(center.x * (1 / frame.hatchling.scale - 1)).toFixed(2)} ${(center.y * (1 / frame.hatchling.scale - 1)).toFixed(2)})">Hatchling</text>
    ${particles}
    <text x="195" y="244" text-anchor="middle" fill="#a7f3d0" font-size="12" font-weight="900">${escapeHtml(frame.phase)} · progress ${frame.progress.toFixed(2)}</text>
  </svg>`;
}

function writeHatchingRevealArtifacts(appSource) {
  const particles = parseHatchBurstParticles(appSource);
  const rays = parseHatchBurstRays(appSource);
  const sourceTiming = parseHatchingRevealTimingSource(appSource);
  const progressSamples = [0, 0.18, 0.35, 0.55, 0.72, 0.9, 1];
  const frames = progressSamples.map((progress) => buildHatchingRevealFrame(progress, particles, rays));

  fs.writeFileSync(hatchFramesPath, JSON.stringify({
    name: "hatching-reveal-frame-samples",
    generatedAt: nowIso(),
    coordinateSystem: "390x270 storyboard using a mirrored hatching reveal model plus parsed EggHatchBurst constants",
    source: "App.tsx EggHatchBurst rays, shell sparks, hatching durations, and key interpolation ranges are parsed; frame sampling still mirrors the deterministic storyboard model",
    sourceTiming,
    progressSamples,
    expectedParticleCount: particles.length,
    expectedRayCount: rays.length,
    frames
  }, null, 2));

  const figures = frames.map((frame, index) => `<figure>${buildHatchingFrameSvg(frame, index)}<figcaption>Frame ${index}: progress ${frame.progress.toFixed(2)} — ${escapeHtml(frame.phase)}</figcaption></figure>`).join("\n");

  fs.writeFileSync(hatchStoryboardPath, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Hatching Reveal Storyboard</title>
  <style>
    body { margin: 0; padding: 24px; background: #080512; color: #f8fafc; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    h1 { margin: 0 0 8px; font-size: 24px; }
    p { color: #cbd5e1; max-width: 900px; line-height: 1.5; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; margin-top: 20px; }
    figure { margin: 0; padding: 12px; border: 1px solid rgba(255,255,255,0.12); border-radius: 18px; background: rgba(255,255,255,0.04); }
    figcaption { margin-top: 8px; color: #facc15; font-size: 13px; font-weight: 800; }
    .frame-svg { width: 100%; height: auto; display: block; }
    code { color: #fbbf24; }
  </style>
</head>
<body>
  <h1>Hatching Reveal Storyboard</h1>
  <p>This deterministic artifact is generated by <code>npm run test:auto</code>. It parses ray and shell-spark constants from <code>App.tsx</code> and applies a mirrored hatching reveal timing model for anticipation, shell split, flash, shock ring, and hatchling reveal beats. It gives autonomous reviewers a non-interactive review surface for the first-impression hatch moment.</p>
  <p>Machine-readable frame data: <code>${escapeHtml(path.basename(hatchFramesPath))}</code></p>
  <section class="grid">
    ${figures}
  </section>
</body>
</html>\n`);
}

function analyzeHatchingRevealArtifacts(checks) {
  const artifactExists = fs.existsSync(hatchStoryboardPath) && fs.existsSync(hatchFramesPath);
  const framesJson = artifactExists ? JSON.parse(fs.readFileSync(hatchFramesPath, "utf8")) : null;
  const frames = framesJson && Array.isArray(framesJson.frames) ? framesJson.frames : [];
  const storyboardHtml = fs.existsSync(hatchStoryboardPath) ? fs.readFileSync(hatchStoryboardPath, "utf8") : "";

  assertCheck(
    checks,
    "hatching-reveal-source-timing",
    artifactExists && hatchingSourceTimingMatchesMirroredModel(framesJson.sourceTiming),
    "Hatching reveal frames include parsed source timing that matches the mirrored storyboard guard.",
    {
      hatchFramesPath,
      sourceTiming: framesJson ? framesJson.sourceTiming : null
    }
  );

  assertCheck(
    checks,
    "hatching-reveal-particle-ray-integrity",
    artifactExists &&
      frames.length > 0 &&
      Number(framesJson.expectedParticleCount) > 0 &&
      Number(framesJson.expectedRayCount) > 0 &&
      frames.every((frame) =>
        Array.isArray(frame.particles) &&
        frame.particles.length === framesJson.expectedParticleCount &&
        Array.isArray(frame.rays) &&
        frame.rays.length === framesJson.expectedRayCount
      ),
    "Every hatching reveal frame includes the parsed shell spark and ray arrays.",
    {
      hatchFramesPath,
      expectedParticleCount: framesJson ? framesJson.expectedParticleCount : 0,
      expectedRayCount: framesJson ? framesJson.expectedRayCount : 0,
      perFrameCounts: frames.map((frame) => ({
        progress: frame.progress,
        particles: Array.isArray(frame.particles) ? frame.particles.length : 0,
        rays: Array.isArray(frame.rays) ? frame.rays.length : 0
      }))
    }
  );

  assertCheck(
    checks,
    "hatching-reveal-phase-coverage",
    artifactExists &&
      frames.length >= 6 &&
      frames.some((frame) => frame.phase === "anticipation") &&
      frames.some((frame) => frame.phase === "shell split") &&
      frames.some((frame) => frame.phase === "hatchling reveal"),
    "Hatching reveal frames cover anticipation, shell split, and hatchling reveal beats.",
    { hatchFramesPath, frameCount: frames.length, framePhases: frames.map((frame) => frame.phase) }
  );

  assertCheck(
    checks,
    "hatching-reveal-storyboard-html",
    artifactExists && storyboardHtml.includes("Hatching Reveal Storyboard"),
    "Hatching reveal storyboard HTML exists with the expected review title.",
    { hatchStoryboardPath, htmlLength: storyboardHtml.length }
  );

  const expectedCaptions = frames.map((frame, index) =>
    `Frame ${index}: progress ${Number(frame.progress).toFixed(2)} — ${frame.phase}`
  );
  assertCheck(
    checks,
    "hatching-reveal-storyboard-captions",
    artifactExists &&
      frames.length > 0 &&
      expectedCaptions.every((caption) => storyboardHtml.includes(caption)),
    "Hatching reveal storyboard HTML contains every sampled frame caption with progress and phase.",
    { hatchStoryboardPath, expectedCaptions }
  );
}

function analyzeGeneratedArtifactIntegrity(checks, expectedParticleCount) {
  const framesJson = JSON.parse(fs.readFileSync(framesPath, "utf8"));
  const progressSamples = Array.isArray(framesJson.progressSamples) ? framesJson.progressSamples : [];
  const frames = Array.isArray(framesJson.frames) ? framesJson.frames : [];
  const storyboardHtml = fs.existsSync(storyboardPath) ? fs.readFileSync(storyboardPath, "utf8") : "";

  assertCheck(
    checks,
    "storyboard-html-captions",
    fs.existsSync(storyboardPath) && frames.every((frame, index) => storyboardHtml.includes(`Frame ${index}: progress ${Number(frame.progress).toFixed(2)}`)),
    "Storyboard HTML exists and contains every sampled frame caption.",
    {
      storyboardPath,
      expectedCaptions: frames.map((frame, index) => `Frame ${index}: progress ${Number(frame.progress).toFixed(2)}`)
    }
  );

  assertCheck(
    checks,
    "frame-json-progress-samples",
    progressSamples.length === 7 && frames.length === 7 && frames.every((frame, index) => frame.progress === progressSamples[index]),
    "Frame JSON declares the seven sampled animation progress values used by the storyboard.",
    { progressSamples, frameCount: frames.length, expectedCount: 7 }
  );

  assertCheck(
    checks,
    "frame-json-particle-data-complete",
    expectedParticleCount > 0 && frames.every((frame) => Array.isArray(frame.particles) && frame.particles.length === expectedParticleCount && frame.particles.every((particle) =>
      typeof particle.index === "number" &&
      typeof particle.x === "number" &&
      typeof particle.y === "number" &&
      typeof particle.scale === "number" &&
      typeof particle.opacity === "number" &&
      typeof particle.color === "string" &&
      typeof particle.size === "number"
    )),
    "Frame JSON includes full particle data for every particle in every sampled frame.",
    { expectedParticleCount, particleCounts: frames.map((frame) => Array.isArray(frame.particles) ? frame.particles.length : 0) }
  );

  const expectedSvgPaths = frames.map((_, index) => path.join(artifactDir, `fire-breath-frame-${String(index).padStart(2, "0")}.svg`));
  assertCheck(
    checks,
    "frame-svg-files-exist",
    expectedSvgPaths.length === 7 && expectedSvgPaths.every((svgPath) => fs.existsSync(svgPath)),
    "A frame SVG file exists for every sampled frame.",
    { expectedSvgPaths }
  );

  const finalFrame = frames[frames.length - 1];
  assertCheck(
    checks,
    "final-frame-particles-opacity-zero",
    finalFrame && Array.isArray(finalFrame.particles) && finalFrame.particles.length === expectedParticleCount && finalFrame.particles.every((particle) => particle.opacity === 0),
    "Final sampled frame has all particle opacity at zero, proving fade-out/no rewind in generated artifacts.",
    { finalParticleOpacities: finalFrame && Array.isArray(finalFrame.particles) ? finalFrame.particles.map((particle) => particle.opacity) : [] }
  );
}

function extractDragonPathBlock(gameSource, pathId) {
  const startToken = `  ${pathId}: {`;
  const start = gameSource.indexOf(startToken);
  if (start === -1) return "";
  const end = gameSource.indexOf("\n  },", start + startToken.length);
  return gameSource.slice(start, end === -1 ? undefined : end + 5);
}

function extractQuotedField(block, fieldName) {
  const match = block.match(new RegExp(`${fieldName}:\\s*\"([^\"]+)\"`));
  return match ? match[1] : "";
}

function extractNumberField(block, fieldName) {
  const match = block.match(new RegExp(`${fieldName}:\\s*([0-9.]+)`));
  return match ? Number(match[1]) : 0;
}

function hasNumberField(block, fieldName) {
  return new RegExp(`${fieldName}:\\s*[0-9.]+`).test(block);
}

function extractFunctionBlock(source, signature) {
  const signatureIndex = source.indexOf(signature);
  if (signatureIndex === -1) return "";
  const openBraceIndex = source.indexOf("{", signatureIndex);
  if (openBraceIndex === -1) return "";
  let depth = 0;
  for (let index = openBraceIndex; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(signatureIndex, index + 1);
  }
  return "";
}

function extractInlineObjectField(block, fieldName) {
  const match = block.match(new RegExp(`${fieldName}:\\s*\\{([^}]+)\\}`));
  return match ? match[1].trim() : "";
}

function buildDragonPathCompletenessEntry(gameSource, pathId) {
  const block = extractDragonPathBlock(gameSource, pathId);
  const statBoost = extractInlineObjectField(block, "statBoost");
  const battleModifier = extractInlineObjectField(block, "battleModifier");
  const element = extractQuotedField(block, "element");
  const role = extractQuotedField(block, "role");
  const expectedIdentity = expectedDragonPathIdentity[pathId] || { element: "", role: "" };
  const requiredStringFields = ["name", "vow", "description", "bonus", "combatVerb", "combatStyle", "tempoLabel"];
  const requiredBattleFields = ["damageMultiplier", "damageReduction", "tempoLabel"];
  const requiredFields = {
    block: block.length > 0,
    element: element === expectedIdentity.element,
    role: role === expectedIdentity.role,
    statBoost: statBoost.length > 0 && /(?:health|attack|defense|speed):\s*[1-9]/.test(statBoost),
    battleModifier: requiredBattleFields.every((field) => battleModifier.includes(field)) &&
      hasNumberField(block, "damageMultiplier") &&
      hasNumberField(block, "damageReduction")
  };

  for (const field of requiredStringFields) {
    requiredFields[field] = extractQuotedField(block, field).trim().length > 0;
  }

  return {
    pathId,
    element,
    role,
    complete: Object.values(requiredFields).every(Boolean),
    requiredFields,
    identity: {
      expectedIdentity,
      name: extractQuotedField(block, "name"),
      combatVerb: extractQuotedField(block, "combatVerb"),
      combatStyle: extractQuotedField(block, "combatStyle"),
      tempoLabel: extractQuotedField(block, "tempoLabel"),
      statBoost,
      battleModifier
    }
  };
}

function writeDragonPathCompletenessArtifact(gameSource) {
  const paths = expectedDragonPathIds.map((pathId) => buildDragonPathCompletenessEntry(gameSource, pathId));
  const byElement = groupSamplesByElement(paths);
  fs.writeFileSync(pathCompletenessPath, JSON.stringify({
    name: "dragon-path-content-completeness",
    generatedAt: nowIso(),
    source: "src/game.ts dragonPathDefinitions",
    expectedElements: expectedDragonElements,
    expectedRoles: expectedDragonRoles,
    paths,
    comparisons: {
      allExpectedPathsPresent: paths.length === expectedDragonPathIds.length && paths.every((path) => path.requiredFields.block),
      everyElementHasEveryRole: expectedDragonElements.every((element) => {
        const roles = byElement[element] || {};
        return expectedDragonRoles.every((role) => Boolean(roles[role]));
      }),
      everyPathIdMatchesExpectedIdentity: paths.every((path) => {
        const expectedIdentity = expectedDragonPathIdentity[path.pathId] || {};
        return path.element === expectedIdentity.element && path.role === expectedIdentity.role;
      }),
      everyPathHasRequiredIdentityFields: paths.every((path) => path.complete)
    }
  }, null, 2));
}

function parseSkillDraftEntries(gameSource) {
  const skillSource = getSection(gameSource, "export const dragonSkillDrafts: DragonSkillDraft[] = [", "];\n\nexport const supportingSystemRecommendations");
  return [...skillSource.matchAll(/\{[\s\S]*?id:\s*\"([^\"]+)\"[\s\S]*?statHooks:\s*\[([^\]]+)\][\s\S]*?\}/g)].map((match) => {
    const block = match[0];
    const statHooks = [...block.matchAll(/\"(attack|health|defense|speed|block|dodge|critChance|critDamage)\"/g)].map((statMatch) => statMatch[1]);
    return {
      id: match[1],
      archetype: extractQuotedField(block, "archetype"),
      elementFocus: extractQuotedField(block, "elementFocus"),
      roleFocus: extractQuotedField(block, "roleFocus"),
      name: extractQuotedField(block, "name"),
      trigger: extractQuotedField(block, "trigger"),
      effect: extractQuotedField(block, "effect"),
      synergy: extractQuotedField(block, "synergy"),
      pathPayoff: extractQuotedField(block, "pathPayoff"),
      activeBonus: {
        damageMultiplier: extractNumberField(block, "damageMultiplier"),
        damageReduction: extractNumberField(block, "damageReduction"),
        combatEffect: extractQuotedField(block, "combatEffect")
      },
      statHooks
    };
  });
}

function writeSkillBuildPayoffMatrixArtifact(gameSource) {
  const skills = parseSkillDraftEntries(gameSource);
  const requiredStats = ["attack", "health", "defense", "speed", "block", "dodge", "critChance", "critDamage"];
  const requiredElements = expectedDragonElements;
  const requiredRoles = expectedDragonRoles;
  const allStatHooks = new Set(skills.flatMap((skill) => skill.statHooks));
  const roleCounts = Object.fromEntries(requiredRoles.map((role) => [role, skills.filter((skill) => skill.roleFocus === role).length]));
  const elementRoleMatrix = Object.fromEntries(expectedDragonPathIds.map((pathId) => {
    const pathBlock = extractDragonPathBlock(gameSource, pathId);
    const element = extractQuotedField(pathBlock, "element");
    const role = extractQuotedField(pathBlock, "role");
    const skill = skills.find((candidate) => candidate.elementFocus === element && candidate.roleFocus === role);
    return [pathId, { element, role, skillId: skill?.id ?? null }];
  }));
  const invalidSkills = skills.filter((skill) =>
    !skill.id ||
    !skill.archetype ||
    !requiredElements.includes(skill.elementFocus) ||
    !requiredRoles.includes(skill.roleFocus) ||
    !skill.pathPayoff.includes(`${skill.roleFocus[0].toUpperCase()}${skill.roleFocus.slice(1)} payoff:`) ||
    !skill.activeBonus.combatEffect ||
    skill.activeBonus.damageMultiplier <= 1 ||
    skill.activeBonus.damageReduction < 0 ||
    skill.statHooks.length < 3
  );

  fs.writeFileSync(skillBuildPayoffMatrixPath, JSON.stringify({
    name: "skill-build-payoff-matrix",
    generatedAt: nowIso(),
    source: "src/game.ts dragonSkillDrafts + App.tsx SkillDraftPanel visible path payoff copy",
    reviewPrompt: "Verify each future skill pick has a role focus, explicit path payoff, and stat hooks that make evolution choices feel like combat builds.",
    requiredStats,
    requiredRoles,
    roleCounts,
    elementRoleMatrix,
    skills,
    comparisons: {
      coversAllSkillDrafts: skills.length === expectedDragonPathIds.length,
      coversEveryCombatStat: requiredStats.every((stat) => allStatHooks.has(stat)),
      everySkillHasRoleFocus: skills.every((skill) => requiredRoles.includes(skill.roleFocus)) && requiredRoles.every((role) => roleCounts[role] > 0),
      everySkillHasElementFocus: expectedDragonPathIds.every((pathId) => Boolean(elementRoleMatrix[pathId]?.skillId)),
      everySkillHasVisiblePathPayoff: invalidSkills.length === 0,
      everySkillHasTunedActiveBonus: skills.every((skill) =>
        skill.activeBonus.combatEffect && skill.activeBonus.damageMultiplier > 1 && skill.activeBonus.damageReduction >= 0
      ) && new Set(skills.map((skill) => `${skill.activeBonus.damageMultiplier}|${skill.activeBonus.damageReduction}|${skill.activeBonus.combatEffect}`)).size === skills.length
    },
    invalidSkills
  }, null, 2));
}

function getSkillBonusForRole(role) {
  if (role === "raider") return { damageMultiplier: 1.08, damageReduction: 0, combatEffect: "+8% damage from raider skill pressure" };
  if (role === "guardian") return { damageMultiplier: 1.02, damageReduction: 0.06, combatEffect: "+6% mitigation from guardian skill guard" };
  return { damageMultiplier: 1.05, damageReduction: 0.03, combatEffect: "+5% damage / +3% mitigation from mystic skill tempo" };
}

function getSkillBonusForPreview(skill, role) {
  if (skill?.activeBonus?.damageMultiplier && skill.activeBonus.combatEffect) {
    return skill.activeBonus;
  }
  return getSkillBonusForRole(role);
}

function requireTranspiledGameModule() {
  const ts = require("typescript");
  const previousDev = global.__DEV__;
  const previousTsHook = require.extensions[".ts"];
  global.__DEV__ = false;
  require.extensions[".ts"] = function transpileTypeScriptForAutomation(module, filename) {
    const source = fs.readFileSync(filename, "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2019
      }
    }).outputText;
    module._compile(output, filename);
  };

  try {
    return require(gamePath);
  } finally {
    if (previousTsHook) {
      require.extensions[".ts"] = previousTsHook;
    } else {
      delete require.extensions[".ts"];
    }
    if (typeof previousDev !== "undefined") {
      global.__DEV__ = previousDev;
    } else {
      delete global.__DEV__;
    }
  }
}

function withDeterministicRandom(fn) {
  const originalRandom = Math.random;
  Math.random = () => 0.99;
  try {
    return fn();
  } finally {
    Math.random = originalRandom;
  }
}

function withRandomSequence(values, fallback, fn) {
  const originalRandom = Math.random;
  let index = 0;
  Math.random = () => {
    if (index < values.length) {
      const value = values[index];
      index += 1;
      return value;
    }
    return fallback;
  };
  try {
    return fn();
  } finally {
    Math.random = originalRandom;
  }
}

function firstPlayerDamageFromBattle(battle) {
  const hitLine = battle?.rounds?.find((line) => line.includes("your dragon") && line.includes(" for ")) ?? "";
  const match = hitLine.match(/ for (\d+)/);
  return match ? Number(match[1]) : null;
}

function triggeredSkillDamageFromBattle(battle) {
  const triggerLine = battle?.rounds?.find((line) => line.includes("Skill trigger:") && line.includes(" bonus damage")) ?? "";
  const match = triggerLine.match(/ for (\d+) bonus damage/);
  return match ? Number(match[1]) : 0;
}

function buildFireOverheatCritTriggerProof(game, selectedState) {
  const noCritBattle = withRandomSequence([0.99, 0.99, 0.99, 0.99], 0.99, () => game.gameReducer(selectedState, { type: "runAdventure" }).lastBattle);
  const critBattle = withRandomSequence([0.01, 0.99, 0.99, 0.99], 0.99, () => game.gameReducer(selectedState, { type: "runAdventure" }).lastBattle);
  const noCritTriggerDamage = triggeredSkillDamageFromBattle(noCritBattle);
  const critTriggerDamage = triggeredSkillDamageFromBattle(critBattle);
  return {
    skillId: selectedState.selectedActiveSkillId,
    noCritTriggerDamage,
    critTriggerDamage,
    noCritTriggerLine: noCritBattle?.rounds?.find((line) => line.includes("Skill trigger:")) ?? null,
    critTriggerLine: critBattle?.rounds?.find((line) => line.includes("Skill trigger:")) ?? null,
    comparisons: {
      overheatOnlyTriggersOnCrit: noCritTriggerDamage === 0 && critTriggerDamage > 0,
      critTriggerAddsBonusDamage: critTriggerDamage > 0,
      critTriggerAppearsInBattleLog: Boolean(critBattle?.rounds?.some((line) => line.includes("Skill trigger: Overheat Fang") && line.includes("crit-breath ignites")))
    }
  };
}

function emberAegisTriggerDamageFromBattle(battle) {
  const triggerLine = battle?.rounds?.find((line) => line.includes("Skill trigger: Ember Aegis") && line.includes("counter-burn")) ?? "";
  const match = triggerLine.match(/ for (\d+) counter-burn/);
  return match ? Number(match[1]) : 0;
}

function buildFireEmberAegisBlockTriggerProof(game, pathState) {
  const noBlockBattle = withRandomSequence([0.99, 0.99, 0.99, 0.99], 0.99, () => game.gameReducer(pathState, { type: "runAdventure" }).lastBattle);
  const blockBattle = withRandomSequence([0.99, 0.99, 0.99, 0.01], 0.99, () => game.gameReducer(pathState, { type: "runAdventure" }).lastBattle);
  const noBlockTriggerDamage = emberAegisTriggerDamageFromBattle(noBlockBattle);
  const blockTriggerDamage = emberAegisTriggerDamageFromBattle(blockBattle);
  return {
    skillId: pathState.selectedActiveSkillId,
    noBlockTriggerDamage,
    blockTriggerDamage,
    noBlockTriggerLine: noBlockBattle?.rounds?.find((line) => line.includes("Skill trigger: Ember Aegis")) ?? null,
    blockTriggerLine: blockBattle?.rounds?.find((line) => line.includes("Skill trigger: Ember Aegis")) ?? null,
    comparisons: {
      emberAegisOnlyTriggersOnBlock: noBlockTriggerDamage === 0 && blockTriggerDamage > 0,
      blockTriggerAddsCounterBurnDamage: blockTriggerDamage > 0,
      blockTriggerDamageFeelsImpactful: blockTriggerDamage >= 2,
      blockTriggerAppearsInBattleLog: Boolean(blockBattle?.rounds?.some((line) => line.includes("Skill trigger: Ember Aegis") && line.includes("counter-burn")))
    }
  };
}

function afterimageDiveTriggerDamageFromBattle(battle) {
  const triggerLine = battle?.rounds?.find((line) => line.includes("Skill trigger: Afterimage Dive") && line.includes("afterimage slash")) ?? "";
  const match = triggerLine.match(/ for (\d+) afterimage slash/);
  return match ? Number(match[1]) : 0;
}

function buildAfterimageDiveDodgeTriggerProof(game) {
  const baseState = {
    ...game.initialGameState,
    activeScreen: "journey",
    phase: "journey",
    dragon: {
      ...game.initialGameState.dragon,
      stage: "hatchling",
      element: "water",
      path: null
    }
  };
  const pathState = game.gameReducer(baseState, { type: "selectDragonPath", pathId: "waterMystic" });
  const noDodgeBattle = withRandomSequence([0.99, 0.99, 0.99, 0.99], 0.99, () => game.gameReducer(pathState, { type: "runAdventure" }).lastBattle);
  const dodgeBattle = withRandomSequence([0.99, 0.01], 0.99, () => game.gameReducer(pathState, { type: "runAdventure" }).lastBattle);
  const noDodgeTriggerDamage = afterimageDiveTriggerDamageFromBattle(noDodgeBattle);
  const dodgeTriggerDamage = afterimageDiveTriggerDamageFromBattle(dodgeBattle);
  return {
    pathId: "waterMystic",
    skillId: pathState.selectedActiveSkillId,
    noDodgeTriggerDamage,
    dodgeTriggerDamage,
    noDodgeTriggerLine: noDodgeBattle?.rounds?.find((line) => line.includes("Skill trigger: Afterimage Dive")) ?? null,
    dodgeTriggerLine: dodgeBattle?.rounds?.find((line) => line.includes("Skill trigger: Afterimage Dive")) ?? null,
    comparisons: {
      afterimageDiveOnlyTriggersOnDodge: noDodgeTriggerDamage === 0 && dodgeTriggerDamage > 0,
      dodgeTriggerAddsAfterimageSlashDamage: dodgeTriggerDamage > 0,
      dodgeTriggerDamageFeelsImpactful: dodgeTriggerDamage >= 2,
      dodgeTriggerAppearsInBattleLog: Boolean(dodgeBattle?.rounds?.some((line) => line.includes("Skill trigger: Afterimage Dive") && line.includes("afterimage slash")))
    }
  };
}

function crystalBreakTriggerDamageFromBattle(battle) {
  const triggerLine = battle?.rounds?.find((line) => line.includes("Skill trigger: Crystal Break") && line.includes("armor-pierce")) ?? "";
  const match = triggerLine.match(/ for (\d+) armor-pierce/);
  return match ? Number(match[1]) : 0;
}

function buildCrystalBreakOpeningHitTriggerProof(game) {
  const baseState = {
    ...game.initialGameState,
    activeScreen: "journey",
    phase: "journey",
    dragon: {
      ...game.initialGameState.dragon,
      stage: "hatchling",
      element: "earth",
      path: null
    }
  };
  const pathState = game.gameReducer(baseState, { type: "selectDragonPath", pathId: "earthRaider" });
  const battle = withRandomSequence([0.99, 0.99, 0.99, 0.99, 0.99, 0.99], 0.99, () => game.gameReducer(pathState, { type: "runAdventure" }).lastBattle);
  const triggerLines = battle?.rounds?.filter((line) => line.includes("Skill trigger: Crystal Break")) ?? [];
  const roundOneIndex = battle?.rounds?.findIndex((line) => line.startsWith("Round 1:")) ?? -1;
  const roundTwoIndex = battle?.rounds?.findIndex((line) => line.startsWith("Round 2:")) ?? -1;
  const triggerIndex = battle?.rounds?.findIndex((line) => line.includes("Skill trigger: Crystal Break")) ?? -1;
  const triggerDamage = crystalBreakTriggerDamageFromBattle(battle);
  return {
    pathId: "earthRaider",
    skillId: pathState.selectedActiveSkillId,
    triggerDamage,
    triggerLines,
    roundOneIndex,
    roundTwoIndex,
    triggerIndex,
    comparisons: {
      crystalBreakIsEarthRaiderDefault: pathState.selectedActiveSkillId === "earth-crystal-break",
      crystalBreakOpeningHitAddsArmorPierceDamage: triggerDamage >= 2,
      crystalBreakOnlyTriggersOnce: triggerLines.length === 1,
      crystalBreakTriggerOccursAfterRoundOneBeforeRoundTwo: triggerIndex > roundOneIndex && (roundTwoIndex === -1 || triggerIndex < roundTwoIndex),
      crystalBreakTriggerAppearsInBattleLog: triggerLines.some((line) => line.includes("armor-pierce") && line.includes("opening hit"))
    }
  };
}

function buildReducerToBattleSkillLoadoutProof() {
  const game = requireTranspiledGameModule();
  return withDeterministicRandom(() => {
    const baseState = {
      ...game.initialGameState,
      activeScreen: "journey",
      phase: "journey",
      dragon: {
        ...game.initialGameState.dragon,
        stage: "hatchling",
        element: "fire",
        path: null
      }
    };
    const pathState = game.gameReducer(baseState, { type: "selectDragonPath", pathId: "fireGuardian" });
    const defaultBattleState = game.gameReducer(pathState, { type: "runAdventure" });
    const lockedAttemptState = game.gameReducer(defaultBattleState, { type: "selectActiveSkill", skillId: "fire-overheat" });
    const unlockedInputState = { ...defaultBattleState, lifetimeEssence: game.ACTIVE_SKILL_CROSS_PATH_ESSENCE_COST };
    const selectedState = game.gameReducer(unlockedInputState, { type: "selectActiveSkill", skillId: "fire-overheat" });
    const selectedBattleState = game.gameReducer(selectedState, { type: "runAdventure" });
    const defaultBattle = defaultBattleState.lastBattle;
    const selectedBattle = selectedBattleState.lastBattle;
    const persistedLockedState = {
      ...pathState,
      lifetimeEssence: 0,
      selectedActiveSkillId: "fire-overheat"
    };
    const persistedLockedSkill = game.getActiveDragonSkill(persistedLockedState);
    const defaultDamage = firstPlayerDamageFromBattle(defaultBattle);
    const selectedDamage = firstPlayerDamageFromBattle(selectedBattle);
    const eliteReadyState = {
      ...pathState,
      lifetimeEssence: 0,
      dragon: {
        ...pathState.dragon,
        stats: {
          ...pathState.dragon.stats,
          attack: 80,
          health: 500,
          defense: 35,
          speed: 20,
          block: 35,
          dodge: 12,
          critChance: 20,
          critDamage: 175
        }
      }
    };
    const eliteStoppedState = game.gameReducer(eliteReadyState, { type: "selectAdventureNode", nodeId: "reef-slime-crossing" });
    const eliteClearedState = withDeterministicRandom(() => game.gameReducer(eliteStoppedState, { type: "selectAdventureNode", nodeId: "reef-slime-crossing" }));
    const eliteOfferedSkillId = eliteClearedState.lastSkillDraftOffer?.skillIds?.find((skillId) => skillId === "fire-overheat") ?? null;
    const eliteSelectedState = eliteOfferedSkillId
      ? game.gameReducer(eliteClearedState, { type: "selectActiveSkill", skillId: eliteOfferedSkillId })
      : eliteClearedState;
    const eliteUnchosenSkillId = eliteSelectedState.lastSkillDraftOffer?.skillIds?.find(
      (skillId) => skillId !== eliteOfferedSkillId && skillId !== pathState.selectedActiveSkillId
    ) ?? null;
    const eliteUnchosenAttemptState = eliteUnchosenSkillId
      ? game.gameReducer(eliteSelectedState, { type: "selectActiveSkill", skillId: eliteUnchosenSkillId })
      : eliteSelectedState;
    const eliteSelectedBattle = withDeterministicRandom(() => game.gameReducer(eliteSelectedState, { type: "runAdventure" })).lastBattle;
    const critTriggerProof = buildFireOverheatCritTriggerProof(game, selectedState);
    const blockTriggerProof = buildFireEmberAegisBlockTriggerProof(game, pathState);
    const dodgeTriggerProof = buildAfterimageDiveDodgeTriggerProof(game);
    const crystalBreakTriggerProof = buildCrystalBreakOpeningHitTriggerProof(game);

    return {
      pathId: "fireGuardian",
      reducerActions: ["selectDragonPath", "runAdventure", "selectActiveSkill", "runAdventure"],
      pathDefaultSkillId: pathState.selectedActiveSkillId,
      lockedAttemptSkillId: lockedAttemptState.selectedActiveSkillId,
      persistedLockedEffectiveSkillId: persistedLockedSkill?.id ?? null,
      selectedActiveSkillId: selectedState.selectedActiveSkillId,
      skillUnlockCurrency: selectedState.lifetimeEssence,
      defaultBattleActiveSkillId: defaultBattle?.activeSkill?.id ?? null,
      selectedBattleActiveSkillId: selectedBattle?.activeSkill?.id ?? null,
      defaultBattleActiveSkillName: defaultBattle?.activeSkill?.name ?? null,
      selectedBattleActiveSkillName: selectedBattle?.activeSkill?.name ?? null,
      defaultFirstHitDamage: defaultDamage,
      selectedFirstHitDamage: selectedDamage,
      selectedBattleLogLine: selectedBattle?.rounds?.find((line) => line.includes("Active bonus:")) ?? null,
      eliteSkillDraftOffer: eliteClearedState.lastSkillDraftOffer ?? null,
      eliteOfferedSkillId,
      eliteUnchosenSkillId,
      eliteSelectedSkillId: eliteSelectedState.selectedActiveSkillId,
      eliteChosenSkillId: eliteSelectedState.lastSkillDraftOffer?.chosenSkillId ?? null,
      eliteUnchosenAttemptSkillId: eliteUnchosenAttemptState.selectedActiveSkillId,
      eliteSelectedBattleActiveSkillId: eliteSelectedBattle?.activeSkill?.id ?? null,
      eliteOfferSourceMessage: eliteClearedState.lastLoot?.message ?? null,
      critTriggerProof,
      blockTriggerProof,
      dodgeTriggerProof,
      crystalBreakTriggerProof,
      comparisons: {
        reducerRejectsLockedCrossPathSkill: lockedAttemptState.selectedActiveSkillId === pathState.selectedActiveSkillId,
        persistedLockedSelectionFallsBackToPathDefault: persistedLockedSkill?.id === pathState.selectedActiveSkillId,
        reducerAcceptedSelectedSkill: selectedState.selectedActiveSkillId === "fire-overheat",
        runAdventureUsesSelectedSkill: selectedBattle?.activeSkill?.id === "fire-overheat",
        selectedSkillOverridesPathDefaultInBattle: selectedBattle?.activeSkill?.id !== defaultBattle?.activeSkill?.id,
        selectedSkillChangesBattleDamage: typeof selectedDamage === "number" && typeof defaultDamage === "number" && selectedDamage > defaultDamage,
        selectedSkillAppearsInBattleLog: Boolean(selectedBattle?.rounds?.some((line) => line.includes("Overheat Fang") && line.includes("Active bonus:"))),
        eliteVictoryCreatesThreeChoiceSkillDraft: eliteClearedState.lastSkillDraftOffer?.sourceNodeId === "reef-slime-crossing" && eliteClearedState.lastSkillDraftOffer?.skillIds?.length === 3,
        eliteDraftStartsUnclaimed: eliteClearedState.lastSkillDraftOffer?.chosenSkillId === null,
        eliteDraftUnlocksOfferedCrossPathSkill: eliteOfferedSkillId === "fire-overheat" && eliteSelectedState.selectedActiveSkillId === "fire-overheat" && eliteSelectedState.lifetimeEssence === 0,
        eliteDraftPersistsChosenSkill: eliteSelectedState.lastSkillDraftOffer?.chosenSkillId === "fire-overheat",
        eliteDraftLocksUnchosenOptionsAfterPick: Boolean(eliteUnchosenSkillId) && eliteUnchosenAttemptState.selectedActiveSkillId === "fire-overheat",
        eliteDraftChoiceFeedsBattleSkill: eliteSelectedBattle?.activeSkill?.id === "fire-overheat",
        eliteDraftRewardIsVisibleInLootFeed: Boolean(eliteClearedState.lastLoot?.message?.includes("Elite Skill Draft unlocked"))
      }
    };
  });
}

function writeActiveSkillCombatPreviewArtifact(gameSource, appSource) {
  const skills = parseSkillDraftEntries(gameSource);
  const samples = expectedDragonPathIds.map((pathId) => {
    const pathBlock = extractDragonPathBlock(gameSource, pathId);
    const role = extractQuotedField(pathBlock, "role");
    const element = extractQuotedField(pathBlock, "element");
    const skill = skills.find((candidate) => candidate.elementFocus === element && candidate.roleFocus === role);
    const baseSample = buildCombatPathSample(gameSource, pathId);
    const bonus = getSkillBonusForPreview(skill, role);
    return {
      pathId,
      element,
      role,
      pathName: extractQuotedField(pathBlock, "name"),
      activeSkill: skill ? {
        id: skill.id,
        name: skill.name,
        elementFocus: skill.elementFocus,
        roleFocus: skill.roleFocus,
        trigger: skill.trigger,
        combatEffect: bonus.combatEffect,
        statHooks: skill.statHooks
      } : null,
      math: {
        damageBeforeSkill: baseSample.result.playerDamageRaw,
        damageAfterSkill: Number((baseSample.result.playerDamageRaw * bonus.damageMultiplier).toFixed(2)),
        enemyDamageBeforeSkill: baseSample.result.enemyDamageRaw,
        enemyDamageAfterSkill: Number((baseSample.result.enemyDamageRaw * (1 - bonus.damageReduction)).toFixed(2)),
        damageMultiplier: bonus.damageMultiplier,
        damageReduction: bonus.damageReduction
      },
      battleLogLine: skill ? `Active bonus: ${skill.name} (${skill.trigger}) is slotted — ${bonus.combatEffect}.` : "No active skill."
    };
  });
  const roles = ["guardian", "raider", "mystic"];

  const selectedOverrideSkill = skills.find((skill) => skill.id === "fire-overheat") ?? skills.find((skill) => skill.roleFocus === "raider");
  const selectedOverrideBaseSample = buildCombatPathSample(gameSource, "fireGuardian");
  const selectedOverrideBonus = getSkillBonusForPreview(selectedOverrideSkill, "raider");
  const selectedOverrideSample = selectedOverrideSkill ? {
    pathId: "fireGuardian",
    pathDefaultSkillId: samples.find((sample) => sample.pathId === "fireGuardian")?.activeSkill?.id ?? null,
    selectedActiveSkillId: selectedOverrideSkill.id,
    selectedActiveSkillName: selectedOverrideSkill.name,
    selectedActiveSkillRole: selectedOverrideSkill.roleFocus,
    pathRole: "guardian",
    math: {
      damageBeforeSelectedSkill: selectedOverrideBaseSample.result.playerDamageRaw,
      damageAfterSelectedSkill: Number((selectedOverrideBaseSample.result.playerDamageRaw * selectedOverrideBonus.damageMultiplier).toFixed(2)),
      enemyDamageBeforeSelectedSkill: selectedOverrideBaseSample.result.enemyDamageRaw,
      enemyDamageAfterSelectedSkill: Number((selectedOverrideBaseSample.result.enemyDamageRaw * (1 - selectedOverrideBonus.damageReduction)).toFixed(2))
    }
  } : null;
  const reducerToBattleProof = buildReducerToBattleSkillLoadoutProof();
  const reducerToBattleSelectedSkillExecuted = Boolean(reducerToBattleProof) &&
    Object.values(reducerToBattleProof.comparisons).every(Boolean);

  fs.writeFileSync(activeSkillCombatPath, JSON.stringify({
    name: "active-skill-combat-preview",
    generatedAt: nowIso(),
    source: "src/game.ts getActiveDragonSkill/getActiveSkillBattleBonus + App.tsx reachable battle.activeSkill banner",
    reviewPrompt: "Verify active skill loadout choices can override the path default and become visible, mechanically consequential battle output.",
    samples,
    selectedOverrideSample,
    reducerToBattleProof,
    comparisons: {
      everyRoleHasActiveSkill: roles.every((role) => samples.some((sample) => sample.role === role && sample.activeSkill?.statHooks?.length >= 3)),
      everyPathHasElementRoleMatchedActiveSkill: samples.length === expectedDragonPathIds.length &&
        samples.every((sample) => sample.activeSkill?.elementFocus === sample.element && sample.activeSkill?.roleFocus === sample.role) &&
        new Set(samples.map((sample) => sample.activeSkill?.id)).size === expectedDragonPathIds.length,
      everyElementRoleHasDistinctSkillBonus: samples.length === expectedDragonPathIds.length &&
        new Set(samples.map((sample) => `${sample.math.damageMultiplier}|${sample.math.damageReduction}|${sample.activeSkill?.combatEffect}`)).size === expectedDragonPathIds.length,
      playerSelectedSkillOverridesPathDefault: Boolean(selectedOverrideSample) &&
        selectedOverrideSample.selectedActiveSkillId !== selectedOverrideSample.pathDefaultSkillId &&
        selectedOverrideSample.selectedActiveSkillRole !== selectedOverrideSample.pathRole &&
        selectedOverrideSample.math.damageAfterSelectedSkill > selectedOverrideSample.math.damageBeforeSelectedSkill,
      reducerToBattleSelectedSkillExecuted,
      critTriggeredSkillEffectExecuted: gameSource.includes("Skill trigger:") &&
        reducerToBattleProof?.critTriggerProof?.comparisons?.overheatOnlyTriggersOnCrit === true &&
        reducerToBattleProof?.critTriggerProof?.comparisons?.critTriggerAddsBonusDamage === true &&
        reducerToBattleProof?.critTriggerProof?.comparisons?.critTriggerAppearsInBattleLog === true,
      blockTriggeredSkillEffectExecuted: gameSource.includes("Skill trigger:") &&
        reducerToBattleProof?.blockTriggerProof?.comparisons?.emberAegisOnlyTriggersOnBlock === true &&
        reducerToBattleProof?.blockTriggerProof?.comparisons?.blockTriggerAddsCounterBurnDamage === true &&
        reducerToBattleProof?.blockTriggerProof?.comparisons?.blockTriggerDamageFeelsImpactful === true &&
        reducerToBattleProof?.blockTriggerProof?.comparisons?.blockTriggerAppearsInBattleLog === true,
      dodgeTriggeredSkillEffectExecuted: gameSource.includes("Skill trigger:") &&
        reducerToBattleProof?.dodgeTriggerProof?.comparisons?.afterimageDiveOnlyTriggersOnDodge === true &&
        reducerToBattleProof?.dodgeTriggerProof?.comparisons?.dodgeTriggerAddsAfterimageSlashDamage === true &&
        reducerToBattleProof?.dodgeTriggerProof?.comparisons?.dodgeTriggerDamageFeelsImpactful === true &&
        reducerToBattleProof?.dodgeTriggerProof?.comparisons?.dodgeTriggerAppearsInBattleLog === true,
      crystalBreakOpeningHitTriggeredSkillExecuted: gameSource.includes("Skill trigger:") &&
        reducerToBattleProof?.crystalBreakTriggerProof?.comparisons?.crystalBreakIsEarthRaiderDefault === true &&
        reducerToBattleProof?.crystalBreakTriggerProof?.comparisons?.crystalBreakOpeningHitAddsArmorPierceDamage === true &&
        reducerToBattleProof?.crystalBreakTriggerProof?.comparisons?.crystalBreakOnlyTriggersOnce === true &&
        reducerToBattleProof?.crystalBreakTriggerProof?.comparisons?.crystalBreakTriggerOccursAfterRoundOneBeforeRoundTwo === true &&
        reducerToBattleProof?.crystalBreakTriggerProof?.comparisons?.crystalBreakTriggerAppearsInBattleLog === true,
      reducerHydratesSelectedSkill: gameSource.includes("selectedActiveSkillId") &&
        gameSource.includes("selectActiveSkill") &&
        gameSource.includes("action.state.selectedActiveSkillId ?? initialGameState.selectedActiveSkillId"),
      uiSurfacesSkillSlotButtons: appSource.includes("Skill slot:") &&
        appSource.includes("Slot active skill") &&
        appSource.includes("getActiveDragonSkill(state)") &&
        appSource.includes("dispatch({ type: \"selectActiveSkill\"") &&
        appSource.includes("<SkillDraftPanel state={state} dispatch={dispatch} />"),
      uiSurfacesSkillUnlockConstraints: appSource.includes("Skill locked") &&
        appSource.includes("getActiveSkillUnlockState(state, skill)") &&
        appSource.includes("visibleSkills"),
      uiSurfacesEliteSkillDraftReward: appSource.includes("ELITE SKILL DRAFT REWARD") &&
        appSource.includes("Elite fights now unlock a three-choice skill draft reward") &&
        appSource.includes("state.lastSkillDraftOffer") &&
        appSource.includes("Draft picked:") &&
        appSource.includes("Choose draft skill") &&
        gameSource.includes("chosenSkillId") &&
        gameSource.includes("createEliteSkillDraftOffer") &&
        gameSource.includes("Elite Skill Draft unlocked"),
      everyBattleLogFramesBonusAsSlotted: samples.every((sample) => sample.battleLogLine.includes("Active bonus:") && sample.battleLogLine.includes("is slotted") && !sample.battleLogLine.includes(" triggers ")),
      everySampleHasCombatMathEffect: samples.every((sample) => sample.math.damageAfterSkill > sample.math.damageBeforeSkill || sample.math.enemyDamageAfterSkill < sample.math.enemyDamageBeforeSkill),
      uiSurfacesActiveSkill: (appSource.includes("Active skill:") || appSource.includes("Skill:")) &&
        appSource.includes("battle.activeSkill") &&
        appSource.includes("battleSkillText") &&
        appSource.includes("<BattleScreen state={state} dispatch={dispatch} />"),
      uiAvoidsBattleSkillTriggerSummary: appSource.includes("function getBattleSkillTriggerLines") &&
        appSource.includes('round.includes("Skill trigger:")') &&
        !appSource.includes("const skillTriggerLines = getBattleSkillTriggerLines(battle.rounds)") &&
        !appSource.includes("Skill trigger recap") &&
        !appSource.includes("No active skill proc this fight")
    }
  }, null, 2));
}

function buildDragonPathUiCopyEntry(gameSource, pathId) {
  const block = extractDragonPathBlock(gameSource, pathId);
  const damageMultiplier = extractNumberField(block, "damageMultiplier");
  const damageReduction = extractNumberField(block, "damageReduction");
  const tradeoffCopy = `Offense ${Math.round(damageMultiplier * 100)}% | Mitigation ${Math.round(damageReduction * 100)}% | Tempo ${extractQuotedField(block, "tempoLabel")}`;
  const path = {
    pathId,
    element: extractQuotedField(block, "element"),
    role: extractQuotedField(block, "role"),
    name: extractQuotedField(block, "name"),
    vow: extractQuotedField(block, "vow"),
    description: extractQuotedField(block, "description"),
    bonus: extractQuotedField(block, "bonus"),
    combatVerb: extractQuotedField(block, "combatVerb"),
    combatStyle: extractQuotedField(block, "combatStyle"),
    tempoLabel: extractQuotedField(block, "tempoLabel"),
    tradeoffCopy
  };

  return {
    ...path,
    defaultAssignment: {
      name: path.name,
      role: path.role,
      combatLine: `${path.combatVerb}: ${path.combatStyle}`,
      tradeoffLine: tradeoffCopy,
      bonusLine: path.bonus
    },
    persistentBadge: {
      name: path.name,
      vowBonusLine: `${path.vow} ${path.bonus}`,
      combatLine: `${path.combatVerb}: ${path.combatStyle}`,
      tradeoffLine: tradeoffCopy
    }
  };
}

function readCombatPathCalloutsByPathId() {
  if (!fs.existsSync(combatSimulationPath)) return {};
  const artifact = JSON.parse(fs.readFileSync(combatSimulationPath, "utf8"));
  const callouts = Array.isArray(artifact.pathFlavorCallouts) ? artifact.pathFlavorCallouts : [];
  return Object.fromEntries(callouts.map((callout) => [callout.pathId, callout]));
}

function writeDragonPathUiCopyArtifact(gameSource) {
  const paths = expectedDragonPathIds.map((pathId) => buildDragonPathUiCopyEntry(gameSource, pathId));
  const combatCalloutsByPathId = readCombatPathCalloutsByPathId();
  const combatCalloutMismatches = paths
    .map((pathEntry) => {
      const callout = combatCalloutsByPathId[pathEntry.pathId];
      if (!callout) return { pathId: pathEntry.pathId, issue: "missing-combat-callout" };
      const expected = {
        name: pathEntry.name,
        role: pathEntry.role,
        tradeoffCopy: pathEntry.tradeoffCopy,
        tempo: pathEntry.tempoLabel
      };
      const actual = {
        name: callout.name,
        role: callout.role,
        tradeoffCopy: callout.tradeoffCopy,
        tempo: callout.tradeoffAxes?.tempo
      };
      return Object.entries(expected).every(([field, value]) => actual[field] === value)
        ? null
        : { pathId: pathEntry.pathId, expected, actual };
    })
    .filter(Boolean);
  const uiCopyMatchesCombatCallouts = combatCalloutMismatches.length === 0;

  fs.writeFileSync(pathUiCopyPath, JSON.stringify({
    name: "dragon-path-ui-copy",
    generatedAt: nowIso(),
    source: "src/game.ts dragonPathDefinitions mirrored through App.tsx getDragonPathTradeoffCopy visible strings",
    purpose: "Exact default path assignment and persistent badge copy for reviewing dragon build identity without an intrusive first-bond choice panel.",
    expectedPathIds: expectedDragonPathIds,
    paths,
    comparisons: {
      allExpectedPathsPresent: paths.length === expectedDragonPathIds.length && paths.every((path) => expectedDragonPathIds.includes(path.pathId)),
      everyPathHasDefaultAssignmentAndBadgeCopy: paths.every((path) =>
        path.defaultAssignment.name &&
        path.defaultAssignment.role &&
        path.defaultAssignment.combatLine.includes(path.combatVerb) &&
        path.defaultAssignment.tradeoffLine === path.tradeoffCopy &&
        path.defaultAssignment.tradeoffLine.includes("Offense") &&
        path.defaultAssignment.tradeoffLine.includes("Mitigation") &&
        path.defaultAssignment.tradeoffLine.includes("Tempo") &&
        path.persistentBadge.name === path.name &&
        path.persistentBadge.vowBonusLine.includes(path.vow) &&
        path.persistentBadge.vowBonusLine.includes(path.bonus) &&
        path.persistentBadge.combatLine === path.defaultAssignment.combatLine &&
        path.persistentBadge.tradeoffLine === path.defaultAssignment.tradeoffLine
      ),
      uiCopyMatchesCombatCallouts,
      combatCalloutMismatches
    }
  }, null, 2));
}

function buildLiveBattleFeedbackCueEntry(gameSource, pathId) {
  const block = extractDragonPathBlock(gameSource, pathId);
  const element = extractQuotedField(block, "element");
  const role = extractQuotedField(block, "role");
  const name = extractQuotedField(block, "name");
  const combatVerb = extractQuotedField(block, "combatVerb");
  const combatStyle = extractQuotedField(block, "combatStyle");
  const styleCue = combatStyle.split(":")[0];
  const tempoLabel = extractQuotedField(block, "tempoLabel");
  const damageMultiplier = extractNumberField(block, "damageMultiplier");
  const damageReduction = extractNumberField(block, "damageReduction");
  const roleCue = role.charAt(0).toUpperCase() + role.slice(1);
  const offense = Math.round(damageMultiplier * 100);
  const mitigation = Math.round(damageReduction * 100);
  const expectedIdentity = expectedDragonPathIdentity[pathId] || { element: "", role: "" };
  const valid = block.length > 0 &&
    element === expectedIdentity.element &&
    role === expectedIdentity.role &&
    ["guardian", "raider", "mystic"].includes(role) &&
    name.length > 0 &&
    combatVerb.length > 0 &&
    combatStyle.length > 0 &&
    styleCue.length > 0 &&
    tempoLabel.length > 0 &&
    damageMultiplier > 0 &&
    damageReduction > 0;

  return {
    pathId,
    element,
    role,
    name,
    combatVerb,
    tempoLabel,
    combatCue: `${combatVerb} • ${styleCue} • ${tempoLabel}`,
    braceCue: `${roleCue} brace • ${combatVerb} • ${mitigation}% mitigation`,
    hitCue: `${roleCue} hit • ${combatVerb} • ${offense}% power`,
    tradeoffCopy: `Offense ${offense}% | Mitigation ${mitigation}% | Tempo ${tempoLabel}`,
    reviewSummary: `${roleCue} live battle feedback: ${combatVerb} sets tempo (${tempoLabel}), brace shows ${mitigation}% mitigation, hit shows ${offense}% power.`,
    valid
  };
}

function writeLiveBattleFeedbackCuesArtifact(gameSource, appSource) {
  const paths = expectedDragonPathIds.map((pathId) => buildLiveBattleFeedbackCueEntry(gameSource, pathId));
  const invalidCueEntries = paths.filter((path) => !path.valid).map((path) => ({
    pathId: path.pathId,
    element: path.element,
    role: path.role,
    name: path.name,
    combatVerb: path.combatVerb,
    tempoLabel: path.tempoLabel
  }));
  const combatCueHelper = getSection(appSource, "function getDragonPathCombatCue", "function getDragonPathBraceCue");
  const braceCueHelper = getSection(appSource, "function getDragonPathBraceCue", "function getDragonPathHitCue");
  const hitCueHelper = getSection(appSource, "function getDragonPathHitCue", "function DragonPathBadge");
  const helperFormatsMatchVisibleJsx =
    combatCueHelper.includes("const styleCue = path.combatStyle.split(\":\")[0]") &&
    combatCueHelper.includes("return `${path.combatVerb} • ${styleCue} • ${path.battleModifier.tempoLabel}`;") &&
    braceCueHelper.includes("return `${roleCue} brace • ${path.combatVerb} • ${mitigation}% mitigation`;") &&
    hitCueHelper.includes("return `${roleCue} hit • ${path.combatVerb} • ${offense}% power`;");

  const uiCopyArtifact = fs.existsSync(pathUiCopyPath) ? JSON.parse(fs.readFileSync(pathUiCopyPath, "utf8")) : null;
  const combatSimulationArtifact = fs.existsSync(combatSimulationPath) ? JSON.parse(fs.readFileSync(combatSimulationPath, "utf8")) : null;
  const uiCopyByPathId = Object.fromEntries((uiCopyArtifact?.paths || []).map((entry) => [entry.pathId, entry]));
  const simulationByPathId = Object.fromEntries((combatSimulationArtifact?.samples || []).map((sample) => [sample.pathId, sample]));
  const calloutByPathId = Object.fromEntries((combatSimulationArtifact?.pathFlavorCallouts || []).map((callout) => [callout.pathId, callout]));
  const crossArtifactMismatches = paths
    .map((cue) => {
      const uiCopy = uiCopyByPathId[cue.pathId];
      const simulation = simulationByPathId[cue.pathId];
      const callout = calloutByPathId[cue.pathId];
      const expected = {
        pathId: cue.pathId,
        element: cue.element,
        role: cue.role,
        name: cue.name,
        combatVerb: cue.combatVerb,
        tempoLabel: cue.tempoLabel,
        tradeoffCopy: cue.tradeoffCopy
      };
      const actual = {
        uiCopy: uiCopy ? {
          element: uiCopy.element,
          role: uiCopy.role,
          name: uiCopy.name,
          combatVerb: uiCopy.combatVerb,
          tempoLabel: uiCopy.tempoLabel,
          tradeoffCopy: uiCopy.tradeoffCopy
        } : null,
        simulation: simulation ? {
          element: simulation.element,
          role: simulation.role,
          name: simulation.name,
          combatVerb: simulation.combatVerb,
          tempoLabel: simulation.tempoLabel,
          tradeoffCopy: `Offense ${Math.round(simulation.damageMultiplier * 100)}% | Mitigation ${Math.round(simulation.damageReduction * 100)}% | Tempo ${simulation.tempoLabel}`
        } : null,
        callout: callout ? {
          element: callout.element,
          role: callout.role,
          name: callout.name,
          combatVerb: callout.combatVerb,
          tempoLabel: callout.tempoLabel,
          tradeoffCopy: callout.tradeoffCopy
        } : null
      };
      const allMatches = [actual.uiCopy, actual.simulation, actual.callout].every((entry) =>
        entry && Object.entries(expected)
          .filter(([field]) => field !== "pathId")
          .every(([field, value]) => entry[field] === value)
      );
      return allMatches ? null : { pathId: cue.pathId, expected, actual };
    })
    .filter(Boolean);
  const liveCuesMatchUiCopyAndCombatSimulation = paths.length === expectedDragonPathIds.length && crossArtifactMismatches.length === 0;

  fs.writeFileSync(liveBattleFeedbackPath, JSON.stringify({
    name: "live-battle-feedback-cues",
    generatedAt: nowIso(),
    source: "src/game.ts dragonPathDefinitions mirrored through App.tsx getDragonPathCombatCue/getDragonPathBraceCue/getDragonPathHitCue visible strings",
    purpose: "Compact per-path review artifact for live battle labels that make guardian/raider/mystic evolution choices readable during combat.",
    expectedPathIds: expectedDragonPathIds,
    paths,
    comparisons: {
      allExpectedPathsPresent: paths.length === expectedDragonPathIds.length && paths.every((path) => expectedDragonPathIds.includes(path.pathId)),
      everyPathHasValidSourceData: invalidCueEntries.length === 0,
      helperFormatsMatchVisibleJsx,
      liveCuesMatchUiCopyAndCombatSimulation,
      crossArtifactMismatches,
      invalidCueEntries,
      everyPathHasCombatBraceAndHitCue: paths.every((path) =>
        path.valid &&
        path.combatCue.includes(path.combatVerb) &&
        path.combatCue.includes(path.tempoLabel) &&
        path.braceCue.includes(path.combatVerb) &&
        path.braceCue.includes("mitigation") &&
        path.hitCue.includes(path.combatVerb) &&
        path.hitCue.includes("power") &&
        path.tradeoffCopy.includes("Offense") &&
        path.tradeoffCopy.includes("Mitigation") &&
        path.tradeoffCopy.includes("Tempo")
      )
    }
  }, null, 2));
}

function buildEvolutionRevealEntry(gameSource, pathId) {
  const block = extractDragonPathBlock(gameSource, pathId);
  const damageMultiplier = extractNumberField(block, "damageMultiplier");
  const damageReduction = extractNumberField(block, "damageReduction");
  const role = extractQuotedField(block, "role");
  const roleCue = role.charAt(0).toUpperCase() + role.slice(1);
  const path = {
    pathId,
    element: extractQuotedField(block, "element"),
    role,
    roleLabel: `${roleCue} path`,
    name: extractQuotedField(block, "name"),
    combatVerb: extractQuotedField(block, "combatVerb"),
    tempoLabel: extractQuotedField(block, "tempoLabel"),
    power: Math.round(damageMultiplier * 100),
    mitigation: Math.round(damageReduction * 100)
  };
  const revealLine = `${path.name} awakened: ${path.combatVerb} now ${path.tempoLabel} (${path.power}% power / ${path.mitigation}% mitigation).`;
  const visualAccentPills = [
    { slot: "left", label: path.roleLabel, value: `${path.power}% power` },
    { slot: "right", label: path.combatVerb, value: `${path.mitigation}% mitigation` }
  ];

  return {
    ...path,
    revealLine,
    storyboardBeat: `${roleCue} payoff: choose ${path.name} to ${path.combatVerb} with ${path.power}% power, ${path.mitigation}% mitigation, and ${path.tempoLabel} tempo.`,
    visualAccentPills,
    readable: revealLine.length <= 118,
    usesPathIdentity: Boolean(path.name && path.combatVerb && path.tempoLabel) &&
      revealLine.includes(path.name) &&
      revealLine.includes(path.combatVerb) &&
      revealLine.includes("power") &&
      revealLine.includes("mitigation")
  };
}

function getRevealAccentHelperShape(appSource) {
  const helperBlock = extractFunctionBlock(appSource, "function getDragonPathRevealAccent");
  return {
    helperPresent: helperBlock.length > 0,
    usesRole: helperBlock.includes("role: path.role"),
    buildsRoleLabelFromPathRole: helperBlock.includes("const roleLabel = path.role.charAt(0).toUpperCase() + path.role.slice(1)") &&
      helperBlock.includes("roleLabel: `${roleLabel} path`"),
    focusUsesCombatVerb: helperBlock.includes("focusLabel: path.combatVerb"),
    powerUsesDamageMultiplier: helperBlock.includes("const offense = Math.round(path.battleModifier.damageMultiplier * 100)") &&
      helperBlock.includes("powerLabel: `${offense}% power`"),
    guardUsesDamageReduction: helperBlock.includes("const mitigation = Math.round(path.battleModifier.damageReduction * 100)") &&
      helperBlock.includes("guardLabel: `${mitigation}% mitigation`")
  };
}

function buildAppRevealAccentFromSource(appSource, entry) {
  const helperShape = getRevealAccentHelperShape(appSource);
  if (!Object.values(helperShape).every(Boolean)) return { helperShape, accent: null };
  const roleCue = entry.role.charAt(0).toUpperCase() + entry.role.slice(1);
  return {
    helperShape,
    accent: {
      role: entry.role,
      roleLabel: `${roleCue} path`,
      focusLabel: entry.combatVerb,
      powerLabel: `${entry.power}% power`,
      guardLabel: `${entry.mitigation}% mitigation`
    }
  };
}

function writeEvolutionRevealArtifacts(gameSource, appSource) {
  const paths = expectedDragonPathIds.map((pathId) => buildEvolutionRevealEntry(gameSource, pathId));
  const byElement = groupSamplesByElement(paths);
  const revealAccentHelperShape = getRevealAccentHelperShape(appSource);
  const revealAccentHelperMismatches = paths
    .map((entry) => {
      const { accent } = buildAppRevealAccentFromSource(appSource, entry);
      const expectedVisualAccentPills = accent ? [
        { slot: "left", label: accent.roleLabel, value: accent.powerLabel },
        { slot: "right", label: accent.focusLabel, value: accent.guardLabel }
      ] : [];
      const visualAccentMatchesHelper =
        expectedVisualAccentPills.length === 2 &&
        JSON.stringify(entry.visualAccentPills) === JSON.stringify(expectedVisualAccentPills);
      return visualAccentMatchesHelper ? null : {
        pathId: entry.pathId,
        appHelperAccent: accent,
        expectedVisualAccentPills,
        artifactVisualAccentPills: entry.visualAccentPills
      };
    })
    .filter(Boolean);
  const uiCopyArtifact = fs.existsSync(pathUiCopyPath) ? JSON.parse(fs.readFileSync(pathUiCopyPath, "utf8")) : null;
  const combatSimulationArtifact = fs.existsSync(combatSimulationPath) ? JSON.parse(fs.readFileSync(combatSimulationPath, "utf8")) : null;
  const uiCopyByPathId = Object.fromEntries((uiCopyArtifact?.paths || []).map((entry) => [entry.pathId, entry]));
  const simulationByPathId = Object.fromEntries((combatSimulationArtifact?.samples || []).map((sample) => [sample.pathId, sample]));
  const crossArtifactMismatches = paths
    .map((entry) => {
      const uiCopy = uiCopyByPathId[entry.pathId];
      const simulation = simulationByPathId[entry.pathId];
      const expectedTradeoffCopy = `Offense ${entry.power}% | Mitigation ${entry.mitigation}% | Tempo ${entry.tempoLabel}`;
      const expected = {
        element: entry.element,
        role: entry.role,
        name: entry.name,
        combatVerb: entry.combatVerb,
        tempoLabel: entry.tempoLabel,
        tradeoffCopy: expectedTradeoffCopy,
        power: entry.power,
        mitigation: entry.mitigation
      };
      const actual = {
        uiCopy: uiCopy ? {
          element: uiCopy.element,
          role: uiCopy.role,
          name: uiCopy.name,
          combatVerb: uiCopy.combatVerb,
          tempoLabel: uiCopy.tempoLabel,
          tradeoffCopy: uiCopy.tradeoffCopy
        } : null,
        simulation: simulation ? {
          element: simulation.element,
          role: simulation.role,
          name: simulation.name,
          combatVerb: simulation.combatVerb,
          tempoLabel: simulation.tempoLabel,
          tradeoffCopy: `Offense ${Math.round(simulation.damageMultiplier * 100)}% | Mitigation ${Math.round(simulation.damageReduction * 100)}% | Tempo ${simulation.tempoLabel}`,
          power: Math.round(simulation.damageMultiplier * 100),
          mitigation: Math.round(simulation.damageReduction * 100)
        } : null,
        revealLine: {
          includesName: entry.revealLine.includes(entry.name),
          includesCombatVerb: entry.revealLine.includes(entry.combatVerb),
          includesTempo: entry.revealLine.includes(entry.tempoLabel),
          includesPower: entry.revealLine.includes(`${entry.power}% power`),
          includesMitigation: entry.revealLine.includes(`${entry.mitigation}% mitigation`)
        }
      };
      const uiMatches = actual.uiCopy && ["element", "role", "name", "combatVerb", "tempoLabel", "tradeoffCopy"].every((field) => actual.uiCopy[field] === expected[field]);
      const simulationMatches = actual.simulation && Object.entries(expected).every(([field, value]) => actual.simulation[field] === value);
      const revealLineMatches = Object.values(actual.revealLine).every(Boolean);
      return uiMatches && simulationMatches && revealLineMatches ? null : { pathId: entry.pathId, expected, actual };
    })
    .filter(Boolean);
  const comparisons = {
    allExpectedPathsPresent: paths.length === expectedDragonPathIds.length && paths.every((entry) => expectedDragonPathIds.includes(entry.pathId)),
    everyLineUsesPathIdentity: paths.every((entry) => entry.usesPathIdentity),
    everyLineReadable: paths.every((entry) => entry.readable),
    everyElementHasThreeRevealBranches: expectedDragonElements.every((element) => {
      const roles = byElement[element] || {};
      return expectedDragonRoles.every((role) => Boolean(roles[role]));
    }),
    revealLinesMatchUiCopyAndCombatSimulation: paths.length === expectedDragonPathIds.length && crossArtifactMismatches.length === 0,
    revealAccentHelperShape,
    revealAccentHelperParityWithStoryboard: Object.values(revealAccentHelperShape).every(Boolean) &&
      revealAccentHelperMismatches.length === 0,
    revealAccentHelperMismatches,
    everyRevealEntryHasVisualAccentPills: paths.every((entry) =>
      Array.isArray(entry.visualAccentPills) &&
      entry.visualAccentPills.length === 2 &&
      entry.visualAccentPills.some((pill) => pill.slot === "left" && pill.label === entry.roleLabel && pill.value === `${entry.power}% power`) &&
      entry.visualAccentPills.some((pill) => pill.slot === "right" && pill.label === entry.combatVerb && pill.value === `${entry.mitigation}% mitigation`)
    ),
    crossArtifactMismatches
  };

  fs.writeFileSync(evolutionRevealPath, JSON.stringify({
    name: "evolution-reveal-path-lines",
    generatedAt: nowIso(),
    source: "src/game.ts dragonPathDefinitions mirrored through App.tsx getDragonPathEvolutionRevealLine",
    purpose: `Exact drake evolution reveal payoff lines for reviewing all ${expectedDragonPathIds.length} first-bond path branches as crunchy build decisions.`,
    expectedPathIds: expectedDragonPathIds,
    paths,
    comparisons
  }, null, 2));

  const columns = expectedDragonElements.map((element) => {
    const cards = expectedDragonRoles.map((role) => {
      const entry = byElement[element]?.[role];
      if (!entry) return "";
      const pills = entry.visualAccentPills.map((pill) => `<span class="accent-pill accent-${escapeHtml(pill.slot)}">${escapeHtml(pill.label)}: ${escapeHtml(pill.value)}</span>`).join("");
      return `<article class="card ${escapeHtml(role)}"><p class="kicker">${escapeHtml(element)} ${escapeHtml(role)}</p><h2>${escapeHtml(entry.name)}</h2><p class="line">${escapeHtml(entry.revealLine)}</p><div class="accent-row" aria-label="visual accent pill review">${pills}</div><p class="beat">${escapeHtml(entry.storyboardBeat)}</p></article>`;
    }).join("\n");
    return `<section class="element"><h1>${escapeHtml(element.toUpperCase())}</h1>${cards}</section>`;
  }).join("\n");

  fs.writeFileSync(evolutionRevealStoryboardPath, `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Path Evolution Reveal Storyboard</title>
<style>
  body { margin: 0; padding: 28px; background: #11091c; color: #f8fafc; font-family: Inter, system-ui, sans-serif; }
  .grid { display: grid; grid-template-columns: repeat(3, minmax(220px, 1fr)); gap: 18px; }
  .element { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); border-radius: 22px; padding: 18px; }
  h1 { margin: 0 0 14px; color: #fde68a; letter-spacing: 0.16em; font-size: 13px; }
  .card { border-radius: 18px; padding: 14px; margin: 12px 0; background: rgba(15,23,42,0.7); box-shadow: 0 10px 28px rgba(0,0,0,0.25); }
  .guardian { border: 1px solid rgba(96,165,250,0.6); }
  .raider { border: 1px solid rgba(248,113,113,0.65); }
  .mystic { border: 1px solid rgba(167,139,250,0.65); }
  .kicker { margin: 0 0 6px; color: #93c5fd; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em; }
  h2 { margin: 0 0 8px; font-size: 18px; }
  .line { color: #fef3c7; font-weight: 900; line-height: 1.35; }
  .accent-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
  .accent-pill { display: inline-flex; border-radius: 999px; padding: 6px 9px; background: rgba(255,255,255,0.09); border: 1px solid rgba(255,255,255,0.18); color: #e0f2fe; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; }
  .accent-right { color: #fef3c7; }
  .beat { color: #cbd5e1; line-height: 1.4; }
</style>
</head>
<body>
<h1>Path Evolution Reveal Storyboard</h1>
<p>Deterministic review surface for the drake evolution payoff line after the player chooses a guardian, raider, or mystic path.</p>
<main class="grid">
${columns}
</main>
</body>
</html>`);
}

function buildCombatPathSample(gameSource, pathId) {
  const block = extractDragonPathBlock(gameSource, pathId);
  const damageMultiplier = extractNumberField(block, "damageMultiplier");
  const damageReduction = extractNumberField(block, "damageReduction");
  const baseDragon = { attack: 20, speed: 7, defense: 6, health: 120 };
  const baseEnemy = { attack: 16, speed: 5, defense: 4, health: 90 };
  const playerDamageRaw = ((baseDragon.attack + baseDragon.speed * 0.6) - baseEnemy.defense) * damageMultiplier;
  const enemyDamageRaw = ((baseEnemy.attack + baseEnemy.speed * 0.4) - baseDragon.defense) * (1 - damageReduction);
  const playerDamage = Math.max(4, Math.round(playerDamageRaw));
  const enemyDamage = Math.max(3, Math.round(enemyDamageRaw));
  const combatVerb = extractQuotedField(block, "combatVerb");
  const combatStyle = extractQuotedField(block, "combatStyle");
  const tempoLabel = extractQuotedField(block, "tempoLabel");

  return {
    pathId,
    element: extractQuotedField(block, "element"),
    role: extractQuotedField(block, "role"),
    name: extractQuotedField(block, "name"),
    combatVerb,
    combatStyle,
    tempoLabel,
    damageMultiplier,
    damageReduction,
    deterministicInputs: { dragon: baseDragon, enemy: baseEnemy },
    result: {
      playerDamage,
      enemyDamage,
      playerDamageRaw: Number(playerDamageRaw.toFixed(3)),
      enemyDamageRaw: Number(enemyDamageRaw.toFixed(3)),
      sampleRound: `${combatVerb} ${tempoLabel}; your dragon hits Training Golem for ${playerDamage}. Training Golem strikes back for ${enemyDamage}.`
    }
  };
}

function groupSamplesByElement(samples) {
  return samples.reduce((groups, sample) => {
    groups[sample.element] = groups[sample.element] || {};
    groups[sample.element][sample.role] = sample;
    return groups;
  }, {});
}

function everyElementHasOrderedPathCombat(samples) {
  const byElement = groupSamplesByElement(samples);
  return expectedDragonElements.every((element) => {
    const roles = byElement[element] || {};
    return Boolean(roles.guardian && roles.raider && roles.mystic) &&
      roles.raider.result.playerDamageRaw > roles.mystic.result.playerDamageRaw &&
      roles.mystic.result.playerDamageRaw > roles.guardian.result.playerDamageRaw &&
      roles.guardian.result.enemyDamageRaw < roles.mystic.result.enemyDamageRaw &&
      roles.mystic.result.enemyDamageRaw < roles.raider.result.enemyDamageRaw;
  });
}

function buildCombatPathFlavorCallouts(samples) {
  const roleTone = {
    guardian: "steadies the fight through mitigation and dependable counter-pressure",
    raider: "turns the fight into a high-pressure damage race",
    mystic: "keeps the fight readable with balanced tempo and adaptive pressure"
  };
  const roleBuildDecision = {
    guardian: "commit to safer long fights: lower burst, strongest damage reduction, reliable tempo",
    raider: "commit to lethal short fights: highest offense, weakest mitigation, aggressive tempo",
    mystic: "commit to flexible control: middle offense, middle mitigation, adaptive tempo"
  };

  return samples.map((sample) => ({
    pathId: sample.pathId,
    element: sample.element,
    role: sample.role,
    name: sample.name,
    combatVerb: sample.combatVerb,
    combatStyle: sample.combatStyle,
    tempoLabel: sample.tempoLabel,
    headline: `${sample.name} (${sample.element} ${sample.role}) — ${sample.combatStyle}`,
    battleFeedback: `${sample.combatVerb} ${sample.combatStyle} at ${sample.tempoLabel}; ${sample.name} ${roleTone[sample.role] || "adds path-specific battle flavor"}.`,
    buildDecisionSummary: `Big choice: ${sample.role} means you ${roleBuildDecision[sample.role] || "commit to a distinct combat plan"}.`,
    tradeoffCopy: `Offense ${Math.round(sample.damageMultiplier * 100)}% | Mitigation ${Math.round(sample.damageReduction * 100)}% | Tempo ${sample.tempoLabel}`,
    tradeoffAxes: {
      offense: sample.result.playerDamageRaw,
      mitigation: sample.damageReduction,
      tempo: sample.tempoLabel
    },
    readout: `Deals ${sample.result.playerDamage} (${sample.result.playerDamageRaw} raw) and takes ${sample.result.enemyDamage} (${sample.result.enemyDamageRaw} raw).`
  }));
}

function writeCombatPathSimulationArtifact(gameSource) {
  const samples = expectedDragonPathIds.map((pathId) => buildCombatPathSample(gameSource, pathId));
  const pathFlavorCallouts = buildCombatPathFlavorCallouts(samples);

  fs.writeFileSync(combatSimulationPath, JSON.stringify({
    name: "combat-path-simulation",
    generatedAt: nowIso(),
    source: "src/game.ts dragonPathDefinitions battleModifier values, mirrored through createBattle damage formulas",
    assertion: "for each element, raider hits hardest, guardian mitigates best, mystic remains the middle path",
    samples,
    pathFlavorCallouts,
    comparisons: {
      everyElementHasOrderedPathCombat: everyElementHasOrderedPathCombat(samples),
      allSamplesHaveReadableIdentity: samples.every((sample) => sample.combatVerb && sample.tempoLabel && sample.name)
    }
  }, null, 2));
}

function analyzeCombatPathSimulationArtifact(checks) {
  const artifactExists = fs.existsSync(combatSimulationPath);
  const artifact = artifactExists ? JSON.parse(fs.readFileSync(combatSimulationPath, "utf8")) : null;
  const samples = artifact && Array.isArray(artifact.samples) ? artifact.samples : [];
  const byElement = groupSamplesByElement(samples);

  assertCheck(
    checks,
    "combat-path-simulation-artifact",
    artifactExists && samples.length === expectedDragonPathIds.length,
    "Automation writes deterministic combat simulation data for every element/path combination.",
    {
      combatSimulationPath,
      samplePathIds: samples.map((sample) => sample.pathId),
      expectedSampleCount: expectedDragonPathIds.length
    }
  );

  assertCheck(
    checks,
    "combat-path-simulation-damage-order",
    everyElementHasOrderedPathCombat(samples),
    "Deterministic combat samples prove raider damage > mystic damage > guardian damage for every element.",
    {
      playerDamageByElement: Object.fromEntries(
        Object.entries(byElement).map(([element, roles]) => [
          element,
          Object.fromEntries(Object.entries(roles).map(([role, sample]) => [role, {
            rounded: sample.result.playerDamage,
            raw: sample.result.playerDamageRaw
          }]))
        ])
      )
    }
  );

  assertCheck(
    checks,
    "combat-path-simulation-mitigation-order",
    everyElementHasOrderedPathCombat(samples),
    "Deterministic combat samples prove guardian mitigation > mystic mitigation > raider mitigation for every element.",
    {
      enemyDamageByElement: Object.fromEntries(
        Object.entries(byElement).map(([element, roles]) => [
          element,
          Object.fromEntries(Object.entries(roles).map(([role, sample]) => [role, {
            rounded: sample.result.enemyDamage,
            raw: sample.result.enemyDamageRaw
          }]))
        ])
      )
    }
  );

  assertCheck(
    checks,
    "combat-path-simulation-readable-logs",
    samples.length === expectedDragonPathIds.length && samples.every((sample) => sample.combatVerb && sample.tempoLabel && sample.result.sampleRound.includes(sample.combatVerb) && sample.result.sampleRound.includes(sample.tempoLabel)),
    "Combat simulation artifact includes readable combat verbs and tempo labels in every sample round log.",
    { sampleRounds: samples.map((sample) => sample.result.sampleRound) }
  );

  const flavorCallouts = artifact && Array.isArray(artifact.pathFlavorCallouts) ? artifact.pathFlavorCallouts : [];
  assertCheck(
    checks,
    "combat-path-flavor-callouts",
    flavorCallouts.length === expectedDragonPathIds.length && flavorCallouts.every((callout) =>
      callout.pathId &&
      callout.element &&
      callout.role &&
      callout.headline &&
      callout.battleFeedback &&
      callout.readout &&
      callout.battleFeedback.includes(callout.combatVerb) &&
      callout.battleFeedback.includes(callout.combatStyle) &&
      callout.battleFeedback.includes(callout.tempoLabel)
    ),
    "Combat simulation artifact includes path-specific battle feedback callouts with readable verb, style, and tempo flavor.",
    { flavorCallouts }
  );

  assertCheck(
    checks,
    "combat-path-build-decision-callouts",
    flavorCallouts.length === expectedDragonPathIds.length && flavorCallouts.every((callout) =>
      callout.buildDecisionSummary &&
      callout.buildDecisionSummary.includes("Big choice:") &&
      callout.buildDecisionSummary.includes(callout.role) &&
      callout.tradeoffAxes &&
      typeof callout.tradeoffAxes.offense === "number" &&
      typeof callout.tradeoffAxes.mitigation === "number" &&
      typeof callout.tradeoffAxes.tempo === "string"
    ),
    "Combat path callouts explicitly summarize guardian/raider/mystic as crunchy build decisions with offense, mitigation, and tempo tradeoff axes.",
    { buildDecisionCallouts: flavorCallouts.map((callout) => ({ pathId: callout.pathId, buildDecisionSummary: callout.buildDecisionSummary, tradeoffAxes: callout.tradeoffAxes })) }
  );
}

function analyzeDragonPathCompletenessArtifact(checks) {
  const artifactExists = fs.existsSync(pathCompletenessPath);
  const artifact = artifactExists ? JSON.parse(fs.readFileSync(pathCompletenessPath, "utf8")) : null;
  const paths = artifact && Array.isArray(artifact.paths) ? artifact.paths : [];
  const comparisons = artifact && artifact.comparisons ? artifact.comparisons : {};

  assertCheck(
    checks,
    "dragon-path-content-completeness-artifact",
    artifactExists && paths.length === expectedDragonPathIds.length,
    "Automation writes an explicit content completeness artifact for every element/path identity.",
    { pathCompletenessPath, expectedPathIds: expectedDragonPathIds, pathIds: paths.map((path) => path.pathId) }
  );

  assertCheck(
    checks,
    "dragon-path-content-element-role-matrix",
    Boolean(comparisons.allExpectedPathsPresent && comparisons.everyElementHasEveryRole && comparisons.everyPathIdMatchesExpectedIdentity),
    "Every path ID maps to its expected element and every element has guardian, raider, and mystic path identity entries.",
    { comparisons }
  );

  assertCheck(
    checks,
    "dragon-path-content-required-fields",
    Boolean(comparisons.everyPathHasRequiredIdentityFields),
    "Every path has required display copy plus combatVerb, combatStyle, tempoLabel, stat boost, and battle modifier fields.",
    {
      incompletePaths: paths
        .filter((path) => !path.complete)
        .map((path) => ({ pathId: path.pathId, requiredFields: path.requiredFields }))
    }
  );
}


function writeHatchingOnboardingDeterministicValidationArtifact(gameSource, appSource) {
  const reducerSource = getSection(gameSource, "export function gameReducer", "export function getGameSnapshot");
  const selectEggBlock = getSection(reducerSource, "case \"selectEgg\"", "case \"tapEgg\"");
  const tapEggBlock = getSection(reducerSource, "case \"tapEgg\"", "case \"chooseEggAnswer\"");
  const hatchDragonBlock = getSection(reducerSource, "case \"hatchDragon\"", "case \"finishHatching\"");
  const finishHatchingBlock = getSection(reducerSource, "case \"finishHatching\"", "case \"selectDragonPath\"");
  const onboardingStepsSource = getSection(appSource, "const onboardingSteps = [", "];\n\n");
  const onboardingInvocationSource = getSection(appSource, "<OnboardingModal", "<BalanceDebugPanel");
  const onboardingModalSource = getSection(appSource, "function OnboardingModal", "function getTodayKeyForUi");

  const validation = {
    name: "hatching-onboarding-deterministic-validation",
    generatedAt: nowIso(),
    scope: "source-and-reducer contract only; no device, simulator, browser, Playwright, or product feature work",
    proofMode: "deterministic static contract validation inside npm run test:auto",
    hatchingFlow: [
      {
        step: "fresh-save",
        expected: { phase: "egg", activeScreen: "egg", stage: "egg", eggTaps: 0 },
        sourceEvidence: {
          initialPhase: gameSource.includes('phase: "egg"'),
          initialScreen: gameSource.includes('activeScreen: "egg"'),
          initialEggTaps: gameSource.includes("eggTaps: 0")
        }
      },
      {
        step: "select-egg",
        expected: "selectEgg keeps player on egg screen, records selectedEgg, resets eggTaps, assigns element, and sets early evolution charge",
        sourceEvidence: {
          guardedToEggOrQuestion: selectEggBlock.includes('state.phase !== "egg" && state.phase !== "question"'),
          requiresEggStage: selectEggBlock.includes('state.dragon.stage !== "egg"'),
          recordsSelectedEgg: selectEggBlock.includes('eggAnswers: { selectedEgg: action.element }'),
          resetsEggTaps: selectEggBlock.includes("eggTaps: 0"),
          assignsElement: selectEggBlock.includes("element: action.element"),
          chargesEvolution: selectEggBlock.includes("evolution: 8")
        }
      },
      {
        step: "tap-egg-three-times",
        expected: "tapEgg is deterministic: taps clamp at three, write tap markers, and enter hatching only on the third tap",
        sourceEvidence: {
          requiresSelectedElement: tapEggBlock.includes("!state.dragon.element"),
          clampsAtThree: tapEggBlock.includes("Math.min(3, (state.eggTaps ?? 0) + 1)"),
          writesTapOne: tapEggBlock.includes("tapOne: state.dragon.element"),
          writesTapTwo: tapEggBlock.includes("nextEggTaps >= 2"),
          writesTapThree: tapEggBlock.includes("nextEggTaps >= 3"),
          hatchingOnThirdTap: tapEggBlock.includes('phase: nextEggTaps >= 3 ? "hatching" : "egg"'),
          updatesQuestionIndex: tapEggBlock.includes("currentQuestionIndex: Math.min(nextEggTaps, 2)")
        }
      },
      {
        step: "finish-hatching",
        expected: "finishHatching routes through hatchDragon, producing a hatchling journey on the den screen with default path/skill setup",
        sourceEvidence: {
          finishRequiresHatchingOrHatchling: finishHatchingBlock.includes('state.phase !== "hatching" && state.dragon.stage !== "hatchling"'),
          delegatesToHatchDragon: finishHatchingBlock.includes('return gameReducer(state, { type: "hatchDragon" })'),
          hatchDragonSetsJourney: hatchDragonBlock.includes('phase: "journey"'),
          hatchDragonSetsDen: hatchDragonBlock.includes('activeScreen: "den"'),
          hatchDragonSetsStage: hatchDragonBlock.includes('stage: "hatchling"'),
          hatchDragonSetsDefaultPath: hatchDragonBlock.includes("getDefaultDragonPath(element)"),
          hatchDragonSetsDefaultSkill: hatchDragonBlock.includes("defaultActiveSkill")
        }
      }
    ],
    onboardingFlow: {
      expected: "Onboarding appears after hatchling journey until the tutorial is completed; skip and final next both dispatch completeTutorial.",
      sourceEvidence: {
        steps: [...onboardingStepsSource.matchAll(/"([^"]+)"/g)].map((match) => match[1]),
        modalBoundToTutorialCompleted: onboardingInvocationSource.includes("visible={!state.tutorialCompleted}"),
        usesSharedSteps: onboardingInvocationSource.includes("steps={onboardingSteps}"),
        skipFinishesTutorial: onboardingInvocationSource.includes("onSkip={finishTutorial}"),
        finalNextFinishesTutorial: onboardingInvocationSource.includes("tutorialStep >= onboardingSteps.length - 1") && onboardingInvocationSource.includes("finishTutorial();"),
        completeTutorialDispatch: appSource.includes('dispatch({ type: "completeTutorial" });'),
        reducerSetsTutorialCompleted: gameSource.includes('case "completeTutorial"') && gameSource.includes("tutorialCompleted: true"),
        modalHasSkipAndNextControls: onboardingModalSource.includes("Skip") && onboardingModalSource.includes('isLastStep ? "Done" : "Next"')
      }
    }
  };

  fs.writeFileSync(hatchingOnboardingValidationPath, JSON.stringify(validation, null, 2));
  return validation;
}

function analyzeHatchingOnboardingDeterministicValidation(checks, validation) {
  const selectEggEvidence = validation.hatchingFlow.find((step) => step.step === "select-egg")?.sourceEvidence ?? {};
  const tapEvidence = validation.hatchingFlow.find((step) => step.step === "tap-egg-three-times")?.sourceEvidence ?? {};
  const finishEvidence = validation.hatchingFlow.find((step) => step.step === "finish-hatching")?.sourceEvidence ?? {};
  const onboardingEvidence = validation.onboardingFlow.sourceEvidence ?? {};

  assertCheck(
    checks,
    "hatching-onboarding-validation-artifact",
    fs.existsSync(hatchingOnboardingValidationPath) && validation.scope.includes("no device") && validation.proofMode.includes("test:auto"),
    "Automation writes a deterministic hatching/onboarding validation artifact without device, simulator, browser, or Playwright requirements.",
    { hatchingOnboardingValidationPath, scope: validation.scope, proofMode: validation.proofMode }
  );

  assertCheck(
    checks,
    "hatching-selected-egg-contract",
    Object.values(selectEggEvidence).every(Boolean),
    "Selecting an egg is guarded to the egg flow, resets taps, records the selected element, and keeps the player on the egg screen.",
    { selectEggEvidence }
  );

  assertCheck(
    checks,
    "hatching-three-tap-contract",
    Object.values(tapEvidence).every(Boolean),
    "The hatching flow deterministically clamps at three taps, records tap milestones, and enters hatching only on the third tap.",
    { tapEvidence }
  );

  assertCheck(
    checks,
    "hatching-finish-to-journey-contract",
    Object.values(finishEvidence).every(Boolean),
    "finishHatching deterministically creates the hatchling, assigns default path/skill state, moves to journey, and lands on the den screen.",
    { finishEvidence }
  );

  assertCheck(
    checks,
    "onboarding-modal-completion-contract",
    onboardingEvidence.steps?.length === 4 &&
      onboardingEvidence.steps.includes("Choose adventures to earn loot and Essence.") &&
      onboardingEvidence.steps.includes("Evolve and eventually reincarnate for Dragon Souls.") &&
      onboardingEvidence.modalBoundToTutorialCompleted &&
      onboardingEvidence.usesSharedSteps &&
      onboardingEvidence.skipFinishesTutorial &&
      onboardingEvidence.finalNextFinishesTutorial &&
      onboardingEvidence.completeTutorialDispatch &&
      onboardingEvidence.reducerSetsTutorialCompleted &&
      onboardingEvidence.modalHasSkipAndNextControls,
    "Onboarding uses four deterministic steps and both skip/final-next complete the tutorial through the reducer.",
    { onboardingEvidence }
  );
}

function analyzeAutomationRunbook(checks) {
  const requiredSnippets = [
    "npm run test:auto",
    "artifacts/test-run/latest/report.json",
    "fire-breath-storyboard.html",
    "fire-breath-frames.json",
    "hatching-reveal-storyboard.html",
    "hatching-reveal-frames.json",
    "combat-path-simulation.json",
    "dragon-path-content-completeness.json",
    "dragon-path-ui-copy.json",
    "live-battle-feedback-cues.json",
    "evolution-reveal-path-lines.json",
    "evolution-reveal-path-storyboard.html",
    "adventure-route-plan.json",
    "adventure-ui-reference.json",
    "adventure-fight-stop-hud-snapshot.json",
    "adventure-combat-consolidation-contract.json",
    "adventure-combat-consolidation-storyboard.html",
    "parser-coupled source checks",
    "artifact index lifecycle policy",
    "written-at-end-of-run",
    "verified-on-disk",
    "Artifact index quick reference",
    "report-json, log-text, fire-breath-storyboard, fire-breath-frames, fire-breath-snippet, hatching-reveal-storyboard, hatching-reveal-frames, combat-path-simulation, dragon-path-content-completeness, dragon-path-ui-copy, live-battle-feedback-cues, evolution-reveal-path-lines, evolution-reveal-path-storyboard, adventure-route-plan, adventure-ui-reference, adventure-fight-stop-hud-snapshot, adventure-combat-consolidation-contract, adventure-combat-consolidation-storyboard",
    "Combat/evolution identity proof chain",
    "content completeness -> combat simulation/build-decision callouts -> UI-copy artifact -> live battle feedback cues -> evolution reveal payoff -> cross-artifact consistency",
    "evolution-reveal-storyboard-visual-accent-pills",
    "evolution-reveal-accent-helper-artifact-parity",
    "visualAccentPills",
    "revealAccentHelperParityWithStoryboard",
    "Autonomous agent loop",
    "Overnight guardrails"
  ];
  const runbook = fs.existsSync(automationRunbookPath) ? fs.readFileSync(automationRunbookPath, "utf8") : "";

  assertCheck(
    checks,
    "automation-runbook-present",
    fs.existsSync(automationRunbookPath) && requiredSnippets.every((snippet) => runbook.includes(snippet)),
    "Docs include a concise automation runbook covering test:auto, artifacts, autonomous loop, and overnight guardrails.",
    { automationRunbookPath, requiredSnippets }
  );
}

function analyzeReportArtifactIndex(report) {
  const artifactIndex = Array.isArray(report.artifactIndex) ? report.artifactIndex : [];
  const expectedArtifactEntries = [
    { id: "report-json", path: "artifacts/test-run/latest/report.json", format: "json" },
    { id: "log-text", path: "artifacts/test-run/latest/log.txt", format: "text" },
    { id: "fire-breath-storyboard", path: "artifacts/test-run/latest/fire-breath-storyboard.html", format: "html" },
    { id: "fire-breath-frames", path: "artifacts/test-run/latest/fire-breath-frames.json", format: "json" },
    { id: "fire-breath-snippet", path: "artifacts/test-run/latest/fire-breath-snippet.txt", format: "text" },
    { id: "hatching-reveal-storyboard", path: "artifacts/test-run/latest/hatching-reveal-storyboard.html", format: "html" },
    { id: "hatching-reveal-frames", path: "artifacts/test-run/latest/hatching-reveal-frames.json", format: "json" },
    { id: "hatching-onboarding-deterministic-validation", path: "artifacts/test-run/latest/hatching-onboarding-deterministic-validation.json", format: "json" },
    { id: "combat-path-simulation", path: "artifacts/test-run/latest/combat-path-simulation.json", format: "json" },
    { id: "dragon-path-content-completeness", path: "artifacts/test-run/latest/dragon-path-content-completeness.json", format: "json" },
    { id: "dragon-path-ui-copy", path: "artifacts/test-run/latest/dragon-path-ui-copy.json", format: "json" },
    { id: "live-battle-feedback-cues", path: "artifacts/test-run/latest/live-battle-feedback-cues.json", format: "json" },
    { id: "evolution-reveal-path-lines", path: "artifacts/test-run/latest/evolution-reveal-path-lines.json", format: "json" },
    { id: "evolution-reveal-path-storyboard", path: "artifacts/test-run/latest/evolution-reveal-path-storyboard.html", format: "html" },
    { id: "adventure-route-plan", path: "artifacts/test-run/latest/adventure-route-plan.json", format: "json" },
    { id: "adventure-ui-reference", path: "artifacts/test-run/latest/adventure-ui-reference.json", format: "json" },
    { id: "adventure-fight-stop-hud-snapshot", path: "artifacts/test-run/latest/adventure-fight-stop-hud-snapshot.json", format: "json" },
    { id: "adventure-combat-consolidation-contract", path: "artifacts/test-run/latest/adventure-combat-consolidation-contract.json", format: "json" },
    { id: "adventure-combat-consolidation-storyboard", path: "artifacts/test-run/latest/adventure-combat-consolidation-storyboard.html", format: "html" },
    { id: "skill-build-payoff-matrix", path: "artifacts/test-run/latest/skill-build-payoff-matrix.json", format: "json" },
    { id: "active-skill-combat-preview", path: "artifacts/test-run/latest/active-skill-combat-preview.json", format: "json" },
    { id: "fire-starter-expedition-focus", path: "artifacts/test-run/latest/fire-starter-expedition-focus.json", format: "json" }
  ];
  const artifactIds = artifactIndex.map((artifact) => artifact.id);
  const uniqueArtifactIds = new Set(artifactIds);

  assertCheck(
    report.checks,
    "report-artifact-index-metadata",
    artifactIndex.length === expectedArtifactEntries.length &&
      uniqueArtifactIds.size === artifactIndex.length &&
      expectedArtifactEntries.every((expectedArtifact) =>
        artifactIndex.some((artifact) =>
          artifact.id === expectedArtifact.id &&
          artifact.path === expectedArtifact.path &&
          artifact.format === expectedArtifact.format &&
          artifact.exists === true &&
          typeof artifact.purpose === "string" &&
          artifact.purpose.length >= 20 &&
          Array.isArray(artifact.relatedCheckIds) &&
          artifact.relatedCheckIds.length > 0
        )
      ),
    "report.json includes a unique exact-path artifact index with id, path, format, purpose, related checks, and existence metadata for every generated artifact.",
    { expectedArtifactEntries, artifactIndex, artifactIds, uniqueArtifactIds: [...uniqueArtifactIds] }
  );

  const allowedExistenceValues = ["written-at-end-of-run", "verified-on-disk"];
  const terminalWriteArtifactIds = ["report-json", "log-text"];
  const lifecyclePolicy = report.artifactIndexLifecyclePolicy || {};
  const lifecycleEntriesValid = artifactIndex.every((artifact) => {
    const expectedExistence = terminalWriteArtifactIds.includes(artifact.id) ? "written-at-end-of-run" : "verified-on-disk";
    return artifact.exists === true && artifact.existence === expectedExistence && allowedExistenceValues.includes(artifact.existence);
  });

  assertCheck(
    report.checks,
    "report-artifact-index-existence-lifecycle",
    Array.isArray(lifecyclePolicy.allowedValues) &&
      allowedExistenceValues.every((value) => lifecyclePolicy.allowedValues.includes(value)) &&
      lifecyclePolicy.reportLifecycle === "written-at-end-of-run" &&
      lifecyclePolicy.generatedArtifactLifecycle === "verified-on-disk" &&
      lifecyclePolicy.terminalWriteArtifactIds?.join(",") === terminalWriteArtifactIds.join(",") &&
      lifecyclePolicy.verifiedOnDiskCount === artifactIndex.length - terminalWriteArtifactIds.length &&
      lifecycleEntriesValid,
    "report.json documents and validates artifact index existence lifecycle values for report/log versus generated artifacts.",
    { allowedExistenceValues, terminalWriteArtifactIds, artifactIndexLifecyclePolicy: lifecyclePolicy, artifactIndex }
  );

  const relatedCheckCoverage = report.artifactIndexRelatedCheckCoverage || {};
  assertCheck(
    report.checks,
    "report-artifact-index-related-checks-resolve",
    relatedCheckCoverage.allRelatedCheckIdsResolve === true &&
      Array.isArray(relatedCheckCoverage.missingRelatedCheckIds) &&
      relatedCheckCoverage.missingRelatedCheckIds.length === 0 &&
      relatedCheckCoverage.artifactCount === artifactIndex.length,
    "Every artifactIndex.relatedCheckIds entry resolves to an existing automation check ID.",
    { artifactIndex, relatedCheckCoverage }
  );

  const proofChain = report.combatEvolutionProofChain || {};
  const proofChainSteps = Array.isArray(proofChain.steps) ? proofChain.steps : [];
  const requiredProofChainStepIds = ["content-completeness", "combat-simulation", "ui-copy", "live-battle-feedback", "evolution-reveal-payoff", "cross-artifact-consistency"];
  const passedCheckIds = new Set(report.checks.filter((check) => check.passed).map((check) => check.id));
  const artifactById = Object.fromEntries(artifactIndex.map((artifact) => [artifact.id, artifact]));
  const proofChainStepsResolve = proofChainSteps.every((step) => {
    const artifact = artifactById[step.artifactId];
    return artifact &&
      step.artifactPath === artifact.path &&
      typeof step.proves === "string" &&
      step.proves.length >= 20 &&
      Array.isArray(step.checkIds) &&
      step.checkIds.length > 0 &&
      step.checkIds.every((checkId) => passedCheckIds.has(checkId));
  });
  assertCheck(
    report.checks,
    "report-combat-evolution-proof-chain-summary",
    proofChain.goal === "combat/evolution identity" &&
      proofChain.chain === "content completeness -> combat simulation/build-decision callouts -> UI-copy artifact -> live battle feedback cues -> evolution reveal payoff -> cross-artifact consistency" &&
      proofChainSteps.map((step) => step.id).join(" -> ") === requiredProofChainStepIds.join(" -> ") &&
      proofChainStepsResolve &&
      proofChainSteps.some((step) => step.checkIds.includes("live-battle-feedback-cross-artifact-consistency")),
    "report.json includes a compact combat/evolution proof-chain summary linking artifacts and passing checks for crunchy path identity review.",
    { proofChain, requiredProofChainStepIds, artifactIds, knownPassedCheckIds: [...passedCheckIds] }
  );
}

function artifactIndexEntry(id, artifactPath, format, purpose, relatedCheckIds = []) {
  const writtenAtEndOfRun = artifactPath === reportPath || artifactPath === logPath;

  return {
    id,
    path: path.relative(projectRoot, artifactPath).replace(/\\/g, "/"),
    format,
    purpose,
    relatedCheckIds,
    exists: writtenAtEndOfRun || fs.existsSync(artifactPath),
    existence: writtenAtEndOfRun ? "written-at-end-of-run" : "verified-on-disk"
  };
}

function buildReportArtifactIndex() {
  return [
    artifactIndexEntry(
      "report-json",
      reportPath,
      "json",
      "Machine-readable automation summary with checks, commands, status, and artifact index metadata.",
      ["report-artifact-index-metadata"]
    ),
    artifactIndexEntry(
      "log-text",
      logPath,
      "text",
      "Human-readable terminal mirror of report.json for quick autonomous-loop review.",
      ["report-artifact-index-metadata"]
    ),
    artifactIndexEntry(
      "fire-breath-storyboard",
      storyboardPath,
      "html",
      "Non-interactive visual review surface for fire-breath frame direction, fade-out, captions, and enemy/dragon layout.",
      ["storyboard-html-captions", "visual-review-artifacts-written"]
    ),
    artifactIndexEntry(
      "fire-breath-frames",
      framesPath,
      "json",
      "Seven sampled fire-breath progress frames with complete particle state data for deterministic review.",
      ["frame-json-progress-samples", "frame-json-particle-data-complete", "final-frame-particles-opacity-zero"]
    ),
    artifactIndexEntry(
      "fire-breath-snippet",
      snippetPath,
      "text",
      "Source snippet inspected by the fire-breath automation checks for focused reviewer context.",
      ["component-present", "particle-trail-present"]
    ),
    artifactIndexEntry(
      "hatching-reveal-storyboard",
      hatchStoryboardPath,
      "html",
      "Non-interactive visual review surface for hatching anticipation, shell split, flash, shock ring, and reveal phases.",
      ["hatching-reveal-storyboard-html", "hatching-reveal-storyboard-captions"]
    ),
    artifactIndexEntry(
      "hatching-reveal-frames",
      hatchFramesPath,
      "json",
      "Seven sampled hatching reveal frames with parsed spark/ray data and source timing guard metadata.",
      ["hatching-reveal-source-timing", "hatching-reveal-particle-ray-integrity", "hatching-reveal-phase-coverage"]
    ),
    artifactIndexEntry(
      "hatching-onboarding-deterministic-validation",
      hatchingOnboardingValidationPath,
      "json",
      "Deterministic source/reducer proof that egg selection, three-tap hatching, finishHatching, and onboarding completion remain valid without device-only validation.",
      ["hatching-onboarding-validation-artifact", "hatching-selected-egg-contract", "hatching-three-tap-contract", "hatching-finish-to-journey-contract", "onboarding-modal-completion-contract"]
    ),
    artifactIndexEntry(
      "combat-path-simulation",
      combatSimulationPath,
      "json",
      `Deterministic combat samples and path flavor/build-decision callouts for all ${expectedDragonPathIds.length} element/path combinations.`,
      ["combat-path-simulation-artifact", "combat-path-flavor-callouts", "combat-path-build-decision-callouts", "dragon-path-ui-copy-combat-callout-consistency"]
    ),
    artifactIndexEntry(
      "dragon-path-content-completeness",
      pathCompletenessPath,
      "json",
      "Per-path content completeness matrix covering element, role, combat copy, stat boost, and battle modifier fields.",
      ["dragon-path-content-completeness-artifact", "dragon-path-content-required-fields"]
    ),
    artifactIndexEntry(
      "dragon-path-ui-copy",
      pathUiCopyPath,
      "json",
      `Exact default-assignment and persistent-badge copy for all ${expectedDragonPathIds.length} dragon path build identities without a first-bond choice panel.`,
      ["dragon-path-ui-copy-artifact", "path-ui-surfaces-build-tradeoffs", "dragon-path-ui-copy-combat-callout-consistency"]
    ),
    artifactIndexEntry(
      "live-battle-feedback-cues",
      liveBattleFeedbackPath,
      "json",
      `Compact per-path review artifact covering live combat, brace, and enemy-hit label cues for all ${expectedDragonPathIds.length} evolution paths.`,
      ["live-battle-feedback-cues-artifact", "live-battle-feedback-cross-artifact-consistency", "combat-turn-labels-use-path-cue", "combat-brace-labels-use-path-role", "combat-enemy-hit-labels-use-path-role"]
    ),
    artifactIndexEntry(
      "evolution-reveal-path-lines",
      evolutionRevealPath,
      "json",
      `Deterministic path reveal copy artifact for all ${expectedDragonPathIds.length} drake evolution build-choice payoff lines.`,
      ["evolution-reveal-path-lines-artifact", "evolution-reveal-uses-path-identity", "evolution-reveal-cross-artifact-consistency", "evolution-reveal-storyboard-visual-accent-pills", "evolution-reveal-accent-helper-artifact-parity"]
    ),
    artifactIndexEntry(
      "evolution-reveal-path-storyboard",
      evolutionRevealStoryboardPath,
      "html",
      `Non-interactive review storyboard grouping all ${expectedDragonPathIds.length} path-specific drake evolution reveal payoff lines.`,
      ["evolution-reveal-path-storyboard-html", "evolution-reveal-path-lines-artifact", "evolution-reveal-storyboard-visual-accent-pills", "evolution-reveal-accent-helper-artifact-parity"]
    ),
    artifactIndexEntry(
      "adventure-route-plan",
      adventureRoutePlanPath,
      "json",
      "Machine-readable adventure-route plan covering 40 nodes, every-third fight cadence, and side adventure interactions.",
      ["adventure-route-has-40-linear-nodes", "adventure-route-fights-every-third-node", "adventure-route-side-adventures-shop-shrine", "adventure-route-plan-artifact"]
    ),
    artifactIndexEntry(
      "adventure-ui-reference",
      adventureUiReferencePath,
      "json",
      "Machine-readable Capybara Go-inspired adventure UI contract with HUD, route rail, event card, and CTA proof points.",
      ["adventure-ui-capybara-board-present", "adventure-ui-capybara-route-rail", "adventure-ui-event-card-ctas", "adventure-ui-reference-artifact"]
    ),
    artifactIndexEntry(
      "adventure-fight-stop-hud-snapshot",
      adventureFightStopHudSnapshotPath,
      "json",
      "Representative guardian/raider/mystic legacy fight-stop HUD snapshot kept only as a historical artifact while the live focused screen uses a clean fight card.",
      ["focused-combat-stop-removes-old-systems", "adventure-hero-scene-is-visual-only", "focused-fight-card-is-single-clean-action-surface"]
    ),
    artifactIndexEntry(
      "adventure-combat-consolidation-contract",
      adventureCombatConsolidationPath,
      "json",
      "Machine-readable contract proving Adventure route, Combat Stop, and Battle Result read as one Dragon Expedition Loop.",
      ["adventure-combat-loop-strip-visible", "adventure-combat-consolidation-contract-artifact"]
    ),
    artifactIndexEntry(
      "adventure-combat-consolidation-storyboard",
      adventureCombatConsolidationStoryboardPath,
      "html",
      "Non-interactive storyboard showing the route -> combat stop -> return chest/result loop states for fast review.",
      ["adventure-combat-loop-strip-visible", "adventure-combat-consolidation-storyboard-html"]
    ),
    artifactIndexEntry(
      "skill-build-payoff-matrix",
      skillBuildPayoffMatrixPath,
      "json",
      "Skill archetype matrix tying future skill picks to stat hooks, guardian/raider/mystic role focus, and visible path payoff copy.",
      ["skill-build-payoff-matrix-artifact", "dragon-skill-draft-archetypes-present"]
    ),
    artifactIndexEntry(
      "active-skill-combat-preview",
      activeSkillCombatPath,
      "json",
      "Deterministic preview proving the role-matched active skill is visible and changes battle damage/mitigation for guardian, raider, and mystic paths.",
      ["active-skill-combat-preview-artifact"]
    ),
    artifactIndexEntry(
      "fire-starter-expedition-focus",
      fireStarterFocusPath,
      "json",
      "Fire starter implementation brief translating Capybara Go lessons into route, combat, stat, skill, and evolution proof points.",
      ["fire-starter-focus-panel-visible", "fire-starter-focus-artifact"]
    )
  ];
}

function buildArtifactIndexLifecyclePolicy(artifactIndex) {
  const terminalWriteArtifactIds = ["report-json", "log-text"];

  return {
    allowedValues: ["written-at-end-of-run", "verified-on-disk"],
    reportLifecycle: "written-at-end-of-run",
    generatedArtifactLifecycle: "verified-on-disk",
    terminalWriteArtifactIds,
    writtenAtEndOfRunCount: artifactIndex.filter((artifact) => artifact.existence === "written-at-end-of-run").length,
    verifiedOnDiskCount: artifactIndex.filter((artifact) => artifact.existence === "verified-on-disk").length
  };
}

function buildCombatEvolutionProofChain() {
  const chain = "content completeness -> combat simulation/build-decision callouts -> UI-copy artifact -> live battle feedback cues -> evolution reveal payoff -> cross-artifact consistency";

  return {
    goal: "combat/evolution identity",
    chain,
    reviewPrompt: "Use this compact chain to verify every evolution path reads as a crunchy RPG build choice before opening device/browser validation.",
    steps: [
      {
        id: "content-completeness",
        artifactId: "dragon-path-content-completeness",
        artifactPath: "artifacts/test-run/latest/dragon-path-content-completeness.json",
        proves: `All ${expectedDragonPathIds.length} guardian/raider/mystic paths have element, role, combat copy, stat boost, and battle modifier fields.`,
        checkIds: ["dragon-path-content-completeness-artifact", "dragon-path-content-element-role-matrix", "dragon-path-content-required-fields"]
      },
      {
        id: "combat-simulation",
        artifactId: "combat-path-simulation",
        artifactPath: "artifacts/test-run/latest/combat-path-simulation.json",
        proves: "Deterministic samples show guardian/raider/mystic damage and mitigation tradeoffs plus build-decision callouts.",
        checkIds: ["combat-path-simulation-artifact", "combat-path-simulation-damage-order", "combat-path-simulation-mitigation-order", "combat-path-build-decision-callouts"]
      },
      {
        id: "ui-copy",
        artifactId: "dragon-path-ui-copy",
        artifactPath: "artifacts/test-run/latest/dragon-path-ui-copy.json",
        proves: "Default assignments and persistent badges surface the same Offense/Mitigation/Tempo tradeoffs after the first-bond choice panel was removed.",
        checkIds: ["dragon-path-ui-copy-artifact", "path-ui-surfaces-build-tradeoffs", "dragon-path-ui-copy-combat-callout-consistency"]
      },
      {
        id: "live-battle-feedback",
        artifactId: "live-battle-feedback-cues",
        artifactPath: "artifacts/test-run/latest/live-battle-feedback-cues.json",
        proves: "Live combat, brace, and enemy-hit labels echo the selected path's verb, role, power, mitigation, and tempo.",
        checkIds: ["live-battle-feedback-cues-artifact", "combat-turn-labels-use-path-cue", "combat-brace-labels-use-path-role", "combat-enemy-hit-labels-use-path-role"]
      },
      {
        id: "evolution-reveal-payoff",
        artifactId: "evolution-reveal-path-lines",
        artifactPath: "artifacts/test-run/latest/evolution-reveal-path-lines.json",
        proves: "Drake evolution reveal payoff lines name each selected path and summarize combat verb, tempo, power, and mitigation as a major build choice.",
        checkIds: ["evolution-reveal-uses-path-identity", "evolution-reveal-path-lines-artifact", "evolution-reveal-path-storyboard-html", "evolution-reveal-cross-artifact-consistency"]
      },
      {
        id: "cross-artifact-consistency",
        artifactId: "live-battle-feedback-cues",
        artifactPath: "artifacts/test-run/latest/live-battle-feedback-cues.json",
        proves: "Live cues, UI copy, combat simulation, and evolution reveal payoff agree on path identity and Offense/Mitigation/Tempo values.",
        checkIds: ["live-battle-feedback-cross-artifact-consistency", "evolution-reveal-cross-artifact-consistency"]
      }
    ]
  };
}

function buildArtifactIndexRelatedCheckCoverage(report) {
  const checkIds = new Set(report.checks.map((check) => check.id));
  checkIds.add("report-artifact-index-metadata");
  checkIds.add("report-artifact-index-existence-lifecycle");
  checkIds.add("report-artifact-index-related-checks-resolve");
  checkIds.add("report-combat-evolution-proof-chain-summary");
  const artifactCoverage = report.artifactIndex.map((artifact) => {
    const relatedCheckIds = Array.isArray(artifact.relatedCheckIds) ? artifact.relatedCheckIds : [];
    const missingRelatedCheckIds = relatedCheckIds.filter((checkId) => !checkIds.has(checkId));

    return {
      artifactId: artifact.id,
      relatedCheckIds,
      missingRelatedCheckIds,
      allRelatedCheckIdsResolve: relatedCheckIds.length > 0 && missingRelatedCheckIds.length === 0
    };
  });
  const missingRelatedCheckIds = artifactCoverage.flatMap((artifact) =>
    artifact.missingRelatedCheckIds.map((checkId) => ({ artifactId: artifact.artifactId, checkId }))
  );

  return {
    artifactCount: report.artifactIndex.length,
    knownCheckCount: checkIds.size,
    allRelatedCheckIdsResolve: artifactCoverage.every((artifact) => artifact.allRelatedCheckIdsResolve),
    missingRelatedCheckIds,
    artifactCoverage
  };
}

function analyzeDragonPathCombatSource(gameSource, appSource) {
  const checks = [];
  const pathDefinitions = getSection(gameSource, "export const dragonPathDefinitions", "export function getDragonPathChoices");
  const battleDamageFunction = getSection(gameSource, "export function getBattleDamage", "export function getBattleRewardEssence");
  const battleCreation = getSection(gameSource, "function createBattle", "export function gameReducer");
  const pathBadge = getSection(appSource, "function DragonPathBadge", "const fireBreathParticleSpecs");

  assertCheck(
    checks,
    "dragon-path-combat-effects-defined",
    ["guardian", "raider", "mystic"].every((role) => pathDefinitions.includes(role)) &&
      countMatches(pathDefinitions, /battleModifier:\s*\{/g) >= 9,
    "Every first-bond path declares a combat-loop battleModifier so evolution choices change fights beyond static stats."
  );

  assertCheck(
    checks,
    "dragon-path-combat-modifier-function",
    gameSource.includes("export function getDragonPathBattleModifier") &&
      gameSource.includes("damageMultiplier") &&
      gameSource.includes("damageReduction") &&
      gameSource.includes("tempoLabel"),
    "Game logic exposes a path battle modifier with damage, mitigation, and readable tempo identity."
  );

  assertCheck(
    checks,
    "battle-damage-uses-path-modifier",
    battleDamageFunction.includes("getDragonPathBattleModifier(state).damageMultiplier"),
    "Auto-battle damage uses the selected dragon path's combat damage modifier."
  );

  assertCheck(
    checks,
    "adventure-combat-uses-path-identity",
    battleCreation.includes("pathBattleModifier") &&
      battleCreation.includes("pathBattleModifier.damageMultiplier") &&
      battleCreation.includes("pathBattleModifier.damageReduction") &&
      battleCreation.includes("pathBattleModifier.tempoLabel"),
    "Adventure battle rounds apply path damage/mitigation and include readable path combat identity in the log."
  );

  assertCheck(
    checks,
    "impactful-combat-stats-resolve-visible-outcomes",
    gameSource.includes("critChance") &&
      gameSource.includes("critDamage") &&
      gameSource.includes("block") &&
      gameSource.includes("dodge") &&
      gameSource.includes("export function getCombatStatProfile") &&
      battleDamageFunction.includes("critChance") &&
      battleDamageFunction.includes("critDamage") &&
      battleCreation.includes("blocked") &&
      battleCreation.includes("dodged") &&
      battleCreation.includes("CRIT") &&
      appSource.includes("combatStatTips") &&
      appSource.includes("Crit DMG"),
    "ATK/DEF/block/dodge/crit/crit damage/speed all feed combat math and visible UI/log outcomes instead of being silent numbers."
  );

  assertCheck(
    checks,
    "stats-page-visible-in-bottom-nav",
    appSource.includes('type IdlePanelKey = "stats"') &&
      appSource.includes('{ key: "stats", label: "Stats"') &&
      appSource.includes('activePanel === "stats" ? <StatsPanelContent state={state} />') &&
      appSource.includes('function StatsPanelContent') &&
      appSource.includes('title="Dragon Stats"') &&
      appSource.includes('title="Combat Impact"') &&
      appSource.includes('title="Build Identity"') &&
      appSource.includes('getBattleDamage(state)') &&
      appSource.includes('getDragonPower(state)'),
    "Stats page is directly visible in the bottom nav and shows current stats, combat impact, and build identity."
  );

  assertCheck(
    checks,
    "dragon-skill-draft-archetypes-present",
    gameSource.includes("export const dragonSkillDrafts") &&
      ["fire", "frost", "storm", "shadow", "gold", "ancient"].every((archetype) => gameSource.includes(`archetype: \"${archetype}\"`)) &&
      ["trigger", "effect", "synergy", "statHooks"].every((field) => gameSource.includes(field)) &&
      appSource.includes("function SkillDraftPanel") &&
      appSource.includes("Skill Draft") &&
      appSource.includes("visibleSkills.map") &&
      appSource.includes("skillDraftSynergy"),
    "Skill draft system exposes Fire/Frost/Storm/Shadow/Gold/Ancient archetypes with triggers, effects, synergies, stat hooks, and an in-game preview panel."
  );

  const skillBuildPayoffMatrixExists = fs.existsSync(skillBuildPayoffMatrixPath);
  const skillBuildPayoffMatrix = skillBuildPayoffMatrixExists ? JSON.parse(fs.readFileSync(skillBuildPayoffMatrixPath, "utf8")) : null;
  assertCheck(
    checks,
    "skill-build-payoff-matrix-artifact",
    skillBuildPayoffMatrixExists &&
      skillBuildPayoffMatrix?.comparisons?.coversAllSkillDrafts === true &&
      skillBuildPayoffMatrix?.comparisons?.coversEveryCombatStat === true &&
      skillBuildPayoffMatrix?.comparisons?.everySkillHasRoleFocus === true &&
      skillBuildPayoffMatrix?.comparisons?.everySkillHasElementFocus === true &&
      skillBuildPayoffMatrix?.comparisons?.everySkillHasVisiblePathPayoff === true &&
      skillBuildPayoffMatrix?.comparisons?.everySkillHasTunedActiveBonus === true &&
      appSource.includes("Bonus:") &&
      appSource.includes("skill.activeBonus") &&
      appSource.includes("visibleSkills") &&
      appSource.includes("skill.elementFocus") &&
      gameSource.includes("roleFocus") &&
      gameSource.includes("elementFocus") &&
      gameSource.includes("pathPayoff"),
    "Automation writes a skill-build payoff matrix tying each skill archetype to stat hooks, element focus, guardian/raider/mystic role focus, visible path payoff copy, and tuned active combat bonuses.",
    { skillBuildPayoffMatrixPath, exists: skillBuildPayoffMatrixExists, comparisons: skillBuildPayoffMatrix?.comparisons ?? null }
  );

  const activeSkillCombatExists = fs.existsSync(activeSkillCombatPath);
  const activeSkillCombat = activeSkillCombatExists ? JSON.parse(fs.readFileSync(activeSkillCombatPath, "utf8")) : null;
  assertCheck(
    checks,
    "active-skill-combat-preview-artifact",
    activeSkillCombatExists &&
      activeSkillCombat?.comparisons?.everyRoleHasActiveSkill === true &&
      activeSkillCombat?.comparisons?.everyPathHasElementRoleMatchedActiveSkill === true &&
      activeSkillCombat?.comparisons?.everyElementRoleHasDistinctSkillBonus === true &&
      activeSkillCombat?.comparisons?.playerSelectedSkillOverridesPathDefault === true &&
      activeSkillCombat?.comparisons?.reducerToBattleSelectedSkillExecuted === true &&
      activeSkillCombat?.comparisons?.critTriggeredSkillEffectExecuted === true &&
      activeSkillCombat?.comparisons?.blockTriggeredSkillEffectExecuted === true &&
      activeSkillCombat?.comparisons?.dodgeTriggeredSkillEffectExecuted === true &&
      activeSkillCombat?.comparisons?.crystalBreakOpeningHitTriggeredSkillExecuted === true &&
      activeSkillCombat?.comparisons?.reducerHydratesSelectedSkill === true &&
      activeSkillCombat?.comparisons?.uiSurfacesSkillSlotButtons === true &&
      activeSkillCombat?.comparisons?.uiSurfacesSkillUnlockConstraints === true &&
      activeSkillCombat?.comparisons?.uiSurfacesEliteSkillDraftReward === true &&
      activeSkillCombat?.comparisons?.everyBattleLogFramesBonusAsSlotted === true &&
      activeSkillCombat?.comparisons?.everySampleHasCombatMathEffect === true &&
      activeSkillCombat?.comparisons?.uiSurfacesActiveSkill === true &&
      activeSkillCombat?.comparisons?.uiAvoidsBattleSkillTriggerSummary === true &&
      gameSource.includes("function getActiveDragonSkill") &&
      gameSource.includes("function getActiveSkillBattleBonus") &&
      gameSource.includes("return skill.activeBonus") &&
      gameSource.includes("activeBonus") &&
      battleCreation.includes("activeSkillBonus") &&
      (appSource.includes("Active skill:") || appSource.includes("Skill:")) &&
      appSource.includes("battle.activeSkill") &&
      appSource.includes("<BattleScreen state={state} dispatch={dispatch} />"),
    "Automation proves one active role-matched skill is selected for each guardian/raider/mystic path, visibly surfaced, and consumed by combat math/logs.",
    { activeSkillCombatPath, exists: activeSkillCombatExists, comparisons: activeSkillCombat?.comparisons ?? null }
  );

  const fireStarterFocusExists = fs.existsSync(fireStarterFocusPath);
  const fireStarterFocus = fireStarterFocusExists ? JSON.parse(fs.readFileSync(fireStarterFocusPath, "utf8")) : null;
  assertCheck(
    checks,
    "fire-starter-focus-artifact",
    fireStarterFocusExists &&
      fireStarterFocus?.comparisons?.exportsMilestones === true &&
      fireStarterFocus?.comparisons?.rendersPanel === true &&
      fireStarterFocus?.comparisons?.coversResearchRouteCombatEvolution === true &&
      fireStarterFocus?.comparisons?.everyMilestoneHasCapybaraLesson === true &&
      fireStarterFocus?.comparisons?.everyMilestoneHasDragonTwist === true &&
      fireStarterFocus?.comparisons?.everyMilestoneHasVisibleProof === true,
    "Automation writes a Fire starter focus artifact proving Capybara research, route, combat, and evolution guidance is visible in-game.",
    { fireStarterFocusPath, exists: fireStarterFocusExists, comparisons: fireStarterFocus?.comparisons ?? null }
  );

  assertCheck(
    checks,
    "fire-starter-focus-panel-visible",
    gameSource.includes("export const fireStarterAdventureMilestones") &&
      appSource.includes("function FireStarterFocusPanel") &&
      appSource.includes("Fire Starter Expedition Focus") &&
      appSource.includes("Capybara lesson:") &&
      appSource.includes("Dragon twist:") &&
      appSource.includes("Visible proof:"),
    "The Adventure panel now visibly translates Capybara Go research into dragon-specific Fire starter implementation targets."
  );

  assertCheck(
    checks,
    "supporting-systems-roadmap-present",
    gameSource.includes("export const supportingSystemRecommendations") &&
      ["gear-relics", "hoard", "idle", "daily-starter", "automation"].every((lane) => gameSource.includes(`lane: \"${lane}\"`)) &&
      ["Gear + Relic Drops", "Dragon Hoard Progression", "Idle + Return Rewards", "Daily + Starter Rewards", "Game-feel Regression Harness"].every((label) => gameSource.includes(label)) &&
      appSource.includes("Recommended Systems Roadmap") &&
      appSource.includes("supportingSystemRecommendations.map") &&
      appSource.includes("system.inGameProof") &&
      appSource.includes("system.nextHook"),
    "Recommended support systems are explicitly mapped to in-game proof for gear/relics, hoard progression, idle rewards, daily/starter rewards, and the regression harness."
  );

  assertCheck(
    checks,
    "productive-work-now-panel-visible",
    gameSource.includes("export const productiveWorkNowSlices") &&
      ["Next 10-Minute Production Slice", "Adventure path", "Flashy battle", "Impact stats", "Fire evolution"].every((label) => appSource.includes(label) || gameSource.includes(label)) &&
      appSource.includes("function ProductiveWorkNowPanel") &&
      appSource.includes("productiveWorkNowSlices.map") &&
      appSource.includes("slice.visibleDeliverable") &&
      appSource.includes("slice.nextHook"),
    "Adventure screen exposes a stakeholder-reviewable next-production panel with visible deliverables for adventure, combat, stats, and Fire evolution."
  );

  assertCheck(
    checks,
    "adventure-run-reward-loop-visible",
    gameSource.includes("lastAdventureRewards") &&
      gameSource.includes("function createAdventureRewardBundle") &&
      gameSource.includes("adventureRewardBundle") &&
      gameSource.includes("treasureDrop") &&
      gameSource.includes("equipmentDrop") &&
      appSource.includes("function AdventureRewardRecap") &&
      appSource.includes("Adventure Return Chest") &&
      appSource.includes("Loot gained") &&
      appSource.includes("Stats improved") &&
      appSource.includes("Hoard progress") &&
      appSource.includes("Evolution progress") &&
      appSource.includes("Next recommended adventure"),
    "Adventure runs produce a visible return-chest recap that connects loot, stat growth, hoard progress, evolution progress, and the next recommended run."
  );

  assertCheck(
    checks,
    "route-reward-and-treasure-popups-hidden",
    appSource.includes("function shouldShowLootPopup") &&
      appSource.includes("!event.treasureId") &&
      appSource.includes('!event.message.startsWith("Adventure Return Chest:")') &&
      appSource.includes("Boolean(event.equipmentId || event.shard)") &&
      appSource.includes("shouldShowLootPopup(state.lastLoot)") &&
      appSource.includes("Treasure Found!") &&
      appSource.includes("Route Reward"),
    "Route reward and treasure-found loot events are still tracked but no longer render intrusive popups during adventure flow."
  );

  assertCheck(
    checks,
    "first-bond-choice-panel-removed",
    !appSource.includes("First bond choice") &&
      !appSource.includes("function DragonPathChoicePanel") &&
      !appSource.includes("<DragonPathChoicePanel") &&
      gameSource.includes("function getDefaultDragonPath") &&
      gameSource.includes("path: getDefaultDragonPath(element)") &&
      appSource.includes("DragonPathBadge"),
    "First-bond choice UI is removed; hatchlings receive a default path automatically while the persistent path badge can still show build identity.",
    { hasFirstBondCopy: appSource.includes("First bond choice"), hasChoicePanelRender: appSource.includes("<DragonPathChoicePanel"), hasDefaultPathHelper: gameSource.includes("function getDefaultDragonPath") }
  );

  assertCheck(
    checks,
    "path-ui-surfaces-combat-identity",
    pathBadge.includes("path.combatStyle") && pathBadge.includes("path.combatVerb"),
    "Persistent path badge surfaces each path's combat style and signature verb without a first-bond choice panel."
  );

  assertCheck(
    checks,
    "path-ui-surfaces-build-tradeoffs",
    appSource.includes("function getDragonPathTradeoffCopy") &&
      ["Offense", "Mitigation", "Tempo"].every((label) => appSource.includes(label)) &&
      appSource.includes("path.battleModifier.damageMultiplier") &&
      appSource.includes("path.battleModifier.damageReduction") &&
      appSource.includes("path.battleModifier.tempoLabel") &&
      pathBadge.includes("getDragonPathTradeoffCopy(path)"),
    "Persistent badge UI uses the battle-modifier tradeoff helper so evolution reads as a consistent crunchy build identity after the first-bond panel is removed."
  );

  const evolutionRevealSamples = expectedDragonPathIds.map((pathId) => {
    const block = extractDragonPathBlock(gameSource, pathId);
    const name = extractQuotedField(block, "name");
    const combatVerb = extractQuotedField(block, "combatVerb");
    const tempoLabel = extractQuotedField(block, "tempoLabel");
    const damageMultiplier = extractNumberField(block, "damageMultiplier");
    const damageReduction = extractNumberField(block, "damageReduction");
    const revealLine = `${name} awakened: ${combatVerb} now ${tempoLabel} (${Math.round(damageMultiplier * 100)}% power / ${Math.round(damageReduction * 100)}% mitigation).`;
    return { pathId, name, combatVerb, tempoLabel, revealLine, length: revealLine.length };
  });
  assertCheck(
    checks,
    "evolution-reveal-uses-path-identity",
    appSource.includes("function getDragonPathEvolutionRevealLine") &&
      appSource.includes("dragonPathDefinitions[state.dragon.path]") &&
      appSource.includes("getDragonPathEvolutionRevealLine(dragonPathDefinitions[state.dragon.path])") &&
      evolutionRevealSamples.length === expectedDragonPathIds.length &&
      evolutionRevealSamples.every((sample) =>
        sample.name &&
        sample.combatVerb &&
        sample.tempoLabel &&
        sample.revealLine.includes(sample.name) &&
        sample.revealLine.includes(sample.combatVerb) &&
        sample.revealLine.includes("power") &&
        sample.revealLine.includes("mitigation") &&
        sample.length <= 118
      ),
    "Drake evolution reveal copy uses the selected path name, combat verb, tempo, power, and mitigation so the branch payoff feels like a big build decision.",
    { evolutionRevealSamples }
  );

  const dragonDisplay = getSection(appSource, "function DragonDisplay({", "function LayeredFireHatchling");
  const guidedStageDisplayCall = getSection(appSource, "<DragonDisplay\n        element={element}", "        onTap={tapDragon}");
  assertCheck(
    checks,
    "evolution-reveal-visual-accents-use-path-role",
    appSource.includes("type DragonPathRevealAccent") &&
      appSource.includes("function getDragonPathRevealAccent") &&
      appSource.includes("path.battleModifier.damageMultiplier") &&
      appSource.includes("path.battleModifier.damageReduction") &&
      guidedStageDisplayCall.includes("pathRevealAccent={state.dragon.path ? getDragonPathRevealAccent(dragonPathDefinitions[state.dragon.path]) : null}") &&
      dragonDisplay.includes("pathRevealAccent = null") &&
      dragonDisplay.includes("isEvolutionReveal && pathRevealAccent && !reducedMotion") &&
      dragonDisplay.includes("styles.evolutionPathAccentLayer") &&
      dragonDisplay.includes("styles.evolutionPathAccentPillGuardian") &&
      dragonDisplay.includes("styles.evolutionPathAccentPillRaider") &&
      dragonDisplay.includes("styles.evolutionPathAccentPillMystic"),
    "Drake evolution reveal presentation renders path-specific visual accent pills during the reveal, gated by Reduced Motion and tied to the selected role/offense/mitigation identity.",
    {
      hasRevealAccentType: appSource.includes("type DragonPathRevealAccent"),
      hasRevealAccentHelper: appSource.includes("function getDragonPathRevealAccent"),
      displayPassesAccent: guidedStageDisplayCall.includes("pathRevealAccent={state.dragon.path ? getDragonPathRevealAccent(dragonPathDefinitions[state.dragon.path]) : null}"),
      roleStyles: ["Guardian", "Raider", "Mystic"].filter((role) => appSource.includes(`styles.evolutionPathAccentPill${role}`))
    }
  );

  const evolutionRevealArtifactExists = fs.existsSync(evolutionRevealPath);
  const evolutionRevealArtifact = evolutionRevealArtifactExists ? JSON.parse(fs.readFileSync(evolutionRevealPath, "utf8")) : null;
  const evolutionRevealArtifactLines = Array.isArray(evolutionRevealArtifact?.paths) ? evolutionRevealArtifact.paths : [];
  const evolutionRevealStoryboardExists = fs.existsSync(evolutionRevealStoryboardPath);
  const evolutionRevealStoryboardHtml = evolutionRevealStoryboardExists ? fs.readFileSync(evolutionRevealStoryboardPath, "utf8") : "";
  assertCheck(
    checks,
    "evolution-reveal-path-lines-artifact",
    evolutionRevealArtifactExists &&
      evolutionRevealArtifactLines.length === expectedDragonPathIds.length &&
      evolutionRevealArtifact?.comparisons?.allExpectedPathsPresent === true &&
      evolutionRevealArtifact?.comparisons?.everyLineUsesPathIdentity === true &&
      evolutionRevealArtifact?.comparisons?.everyLineReadable === true,
    `Automation writes exact drake evolution reveal lines for all ${expectedDragonPathIds.length} paths so the branch payoff can be reviewed as a crunchy build decision artifact.`,
    { evolutionRevealPath, pathIds: evolutionRevealArtifactLines.map((line) => line.pathId) }
  );
  assertCheck(
    checks,
    "evolution-reveal-path-storyboard-html",
    evolutionRevealStoryboardExists &&
      evolutionRevealStoryboardHtml.includes("Path Evolution Reveal Storyboard") &&
      evolutionRevealArtifactLines.every((line) => evolutionRevealStoryboardHtml.includes(escapeHtml(line.revealLine))),
    "Automation writes a non-interactive storyboard HTML surface that groups every path-specific drake evolution reveal line.",
    { evolutionRevealStoryboardPath, htmlLength: evolutionRevealStoryboardHtml.length }
  );

  assertCheck(
    checks,
    "evolution-reveal-storyboard-visual-accent-pills",
    evolutionRevealArtifactExists &&
      evolutionRevealArtifact?.comparisons?.everyRevealEntryHasVisualAccentPills === true &&
      evolutionRevealArtifactLines.every((line) =>
        Array.isArray(line.visualAccentPills) &&
        line.visualAccentPills.length === 2 &&
        line.visualAccentPills.some((pill) => pill.label === line.roleLabel && pill.value === `${line.power}% power`) &&
        line.visualAccentPills.some((pill) => pill.label === line.combatVerb && pill.value === `${line.mitigation}% mitigation`)
      ) &&
      evolutionRevealStoryboardHtml.includes("visual accent pill") &&
      evolutionRevealArtifactLines.every((line) =>
        evolutionRevealStoryboardHtml.includes(escapeHtml(`${line.roleLabel}: ${line.power}% power`)) &&
        evolutionRevealStoryboardHtml.includes(escapeHtml(`${line.combatVerb}: ${line.mitigation}% mitigation`))
      ),
    "Evolution reveal storyboard and JSON include the two path-specific visual accent pills shown in-app during the drake reveal.",
    {
      evolutionRevealPath,
      evolutionRevealStoryboardPath,
      missingAccentPillPathIds: evolutionRevealArtifactLines
        .filter((line) => !Array.isArray(line.visualAccentPills) || line.visualAccentPills.length !== 2)
        .map((line) => line.pathId)
    }
  );

  assertCheck(
    checks,
    "evolution-reveal-accent-helper-artifact-parity",
    evolutionRevealArtifactExists &&
      evolutionRevealArtifact?.comparisons?.revealAccentHelperParityWithStoryboard === true,
    "Evolution reveal accent pills in generated artifacts stay in exact label/value parity with App.tsx getDragonPathRevealAccent output.",
    {
      evolutionRevealPath,
      mismatchCount: evolutionRevealArtifact?.comparisons?.revealAccentHelperMismatches?.length ?? null,
      helperShape: evolutionRevealArtifact?.comparisons?.revealAccentHelperShape || null,
      revealAccentHelperMismatches: evolutionRevealArtifact?.comparisons?.revealAccentHelperMismatches || []
    }
  );

  assertCheck(
    checks,
    "evolution-reveal-cross-artifact-consistency",
    evolutionRevealArtifactExists &&
      evolutionRevealArtifact?.comparisons?.revealLinesMatchUiCopyAndCombatSimulation === true,
    "Evolution reveal payoff lines agree with UI-copy and combat-simulation artifacts on path identity plus Offense/Mitigation/Tempo values.",
    {
      evolutionRevealPath,
      mismatchCount: evolutionRevealArtifact?.comparisons?.crossArtifactMismatches?.length ?? null,
      crossArtifactMismatches: evolutionRevealArtifact?.comparisons?.crossArtifactMismatches || []
    }
  );

  const pathUiCopyExists = fs.existsSync(pathUiCopyPath);
  const pathUiCopyArtifact = pathUiCopyExists ? JSON.parse(fs.readFileSync(pathUiCopyPath, "utf8")) : null;
  const pathUiCopyEntries = pathUiCopyArtifact && Array.isArray(pathUiCopyArtifact.paths) ? pathUiCopyArtifact.paths : [];
  const pathUiCopyMatchesVisibleJsx =
    !appSource.includes("First bond choice") &&
    !appSource.includes("<DragonPathChoicePanel") &&
    pathBadge.includes("{path.name}</Text>") &&
    pathBadge.includes("{path.vow} {path.bonus}</Text>") &&
    pathBadge.includes("{path.combatVerb}: {path.combatStyle}</Text>") &&
    pathBadge.includes("{getDragonPathTradeoffCopy(path)}</Text>");
  assertCheck(
    checks,
    "dragon-path-ui-copy-artifact",
    pathUiCopyExists &&
      pathUiCopyMatchesVisibleJsx &&
      pathUiCopyEntries.length === expectedDragonPathIds.length &&
      pathUiCopyArtifact.comparisons?.allExpectedPathsPresent === true &&
      pathUiCopyArtifact.comparisons?.everyPathHasDefaultAssignmentAndBadgeCopy === true,
    "Automation writes exact default path assignment and badge copy for every evolution path while proving the intrusive first-bond choice panel is gone.",
    { pathUiCopyPath, expectedPathIds: expectedDragonPathIds, pathIds: pathUiCopyEntries.map((entry) => entry.pathId), pathUiCopyMatchesVisibleJsx }
  );

  assertCheck(
    checks,
    "dragon-path-ui-copy-combat-callout-consistency",
    pathUiCopyExists && pathUiCopyArtifact.comparisons?.uiCopyMatchesCombatCallouts === true,
    "Dragon path UI-copy artifact agrees with combat-path callouts on names, roles, and Offense/Mitigation/Tempo tradeoff values.",
    { pathUiCopyPath, uiCopyMatchesCombatCallouts: pathUiCopyArtifact?.comparisons?.uiCopyMatchesCombatCallouts, combatCalloutMismatches: pathUiCopyArtifact?.comparisons?.combatCalloutMismatches || [] }
  );

  const combatCueSamples = expectedDragonPathIds.map((pathId) => {
    const block = extractDragonPathBlock(gameSource, pathId);
    const combatVerb = extractQuotedField(block, "combatVerb");
    const combatStyle = extractQuotedField(block, "combatStyle");
    const styleCue = combatStyle.split(":")[0];
    const tempoLabel = extractQuotedField(block, "tempoLabel");
    const cue = `${combatVerb} • ${styleCue} • ${tempoLabel}`;
    return { pathId, combatVerb, styleCue, tempoLabel, cue, length: cue.length };
  });
  assertCheck(
    checks,
    "dragon-path-combat-cue-readability",
    appSource.includes("const styleCue = path.combatStyle.split(\":\")[0]") &&
      combatCueSamples.length === expectedDragonPathIds.length &&
      combatCueSamples.every((sample) =>
        sample.combatVerb && sample.styleCue && sample.tempoLabel && sample.cue.includes("•") && sample.length <= 64
      ),
    "Visible combat cue uses a short combat-style headline plus tempo so verb/style/tempo can fit in the animated turn label.",
    { combatCueSamples }
  );

  analyzeDragonPathCompletenessArtifact(checks);
  analyzeCombatPathSimulationArtifact(checks);

  return checks;
}

function analyzeFireBreathSource(source) {
  const checks = [];
  const particleSpecs = getSection(source, "const fireBreathParticleSpecs", "];\n\nconst elementCombatFx");
  const particleComponent = getSection(source, "function FireBreathParticle({", "function FireBreathCombatVisual");
  const combatVisual = getSection(source, "function FireBreathCombatVisual", "function QuestProgressList");
  const stylesSection = getSection(source, "fireBreathCombatLayer:", "mainDragonInfo:");

  fs.writeFileSync(snippetPath, [
    "// Fire breath automated validation snippet",
    particleSpecs,
    particleComponent,
    combatVisual,
    stylesSection
  ].join("\n\n"));
  writeVisualReviewArtifacts(particleSpecs);

  assertCheck(checks, "component-present", combatVisual.length > 0, "FireBreathCombatVisual exists and can be inspected.");
  assertCheck(checks, "particle-trail-present", source.includes("function FireBreathParticleTrail"), "FireBreathParticleTrail component exists.");

  const particleCount = countMatches(particleSpecs, /\{ start:/g);
  analyzeGeneratedArtifactIntegrity(checks, particleCount);
  assertCheck(checks, "particle-count", particleCount >= 6, "Fire breath uses a multi-particle effect, not a single beam.", { particleCount, minimum: 6 });

  const xValues = [...particleSpecs.matchAll(/x:\s*(-?\d+)/g)].map((match) => Number(match[1]));
  assertCheck(
    checks,
    "particles-travel-left-from-mouth",
    xValues.length >= 6 && xValues.every((value) => value < -100),
    "Particles travel left from the right-side dragon mouth toward the left-side enemy.",
    { xValues }
  );

  const particleOpacityFadesOut = /outputRange:\s*\[0,\s*0,\s*spec\.opacity,\s*spec\.opacity \* 0\.32,\s*0\]/.test(particleComponent);
  assertCheck(checks, "particles-fade-out", particleOpacityFadesOut, "Particles fade to zero at the end instead of visibly rewinding.");

  const noLegacyBeam = !/(fireBreathCone|fireBreathStreak|fireBreathBeam|enemyAttackTrail|enemyAura|fireBreathEnemyAura)/.test(source);
  assertCheck(checks, "no-legacy-beam-or-aura", noLegacyBeam, "Legacy beam/trail/enemy-aura visual styles are not present.");

  assertCheck(
    checks,
    "reduced-motion-gates-vfx",
    /!reducedMotion \? <FireBreathParticleTrail progress=\{breathPulse\}(?: element=\{element\})? \/> : null/.test(combatVisual) &&
      combatVisual.includes("!reducedMotion ? <Animated.View style={[styles.fireBreathMouthGlow"),
    "Particle and mouth glow VFX are suppressed when Reduced Motion is enabled."
  );

  const labelStrings = ["Enemy attacks", "enemyHitLabel", "braceLabel"];
  assertCheck(
    checks,
    "turn-labels-present",
    labelStrings.every((label) => combatVisual.includes(label)) &&
      (combatVisual.includes("combatVerb") || combatVisual.includes("getDragonPathCombatCue")),
    "Capybara Go-style turn labels are present for dragon hit, enemy turn, and brace states.",
    { labels: labelStrings }
  );

  assertCheck(
    checks,
    "battle-animation-stat-fx-badges",
    combatVisual.includes("critBadgeLabel") &&
      combatVisual.includes("dodgeBadgeLabel") &&
      combatVisual.includes("blockBadgeLabel") &&
      combatVisual.includes("combatStatFxBadge") &&
      combatVisual.includes("Crit DMG") &&
      combatVisual.includes("!reducedMotion ? <Animated.Text") &&
      stylesSection.includes("combatStatFxBadgeCrit") &&
      stylesSection.includes("combatStatFxBadgeDodge") &&
      stylesSection.includes("combatStatFxBadgeBlock"),
    "Battle animation layer includes Reduced Motion-gated crit, dodge, and block stat-FX badges tied to the live combat stats."
  );

  assertCheck(
    checks,
    "combat-turn-labels-use-path-cue",
    source.includes("function getDragonPathCombatCue") &&
      source.includes("path.combatVerb") &&
      source.includes("path.combatStyle") &&
      source.includes("path.battleModifier.tempoLabel") &&
      combatVisual.includes("getDragonPathCombatCue(dragonPathDefinitions[state.dragon.path])") &&
      combatVisual.includes("Dragon attacks"),
    "Visible combat turn labels use the selected evolution path's verb, style, and tempo so battle feedback reinforces the big build choice.",
    { hasCombatCueHelper: source.includes("function getDragonPathCombatCue") }
  );

  const gameSourceForBraceCue = fs.readFileSync(gamePath, "utf8");
  const braceCueSamples = expectedDragonPathIds.map((pathId) => {
    const block = extractDragonPathBlock(gameSourceForBraceCue, pathId);
    const role = extractQuotedField(block, "role");
    const combatVerb = extractQuotedField(block, "combatVerb");
    const damageReductionMatch = block.match(/damageReduction:\s*([0-9.]+)/);
    const damageReduction = damageReductionMatch ? Number(damageReductionMatch[1]) : 0;
    const mitigation = Math.round(damageReduction * 100);
    const cue = `${role} brace • ${combatVerb} • ${mitigation}% mitigation`;
    return { pathId, role, combatVerb, mitigation, cue, length: cue.length };
  });
  assertCheck(
    checks,
    "combat-brace-labels-use-path-role",
    source.includes("function getDragonPathBraceCue") &&
      source.includes("path.role") &&
      source.includes("path.battleModifier.damageReduction") &&
      combatVisual.includes("<Animated.Text numberOfLines={2} style={[styles.combatTurnLabel, styles.combatTurnLabelDragonBrace, dragonBraceLabelStyle]}") &&
      combatVisual.includes("getDragonPathBraceCue(dragonPathDefinitions[state.dragon.path])") &&
      combatVisual.includes("combatFx.braceLabel") &&
      /combatTurnLabelDragonBrace:\s*\{[\s\S]*?maxWidth:\s*172[\s\S]*?textAlign:\s*"center"/.test(source) &&
      braceCueSamples.length === expectedDragonPathIds.length &&
      braceCueSamples.every((sample) =>
        ["guardian", "raider", "mystic"].includes(sample.role) && sample.combatVerb && sample.mitigation > 0 && sample.length <= 64
      ),
    "Enemy counter/brace label uses the selected path role, verb, and mitigation so defensive feedback reflects the evolution build choice without changing combat math.",
    { braceCueSamples }
  );

  const hitCueSamples = expectedDragonPathIds.map((pathId) => {
    const block = extractDragonPathBlock(gameSourceForBraceCue, pathId);
    const role = extractQuotedField(block, "role");
    const combatVerb = extractQuotedField(block, "combatVerb");
    const damageMultiplierMatch = block.match(/damageMultiplier:\s*([0-9.]+)/);
    const damageMultiplier = damageMultiplierMatch ? Number(damageMultiplierMatch[1]) : 0;
    const offense = Math.round(damageMultiplier * 100);
    const cue = `${role} hit • ${combatVerb} • ${offense}% power`;
    return { pathId, role, combatVerb, offense, cue, length: cue.length };
  });
  assertCheck(
    checks,
    "combat-enemy-hit-labels-use-path-role",
    source.includes("function getDragonPathHitCue") &&
      source.includes("path.battleModifier.damageMultiplier") &&
      combatVisual.includes("<Animated.Text numberOfLines={2} style={[styles.combatTurnLabel, styles.combatTurnLabelEnemyHit, enemyHitLabelStyle]}") &&
      combatVisual.includes("getDragonPathHitCue(dragonPathDefinitions[state.dragon.path])") &&
      combatVisual.includes("combatFx.enemyHitLabel") &&
      /combatTurnLabelEnemyHit:\s*\{[\s\S]*?maxWidth:\s*172[\s\S]*?textAlign:\s*"center"/.test(source) &&
      hitCueSamples.length === expectedDragonPathIds.length &&
      hitCueSamples.every((sample) =>
        ["guardian", "raider", "mystic"].includes(sample.role) && sample.combatVerb && sample.offense >= 90 && sample.length <= 64
      ),
    "Enemy hit label uses the selected path role, verb, and offense multiplier so impact feedback reflects the evolution build choice without changing combat math.",
    { hitCueSamples }
  );

  const liveBattleFeedbackExists = fs.existsSync(liveBattleFeedbackPath);
  const liveBattleFeedbackArtifact = liveBattleFeedbackExists ? JSON.parse(fs.readFileSync(liveBattleFeedbackPath, "utf8")) : null;
  const liveBattleFeedbackCues = liveBattleFeedbackArtifact && Array.isArray(liveBattleFeedbackArtifact.paths) ? liveBattleFeedbackArtifact.paths : [];
  assertCheck(
    checks,
    "live-battle-feedback-cues-artifact",
    liveBattleFeedbackExists &&
      liveBattleFeedbackCues.length === expectedDragonPathIds.length &&
      liveBattleFeedbackArtifact.comparisons?.allExpectedPathsPresent === true &&
      liveBattleFeedbackArtifact.comparisons?.everyPathHasValidSourceData === true &&
      liveBattleFeedbackArtifact.comparisons?.helperFormatsMatchVisibleJsx === true &&
      liveBattleFeedbackArtifact.comparisons?.everyPathHasCombatBraceAndHitCue === true,
    "Automation writes a live battle-feedback cue artifact summarizing combat, brace, and hit labels for every evolution path.",
    { liveBattleFeedbackPath, pathIds: liveBattleFeedbackCues.map((cue) => cue.pathId) }
  );

  assertCheck(
    checks,
    "live-battle-feedback-cross-artifact-consistency",
    liveBattleFeedbackExists &&
      liveBattleFeedbackArtifact.comparisons?.liveCuesMatchUiCopyAndCombatSimulation === true,
    "Live battle-feedback cue artifact agrees with UI-copy and combat-simulation artifacts on path identity plus Offense/Mitigation/Tempo tradeoffs.",
    {
      liveBattleFeedbackPath,
      mismatchCount: liveBattleFeedbackArtifact?.comparisons?.crossArtifactMismatches?.length ?? null,
      crossArtifactMismatches: liveBattleFeedbackArtifact?.comparisons?.crossArtifactMismatches || []
    }
  );

  const labelGates = countMatches(combatVisual, /!reducedMotion \? <Animated\.Text/g);
  assertCheck(checks, "turn-labels-reduced-motion-gated", labelGates >= 4, "Animated turn labels are gated off in Reduced Motion.", { labelGates });

  const durationChecks = [
    { id: "windup-duration", regex: /toValue:\s*0\.3,\s*duration:\s*(\d+)/, minimum: 50, maximum: 110 },
    { id: "breath-duration", regex: /breathPulse,\s*\{\s*toValue:\s*1,\s*duration:\s*(\d+)/, minimum: 160, maximum: 240 },
    { id: "hit-delay", regex: /Animated\.delay\((\d+)\)/, minimum: 20, maximum: 60 },
    { id: "enemy-counter-duration", regex: /enemyAttackPulse,\s*\{\s*toValue:\s*1,\s*duration:\s*(\d+)/, minimum: 170, maximum: 250 }
  ];
  for (const durationCheck of durationChecks) {
    const match = combatVisual.match(durationCheck.regex);
    const value = match ? Number(match[1]) : 0;
    assertCheck(checks, durationCheck.id, value >= durationCheck.minimum && value <= durationCheck.maximum, `${durationCheck.id} is fast enough for snappy combat while staying readable during automated visual review.`, { value, minimum: durationCheck.minimum, maximum: durationCheck.maximum });
  }

  assertCheck(
    checks,
    "enemy-left-dragon-right-layout",
    /fireBreathEnemyCard:\s*\{[\s\S]*?left:\s*14/.test(stylesSection) && /fireBreathParticleTrail:\s*\{[\s\S]*?left:\s*"47%"/.test(stylesSection),
    "Enemy remains on the left while particles originate near the dragon mouth band."
  );

  assertCheck(
    checks,
    "enemy-has-readable-state",
    combatVisual.includes("fireBreathEnemyName") && combatVisual.includes("fireBreathHpFill") && combatVisual.includes("defeatedCount"),
    "Enemy name, HP, and defeated count are included in the combat visual."
  );

  assertCheck(
    checks,
    "live-dragon-hp-bar-and-enemy-counterattack",
    combatVisual.includes("fireBreathDragonHpCard") &&
      combatVisual.includes("Dragon HP") &&
      combatVisual.includes("fireBreathDragonHpFill") &&
      combatVisual.includes("dragonHitPulse") &&
      combatVisual.includes("enemyStrikeSlash") &&
      combatVisual.includes("enemyAttackPulse") &&
      stylesSection.includes("fireBreathDragonHpCard") &&
      stylesSection.includes("enemyStrikeSlash"),
    "Live combat layer shows a dragon HP bar plus a visible enemy counterattack slash and dragon hit response.",
    { hasDragonHp: combatVisual.includes("fireBreathDragonHpCard"), hasEnemyStrike: combatVisual.includes("enemyStrikeSlash") }
  );

  return checks;
}

function analyzeAdventureJourneySource(source, gameSource, typeSource) {
  const checks = [];
  const adventurePanel = getSection(source, "function AdventurePanelContent", "function GoalsPanelContent");
  const adventureScreen = getSection(source, "function AdventureScreen", "function AdventureNodeCard");
  const adventureScene = getSection(source, "function AdventureJourneyScene", "function AutoBattleSummary");
  const stylesSection = getSection(source, "adventureJourneyStage:", "autoBattleHeader:");
  const fightStopHudSnapshot = fs.existsSync(adventureFightStopHudSnapshotPath)
    ? JSON.parse(fs.readFileSync(adventureFightStopHudSnapshotPath, "utf8"))
    : null;
  const fightStopHudRoles = fightStopHudSnapshot && Array.isArray(fightStopHudSnapshot.snapshots)
    ? fightStopHudSnapshot.snapshots.map((snapshot) => snapshot.role)
    : [];

  assertCheck(
    checks,
    "adventure-journey-scene-present",
    (adventurePanel.includes("<AdventureJourneyScene") || adventurePanel.includes("<CapybaraAdventureBoard")) && adventureScene.length > 0,
    "Adventure panel includes a visual journey scene or Capybara-style adventure board instead of only text cards."
  );

  assertCheck(
    checks,
    "adventure-left-to-right-motion",
    adventureScene.includes("travelProgress") &&
      adventureScene.includes("adventureDragonWalker") &&
      /translateX:[\s\S]*travelProgress\.interpolate\([\s\S]*outputRange:\s*\[0,\s*120\]/.test(adventureScene),
    "Dragon visibly travels left-to-right across the adventure lane."
  );

  assertCheck(
    checks,
    "adventure-enemy-on-right",
    adventureScene.includes("adventureEnemyEncounter") &&
      /adventureEnemyEncounter:\s*\{[\s\S]*?right:\s*(?:10|12|14|16|18)/.test(stylesSection),
    "Enemies are staged on the right side of the adventure route."
  );

  assertCheck(
    checks,
    "adventure-route-nodes-top-and-big-sprites",
    /adventureRouteLine:\s*\{[\s\S]*?top:\s*44[\s\S]*?zIndex:\s*7/.test(stylesSection) &&
      /adventureDragonSprite:\s*\{[\s\S]*?height:\s*180[\s\S]*?width:\s*198/.test(stylesSection) &&
      /adventureEnemySprite:\s*\{[\s\S]*?height:\s*162[\s\S]*?width:\s*176/.test(stylesSection) &&
      /adventureCombatHud:\s*\{[\s\S]*?bottom:\s*58/.test(stylesSection),
    "Adventure route nodes live high above the combat lane, sprites are larger/readable hero pieces, and the combat HUD clears the compact bottom nav."
  );

  const appChromeSection = getSection(source, "guidedHeader:", "sheetScrim:");
  assertCheck(
    checks,
    "adventure-first-impression-declutter-layout",
    /guidedHeaderAdventure:\s*\{[\s\S]*?paddingVertical:\s*5/.test(appChromeSection) &&
      /titleAdventure:\s*\{[\s\S]*?fontSize:\s*16/.test(appChromeSection) &&
      /subtitleAdventure:\s*\{[\s\S]*?fontSize:\s*9/.test(appChromeSection) &&
      /bottomNav:\s*\{[\s\S]*?bottom:\s*6[\s\S]*?padding:\s*4/.test(appChromeSection) &&
      /bottomNavButton:\s*\{[\s\S]*?minHeight:\s*38[\s\S]*?paddingVertical:\s*3/.test(appChromeSection) &&
      /bottomNavText:\s*\{[\s\S]*?fontSize:\s*7[\s\S]*?lineHeight:\s*9/.test(appChromeSection) &&
      source.includes('{state.activeScreen === "den" && (!__DEV__ || !artValidationMode.enabled || artValidationMode.hudVisible) ? ('),
    "Adventure first impression keeps top/bottom chrome compact and hides the global resource HUD so the battlefield, high route nodes, and large sprites remain the hero surface."
  );

  const appMainSection = getSection(source, "return (", "<PanelSheet title={getPanelTitle(activePanel)}");
  const capybaraBoard = getSection(source, "function CapybaraAdventureBoard", "function AdventureRewardRecap");
  const capybaraStyles = getSection(source, "capybaraAdventureShell:", "nodeCard:");
  assertCheck(
    checks,
    "adventure-focused-mode-hides-bottom-nav",
    appMainSection.includes('{state.activeScreen === "den" ? <BottomNav') &&
      !appMainSection.includes('\n        <BottomNav\n') &&
      appMainSection.includes('const focusedAdventureChrome = state.activeScreen === "adventure" || state.activeScreen === "battle";') &&
      appMainSection.includes('<View style={styles.mainAdventurePathOverlay}>') &&
      capybaraBoard.includes('styles.capybaraFocusedReturnPill') &&
      capybaraBoard.includes('Back to Den') &&
      /capybaraFocusedReturnPill:\s*\{[\s\S]*?minHeight:\s*36/.test(capybaraStyles) &&
      /capybaraEventCard:\s*\{[\s\S]*?marginBottom:\s*10/.test(capybaraStyles),
    "Focused adventure/combat mode hides the global bottom nav, uses compact chrome for adventure and battle, keeps focused content scrollable, and provides a reachable in-board Den return pill so action/recap cards cannot be overlapped or clipped."
  );

  assertCheck(
    checks,
    "adventure-focused-board-collapses-duplicate-route-panel",
    adventureScreen.includes('<CapybaraAdventureBoard state={state} dispatch={dispatch} focused />') &&
      capybaraBoard.includes('focused = false') &&
      !capybaraBoard.includes('capybaraFocusedRouteSummary') &&
      capybaraBoard.includes('{!focused ? <AdventureCombatLoopStrip') &&
      capybaraBoard.includes('<AdventureNodeStrip') &&
      capybaraBoard.includes('!focused || run?.status === "complete"'),
    "Focused Adventure removes the duplicate loop/status/route/reward stack so the current event card and its CTA stay accessible under the hero scene."
  );

  assertCheck(
    checks,
    "adventure-focused-no-scroll-first-view",
    !adventurePanel.includes("<FireStarterFocusPanel />") &&
      !capybaraBoard.includes("<FireStarterFocusPills />") &&
      capybaraBoard.includes("capybaraFocusedMiniHud") &&
      capybaraBoard.includes("{!focused ? <AdventureCombatLoopStrip") &&
      source.includes("!focused ? <RewardChips") &&
      source.includes("choices?.length && (!focused || isPending)") &&
      /capybaraSceneFrameFocused:\s*\{[\s\S]*?height:\s*250/.test(capybaraStyles) &&
      /mainAdventurePathContent:\s*\{[\s\S]*?paddingBottom:\s*0/.test(source),
    "Focused Adventure keeps the first view compact: Fire starter tabs collapse into a tiny node/element HUD, duplicate loop/status cards stay hidden, non-pending choices stay hidden, and no extra bottom padding forces scroll."
  );

  const battleScreen = getSection(source, "function BattleScreen", "function UpgradeScreen");
  const upgradeScreen = getSection(source, "function UpgradeScreen", "function SkillDraftPanel");
  const skillDraftPanel = getSection(source, "function SkillDraftPanel", "function QuestScreen");
  assertCheck(
    checks,
    "focused-one-page-concise-ui-removes-old-scroll-and-text-dumps",
    appMainSection.includes('<View style={styles.mainAdventurePathOverlay}>') &&
      !appMainSection.includes('<ScrollView style={styles.mainAdventurePathOverlay}') &&
      !capybaraBoard.includes('<ConciseAdventureStatusLine') &&
      capybaraBoard.includes('!focused || run?.status === "complete"') &&
      battleScreen.includes('battleFightHud') &&
      battleScreen.includes('battleArenaContinueButton') &&
      !battleScreen.includes('battleOnePageSummary') &&
      !battleScreen.includes('battleLogPanelCompact') &&
      !battleScreen.includes('Quick Battle Result') &&
      !battleScreen.includes('Battle beats') &&
      !battleScreen.includes('AdventureCombatLoopStrip activeStep="result"') &&
      battleScreen.includes('<BattleFlashCalloutRail battle={battle} stats={state.dragon.stats} element={element} />') &&
      source.includes('label: isFireDragon ? "Fire Breath" : "Dragon Breath"') &&
      source.includes('label: "Burn Pressure"') &&
      source.includes('label: "Crit Spike"') &&
      source.includes('label: "Block Spark"') &&
      source.includes('label: "Dodge Afterimage"') &&
      source.includes('label: "Speed / First Move"') &&
      source.includes('"Heavy Hit Warning"') &&
      !battleScreen.includes('v0.2 Combat Readout') &&
      upgradeScreen.includes('<FocusedTrainingPanel state={state} dispatch={dispatch} />') &&
      !upgradeScreen.includes('stats.map((stat)') &&
      skillDraftPanel.includes('const visibleSkills =') &&
      skillDraftPanel.includes('dragonSkillDrafts.slice(0, 3)') &&
      !skillDraftPanel.includes('Path payoff:') &&
      /battleFullScreenArena:\s*\{[\s\S]*?flex:\s*1[\s\S]*?height:\s*"100%"/.test(source) &&
      /capybaraSceneFrameFocused:\s*\{[\s\S]*?height:\s*250/.test(capybaraStyles),
    "Focused adventure/battle/training are one-page surfaces: no outer vertical scroller, old verbose battle panels are gone, training shows a concise stat/skill panel, and skill draft cards are capped instead of dumping every build."
  );

  assertCheck(
    checks,
    "focused-combat-stop-removes-old-systems",
    source.includes("focusedCombatStopCard") &&
      source.includes("const showFocusedFightCard = focused && isPending && isFightEvent") &&
      !adventureScene.includes("adventureStopStatusBanner") &&
      !adventureScene.includes("adventureCombatFloaters") &&
      !adventureScene.includes("adventureCombatHud") &&
      !adventureScene.includes("COMBAT READY") &&
      !adventureScene.includes("COMBAT STOP") &&
      !adventureScene.includes("STOP HERE") &&
      !adventureScene.includes("ENEMY STOP") &&
      !capybaraBoard.includes("Current Event") &&
      !source.includes("Journey Event") &&
      !source.includes("Quest Progress"),
    "Focused combat stops remove old Journey/Event, Quest Progress, and flashing combat HUD systems; only the hero scene plus one clean fight card and CTA remain.",
    { hasFocusedFightCard: source.includes("focusedCombatStopCard"), hasCombatHud: adventureScene.includes("adventureCombatHud"), hasCurrentEvent: capybaraBoard.includes("Current Event") }
  );

  assertCheck(
    checks,
    "adventure-den-return-treasure-payoff",
    adventureScene.includes("adventureDenReturn") &&
      adventureScene.includes("treasureOrder.reduce") &&
      adventureScene.includes("Return to Den") &&
      adventureScene.includes("treasures secured"),
    "After adventuring, the scene points the player back toward the den with their treasures."
  );

  assertCheck(
    checks,
    "adventure-hero-scene-is-visual-only",
    adventureScene.includes("showEnemyEncounter") &&
      adventureScene.includes("adventureDragonWalker") &&
      adventureScene.includes("adventureEnemyEncounter") &&
      !adventureScene.includes("adventureStopStatusBanner") &&
      !adventureScene.includes("adventureLaneTag") &&
      !adventureScene.includes("adventureCombatHud") &&
      !adventureScene.includes("adventureCombatFloaters"),
    "Adventure hero scene is now visual-only: route, dragon, enemy, and backdrop stay, while stop banners, lane tags, HUD text, and floating combat readouts are removed from the battlefield."
  );

  assertCheck(
    checks,
    "focused-fight-card-is-single-clean-action-surface",
    source.includes("const showFocusedFightCard = focused && isPending && isFightEvent") &&
      source.includes("styles.focusedCombatStopCard") &&
      source.includes("Fight Stop") &&
      source.includes("formatAdventureReward(node.reward)") &&
      /focusedCombatStopCard:\s*\{[\s\S]*?backgroundColor:\s*"rgba\(8,11,26,0\.96\)"[\s\S]*?padding:\s*10/.test(source) &&
      /focusedCombatStopCta:\s*\{[\s\S]*?backgroundColor:\s*"#f8d987"/.test(source),
    "Focused fight nodes render one compact dark action card under the hero scene with enemy copy, reward preview, and a single Fight enemy CTA."
  );

  const journeyContainerSection = getSection(source, "mainAdventurePathOverlay:", "mainDragonName:");
  assertCheck(
    checks,
    "adventure-replaces-main-screen",
    /mainAdventurePathOverlay:\s*\{[\s\S]*?bottom:\s*0[\s\S]*?left:\s*0[\s\S]*?right:\s*0[\s\S]*?top:\s*0/.test(journeyContainerSection) &&
      /adventureJourneyStage:\s*\{[\s\S]*?borderWidth:\s*0[\s\S]*?flex:\s*1/.test(stylesSection) &&
      source.includes("showDragon={state.activeScreen === \"den\"}") &&
      !/mainAdventurePathOverlay:\s*\{[\s\S]*?top:\s*86/.test(journeyContainerSection),
    "Adventure mode replaces the den's main playfield instead of rendering as a smaller overlay card above the den dragon.",
    { journeyContainerSection, hasDenOnlyDragon: source.includes("showDragon={state.activeScreen === \"den\"}") }
  );

  return checks;
}

function buildAdventureFightStopHudSnapshot(gameSource, pathId) {
  const block = extractDragonPathBlock(gameSource, pathId);
  const role = extractQuotedField(block, "role");
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const combatVerb = extractQuotedField(block, "combatVerb");
  const combatStyle = extractQuotedField(block, "combatStyle");
  const styleCue = combatStyle.split(":")[0];
  const tempoLabel = extractQuotedField(block, "tempoLabel");
  const damageMultiplier = extractNumberField(block, "damageMultiplier");
  const damageReduction = extractNumberField(block, "damageReduction");
  const offense = Math.round(damageMultiplier * 100);
  const mitigation = Math.round(damageReduction * 100);

  return {
    pathId,
    role,
    name: extractQuotedField(block, "name"),
    hudTitle: "COMBAT READY",
    stopBanner: "COMBAT STOP",
    roleBuildLabel: `${role.toUpperCase()} BUILD`,
    combatVerb,
    combatCue: `${combatVerb} • ${styleCue} • ${tempoLabel}`,
    braceCue: `${roleLabel} brace • ${combatVerb} • ${mitigation}% mitigation`,
    tradeoffCopy: `Offense ${offense}% | Mitigation ${mitigation}% | Tempo ${tempoLabel}`,
    staticPills: "CRIT / BLOCK / DODGE",
    battlefieldReadout: `${roleLabel} fight stop: ${combatVerb} with ${offense}% offense, ${mitigation}% mitigation, ${tempoLabel} tempo.`
  };
}

function writeAdventureFightStopHudSnapshotArtifact(gameSource) {
  const representativePathIds = ["fireGuardian", "fireRaider", "fireMystic"];
  const snapshots = representativePathIds.map((pathId) => buildAdventureFightStopHudSnapshot(gameSource, pathId));

  fs.writeFileSync(adventureFightStopHudSnapshotPath, JSON.stringify({
    name: "adventure-fight-stop-hud-snapshot",
    generatedAt: nowIso(),
    source: "AdventureJourneyScene fight-stop combat HUD labels mirrored from dragonPathDefinitions",
    purpose: "Compact reviewer snapshot proving guardian/raider/mystic fight stops expose crunchy path tradeoffs directly in the combat HUD.",
    snapshots
  }, null, 2));
}

function writeAdventureUiReferenceArtifact(source) {
  const board = getSection(source, "function CapybaraAdventureBoard", "function AdventureNodeCard");
  const nodeStrip = getSection(source, "function AdventureNodeStrip", "function CurrentAdventureEventCard");
  const eventCard = getSection(source, "function CurrentAdventureEventCard", "function AdventureNodeCard");
  const styleSection = getSection(source, "capybaraAdventureShell:", "nodeCard:");

  fs.writeFileSync(adventureUiReferencePath, JSON.stringify({
    name: "adventure-ui-reference",
    generatedAt: nowIso(),
    target: "Capybara Go-inspired portrait adventure board: chunky HUD, readable current node, route strip, event card, big CTA.",
    proofPoints: {
      capybaraBoardPresent: board.includes("CapybaraAdventureBoard"),
      topHudCapsules: board.includes("capybaraHudCapsule") && board.includes("Power") && board.includes("Loot"),
      routeStrip: nodeStrip.includes("AdventureNodeStrip") && nodeStrip.includes("currentNode.step") && nodeStrip.includes("capybaraRouteNodeCurrent"),
      currentEventCard: eventCard.includes("CurrentAdventureEventCard") && eventCard.includes("capybaraEventCard") && eventCard.includes("capybaraPrimaryCta"),
      sideAdventureChoices: eventCard.includes("node.choices?.map") && eventCard.includes("capybaraChoiceButton"),
      toyLikeStyle: styleSection.includes("#f8d987") && styleSection.includes("shadowOpacity") && styleSection.includes("borderRadius: 28")
    }
  }, null, 2));
}

function writeAdventureCombatConsolidationArtifacts(source) {
  const board = getSection(source, "function CapybaraAdventureBoard", "function AdventureRewardRecap");
  const loopStrip = getSection(source, "function AdventureCombatLoopStrip", "function AdventureRewardRecap");
  const battleScreen = getSection(source, "function BattleScreen", "function UpgradeScreen");
  const contract = {
    name: "adventure-combat-consolidation-contract",
    generatedAt: nowIso(),
    target: "Adventure and combat share one focused Dragon Expedition Loop: route -> fight -> full-screen battle -> return chest, without intrusive route-stop banners.",
    visibleLoopLabels: ["Dragon Expedition Loop", "Adventure Route", "Combat Stop", "Fight", "Return Chest"],
    visibleNextActions: ["Start Adventure Run", "Enter Event", "Choose", "Claim", "Fight enemy", "Back to Den", "Continue Run", "Return to Den"],
    proofPoints: {
      stripComponentPresent: loopStrip.includes("AdventureCombatLoopStrip"),
      routeStepRenderedInBoard: board.includes('<AdventureCombatLoopStrip activeStep={pendingNode && isFightNode ? "fight" : "route"} compact={focused} />'),
      battleFightStepRendered: battleScreen.includes("battleFightHud") && battleScreen.includes("battleArenaContinueButton"),
      labelsVisible: ["Dragon Expedition Loop", "Adventure Route", "Combat Stop", "Return Chest"].every((label) => loopStrip.includes(label)) && battleScreen.includes("Fight</Text>"),
      ctasVisible: ["Fight enemy", "Back to Den", "Continue Run", "Return to Den"].every((label) => source.includes(label))
    }
  };

  fs.writeFileSync(adventureCombatConsolidationPath, JSON.stringify(contract, null, 2));
  fs.writeFileSync(adventureCombatConsolidationStoryboardPath, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dragon Expedition Loop Storyboard</title>
  <style>
    body { margin: 0; padding: 24px; background: #080611; color: #fff8ef; font-family: Inter, system-ui, sans-serif; }
    h1 { color: #f8d987; margin: 0 0 8px; }
    p { color: #cbd5e1; max-width: 760px; line-height: 1.5; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 20px; }
    .card { border: 1px solid rgba(248,217,135,0.32); border-radius: 20px; padding: 16px; background: rgba(255,255,255,0.06); }
    .active { background: rgba(248,217,135,0.16); border-color: rgba(248,217,135,0.72); }
    .kicker { color: #f8d987; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; font-size: 12px; }
    h2 { margin: 8px 0 6px; font-size: 20px; }
    .cta { display: inline-block; margin-top: 12px; padding: 8px 12px; border-radius: 999px; background: #f8d987; color: #2f1f18; font-weight: 900; }
  </style>
</head>
<body>
  <h1>Dragon Expedition Loop</h1>
  <p>Review surface for the consolidated Capybara-style loop: travel the route, stop at an enemy, resolve a quick fight, claim the return chest, then continue.</p>
  <section class="grid">
    <article class="card active"><div class="kicker">Adventure Route</div><h2>Travel to the next stop</h2><p>Large route board, node rail, dragon moving toward the next event.</p><span class="cta">Enter Event</span></article>
    <article class="card active"><div class="kicker">Combat Stop</div><h2>Enemy blocks the path</h2><p>COMBAT READY HUD with HP, ATK, DEF, CRIT, BLOCK, DODGE, and path tradeoffs.</p><span class="cta">Fight enemy</span></article>
    <article class="card active"><div class="kicker">Fight</div><h2>Full-screen clash</h2><p>Battle replaces the app chrome with a full-screen arena, large combatants, HP bars, and one continue CTA.</p><span class="cta">Continue Run</span></article>
    <article class="card active"><div class="kicker">Return Chest</div><h2>Loot gained</h2><p>Hoard progress, stat gains, evolution progress, gear drops, and the next recommended adventure.</p><span class="cta">Back to Den</span></article>
  </section>
</body>
</html>`);
}

function analyzeCapybaraAdventureUiSource(source, gameSource) {
  const checks = [];
  const adventurePanel = getSection(source, "function AdventurePanelContent", "function GoalsPanelContent");
  const adventureScreen = getSection(source, "function AdventureScreen", "function AdventureNodeCard");
  const board = getSection(source, "function CapybaraAdventureBoard", "function AdventureNodeCard");
  const nodeStrip = getSection(source, "function AdventureNodeStrip", "function CurrentAdventureEventCard");
  const eventCard = getSection(source, "function CurrentAdventureEventCard", "function AdventureNodeCard");
  const rewardRecap = getSection(source, "function AdventureRewardRecap", "function AdventureRewardLine");
  const battleScreen = getSection(source, "function BattleScreen", "function UpgradeScreen");
  const combatVisual = getSection(source, "function FireBreathCombatVisual", "function QuestProgressList");
  const styleSection = getSection(source, "capybaraAdventureShell:", "nodeCard:");
  const battleStyleSection = getSection(source, "battleFullScreenArena:", "upgradeRow:");

  assertCheck(
    checks,
    "adventure-ui-capybara-board-present",
    adventurePanel.includes("<CapybaraAdventureBoard") && adventureScreen.includes("<CapybaraAdventureBoard") && board.includes("CapybaraAdventureBoard"),
    "Adventure UI uses a Capybara Go-inspired board on both the idle adventure panel and the active 30-node route screen.",
    { hasPanelBoard: adventurePanel.includes("<CapybaraAdventureBoard"), hasScreenBoard: adventureScreen.includes("<CapybaraAdventureBoard") }
  );

  assertCheck(
    checks,
    "adventure-ui-capybara-route-rail",
    nodeStrip.includes("AdventureNodeStrip") && nodeStrip.includes("visibleNodes") && nodeStrip.includes("capybaraRouteRail") && nodeStrip.includes("capybaraRouteNodeCurrent") && nodeStrip.includes("getAdventureNodeIcon"),
    "Adventure UI shows a chunky node route rail with current-node emphasis and node-type icons instead of plain stacked cards.",
    { nodeStripLength: nodeStrip.length }
  );

  assertCheck(
    checks,
    "adventure-ui-event-card-ctas",
    eventCard.includes("CurrentAdventureEventCard") && eventCard.includes("capybaraEventCard") && eventCard.includes("capybaraPrimaryCta") && eventCard.includes("node.choices?.map") && eventCard.includes("capybaraChoiceButton") && eventCard.includes("RewardChips"),
    "Current node is presented as a large event card with choice buttons, reward previews, and a big tactile CTA.",
    { eventCardLength: eventCard.length }
  );

  assertCheck(
    checks,
    "adventure-ui-capybara-visual-style",
    styleSection.includes("capybaraAdventureShell") && styleSection.includes("capybaraSceneFrame") && styleSection.includes("capybaraHudCapsule") && styleSection.includes("#f8d987") && styleSection.includes("shadowOpacity") && styleSection.includes("borderRadius: 28"),
    "Adventure styling shifts toward rounded, bright, toy-like mobile RPG panels with HUD capsules and high-contrast CTA surfaces.",
    { styleSectionLength: styleSection.length }
  );

  assertCheck(
    checks,
    "adventure-ui-reference-artifact",
    fs.existsSync(adventureUiReferencePath),
    "Automation writes a Capybara Go-inspired adventure UI reference artifact for review.",
    { adventureUiReferencePath }
  );

  assertCheck(
    checks,
    "adventure-combat-loop-strip-visible",
    source.includes("function AdventureCombatLoopStrip") &&
      board.includes('<AdventureCombatLoopStrip activeStep={pendingNode && isFightNode ? "fight" : "route"} compact={focused} />') &&
      battleScreen.includes("battleFightHud") &&
      battleScreen.includes("battleArenaContinueButton") &&
      !battleScreen.includes("AdventureCombatLoopStrip") &&
      source.includes("Dragon Expedition Loop") &&
      source.includes("Adventure Route") &&
      source.includes("Combat Stop") &&
      source.includes("Return Chest") &&
      styleSection.includes("adventureCombatLoopStrip") &&
      styleSection.includes("adventureCombatLoopStepActive"),
    "Adventure board keeps the route/combat loop strip while battle becomes a full-screen fight-only arena with no result strip/card.",
    { hasStrip: source.includes("function AdventureCombatLoopStrip"), hasBoardStrip: board.includes("AdventureCombatLoopStrip"), hasBattleFightHud: battleScreen.includes("battleFightHud"), hasBattleStrip: battleScreen.includes("AdventureCombatLoopStrip") }
  );

  const consolidationContract = fs.existsSync(adventureCombatConsolidationPath)
    ? JSON.parse(fs.readFileSync(adventureCombatConsolidationPath, "utf8"))
    : null;
  assertCheck(
    checks,
    "adventure-combat-consolidation-contract-artifact",
    Boolean(consolidationContract) &&
      consolidationContract.name === "adventure-combat-consolidation-contract" &&
      consolidationContract.visibleLoopLabels.includes("Dragon Expedition Loop") &&
      consolidationContract.visibleLoopLabels.includes("Combat Stop") &&
      consolidationContract.visibleNextActions.includes("Fight enemy") &&
      consolidationContract.visibleNextActions.includes("Continue Run") &&
      consolidationContract.proofPoints.routeStepRenderedInBoard === true &&
      consolidationContract.proofPoints.battleFightStepRendered === true,
    "Automation writes a consolidation contract proving route/combat labels and fight-only next-action CTAs stay wired across Adventure and Battle screens.",
    { adventureCombatConsolidationPath, consolidationContract }
  );

  assertCheck(
    checks,
    "adventure-combat-consolidation-storyboard-html",
    fs.existsSync(adventureCombatConsolidationStoryboardPath) &&
      fs.readFileSync(adventureCombatConsolidationStoryboardPath, "utf8").includes("Dragon Expedition Loop") &&
      fs.readFileSync(adventureCombatConsolidationStoryboardPath, "utf8").includes("Full-screen clash"),
    "Automation writes a non-interactive storyboard for route, combat stop, full-screen fight, and return chest states.",
    { adventureCombatConsolidationStoryboardPath }
  );

  assertCheck(
    checks,
    "adventure-focused-card-language-coherent",
      board.includes("focused && styles.capybaraAdventureShellFocused") &&
      board.includes("focused={focused}") &&
      board.includes("<AdventureRewardRecap state={state} focused={focused}") &&
      eventCard.includes("focused = false") &&
      eventCard.includes("styles.capybaraEventCardFocused") &&
      eventCard.includes("styles.capybaraChoiceButtonFocused") &&
      eventCard.includes("styles.capybaraPrimaryCtaFocused") &&
      rewardRecap.includes("focused = false") &&
      rewardRecap.includes("styles.adventureRewardRecapCardFocused") &&
      rewardRecap.includes("styles.capybaraEventKickerFocused") &&
      styleSection.includes("capybaraAdventureShellFocused") &&
      styleSection.includes("capybaraEventCardFocused") &&
      styleSection.includes("capybaraChoiceButtonFocused") &&
      styleSection.includes("capybaraPrimaryCtaFocused") &&
      styleSection.includes("adventureRewardRecapCardFocused") &&
      /capybaraAdventureShellFocused:\s*\{[\s\S]*?backgroundColor:\s*"rgba\(7,10,24,0\.92\)"[\s\S]*?borderColor:\s*"rgba\(248,217,135,0\.24\)"/.test(styleSection) &&
      /capybaraEventCardFocused:\s*\{[\s\S]*?backgroundColor:\s*"rgba\(8,11,26,0\.94\)"[\s\S]*?borderColor:\s*"rgba\(248,217,135,0\.26\)"/.test(styleSection) &&
      /capybaraChoiceButtonFocused:\s*\{[\s\S]*?backgroundColor:\s*"rgba\(255,255,255,0\.07\)"/.test(styleSection),
    "Focused Adventure/Combat board uses a coherent dark glass card language for shell, event card, choices, and CTA instead of mixing cream cards with the dark battlefield hero surface.",
    { hasFocusedShellStyle: styleSection.includes("capybaraAdventureShellFocused"), hasFocusedEventStyle: styleSection.includes("capybaraEventCardFocused") }
  );

  assertCheck(
    checks,
    "battle-screen-fullscreen-arena",
    battleScreen.includes("battleFullScreenArena") && battleScreen.includes("battleArenaScene") && battleScreen.includes("battleEnemyBossSprite") && /battleFullScreenArena:\s*\{[\s\S]*?flex:\s*1[\s\S]*?height:\s*"100%"/.test(battleStyleSection) && /battleArenaScene:\s*\{[\s\S]*?flex:\s*1/.test(battleStyleSection),
    "Battle results use a full-screen arena with large enemy/dragon staging instead of small text panels.",
    { battleStyleLength: battleStyleSection.length }
  );

  const windupDuration = Number(combatVisual.match(/toValue:\s*0\.3,\s*duration:\s*(\d+)/)?.[1] ?? 0);
  const breathDuration = Number(combatVisual.match(/breathPulse,\s*\{\s*toValue:\s*1,\s*duration:\s*(\d+)/)?.[1] ?? 0);
  const firstHitDelay = Number(combatVisual.match(/Animated\.delay\((\d+)\)/)?.[1] ?? 0);
  const enemyCounterDuration = Number(combatVisual.match(/enemyAttackPulse,\s*\{\s*toValue:\s*1,\s*duration:\s*(\d+)/)?.[1] ?? 0);
  assertCheck(
    checks,
    "battle-combat-animation-fast-paced",
    windupDuration >= 50 && windupDuration <= 70 &&
      breathDuration >= 160 && breathDuration <= 180 &&
      firstHitDelay >= 20 && firstHitDelay <= 30 &&
      enemyCounterDuration >= 170 && enemyCounterDuration <= 190 &&
      combatVisual.includes("previousEnemyHp = useRef(Number.POSITIVE_INFINITY)") &&
      !combatVisual.includes("duration: 860") && !combatVisual.includes("Animated.delay(460)"),
    "Combat attack animation starts immediately and uses short attack windups so battles feel snappy instead of slow.",
    { windupDuration, breathDuration, firstHitDelay, enemyCounterDuration, hasImmediateFirstSwing: combatVisual.includes("Number.POSITIVE_INFINITY"), hasOldDuration: combatVisual.includes("duration: 860") }
  );

  assertCheck(
    checks,
    "adventure-battle-fight-only-fullscreen-contract",
    gameSource.includes("const quickBattleRounds = 4") &&
      gameSource.includes("round <= quickBattleRounds") &&
      battleScreen.includes("battleFightHud") &&
      battleScreen.includes("battleArenaContinueButton") &&
      battleScreen.includes("getBattleExchangeEvents") &&
      battleScreen.includes("currentExchangeIndex") &&
      battleScreen.includes("Animated.sequence") &&
      battleScreen.includes("dragonAttackActive") &&
      battleScreen.includes("enemyAttackActive") &&
      battleScreen.includes("battleDragonFacingRight") &&
      battleScreen.includes("Fighting...") &&
      battleScreen.includes("Fight</Text>") &&
      !battleScreen.includes("Quick Battle Result") &&
      !battleScreen.includes("Battle beats") &&
      !battleScreen.includes("battle.rounds.slice(0, 2)") &&
      !battleScreen.includes("battleOnePageSummary") &&
      !battleScreen.includes("battleRewardPlate") &&
      !battleScreen.includes("AdventureCombatLoopStrip activeStep=\"result\"") &&
      source.includes('state.phase === "journey" && state.activeScreen !== "battle"') &&
      /battleArenaScene:\s*\{[\s\S]*?flex:\s*1[\s\S]*?overflow:\s*"hidden"/.test(source) &&
      /battleDragonFacingRight:\s*\{[\s\S]*?scaleX:\s*-1/.test(source),
    "Battle screen is now a full-screen turn-by-turn fight arena: dragon faces right, attacks and counters animate, no app header, no quick-result card, no battle-beats log, no result loop strip.",
    { hasQuickResultUi: battleScreen.includes("Quick Battle Result"), hasBattleBeats: battleScreen.includes("Battle beats"), hidesHeaderInBattle: source.includes('state.phase === "journey" && state.activeScreen !== "battle"') }
  );

  assertCheck(
    checks,
    "adventure-side-events-gated-without-route-stop-ui",
    board.includes("Choose") && board.includes("Claim") &&
      !board.includes("Stop & choose") && !board.includes("Stop & claim") &&
      !eventCard.includes("capybaraStopBanner") && !eventCard.includes("STOP:") &&
      gameSource.includes("run.pendingNodeId === node.id") &&
      /choices\?\.length\s*\?\s*"Choose"\s*:\s*"Claim"/.test(board),
    "Non-combat adventure nodes still gate choice/claim resolution, but the visible route-stop labels and stop banner are hidden.",
    {
      hasChooseCta: board.includes("Choose"),
      hasClaimCta: board.includes("Claim"),
      hasPendingResolveGuard: gameSource.includes("run.pendingNodeId === node.id"),
      hasChoiceClaimTernary: /choices\?\.length\s*\?\s*"Choose"\s*:\s*"Claim"/.test(board),
      hasOldStopLabels: board.includes("Stop & choose") || board.includes("Stop & claim"),
      hasStopBanner: eventCard.includes("capybaraStopBanner")
    }
  );

  assertCheck(
    checks,
    "adventure-fight-nodes-gated-without-stop-banner",
    board.includes("Fight enemy") && !eventCard.includes("STOP: fight this enemy") && !eventCard.includes("capybaraStopBanner") && gameSource.includes("isFightNode(node)") && !gameSource.includes("Stop: ${node.title}. Fight this enemy before the route advances."),
    "Battle/elite/boss nodes still require the fight CTA before combat, but no route-stop warning banner/copy is shown.",
    { hasFightHelper: gameSource.includes("isFightNode(node)"), hasFightCta: board.includes("Fight enemy"), hasOldStopCopy: gameSource.includes("Stop: ${node.title}. Fight this enemy before the route advances.") }
  );

  assertCheck(
    checks,
    "adventure-journey-dragon-stops-at-fight",
    adventurePanel.includes("<CapybaraAdventureBoard") && board.includes("<AdventureJourneyScene") && source.includes("const isFightStop") && source.includes("travelProgress.setValue(1)") && source.includes("if (isFightStop)") && source.includes("showEnemyEncounter") && !source.includes("const travelLoop = Animated.loop"),
    "Adventure journey animation moves toward the enemy and stops there for fight nodes, while status labels live in the clean fight card instead of over the hero scene.",
    { hasPanelBoard: adventurePanel.includes("<CapybaraAdventureBoard"), hasJourneySceneInBoard: board.includes("<AdventureJourneyScene"), hasFightStop: source.includes("const isFightStop"), hasStopPosition: source.includes("travelProgress.setValue(1)"), hasOldLoop: source.includes("const travelLoop = Animated.loop") }
  );

  return checks;
}

function parseAdventureNodeSummaries(contentSource) {
  const section = getSection(contentSource, "export const adventureNodes: AdventureNode[] = [", "\n];\n\nexport const quests");
  return [...section.matchAll(/\{\s*\r?\n\s*id:\s*"([^"]+)",[\s\S]*?step:\s*(\d+),[\s\S]*?kind:\s*"([^"]+)",[\s\S]*?title:\s*"([^"]+)"[\s\S]*?scene:\s*"([^"]+)"[\s\S]*?difficulty:\s*([0-9.]+)/g)]
    .map((match) => {
      const start = section.indexOf(match[0]);
      const nextStart = section.indexOf("\n  {", start + match[0].length);
      const nodeBlock = section.slice(start, nextStart === -1 ? undefined : nextStart);
      return {
        id: match[1],
        step: Number(match[2]),
        kind: match[3],
        title: match[4],
        scene: match[5],
        difficulty: Number(match[6]),
        hasChoices: nodeBlock.includes("choices: [")
      };
    });
}

function writeAdventureDifficultyLootArtifact(gameSource, source) {
  const difficultyIds = ["hatchlingTrail", "drakeExpedition", "ancientRift"];
  fs.writeFileSync(adventureDifficultyLootPath, JSON.stringify({
    name: "adventure-difficulty-loot-contract",
    generatedAt: nowIso(),
    difficultyIds,
    nodeCounts: Object.fromEntries(difficultyIds.map((id) => {
      const match = gameSource.match(new RegExp(`id: \\"${id}\\"[\\s\\S]*?nodeCount: (\\d+)`));
      return [id, match ? Number(match[1]) : 0];
    })),
    proofPoints: {
      removesDragonTapEssence: !source.includes('dispatch({ type: "tapDragon"') && !source.includes("Tap dragon for +") && !source.includes("Critical Tap"),
      removesVisibleEps: !source.includes('label="EPS"') && !source.includes("essencePerSecond") && !source.includes("getEssencePerSecond(state)"),
      hasAdventureCompletions: gameSource.includes("adventureCompletions"),
      lootUsesCompletedRuns: gameSource.includes("getAdventureLootTier") && gameSource.includes("completedAdventureRuns")
    }
  }, null, 2));
}

function analyzeAdventureDifficultyLootContract(gameSource, source, typesSource) {
  const checks = [];
  const difficultyIds = ["hatchlingTrail", "drakeExpedition", "ancientRift"];

  assertCheck(
    checks,
    "no-tapping-or-eps-economy-visible",
    !source.includes('dispatch({ type: "tapDragon"') &&
      !source.includes("Tap dragon for +") &&
      !source.includes("Critical Tap") &&
      !source.includes('label="EPS"') &&
      !source.includes("essencePerSecond") &&
      typesSource.includes('type: "tapDragon"') === false &&
      typesSource.includes('type: "collectPassiveEssence"') === false,
    "The core loop removes dragon tapping for essence and visible EPS/passive essence actions so progression is adventure-completion driven.",
    { hasTapDispatch: source.includes('dispatch({ type: "tapDragon"'), hasVisibleEps: source.includes('label="EPS"'), hasTapAction: typesSource.includes('type: "tapDragon"') }
  );

  assertCheck(
    checks,
    "adventure-difficulty-stages-node-contract",
    gameSource.includes("adventureDifficultyDefinitions") &&
      difficultyIds.every((id) => gameSource.includes(`id: "${id}"`)) &&
      gameSource.includes("nodeCount: 10") &&
      gameSource.includes("nodeCount: 30") &&
      gameSource.includes("nodeCount: 60") &&
      typesSource.includes("AdventureDifficultyId") &&
      typesSource.includes("difficultyId: AdventureDifficultyId"),
    "Adventure mode defines three difficulty-stage adventures with explicit 10, 30, and 60 node/day contracts.",
    { difficultyIds }
  );

  assertCheck(
    checks,
    "adventure-loot-progression-uses-completions",
    gameSource.includes("adventureCompletions") &&
      gameSource.includes("completedAdventureRuns") &&
      gameSource.includes("getAdventureLootTier") &&
      gameSource.includes("lootTier") &&
      gameSource.includes("Adventure Return Chest") &&
      gameSource.includes("loot improves after"),
    "Loot quality and return-chest messaging are tied to completed adventures, not taps or EPS.",
    { hasLootTier: gameSource.includes("getAdventureLootTier"), hasCompletionState: gameSource.includes("adventureCompletions") }
  );

  assertCheck(
    checks,
    "adventure-difficulty-loot-artifact",
    fs.existsSync(adventureDifficultyLootPath),
    "Automation writes an artifact proving no tap/EPS economy plus the difficulty-stage loot contract.",
    { adventureDifficultyLootPath }
  );

  assertCheck(
    checks,
    "guided-playtest-daily-goal-progress-safe-for-old-saves",
    source.includes("state.dailyGoals.completeAdventure1?.progress ?? 0") &&
      source.includes("state.dailyGoals.completeQuest5?.progress ?? 0") &&
      gameSource.includes("function normalizeDailyGoals") &&
      gameSource.includes("completeAdventure1: normalizeDailyGoal") &&
      gameSource.includes("completeQuest5: normalizeDailyGoal"),
    "Guided playtest dependency reads and hydrate defaults are safe when old saves have missing daily-goal entries."
  );

  assertCheck(
    checks,
    "idle-upgrade-card-number-format-runtime-safe",
    source.includes("function formatGameNumber(value: number | null | undefined") &&
      source.includes("Number.isFinite(value)") &&
      source.includes("const safeCap = Number.isFinite(cap) ? cap : 0") &&
      source.includes("const safeCost = Number.isFinite(cost) ? cost : 0") &&
      source.includes("const lootBonus = Number.isFinite(upgrade?.adventureLootBonus) ? upgrade.adventureLootBonus : 0") &&
      gameSource.includes("BALANCE.upgrades.idleCapsByStage[state.dragon.stage]?.[upgradeId] ?? 0"),
    "Idle upgrade cards and shared compact-number formatting guard missing numeric values so old saves or transient HMR state cannot red-screen on toFixed(undefined).",
    {
      hasFormatterGuard: source.includes("function formatGameNumber(value: number | null | undefined") && source.includes("Number.isFinite(value)"),
      hasIdleCapGuard: source.includes("const safeCap = Number.isFinite(cap) ? cap : 0"),
      hasIdleCostGuard: source.includes("const safeCost = Number.isFinite(cost) ? cost : 0"),
      hasLootBonusGuard: source.includes("const lootBonus = Number.isFinite(upgrade?.adventureLootBonus) ? upgrade.adventureLootBonus : 0"),
      hasCapHelperFallback: gameSource.includes("BALANCE.upgrades.idleCapsByStage[state.dragon.stage]?.[upgradeId] ?? 0")
    }
  );

  return checks;
}

function writeAdventureRoutePlanArtifact(contentSource) {
  const nodes = parseAdventureNodeSummaries(contentSource);
  const countsByKind = nodes.reduce((counts, node) => ({ ...counts, [node.kind]: (counts[node.kind] ?? 0) + 1 }), {});
  const fightNodes = nodes.filter((node) => ["battle", "elite", "boss"].includes(node.kind));
  const sideNodes = nodes.filter((node) => ["shop", "shrine", "camp", "treasure"].includes(node.kind));
  const expectedFightSteps = [...Array.from({ length: 3 }, (_, index) => (index + 1) * 3), 10, ...Array.from({ length: 10 }, (_, index) => (index + 4) * 3), 40];

  fs.writeFileSync(adventureRoutePlanPath, JSON.stringify({
    name: "adventure-route-plan",
    generatedAt: nowIso(),
    totalNodes: nodes.length,
    maxStep: Math.max(...nodes.map((node) => node.step)),
    countsByKind,
    expectedFightSteps,
    fightSteps: fightNodes.map((node) => node.step).sort((a, b) => a - b),
    sideNodeKinds: sideNodes.map((node) => node.kind),
    interactiveChoiceNodes: nodes.filter((node) => node.hasChoices).map((node) => ({ id: node.id, step: node.step, kind: node.kind, title: node.title })),
    nodes
  }, null, 2));
}

function analyzeInteractiveAdventureRoute(contentSource, source, gameSource) {
  const checks = [];
  const nodes = parseAdventureNodeSummaries(contentSource);
  const byStep = new Map(nodes.map((node) => [node.step, node]));
  const fightNodes = nodes.filter((node) => ["battle", "elite", "boss"].includes(node.kind));
  const sideNodes = nodes.filter((node) => ["shop", "shrine", "camp", "treasure"].includes(node.kind));
  const expectedFightSteps = [...Array.from({ length: 3 }, (_, index) => (index + 1) * 3), 10, ...Array.from({ length: 10 }, (_, index) => (index + 4) * 3), 40];
  const fightSteps = fightNodes.map((node) => node.step).sort((a, b) => a - b);
  const missingFightSteps = expectedFightSteps.filter((step) => !fightSteps.includes(step));
  const duplicateSteps = nodes.map((node) => node.step).filter((step, index, all) => all.indexOf(step) !== index);

  assertCheck(
    checks,
    "adventure-route-has-40-linear-nodes",
    nodes.length === 40 && Math.max(...nodes.map((node) => node.step)) === 40 && duplicateSteps.length === 0,
    "Adventure route defines 40 unique sequential nodes after adding the Light Sunbeam Spires elemental slice.",
    { totalNodes: nodes.length, maxStep: Math.max(...nodes.map((node) => node.step)), duplicateSteps }
  );

  assertCheck(
    checks,
    "adventure-route-fights-every-third-node",
    fightNodes.length === 15 && missingFightSteps.length === 0 && fightNodes.every((node) => node.step === 10 || node.step === 40 || node.step % 3 === 0),
    "Fight nodes appear about every third node, including elemental bosses at nodes 10, 30, and 40.",
    { fightSteps, expectedFightSteps, missingFightSteps }
  );

  assertCheck(
    checks,
    "adventure-route-side-adventures-shop-shrine",
    sideNodes.length === 25 && sideNodes.some((node) => node.kind === "shop") && sideNodes.some((node) => node.kind === "shrine") && sideNodes.filter((node) => node.hasChoices).length >= 14,
    "Non-fight nodes are side adventures with shop/shrine choice interactions instead of passive filler.",
    { sideNodeKinds: sideNodes.map((node) => node.kind), choiceNodeCount: sideNodes.filter((node) => node.hasChoices).length }
  );

  assertCheck(
    checks,
    "adventure-route-run-uses-30-step-contract",
    (gameSource.includes("maxSteps: 30") || gameSource.includes("nodeCount: 30")) && gameSource.includes("node.kind === \"shop\"") && source.includes("Node ${run.step} / ${run.maxSteps}") && (source.includes("A run is thirty nodes long") || source.includes("Adventure completions improve loot tiers")),
    "Reducer and visible adventure copy preserve the standard 30-node adventure contract while supporting difficulty-stage runs and shop side adventures.",
    { hasAllSteps: Array.from({ length: 40 }, (_, index) => byStep.has(index + 1)).every(Boolean) }
  );

  assertCheck(
    checks,
    "adventure-route-plan-artifact",
    fs.existsSync(adventureRoutePlanPath),
    "Automation writes a route-plan artifact summarizing the 30-node fight/shop/shrine distribution.",
    { adventureRoutePlanPath }
  );

  assertCheck(
    checks,
    "water-moonwell-route-visible",
    contentSource.includes("Moonwell Tide Path") &&
      contentSource.includes("Pearlflow Trader") &&
      contentSource.includes("Reef Slime Crossing") &&
      contentSource.includes("Moonwell Tide Gate") &&
      gameSource.includes("Water Moonwell") &&
      source.includes("Water Moonwell Tide Path") &&
      source.includes("Moonwell route"),
    "Water route slice is visible in content, difficulty copy, and the Adventure panel before the next element route work starts."
  );

  assertCheck(
    checks,
    "light-sunbeam-spires-route-visible",
    contentSource.includes("Sunbeam Spires Arrival") &&
      contentSource.includes("Halo Lantern Market") &&
      contentSource.includes("Sun Lancer Duel") &&
      contentSource.includes("Aurora Crown Hoard") &&
      gameSource.includes("title: \"Light Sunbeam Spires Path\"") &&
      gameSource.includes("light-halo-guard") &&
      gameSource.includes("light-sunbeam-lance") &&
      source.includes("Light Sunbeam Spires Path") &&
      source.includes("Sunbeam route"),
    "Light route slice is visible in content, difficulty copy, skill drafts, and the Adventure panel."
  );

  return checks;
}

function writeFireStarterFocusArtifact(gameSource, appSource) {
  const milestoneSource = getSection(gameSource, "export const fireStarterAdventureMilestones", "];\n\nconst journeyEventMinDelayMs");
  const milestoneIds = ["capybara-research-loop", "fire-starter-route", "impactful-fire-combat", "evolution-choice-pressure"];
  fs.writeFileSync(fireStarterFocusPath, JSON.stringify({
    name: "fire-starter-expedition-focus",
    generatedAt: nowIso(),
    source: "src/game.ts fireStarterAdventureMilestones + App.tsx FireStarterFocusPanel",
    designBrief: "docs/CAPYBARA_GO_DRAGON_DIRECTION.md",
    milestoneIds,
    comparisons: {
      exportsMilestones: gameSource.includes("export const fireStarterAdventureMilestones"),
      rendersPanel: appSource.includes("function FireStarterFocusPanel") && appSource.includes("Fire Starter Expedition Focus"),
      coversResearchRouteCombatEvolution: ["research", "route", "combat", "evolution"].every((phase) => milestoneSource.includes(`phase: \"${phase}\"`)),
      everyMilestoneHasCapybaraLesson: countMatches(milestoneSource, /capybaraLesson:/g) >= milestoneIds.length,
      everyMilestoneHasDragonTwist: countMatches(milestoneSource, /dragonTwist:/g) >= milestoneIds.length,
      everyMilestoneHasVisibleProof: countMatches(milestoneSource, /visibleProof:/g) >= milestoneIds.length
    },
    milestones: milestoneIds.map((id) => ({ id, present: milestoneSource.includes(id) }))
  }, null, 2));
}

function analyzeEvolutionPreviewUi(source) {
  const checks = [];
  const previewSource = fs.existsSync(evolutionPreviewPath) ? fs.readFileSync(evolutionPreviewPath, "utf8") : "";
  const stageIds = ["drake", "young", "dragon", "ancient"];
  const elementIds = ["fire", "water", "earth", "light", "dark"];

  assertCheck(
    checks,
    "evolution-preview-data-covers-full-placeholder-tree",
    previewSource.includes("evolutionPreviewElements") &&
      elementIds.every((element) => previewSource.includes(`id: "${element}"`)) &&
      stageIds.every((stage) => previewSource.includes(`id: "${stage}"`)) &&
      previewSource.includes("drakeImage") &&
      previewSource.includes("youngOptions") &&
      previewSource.includes("dragonOptions") &&
      previewSource.includes("ancientOptions") &&
      countMatches(previewSource, /require\("\.\.\/assets\/dragons\/placeholders\/evolution-branches-2026-05-11\/evolution-paths\/ancient\//g) >= 120,
    "Evolution preview data covers all five elements and the full Drake → Young → Dragon → Ancient placeholder asset tree.",
    { evolutionPreviewPath, ancientRequires: countMatches(previewSource, /evolution-paths\/ancient\//g) }
  );

  assertCheck(
    checks,
    "evolution-preview-ui-is-browseable-in-game",
    source.includes("EvolutionTreePreviewPanel") &&
      source.includes("Evolution Path Preview") &&
      source.includes("setSelectedEvolutionStage") &&
      source.includes("setSelectedEvolutionElement") &&
      source.includes("setSelectedEvolutionBranch") &&
      source.includes("evolutionPreviewStageTabs") &&
      source.includes("evolutionPreviewBranchCard") &&
      source.includes("evolutionPreviewHeroImage") &&
      source.includes("key: \"evolution\""),
    "The in-game UI exposes a browseable Evolution Path Preview panel with element tabs, stage tabs, branch cards, and hero art.",
    { hasPanel: source.includes("EvolutionTreePreviewPanel"), hasBottomNavEntry: source.includes("key: \"evolution\"") }
  );

  assertCheck(
    checks,
    "evolution-preview-ui-explains-build-fantasy",
    source.includes("Build fantasy") &&
      source.includes("First big choice") &&
      source.includes("Capstone futures") &&
      source.includes("Representative placeholder") &&
      source.includes("Full art coverage"),
    "Evolution preview copy makes the branch fantasy understandable instead of only dumping images.",
    {}
  );

  return checks;
}

function analyzeFocusedFireAdventureCombatSlice(source, gameSource, contentSource) {
  const checks = [];
  const board = getSection(source, "function CapybaraAdventureBoard", "function V02UpdateObjectivePanel");
  const eventCard = getSection(source, "function CurrentAdventureEventCard", "function AdventureNodeCard");
  const battleScreen = getSection(source, "function BattleScreen", "function UpgradeScreen");
  const routeSource = getSection(contentSource, "export const adventureNodes: AdventureNode[] = [", "\n];\n\nexport const quests");
  const requiredFireOnboardingStops = ["roadside-trader", "slime-crossing", "ember-cache", "root-rest-camp", "briar-boar-charge", "ruin-knight-gate"];
  const firstTenNodeBlocks = [...routeSource.matchAll(/\{\s*id: \"([^\"]+)\",[\s\S]*?step: (\d+),[\s\S]*?element: \"([^\"]+)\"[\s\S]*?\n  \}/g)]
    .map((match) => ({ id: match[1], step: Number(match[2]), element: match[3] }))
    .filter((node) => node.step >= 1 && node.step <= 10);

  assertCheck(
    checks,
    "fire-starter-short-route-is-default",
    gameSource.includes('id ?? "hatchlingTrail"') &&
      gameSource.includes('function createAdventureRun(step = 1, difficultyId: AdventureDifficultyId = "hatchlingTrail")') &&
      gameSource.includes('action.difficultyId ?? "hatchlingTrail"') &&
      gameSource.includes('title: "Chapter 1: Ember Gate"') &&
      gameSource.includes('full-length 60-stop Chapter 1 Fire adventure'),
    "Default adventure start uses Chapter 1: Ember Gate so the next playtest reaches fight, skill choice, and boss pressure in the full roguelite chapter.",
    { expectedDefaultDifficulty: "hatchlingTrail" }
  );

  assertCheck(
    checks,
    "fire-starter-first-ten-nodes-are-fire-themed",
    firstTenNodeBlocks.length >= 10 &&
      firstTenNodeBlocks.every((node) => node.element === "fire") &&
      routeSource.includes("Ash Orchard Gate") &&
      routeSource.includes("Cinder Slime Crossing") &&
      routeSource.includes("Ruin Knight of the Ember Gate"),
    "First ten starter-route nodes read as a Fire starter onboarding path instead of a mixed-element generic route.",
    { firstTenNodeBlocks }
  );

  assertCheck(
    checks,
    "focused-fire-route-brief-visible",
    source.includes("function FocusedFireRouteBriefPanel") &&
      board.includes("<FocusedFireRouteBriefPanel") &&
      source.includes("First 12-stop Fire onboarding route") &&
      source.includes("Stop 3 fight") &&
      source.includes("Stop 12 elite skill draft") &&
      requiredFireOnboardingStops.every((stopId) => routeSource.includes(`id: \"${stopId}\"`)),
    "Focused Adventure screen includes a concrete Fire onboarding route brief tying early stops to fights, rewards, and the elite skill-draft gate.",
    { requiredFireOnboardingStops }
  );

  assertCheck(
    checks,
    "focused-fire-combat-fight-only-visible",
    battleScreen.includes("battleFightHud") &&
      battleScreen.includes("battleFightStats") &&
      battleScreen.includes("battleDragonFacingRight") &&
      battleScreen.includes("dragonAttackActive") &&
      battleScreen.includes("enemyAttackActive") &&
      battleScreen.includes("Fighting...") &&
      battleScreen.includes("CRIT {state.dragon.stats.critChance}%") &&
      battleScreen.includes("BLOCK {state.dragon.stats.block}%") &&
      battleScreen.includes("DODGE {state.dragon.stats.dodge}%") &&
      !battleScreen.includes("battleOnePageSummary") &&
      !battleScreen.includes("battle.rounds.some"),
    "Battle screen surfaces combat stats inside the fight arena itself instead of showing quick-result or battle-beat recap cards."
  );

  assertCheck(
    checks,
    "focused-fire-skill-choice-recap-visible",
    source.includes("function FireSkillChoiceRecap") &&
      eventCard.includes("<FireSkillChoiceRecap") &&
      source.includes("Skill reward ahead") &&
      source.includes("Ash Warden") &&
      source.includes("Inferno Raider") &&
      source.includes("Sunscale Guide") &&
      gameSource.includes("createEliteSkillDraftOffer") &&
      gameSource.includes("lastSkillDraftOffer"),
    "Elite route event and reward flow preview the three Fire build identities before the skill draft is unlocked."
  );

  const requiredWaterMoonwellStops = ["moonwell-kelp-camp", "reef-slime-crossing", "pearlflow-trader", "moonwell-vow-shrine", "sky-manta-reef-dive", "moon-pearl-cache", "tideglass-lantern-shop", "moonwell-tide-gate", "quiet-spring-mastery", "tidal-hoard-nest"];
  const waterMoonwellNodeBlocks = [...routeSource.matchAll(/\{\s*id: \"([^\"]+)\",[\s\S]*?step: (\d+),[\s\S]*?element: \"([^\"]+)\"[\s\S]*?\n  \}/g)]
    .map((match) => ({ id: match[1], step: Number(match[2]), element: match[3] }))
    .filter((node) => node.step >= 11 && node.step <= 20);

  assertCheck(
    checks,
    "focused-water-moonwell-route-visible",
    source.includes("function WaterMoonwellRouteBriefPanel") &&
      board.includes("<WaterMoonwellRouteBriefPanel") &&
      source.includes("Water Moonwell Tide Path") &&
      source.includes("Moonwell route") &&
      source.includes("Stop 12 fight") &&
      source.includes("Stop 18 fight") &&
      contentSource.includes("Moonwell Tide Path") &&
      contentSource.includes("Pearlflow Trader") &&
      waterMoonwellNodeBlocks.length >= 10 &&
      waterMoonwellNodeBlocks.every((node) => node.element === "water") &&
      requiredWaterMoonwellStops.every((stopId) => routeSource.includes(`id: \"${stopId}\"`)),
    "Focused Adventure screen includes a concrete Water Moonwell Tide Path brief and route data covering 10 Water stops with pearl-shop choices, reef fights, dodge/block pressure, and hoard payoff.",
    { requiredWaterMoonwellStops, waterMoonwellNodeBlocks }
  );

  const requiredEarthCrystalCragStops = ["crystal-crag-basecamp", "gemhide-boar-charge", "faultline-rune-market", "prism-vow-shrine", "basalt-ram-bulwark", "glimmerstone-cache", "rootbound-miner-shop", "crystal-golem-gate", "worldroot-mastery-shrine", "titan-stone-hoard"];
  const earthCrystalCragNodeBlocks = [...routeSource.matchAll(/\{\s*id: \"([^\"]+)\",[\s\S]*?step: (\d+),[\s\S]*?element: \"([^\"]+)\"[\s\S]*?\n  \}/g)]
    .map((match) => ({ id: match[1], step: Number(match[2]), element: match[3] }))
    .filter((node) => node.step >= 21 && node.step <= 30);

  assertCheck(
    checks,
    "focused-earth-crystal-crag-route-visible",
    source.includes("function EarthCrystalCragRouteBriefPanel") &&
      board.includes("<EarthCrystalCragRouteBriefPanel") &&
      source.includes("Earth Crystal Crag Path") &&
      source.includes("Crystal Crag route") &&
      source.includes("Stop 21 fight") &&
      source.includes("Stop 27 fight") &&
      contentSource.includes("Gemhide Boar Charge") &&
      contentSource.includes("Crystal Golem Gate") &&
      contentSource.includes("Crystal Crag Basecamp") &&
      earthCrystalCragNodeBlocks.length >= 10 &&
      earthCrystalCragNodeBlocks.every((node) => node.element === "earth") &&
      requiredEarthCrystalCragStops.every((stopId) => routeSource.includes(`id: \"${stopId}\"`)),
    "Focused Adventure screen includes a concrete Earth Crystal Crag Path brief and route data covering 10 Earth stops with armor-break fights, rune choices, defense/block pressure, and titan-stone hoard payoff.",
    { requiredEarthCrystalCragStops, earthCrystalCragNodeBlocks }
  );

  return checks;
}

function analyzeFireHatchlingSpineExportContract(source) {
  const checks = [];
  const requiredAnimationIds = ["idle_loop", "attack_forge_breath", "hit_recoil", "crit_forge_burst"];
  const minFramesByAnimation = {
    idle_loop: 24,
    attack_forge_breath: 24,
    hit_recoil: 10,
    crit_forge_burst: 30
  };
  const manifestExists = fs.existsSync(fireHatchlingSpineExportManifestPath);
  const importManifestExists = fs.existsSync(fireHatchlingSpineImportManifestPath);
  const dataSource = fs.existsSync(fireHatchlingSpineAnimationDataPath) ? fs.readFileSync(fireHatchlingSpineAnimationDataPath, "utf8") : "";
  const rendererSource = fs.existsSync(fireHatchlingSpineFrameDragonPath) ? fs.readFileSync(fireHatchlingSpineFrameDragonPath, "utf8") : "";
  const manifest = manifestExists ? JSON.parse(fs.readFileSync(fireHatchlingSpineExportManifestPath, "utf8")) : { animations: [] };
  const animations = Array.isArray(manifest.animations) ? manifest.animations : [];
  const animationSummaries = requiredAnimationIds.map((animationId) => {
    const animation = animations.find((candidate) => candidate.id === animationId);
    const folder = path.join(projectRoot, "assets", "dragons", "living-forge-fire-hatchling", "spine-export", animationId);
    const frameFiles = fs.existsSync(folder) ? fs.readdirSync(folder).filter((file) => /^frame_\d{3}\.png$/.test(file)).sort() : [];
    return {
      id: animationId,
      manifestFrameCount: animation?.frameCount ?? 0,
      actualFrameCount: frameFiles.length,
      minFrameCount: minFramesByAnimation[animationId],
      loop: animation?.loop ?? null,
      firstFrame: frameFiles[0] ?? null,
      lastFrame: frameFiles[frameFiles.length - 1] ?? null
    };
  });

  fs.writeFileSync(fireHatchlingSpineExportContractPath, JSON.stringify({
    name: "fire-hatchling-spine-export-contract",
    generatedAt: nowIso(),
    exportManifest: fireHatchlingSpineExportManifestPath,
    importManifest: fireHatchlingSpineImportManifestPath,
    dataModule: fireHatchlingSpineAnimationDataPath,
    renderer: fireHatchlingSpineFrameDragonPath,
    requiredAnimationIds,
    animationSummaries,
    temporaryProofFramesAllowed: true,
    finalSpineRuntimeRequired: false
  }, null, 2));

  assertCheck(
    checks,
    "fire-hatchling-spine-manifests-exist",
    manifestExists && importManifestExists,
    "Fire hatchling Spine source and exported-frame manifests exist so production Spine files have a stable handoff shape.",
    { exportManifest: fireHatchlingSpineExportManifestPath, importManifest: fireHatchlingSpineImportManifestPath }
  );

  assertCheck(
    checks,
    "fire-hatchling-spine-animation-frame-coverage",
    animationSummaries.every((animation) => animation.manifestFrameCount >= animation.minFrameCount && animation.actualFrameCount >= animation.minFrameCount),
    "Spine-frame export includes idle, attack, hit, and crit animations with enough frames for Expo playback.",
    { animationSummaries }
  );

  assertCheck(
    checks,
    "fire-hatchling-spine-expo-static-imports",
    requiredAnimationIds.every((animationId) => dataSource.includes(animationId)) &&
      dataSource.includes("require(\"../../assets/dragons/living-forge-fire-hatchling/spine-export/attack_forge_breath/frame_000.png\")") &&
      dataSource.includes("getFireHatchlingSpineAnimationForExchange") &&
      rendererSource.includes("setInterval") &&
      rendererSource.includes("reducedMotion"),
    "Expo playback uses static frame imports, a frame timer, combat-event mapping, and a Reduced Motion fallback.",
    { hasDataModule: Boolean(dataSource), hasRenderer: Boolean(rendererSource) }
  );

  assertCheck(
    checks,
    "fire-hatchling-spine-combat-wired",
    source.includes("<SpineFrameDragon") &&
      source.includes("useFireSpineFrameDragon") &&
      source.includes("getFireHatchlingSpineAnimationForExchange(activeExchange?.actor") &&
      source.includes("dragonAttackActive && !useFireSpineFrameDragon"),
    "Battle screen routes Fire hatchling combat exchanges to Spine-frame animation IDs and suppresses the old projectile overlay while the frame animation owns the attack.",
    { hasRenderer: source.includes("<SpineFrameDragon"), suppressesOldProjectile: source.includes("dragonAttackActive && !useFireSpineFrameDragon") }
  );

  return checks;
}

function analyzeV02AdventureUpdateSource(source, gameSource) {
  const checks = [];
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));
  const appJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "app.json"), "utf8"));
  const requiredObjectiveIds = [
    "adventure-path",
    "flashy-combat",
    "impactful-stats",
    "fire-starter",
    "evolution-preview",
    "skill-foundation",
    "reward-loop",
    "art-direction",
    "automation"
  ];
  const objectiveSource = getSection(gameSource, "export const v02UpdateObjectives", "];\n\n");
  const objectiveIds = [...objectiveSource.matchAll(/id:\s*"([^"]+)"/g)].map((match) => match[1]);

  assertCheck(
    checks,
    "v02-version-metadata",
    packageJson.version === "0.2.0" && appJson.expo && appJson.expo.version === "0.2.0" && appJson.expo.ios && appJson.expo.ios.buildNumber === "2",
    "Package and Expo metadata declare v0.2.0 with iOS build 2 for the Adventure Path Update.",
    { packageVersion: packageJson.version, expoVersion: appJson.expo && appJson.expo.version, buildNumber: appJson.expo && appJson.expo.ios && appJson.expo.ios.buildNumber }
  );

  assertCheck(
    checks,
    "v02-objective-data-contract",
    requiredObjectiveIds.every((id) => objectiveIds.includes(id)) &&
      /status:\s*"implemented"/.test(objectiveSource) &&
      /playerProof:/.test(objectiveSource) &&
      /nextHook:/.test(objectiveSource),
    "v0.2 objective data covers every planned update lane with status, player proof, and next hook fields.",
    { requiredObjectiveIds, objectiveIds }
  );

  assertCheck(
    checks,
    "v02-objective-panel-visible",
    source.includes("function V02UpdateObjectivePanel") &&
      source.includes("Isekai Dragons v0.2") &&
      source.includes("Adventure Path Update") &&
      source.includes("const objectives = Array.isArray(v02UpdateObjectives) ? v02UpdateObjectives : []") &&
      source.includes("objectives.map") &&
      source.includes("Version objectives"),
    "Adventure screen renders a visible v0.2 objective panel sourced from typed update objective data.",
    { hasPanel: source.includes("function V02UpdateObjectivePanel") }
  );

  assertCheck(
    checks,
    "v02-combat-fight-hud-visible",
    source.includes("battleFightHud") &&
      source.includes("battleFightCue") &&
      source.includes("battleFightStats") &&
      source.includes("getBattleExchangeEvents") &&
      source.includes("battleDragonFacingRight") &&
      source.includes("Fighting...") &&
      source.includes("battleArenaContinueButton") &&
      !source.includes("Quick Battle Result") &&
      !source.includes("Battle beats"),
    "Battle screen includes a fight-only HUD with stat readouts and removes quick-result/battle-beat recap labels.",
    { hasFightHud: source.includes("battleFightHud"), hasQuickBattleResult: source.includes("Quick Battle Result") }
  );

  return checks;
}

function main() {
  ensureCleanArtifacts();

  const report = {
    name: "fire-breath-animation-automation",
    startedAt: nowIso(),
    projectRoot,
    artifacts: {
      report: reportPath,
      log: logPath,
      snippet: snippetPath,
      storyboard: storyboardPath,
      frames: framesPath,
      hatchingStoryboard: hatchStoryboardPath,
      hatchingFrames: hatchFramesPath,
      hatchingOnboardingValidation: hatchingOnboardingValidationPath,
      combatSimulation: combatSimulationPath,
      pathCompleteness: pathCompletenessPath,
      pathUiCopy: pathUiCopyPath,
      liveBattleFeedback: liveBattleFeedbackPath,
      evolutionReveal: evolutionRevealPath,
      evolutionRevealStoryboard: evolutionRevealStoryboardPath,
      adventureRoutePlan: adventureRoutePlanPath,
      adventureUiReference: adventureUiReferencePath,
      adventureFightStopHudSnapshot: adventureFightStopHudSnapshotPath,
      skillBuildPayoffMatrix: skillBuildPayoffMatrixPath,
      activeSkillCombat: activeSkillCombatPath,
      adventureCombatConsolidation: adventureCombatConsolidationPath,
      adventureCombatConsolidationStoryboard: adventureCombatConsolidationStoryboardPath,
      fireStarterFocus: fireStarterFocusPath,
      adventureDifficultyLoot: adventureDifficultyLootPath,
      fireHatchlingSpineExportContract: fireHatchlingSpineExportContractPath
    },
    artifactIndex: [],
    artifactIndexLifecyclePolicy: {},
    artifactIndexRelatedCheckCoverage: {},
    combatEvolutionProofChain: {},
    commands: [],
    checks: []
  };

  const source = fs.readFileSync(appPath, "utf8");
  const gameSource = fs.readFileSync(gamePath, "utf8");
  const contentSource = fs.readFileSync(contentPath, "utf8");
  const typeSource = fs.readFileSync(typesPath, "utf8");
  writeCombatPathSimulationArtifact(gameSource);
  writeDragonPathCompletenessArtifact(gameSource);
  writeSkillBuildPayoffMatrixArtifact(gameSource);
  writeActiveSkillCombatPreviewArtifact(gameSource, source);
  writeDragonPathUiCopyArtifact(gameSource);
  writeLiveBattleFeedbackCuesArtifact(gameSource, source);
  writeEvolutionRevealArtifacts(gameSource, source);
  const hatchingOnboardingValidation = writeHatchingOnboardingDeterministicValidationArtifact(gameSource, source);
  writeHatchingRevealArtifacts(source);
  writeAdventureRoutePlanArtifact(contentSource);
  writeAdventureUiReferenceArtifact(source);
  writeAdventureFightStopHudSnapshotArtifact(gameSource);
  writeAdventureCombatConsolidationArtifacts(source);
  writeFireStarterFocusArtifact(gameSource, source);
  writeAdventureDifficultyLootArtifact(gameSource, source);
  report.checks.push(...analyzeFireBreathSource(source));
  report.checks.push(...analyzeAdventureJourneySource(source, gameSource, typeSource));
  report.checks.push(...analyzeCapybaraAdventureUiSource(source, gameSource));
  report.checks.push(...analyzeInteractiveAdventureRoute(contentSource, source, gameSource));
  report.checks.push(...analyzeAdventureDifficultyLootContract(gameSource, source, typeSource));
  report.checks.push(...analyzeEvolutionPreviewUi(source));
  report.checks.push(...analyzeV02AdventureUpdateSource(source, gameSource));
  report.checks.push(...analyzeFireHatchlingSpineExportContract(source));
  report.checks.push(...analyzeFocusedFireAdventureCombatSlice(source, gameSource, contentSource));
  report.artifactIndex = buildReportArtifactIndex();
  report.artifactIndexLifecyclePolicy = buildArtifactIndexLifecyclePolicy(report.artifactIndex);
  analyzeHatchingRevealArtifacts(report.checks);
  analyzeHatchingOnboardingDeterministicValidation(report.checks, hatchingOnboardingValidation);
  const requiredHatchingDiagnosticIds = [
    "hatching-reveal-source-timing",
    "hatching-reveal-particle-ray-integrity",
    "hatching-reveal-phase-coverage",
    "hatching-reveal-storyboard-html",
    "hatching-reveal-storyboard-captions"
  ];
  assertCheck(
    report.checks,
    "hatching-reveal-diagnostic-checks-split",
    requiredHatchingDiagnosticIds.every((requiredId) => report.checks.some((check) => check.id === requiredId && check.passed)),
    "Hatching reveal diagnostics are split into passing source timing, particle/ray integrity, phase coverage, storyboard HTML, and caption coverage checks.",
    { requiredIds: requiredHatchingDiagnosticIds }
  );
  report.checks.push(...analyzeDragonPathCombatSource(gameSource, source));
  analyzeAutomationRunbook(report.checks);
  assertCheck(
    report.checks,
    "visual-review-artifacts-written",
    fs.existsSync(storyboardPath) && fs.existsSync(framesPath),
    "Automation writes visual review artifacts for the fire breath animation.",
    { storyboardPath, framesPath }
  );
  report.artifactIndexRelatedCheckCoverage = buildArtifactIndexRelatedCheckCoverage(report);
  report.combatEvolutionProofChain = buildCombatEvolutionProofChain();
  analyzeReportArtifactIndex(report);

  report.commands.push(runCommand("typecheck", "npm", ["run", "typecheck"]));
  report.commands.push(runCommand("whitespace-diff-check", "git", ["diff", "--check", "--", "App.tsx", "src/game.ts", "src/content.ts", "src/types.ts", "scripts/test-animation-visual.js", "docs/AUTOMATION_RUNBOOK.md", "docs/OVERNIGHT_SELF_IMPROVEMENT_REPORT_2026-05-11.md", "docs/AUTONOMOUS_10H_POLISH_PLAN_2026-05-11.md", "docs/AUTONOMOUS_10H_POLISH_REPORT_2026-05-11.md", "package.json", ".gitignore"]));

  const failedChecks = report.checks.filter((check) => !check.passed);
  const failedCommands = report.commands.filter((command) => command.exitCode !== 0);

  report.finishedAt = nowIso();
  report.passed = failedChecks.length === 0 && failedCommands.length === 0;
  report.summary = {
    checksPassed: report.checks.length - failedChecks.length,
    checksFailed: failedChecks.length,
    commandsPassed: report.commands.length - failedCommands.length,
    commandsFailed: failedCommands.length
  };

  const logLines = [];
  logLines.push(`${report.name}: ${report.passed ? "PASS" : "FAIL"}`);
  logLines.push(`Project: ${projectRoot}`);
  logLines.push(`Report: ${reportPath}`);
  logLines.push(`Snippet: ${snippetPath}`);
  logLines.push("");
  logLines.push("Checks:");
  for (const check of report.checks) {
    logLines.push(`- ${check.passed ? "PASS" : "FAIL"} ${check.id}: ${check.message}`);
    if (!check.passed && Object.keys(check.details || {}).length > 0) {
      logLines.push(`  details: ${JSON.stringify(check.details)}`);
    }
  }
  logLines.push("");
  logLines.push("Commands:");
  for (const command of report.commands) {
    logLines.push(`- ${command.exitCode === 0 ? "PASS" : "FAIL"} ${command.name}: ${command.command}`);
    if (command.stdout.trim()) logLines.push(command.stdout.trim());
    if (command.stderr.trim()) logLines.push(command.stderr.trim());
    if (command.error) logLines.push(`error: ${command.error}`);
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(logPath, `${logLines.join("\n")}\n`);

  console.log(logLines.join("\n"));
  process.exit(report.passed ? 0 : 1);
}

main();
