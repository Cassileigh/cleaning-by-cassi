import { defineMiddleware } from 'astro:middleware';

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 8;
const MAX_TRACKED_IPS = 5_000;
const attempts = new Map<string, number[]>();

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "connect-src 'self' https://challenges.cloudflare.com",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = {
  'Content-Security-Policy': contentSecurityPolicy,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

const secure = (response: Response) => {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const json = (body: Record<string, unknown>, status: number, requestId: string) =>
  secure(new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Request-ID': requestId,
    },
  }));

const pruneAttempts = (now: number) => {
  for (const [ip, timestamps] of attempts) {
    const recent = timestamps.filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
    if (recent.length === 0) attempts.delete(ip);
    else attempts.set(ip, recent);
  }
};

export const onRequest = defineMiddleware(async ({ request }, next) => {
  const requestUrl = new URL(request.url);
  if (request.method === 'POST' && requestUrl.pathname === '/api/quote') {
    const requestId = `CBC-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const now = Date.now();
    const recent = (attempts.get(ip) ?? []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);

    if (attempts.size > MAX_TRACKED_IPS) pruneAttempts(now);
    if (recent.length >= RATE_LIMIT) {
      return json({
        error: 'Too many quote requests. Please try again later.',
        code: 'rate-limited',
        requestId,
      }, 429, requestId);
    }

    recent.push(now);
    attempts.set(ip, recent);
  }

  return secure(await next());
});
