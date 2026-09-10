type Runtime = import("@astrojs/cloudflare").Runtime<import("../worker-configuration").Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

declare module 'cloudflare:workers' {
  export const env: import('../worker-configuration').Env;
}
