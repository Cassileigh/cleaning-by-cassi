import { parseFormRequest } from '../../form-request-engine';
import {
  jsonFormResponse as json,
  createFormResponder,
  acceptedFormResponse,
} from '../../form-response';
import {
  escapeHtml,
  isValidEmail,
  contentDigest,
  verifyChallenge,
} from '../../form-engine';
import type { APIRoute } from 'astro';
import type { ApplicationBindings } from '../../bindings';
import { env } from 'cloudflare:workers';

export const prerender = false;

import { CONTACT_EMAIL as BUSINESS_EMAIL } from '../../consts';
import { ADD_ONS, FREQUENCIES, REFERRAL_SOURCES } from '../../catalog';
import { sendMail } from '../../mail';
import { acceptMail } from '../../form-delivery';
import {
  validateFields,
  validateString,
  validPhone,
  validCalendarDate,
} from '../../form-schema';

const MAX_REQUEST_BYTES = 30_000;
const MAX_LENGTHS: Record<string, number> = {
  name: 100,
  email: 254,
  phone: 40,
  address: 250,
  squareFootage: 12,
  message: 2_500,
  preferredDays: 150,
  referrerName: 100,
  referralDetails: 250,
};
const LENGTH_SCHEMA = Object.fromEntries(
  Object.entries(MAX_LENGTHS).map(([key, max]) => [key, { max }]),
);

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
  referralSource: new Set(['', ...REFERRAL_SOURCES.map(([value]) => value)]),
  preferredTime: new Set([
    '',
    'morning',
    'late-morning',
    'afternoon',
    'flexible',
  ]),
  addons: new Set(ADD_ONS.map(([value]) => value)),
};

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === 'string' ? entry.trim() : '';
}

function isReasonablePhone(phone: string) {
  return validPhone(phone, 40);
}

function exceedsLength(formData: FormData) {
  return (
    validateFields(
      Object.fromEntries(
        Object.keys(MAX_LENGTHS).map((key) => [key, value(formData, key)]),
      ),
      LENGTH_SCHEMA,
    ).length > 0
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
    ['referralSource', value(formData, 'referralSource')],
    ['preferredTime', value(formData, 'preferredTime')],
  ];

  if (
    singleFields.some(
      ([key, submitted]) =>
        !validateString(submitted, { allowed: ALLOWED[key] }),
    )
  )
    return true;

  const addons = formData.getAll('addons').map((item) => String(item));
  return (
    addons.length > 13 ||
    addons.some((addon) => !validateString(addon, { allowed: ALLOWED.addons }))
  );
}

export const POST: APIRoute = async ({ request }) => {
  const respond = createFormResponder(request, (body, id) => {
    const message = escapeHtml(
      String(body.error || 'Your request could not be sent.'),
    );
    return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Quote request needs attention | Cleaning by Cassi</title><main><h1>Your request needs attention</h1><p>${message}</p><p>Reference: ${escapeHtml(id || '')}</p><p>Use your browser’s Back button to return to your details, or <a href="/quote">open the quote form</a>.</p><p><a href="mailto:${BUSINESS_EMAIL}">Email Cassi</a></p></main></html>`;
  });
  const requestId = `CBC-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;

  try {
    const parsedRequest = await parseFormRequest(request, {
      maxBytes: MAX_REQUEST_BYTES,
      trapField: 'faxNumber',
      repeatableFields: new Set(['addons']),
      multilineFields: new Set(['message']),
    });
    if (!parsedRequest.ok) {
      const failures = {
        size: { error: 'Request too large.', code: 'request-too-large' },
        origin: { error: 'Invalid request origin.', code: 'invalid-origin' },
        media: {
          error: 'Unsupported content type.',
          code: 'unsupported-media-type',
        },
        parse: { error: 'Invalid form submission.', code: 'invalid-form' },
        trap: {
          error: 'We could not verify this quote request.',
          code: 'quote-rejected',
        },
        controls: {
          error: 'Please check the information you entered.',
          code: 'invalid-fields',
        },
      };
      const field = parsedRequest.field;
      return respond(
        {
          ...failures[parsedRequest.kind],
          requestId,
          ...(parsedRequest.kind === 'controls'
            ? {
                fieldErrors:
                  field &&
                  (Object.hasOwn(MAX_LENGTHS, field) ||
                    Object.hasOwn(ALLOWED, field))
                    ? {
                        [field]:
                          'Remove unsupported characters from this field.',
                      }
                    : {},
              }
            : {}),
        },
        parsedRequest.status,
        requestId,
      );
    }
    const formData = parsedRequest.data;

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
          fieldErrors: Object.fromEntries(
            [
              ['name', name],
              ['email', email],
              ['phone', phone],
            ]
              .filter(([, input]) => !input)
              .map(([field]) => [field, `Please enter your ${field}.`]),
          ),
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
          fieldErrors: {
            ...Object.fromEntries(
              Object.entries(MAX_LENGTHS)
                .filter(([key, max]) => value(formData, key).length > max)
                .map(([key, max]) => [
                  key,
                  `Please use ${max} characters or fewer.`,
                ]),
            ),
            ...(name.length < 2
              ? { name: 'Please enter at least two characters for your name.' }
              : {}),
            ...(!isValidEmail(email)
              ? { email: 'Please enter a valid email address.' }
              : {}),
            ...(!isReasonablePhone(phone)
              ? { phone: 'Please enter a phone number with 7 to 15 digits.' }
              : {}),
          },
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
          fieldErrors: Object.fromEntries(
            Object.entries(ALLOWED)
              .filter(([key, allowed]) =>
                key === 'addons'
                  ? formData.getAll(key).length > 13 ||
                    formData
                      .getAll(key)
                      .some((entry) => !allowed.has(String(entry)))
                  : !allowed.has(value(formData, key)),
              )
              .map(([key]) => [
                key,
                'Please choose one of the listed options.',
              ]),
          ),
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
          fieldErrors: {
            squareFootage: 'Please enter a whole number between 1 and 100,000.',
          },
          requestId,
        },
        400,
        requestId,
      );
    }

    const preferredDate = value(formData, 'preferredDate');
    if (preferredDate && !validCalendarDate(preferredDate)) {
      return respond(
        {
          error: 'Please enter a valid preferred date.',
          code: 'invalid-date',
          fieldErrors: { preferredDate: 'Please enter a valid calendar date.' },
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

    const passedTurnstile =
      (await verifyChallenge(
        turnstileSecret,
        value(formData, 'cf-turnstile-response'),
        expectedHostnames,
        'quote',
        request.headers.get('CF-Connecting-IP'),
      )) === 'passed';

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
      [
        'How Did You Hear About Us?',
        REFERRAL_SOURCES.find(
          ([key]) => key === value(formData, 'referralSource'),
        )?.[1] || '',
      ],
      ['Referred By', value(formData, 'referrerName')],
      ['Referral Details', value(formData, 'referralDetails')],
    ];

    // Resend retains idempotency keys for 24 hours. Tokens and request IDs must
    // not enter this digest: both change on a legitimate retry.
    const deliveryKey = await contentDigest([submissionId, fields]);

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

    const acceptance = await acceptMail(() =>
      sendMail(resendApiKey, `quote-business/${deliveryKey}`, {
        to: [BUSINESS_EMAIL],
        reply_to: email,
        subject: `🧼 New Quote Request — ${name}`,
        html: businessEmailHtml,
      }),
    );
    if (acceptance.outcome === 'request-failed') {
      console.error('Resend business email request failed.', {
        requestId,
        category: 'provider-request-failed',
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
    if (acceptance.outcome === 'rejected') {
      console.error('Resend business email request was rejected.', {
        requestId,
        status: acceptance.status,
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
    if (acceptance.outcome === 'unconfirmed') {
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
      emailId: acceptance.id,
    });

    try {
      const customerResponse = await sendMail(
        resendApiKey,
        `quote-customer/${deliveryKey}`,
        {
          to: [email],
          reply_to: BUSINESS_EMAIL,
          subject: '✨ We received your quote request — Cleaning by Cassi',
          html: customerEmailHtml,
        },
      );

      if (!customerResponse.ok) {
        console.error('Resend customer confirmation was rejected.', {
          requestId,
          status: customerResponse.status,
        });
      }
    } catch (error) {
      console.error('Resend customer confirmation failed.', {
        requestId,
        category: 'provider-request-failed',
      });
    }

    return acceptedFormResponse(request, requestId, '/quote-success');
  } catch (error) {
    console.error('Quote form error:', 'Request handling failed', {
      requestId,
    });
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
