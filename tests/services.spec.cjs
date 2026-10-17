const { test, expect } = require('@playwright/test');
const axe = require('axe-core');

const origin = 'http://127.0.0.1:4321';
const rotation = (star) =>
  star.evaluate((element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI);
  });

for (const colorScheme of ['light', 'dark']) {
  for (const width of [320, 768, 1440]) {
    test(`independent add-on disclosures at ${width}px in ${colorScheme}`, async ({
      page,
      browserName,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await page.addInitScript({ content: axe.source });
      await page.goto(`${origin}/services`);

      const disclosures = page.locator('.addons-details');
      const cards = disclosures.locator('.addon-card');
      await expect(disclosures).toHaveCount(12);
      await expect(cards).toHaveCount(12);
      await expect(
        page.getByText('View all add-on services', { exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByText('Wall Spot Cleaning', { exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByText('Every 3 Weeks', { exact: true }),
      ).toHaveCount(0);
      for (const disclosure of await disclosures.all()) {
        await expect(disclosure).not.toHaveAttribute('open');
        await expect(disclosure.locator('.addon-card')).toBeHidden();
        const summary = disclosure.locator('summary');
        expect((await summary.boundingBox()).height).toBeGreaterThanOrEqual(44);
        await expect(summary.locator('.addon-star')).toHaveAttribute(
          'aria-hidden',
          'true',
        );
        await expect(summary.locator('.addon-icon')).toBeVisible();
        await expect(summary.locator('.addon-icon')).toHaveAttribute(
          'aria-hidden',
          'true',
        );
        expect(
          await summary.evaluate((element) =>
            [...element.children].map((child) => child.className),
          ),
        ).toEqual(['addon-star', 'addon-icon', 'addon-label']);
      }

      const first = disclosures.nth(0);
      const second = disclosures.nth(1);
      const summary = first.locator('summary');
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
      await expect(first).toHaveAttribute('open', '');
      await expect(first.locator('.addon-card')).toBeVisible();
      await expect(second).not.toHaveAttribute('open');
      await expect(second.locator('.addon-card')).toBeHidden();
      expect(await rotation(summary.locator('.addon-star'))).toBe(-90);
      expect(
        await summary
          .locator('.addon-star')
          .evaluate((element) => getComputedStyle(element).transitionDuration),
      ).toBe('0s');
      if (width >= 768) {
        const closed = await second.boundingBox();
        const closedSummary = await second.locator('summary').boundingBox();
        expect(Math.abs(closed.height - closedSummary.height - 2)).toBeLessThan(
          1,
        );
      }

      await page.keyboard.press(tabKey);
      await expect(second.locator('summary')).toBeFocused();
      await page.keyboard.press('Space');
      await expect(second).toHaveAttribute('open', '');
      await expect(first).toHaveAttribute('open', '');
      await page.keyboard.press('Space');
      await expect(second).not.toHaveAttribute('open');
      await expect(first).toHaveAttribute('open', '');
      await page.keyboard.press(`Shift+${tabKey}`);
      await expect(summary).toBeFocused();
      await page.keyboard.press('Space');
      await expect(first).not.toHaveAttribute('open');
      expect(await rotation(summary.locator('.addon-star'))).toBe(0);
      const collapsed = await page.evaluate(() =>
        window.axe.run(document, {
          runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        }),
      );
      expect(collapsed.violations).toEqual([]);

      for (const disclosure of await disclosures.all()) {
        const label = await disclosure
          .locator('summary .addon-label')
          .innerText();
        await disclosure.locator('summary').click();
        await expect(disclosure).toHaveAttribute('open', '');
        await expect(disclosure.locator('.addon-card')).toBeVisible();
        await expect(disclosure.getByText(label, { exact: true })).toHaveCount(
          1,
        );
        await expect(disclosure.locator('.addon-card h3')).toHaveCount(0);
        await expect(disclosure.locator('.addon-card p')).not.toHaveText('');
      }
      await expect(
        page.getByText(
          'Laundry service includes washing, drying, and folding only.',
          { exact: true },
        ),
      ).toBeVisible();
      await expect(
        page.getByText(
          'Clean sheets must be provided and left out. Please remove soiled sheets before arrival.',
          { exact: true },
        ),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const expanded = await page.evaluate(() =>
        window.axe.run(document, {
          runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        }),
      );
      expect(expanded.violations).toEqual([]);
    });
  }

  test(`star rotates counterclockwise on open and returns clockwise on close in ${colorScheme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'no-preference' });
    await page.goto(`${origin}/services`);
    const disclosure = page.locator('.addons-details').first();
    const summary = disclosure.locator('summary');
    const star = summary.locator('.addon-star');
    expect(await rotation(star)).toBe(0);
    const transition = await star.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        property: style.transitionProperty,
        duration: parseFloat(style.transitionDuration),
      };
    });
    expect(transition.property).toContain('transform');
    expect(transition.duration).toBeGreaterThan(0);
    await summary.click();
    await expect.poll(() => rotation(star)).toBe(-90);
    await summary.click();
    await expect.poll(() => rotation(star)).toBe(0);
  });
}
