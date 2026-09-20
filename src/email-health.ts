import type { ApplicationBindings } from './bindings';
import { CONTACT_EMAIL } from './consts';
import { sendMail } from './mail';

// Both UTC candidates run; only the one corresponding to 05:00 Chicago sends.
// No HTTP endpoint, request-controlled destination or Turnstile exemption exists.
export function healthDate(
  scheduledTime: number,
  now = Date.now(),
): string | null {
  if (
    !Number.isFinite(scheduledTime) ||
    scheduledTime > now + 60_000 ||
    now - scheduledTime > 15 * 60_000
  )
    return null;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(scheduledTime))
      .map(({ type, value }) => [type, value]),
  );
  return parts.hour === '05' && parts.minute === '00'
    ? `${parts.year}-${parts.month}-${parts.day}`
    : null;
}

export async function sendDailyHealth(
  scheduledTime: number,
  env: ApplicationBindings,
  now = Date.now(),
) {
  const date = healthDate(scheduledTime, now);
  if (!date) return;
  if (!env.RESEND_API_KEY?.trim())
    throw new Error('Email health: missing mail configuration');
  // Stable date-only payload and key deduplicate retries, including across deploys.
  const message = {
    to: [CONTACT_EMAIL],
    subject: `Cleaning by Cassi — daily email health check — ${date}`,
    text: `Good morning, Cassi!\n\nThis is your daily 5:00 a.m. Central email health check for ${date}.\n\nReceiving this confirms that the production website's scheduled job, mail credential, shared sending code, and delivery to your business mailbox worked for this message.\n\nIt does not test a customer's Turnstile challenge, their form submission, or delivery to every customer's inbox. Those paths have separate automated checks.\n\nNo customer quote was created. If this email is missing, check the delivery monitor and Cloudflare scheduled-event logs.\n\nCleaning by Cassi`,
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt)
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    try {
      const response = await sendMail(
        env.RESEND_API_KEY,
        `daily-email-health/${date}`,
        message,
      );
      if (!response.ok) {
        if (response.status !== 429 && response.status < 500) break;
        continue;
      }
      const result = (await response.json()) as { id?: unknown } | null;
      if (typeof result?.id === 'string' && result.id.trim()) {
        console.info('Daily email health accepted.', {
          date,
          emailId: result.id,
        });
        return;
      }
    } catch {
      // Retry with the same key, never log provider bodies or credentials.
    }
  }
  throw new Error('Daily email health not confirmed by provider');
}
