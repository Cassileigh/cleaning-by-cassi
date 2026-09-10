(() => {
  const state = window.__cleaningByCassiTurnstile ??= { widgetId: null };

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
  };

  const resetTurnstile = () => {
    if (state.widgetId === null || !window.turnstile) return;
    try { window.turnstile.reset(state.widgetId); } catch {}
  };

  const renderTurnstile = () => {
    const { container } = getElements();
    if (!container || !window.turnstile) return;
    if (state.widgetId !== null) {
      try { window.turnstile.remove(state.widgetId); } catch {}
      state.widgetId = null;
    }
    container.innerHTML = '';
    state.widgetId = window.turnstile.render(container, {
      sitekey: container.dataset.sitekey,
      action: 'quote',
      theme: 'auto',
      size: window.matchMedia('(max-width: 399px)').matches ? 'compact' : 'flexible',
      'response-field-name': 'cf-turnstile-response',
      'refresh-expired': 'auto',
      'refresh-timeout': 'auto',
      callback: () => setStatus(''),
      'expired-callback': () => setStatus('The security check expired. Please complete it again.', 'failure'),
      'error-callback': () => setStatus('The security check could not load. Please refresh the page and try again.', 'failure'),
    });
  };

  window.cleaningByCassiTurnstileLoad = renderTurnstile;
  window.addEventListener('pageshow', (event) => { if (event.persisted) resetTurnstile(); });
  renderTurnstile();

  const { form, button } = getElements();
  if (!form || !button || form.dataset.turnstileBound === 'true') return;
  form.dataset.turnstileBound = 'true';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (button.disabled) return;
    setStatus('');
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    if (!String(formData.get('cf-turnstile-response') || '').trim()) {
      setStatus('Please complete the security check before submitting.', 'failure');
      return;
    }

    button.disabled = true;
    const originalLabel = button.textContent;
    button.textContent = 'Sending…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
        signal: AbortSignal.timeout(40_000),
      });
      const parsed = await response.json().catch(() => null);
      const responseBody = parsed && typeof parsed === 'object' ? parsed : {};
      if (!response.ok) {
        throw new Error(
          typeof responseBody.error === 'string'
            ? responseBody.error
            : 'Your quote request could not be sent. Please try again.'
        );
      }
      if (responseBody.ok !== true) {
        throw new Error('Your quote request could not be confirmed. Please try again.');
      }
      window.location.assign('/quote-success');
    } catch (error) {
      resetTurnstile();
      setStatus(error instanceof Error && error.name === 'TimeoutError'
        ? 'The request timed out. Please complete the security check and try again.'
        : error instanceof Error ? error.message : 'Something went wrong. Please try again.', 'failure');
      button.disabled = false;
      button.textContent = originalLabel;
    }
  });
})();
