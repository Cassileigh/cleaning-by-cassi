import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
function sourceModule(specifier, globals) {
  const file = new URL(
    `../src/${specifier.replace('../../', '')}.ts`,
    import.meta.url,
  );
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, ...globals },
  );
  return exports;
}
import ts from 'typescript';

// Execute the actual handlers with only Worker bindings and network mocked.
// No real Turnstile verification or email sends are possible in these tests.
function route(file, options = {}) {
  const env = {
    TURNSTILE_SECRET: 'test',
    TURNSTILE_HOSTNAMES: 'cleaningbycassi.com',
    RESEND_API_KEY: 'test',
    QUOTE_RATE_LIMITER: { limit: async () => ({ success: true }) },
    ...options.env,
  };
  const calls = [];
  const source = readFileSync(
    new URL(`../src/pages/api/${file}.ts`, import.meta.url),
    'utf8',
  ).replace(
    "import { env } from 'cloudflare:workers';",
    'const env = globalThis.bindings;',
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const exports = {};
  const context = {
    exports,
    bindings: env,
    Request,
    Response,
    FormData,
    URL,
    URLSearchParams,
    Uint8Array,
    TextEncoder,
    AbortSignal,
    crypto,
    require: (specifier) =>
      sourceModule(specifier, { fetch: context.fetch, AbortSignal }),
    console: { error() {}, info() {} },
    fetch: async (url, init) => {
      calls.push({ url, init });
      if (url.includes('siteverify'))
        return Response.json(
          options.turnstile ?? {
            success: true,
            hostname: 'cleaningbycassi.com',
            action: 'quote',
          },
        );
      const number = calls.filter((c) => c.url.includes('resend')).length;
      if (number === 1 && options.businessThrows) throw new Error('timeout');
      if (number === 1)
        return Response.json(
          options.business === undefined
            ? { id: 'accepted' }
            : options.business,
          { status: options.businessStatus ?? 200 },
        );
      if (options.customerThrows) throw new Error('timeout');
      return Response.json(
        { id: 'confirmation' },
        { status: options.customerStatus ?? 200 },
      );
    },
  };
  vm.runInNewContext(compiled, context);
  return { ...exports, calls };
}

function request(fields = {}, options = {}) {
  const body = new URLSearchParams({
    name: 'Test Person',
    email: 'person@example.com',
    phone: '5555555555',
    'cf-turnstile-response': 'test-token',
    faxNumber: '',
    ...fields,
  });
  for (const [key, value] of options.append ?? []) body.append(key, value);
  return new Request('https://cleaningbycassi.com/api/quote', {
    method: 'POST',
    body,
    headers: {
      Accept: options.accept ?? 'application/json',
      Origin: options.origin ?? 'https://cleaningbycassi.com',
    },
  });
}

for (const [name, fields, options, status, code] of [
  ['populated honeypot', { faxNumber: 'spam' }, {}, 403, 'quote-rejected'],
  ['whitespace honeypot', { faxNumber: ' ' }, {}, 403, 'quote-rejected'],
  [
    'duplicate honeypot bypass',
    {},
    { append: [['faxNumber', 'spam']] },
    403,
    'quote-rejected',
  ],
  [
    'duplicate scalar',
    {},
    { append: [['email', 'other@example.com']] },
    400,
    'invalid-form',
  ],
  ['missing name', { name: '' }, {}, 400, 'missing-fields'],
  [
    'header controls',
    { name: 'Test\r\nBcc: other@example.com' },
    {},
    400,
    'invalid-fields',
  ],
  ['invalid email', { email: 'bad' }, {}, 400, 'invalid-fields'],
  ['oversized field', { message: 'a'.repeat(2501) }, {}, 400, 'invalid-fields'],
  ['invalid selection', { frequency: 'daily' }, {}, 400, 'invalid-selection'],
  [
    'invalid referral source',
    { referralSource: 'unknown' },
    {},
    400,
    'invalid-selection',
  ],
  [
    'oversized referrer',
    { referrerName: 'a'.repeat(101) },
    {},
    400,
    'invalid-fields',
  ],
  [
    'oversized referral details',
    { referralDetails: 'a'.repeat(251) },
    {},
    400,
    'invalid-fields',
  ],
  [
    'referrer controls',
    { referrerName: 'Test\r\nPerson' },
    {},
    400,
    'invalid-fields',
  ],
  [
    'duplicate referral source',
    { referralSource: 'google' },
    { append: [['referralSource', 'other']] },
    400,
    'invalid-form',
  ],
  ['invalid addon', { addons: 'invalid' }, {}, 400, 'invalid-selection'],
  ['zero area', { squareFootage: '0' }, {}, 400, 'invalid-square-footage'],
  ['impossible date', { preferredDate: '2026-02-30' }, {}, 400, 'invalid-date'],
  [
    'cross origin',
    {},
    { origin: 'https://evil.example' },
    403,
    'invalid-origin',
  ],
])
  test(name, async () => {
    const api = route('quote');
    const response = await api.POST({ request: request(fields, options) });
    assert.equal(response.status, status);
    assert.equal((await response.json()).code, code);
    assert.equal(api.calls.length, 0);
  });

test('body limit is enforced without Content-Length', async () => {
  const api = route('quote');
  const response = await api.POST({
    request: request({ message: 'a'.repeat(31000) }),
  });
  assert.equal(response.status, 413);
  assert.equal(api.calls.length, 0);
});
test('unsupported and malformed bodies are client errors', async () => {
  for (const [type, status] of [
    ['application/json', 415],
    ['multipart/form-data', 400],
  ]) {
    const api = route('quote');
    const response = await api.POST({
      request: new Request('https://cleaningbycassi.com/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': type },
        body: 'bad',
      }),
    });
    assert.equal(response.status, status);
    assert.equal(api.calls.length, 0);
  }
});
test('uploaded honeypot and files are rejected', async () => {
  for (const field of ['faxNumber', 'name']) {
    const api = route('quote');
    const body = new FormData();
    body.set(field, new Blob(['data']), 'file.txt');
    const response = await api.POST({
      request: new Request('https://cleaningbycassi.com/api/quote', {
        method: 'POST',
        body,
      }),
    });
    assert.equal(response.status, field === 'faxNumber' ? 403 : 400);
    assert.equal(api.calls.length, 0);
  }
});
test('missing bindings fail closed', async () => {
  for (const key of [
    'TURNSTILE_SECRET',
    'TURNSTILE_HOSTNAMES',
    'RESEND_API_KEY',
  ]) {
    const api = route('quote', { env: { [key]: '' } });
    const response = await api.POST({ request: request() });
    assert.equal(response.status, 503);
    assert.equal(api.calls.filter((c) => c.url.includes('resend')).length, 0);
  }
});
test('Turnstile must validate success, hostname and action', async () => {
  for (const turnstile of [
    { success: false },
    { success: true, hostname: 'evil.example', action: 'quote' },
    { success: true, hostname: 'cleaningbycassi.com', action: 'wrong' },
  ]) {
    const api = route('quote', { turnstile });
    const response = await api.POST({ request: request() });
    assert.equal(response.status, 403);
    assert.equal(api.calls.length, 1);
  }
});
test('Resend failures never return success or send confirmation', async () => {
  for (const options of [
    { business: null },
    { business: {} },
    { business: { id: ' ' } },
    { businessStatus: 403 },
    { businessThrows: true },
  ]) {
    const api = route('quote', options);
    const response = await api.POST({ request: request() });
    assert.equal(response.status, 502);
    assert.equal(api.calls.length, 2);
    assert.notEqual((await response.json()).ok, true);
  }
});
test('business acceptance succeeds even if optional confirmation fails', async () => {
  for (const options of [
    {},
    { customerThrows: true },
    { customerStatus: 500 },
  ]) {
    const api = route('quote', options);
    const response = await api.POST({
      request: request({ name: '<Test Person>' }),
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).ok, true);
    const mail = JSON.parse(api.calls[1].init.body);
    assert.equal(mail.to[0], 'cassandramorris@cleaningbycassi.com');
    assert.equal(mail.reply_to, 'person@example.com');
    assert.ok(mail.html.includes('&lt;Test Person&gt;'));
    assert.ok(!mail.html.includes('<Test Person>'));
  }
});
test('native form success uses a no-store 303', async () => {
  const api = route('quote');
  const response = await api.POST({
    request: request({}, { accept: 'text/html' }),
  });
  assert.equal(response.status, 303);
  assert.equal(
    response.headers.get('location'),
    'https://cleaningbycassi.com/quote-success',
  );
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('optional discovery and referral details reach only the business notification, escaped', async () => {
  for (const [referralSource, label] of [
    ['facebook-group', 'Facebook Group'],
    ['facebook-page', 'Facebook Page or Post'],
    ['business-card', 'Business Card at a Local Business'],
    ['friend-family', 'Friend or Family Member'],
    ['current-client', 'Current Cleaning by Cassi Client'],
    ['flyer', 'Flyer'],
    ['google', 'Google Search'],
    ['other', 'Other'],
    ['', 'Not provided'],
  ]) {
    const api = route('quote');
    const response = await api.POST({
      request: request({
        referralSource,
        referrerName: '<Test Referrer>',
        referralDetails: 'Local <Group> & Business',
      }),
    });
    assert.equal(response.status, 200);
    const business = JSON.parse(api.calls[1].init.body);
    assert.ok(business.html.includes(label));
    assert.ok(business.html.includes('&lt;Test Referrer&gt;'));
    assert.ok(business.html.includes('Local &lt;Group&gt; &amp; Business'));
    assert.ok(!business.html.includes('<Test Referrer>'));
    const customer = JSON.parse(api.calls[2].init.body);
    assert.ok(!customer.html.includes('Test Referrer'));
  }
});

test('edited referral information changes retry identity while verification refresh does not', async () => {
  const api = route('quote');
  const fields = {
    referralSource: 'facebook-group',
    referrerName: 'Test Referrer',
    referralDetails: 'Local Group',
  };
  for (const change of [
    {},
    { 'cf-turnstile-response': 'fresh' },
    { referralSource: 'business-card' },
    { referrerName: 'Another Referrer' },
    { referralDetails: 'Local Shop' },
  ]) {
    assert.equal(
      (await api.POST({ request: request({ ...fields, ...change }) })).status,
      200,
    );
  }
  const keys = api.calls
    .filter((c) => c.url.includes('resend'))
    .filter((_, i) => i % 2 === 0)
    .map((c) => c.init.headers['Idempotency-Key']);
  assert.equal(keys[0], keys[1]);
  assert.equal(new Set(keys).size, 4);
});
test('status hides implementation metadata and returns real failure codes', async () => {
  for (const [env, expected] of [
    [{}, 200],
    [{ RESEND_API_KEY: '' }, 503],
    [{ TURNSTILE_SECRET: ' ' }, 503],
    [{ TURNSTILE_HOSTNAMES: ' , , ' }, 503],
    [{ QUOTE_RATE_LIMITER: undefined }, 503],
    [{ QUOTE_RATE_LIMITER: {} }, 503],
  ]) {
    const api = route('status', { env });
    const response = await api.GET({});
    const data = await response.json();
    assert.equal(response.status, expected);
    assert.equal(data.ok, expected === 200);
    for (const key of [
      'runtime',
      'requestId',
      'generatedAt',
      'turnstile',
      'resend',
    ]) {
      assert.ok(!(key in data));
      assert.ok(!(key in data.checks));
    }
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    const head = await api.HEAD({});
    assert.equal(head.status, expected);
    assert.equal(await head.text(), '');
    const other = await api.ALL({});
    assert.equal(other.status, 405);
    assert.equal(other.headers.get('allow'), 'GET, HEAD');
    assert.equal(api.calls.length, 0);
  }
});

test('middleware preserves status policy and limits both quote URL forms', async () => {
  const source = readFileSync(
    new URL('../src/middleware.ts', import.meta.url),
    'utf8',
  )
    .replace(
      "import { env } from 'cloudflare:workers';",
      'const env = { QUOTE_RATE_LIMITER: { limit: async () => ({ success: true }) } };',
    )
    .replace(
      "import { defineMiddleware } from 'astro:middleware';",
      'const defineMiddleware = (handler) => handler;',
    );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, Response, Headers, URL, crypto });
  const status = route('status');
  const response = await exports.onRequest(
    { request: new Request('https://cleaningbycassi.com/api/status') },
    () => status.GET({}),
  );
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.ok(
    response.headers
      .get('content-security-policy')
      .includes("default-src 'none'"),
  );
  let reached = 0;
  for (let i = 0; i < 9; i++) {
    const response = await exports.onRequest(
      {
        request: new Request(
          `https://cleaningbycassi.com/api/quote${i % 2 ? '/' : ''}`,
          { method: 'POST', headers: { 'CF-Connecting-IP': '192.0.2.1' } },
        ),
      },
      () => {
        reached++;
        return Response.json({ ok: true });
      },
    );
    assert.equal(response.status, i < 8 ? 200 : 429);
  }
  assert.equal(reached, 8);
});

test('retry keys remain stable across fresh verification and change for edited data', async () => {
  const api = route('quote');
  const submissionId = '11111111-1111-4111-8111-111111111111';
  for (const fields of [
    { submissionId },
    { submissionId, 'cf-turnstile-response': 'fresh' },
    { submissionId, message: 'Changed details' },
  ]) {
    assert.equal((await api.POST({ request: request(fields) })).status, 200);
  }
  const calls = api.calls.filter((c) => c.url.includes('resend'));
  assert.equal(
    calls[0].init.headers['Idempotency-Key'],
    calls[2].init.headers['Idempotency-Key'],
  );
  assert.notEqual(
    calls[0].init.headers['Idempotency-Key'],
    calls[4].init.headers['Idempotency-Key'],
  );
  assert.notEqual(
    calls[0].init.headers['Idempotency-Key'],
    calls[1].init.headers['Idempotency-Key'],
  );
});

test('native validation error provides an HTML recovery path', async () => {
  const api = route('quote');
  const response = await api.POST({
    request: request({ name: '' }, { accept: 'text/html' }),
  });
  assert.equal(response.status, 400);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.match(await response.text(), /Back button/);
  assert.equal(api.calls.length, 0);
});

test('saturated limiter preserves active blocks and expires old records', async () => {
  const source = readFileSync(
    new URL('../src/middleware.ts', import.meta.url),
    'utf8',
  )
    .replace(
      "import { env } from 'cloudflare:workers';",
      'const env = { QUOTE_RATE_LIMITER: { limit: async () => ({ success: true }) } };',
    )
    .replace(
      "import { defineMiddleware } from 'astro:middleware';",
      'const defineMiddleware = h => h;',
    );
  const exports = {};
  let now = 1000000;
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, Response, Headers, URL, crypto, Date: { now: () => now } },
  );
  const call = (ip) =>
    exports.onRequest(
      {
        request: new Request('https://cleaningbycassi.com/api/quote', {
          method: 'POST',
          headers: { 'CF-Connecting-IP': ip },
        }),
      },
      () => Response.json({ ok: true }),
    );
  for (let i = 0; i < 8; i++) await call('original');
  for (let i = 0; i < 5000; i++) await call(`new-${i}`);
  const blocked = await call('original');
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get('retry-after'), '600');
  now += 600001;
  assert.equal((await call('another')).status, 200);
  assert.equal((await call('original')).status, 200);
});

test('HTTPS upgrading stays enforced outside the explicit HTTP loopback preview', async () => {
  const source = readFileSync(
    new URL('../src/middleware.ts', import.meta.url),
    'utf8',
  )
    .replace(
      "import { env } from 'cloudflare:workers';",
      'const env = { QUOTE_RATE_LIMITER: { limit: async () => ({ success: true }) } };',
    )
    .replace(
      "import { defineMiddleware } from 'astro:middleware';",
      'const defineMiddleware = h => h;',
    );
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, Response, Headers, URL, crypto },
  );
  for (const [url, upgraded] of [
    ['http://127.0.0.1:4321/', false],
    ['http://localhost:4321/', false],
    ['https://cleaningbycassi.com/', true],
    ['http://cleaningbycassi.com/', true],
    ['https://127.0.0.1/', true],
  ]) {
    const response = await exports.onRequest(
      { request: new Request(url) },
      () => new Response('<html></html>'),
    );
    const policy = response.headers.get('content-security-policy');
    assert.equal(policy.includes('upgrade-insecure-requests'), upgraded, url);
    assert.ok(
      policy.includes("script-src 'self' https://challenges.cloudflare.com"),
    );
  }
});

test('edge limiter blocks requests and fails closed on missing or broken bindings', async () => {
  for (const outcome of ['allow', 'deny', 'missing', 'throw']) {
    const source = readFileSync(
      new URL('../src/middleware.ts', import.meta.url),
      'utf8',
    )
      .replace(
        "import { defineMiddleware } from 'astro:middleware';",
        'const defineMiddleware = h => h;',
      )
      .replace(
        "import { env } from 'cloudflare:workers';",
        'const env = globalThis.bindings;',
      );
    const exports = {};
    const keys = [];
    let reached = false;
    const bindings =
      outcome === 'missing'
        ? {}
        : {
            QUOTE_RATE_LIMITER: {
              async limit({ key }) {
                keys.push(key);
                if (outcome === 'throw') throw Error('outage');
                return { success: outcome === 'allow' };
              },
            },
          };
    vm.runInNewContext(
      ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
      { exports, bindings, Response, Headers, URL, crypto },
    );
    const response = await exports.onRequest(
      {
        request: new Request('https://cleaningbycassi.com/api/quote/', {
          method: 'POST',
          headers: { 'CF-Connecting-IP': '192.0.2.7' },
        }),
      },
      () => {
        reached = true;
        return new Response('ok');
      },
    );
    assert.equal(
      response.status,
      outcome === 'allow' ? 200 : outcome === 'deny' ? 429 : 503,
    );
    assert.equal(reached, outcome === 'allow');
    if (outcome !== 'missing') assert.deepEqual(keys, ['quote:192.0.2.7']);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  }
});
