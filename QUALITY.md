# Quality and release policy

This policy consolidates existing requirements; it does not replace executable
checks. [AGENTS.md](AGENTS.md) governs maintenance and the [roadmap](docs/project-state.md)
records dated evidence and remaining gaps.

## Required before merge

Use a scoped pull request, an up-to-date branch and all five required checks:

- Build, type check, audit: exact dependencies, source/history scans, formatting,
  regression tests, build/type checks, Worker dry run and all-severity npm audit.
- Responsive viewport matrix: shared candidate integrity plus viewport tests.
- Light, dark, and accessibility checks: both themes, axe and interaction tests.
- Safari / WebKit compatibility: native Safari plus WebKit keyboard/interactions.
- Performance, accessibility, best practices, and SEO: all eight routes and the
  thresholds in [lighthouse.config.cjs](lighthouse.config.cjs).

Auto-merge may queue reviewed changes; it must not bypass protections. Missing,
failed, pending, skipped or cancelled required checks are not approval. Preserve
quote validation, Turnstile, rate limiting, idempotency, strict CSP, no persisted
checkout credentials and read-only workflow permissions.

Lighthouse remains single-sample, with performance at least 0.85 and all other
applicable categories at least 0.95. Only the intentionally noindex receipt omits
SEO. One NO_NAVSTART trace retry is allowed, with both reports retained. Never
retry low scores to manufacture success, lower thresholds or average away a failure.

## Required after merge

Verify the exact new main SHA: all five main workflows, fresh CodeQL analyses and
zero open code-scanning alerts, then Cloudflare deployment, Production Smoke and
Production Integrity on both domains. PR evidence does not certify the new main
revision. Production Integrity remains post-deployment, not a circular merge gate.

Candidate integrity uses a fixed HTTP loopback origin and no production secrets.
It still verifies the exact build revision, CSP, all denied browser capabilities,
API/error responses and static headers. Its documented local readiness/HTTP
exceptions do not apply in production. Both modes issue only read-only requests.

## Evidence boundaries

Do not send real quotes, replacement heartbeats or alter credentials to make tests
pass. The existing authorized Worker schedule is separate from CI. Delivery means
receiving-server acceptance, not inbox placement. Scanner scores do not certify
account security, WAF, recovery, notification receipt or human/device accessibility.
Keep those controls open until their specific evidence exists. See the
[release runbook](docs/release-runbook.md) and [private reporting policy](SECURITY.md).
