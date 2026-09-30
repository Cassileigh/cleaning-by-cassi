import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
import config from '../lighthouse.config.cjs';
import { assessReport, shouldRetryTrace } from './lighthouse-assessment.mjs';
const { thresholds } = config;
const urls = config.routes.map((route) => new URL(route, config.origin).href);
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
            '--save-assets',
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
      if (shouldRetryTrace(report, attempt)) {
        console.warn(`${url}: retrying failed trace collection once`);
        continue;
      }
      if (failure) throw failure;
      break;
    }
    for (const { category, minimum, score, passed } of assessReport(
      report,
      thresholds,
      {
        noindex: config.noindexRoutes.includes(new URL(url).pathname),
      },
    )) {
      console.log(`${url} ${category}: ${score} (minimum ${minimum})`);
      if (!passed) {
        failed = true;
        for (const ref of report.categories?.[category]?.auditRefs ?? []) {
          const audit = report.audits?.[ref.id];
          if (audit && typeof audit.score === 'number' && audit.score < 1)
            console.error(
              `${ref.id}: ${audit.title} (${audit.displayValue ?? audit.numericValue ?? audit.score})`,
            );
        }
      }
    }
  } catch (error) {
    failed = true;
    console.error(`${url}: ${error.message}`);
  }
}
if (failed) process.exitCode = 1;
