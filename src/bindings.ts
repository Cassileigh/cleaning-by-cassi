export interface ApplicationBindings {
  QUOTE_RATE_LIMITER?: {
    limit(options: { key: string }): Promise<{ success: boolean }>;
  };
  TURNSTILE_SECRET?: string;
  TURNSTILE_HOSTNAMES?: string;
  TURNSTILE_SITE_KEY?: string;
  RESEND_API_KEY?: string;
}
