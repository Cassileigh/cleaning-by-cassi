import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertHeaders } from '../scripts/integrity-contract.mjs';
const headers = () =>
  new Headers({
    'content-security-policy':
      "default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'none'; script-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; style-src 'self'; font-src 'self'; img-src 'self' data:; upgrade-insecure-requests",
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
    'cross-origin-resource-policy': 'same-origin',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  });
test('integrity accepts the intended script and response policy', () =>
  assertHeaders(headers()));
for (const extra of [
  '; script-src *',
  '; script-src-elem *',
  "; script-src-attr 'unsafe-inline'",
  "; style-src-attr 'unsafe-inline'",
])
  test('integrity rejects CSP override ' + extra, () => {
    const h = headers();
    h.set('content-security-policy', h.get('content-security-policy') + extra);
    assert.throws(() => assertHeaders(h));
  });
test('integrity rejects missing security headers', () => {
  const h = headers();
  h.delete('x-frame-options');
  assert.throws(() => assertHeaders(h));
});
