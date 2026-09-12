import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
const thresholds = {
  accessibility: 0.95,
  'best-practices': 0.95,
  performance: 0.85,
  seo: 0.95,
};
const urls = [
  '',
  'about',
  'services',
  'pricing',
  'quote',
  'quote-success',
  'review',
  'privacy',
].map((route) => `http://127.0.0.1:4321/${route}`);
mkdirSync('.lighthouseci', { recursive: true });
let failed = false;
for (const [index, url] of urls.entries()) {
  const output = `.lighthouseci/route-${index}.json`;
  try {
    execFileSync(
      process.execPath,
      [
        'node_modules/lighthouse/cli/index.js',
        url,
        `--only-categories=${Object.keys(thresholds).join(',')}`,
        '--output=json',
        `--output-path=${output}`,
        '--chrome-flags=--headless --no-sandbox',
        '--quiet',
      ],
      { stdio: 'inherit', timeout: 120000 },
    );
    const report = JSON.parse(readFileSync(output, 'utf8'));
    if (report.runtimeError) throw new Error(report.runtimeError.message);
    for (const [category, minimum] of Object.entries(thresholds)) {
      // The receipt deliberately declares noindex; SEO eligibility is inapplicable.
      if (category === 'seo' && url.endsWith('/quote-success')) continue;
      const score = report.categories?.[category]?.score;
      console.log(`${url} ${category}: ${score} (minimum ${minimum})`);
      if (typeof score !== 'number' || score < minimum) {
        failed = true;
        for (const ref of report.categories?.[category]?.auditRefs ?? []) {
          const audit = report.audits?.[ref.id];
          if (audit && typeof audit.score === 'number' && audit.score < 1)
            console.error(`${ref.id}: ${audit.title}`);
        }
      }
    }
  } catch (error) {
    failed = true;
    console.error(`${url}: ${error.message}`);
  }
}
if (failed) process.exitCode = 1;
