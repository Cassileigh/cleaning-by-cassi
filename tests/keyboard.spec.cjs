const { test, expect } = require('@playwright/test');
const origin = 'http://127.0.0.1:4321';
function tabKey(browserName, reverse = false) {
  return `${reverse ? 'Shift+' : ''}${browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+' : ''}Tab`;
}
async function tabTo(page, target, browserName) {
  for (let i = 0; i < 90; i++) {
    await page.keyboard.press(tabKey(browserName));
    if (await target.evaluate((el) => el === document.activeElement)) return;
  }
  throw new Error('Control unreachable by keyboard');
}
async function visibleFocus(target) {
  await expect(target).toBeFocused();
  await expect(target).toBeInViewport();
  expect(
    await target.evaluate((el) => {
      const style = getComputedStyle(el);
      return (
        el.matches(':focus-visible') &&
        style.outlineStyle !== 'none' &&
        parseFloat(style.outlineWidth) > 0
      );
    }),
  ).toBe(true);
}
for (const theme of ['light', 'dark']) {
  for (const route of [
    '/',
    '/about',
    '/services',
    '/pricing',
    '/quote',
    '/quote-success',
    '/review',
    '/privacy',
  ]) {
    test(`${theme} keyboard header and skip link on ${route}`, async ({
      page,
      browserName,
    }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(origin + route);
      await page.keyboard.press(tabKey(browserName));
      await visibleFocus(page.locator('.skip-link'));
      await page.keyboard.press('Enter');
      await expect(page.locator('main')).toBeFocused();
      await page.goto(origin + route);
      const quote = page.locator('.internal-links a[href="/quote"]');
      await tabTo(page, quote, browserName);
      await visibleFocus(quote);
      await page.keyboard.press(tabKey(browserName, true));
      await visibleFocus(page.locator('.internal-links a[href="/pricing"]'));
      await page.keyboard.press(tabKey(browserName));
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/quote\/?$/);
    });
  }
  test(`${theme} quote can be completed and retried using only keyboard`, async ({
    page,
    browserName,
  }) => {
    let requests = 0;
    await page.emulateMedia({ colorScheme: theme });
    await page.route('https://challenges.cloudflare.com/**', (route) =>
      route.fulfill({
        contentType: 'application/javascript',
        body: `window.turnstile = { render(el) { const input = document.createElement('input'); input.type = 'hidden'; input.name = 'cf-turnstile-response'; input.value = 'test-token'; el.append(input); return 'mock'; }, reset() {}, remove() {} }; window.cleaningByCassiTurnstileLoad();`,
      }),
    );
    await page.route('**/api/quote', (route) => {
      requests++;
      return route.fulfill({
        status: requests === 1 ? 502 : 200,
        contentType: 'application/json',
        body: requests === 1 ? '{"error":"Please retry."}' : '{"ok":true}',
      });
    });
    await page.goto(origin + '/quote');
    for (const [name, value] of [
      ['name', 'Test Person'],
      ['email', 'person@example.com'],
      ['phone', '9205550123'],
    ]) {
      const field = page.locator(`[name="${name}"]`);
      await tabTo(page, field, browserName);
      await visibleFocus(field);
      await page.keyboard.type(value);
    }
    const button = page.locator('#quote-submit');
    await tabTo(page, button, browserName);
    await visibleFocus(button);
    await page.keyboard.press('Enter');
    await expect(page.locator('#form-status')).toContainText('Please retry.');
    await expect(button).toBeEnabled();
    await expect(page.locator('[name="name"]')).toHaveValue('Test Person');
    // Reacquire through real Tab traversal if the disabled button lost focus.
    if (!(await button.evaluate((el) => document.activeElement === el)))
      await tabTo(page, button, browserName);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/quote-success/);
    expect(requests).toBe(2);
  });
}
