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
