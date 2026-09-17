# Repository maintenance

Before changing this project, read docs/security-parity.md,
docs/quote-security-contract.md and docs/release-runbook.md. Treat historical
audit notes as evidence for their recorded revision, not current facts.

Use current GitHub source states when comparing upstream/reference projects.
Update the relevant docs with changes, exact revision evidence and unresolved
limitations. Keep main as the only production branch. Do not weaken gates,
discard dependency work, print credentials, or send real quote emails as tests.

Run tests, formatting, type checks, build, deployment dry run, repository/history
audits and npm audit. Browser/production claims require actual successful results
for the exact revision. Preserve stronger existing form protections when adapting
reference code.
