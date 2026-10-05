# Quote and status security contract

Reference: AlienX status disclosure fix `de943476d1fd32a5ac13d8e37f2ad30259e21d2e`.
Its later status rebuild reintroduced vendor-specific configuration details;
this implementation keeps generic public protection/delivery checks.

## Quote request chain

1. Reject cross-origin submissions when an Origin header is supplied. Origin checks are not authentication; Turnstile remains mandatory.
2. Accept only URL-encoded or multipart forms. Read at most 30,000 bytes before parsing, regardless of Content-Length. Malformed forms return 400; unsupported types return 415; oversized requests return 413.
3. `faxNumber` is a spam trap, never a contact field. Absent or one empty string is acceptable. Any nonempty value, including whitespace or a file, returns 403 `quote-rejected`. Duplicate scalar fields and uploaded files are rejected. No fake success, redirect, Turnstile call, or email send occurs for a populated trap.
4. Validate required fields, lengths, control characters, selection allowlists, positive square footage and calendar dates. Escape all user content included in HTML email.
5. Fail closed if the Turnstile secret or hostname list is missing. Verify token success, hostname and `quote` action with a bounded request.
6. Send to the fixed business mailbox from the fixed verified sender. The submitted address is only the reply-to and confirmation recipient. Require both a successful Resend HTTP response and a nonempty email ID before returning success.
7. A customer confirmation is best-effort after business acceptance. Its failure does not turn an accepted business request into a retry prompt. No provider response bodies are logged.
8. JSON clients receive `ok: true`; native forms receive a no-store 303 to `/quote-success`. The enhanced form requires both HTTP success and `ok: true` before navigation.

## Limits of these checks

The optional discovery section accepts a source from the shared
`REFERRAL_SOURCES` allowlist, a referrer name (100 characters maximum), and
group/business/other details (250 characters maximum). Facebook groups, Facebook
pages/posts, business cards at local businesses, flyers, Google, personal referrals
and other sources are distinguished. Empty or omitted fields remain valid. The
fields inherit duplicate/file/control rejection, HTML escaping, and canonical
retry identity; all three appear in the business notification only. Collecting
these details does not promise a discount or automatically award referral credit.

Quote notifications and customer confirmations use the shared `src/mail.ts`
transport. The authorized daily operational email uses that same transport and
production credential but is invoked only by the Worker's scheduled handler.
It cannot bypass any quote validation or accept a caller-selected destination.
See [email-health.md](release-runbook.md#email-health).

A Resend email ID proves provider acceptance, not inbox delivery. Delivery/bounce verification requires provider events or mailbox confirmation. Canonical submitted fields and the submission ID produce stable, separate business/customer Resend idempotency keys; fresh Turnstile tokens and request IDs do not change those keys. Deduplication lasts only for the provider's retention window, not indefinitely. There is no durable application queue. A honeypot is supplemental, not a substitute for Turnstile or edge abuse controls.

The protection readiness check requires a nonempty secret, at least one nonempty configured hostname, and a callable quote rate-limit binding. Missing configuration returns 503 for GET and HEAD without probing providers. Logs retain fixed failure categories and request/provider IDs, not arbitrary exception messages or provider response bodies.

Middleware enforces eight attempts per ten minutes in a bounded isolate-local map, plus the configured `QUOTE_RATE_LIMITER` Cloudflare binding (eight per minute per IP within an edge location). Missing or failing bindings return 503 before provider calls; exhausted limits return 429 with Retry-After. Both quote URL forms share limits. Cloudflare counters span isolates within a location, but do not provide a strict worldwide quota. Namespace `2107100912` is reserved for this site's quote limiter in this repository.

`/api/status` reports local readiness, not an end-to-end provider probe. Generic protection/delivery values reflect required bindings, not a test email or live challenge verification. It returns 503 for missing bindings, supports bodyless HEAD, rejects other methods, disallows caching, and omits vendor names, runtime metadata and echoed request identifiers. It still intentionally publishes generic readiness; this is not a private diagnostics endpoint.

## Regression checks

Run `node --test tests/api-contract.test.mjs`. The tests execute the actual TypeScript handlers with Worker bindings and all external requests mocked; they send no email. CI runs these tests before the build, type check, Worker dry run and dependency audit. Production smoke checks use a deliberately invalid Turnstile token and do not test successful email delivery.

GitHub Actions are pinned to verified release commit SHAs. Existing responsive and accessibility workflows remain in place. Passing these checks is not a guarantee that the repository has no vulnerabilities; review dependency and code-scanning findings separately.

## Assets and brand

September 22, 2026 source review:

- `DMSerifDisplay-Regular.woff2` identifies itself as DM Serif Display Regular,
  version 5.200, Colophon Foundry. Its embedded copyright identifies Adobe and
  Google and its license identifies SIL OFL 1.1. The original upload commit is
  `18dedd1`; its original download location is not established by Git history.
- Added `public/fonts/DMSerifDisplay-OFL.txt` with the embedded copyright and the
  [upstream family notice/license](https://github.com/google/fonts/blob/main/ofl/dmserifdisplay/OFL.txt).
  This restores the missing distribution notice without claiming a reproducible
  binary download history. Poppins already ships with `Poppins-OFL.txt`.
- `HeroCleaningGraphic.astro` had no importers, and its 220×230 image had no other
  references. Both unused files are removed. The current homepage hero remains
  `cleaned-living-room.webp` (1312×1199); no image was enlarged or replaced.
- The build decodes every shipped raster and generates existing AVIF/WebP variants
  without enlarging source images. CI verifies actual image loading and layout.
- All existing Lighthouse budgets are retained. Lab measurements do not establish
  field Core Web Vitals; no additional tracking was introduced.

Keep shared PageLayout, brand colors/artwork, one-row header and visible Facebook
entry. Preserve shared service/frequency/add-on data; invent no pricing, surcharge
or referral reward. docs/brand originals are build inputs, not redundant docs.
All font licenses remain alongside fonts. Keep actual versions in package.json.

## Shared engineering ownership

`engineering.config.json` owns explicit non-secret site inputs for migrated
release/monitoring/browser tooling. `scripts/site-config.mjs` validates repository
and release-ref identity. Release verification uses the shared Git-ref verifier
and trusted approval publisher; the production target guard also runs at deploy.
The shared browser runner selects committed site interaction suites without
changing business forms or recipients. The shared form monitor uses empty-token
rejection only. Remaining application/CSP/integrity migration and exact-revision
release acceptance stay in the existing findings register.
