# Cleaning by Cassi — current state

Consolidated September 30, 2026. This is the sole current findings register.
Read AGENTS.md, QUALITY.md, [contract](quote-security-contract.md) and
[operations](release-runbook.md); historical prose is not current release approval.

## Source and release evidence

September 30 comparison baseline: main `6b154ec319d6728c0764df9f0301c0910fbc4eba`
(PR #27). Source is merged; this revision is not production-accepted. Four main
gates and current code-scanning inventory passed, but
[Lighthouse 36708472528](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/36708472528)
failed homepage performance 0.84 against 0.85. Its report recorded LCP 3050 ms
and TBT 375 ms; these locate symptoms, not a proven root cause. No low-score rerun.
Workers Build check 109865377183 failed; provider build logs were not available
in this comparison, so do not attribute its precise cause to token/rate limits.
[Smoke 36708472605](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/36708472605)
and later 36724726290 timed out waiting for the expected revision.
[Integrity 36727594169](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/36727594169)
failed with "Production revision did not stabilize" before full acceptance.
These failures do not by themselves prove the older live site is down.

PR #28 head e888750 failed homepage Lighthouse run 36746021701 (0.65;
TBT 1939 ms). Deferring offscreen sections at c41a7c0 passed all four other
checks, including new scroll/focus/print coverage, but Lighthouse 36777620088
still failed (0.60; 6196 ms main-thread work). No improvement was established;
the CSS experiment is removed. The report also warns of a slow host CPU
(benchmark 696.5). Trace assets and numeric diagnostics are now retained to
identify the blocking tasks before another runtime correction. Budgets, sample
count and retry rules stay unchanged; these failed scores remain evidence.
Local browser installation was unavailable (invalid downloaded archive).

Last previously recorded complete release evidence remains PR #25 main
`dca370f9b02174c1b57de367ec92ff3f3c83c1f2`: Lighthouse 36646214983,
Smoke 36646214948 and Integrity 36646563085. This is historical, not a claim
that this SHA is currently served. Preserve failed override run 36490727584.

## Findings and acceptance

Fresh September 30 comparison: npm ci, all-severity npm audit (zero findings),
95 unit tests and repository/reachable-history scans passed locally. fast-uri
3.1.8 is remediated. The scoped Miniflare Undici override remains deliberate;
do not replace it with AlienX's global override just for parity.

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
| CBC-11 | Open — current release blocked                         | Homepage Lighthouse below budget, failed Workers Build and expected-revision Smoke/Integrity. Resolve causes and verify a fresh exact-main release end to end.                                                    |
| CBC-12 | Reproduced offline — runner repair pending             | stderr-only NO_NAVSTART with no report invokes the CLI once, then ENOENT prevents the intended retry. Preserve diagnostics and retry only recognized trace failures.                                              |
| CBC-13 | Hardening follow-up, not confirmed exploit             | src/mail.ts follows default redirect behavior; email-health.ts does not cancel non-OK response bodies. Consider explicit redirect rejection and body cleanup with mocked tests.                                   |

PR #23 runtime/navigation changes passed at 5522d60440bfe66cb92adde8f2ce3a75c9eb77d4,
Smoke 36490018374 and Integrity 36490418251. Earlier layout/Lighthouse failures
remain in history. No audit-wide or account-security completion is claimed.

## Production-readiness priorities

| Priority / finding  | Next action and completion evidence                                                                                                                                                                                                                                                                                       | Responsible role                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| P1 — CBC-11         | Profile the failing homepage report/trace, fix a demonstrated bottleneck, pass unchanged budgets. Inspect actual Cloudflare build logs, resolve any additional blocker, then verify the intended main SHA on both hosts through Smoke and Integrity. A green docs PR does not repair or certify the failed main revision. | Engineering + Cloudflare operator    |
| P1 — CBC-12         | Add a real subprocess regression for stderr-only NO_NAVSTART/no report, unrelated errors and stale outputs. Repair classification before report parsing; retain attempt diagnostics and the single retry limit. It is separate from CBC-11's low score.                                                                   | Engineering                          |
| P1 — CBC-05         | Verify current natural heartbeat delivery and independent failure-notification receipt, private credential/MFA/WAF review, and compatible recovery/rejection evidence. Use an isolated no-mail Worker for drills first. No real quote test sends.                                                                         | Account operator/owner + engineering |
| P1 — CBC-06         | Run physical iPad/VoiceOver/touch/keyboard/zoom acceptance, resolve failures, verify public review destination and owner business content.                                                                                                                                                                                | Cassi/human tester + engineering     |
| P2 — CBC-06         | Map server validation errors to relevant fields where useful; current enhanced form presents a form-level error. Verify with mocked invalid submissions, not customer mail.                                                                                                                                               | Engineering                          |
| P2 — CBC-08, CBC-09 | Decide stricter CSP/reporting based on threat model and operational ownership. Keep current enforced CSP unless replacement is proven with Turnstile/cache tests; no collector without privacy/retention/alert ownership. These are hardening decisions, not automatic release blockers.                                  | Maintainer/operator                  |
| P2 — CBC-13         | Adopt redirect rejection/body cleanup only after transport/error-path tests; do not label default behavior a demonstrated credential leak.                                                                                                                                                                                | Engineering                          |

Live ruleset 23093180 still enforces PRs and five strict Actions checks; this
connection cannot bypass it. Review-thread resolution is false: explicitly
accept that policy or enable the desired setting through authorized administration.
Coordination PR #28 and AlienX PR #55 were still open at review; adopt each locally.

## Comparison with AlienX

Peer baseline: AlienX main `640062d13e9de63b1160137cc01bfd8f3b2d23bf`.
Its [local register](https://github.com/AlienX420710/alienx-smarthome/blob/main/docs/project-state.md)
owns its remaining work; these are Cleaning's dispositions.

| Concern      | Comparison and Cleaning disposition                                                                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Release      | AlienX's exact-main approval/build/Smoke/Integrity passed. Cleaning retains its REST verifier; diagnose provider logs before choosing a gate redesign. Do not copy approval tags without a separately reviewed migration.                    |
| Forms        | Both have bounded input, mandatory edge limits, strict Turnstile, safe email rendering and idempotency. Retain Cleaning's multipart fields, best-effort customer confirmation and generic status; AlienX's JSON schema is not a replacement. |
| Lighthouse   | AlienX PR #53 provides a tested stderr-capture example. Adopt the principle after CBC-12 regression coverage; do not import its three-sample policy to average away Cleaning's failed score.                                                 |
| Mail         | Both use a fixed daily schedule/recipient and stable provider keys. Consider AlienX's redirect rejection and failed-body cleanup under CBC-13; keep independent senders/permissions.                                                         |
| CSP          | Cleaning's external styles/host policy differs from Astro-generated AlienX hashes. Stronger policy needs real-widget validation, not a scanner-score transplant.                                                                             |
| Dependencies | Runtime pins match; Wrangler/Prettier/parse5 and Undici override scope differ for local reasons. Fresh audits are clean; no blanket version synchronization.                                                                                 |
| Operations   | Both need independent delivery, alerts, account review and human-device evidence. Source parity cannot close these.                                                                                                                          |

Review limits: direct read-only requests to both sites' release/status endpoints
returned HTTP 403 from this environment. No fresh served SHA is inferred; use the
attributed GitHub checks above. No current mailbox/provider, account-settings,
physical-device or complete penetration assessment was performed. No mail sent.

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

## Cross-project coordination

Both owners' chat sessions can work on either repo under the local
[coordination agreement](../AGENTS.md#cross-project-coordination). Cleaning owns
its decisions and evidence; AlienX does not serve as its communication authority.
Use linked local issues/PRs for task ownership, findings and dispositions.

Historical review in PR #26 at ea93df984744d930e831796cc3f1856dbcdb5a7f:
AX-20260929-shared-brain-01 checkpoints were adopted; its central-log design is
now superseded. AX-20260929-closeout-boundaries-01 was already covered by local
email rules. CBC-20260929-handoff-01 was unsent because AlienX writes returned
403; AX-20260930-cassi-review-received-01 records the source review's receipt,
not a peer-authored reply. The [final log snapshot](https://github.com/AlienX420710/alienx-smarthome/blob/640062d13e9de63b1160137cc01bfd8f3b2d23bf/docs/chatgpt-communications.md) preserves all entries.

AX-20260929-lighthouse-stderr-01 is now reproduced locally as CBC-12; repair
and independent verification remain pending before adopting AlienX PR #53's helper. Link that
source in the Cleaning investigation issue/PR, retain budgets and bounded retry,
and verify independently. The tooling defect is reproduced; no adopted runtime patch is claimed.
The September 30 main homepage performance failure in
[PR #27](https://github.com/Cassileigh/cleaning-by-cassi/pull/27) (0.84 versus 0.85)
is separate; its release remains unverified by this documentation change.

## Historical evidence and consolidation map

The pre-cleanup snapshot is pinned to `ea93df984744d930e831796cc3f1856dbcdb5a7f`. These are historical documents,
not current instructions. Git history is unchanged; every removed file is
recoverable. Read the relevant evidence instead of restoring whole audits to
startup context. The current register retains unresolved findings and failures.

| Previous document            | Preserved snapshot                                                                                                                    | Current owner                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `README.md`                  | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/README.md)                  | [Repository index](../README.md)                         |
| `alienx-commit-inventory.md` | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/alienx-commit-inventory.md) | This register; detailed history remains in the snapshot  |
| `asset-provenance.md`        | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/asset-provenance.md)        | [Contract](quote-security-contract.md)                   |
| `audit-follow-up.md`         | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/audit-follow-up.md)         | This register; detailed history remains in the snapshot  |
| `device-validation.md`       | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/device-validation.md)       | [Operations](release-runbook.md)                         |
| `directory-parity-review.md` | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/directory-parity-review.md) | This register; detailed history remains in the snapshot  |
| `email-health.md`            | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/email-health.md)            | [Operations](release-runbook.md)                         |
| `project-state.md`           | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/project-state.md)           | [project-state.md](project-state.md)                     |
| `quote-security-contract.md` | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/quote-security-contract.md) | [quote-security-contract.md](quote-security-contract.md) |
| `release-runbook.md`         | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/release-runbook.md)         | [release-runbook.md](release-runbook.md)                 |
| `security-parity.md`         | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/security-parity.md)         | This register; detailed history remains in the snapshot  |
| `shared-brain.md`            | [Read](https://github.com/Cassileigh/cleaning-by-cassi/blob/ea93df984744d930e831796cc3f1856dbcdb5a7f/docs/shared-brain.md)            | [Coordination](../AGENTS.md#cross-project-coordination)  |

Generated commit inventories are optional research output, not current status or
manual certification. Comparison scripts remain available; use a fresh mirror
and their documented arguments, inspect applicable current changes, and record
only adoption decisions here. Generated ledgers are now gitignored.
