# Cleaning by Cassi — current state

Consolidated September 30, 2026. This is the sole current findings register.
Read AGENTS.md, QUALITY.md, [contract](quote-security-contract.md) and
[operations](release-runbook.md); historical prose is not current release approval.

## Source and release evidence

Reviewed source: ea93df984744d930e831796cc3f1856dbcdb5a7f (PR #26), not a new
production test. PR #25 main dca370f9b02174c1b57de367ec92ff3f3c83c1f2 passed
all five main gates, Lighthouse 36646214983,
[Smoke 36646214948](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/36646214948)
and [Integrity 36646563085](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/36646563085).
Later edits require independent release evidence. No new mail/account/device claim.

September 29's Miniflare-scoped Undici 7.29.1 repair retained Astro/unifont 8.10.2.
npm 11.9.0 and empty-directory npm 10.9.4 clean installs, 95 tests, types/build/
dry-run/security checks and zero audit findings were recorded. The earlier
version-qualified override failed run 36490727584; retain that failed evidence.
Historical pins are not current upgrade recommendations.

## Findings and acceptance

September 30 documentation-cleanup validation: 95 tests, types/build/dry-run and
repository/history scans passed locally. The all-severity dependency audit failed
on moderate `fast-uri` advisory GHSA-hrr3-gc8f-f4qj. Dependency remediation and a
clean audit remain required before this new revision can pass release gates;
historical zero-audit records above do not override this finding.

| ID     | Disposition                                            | Evidence or remaining acceptance                                                                                                                                                                                  |
| ------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CBC-01 | Verified September 26                                  | Integrity uses trusted workflow revision, release SHA as data, no cache or retained credentials.                                                                                                                  |
| CBC-02 | Main execution verified September 26                   | Fresh exact-main Actions/JS/TS analyses, no warnings/errors, zero open alerts; bounded complete pagination. API/stale/malformed evidence fails closed.                                                            |
| CBC-03 | Implemented                                            | Secret-free Worker example/local hostname policy; no production defaults or new PUBLIC architecture.                                                                                                              |
| CBC-04 | Implemented; consolidated                              | One register, contract, operations and pinned history; no duplicate status narratives.                                                                                                                            |
| CBC-05 | Partly verified; account evidence open                 | Required PR/five strict checks observed, historical delivered heartbeat, offline rejection/recovery passed. Remaining controls below.                                                                             |
| CBC-06 | Partial; device/business work open                     | Font notice/unused art cleanup done. Real iPad/VoiceOver/touch/zoom, verified Facebook reviews destination and owner copy review remain. Historical per-field server-error mapping remains a usability follow-up. |
| CBC-07 | Verified at ee9f3e8                                    | Legacy cross-domain and display-capture denial on dynamic/static paths.                                                                                                                                           |
| CBC-08 | Design evaluated; implementation/live-widget work open | Nonce/hash strict-dynamic must cover parser-inserted scripts, Turnstile and caching; keep existing policy until proven or compatibility disposition recorded.                                                     |
| CBC-09 | Provisioning/operational evidence open                 | Monitored CSP destination needs owner, bounded body/rates, URL/query/sample redaction, retention and actionable synthetic non-production evidence; no unmonitored collector.                                      |
| CBC-10 | Core verified; later candidate tranche released PR #23 | Shared candidate/live assertions, strict seven-capability parsing, API/error/static coverage; retain exact-revision evidence and no live quote tests.                                                             |

PR #23 runtime/navigation changes passed at 5522d60440bfe66cb92adde8f2ce3a75c9eb77d4,
Smoke 36490018374 and Integrity 36490418251. Earlier layout/Lighthouse failures
remain in history. No audit-wide or account-security completion is claimed.

## Remaining account and owner work

- Privately inspect Dependabot/secret alert counts and disposition, account MFA
  and recovery for GitHub/Cloudflare/Resend. Never publish secret values.
- Privately review the credential-shaped Resend key display name. Identify usage
  and scope first; if exposed, create domain-restricted sending-only replacement,
  update Worker securely, verify delivery, then revoke old access. Never revoke an
  unidentified live key. Review obsolete onboarding keys/read-only build token.
- Verify WAF, accessible legacy protection and one successful Cloudflare build's
  CI approved main line for the SHA. Existing owner screenshots already establish
  main/build/deploy settings and disabled preview builds; require drift evidence
  before reopening those questions. Review-thread enforcement remains unconfirmed.
- Confirm heartbeat inbox and independent failure-notification receipt. September
  21–26 metadata showed one delivered heartbeat daily; September 26 at 05:01:18 CDT.
  This is receiving-server acceptance, not inbox placement or September 30 evidence.
  The 05:10 Chicago monitor was observed enabled, not newly created by these docs.
- Perform a compatible isolated recovery exercise; do not cause a live outage,
  drop a heartbeat or roll back production merely to complete an audit checklist.
- Use the device protocol in operations. Keep verified Facebook profile/private
  feedback labels until the actual public review destination is established.
  Invent no reviews, pricing/surcharge/referral policy; do not change requested-date
  business rules without the owner. Record and resolve real usability defects.
- Field Core Web Vitals remain unavailable; Lighthouse is lab evidence. Do not
  add tracking simply to manufacture a field-data claim.

Header scores are dated observations: September 25 Observatory A+/140, SSL.org
9/15 headers and later A+/140 repeat. Never add blanket COEP, deprecated XSS filters,
Clear-Site-Data, HSTS preload or unmonitored reports solely for a score. Preserve
existing protection and prove real-widget compatibility before changing CSP.

## Shared checkpoint

Use [one shared file](https://github.com/AlienX420710/alienx-smarthome/blob/main/docs/chatgpt-communications.md).
Cleaning reviewed AX-20260929-shared-brain-01, AX-20260929-closeout-boundaries-01
and AX-20260929-lighthouse-stderr-01 at AlienX 152abcf087f13628bb31c224edd1c73db49cdacc.
PR #26 records adoption of checkpoints, email boundaries already covered and a
local stderr/missing-report reproduction still needed before any patch.
CBC-20260929-handoff-01 was unsent due to AlienX write 403. AlienX has now read
the source review; no fabricated peer-authored message is introduced. Access
differs by connection. Docs consolidation does not complete that investigation.

## Historical evidence and consolidation map

The pre-cleanup snapshot is pinned to `ea93df984744d930e831796cc3f1856dbcdb5a7f`. These are historical documents,
not current instructions. Git history is unchanged; every removed file is
recoverable. Read the relevant evidence instead of restoring whole audits to
startup context. The current register retains unresolved findings and failures.

| Previous document            | Preserved snapshot                                                                                                                    | Current owner                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `README.md`                  | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/README.md)                  | [Repository index](../README.md)                                                                            |
| `alienx-commit-inventory.md` | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/alienx-commit-inventory.md) | This register; detailed history remains in the snapshot                                                     |
| `asset-provenance.md`        | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/asset-provenance.md)        | [Contract](quote-security-contract.md)                                                                      |
| `audit-follow-up.md`         | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/audit-follow-up.md)         | This register; detailed history remains in the snapshot                                                     |
| `device-validation.md`       | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/device-validation.md)       | [Operations](release-runbook.md)                                                                            |
| `directory-parity-review.md` | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/directory-parity-review.md) | This register; detailed history remains in the snapshot                                                     |
| `email-health.md`            | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/email-health.md)            | [Operations](release-runbook.md)                                                                            |
| `project-state.md`           | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/project-state.md)           | [project-state.md](project-state.md)                                                                        |
| `quote-security-contract.md` | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/quote-security-contract.md) | [quote-security-contract.md](quote-security-contract.md)                                                    |
| `release-runbook.md`         | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/release-runbook.md)         | [release-runbook.md](release-runbook.md)                                                                    |
| `security-parity.md`         | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/security-parity.md)         | This register; detailed history remains in the snapshot                                                     |
| `shared-brain.md`            | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/shared-brain.md)            | [Shared handoff](https://github.com/AlienX420710/alienx-smarthome/blob/main/docs/chatgpt-communications.md) |

Generated commit inventories are optional research output, not current status or
manual certification. Comparison scripts remain available; use a fresh mirror
and their documented arguments, inspect applicable current changes, and record
only adoption decisions here. Generated ledgers are now gitignored.
