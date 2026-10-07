# Provider Spike Results

## P1-T01 — Harness Validation

Status: `IMPLEMENTED — AWAITING TEAM LEADER REVIEW`

P1-T01 validates only the minimal Provider Spike Harness itself. It does **not** validate Zernio or any other provider capability.

No real provider request was executed during P1-T01. No paid API request was executed. All automated behavior tests use injected mock transports and run offline after dependencies are installed.

No provider capability is marked `SPIKE_PASS` by this task. Zernio/provider capabilities remain unverified / `SPIKE_PENDING` until their dedicated Provider Behavior tasks execute.

Harness validation covered:
- evidence schema and PASS / FAIL / BLOCKED semantics;
- stable test IDs and unique run IDs;
- centralized secret redaction, including a fake sentinel secret;
- bounded request counts and finite timeout behavior;
- observable HTTP 429 / Retry-After behavior with no automatic retry;
- 4xx / 5xx / network error classification without equating HTTP status to assertion outcome;
- configurable provider request-ID extraction;
- safe response-header allowlisting;
- default offline execution and live fail-closed safeguards;
- basic development cost-safety rejection before live transport execution.

This section is harness evidence only. Mock behavior must not be interpreted as provider behavior.

## P1-T01-F01 — Harness Runtime Safety Hardening

Follow-up harness validation fixed two fail-closed defects: runtime execution mode is now explicitly restricted to `offline` or `live` before prerequisites/transport, and cost-bearing live runs require finite non-negative development cost ceiling and estimate values.

Regression coverage confirms invalid modes and `NaN` / `Infinity` / `-Infinity` cost values are blocked before transport, while valid finite cost configuration still permits the injected mock live transport when all safeguards pass.

This remains harness validation only. No Zernio/provider behavior was tested, no real provider request was executed, and no provider capability is marked `SPIKE_PASS`.

## P1-T02 — Zernio Profiles Provider Behavior

Status: `BLOCKED — LIVE CREDENTIAL NOT AVAILABLE TO AUTHORIZED LOCAL EXECUTION ENVIRONMENT`

The P1-T02 execution path, safety gates, exact-name reconciliation, idempotent create behavior, unknown-write reconciliation, and credential-redaction behavior are implemented and validated offline with injected transports.

No real Zernio Provider Behavior call has been executed for P1-T02 yet. `ZERNIO_API_KEY` is not present in the authorized development machine's process, user, or machine environment. A GitHub repository/environment secret is not automatically injected into this local execution path, and P1-T02 does not introduce CI/CD solely to consume it.

Therefore no Zernio Profile has been created or read back by this task yet, no provider capability is marked `SPIKE_PASS`, and Profiles remains `SPIKE_PENDING` pending authorized live execution.
