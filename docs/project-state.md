# Cleaning by Cassi — current roadmap

This is the current findings register and document index. Roadmap updated September
25, 2026 with live external header scans. The repository comparison below remains
the September 22 snapshot; it is not a new AlienX comparison.
Historical audit sections retain evidence for their stated revisions only.

## Source states and release evidence

- Cleaning baseline: `286bf4a57f84b9b6f43d48eec5635353873bfade`.
- AlienX main: `b7a04bf8fdb13f8c4a6c616047ea80af459b5331`.
- AlienX PR #39: `83d3bdcfc908416be233b839504c90c5396d16aa`, still proposed
  when inspected. Adapted alert enforcement; no claim that it was merged upstream.
- AlienX PR #40 proposes a documentation index. This register uses Cleaning's
  own contracts and business needs, not AlienX's Lab/Work content roadmap.
- The baseline's five main gates and Production Smoke passed. Production Integrity
  [35662232341](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/35662232341)
  passed and a read-only production request returned the exact baseline revision.
  This supersedes the earlier statement that deployment of the authentication
  patch was unverified. It does not establish which build credential was used or
  independently inspect the Cloudflare `CI approved main` execution log.
- Refreshed [reference inventory](alienx-commit-inventory.md): 535 reachable
  commits, including retained PR refs, read as complete first-parent patches.
  This is automated inventory, not manual certification of every historical line.

Local closeout validation: 75 regression tests, formatting, type checks (zero
diagnostics), build, Wrangler deployment dry run and repository audit passed.
The history scan covered 527 reachable text blobs without detector findings; npm
audit reported zero vulnerabilities. The Cloudflare browser attempt stalled and
was cancelled; it provided no additional account evidence.

This closeout's new CI and production results must be read for its exact commit;
previous green checks do not certify it. The five protected PR checks remain
mandatory. The new code-scanning policy runs on main and must pass within Quality
before the existing Cloudflare release gate can approve deployment.

## Six-item closeout register

| ID     | Priority / disposition                               | Work and acceptance                                                                                                                                                                                                                                                                                                                                                                                        |
| ------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CBC-01 | P1 / implemented; exact-revision CI required         | Production Integrity checks out the trusted workflow revision, passes the target release SHA only as data, disables package caches and retained credentials. Regression tests reject removed/commented controls, changed origin/branch/event guards and caching.                                                                                                                                           |
| CBC-02 | P1 / implemented; main execution required            | Quality requires current CodeQL analyses for Actions and JavaScript/TypeScript, no analysis errors/warnings and zero open code-scanning alerts across tools/severities. Uses only read permissions, no install/cache, bounded wait and complete bounded alert pagination. Stale main, missing evidence and API failures block release. This does not inspect private Dependabot or secret-scanning alerts. |
| CBC-03 | P2 / implemented                                     | Dedicated `.dev.vars.example` contains empty secrets and explicit local hostname policy. `.env.example` redirects to Worker configuration. Production hostnames/credentials are not local-test defaults. No PUBLIC variable architecture was copied from AlienX.                                                                                                                                           |
| CBC-04 | P2 / implemented                                     | This current register, docs index, README and operating runbook distinguish baseline evidence, new implementation, and controls still requiring evidence. Future changes update this register and the relevant contract.                                                                                                                                                                                   |
| CBC-05 | P1 / partly verified; account controls open          | Live required PR/check rules are active with no bypasses. September 21/22 heartbeat delivery and enabled daily monitor are evidenced below. The actual npm deployment command was exercised in an isolated rejection/recovery rehearsal with mocked GitHub evidence and a non-deploying Wrangler sentinel. Real account configuration, credential review and production recovery remain open below.        |
| CBC-06 | P2 / partly completed; device/business evidence open | Missing DM Serif Display notice restored using upstream OFL plus embedded binary copyright. Removed the unused old 220×230 hero component/asset; current homepage uses the existing 1312×1199 photo. Keyboard/axe/Safari/Lighthouse gates remain mandatory. Real VoiceOver/iPad/touch/zoom and a verified dedicated Facebook review URL still require direct evidence.                                     |

## Operational evidence and remaining blockers

- GitHub ruleset 23093180 was read on September 22: active, PRs and all five
  GitHub Actions contexts required, strict up-to-date checks, no bypasses, deletion
  and force-push blocked. Review-thread resolution is currently not required;
  enabling it requires administrator access. Legacy branch-protection access is
  unavailable. Do not bypass the rules to apply future changes.
- Read-only Resend metadata contained exactly one heartbeat for September 21 and
  one for September 22, each marked delivered. The September 22 record confirms
  sender `quotes@cleaningbycassi.com` and the fixed business recipient. Domain
  status is verified and sending enabled. No unrelated customer body was read,
  no replacement email was sent, and no successful quote was submitted.
- The independent monitor is enabled for 05:10 America/Chicago; its last recorded
  execution was September 22 at 10:11:57 UTC. Configuration and execution do not
  establish receipt of a failure notification. A controlled notification exercise
  remains unverified. Delivery means receiving-server acceptance, not inbox placement.
- Private GitHub CodeQL/Dependabot/secret-scanning endpoints were rejected by the
  connector's endpoint policy. The new Actions job can establish CodeQL inventory
  using its dedicated permission. Private Dependabot and secret alerts still need
  authorized account inspection; a clean npm/history scan is different evidence.
- Resend key metadata exposed a credential-shaped display name. Its value is not
  retained here. Treat it as potentially exposed until privately checked. The
  listing provides no scope or mapping to the Worker's secret. An administrator
  must identify usage, create a replacement with sending-only access to this
  domain if required, update the Worker through the secret UI, verify delivery,
  then revoke the old key. Do not revoke an unidentified live key or put values
  in chat, docs, PRs or logs. Review obsolete onboarding keys at the same time.
- No Cloudflare account-management capability is available in this session. WAF,
  MFA/recovery, runtime credential mapping/rotation and build-log inspection cannot
  be certified from public site responses. Existing user-evidenced build settings
  remain recorded in the release runbook; no drift is assumed.
- The isolated npm-command exercise proves failure before deployment and recovery
  with valid mocked evidence. It is **not** a live failed release or Cloudflare
  version rollback. A live recovery drill needs a known-good Worker version,
  binding compatibility and an agreed maintenance window; see the runbook.
- Local Wrangler preview failed with `uv_interface_addresses`; no browser pass is
  claimed from that attempt. Required CI supplies real Chromium, native Safari,
  WebKit, axe and Lighthouse execution. These do not emulate a human VoiceOver
  user or establish real-device touch/zoom behavior.
- Public search did not establish a dedicated Facebook recommendations URL for
  this business. `/review` keeps the verified profile and accurately labelled
  private email feedback; no speculative review link or invented review is added.
- Lighthouse provides lab performance evidence. Real-user field metrics remain
  unavailable; no analytics/tracking service was added just to manufacture them.

## Next evidence to close owner-only items

1. GitHub Security alert lists and account security settings: inspect privately;
   record counts/disposition and MFA/recovery readiness, never secret values.
2. Cloudflare: inspect WAF coverage, least-privilege credentials, the exact release
   approval log and compatible version history. Coordinate the potentially exposed
   mail-key rotation through the provider secret interfaces.
3. Recovery/notifications: run the controlled exercise in the release runbook and
   confirm failure notification receipt without intentionally dropping a heartbeat.
4. On an actual iPad with VoiceOver, use [the device protocol](device-validation.md).
   Record device/OS, both themes and observed outcomes; fix failures before closing.
5. Open this business's Facebook Recommendations/Reviews interface and capture its
   actual public destination before replacing the profile link.

## September 25 external header baseline and follow-up

Owner-approved roadmap additions; implementation remains open. The September 25
scan did not alter production, submit a quote or send email. The fetched main ref
is still `286bf4a57f84b9b6f43d48eec5635353873bfade`; PR #19 is separate,
unmerged work. These external scans did not read `/api/release`, so their results
are timestamped URL evidence, not exact-revision deployment certification.

- [Mozilla Observatory](https://developer.mozilla.org/en-US/observatory/analyze?host=cleaningbycassi.com):
  live homepage scan on September 25 around 12:45 CDT returned **A+, 140/100,
  12/12 tests passed**. The score includes bonus points; the report URL can change
  with later scans. Recorded bonuses: CSP +5, Referrer Policy +5, Subresource
  Integrity +5, framing protection +5, COOP +10 and CORP +10. These are the
  scanner's findings for the scanned page, not proof all routes/scripts have SRI.
- [SSL.org security headers](https://www.ssl.org/security-headers): submitted
  `https://cleaningbycassi.com` with redirects enabled. Response date September
  25, 17:45:29 UTC; HTTP 200; **9/15 tracked headers present**, not a grade.
  The form result is not encoded in its URL. HSTS was one year with
  `includeSubDomains; preload`; this does not prove preload-list enrollment.
- Both observations support the existing homepage header protections. Neither
  verifies account security, private alert inventory, successful quote handling,
  email delivery or every route. SSL.org's host-allowlist advisory is a hardening
  opportunity, not evidence of an exploitable bypass on an allowed host.

| ID     | Priority / status            | Work and closure criteria                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------ | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CBC-07 | P3 / planned                 | Add `X-Permitted-Cross-Domain-Policies: none` and `display-capture=()` to the existing Permissions Policy where appropriate. Cover middleware/static response paths with regression assertions; verify actual live values after deployment and retain all existing protections.                                                                                                                                                                    |
| CBC-08 | P2 / evaluation pending      | Evaluate nonce/hash-based script authorization with `strict-dynamic`, and Observatory's `default-src 'none'` suggestion. Inventory first-party modules, dynamic imports, Turnstile and cache behavior before choosing a policy. Close with a tested implementation or a documented compatibility-based disposition; adding a nonce alone does not remove host trust.                                                                               |
| CBC-09 | P2 / evaluation pending      | Evaluate a monitored CSP reporting destination with an identified owner, data minimization/redaction, retention limits, body-size/rate limits and abuse controls. Avoid quote data or sensitive URLs in reports. Prove a synthetic non-production violation is received and actionable before calling monitoring operational; do not create an unbounded public ingestion endpoint.                                                                |
| CBC-10 | P2 / coverage review planned | Compare existing production-integrity coverage with the scan findings; extend only missing checks across homepage, quote page, API success/error responses and representative static assets on both domains. Apply headers according to response type. Record exact-revision evidence, redirects, cache behavior and repeat external scan outcomes after rollout. Successful API paths use mocked providers; production probes must not send mail. |

### Compatibility and bonus-point acceptance

Preserve the current protections that earned bonus points, while prioritizing
security and correct behavior over a numerical score. Assess COEP, stricter
referrer policy, DNS-prefetch controls, Origin-Agent-Cluster and legacy XSS-filter
settings individually; absence alone is not a required fix. COEP requires a
specific cross-origin resource/Turnstile compatibility assessment. Do not apply
`Clear-Site-Data` globally, enable deprecated XSS filtering, submit HSTS preload,
or add arbitrary headers solely to reach 15/15 or raise the score.

Before merging runtime changes: all five protected checks must pass on the
up-to-date exact revision, including Chromium/WebKit/native Safari, both themes,
keyboard navigation and quote validation/retry journeys. Confirm styles/scripts
load without unexpected CSP violations and Turnstile remains functional; mocked
provider tests cannot alone establish real-widget compatibility. No bypasses,
weakened checks or real quote emails as tests. After deployment, verify the exact
release and applicable live headers, repeat the scans and investigate any lost
bonus protection or behavior regression before closing these items. An A+ is a
baseline observation, not a guarantee of security or a reason to suppress findings.

## September 25 closeout verification blocker

PR #19 at `8abe63d` passed Quality, accessibility/theme and responsive checks.
[Lighthouse run 36169641237](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/36169641237)
failed: homepage performance 0.82 against the unchanged 0.85 minimum (LCP 3.3s,
TBT about 400ms). All applicable accessibility, best-practices and SEO scores
were 1.00; the other seven routes met the performance budget. The retained
report identified approximately 67 KiB of image-delivery savings in the logo and
homepage photo. Its about-page trace failed once with NO_NAVSTART and succeeded
under the existing trace-only retry; the low homepage score was not retried.

The follow-up generates an AVIF version of the same homepage photo at its
original dimensions, retaining the original WebP fallback and encodes the existing 344px logo at quality 80 instead of 95. Source artwork, layout, alt text and all thresholds remain unchanged. This
addresses measured image overhead; a new required Lighthouse run must establish
whether performance now meets the budget. No pass or deployment is inferred
from the optimization itself. CBC-07 through CBC-10 remain open roadmap work.

The AVIF quality-45 candidate is 41,007 bytes versus the original 69,618-byte
WebP; the logo is 32,210 bytes versus 41,064. No lower-quality replacement is
forced on clients without AVIF support. Exact CI/browser results remain required.
