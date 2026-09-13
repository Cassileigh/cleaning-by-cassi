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
  try {
    let report;
    for (let attempt = 0; attempt < 2; attempt++) {
      const output = `.lighthouseci/route-${index}-attempt-${attempt + 1}.json`;
      let failure;
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
      } catch (error) {
        failure = error;
      }
      report = JSON.parse(readFileSync(output, 'utf8'));
      // Retry only a known trace-collection failure, never a low score.
      // Preserve both reports so the retry remains visible in CI artifacts.
      if (attempt === 0 && report.runtimeError?.code === 'NO_NAVSTART') {
        console.warn(`${url}: retrying failed trace collection once`);
        continue;
      }
      if (failure) throw failure;
      break;
    }
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
