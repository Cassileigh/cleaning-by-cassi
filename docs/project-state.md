# Cleaning by Cassi — current state

Updated October 21, 2026; September 30 consolidation retained. This is the sole current findings register.
Read AGENTS.md, QUALITY.md, [contract](quote-security-contract.md) and
[operations](release-runbook.md); historical prose is not current release approval.

## October 21 add-on starting-price candidate

The owner requested starting prices on Pricing, explanation-focused Services,
existing add-on selection on Quote, and a simple homepage link to the pricing
section. The candidate uses the lower end of the owner's supplied ranges and
labels rates per window, room, door, kitchen, shower/tub, can, bed, load or affected
room as applicable. Final prices depend on size, condition and specific needs and
are confirmed before the appointment. Wall Spot Cleaning remains removed.
All twelve rates and units were supplied by the owner; no business rates are invented.
This is a local candidate under [issue #93](https://github.com/Cassileigh/cleaning-by-cassi/issues/93),
not a new verified release. Existing release evidence and beta limits below remain
separate from this pricing change.

## October 21 production monitoring recovery

Current main `cc1c0f575dbb070869adeb7a4c96589f6865b842` passed all five
release gates, fresh CodeQL and the zero-open-alert policy. Its actual approved-main
tag matches that revision. The initial [push Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/39626971698)
timed out at 15:50:14 UTC waiting for deployment; Workers Build completed later,
at 15:53:07 UTC. Read-only release checks then confirmed the exact main was live.
One unchanged-revision failed-job rerun passed at 16:41:16 UTC; the failed first
attempt remains recorded. Its automatic [post-Smoke Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/39637001903)
passed at 16:41:56 UTC, verifying the exact revision on both production hosts,
rejecting TLS 1.0/1.1 and accepting TLS 1.2/1.3. CBC/static-RSA observations remain
separate from protocol acceptance. The older scheduled Smoke body-consumption
failure in #88 was corrected by #89; the current successful Smoke uses that fix.
These results establish the production baseline before the pricing candidate.

## Current verified release and beta disposition — October 19

[PR #85](https://github.com/Cassileigh/cleaning-by-cassi/pull/85) corrected
the visual-theme test race found in AlienX #143. A late, hidden Turnstile
response input no longer changes a snapshot of visible colors; the new
regression still detects an actual visible color change. The shared test is
byte-identical to AlienX [#151](https://github.com/AlienX420710/alienx-smarthome/pull/151),
which independently deployed at
`028e2b85ad07bec4c1319337f0a2fcc963481b51`.
AlienX [#150](https://github.com/AlienX420710/alienx-smarthome/pull/150)
previously corrected the two heading-contrast test files found in the final
source audit. Reciprocal `verify:peer` checks now classify 176 AlienX and 181
Cleaning implementation files with zero pending extraction; shared engineering
implementations match while site contracts remain separate.

Cleaning #85 merged as `39e185a8996857e37a43c9731e4b6403eec821ae`.
All five required checks, fresh Actions and JavaScript CodeQL analyses, the
zero-open-alert policy, the exact `cleaning-ci-approved-main` tag and Workers
Build check `118266811835` passed for that revision.
[Push Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/39311739541)
and [post-Smoke Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/39312939098)
verified the exact revision on both production hosts. The live protocol check
rejected TLS 1.0/1.1 and accepted TLS 1.2/1.3. Engineering parity is complete
in [#39](https://github.com/Cassileigh/cleaning-by-cassi/issues/39) and
[AlienX #122](https://github.com/AlienX420710/alienx-smarthome/issues/122).
These automated results do not establish private account, physical-device,
mailbox or owner business acceptance.

### Earlier shared application release

[PR #84](https://github.com/Cassileigh/cleaning-by-cassi/pull/84) merged as
`ebe2f6f93f581585bca6ca7b5a5cfebf542fa075`. Its shared application engines,
site adapters and maintained engineering inventory are source on main, no longer
candidates. The 181-file inventory classifies every tracked or candidate
implementation file with zero pending entries. The shared request/form,
confirmation, preferences, status, command-palette, navigation, metadata and
accessibility mechanics are implemented; business identity, route/form contracts,
recipients and presentation remain site-specific. The subsequent peer audit
found the contrast-test drift and hidden-input test race resolved above.

All five required checks, fresh Actions and JavaScript CodeQL analyses, and the
zero-open-alert approval policy passed for the exact merged main revision.
Workers Build `117581399918` succeeded. [Push Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/39095198909)
and [post-Smoke Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/39095662138)
succeeded for both production hosts; Integrity also passed live TLS protocol
acceptance. This was the verified Cleaning release before #85. These checks
established source, deployment and automated production acceptance at that
revision, not private account, inbox, original-device or owner business acceptance.

### Beta disposition

[Issues #32](https://github.com/Cassileigh/cleaning-by-cassi/issues/32) and
[#33](https://github.com/Cassileigh/cleaning-by-cassi/issues/33) closed
`not_planned` for the beta engineering scope, not as completed private/operator
or device/business verification. The owner's October 14 report of iOS/Windows
Safari/Chrome accessibility passes, intended daily mail arrival and
GitHub/Cloudflare MFA remains attributed owner evidence. Exact tested device,
browser and release versions; independent failure-alert receipt; private token,
WAF and recovery inspection; isolated no-mail recovery; public Facebook review
destination; and business-copy acceptance were not established by these releases.
The credential-shaped Resend key display name is an account-inventory concern,
not evidence of exposure or compromise; identify usage and scope privately
before any credential change. See the owner/operator handoff below.

[Issue #34](https://github.com/Cassileigh/cleaning-by-cassi/issues/34) closed as a
completed **decision**, not an implemented stricter CSP or reporting service.
The existing enforced policy remains. The contract records a reasoned deferral
of nonce/hash policy replacement until parser roots, Turnstile and cache behavior
are proven, and of report collection until an operator, bounded ingestion,
redaction, retention and alert ownership exist. No exploit or credential leak is
inferred from these optional hardening decisions.

## Historical release and candidate evidence

The dated sections below preserve earlier candidate claims and failures as they
stood at the time. Their pending-release and open-issue wording is superseded by
the current release and beta disposition above; it is not a current checklist.

### October 15 review-thread policy documentation release

[PR #79](https://github.com/Cassileigh/cleaning-by-cassi/pull/79) corrected the
stale review-thread policy record and merged as
`99da3460dd4572004ef910a40e6c543300eb7dfa`. All five required checks passed
on its current PR head. The resulting main revision passed all five gates, fresh
Actions and JavaScript CodeQL analyses, and the zero-open-alert policy. The
`cleaning-ci-approved-main` tag points to that exact revision. Workers Build
`4ba64f8f-9925-4bb3-82fd-25cb32a0b713` succeeded. [Push Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/38661387664)
and [post-Smoke Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/38662163108)
succeeded; Integrity verified the exact revision on both production hosts and
rejected TLS 1.0/1.1 while accepting TLS 1.2/1.3. CBC/static-RSA negotiation
remains observed. This was the verified release at the time, superseding #65 below.

The review-thread requirement was verified; issue #32 then remained open for private
account, receipt and isolated recovery acceptance. Physical-device and business
acceptance (#33), CSP/reporting decisions (#34), and broader parity (#39) were
still open. The automated release checks did not establish those separate outcomes.

### October 16–17 shared application completion candidate — superseded by #84

The October 17 head `eabfef1b2b3bf7685374884ef83e1ad756611547` passed
build/security, responsive, Safari/WebKit and performance checks, but its
[accessibility run](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/39080251950)
failed one light-theme Services heading measurement. The retained trace shows a
canvas-colored strip at the bottom of the masked heading capture: the reported
1.031566 contrast is white against the page canvas, rather than the banner's
painted gradient. Supplementary installed-Chrome captures measured 5.528352
across three viewport heights; these are diagnostic evidence, not pinned CI.
The shared contrast helper now centers each heading in the usable viewport
below a sticky/fixed banner before reading text rectangles and taking the masked
capture. A fractional viewport-edge regression covers that geometry. Thresholds
and every sampled text-rectangle pixel remain enforced; the failed run was not
retried. The existing negative-gradient fixture now places its pale endpoint
under the text in both engines: the original WebKit text run ended before the
old pale endpoint, and both the original and corrected helper correctly measured
that old fixture above the failure threshold. The fixture still requires both
poor-contrast examples to fail. The three contrast regressions passed in pinned
WebKit and supplementary installed Chrome. The combined pinned-WebKit run passed
12 of 13 cases, including both existing Services accessibility cases; the dark
768px add-on test reached its unchanged 30-second whole-test limit at the fourth
card-count assertion. Its failure evidence is retained without rerunning it or
increasing limits. An earlier restricted run could not reach the local preview;
that transport failure is not a passed browser check. Fresh candidate preparation
and CI were required at that point; the later #84 release evidence is above.

The owner requested completion of remaining engineering work. At that point, candidates
extract shared request-boundary, schema, provider-acceptance, form-client,
confirmation, preferences, status, command-palette, document metadata, navigation
and accessibility mechanics. Fields, templates, route contracts, brand presentation
and optional controls remain explicit site adapters. Full source inventory and
each site's independent preparation, browser gates and production chain were
required; local work alone was not a deployed release.

Initial PR security scanning found that the inventory's HTML-script regular
expressions missed noncanonical closing tags. The validator now uses the existing
pinned HTML parser; whitespace, malformed endings, quoted attributes and nested
templates have regressions. The original CodeQL failures are retained in PR #84
and paired AlienX #148; fresh preparation and new-head scans were required for
that candidate. The merged #84 release evidence is above.

The owner explicitly authorized this public summary on October 14:
accessibility checks passed on iOS/Windows using Safari/Chrome, intended daily
emails arrive, and GitHub/Cloudflare MFA is enabled. These are owner-reported
observations, separate from assistant-run browser tests or private account inspection.
Exact device/browser versions and tested release revisions were not provided.
Token scope, WAF/recovery configuration, isolated negative-promotion execution and
independent failure-alert receipt remain separate unresolved acceptance.

Services uses the site catalog consistently across display, quote options and API
allowlists. Wall Spot Cleaning and Every 3 Weeks are removed; remaining recurring
choices are weekly, every two weeks and monthly. Per the October 17 owner update,
twelve individual native disclosures each contain their corresponding add-on
card and brief explanation. Wall Spot Cleaning remains removed. Stars rotate
counterclockwise on expansion and clockwise on closing, respecting reduced motion.
The summary places the emoji after the star and before the title; expanded cards
show only their description instead of repeating that title.
Laundry includes washing, drying and
folding only; bed-sheet preparation requirements are retained. Homepage contact
copy now reads naturally without changing the service area.

Actual WebKit keyboard validation exposed a skipped skip-navigation anchor.
The shared page layout now gives it explicit tabindex zero, matching AlienX's
existing native tab-order policy; the original failure is retained for recheck.
The October 16 corrected build and all 42 scoped WebKit cases subsequently passed.
For the October 17 individual-disclosure update, the build and all eight new
Services WebKit cases passed, including reversible rotation, reduced motion,
keyboard operation, both themes and expanded/collapsed axe checks. The existing
dark Services accessibility case passed; the light case reached its unchanged
30-second limit during heading-contrast screenshot cleanup. That local failure
and trace are retained without a retry or timeout increase. Fresh CI must establish
acceptance for the updated head; the local timeout is not a passed check.

After the owner's emoji/title refinement, a fresh build and all ten scoped
WebKit checks passed, including both existing Services accessibility cases.
The emoji now belongs to the summary and duplicate expanded headings are removed.
The earlier timeout evidence remains retained; no timeout limit was increased.

## October 13 dependency and repeated-build release

[PR #65](https://github.com/Cassileigh/cleaning-by-cassi/pull/65) merged as
`9a54e4306f6ea8fac6a8d0a972c97688258ba13b` after all five required checks passed on
the up-to-date head `57d88748f71d38c9739c50950629a7bd1b3cc8b3`. It incorporates
#66 and is paired with AlienX #137. Both repositories pin Astro 7.3.6, Cloudflare adapter
14.3.4, Playwright 1.64.0, axe-core 4.14.0, Prettier Astro plugin 1.1.1 and
Wrangler 4.149.0 with matching normalized lockfiles and shared engineering checks.
Final native Node 22 preparation passed 171 tests, both security scans, formatting,
build, target/type checks, Worker dry run and the zero-vulnerability dependency audit.
Every uploaded file hash and the fetched published-tree fingerprint matched the
prepared source. All five main gates, fresh CodeQL analyses and zero-open-alert
policy passed. The `cleaning-ci-approved-main` tag matches this merged revision;
Workers Build 115261030420 succeeded. [Push Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/38386088663)
and [post-Smoke Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/38386991238)
passed, including both deployed hostnames and live TLS protocol checks. PR #66
is closed as superseded by this verified release.
Personalized website confirmation work is preserved for continuation after closeout.

Native Windows preparation exposed seven failures in the existing security-test
harness: URL.pathname became an invalid `C:\C:\...` module path. The harness now
uses fileURLToPath for its subprocess script paths, retaining all assertions.
This is a local test portability correction, not weakened production protection.

The first local preparation passed 170 tests and all checks. Subsequent shared
image preparation disables the operation cache to release decoded generated
images before replacing them on Windows; AlienX reproduced the prior repeat-build
lock. Both repositories add a two-build regression and passed fresh preparation
after this correction. AlienX's isolated navigation run passed 29 cases with one
Contact keyboard timeout; the original 12 failures remain preserved. This does not
count as local browser acceptance. Both published PR heads passed the unchanged
native Safari/WebKit and other browser gates on their configured CI runners.

The preceding documentation release #76 is verified at
`b852c79ce0078f4b70c9be1ffb71da0db5d9dac4`: five main gates, CodeQL/zero alerts,
approved tag, Workers Build 114809574004, push Smoke 38248066994 and post-Smoke
Integrity 38248840201 with TLS passed. AlienX #138 is verified after an unchanged-
revision retry of a deployment-API 504; its original failure is retained.
Broader parity and separate device/inbox/account/recovery acceptance remain open.

## October 12 canvas and preparation release

[PR #75](https://github.com/Cassileigh/cleaning-by-cassi/pull/75) merged as
`be1fd8d5478608489f6c57b9e9cb155cc71862c4`. All five required checks and CodeQL
passed on its up-to-date head `26bf65d63c2f601d564c8aab5bbecaaf0af211ce`, including
native Safari and the unchanged WebKit canvas suite. The shared body-positioned
style boundary and portable preparation implementation are adopted.

Final Node 22 preparation passed on Linux: both security scans, all 170 regression
tests, build, target/type checks, Worker dry run and zero dependency vulnerabilities.
The published tree matched its preparation fingerprint and shared-source comparison
passed. Executable-bit/symlink checks and all eight offline deployment approval/
rejection scenarios remain enforced. The earlier preparation receipt was replaced
after the final portability edits; it was not reused to validate new bytes.

All five main gates, both fresh CodeQL analyses and the zero-open-alert check
passed. [Release approval](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/38246214670)
published the exact merged SHA to `cleaning-ci-approved-main`; Workers Build
114801030118 succeeded. [Push Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/38245442858)
and [post-Smoke Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/38246374670)
passed at that revision. This is the verified implementation release, superseding
PR #74 below.

Paired [AlienX #135](https://github.com/AlienX420710/alienx-smarthome/pull/135)
merged as `4c5468f3b2d5b9947dd2259206552ad878777972` after its own five PR gates.
Its final native Windows preparation passed 177 tests and the published tree
fingerprint. The Contact WebKit blocker is resolved in automated CI; earlier
failures below remain historical evidence. Broader parity (#39 / AlienX #122),
physical-device, inbox, account and recovery acceptance remain open. No live form
submission or mail was sent during this work.

## October 10 PR #74 release verification

PR #74 merged as `c19459468e5e13b03fda56b68a40bf4c33c2409c`.
Fresh GitHub inspection confirms all five main gates, both CodeQL analyses,
zero-open-alert policy and release approval passed. The approved-main ref matches
this SHA and Workers Build 114290853647 succeeded.
[Push Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/38078152292)
and [post-Smoke Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/38078676194)
passed, including the TLS protocol step. Later scheduled Smoke 38095729835 and
Integrity 38089703974 also passed at this revision. This supersedes PR #73 as the
verified implementation release; account, inbox, device and recovery acceptance
remain open.

AlienX #135 at `f3b1c12e92f8f8d17ecfab3e764e734c7153db3e` still fails three
Contact canvas comparisons in WebKit job 114287913749; 108 cases and native
Safari passed. Removing the unused animation did not resolve the mismatch.
Its retained JSON confirms the mismatch persists after capture. The PR remains
blocked; no claim of a confirmed root cause or completed shared parity is made.
AlienX production remains on approved `5054f18e0837ec1228c928b7e273dd79847b0575`,
with passing Smoke 38095594737 and Integrity 38089697226. No live mail was sent.

The paired candidate introduces shared `canvas-ready.js` before form markup in
both headers, with peer verification covering the same source. Pinned WebKit 2359
locally reproduces AlienX's Contact mismatch; synchronizing root/body styles after
the head's CSS links corrects it. Synchronization in the early head preference
script did not correct Contact. Existing canvas assertions remain unchanged;
macOS CI and independent release verification are still required.
October 11 local validation: both production builds passed; all six unchanged
Quote canvas cases and AlienX's eight Contact canvas cases passed on Windows
WebKit 2359. Source parity passes. Windows `prepare:pr` cannot launch npm
(`spawnSync npm ENOENT`); full preparation uses an isolated Linux checkout with
Node 22 instead. Local results do not waive exact-head CI, native Safari or
independent production verification. Production evidence above belongs only to
merged PR #74.

Cleaning's full Linux preparation passed, including 170 regression tests and
zero dependency vulnerabilities. AlienX's Linux preparation passed its tests but
failed prerendering because this host's WSL 1 cannot allocate the Worker runtime's
required address space. Both preparation scripts now invoke the actual Node/npm
CLI and use Git index executable bits on Windows; mode and symlink regressions
remain enforced. This portability change requires fresh native preparation for
the final candidate; the earlier receipt does not validate the new bytes.

October 11 GitHub refresh found unchanged main and PR heads. Scheduled Smoke
38141656598 and Integrity 38143547948 passed at Cleaning's approved main;
AlienX Smoke 38141271932 and Integrity 38143502201 also passed at its approved main.

## October 10 fresh GitHub continuation

Cleaning PR #73 is production verified at
`8ea160addc9a3bddf8dfa89f554215a42be44a39`: all five main gates, fresh
CodeQL and zero-open-alert policy passed, release approval succeeded and
Workers Build 114222899863 passed. [Push Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/38055038791)
verified the exact revision at 13:22:38 UTC; [Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/38055479956)
verified both hosts at 13:23:12 UTC. This supersedes the missing-scan/deployment
blocker below; the original failed runs remain historical evidence. Scheduled
Smoke 38063627078 also passed. Heartbeat inbox receipt and account/device/recovery
acceptance are separate and remain open.

AlienX #135 f15a219 passed four required gates; WebKit job 114221801365
failed three Contact canvas comparisons (108 passed), while native Safari passed.
The retained screenshot is styled, but the original computed body style reports
transparent background and no inherited palette. The buffer-only JSON attachment
was not present in the uploaded test-results directory with the line reporter.
Both repos now write the diagnostic JSON to disk before attaching it, retaining
the original assertions and measurements. AlienX removes the unused registered
root-gradient property/transition and palette leftovers after the opaque-canvas
migration; no painted surface references them. Whether this removes the WebKit
mismatch still requires fresh CI; it is not a confirmed browser root cause.
Paired work continues in AlienX #135 / Cleaning #74. No live mail was sent.

## Historical October 9 repeated-failure audit — remediation candidate

October 10 follow-up: both full local Node 22 preparations passed and the
published trees matched their validated fingerprints (AlienX #135 f182d1ea,
Cleaning #73 a14cfe28). AlienX passed four required PR gates, but WebKit job
114219507443 still failed four Contact canvas comparisons (107 passed).
Document/load readiness was insufficient; the root retained its theme while
the body reported transparent background, normal scheme and no inherited canvas
variable. Do not merge or claim that cause fixed. Shared capture tests now retain
the failing screenshot and post-capture style diagnostics before asserting the
original measurements; neither recapture nor changed observations erase failure.
Cleaning's remaining browser gates and both main release chains remain pending.

Reachable branches, tags and all PR heads contain 866 AlienX and 401 Cleaning
commits. The API lists 104 AlienX and 46 Cleaning PRs, including closed/unmerged
work. Paginated failed-run inventory returned 461 AlienX and 167 Cleaning runs;
606 failed-job logs were retrieved across those runs. These are retained failed
runs, not a count of defects or every historical push: deleted/unreachable work,
provider-internal logs and earlier failed attempts in currently successful runs
are outside that inventory. Intentional canaries are not product regressions.

AlienX had 80 failed Source formatting steps, including deliberate diagnostic
failures; 65 logs contained Prettier style-failure evidence. Cleaning had 11 failed
Source formatting steps plus its October 6 combined preflight formatting failure.
History repeatedly shows formatter-preview commits, guessed whitespace repairs,
and follow-up removal of diagnostics. That is a final-byte execution failure;
adding more prose instructions alone does not enforce validation. Existing pinned
format/preflight contracts remain; the new preparation command records the checked
source fingerprint, invalidates it on later edits, and compares a fetched published
commit to those bytes. It is local evidence, not a substitute for trusted CI.

Other repeated categories include install/dependency failures, actual browser and
contrast defects, trace-capture failures, deployment-target/provisioning incidents,
missing fresh security scans, and live revision waits. Earlier repairs and their
failed evidence remain below; do not reapply old work or classify every red check
as an application compile failure. Full non-content parity remains open in
AlienX #122 / Cleaning #39; the shared allowlist is not a full-file inventory.

Cleaning main e54c1e5b4a761cf4f5d706de820faba9177f64fa passed its five application
gates but security job 113325172611 timed out waiting for Actions CodeQL.
Run 37781416664 is failed while Actions job 113325175290 is listed queued with no
steps. A targeted failed-job rerun returned HTTP 403, "This workflow run cannot
be retried". Its Workers Build failed; provider-internal logs are unavailable
through this connector, so its exact internal failure is not inferred. Repeated
Smoke/Integrity checks have not observed that revision. A new legitimate candidate
must independently produce both fresh scans, security approval, provider deployment,
and exact-revision Smoke/Integrity. No wait, alert policy or deployment guard is
weakened. The owner can inspect the failed CodeQL run and Cloudflare build if the
same missing scan persists after a new push.

AlienX #135 head 884d28dd failed five WebKit Contact root/body comparisons;
its body reported transparent and no inherited palette while the root was styled.
The candidate moves the Contact script inside its HTML body and makes shared
capture readiness wait for load, fonts and two rendered frames before measuring.
This is a candidate addressing document/readiness defects, not proof of a WebKit
root cause; all existing color/opacity assertions remain unchanged. Local WebKit
could download but could not launch due to missing host libraries; dependency
installation failed on restricted setgroups. Native macOS CI remains required.
PR #136's axe-core 4.14 checks found label-content-name-mismatch in the command
button and footer wordmark. Their accessible labels now retain their visible text;
the dependency update still needs fresh independent checks after the repair.

No real form/mail test, private provider inspection or production drill was run.
Docs: updated state and operations; release/device/account/owner acceptance stays
open until its own evidence exists. These changes are not yet production accepted.

## Historical requested website terms — candidate

October 8 owner update: README live-site/quote, main-workflow and stack badges
are restored with dynamic status/version sources. Daily health mail must go only
to jordanakstulewicz@cleaningbycassi.com, never Cassi; it now has an independent
healthRecipient and fixed transport. Quote/customer notification recipients,
05:00 Chicago schedule, retries and date-based deduplication are unchanged.
Monitor expectations and mocked destination/override regressions are updated.
Deployment and Jordan's receipt of the next natural heartbeat remain pending;
no manual mail, private mailbox or provider-history inspection was performed.

October 8 Cassi continuation: follow-up pairs explicit background-color/image
assignment after AlienX #135 WebKit reported transparent inherited Contact bodies.
Shared Turnstile lifecycle now responds to container size/presentation changes;
both adapters choose compact only when less than 300px is available. AlienX also
follows its saved theme. Existing challenges, tokens and stale-callback protection
remain intact. New browser checks cover resizing and saved-theme changes.
This candidate still requires independent CI and release verification on each site.
AlienX e88b281 still exposed two stale system-dark Contact palette comparisons in
WebKit. The paired canvas now resolves constant light/dark palette values through
each element's effective color-scheme, retaining the older-browser fallback.
Cleaning's first follow-up Safari run passed; this shared correction needs fresh CI.

October 8 release verification: #52 merged as
`1d17b1ad35c7e9f4109ddc9a93039513d76accec`. All five main gates,
fresh CodeQL and zero-open-alert policy passed. Workers Build 113083053895
succeeded. Push Smoke job 113080848400 verified the exact revision and both
hosts at 00:15 UTC; subsequent Integrity job 113083134234 verified both hosts
and TLS protocol acceptance at 00:16 UTC. This supersedes the candidate
production caveats below for Cleaning's terms, canvas and smoke-freshness repair;
original failed runs remain historical evidence. Physical-device, account,
business and full-parity acceptance remain open, and AlienX #135 is independent.

The October 8 paired follow-up remains a candidate: body inherits the opaque
root background after AlienX WebKit observed a root/body mismatch. Smoke groups
include event type so scheduled monitoring cannot cancel push release evidence;
Cleaning scheduled run 37693642363 cancelled push 37693468744 on the earlier
#51 revision. Exact-SHA and successful trusted-push Integrity requirements remain
unchanged, with shared regression coverage. No real quote/mail/account operation.

The owner requested the missing policy using AlienX's recent policies as a reference.
Cleaning already had /privacy; /terms now provides website terms through PageLayout.
Both policies are linked from the footer and quote notice. The copy follows current
quote and starting-price behavior without adding fees, booking promises, entity
claims or consent fields. The new route is included in all shared route checks.
Initial PR #52 checks caught narrow-screen overflow from the terms contact address
and insufficient inline-link distinction on review and policy pages. Policy text
now wraps long addresses and prose links have persistent underlines; replacement
exact-head checks are required before release. No accessibility rule is waived.
This scoped request does not close #33's broader device/business acceptance;
independent production verification remains pending.

## Historical October 7 sitewide capture repair — candidate

The owner requests AlienX #134's capture fix across every URL on both sites.
A shared opaque html/body canvas replaces route-specific transparent root gradients;
site palettes, artwork and content remain separate. Full-page Chromium/WebKit
coverage now includes every configured HTML route, receipts, policies and error
pages in both themes and multiple widths. Captures are retained for seven days.
AlienX also replaces the homepage call-to-action's radial wash with an opaque
linear gradient and extends readable light header/footer accents across routes.
These are candidate changes; original-device iOS Full Page results and independent
production verification remain pending. Existing security/release gates and all
unresolved parity, device, account, recovery and business findings remain open.

## Historical October 7 smoke freshness repair — candidate

Cleaning's documentation release d9de7bedfaba3a920beba7af06885e7a201cfa53 passed
all five main gates and Workers Build 113019952521. Smoke 37686977369 passed
cache-busted Integrity on both hosts, then its bare final release URL returned
previous revision 8fc826f8cc60f879ddffeb5947d990786fc07355 at 21:13:03 UTC.
Cleaning #50 retains this failure. The exact cache/edge cause is not established.
Shared Smoke now requests fresh responses consistently; mocked regression proves
the final mismatch still fails. This candidate requires independent PR/main and
production verification. No gate, threshold, mail or account control is weakened.
Remaining parity and owner/device/account/recovery findings stay open.

## October 7 shared challenge widget — verified

The common Turnstile lifecycle now handles duplicate loads, page-swap cleanup,
stale callbacks and provider reset/remove errors. Site actions, response fields,
widget presentation and security feedback remain explicit adapter inputs. Shared
unit and browser regressions are included in the existing mandatory gates and
peer comparison. PR #48 merged as `8fc826f8cc60f879ddffeb5947d990786fc07355`.
All five main gates, fresh CodeQL and zero-open-alert policy passed; the approved
ref matched this SHA and Workers Build 112767960370 succeeded.
[Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37613175252)
and [Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37614096712)
verified this exact revision on both production hosts, including TLS protocol
acceptance. AlienX independently verified its paired #131 release after an initial
asset-availability failure; that failure and recovery remain in AlienX #132.
This supersedes the navigation release below as the verified implementation.
The owner-approved personalized website confirmations are still pending; pricing,
Cloudflare changes and new confirmation emails are outside that feature scope.
Broader form/UI
parity (#39 / AlienX #122) and all owner/device/account/recovery gaps remain open.
No live form submission, replacement heartbeat or private account operation was run.
This evidence-only documentation follow-up needs no recursive state update.

## October 6 shared navigation release — verified

Both sites now use the same navigation-rail and command-trigger implementation.
It reveals the active link after layout/font/page lifecycle changes without moving
document scroll or keyboard focus, disconnects stale observers during page swaps,
and binds global listeners once. Unit coverage includes stale callbacks, manual
scroll preservation and command-opener focus. PR #46 passed all five exact-head
gates and merged as `c1038f011d785f74b3cb6b927950416ff6952bc7`.
All five main gates, fresh CodeQL and zero-open-alert policy passed. The release
approval ref matched this SHA and Workers Build 112626419051 succeeded.
[Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37569480235)
and [Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37570078893)
verified this exact revision on both production hosts, including TLS protocol
acceptance. The expanded migrated-component peer comparison also passed locally.
This was the verified implementation release on October 6; broader UI/schema parity in
#39 / AlienX #122 and owner-dependent acceptance remain open. CBC/static-RSA
cipher observations are not closed by TLS protocol success. No real quote,
replacement heartbeat, private account inspection or recovery drill was performed.
This evidence-only documentation follow-up needs no recursive state update.

## October 6 shared application engine — verified

The paired application changes consolidate Worker/mail/heartbeat adapters, status
readiness and method handling, and common form stream/abuse/verification/retry
primitives. AlienX now rejects malformed limiter bindings as unready; both status
routes preserve restrictive API headers through middleware. Site forms, recipients,
confirmation permissions and retry identities remain separate explicit inputs.
PR #45 merged as `89809bd47c7cbb42ff16a208cf989b59f0db8082`.
All five exact-main gates, fresh CodeQL and zero-open-alert policy passed;
the approved-main ref matched this SHA and Workers Build 112620796841 succeeded.
[Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37567674476)
and [Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37568276883)
verified this revision on both hosts, including TLS protocol acceptance.
Parent #39 stays open for UI behavior, remaining route/schema extraction and
full parity inventory beyond the migrated-component allowlist. All existing
owner/device/account/recovery acceptance gaps remain open; no real mail test or
private account operation was performed.

## October 6 diagnostic parity follow-up — verified

The manual WebKit runner and workflow now share one implementation, retaining
traces, screenshots, preview logs and baseline failure semantics in both repos.
Regression coverage blocks external requests/local writes and verifies altered
modes cannot count as release acceptance. The peer verifier now covers this
previously omitted tool and workflow. PR #43 passed all five exact-head gates and
real macOS WebKit diagnostics, then merged as
`ee5edf747a63bc7bf8dfafc9bbf403aa738170e9`. All five main gates, fresh CodeQL and
zero-open-alert policy passed. Release approval published this exact SHA and
Workers Build 112468489765 succeeded. [Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37520859629)
and [Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37521751610)
verified this revision on both hosts, including TLS protocol acceptance. Full
application parity and owner-dependent checklist items stay open. No real mail or
account/recovery operation was performed. This evidence-only follow-up needs no
recursive state update.

## October 6 shared infrastructure and quote release — verified

PR #41 merged as `10797180847f5d2b61d3c46a85df6874a500f874`.
All five exact PR-head and main checks passed, including native Safari, WebKit,
rendered-text contrast, quote-error interactions and all three Lighthouse samples.
Main's fresh CodeQL analysis and zero-open-alert policy passed.
[Release Approval](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37474755195)
published the approved-main ref for this SHA. [Workers Build](https://github.com/Cassileigh/cleaning-by-cassi/runs/112307518333)
succeeded; [Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37473788598)
and [Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37474945954)
verified the exact revision on both production hosts. Integrity also passed the
live TLS protocol checks. This supersedes the failed prior promotion below.

The shared implementation now covers framework configuration, revision metadata,
security headers, release approval, security/code-scanning checks, integrity/SEO,
production Smoke/TLS, image processing, monitoring, browser tooling and normalized
dependency locks. Site inputs retain business identity, routes, form schemas,
recipients and rendering requirements. Expanded verify:peer passes for migrated
components. #39 / AlienX #122 remain open for remaining application-level
implementation differences, including form middleware/status handlers and manual
browser diagnostics. An allowlist comparison does not certify every source file.

CBC-13 / #35 is implemented and deployed: shared scheduled-mail cleanup cancels
failed response bodies best-effort without changing permanent/transient retry
outcomes, schedule, recipients or stable keys. Mocked tests cover canceled,
missing and rejecting bodies. CBC-06's #36 field-error follow-up is implemented
and deployed: safe field mappings, preserved descriptions/values/retry identity,
accessible errors, first-invalid-field focus and form-level fallback have handler
and browser regression coverage. Duplicate/file/control checks and Turnstile
remain intact. No real quote or replacement heartbeat was sent; successful source
and deployment tests do not establish provider delivery or inbox receipt.

The migration corrected false Safari/contrast assumptions, then found and fixed
real hero-text contrast by darkening the photo overlay. Rendered-text fixtures
cover child colors, gradients and production CSP without weaker thresholds.
The final candidate's Quality failure was unformatted Markdown table padding in
this document. Pinned Prettier repaired it; all five checks passed on the resulting
published commit before merge. This was missed final-file verification, not a
reason to relax formatting. October 6 dependency findings were patched with
smol-toml 1.9.0 and source-map-js 1.2.2 without audit exceptions.

#32 retains private account/mailbox, independent alert receipt and isolated
recovery evidence; #33 retains real-device and owner business acceptance; #34
retains real-widget CSP compatibility and reporting ownership. Live ruleset
review also found conversation resolution required in AlienX but not Cleaning;
#32 records the exact manual settings change because the connector cannot write
rulesets. No private account inspection or production recovery drill was run.
This evidence-only documentation closeout needs no recursive state update.

## Historical October 5 engineering alignment — partial release acceptance

The owner requires identical engineering except for site content/configuration.
The preflight repair merged as PR #38 / main
`b9a1f36639cbde4007bbc0b032b2ad61b77db042`. Its required checks, code-scanning
policy, Workers Build, [Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37360074481)
and [Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37360660074)
passed; Integrity observed that exact revision on both production hosts.

Later main `1cd22cd93532e1ee032cfe1f6abfe7f20663c3b6` is **not production accepted**:
Safari and CodeQL were cancelled, the fresh-analysis policy failed, Workers Build
failed, and [Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37384302374)
exhausted its expected-revision wait. A failed promotion does not establish an
outage of the prior live release. The later #41 release above passed its own complete
exact-head/main/deployment evidence chain. This failed promotion remains historical
evidence. Full engineering parity and #32–#34 were open at that release; current
dispositions are recorded above.

## Previous verified application release

October 2, 2026: PR #28 merged as `308138f43c22f49a0fbfeb1806a547181ad5e4d4`.
All five exact-main gates passed: [Quality](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37079024725),
[Responsive](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37079024761),
[Accessibility](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37079024831),
[Lighthouse](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37079024738),
and [Safari/WebKit](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37079024819).
[CodeQL](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37079024161)
and Quality's fresh-analysis/zero-open-alert policy passed. Workers Build
`b1c315d7-f9f2-4bbe-9d35-bece8d7d9936` succeeded, followed by
[Smoke](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37079024655)
and [Integrity](https://github.com/Cassileigh/cleaning-by-cassi/actions/runs/37079364227)
for this revision. CBC-11 and CBC-12 are closed by this release evidence.

The release adopts linked issue/PR coordination and templates, bounded Safari
readiness before unchanged layout assertions, retained Safari diagnostics,
Lighthouse stderr/no-report handling with one trace-only retry, and the scoped
devalue 5.9.4 repair. Required budgets and protections remain unchanged.
At that release, private account, mailbox, physical-device, usability and
optional-hardening work remained open in #32–#36. This evidence-only update needs no recursive closeout PR.

## Historical source and release evidence

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

PR #28 head e888750 failed Lighthouse 36746021701 (0.65; TBT 1939 ms).
The offscreen-rendering experiment at c41a7c0 passed the four other gates but
failed Lighthouse 36777620088 (0.60); it was removed. Diagnostic-only head
de0d7c6 scored 0.85, which is variability evidence, not a runtime fix. Its trace
showed 104 ms AVIF decode. Failing and passing reports used Chrome 154 and 153
respectively, with CPU benchmarks 696.5 versus 2877.5. These are observations,
not proof that the browser version alone caused the regression.

The next repair serves the existing WebP hero (same artwork/layout) to avoid
that AVIF decode and uses Playwright's exact locked Chromium for Lighthouse,
removing runner-installed browser drift. Full traces/numeric diagnostics are
retained. All budgets, cold-cache semantics, sample counts and retry rules stay
unchanged. Scroll/focus/print regression coverage passed in the prior CI run.
Local browser installation failed (invalid archive); fresh exact-head CI and
main/Workers/Smoke/Integrity must verify the repair before CBC-11 closes.

Before PR #28, the last recorded complete release evidence was PR #25 main
`dca370f9b02174c1b57de367ec92ff3f3c83c1f2`: Lighthouse 36646214983,
Smoke 36646214948 and Integrity 36646563085. This is historical and is superseded by the verified release above. Preserve failed override run 36490727584.

October 2 preparation in PR #28: de08849 passed Quality, accessibility,
responsive and Lighthouse but failed native Safari at /quote-success (768px,
sameRow); all 25 WebKit interactions passed. This failure is preserved in #31.
A fresh audit also identified high-severity devalue <=5.9.2 advisories; the scoped
lockfile repair selects 5.9.4 within the existing range. Independent Dependabot
PRs #29/#30 remain untouched. PR #28 verification is now recorded above; no peer evidence substitutes for it.

## Findings and acceptance

Fresh September 30 comparison: npm ci, all-severity npm audit (zero findings),
95 unit tests and repository/reachable-history scans passed locally. fast-uri
3.1.8 is remediated. The scoped Miniflare Undici override remains deliberate;
do not replace it with AlienX's global override just for parity.

| ID     | Disposition                                                   | Evidence or remaining acceptance                                                                                                                                                                                                                                           |
| ------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CBC-01 | Verified September 26                                         | Integrity uses trusted workflow revision, release SHA as data, no cache or retained credentials.                                                                                                                                                                           |
| CBC-02 | Main execution verified September 26                          | Fresh exact-main Actions/JS/TS analyses, no warnings/errors, zero open alerts; bounded complete pagination. API/stale/malformed evidence fails closed.                                                                                                                     |
| CBC-03 | Implemented                                                   | Secret-free Worker example/local hostname policy; no production defaults or new PUBLIC architecture.                                                                                                                                                                       |
| CBC-04 | Implemented; consolidated                                     | One register, contract, operations and pinned history; no duplicate status narratives.                                                                                                                                                                                     |
| CBC-05 | Beta scope closed `not_planned`; operator evidence incomplete | Required PR/five strict checks observed, historical delivered heartbeat and offline rejection/recovery passed. Owner reports intended mail arrival and GitHub/Cloudflare MFA. Private account, independent alert receipt and isolated recovery evidence remain unverified. |
| CBC-06 | Beta scope closed `not_planned`; owner acceptance incomplete  | Owner reports accessibility checks passed on iOS/Windows using Safari/Chrome. Exact devices, browser versions and tested revisions were not supplied. Facebook review destination and business-copy acceptance remain separate.                                            |
| CBC-07 | Verified at ee9f3e8                                           | Legacy cross-domain and display-capture denial on dynamic/static paths.                                                                                                                                                                                                    |
| CBC-08 | Decision complete; stricter policy deferred                   | Existing enforced policy retained. Trusted roots, parser scripts, nonce/cache design and real-widget acceptance are required before replacement; see October 14 contract decision. No exploit is claimed.                                                                  |
| CBC-09 | Decision complete; no collector provisioned                   | Operator/destination, bounded ingestion, redaction, retention and actionable synthetic evidence are prerequisites; see October 14 contract decision.                                                                                                                       |
| CBC-10 | Core verified; later candidate tranche released PR #23        | Shared candidate/live assertions, strict seven-capability parsing, API/error/static coverage; retain exact-revision evidence and no live quote tests.                                                                                                                      |
| CBC-11 | Verified at 308138f                                           | Prior Lighthouse/promotion/Safari failures retained below; exact-main five gates, Workers Build, Smoke and Integrity passed for PR #28. Resolve causes and verify a fresh exact-main release end to end.                                                                   |
| CBC-12 | Verified at 308138f                                           | Runner classifies stderr-only NO_NAVSTART before report parsing; subprocess regressions enforce one retry, retained diagnostics and rejection of stale/malformed/unrelated failures.                                                                                       |
| CBC-13 | Verified October 6                                            | Shared heartbeat cleanup and mocked failure-path tests deployed in PR #41 / 1079718, with exact-main checks, Workers Build, Smoke and Integrity passed. No live mail test was performed.                                                                                   |

PR #23 runtime/navigation changes passed at 5522d60440bfe66cb92adde8f2ce3a75c9eb77d4,
Smoke 36490018374 and Integrity 36490418251. Earlier layout/Lighthouse failures
remain in history. No audit-wide or account-security completion is claimed.

## Post-beta owner/operator handoff

The following are optional follow-ups or independent human/operator acceptance,
not pending beta engineering release gates. Issues #32 and #33 were closed
`not_planned`; closure does not certify their unperformed checks. Reopen a
scoped issue if a real defect is reproduced or an owner elects to fund the
specific follow-up. Issue #34 completed the hardening decision and did not
implement a stronger CSP or a report collector.

| Priority / finding                   | Next action and completion evidence                                                                                                                                                                                                                          | Responsible role       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| CBC-05 — optional operator review    | If the operator chooses, verify independent failure-notification receipt, private credential/MFA/WAF and recovery settings, and isolated no-mail rejection/recovery. Owner-reported mail arrival is not independent alert receipt. No real quote test sends. | Account operator/owner |
| CBC-06 — optional owner acceptance   | If desired, record physical iPad/VoiceOver/touch/keyboard/zoom results with device/browser/release identity, confirm the actual public review destination and accept business copy. File any reproduced defect separately.                                   | Cassi/human tester     |
| CBC-08 / CBC-09 — deferred hardening | Keep current enforced CSP. Revisit nonce/hash replacement only with real-widget/cache compatibility proof; provision no report collector without privacy, retention and alert ownership.                                                                     | Maintainer/operator    |

October 13 read-only verification of live ruleset 23093180 confirmed required
review-thread resolution, PRs and all five strict Actions checks. Deletion and
force-push were prohibited; this connection could not bypass the ruleset. This
confirmed the October 8 policy resolution recorded in issue #32. The remaining
account, receipt and isolated recovery work is the optional handoff above.
AlienX PR #55 merged; Cleaning adopted the matching protocol through merged PR #28. Each repository retains local authority.

## Historical comparison with AlienX

Peer baseline: AlienX main `adb8d5d9f5af7a0bfd074e44eaf119ecd5bcff1d` (October 2).
Its [local register](https://github.com/AlienX420710/alienx-smarthome/blob/main/docs/project-state.md)
owns its remaining work; these are Cleaning's dispositions.

| Concern      | Comparison and Cleaning disposition                                                                                                                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Release      | AlienX's exact-main approval/build/Smoke/Integrity passed. Cleaning retained its REST verifier and independently verified PR #28 production. Do not copy approval tags without a separately reviewed migration.                                      |
| Forms        | Both have bounded input, mandatory edge limits, strict Turnstile, safe email rendering and idempotency. Retain Cleaning's multipart fields, best-effort customer confirmation and generic status; AlienX's JSON schema is not a replacement.         |
| Lighthouse   | Adapt PR #53 stderr capture in PR #28 with real subprocess regressions and per-attempt output; retain single-sample budgets. PR #28 exact-head and exact-main CI passed; future revisions need their own checks.                                     |
| Mail         | Both use a fixed daily schedule/recipient and stable provider keys. AlienX PR #79 adopted direct transport; decline its obsolete redirect rejection. Failed-body cleanup is verified in the October 6 release; keep independent senders/permissions. |
| CSP          | Cleaning's external styles/host policy differs from Astro-generated AlienX hashes. Stronger policy needs real-widget validation, not a scanner-score transplant.                                                                                     |
| Dependencies | Runtime pins match; Wrangler/Prettier/parse5 and Undici override scope differ for local reasons. Fresh audits are clean; no blanket version synchronization.                                                                                         |
| Operations   | AlienX PR #87 records its own heartbeat/inquiry receipt; Cleaning still needs independent acceptance. Neither peer evidence nor source parity closes local controls.                                                                                 |

Review limits: direct read-only requests to both sites' release/status endpoints
returned HTTP 403 from this environment. No fresh served SHA is inferred; use the
attributed GitHub checks above. No current mailbox/provider, account-settings,
physical-device or complete penetration assessment was performed. No mail sent.

## Optional account and owner follow-up details

These items were not verified in the #84 engineering release and are not
represented as beta blockers or completed controls. Their original owner/operator
checklists were closed `not_planned` in #32 and #33. The following preserves safe
handoff boundaries if the owner chooses to revisit them.

- Privately inspect Dependabot/secret alert counts and disposition, account MFA
  and recovery for GitHub/Cloudflare/Resend. Never publish secret values.
- Privately review the credential-shaped Resend key display name. The name alone
  is not evidence that a key is exposed. Identify usage and scope first; if
  exposure is established, create a domain-restricted sending-only replacement,
  update Worker securely, verify delivery, then revoke old access. Never revoke an
  unidentified live key. Review obsolete onboarding keys/read-only build token.
- Verify WAF, accessible legacy protection and one successful Cloudflare build's
  CI approved main line for the SHA. Existing owner screenshots already establish
  main/build/deploy settings and disabled preview builds; require drift evidence
  before reopening those questions. Review-thread enforcement was verified October 13.
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

AX-20260929-lighthouse-stderr-01 is tracked as CBC-12 in [#31](https://github.com/Cassileigh/cleaning-by-cassi/issues/31).
PR #28 prepares stderr capture before report parsing, a single recognized trace
retry, and separate diagnostics. Native Safari waits for document/font/transition
readiness before unchanged layout assertions and stores geometry/screenshots outside
Playwright's cleaned output directory. The earlier sameRow failure remains evidence;
native Safari passed the unchanged assertions on both the PR head and merged main. This does not identify every possible source of the former timing failure.

The September 30 main homepage performance failure in
[PR #27](https://github.com/Cassileigh/cleaning-by-cassi/pull/27) (0.84 versus 0.85)
is separate; its failed evidence remains historical after PR #28 restored verified promotion.

## Issue disposition map

Issues own their historical task checklists and handoffs; this register owns
durable decisions and release evidence. No central transcript or duplicate status
document is introduced. Closed `not_planned` means the owner-dependent checks
were de-scoped from beta, not silently verified.

| Scope                                                       | Local issue                                                      | Disposition                                                |
| ----------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| CBC-11 / CBC-12: PR #28, Safari, Lighthouse and production  | [#31](https://github.com/Cassileigh/cleaning-by-cassi/issues/31) | Verified historical release                                |
| CBC-05: accounts, monitoring, recovery and review policy    | [#32](https://github.com/Cassileigh/cleaning-by-cassi/issues/32) | Closed `not_planned`; operator evidence remains unverified |
| CBC-06: physical-device and business acceptance             | [#33](https://github.com/Cassileigh/cleaning-by-cassi/issues/33) | Closed `not_planned`; owner acceptance remains unverified  |
| CBC-08 / CBC-09: CSP and reporting decision                 | [#34](https://github.com/Cassileigh/cleaning-by-cassi/issues/34) | Closed; decision completed, hardening deferred             |
| CBC-13: failed mail-response cleanup — verified             | [#35](https://github.com/Cassileigh/cleaning-by-cassi/issues/35) | Verified historical release                                |
| CBC-06 usability follow-up: field errors — verified         | [#36](https://github.com/Cassileigh/cleaning-by-cassi/issues/36) | Verified historical release                                |
| Shared application engines and source inventory             | [#84](https://github.com/Cassileigh/cleaning-by-cassi/pull/84)   | Merged and production verified at `ebe2f6f`                |
| Final cross-repository source parity and paired peer checks | [#39](https://github.com/Cassileigh/cleaning-by-cassi/issues/39) | Closed `completed`; paired #85 / AlienX #151 verified      |

Peer review: adapt AlienX #53/#83 diagnostics/readiness concepts; retain Cleaning's
release-gate architecture. Adopt #81 documentation-closeout practice without
recursive evidence-only PRs. Decline obsolete mail redirect rejection after #79.
AlienX's portfolio consolidation, command palette and error-page artwork are not
Cleaning requirements. No peer acceptance is transferred to this site.

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
