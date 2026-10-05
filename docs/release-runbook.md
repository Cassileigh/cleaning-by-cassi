# Cleaning — operations

## Shared preflight

Use Node 22 and `npm ci`. After the final edit, run `npm run format` and
`npm run preflight`. Preflight runs formatting, repository and history security
scans, regression tests, production build, generated deployment-target validation,
type checks, Worker dry run and all-severity dependency audit. Quality CI invokes
those same `check` and `audit` commands. Browser and post-deployment gates remain
separate and mandatory. Formatting includes instructions and package.json.
Do not commit temporary diagnostic replacements for format:check.

## Protected release and build

Follow AGENTS.md and QUALITY.md. main is the only production branch. Use scoped
temporary PRs, preserve unrelated/dependency work, pass all five exact-head Actions
checks on an up-to-date branch, then merge with expected head SHA. No bypass,
direct main push, force reset, weakened gate or retry-until-green. Auto-merge only
under these protections; delete temporary heads after verified merge. Observed
ruleset 23093180 has no bypass; zero human approvals does not waive PRs/checks.

Cloudflare Workers: main, root /, npm run build, **npm run deploy**. Direct Wrangler
bypasses the gate. Owner screenshots/settings confirmed this and disabled preview
builds; actual CI approved main execution-log evidence is separate in current state.
The verifier checks clean checkout, build SHA, current GitHub main and five
successful main-push workflows, then rechecks main before deployment. Failed,
missing, skipped, stale, inaccessible evidence or 12-minute timeout fails closed.

## Build credential

GITHUB_READ_TOKEN is an optional build-only secret in Worker Settings > Build >
Build variables and secrets, never runtime/PUBLIC/committed env. Fine-grained repo
scope, Actions and Contents read-only, no writes, appropriate expiry. Enter through
secure provider UI, not chat. Cloudflare's Git connection does not authenticate
the verifier's REST calls. Anonymous calls share lower limits; authenticated errors
must not fall back silently. Reject redirects and suppress credentials/provider
bodies. Retain gates/freshness when retrying after credential repair. Old HTTP 403
alone does not establish cause. Documentation makes no administrative changes.

## Validation and production

Run `npm ci`, `npm run format`, and `npm run preflight` as described above. Keep exact
dependency/action pins, full-history checkout, minimal explicit read permissions
and persist-credentials: false. Never print secret detector matches.

Preview: wrangler dev --host 127.0.0.1 --upstream-protocol http with selected port.
Preserve headers instead of removing CSP to fix loopback upgrade failures.
Candidate integrity uses fixed http://127.0.0.1:4321 and exact build SHA; only
local HTTP-upgrade/readiness-503 exceptions. Production requires HTTPS/readiness 200. Both reject unexpected redirects. Preserve native Safari, real WebKit and
Chromium, themes, keyboard/quote retry coverage; providers are mocked, no mail.
Keep build.inlineStylesheets: never and external same-origin styles.

Lighthouse retains configured single-sample budgets/eight routes; only the noindex
receipt omits SEO. Inspect diagnostics; do not retry poor scores just to pass.
The runner captures each attempt's stdout/stderr before reading its report and
retries only NO_NAVSTART once; missing, malformed, unrelated and low-score results
fail. Safari waits for document/font/transition readiness, then applies unchanged
geometry assertions. Its separate safari-diagnostics directory survives WebKit's
output cleanup. Attach attempt evidence to the linked local issue/PR.
Main Quality requires exact-main fresh Actions/JS/TS CodeQL, no warnings/errors
and zero open alerts through bounded complete pagination. Missing/malformed/API/
stale evidence fails closed; no install, cache, persisted token or alert-write
permissions in inventory. Private Dependabot/secret inventories remain separate.

After merge inspect five main gates and Workers Build. /api/release must match
the exact SHA; verify Smoke then Integrity. Integrity uses trusted workflow SHA,
release SHA as data, no package cache, three stable confirmations, both domains/
eight routes, CSP/security/SEO/API/static checks and ending revision recheck.
Old healthy deployment, CodeQL completion or release endpoint alone is insufficient.
Investigate mixed revision/policy. Daily/manual checks remain available; Integrity
is post-deployment, never a circular pre-deployment requirement.

## Recovery and account evidence

tests/deployment-rehearsal.test.mjs invokes actual npm deploy with mocked evidence
and a non-deploying Wrangler sentinel. It is not live rejection/rollback. For an
account exercise identify known-good version/SHA, bindings, migrations, scheduled
handler and secret compatibility. Prefer isolated Worker/test bindings, crons off,
no live mail credentials. Exercise rejection/restore, check routes/status/revision
and actual independent notification receipt. Never intentionally break heartbeat.
Live rollback needs agreed maintenance window and version compatibility. Record
sanitized outcomes. Source cannot certify WAF, MFA, credential scope or account state.

## Email health

- Cloudflare invokes `src/worker.ts` at 10:00 and 11:00 UTC. The scheduled handler
  converts the event time to America/Chicago and only sends for 05:00, covering
  CST/CDT without a seasonal configuration change. Provider processing can delay
  arrival; 05:00 is the scheduled start, not an inbox-delivery deadline.
- Sender: `Cleaning by Cassi <quotes@cleaningbycassi.com>`; recipient:
  `cassandramorris@cleaningbycassi.com`, the existing business quote mailbox.
- Quote notifications, customer confirmations and the heartbeat share
  `src/mail.ts` and the production Worker's `RESEND_API_KEY`. No new secret is
  required. No customer record or quote is created.
- There is no public health-send endpoint, caller-selected recipient or special
  token bypass. HTTP requests still use the Astro handler and existing middleware.
- Event times more than 15 minutes old or over a minute in the future are ignored.
  A stable date-only payload and `daily-email-health/YYYY-MM-DD` key deduplicate
  retries within Resend's retention window, including across deployments.
- Each request times out after ten seconds. There are at most three attempts with
  short backoff for transient errors. Non-retryable provider responses fail.
  Success requires HTTP success plus a nonempty provider ID. Exceptions and raw
  provider responses are never logged; exhaustion fails the scheduled event.

### What it proves

Receipt establishes the scheduled production Worker, its mail credential, shared
sending code and delivery to this mailbox worked for that message. It does not
exercise a real Turnstile challenge, customer form completion, or every customer
mailbox. Existing mocked API/browser contracts cover validation and response
behavior; production smoke rejects invalid submissions without sending email.

Read-only Resend inspection on September 20 found the domain verified and sending
enabled. Recent business notifications and customer confirmations were marked
delivered. This is evidence for those messages only, not a guarantee of future
delivery. Customer identities and message bodies are not retained in this audit.

### Monitoring and response

A separate daily ChatGPT delivery monitor is intended to check Resend at 05:10
America/Chicago for that day's exact subject, sender and recipient. Its activation
is confirmed separately after deployment; the repository alone cannot enable it.
It must not send a replacement email that would conceal a failed Worker job.
Missing, bounced, failed or still-pending delivery should notify the owner through
ChatGPT, independent of the email channel. A provider `delivered` event confirms
receiving-server acceptance, not inbox placement or that the owner read it.

If missing: inspect the Cloudflare scheduled-event result, production revision,
Resend delivery event and domain status. Check credential configuration privately;
never copy a credential into a ticket or public workflow log. Distinguish provider
acceptance from delivery. Do not weaken Turnstile or the quote endpoint to test it.

### Validation and rollback

Unit tests mock all network calls and cover winter, summer, both DST transitions,
stale events, fixed recipient, stable keys, missing configuration and failure
handling. Build/type checks and deployment dry run must include the custom Worker
entrypoint. Existing browser and five release gates remain mandatory.

To disable the email job through a reviewed change, set `triggers.crons` to `[]`
and deploy through the normal gate. Keep the shared mail transport and HTTP
handler. Pause the separate delivery monitor when intentionally disabling sends.
No production rollback has been performed as part of implementing this check.

Only the owner-authorized fixed-recipient 05:00 Chicago heartbeat is the scheduled
real-mail exception. Do not send real quote test emails. Current observations and
acceptance gaps live only in project-state.md.

## Physical-device acceptance

Status: protocol prepared; actual iPad/VoiceOver results not yet supplied.
Automated axe, keyboard, WebKit and native Safari tests remain separate evidence.
No real quote or email is required for this protocol.

Record the release SHA from `/api/release`, device, OS/browser version, date,
text-size/display settings and tester before starting. Repeat in light and dark.

1. With VoiceOver, traverse the homepage headings, landmarks, navigation, service
   area/contact section and footer. Confirm meaningful names, sensible order and
   decorative imagery skipped. Activate the skip link and verify main is reached.
2. Visit About, Services, Pricing, Quote, Review and Privacy using touch and an
   attached keyboard. Verify Tab/Shift+Tab, visible focus, Enter activation and
   no keyboard trap. Check navigation after back/forward cache restoration.
3. On Quote, read every field label, required state and grouped option. Leave the
   hidden spam trap untouched. Submit an empty form only: confirm native required
   errors are announced and the relevant control is reachable. Do not submit a
   populated real form to test this protocol. Success/retry paths are mocked in CI.
4. Increase text size and zoom to 200%, then test a 320 CSS-pixel equivalent width
   for reflow. Check clipped labels, horizontal page scrolling, fixed elements
   obscuring focus, contact email wrapping and scrollable header reachability.
5. Enable Reduce Motion, change theme while on a page, rotate portrait/landscape,
   and verify menus, links, focus and readable contrast remain usable.
6. Record failures with route, exact steps and screenshot where helpful. Never
   record customer data. Record pass/fail/not-tested for each step; not-tested is
   not a pass. Attach evidence to the current roadmap before closing CBC-06.
