const BUSINESS_EMAIL = 'cassandramorris@cleaningbycassi.com';
const FROM_EMAIL = 'Cleaning by Cassi <cassandramorris@cleaningbycassi.com>';

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
  cleaningType: new Set(['', 'standard', 'deep', 'first-time', 'move-in', 'move-out', 'other']),
  frequency: new Set(['', 'one-time', 'weekly', 'every-2-weeks', 'every-3-weeks', 'monthly', 'not-sure-yet']),
  preferredTime: new Set(['', 'morning', 'late-morning', 'afternoon', 'flexible']),
  addons: new Set([
    'window-tracks',
    'baseboards',
    'doors',
    'cabinet-fronts',
    'shower-tub',
    'trash-cans',
    'bed-making',
    'laundry',
    'pet-hair',
    'wall-spots',
    'cobwebs',
    'floor-edges',
    'high-areas',
  ]),
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
  return String(formData.get(key) || '').trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function isReasonablePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 && phone.length <= 40;
}

function exceedsLength(formData: FormData) {
  return Object.entries(MAX_LENGTHS).some(([key, max]) => value(formData, key).length > max);
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

  if (singleFields.some(([key, submitted]) => !ALLOWED[key].has(submitted))) return true;

  const addons = formData.getAll('addons').map((item) => String(item));
  return addons.length > 13 || addons.some((addon) => !ALLOWED.addons.has(addon));
}

type TurnstileSiteverifyResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
  'error-codes'?: string[];
};

async function verifyTurnstile(
  request: Request,
  formData: FormData,
  secret: string,
  expectedHostname: string
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

    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!verification.ok) return false;

    const result = (await verification.json()) as TurnstileSiteverifyResponse;

    return (
      result.success === true &&
      result.hostname === expectedHostname &&
      result.action === 'quote'
    );
  } catch {
    return false;
  }
}

export const POST = async ({ request, locals }: any) => {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength && contentLength > MAX_REQUEST_BYTES) {
      return new Response('Request too large.', { status: 413 });
    }

    const requestUrl = new URL(request.url);
    const origin = request.headers.get('origin');
    if (origin && origin !== requestUrl.origin) {
      return new Response('Invalid request origin.', { status: 403 });
    }

    const formData = await request.formData();

    // Honeypot: real visitors never fill this hidden field.
    if (value(formData, 'website')) {
      return new Response(null, { status: 204 });
    }

    const name = value(formData, 'name');
    const email = value(formData, 'email').toLowerCase();
    const phone = value(formData, 'phone');

    if (!name || !email || !phone) {
      return new Response('Please fill out your name, email, and phone number.', { status: 400 });
    }

    if (exceedsLength(formData) || name.length < 2 || !isValidEmail(email) || !isReasonablePhone(phone)) {
      return new Response('Please check the information you entered.', { status: 400 });
    }

    if (hasInvalidSelectValue(formData)) {
      return new Response('One or more submitted values were invalid.', { status: 400 });
    }

    const squareFootage = value(formData, 'squareFootage');
    if (squareFootage && (!/^\d{1,7}$/.test(squareFootage) || Number(squareFootage) > 100000)) {
      return new Response('Please enter a valid square footage.', { status: 400 });
    }

    const preferredDate = value(formData, 'preferredDate');
    if (preferredDate && !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
      return new Response('Please enter a valid preferred date.', { status: 400 });
    }

    const env = locals.runtime.env;
    const resendApiKey = env.RESEND_API_KEY;
    // TURNSTILE_SECRET is Cloudflare Spin's canonical binding name.
    // Keep the old name as a temporary fallback for the earlier integration.
    const turnstileSecret = env.TURNSTILE_SECRET || env.TURNSTILE_SECRET_KEY;

    if (turnstileSecret) {
      const passedTurnstile = await verifyTurnstile(
        request,
        formData,
        turnstileSecret,
        requestUrl.hostname
      );

      if (!passedTurnstile) {
        return new Response('Please complete the security check and try again.', { status: 403 });
      }
    }

    if (!resendApiKey) {
      console.error('RESEND_API_KEY is missing.');
      return new Response('Email service is not configured.', { status: 500 });
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
      ['Cleaning Frequency', value(formData, 'frequency')],
      ['Add-ons', formData.getAll('addons').map(String).join(', ')],
      ['Additional Information', value(formData, 'message')],
      ['Preferred Date', preferredDate],
      ['Preferred Time', value(formData, 'preferredTime')],
      ['Preferred Days', value(formData, 'preferredDays')],
    ];

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

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [BUSINESS_EMAIL],
        reply_to: email,
        subject: `🧼 New Quote Request — ${name}`,
        html: businessEmailHtml,
      }),
    });

    if (!resendResponse.ok) {
      console.error('Resend business email failed with status:', resendResponse.status);
      return new Response('Unable to send quote request.', { status: 500 });
    }

    const customerResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        reply_to: BUSINESS_EMAIL,
        subject: '✨ We received your quote request — Cleaning by Cassi',
        html: customerEmailHtml,
      }),
    });

    if (!customerResponse.ok) {
      console.error('Resend customer email failed with status:', customerResponse.status);
      // The business already received the request, so don't make the visitor resubmit it.
    }

    return Response.redirect(new URL('/quote-success', request.url), 303);
  } catch (error) {
    console.error('Quote form error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response('Something went wrong while submitting your quote request.', { status: 500 });
  }
};