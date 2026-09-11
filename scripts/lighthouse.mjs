import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
mkdirSync('.lighthouseci', { recursive: true });
for (const route of [
  '',
  'about',
  'services',
  'pricing',
  'quote',
  'quote-success',
  'review',
  'privacy',
]) {
  const output = `.lighthouseci/${route || 'home'}.json`;
  execFileSync(
    process.execPath,
    [
      'node_modules/lighthouse/cli/index.js',
      `http://127.0.0.1:4321/${route}`,
      '--only-categories=accessibility',
      '--output=json',
      `--output-path=${output}`,
      '--chrome-flags=--headless --no-sandbox',
      '--quiet',
    ],
    { stdio: 'inherit' },
  );
  const report = JSON.parse(readFileSync(output, 'utf8'));
  if (report.runtimeError || report.categories.accessibility.score < 0.95)
    throw new Error(`Accessibility failed for /${route}`);
}
