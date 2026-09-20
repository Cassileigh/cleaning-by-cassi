# Security parity — current-source audit

## September 20 closeout and daily mail monitoring

Fresh comparison: Cleaning `3c9f4997fbec9677ca4d9b03c30f2454985dda6f`, AlienX
`f532099632ea0c093629ff08b1b46f4a645d6b45`. Seven new AlienX main commits since
`8b6d500` merge PR #36: three release-decision/test changes, three formatting
changes and the merge. PR #38 remains unmerged at `4586ceb8c0d1d1e4417e3fe917207d68737d19ba`.

Applicable changes adopted in this closeout:

- Directly test the final release decision, rejecting empty, duplicate and malformed
  evidence as well as failures. Preserve the read-only exact-main API deployment
  gate instead of copying AlienX's writable approval refs.
- Enforce the existing workflow origin guard and execution of WebKit interaction
  tests against accidental removal, including commented-out controls.
- Add real keyboard light/dark journeys across all eight routes and quote retry
  coverage in Chromium/WebKit. Remove the quote input outline suppression and
  provide a visible keyboard outline in both themes.
- Add the owner-authorized daily 05:00 Central production email check, documented
  in [email-health.md](email-health.md). No public sending endpoint or Turnstile
  bypass is introduced; ordinary CI tests remain fully mocked.

Read-only Resend evidence confirms the sending domain is verified and recent
business/customer messages were delivered. Future daily heartbeat delivery is not
verified until its scheduled run. Monitoring activation and exact-revision CI and
production outcomes must be checked separately from implementation.

Still open, not waived: private GitHub alert disposition, account MFA/recovery,
credential scope/rotation, WAF inspection, Cloudflare CI-approval execution log,
and a controlled rollback rehearsal. The GitHub connector does not provide the
necessary administrative/private-alert access. No live rollback or account-rule
relaxation is justified by this code closeout. Prior verified dashboard settings
and branch rules remain valid unless fresh evidence shows drift.

Local validation for this patch: 55 regression tests, formatting, Astro/TypeScript
(zero diagnostics), production build, Wrangler deployment dry run and repository
audit passed. npm audit reported zero vulnerabilities at the all-severity gate.
The ordinary checkout history scan covered 495 reachable text blobs; this is not
a new full retained-PR mirror inventory. Local browser preview was blocked by
`uv_interface_addresses` in this workspace; required GitHub browser checks must
pass before merge. No real email was sent during these tests.

## September 19 account-control verification (latest disposition)

The earlier open-control tables below are historical snapshots. This section
supersedes their GitHub ruleset and Cloudflare dashboard-configuration findings.

| Control                  | Evidence and disposition                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Main merge protections   | GitHub API confirms ruleset 23093180 is active on the default branch, main. PRs and all five CI checks are required, strict up-to-date checks are enabled, deletion and force pushes are blocked, and bypass_actors is empty. Current connector bypass permission is never. Zero human approvals is intentional for the solo-maintainer workflow; PRs and automated checks remain mandatory. |
| Check provenance         | All five contexts are bound to GitHub Actions, integration 15368: Build, type check, audit; Light, dark, and accessibility checks; Performance, accessibility, best practices, and SEO; Safari / WebKit compatibility; Responsive viewport matrix.                                                                                                                                           |
| Cloudflare configuration | User-provided dashboard screenshot IMG_0248.png shows Cassileigh/cleaning-by-cassi, production main, root /, build npm run build and deploy npm run deploy. The user subsequently confirmed disabling non-production branch builds. The toggle change is user-reported, not independently read through an account API.                                                                       |
| Gate execution evidence  | Dashboard command configuration is now evidenced. A Cloudflare build log containing CI approved main followed by the release SHA has not been inspected; do not confuse configuration evidence with a full execution-log audit.                                                                                                                                                              |
| Scanning enabled         | User-provided Security overview shows security policy, advisories, private reporting, Dependabot alerts, code scanning and secret scanning enabled. Open alert lists remain unverified; enabled does not mean zero alerts.                                                                                                                                                                   |

The workflow-hardening release `5fd4741c1cc3eaff65850848b0e097805b94ee31`
passed all five main-push release workflows, CodeQL, Production Smoke
([35470325306](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/35470325306))
and Production Integrity
([35470515658](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/35470515658)).
Independent read-only integrity checks passed on both domains for that exact SHA.
Its refreshed full-mirror credential scan covered 509 unique text blobs with no
detector findings; heuristic scanning is not exhaustive certification.

PR #14 updates Prettier to 3.9.7 and Wrangler to 4.133.0. Its exact head
`bda932e53021f923918eb7c066d538748c875c1b` passed Quality (35470437759),
Accessibility (35470437758), Responsive (35470437761), Lighthouse (35470437773)
and Safari (35470437796). Quality includes install, tests, formatting, build,
typecheck, dry run and both security scans plus the all-severity dependency audit.
It was merged normally as `24a28a8dfdc0af17acc3d3825305d24f6b552d7b` under the
active rules, without bypass. Its new main-push and production checks are separate
from PR evidence and must pass before calling that revision production-verified.

Still open: private alert disposition; account MFA/recovery and credential scope;
edge/WAF account inspection; provider delivery/bounce and notification ownership;
safe rollback rehearsal; and the limits of manual historical review. No real test
emails were sent. Do not reopen completed configuration questions without evidence
of drift, and do not mark the remaining controls completed without evidence.

## September 19 follow-up — closure work, not blanket certification

Fresh main refs: Cleaning `b872d989d0cf29e8730f78d260c4edaf126782cd` and AlienX
`8b6d5006f5612c8943c528579d9bf90381d52d21`. Neither main advanced since the
previous audit. PR #13 now proposes Wrangler 4.132.0; this follow-up incorporates
that exact version and its regenerated lockfile, without dropping other gates.

Repository fixes in this follow-up:

- Disable persisted checkout credentials in all five remaining checkout workflows.
  The repository audit now requires that setting for each checkout separately.
- Reject inline/unsupported permission declarations, commented write permissions,
  and compact privileged pull-request triggers. These are conservative checks of
  repository workflow conventions, not a general-purpose YAML security parser.
- Reject tracked `.dev.vars` secrets and fail on unreadable tracked files instead
  of silently excluding them. Detect Resend key patterns in the working tree as
  well as historical commits, without printing matching values.
- Raise the dependency gate from high/critical to **all reported severities**.
  Do not add audit exclusions or lower this threshold to get a green check.
- Add regression tests for each of these cases. Browser and production evidence
  for earlier commits does not certify this new patch.

### Earlier open-control snapshot (superseded above where verified)

| Control                            | Fresh evidence / remaining action                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Required CI at the GitHub boundary | Public ruleset 23093180 is active on the default branch but only lists deletion and non-fast-forward restrictions, with multiple always-bypass actors. No required CI is present in that ruleset. Legacy branch-protection inspection returned 403 (integration lacks administration access); its settings remain unknown. An administrator must verify/enforce required checks and review bypass actors. Do not bypass protections to apply this. |
| Security alerts                    | The configured repository connection cannot read the Dependabot alerts endpoint. A clean npm audit is not a substitute for the repository's private alert state.                                                                                                                                                                                                                                                                                   |
| Cloudflare deployment gate         | Dashboard configuration and a build log proving `npm run deploy` invoked the exact-SHA CI gate remain unverified. Only main may produce production releases.                                                                                                                                                                                                                                                                                       |
| Account/edge controls              | WAF rules, token scope/rotation, account MFA and recovery controls require authorized account inspection; source changes cannot certify them.                                                                                                                                                                                                                                                                                                      |
| Delivery and recovery              | Provider acceptance is not inbox delivery. Existing delivery/bounce events, alert ownership and a safely planned rollback rehearsal still need evidence; no real quote emails are sent by tests.                                                                                                                                                                                                                                                   |
| Historical review                  | The complete automated inventory remains distinct from manual review of every historical line. No unsupported exhaustive certification is made.                                                                                                                                                                                                                                                                                                    |

These items are **open**, not waived or counted as completed. See the release
runbook for the administrator closure checklist and preserve existing evidence.

Local follow-up validation: 48 tests passed; formatting, Astro/TypeScript checks
(zero errors/warnings/hints), build, Wrangler 4.132.0 deployment dry run, repository
audit and history scan passed. npm reported zero vulnerabilities with the stricter
low-severity threshold. The history scan covered 479 unique text blobs reachable
in the fresh ordinary clone; it is not a renewed full retained-PR mirror inventory.
New exact-revision GitHub browser and production results must be checked after
publication; they are not implied by these local results. No test emails were sent.

Audit refreshed: 2026-09-17. Code-level hardening verified at `66cc94657bfdc29e67ed9b87c23ed868ef53e3ea`. This is not a full manual historical or account-security certification.

## Sources and evidence

- Cleaning main at audit start: `fc89f155ca09c67a4c0ecc36aa2dcf54b4a0bff7`.
- AlienX main: `8b6d5006f5612c8943c528579d9bf90381d52d21`.
- AlienX security branch: `1bb8fec2c518584cec6396b2a8e52f8ac55cae69`.
- [All 520 reachable commits](alienx-commit-inventory.md), including main, branch-only history, retained PR refs and the approval tag. A fresh full mirror extends the earlier 450-commit branch inventory. Every available complete first-parent patch was read by the reproducible inventory script; automated mapping is not a claim of manual line-by-line review.
- Read current local contracts: [quote security](quote-security-contract.md), [release runbook](release-runbook.md), [earlier audit](audit-follow-up.md). Historical observations are not fresh production evidence.
- Current Cleaning baseline has successful Quality, Responsive, Accessibility, Lighthouse, Safari and Production Smoke runs for its exact SHA. New changes require new results.
- Dependabot closed PR #12 after its three requested versions were incorporated. It subsequently opened PR #13 for Wrangler 4.131.2, newer than the reference's 4.131.1. That new maintenance update remains open; it was not discarded to claim zero PRs.
- Fresh GitHub branch listings mark both repositories' main branches protected. This flag does not establish the exact enforced rules or bypass permissions.

## Comparison and dispositions

| Area                   | Current comparison                                                                                                                                      | Disposition                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Turnstile              | Cleaning verifies success, hostname and quote action server-side, with a 10-second timeout and fail-closed configuration                                | Retained; do not copy AlienX's legacy token-field/forwarding rewrites                                                                                                      |
| Request validation     | Cleaning bounds streamed form bodies to 30 KB, rejects duplicate scalars, files, controls, invalid enums/dates and cross-origin submissions             | Retained; different form schema intentionally not replaced by AlienX's JSON inquiry payload                                                                                |
| Honeypot               | Cleaning rejects any populated faxNumber, including whitespace, duplicates and files, before provider calls                                             | Stronger than AlienX's trimmed-string trap; retained                                                                                                                       |
| Rate limits            | Cleaning requires the edge binding and has a bounded isolate fallback; AlienX's current edge binding is optional                                        | Stronger protection retained                                                                                                                                               |
| Readiness              | Cleaning omitted the required rate-limit binding and accepted comma-only host configuration                                                             | Fixed, with GET/HEAD tests and no provider calls                                                                                                                           |
| Resend response chain  | Business HTTP success plus nonempty provider ID precedes JSON success/native 303; optional customer confirmation failure does not lose an accepted lead | Retained; arbitrary exception text removed from logs                                                                                                                       |
| Retry safety           | Canonical submitted fields and submission ID produce separate deterministic business/customer keys; verification tokens excluded                        | Retained; provider acceptance is not delivery, no durable application queue                                                                                                |
| Workflow supply chain  | Full SHA action pins, explicit read permissions, exact dependencies, lockfile, npm audit and Dependabot already present                                 | Added permanent repository security audit adapted from AlienX                                                                                                              |
| Historical credentials | No required historical scan in Cleaning baseline                                                                                                        | Added sanitized full-history scanner in Quality, full checkout, fail on shallow/incomplete object reads                                                                    |
| Production integrity   | Cleaning smoke verifies revision/basic route/readiness contracts; AlienX has a deeper post-smoke integrity matrix                                       | Added separate read-only integrity workflow: stable exact revision, eight routes, both domains, CSP script restrictions/headers, HTTPS, robots/sitemap and noindex receipt |
| Release gates          | Both require five successful exact-main-push workflows                                                                                                  | Keep Cleaning's existing API gate; AlienX's tag approval architecture is not required for equivalent fail-closed decisions                                                 |
| Strict style CSP       | Inline-style exception and broad external image/font allowances removed                                                                                 | Astro emits external same-origin stylesheets; browser matrix now asserts strict CSP, no server-authored inline styles, and loaded local CSS. Email HTML is unaffected.     |
| Dependency versions    | Matched reference pins: TypeScript 6.0.3, Wrangler 4.131.1, Prettier 3.9.6, Astro formatter 1.0.0, Selenium 4.49.0                                      | Lockfile regenerated; formatter migration requires formatting-only changes across Astro templates and quote client. Other shared runtime/test versions already match.      |
| Browser/accessibility  | Five pre-release gates already include Safari, responsive/theme, accessibility and Lighthouse                                                           | Retained; AlienX-specific Museum/Lab/portfolio changes do not belong in Cleaning                                                                                           |
| Account controls       | Repository source cannot prove dashboard deploy commands, protection enforcement, WAF or credential scope                                               | Not certified; verify with authorized account evidence                                                                                                                     |
| Full historical review | Commit inventory and security-focused source review completed; not every historical line manually audited                                               | Open; inventory must not be presented as exhaustive manual review                                                                                                          |

## Verification boundaries

First patch (`7ca37f9019fc7fc24fbfc7aaa49b87ad3deefdef`) passed GitHub Quality, Responsive, Accessibility, Lighthouse, Safari, Production Smoke and Production Integrity. Refreshed on September 17: Production Integrity run 35161611825 and scheduled run 35196726526 succeeded. Integrity jobs triggered by scheduled smoke are intentionally skipped; its own daily schedule remains active.

The fresh AlienX mirror's sanitized history scan passed across 746 unique text blobs. Its main still resolves to `8b6d5006f5612c8943c528579d9bf90381d52d21`. Cleaning's complete mirror includes 309 reachable commits (including retained PR refs); its scan passed across 497 unique text blobs. No upstream main commit was assumed from memory.

The follow-up at `66cc94657bfdc29e67ed9b87c23ed868ef53e3ea` passed 42 mocked endpoint/client/release/integrity/scanner tests, source formatting, Astro/TypeScript checks (zero errors/warnings/hints), Astro build, Cloudflare dry run, repository/history gates and npm audit (zero reported vulnerabilities). Local Wrangler browser preview fails with uv_interface_addresses in this environment and is not counted as passing; actual GitHub browser gates passed instead. No real emails were sent.

Exact-revision GitHub evidence:

| Check                                                                | Successful run                                                                          |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Quality, including repository/history audits                         | [35275240814](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/35275240814) |
| Accessibility/theme, including strict-CSP and quote/navigation tests | [35275240815](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/35275240815) |
| Responsive viewport matrix                                           | [35275240956](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/35275240956) |
| Native Safari and WebKit                                             | [35275240784](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/35275240784) |
| Lighthouse, unchanged budgets                                        | [35275240826](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/35275240826) |
| Exact-revision Production Smoke                                      | [35275240844](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/35275240844) |
| Post-Smoke Production Integrity, both domains/eight routes           | [35275587182](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/35275587182) |

An early independent production check saw the new release revision followed by a page with the old inline-style CSP and correctly failed. Later read-only responses showed strict CSP and zero inline style blocks, and the post-Smoke GitHub Integrity run passed without loosening the policy or rerunning that gate. The observations are consistent with rollout propagation, not proof of its underlying cause. Preserve this first failure; revision readiness alone does not prove every route has converged.

Adapting AlienX's scanner exposed an additional robustness issue: decoding binary blobs as UTF-8 could exceed the subprocess buffer and dump captured output on error. The port reads raw bytes, skips binary data before decoding, and replaces subprocess failures with a fixed sanitized error. Tests prove detection of a removed synthetic credential without printing it, shallow-history rejection, and detection of unpinned shorthand action steps.

The scanners are heuristic: text blobs over 2 MiB and binary blobs are skipped; a clean scan is not proof no credential ever existed. A historical finding must be investigated privately and rotated if real, not “fixed” by deleting the detector. Never publish matched values. Do not rewrite production history as an automatic audit remediation.

## Maintenance

Future work must read this document, quote-security-contract.md and release-runbook.md, fetch current repository heads, update the commit inventory delta and attach exact-SHA validation evidence. Keep main as the sole production branch. Never close dependency PRs or remove branches simply to improve counts.
