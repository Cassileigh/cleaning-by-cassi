// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://cleaningbycassi.com',
  output: 'server',
  // Keep page CSS in same-origin assets so production needs no inline-style
  // exception. Email HTML is sent to Resend and is not governed by this CSP.
  build: { inlineStylesheets: 'never' },
  integrations: [
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith('/quote-success'),
    }),
  ],

  adapter: cloudflare(),
});
