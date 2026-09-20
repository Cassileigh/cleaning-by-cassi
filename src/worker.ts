import { handle } from '@astrojs/cloudflare/handler';
import { sendDailyHealth } from './email-health';
import type { ApplicationBindings } from './bindings';

export default {
  fetch: handle,
  async scheduled(
    controller: { scheduledTime: number },
    env: ApplicationBindings,
  ) {
    await sendDailyHealth(controller.scheduledTime, env);
  },
};
