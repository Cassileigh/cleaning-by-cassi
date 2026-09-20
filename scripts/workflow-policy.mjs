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
  return failures;
}
