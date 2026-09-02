const BUSINESS_EMAIL = 'cassandramorris@cleaningbycassi.com';

const FROM_EMAIL = 'Cleaning by Cassi <cassandramorris@cleaningbycassi.com>';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const POST = async ({ request, locals }: any) => {
  try {
    const formData = await request.formData();

    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();

    if (!name || !email || !phone) {
      return new Response(
        'Please fill out your name, email, and phone number.',
        { status: 400 }
      );
    }

    const env = locals.runtime.env;
    const resendApiKey = env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('RESEND_API_KEY is missing.');
      return new Response('Email service is not configured.', {
        status: 500,
      });
    }

    const fields = [
      ['Name', name],
      ['Email', email],
      ['Phone', phone],
      ['Preferred Contact', formData.get('contactMethod')],
      ['Address', formData.get('address')],
      ['Home Type', formData.get('homeType')],
      ['Bedrooms', formData.get('bedrooms')],
      ['Bathrooms', formData.get('bathrooms')],
      ['Square Footage', formData.get('squareFootage')],
      ['Cleaning Type', formData.get('cleaningType')],
      ['Cleaning Frequency', formData.get('frequency')],
      ['Add-ons', formData.getAll('addons').join(', ')],
      ['Additional Information', formData.get('message')],
      ['Preferred Date', formData.get('preferredDate')],
      ['Preferred Time', formData.get('preferredTime')],
      ['Preferred Days', formData.get('preferredDays')],
    ];

    const rows = fields
      .map(([label, value]) => {
        const safeLabel = escapeHtml(String(label));
        const safeValue = escapeHtml(String(value || 'Not provided'));

        return `
          <tr>
            <td style="padding:10px 12px;font-weight:bold;vertical-align:top;">
              ${safeLabel}
            </td>
            <td style="padding:10px 12px;">
              ${safeValue}
            </td>
          </tr>
        `;
      })
      .join('');

    const businessEmailHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
        <h1 style="color:#6a00f4;">🧼 New Quote Request</h1>

        <p>You received a new quote request through the Cleaning by Cassi website.</p>

        <table
          style="
            width:100%;
            max-width:700px;
            border-collapse:collapse;
            background:#faf7ff;
          "
        >
          ${rows}
        </table>

        <p style="margin-top:24px;">
          <strong>Reply directly to this email</strong> to contact ${escapeHtml(name)}.
        </p>
      </div>
    `;

    const customerEmailHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:650px;">
        <h1 style="color:#6a00f4;">✨ We Got Your Quote Request!</h1>

        <p>Hi ${escapeHtml(name)},</p>

        <p>
          Thank you so much for reaching out to <strong>Cleaning by Cassi</strong>! 💕
        </p>

        <p>
          I've received your quote request and will review the information
          you provided. I'll be in touch as soon as possible with your
          personalized quote.
        </p>

        <div
          style="
            margin:24px 0;
            padding:18px;
            border-radius:12px;
            background:#fff0f8;
          "
        >
          <strong>💌 What happens next?</strong>

          <p style="margin-bottom:0;">
            I'll review your cleaning needs and contact you using your
            preferred contact method.
          </p>
        </div>

        <p>
          If you need to reach me in the meantime, simply reply to this email.
        </p>

        <p>
          Thank you again! 🧼✨
        </p>

        <p>
          <strong>Cassi</strong><br />
          Cleaning by Cassi
        </p>
      </div>
    `;

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
      const errorText = await resendResponse.text();
      console.error('Resend business email error:', errorText);

      return new Response('Unable to send quote request.', {
        status: 500,
      });
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
      const errorText = await customerResponse.text();
      console.error('Resend customer email error:', errorText);

      return new Response(
        'Your quote request was received, but the confirmation email could not be sent.',
        { status: 500 }
      );
    }

    return Response.redirect(
      new URL('/quote-success', request.url),
      303
    );
  } catch (error) {
    console.error('Quote form error:', error);

    return new Response(
      'Something went wrong while submitting your quote request.',
      { status: 500 }
    );
  }
};