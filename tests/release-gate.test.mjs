import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  required,
  assessRuns,
  classifyApproval,
} from '../scripts/verify-ci.mjs';
const sha = 'a'.repeat(40);
const passed = () =>
  required.map((file, id) => ({
    id,
    path: `.github/workflows/${file}`,
    head_sha: sha,
    head_branch: 'main',
    event: 'push',
    status: 'completed',
    conclusion: 'success',
  }));
test('final approval fails closed on malformed, incomplete or unsuccessful evidence', () => {
  const checks = assessRuns(passed(), sha);
  assert.equal(classifyApproval(checks), 'approved');
  for (const state of ['missing', 'pending'])
    assert.equal(
      classifyApproval([{ ...checks[0], state }, ...checks.slice(1)]),
      'pending',
    );
  for (const state of [
    'failure',
    'cancelled',
    'skipped',
    'timed_out',
    null,
    'unknown',
  ])
    assert.equal(
      classifyApproval([{ ...checks[0], state }, ...checks.slice(1)]),
      'rejected',
    );
  for (const malformed of [
    null,
    [],
    checks.slice(1),
    [null, ...checks.slice(1)],
    checks.map(() => checks[0]),
  ])
    assert.equal(classifyApproval(malformed), 'rejected');
});
test('release gate accepts only successful required workflows for the exact main push', () => {
  assert.ok(assessRuns(passed(), sha).every((c) => c.state === 'success'));
  for (const change of [
    { head_sha: 'b'.repeat(40) },
    { head_branch: 'other' },
    { event: 'pull_request' },
    { path: '.github/workflows/unrelated.yml' },
  ]) {
    const runs = passed();
    Object.assign(runs[0], change);
    assert.equal(assessRuns(runs, sha)[0].state, 'missing');
  }
});
test('release gate uses the latest run and rejects pending, skipped and failed checks', () => {
  for (const conclusion of ['failure', 'cancelled', 'skipped', 'timed_out']) {
    const runs = passed();
    runs.push({ ...runs[0], id: 100, conclusion });
    assert.equal(assessRuns(runs, sha)[0].state, conclusion);
  }
  const runs = passed();
  runs[0].status = 'in_progress';
  assert.equal(assessRuns(runs, sha)[0].state, 'pending');
});
