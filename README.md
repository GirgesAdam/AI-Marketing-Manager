# AI Marketing Manager — Phase 1 Provider Spike Harness

This repository currently contains only the minimal internal tooling authorized for `P1-T01 — Build Minimal Provider Spike Harness`.
It is not the production application/monorepo and does not validate any provider capability.

## Fresh-clone setup

Requirements: Node.js 22+ and npm.

```bash
npm install
npm test
npm run typecheck
npm run build
```

The test suite is offline and uses injected mock transports. No provider credentials or external network access are required for P1-T01 acceptance.

## Safety defaults

- Execution mode defaults to `offline`.
- Live execution requires explicit opt-in plus required safeguards and environment-provided credentials.
- Requests are capped per run and every transport request has a finite timeout.
- Automatic retries are disabled by default.
- Only allowlisted response headers are persisted.
- Evidence and developer-facing output are sanitized through the centralized redaction boundary.
- Provider IDs observed by this harness are evidence only; they are never treated as internal tenant/Brand authorization.