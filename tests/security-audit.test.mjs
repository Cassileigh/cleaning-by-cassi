import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  readFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function fixture(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'cbc-security-test-'));
  try {
    execFileSync('git', ['init', '-q', dir]);
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
const history = new URL(
  '../scripts/security-history-audit.mjs',
  import.meta.url,
);
test('history detects a removed credential without exposing its value', () =>
  fixture((dir) => {
    const token = ['ghp', 'A'.repeat(36)].join('_');
    writeFileSync(join(dir, 'old.txt'), token);
    execFileSync('git', ['add', '.'], { cwd: dir });
    execFileSync(
      'git',
      [
        '-c',
        'user.name=Test',
        '-c',
        'user.email=test@example.invalid',
        'commit',
        '-qm',
        'fixture',
      ],
      { cwd: dir },
    );
    writeFileSync(join(dir, 'old.txt'), 'removed');
    execFileSync('git', ['add', '.'], { cwd: dir });
    execFileSync(
      'git',
      [
        '-c',
        'user.name=Test',
        '-c',
        'user.email=test@example.invalid',
        'commit',
        '-qm',
        'remove',
      ],
      { cwd: dir },
    );
    const result = spawnSync(process.execPath, [history.pathname], {
      cwd: dir,
      encoding: 'utf8',
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /github-token: old.txt/);
    assert.ok(!(result.stdout + result.stderr).includes(token));
  }));
test('history rejects shallow repositories', () =>
  fixture((dir) => {
    writeFileSync(join(dir, 'safe.txt'), 'safe');
    execFileSync('git', ['add', '.'], { cwd: dir });
    execFileSync(
      'git',
      [
        '-c',
        'user.name=Test',
        '-c',
        'user.email=test@example.invalid',
        'commit',
        '-qm',
        'fixture',
      ],
      { cwd: dir },
    );
    const sha = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: dir,
      encoding: 'utf8',
    }).trim();
    writeFileSync(join(dir, '.git/shallow'), sha + '\n');
    const result = spawnSync(process.execPath, [history.pathname], {
      cwd: dir,
      encoding: 'utf8',
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /non-shallow checkout/);
  }));
test('repository audit rejects shorthand unpinned actions', () =>
  fixture((dir) => {
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    writeFileSync(
      join(dir, '.github/workflows/quality.yml'),
      'permissions:\n  contents: read\njobs:\n  test:\n    steps:\n      - uses: actions/checkout@main\n      - run: npm run audit\n',
    );
    writeFileSync(
      join(dir, '.github/dependabot.yml'),
      'package-ecosystem: npm\npackage-ecosystem: github-actions\n',
    );
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ scripts: { audit: 'npm audit --audit-level=high' } }),
    );
    writeFileSync(
      join(dir, 'package-lock.json'),
      JSON.stringify({ lockfileVersion: 3, packages: { '': {} } }),
    );
    execFileSync('git', ['add', '.'], { cwd: dir });
    const result = spawnSync(
      process.execPath,
      [new URL('../scripts/security-audit.mjs', import.meta.url).pathname],
      { cwd: dir, encoding: 'utf8' },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /action must be pinned/);
  }));
