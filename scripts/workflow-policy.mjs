// Conservative repository conventions, not a general YAML parser.
export function workflowFailures(name, text) {
  const active = text
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('#'))
    .join('\n');
  const failures = [];
  if (
    name === 'production-integrity.yml' &&
    !/github\.event\.workflow_run\.head_repository\.full_name == github\.repository &&/.test(
      active,
    )
  )
    failures.push('workflow_run must verify the originating repository');
  if (
    name === 'safari.yml' &&
    !/^\s*run: npx playwright test [^\n]*tests\/keyboard\.spec\.cjs[^\n]*--browser=webkit/m.test(
      active,
    )
  )
    failures.push(
      'Safari must execute the keyboard and interaction suite in WebKit',
    );
  if (name === 'production-integrity.yml') {
    for (const control of [
      'ref: ${{ github.workflow_sha }}',
      'package-manager-cache: false',
      "github.event.workflow_run.head_branch == 'main'",
      "github.event.workflow_run.event == 'push'",
      "github.event.workflow_run.conclusion == 'success'",
      'EXPECTED_REVISION: ${{ github.event.workflow_run.head_sha || github.sha }}',
    ])
      if (!active.includes(control))
        failures.push(`Integrity requires ${control}`);
    if (
      /^\s*cache:\s*\S/m.test(active) ||
      /uses:\s*actions\/cache/.test(active)
    )
      failures.push('Integrity controller cannot use package caches');
  }
  if (name === 'quality.yml') {
    const block = active.split(/^  code-scanning-policy:\s*$/m)[1] ?? '';
    for (const control of [
      "if: github.event_name == 'push' && github.ref == 'refs/heads/main'",
      'contents: read',
      'security-events: read',
      'ref: ${{ github.sha }}',
      'persist-credentials: false',
      'package-manager-cache: false',
      'GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}',
      'run: node scripts/verify-code-scanning.mjs',
    ])
      if (!block.includes(control))
        failures.push(`Code-scanning policy requires ${control}`);
    if (
      /^\s*cache:\s*\S/m.test(block) ||
      /uses:\s*actions\/cache/.test(block) ||
      /npm (?:ci|install)/.test(block) ||
      /continue-on-error/.test(block)
    )
      failures.push(
        'Code-scanning policy must run without cache, install or ignored failures',
      );
  }
  return failures;
}
