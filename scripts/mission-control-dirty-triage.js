#!/usr/bin/env node
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'artifacts', 'mission-control', 'latest');
const outPath = path.join(outDir, 'dirty-worktree-triage.md');
fs.mkdirSync(outDir, { recursive: true });

function run(command) {
  try {
    return execSync(command, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    return `${error.stdout || ''}${error.stderr || ''}`;
  }
}

const status = run('git status --short');
const lines = status.split(/\r?\n/).filter(Boolean);

const buckets = {
  'source code': [],
  'tests/scripts': [],
  docs: [],
  'generated artifacts': [],
  assets: [],
  'mission-control/workspace files': [],
  'unknown/unreviewed': [],
};

function cleanPath(line) {
  let filePath = line.slice(3).trim();
  if (filePath.includes(' -> ')) filePath = filePath.split(' -> ').pop().trim();
  return filePath;
}

function bucketFor(filePath) {
  if (/^(App\.tsx|src\/|app\.json|metro\.config\.js|babel\.config\.js|tsconfig\.json|package(-lock)?\.json)$/.test(filePath)) return 'source code';
  if (/^(scripts\/|tools\/|__tests__\/|tests\/)/.test(filePath)) return 'tests/scripts';
  if (/^docs\//.test(filePath)) return 'docs';
  if (/^artifacts\//.test(filePath)) return 'generated artifacts';
  if (/^assets\//.test(filePath)) return 'assets';
  if (/^(workspace\/your\/mission-control\/|project\/|memory\/)/.test(filePath)) return 'mission-control/workspace files';
  return 'unknown/unreviewed';
}

for (const line of lines) {
  const filePath = cleanPath(line);
  buckets[bucketFor(filePath)].push(line);
}

const trackedRisk = lines.length >= 100 ? 'YELLOW' : lines.length ? 'YELLOW' : 'GREEN';
const unknownRisk = buckets['unknown/unreviewed'].length ? 'YELLOW' : 'GREEN';
const generatedNoise = buckets['generated artifacts'].length > 30 ? 'YELLOW' : 'GREEN';
const health = [trackedRisk, unknownRisk, generatedNoise].includes('YELLOW') ? 'YELLOW' : 'GREEN';

const safeCommitGroups = [
  '**Mission Control stabilization policy:** `docs/MISSION_CONTROL_HEALTH_POLICY.md`, `docs/ARTIFACT_TRACKING_POLICY.md`, Mission Control task/status files, and this triage report.',
  '**Automation source:** `scripts/mission-control-dirty-triage.js` and package script wiring.',
  '**App/source changes:** app code only, after `npm run typecheck` and `npm run test:auto` pass.',
  '**Curated evidence artifacts:** selected dated proof artifacts only; avoid committing mutable latest outputs unless they are intentionally lightweight review reports.',
  '**Assets/art:** review separately with their owning art/animation phase; do not bundle with stabilization policy commits.',
];

const report = [];
report.push('# Dirty Worktree Triage Report');
report.push('');
report.push(`Generated: ${new Date().toISOString()}`);
report.push(`Health interpretation: **${health}**`);
report.push('');
report.push('This report categorizes `git status --short` before new feature/art/animation work. It is a review-safety tool, not a commit instruction.');
report.push('');
report.push(`Total changed/untracked entries: **${lines.length}**`);
report.push('');
report.push('## Category counts');
report.push('');
for (const [name, items] of Object.entries(buckets)) {
  report.push(`- ${name}: ${items.length}`);
}
report.push('');
for (const [name, items] of Object.entries(buckets)) {
  report.push(`## ${name} (${items.length})`);
  report.push('');
  if (!items.length) {
    report.push('- none');
  } else {
    for (const item of items.slice(0, 220)) report.push(`- \`${item}\``);
    if (items.length > 220) report.push(`- ... ${items.length - 220} more`);
  }
  report.push('');
}
report.push('## Risk notes');
report.push('');
report.push(`- Dirty-state volume: ${trackedRisk}.`);
report.push(`- Unknown/unreviewed entries: ${unknownRisk}.`);
report.push(`- Generated artifact noise: ${generatedNoise}.`);
report.push('- Do not mass commit blindly.');
report.push('- Review source/app changes separately from generated evidence and art assets.');
report.push('');
report.push('## Recommended safe commit groups');
report.push('');
for (const group of safeCommitGroups) report.push(`- ${group}`);
report.push('');
report.push('## ONE NEXT OWNER');
report.push('');
report.push('Active owner: Ember / Hermes');
report.push('Exact next task: Finish Mission Control stabilization verification, then hand off to hatching/onboarding deterministic validation.');
report.push('Exact success command: `npm run typecheck && npm run test:auto`');
report.push('Escalation condition: typecheck/test:auto fails, unknown/unreviewed changes become the largest bucket, or task ownership conflicts return.');
report.push('Do NOT work on next: new visual slice, new art/animation expansion, or Playwright/browser capture inside `test:auto`.');
report.push('');

fs.writeFileSync(outPath, report.join('\n'));
console.log(outPath);
