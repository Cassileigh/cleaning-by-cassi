import { secure } from './security';
import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import type { ApplicationBindings } from './bindings';

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 8;
const MAX_TRACKED_IPS = 5_000;
const attempts = new Map<string, number[]>();

const json = (
  body: Record<string, unknown>,
  status: number,
  requestId: string,
) =>
  secure(
    new Response(JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Request-ID': requestId,
        ...(status === 429
          ? { 'Retry-After': String(Math.ceil(RATE_WINDOW_MS / 1000)) }
          : {}),
      },
    }),
  );

const pruneAttempts = (now: number) => {
  for (const [ip, timestamps] of attempts) {
    const recent = timestamps.filter(
      (timestamp) => now - timestamp < RATE_WINDOW_MS,
    );
    if (recent.length === 0) attempts.delete(ip);
    else attempts.set(ip, recent);
  }
};

export const onRequest = defineMiddleware(async ({ request }, next) => {
  const requestUrl = new URL(request.url);
  const pathname = requestUrl.pathname.replace(/\/+$/, '');
  if (request.method === 'POST' && pathname === '/api/quote') {
    const requestId = `CBC-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const now = Date.now();
    const recent = (attempts.get(ip) ?? []).filter(
      (timestamp) => now - timestamp < RATE_WINDOW_MS,
    );

    if (attempts.size >= MAX_TRACKED_IPS) pruneAttempts(now);
    if (recent.length >= RATE_LIMIT) {
      return json(
        {
          error: 'Too many quote requests. Please try again later.',
          code: 'rate-limited',
          requestId,
        },
        429,
        requestId,
      );
    }

    // Never evict an active limit to admit a new address. This is an isolate-local safety net, not distributed enforcement.
    if (!attempts.has(ip) && attempts.size >= MAX_TRACKED_IPS) {
      return json(
        {
          error:
            'Quote requests are temporarily busy. Please try again later or email Cassi.',
          code: 'rate-limited',
          requestId,
        },
        429,
        requestId,
      );
    }

    recent.push(now);
    attempts.set(ip, recent);
    const bindings: ApplicationBindings = env;
    try {
      // Cloudflare shares counters within an edge location, across isolates.
      // A missing binding is a configuration error, never a silent bypass.
      if (!bindings.QUOTE_RATE_LIMITER) throw new Error('Missing rate limiter');
      const result = await bindings.QUOTE_RATE_LIMITER.limit({
        key: `quote:${ip}`,
      });
      if (result.success !== true)
        return json(
          {
            error: 'Too many quote requests. Please try again later.',
            code: 'rate-limited',
            requestId,
          },
          429,
          requestId,
        );
    } catch {
      return json(
        {
          error:
            'Quote requests are temporarily unavailable. Please try again later or email Cassi.',
          code: 'rate-limit-unavailable',
          requestId,
        },
        503,
        requestId,
      );
    }
  }

  return secure(
    await next(),
    pathname === '/api/status',
    requestUrl.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(requestUrl.hostname),
  );
});
