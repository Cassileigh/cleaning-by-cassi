import type { APIRoute } from 'astro';
import type { ApplicationBindings } from '../../bindings';
import { env } from 'cloudflare:workers';

export const prerender = false;

import { CONTACT_EMAIL as BUSINESS_EMAIL } from '../../consts';
import { ADD_ONS, FREQUENCIES } from '../../catalog';
const FROM_EMAIL = 'Cleaning by Cassi <quotes@cleaningbycassi.com>';

const MAX_REQUEST_BYTES = 30_000;
const MAX_LENGTHS: Record<string, number> = {
  name: 100,
  email: 254,
  phone: 40,
  address: 250,
  squareFootage: 12,
  message: 2_500,
  preferredDays: 150,
};

const ALLOWED = {
  contactMethod: new Set(['', 'email', 'phone', 'text']),
  homeType: new Set(['', 'house', 'apartment', 'condo', 'townhome', 'other']),
  bedrooms: new Set(['', '1', '2', '3', '4', '5+']),
  bathrooms: new Set(['', '1', '1.5', '2', '2.5', '3+']),
  cleaningType: new Set([
    '',
    'standard',
    'deep',
    'first-time',
    'move-in',
    'move-out',
    'other',
  ]),
  frequency: new Set(['', ...FREQUENCIES.map(([value]) => value)]),
  preferredTime: new Set([
    '',
    'morning',
    'late-morning',
    'afternoon',
    'flexible',
  ]),
  addons: new Set(ADD_ONS.map(([value]) => value)),
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === 'string' ? entry.trim() : '';
}

// Read no more than the permitted bytes, including requests without Content-Length.
async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(part.value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function isReasonablePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 && phone.length <= 40;
}

function exceedsLength(formData: FormData) {
  return Object.entries(MAX_LENGTHS).some(
    ([key, max]) => value(formData, key).length > max,
  );
}

function hasInvalidSelectValue(formData: FormData) {
  const singleFields: Array<[keyof Omit<typeof ALLOWED, 'addons'>, string]> = [
    ['contactMethod', value(formData, 'contactMethod')],
    ['homeType', value(formData, 'homeType')],
    ['bedrooms', value(formData, 'bedrooms')],
    ['bathrooms', value(formData, 'bathrooms')],
    ['cleaningType', value(formData, 'cleaningType')],
    ['frequency', value(formData, 'frequency')],
    ['preferredTime', value(formData, 'preferredTime')],
  ];

  if (singleFields.some(([key, submitted]) => !ALLOWED[key].has(submitted)))
    return true;

  const addons = formData.getAll('addons').map((item) => String(item));
  return (
    addons.length > 13 || addons.some((addon) => !ALLOWED.addons.has(addon))
  );
}

type TurnstileSiteverifyResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
  'error-codes'?: string[];
};

const TURNSTILE_SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_ACTION = 'quote';

function json(body: Record<string, unknown>, status = 200, requestId?: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...(status === 405 ? { Allow: 'POST' } : {}),
      ...(requestId ? { 'X-Request-ID': requestId } : {}),
    },
  });
}

async function verifyTurnstile(
  request: Request,
  formData: FormData,
  secret: string,
  expectedHostnames: Set<string>,
) {
  const token = value(formData, 'cf-turnstile-response');
  if (!token || token.length > 2048) return false;

  try {
    const body = new URLSearchParams({
      secret,
      response: token,
    });

    const remoteIp = request.headers.get('CF-Connecting-IP');
    if (remoteIp) body.set('remoteip', remoteIp);

    const verification = await fetch(TURNSTILE_SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(10_000),
    });

    if (!verification.ok) return false;

    const result = (await verification.json()) as TurnstileSiteverifyResponse;

    return (
      result.success === true &&
      typeof result.hostname === 'string' &&
      expectedHostnames.has(result.hostname) &&
      result.action === TURNSTILE_ACTION
    );
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  const wantsHTML =
    request.headers.get('accept')?.includes('text/html') &&
    !request.headers.get('accept')?.includes('application/json');
  const respondJSON = json;
  const respond = (
    body: Record<string, unknown>,
    status = 200,
    id?: string,
  ) => {
    if (!wantsHTML || status < 400) return respondJSON(body, status, id);
    const message = escapeHtml(
      String(body.error || 'Your request could not be sent.'),
    );
    return new Response(
      `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Quote request needs attention | Cleaning by Cassi</title><main><h1>Your request needs attention</h1><p>${message}</p><p>Reference: ${escapeHtml(id || '')}</p><p>Use your browser’s Back button to return to your details, or <a href="/quote">open the quote form</a>.</p><p><a href="mailto:${BUSINESS_EMAIL}">Email Cassi</a></p></main></html>`,
      {
        status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
          ...(id ? { 'X-Request-ID': id } : {}),
        },
      },
    );
  };
  const requestId = `CBC-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;

  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return respond(
        { error: 'Request too large.', code: 'request-too-large', requestId },
        413,
        requestId,
      );
    }

    const requestUrl = new URL(request.url);
    const origin = request.headers.get('origin');
    if (origin && origin !== requestUrl.origin) {
      return respond(
        { error: 'Invalid request origin.', code: 'invalid-origin', requestId },
        403,
        requestId,
      );
    }

    const mediaType = request.headers
      .get('content-type')
      ?.split(';')[0]
      .trim()
      .toLowerCase();
    if (
      !['application/x-www-form-urlencoded', 'multipart/form-data'].includes(
        mediaType || '',
      )
    ) {
      return respond(
        {
          error: 'Unsupported content type.',
          code: 'unsupported-media-type',
          requestId,
        },
        415,
        requestId,
      );
    }

    const rawBody = await readBody(request);
    if (rawBody === null) {
      return respond(
        { error: 'Request too large.', code: 'request-too-large', requestId },
        413,
        requestId,
      );
    }

    let formData: FormData;
    try {
      formData = await new Response(rawBody, {
        headers: { 'Content-Type': request.headers.get('content-type')! },
      }).formData();
    } catch {
      return respond(
        { error: 'Invalid form submission.', code: 'invalid-form', requestId },
        400,
        requestId,
      );
    }

    // Empty/absent passes. ANY populated value (even whitespace or a file)
    // rejects before verification or email. Never return success for this trap.
    if (
      formData
        .getAll('faxNumber')
        .some((entry) => typeof entry !== 'string' || entry.length > 0)
    ) {
      return respond(
        {
          error: 'We could not verify this quote request.',
          code: 'quote-rejected',
          requestId,
        },
        403,
        requestId,
      );
    }

    const seen = new Set<string>();
    for (const [key, entry] of formData) {
      if (typeof entry !== 'string' || (key !== 'addons' && seen.has(key))) {
        return respond(
          {
            error: 'Invalid form submission.',
            code: 'invalid-form',
            requestId,
          },
          400,
          requestId,
        );
      }
      seen.add(key);
      const controls =
        key === 'message'
          ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/
          : /[\u0000-\u001f\u007f]/;
      if (controls.test(entry)) {
        return respond(
          {
            error: 'Please check the information you entered.',
            code: 'invalid-fields',
            requestId,
          },
          400,
          requestId,
        );
      }
    }

    const submissionId = value(formData, 'submissionId');
    if (
      submissionId &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        submissionId,
      )
    ) {
      return respond(
        {
          error: 'Please refresh the quote form and try again.',
          code: 'invalid-submission',
          requestId,
        },
        400,
        requestId,
      );
    }
    const name = value(formData, 'name');
    const email = value(formData, 'email').toLowerCase();
    const phone = value(formData, 'phone');

    if (!name || !email || !phone) {
      return respond(
        {
          error: 'Please fill out your name, email, and phone number.',
          code: 'missing-fields',
          requestId,
        },
        400,
        requestId,
      );
    }

    if (
      exceedsLength(formData) ||
      name.length < 2 ||
      !isValidEmail(email) ||
      !isReasonablePhone(phone)
    ) {
      return respond(
        {
          error: 'Please check the information you entered.',
          code: 'invalid-fields',
          requestId,
        },
        400,
        requestId,
      );
    }

    if (hasInvalidSelectValue(formData)) {
      return respond(
        {
          error: 'One or more submitted values were invalid.',
          code: 'invalid-selection',
          requestId,
        },
        400,
        requestId,
      );
    }

    const squareFootage = value(formData, 'squareFootage');
    if (
      squareFootage &&
      (!/^\d{1,7}$/.test(squareFootage) ||
        Number(squareFootage) < 1 ||
        Number(squareFootage) > 100000)
    ) {
      return respond(
        {
          error: 'Please enter a valid square footage.',
          code: 'invalid-square-footage',
          requestId,
        },
        400,
        requestId,
      );
    }

    const preferredDate = value(formData, 'preferredDate');
    const parsedDate = new Date(`${preferredDate}T00:00:00.000Z`);
    if (
      preferredDate &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) ||
        !Number.isFinite(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== preferredDate)
    ) {
      return respond(
        {
          error: 'Please enter a valid preferred date.',
          code: 'invalid-date',
          requestId,
        },
        400,
        requestId,
      );
    }

    const bindings: ApplicationBindings = env;
    const resendApiKey = bindings.RESEND_API_KEY?.trim();
    const turnstileSecret = bindings.TURNSTILE_SECRET?.trim();
    const expectedHostnames = new Set(
      String(bindings.TURNSTILE_HOSTNAMES || '')
        .split(',')
        .map((hostname) => hostname.trim().toLowerCase())
        .filter(Boolean),
    );

    // Never accept quote requests without a configured Turnstile destination.
    if (!turnstileSecret || expectedHostnames.size === 0) {
      console.error('Turnstile is not configured.', { requestId });
      return respond(
        {
          error: 'Security verification is temporarily unavailable.',
          code: 'turnstile-not-configured',
          requestId,
        },
        503,
        requestId,
      );
    }

    const passedTurnstile = await verifyTurnstile(
      request,
      formData,
      turnstileSecret,
      expectedHostnames,
    );

    if (!passedTurnstile) {
      return respond(
        {
          error:
            'The security check expired or could not be verified. Please complete it again.',
          code: 'turnstile-failed',
          requestId,
        },
        403,
        requestId,
      );
    }

    if (!resendApiKey) {
      console.error('RESEND_API_KEY is missing.', { requestId });
      return respond(
        {
          error: 'Email service is not configured.',
          code: 'email-not-configured',
          requestId,
        },
        503,
        requestId,
      );
    }

    const fields = [
      ['Name', name],
      ['Email', email],
      ['Phone', phone],
      ['Preferred Contact', value(formData, 'contactMethod')],
      ['Address', value(formData, 'address')],
      ['Home Type', value(formData, 'homeType')],
      ['Bedrooms', value(formData, 'bedrooms')],
      ['Bathrooms', value(formData, 'bathrooms')],
      ['Square Footage', squareFootage],
      ['Cleaning Type', value(formData, 'cleaningType')],
      [
        'Cleaning Frequency',
        FREQUENCIES.find(
          ([key]) => key === value(formData, 'frequency'),
        )?.[1] || '',
      ],
      [
        'Add-ons',
        [...new Set(formData.getAll('addons').map(String))]
          .sort()
          .map((key) => ADD_ONS.find(([id]) => id === key)?.[1] || '')
          .join(', '),
      ],
      ['Additional Information', value(formData, 'message')],
      ['Preferred Date', preferredDate],
      ['Preferred Time', value(formData, 'preferredTime')],
      ['Preferred Days', value(formData, 'preferredDays')],
    ];

    // Resend retains idempotency keys for 24 hours. Tokens and request IDs must
    // not enter this digest: both change on a legitimate retry.
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify([submissionId, fields])),
    );
    const deliveryKey = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');

    const rows = fields
      .map(([label, submittedValue]) => {
        const safeLabel = escapeHtml(String(label));
        const safeValue = escapeHtml(String(submittedValue || 'Not provided'));
        return `<tr><td style="padding:10px 12px;font-weight:bold;vertical-align:top;">${safeLabel}</td><td style="padding:10px 12px;">${safeValue}</td></tr>`;
      })
      .join('');

    const businessEmailHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
        <h1 style="color:#6a00f4;">🧼 New Quote Request</h1>
        <p>You received a new quote request through the Cleaning by Cassi website.</p>
        <table style="width:100%;max-width:700px;border-collapse:collapse;background:#faf7ff;">${rows}</table>
        <p style="margin-top:24px;"><strong>Reply directly to this email</strong> to contact ${escapeHtml(name)}.</p>
      </div>`;

    const customerEmailHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:650px;">
        <h1 style="color:#6a00f4;">✨ We Got Your Quote Request!</h1>
        <p>Hi ${escapeHtml(name)},</p>
        <p>Thank you so much for reaching out to <strong>Cleaning by Cassi</strong>! 💕</p>
        <p>I've received your quote request and will review the information you provided. I'll be in touch as soon as possible with your personalized quote.</p>
        <div style="margin:24px 0;padding:18px;border-radius:12px;background:#fff0f8;">
          <strong>💌 What happens next?</strong>
          <p style="margin-bottom:0;">I'll review your cleaning needs and contact you using your preferred contact method.</p>
        </div>
        <p>If you need to reach me in the meantime, simply reply to this email.</p>
        <p>Thank you again! 🧼✨</p>
        <p><strong>Cassi</strong><br />Cleaning by Cassi</p>
      </div>`;

    let resendResponse: Response;
    try {
      resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `quote-business/${deliveryKey}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [BUSINESS_EMAIL],
          reply_to: email,
          subject: `🧼 New Quote Request — ${name}`,
          html: businessEmailHtml,
        }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      console.error('Resend business email request failed.', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return respond(
        {
          error: 'Unable to send your quote request. Please try again.',
          code: 'email-unavailable',
          requestId,
        },
        502,
        requestId,
      );
    }

    if (!resendResponse.ok) {
      console.error('Resend business email request was rejected.', {
        requestId,
        status: resendResponse.status,
      });
      return respond(
        {
          error: 'Unable to send your quote request. Please try again.',
          code: 'email-rejected',
          requestId,
        },
        502,
        requestId,
      );
    }

    let resendResult: { id?: unknown } | null;
    try {
      resendResult = (await resendResponse.json()) as { id?: unknown };
    } catch {
      resendResult = {};
    }

    if (typeof resendResult?.id !== 'string' || !resendResult.id.trim()) {
      console.error('Resend returned success without an email ID.', {
        requestId,
      });
      return respond(
        {
          error: 'Your quote request could not be confirmed. Please try again.',
          code: 'email-unconfirmed',
          requestId,
        },
        502,
        requestId,
      );
    }

    console.info('Business quote email accepted by Resend.', {
      requestId,
      emailId: resendResult.id,
    });

    try {
      const customerResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `quote-customer/${deliveryKey}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email],
          reply_to: BUSINESS_EMAIL,
          subject: '✨ We received your quote request — Cleaning by Cassi',
          html: customerEmailHtml,
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!customerResponse.ok) {
        console.error('Resend customer confirmation was rejected.', {
          requestId,
          status: customerResponse.status,
        });
      }
    } catch (error) {
      console.error('Resend customer confirmation failed.', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    if (request.headers.get('accept')?.includes('application/json')) {
      return respond({ ok: true, requestId }, 200, requestId);
    }

    return new Response(null, {
      status: 303,
      headers: {
        Location: new URL('/quote-success', request.url).href,
        'Cache-Control': 'no-store',
        'X-Request-ID': requestId,
      },
    });
  } catch (error) {
    console.error(
      'Quote form error:',
      error instanceof Error ? error.message : 'Unknown error',
      { requestId },
    );
    return respond(
      {
        error: 'Something went wrong while submitting your quote request.',
        code: 'quote-failed',
        requestId,
      },
      500,
      requestId,
    );
  }
};

export const ALL: APIRoute = async () =>
  json({ error: 'Method not allowed.', code: 'method-not-allowed' }, 405);
