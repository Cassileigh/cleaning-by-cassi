const { Builder } = require('selenium-webdriver');
const safari = require('selenium-webdriver/safari');
const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');

(async () => {
  const deadline = setTimeout(() => {
    console.error('Safari exceeded its five-minute deadline');
    process.exit(1);
  }, 300000);
  console.log('Starting the macOS bundled Safari driver');
  const service = new safari.ServiceBuilder('/usr/bin/safaridriver').build();
  const server = await service.start();
  console.log('Creating Safari session');
  const driver = await new Builder()
    .forBrowser('safari')
    .usingServer(server)
    .withCapabilities({ pageLoadStrategy: 'eager' })
    .build();
  console.log('Safari session ready');
  await driver.manage().setTimeouts({ pageLoad: 30000, script: 10000 });
  try {
    for (const width of [768, 1280]) {
      await driver.manage().window().setRect({ width, height: 900 });
      for (const route of [
        '',
        'about',
        'services',
        'pricing',
        'quote',
        'quote-success',
        'review',
        'privacy',
      ]) {
        console.log(`Checking Safari ${width}px /${route}`);
        await driver.get(`http://127.0.0.1:4321/${route}`);
        await driver.executeScript(() => {
          for (const image of document.images) image.loading = 'eager';
        });
        await driver.wait(
          () =>
            driver.executeScript(() =>
              Array.from(document.images).every(
                (image) => image.complete && image.naturalWidth > 0,
              ),
            ),
          10000,
        );
        const state = await driver.executeScript(() => {
          const box = (selector) =>
            document.querySelector(selector).getBoundingClientRect();
          const logo = box('.brand-logo');
          const facebook = box('.facebook-link');
          const nav = box('.internal-links');
          const active = document
            .querySelector('.internal-links [aria-current="page"]')
            ?.getBoundingClientRect();
          return {
            title: document.title,
            main: Boolean(document.querySelector('main')),
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            logoVisible:
              logo.width > 0 && logo.left >= 0 && logo.right <= innerWidth,
            facebookVisible:
              facebook.width > 0 &&
              facebook.left >= 0 &&
              facebook.right <= innerWidth,
            sameRow: logo.top < nav.bottom && nav.top < logo.bottom,
            activeVisible:
              !active ||
              (active.left >= nav.left - 1 && active.right <= nav.right + 1),
          };
        });
        assert.ok(state.title && state.main, `${route}: page structure`);
        assert.equal(state.overflow, false, `${route}: overflow`);
        for (const key of [
          'logoVisible',
          'facebookVisible',
          'sameRow',
          'activeVisible',
        ])
          assert.ok(state[key], `${route}: ${key}`);
        console.log(`Safari ${width}px /${route}: passed`);
      }
    }
  } catch (error) {
    mkdirSync('test-results', { recursive: true });
    writeFileSync(
      'test-results/safari.png',
      await driver.takeScreenshot(),
      'base64',
    );
    throw error;
  } finally {
    try {
      await driver.quit();
    } finally {
      service.kill();
      clearTimeout(deadline);
    }
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
