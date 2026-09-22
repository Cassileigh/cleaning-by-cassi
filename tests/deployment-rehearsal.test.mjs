import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

test('actual npm deploy command rejects bad evidence before Wrangler and recovers only with approved evidence', () => {
  const root = mkdtempSync(join(tmpdir(), 'cleaning-release-rehearsal-'));
  try {
    const run = (args) =>
      execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
    run(['init', '-q']);
    run(['config', 'user.name', 'Offline rehearsal']);
    run(['config', 'user.email', 'rehearsal@example.invalid']);
    writeFileSync(
      join(root, 'verify-ci.mjs'),
      readFileSync(new URL('../scripts/verify-ci.mjs', import.meta.url)),
    );
    // Exercise the committed npm command, with an isolated sentinel instead of a deployable Wrangler.
    const pkg = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    );
    assert.equal(
      pkg.scripts.deploy,
      'node scripts/verify-ci.mjs && wrangler deploy',
    );
    writeFileSync(
      join(root, 'package.json'),
      JSON.stringify({
        type: 'module',
        scripts: { deploy: pkg.scripts.deploy.replace('scripts/', '') },
      }),
    );
    writeFileSync(
      join(root, 'mock-evidence.mjs'),
      `
      import { execFileSync } from 'node:child_process';
      const sha = execFileSync('git', ['rev-parse','HEAD'], {encoding:'utf8'}).trim();
      globalThis.fetch = async url => {
        if (!url.startsWith('https://api.github.com/repos/Cassileigh/cleaning-by-cassi/')) throw Error('Unexpected destination');
        if (process.env.REHEARSAL_CASE === 'api-denied') return new Response('', {status:403});
        if (url.includes('/git/ref/')) return Response.json({object:{sha:process.env.REHEARSAL_CASE === 'stale' ? 'b'.repeat(40) : sha}});
        const files=['quality.yml','responsive.yml','accessibility.yml','lighthouse.yml','safari.yml'];
        const runs=files.map((file,id)=>({id, path:'.github/workflows/'+file,head_sha:sha,head_branch:'main',event:'push',status:'completed',conclusion:'success'}));
        if (process.env.REHEARSAL_CASE === 'failed-quality') runs[0].conclusion='failure';
        return Response.json({total_count:5,workflow_runs:runs});
      };
    `,
    );
    writeFileSync(
      join(root, 'wrangler'),
      '#!/bin/sh\necho OFFLINE_WRANGLER_SENTINEL\n',
      { mode: 0o755 },
    );
    run(['add', '.']);
    run(['commit', '-qm', 'Isolated rehearsal fixture']);
    const sha = run(['rev-parse', 'HEAD']);
    for (const scenario of [
      'failed-quality',
      'api-denied',
      'stale',
      'restored-approved',
    ]) {
      const env = {
        ...process.env,
        PATH: `${root}:${process.env.PATH}`,
        NODE_OPTIONS: `--import=${join(root, 'mock-evidence.mjs')}`,
        REHEARSAL_CASE: scenario,
        GITHUB_SHA: sha,
        WORKERS_CI_COMMIT_SHA: sha,
        WORKERS_CI_BRANCH: 'main',
        GITHUB_READ_TOKEN: '',
      };
      const result = spawnSync('npm', ['run', 'deploy'], {
        cwd: root,
        env,
        encoding: 'utf8',
        timeout: 20000,
      });
      const output = result.stdout + result.stderr;
      assert.equal(result.error, undefined);
      if (scenario === 'restored-approved') {
        assert.equal(result.status, 0, output);
        assert.ok(output.includes('OFFLINE_WRANGLER_SENTINEL'));
      } else {
        assert.notEqual(result.status, 0, output);
        assert.ok(!output.includes('OFFLINE_WRANGLER_SENTINEL'));
      }
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
