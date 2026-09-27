import { pathToFileURL } from 'node:url';
import { assertHeaders, assertSecurityHeaders } from './integrity-contract.mjs';

export async function verifyIntegrity({
  expected,
  candidate = false,
  fetcher = fetch,
  wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  now = Date.now,
  log = console.log,
} = {}) {
  if (!/^[a-f0-9]{40}$/.test(expected ?? ''))
    throw Error('An exact expected revision is required');
  const origins = candidate
    ? ['http://127.0.0.1:4321']
    : ['https://cleaningbycassi.com', 'https://www.cleaningbycassi.com'];
  const routes = [
    '/',
    '/about',
    '/services',
    '/pricing',
    '/quote',
    '/quote-success',
    '/review',
    '/privacy',
  ];
  const request = (origin, path, options = {}) => {
    const url = new URL(path, origin);
    url.searchParams.set('_integrity', expected + '-' + now());
    return fetcher(url, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store', Pragma: 'no-cache' },
      signal: AbortSignal.timeout(15000),
      redirect: 'error',
      ...options,
    });
  };
  const revision = async (origin) => {
    const response = await request(origin, '/api/release');
    if (!response.ok || (await response.json()).revision !== expected)
      throw Error('Production revision differs from expected main');
  };
  for (const origin of origins) {
    let consecutive = 0;
    const required = candidate ? 1 : 3;
    const deadline = now() + 120000;
    while (consecutive < required && now() < deadline) {
      try {
        await revision(origin);
        consecutive++;
      } catch {
        consecutive = 0;
      }
      if (candidate && consecutive === 0)
        throw Error('Candidate revision mismatch');
      if (consecutive < required) await wait(2000);
    }
    if (consecutive < required)
      throw Error('Production revision did not stabilize');
    for (const route of routes) {
      const response = await request(origin, route);
      if (
        !response.ok ||
        !response.headers.get('content-type')?.includes('text/html')
      )
        throw Error(route + ': expected successful HTML response');
      assertHeaders(response.headers, { candidate });
      const html = await response.text();
      if (!candidate && /localhost|127\.0\.0\.1|workers\.dev/i.test(html))
        throw Error(route + ': development host leakage');
      if (route === '/quote' && !html.includes('0x4AAAAAAEmmOovf3yTuy_Ua'))
        throw Error('Wrong Turnstile widget');
      if (
        route === '/quote-success' &&
        !/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(
          html,
        )
      )
        throw Error('Receipt must not be indexed');
    }
    const status = await request(origin, '/api/status');
    assertHeaders(status.headers, { status: true });
    const release = await request(origin, '/api/release');
    assertHeaders(release.headers, { candidate });
    // Read-only error path: never submit a quote or send mail.
    const missing = await request(origin, '/__integrity_missing_page');
    if (missing.status !== 404) throw Error('Missing route must return 404');
    assertHeaders(missing.headers, { candidate });
    for (const path of [
      '/navigation.js',
      '/header-logo-optimized.webp',
      '/robots.txt',
      '/sitemap-index.xml',
    ]) {
      const asset = await request(origin, path);
      if (!asset.ok) throw Error(path + ': asset unavailable');
      assertSecurityHeaders(asset.headers);
    }
    const data = await status.json();
    if (
      !(candidate
        ? (status.status === 503 && data.ok === false) ||
          (status.status === 200 && data.ok === true)
        : status.status === 200 && data.ok === true) ||
      data.scope !== 'configuration-readiness'
    )
      throw Error('Readiness degraded');
    if (!candidate) {
      const redirect = await fetcher(origin.replace('https:', 'http:') + '/', {
        redirect: 'manual',
        signal: AbortSignal.timeout(15000),
      });
      if (
        ![301, 302, 307, 308].includes(redirect.status) ||
        !origins.some(
          (allowed) => redirect.headers.get('location') === allowed + '/',
        )
      )
        throw Error('Invalid HTTPS redirect');
    }
    await revision(origin);
    log(
      `${candidate ? 'Candidate' : 'Production'} integrity passed: ` +
        origin +
        '; revision ' +
        expected,
    );
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.some((arg) => arg !== '--candidate'))
    throw Error('Only --candidate is supported; production is the default');
  await verifyIntegrity({
    expected: process.env.EXPECTED_REVISION,
    candidate: args.includes('--candidate'),
  });
}
