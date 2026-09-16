import { assertHeaders } from './integrity-contract.mjs';

const expected = process.env.EXPECTED_REVISION;
if (!/^[a-f0-9]{40}$/.test(expected ?? ''))
  throw Error('An exact expected revision is required');
const origins = [
  'https://cleaningbycassi.com',
  'https://www.cleaningbycassi.com',
];
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
  url.searchParams.set('_integrity', expected + '-' + Date.now());
  return fetch(url, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache, no-store', Pragma: 'no-cache' },
    signal: AbortSignal.timeout(15000),
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
  const deadline = Date.now() + 120000;
  while (consecutive < 3 && Date.now() < deadline) {
    try {
      await revision(origin);
      consecutive++;
    } catch {
      consecutive = 0;
    }
    if (consecutive < 3)
      await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  if (consecutive < 3) throw Error('Production revision did not stabilize');
  for (const route of routes) {
    const response = await request(origin, route);
    if (
      !response.ok ||
      !response.headers.get('content-type')?.includes('text/html')
    )
      throw Error(route + ': expected successful HTML response');
    assertHeaders(response.headers);
    const html = await response.text();
    if (/localhost|127\.0\.0\.1|workers\.dev/i.test(html))
      throw Error(route + ': development host leakage');
    if (route === '/quote' && !html.includes('0x4AAAAAAEmmOovf3yTuy_Ua'))
      throw Error('Wrong Turnstile widget');
    if (
      route === '/quote-success' &&
      !/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
    )
      throw Error('Receipt must not be indexed');
  }
  const status = await request(origin, '/api/status');
  assertHeaders(status.headers, { status: true });
  const data = await status.json();
  if (
    !status.ok ||
    data.ok !== true ||
    data.scope !== 'configuration-readiness'
  )
    throw Error('Readiness degraded');
  for (const path of ['/robots.txt', '/sitemap-index.xml'])
    if (!(await request(origin, path)).ok) throw Error(path + ': unavailable');
  const redirect = await fetch(origin.replace('https:', 'http:') + '/', {
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
  await revision(origin);
  console.log(
    'Production integrity passed: ' + origin + '; revision ' + expected,
  );
}
