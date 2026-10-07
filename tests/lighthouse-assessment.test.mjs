import { test } from 'node:test';
import assert from 'node:assert/strict';
import config from '../lighthouse.config.cjs';
import {
  assessReport,
  shouldRetryTrace,
} from '../scripts/lighthouse-assessment.mjs';
const report = (score) => ({
  categories: Object.fromEntries(
    Object.keys(config.thresholds).map((name) => [name, { score }]),
  ),
});
test('Lighthouse preserves budgets and the receipt-only SEO exception', () => {
  assert.deepEqual(config.thresholds, {
    accessibility: 0.95,
    'best-practices': 0.95,
    performance: 0.85,
    seo: 0.95,
  });
  assert.deepEqual(config.routes, [
    '/',
    '/about',
    '/services',
    '/pricing',
    '/quote',
    '/quote-success',
    '/review',
    '/privacy',
    '/terms',
  ]);
  assert.deepEqual(config.noindexRoutes, ['/quote-success']);
  assert.ok(
    assessReport(report(1), config.thresholds).every((result) => result.passed),
  );
  assert.ok(
    assessReport(report(0.5), config.thresholds).every(
      (result) => !result.passed,
    ),
  );
  assert.deepEqual(
    assessReport(report(1), config.thresholds, { noindex: true }).map(
      (result) => result.category,
    ),
    ['accessibility', 'best-practices', 'performance'],
  );
});
test('malformed scores fail instead of passing comparisons', () => {
  for (const score of [NaN, Infinity, null, undefined, '1', -1, 1.1])
    assert.throws(() => assessReport(report(score), config.thresholds));
  assert.throws(() =>
    assessReport({ runtimeError: { code: 'ERROR' } }, config.thresholds),
  );
});
test('only one missing-navigation trace can retry; low scores cannot', () => {
  assert.equal(
    shouldRetryTrace({ runtimeError: { code: 'NO_NAVSTART' } }, 0),
    true,
  );
  assert.equal(
    shouldRetryTrace({ runtimeError: { code: 'NO_NAVSTART' } }, 1),
    false,
  );
  assert.equal(shouldRetryTrace(report(0.1), 0), false);
  assert.equal(shouldRetryTrace({ runtimeError: { code: 'OTHER' } }, 0), false);
});
