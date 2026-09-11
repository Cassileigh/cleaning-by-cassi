import type { APIRoute } from 'astro';
import type { ApplicationBindings } from '../../bindings';
import { env } from 'cloudflare:workers';

export const prerender = false;

type CheckStatus = 'operational' | 'degraded';

type Check = {
  status: CheckStatus;
  detail: string;
};

const responseHeaders = {
  'Cache-Control': 'no-store, max-age=0',
  'Content-Security-Policy':
    "default-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
} as const;

const json = (
  body: Record<string, unknown>,
  status = 200,
  extraHeaders: HeadersInit = {},
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...responseHeaders,
      ...extraHeaders,
    },
  });

const hasBinding = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0;

const getStatus = () => {
  const bindings: ApplicationBindings = env;
  const protectionAvailable =
    hasBinding(bindings.TURNSTILE_SECRET) &&
    hasBinding(bindings.TURNSTILE_HOSTNAMES);
  const deliveryAvailable = hasBinding(bindings.RESEND_API_KEY);

  const checks: Record<string, Check> = {
    worker: {
      status: 'operational',
      detail: 'Production Worker is responding',
    },
    quote: {
      status: 'operational',
      detail: 'Quote handler is included in this application',
    },
    protection: {
      status: protectionAvailable ? 'operational' : 'degraded',
      detail: protectionAvailable
        ? 'Security verification is configured; provider availability is not checked'
        : 'Security verification configuration is incomplete',
    },
    delivery: {
      status: deliveryAvailable ? 'operational' : 'degraded',
      detail: deliveryAvailable
        ? 'Email service is configured; inbox delivery is not checked'
        : 'Email service configuration is incomplete',
    },
  };

  const values = Object.values(checks);
  const degraded = values.some((check) => check.status === 'degraded');
  const operational = values.filter(
    (check) => check.status === 'operational',
  ).length;

  return { checks, degraded, operational };
};

export const GET: APIRoute = async () => {
  const { checks, degraded, operational } = getStatus();

  return json(
    {
      ok: !degraded,
      scope: 'configuration-readiness',
      status: degraded ? 'degraded' : 'operational',
      checks,
      summary: `${operational} of ${Object.keys(checks).length} configuration checks passed`,
    },
    degraded ? 503 : 200,
  );
};

export const HEAD: APIRoute = async () => {
  const { degraded } = getStatus();
  return new Response(null, {
    status: degraded ? 503 : 200,
    headers: responseHeaders,
  });
};

export const ALL: APIRoute = async () =>
  json({ error: 'Method not allowed.' }, 405, { Allow: 'GET, HEAD' });
