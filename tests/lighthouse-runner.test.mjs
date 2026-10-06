import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  rmSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runLighthouse } from '../scripts/lighthouse-runner.mjs';
import { assessReport } from '../scripts/lighthouse-assessment.mjs';

function fixture(t, mode) {
  const dir = mkdtempSync(join(tmpdir(), 'cbc-lighthouse-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const counter = join(dir, 'calls');
  const outputBase = join(dir, 'route');
  const script = join(dir, 'cli.cjs');
  writeFileSync(
    script,
    `
    const fs = require('node:fs');
    const counter = ${JSON.stringify(counter)};
    const n = fs.existsSync(counter) ? Number(fs.readFileSync(counter)) + 1 : 1;
    fs.writeFileSync(counter, String(n));
    const output = process.argv.find(x => x.startsWith('--output-path=')).slice(14);
    const mode = ${JSON.stringify(mode)};
    if (mode === 'missing-trace' && n === 1 || mode === 'trace-twice') {
      console.error('Runtime error: NO_NAVSTART'); process.exit(1);
    }
    if (mode === 'unrelated') { console.error('connection failed'); process.exit(1); }
    if (mode === 'missing') process.exit(0);
    if (mode === 'malformed') {
      fs.writeFileSync(output, '{'); console.error('NO_NAVSTART'); process.exit(1);
    }
    if (mode === 'report-trace' && n === 1) {
      fs.writeFileSync(output, JSON.stringify({runtimeError:{code:'NO_NAVSTART'}})); process.exit(1);
    }
    if (mode === 'low') console.error('NO_NAVSTART mentioned but report has scores');
    fs.writeFileSync(output, JSON.stringify({categories:{performance:{score: mode === 'low' ? 0.5 : 1}}}));
  `,
  );
  return {
    outputBase,
    counter,
    run: () => runLighthouse({ args: [script], outputBase }),
    calls: () => Number(readFileSync(counter)),
  };
}
for (const mode of ['missing-trace', 'report-trace']) {
  test(`${mode} retries once with both attempts retained`, (t) => {
    const f = fixture(t, mode);
    assert.equal(f.run().categories.performance.score, 1);
    assert.equal(f.calls(), 2);
    assert.ok(existsSync(f.outputBase + '-attempt-1.json.stderr.log'));
    assert.ok(existsSync(f.outputBase + '-attempt-2.json'));
  });
}
for (const mode of ['trace-twice', 'unrelated', 'missing', 'malformed']) {
  test(`${mode} fails closed with bounded calls`, (t) => {
    const f = fixture(t, mode);
    assert.throws(f.run);
    assert.equal(f.calls(), mode === 'trace-twice' ? 3 : 1);
  });
}
test('low scores never retry even with NO_NAVSTART in stderr', (t) => {
  const f = fixture(t, 'low');
  assert.equal(assessReport(f.run(), { performance: 0.85 })[0].passed, false);
  assert.equal(f.calls(), 1);
});
test('stale successful report cannot hide a missing current report', (t) => {
  const f = fixture(t, 'missing');
  writeFileSync(
    f.outputBase + '-attempt-1.json',
    '{"categories":{"performance":{"score":1}}}',
  );
  assert.throws(f.run, /missing or malformed/);
  assert.equal(f.calls(), 1);
});
