const { test, expect } = require('@playwright/test');
const axe = require('axe-core');
const origin = 'http://127.0.0.1:4321';
const tabKey = (browserName, reverse = false) =>
  `${reverse ? 'Shift+' : ''}${browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+' : ''}Tab`;

for (const colorScheme of ['light', 'dark']) {
  for (const width of [320, 768, 1440]) {
    test(`customer palette at ${width}px in ${colorScheme}`, async ({
      page,
      browserName,
    }) => {
      await page.setViewportSize({ width, height: width === 320 ? 568 : 900 });
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await page.addInitScript({ content: axe.source });
      await page.goto(`${origin}/services`);
      const trigger = page.getByRole('button', {
        name: /^Quick links/,
      });
      await expect(trigger).toBeInViewport();
      await expect(trigger).toContainText('Quick links');
      // Check the trigger while it is exposed; a modal makes the header inert.
      const triggerViolations = await page.evaluate(
        async () =>
          (
            await axe.run('.command-trigger', {
              runOnly: {
                type: 'rule',
                values: ['label-content-name-mismatch'],
              },
            })
          ).violations,
      );
      expect(triggerViolations).toEqual([]);
      expect((await trigger.boundingBox()).height).toBeGreaterThanOrEqual(44);
      const scroll = await page.evaluate(() => scrollY);
      await trigger.click();
      const dialog = page.locator('#cleaning-palette');
      const input = page.getByRole('combobox', {
        name: 'What are you looking for?',
      });
      const options = dialog.getByRole('option');
      const close = page.getByRole('button', { name: 'Close command palette' });
      await expect(dialog).toBeVisible();
      await expect(input).toBeFocused();
      await expect(options).toHaveCount(10);
      const commands = await dialog.evaluate(
        (element) => JSON.parse(element.dataset.commandPalette).commands,
      );
      expect(commands.map(({ href }) => href)).toEqual([
        '/quote',
        '/services',
        '/pricing',
        '/pricing#add-on-pricing',
        '/about',
        '/',
        '/#contact',
        '/review',
        '/privacy',
        '/terms',
      ]);
      expect(commands.every(({ action }) => action === 'navigate')).toBe(true);
      const panel = await dialog
        .locator('.cleaning-palette-panel')
        .boundingBox();
      const viewport = page.viewportSize();
      expect(panel.x).toBeGreaterThanOrEqual(0);
      expect(panel.y).toBeGreaterThanOrEqual(0);
      expect(panel.x + panel.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(panel.y + panel.height).toBeLessThanOrEqual(viewport.height + 1);
      expect(
        await dialog
          .locator('#cleaning-palette-results')
          .evaluate((element) => element.scrollWidth <= element.clientWidth),
      ).toBe(true);
      const violations = await page.evaluate(
        async () =>
          (
            await axe.run(document, {
              runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
              },
            })
          ).violations,
      );
      expect(violations).toEqual([]);
      await page.keyboard.press(tabKey(browserName));
      await expect(options.first()).toBeFocused();
      await options.last().focus();
      await page.keyboard.press(tabKey(browserName));
      await expect(close).toBeFocused();
      await page.keyboard.press(tabKey(browserName, true));
      await expect(options.last()).toBeFocused();
      await input.fill('zzzz-not-a-cleaning-command');
      await expect(dialog.locator('.palette__empty')).toHaveText(
        'No matching command.',
      );
      await expect(input).toHaveAttribute('aria-activedescendant', '');
      await input.press('Enter');
      await expect(page).toHaveURL(`${origin}/services`);
      await input.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      expect(await page.evaluate(() => scrollY)).toBe(scroll);
      await page.keyboard.press('Control+k');
      await expect(input).toBeFocused();
      await input.fill('laundry');
      await expect(options).toHaveCount(1);
      await expect(options.first()).toContainText('Add-On Starting Prices');
      await input.press('Enter');
      await expect(page).toHaveURL(`${origin}/pricing#add-on-pricing`);
      await expect(page.locator('#add-on-pricing')).toBeInViewport();
    });
  }
}

for (const shortcut of ['Control+k', 'Meta+k']) {
  test(`${shortcut} opens and dismisses without changing quote input`, async ({
    page,
  }) => {
    let submissions = 0;
    await page.route('https://challenges.cloudflare.com/**', (route) =>
      route.fulfill({
        contentType: 'application/javascript',
        body: 'window.turnstile = {render(){return "mock"},reset(){},remove(){}}; window.cleaningByCassiTurnstileLoad();',
      }),
    );
    await page.route('**/api/quote', (route) => {
      submissions++;
      return route.fulfill({ status: 500, body: 'Unexpected test submission' });
    });
    await page.goto(`${origin}/quote`);
    const name = page.locator('[name="name"]');
    await name.fill('Sample home');
    await name.press('k');
    await expect(page.locator('#cleaning-palette')).toBeHidden();
    await page.keyboard.press(shortcut);
    const input = page.locator('#cleaning-palette-input');
    await expect(input).toBeFocused();
    await input.fill('prices');
    await page.keyboard.press('Escape');
    await expect(name).toBeFocused();
    await expect(name).toHaveValue('Sample homek');
    expect(submissions).toBe(0);
    await page.getByRole('button', { name: /^Quick links/ }).click();
    await page.getByRole('button', { name: 'Close command palette' }).click();
    await expect(
      page.getByRole('button', { name: /^Quick links/ }),
    ).toBeFocused();
    await page.keyboard.press(shortcut);
    await page
      .locator('.cleaning-palette-backdrop')
      .click({ position: { x: 2, y: 2 } });
    await expect(page.locator('#cleaning-palette')).toBeHidden();
    expect(submissions).toBe(0);
  });
}

test('arrow selection and Tab activation use the customer destinations', async ({
  page,
  browserName,
}) => {
  await page.goto(`${origin}/about`);
  await page.getByRole('button', { name: /^Quick links/ }).click();
  const options = page.locator('#cleaning-palette-results button');
  await page.keyboard.press('ArrowDown');
  await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowUp');
  await expect(options.first()).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press(tabKey(browserName));
  await page.keyboard.press(tabKey(browserName));
  await expect(options.nth(1)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`${origin}/services`);
});
