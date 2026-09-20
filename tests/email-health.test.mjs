import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function health(responses = [Response.json({ id: 'accepted' })]) {
  const calls = [];
  const globals = {
    Intl,
    Date,
    AbortSignal,
    console: { info() {} },
    setTimeout: (fn) => fn(),
    fetch: async (url, init) => {
      calls.push({ url, init });
      const result = responses.shift();
      if (result instanceof Error) throw result;
      return result ?? Response.json({}, { status: 503 });
    },
  };
  function load(name) {
    const exports = {};
    const source = readFileSync(
      new URL(`../src/${name}.ts`, import.meta.url),
      'utf8',
    );
    vm.runInNewContext(
      ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
      {
        ...globals,
        exports,
        require: (specifier) => load(specifier.replace('./', '')),
      },
    );
    return exports;
  }
  return { ...load('email-health'), calls };
}
const env = { RESEND_API_KEY: 'test-only' };
test('05:00 Chicago follows winter, summer and both DST transitions', () => {
  const { healthDate } = health();
  for (const time of [
    '2026-01-20T11:00:00Z',
    '2026-07-20T10:00:00Z',
    '2026-03-08T10:00:00Z',
    '2026-11-01T11:00:00Z',
  ]) {
    const ms = Date.parse(time);
    assert.equal(healthDate(ms, ms), time.slice(0, 10));
    assert.equal(healthDate(ms + 3600000, ms + 3600000), null);
    assert.equal(healthDate(ms - 3600000, ms - 3600000), null);
    assert.equal(healthDate(ms, ms + 16 * 60000), null);
    assert.equal(healthDate(ms, ms - 120000), null);
  }
  assert.equal(healthDate(NaN), null);
});
test('daily mail uses fixed business recipient, real shared transport and a stable daily key', async () => {
  const h = health();
  const time = Date.parse('2026-09-21T10:00:00Z');
  await h.sendDailyHealth(time, env, time);
  assert.equal(h.calls.length, 1);
  const { url, init } = h.calls[0];
  assert.equal(url, 'https://api.resend.com/emails');
  assert.equal(init.headers.Authorization, 'Bearer test-only');
  assert.equal(
    init.headers['Idempotency-Key'],
    'daily-email-health/2026-09-21',
  );
  const body = JSON.parse(init.body);
  assert.deepEqual(body.to, ['cassandramorris@cleaningbycassi.com']);
  assert.equal(body.from, 'Cleaning by Cassi <quotes@cleaningbycassi.com>');
  assert.match(body.subject, /daily email health check — 2026-09-21/);
  assert.match(body.text, /does not test/);
});
test('wrong hour sends nothing and missing credentials fail closed', async () => {
  const h = health();
  const time = Date.parse('2026-09-21T10:00:00Z');
  await h.sendDailyHealth(time + 3600000, env, time + 3600000);
  await assert.rejects(h.sendDailyHealth(time, {}, time), /missing mail/);
  assert.equal(h.calls.length, 0);
});
test('transient retries keep identical payload and key; failures never claim acceptance', async () => {
  const time = Date.parse('2026-09-21T10:00:00Z');
  const h = health([
    new Error('private error'),
    Response.json({}, { status: 429 }),
    Response.json({ id: 'ok' }),
  ]);
  await h.sendDailyHealth(time, env, time);
  assert.equal(h.calls.length, 3);
  assert.equal(new Set(h.calls.map((c) => c.init.body)).size, 1);
  assert.equal(
    new Set(h.calls.map((c) => c.init.headers['Idempotency-Key'])).size,
    1,
  );
  for (const response of [
    Response.json(null),
    Response.json({ id: ' ' }),
    Response.json({}, { status: 403 }),
  ]) {
    const bad = health([response]);
    await assert.rejects(bad.sendDailyHealth(time, env, time), /not confirmed/);
    assert.ok(bad.calls.length <= 3);
  }
});
test('production entrypoint retains Astro HTTP handler and only cron invokes health sender', () => {
  const source = readFileSync(
    new URL('../src/worker.ts', import.meta.url),
    'utf8',
  );
  const config = JSON.parse(
    readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8'),
  );
  assert.match(source, /fetch: handle/);
  assert.match(source, /async scheduled/);
  assert.equal(config.main, './src/worker.ts');
  assert.deepEqual(config.triggers.crons, ['0 10 * * *', '0 11 * * *']);
});
