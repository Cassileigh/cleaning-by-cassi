(() => {
  const getElements = () => ({
    container: document.querySelector('#quote-turnstile'),
    form: document.querySelector('.quote-form'),
    status: document.querySelector('#form-status'),
    button: document.querySelector('#quote-submit'),
  });

  const setStatus = (message, kind = '') => {
    const { status } = getElements();
    if (!status) return;
    status.textContent = message;
    status.className = `form-status ${kind}`.trim();
    if (kind === 'failure') status.focus({ preventScroll: false });
  };

  const widget = window.createSiteTurnstile('#quote-turnstile', (next) => ({
    action: 'quote',
    size: next.getBoundingClientRect().width < 300 ? 'compact' : 'flexible',
    'response-field-name': 'cf-turnstile-response',
    callback: () => setStatus(''),
    'expired-callback': () =>
      setStatus(
        'The security check expired. Please complete it again.',
        'failure',
      ),
    'error-callback': () =>
      setStatus(
        'The security check could not load. Please refresh the page and try again.',
        'failure',
      ),
  }));
  const resetTurnstile = widget.reset;
  window.cleaningByCassiTurnstileLoad = widget.render;
  widget.render();

  const { form, button, status } = getElements();
  const fields = [
    'name',
    'email',
    'phone',
    'address',
    'squareFootage',
    'message',
    'preferredDays',
    'referrerName',
    'referralDetails',
    'contactMethod',
    'homeType',
    'bedrooms',
    'bathrooms',
    'cleaningType',
    'frequency',
    'referralSource',
    'preferredTime',
    'addons',
    'preferredDate',
  ];

  window.createSiteFormClient({
    form,
    button,
    status,
    fields,
    boundKey: 'turnstileBound',
    errorPrefix: 'quote-error-',
    focusStatus: true,
    timeoutMs: 40000,
    destination: '/quote-success',
    resetChallenge: resetTurnstile,
    renewAcceptedRetry: () => {
      const id = form.querySelector('[name="submissionId"]');
      if (id) id.value = crypto.randomUUID();
    },
    failureMessage: 'Your quote request could not be sent. Please try again.',
    unconfirmedMessage:
      'Your quote request could not be confirmed. Please try again.',
    timeoutMessage:
      'The request timed out. Please complete the security check and try again.',
    responseError: (body) =>
      typeof body.error === 'string'
        ? body.error +
          (/^CBC-[A-F0-9]{12}$/.test(body.requestId || '')
            ? ` Reference: ${body.requestId}`
            : '')
        : '',
    prepare: (formData, { setStatus }) => {
      if (!form.reportValidity()) return null;
      if (!String(formData.get('cf-turnstile-response') || '').trim()) {
        setStatus(
          'Please complete the security check before submitting.',
          'failure',
        );
        return null;
      }
      return { headers: { Accept: 'application/json' }, body: formData };
    },
  });
})();
