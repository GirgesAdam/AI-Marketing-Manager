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

Status: `IMPLEMENTED — AWAITING TEAM LEADER REVIEW`

Provider environment: authorized internal Zernio test team. The team-level credential was sourced from the local ignored `.env` secret file and was never printed, logged, committed, placed in evidence, or passed as a plain CLI argument.

### Authorized-team preflight

The harness executed `GET /v1/users` before any Profile mutation. The final evidence run produced:
- run_id: `026b271e-8153-4069-b664-0d850f21f40e`
- timestamp: `2026-10-07T01:48:21.429Z`
- result: `PASS`
- HTTP status: `200`
- Provider Request ID: `c704ae83-713d-4b3d-9aa5-2f36f2fbc670`
- latency: `395 ms`
- request count: `1`

The preflight assertion requires a valid `currentUserId` and team `users` array. No member emails, names, raw response body, or unnecessary team PII were persisted.

### Initial provisioning observation

The bounded live provisioning run started at `2026-10-07T01:46:02Z`. The earlier safe CLI version did not surface harness `run_id` / per-case timestamp, so the initial mutation evidence is anchored by the provider request IDs below and followed by a final harness reconciliation run with complete run IDs/timestamps.

#### Profile A — initial create
- Test ID: `P1-T02-PROFILE-A`
- expected Profile name: `aimm-p1-t02-profile-a`
- resulting Profile ID: `6ac5a45a8e4ca44f355033ae`
- safe request flow: `GET /v1/profiles?name=<exact>` → `POST /v1/profiles` with `Idempotency-Key` → exact-name `GET /v1/profiles`
- HTTP statuses: `200, 201, 200`
- Provider Request IDs: `bbf4e726-ea30-4dfb-96e0-8a7e8951eb9a`, `b0e73d4b-20c2-43f3-96ef-b076107e1688`, `58a2abd9-4647-4c68-a889-42e61f413368`
- latency: `840 ms`
- created_this_run: `YES`
- reconciled_existing: `NO`
- reconciled_after_uncertain_create: `NO`
- result: `PASS`

#### Profile B — initial create
- Test ID: `P1-T02-PROFILE-B`
- expected Profile name: `aimm-p1-t02-profile-b`
- resulting Profile ID: `6ac5a45b243a942b74bdbaa0`
- safe request flow: `GET /v1/profiles?name=<exact>` → `POST /v1/profiles` with `Idempotency-Key` → exact-name `GET /v1/profiles`
- HTTP statuses: `200, 201, 200`
- Provider Request IDs: `b560216c-5865-40ae-988d-628fd720f94d`, `ae9e4b8a-5484-4d5e-a77e-3c5b9efb6160`, `afed2e8b-88ff-43c3-80b3-fad09831407e`
- latency: `491 ms`
- created_this_run: `YES`
- reconciled_existing: `NO`
- reconciled_after_uncertain_create: `NO`
- result: `PASS`

### Final harness reconciliation evidence

A final read-only reconciliation was performed after the safe runner was extended to surface harness `run_id` and `timestamp`. Because both exact names already existed, this run issued no Profile `POST` requests.

#### Profile A — final evidence
- run_id: `ac860138-ae6e-4f8b-83d6-34198500f032`
- timestamp: `2026-10-07T01:48:22.106Z`
- Test ID: `P1-T02-PROFILE-A`
- exact Profile name: `aimm-p1-t02-profile-a`
- Profile ID: `6ac5a45a8e4ca44f355033ae`
- safe request flow: exact-name `GET /v1/profiles` → exact-name read-back `GET /v1/profiles`
- HTTP statuses: `200, 200`
- Provider Request IDs: `0bb6204e-abe0-4265-b61d-7988f665668d`, `c934ded6-79af-4c2a-bc54-2f88a0b79dc7`
- latency: `676 ms`
- created_this_run: `NO`
- reconciled_existing: `YES`
- reconciled_after_uncertain_create: `NO`
- result: `PASS`

#### Profile B — final evidence
- run_id: `d3cf6996-9365-46ba-9690-d81b6b5834eb`
- timestamp: `2026-10-07T01:48:22.447Z`
- Test ID: `P1-T02-PROFILE-B`
- exact Profile name: `aimm-p1-t02-profile-b`
- Profile ID: `6ac5a45b243a942b74bdbaa0`
- safe request flow: exact-name `GET /v1/profiles` → exact-name read-back `GET /v1/profiles`
- HTTP statuses: `200, 200`
- Provider Request IDs: `a354693a-ade1-44ef-8f70-d8e7be3d39a8`, `4d73d56d-9fe4-46c0-b338-9455873bedc4`
- latency: `341 ms`
- created_this_run: `NO`
- reconciled_existing: `YES`
- reconciled_after_uncertain_create: `NO`
- result: `PASS`

Profile A ID and Profile B ID are distinct. Both Profiles were retained for P1-T03.

Across P1-T02 live work, the exact Provider operation count was:
- `GET /v1/profiles`: `8`
- `POST /v1/profiles`: `2` (the two intended initial Profile creations only)
- other Zernio API operations: `4` (`GET /v1/users` authorized-team preflight checks)

Observed failure/retry conditions during live execution:
- timeout: `NO`
- 409: `NO`
- 429: `NO`
- 5xx: `NO`
- UNKNOWN write outcome: `NO`
- automatic retry: `NO`

No social account, Ads account, publishing, media, webhook, analytics, community, scoped API key, OpenAI, or fal.ai action occurred. No ad spend occurred. No chargeable provider action was observed; Profile provisioning is treated as zero task cost.

Profiles capability observed status: `OBSERVED_PASS`.

Recommendation pending Team Leader review: `Profiles → SPIKE_PASS`. This document does not independently change the canonical `PROVIDER_CAPABILITIES.md` status.

## P1-T02-F01 — Trusted Zernio Target Identity Binding

Status: `IMPLEMENTED — AWAITING TEAM LEADER RE-REVIEW`

This fix closes the P1-T02 authorization-target verification gap without discarding the historical Profile creation observations above. A separately operator-supplied trusted expected identity is loaded only from ignored runtime configuration. The value itself is not logged, committed, written to evidence, documented, or returned by the runner.

The live identity check uses `GET /v1/auth/verify`. HTTP authentication alone is insufficient: the authenticated provider email must be present, valid, and match the independently supplied expected identity after trimming and case-normalization. Evidence records only `expected_identity_match`.

### Trusted identity verification
- run_id: `ea446326-5d53-4576-8e0c-1f99cea552c4`
- timestamp: `2026-10-07T11:24:21.141Z`
- result: `PASS`
- HTTP status: `200`
- Provider Request ID: `bd9eb306-2679-4c1a-a318-61f87b5cc940`
- latency: `437 ms`
- request count: `1`
- expected_identity_match: `true`

Neither the expected nor provider-returned email is persisted in this document.

### Profile A read-only re-verification
- run_id: `f995edce-dadb-4ea3-aaaa-709d1a85390e`
- timestamp: `2026-10-07T11:24:21.283Z`
- exact Profile name: `aimm-p1-t02-profile-a`
- expected recorded Profile ID: `6ac5a45a8e4ca44f355033ae`
- observed Profile ID: `6ac5a45a8e4ca44f355033ae`
- ID match: `YES`
- HTTP status: `200`
- Provider Request ID: `e4feea4e-90e3-4863-9f8c-c21cd4fb8c3e`
- latency: `141 ms`
- result: `PASS`

### Profile B read-only re-verification
- run_id: `6352b4bd-7b41-41ef-a20e-ea7af7f4b489`
- timestamp: `2026-10-07T11:24:21.498Z`
- exact Profile name: `aimm-p1-t02-profile-b`
- expected recorded Profile ID: `6ac5a45b243a942b74bdbaa0`
- observed Profile ID: `6ac5a45b243a942b74bdbaa0`
- ID match: `YES`
- HTTP status: `200`
- Provider Request ID: `0ce2d3e2-1de7-4cf6-aea5-865bf02dfed6`
- latency: `215 ms`
- result: `PASS`

Profile A ID and Profile B ID remain distinct.

P1-T02-F01 live execution was strictly read-only:
- `GET /v1/auth/verify`: `1`
- exact-name `GET /v1/profiles` for Profile A: `1`
- exact-name `GET /v1/profiles` for Profile B: `1`
- Profile `POST`: `0`
- Profile `PUT/PATCH`: `0`
- Profile `DELETE`: `0`
- scoped API-key operations: `0`

The original P1-T02 Profile observations are therefore now bound to the intended operator-approved Zernio identity by independent trusted configuration plus read-only identity and recorded-ID verification. Profiles remains `SPIKE_PENDING` until Team Leader re-review and acceptance; this document does not modify canonical `PROVIDER_CAPABILITIES.md`.
