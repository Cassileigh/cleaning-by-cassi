const { test, expect } = require('@playwright/test');
const axe = require('axe-core');

const baseURL = 'http://127.0.0.1:4321';
const routes = [
  '/',
  '/services/',
  '/pricing/',
  '/about/',
  '/quote/',
  '/quote-success/',
  '/review/',
  '/privacy/',
];
const themes = ['light', 'dark'];
test.use({ screenshot: 'only-on-failure', trace: 'retain-on-failure' });

for (const theme of themes) {
  for (const route of routes) {
    test(`${theme} theme: ${route}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);
      await page.evaluate(axe.source);

      const results = await page.evaluate(async () =>
        window.axe.run(document, {
          runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        }),
      );

      expect(
        results.violations,
        `${theme} accessibility violations: ${JSON.stringify(results.violations)}`,
      ).toEqual([]);
    });
  }
}
