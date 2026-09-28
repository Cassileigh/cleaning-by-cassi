import assert from 'node:assert/strict';

export function assertPermissionsPolicy(value) {
  const permissions = new Map();
  for (const entry of (value ?? '').split(',')) {
    const match = /^\s*([a-z-]+)\s*=\s*(\([^)]*\))\s*$/.exec(entry);
    assert.ok(match, 'Malformed Permissions-Policy directive');
    assert.ok(
      !permissions.has(match[1]),
      'Duplicate Permissions-Policy directive',
    );
    permissions.set(match[1], match[2]);
  }
  for (const name of [
    'camera',
    'microphone',
    'geolocation',
    'payment',
    'usb',
    'browsing-topics',
    'display-capture',
  ])
    assert.equal(permissions.get(name), '()', `Permissions-Policy ${name}`);
}

export function assertSecurityHeaders(headers, { status = false } = {}) {
  for (const [name, pattern] of Object.entries({
    'x-permitted-cross-domain-policies': /^none$/i,
    'cross-origin-opener-policy': /^same-origin$/i,
    'x-content-type-options': /^nosniff$/i,
    'x-frame-options': /^DENY$/i,
    'strict-transport-security': /max-age=31536000.*includeSubDomains/i,
    'cross-origin-resource-policy': /^same-origin$/i,
    'referrer-policy': status
      ? /^no-referrer$/
      : /^strict-origin-when-cross-origin$/,
  }))
    assert.match(headers.get(name) ?? '', pattern, name);
  assertPermissionsPolicy(headers.get('permissions-policy'));
}

export function assertHeaders(
  headers,
  { status = false, candidate = false } = {},
) {
  assertSecurityHeaders(headers, { status });
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
  if (candidate)
    assert.ok(
      !directives.has('upgrade-insecure-requests'),
      'HTTP loopback must not upgrade assets',
    );
  else expect('upgrade-insecure-requests', []);
  for (const name of [
    'script-src-elem',
    'script-src-attr',
    'style-src-elem',
    'style-src-attr',
  ])
    assert.ok(!directives.has(name), 'Unexpected script policy override');
}
