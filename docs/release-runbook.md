# Release runbook

## Daily mail job

The owner authorized a fixed-recipient daily production health email at 05:00
Central on September 20. See [email-health.md](email-health.md) for scheduling,
delivery evidence, monitoring and safe disable instructions. This is the only
scheduled real-mail exception; CI and production smoke do not send test quotes.
The Worker entrypoint now retains Astro's `handle` for HTTP and adds a scheduled
handler. Preserve the two UTC cron candidates and America/Chicago time guard.

## Enforced PR workflow and verified dashboard settings

Verified September 19: main ruleset 23093180 requires PRs, all five existing
GitHub Actions checks and up-to-date branches; blocks deletion/force pushes; and
has no bypass actors. Use temporary PR branches and normal protected merges.
Zero required human approvals supports the solo maintainer, not direct pushes.
Production Smoke and Integrity remain post-deployment checks, not merge gates.

Dashboard screenshot IMG_0248.png confirms repository Cassileigh/cleaning-by-cassi,
production main, root /, build npm run build and deploy npm run deploy. The user
confirmed turning off non-production branch builds afterward; GitHub PR checks
remain enabled. No screenshot assets or account identifiers need to be committed.
Cloudflare build-log execution evidence is still separate from these settings.
See security-parity.md for the evidence and remaining account controls.

## September 19 closure checklist

All checkout steps must set `persist-credentials: false`; repository tests enforce
this and fail closed on unsupported permissions and unreadable tracked files.
`npm run audit` now blocks on low, moderate, high and critical findings. Wrangler
is now pinned to 4.133.0 via PR #14, with Prettier 3.9.7. Do not relax existing
browser, accessibility or release gates.

Account-level work is not complete until an authorized administrator records:

1. The effective main rules (including legacy protections), requiring Quality,
   Responsive, Accessibility, Lighthouse and Safari results, and an explicit review
   of all bypass actors. The ruleset portion is now verified above; legacy
   protection inspection remains unavailable. Do not disable rules
   to ship a patch. Record settings and exact check names, not credentials.
2. Cloudflare production branch `main`, build `npm run build`, deploy `npm run deploy`,
   and an actual log containing `CI approved main <sha>` for the released revision.
3. Repository security-alert disposition, account MFA/recovery, least-privilege
   deployment/mail credentials, and applicable edge abuse controls.
4. Existing provider delivery/bounce evidence and an owner for failed delivery and
   failed production-integrity alerts. Automated tests must not send real mail.
5. A separately approved rollback rehearsal: identify a known-good deployed version,
   confirm its bindings/configuration compatibility, rehearse outside production
   where possible, and record recovery validation. Never roll back production merely
   to mark an audit checklist complete.

Record evidence dates/revisions and unresolved items in security-parity.md. Missing
access is an open control, not a successful check. A patch can improve repository
security without proving account settings or eliminating every possible vulnerability.

## September 16 security controls

Quality now includes repository policy and sanitized full-history credential checks before dependency installation. Checkout must use fetch-depth: 0; shallow history fails closed. A detected historical value must be investigated privately, never printed into an issue or log.

Production Integrity runs after a successful main-push Production Smoke result, or on its daily/manual schedule. It checks the exact expected revision three consecutive times before examining eight routes on both domains, security headers and script CSP, HTTPS redirects, receipt noindex, robots and sitemap availability; it rechecks the revision afterward. It makes no quote submissions or email sends. It is post-deployment evidence, not a sixth pre-deployment gate.

The September 17 follow-up moves Astro page CSS to same-origin assets and removes inline-style, arbitrary HTTPS image and data-font allowances. Keep `build.inlineStylesheets: 'never'` paired with the strict middleware style policy. Rendered browser tests check both themes and detect server-authored inline styles or missing stylesheets. HTML email styles are separate and unaffected. Tooling is updated to the compatible reference versions, including TypeScript 6 rather than the unsupported TypeScript 7 proposal.

See [current security parity](security-parity.md) for exact verification and account-level limits. Do not infer that an added workflow has already passed.

## Cloudflare build configuration

### GitHub verification authentication

The September 21 deployment of referral update
`f101a2c5d4e8891dbe3acb0cf8a30fe07a9fcd11` built successfully, then stopped at
`GitHub verification unavailable: HTTP 403`. The old verifier made anonymous
requests and did not retain rate-limit headers, so the log does not distinguish
rate limiting from another GitHub denial. Cloudflare's repository connection does
not automatically authenticate this script's separate GitHub API requests.

The verifier now supports `GITHUB_READ_TOKEN`. Configure it under the Worker's
**Settings > Build > Build variables and secrets**, as a **secret**. It is a
build-only credential, not a Worker runtime binding, public variable or committed
`.env` value. Use a fine-grained GitHub token limited to
`Cassileigh/cleaning-by-cassi`, with **Actions: Read-only** and
**Contents: Read-only** (Metadata read access is automatic), an appropriate expiry,
and no write permissions. The owner must create and enter the credential through
the provider's secure UI; never send it in chat or print it in build logs.

When unset, public anonymous reads remain possible but share GitHub's lower IP
rate limit. Rate-limit headers now produce a specific diagnostic. Other denied
requests identify missing authentication or the need to check configured token
expiry/access without printing secrets or provider bodies. Redirects are rejected.
Errors remain fail-closed, with no anonymous fallback after an authenticated error.
Retry a failed Cloudflare build after configuration; all five exact-main-push
checks and the final current-main verification must still pass. Keep the deploy
command `npm run deploy`.

Sources: [GitHub rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api),
[workflow run permissions](https://docs.github.com/en/rest/actions/workflow-runs),
[Git reference permissions](https://docs.github.com/en/rest/git/refs), and
[Cloudflare build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

Tests cover authenticated/anonymous headers, fixed API destination, redirect
rejection, rate-limit/access diagnostics, malformed JSON, and secret/error-body
redaction. Creating the token, configuring the build secret, and successful
production deployment remain unverified until separately completed.

Production branch: `main`. Build command: `npm run build`. Deploy command: **`npm run deploy`**. Do not use the default direct `npx wrangler deploy` command: it bypasses the repository's CI gate.

The gate checks a clean checkout, the build SHA, the current GitHub main SHA, and successful push runs for quality, responsive, accessibility, lighthouse, and safari. It rechecks main immediately before allowing Wrangler to run. GitHub errors, missing evidence, skipped or failed workflows and a 12-minute timeout block deployment. Production smoke runs afterward and is deliberately not a prerequisite that would deadlock deployment.

The dashboard deploy command and active GitHub ruleset are now evidenced above.
Retain one Cloudflare build log showing `CI approved main <sha>` to close the
remaining execution-evidence item. No account integration was disconnected.

## Rate limiting

`wrangler.json` provisions `QUOTE_RATE_LIMITER`, namespace `2107100912`, at eight requests per minute. Middleware also retains its eight-per-ten-minute isolate safety net. A missing or broken binding rejects submissions with 503; an exhausted limit returns 429. Cloudflare enforcement is shared within a location and is not a strict global quota. See [Cloudflare's rate limit binding documentation](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).

## Verification

CI previews must use `wrangler dev --host 127.0.0.1 --upstream-protocol http` (plus the test port). Wrangler otherwise derives the upstream origin from the production route, causing the production CSP to upgrade local WebKit assets to HTTPS even though the local listener serves HTTP. Keep the production security headers intact; do not strip them to make tests pass. The manually dispatched browser diagnostics workflow can isolate future navigation failures.

Native Safari passed all 16 page/viewport checks at `2ffc6e6`. That run also identified Safari's generic fetch-abort wording, now handled through the actual timeout signal, and macOS's Option-Tab link navigation convention. The latest revision's full workflow results remain the release authority.

Run `npm ci`, `npm run format:check`, `npm run check`, and `npm run audit`. All five required workflows must pass on the exact release SHA. Safari uses native Safari WebDriver on macOS and retains the seven Playwright WebKit interaction tests. Automated quote journeys mock the verification/provider boundary and send no email. Lighthouse collects all eight routes and all four categories; only the intentionally noindex receipt omits the SEO threshold. Reports remain downloadable even on failure. Performance thresholds are not relaxed for noisy runs.

After deployment, verify `/api/release` matches the expected SHA and the production smoke passes. Configuration readiness is not proof of live mail delivery. Provider notifications, branch protection and a rehearsed rollback remain separate operational checks.

The September 17 release at `66cc946` passed all five pre-release gates, Smoke and post-Smoke Integrity. An independent check started earlier saw a stale page policy despite the new release revision; the failed observation is retained in [security-parity.md](security-parity.md). Run manual integrity checks after Smoke succeeds, and investigate a mixed revision/policy result rather than weakening CSP or treating the release endpoint alone as sufficient evidence.
