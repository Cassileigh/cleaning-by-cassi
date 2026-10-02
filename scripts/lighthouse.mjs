import { mkdirSync } from 'node:fs';
import config from '../lighthouse.config.cjs';
import { assessReport } from './lighthouse-assessment.mjs';
import { runLighthouse } from './lighthouse-runner.mjs';
const { thresholds } = config;
const urls = config.routes.map((route) => new URL(route, config.origin).href);
mkdirSync('.lighthouseci', { recursive: true });
let failed = false;
for (const [index, url] of urls.entries()) {
  try {
    const report = runLighthouse({
      outputBase: `.lighthouseci/route-${index}`,
      args: [
        'node_modules/lighthouse/cli/index.js',
        url,
        `--only-categories=${Object.keys(thresholds).join(',')}`,
        '--output=json',
        '--save-assets',
        '--chrome-flags=--headless --no-sandbox',
        '--quiet',
      ],
    });
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
