import assert from 'node:assert/strict';

export function assertHeaders(headers, { status = false } = {}) {
  for (const [name, pattern] of Object.entries({
    'x-content-type-options': /^nosniff$/i,
    'x-frame-options': /^DENY$/i,
    'strict-transport-security': /max-age=31536000.*includeSubDomains/i,
    'cross-origin-resource-policy': /^same-origin$/i,
    'referrer-policy': status
      ? /^no-referrer$/
      : /^strict-origin-when-cross-origin$/,
  }))
    assert.match(headers.get(name) ?? '', pattern, name);
  const directives = new Map();
  for (const entry of (headers.get('content-security-policy') ?? '').split(
    ';',
  )) {
    const [name, ...values] = entry.trim().split(/\s+/);
    if (!name) continue;
    assert.ok(!directives.has(name), 'Duplicate CSP directive');
    directives.set(name, values);
  }
  const expect = (name, values) =>
    assert.deepEqual(directives.get(name), values, name);
  expect('frame-ancestors', ["'none'"]);
  if (status) {
    expect('default-src', ["'none'"]);
    assert.match(headers.get('cache-control') ?? '', /no-store/);
    return;
  }
  expect('default-src', ["'self'"]);
  expect('base-uri', ["'self'"]);
  expect('object-src', ["'none'"]);
  expect('form-action', ["'self'"]);
  expect('style-src', ["'self'"]);
  expect('font-src', ["'self'"]);
  expect('img-src', ["'self'", 'data:']);
  expect('script-src', ["'self'", 'https://challenges.cloudflare.com']);
  expect('frame-src', ['https://challenges.cloudflare.com']);
  expect('connect-src', ["'self'", 'https://challenges.cloudflare.com']);
  expect('upgrade-insecure-requests', []);
  for (const name of [
    'script-src-elem',
    'script-src-attr',
    'style-src-elem',
    'style-src-attr',
  ])
    assert.ok(!directives.has(name), 'Unexpected script policy override');
  assert.match(
    headers.get('permissions-policy') ?? '',
    /camera=\(\).*microphone=\(\).*geolocation=\(\)/,
  );
}
