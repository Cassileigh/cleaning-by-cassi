export async function onRequestPost(context) {
	const { request, env } = context;
	const formData = await request.formData();
	const data = Object.fromEntries(formData.entries());

	const emailBody = Object.entries(data)
		.map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
		.join('');

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${env.RESENDAPIKEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: 'Cleaning By Cassi <quotes@cleaningbycassi.com>',
			to: 'cassandramorris@cleaningbycassi.com',
			subject: 'New Quote Request',
			html: emailBody,
		}),
	});

	if (!res.ok) {
		return new Response('Failed to send', { status: 500 });
	}

	return Response.redirect('https://cleaningbycassi.com/thank-you', 302);
}
