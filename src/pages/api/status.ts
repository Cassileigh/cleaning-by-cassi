import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

type CheckStatus = 'operational' | 'configured' | 'degraded';

type Check = {
  status: CheckStatus;
  detail: string;
};

type Bindings = {
  TURNSTILE_SECRET?: string;
  TURNSTILE_HOSTNAMES?: string;
  RESEND_API_KEY?: string;
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

export const GET: APIRoute = async ({ request }) => {
  const bindings = env as unknown as Bindings;
  const turnstileConfigured = Boolean(bindings.TURNSTILE_SECRET && bindings.TURNSTILE_HOSTNAMES);
  const resendConfigured = Boolean(bindings.RESEND_API_KEY);

  const checks: Record<string, Check> = {
    worker: {
      status: 'operational',
      detail: 'Production Worker is responding',
    },
    quote: {
      status: 'operational',
      detail: 'Quote request route is available in production',
    },
    turnstile: {
      status: turnstileConfigured ? 'configured' : 'degraded',
      detail: turnstileConfigured
        ? 'Turnstile protection is configured'
        : 'Turnstile protection is not configured',
    },
    resend: {
      status: resendConfigured ? 'configured' : 'degraded',
      detail: resendConfigured
        ? 'Resend delivery integration is configured'
        : 'Resend delivery integration is not configured',
    },
  };

  const values = Object.values(checks);
  const degraded = values.some((check) => check.status === 'degraded');
  const operational = values.filter((check) => check.status === 'operational').length;
  const configured = values.filter((check) => check.status === 'configured').length;

  return json({
    ok: !degraded,
    status: degraded ? 'degraded' : 'operational',
    generatedAt: new Date().toISOString(),
    requestId: request.headers.get('cf-ray') ?? crypto.randomUUID(),
    checks,
    summary: `${operational} live · ${configured} configured`,
    runtime: 'Cloudflare Workers',
  });
};

export const ALL: APIRoute = async () =>
  json({ error: 'Method not allowed.' }, 405);
