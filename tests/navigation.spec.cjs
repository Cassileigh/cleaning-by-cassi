const { test, expect } = require('@playwright/test');
const origin = 'http://127.0.0.1:4321';
test('Internal links lead to real pages and skip navigation works', async ({
  page,
  request,
}) => {
  const visited = new Set();
  const pending = ['/'];
  while (pending.length) {
    const path = pending.shift();
    if (visited.has(path)) continue;
    visited.add(path);
    await page.goto(origin + path);
    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((links) => links.map((a) => a.getAttribute('href')));
    for (const href of hrefs.filter(
      (h) => h.startsWith('/') && !h.startsWith('//'),
    )) {
      const target = new URL(href, origin).pathname;
      expect((await request.get(origin + target)).status(), target).toBe(200);
      if (!visited.has(target)) pending.push(target);
    }
  }
  await page.goto(origin);
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('Small-screen quote tab remains visible alongside logo and Facebook', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto(origin + '/quote');
  const active = page.locator('.internal-links [aria-current="page"]');
  await expect(active).toBeInViewport();
  await expect(page.locator('.facebook-link')).toBeInViewport();
  await expect(page.locator('.brand-logo')).toBeInViewport();
});
