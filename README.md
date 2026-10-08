# Cleaning by Cassi

![Cleaning by Cassi](docs/readme-banner.svg)

<p align="center">
  <a href="https://cleaningbycassi.com"><img alt="Live website: cleaningbycassi.com" src="https://img.shields.io/badge/Live_website-cleaningbycassi.com-6f14d9?style=for-the-badge&logo=googlechrome&logoColor=white" /></a>
  <a href="https://cleaningbycassi.com/quote"><img alt="Free quote" src="https://img.shields.io/badge/Get_in_touch-Free_quote-f24bb5?style=for-the-badge&logo=maildotru&logoColor=white" /></a>
</p>

<p align="center">
  <a href="https://github.com/Cassileigh/cleaning-by-cassi/actions/workflows/quality.yml"><img alt="Cleaning by Cassi Quality" src="https://github.com/Cassileigh/cleaning-by-cassi/actions/workflows/quality.yml/badge.svg?branch=main" /></a>
  <a href="https://github.com/Cassileigh/cleaning-by-cassi/actions/workflows/production-smoke.yml"><img alt="Cleaning by Cassi Production Smoke" src="https://github.com/Cassileigh/cleaning-by-cassi/actions/workflows/production-smoke.yml/badge.svg?branch=main" /></a>
  <a href="https://github.com/Cassileigh/cleaning-by-cassi/actions/workflows/responsive.yml"><img alt="Responsive Compatibility" src="https://github.com/Cassileigh/cleaning-by-cassi/actions/workflows/responsive.yml/badge.svg?branch=main" /></a>
  <a href="https://github.com/Cassileigh/cleaning-by-cassi/actions/workflows/accessibility.yml"><img alt="Accessibility & Theme Compatibility" src="https://github.com/Cassileigh/cleaning-by-cassi/actions/workflows/accessibility.yml/badge.svg?branch=main" /></a>
  <a href="https://github.com/Cassileigh/cleaning-by-cassi/actions/workflows/safari.yml"><img alt="Safari Compatibility" src="https://github.com/Cassileigh/cleaning-by-cassi/actions/workflows/safari.yml/badge.svg?branch=main" /></a>
  <a href="https://github.com/Cassileigh/cleaning-by-cassi/actions/workflows/lighthouse.yml"><img alt="Lighthouse Quality" src="https://github.com/Cassileigh/cleaning-by-cassi/actions/workflows/lighthouse.yml/badge.svg?branch=main" /></a>
  <a href="https://github.com/Cassileigh/cleaning-by-cassi/actions/workflows/production-integrity.yml"><img alt="Production Integrity" src="https://github.com/Cassileigh/cleaning-by-cassi/actions/workflows/production-integrity.yml/badge.svg?branch=main" /></a>
  <a href="https://github.com/Cassileigh/cleaning-by-cassi/blob/main/package.json"><img alt="Astro dependency version" src="https://img.shields.io/github/package-json/dependency-version/Cassileigh/cleaning-by-cassi/astro/main?label=Astro&logo=astro&logoColor=white&color=1548f5" /></a>
  <a href="https://developers.cloudflare.com/workers/"><img alt="Cloudflare Workers" src="https://img.shields.io/badge/Cloudflare-Workers-a7df24?logo=cloudflare&logoColor=white" /></a>
</p>

### A cleaner home. A little more breathing room.

[cleaningbycassi.com](https://cleaningbycassi.com) · [Current state](docs/project-state.md) ·
[Quality](QUALITY.md) · [Security reporting](SECURITY.md)

Residential cleaning in the Fox Cities, with service information and protected personalized quote requests.

## Maintainer map

| Need                                           | Read                                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| Findings, blockers and dated release evidence  | [Project state](docs/project-state.md)                                             |
| Architecture and request guarantees            | [Quote contract](docs/quote-security-contract.md)                                  |
| Release, recovery, email and device procedures | [Operations](docs/release-runbook.md)                                              |
| Assistant working rules                        | [AGENTS.md](AGENTS.md)                                                             |
| Cross-project coordination                     | [Local working agreement](AGENTS.md#cross-project-coordination); linked issues/PRs |
| Prior audits and comparisons                   | [Pinned history](docs/project-state.md#historical-evidence-and-consolidation-map)  |

## Development

Node >=22, npm and committed lockfile. Versions live in package.json.

```bash
npm ci
npm run dev
```

Local validation: npm run format:check, npm run check and npm run audit. Browser
suites and production verification are separate; follow operations. Never deploy
with a direct Wrangler command that bypasses the gate.

Astro/TypeScript runs on Cloudflare Workers, using Turnstile and Resend. src owns
the app; public serves assets; scripts/tests own verification; .github owns CI.
docs/brand artwork remains where needed for builds; licenses stay beside fonts.
Secrets belong in provider stores or ignored local Worker bindings, never the repo.
Form success means provider acceptance, not inbox delivery. Mocked tests send no
email. Read the local contract before changing validation, recipients or retries.
Shared lessons do not substitute for independent project acceptance.
