import type { ApplicationBindings } from './bindings';
import { CONTACT_EMAIL } from './consts';
import { sendMail } from './mail';

// Both UTC candidates run; only the one corresponding to 05:00 Chicago sends.
// No HTTP endpoint, request-controlled destination or Turnstile exemption exists.
import { healthDate, deliverHealth } from './email-health-engine';
export { healthDate } from './email-health-engine';

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
  await deliverHealth(date, () =>
    sendMail(env.RESEND_API_KEY!, `daily-email-health/${date}`, message),
  );
}
