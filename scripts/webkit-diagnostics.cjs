const { webkit } = require('@playwright/test');
const deadline = setTimeout(() => process.exit(1), 120000);
(async () => {
  const origin = 'http://127.0.0.1:4321';
  for (const mode of [
    'baseline',
    'without-css',
    'without-js',
    'without-headers',
  ]) {
    const browser = await webkit.launch();
    const page = await browser.newPage();
    page.on('response', (response) =>
      console.log(mode, response.status(), response.url()),
    );
    page.on('requestfailed', (request) =>
      console.log(mode, request.failure(), request.url()),
    );
    page.on('pageerror', (error) => console.log(mode, error.message));
    await page.route('**/*', async (route) => {
      if (
        mode === 'without-css' &&
        route.request().resourceType() === 'stylesheet'
      )
        return route.fulfill({ contentType: 'text/css', body: '' });
      if (mode === 'without-js' && route.request().resourceType() === 'script')
        return route.fulfill({
          contentType: 'application/javascript',
          body: '',
        });
      if (
        mode === 'without-headers' &&
        route.request().resourceType() === 'document'
      ) {
        const response = await route.fetch();
        return route.fulfill({
          status: response.status(),
          headers: { 'content-type': 'text/html' },
          body: await response.body(),
        });
      }
      return route.continue();
    });
    try {
      await page.goto(origin, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });
      console.log(mode, 'INTERACTIVE');
    } catch (error) {
      console.log(mode, error.message);
    }
    await browser.close();
  }
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => clearTimeout(deadline));
