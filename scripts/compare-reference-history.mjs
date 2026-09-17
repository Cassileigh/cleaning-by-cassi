import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';

// Usage: node scripts/compare-reference-history.mjs /path/to/fresh/alienx.git
// Fetch a fresh public mirror first. This inventories every advertised ref,
// including retained PR heads/merge refs; it never executes reference code.
const reference = process.argv[2];
if (!reference) throw Error('Provide a freshly fetched AlienX Git mirror');
function git(...args) {
  try {
    return execFileSync('git', ['--git-dir', reference, ...args], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trimEnd();
  } catch {
    throw Error('Reference history read failed; output suppressed');
  }
}
if (git('rev-parse', '--is-shallow-repository') !== 'false')
  throw Error('A complete, non-shallow mirror is required');
const main = git('rev-parse', 'refs/heads/main');
const commits = git('rev-list', '--all', '--topo-order').split('\n');
const mainHistory = new Set(git('rev-list', 'refs/heads/main').split('\n'));
const branchHistory = new Set(git('rev-list', '--branches').split('\n'));
const refs = git('for-each-ref', '--format=%(refname) %(objectname)').split(
  '\n',
);
const clean = (s) =>
  s.replaceAll('|', '/').replaceAll('<', '&lt;').replaceAll('\n', ' ');
const disposition = (paths, subject) => {
  if (/typescript.*7\.0/.test(subject))
    return 'Not adopted: checker supports TypeScript 5/6; use 6.0.3';
  const result = [];
  if (
    paths.some((p) =>
      /middleware|pages\/api|lib\/status|Honeypot|contact-security/.test(p),
    )
  )
    result.push(
      'quote/status contract + API/client tests; preserve stricter local guards',
    );
  if (paths.some((p) => /integrity|security.*audit/.test(p)))
    result.push('security scanners + integrity contract/workflow');
  if (paths.some((p) => /release|verify-ci|production-smoke/.test(p)))
    result.push(
      'exact-SHA five-gate release + post-deploy evidence; no blind tag-gate copy',
    );
  if (paths.some((p) => /package|dependabot|wrangler|astro.config/.test(p)))
    result.push(
      'current compatible exact pins/lockfile + strict external CSS CSP',
    );
  if (paths.some((p) => /workflows|tests\//.test(p)))
    result.push(
      'current Quality/responsive/accessibility/Safari/Lighthouse gates',
    );
  if (paths.some((p) => /docs|README|AGENTS|copilot/.test(p)))
    result.push('local docs own facts; reference history is not live evidence');
  if (!result.length)
    result.push(
      'site-specific UI/assets or maintenance; no security code port required',
    );
  return result.join('; ');
};
let report = '# AlienX complete reachable-history comparison\n\n';
report +=
  'Refreshed: ' +
  new Date().toISOString().slice(0, 10) +
  '. Main: `' +
  main +
  '`.\n\n';
report +=
  commits.length +
  ' unique commits across all advertised refs; ' +
  mainHistory.size +
  ' are reachable from main. Includes retained pull-request refs, branch history and tags. Deleted/unreachable objects cannot be established from public Git.\n\n';
report +=
  'Every commit has a complete first-parent patch read locally (including root commits), a changed-file inventory and a SHA-256 digest of that patch. Merge rows compare with the first parent; all other parents also appear independently in the reachable commit inventory. Binary changes are represented by Git metadata, not pixel/content inspection. This removes the GitHub API large-patch omissions from the earlier 450-commit inventory. The disposition column maps historical changes to current Cleaning controls; it is automated triage backed by the current-source security review, not a claim of manually reviewing every historical line. See [security-parity.md](security-parity.md) for validation and limits. No patch contents or matched credential values are published.\n\n';
report +=
  'Regenerate with `node scripts/compare-reference-history.mjs /path/to/fresh/alienx.git`, then inspect the current sources and update security-parity.md.\n\n## Observed refs\n\n';
report += refs.map((ref) => '- `' + clean(ref) + '`').join('\n') + '\n\n';
report +=
  '## Every reachable commit\n\n| Commit | Scope | Subject | Files | Current Cleaning disposition | Patch digest (SHA-256) |\n| --- | --- | --- | ---: | --- | --- |\n';
for (const sha of commits) {
  const subject = git('show', '-s', '--format=%s', sha);
  const paths = git(
    'show',
    '--root',
    '--format=',
    '--name-only',
    '--no-ext-diff',
    '--no-textconv',
    '--first-parent',
    sha,
  )
    .split('\n')
    .filter(Boolean);
  const patch = git(
    'show',
    '--format=',
    '--root',
    '--first-parent',
    '--no-ext-diff',
    '--no-textconv',
    sha,
  );
  const digest = createHash('sha256').update(patch).digest('hex');
  const scope = mainHistory.has(sha)
    ? 'main'
    : branchHistory.has(sha)
      ? 'branch-only'
      : 'retained PR ref';
  report +=
    '| [' +
    sha.slice(0, 9) +
    '](https://github.com/AlienX420710/alienx-smarthome/commit/' +
    sha +
    ') | ' +
    scope +
    ' | ' +
    clean(subject) +
    ' | ' +
    paths.length +
    ' | ' +
    disposition(paths, subject) +
    ' | `' +
    digest +
    '` |\n';
}
writeFileSync(
  new URL('../docs/alienx-commit-inventory.md', import.meta.url),
  report,
);
console.log(
  'Inventoried ' + commits.length + ' complete commit patches; main ' + main,
);
