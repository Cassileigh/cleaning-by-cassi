const { test, expect } = require('@playwright/test');
const axe = require('axe-core');

const origin = 'http://127.0.0.1:4321';

for (const colorScheme of ['light', 'dark']) {
  for (const width of [320, 768, 1440]) {
    test(`add-on disclosure at ${width}px in ${colorScheme}`, async ({
      page,
      browserName,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await page.addInitScript({ content: axe.source });
      await page.goto(`${origin}/services`);

      const summary = page.getByText('View all add-on services', {
        exact: true,
      });
      const disclosure = page.locator('.addons-details');
      const cards = disclosure.locator('.addon-card');
      await expect(disclosure).not.toHaveAttribute('open');
      await expect(cards.first()).toBeHidden();
      await expect(
        page.getByText('Wall Spot Cleaning', { exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByText('Every 3 Weeks', { exact: true }),
      ).toHaveCount(0);

      const tabKey =
        browserName === 'webkit' && process.platform === 'darwin'
          ? 'Alt+Tab'
          : 'Tab';
      for (let count = 0; count < 60; count++) {
        await page.keyboard.press(tabKey);
        if (
          await summary.evaluate(
            (element) => element === document.activeElement,
          )
        )
          break;
      }
      await expect(summary).toBeFocused();
      await expect(summary).toBeInViewport();
      expect(
        await summary.evaluate((element) => {
          const style = getComputedStyle(element);
          return (
            element.matches(':focus-visible') &&
            style.outlineStyle !== 'none' &&
            parseFloat(style.outlineWidth) > 0
          );
        }),
      ).toBe(true);

      await page.keyboard.press('Enter');
      await expect(disclosure).toHaveAttribute('open', '');
      await expect(cards).toHaveCount(12);
      for (const card of await cards.all()) await expect(card).toBeVisible();
      await expect(
        disclosure.getByRole('heading', { name: 'Laundry', exact: true }),
      ).toBeVisible();
      await expect(
        disclosure.getByText(
          'Laundry service includes washing, drying, and folding only.',
          { exact: true },
        ),
      ).toBeVisible();
      await expect(
        disclosure.getByText(
          'Clean sheets must be provided and left out. Please remove soiled sheets before arrival.',
          { exact: true },
        ),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const results = await page.evaluate(() =>
        window.axe.run(document, {
          runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        }),
      );
      expect(results.violations).toEqual([]);

      await page.keyboard.press('Space');
      await expect(disclosure).not.toHaveAttribute('open');
      await expect(cards.first()).toBeHidden();
    });
  }
}
