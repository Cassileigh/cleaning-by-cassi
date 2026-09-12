# Release runbook

## Cloudflare build configuration

Production branch: `main`. Build command: `npm run build`. Deploy command: **`npm run deploy`**. Do not use the default direct `npx wrangler deploy` command: it bypasses the repository's CI gate.

The gate checks a clean checkout, the build SHA, the current GitHub main SHA, and successful push runs for quality, responsive, accessibility, lighthouse, and safari. It rechecks main immediately before allowing Wrangler to run. GitHub errors, missing evidence, skipped or failed workflows and a 12-minute timeout block deployment. Production smoke runs afterward and is deliberately not a prerequisite that would deadlock deployment.

This repository cannot prove the Cloudflare dashboard deploy command or GitHub branch protection settings. Confirm the configured command and retain one build log showing `CI approved main <sha>` before treating this gate as activated. No account integration was disabled or replaced by this change.

## Rate limiting

`wrangler.json` provisions `QUOTE_RATE_LIMITER`, namespace `2107100912`, at eight requests per minute. Middleware also retains its eight-per-ten-minute isolate safety net. A missing or broken binding rejects submissions with 503; an exhausted limit returns 429. Cloudflare enforcement is shared within a location and is not a strict global quota. See [Cloudflare's rate limit binding documentation](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).

## Verification

Run `npm ci`, `npm run format:check`, `npm run check`, and `npm run audit`. All five required workflows must pass on the exact release SHA. Safari uses native Safari WebDriver on macOS and retains the seven Playwright WebKit interaction tests. Automated quote journeys mock the verification/provider boundary and send no email. Lighthouse collects all eight routes and all four categories; only the intentionally noindex receipt omits the SEO threshold. Reports remain downloadable even on failure. Performance thresholds are not relaxed for noisy runs.

After deployment, verify `/api/release` matches the expected SHA and the production smoke passes. Configuration readiness is not proof of live mail delivery. Provider notifications, branch protection and a rehearsed rollback remain separate operational checks.
