# Directory parity review — September 26, 2026

September 27 implementation follow-up: the comparison table below records the
baseline, not the proposed branch. Candidate/static/permissions enforcement,
CodeQL record-shape tests, QUALITY.md and tested lighthouse.config.cjs are now
implemented on the follow-up branch, pending exact-revision CI and production
verification. The existing single-sample threshold remains unchanged. No SVG
favicon, CSP rewrite or account-setting change is included.

Fresh sources: Cleaning `ee9f3e8898fcab7d250983d7ca733a29e87dc946`; AlienX
`cf464ed512d799d1282c41894ac5ff18e4cacbd6`. The latest AlienX change is PR #47,
which adopted several existing Cleaning controls. This is a scoped comparison,
not a requirement to duplicate filenames or certify every historical line.

## Requested files and directories

| Area                        | Observed difference                                                                                                                                                                                                                                                              | Disposition                                                                                                                                                                                                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `QUALITY.md`                | AlienX has a dedicated acceptance-policy document; Cleaning distributes these rules across AGENTS, README, the release runbook and workflows.                                                                                                                                    | Useful documentation consolidation, not an absent CI security gate. A future policy should link the existing source of truth rather than create conflicting requirements.                                                                                          |
| `lighthouse.config.cjs`     | AlienX imports thresholds/routes from this file and always measures three samples; performance uses the median, other categories the worst sample. Cleaning embeds identical thresholds in its script and uses one sample, retrying only NO_NAVSTART trace failure.              | Extracting configuration and testing assessment would improve maintainability. Three-sample aggregation is a policy change, not automatically a stricter gate: it can pass one low performance sample. Do not silently replace the current fail-on-low-score rule. |
| `public/favicon.svg`        | AlienX ships an alien SVG. Cleaning has PNG/ICO favicons, Apple touch and manifest icons, wired in BaseHead.                                                                                                                                                                     | No missing favicon functionality and no security/Observatory penalty. An SVG would need approved Cleaning vector artwork; do not copy the alien icon or wrap a raster just to create a filename.                                                                   |
| `/docs`                     | Both now have indexes, findings registers, request contracts and physical-device protocols. AlienX #47 adopted the latter two patterns from Cleaning.                                                                                                                            | Keep the current verified production evidence and separate account/device evidence.                                                                                                                                                                                |
| `/scripts`                  | AlienX runs a shared candidate/live integrity contract; Cleaning's full integrity script is post-deployment only. AlienX parses all seven denied browser capabilities and rejects duplicate/malformed permission directives; Cleaning has partial regex checks.                  | Meaningful follow-up: reusable candidate verification before merge, complete permission parsing and mutation tests. Preserve status-specific no-referrer/default-deny behavior.                                                                                    |
| `/src` and static responses | Both now share strict rate-limit outcomes, sanitized mail logging and broadly similar response protection. AlienX's `_headers` covers HSTS, framing, nosniff, referrer, COOP/CORP and the new policy headers; Cleaning's static file contains only the two newly added controls. | Extend appropriate static-file protections and verification. Do not apply HTML-only CSP assumptions indiscriminately to every asset. Preserve Cleaning's stronger form validation and generic status response.                                                     |
| `/tests`                    | Both have offline deploy-command rehearsals, CodeQL policy tests, browser/Safari/keyboard checks and header regressions. AlienX adds Lighthouse-assessment tests and more exhaustive permissions mutations.                                                                      | Add the missing assessment/permission/candidate tests. Test count or `.cjs` versus `.mjs` is not a security ranking.                                                                                                                                               |

AlienX additionally rejects array-shaped CodeQL records and non-string warning
values explicitly. Cleaning rejects malformed input in most paths but can ignore
an array-shaped unrelated record; adopt explicit shape validation with sanitized
errors and regression coverage. Never convert an API error into approval.

## Observatory evidence and limits

Requested fresh v2 scans on September 26 at 23:23 Central time:

- AlienX scan 123718672, September 27 04:23:39 UTC: A+, 145, all 12 passed.
- Cleaning scan 123718677, September 27 04:23:43 UTC: A+, 140, all 12 passed.
- The five-point difference is CSP: AlienX receives +10 for the scanner's
  default-deny result, Cleaning +5. Other bonus categories match.
- Important discrepancy: AlienX's current Astro configuration and integrity
  contract explicitly require `default-src 'self'`, while the published scan
  reports `default-src 'none'`. The scanner's combined header/meta interpretation
  needs investigation before attributing the bonus to an actual default-deny
  deployment. Do not copy a framing-only header and discard the resource policy.
- Neither QUALITY.md, Lighthouse config nor favicon.svg affects this HTTP header
  score. Scanner points are not proof of application, account or delivery security.

Sources: the [AlienX report](https://developer.mozilla.org/en-US/observatory/analyze?host=alienxsmarthome.com),
[Cleaning report](https://developer.mozilla.org/en-US/observatory/analyze?host=cleaningbycassi.com),
and [MDN FAQ/API](https://developer.mozilla.org/en-US/observatory/docs/faq).

## Verified release and remaining work

The refreshed complete reference inventory contains 554 reachable commits,
including 480 reachable from AlienX main. This is patch inventory, not a manual
line-by-line certification.

Cleaning `ee9f3e8` passed all five main gates, the main-only CodeQL inventory,
[Production Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/36275020798)
and [Production Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/36275277300).
Both domains passed the expanded exact-revision header checks. Homepage performance
was 94 on both PR and main; all thresholds were retained. No real quote or
replacement heartbeat was sent. The source comparison here changes documentation
only; the additional parity items above remain proposed, not implemented.

Priority: candidate/static/permissions enforcement first, then strict CodeQL input
shape tests and policy/config consolidation. SVG favicon is optional branding.
CSP/reporting and account credential, WAF, alert-receipt, recovery and real-device
items retain the evidence requirements in the current roadmap.
