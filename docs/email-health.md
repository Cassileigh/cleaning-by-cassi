# Daily production email health

Authorized by the owner on September 20, 2026: one daily operational email at
05:00 America/Chicago. This authorization is specific to the fixed business
recipient; automated quote tests continue to mock all external email requests.

## Sending and safety

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

## What it proves

Receipt establishes the scheduled production Worker, its mail credential, shared
sending code and delivery to this mailbox worked for that message. It does not
exercise a real Turnstile challenge, customer form completion, or every customer
mailbox. Existing mocked API/browser contracts cover validation and response
behavior; production smoke rejects invalid submissions without sending email.

Read-only Resend inspection on September 20 found the domain verified and sending
enabled. Recent business notifications and customer confirmations were marked
delivered. This is evidence for those messages only, not a guarantee of future
delivery. Customer identities and message bodies are not retained in this audit.

## Monitoring and response

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

## Validation and rollback

Unit tests mock all network calls and cover winter, summer, both DST transitions,
stale events, fixed recipient, stable keys, missing configuration and failure
handling. Build/type checks and deployment dry run must include the custom Worker
entrypoint. Existing browser and five release gates remain mandatory.

To disable the email job through a reviewed change, set `triggers.crons` to `[]`
and deploy through the normal gate. Keep the shared mail transport and HTTP
handler. Pause the separate delivery monitor when intentionally disabling sends.
No production rollback has been performed as part of implementing this check.
