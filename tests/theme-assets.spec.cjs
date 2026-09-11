const { test, expect } = require('@playwright/test');

const routes = ['/', '/about/', '/services/', '/pricing/', '/quote/', '/quote-success/'];
for (const width of [390, 1280]) {
  for (const theme of ['light', 'dark']) {
    for (const route of routes) {
      test(`${route} images and ${theme} appearance at ${width}px`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
        const response = await page.goto(`http://127.0.0.1:4321${route}`);
        expect(response.status()).toBe(200);
        const broken = await page.locator('img').evaluateAll(async images => {
          return (await Promise.all(images.map(async image => {
            image.loading = 'eager';
            try { await image.decode(); } catch { return image.currentSrc || image.src; }
            return image.naturalWidth > 0 ? null : image.src;
          }))).filter(Boolean);
        });
        expect(broken, 'Every visible image must decode, including the header logo').toEqual([]);
        await expect(page.locator('header .brand-logo')).toBeVisible();
        expect(await page.locator('main').count()).toBe(1);
        if (route === '/') {
          const appearance = () => page.evaluate(() => ({
            body: getComputedStyle(document.body).backgroundColor,
            main: getComputedStyle(document.querySelector('main')).backgroundColor,
            heading: getComputedStyle(document.querySelector('h1')).color,
            text: getComputedStyle(document.body).color,
          }));
          const initial = await appearance();
          expect(initial.heading).toBe(initial.text);
          await page.screenshot({ path: testInfo.outputPath(`home-${theme}-${width}.png`), fullPage: true });
          await page.emulateMedia({ colorScheme: theme === 'light' ? 'dark' : 'light' });
          await expect.poll(appearance).not.toEqual(initial);
          const changed = await appearance();
          expect(changed.body).not.toBe(initial.body);
          expect(changed.main).not.toBe(initial.main);
          expect(changed.heading).not.toBe(initial.heading);
          expect(changed.heading).toBe(changed.text);
        }
      });
    }
  }
}

// Check the actual scroll container, not only document overflow (which body CSS can hide).
for (const width of [320, 520, 768, 860, 900, 1024, 1280]) {
  test(`Header containment and hero visibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:4321/');
    const nav = page.locator('.internal-links');
    const bounds = await nav.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    const logo = await page.locator('.brand').boundingBox();
    const facebook = page.locator('.facebook-link');
    await expect(facebook).toBeVisible();
    const social = await facebook.boundingBox();
    expect(logo.x).toBeGreaterThanOrEqual(0);
    expect(logo.x + logo.width).toBeLessThanOrEqual(bounds.x);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(social.x);
    expect(social.x + social.width).toBeLessThanOrEqual(width);
    expect(Math.abs(logo.y + logo.height / 2 - bounds.y - bounds.height / 2)).toBeLessThanOrEqual(1);
    expect(Math.abs(social.y + social.height / 2 - bounds.y - bounds.height / 2)).toBeLessThanOrEqual(1);
    const rows = await nav.locator('a').evaluateAll(links => links.map(a => Math.round(a.getBoundingClientRect().top)));
    expect(new Set(rows).size).toBe(1);
    await nav.evaluate(el => { el.scrollLeft = el.scrollWidth; });
    const last = await nav.locator('a').last().boundingBox();
    expect(last.x).toBeGreaterThanOrEqual(bounds.x);
    expect(last.x + last.width).toBeLessThanOrEqual(bounds.x + bounds.width + 1);
    if (width <= 900) await expect(page.locator('.hero-art')).toBeHidden();
    else await expect(page.locator('.hero-art')).toBeVisible();
    await expect(page.locator('.client-card')).toBeVisible();
  });
}
