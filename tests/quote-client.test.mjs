import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function client(fetch) {
  const events = {};
  let submit;
  let destination;
  const button = { disabled: false, textContent: 'Request My Free Quote' };
  const id = { value: '11111111-1111-4111-8111-111111111111' };
  const form = {
    dataset: {},
    action: '/api/quote',
    reportValidity: () => true,
    querySelector: () => id,
    addEventListener: (_, handler) => {
      submit = handler;
    },
  };
  const status = { focus() {} };
  const container = { dataset: { sitekey: 'test' } };
  const elements = {
    '#quote-submit': button,
    '.quote-form': form,
    '#form-status': status,
    '#quote-turnstile': container,
  };
  const window = {
    matchMedia: () => ({ matches: false }),
    turnstile: { render: () => 1, reset() {}, remove() {} },
    addEventListener: (name, handler) => {
      events[name] = handler;
    },
    location: {
      assign: (url) => {
        destination = url;
      },
    },
  };
  vm.runInNewContext(
    readFileSync(new URL('../public/quote-form.js', import.meta.url), 'utf8'),
    {
      window,
      document: { querySelector: (selector) => elements[selector] },
      crypto,
      AbortController,
      AbortSignal,
      FormData: class {
        get() {
          return 'test-token';
        }
      },
      fetch,
    },
  );
  return {
    events,
    button,
    id,
    submit: () => submit({ preventDefault() {} }),
    destination: () => destination,
  };
}

test('successful quote can be restored and submitted again', async () => {
  const page = client(async () => Response.json({ ok: true }));
  const originalId = page.id.value;
  await page.submit();
  assert.equal(page.destination(), '/quote-success');
  page.events.pageshow({ persisted: true });
  assert.equal(page.button.disabled, false);
  assert.equal(page.button.textContent, 'Request My Free Quote');
  assert.notEqual(page.id.value, originalId);
});

test('a response from a departed page cannot redirect the restored page', async () => {
  let complete;
  const page = client(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  const originalId = page.id.value;
  const pending = page.submit();
  page.events.pagehide();
  page.events.pageshow({ persisted: true });
  complete(Response.json({ ok: true }));
  await pending;
  assert.equal(page.destination(), undefined);
  assert.equal(page.button.disabled, false);
  assert.equal(page.id.value, originalId);
});
