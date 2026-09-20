import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { workflowFailures } from '../scripts/workflow-policy.mjs';
test('actual workflow guards survive regression and cannot be satisfied by comments', () => {
  for (const [name, control] of [
    [
      'production-integrity.yml',
      'github.event.workflow_run.head_repository.full_name == github.repository &&',
    ],
    ['safari.yml', 'tests/keyboard.spec.cjs'],
  ]) {
    const source = readFileSync(
      new URL(`../.github/workflows/${name}`, import.meta.url),
      'utf8',
    );
    assert.deepEqual(workflowFailures(name, source), []);
    assert.equal(workflowFailures(name, source.replace(control, '')).length, 1);
    const commented = source
      .split('\n')
      .map((line) => (line.includes(control) ? `# ${line}` : line))
      .join('\n');
    assert.equal(workflowFailures(name, commented).length, 1);
  }
});
