export const FROM_EMAIL = 'Cleaning by Cassi <quotes@cleaningbycassi.com>';

export function sendMail(
  apiKey: string,
  idempotencyKey: string,
  message: {
    to: string[];
    reply_to?: string;
    subject: string;
    html?: string;
    text?: string;
  },
): Promise<Response> {
  if (!apiKey.trim()) throw new Error('Mail credential missing');
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ from: FROM_EMAIL, ...message }),
    signal: AbortSignal.timeout(10_000),
  });
}
