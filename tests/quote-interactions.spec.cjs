const { test, expect } = require('@playwright/test');
test.use({ screenshot: 'only-on-failure', trace: 'retain-on-failure' });

async function prepare(page) {
  // Entire verification/provider boundary is mocked. These tests cannot send email.
  await page.route('https://challenges.cloudflare.com/**', route => route.fulfill({
    contentType: 'application/javascript',
    body: `window.turnstile = {
      render(el) {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = 'cf-turnstile-response'; input.value = 'test-token';
        el.append(input); return 'test-widget';
      },
      reset() { window.resetCount = (window.resetCount || 0) + 1; document.querySelector('[name="cf-turnstile-response"]').value = ''; },
      remove() {}
    }; window.cleaningByCassiTurnstileLoad();`
  }));
  await page.goto('http://127.0.0.1:4321/quote');
  await page.locator('[name="name"]').fill('Test Person');
  await page.locator('[name="email"]').fill('person@example.com');
  await page.locator('[name="phone"]').fill('9205550123');
  await expect(page.locator('[name="cf-turnstile-response"]')).toHaveValue('test-token');
  await expect(page.locator('.internal-links [aria-current="page"]')).toHaveText('Get a Quote');
}

for (const failure of ['provider', 'malformed']) {
  test(`Quote retry after ${failure} failure`, async ({ page }) => {
    let requests = 0;
    await page.route('**/api/quote', route => {
      requests++;
      return route.fulfill({ status: requests === 1 && failure === 'provider' ? 502 : 200,
        contentType: 'application/json',
        body: requests > 1 ? '{"ok":true}' : failure === 'provider' ? '{"error":"Please retry."}' : 'null' });
    });
    await prepare(page);
    await page.locator('#quote-submit').click();
    await expect(page.locator('#form-status')).toContainText(failure === 'provider' ? 'Please retry.' : 'could not be confirmed');
    await expect(page.locator('#quote-submit')).toBeEnabled();
    await expect(page.locator('[name="phone"]')).toHaveValue('9205550123');
    expect(await page.evaluate(() => window.resetCount)).toBe(1);
    await page.locator('#quote-submit').click();
    await expect(page.locator('#form-status')).toContainText('complete the security check');
    expect(requests).toBe(1);
    await page.locator('[name="cf-turnstile-response"]').evaluate(el => { el.value = 'fresh-token'; });
    await page.locator('#quote-submit').click();
    await expect(page).toHaveURL(/quote-success/);
    expect(requests).toBe(2);
  });
}

test('A stalled quote request times out and restores the form', async ({ page }) => {
  await page.addInitScript(() => {
    const timeout = AbortSignal.timeout.bind(AbortSignal);
    AbortSignal.timeout = ms => timeout(ms === 40000 ? 100 : ms);
  });
  await page.route('**/api/quote', async route => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await route.fulfill({ contentType: 'application/json', body: '{"ok":true}' }).catch(() => {});
  });
  await prepare(page);
  await page.locator('#quote-submit').click();
  await expect(page.locator('#form-status')).toContainText('timed out');
  await expect(page.locator('#quote-submit')).toBeEnabled();
  await expect(page.locator('[name="name"]')).toHaveValue('Test Person');
  expect(await page.evaluate(() => window.resetCount)).toBe(1);
});
