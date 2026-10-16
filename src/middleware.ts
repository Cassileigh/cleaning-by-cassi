import { createFormRequestMiddleware } from './form-request-engine';
import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import type { ApplicationBindings } from './bindings';

export const onRequest = defineMiddleware(
  createFormRequestMiddleware({
    endpoint: '/api/quote',
    requestPrefix: 'CBC-',
    requestIdLength: 12,
    limiterPrefix: 'quote:',
    protection: () => ({
      limiter: (env as ApplicationBindings).QUOTE_RATE_LIMITER,
    }),
    limited: {
      error: 'Too many quote requests. Please try again later.',
      code: 'rate-limited',
    },
    capacity: {
      error:
        'Quote requests are temporarily busy. Please try again later or email Cassi.',
      code: 'rate-limited',
    },
    unavailable: {
      error:
        'Quote requests are temporarily unavailable. Please try again later or email Cassi.',
      code: 'rate-limit-unavailable',
    },
  }),
);
