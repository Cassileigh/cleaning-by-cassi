import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertHeaders,
  assertSecurityHeaders,
} from '../scripts/integrity-contract.mjs';
import { verifyIntegrity } from '../scripts/verify-integrity.mjs';
import { readFileSync } from 'node:fs';
const headers = () =>
  new Headers({
    'content-security-policy':
      "default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'none'; script-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; style-src 'self'; font-src 'self'; img-src 'self' data:; upgrade-insecure-requests",
    'x-permitted-cross-domain-policies': 'none',
    'cross-origin-opener-policy': 'same-origin',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
    'cross-origin-resource-policy': 'same-origin',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy':
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), display-capture=()',
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

for (const name of [
  'x-permitted-cross-domain-policies',
  'permissions-policy',
  'cross-origin-opener-policy',
]) {
  test('integrity rejects removal of ' + name, () => {
    const h = headers();
    h.delete(name);
    assert.throws(() => assertHeaders(h));
  });
}

test('static assets carry the complete baseline', () => {
  const source = readFileSync(
    new URL('../public/_headers', import.meta.url),
    'utf8',
  );
  const h = new Headers(
    source
      .split('\n')
      .filter((line) => /^\s+\S+:/.test(line))
      .map((line) => {
        const index = line.indexOf(':');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      }),
  );
  assertSecurityHeaders(h);
  for (const name of h.keys()) {
    const broken = new Headers(h);
    broken.delete(name);
    assert.throws(() => assertSecurityHeaders(broken));
  }
});

for (const capability of [
  'camera',
  'microphone',
  'geolocation',
  'payment',
  'usb',
  'browsing-topics',
  'display-capture',
]) {
  test(`permissions reject missing or allowed ${capability}`, () => {
    for (const replacement of [`${capability}=(self)`, `${capability}=*`, '']) {
      const h = headers();
      h.set(
        'permissions-policy',
        h.get('permissions-policy').replace(`${capability}=()`, replacement),
      );
      assert.throws(() => assertSecurityHeaders(h));
    }
  });
}
test('duplicate permissions fail closed', () => {
  const h = headers();
  h.append('permissions-policy', 'camera=()');
  assert.throws(() => assertSecurityHeaders(h));
});

const revision = 'a'.repeat(40);
function fixture({
  candidate = true,
  wrongRevision = false,
  missingAssetHeader = false,
  ready = false,
} = {}) {
  const calls = [];
  return {
    calls,
    fetcher: async (input, options) => {
      const url = new URL(input);
      calls.push(url);
      assert.equal(options.method ?? 'GET', 'GET');
      if (options.redirect === 'manual')
        return new Response(null, {
          status: 301,
          headers: { location: url.href.replace('http:', 'https:') },
        });
      assert.equal(options.redirect, 'error');
      const h = headers();
      if (candidate)
        h.set(
          'content-security-policy',
          h
            .get('content-security-policy')
            .replace('; upgrade-insecure-requests', ''),
        );
      h.set('content-type', 'text/html');
      let body =
        '<meta name="robots" content="noindex">0x4AAAAAAEmmOovf3yTuy_Ua';
      let status = 200;
      if (url.pathname === '/api/release')
        body = JSON.stringify({
          revision: wrongRevision ? 'b'.repeat(40) : revision,
        });
      if (url.pathname === '/api/status') {
        h.set(
          'content-security-policy',
          "default-src 'none'; frame-ancestors 'none'",
        );
        h.set('referrer-policy', 'no-referrer');
        h.set('cache-control', 'no-store');
        status = ready ? 200 : 503;
        body = JSON.stringify({ ok: ready, scope: 'configuration-readiness' });
      }
      if (url.pathname === '/__integrity_missing_page') status = 404;
      if (missingAssetHeader && url.pathname === '/navigation.js')
        h.delete('x-frame-options');
      return new Response(body, { status, headers: h });
    },
  };
}
test('candidate checks are read-only, fixed-loopback and permit unconfigured readiness', async () => {
  const mock = fixture();
  await verifyIntegrity({
    expected: revision,
    candidate: true,
    ...mock,
    log: () => {},
  });
  assert.ok(mock.calls.every((url) => url.origin === 'http://127.0.0.1:4321'));
  assert.ok(mock.calls.some((url) => url.pathname === '/sitemap-index.xml'));
});
test('candidate rejects wrong revision and missing static protection', async () => {
  for (const change of [{ wrongRevision: true }, { missingAssetHeader: true }])
    await assert.rejects(
      verifyIntegrity({
        expected: revision,
        candidate: true,
        ...fixture(change),
        log: () => {},
      }),
    );
});
test('production still requires readiness and HTTPS on both domains', async () => {
  await assert.rejects(
    verifyIntegrity({
      expected: revision,
      ...fixture({ candidate: false }),
      wait: async () => {},
      log: () => {},
    }),
    /Readiness degraded/,
  );
  const mock = fixture({ candidate: false, ready: true });
  await verifyIntegrity({
    expected: revision,
    ...mock,
    wait: async () => {},
    log: () => {},
  });
  assert.equal(
    new Set(
      mock.calls
        .filter((url) => url.protocol === 'https:')
        .map((url) => url.hostname),
    ).size,
    2,
  );
});
