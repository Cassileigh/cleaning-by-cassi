import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  unlinkSync,
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

const safeWorkflow =
  `permissions:
  contents: read
on:
  push:
jobs:
  test:
    steps:
      - uses: actions/checkout@${'a'.repeat(40)}
        with:
          persist-credentials: false
      - run: npm run audit
` +
  readFileSync(
    new URL('../.github/workflows/quality.yml', import.meta.url),
    'utf8',
  ).slice(
    readFileSync(
      new URL('../.github/workflows/quality.yml', import.meta.url),
      'utf8',
    ).indexOf('  code-scanning-policy:'),
  );
function repositoryAudit(workflow = safeWorkflow, prepare = () => {}) {
  return fixture((dir) => {
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    writeFileSync(join(dir, '.github/workflows/quality.yml'), workflow);
    writeFileSync(
      join(dir, '.github/dependabot.yml'),
      'package-ecosystem: npm\npackage-ecosystem: github-actions\n',
    );
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ scripts: { audit: 'npm audit --audit-level=low' } }),
    );
    writeFileSync(
      join(dir, 'package-lock.json'),
      JSON.stringify({ lockfileVersion: 3, packages: { '': {} } }),
    );
    execFileSync('git', ['add', '.'], { cwd: dir });
    prepare(dir);
    return spawnSync(
      process.execPath,
      [new URL('../scripts/security-audit.mjs', import.meta.url).pathname],
      { cwd: dir, encoding: 'utf8' },
    );
  });
}
test('repository audit accepts explicit read-only permissions and credential-free checkout', () => {
  const result = repositoryAudit();
  assert.equal(result.status, 0, result.stderr);
});
test('every checkout must disable persisted credentials', () => {
  for (const workflow of [
    safeWorkflow.replace(
      'persist-credentials: false',
      'persist-credentials: true',
    ),
    safeWorkflow.replace('          persist-credentials: false\n', ''),
    safeWorkflow + `      - uses: actions/checkout@${'b'.repeat(40)}\n`,
  ]) {
    const result = repositoryAudit(workflow);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /checkout must disable persisted credentials/);
  }
});
test('permission comments and flow mappings cannot hide write access', () => {
  for (const workflow of [
    safeWorkflow.replace('contents: read', 'contents: write # explanation'),
    safeWorkflow.replace(
      '    steps:',
      '    permissions: { contents: write }\n    steps:',
    ),
    safeWorkflow.replace('contents: read', 'contents: "write"'),
  ])
    assert.equal(repositoryAudit(workflow).status, 1);
});
test('compact privileged pull request triggers are prohibited', () => {
  const result = repositoryAudit(
    safeWorkflow.replace('on:\n  push:', 'on: [push, pull_request_target]'),
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /pull_request_target is prohibited/);
});
test('tracked Worker secret files and unreadable tracked paths fail closed', () => {
  for (const missing of [false, true]) {
    const result = repositoryAudit(safeWorkflow, (dir) => {
      const path = join(dir, missing ? 'missing.txt' : '.dev.vars');
      writeFileSync(path, 'fixture');
      execFileSync('git', ['add', '.'], { cwd: dir });
      if (missing) unlinkSync(path);
    });
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      missing ? /could not be inspected/ : /Worker secret file is prohibited/,
    );
  }
});
test('current Resend credentials are detected without disclosing values', () => {
  const token = ['re', 'A'.repeat(32)].join('_');
  const result = repositoryAudit(safeWorkflow, (dir) => {
    writeFileSync(join(dir, 'accidental.txt'), token);
    execFileSync('git', ['add', '.'], { cwd: dir });
  });
  assert.equal(result.status, 1);
  assert.ok(!(result.stdout + result.stderr).includes(token));
});
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
      JSON.stringify({ scripts: { audit: 'npm audit --audit-level=low' } }),
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
