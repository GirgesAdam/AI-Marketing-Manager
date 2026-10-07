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

Status: `DONE / ACCEPTED`

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

Team Leader verdict: `ACCEPTED`. Canonical Profiles capability is finalized as `SPIKE_PASS`; Scoped Keys remains `SPIKE_PENDING`.

## P1-T02-F01 — Trusted Zernio Target Identity Binding

Status: `ACCEPTED`

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

P1-T02-F01 accepted live execution was strictly read-only:
- `GET /v1/auth/verify`: `1`
- exact-name `GET /v1/profiles` for Profile A: `1`
- exact-name `GET /v1/profiles` for Profile B: `1`
- Profile `POST`: `0`
- Profile `PUT/PATCH`: `0`
- Profile `DELETE`: `0`
- scoped API-key operations: `0`

The original P1-T02 Profile observations are therefore now bound to the intended operator-approved Zernio identity by independent trusted configuration plus read-only identity and recorded-ID verification. Team Leader accepted P1-T02 and P1-T02-F01. Canonical Profiles capability is `SPIKE_PASS`; Scoped Keys remains `SPIKE_PENDING` for P1-T03.

## P1-T03 — Zernio Scoped API Key Isolation Provider Behavior

Status: `IMPLEMENTED — AWAITING TEAM LEADER REVIEW`

Provider environment: authorized internal Zernio test team. The accepted trusted control-plane identity binding was reused before any API-key mutation. The independently supplied expected identity value and the provider-returned identity are intentionally absent from this evidence. Temporary scoped-key raw values remained in process memory only and were never written to disk, `.env`, logs, stdout/stderr, evidence, documentation, or git.

### Control-plane identity preflight
- test purpose: trusted target verification before scoped-key mutation
- run_id: `96a5cf55-0d97-43aa-b004-359c414fddac`
- timestamp: `2026-10-07T12:19:53.604Z`
- result: `PASS`
- HTTP status: `200`
- Provider Request ID: `b2f0b7b6-60cf-443a-9551-1a10fbf40914`
- latency: `510 ms`
- expected_identity_match: `true`

### Temporary scoped Key A creation
- provider key ID: `6ac638e8cc8ba8b85bdd473d`
- synthetic name: `aimm-p1-t03-profile-a-readonly-088cff7a-ed52-43de-97cb-72b561f6f13d`
- scope: `profiles`
- permitted Profile ID: `6ac5a45a8e4ca44f355033ae`
- permission: `read`
- expiry: `2026-10-08T12:19:52.485Z`
- HTTP status: `201`
- Provider Request ID: `35d8e086-8423-4c4d-a027-97936f067d12`
- latency: `164 ms`
- raw key / keyPreview persisted: `NO`

### Temporary scoped Key B creation
- provider key ID: `6ac638e8cc8ba8b85bdd473f`
- synthetic name: `aimm-p1-t03-profile-b-readonly-088cff7a-ed52-43de-97cb-72b561f6f13d`
- scope: `profiles`
- permitted Profile ID: `6ac5a45b243a942b74bdbaa0`
- permission: `read`
- expiry: `2026-10-08T12:19:52.761Z`
- HTTP status: `201`
- Provider Request ID: `e1bb0dd9-a063-4cd8-94fb-dbc8b18f4659`
- latency: `276 ms`
- raw key / keyPreview persisted: `NO`

The two provider key IDs were distinct.

### Key A isolation probes

| Probe | HTTP | Provider Request ID | Visible count | Own A visible | Foreign B visible | Result |
|---|---:|---|---:|---|---|---|
| `GET /v1/profiles` | 200 | `ffdc6ae3-2194-42fa-9c80-be3f1a58fa9c` | 1 | YES | NO | PASS |
| exact A lookup | 200 | `b8456174-66c4-45cf-b22f-aa32fd9615c2` | 1 | YES | NO | PASS — recorded A ID matched |
| exact B cross-lookup | 200 | `eaa69e95-ecf3-49e1-a7a4-25f9f9c7489a` | 0 | N/A | NO | PASS — isolated |

Key A exposed no Profile outside its explicit Profile A scope.

### Key B isolation probes

| Probe | HTTP | Provider Request ID | Visible count | Own B visible | Foreign A visible | Result |
|---|---:|---|---:|---|---|---|
| `GET /v1/profiles` | 200 | `604095ff-6437-4cf5-9b6d-90c2f02bb86a` | 1 | YES | NO | PASS |
| exact B lookup | 200 | `a435d299-5005-4059-99a5-b9609aca826f` | 1 | YES | NO | PASS — recorded B ID matched |
| exact A cross-lookup | 200 | `bcee4a5e-fdae-4d82-ae6e-4918eff46f3b` | 0 | N/A | NO | PASS — isolated |

Key B exposed no Profile outside its explicit Profile B scope.

Cross-Profile leakage observed: `NO`.

### Temporary-key cleanup

Key A:
- revoke result: `PASS`
- DELETE status: `200`
- revoke Provider Request ID: `4c4e2cde-9834-4ad5-97a2-6186f1d03012`
- post-revoke credential valid: `NO`
- post-revoke `GET /v1/auth/verify`: `401`
- verification Provider Request ID: `83c41b2e-5cc6-426e-8da2-d32e54981e64`
- cleanup confirmed: `YES`

Key B:
- revoke result: `PASS`
- DELETE status: `200`
- revoke Provider Request ID: `f2878126-9180-426e-93ec-9dc3185bfbd8`
- post-revoke credential valid: `NO`
- post-revoke `GET /v1/auth/verify`: `401`
- verification Provider Request ID: `1a120253-0214-4bae-8cae-1b02495b4fb7`
- cleanup confirmed: `YES`

### Exact live operation count
- control-plane `GET /v1/auth/verify`: `1`
- `POST /v1/api-keys`: `2`
- scoped-key `GET /v1/profiles` requests: `6`
- `DELETE /v1/api-keys/{keyId}`: `2`
- post-revoke `GET /v1/auth/verify`: `2`
- total: `13`
- hard ceiling: `16`
- polling: `NO`
- automatic retry: `NO`
- UNKNOWN-create reconciliation used: `NO`

No social connection, social publishing, Ads, media generation/upload, OpenAI, fal.ai, or ad-spend action occurred. No chargeable provider action was observed; scoped-key provisioning/revocation is treated as `$0` task cost.

Scoped Keys capability observed status: `OBSERVED_PASS`.

Recommendation pending Team Leader review: `Scoped Keys capability recommendation: SPIKE_PASS`.

Canonical `PROVIDER_CAPABILITIES.md` remains unchanged: Profiles = `SPIKE_PASS`; Scoped Keys = `SPIKE_PENDING` until Team Leader acceptance.

## P1-T03-F01 — Malformed Scoped-Key Create Cleanup Hardening

Status: `IMPLEMENTED — AWAITING TEAM LEADER RE-REVIEW`

This post-review fix addresses only deterministic failure recovery after a successful `POST /v1/api-keys` response is malformed. The historical P1-T03 live Provider Behavior evidence above remains valid and was not repeated.

The hardened create path now treats HTTP 201 as a potentially committed credential even when the response cannot safely identify that credential. If the returned provider key ID is trustworthy, malformed scope semantics are cleaned up directly with `DELETE /v1/api-keys/{keyId}`. If the provider key ID is unavailable, the control-plane credential performs one bounded `GET /v1/api-keys`, filters in code by the exact unique synthetic P1-T03 key name, and revokes only a single exact match.

Fail-closed outcomes:
- zero exact matches → `SCOPED_KEY_CLEANUP_UNCONFIRMED`;
- one exact match with valid ID + confirmed DELETE → `MALFORMED_PROVIDER_RESPONSE` after cleanup;
- one exact match missing provider ID → `SCOPED_KEY_CLEANUP_UNCONFIRMED`;
- multiple exact matches → `AMBIGUOUS_SCOPED_KEY_STATE`, with no arbitrary DELETE;
- failed DELETE → `SCOPED_KEY_CLEANUP_UNCONFIRMED`;
- malformed successful create never retries POST.

Known-ID malformed responses are revoked directly for missing raw key, scope mismatch, Profile-scope mismatch, permission mismatch, missing expiry, or invalid/unparseable expiry. Raw scoped keys and `keyPreview` values remain absent from returned results, harness evidence, errors, stdout-equivalent serialization, documentation, and git.

Deterministic validation:
- focused P1-T03-F01 suite: `17 passed / 0 failed` (10 required regressions + 7 additional cleanup/semantic safety cases);
- existing P1-T03 suite: `27 passed / 0 failed`;
- full suite: `106 passed / 0 failed / 0 skipped`;
- `npm run typecheck`: PASS;
- `npm run build`: PASS;
- `git diff --check`: PASS.

P1-T03-F01 real Provider activity:
- real Zernio calls: `0`;
- live scoped keys created: `0`;
- live scoped keys revoked: `0`;
- repeated live isolation run: `NO`.

Historical P1-T03 observations remain unchanged: Key A isolation observed PASS, Key B isolation observed PASS, cross-Profile leakage `NO`, both real temporary keys revoked, both post-revoke auth checks HTTP 401, and the historical live call count remains 13.

Canonical capability state is intentionally unchanged: Profiles = `SPIKE_PASS`; Scoped Keys = `SPIKE_PENDING` pending Team Leader acceptance.
