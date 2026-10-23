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

Status: `ACCEPTED`

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

Team Leader verdict: `ACCEPTED`. Scoped Keys capability recommendation was accepted as `SPIKE_PASS`.

Canonical capability state: Profiles = `SPIKE_PASS`; Scoped Keys = `SPIKE_PASS`; Publishing = `SPIKE_PENDING`.

## P1-T03-F01 — Malformed Scoped-Key Create Cleanup Hardening

Status: `ACCEPTED`

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

Team Leader accepted P1-T03-F01 together with P1-T03. Canonical capability state: Profiles = `SPIKE_PASS`; Scoped Keys = `SPIKE_PASS`; Publishing = `SPIKE_PENDING`.

## P1-T04 — Zernio Facebook Text-Only Core Publishing Provider Behavior

Status: `IMPLEMENTED — AWAITING TEAM LEADER REVIEW`

Provider environment: authorized internal Zernio test team. This task verifies only Facebook text-only core publishing behavior. It does not certify Instagram publishing, media publishing, Reels, Stories, carousel, cross-platform fanout, multi-account publishing, media upload/expiry, OAuth lifecycle, webhooks, or production retry/reconciliation behavior.

### Frozen target
- Profile A ID: `6ac5a45a8e4ca44f355033ae`
- Zernio Facebook account ID: `6ac64f8740364f4695dd3077`
- Facebook Page ID: `1387424501114639`
- Page name: `Clothing Brand`
- platform: `facebook`
- operator public-test authorization: `YES`

### Control-plane identity preflight
- result: `PASS`
- run_id: `d7aec8fa-dbfe-4480-b42f-47ec378edcbb`
- timestamp: `2026-10-07T14:39:51.473Z`
- HTTP status: `200`
- Provider Request ID: `3c9a9146-69dd-4bb3-b2eb-a4bb86e46551`
- latency: `721 ms`
- expected_identity_match: `true`

Expected and actual identity values are intentionally absent from evidence.

### Temporary publishing key
- provider key ID: `6ac659b6cf071cd03e7e0d69`
- synthetic name: `aimm-p1-t04-publishing-c98c963a-2ed6-4519-836d-7e85297ef59a`
- scope: `profiles`
- permitted Profile ID: `6ac5a45a8e4ca44f355033ae`
- permission: `read-write`
- expiresAt: `2026-10-08T14:39:50.470Z`
- create HTTP: `201`
- Provider Request ID: `bbb3e152-6eec-4a67-9899-cf96ffbe8fb7`
- raw key exposed/persisted: `NO`

### Exact target and readiness
- account ID: `6ac64f8740364f4695dd3077`
- platform: `facebook`
- Profile ID: `6ac5a45a8e4ca44f355033ae`
- Page ID: `1387424501114639`
- Page name: `Clothing Brand`
- selected/available Page match: `PASS`
- account health: `healthy`
- canPost: `true`
- account-list Request ID: `3d851e3f-262f-432d-a4ca-98d24f8d3649`
- Page-target Request ID: `f0ce2164-727d-4d0e-87fa-c032bc58372f`
- health Request ID: `5c56ace3-b5b8-4326-a60f-8a048a34eb5e`

### Draft behavior
- Zernio post ID: `6ac659b8401610c088daa8ab`
- create: HTTP `201`, request `d3fca111-1d65-4cb5-b467-fd57ec4c3da4`
- read-back: HTTP `200`, request `eff0c870-3412-4bfc-a2de-93870abe84f1`
- exact same body + same Idempotency-Key replay: HTTP `200`, request `77d4fa1e-026c-4f24-be8e-0152e3a81171`
- same logical/Zernio post ID: `YES`
- duplicate post: `NO`
- cleanup DELETE: HTTP `200`, request `27178f2f-361e-45a9-829f-9954476db8ce`
- cleanup read-back: HTTP `404`, request `ee78ed9e-77e6-401d-a5eb-8c96638ffbab`
- cleanup confirmed: `YES`

### Scheduled behavior
- Zernio post ID: `6ac659b932a50814b268fc05`
- requested schedule: `2026-10-10T17:39:51` in `Africa/Cairo`
- provider returned schedule: `2026-10-10T14:39:51.000Z`
- normalized schedule match: `PASS`
- create: HTTP `201`, request `9e233469-ff95-47da-a299-4913e79b8384`
- read-back: HTTP `200`, request `8ccfb627-f83d-4382-be42-8650852d55f8`
- cleanup DELETE: HTTP `200`, request `38cdacd4-e9fb-4b90-925f-90fe0e670ead`
- cleanup read-back: HTTP `404`, request `40c56c66-a356-49f9-ab5d-e9f2b575b3da`
- cancellation/cleanup confirmed: `YES`

### One immediate public Facebook text post
- immediate create count: `1`
- Zernio post ID: `6ac659ba401610c088daa8b2`
- create: HTTP `201`, request `f5e1ab58-c438-475a-b16e-6ad6241359e2`
- published read-back: HTTP `200`, request `e12b0ec4-fc33-4627-b17b-5c8c21c51f99`
- Facebook/platform post ID: `1387424501114639_122100171927502015`
- public URL: `https://www.facebook.com/1387424501114639_122100171927502015`
- publishedAt: `2026-10-07T14:39:58.143Z`
- exact account/Page target validation: `PASS`
- wrong publishing target observed: `NO`
- duplicate confirmed publish observed: `NO`

### Public cleanup
- unpublish/remove: HTTP `200`, request `da04f7de-54b8-478e-b554-52ecab9cb03c`
- cleanup read-back: HTTP `200`, request `bb70fe87-e811-43df-b5de-b984e551d358`
- provider state no longer active/published: `PASS`
- cleanup confirmed: `YES`

### Temporary key cleanup
- revoke: HTTP `200`, request `22837d9f-0579-42fa-8205-3a9a0511743f`
- post-revoke auth: HTTP `401`, request `db58dd21-f461-4a1f-a14d-6eca807cd949`
- revoked key valid: `NO`
- cleanup confirmed: `YES`

### Exact live operation count and cost safety
- normal provider calls: `20`
- cleanup-allowance calls: `0`
- total provider calls: `20`
- normal hard ceiling: `22`
- one bounded live run only: `YES`
- Ads/ad spend: `0`
- OpenAI: `0`
- fal.ai: `0`
- media generation/upload: `0`
- new account connection/reconnect: `0`
- unexpected paid action: `NO`

Observed Provider Behavior: `OBSERVED_PASS`.

Publishing capability recommendation: `SPIKE_PASS`.

Known limitation: Core publishing lifecycle verified on Facebook text-only only. Instagram/media/platform-specific publishing remains separately unverified.

Canonical Publishing remains `SPIKE_PENDING` pending Team Leader acceptance. Profiles and Scoped Keys remain `SPIKE_PASS`.
## P1-T04-F01 — Exact Page Target Attestation and Emergency Cleanup Hardening

Status: `IMPLEMENTED — AWAITING TEAM LEADER RE-REVIEW`

Team Leader review preserved the historical P1-T04 real Provider Behavior as `OBSERVED_PASS` and identified two harness safety gaps only: incomplete exact Facebook Page attestation and incomplete emergency draft/scheduled cleanup verification. The historical live publishing run, Provider Request IDs, post IDs, target IDs, cleanup evidence, and 20-call execution above remain unchanged. No live publishing was repeated for this fix.

Deterministic target hardening:
- every draft/scheduled create and read-back now requires both the frozen Zernio account ID and explicit frozen Facebook Page ID;
- correct account with missing Page evidence is `BLOCKED / PUBLISHING_PAGE_TARGET_UNCONFIRMED`;
- any explicit different Page is `FAIL / CRITICAL_WRONG_PUBLISHING_TARGET`;
- immediate posts may use alternate Page attestation only after provider state is published and only when explicit Page ID is absent;
- accepted alternate formats are strict numeric `PAGEID_POSTID` from `platformPostId` or a strict `https://facebook.com/PAGEID_POSTID` / `https://www.facebook.com/PAGEID_POSTID` path with no query/hash;
- missing, malformed, ambiguous, or wrong alternate evidence never falls back to substring matching or request-body assumptions.

Deterministic emergency-cleanup hardening:
- emergency draft/scheduled cleanup always performs `DELETE /v1/posts/{postId}` followed by `GET /v1/posts/{postId}`;
- cleanup is confirmed only by HTTP 404 or explicit `cancelled` / `deleted` provider state;
- DELETE 200/204 alone is not confirmation;
- a still-active draft/scheduled artifact yields `DRAFT_TEST_POST_CLEANUP_UNCONFIRMED` or `SCHEDULED_TEST_POST_CLEANUP_UNCONFIRMED`, taking precedence over the original failure;
- cleanup DELETE/GET, scoped-key revoke, and post-revoke verification remain allowed through the existing cleanup allowance after normal request ceiling exhaustion; the cleanup allowance does not create, schedule, or publish.

Validation evidence:
- focused P1-T04-F01 suite: `15 passed / 0 failed` (F01-T01 through F01-T13 + two additional safety cases); F01-T14 full-suite gate is validated separately by `npm test`;
- existing P1-T04 targeted suite: `44 passed / 0 failed`;
- full suite: `165 passed / 0 failed / 0 skipped`;
- `npm run typecheck`: PASS;
- `npm run build`: PASS;
- `git diff --check`: PASS.

P1-T04-F01 real Provider activity:
- real Zernio calls: `0`;
- public posts created: `0`;
- scheduled posts created: `0`;
- temporary scoped keys created live: `0`;
- historical P1-T04 Provider Behavior preserved: `YES`;
- historical live post re-published: `NO`.

Canonical Publishing capability remains `SPIKE_PENDING` pending Team Leader re-review. P1-T05 remains `NOT_STARTED`.

## P1-T05 — Zernio Generic Webhook Delivery Contract

Status: `IMPLEMENTED — AWAITING TEAM LEADER REVIEW`.

### Documented provider contract used by the spike
- webhook create: `POST /v1/webhooks/settings`;
- synchronous one-shot test: `POST /v1/webhooks/test`;
- settings read/list: `GET /v1/webhooks/settings`;
- delivery logs: `GET /v1/webhooks/logs`;
- canonical webhook deletion query: `DELETE /v1/webhooks/settings?webhookId=<id>`;
- scoped webhooks support `profileIds`;
- webhook signatures are lowercase hexadecimal HMAC-SHA256 over the exact raw request body using the endpoint secret;
- `payload.id` is the canonical event identifier and must equal `X-Zernio-Event-Id`;
- successful acknowledgement is an HTTP 2xx response within the provider timeout;
- `webhook.test` is synchronous and one-shot and is not evidence for automatic retry;
- automatic retry certification therefore requires a real event; the first documented retry is approximately 10 seconds after the failed delivery.

### Deterministic receiver / harness evidence
- minimal receiver keeps exact raw bytes in memory, verifies HMAC before parsing JSON, uses constant-time comparison only after safe signature-shape validation, and stores only sanitized metadata/body hash in evidence;
- Profile A / event scope, unknown-create reconciliation, duplicate webhook ambiguity, signature failures, canonical event IDs, retry dedupe, target preflight, cleanup order, ceilings, and secret redaction are covered deterministically;
- final focused suite: `46 passed / 0 failed` (T05-01 through T05-38 plus eight additional safety regressions);
- final full suite: `211 passed / 0 failed / 0 skipped`;
- typecheck/build/diff-check: PASS;
- post-blocker hardening added an exact-runtime HTTPS readiness probe: the same public URL intended for Zernio must first reach the controlled receiver and yield its deterministic unsigned-request HTTP 401 before provider calls are permitted.

### Real observed Provider Behavior — single bounded run
Identity:
- expected identity match: true;
- run ID `4246fa47-05a9-4749-be46-263d900ed416`;
- timestamp `2026-10-07T18:02:01.553Z`;
- HTTP 200;
- request ID `c9b21a9c-b437-41bc-93f7-769192033d1b`;
- latency 619 ms.

Controlled receiver:
- local project-controlled Node receiver + temporary Cloudflare Quick Tunnel;
- public test URL for this now-destroyed run: `https://declaration-lat-ross-cardiac.trycloudflare.com/zernio`;
- generic public request-bin/webhook inspection service: NO;
- receiver/tunnel stopped after cleanup: YES.

Temporary webhook setting:
- provider webhook ID `6ac68919c5da8c7698cc9e83`;
- name `aimm-p1-t05-webhook-9afc94a25d3f4c40a192d08a`;
- Profile scope: Profile A `6ac5a45a8e4ca44f355033ae` only;
- subscribed event: `post.scheduled` only;
- active state: true;
- create HTTP 200 / request `b6c52985-4a06-4610-98f4-739ba0958d2b`;
- exact read-back: PASS / request `e71cfe67-bc65-4dbe-b268-ababbca3bbc0`.

Webhook test behavior:
- `POST /v1/webhooks/test`: provider 5xx / run BLOCKED;
- inbound `webhook.test` received by controlled receiver: NO;
- observed inbound delivery count: 0;
- therefore `X-Zernio-Event`, event ID, body/header ID equality, raw-body HMAC, and receiver acknowledgement latency were NOT OBSERVED live and are not claimed as Provider Behavior PASS;
- provider-test request ID was not emitted by the safe runner result and is not invented here.

Real retry trigger:
- scheduled Zernio post: NOT CREATED;
- temporary publishing key: NOT CREATED;
- immediate/public publication: NO;
- attempt 1 / attempt 2 retry evidence: NOT OBSERVED;
- stable canonical event ID across retry: NOT VERIFIED;
- logical unique event count: NOT VERIFIED;
- delivery logs attempt 1/2: NOT VERIFIED;
- no claim of live cross-Profile delivery isolation is made because no inbound webhook event arrived.

Cleanup:
- webhook DELETE HTTP 200 / request `ba0732b9-8f17-4d86-9d3c-204bc7bb8d45`;
- webhook cleanup read-back HTTP 200 / request `db1757db-cf8f-439f-8c73-999e16a2724c`;
- synthetic webhook absent after read-back: YES;
- scheduled-post cleanup: N/A, no post created;
- publishing-key cleanup: N/A, no key created;
- receiver/tunnel shutdown: YES;
- local copied `.env`, temporary cloudflared binary, and cloudflared process after task: absent.

Exact counts / cost safety:
- normal Zernio calls: 4;
- cleanup-allowance Zernio calls: 2;
- total Zernio API calls: 6;
- inbound webhook deliveries: 0;
- public publish: 0;
- Ads/ad spend: 0;
- OpenAI: 0;
- fal.ai: 0;
- unexpected paid action: NO.

### Blocker diagnosis and hardening
Zernio documents a webhook-test HTTP 500 as failure to obtain a successful endpoint response. The controlled receiver recorded no inbound request during the live run, so the failure occurred before receiver-side signature/HMAC processing could be observed. A separate earlier smoke test proved that this receiver + tunnel pattern could be reached externally, but it used a different ephemeral tunnel URL. The likely engineering diagnosis is an exact-live-tunnel readiness race; this is not recorded as a proven provider fact.

The harness now gates live provider execution on a bounded probe of the exact same HTTPS URL. The probe must reach the receiver and receive HTTP 401 for an unsigned request before any provider API call may begin. The live run was not repeated because the Task Contract authorized exactly one bounded live run.

Webhook delivery contract recommendation: **REMAIN PENDING — FIX/BLOCKER REQUIRED**.

No canonical webhook-related capability is promoted by P1-T05 implementation; Analytics Webhook remains `SPIKE_PENDING`.

## P1-T05-F01 — webhook.test Failure Diagnostics and Second Authorized Live Rerun

Status: `IMPLEMENTED — AWAITING TEAM LEADER RE-REVIEW`.

The historical P1-T05 live run above is preserved unchanged. P1-T05-F01 does not reinterpret its blocked `webhook.test` as PASS.

### Deterministic diagnostic hardening
- On `webhook.test` provider failure, the harness performs one and only one `GET /v1/webhooks/logs` before temporary-webhook cleanup.
- Query scope: exact temporary `webhookId`, `event=webhook.test`, `limit=5`; unrelated returned logs are ignored.
- No blind second `POST /v1/webhooks/test` is performed.
- Endpoint non-2xx evidence is preserved only as sanitized status/attempt metadata and classified precisely.
- Connection/timeout evidence or no matching delivery-log entry => `BLOCKED / WEBHOOK_TEST_DELIVERY_PATH_UNRESOLVED`.
- Unavailable log API => `BLOCKED / WEBHOOK_TEST_FAILURE_DIAGNOSTICS_UNAVAILABLE`.
- Exact-live-URL readiness must return receiver HTTP 401 before the provider callback can execute; failed readiness means zero Zernio calls.
- F01 focused suite: `13 passed / 0 failed`.
- Existing P1-T05 focused suite: `46 passed / 0 failed`.
- Full suite: `224 passed / 0 failed / 0 skipped` across 9 files.
- typecheck/build/diff-check: PASS.

### Second and only authorized live rerun
Command: `npm run p1-t05 -- --live`.

Observed result:
- result: `BLOCKED`;
- error category: `CONTROLLED_WEBHOOK_TEST_RECEIVER_NOT_AVAILABLE`;
- controlled receiver: local project Node receiver + temporary Cloudflare Quick Tunnel;
- exact final HTTPS URL readiness: FAIL;
- required readiness response: HTTP 401;
- observed successful readiness HTTP 401: NO;
- individual non-401 readiness responses and ephemeral URL were not emitted/persisted by the safe failure path and are therefore not reconstructed;
- Zernio API calls before readiness PASS: 0;
- trusted identity call: NOT RUN;
- webhook creation: NOT RUN;
- webhook.test: NOT RUN;
- webhook-test failure log diagnostics: N/A for this rerun because no provider webhook/test call occurred;
- temporary publishing key: NOT CREATED;
- scheduled synthetic post: NOT CREATED;
- inbound webhook deliveries: 0;
- automatic retry attempts: NOT RUN;
- provider delivery logs attempts 1/2: NOT RUN;
- public publication: NO;
- Ads/ad spend/media/OpenAI/fal.ai/comments/DMs/analytics ingestion: 0.

Cleanup after rerun #2:
- copied local `.env`: removed;
- temporary cloudflared binary: removed;
- cloudflared processes: 0;
- provider webhook/key/post cleanup: N/A because none were created.

Live rerun count for P1-T05-F01: exactly `1`.
Third live run: `NO` and not authorized.

Webhook delivery contract recommendation: **REMAIN PENDING — FIX/BLOCKER REQUIRED**.

Canonical webhook-related capability statuses remain `SPIKE_PENDING`; Analytics Webhook remains `SPIKE_PENDING`.


## P1-T05-F02 — VPS HTTPS Receiver Verification

Status: `IMPLEMENTED — AWAITING TEAM LEADER RE-REVIEW`.

### Deterministic VPS receiver hardening
- Starting HEAD: `dd1ea010a275ec998017822e87572b44be92d79f`.
- Implementation checkpoint: `7b8e5738191854fb67443607188e53ff389920ed`.
- Nginx receiver evidence-label correction checkpoint: `fb71179edf51a1830472b88bd505520d585934e0`.
- F02 live path uses only the existing project VPS topology; no Railway, Cloudflare Quick Tunnel, request-bin, ngrok, or other temporary hosting-provider dependency was introduced.
- The accepted P1-T05 receiver semantics remain authoritative for HMAC, JSON-after-signature, canonical event ID checks, retry dedupe/state, Profile attribution, request ceilings, failure diagnostics, and cleanup.
- VPS additions are limited to exact path/port configuration and a readiness handshake. The receiver generates no production persistence or queueing subsystem.
- Readiness PASS requires trusted HTTPS, no redirect, exact HTTP 401, exact receiver marker, then a confirmation request observed by the same receiver process before the Zernio callback is allowed.
- Focused F02 suite: `12 passed / 0 failed`.
- F01 suite: `13 passed / 0 failed`.
- Parent P1-T05 suite: `46 passed / 0 failed`.
- Full suite: `236 passed / 0 failed / 0 skipped` across 10 test files.
- typecheck/build/diff-check: PASS.

### VPS readiness / authorized F02 live invocation
Historical live run #1 and P1-T05-F01 live rerun #2 remain preserved above unchanged. P1-T05-F02 received separate authorization for exactly one live invocation after project-VPS readiness PASS.

The earlier Oracle/TIA VPS-candidate note is superseded and invalid as project evidence. No other-project infrastructure, credential, SSH key, hostname, or service is part of the F02 execution path.

Observed controlled VPS readiness:
- dedicated project hostname: `marketlyai.restartorg.com`;
- project VPS address: `82.29.177.121`;
- reverse proxy: dedicated Nginx server block/path for F02;
- exact HTTPS endpoint reached the same controlled Node receiver through the SSH reverse tunnel;
- TLS success: YES;
- exact readiness response: HTTP `401`;
- receiver marker match: YES;
- same-process confirmation: YES;
- redirect observed: NO;
- readiness latency: `1249 ms`;
- readiness timestamp: `2026-10-12T18:22:19.109Z`;
- readiness result: PASS.

Authorized F02 live invocation:
- invocation count: exactly `1`;
- provider-stage result: `BLOCKED — MISSING_LIVE_CREDENTIAL`;
- failure occurred before the first Zernio request;
- safe diagnosis: the current F02 working clone `.env` exists but does not define `ZERNIO_API_KEY` or `ZERNIO_EXPECTED_USER_EMAIL`; the original accepted workspace contains those variable names;
- secret values were not read, copied, emitted, logged, committed, or documented;
- trusted identity preflight: NOT RUN;
- webhook create/read-back: NOT RUN;
- `webhook.test`: NOT RUN;
- publishing key: NOT CREATED;
- scheduled retry trigger: NOT CREATED;
- real delivery attempts 1/2: NOT RUN;
- delivery logs attempts 1/2: NOT RUN;
- normal Zernio calls: `0`;
- cleanup-allowance Zernio calls: `0`;
- total Zernio calls: `0`.

Cleanup:
- Node receiver stopped after the blocked invocation;
- SSH reverse tunnel stopped;
- operator completed temporary F02 route cleanup and confirmed dedicated port `18085` clear;
- provider cleanup: N/A because no provider artifact was created.

Cost/safety:
- incremental VPS cost observed: `0`;
- public publication: `0`;
- Ads/ad spend: `0`;
- media: `0`;
- OpenAI: `0`;
- fal.ai: `0`;
- comments/DMs: `0`;
- unexpected paid action: NO.

No second F02 live invocation is authorized under the current Task Contract. Any retry requires explicit Team Leader authorization after correcting the credential-injection gap.

Webhook delivery contract recommendation: **REMAIN PENDING — FIX/BLOCKER REQUIRED**.

Canonical webhook-related capabilities remain `SPIKE_PENDING`; Analytics Webhook remains `SPIKE_PENDING`.
## P1-T05-F03 — Final Zernio Webhook Live Verification

Status: `DONE / ACCEPTED`.

Team Leader verdict: `ACCEPTED WITH NON-BLOCKING NOTES`.
Accepted F03 evidence/review HEAD: `23a09352b977853178cccb432893f542d6c3d2e3`.
Last code-bearing implementation checkpoint: `fb71179edf51a1830472b88bd505520d585934e0`.

Exactly one authorized F03 live invocation was performed using the existing project VPS receiver architecture. Credentials were injected from the original ignored local `.env` into process memory only.

### Live Provider Behavior
- identity preflight: PASS; run `d7b58414-24f0-4582-a991-5ba8bd4388c4`; HTTP 200; request `2da21db4-b38d-483d-b173-c4782bc8c8a4`;
- webhook `6acda866ce92dc3eec124667`: Profile A only, `post.scheduled`, create/read-back PASS;
- `webhook.test`: signature valid, canonical IDs matched, receiver HTTP 204, event `c6354814-7742-44f9-b7db-a4d43e0cb522`;
- scheduled post `6acda8697c472b7066436771`: create/read PASS, public publication NO, cleanup GET 404;
- temporary publishing key `6acda8676e670278f93d9841`: revoke PASS, post-revoke auth HTTP 401;
- real attempt 1: event `a6e9cbae-5bfb-42b3-9b0f-1c9aeb67d178`, valid signature/Profile attribution, receiver HTTP 500;
- retry: same event ID, payload ID and body hash about 10.959 s later; duplicate=true; receiver HTTP 204;
- logical unique real events: 1;
- foreign Profile delivery observed: NO.

### Remaining blocker
After retry observation the harness performs one bounded provider-log validation after a fixed 500 ms wait. The safe final output contained `logs=null` and ended `BLOCKED — WEBHOOK_LOGS_INCOMPLETE`.

The safe result does not expose enough underlying log-query evidence to determine whether the cause was missing attempt rows, eventual consistency, or another provider/log response condition. None of those explanations is recorded as provider fact, and no extra provider call or F03 rerun was performed.

### Cleanup / bounds
- post cleanup confirmed;
- scoped-key cleanup confirmed;
- webhook cleanup confirmed;
- normal calls: 11 / 24;
- cleanup calls: 6 / 6;
- total calls: 17;
- public publication: 0;
- Ads/ad spend/media/OpenAI/fal.ai/comments/DMs: 0.

Observed F03 harness result: **BLOCKED — WEBHOOK_LOGS_INCOMPLETE**.

That result is preserved as observed evidence and does not certify `/v1/webhooks/logs`. Team Leader classified the insufficient delivery-log correlation as a **non-blocking provider-observability limitation** because direct controlled-receiver evidence independently proved the required Generic Webhook Delivery Contract behaviors: signature verification, canonical/stable event ID, duplicate delivery handling, automatic retry behavior, event payload handling, acknowledgement timing, and the tested `post.scheduled` event category.

Known limitation: `Zernio /v1/webhooks/logs delivery-attempt correlation/timing remains unverified; F03's single bounded query returned insufficient evidence. Direct receiver evidence independently proved delivery and retry behavior.`

No claim is made that provider logs are eventually consistent, broken, delayed by a specific duration, or verified.

P1-T05 Team Leader verdict: **ACCEPTED WITH NON-BLOCKING NOTES**.
P1-T05 canonical status: **DONE / ACCEPTED**.
Earlier `SPIKE_PENDING` recommendations in historical P1-T05/F01/F02 sections are preserved as point-in-time evidence and are superseded by this final acceptance.
Generic Webhook Delivery Contract: **`SPIKE_PASS`**.
Analytics Webhook: **`SPIKE_PENDING`**.
Do not infer analytics-event support from the generic `post.scheduled` webhook test.

## P1-T06 — Zernio Analytics Bootstrap & Cursor Provider Behavior

Status: `DONE / ACCEPTED WITH NON-BLOCKING NOTES`.

Accepted implementation HEAD: `513e9505de115d5a39f30964d2d5aca7594ef708`.

Starting HEAD: `e75591272aa8e58dfd4be7619d3364c3c874ef73`. Branch: `p1-t06-zernio-analytics-bootstrap`. This is a bounded Provider Behavior spike only; no production analytics subsystem was built.

### Deterministic validation
- focused P1-T06: `20 passed / 0 failed`;
- affected P1-T03/P1-T04/P1-T05/P1-T06 suites: `194 passed / 0 failed` across 8 files;
- full suite: `256 passed / 0 failed / 0 skipped` across 11 files;
- typecheck/build/diff-check: PASS.

### Single authorized live run
Identity:
- HTTP 200; expected trusted identity matched; run `5c079041-8da4-4d28-8998-5f7c0ef30d18`; request `e1a6e31f-7227-4228-8821-cadc221f4c52`; latency 480 ms.

Temporary scoped runtime key:
- provider key ID `6ace176b8030c7c0e9ee7628`; synthetic name `aimm-p1-t06-analytics-0199cb92-a5bc-4308-bfd7-95d7bec65eb4`; scope `profiles`; Profile A only; permission `read`; bounded expiry `2026-10-14T11:35:07.884Z`; raw key secret absent from evidence/docs.

Analytics target:
- Profile A `6ac5a45a8e4ca44f355033ae`; Facebook account `6ac64f8740364f4695dd3077`; platform `facebook`; exact target validated; foreign Profile/account observed: NO; account-list response did not expose a boolean analytics-access flag.

Initial cursor capture — performed before baseline:
- HTTP 200; request `92d83152-c30c-4580-8b7a-6ee7750e7e6a`; initial data count 0; `nextCursor` present; `hasMore=false`; full cursor not persisted in evidence; safe SHA-256 prefix fingerprint `3c6554c117d389a3`.

Historical baseline:
- exact filters: Profile A + expected account + facebook + source=all; window `2026-07-16` to `2026-10-13`; small page size; page 1 and page 2 both explicitly probed;
- page 1 HTTP 200 request `5c6f3066-f756-4c8f-8845-862338fac225`; page 2 HTTP 200 request `85a5366c-62dd-43cc-9fcc-0be0ce35bcb4`;
- records 0; provider pagination total 0 / pages 1; response fields observed: accounts, hasAnalyticsAccess, overview, pagination, posts; `hasAnalyticsAccess=true`; valid empty dataset; metric fields/status/lastUpdated unavailable because no records existed.

Delta from original pre-baseline cursor:
- original captured cursor used: YES; one page HTTP 200 request `5277a874-a448-4ea1-91da-80f3974a29b6`; 0 delta items; `hasMore=false`; `nextCursor` present; safe fingerprint remained `3c6554c117d389a3`; no cursor advancement was needed because `hasMore=false`;
- changes during baseline import: `CHANGES_DURING_IMPORT_NOT_OBSERVED`; no mutation/polling was used to manufacture a change.

Negative cursor behavior:
- one synthetic invalid-cursor request only; HTTP 400; request `b8ea0fbd-ac4d-42ca-b316-4e731a71e7cc`; safe code `invalid_field_value`; no nextCursor; no automatic retry;
- expired cursor: `EXPIRED_CURSOR_BEHAVIOR_UNVERIFIED`. No expired-cursor fact or TTL is inferred from invalid-cursor behavior.

Rate-limit observations:
- normal account preflight exposed limit 60; analytics requests exposed limit 6 with remaining/reset headers; HTTP 429 naturally observed: NO; automatic retry: NO.

Cleanup / bounds:
- key revoke HTTP 200 request `a89b48f4-1b8f-40c9-8688-cc57a03b7d65`; post-revoke auth HTTP 401 request `444e6502-409b-449a-9a61-579d782bcb9d`; revoked key valid: NO; cleanup confirmed;
- 8 normal / 2 cleanup / 10 total Provider calls; public publication 0; Ads/ad spend 0; media 0; OpenAI 0; fal.ai 0; comments/DMs 0.

Observed unresolved Provider behaviors — preserved as non-blocking limitations, not Provider facts:
- `EXPIRED_CURSOR_BEHAVIOR_UNVERIFIED`;
- `CHANGES_DURING_IMPORT_NOT_OBSERVED`;
- non-empty Analytics Delta pagination was not observed live;
- actual historical analytics metric-record field shapes were not observed because the valid baseline was empty;
- natural HTTP 429 was not observed.

Team Leader verdict: **ACCEPTED WITH NON-BLOCKING NOTES**.

Analytics Bootstrap & Cursor Contract: **`SPIKE_PASS`**.
Historical Analytics: **`SPIKE_PENDING`**.
Analytics Delta: **`SPIKE_PENDING`**.
Best Times: **`SPIKE_PENDING`**.
Performance Decay: **`SPIKE_PENDING`**.
Frequency Analysis: **`SPIKE_PENDING`**.
Analytics Webhook: **`SPIKE_PENDING`**.

Historical Analytics / Analytics Delta require later Provider evidence sufficient to close their remaining live-behavior gaps before Phase 1 exit.

## P1-T07 - Zernio Derived Analytics Signals Provider Behavior

Status: `DONE / ACCEPTED WITH NON-BLOCKING NOTES`.

Starting HEAD: `84ddc7c3817eb93cecb18a91362e874e2ace0514`. Accepted implementation HEAD: `a2ed6f4e37f1919784a00cce1449a5889f8bf5d8`. Branch: `p1-t07-zernio-analytics-signals`. This is a bounded Provider Behavior spike only; no production Analytics subsystem, durable state, worker, queue, dashboard, report, strategy engine, or recommendation engine was built.

### Provider contract discovery - DOC_CONFIRMED

Current Zernio documentation available on `2026-10-13` identified these read-only Analytics contracts before live execution:
- Best Times: `GET /v1/analytics/best-time`; filters `platform`, `profileId`, `accountId`, `source`; documented output container `slots`; documented day/hour semantics are UTC.
- Performance Decay: `GET /v1/analytics/content-decay`; same target filters; documented output container `buckets`.
- Frequency Analysis: `GET /v1/analytics/posting-frequency`; same target filters; documented output container `frequency`.

Documentation establishes only `DOC_CONFIRMED`. It does not establish live Provider behavior, data availability, entitlement, calculation formula, sample threshold, or target isolation by itself.

### Deterministic validation before the authorized live run
- focused P1-T07 suite: `22 passed / 0 failed`;
- affected Provider-spike suites: `192 passed / 0 failed` across 8 files;
- full suite: `278 passed / 0 failed / 0 skipped` across 12 files;
- `npm run typecheck`: PASS;
- `npm run build`: PASS;
- `git diff --check`: PASS.

### Single authorized live Provider run - LIVE_PROVIDER_OBSERVED

Exactly one P1-T07 live invocation was performed. No second live invocation is authorized or performed.

Identity:
- HTTP 200; trusted expected identity matched;
- run `1f26a94e-88e9-466f-a163-68732dc771f5`;
- request `a56dad53-3511-4914-89a3-4bb2fe6eca2a`;
- timestamp `2026-10-13T13:50:20.696Z`.

Temporary scoped runtime key:
- provider key ID `6ace371c57e8c83e860ba276`;
- synthetic name `aimm-p1-t07-analytics-signals-f41cd6ec-44ef-4f92-b446-c8cc`;
- scope `profiles`;
- permitted Profile A `6ac5a45a8e4ca44f355033ae` only;
- permission `read`;
- expiry `2026-10-14T13:50:20.925Z`;
- create HTTP 201 / request `2dab6ac9-f18b-4d99-8902-8ee9fb0d439b`;
- raw scoped-key secret exposed/persisted: NO.

Exact analytics target preflight:
- Profile A `6ac5a45a8e4ca44f355033ae`;
- Facebook account `6ac64f8740364f4695dd3077`;
- platform `facebook`;
- HTTP 200 / request `3003b6fc-b93d-4733-b8b2-84b9169ff22a`;
- exact target validation: PASS;
- foreign Profile/account observed: NO;
- the account response did not expose a boolean `hasAnalyticsAccess` value in this run; no availability conclusion is inferred from that missing field.

Best Times:
- request: `GET /v1/analytics/best-time` with exact Profile A/account/facebook/source=all filters;
- HTTP 200 / request `eb60dff1-3848-4cb8-b563-205a750f661d`;
- live top-level field: `slots`;
- live records: 0;
- internal harness classification: `SUCCESS_INSUFFICIENT_DATA` = successful Provider response with no usable signal rows in this run; this does not establish a Provider minimum sample threshold or explain why the array was empty;
- target attribution: `NOT_APPLICABLE_EMPTY`; there was no non-empty row from which to observe explicit target-attribution fields;
- documented UTC day/hour semantics are retained as documentation metadata, not inferred from live rows;
- capability recommendation: `REMAIN PENDING - INSUFFICIENT LIVE EVIDENCE`.

Performance Decay:
- request: `GET /v1/analytics/content-decay` with exact Profile A/account/facebook/source=all filters;
- HTTP 200 / request `e69b12ec-c5ea-49d7-a7cf-37c5513f6148`;
- live top-level field: `buckets`;
- live records: 0;
- internal harness classification: `SUCCESS_INSUFFICIENT_DATA` = successful Provider response with no usable signal rows in this run; this does not establish a Provider minimum sample threshold or explain why the array was empty;
- target attribution: `NOT_APPLICABLE_EMPTY`;
- Provider calculation formula/half-life/weighting is not inferred; semantics remain `PROVIDER_OPAQUE`;
- capability recommendation: `REMAIN PENDING - INSUFFICIENT LIVE EVIDENCE`.

Frequency Analysis:
- request: `GET /v1/analytics/posting-frequency` with exact Profile A/account/facebook/source=all filters;
- HTTP 200 / request `d8567070-2cc7-4065-8f7d-e0e8e7059357`;
- live top-level field: `frequency`;
- live records: 0;
- internal harness classification: `SUCCESS_INSUFFICIENT_DATA` = successful Provider response with no usable signal rows in this run; this does not establish a Provider minimum sample threshold or explain why the array was empty;
- target attribution: `NOT_APPLICABLE_EMPTY`;
- no causal or guaranteed-optimal-frequency claim is made; calculation semantics remain `PROVIDER_OPAQUE`;
- capability recommendation: `REMAIN PENDING - INSUFFICIENT LIVE EVIDENCE`.

Rate-limit observations:
- exact account preflight exposed limit `60`, remaining `57`;
- Best Times exposed limit `6`, remaining `5`;
- Performance Decay exposed limit `6`, remaining `4`;
- Frequency Analysis exposed limit `6`, remaining `3`;
- natural HTTP 429 observed: NO;
- `Retry-After` observed in this live run: NO;
- automatic Provider retry: NO.

Cleanup / request bounds:
- key revoke HTTP 200 / request `524319d5-f0ff-414e-90d0-02b4939ea199`;
- post-revoke auth HTTP 401 / request `ef746e7b-9d07-4b8d-91fb-215e23d554e1`;
- revoked credential valid: NO;
- cleanup confirmed: YES;
- normal calls: `6 / 16`;
- cleanup calls: `2 / 4`;
- total calls: `8`;
- social/public mutations: 0;
- posts: 0;
- media: 0;
- Ads/ad spend: 0;
- comments/DMs: 0;
- webhook operations: 0;
- OpenAI: 0;
- fal.ai: 0.

### Recommendation and unresolved Provider behavior

P1-T07 Team Leader verdict: **ACCEPTED WITH NON-BLOCKING NOTES**.

Accepted implementation HEAD: `a2ed6f4e37f1919784a00cce1449a5889f8bf5d8`.

Canonical capability states remain:
- Best Times: `SPIKE_PENDING`;
- Performance Decay: `SPIKE_PENDING`;
- Frequency Analysis: `SPIKE_PENDING`.

No pending Analytics capability is promoted by this acceptance.

P1-T07 unresolved observations:
- non-empty live record/value shapes = `UNVERIFIED`;
- explicit target-attribution fields on non-empty signals = `UNVERIFIED`;
- minimum sample/data thresholds = `UNVERIFIED`;
- formulas / weighting / confidence methods / detailed calculation semantics = `PROVIDER_OPAQUE / UNVERIFIED`;
- natural HTTP 429 = `NOT OBSERVED`;
- the empty arrays do not prove a specific Provider threshold or cause.

P1-T06 limitations remain unchanged and are not silently closed by P1-T07:
- `EXPIRED_CURSOR_BEHAVIOR_UNVERIFIED`;
- `CHANGES_DURING_IMPORT_NOT_OBSERVED`;
- non-empty Analytics Delta pagination was not observed live;
- actual historical analytics metric-record field shapes were not observed because the valid baseline was empty;
- natural HTTP 429 was not observed.

Canonical state after Team Leader acceptance: Historical Analytics `SPIKE_PENDING`; Analytics Delta `SPIKE_PENDING`; Best Times `SPIKE_PENDING`; Performance Decay `SPIKE_PENDING`; Frequency Analysis `SPIKE_PENDING`; Analytics Webhook `SPIKE_PENDING`.
## P1-T08 - Zernio analytics.synced Webhook Provider Behavior

Status: `IMPLEMENTED — AWAITING TEAM LEADER RE-REVIEW`.

Starting HEAD: `d2e12882b96d04395b92c944735ebf8bc860b211`. Branch: `p1-t08-zernio-analytics-webhook`.

### Provider contract discovery - DOC_CONFIRMED
Current Zernio Analytics Webhooks documentation checked on `2026-10-13` identifies the event `analytics.synced`. The current request-body schema requires `id`, `event`, `account`, `sync`, and `timestamp`; optional top-level fields include `profiles` and `test`. Documented `account` fields include `accountId`, `profileId`, `platform`, and `username`; documented `sync` metadata includes `syncedAt` and `postsUpdated`.

The current schema text describes the event as poll-driven, roughly hourly per connected account after successful analytics sync cycles, and as a trigger rather than a metrics transport: metrics and cursor are not expected in the current request-body schema. Introductory prose on the same page contains conflicting wording that mentions handing consumers a cursor. This discrepancy is preserved as documentation drift; no cursor behavior is promoted to Provider fact without live observation. The current docs recommend a dedicated Analytics webhook subscription. Documentation source: `https://docs.zernio.com/webhooks/analytics`.

This is `DOC_CONFIRMED`, not `LIVE_PROVIDER_OBSERVED`.

### Deterministic implementation evidence
- minimal P1-T08 receiver verifies lower-case hex HMAC-SHA256 over exact raw bytes before JSON parsing;
- requires `X-Zernio-Event-Id == payload.id` and header/body event consistency;
- accepts only `analytics.synced` for Analytics processing;
- requires explicit Profile A `6ac5a45a8e4ca44f355033ae`, account `6ac64f8740364f4695dd3077`, and platform `facebook` attribution for certification;
- foreign Profile/account => Critical; wrong platform => Critical; insufficient attribution => BLOCKED;
- additive metrics/cursor fields are recorded as contract drift instead of silently rejected or trusted as production authority;
- dedupe is in-memory by canonical event ID; valid duplicate stays one logical event;
- successful valid delivery acknowledgement is HTTP 204 and deterministic tests enforce <5 seconds;
- passive observation performs no Provider API polling;
- temporary webhook scope is exactly Profile A + `analytics.synced` only;
- normal Provider ceiling 10; cleanup allowance 4;
- cleanup requires webhook DELETE plus settings read-back proving exact temporary webhook absent;
- `/v1/webhooks/logs` is not a PASS requirement.

Validation after the final offline fix:
- focused P1-T08: `24 passed / 0 failed`;
- affected Provider-spike suites: `199 passed / 0 failed` across 9 files;
- full suite: `302 passed / 0 failed / 0 skipped` across 13 files;
- `npm run typecheck`: PASS;
- `npm run build`: PASS;
- `git diff --check`: PASS.

### LIVE_PROVIDER_OBSERVED
No P1-T08 live Provider observation was executed because the required exact VPS HTTPS readiness path could not be safely established from the current execution context.

Pre-live infrastructure evidence:
- project VPS: `marketlyai.restartorg.com` / `82.29.177.121`;
- TCP/22 reachable: YES;
- candidate dedicated local port `18086`: clear;
- project-specific SSH key present locally: YES;
- non-interactive SSH authentication available to this execution context: NO;
- existing human SSH session observed: YES, intentionally untouched;
- temporary P1-T08 Nginx route created: NO;
- SSH reverse tunnel created: NO;
- exact final HTTPS readiness probe PASS: NOT RUN because the dedicated route/tunnel was not established;
- authorized P1-T08 live Provider invocation: NOT RUN;
- Zernio calls: `0 normal / 0 cleanup / 0 total`;
- temporary webhook: NOT CREATED;
- inbound analytics.synced deliveries: NOT OBSERVED / observation not started;
- Provider/public/social mutation: 0.

No credential extraction or exposure was attempted. The blocker is recorded as `CONTROLLED_VPS_WEBHOOK_RECEIVER_NOT_AVAILABLE` / pre-live infrastructure authorization dependency, not as Zernio Provider behavior.

### P1-T08-F01 resumed exact-readiness evidence
The Team Leader later authorized continuation of the same F01 after an independent human operator established the accepted project-VPS topology with the existing authorized SSH credential. This did not create a new live-run allowance.

Pre-Provider validation was rerun before the first possible Zernio request and remained green: focused P1-T08 `24 / 24 PASS`; affected Provider-spike suites `199 / 199 PASS` across 9 files; full suite `302 / 302 PASS` across 13 files; `npm run typecheck` PASS; `npm run build` PASS; `git diff --check` PASS.

Human-assisted infrastructure evidence before readiness:
- controlled local receiver on `127.0.0.1:18086`: ACTIVE;
- accepted SSH reverse-tunnel topology: ACTIVE;
- one temporary P1-T08 Nginx route: ACTIVE;
- exact external URL: `https://marketlyai.restartorg.com/p1-t08-f01/analytics-synced`.

Exact external HTTPS readiness then failed **before any Zernio request**:
- overall readiness: FAIL;
- error category: `VPS_READINESS_TLS_OR_NETWORK_FAILURE`;
- latency: `378 ms`;
- TLS success: false;
- HTTP status: not reached;
- unsigned 401: not reached;
- receiver marker: not confirmed;
- same-process confirmation: not reached;
- redirect: not observed because the HTTP layer was not reached.

Per F01 fail-closed rules, execution stopped immediately. Provider evidence for this resumed attempt:
- authorized F01 live Provider run: **UNCONSUMED**;
- Zernio calls: `0 normal / 0 cleanup / 0 total`;
- temporary webhook: NOT CREATED;
- passive observation window: NOT STARTED;
- inbound `analytics.synced` deliveries: 0;
- posts / publishing / media / Ads or spend / comments / DMs / OpenAI / fal.ai: 0.

Cleanup evidence:
- local receiver stopped: VERIFIED;
- local port `18086` clear: VERIFIED;
- P1-T08 Node process remaining: NO;
- temporary VPS Nginx route and reverse-tunnel rollback: HUMAN-OPERATOR CONFIRMED after interactive `sudo` was required;
- no private key, passphrase, sudo password, Zernio API key, expected email, or webhook secret was exposed.

This resumed attempt does not establish any live `analytics.synced` payload behavior. Current blocker/outcome is `VPS_READINESS_TLS_OR_NETWORK_FAILURE`; the earlier SSH-control blocker above remains historical evidence and is not rewritten.

Analytics Webhook recommendation: **REMAIN PENDING - FIX/BLOCKER REQUIRED**.
Canonical Analytics Webhook remains **`SPIKE_PENDING`** pending Team Leader re-review; no further readiness attempt or Provider execution is authorized by F01 after this failure.

Known project limitation remains unchanged: `Zernio /v1/webhooks/logs delivery-attempt correlation/timing remains UNVERIFIED`. P1-T08 does not reopen that investigation.

Historical Analytics, Analytics Delta, Best Times, Performance Decay, and Frequency Analysis all remain `SPIKE_PENDING`. P1-T06/P1-T07 unresolved behavior is unchanged.
## P1-T08-F02 — Public HTTPS Readiness Diagnosis

Status: `DONE / ACCEPTED`.
Accepted evidence HEAD: `5856591832093ea62a1dbf703cede7cad34e1bfb`.
Team Leader verdict: `ACCEPTED`.
Infrastructure Readiness: `PROVEN`.

This section is infrastructure/readiness evidence only, not Provider Behavior. No Zernio request was made.

- Starting HEAD: `18abad50cf3ddc9fa1afdae431818dd8ff9bcf41`; branch `p1-t08-zernio-analytics-webhook`.
- DNS PASS: A `82.29.177.121`, TTL `14400`, no effective AAAA/CNAME from local and Google Public DNS views.
- TCP/443 PASS.
- Initial trusted TLS FAIL exposed certificate `clinic.restartorg.com`, issuer Let's Encrypt R12, validity ending `2026-06-12`, with hostname mismatch and time invalidity. Insecure diagnostic HTTP returned `301` to `https://clinic.restartorg.com/`.
- Nginx inspection proved no enabled `marketlyai.restartorg.com` vhost. Precise root cause: `NGINX_HTTPS_VHOST_MISCONFIGURED`.
- Permanent existing-hostname repair established an enabled marketlyai vhost and trusted certificate. Post-repair certificate: CN/SAN `marketlyai.restartorg.com`, issuer Let's Encrypt `YR2`, valid `2026-10-13` to `2027-01-11`; trusted client authorization PASS; base HTTPS `404`, no redirect. `marketlyai.restartorg.com` now has its correct enabled HTTPS vhost and trusted certificate.
- Existing P1-T08 receiver reused unchanged on `127.0.0.1:18086` at `/p1-t08-f02/analytics-synced`; local readiness and confirmation each returned `401` with the expected marker.
- Accepted reverse tunnel proved VPS loopback -> same receiver; same-process counters reached `2/2` with `0` deliveries.
- One narrow temporary Nginx exact-match route was added only for `/p1-t08-f02/analytics-synced`; `nginx -t` PASS before reload.
- VPS-local trusted HTTPS isolation PASS; same-process counters reached `3/3`, deliveries `0`.
- External exact readiness PASS from Senior environment: trusted TLS PASS, HTTP `401`, receiver marker match, same-process confirmation, no redirect, latency `1145 ms`, timestamp `2026-10-13T17:28:34.486Z`; final counters `4/4`, deliveries `0`.
- Cleanup: human operator confirmed temporary F02 route removal and reverse-tunnel stop; permanent valid DNS/TLS/vhost repair intentionally remained. Senior verified receiver termination, local port `18086` clear, and no F02 Node process remaining.
- Provider calls: `0 normal / 0 cleanup / 0 total`; `/v1/auth/verify`: 0; webhook mutations: 0; analytics polling: 0; Provider live run: **UNCONSUMED**.

P1-T08-F02 recommendation: **INFRASTRUCTURE READINESS PROVEN**.
P1-T08-F02 canonical state: **DONE / ACCEPTED**.
Canonical Analytics Webhook remains **`SPIKE_PENDING`**. Parent P1-T08 remains unresolved because no live `analytics.synced` Provider delivery has yet been verified. Provider live run remains **UNCONSUMED**. This acceptance is infrastructure evidence only and does not establish Provider Behavior.
## P1-T08-F03 — Live analytics.synced Provider Verification

Status: `IMPLEMENTED — AWAITING TEAM LEADER RE-REVIEW`.

This section records the single authorized F03 live Provider run. It does not promote the canonical capability state.

### Permanent infrastructure sanity
- DNS: PASS; `marketlyai.restartorg.com -> 82.29.177.121`.
- TCP/443: PASS.
- Trusted TLS: PASS for CN/SAN `marketlyai.restartorg.com`, certificate valid through `2027-01-11`.
- Base HTTPS: expected `404`; no redirect to `clinic.restartorg.com`.

### Pre-Provider validation
- focused P1-T08: `24 / 24 PASS`;
- affected Provider-spike suites: `199 / 199 PASS` across 9 files;
- full suite: `302 / 302 PASS` across 13 files;
- `npm run typecheck`: PASS;
- `npm run build`: PASS;
- `git diff --check`: PASS.

### Temporary F03 infrastructure and runner readiness
- exact URL: `https://marketlyai.restartorg.com/p1-t08-f03/analytics-synced`;
- reverse tunnel: PASS;
- local port `18086`: clear before runner ownership;
- runner exact readiness: PASS;
- trusted TLS: true;
- unsigned HTTP status: `401`;
- receiver marker match: true;
- same-process confirmation: true;
- redirected: false;
- latency: `887 ms`;
- timestamp: `2026-10-14T00:42:43.411Z`.

### LIVE_PROVIDER_OBSERVED
The first Provider request consumed the single authorized F03 run.

Trusted identity:
- `GET /v1/auth/verify`: HTTP `200`;
- exact identity match: true;
- safe request ID: `a4d4a31c-bb9f-469e-a330-8a8a43c038be`;
- latency: `616 ms`;
- evidence timestamp: `2026-10-14T00:42:44.915Z`.

Webhook creation:
- exactly one `POST /v1/webhooks/settings` attempt;
- HTTP `400`;
- safe request ID: `211cf0c8-6751-4fbb-8e86-5475770e9ca8`;
- webhook ID: none;
- webhook object: null;
- read-back: NOT STARTED;
- passive observation: NOT STARTED;
- inbound `analytics.synced` deliveries: 0.

Root cause is a genuine implementation defect: `HARNESS_WEBHOOK_NAME_LENGTH_EXCEEDS_PROVIDER_LIMIT`. The accepted runner constructs a 29-character prefix (`aimm-p1-t08-analytics-synced-`) plus a 24-character run tag, producing a 53-character webhook name. Current Zernio `POST /v1/webhooks/settings` documentation limits `name` to 1-50 characters. The defect was not fixed and F03 was not rerun.

Provider calls: `2 normal / 0 cleanup / 2 total`. Provider cleanup was not applicable because the create attempt returned `400` and no webhook was created or identified.

Infrastructure cleanup:
- temporary F03 Nginx route removed: HUMAN-OPERATOR CONFIRMED;
- reverse tunnel stopped: HUMAN-OPERATOR CONFIRMED;
- runner/receiver stopped: VERIFIED;
- local port `18086` clear: VERIFIED;
- no F03 Node runner process: VERIFIED;
- base marketlyai HTTPS remains `404` with trusted TLS;
- exact F03 path returns `404` after cleanup;
- permanent marketlyai DNS/TLS/vhost repair retained.

External actions remained zero: posts, publishing, media, Ads/spend, comments/DMs, OpenAI, and fal.ai.

No live payload was observed, so live signature/ID/target attribution/ACK behavior for `analytics.synced` remains unverified. Known `/v1/webhooks/logs` delivery-attempt correlation/timing limitation remains unchanged.

### Post-run validation
- focused P1-T08: `24 / 24 PASS`;
- affected Provider-spike suites: `199 / 199 PASS` across 9 files;
- full suite: `302 / 302 PASS` across 13 files;
- `npm run typecheck`: PASS;
- `npm run build`: PASS;
- `git diff --check`: PASS.

Analytics Webhook recommendation: **REMAIN PENDING — FIX/BLOCKER REQUIRED**.
Canonical Analytics Webhook remains **`SPIKE_PENDING`**. Parent P1-T08 maximum state is **`IMPLEMENTED — AWAITING TEAM LEADER RE-REVIEW`**. F03 live run is **CONSUMED**; no second F03 run is authorized.
## P1-T08-F04 — Webhook Name Length Safety

Status: `DONE / ACCEPTED`.
Accepted implementation HEAD: `b55bf0713090f5a729ac1f4688f79b692347ce96`.
Team Leader verdict: `ACCEPTED`.
Approved starting HEAD: `f34456ecb16ea67040a2a5d8948eda7d7729ae53`.

This is implementation/regression evidence only. It does not establish new live Provider behavior.

Root cause from F03 remains `HARNESS_WEBHOOK_NAME_LENGTH_EXCEEDS_PROVIDER_LIMIT`: accepted prefix length `29` plus the live 24-character run tag produced `53`, while the documented Provider maximum is `50`. F03 live run remains **CONSUMED**.

F04 fixes the defect at the construction boundary used by `runP1T08`:
- one deterministic `buildP1T08WebhookName` builder/guard;
- recognizable prefix preserved as `aimm-p1-t08-analytics-synced-`;
- maximum name length encoded as `50`;
- existing allowed-character sanitization preserved;
- suffix capacity derived as `50 - 29 = 21`;
- sanitized suffix truncated to that derived capacity;
- final bounds guarded before create transport; invalid internal construction fails closed.

Deterministic offline builder evidence:
- exact 24-character prior live-shape tag: final name length `50`;
- 200-character overlong synthetic tag: final name length `50`;
- no Provider request was made to obtain these values.

Safety invariants preserved:
- Profile scope exactly Profile A only;
- event scope exactly `analytics.synced` only;
- exact receiver URL unchanged;
- trusted identity gate, request ceilings, read-back validation, cleanup, signature verification, target attribution, and passive observation logic unchanged;
- configured API key, expected identity, and webhook secret are absent from generated name/evidence.

Regression evidence:
- existing T08-06 strengthened to require correct prefix and `name.length <= 50`;
- F04-01 through F04-10 added, including the prior 24-character live shape, overlong pre-transport capping, create-body name verification, Profile/event/URL preservation, and secret-leakage checks;
- focused P1-T08: `34 / 34 PASS`;
- affected Provider-spike suites: `209 / 209 PASS` across 9 files;
- full suite: `312 / 312 PASS` across 13 files;
- `npm run typecheck`: PASS;
- `npm run build`: PASS;
- `git diff --check`: PASS.

F04 Provider activity: `0 normal / 0 cleanup / 0 total`; webhook mutations `0`; analytics requests `0`; live Provider run `NOT AUTHORIZED`. No receiver/tunnel/Nginx/TLS work occurred.

P1-T08-F04 recommendation: **ACCEPT CODE FIX**.
Canonical Analytics Webhook remains **`SPIKE_PENDING`**. Parent P1-T08 remains **NOT DONE**. F03 live run remains **CONSUMED**.

## P1-T08-F05 — Complete Live analytics.synced Verification After Accepted Harness Fix

Status: `DONE / ACCEPTED`.
Accepted evidence HEAD: `65b24386c73f564eb027b4830f025ec3d0d291f7`.
Team Leader verdict: `ACCEPTED` for F05 execution/evidence quality only; parent P1-T08 remains unresolved and not accepted.
Approved starting HEAD: `6cc948b18d0902bf3a6455e4a652ef8ef845cb33`.

F05 is one new explicitly authorized live attempt. F03 remains historically **CONSUMED**. F04 remains **DONE / ACCEPTED**.

Pre-Provider evidence:
- accepted F04 builder used directly; prefix length `29`; 24-character production-like tag generated length `50`; Provider max `50`;
- permanent infrastructure sanity PASS: DNS `82.29.177.121`, TCP/443 PASS, trusted TLS/hostname PASS, base HTTPS `404`, no redirect regression;
- focused P1-T08 `34 / 34 PASS`;
- affected Provider-spike suites `209 / 209 PASS` across 9 files;
- full suite `312 / 312 PASS` across 13 files;
- typecheck/build/diff-check PASS.

Live Provider evidence:
- exact URL: `https://marketlyai.restartorg.com/p1-t08-f05/analytics-synced`;
- exact runner readiness PASS: TLS=true, HTTP `401`, marker=true, same-process=true, redirected=false, `962 ms`, `2026-10-14T10:06:28.224Z`;
- F05 became **CONSUMED** on trusted identity preflight;
- identity HTTP `200`, exact match=true, request ID `68ebfc11-4de9-43ca-bda5-20301afd260d`, `598 ms`, timestamp `2026-10-14T10:06:29.787Z`;
- webhook create HTTP `200`, ID `6acf542502eb51a090c8d14e`, request ID `fc6ff28e-9b65-42d1-9c36-af9bf9f3fb89`;
- generated name `aimm-p1-t08-analytics-synced-bb6dc95b11fe4332a3d14`, length `50`;
- exact read-back HTTP `200`, request ID `1094c013-ad9a-48d6-a2c2-053312085f2a`;
- read-back scope: Profile A only (`6ac5a45a8e4ca44f355033ae`), event `analytics.synced` only, exact F05 URL, active=true.

Passive observation:
- started `2026-10-14T10:06:30.194Z`;
- ended `2026-10-14T11:46:30.208Z`;
- duration `6000014 ms` within the bounded 100-minute **test window**; this is bounded test evidence only and is **not** a Provider SLA;
- inbound deliveries `0`;
- logical unique analytics events `0`;
- valid `analytics.synced` observed=false;
- foreign target=false; wrong platform=false; target unconfirmed=false; unexpected event=false.

No live payload arrived. Therefore F05 does **not** prove Provider-delivery signature behavior, header/body event-ID equality, live Profile/account/platform attribution, payload field shapes, sync metadata, metrics/cursor presence, contract drift, duplicate behavior, HTTP 204 acknowledgement, or live ACK latency. Documentation assumptions are not promoted to live facts.

The bounded no-event result does **not** establish that `analytics.synced` is unsupported or broken, does not prove Provider webhook delivery failed, and does not establish any specific delivery cadence. Webhook logs are not used to prove or disprove delivery.

Provider cleanup PASS:
- DELETE HTTP `200`, request ID `304f8f1c-6a6c-4371-a2e1-a121114b9ef9`;
- absent read-back HTTP `200`, request ID `ecc08660-bf87-4ffb-ab9d-8ba5f1fdc7f1`;
- cleanup confirmed=true.

Provider request counts: `3 normal / 2 cleanup / 5 total`. No posts, publishing, media, Ads/spend, comments/DMs, native automation, OpenAI, or fal.ai actions occurred.

Infrastructure cleanup completed: human operator confirmed reverse tunnel stop and exact F05 Nginx route removal; Senior post-cleanup verification observed exact F05 path `404`, base HTTPS `404` with no redirect, and local `18086` clear. Permanent vhost/certificate/DNS repair remains preserved.

Outcome: `ANALYTICS_SYNCED_NOT_OBSERVED_WITHIN_BOUNDED_WINDOW`.

Post-run deterministic validation after F05 evidence/docs update: focused P1-T08 `34 / 34 PASS`; affected Provider-spike suites `209 / 209 PASS` across 9 files; full suite `312 / 312 PASS` across 13 files; `npm run typecheck` PASS; `npm run build` PASS; `git diff --check` PASS.

Analytics Webhook recommendation: **REMAIN PENDING — ANALYTICS_SYNCED_NOT_OBSERVED**.
Canonical Analytics Webhook remains **`SPIKE_PENDING`**. Parent P1-T08 remains **UNRESOLVED / NOT DONE**. F05 is **DONE / ACCEPTED** at accepted evidence HEAD `65b24386c73f564eb027b4830f025ec3d0d291f7`. No additional live attempt is authorized.
## P1-T08-F06 — Determine analytics.synced Trigger Eligibility & Test-Account Preconditions

Historical initial Team Leader review: **REJECTED — FIX REQUIRED**.
Current resolved task state: **DONE / ACCEPTED AFTER F06-F01 CORRECTION**.
Useful F06 live read evidence below is preserved. F06-F01 corrected evidence traceability, sync classification, and the over-strong recommendation; only the corrected conclusions are canonical.
Approved starting HEAD: `ac620616608a0b94f56c5cb2c7974127ad074028`.

### DOC_CONFIRMED
- `analytics.synced` remains documented as an Analytics webhook trigger, not metrics transport.
- Metrics and cursor are not expected in the trigger itself; consumers use Analytics reads separately.
- Documentation associates generation with a successful analytics sync cycle and describes an approximate poll-driven cadence. These are documentation statements only, not a Provider SLA or fixed F06-observed cadence.
- Existing documentation ambiguity/drift around cursor wording remains preserved; live reads remain authoritative for observed response facts.
- F05's `6000014 ms` / 100-minute observation remains bounded test evidence only and does not establish a Provider SLA, unsupported event, broken delivery, or minimum/maximum cadence.

### F06 spike-only implementation / deterministic safety
- Existing P1-T06/P1-T07 live runners create temporary scoped API keys and therefore could not be reused directly under F06's zero-mutation rule.
- Added minimal F06-only diagnostic files under `src/provider-spike/*` plus F06 deterministic tests under `tests/provider-spike/*`; no production Analytics subsystem, DB, Redis, BullMQ, worker, reconciliation, or architecture change.
- Transport is GET-only and fails closed before transport on mutation methods; normal request ceiling `5`; cleanup allowance `0`.
- Deterministic regressions F06-01 through F06-13 cover offline default, identity gating, exact target, cross-Profile/wrong-platform critical handling, health/access eligibility, empty/data-bearing classifications, sync-state non-inference, request ceiling, mutation prohibition, and secret isolation.
- Pre-Provider validation PASS: focused F06 + P1-T08 `47 / 47` across 2 files; affected Provider-spike `222 / 222` across 10 files; full suite `325 / 325` across 14 files; typecheck PASS; build PASS; `git diff --check` PASS.

### LIVE_READ_OBSERVED
Trusted identity:
- HTTP `200`; exact expected identity match=true;
- request ID `5cac1cab-dfcd-4477-bb65-8a74da70ee15`;
- latency `779 ms`; evidence timestamp `2026-10-14T15:02:58.929Z`.

Frozen target ownership:
- account read HTTP `200`, request ID `bcd599a7-e345-4e28-a85c-335eb4ac4c5d`;
- Profile `6ac5a45a8e4ca44f355033ae`;
- account `6ac64f8740364f4695dd3077`;
- platform `facebook`;
- ownership exact=true;
- account-list `hasAnalyticsAccess` was not returned as a boolean (`null`), so entitlement was not inferred from this response.

Account health:
- HTTP `200`, request ID `5fe3cc4c-fb4a-49b6-94e5-c8f4bbd3ff93`;
- health status `healthy`;
- token valid=true; token state field unobserved;
- `canFetchAnalytics=true`;
- analytics permissions: `pages_read_engagement=true`, `read_insights=true`;
- issue categories=[]; recommendation categories=[].
Health/permission readiness does not prove an `analytics.synced` event occurred.

Exact Analytics baseline:
- exact filters: `profileId=6ac5a45a8e4ca44f355033ae`, `accountId=6ac64f8740364f4695dd3077`, `platform=facebook`, `source=all`, `fromDate=2026-07-17`, `toDate=2026-10-14`, `limit=100`, `page=1`;
- initial baseline HTTP `200`, request ID `acbf29e9-d03f-4e27-8343-2653507e89c3`;
- rows=0; usable rows=0; pagination total=0; hasMore not exposed;
- `hasAnalyticsAccess=true`;
- safe top-level fields: `accounts`, `hasAnalyticsAccess`, `overview`, `pagination`, `posts`.

Fifth-read provenance reconciliation: **`B — FIFTH_READ_EXECUTED_BY_SEPARATE_BOUNDED_DIAGNOSTIC_COMMAND`**. Persisted local Remote Desktop Commander tool-call execution history proves that the committed F06 harness had already completed, then one separate bounded GET-only diagnostic repeated the exact page-1 Analytics filters:
- `GET /v1/analytics?profileId=6ac5a45a8e4ca44f355033ae&accountId=6ac64f8740364f4695dd3077&platform=facebook&source=all&fromDate=2026-07-17&toDate=2026-10-14&limit=100&page=1`;
- HTTP `200`, request ID `73b50a74-8637-49c7-b28f-51e178f71cde`;
- rows=0; total=0; `hasAnalyticsAccess=true`;
- safe overview field names included `dataStaleness`, `lastSync`, `publishedPosts`, `scheduledPosts`, `totalPosts`;
- explicit `overview.lastSync=2026-10-14T15:03:02.584Z` is preserved as **`EXPLICIT_PROVIDER_SYNC_TIMESTAMP_OBSERVED`** only;
- `dataStaleness` was observed as a field but its nested value was not durably retained, so no staleness semantics are inferred;
- no `syncStatus` value was observed.

The committed F06 harness itself made 4 GETs on the observed empty/total=0 path. Historical F06 session traffic totals 5 GETs only because this separate bounded diagnostic followed the 4-call harness run; the fifth read is not part of the normal committed harness contract.

Analytics entitlement: **`ANALYTICS_ACCESS_CONFIRMED`** from the exact baseline `hasAnalyticsAccess=true` field.
Primary classification: **`TEST_ACCOUNT_ANALYTICS_ELIGIBLE_BUT_EMPTY`**.
Canonical Sync Cycle State: **`UNRESOLVED`**. The prior `CONFIRMED_RECENT` label is withdrawn: an explicit `lastSync` timestamp alone does not establish natural/background sync semantics, `analytics.synced` emission, webhook delivery, next-sync timing, cadence, or Provider SLA.

Historical F06 session calls: `5 GETs total = 4 committed-harness GETs + 1 separate bounded diagnostic GET`; mutations `0`; retries `0`; polling loops `0`; webhook operations `0`; delta polling `0`; `webhook.test` `0`; `sync-external` `0`.
External/public/social/media/community/Ads/spend/OpenAI/fal.ai actions: all `0`.

Post-run deterministic validation after F06 live evidence/docs: focused F06 + P1-T08 `47 / 47 PASS` across 2 files; affected Provider-spike `222 / 222 PASS` across 10 files; full suite `325 / 325 PASS` across 14 files; `npm run typecheck` PASS; `npm run build` PASS; `git diff --check` PASS.

F05 evidence remains unchanged: `ANALYTICS_SYNCED_NOT_OBSERVED_WITHIN_BOUNDED_WINDOW` and 100 minutes != Provider SLA.
Canonical Analytics Webhook remains **`SPIKE_PENDING`**. Parent P1-T08 remains **NOT DONE**. Next Task remains **NOT_STARTED**.

P1-T08-F06 recommendation: **PROVIDER PRECONDITION UNRESOLVED — CLARIFICATION REQUIRED**.

TEST FIXTURE LIMITATION: **THE CURRENT FROZEN ACCOUNT HAS ZERO USABLE ANALYTICS ROWS**. Empty Analytics data is not proven to be a required Provider precondition for `analytics.synced` and is not proven to be the cause of the F05 no-event outcome.
## P1-T08-F06-F01 — Reconcile F06 Sync Evidence Traceability & Classification

Status: `DONE / ACCEPTED`.
Accepted fix HEAD: `a591fdf12f199291b982e519443c7ac72a36d484`.
Team Leader verdict: `ACCEPTED`.
Approved starting HEAD: `641305e681743460294e87accade082c7374f7d3`.

### Code / evidence correction
- Provider calls during F06-F01: `0 normal / 0 cleanup / 0 total`; no live-mode command; mutations `0`.
- Nested `overview` is parsed from the first Analytics response using only `lastSync`, `dataStaleness`, `syncStatus`, and `dataAsOf`.
- Safe field provenance distinguishes `ABSENT`, `SAFE_SCALAR_RETAINED`, and `OBSERVED_NOT_RETAINED`; the full `overview` object and unrelated nested content are never serialized.
- Normal empty-baseline harness path is deterministic at `4` GETs.
- An optional fifth harness request exists only as bounded page-2 pagination when page 1 explicitly reports `hasMore=true` or `total > rows.length`; exact Profile/account/platform/source/date/limit filters are reused, only the page changes, and the hard ceiling remains `5`.
- INTERNAL_DIAGNOSTIC_CLASSIFICATION: `lastSync` alone => `UNRESOLVED`; explicit positive `syncStatus` may support `CONFIRMED_BUT_TIMESTAMP_UNKNOWN`; no sync metadata => `NOT_EXPOSED`. None imply Provider cadence/SLA or webhook emission/delivery.
- Fifth-read provenance remains classification `B`, proven by persisted local execution history: separate GET-only page-1 Analytics diagnostic, HTTP `200`, request `73b50a74-8637-49c7-b28f-51e178f71cde`.
- `overview.lastSync=2026-10-14T15:03:02.584Z` remains `EXPLICIT_PROVIDER_SYNC_TIMESTAMP_OBSERVED` only.
- Primary fixture classification remains `TEST_ACCOUNT_ANALYTICS_ELIGIBLE_BUT_EMPTY`; canonical Sync Cycle State is `UNRESOLVED`.
- Corrected recommendation: **PROVIDER PRECONDITION UNRESOLVED — CLARIFICATION REQUIRED**.
- Final deterministic validation PASS: focused F06-F01 + parent P1-T08 `63 / 63` across 2 files; affected Provider-spike `238 / 238` across 10 files; full suite `341 / 341` across 14 files; typecheck PASS; build PASS; `git diff --check` PASS.
- F05 remains `DONE / ACCEPTED`; F05 outcome remains `ANALYTICS_SYNCED_NOT_OBSERVED_WITHIN_BOUNDED_WINDOW`; 100 minutes != Provider SLA.
- Current Phase remains `PHASE 1 — Provider Feasibility & Basic Cost Safety`; Current Task / execution focus is restored to parent `P1-T08 — Verify Zernio analytics.synced Webhook Behavior`, which remains `UNRESOLVED / NOT DONE`; Analytics Webhook remains `SPIKE_PENDING`; F03 and F05 live runs remain `CONSUMED`; Next Task remains `NOT_STARTED`.

## P1-T08-F07 — Correlate analytics.synced With Documented Stale Analytics Refresh

Status: `DONE / ACCEPTED`.
Accepted implementation/evidence HEAD: `699ea01911814119b7316a3acaf002ee96d08b59`.
Team Leader verdict: `ACCEPTED` for F07 implementation/evidence only; parent P1-T08 is not accepted or closed.
Approved starting HEAD: `0e7799d254d2d780ba293f454775853042aa8fe9`.
Branch: `p1-t08-zernio-analytics-webhook`.

### DOC_CONFIRMED
- Analytics responses are documented as cached for approximately 60 minutes.
- A GET against stale Analytics cache is documented to trigger a background refresh.
- `analytics.synced` is documented as an available Analytics webhook event and as trigger-only: no metrics, no cursor; consumers use Analytics reads/delta separately.
- Documentation does **not** prove every stale-cache-triggered refresh emits `analytics.synced`.
- The 60-minute cache statement and F07's 30-minute observation are not Provider webhook SLAs.

### LIVE_PROVIDER_OBSERVED
Timing gate: historical `lastSync=2026-10-14T15:03:02.584Z`; consumed-run gate evaluated `2026-10-14T16:22:46.907Z`; elapsed `4784323 ms`; required `4500000 ms`; PASS. The 75-minute gate is a conservative test setup rule only and is **not** a Provider SLA.

Initial credential-loading attempt reached readiness but made `0` Zernio calls and did not consume authorization. The consumed run used the same runner after loading existing authorized project credential names without copying or exposing values.

Consumed-run readiness: exact F07 URL; TLS=true; HTTP `401`; marker=true; same-process=true; redirected=false; latency `924 ms`; timestamp `2026-10-14T16:22:45.982Z`.
Identity: HTTP `200`; exact match=true; request `9b003962-1837-44ab-b3fa-e9236df99ef1`; latency `452 ms`; timestamp `2026-10-14T16:22:47.359Z`.

Webhook: ID `6acfac57250f5349a8d336ee`; name `aimm-p1-t08-analytics-synced-dee19891f84648a4b285d` (length `50`); create HTTP `200`, request `db2a4164-b792-4760-8627-fea4c7e994fc`; exact read-back HTTP `200`, request `6fe76cf0-bccd-4f82-898e-527f52b3c088`; Profile A only `6ac5a45a8e4ca44f355033ae`; event exactly `analytics.synced`; exact F07 URL; active=true; read-back completed `2026-10-14T16:22:47.865Z`.

Trigger Analytics GET: requested `2026-10-14T16:22:47.865Z`; HTTP `200`; request `2bb1bd75-b08e-4311-b420-07220d5b329a`; exact Profile `6ac5a45a8e4ca44f355033ae`, account `6ac64f8740364f4695dd3077`, platform `facebook`, source `all`, `fromDate=2026-07-17`, `toDate=2026-10-14`, `limit=100`, `page=1`; rows=0; `hasAnalyticsAccess=true`; top-level fields `accounts`, `hasAnalyticsAccess`, `overview`, `pagination`, `posts`; overview fields `lastSync`, `dataStaleness`; `lastSync=2026-10-14T15:03:02.584Z`; `dataStaleness` present but value `OBSERVED_NOT_RETAINED`; `syncStatus` absent; trigger classification `REFRESH_NOT_YET_CONFIRMED`.

Passive observation: start `2026-10-14T16:22:48.090Z`; end `2026-10-14T16:52:48.100Z`; duration `1800010 ms`; inbound deliveries=0; logical unique events=0; no Provider polling during the window. The 30-minute observation is bounded experiment evidence only and is **not** a Provider SLA.

Follow-up Analytics GET: requested `2026-10-14T16:52:48.100Z`; HTTP `200`; request `1762a144-18dc-41a6-9a3e-2482adda0ddb`; same exact filters; rows=0; `hasAnalyticsAccess=true`; `lastSync=2026-10-14T15:03:02.584Z`; `dataStaleness` value not retained; `syncStatus` absent; refresh advanced=false.

No live event arrived; therefore Provider-delivery signature, header/body event-ID equality, live Profile/account/platform payload attribution, live payload/sync fields, HTTP `204` ACK, ACK latency, and natural duplicates remain unverified by F07.

Provider cleanup: DELETE HTTP `200`, request `3f0cae4a-96be-4068-85a5-5accfee5163d`; absent read-back HTTP `200`, request `24aadf0b-fe5d-44a0-94a0-f4cd19ecc866`; confirmed=true.
Provider calls: `5 normal / 2 cleanup / 7 total`; ceilings respected; no blind retries.
External actions: all zero for posts/publishing/schedules/media/comments/DMs/native automation/Ads/spend/account/Profile mutation/API-key create-delete/sync-external/OpenAI/fal.ai.
Infrastructure cleanup verified: local/VPS port `18086` clear; reverse tunnel stopped; exact F07 Nginx route absent; temporary F07 backups absent; exact public F07 path `404`; permanent trusted DNS/TLS/vhost preserved.

### INTERNAL_CORRELATION_CLASSIFICATION
Outcome: **C — `REFRESH_NOT_CONFIRMED_EVENT_NOT_OBSERVED`**. No refresh was confirmed and no `analytics.synced` delivery was observed. Do not infer that `analytics.synced` is supported or unsupported/broken, that the trigger GET definitely did or did not cause a background refresh, or any webhook cadence/SLA. Neither Provider support nor Provider failure was established by F07.

Pre-live deterministic validation: focused F07 + P1-T08 `57 / 57` across 2 files; affected Provider-spike `261 / 261` across 11 files; full suite `364 / 364` across 15 files; typecheck/build/diff-check PASS.
Post-run deterministic validation PASS: focused F07 + P1-T08 `57 / 57` across 2 files; affected Provider-spike `261 / 261` across 11 files; full suite `364 / 364` across 15 files; `npm run typecheck` PASS; `npm run build` PASS; `git diff --check` PASS.

Analytics Webhook recommendation: **REMAIN PENDING — REFRESH CORRELATION INCONCLUSIVE**.
Canonical Analytics Webhook remains **`SPIKE_PENDING`**. Parent P1-T08 remains **UNRESOLVED / NOT DONE**. F07 live run remains **CONSUMED**; no second F07 run is authorized. Current Task / execution focus is restored to parent `P1-T08 — Verify Zernio analytics.synced Webhook Behavior`. Next Task remains **NOT_STARTED**.

## P1-T08-F08 — Resolve analytics.synced Trigger Preconditions From Official Provider Contract

Status: `DONE / ACCEPTED`.
Accepted evidence HEAD: `bb56de898472b2e904345ca5eaf4686b0bafd83e`.
Team Leader verdict: `ACCEPTED`. Recommendation is not authorized for execution; clarification packet remains `PREPARED / NOT SENT`.
Approved starting HEAD: `60f40a1063a871a29c560517a6647ded1fb42160`.
Branch: `p1-t08-zernio-analytics-webhook`.
Official-source checked timestamp: `2026-10-14T22:41:00+03:00`.

### Provider Activity
- Provider calls: `0 normal / 0 cleanup / 0 total`.
- Provider mutations: `0`.
- Webhook operations: `0`.
- Analytics reads: `0`.
- External Provider communication: `0`.
- Source/tests/package.json changes: `0`.

### Official Sources Reviewed
| ID | Official source | Official URL | Section / heading | Documentation date/version | Checked | Short safe quote |
|---|---|---|---|---|---|---|
| S1 | Zernio Changelog | https://docs.zernio.com/changelog | September 2, 2026 - Analytics Delta + `analytics.synced` | 2026-09-02 | 2026-10-14T22:41:00+03:00 | "It's a trigger (no metrics/cursor)" |
| S2 | Webhooks - API Reference | https://docs.zernio.com/webhooks | Event categories; The test event | Not exposed | 2026-10-14T22:41:00+03:00 | "Analytics | analytics.synced" |
| S3 | Send test webhook - API Reference | https://docs.zernio.com/webhooks/test-webhook | Send test webhook | Not exposed | 2026-10-14T22:41:00+03:00 | "event: webhook.test" |
| S4 | Rate Limits - Guides | https://docs.zernio.com/guides/rate-limits | Analytics responses are cached | Not exposed | 2026-10-14T22:41:00+03:00 | "a request against a stale cache triggers a background refresh" |
| S5 | Complete official docs - Tenant Analytics | https://docs.zernio.com/llms-full.txt | Tenant Analytics -> Show freshness instead of promising real-time | Snapshot date not exposed | 2026-10-14T22:41:00+03:00 | "feed your dashboard's data as of label" |
| S6 | Get post analytics - API Reference | https://docs.zernio.com/analytics/get-analytics | Overview; sync states; response examples | Not exposed | 2026-10-14T22:41:00+03:00 | "Single post lookups may return 202 (sync pending)" |
| S7 | Check account health - API Reference | https://docs.zernio.com/accounts/get-account-health | Response body / permissions | Not exposed | 2026-10-14T22:41:00+03:00 | "token status, permissions, recommendations" |
| S8 | Facebook API - Platforms | https://docs.zernio.com/platforms/facebook | Before you start; OAuth scopes; Analytics | Not exposed | 2026-10-14T22:41:00+03:00 | "read_insights - Page and post analytics" |
| S9 | Sync an external post - API Reference | https://docs.zernio.com/analytics/sync-external-posts | Behavior | Not exposed | 2026-10-14T22:41:00+03:00 | "background sync ... every ~90 minutes" |

The official `llms-full.txt` snapshot contains no `analytics.synced` entry; the dated 2026-09-02 changelog and current Webhooks page provide the positive current event contract. Absence in that snapshot is not treated as a contradictory Provider claim. No deterministic source/test constant was found factually contradicted by current official documentation, so `PROVIDER_CONTRACT_CODE_CHANGE_REQUIRED` is not triggered.

### Required Questions Q1-Q18
| Q | Status | Exact conclusion | Source(s) | Claim basis / interpretation notes |
|---|---|---|---|---|
| Q1 | NOT_DOCUMENTED | The exact Provider-side condition that emits `analytics.synced` is not defined; only event availability/purpose is documented. | S1, S2 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES; do not infer from event name. |
| Q2 | NOT_DOCUMENTED | No official source reviewed states that every successful Analytics sync emits `analytics.synced`. | S1, S5, S6 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES. |
| Q3 | NOT_DOCUMENTED | Stale `GET /v1/analytics` is documented to trigger background refresh, but no source states that this refresh emits `analytics.synced`. | S1, S4, S5 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES; facts are not causally joined. |
| Q4 | NOT_DOCUMENTED | No official source states whether `analytics.synced` can emit with zero posts/zero usable Analytics rows. | S1, S5, S6 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES. |
| Q5 | NOT_DOCUMENTED | No generic prerequisite requiring published posts, non-empty metrics, or historical Analytics rows for the event is documented. | S1, S6, S8 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES. |
| Q6 | DOC_AMBIGUOUS | `overview.lastSync` is documented as freshness metadata for a "data as of" label, but not as cache refresh, platform sync, DB write, or webhook-generating sync. | S5, S6 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES; partial semantics only. |
| Q7 | NOT_DOCUMENTED | Whether `lastSync` updates synchronously or asynchronously relative to `GET /v1/analytics` is not documented. | S4, S5, S6 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES. |
| Q8 | NOT_DOCUMENTED | No maximum/typical delay between a successful Analytics sync and `analytics.synced` delivery is documented. | S1, S2 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES; cache TTL is not event timing. |
| Q9 | NOT_DOCUMENTED | ~60 minutes is documented as post-analytics cache freshness, not as an explicitly equivalent Provider Analytics sync cadence. | S4, S5 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES. |
| Q10 | DOC_AMBIGUOUS | A stale Analytics GET conditionally triggers background refresh; no separate unconditional "force Analytics refresh" endpoint is documented. | S4, S5, S9 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES. |
| Q11 | DOC_AMBIGUOUS | The stale-refresh mechanism is initiated by GET, but official docs do not define all Provider/upstream effects as read-only from the customer/public-platform perspective. | S4, S5 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES. |
| Q12 | NOT_DOCUMENTED | Per-post `syncStatus` and sync-error surfaces exist, but no sync-job status/history API suitable for correlating `analytics.synced` is documented. | S5, S6 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES. |
| Q13 | NOT_DOCUMENTED | No sandbox/test/synthetic mechanism that generates real-semantic `analytics.synced` is documented. | S2, S3 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES. |
| Q14 | DOC_CONFIRMED | `POST /v1/webhooks/test` is generic transport testing; the documented event is fixed to `webhook.test` regardless of subscription events. | S2, S3 | EXPLICIT. |
| Q15 | DOC_AMBIGUOUS | Facebook Analytics reading requires a connected Page and analytics scopes; no Facebook-specific `analytics.synced` generation eligibility rule is documented. | S8, S1 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES. |
| Q16 | NOT_DOCUMENTED | `canFetchAnalytics=true` is on the account-health permission/readiness surface, but no background-sync guarantee is documented for that field. | S7, S5 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES. |
| Q17 | DOC_CONFIRMED | `hasAnalyticsAccess` is explicitly Analytics add-on access/entitlement; it is not documented as a synchronization guarantee. | S5 | EXPLICIT. |
| Q18 | DOC_AMBIGUOUS | `analytics.synced` is globally available as a webhook event category, but a universal per-platform emission guarantee is not documented. | S1, S2, S8 | INFERRED_FROM_MULTIPLE_OFFICIAL_SOURCES. |

### Special lastSync Review
**LASTSYNC_SEMANTICS_NOT_DOCUMENTED**

Official docs support using `overview.lastSync`/`overview.dataStaleness` as freshness metadata for a "data as of" UI label. They do not explicitly define what operation `lastSync` timestamps, upstream source, start-vs-completion, account-wide vs query/window scope, or linkage to `analytics.synced`. No semantic meaning is inferred from the field name.

### Special Empty-Data Review
**EMPTY_ANALYTICS_SYNC_BEHAVIOR_NOT_DOCUMENTED**

For `hasAnalyticsAccess=true` plus zero Analytics rows, current official docs do not state whether background Analytics sync still occurs, whether `lastSync` must advance, whether `analytics.synced` may emit, or whether an empty Analytics cache is refreshed. Empty data remains a fixture limitation, not a proven blocker.

### Safe Trigger Candidates
| Candidate | Classification | Official-contract reasoning |
|---|---|---|
| Stale `GET /v1/analytics` | **E — DOCUMENTATION_INSUFFICIENT** | Background refresh on stale cache is explicit; qualifying `analytics.synced` linkage is not. |
| Explicit Analytics force/refresh endpoint | **E — DOCUMENTATION_INSUFFICIENT** | No separate unconditional Analytics refresh endpoint identified. |
| Scheduled/background Analytics sync | **B — PROVIDER_INTERNAL_TRIGGER_NOT_CALLABLE** | Internal refresh/sync behavior is documented; no callable qualifying sync job is defined. |
| `POST /v1/posts/sync-external` | **D — UNSAFE_OR_OUT_OF_SCOPE_FOR_CURRENT_SPIKE** | Provider POST/import action; not documented as the target-event trigger. |
| Account reconnect | **D — UNSAFE_OR_OUT_OF_SCOPE_FOR_CURRENT_SPIKE** | Changes connection/auth state; no target-event linkage. |
| Publish a post | **C — CUSTOMER/PUBLIC DATA MUTATION REQUIRED** | Customer-facing content mutation and no proven target-event linkage. |
| `POST /v1/webhooks/test` | **D — UNSAFE_OR_OUT_OF_SCOPE_FOR_CURRENT_SPIKE** | Explicitly produces `webhook.test`, not target-event semantics. |

No candidate was executed.

### Data-Bearing Fixture Decision
**DATA_BEARING_FIXTURE_REQUIREMENT_NOT_DOCUMENTED**

No reviewed official document explicitly establishes that a data-bearing account, published posts, or non-empty Analytics rows are required to generate/test `analytics.synced`. The current zero-row fixture cannot be used to infer REQUIRED.

### Provider Clarification Packet
Required: **YES**. Status: **PREPARED / NOT SENT**.

1. What exact Provider-side condition causes `analytics.synced` to be generated, and does every successful Analytics sync generate one event?
2. Does the stale-cache background refresh triggered by `GET /v1/analytics` belong to that same event-generating sync class?
3. For an Analytics-entitled account with zero usable Analytics rows/posts, does background Analytics sync still run and can `analytics.synced` emit?
4. Are published posts, non-empty metrics, platform activity, or another data-bearing prerequisite required before `analytics.synced` can emit?
5. What exactly does `overview.lastSync` timestamp (operation, scope, start/completion), and is it the same cycle associated with `analytics.synced`?
6. Is there a safe deterministic API action that triggers a qualifying Analytics sync without publishing or mutating customer-facing platform content?
7. Is there a sandbox/test/synthetic mechanism that produces real `analytics.synced` semantics rather than `webhook.test`?
8. If a qualifying sync succeeds, is any typical/maximum event-delivery delay or platform-specific eligibility defined?

### Final Classification
**PROVIDER_CLARIFICATION_REQUIRED**

Material trigger/precondition questions remain undocumented or ambiguous. Current official material does not provide a verified deterministic `analytics.synced` test path and does not establish a data-bearing fixture requirement.

### Recommendation
**P1-T08-F08 recommendation: DECISION REQUIRED — CONTACT PROVIDER FOR CLARIFICATION**

The packet above is **PREPARED / NOT SENT**; F08 did **not** contact the Provider. Current Task / execution focus is restored to parent `P1-T08 — Verify Zernio analytics.synced Webhook Behavior`, which remains **UNRESOLVED / NOT DONE**. F07 remains **DONE / ACCEPTED** with live run **CONSUMED**; Analytics Webhook remains `SPIKE_PENDING`; Current Phase remains `PHASE 1 — Provider Feasibility & Basic Cost Safety`; Next Task remains **NOT_STARTED**.


## P1-T08-F09-S01 - Establish Authorized MarketlyAI Provider-Communication Sender

Status: `BLOCKED - DNS ACCESS REQUIRED`.

Approved starting HEAD: `a3f9dfebb5b2c8c0e618fe176d57849c416d4cd3`. Branch: `p1-t08-zernio-analytics-webhook`.

Target sender is fixed to `MarketlyAI Engineering <engineering@marketlyai.restartorg.com>`. Linka/TIA/personal/no-reply identities were not used.

Resend inspection initially showed no MarketlyAI domain and no configured inboxes. A dedicated Resend domain configuration was then created for `marketlyai.restartorg.com` in `eu-west-1`; safe domain ID: `64833ad6-63a9-4fd7-8a00-8c1d3f4edd8d`. Sending and receiving are enabled in configuration, open/click tracking are disabled, and enforced TLS was requested. Resend read-back remains `not_started`, so this is configuration evidence only, not sender-verification evidence.

Actual Resend DNS requirements were obtained directly from the provider: one DKIM TXT record, SPF/return-path MX + TXT + CNAME records, and one receiving MX record. Full DKIM material is intentionally not copied into repository evidence; no DNS value was guessed or reused from another project.

Public DNS was recorded before any change: authoritative nameservers are `ns1.dns-parking.com` and `ns2.dns-parking.com`; `marketlyai.restartorg.com` resolves by A record to `82.29.177.121`; no existing MarketlyAI MX/TXT/CNAME answer was present. HTTPS validation remained healthy with trusted TLS, no redirect, and expected base `404`.

No authorized Hostinger/DNS credentials, DNS-management CLI, environment binding, or project configuration was available on the authorized device. Therefore no public DNS record was changed. Because DNS verification cannot be completed, `engineering@marketlyai.restartorg.com` is not yet proven accepted for outbound sending and no direct inbound mailbox/reply path is proven. No Resend inbox was created.

Internal routing test: `NOT PERFORMED`; outbound internal emails `0`.
Provider/Zernio communication: `0`; support tickets `0`; Zernio API calls `0`; Provider API calls `0`.
Source/test/package changes: `0`.
Secrets exposed: `NO`.

Final S01 classification: **MARKETLYAI_SENDER_BLOCKED - DNS ACCESS REQUIRED**.

Canonical state: P1-T08-F09 = **BLOCKED BEFORE SEND - SENDER IDENTITY SETUP**; Provider contact = **AUTHORIZED / NOT SENT**; clarification packet = **PREPARED / NOT SENT**; Provider reply = **NOT APPLICABLE YET**; parent P1-T08 = **UNRESOLVED / NOT DONE**; Analytics Webhook = `SPIKE_PENDING`; Next Task = **NOT_STARTED**.

## P1-T08-F10 - Data-Bearing analytics.synced Experiment Harness

Status: `DONE / ACCEPTED`.

Historical starting HEAD: `73cefbddcc3c7cd7eb24799f038c84c2e981023d`. Original F10 implementation HEAD: `266885dd5e5962e58fe6b2811ecb1c6a54c48ac2`. Accepted final implementation/evidence HEAD after F10-F01 hardening: `fbbed9f77293d9a68c594562edb6ab2976f85844`. Branch: `p1-t08-zernio-analytics-webhook`.

Team Leader verdict: **ACCEPTED**. F10 is accepted after the F10-F01 hardening fix.

### OFFLINE IMPLEMENTATION EVIDENCE
- F10 was implemented and tested entirely offline. External Provider calls: `0 normal / 0 cleanup / 0 total`; live webhook operations `0`; live Analytics calls `0`; posts published `0`; media calls `0`; Zernio emails/support contact `0`. Mock/test-double calls are not Provider activity.
- Frozen target: Profile A `6ac5a45a8e4ca44f355033ae`, Facebook account `6ac64f8740364f4695dd3077`, Facebook Page `1387424501114639` / `Clothing Brand`, platform `facebook`. Target mismatch is fail-closed before future publish.
- Future-live precheck requires explicit live opt-in, human authorization token, exact approved post text, exact SHA-256, bounded retention timestamp, receiver configuration, and frozen target controls. No post text is hard-coded as approved.
- Baseline/follow-up Analytics are each bounded to one read; safe comparison fields include usable rows, post IDs, access, freshness fields, cursor, request ID, and timestamp. Fixture matching accepts Provider or platform post IDs; `lastSync` is not assigned causal meaning.
- Temporary webhook must be Profile-A-only and `analytics.synced`-only with exact read-back before publish. Unknown create is reconciled by exact unique name without a second create.
- Publish path is one text-only Facebook POST with an idempotency key. Ambiguous publish response is reconciled by bounded read-back and never blindly retried. Duplicate exact matches are Critical and are not arbitrarily cleaned as if ownership were known.
- Passive observation performs zero Provider polling and reuses accepted raw-body HMAC-first/canonical-ID/exact-target/dedupe/ACK safety.
- Optional Analytics Delta is disabled by default, needs dedicated runtime authorization, a real cursor, and is bounded to one read.
- Deterministic A/B/C/D/E classifications are implemented; A is conservative and requires valid exact-target event evidence in-window plus explicit fixture visibility. This does not establish universal Provider behavior.
- Webhook cleanup uses delete plus absence read-back. Post cleanup is retention-aware and uses unpublish plus read-back. A separate cleanup-only mode supports later authorized cleanup of a retained recorded post without another publish/webhook/Analytics experiment.
- Request ceilings: normal target <=9, absolute normal 10, cleanup <=4, total <=14.
- The data-bearing strategy is an authorized alternative experiment hypothesis, **not** evidence that data-bearing state is required for `analytics.synced`.

### Deterministic validation
- Focused F10 + P1-T08: `73 / 73 PASS across 2 files`.
- Affected Provider-spike: `297 / 297 PASS across 11 files`.
- Full regression: `403 / 403 PASS across 16 files`.
- Typecheck/build/diff-check: PASS.

Canonical state: P1-T08-F10 = **DONE / ACCEPTED**; P1-T08-F10-F01 = **DONE / ACCEPTED**; accepted final F10 implementation/evidence HEAD = `fbbed9f77293d9a68c594562edb6ab2976f85844`; P1-T08-F09-S01 = **BLOCKED — DNS ACCESS REQUIRED**; Provider contact = **AUTHORIZED / NOT SENT**; clarification packet = **PREPARED / NOT SENT**; parent P1-T08 = **UNRESOLVED / NOT DONE**; Analytics Webhook = `SPIKE_PENDING`; Current Phase = **PHASE 1 — Provider Feasibility & Basic Cost Safety**; Next Task = **NOT_STARTED**; live data-bearing experiment = **NOT AUTHORIZED YET**.
## P1-T08-F10-F01 - Harden Uncertain Artifact Recovery & Live Observation Window

Status: `DONE / ACCEPTED`. Team Leader verdict: **ACCEPTED**. Parent F10 is `DONE / ACCEPTED` after this hardening fix. Starting HEAD: `266885dd5e5962e58fe6b2811ecb1c6a54c48ac2`. Accepted final implementation/evidence HEAD: `fbbed9f77293d9a68c594562edb6ab2976f85844`.

### OFFLINE FIX EVIDENCE
- Provider activity remained hard zero: `0 normal / 0 cleanup / 0 total`; live webhook operations `0`; Analytics calls `0`; posts published `0`; Zernio emails/contact `0`; DNS changes `0`.
- Uncertain publish state is retained before reconciliation. Evidence includes approved-text SHA-256 (never approved text), frozen target IDs/platform, safe idempotency fingerprint, publish-attempt timestamp, retention deadline, uncertainty flag, and unconfirmed cleanup state. Zero first matches do not prove absence and do not discard evidence.
- Post reconcile-only recovery performs trusted-identity verification plus one bounded exact-target/time-window post reconciliation. It contains no publish, webhook-create, or Analytics path. Zero matches => `UNCERTAIN_ARTIFACT_NOT_FOUND` with unresolved state; one exact match may be cleaned only under explicit cleanup authorization; >1 exact matches => `CRITICAL_DUPLICATE_CONFIRMED_PUBLISH` with no arbitrary deletion.
- Uncertain webhook create state is retained before first read-back with exact unique name, URL, Profile-A-only scope, analytics.synced-only event scope, and unresolved cleanup state. Later exact-name recovery validates URL/event/Profile before delete and exact absence verification and never issues a second webhook create.
- Main live observation authorization is explicit via `P1_T08_F10_APPROVED_OBSERVATION_MS`, integer-only from 60 minutes through 3 hours. Missing/invalid authorization fails before first Provider request. Cleanup/reconcile-only modes do not require this main-run field. Recommended future 2h is not hard-coded and no observation duration is a Provider SLA.
- Passive observation still performs zero Provider polling. Tests use mock/short waits only; a mock path can inject a short deterministic wait without weakening live duration enforcement.
- Cleanup semantics remain deterministic: webhook delete -> absence verification; post unpublish -> non-published/absent verification. Unresolved potentially-created artifacts stay represented in evidence. Existing normal/cleanup/total request ceilings remain unchanged.
- Classification A/B/C/D/E behavior remains unchanged and conservative; no data-bearing requirement is promoted to Provider fact.

### Deterministic validation
- F10/F10-F01 test file: `54 / 54 PASS` (all prior F10 tests + required F10-F01-01..15).
- Focused F10 + P1-T08: `88 / 88 PASS across 2 files`.
- Affected Provider-spike: `312 / 312 PASS across 11 files`.
- Full regression: `418 / 418 PASS across 16 files`.
- `npm run typecheck -- --pretty false`: PASS.
- `npm run build -- --pretty false`: PASS.
- `git diff --check`: PASS.

Canonical state: P1-T08-F10-F01 = **DONE / ACCEPTED**; P1-T08-F10 = **DONE / ACCEPTED**; accepted final F10 implementation/evidence HEAD = `fbbed9f77293d9a68c594562edb6ab2976f85844`; P1-T08-F09-S01 = **BLOCKED — DNS ACCESS REQUIRED**; Provider contact = **AUTHORIZED / NOT SENT**; clarification packet = **PREPARED / NOT SENT**; parent P1-T08 = **UNRESOLVED / NOT DONE**; Analytics Webhook = `SPIKE_PENDING`; Current Phase = **PHASE 1 — Provider Feasibility & Basic Cost Safety**; Next Task = **NOT_STARTED**; live data-bearing experiment = **NOT AUTHORIZED YET**. Documentation finalization performed no Provider/Zernio/live actions.


## P1-T08-F11-F01 - Pre-Provider Live Readiness Attempt

Status: `DONE / ACCEPTED`.

Accepted result: **PRE_PROVIDER_TOOLING_UNAVAILABLE**. Accepted evidence HEAD: `08de3756e522e773544f9b8034c6e7e5485a7afa`. Readiness: **NOT PROVEN**. Blocking dependency: **AUTHORIZED PRIVILEGED NGINX ACCESS REQUIRED**.

This entry records PRE-PROVIDER infrastructure/tooling evidence only. It is not Zernio Provider Behavior evidence.

- Starting HEAD: `aac626468dc3022e8555bbea0d4db98bd4b15b58`; branch `p1-t08-zernio-analytics-webhook`; clean working tree; remote HEAD matched.
- DNS: `marketlyai.restartorg.com -> 82.29.177.121`; TCP/443 reachable.
- HTTPS baseline: base `/` = `404`; exact `/p1-t08-f11/analytics-synced` = `404`; no redirect; trusted TLS verification result `0`.
- SSH to approved VPS succeeded as `marktuser@82.29.177.121` (`srv822206`).
- Blocking evidence: required `sudo -n nginx -t` could not execute because sudo reported `a password is required`.
- Per the tooling-failure rule, no Nginx route change, receiver start, reverse tunnel, or local F11 harness precheck followed the blocker. Nginx syntax and exact-route end-to-end readiness remain unproven.
- Provider calls: `0`; Zernio calls: `0`; `/v1/auth/verify`: `0`; Accounts: `0`; Provider webhook API calls: `0`; Provider post API calls: `0`; Analytics calls: `0`; Provider contact: `0`.
- Webhook created: **NO**; post published: **NO**; Analytics called: **NO**.
- F11 authorization consumed: **NO**. P1-T08-F11 remains **UNCONSUMED / BLOCKED PRE-PROVIDER**.
- P1-T08-F11-F01 Result: **PRE_PROVIDER_TOOLING_UNAVAILABLE**.
- Team Leader verdict: **ACCEPTED**.
- Readiness: **NOT PROVEN**.
- Blocking dependency: **AUTHORIZED PRIVILEGED NGINX ACCESS REQUIRED**.
- Nginx syntax, F11 route, tunnel, receiver, and F11 execution readiness remain unproven.
- Canonical state: P1-T08-F11 = **UNCONSUMED / BLOCKED PRE-PROVIDER**; F11 one-run authorization = **AUTHORIZED / UNCONSUMED**; parent P1-T08 = **UNRESOLVED / NOT DONE**; Analytics Webhook = `SPIKE_PENDING`; P1-T08-F09-S01 = **BLOCKED — DNS ACCESS REQUIRED**; Provider contact = **AUTHORIZED / NOT SENT**; Current Phase = **PHASE 1 — Provider Feasibility & Basic Cost Safety**; Next Task = **NOT_STARTED**.

Post-stop cleanup verification: local port `18087` clear; base HTTPS `404`, no redirect, TLS verification result `0`; exact F11 path `404`, no redirect, TLS verification result `0`; no temporary route/tunnel/receiver existed to clean up.


## P1-T08-F11-F02 - Human-Assisted Privileged Nginx Readiness Proof

Status: `DONE / ACCEPTED`.

Final classification: **PRE_PROVIDER_TOOLING_UNAVAILABLE**. Accepted evidence HEAD: `b1a580debc7c80e5957c77cfb6098dff95d248c1`. Readiness: **NOT PROVEN**. Historical F11-F02 blocker: **SAFE DIRECT HUMAN PRIVILEGED TERMINAL CHANNEL REQUIRED**. This is PRE-PROVIDER infrastructure/tooling evidence only, not Zernio Provider Behavior evidence.

Post-F11-F02 prerequisite update: **DIRECT HUMAN TERMINAL PASSWORD ENTRY = USER-CONFIRMED**. This confirms only a safe direct human Terminal entry path without password exposure to ChatGPT; it does not independently verify sudo command success, an active sudo credential cache, `nginx -t`, Nginx readiness, or F11 readiness.

- Original starting HEAD: `4870df89929db4c6953ff57af51f161519d2f0ca`; activation HEAD: `d7d6a3d8bac2a9739aeff21c537525367f42f08e`; branch `p1-t08-zernio-analytics-webhook`.
- Public baseline: DNS `82.29.177.121`; base HTTPS `404`; exact F11 path `404`; no redirect; trusted TLS verification result `0`.
- SSH identity matched expected `marktuser@srv822206`.
- During the accepted F11-F02 evidence run, sudo command success was **NOT PROVEN** because a verifiable direct-human password-entry path had not yet been established through the available execution channel. Password exposure to ChatGPT: **NO**.
- Pre-change `sudo nginx -t`: **NOT RUN**. Exact vhost/fingerprint: **NOT PROVEN / NOT RECORDED**.
- Receiver, reverse tunnel, temporary exact route, external marker proof, and local F11 precheck: **NOT RUN / NOT STARTED** after the tooling stop.
- Cleanup verification: no F11 SSH process remained; local `18087` clear; base HTTPS and exact F11 path both `404`, no redirect, TLS verification result `0`; no temporary infrastructure existed to remove.
- Provider/Zernio calls: `0`; `/v1/auth/verify`: `0`; Accounts: `0`; Analytics: `0`; Provider webhook API: `0`; Provider post API: `0`; Provider contact/email: `0`.
- F11 authorization consumed: **NO**; P1-T08-F11 remains **UNCONSUMED / BLOCKED PRE-PROVIDER**; authorization remains **AUTHORIZED / UNCONSUMED**.
- Readiness: **NOT PROVEN**; parent P1-T08 **UNRESOLVED / NOT DONE**; Analytics Webhook `SPIKE_PENDING`; Next Task **NOT_STARTED**.
- After the evidence run, direct human Terminal password entry = **USER-CONFIRMED**; password sent in chat = **NO**; password exposure to ChatGPT = **NO**.
- Activity after the human Terminal entry: Provider/Zernio calls `0`; Nginx changes `0`; readiness retry **NO**.
- Current Task after documentation finalization: `P1-T08 — Verify Zernio analytics.synced Webhook Behavior`, status **UNRESOLVED / NOT DONE**. F11-F03/readiness retry is **NOT ACTIVATED**.


## P1-T08-F11-F03 - Complete Privileged Pre-Provider Readiness

Status: `DONE / ACCEPTED`. Final classification: **PRE_PROVIDER_TOOLING_UNAVAILABLE**. Accepted evidence HEAD: `052e25d03e445914224b7cc65fb40aa2801052c9`. Privileged access: **PROVEN**. Post-entry `sudo -n true`: **PASS**. Readiness: **NOT PROVEN**. Current blocker: **PRIVILEGED NGINX COMMAND DISPATCH PATH UNAVAILABLE**.

- Starting HEAD `b429f62acccd79b1b510af0ebc7625dc67d01e4a`; activation HEAD `e12e84eb3fd6b1d33645183ff78927b7be20226b`; branch `p1-t08-zernio-analytics-webhook`.
- Public baseline PASS: DNS `82.29.177.121`; TCP/443 reachable; base and exact F11 path `404`; TLS verify `0`; no redirect.
- SSH identity PASS: `marktuser@srv822206`.
- Initial `sudo -n true` required authentication; human entered password directly in Terminal only; password exposure to ChatGPT/chat = **NO**. Post-entry `sudo -n true` **PASS**; privilege independently verified **YES**.
- Pre-change `sudo -n nginx -t` **NOT RUN** because the execution tooling rejected the required privileged Nginx command before dispatch. Exact vhost/fingerprint/backup were therefore not established. The active blocker is **PRIVILEGED NGINX COMMAND DISPATCH PATH UNAVAILABLE**; sudo authorization itself is proven and is not the blocker.
- SCP of a non-secret helper returned `Connection closed`; no helper was uploaded. A subsequent alternative transfer command was rejected before dispatch. No Nginx/config state changed.
- Receiver/tunnel/temporary route/external marker/local F11 precheck: **NOT RUN / NOT STARTED**.
- Post-stop state: local `18087` clear; no SSH process; base/F11 path both `404`; TLS verify `0`; no redirect; no temporary infrastructure existed to clean up.
- Provider/Zernio calls `0`; auth/verify `0`; Accounts `0`; Analytics `0`; webhook/post API `0`; Provider contact `0`; F11 authorization consumed **NO**.
- Canonical state: F11-F03 **DONE / ACCEPTED**; F11 **UNCONSUMED / BLOCKED PRE-PROVIDER**; authorization **AUTHORIZED / UNCONSUMED**; parent P1-T08 **UNRESOLVED / NOT DONE**; Analytics Webhook `SPIKE_PENDING`; P1-T08-F09-S01 **BLOCKED — DNS ACCESS REQUIRED**; Provider contact **AUTHORIZED / NOT SENT**; Current Phase **PHASE 1 — Provider Feasibility & Basic Cost Safety**; Current Task `P1-T08 — Verify Zernio analytics.synced Webhook Behavior`; Next Task **NOT_STARTED**.
- This is PRE-PROVIDER tooling/readiness evidence only, not Zernio Provider Behavior evidence.


## P1-T08-F11-F04 - Operator-Executed Nginx Readiness Proof

Status: `DONE / ACCEPTED`. Final classification: **HTTPS_OR_NGINX_NOT_READY**. Accepted evidence HEAD: `859e06806899e66e1984f9900fc6cc6960f1b615`. Readiness: **NOT PROVEN**. Current infrastructure blocker: **NGINX_SERVICE_STATE_FAILED_WITH_VALID_CONFIG**. Root cause: **NOT YET DETERMINED**. This is PRE-PROVIDER infrastructure/readiness evidence only, not Zernio Provider Behavior evidence.

- Starting HEAD `dcd17c2cd8566918ee95232949caabb1258e435e`; activation HEAD `10f293ac868d1407af86c7838a9727add1f2b190`; branch `p1-t08-zernio-analytics-webhook`.
- Initial baseline PASS: DNS `82.29.177.121`; TCP/443 reachable; base/F11 path `404`; TLS verify `0`; redirects `0`.
- Human operator privilege proof PASS: `marktuser@srv822206`; direct Terminal password entry only; post-entry `sudo -n true` PASS; password exposed/sent to ChatGPT **NO**.
- Pre-change Nginx syntax PASS: `sudo nginx -t` reported syntax OK/test successful, exit `0`.
- Exact enabled MarketlyAI vhost proven: `/etc/nginx/sites-enabled/marketlyai.restartorg.com` -> `/etc/nginx/sites-available/marketlyai.restartorg.com`; exact `server_name marketlyai.restartorg.com`.
- PRE_CHANGE_CONFIG_SHA256: `f4416d9dfbb60ff10ff40cf5dede082dc81aa13868da4299cd5972139ff339d6`.
- Local receiver PASS on `127.0.0.1:18087`, exact `/p1-t08-f11/analytics-synced`, readiness + confirmation HTTP `401`, marker match, same-process confirmation.
- Reverse-tunnel loopback proof PASS before Nginx mutation: listener only on VPS `127.0.0.1:18087`; VPS loopback reached the same receiver marker/process.
- Rollback backup prepared before mutation: root-owned mode `600`; SHA-256 exactly matched original.
- No Nginx route patch, reload, or restart was performed. Temporary F11 route = **NEVER INSTALLED**; Nginx mutation/reload/restart = `0 / 0 / 0`.
- After operator workstation interruption/recovery, repo remained clean at activation HEAD; sudo recovery PASS; recovery `nginx -t` exit `0`; original config and backup still matched PRE_CHANGE_CONFIG_SHA256; exact F11 route remained absent (`grep` exit `1`).
- Final service-state gate failed: `ActiveState=failed`; `SubState=failed`; `CanReload=yes`. Canonical infrastructure finding: **NGINX_SERVICE_STATE_FAILED_WITH_VALID_CONFIG**. This is not a syntax failure, configuration corruption, F11 route failure, Provider failure, or Zernio failure. Root cause = **NOT YET DETERMINED**. Per contract, no repair/restart/reload/mutation followed and execution stopped as **HTTPS_OR_NGINX_NOT_READY**.
- External exact-route marker proof and local F11 harness precheck were NOT RUN because the stop occurred before route mutation. `F11_PRE_PROVIDER_READY` was not established.
- Cleanup PASS: temporary F11 route **NEVER INSTALLED**; original config restore **NOT REQUIRED — NEVER CHANGED**; original fingerprint preserved **YES**; receiver stopped **YES**; reverse tunnel stopped **YES**; local `18087` clear **YES**; temporary backup removed **YES** (`BACKUP_REMOVED_EXIT=0`); cleanup safety failure **NO**.
- Provider/Zernio calls `0`; auth/verify `0`; Accounts `0`; Analytics `0`; webhook/post API `0`; Provider contact `0`; webhook created **NO**; post published **NO**; F11 authorization consumed **NO**.
- Canonical final state: F11-F04 `DONE / ACCEPTED`; F11-F04 Result `HTTPS_OR_NGINX_NOT_READY`; accepted evidence HEAD `859e06806899e66e1984f9900fc6cc6960f1b615`; current infrastructure blocker `NGINX_SERVICE_STATE_FAILED_WITH_VALID_CONFIG`; F11 `UNCONSUMED / BLOCKED PRE-PROVIDER`; authorization `AUTHORIZED / UNCONSUMED`; parent P1-T08 `UNRESOLVED / NOT DONE`; Analytics Webhook `SPIKE_PENDING`; F09-S01 `BLOCKED — DNS ACCESS REQUIRED`; Provider contact `AUTHORIZED / NOT SENT`; Current Task `P1-T08 — Verify Zernio analytics.synced Webhook Behavior`; Next Task `NOT_STARTED`.


## P1-T08-F11-F05 - Nginx Failed Service State Diagnosis

Status: `DONE / ACCEPTED`. Final classification: **NGINX_FAILED_STATE_ROOT_CAUSE_PROVEN**. Accepted evidence HEAD: `b7652550a5f0e131bf00d74bcbdb688aff368ff0`. Current infrastructure root cause: **APACHE_PORT_80_OWNERSHIP_BLOCKS_NGINX_STARTUP_AFTER_REBOOT**. Apache workload intent: **NOT YET VERIFIED**. Evidence class: **PRE-PROVIDER INFRASTRUCTURE DIAGNOSTIC EVIDENCE — NOT Provider Behavior evidence**.

- Starting HEAD `be3084c795fb71599cac3dfe37c0fd4e3bf91256`; activation HEAD `b068e7ffe7165e441a76e34eb8e507327b7e2a22`; branch `p1-t08-zernio-analytics-webhook`.
- Fresh public baseline: DNS `82.29.177.121`; TCP/80 reachable; TCP/443 not reachable; HTTPS base/F11 timed out before TLS/HTTP; HTTP/80 base `500`, F11 path `404`, no redirect.
- nginx remains systemd `failed/failed`, Result `exit-code`, MainPID `0`. Failed ExecStart PID `843` exited status `1` at `2026-10-17 10:11:29 UTC`.
- Journal direct evidence: nginx ExecStart repeatedly failed bind on IPv4/IPv6 TCP/80 with `Address already in use`, then `still could not bind()`.
- apache2.service direct correlation: active/running since `10:11:26 UTC`, MainPID `852`, systemd-managed; socket inventory maps TCP/80 to Apache process family. Apache became active before nginx's failing bind attempts at `10:11:27-10:11:29 UTC`. TCP/443 has no listener.
- No nginx processes are running; no unmanaged/orphan nginx master exists. `/run/nginx.pid` is present but empty (0 bytes), and systemd MainPID is `0`.
- Unit evidence: Type `forking`; PIDFile `/run/nginx.pid`; ExecStartPre is nginx config test; ExecStart daemonizes nginx; ExecReload uses `-s reload`; Restart `no`; no drop-ins observed.
- Fresh `nginx -t` PASS, exit `0`. MarketlyAI config SHA remains `f4416d9dfbb60ff10ff40cf5dede082dc81aa13868da4299cd5972139ff339d6`. F11 route absent.
- Root cause: **PROVEN — APACHE_PORT_80_OWNERSHIP_BLOCKS_NGINX_STARTUP_AFTER_REBOOT**. nginx.service failed because systemd-managed Apache had already acquired TCP/80, so nginx ExecStart could not bind port 80 and exited status 1.
- No claim is made that config syntax, MarketlyAI config corruption, F11 route, Provider, or Zernio caused the failure.
- Apache workload intent / dependency ownership = **NOT YET VERIFIED**. Do not state that Apache is unwanted and do not stop it. A separate task must establish intended workload/dependencies before repair. If Apache is proven unintended and dependency-safe to stop, a later repair task may remove its TCP/80 ownership and restore Nginx. If Apache is intentional, port ownership/reverse-proxy topology requires explicit Team Leader architecture decision before repair. No repair decision is made here.
- Safety: nginx/service mutations `0`; config mutations `0`; signals/kills `0`; receiver/tunnel `0`; Provider/Zernio/auth/Accounts/Analytics/webhook/post/contact `0`; F11 authorization consumed **NO**.
- Canonical final state: F11-F05 `DONE / ACCEPTED`; result `NGINX_FAILED_STATE_ROOT_CAUSE_PROVEN`; accepted evidence HEAD `b7652550a5f0e131bf00d74bcbdb688aff368ff0`; root cause `APACHE_PORT_80_OWNERSHIP_BLOCKS_NGINX_STARTUP_AFTER_REBOOT`; Apache workload intent `NOT YET VERIFIED`; F11 `UNCONSUMED / BLOCKED PRE-PROVIDER`; authorization `AUTHORIZED / UNCONSUMED`; parent P1-T08 `UNRESOLVED / NOT DONE`; Analytics Webhook `SPIKE_PENDING`; Current Task `P1-T08 — Verify Zernio analytics.synced Webhook Behavior`; Next Task `NOT_STARTED`.


## P1-T08-F11-F06 - Apache Workload and Dependency Attribution

Status: `DONE / ACCEPTED`. Final classification: **APACHE_DEPENDENT_WORKLOAD_PROVEN**. Accepted evidence HEAD: `3d62dc830500f818dce82df48a0c4f8bf8431b3c`. Canonical workload finding: **APACHE_SERVES_ACTIVE_ELITE_WORDPRESS_WORKLOAD**. Current infrastructure conflict: **APACHE_AND_NGINX_REQUIRE_TCP_80_UNDER_CURRENT_TOPOLOGY**. Apache organizational/business intent: **NOT FULLY ATTRIBUTED**. Evidence class: **PRE-PROVIDER INFRASTRUCTURE ATTRIBUTION EVIDENCE — NOT Provider Behavior evidence**.

- Starting HEAD `85a640d535736433ed38d9f48a857003c87acd7f`; activation HEAD `c25195be062e269dd6608cba2ef620392d784990`; branch `p1-t08-zernio-analytics-webhook`.
- Apache fresh state: loaded/active/running, enabled, MainPID `852`, ControlPID `0`, ActiveEnterTimestamp `2026-10-17 10:11:26 UTC`, fragment `/lib/systemd/system/apache2.service`, no drop-ins observed. Unit uses `apachectl start/stop/graceful`, Type `forking`, Restart `on-abort`.
- Enabled sites: exactly one, `elite.restartorg.com.conf`, enabled by symlink to sites-available. Vhost = `*:80`; ServerName = `elite.restartorg.com`; ServerAlias = none observed; DocumentRoot = `/var/www/elite.restartorg.com/html`; ProxyPass/backend = none observed.
- Vhost map: `apache2ctl -S` maps `*:80` to `elite.restartorg.com`; no other enabled Apache site was present.
- Relevant modules: PHP 7.4 module and rewrite enabled. No enabled-site proxy/backend target was identified.
- DocumentRoot exists as `www-data:www-data`, mode `755`; top-level metadata contains WordPress markers including `index.php`, `wp-admin`, `wp-content`, `wp-includes`, and `wp-config.php`. Secret/application content was not read.
- Custom provenance: `dpkg-query` found no package owner for the elite Apache site config. This proves non-packaged custom configuration, not business ownership.
- Local safe Host-header HEAD to `127.0.0.1:80` / `Host: elite.restartorg.com` returned HTTP `200` from Apache with WordPress REST/shortlink headers; response body was not retrieved.
- DNS: `elite.restartorg.com -> 82.29.177.121` (same VPS). DNS is corroborating only.
- **Dependent workload proven / canonical workload finding**: **APACHE_SERVES_ACTIVE_ELITE_WORDPRESS_WORKLOAD**. The enabled custom Apache vhost directly maps to an existing WordPress application DocumentRoot and currently serves it over HTTP. Organizational/business intent remains **NOT FULLY ATTRIBUTED**; no claim is made that Apache is unwanted, safe to stop, or that elite.restartorg.com business ownership is proven.
- Fresh privileged port/integrity checkpoint: TCP/80 mapped to Apache PIDs including MainPID `852`; no TCP/443 listener observed; privileged `nginx -t` PASS / exit `0`; MarketlyAI SHA `f4416d9dfbb60ff10ff40cf5dede082dc81aa13868da4299cd5972139ff339d6` unchanged; F11 route absent (grep exit `1`).
- Decision state: **PORT OWNERSHIP / REVERSE-PROXY TOPOLOGY = DECISION REQUIRED**. Preserve accepted root cause **APACHE_PORT_80_OWNERSHIP_BLOCKS_NGINX_STARTUP_AFTER_REBOOT**; combined evidence now proves a genuine conflict because Apache serves an active workload while current Apache and Nginx topology both require TCP/80. No repair/topology choice is made here.
- Safety: Apache mutations `0`; Nginx mutations/state changes `0`; config/DNS/firewall/systemd/port changes `0`; process signals `0`; receiver/tunnel `0`; Provider/Zernio/auth/Accounts/Analytics/webhook/post/contact `0`; F11 authorization consumed **NO**.
- Canonical final state: F11-F06 `DONE / ACCEPTED`; result `APACHE_DEPENDENT_WORKLOAD_PROVEN`; accepted evidence HEAD `3d62dc830500f818dce82df48a0c4f8bf8431b3c`; workload `APACHE_SERVES_ACTIVE_ELITE_WORDPRESS_WORKLOAD`; business intent `NOT FULLY ATTRIBUTED`; conflict `APACHE_AND_NGINX_REQUIRE_TCP_80_UNDER_CURRENT_TOPOLOGY`; decision state `PORT OWNERSHIP / REVERSE-PROXY TOPOLOGY = DECISION REQUIRED`; F11 `UNCONSUMED / BLOCKED PRE-PROVIDER`; authorization `AUTHORIZED / UNCONSUMED`; parent P1-T08 `UNRESOLVED / NOT DONE`; Analytics Webhook `SPIKE_PENDING`; Current Task `P1-T08 — Verify Zernio analytics.synced Webhook Behavior`; Next Task `NOT_STARTED`.


## P1-T08-F11-F07 - Canonical Decision / Cutover Preflight Gate

Status: `DONE / ACCEPTED`. Final classification: **CANONICAL_DECISION_DOC_UNAVAILABLE**. Accepted evidence HEAD: `31f4092903c735fb5e39c0c76d6056e916df5a57`. Architecture approval: **YES — OPTION A — NGINX PUBLIC EDGE + APACHE LOOPBACK BACKEND**. Canonical D-038 registration: **NO**. Architecture decision state: **APPROVED BUT NOT YET CANONICALLY REGISTERED**. Canonical write-back path: **UNAVAILABLE THROUGH CURRENT TOOLING**. Evidence class: **PRE-PROVIDER INFRASTRUCTURE CUTOVER PREFLIGHT GATE EVIDENCE — NOT Provider Behavior evidence**.

- Starting HEAD `e8ee199d11a05bf776ebcd609447a505cda67315`; activation HEAD `03e73a002591281391822b5ac4c48a3f2d31073a`; branch `p1-t08-zernio-analytics-webhook`.
- Team Leader approved Option A: Nginx public TCP/80+443 edge; Elite Apache workload behind a loopback-only backend. This decision is scoped to the current Phase-1 test VPS recovery path.
- F11-F07 required **D-038 — Phase-1 Test VPS Public Ingress Ownership** to be written to the authoritative Project `DECISIONS.md` before infrastructure preflight.
- The canonical Project-backed `DECISIONS.md` was read successfully and latest accepted entry observed was D-037. D-038 was not registered.
- Safe canonical mutation path was unavailable: Project Files access exposed the Project source for read/retrieval but not write-back; personal Library mutation would not mutate the Project source; connected Google Drive search found no writable `DECISIONS.md`; local authorized workspace search found no canonical copy.
- No mounted/local copy was promoted as a substitute Source of Truth and no duplicate decision file was created.
- Contract stop triggered before all VPS preflight activity. Apache/Nginx fresh state, sockets, candidate loopback port, config fingerprints, enabled Nginx vhost inventory, nginx -t, TLS/ACME inspection, reverse-proxy compatibility, proposed patch/rollback/cutover/success gates were **NOT RUN / NOT PRODUCED** under F11-F07.
- Provider/Zernio calls = `0`; `/v1/auth/verify` = `0`; Accounts = `0`; Analytics = `0`; Provider webhook/post/contact = `0`; F11 authorization consumed **NO**.
- Infrastructure mutations = `0`: no Apache/Nginx service action, config edit, port/listener change, DNS/firewall/systemd change, certificate operation, package operation, receiver or tunnel.
- Canonical final state: F11-F07 `DONE / ACCEPTED`; result `CANONICAL_DECISION_DOC_UNAVAILABLE`; accepted evidence HEAD `31f4092903c735fb5e39c0c76d6056e916df5a57`; architecture approval `YES`; D-038 canonical registration `NO`; architecture decision `APPROVED BUT NOT YET CANONICALLY REGISTERED`; canonical write-back path `UNAVAILABLE THROUGH CURRENT TOOLING`; infrastructure preflight `NOT STARTED`; F11 `UNCONSUMED / BLOCKED PRE-PROVIDER`; authorization `AUTHORIZED / UNCONSUMED`; parent P1-T08 `UNRESOLVED / NOT DONE`; Analytics Webhook `SPIKE_PENDING`; Current Task `P1-T08 — Verify Zernio analytics.synced Webhook Behavior`; Next Task `NOT_STARTED`.


## P1-T08-F11-F08 - Canonical D-038 Replacement Artifact

Status: `DONE / ACCEPTED`. Final classification: **CANONICAL_REPLACEMENT_ARTIFACT_PREPARED**. Accepted evidence HEAD: `234839de7d602c5dd1238aac4054afde2b5d2ddd`. Candidate integrity: **TEAM LEADER INDEPENDENTLY VERIFIED**. Evidence class: **PRE-CANONICAL DOCUMENT REPLACEMENT ARTIFACT EVIDENCE — NOT Provider Behavior evidence**.

- Starting HEAD `7c9fb23f5a117b93d5536730fbd2f7b505c65233`; activation HEAD `9b51597a092f5229a0a4bc30716361f9f77019db`; branch `p1-t08-zernio-analytics-webhook`.
- Canonical source identity: `DECISIONS.md`, source_kind `project`, ref `file_0000000084d082109bb2da7793c2753b`, version `1`. Raw snapshot was safely materialized from this source.
- Original snapshot: `14871` bytes; SHA-256 `e179b318e4db3f1cc62b2bf25345ff652923aeb535f4afa622f146bacbe7241c`; final existing decision D-037; D-038 absent.
- Candidate: `DECISIONS.D-038.candidate.md`, outside the repository; `15743` bytes; delta `872`; SHA-256 `d426c0232ff048bbc0fd0d6918ad955ff7d0daebaebd5df23f5d7a7840d9b237`; status **PREPARED / ACCEPTED / NOT CANONICAL**.
- Byte-faithful proof: candidate prefix of `14871` bytes equals original exactly. Unified diff has zero removed lines and only the D-038 EOF append. Existing D-001..D-037 content is unchanged. Team Leader independently re-verified candidate prefix = original, D-037 occurrence `1`, D-038 occurrence `1`, and existing D-001..D-037 modified = **NO**.
- Exact appended decision title/status: **D-038 — Phase-1 Test VPS Public Ingress Ownership** / **Accepted**.

```diff
--- DECISIONS.md
+++ DECISIONS.D-038.candidate.md
@@ -301,0 +302,11 @@
+
+---
+
+## D-038 — Phase-1 Test VPS Public Ingress Ownership
+**Status:** Accepted
+
+For the current Phase-1 shared test VPS recovery/readiness path, Nginx is the canonical public HTTP/HTTPS ingress and owns public TCP/80 and TCP/443. The existing Elite WordPress workload remains supported by Apache, but Apache runs behind Nginx on a loopback-only backend listener. Nginx routes `elite.restartorg.com` to that backend while preserving MarketlyAI routing/TLS responsibilities.
+
+Apache must not retain public TCP/80 or TCP/443 ownership after the completed cutover. The cutover must be bounded, reversible, preserve the Elite workload and unrelated hosts, and include explicit rollback.
+
+This decision is scoped only to the current Phase-1 test VPS recovery/readiness path. It does not mandate Apache, Nginx, or this exact topology for Commercial V1 production deployments.
```

- Canonical Project mutation = **NO**; substitute canonical upload = **NO**; canonical D-038 registration remains **NO / NOT COMPLETED**.
- Infrastructure activity = `0`; Provider/Zernio/auth/Accounts/Analytics/webhook/post/contact = `0`; F11 execution **NO**; authorization consumed **NO**.
- Canonical final state: F11-F08 `DONE / ACCEPTED`; result `CANONICAL_REPLACEMENT_ARTIFACT_PREPARED`; accepted evidence HEAD `234839de7d602c5dd1238aac4054afde2b5d2ddd`; candidate `PREPARED / ACCEPTED / NOT CANONICAL`; D-038 canonical registration `NO / NOT COMPLETED`; Project replacement `NOT YET PERFORMED`; infrastructure preflight `NOT STARTED`; F11 `UNCONSUMED / BLOCKED PRE-PROVIDER`; authorization `AUTHORIZED / UNCONSUMED`; parent P1-T08 `UNRESOLVED / NOT DONE`; Analytics Webhook `SPIKE_PENDING`; Current Task `P1-T08 — Verify Zernio analytics.synced Webhook Behavior`; Next Task `NOT_STARTED`.

## P1-T08-F11-F09 - Nginx-Edge / Apache-Backend Cutover Preflight

Status: `EXECUTED — AWAITING TEAM LEADER REVIEW`. Final classification: **CUTOVER_PREFLIGHT_READY_OPERATOR_PRIVILEGE_REQUIRED**. Evidence class: **INFRASTRUCTURE PREFLIGHT EVIDENCE — NOT PROVIDER BEHAVIOR**. Starting HEAD `eeeeaa6c4c8d3d84f7719c993c3292b2f87474a7`; activation HEAD `6e7797ed35aae173d22044a694e426b77345268b`; branch `p1-t08-zernio-analytics-webhook`. D-038 is canonical/verified/accepted. No cutover or Provider action was executed.

### Fresh observed baseline
- Host: `marktuser@srv822206`; UTC `2026-10-18T10:55:39Z`; boot `2026-10-17 10:11:16 UTC`; kernel `5.4.0-216-generic`; public IPv4 `82.29.177.121`. `marketlyai.restartorg.com` and `elite.restartorg.com` both resolve to that IPv4.
- Apache: loaded/enabled/active/running, MainPID `852`, Result `success`; only enabled site is `/etc/apache2/sites-enabled/elite.restartorg.com.conf -> ../sites-available/elite.restartorg.com.conf`; vhost `*:80`; ServerName `elite.restartorg.com`; DocumentRoot `/var/www/elite.restartorg.com/html`; PHP 7.4 module + rewrite; no `.htaccess`; `apachectl -t` exit `0`.
- Nginx: `1.18.0`; loaded/enabled/failed/failed, MainPID `0`, Result `exit-code`. Fresh unprivileged `nginx -t/-T` stops on root-only Certbot certificate access; this does not prove syntax failure. Current-user journal access is insufficient for service journal lines.
- Sockets: public TCP/80 reachable; no TCP/443 listener; no listener on candidate backend `18080`. IPv6 socket table shows wildcard `*:80`; external IPv4 TCP/80 works and HTTP identifies Apache. Privileged PID socket mapping is unavailable without operator sudo.
- Independent external workstation baseline: both names A-resolve to `82.29.177.121`; TCP/80 succeeds for both; TCP/443 fails for both; HTTP HEAD for both currently returns Apache/WordPress Elite `200`; HTTPS cannot connect. This proves MarketlyAI public routing is not restored.

### Apache fingerprints / affected scope
- `/etc/apache2/ports.conf`: size `320`, `root:root`, mode `644`, SHA-256 `9d2d53be30cbb4c42af6b25458077db5b5ad1be4f5810fa2fee4a1d53ac604a2`.
- `/etc/apache2/sites-available/elite.restartorg.com.conf`: size `351`, `root:root`, mode `644`, SHA-256 `85ce3df3c888430cbdd528c7cacded9fe6aa6fcf4c2ec18b99ae8a9580996b59`.
- Enabled Elite symlink target = `/etc/apache2/sites-available/elite.restartorg.com.conf`.
- `mod_remoteip` is available but not enabled; source `/etc/apache2/mods-available/remoteip.load`, SHA-256 `9d6c102e8e6aae55f585b234fe73ef55849a3f5dfcc38079faf748c8117ee2e2`. `setenvif_module` is already loaded.
- Apache has no other enabled vhost, so listener relocation affects the proven Elite workload only.

### Elite baseline / proxy-compatibility classification
- Direct local and public HTTP return `200` with `Server: Apache/2.4.41 (Ubuntu)` and WordPress Link headers.
- WordPress REST root reports `url=http://elite.restartorg.com` and `home=http://elite.restartorg.com`.
- Current Apache ignores `X-Forwarded-Proto: https` for WordPress scheme generation; WordPress links remain HTTP. `HTTP_X_FORWARDED_PROTO`, `FORCE_SSL_ADMIN`, and `HTTPS` proxy markers were not found in bounded wp-config marker checks; no secret wp-config content was read.
- Host preservation: **NO ISSUE FOUND** using Nginx proxy headers.
- `X-Forwarded-For` / application + Apache log client-IP preservation: **CONFIG REQUIRED** (`mod_remoteip`, trusted loopback proxy only).
- `X-Forwarded-Proto` / WordPress HTTPS detection: **CONFIG REQUIRED** (`SetEnvIf` mapping in the Apache Elite vhost).
- Redirect loop: **UNVERIFIED UNTIL CUTOVER VALIDATION**; explicit future pass gate required.
- Rewrite/.htaccess: **NO ISSUE FOUND**; rewrite module is enabled and no current `.htaccess` exists.
- PHP: **NO ISSUE FOUND**; final topology keeps Elite execution under Apache mod_php.
### Nginx/TLS/ACME baseline
- MarketlyAI vhost `/etc/nginx/sites-available/marketlyai.restartorg.com`: size `512`, SHA-256 `f4416d9dfbb60ff10ff40cf5dede082dc81aa13868da4299cd5972139ff339d6`; enabled symlink preserved.
- Elite vhost `/etc/nginx/sites-available/elite.restartorg.com`: size `1084`, SHA-256 `239a36f957928ec534ac79f06a6516ef495b789c803c43d5944acb5f4b880be6`; it already contains `listen 443 ssl`, existing Elite certificate references, and a Certbot-generated HTTP redirect block.
- Shared `/etc/nginx/proxy_params`: size `180`, mode `644`, SHA-256 `7cff43a9768c1112bb074e9f26aaa1173da6ef85a7a20838242e846835c8eeb2`; it sets Host, X-Real-IP, X-Forwarded-For, and X-Forwarded-Proto.
- MarketlyAI and Elite renewal metadata both exist and declare Certbot `authenticator = nginx`, `installer = nginx`. Root-only `/etc/letsencrypt/live` prevents current user from reading certificate subject/SAN/issuer/validity; these are mandatory privileged pre-cutover checks.
- Elite TLS classification: **ELITE_HTTPS_ALREADY_CONFIGURED**. Public 443 is currently unavailable because Nginx is failed. The proposed cutover does **not** issue/renew a certificate, add HSTS, or force HTTP to HTTPS. Existing Elite HTTP `200` behavior is intentionally preserved through proxying.

### Unrelated enabled Nginx hosts
Observed enabled configurations include `clinic.restartorg.com`, `default` (`restartorg.com` / `www.restartorg.com`), `elite.restartorg.com`, `go.restartorg.com`, `marketlyai.restartorg.com`, `restart_your_self` (`api.restartorg.com`), `staging-admin`, `staging-admin.save`, `staging-backend`, `staging-clinic`, `staging.yourdomain.com`, `start.restartorg.com`, and `therapy`. Every observed certificate reference has a corresponding renewal config. `staging-admin.save` duplicates the staging-admin server name and is a pre-existing condition; no cleanup is authorized or proposed. No explicit `default_server` directive was observed. Future cutover must leave all unrelated files untouched and validate no unrelated-host regression.

### Proposed final topology — NOT APPLIED
```text
PUBLIC TCP/80 + TCP/443
          |
        NGINX
          |-- marketlyai.restartorg.com -> existing MarketlyAI vhost/TLS
          `-- elite.restartorg.com
                |-- HTTP  -> proxy (no forced redirect)
                `-- existing HTTPS -> proxy
                              |
                    http://127.0.0.1:18080
                              |
                           APACHE
                              |
                 Elite WordPress / mod_php
```
Apache public bind after cutover: **NONE**. Apache backend bind: **`127.0.0.1:18080` only**. Port `18080` was fresh-observed free.

### Exact proposed patch — REVIEW ONLY / APPLIED = NO
Apache `/etc/apache2/ports.conf`:
```diff
-Listen 80
-
-<IfModule ssl_module>
-    Listen 443
-</IfModule>
-
-<IfModule mod_gnutls.c>
-    Listen 443
-</IfModule>
+Listen 127.0.0.1:18080
```
Removing dormant public-443 Listen clauses ensures Apache cannot regain public 443 merely because an SSL module is later enabled.

Apache `/etc/apache2/sites-available/elite.restartorg.com.conf` (requires `mod_remoteip` enabled during the separately authorized cutover):
```diff
-<VirtualHost *:80>
+<VirtualHost 127.0.0.1:18080>
     ServerName elite.restartorg.com
     DocumentRoot /var/www/elite.restartorg.com/html
+
+    SetEnvIf X-Forwarded-Proto "^https$" HTTPS=on
+    RemoteIPHeader X-Forwarded-For
+    RemoteIPInternalProxy 127.0.0.1
```
All existing Directory/ErrorLog/CustomLog directives remain unchanged.
Nginx `/etc/nginx/sites-available/elite.restartorg.com` HTTPS server:
```diff
-    root /var/www/elite.restartorg.com/html;
-    index index.php index.html index.htm;
-
     access_log /var/log/nginx/elite.access.log;
     error_log  /var/log/nginx/elite.error.log;

     location / {
-        try_files $uri $uri/ /index.php?$args;
-    }
-
-    location ~ \.php$ {
-        include snippets/fastcgi-php.conf;
-        fastcgi_pass unix:/run/php/php7.4-fpm.sock;
+        include /etc/nginx/proxy_params;
+        proxy_pass http://127.0.0.1:18080;
     }
```
Keep the existing `.ht` deny, `listen 443 ssl`, certificate paths, SSL include, and DH params unchanged.

Nginx Elite HTTP server: replace the existing Certbot HTTP-to-HTTPS redirect/404 block with a same-host HTTP proxy so current externally observable HTTP service is preserved and no new forced redirect is introduced:
```diff
 server {
-    if ($host = elite.restartorg.com) {
-        return 301 https://$host$request_uri;
-    }
-
     listen 80;
     server_name elite.restartorg.com;
-    return 404;
+
+    location / {
+        include /etc/nginx/proxy_params;
+        proxy_pass http://127.0.0.1:18080;
+    }
 }
```
No MarketlyAI or unrelated Nginx file is changed.
### Future cutover sequence — NOT EXECUTED
1. Human/operator obtains direct privileged authorization; no password through chat/tool input.
2. Re-check exact hashes/fingerprints and abort on drift for Apache ports/site, Nginx Elite/MarketlyAI, `proxy_params`, and remoteip module source.
3. Before mutation, perform privileged socket/PID mapping, privileged Nginx syntax/effective-config validation, MarketlyAI + Elite certificate identity/validity reads, and relevant journal checks. Any failure or unexpected new warning => STOP.
4. Back up every file to be modified with root-owned exact copies and record backup hashes.
5. Enable Apache `remoteip`; apply only the pre-reviewed Apache ports/vhost changes and Nginx Elite patch. Leave MarketlyAI and unrelated vhosts untouched.
6. Validate Apache and Nginx configuration before service transition. Failure => restore file/module pre-state; no cutover.
7. Apply the authorized Apache service transition so it moves from public 80 to loopback `127.0.0.1:18080`; immediately verify local Host-header HTTP `200`, PHP/WordPress baseline, XFP HTTP/HTTPS behavior, and no Apache public 80/443 socket.
8. Apply the authorized Nginx service transition; verify Nginx owns public 80/443 and Apache owns only `127.0.0.1:18080`.
9. Run local Host-header validation through Nginx for Elite HTTP/HTTPS semantics and MarketlyAI expected routing.
10. Run external validation: Elite HTTP remains functional without forced redirect; existing Elite HTTPS has no loop/mixed-scheme failure; MarketlyAI returns expected Nginx routing with trusted TLS; no unrelated-host regression.
11. Re-verify certificate state, both config tests, and final socket ownership.
12. Reboot persistence remains a later separately authorized validation: require Apache loopback-only, Nginx public 80/443, healthy services, Elite + MarketlyAI validation PASS, and no unrelated regression.
### Explicit rollback — NOT EXECUTED
Rollback triggers: Elite non-200/unexpected behavior, redirect loop, PHP/WordPress failure, MarketlyAI route/TLS failure, unrelated-host regression, Nginx bind/activation failure, Apache backend failure, config-test failure, unexpected certificate state, or unexpected socket ownership.

Rollback procedure for the future cutover task:
1. Return Nginx to non-serving state if the cutover activated it, so public 80/443 are released.
2. Restore exact original Apache `ports.conf` and Elite vhost backups plus the exact original Nginx Elite vhost backup; restore only cutover-specific module state if `remoteip` was newly enabled.
3. Validate restored configuration and confirm restored hashes equal the pre-cutover fingerprints.
4. Transition Apache back to original `Listen 80` / `*:80` Elite topology; keep Nginx non-serving as required to avoid the original port collision.
5. Verify Elite public HTTP returns the proven Apache WordPress baseline, Apache owns public 80, backend 18080 is absent, and no unexpected 443 listener exists.
6. Verify no unrelated config file changed. DNS/firewall/certificates remain untouched.

### Future objective PASS gates
A separately authorized cutover may pass only if privileged Nginx config validation PASS; Apache syntax PASS; expected certificate identity/validity PASS; Nginx public TCP/80 and configured TCP/443 ownership proven; Apache public 80/443 absent; Apache listener exactly loopback backend; Elite HTTP baseline preserved without forced redirect; existing Elite HTTPS works with no loop/mixed-scheme failure; MarketlyAI expected routing + trusted TLS preserved; no unrelated-host regression; client-IP/XFP semantics verified; hashes match approved patch inputs; and reboot persistence is later explicitly verified.
### Privilege/execution path
Non-interactive privilege is **NOT AVAILABLE**: the read-only non-interactive privilege check returned exit `1` / password required. The later cutover therefore requires controlled human/operator privileged execution for root-owned config backups/writes, remoteip enablement, privileged Nginx effective-config/certificate/socket checks, and service transition. This is a known operator-assisted path, not authorization to use or expose a password. Classification: **CUTOVER_PREFLIGHT_READY_OPERATOR_PRIVILEGE_REQUIRED**.

Safety totals: Apache/Nginx config changes `0`; service actions `0`; port/listener changes `0`; DNS/firewall/systemd/certificate/package/WordPress/PHP/database changes `0`; receiver/tunnel `0`; Provider/Zernio `/v1/auth/verify`/Accounts/Analytics/Delta/webhook/post/contact calls `0`; F11 execution **NO**; F11 authorization consumed **NO**. Analytics Webhook remains `SPIKE_PENDING`.

## P1-T08-F11-F09-R01 — Privileged Read-Only Nginx/TLS Evidence

Capture time: `2026-10-18T11:47:26Z`. Host: `srv822206.hstgr.cloud`. Kernel: `Linux 5.4.0-216-generic x86_64 GNU/Linux`.
Repository branch: `p1-t08-zernio-analytics-webhook`; R01 activation HEAD: `f3117c4cae755c2eec6df8638276a3781fcc75f2`.
Evidence class: **PRIVILEGED READ-ONLY INFRASTRUCTURE EVIDENCE — NOT PROVIDER BEHAVIOR**.
Capture completion marker: `R01_READ_ONLY_CAPTURE_COMPLETE`; local capture/tee exit: `0`. No password or private key was recorded in the capture.

### Service state, journal, and sockets

| Check | Captured result | Classification |
|---|---|---|
| systemctl show nginx.service | loaded, enabled, ActiveState=failed, SubState=failed, MainPID=0, Result=exit-code | **FAIL — SERVICE NOT RUNNING** |
| systemctl show apache2.service | loaded, enabled, ActiveState=active, SubState=running, MainPID=852, Result=success | **PASS — SERVICE ACTIVE** |
| Privileged journalctl for Nginx/Apache | exit 0; Nginx logged bind failures for 0.0.0.0:80 and [::]:80 with Address already in use, followed by still could not bind and systemd startup failure | **FAIL — TCP/80 BIND CONFLICT EVIDENCED** |
| Same journal | duplicate staging-admin.restartorg.com warnings on 0.0.0.0:443 and 0.0.0.0:80 | **WARNING — PRE-EXISTING DUPLICATE SERVER NAME** |
| ss -ltnp | Apache processes own wildcard *:80; no TCP/443 listener and no TCP/18080 listener appear in the captured inventory | **FAIL — PUBLIC HTTPS NOT RESTORED; BACKEND NOT LISTENING** |
| Apache process inventory | Main PID 852, workers 13294, 13296–13298, 13468–13473 own port-80 sockets | **PASS — PORT-80 OWNERSHIP ATTRIBUTED TO APACHE** |
| apachectl -S | only enabled Apache vhost shown: *:80 elite.restartorg.com from /etc/apache2/sites-enabled/elite.restartorg.com.conf:1 | **PASS — APACHE VHOST INVENTORY** |

The observed Nginx startup failure is supported by the captured journal: Apache owns TCP/80 while Nginx attempted to bind IPv4 and IPv6 TCP/80. This is not inferred from service state alone. No active Nginx listener or TCP/443 listener was observed. Successful configuration tests below do **not** establish service startup, public HTTPS, or external reachability.

### Nginx and Apache configuration validation

| Command | Exact result | Classification |
|---|---|---|
| nginx -t | exit 0; syntax is ok; test is successful; duplicate staging-admin.restartorg.com warnings on IPv4 ports 443 and 80 | **PASS WITH WARNINGS** |
| nginx -T | exit 0; 693 raw output lines; effective directives were inspected and summarized in the capture; same duplicate-name warnings | **PASS WITH WARNINGS — CONFIG READ, NOT SERVICE READINESS** |
| apachectl -t | exit 0; Syntax OK | **PASS** |
| apachectl -S | Elite is the only listed enabled Apache vhost, on *:80 | **PASS — INVENTORY ONLY** |

Nginx includes /etc/nginx/sites-enabled/*. The enabled directory contains symlinks to site files and a regular file staging-admin.save; the wildcard includes that .save file. It defines a second staging-admin.restartorg.com vhost and explains the captured duplicate-name warnings. The file is unrelated to the target patch and remains untouched.

No explicit default_server directive was observed in the captured effective directives. Implicit default selection therefore depends on the first server for each listen address/port in include order; the captured order begins with the Clinic vhost for IPv4 wildcard ports 80 and 443, while the default site defines the captured IPv6 [::]:80 and [::]:443 listeners. This describes configuration ordering only; Nginx was not running.

### Effective enabled Virtual Host inventory

The following inventory is from the captured nginx -T effective configuration summary and /etc/nginx/sites-enabled listing. Redirect/404 notes describe configured directives, not live responses while Nginx is failed.

| Enabled source | listen / server_name | Routing and TLS references observed |
|---|---|---|
| clinic.restartorg.com → sites-available/clinic.restartorg.com | 443 ssl, 80; clinic.restartorg.com | Root /var/www/clinic.restartorg.com/html; PHP FastCGI /run/php/php7.4-fpm.sock; certificate /etc/letsencrypt/live/clinic.restartorg.com/fullchain.pem; HTTP conditional HTTPS redirect with fallback 404 |
| default → sites-available/default | 80, [::]:80, 443 ssl, [::]:443 ssl; restartorg.com and www.restartorg.com | Root /var/www/staging; PHP FastCGI /var/run/php/php7.4-fpm.sock; certificate /etc/letsencrypt/live/restartorg.com/fullchain.pem; HTTP-to-HTTPS redirect |
| elite.restartorg.com → sites-available/elite.restartorg.com | 443 ssl, 80; elite.restartorg.com | Root /var/www/elite.restartorg.com/html; PHP FastCGI /run/php/php7.4-fpm.sock; certificate /etc/letsencrypt/live/elite.restartorg.com/fullchain.pem; existing HTTP conditional redirect with fallback 404 |
| go.restartorg.com → sites-available/go.restartorg.com | 443 ssl, 80; go.restartorg.com | Root /var/www/go.restartorg.com/html; PHP FastCGI /run/php/php7.4-fpm.sock; certificate /etc/letsencrypt/live/go.restartorg.com/fullchain.pem; HTTP conditional redirect with fallback 404 |
| marketlyai.restartorg.com → sites-available/marketlyai.restartorg.com | 80, 443 ssl; marketlyai.restartorg.com | HTTP return 404; TLS certificate /etc/letsencrypt/live/marketlyai.restartorg.com/fullchain.pem; no explicit root, proxy_pass, or fastcgi_pass was observed for these server blocks in the captured effective directive summary |
| restart_your_self → sites-available/restart_your_self | 443 ssl, 80; api.restartorg.com | Root /root/restart_your_self; proxy to http://unix:/run/restart_your_self.sock; proxy_params; CORS headers; certificate /etc/letsencrypt/live/api.restartorg.com/fullchain.pem; HTTP conditional redirect with fallback 404 |
| staging-admin → sites-available/staging-admin | 443 ssl, 80; staging-admin.restartorg.com | Root /var/www/mobileApp/staging-admin; SPA try_files to /index.html; certificate path uses /etc/letsencrypt/live/staging-clinic.restartorg.com/fullchain.pem; HTTP conditional redirect with fallback 404 |
| staging-admin.save (regular enabled file) | 443 ssl, 80; staging-admin.restartorg.com | Duplicates staging-admin root, routing, and staging-clinic certificate references; causes duplicate-name warnings; preserved unchanged |
| staging-backend → sites-available/staging-backend | 443 ssl, 80; staging-backend.restartorg.com | Proxy http://localhost:5000; WebSocket upgrade/connection headers; certificate /etc/letsencrypt/live/staging-backend.restartorg.com/fullchain.pem; HTTP conditional redirect with fallback 404 |
| staging-clinic → sites-available/staging-clinic | 443 ssl, 80; staging-clinic.restartorg.com | Root /var/www/mobileApp/staging-clinic; SPA try_files to /index.html; certificate /etc/letsencrypt/live/staging-clinic.restartorg.com/fullchain.pem; HTTP conditional redirect with fallback 404 |
| staging.yourdomain.com → sites-available/staging.yourdomain.com | 80; staging.yourdomain.com | Root /var/www/staging; PHP FastCGI /run/php/php-fpm.sock; no TLS listener was present in this vhost summary |
| start.restartorg.com → sites-available/start.restartorg.com | 443 ssl, 80; start.restartorg.com | Root /var/www/start.restartorg.com/html; PHP FastCGI /run/php/php7.4-fpm.sock; certificate /etc/letsencrypt/live/start.restartorg.com/fullchain.pem; HTTP conditional redirect with fallback 404 |
| therapy → sites-available/therapy | 443 ssl, 80; therapy.restartorg.com | Proxy http://unix:/run/theraby.sock with 500-second read/connect timeouts; certificate /etc/letsencrypt/live/therapy.restartorg.com/fullchain.pem; HTTP conditional redirect with fallback 404 |

The two target Certbot renewal files exist and record authenticator = nginx and installer = nginx:
- /etc/letsencrypt/renewal/marketlyai.restartorg.com.conf
- /etc/letsencrypt/renewal/elite.restartorg.com.conf

These metadata entries are supplementary only; current certificate identity and validity were independently checked below.

### Target TLS certificate evidence

Both target certificate paths were readable and resolved to archived certificate files. OpenSSL hostname, not-expired, not-before, and trust-chain checks all passed for each target. These checks do not validate unrelated host certificates or prove that TLS is being served on the network.

| Field | MarketlyAI | Elite |
|---|---|---|
| Configured certificate path | /etc/letsencrypt/live/marketlyai.restartorg.com/fullchain.pem | /etc/letsencrypt/live/elite.restartorg.com/fullchain.pem |
| Resolved path | /etc/letsencrypt/archive/marketlyai.restartorg.com/fullchain1.pem | /etc/letsencrypt/archive/elite.restartorg.com/fullchain6.pem |
| Subject | CN = marketlyai.restartorg.com | CN = elite.restartorg.com |
| SAN | DNS:marketlyai.restartorg.com | DNS:elite.restartorg.com |
| Issuer | C = US, O = Let's Encrypt, CN = YR2 | C = US, O = Let's Encrypt, CN = YR2 |
| Serial | 0591ED20556637C5F5CA861616ECBF0D4856 | 05C6DD2570CFEC8148765CB8677BB8D8E965 |
| Not before | 2026-10-13 15:50:57 UTC | 2026-08-19 11:59:18 UTC |
| Not after | 2027-01-11 15:50:56 UTC | 2026-11-17 11:59:17 UTC |
| SHA-256 fingerprint | 64:BE:BC:E0:FD:C5:86:D5:EF:DB:56:EC:5B:38:85:AA:F2:0A:A4:72:B6:9D:39:6C:1E:28:D8:4F:45:01:BD:D7 | 7E:A7:BA:05:1C:7A:3F:63:6E:2D:0E:0C:F8:B5:25:41:14:37:19:1B:69:D7:24:2B:8E:FB:6D:F6:B4:B2:6F:D2 |
| openssl x509 -checkhost | hostname matched; exit 0 | hostname matched; exit 0 |
| openssl x509 -checkend 0 | Certificate will not expire; exit 0 | Certificate will not expire; exit 0 |
| Not-before check | PASS | PASS |
| openssl verify with configured chain and system trust store | cert.pem: OK; exit 0 | cert.pem: OK; exit 0 |
| Overall certificate evidence | **PASS — IDENTITY + CURRENT VALIDITY + CHAIN** | **PASS — IDENTITY + CURRENT VALIDITY + CHAIN** |

### Captured configuration fingerprints

The six cutover-relevant fingerprints match the previously recorded F09 preflight values in this capture:

| File | SHA-256 |
|---|---|
| /etc/nginx/sites-available/marketlyai.restartorg.com | f4416d9dfbb60ff10ff40cf5dede082dc81aa13868da4299cd5972139ff339d6 |
| /etc/nginx/sites-available/elite.restartorg.com | 239a36f957928ec534ac79f06a6516ef495b789c803c43d5944acb5f4b880be6 |
| /etc/nginx/proxy_params | 7cff43a9768c1112bb074e9f26aaa1173da6ef85a7a20838242e846835c8eeb2 |
| /etc/apache2/ports.conf | 9d2d53be30cbb4c42af6b25458077db5b5ad1be4f5810fa2fee4a1d53ac604a2 |
| /etc/apache2/sites-available/elite.restartorg.com.conf | 85ce3df3c888430cbdd528c7cacded9fe6aa6fcf4c2ec18b99ae8a9580996b59 |
| /etc/apache2/mods-available/remoteip.load | 9d6c102e8e6aae55f585b234fe73ef55849a3f5dfcc38079faf748c8117ee2e2 |

The capture also fingerprinted enabled Nginx site targets:

| Enabled source/target | SHA-256 |
|---|---|
| clinic.restartorg.com | edb2aceb849e44a9a5ad7d64253e9b5183846e3ea21b16d7b383e985badf3111 |
| default | 16b34c2d1e561acc5b7e763ebeb3a4a630a83ddf0bdd11d7c452fecc35927dc8 |
| elite.restartorg.com | 239a36f957928ec534ac79f06a6516ef495b789c803c43d5944acb5f4b880be6 |
| go.restartorg.com | e686c12bd872b7cdddfd4fff4d8ac7a57806c2fe26c9912aba48758e2420b951 |
| marketlyai.restartorg.com | f4416d9dfbb60ff10ff40cf5dede082dc81aa13868da4299cd5972139ff339d6 |
| restart_your_self | 5836d848bd16e2c0dc1c8bf1dfe0bbc923a2071ac80ad330204e61011d3ee85d |
| staging-admin | d8766031cbb966c6721990355bd834d5c88260eff5b227cc1bfae99c72eddcea |
| staging-admin.save | f0d1fed9fb2609316524160cb14675f9a49de15564583bea4a3e2c4c204dca43 |
| staging-backend | 2a35a3d501824ca43f5139800eacb687655c28e47eb02c19bf065c44b71c1b77 |
| staging-clinic | 3ecfe79bb4cd00993941e39f274d2930f48dba6f3c798d43a78a270920830db3 |
| staging.yourdomain.com | 1504940dff306aefd1de2911631ac4396d8b774465a1a6d201e43cbd9e52860f |
| start.restartorg.com | 4eceb2cf2e46e2c106f93a061e5a1aefb7d68f7d3cbd663fdf7d124d53a30826 |
| therapy | d7b4cf459b43d7a05a085e8cb7219289b1451e2051d8845e594bdb002f03c3b8 |

The hashes are read-only fingerprints; no file was edited on the VPS. The staging-admin.save file remains in place.

### Review-only patch compatibility and discrepancies

- **Apache backend prerequisite remains absent.** Current Apache owns *:80 and its enabled Elite vhost remains *:80; TCP/18080 was not listening. The proposed Listen 127.0.0.1:18080, Elite vhost relocation, loopback-only mod_remoteip trust, and Nginx proxy changes remain unapplied. No claim of backend readiness is supported.
- **Elite TLS references are compatible with the existing target certificate.** The effective Elite vhost already references the Elite fullchain and private-key paths; the leaf certificate identity/validity/chain checks passed. The private key was never read. Nginx is failed, so this is certificate/config evidence, not served HTTPS evidence.
- **Host/client-IP/HTTPS semantics are planned but not runtime-verified.** Existing /etc/nginx/proxy_params sets Host $http_host, X-Real-IP $remote_addr, X-Forwarded-For $proxy_add_x_forwarded_for, and X-Forwarded-Proto $scheme. The reviewed patch depends on Apache interpreting forwarded scheme and trusting only loopback for X-Forwarded-For; this has not been tested after cutover.
- **Elite HTTP behavior requires explicit acceptance/validation.** The current Nginx config contains Certbot conditional HTTP-to-HTTPS redirect logic with a 404 fallback. The review-only proposal replaces that block with same-host proxying and no forced redirect to preserve the previously observed Apache-served HTTP 200 behavior while Nginx is down. This is an intentional config-behavior change and is not a proven post-cutover result.
- **MarketlyAI routing is a material unresolved discrepancy.** Its current effective vhost has HTTP return 404 and an HTTPS certificate reference, but no explicit root, proxy_pass, or fastcgi_pass was observed in the captured target-server directives. The previous preflight's wording that expected MarketlyAI routing would be preserved is not enough to establish what application route should be served. The proposed patch does not edit the MarketlyAI file, and its TLS certificate passed validation, but expected MarketlyAI application routing and public HTTPS remain **NOT VERIFIED**.
- **Duplicate staging-admin remains unresolved and out of scope.** staging-admin.save is loaded by the wildcard include and references the staging-clinic certificate. The target checks did not validate whether that certificate SAN covers staging-admin.restartorg.com; treat SAN compatibility as **NOT VERIFIED**, not as a proven certificate failure.
- **No behavior claims for unrelated sites.** Their effective configuration references and hashes were inventoried, but unrelated-host HTTP/TLS/application behavior was not exercised. Redirect-loop, mixed-scheme, Elite WordPress/PHP, client-IP interpretation, and unrelated-host regression checks remain future cutover validation gates.
- **Patch status:** **REVIEW ONLY / NOT APPLIED**. No target or unrelated vhost, Apache config, service, listener, certificate, DNS, firewall, systemd unit, package, WordPress/PHP, or database state was changed.

### R01 classification and safety boundary

- Evidence capture: **COMPLETE**.
- Documentation finalization: **ACCEPTED WITH NON-BLOCKING NOTES** at documentation commit `837a6ae41f10b3154f2f15e7be9ac9035b741f48`.
- Nginx/HTTPS recovery: **NOT PERFORMED**.
- Cutover: **NOT EXECUTED**.
- Provider/Zernio calls: 0.
- F11 execution / authorization consumption: **NO / NO**; F11 remains **UNCONSUMED / BLOCKED PRE-PROVIDER**.
- Analytics Webhook: SPIKE_PENDING.
- Parent P1-T08: **UNRESOLVED / NOT DONE**.
- Next Task: **NOT STARTED**.
- Cutover readiness and external reachability: **NOT ESTABLISHED**.


### P1-T08-F11-F09-R02 - Follow-up Read-Only Evidence (2026-10-18)

Branch: `p1-t08-zernio-analytics-webhook`. Starting/activation HEAD: `412c18dcf2abe91a7b023ec677d5630df82bbe62`. No VPS or Provider action was authorized beyond read-only inspection.

#### External HTTPS observations

From Windows PowerShell, using `curl.exe` with `--max-time 10 --max-redirs 0` and `Test-NetConnection -Port 443`:

- `marketlyai.restartorg.com` resolved to `82.29.177.121`; curl exit 28 after 10.012150 seconds; `HTTP_CODE=000`, no remote IP established by curl, and TCP/443 test returned `TcpTestSucceeded=False`.
- `staging-admin.restartorg.com` resolved to `82.29.177.121`; curl exit 28 after approximately 10 seconds; TCP/443 test returned `TcpTestSucceeded=False`.
- These results establish external TCP/HTTPS unavailability at test time. They do not establish a TLS certificate failure because the TLS handshake/hostname validation was not reached. The curl `TLS_VERIFY=0` field from the timed-out MarketlyAI attempt is not a successful TLS check.

#### staging-admin certificate verification

Certificate file inspected: `/etc/letsencrypt/live/staging-clinic.restartorg.com/fullchain.pem`.

- Subject: `CN = staging-clinic.restartorg.com`.
- Issuer: `C = US, O = Let's Encrypt, CN = YR2`.
- Serial: `05229C5532638AAE50857E5CFAADD960EE8E`.
- Validity: `notBefore=Sep 1 22:36:53 2026 GMT`; `notAfter=Nov 30 22:36:52 2026 GMT`.
- SAN: `DNS:staging-admin.restartorg.com`, `DNS:staging-clinic.restartorg.com`.
- SHA-256 fingerprint: `2B:36:28:DF:CB:ED:1C:52:E8:9A:F5:2D:BB:30:9A:87:20:81:22:27:C0:F2:B7:42:B2:7B:57:AC:E5:08:D9:0C`.
- `openssl x509 ... -checkhost staging-admin.restartorg.com`: hostname matches; exit 0.
- `openssl x509 ... -checkend 0`: "Certificate will not expire"; exit 0.
- `openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt -untrusted /etc/letsencrypt/live/staging-clinic.restartorg.com/chain.pem /etc/letsencrypt/live/staging-clinic.restartorg.com/cert.pem`: certificate OK; exit 0.
- Result: **PASS - CERTIFICATE HOSTNAME, CURRENT VALIDITY, AND TRUST CHAIN**. The private key was not read. This does not prove the certificate is being served over live HTTPS.

#### Effective Nginx inclusion of staging-admin.save

Command used: `sudo nginx -T 2>&1 | grep -n -B 4 -A 18 'staging-admin\.restartorg\.com'`.

Observed output:
- Nginx reports conflicting `staging-admin.restartorg.com` server names on `0.0.0.0:443` and `0.0.0.0:80`, marked "ignored".
- The effective dump contains `# configuration file /etc/nginx/sites-enabled/staging-admin:` and later `# configuration file /etc/nginx/sites-enabled/staging-admin.save:`.
- Both define `staging-admin.restartorg.com` on 443 ssl and 80, the same document root `/var/www/mobileApp/staging-admin`, and the same `staging-clinic` certificate paths.
- Conclusion: `staging-admin.save` is included in the effective configuration and creates duplicate-name warnings. It remains preserved and unmodified. The warnings do not prove service availability; external TCP/443 remains unreachable.

#### MarketlyAI intended routing - unresolved blocker

The previously captured MarketlyAI vhost has `listen 80`, `listen 443 ssl`, `server_name marketlyai.restartorg.com`, a `location /` returning 404, and certificate references under `/etc/letsencrypt/live/marketlyai.restartorg.com/`. No explicit `root`, `proxy_pass`, or `fastcgi_pass` was observed in the target directives.

The R02 read-only search for matching deployment/config files under `/etc/nginx`, `/etc/apache2`, `/etc/systemd/system`, `/opt`, `/srv`, and `/var/www` returned no paths for the specified file extensions and `marketlyai|ai-marketing-manager` terms. This bounded search is not proof that an application does not exist elsewhere.

- Intended MarketlyAI application route: **NOT VERIFIED**.
- Exact blocker: no authoritative deployment manifest/service/config matching the searched terms was found in the searched locations, while the current target vhost explicitly returns 404 and has no configured application root or upstream in the captured directives.
- Required resolution: authoritative deployment/routing evidence must be provided or located in a separately authorized read-only investigation. No routing change is authorized by R02.

#### R02 classification and safety

- Staging-admin certificate hostname/SAN: **PASS**.
- Staging-admin certificate current validity: **PASS**.
- Staging-admin certificate trust chain: **PASS**.
- staging-admin.save effective inclusion and duplicate-name warnings: **CONFIRMED / PRESERVE UNCHANGED**.
- External HTTPS TCP/443: **FAIL - CONNECTION TIMEOUT** for both tested hostnames.
- Intended MarketlyAI application routing: **NOT VERIFIED / BLOCKED**.
- Cutover readiness: **CUTOVER_PREFLIGHT_EVIDENCE_INCOMPLETE**.
- Apache/Nginx/systemd/config/listener/DNS/firewall/certificate/package mutations: 0. Service actions: 0. Receiver/tunnel: 0. Provider/Zernio/auth/Accounts/Analytics/Delta/webhook/post/contact calls: 0. F11 execution: NO; F11 authorization consumed: NO.
- Existing R01 findings remain historical. R02 supersedes only the prior staging-admin SAN/chain verification gap; it does not establish live HTTPS or resolve MarketlyAI routing.

### P1-T08-F11-F09-R03 - Authoritative MarketlyAI Deployment Route Evidence (2026-10-18)

Status: **DONE / ACCEPTED WITH NON-BLOCKING NOTES**.

Result: NOT VERIFIED — AUTHORITATIVE MARKETLYAI DEPLOYMENT ROUTE NOT FOUND.

Investigation timestamp (UTC): 2026-10-18T14:43:44.045Z. Repository revision after the separately pushed activation commit: 9936921851cac6c55445425b8d12f2fbec9c6269. The activation commit was pushed and its local, tracking, and live remote HEADs were verified equal before this investigation began.

#### Repository identity and authoritative-source findings

- README.md lines 3-4, originating at commit 804e9dea4b0fdf4e0454923a3f3cc6298dae8521, explicitly describes this repository as the minimal internal P1-T01 Provider Spike Harness and says it is not the production application/monorepo.
- package.json lines 2-5 names and describes the package as ai-marketing-manager-provider-spike-harness / internal Phase 1 provider behavior tooling. Lines 8-20 contain test, typecheck, build, and P1 provider-runner scripts; no production application start or deployment script is declared.
- The activated branch contains 56 tracked files. A filename audit for Docker/Compose, Nginx/Apache/Caddy, deploy/release, systemd, Procfile, Vercel/Railway, WSGI/ASGI, Gunicorn/Uvicorn, YAML, and TOML deployment artifacts returned zero matching paths.
- The same deployment-artifact filename audit over all Git refs/history returned zero matching paths. This is a repository/history finding, not proof that an application does not exist elsewhere.
- Source-only command executed:
    git grep -n -I -i -E 'marketlyai\.restartorg\.com|marketlyai|server_name|proxy_pass|manage\.py|gunicorn|uvicorn|docker|compose|caddy|systemd|procfile' HEAD -- src tests README.md package.json
  Exit: 0. The only output was tests/provider-spike/p1-t08-f10.test.ts:8, which uses the synthetic URL https://marketlyai.example.invalid/p1-t08-f10/analytics-synced. This is a test fixture, not an application route or deploy target.
- All-ref application-source history query executed:
    git log --all --oneline -G 'marketlyai\.restartorg\.com|server_name marketlyai|proxy_pass|docker compose|gunicorn|uvicorn|manage\.py' -- . ':!PROGRESS.md' ':!docs/PROVIDER_SPIKE_RESULTS.md' ':!docs/TEST_MATRIX.md'
  Result: no matching commit output; command exit 0. No authoritative application routing source was identified in the repository history examined.
- Read-only GitHub code searches for marketlyai.restartorg.com, marketlyai, and MarketlyAI deployment route returned no results in the searched index. Search/index visibility is bounded and this is not proof that no private or unindexed source exists.
- Read-only Vercel project-name searches for marketlyai and AI-Marketing-Manager returned zero projects; the repository filter GirgesAdam/AI-Marketing-Manager returned zero projects. The accessible Railway project inventory contained two projects and neither project name matched MarketlyAI, AI Marketing Manager, or restartorg. These were bounded discovery checks; no unrelated project configuration was inspected and no deployment platform was changed.

#### Existing R02 evidence preserved

R02 evidence is preserved unchanged at docs/PROVIDER_SPIKE_RESULTS.md lines 2082-2137 and docs/TEST_MATRIX.md lines 1634-1648, originating in evidence commit 9d3453f8722cc9810991a7d598f06233735d01f1.

- The previously captured MarketlyAI Nginx vhost defines listen 80, listen 443 ssl, server_name marketlyai.restartorg.com, a location / returning 404, and certificate references under /etc/letsencrypt/live/marketlyai.restartorg.com/. No explicit root, proxy_pass, or fastcgi_pass was observed in the captured target directives.
- R02's bounded VPS search under /etc/nginx, /etc/apache2, /etc/systemd/system, /opt, /srv, and /var/www returned no matching deployment/config paths for the specified extensions and marketlyai|ai-marketing-manager terms.
- R02 recorded external TCP/443 connection timeouts for MarketlyAI and staging-admin on 2026-10-18. R03 did not repeat an external connectivity probe; the R02 result remains historical evidence and must not be presented as a fresh R03 status.
- The staging-admin certificate result does not establish the intended MarketlyAI application route or live HTTPS availability.

#### Determination and required missing artifact

NOT VERIFIED — AUTHORITATIVE MARKETLYAI DEPLOYMENT ROUTE NOT FOUND.

No verified application upstream, local service/port, production application repository, or deployment manifest can be derived from the sources examined. The existing hostname and historical test-receiver paths are not sufficient to infer the intended application route.

Required input before any future cutover decision:
1. The authoritative production application repository and commit plus its deployment manifest/service definition, OR the authoritative deployment-platform project configuration showing the source repository/revision and the custom-domain-to-service/upstream mapping; and
2. If that artifact does not settle intent, an owner decision confirming whether marketlyai.restartorg.com is intended to serve the production application or only the Phase-1 test receiver.

Do not invent an upstream or prepare/apply a route patch from this evidence. Cutover readiness remains BLOCKED and no infrastructure action is authorized by R03.

#### Safety and canonical state

- Infrastructure, Apache/Nginx/systemd, port/listener, DNS/firewall, certificate, package, and deployment mutations: 0.
- External connectivity probes during R03: 0.
- Provider/Zernio/auth/Accounts/Analytics/webhook/post/contact calls: 0.
- Receiver/tunnel setup: 0.
- F11 execution: NO; F11 authorization consumed: NO.
- Parent P1-T08: UNRESOLVED / NOT DONE.
- Analytics Webhook: SPIKE_PENDING.
- F11: UNCONSUMED / BLOCKED PRE-PROVIDER; one-run authorization AUTHORIZED / UNCONSUMED.
- Next Task: NOT_STARTED.

#### Exact deployment-artifact filename filters

    $files=git -C $repo ls-files
    $pathMatches=@($files | Where-Object { $_ -match '(?i)(docker|compose|nginx|apache|caddy|deploy|release|systemd|procfile|vercel|railway|fly\.toml|workflow|marketlyai|gunicorn|uvicorn|wsgi|asgi|\.ya?ml$|\.toml$)' })
    Result: TRACKED_FILE_COUNT=56; DEPLOYMENT_PATH_MATCH_COUNT=0.

    $historyPaths=git -C $repo log --all --name-only --pretty=format:
    $historyMatches=@($historyPaths | Where-Object { $_ -match '(?i)(docker|compose|nginx|apache|caddy|deploy|release|systemd|procfile|vercel|railway|fly\.toml|workflow|marketlyai|gunicorn|uvicorn|wsgi|asgi)' } | Sort-Object -Unique)
    Result: HISTORY_DEPLOYMENT_PATH_MATCH_COUNT=0.

#### Team Leader acceptance / closure (2026-10-18)

Task status: **DONE / ACCEPTED WITH NON-BLOCKING NOTES**.

Team Leader disposition: **ACCEPTED WITH NON-BLOCKING NOTES**. Reviewed R03 HEAD: `61ea290706e3101bf9f6c64afacb4808c52f918b`; R03 evidence/documentation commit: `dc00d5d42ec0b7506f27b1e22a45bcb77d87a49b`; activation commit: `9936921851cac6c55445425b8d12f2fbec9c6269`.

Technical result is unchanged: **NOT VERIFIED — AUTHORITATIVE MARKETLYAI DEPLOYMENT ROUTE NOT FOUND**. Acceptance is limited to investigation/evidence/documentation quality; it is not proof of the intended route/upstream, not HTTPS readiness approval, and not cutover authorization.

Canonical state remains: Parent P1-T08 **UNRESOLVED / NOT DONE**; cutover **BLOCKED**; Analytics Webhook `SPIKE_PENDING`; F11 **UNCONSUMED / BLOCKED PRE-PROVIDER**; one-run authorization **AUTHORIZED / UNCONSUMED**; Next Task **NOT_STARTED**. R02 connectivity observations remain historical; no R03 connectivity probe or Provider action was performed.
### P1-T08-F11-F09-R04 - Authoritative MarketlyAI Application Source and Deployment Mapping (2026-10-18)

Status: **EXECUTED / AWAITING TEAM LEADER REVIEW**.

Final classification: **NO_AUTHORITATIVE_MARKETLYAI_DEPLOYMENT_FOUND_WITHIN_ACCESSIBLE_SOURCES**.

Investigation start: `2026-10-18T18:03:46.9732636Z` at repository HEAD `a9a8cae46e6f056c60e913e290a1cac5d546945e`. Pre-write safety recheck at `2026-10-18T18:10:39.7956578Z` still showed the same clean local/live-remote HEAD.

#### Stage A - GitHub application-source discovery

Authorized source operations:
- GitHub repository discovery for `user:GirgesAdam` and installed/accessible AI-related repositories.
- GitHub code searches for `manage.py`, `marketlyai.restartorg.com`, and `next.config`.
- Read-only root/README/commit inspection for serious candidates.
- Local Git inspection of the approved AI Marketing Manager investigation branch at the exact starting HEAD.

Coverage/result:
- Visible repository discovery returned the owner's public repository set; installed-repository discovery with AI terms surfaced `GirgesAdam/AI-Marketing-Manager`, `GirgesAdam/Linka_AI`, `GirgesAdam/flowops-ai-business-agent`, and `GirgesAdam/securelife-local-ai-assistant`. `GirgesAdam/tia` was also manually inspected because its application structure and Tia deployment naming made it a serious related candidate.
- Code-search queries returned no matching `manage.py`, `marketlyai.restartorg.com`, or `next.config` result. Relevant installed repositories reported code-search indexing unavailable, so these no-result searches are supporting evidence only and are not treated as proof of absence.

Candidate findings:

| Repository | Branch / exact revision | Candidate evidence | Determination |
|---|---|---|---|
| `GirgesAdam/AI-Marketing-Manager` | `p1-t08-zernio-analytics-webhook` / `a9a8cae46e6f056c60e913e290a1cac5d546945e` | README states it is the Phase-1 Provider Spike Harness; `package.json` identifies `ai-marketing-manager-provider-spike-harness`. At HEAD there are 56 tracked files and zero paths matching the production Django/DRF/Next.js/deployment artifact filter. Source grep for MarketlyAI hostname/Django/Next/proxy/runtime tokens outside historical evidence docs returned no matches. | **REJECTED AS PRODUCTION APPLICATION SOURCE** - authoritative evidence says this repository is the spike harness, not the production app/monorepo. |
| `GirgesAdam/Linka_AI` | `main` / `1f3667c96b5adfe1c4ad97bc5ef334c6dcb21793` | Full application repo with `backend/`, `frontend/`, `deploy/`; FastAPI + Next.js + PostgreSQL/Supabase. README identifies product as Linka for aesthetic clinics. | **REJECTED** - real application and deployment source, but different product and no `marketlyai.restartorg.com` association. |
| `GirgesAdam/tia` | `main` / `8df5845eabf49f6d030dce797bb8c3d790c9db0c` | `backend/`, `frontend/`, `n8n/`; README identifies Tia AI as an aesthetic-clinic operating system using FastAPI/SQLAlchemy/Alembic/Supabase. | **REJECTED** - clinic product/precursor, non-Django stack, no MarketlyAI hostname association in inspected evidence. |
| `GirgesAdam/flowops-ai-business-agent` | `main` / `b91aa75426c66198db972cbb21e04fda8d9e7cde` | Dockerfile, compose, application code; README identifies a FastAPI/LangGraph B2B operations assistant with its own Vercel deployment. | **REJECTED** - different product and deployment identity; no MarketlyAI hostname association. |
| `GirgesAdam/securelife-local-ai-assistant` | `main` / `6bcd0b9c2cbd2cb1efe8b60b8b41ff7c4d243f7d` | Local/offline fictional insurance assistant using FastAPI/Ollama; no production MarketlyAI deployment evidence. | **REJECTED** - different local demo product; no MarketlyAI mapping. |

Local exact commands on the approved repository:

    git branch --show-current
    Result: p1-t08-zernio-analytics-webhook

    git rev-parse HEAD
    Result: a9a8cae46e6f056c60e913e290a1cac5d546945e

    git status --short --branch
    Result: clean tracking state before evidence collection.

    git ls-remote origin refs/heads/p1-t08-zernio-analytics-webhook
    Result: a9a8cae46e6f056c60e913e290a1cac5d546945e; exit 0.

    git ls-tree -r --name-only HEAD
    Followed by a read-only path filter for manage.py, Django settings/urls/ASGI/WSGI, pyproject/requirements, Next config/apps/web/backend, Docker/Compose/Caddy/Nginx/systemd/Procfile/Vercel/Railway/workflows, and marketlyai.restartorg.com.
    Result: TRACKED_FILE_COUNT=56; ARCH_DEPLOY_PATH_MATCH_COUNT=0.

    git grep -n -I -i -E 'marketlyai\.restartorg\.com|Django|django-rest-framework|djangorestframework|Next\.js|next\.config|proxy_pass|gunicorn|uvicorn' HEAD -- ':!PROGRESS.md' ':!docs/PROVIDER_SPIKE_RESULTS.md' ':!docs/TEST_MATRIX.md'
    Result: no matches; exit 1.

#### Stage B - deployment control-plane discovery

##### Vercel

Connected team: `girgesadam's projects` (`team_LOlsB7U1MFUaTN0cFIHeJc9L`). Project listing returned exactly two projects:

1. `tia-ai-staging` (`prj_eo65bi5wrPCuC1PT5CogQ1Tw7AOO`)
   - Git source: `GirgesAdam/Linka_AI`.
   - Latest listed production deployment: `READY`, commit `1f3667c96b5adfe1c4ad97bc5ef334c6dcb21793`, branch `main`.
   - Domains: `app.linkaai.online`, `app.tiaai.online`, and the project's `vercel.app` domain.
   - `marketlyai.restartorg.com`: **NOT PRESENT**.
2. `flowops-ai-business-agent` (`prj_YEdFkvKYXofoYVDytL1p6lR6Qjuk`)
   - Git source: `GirgesAdam/flowops-ai-business-agent`.
   - Latest listed production deployment: `READY`, deployed commit `1791d93b2f8eedc550c68f6d14d899be52cf01bd`, branch `main`.
   - Domain: `flowops-ai-business-agent.vercel.app`.
   - `marketlyai.restartorg.com`: **NOT PRESENT**.

No Vercel project linked to `GirgesAdam/AI-Marketing-Manager` and no MarketlyAI custom domain was present in the connected team's project/domain inventory.

##### Railway

Connected workspace: `Girges Ezzat's Projects`. Project listing returned exactly two projects:
- `remarkable-kindness` (`f862f881-e39f-47d1-81e1-bc79caf370de`), production environment with five Tia-related services.
- `surprising-intuition` (`b00c5725-8790-41e4-8bdc-7b2a748846ed`), production environment with zero services.

`remarkable-kindness` service/domain inventory:
- `tia-agent-eval`: no domains.
- `tia-automation-waker`: no domains.
- `tia-whatsapp-transport-waker`: no domains.
- `tia-whatsapp-staging`: Railway-generated domain only, target port 8000, no custom domain.
- `tia-api`: Railway-generated domain only, target port 8000, no custom domain.

Read-only `tia-api` service metadata proves a complete **Linka** deployment chain, not a MarketlyAI chain:
- source repo `GirgesAdam/Linka_AI`;
- configured branch `main`;
- root directory `backend`;
- Dockerfile build;
- runtime command uses Uvicorn on port 8000;
- latest successful deployment `dc98ef7a-e6d7-4cfd-a3b1-86c8607d3d8b`;
- deployed commit `1f3667c96b5adfe1c4ad97bc5ef334c6dcb21793`;
- no custom domain; only Railway-generated Tia domain.

No connected Railway project/service/domain references `marketlyai.restartorg.com` or the AI Marketing Manager repository.

No environment-variable values, tokens, credentials, private keys, database URLs, or secrets were inspected or recorded.

#### Stage C - cross-source correlation and VPS decision

Evidence chain sought:

    Authoritative MarketlyAI Application Repository
      -> Exact Source Revision
      -> Deployment Project / Service
      -> Deployed Revision
      -> marketlyai.restartorg.com Binding
      -> Actual Runtime / Upstream

Within the accessible sources, the chain does not establish its first MarketlyAI-specific repository/deployment link. The only complete source-to-deployment chains observed belong to Linka/Tia or FlowOps and have different domains.

**VPS correlation was NOT performed.** Stage A/B produced no concrete new MarketlyAI repository/service/port/directory/deployment candidate that would justify bounded VPS inspection. This avoids repeating R03 broad searches without a new evidence target.

#### Final determination and access boundary

**NO_AUTHORITATIVE_MARKETLYAI_DEPLOYMENT_FOUND_WITHIN_ACCESSIBLE_SOURCES**

This means only that no authoritative MarketlyAI deployment mapping was found in the connected/accessible GitHub, Vercel, and Railway sources inspected. It must not be converted into a claim that no deployment exists globally.

No specific inaccessible MarketlyAI repository, project, or account was identified. If an authoritative deployment exists in another private/unconnected repository, another Vercel/Railway team/workspace, another deployment provider, or an operator-controlled source, that repository/control-plane artifact or access must be supplied before the evidence chain can continue.

Owner-confirmed hostname intent remains planning/ownership intent only; it does not establish an upstream or current deployment.

#### Safety and canonical state

- Source/test/package changes: 0.
- Infrastructure/VPS mutations: 0; VPS access during R04: 0.
- Deployment create/redeploy/restart/configuration mutations: 0.
- Service/DNS/firewall/TLS/certificate mutations: 0.
- Provider/Zernio/auth/Analytics/webhook/publishing calls: 0.
- Receiver/tunnel setup: 0.
- F11 execution: NO; F11 authorization consumed: NO.
- Parent P1-T08: UNRESOLVED / NOT DONE.
- Analytics Webhook: SPIKE_PENDING.
- Cutover: BLOCKED.
- F11: UNCONSUMED / BLOCKED PRE-PROVIDER; one-run authorization AUTHORIZED / UNCONSUMED.
- Next Task: NOT_STARTED.


### P1-T08-F11-LIVE01 — Data-Bearing `analytics.synced` Provider Behavior Experiment (2026-10-22)

Status: **EXECUTED / AWAITING TEAM LEADER REVIEW**.

Final Provider Behavior classification: **`EVENT_OBSERVED_CORRELATION_INCOMPLETE`**.

This was the single authorized F11 live experiment. Authorization was consumed at the first trusted Zernio HTTP transport send and no second live attempt was made.

#### Observed Provider behavior

- Identity verification succeeded on the accepted `/v1/auth/verify` path. Exact expected identity comparison occurred inside the credential-bearing child; no email/credential value was exposed to the parent or docs.
- Exact target attestation succeeded for Profile `6ac5a45a8e4ca44f355033ae`, Facebook account `6ac64f8740364f4695dd3077`, Page `1387424501114639` / `Clothing Brand`, platform `facebook`.
- Baseline Analytics returned HTTP `200`, `hasAnalyticsAccess=true`, usable post rows `0`, target post absent, and `overview.lastSync=2026-10-14T23:41:28.723Z`.
- Exactly one experiment webhook create request was sent for event `analytics.synced`, the exact F11 HTTPS route, and exact Profile scope. Create returned HTTP `200`; subsequent readback attested exact name/URL/event/Profile scope and active state. Successful cleanup later cleared the resource from the accepted result, so the webhook resource ID is not retained after cleanup.
- Exactly one `POST /v1/posts` publish attempt was sent with approved text SHA `66eec48e7935b5356e13f67f817018a1f2fc678863680b67303b2b26ea8f5dac`, text-only Facebook target, no media/link/hashtag/Ads. The publish transport response was ambiguous (`status` and Provider request ID not observed) and no second publish request was sent.
- Bounded publish reconciliation returned exactly one post matching approved text and frozen target. No duplicate was confirmed. Provider-returned platform post ID was `1387424501114639_122110895709502015`; Provider-returned post `createdAt` was `2026-10-22T16:56:11.713Z`.
- Exactly one valid `analytics.synced` webhook delivery was accepted. HMAC verification, header/body ID match, header/event match, exact Profile/account/platform validation all passed. Event was non-duplicate, response status `204`, and no foreign-target, wrong-platform, target-unconfirmed, or unexpected-event condition was observed.
- Observed event timestamp = `2026-10-22T16:56:04.998Z`; `sync.syncedAt=2026-10-22T16:56:04.981Z`; `sync.postsUpdated=0`; receiver `receivedAt=2026-10-22T16:56:11.524Z`. The payload shape exposed `account`, `event`, `id`, `profiles`, `sync`, `timestamp`; no `metrics` or cursor field was observed.
- Follow-up Analytics returned HTTP `200`, `hasAnalyticsAccess=true`, usable post rows `0`, target post absent, and `overview.lastSync=2026-10-22T16:56:04.981Z`. This `lastSync` equals the webhook event's `sync.syncedAt` value.
- No Delta request was performed.
- Exact experiment webhook cleanup succeeded and was readback-confirmed.
- The exact reconciled Provider post resource `6ada4024232859193e49217c` was unpublished once and cleanup readback confirmed it was no longer published.

#### Correlation interpretation

Observed evidence proves that Zernio delivered a correctly signed, exact-target `analytics.synced` event during the controlled F11 run and that Analytics `overview.lastSync` advanced to the event's `sync.syncedAt` value. It does **not** prove that the data-bearing F11 post caused or was included in that sync.

The correlation is insufficient because:

- the event `sync.syncedAt` (`16:56:04.981Z`) and event timestamp (`16:56:04.998Z`) precede the Provider-returned post `createdAt` (`16:56:11.713Z`);
- the event reported `sync.postsUpdated=0`;
- follow-up Analytics contained zero usable post rows and did not contain the experiment post;
- the accepted result therefore cannot tie the observed event to reflection of the data-bearing fixture.

Accordingly, `DATA_BEARING_ANALYTICS_SYNCED_VERIFIED` is **not** established. The defensible registered classification is **`EVENT_OBSERVED_CORRELATION_INCOMPLETE`**.

This interpretation is deliberately narrower than a causal claim. The observed event/lastSync agreement is a signal that an Analytics sync occurred, not proof that the F11 post was incorporated into that sync.

#### Request evidence

First request-attempt evidence timestamp: `2026-10-22T16:56:02.968Z`.

Authorization consumption timestamp: `2026-10-22T16:56:02.968Z` at the first trusted transport send (`GET /v1/auth/verify`). Final authorization state: `CONSUMED`.

| # | Phase | Method / bounded path | Attempt timestamp | HTTP status | Provider request ID |
| ---: | --- | --- | --- | ---: | --- |
| 1 | normal | `GET /v1/auth/verify` | `2026-10-22T16:56:02.968Z` | 200 | `1ed64dc6-1a65-4c39-b5ba-09106d0c51e1` |
| 2 | normal | `GET /v1/accounts` | `2026-10-22T16:56:03.489Z` | 200 | `c4846cc0-9b66-4861-a9a6-13177cd4c532` |
| 3 | normal | `GET /v1/accounts/6ac64f8740364f4695dd3077/facebook-page` | `2026-10-22T16:56:03.668Z` | 200 | `d834376d-13ae-489f-9dc6-f294368c7675` |
| 4 | normal | `GET /v1/analytics` | `2026-10-22T16:56:03.819Z` | 200 | `71499d18-882c-4b9a-a7ce-ae20a3596e44` |
| 5 | normal | `POST /v1/webhooks/settings` | `2026-10-22T16:56:04.205Z` | 200 | `154ab8db-30af-41ed-9f10-791d4335c585` |
| 6 | normal | `GET /v1/webhooks/settings` | `2026-10-22T16:56:04.409Z` | 200 | `3fb609b5-5b4f-496e-8ee9-067336f60fb4` |
| 7 | normal | `POST /v1/posts` | `2026-10-22T16:56:04.614Z` | unknown | not observed |
| 8 | normal | `GET /v1/posts` reconciliation | `2026-10-22T16:56:11.623Z` | 200 | `b64cb951-5544-47ea-b6d4-02fed6220f72` |
| 9 | normal | `GET /v1/analytics` follow-up | `2026-10-22T16:56:11.923Z` | 200 | `7662d6a0-ab4f-40d7-b93c-405f836e0706` |
| 10 | cleanup | `DELETE /v1/webhooks/settings` | `2026-10-22T16:56:12.398Z` | 200 | `c8f9dbc3-ba3f-4103-8dab-3ab4723957cb` |
| 11 | cleanup | `GET /v1/webhooks/settings` | `2026-10-22T16:56:12.601Z` | 200 | `b98a45b0-7793-4855-8cb3-17074a6d1f88` |
| 12 | cleanup | `POST /v1/posts/6ada4024232859193e49217c/unpublish` | `2026-10-22T16:56:12.806Z` | 200 | `7a60d661-2713-4b2f-944a-dcfa55db809c` |
| 13 | cleanup | `GET /v1/posts/6ada4024232859193e49217c` | `2026-10-22T16:56:18.133Z` | 200 | `77ef5841-719b-46a8-baff-2fc7c61b383a` |

Normal requests = `9`; cleanup requests = `4`; total requests = `13`. Preferred normal target `<=9`, hard experiment ceiling `10`, cleanup allowance `<=4`, and absolute total ceiling `14` were all respected.

#### Local delivery / infrastructure evidence

The public receiver readiness gate passed before credential delivery and before Provider transport: TLS success, exact route marker match, confirmation PASS, no redirect, and zero analytics deliveries before Provider sequence. The Node receiver accepted one valid event and counted readiness separately (`1/1`).

Infrastructure restoration after Provider cleanup succeeded: owned Node closed by deterministic Windows `CTRL_C_EVENT`; local port free; exact reverse tunnel terminated; VPS `8765` proven free; static receiver started once; final service active/running with boot disabled and loopback listener; verifier PASS with accepted receiver/unit hashes; evidence directory `VALID_EMPTY / 0`; final local/public/near-miss/Elite routes restored. These are infrastructure observations, not Provider Behavior claims.

#### Observation timing limitation

The run configured a maximum observation window of `7200000ms`. The valid event was already present in the receiver snapshot when the post-publish observation wait became active, so the wait returned immediately rather than consuming the two-hour maximum. The accepted F10 result does not persist separate observation-start/end fields. Exact start/end timestamps are therefore not invented. The evidence bounds are: event receivedAt `2026-10-22T16:56:11.524Z`, publish reconciliation request at `2026-10-22T16:56:11.623Z`, and follow-up Analytics request at `2026-10-22T16:56:11.923Z`.

#### Documentation-based expectation versus observed result

The F11 task registered several possible result classes, including verified data-bearing sync, event-not-observed, fixture-not-reflected, incomplete correlation, and technical blocker. The experiment produced the incomplete-correlation case. No new Provider capability is inferred beyond the observations above.

No assumption is recorded as a Provider Fact. No diagnostic/cross-check successor was started.

### P1-T08-F11-LIVE01-CLOSEOUT-01 — Team Leader acceptance (2026-10-22)

Disposition: **`ACCEPTED WITH NON-BLOCKING NOTES`**. Accepted evidence HEAD = `6825311ee3346fedd6a86a302be77994bf7ba634`; activation = `bc8fb398eb37b11893c26080a51a79bfdc8cc694`. Accepted Provider Behavior classification = **`EVENT_OBSERVED_CORRELATION_INCOMPLETE`**.

#### Proven

A valid signed exact-target `analytics.synced` event was delivered. Exactly one valid logical event was observed: HMAC PASS; header/body ID PASS; header/event PASS; exact target PASS; platform `facebook`; duplicate `false`; foreign target `false`; wrong platform `false`; target unconfirmed `false`; unexpected event `false`; receiver response `204`. Event timestamp = `2026-10-22T16:56:04.998Z`; `sync.syncedAt=2026-10-22T16:56:04.981Z`; `sync.postsUpdated=0`; receiver `receivedAt=2026-10-22T16:56:11.524Z`.

Analytics `overview.lastSync` advanced from baseline `2026-10-14T23:41:28.723Z` to `2026-10-22T16:56:04.981Z`, exactly matching the event's `sync.syncedAt`. This proves an Analytics sync signal occurred.

Identity verification succeeded. Exact frozen Profile/account/Page/platform attestation succeeded. Baseline Analytics returned HTTP `200`. Exactly one `analytics.synced` webhook was created and exact readback attested. Exactly one publish request was sent. Its transport response was ambiguous, so no publish retry occurred. Bounded reconciliation found exactly one matching authorized post: Provider resource `6ada4024232859193e49217c`; platform post ID `1387424501114639_122110895709502015`; Provider-returned `createdAt=2026-10-22T16:56:11.713Z`; duplicate confirmed `false`.

Follow-up Analytics returned HTTP `200`, `hasAnalyticsAccess=true`, `overview.lastSync=2026-10-22T16:56:04.981Z`, usable rows `0`, `postIds=[]`, and did not expose the F11 experiment post.

Accepted request accounting: normal `9`; cleanup `4`; total `13`. Preferred normal `<=9`, hard normal `<=10`, cleanup `<=4`, and absolute `<=14` were all met.

Cleanup was verified: exact experiment webhook removal was readback-confirmed. Exact reconciled post `6ada4024232859193e49217c` was unpublished exactly once and cleanup readback confirmed it was no longer published. No unrelated resource was deleted.

#### Not proven

The F11 data-bearing post caused or was included in the observed sync. `DATA_BEARING_ANALYTICS_SYNCED_VERIFIED` is not established because `sync.syncedAt` precedes Provider-returned post `createdAt`; event timestamp precedes Provider-returned post `createdAt`; `sync.postsUpdated=0`; follow-up Analytics contains no experiment post; and no direct evidence ties the observed sync to incorporation of the F11 fixture.

`analytics.synced` is not proven reliable as the sole correctness mechanism. No business outcome is proven.

#### Methodological limitation

The configured observation maximum was two hours, but accepted `waitForAnalytics()` returned immediately because a valid event was already present in receiver state when post-observation waiting began. The observed event therefore did not establish a new post-fixture sync event, and LIVE01 does not provide a full two-hour post-fixture observation. This is a non-blocking methodological limitation: it does not invalidate the observed event or alter the accepted classification, does not authorize another live experiment, and must be considered when interpreting Provider suitability. No unpersisted observation start/end timestamps are invented.

#### Acceptance state

F11 authorization is permanently **`CONSUMED`** at `2026-10-22T16:56:02.968Z`, the first trusted Provider send `GET /v1/auth/verify`. Second LIVE01, second F11 publish, and recreation of the live experiment are **NOT AUTHORIZED**; no retry authorization remains.

Infrastructure restoration is accepted: receiver stop `1`; receiver start `1`; restart `0`; tunnel created `1`; tunnel terminated `1`; residue `0`; final static receiver active/running; boot disabled; listener `127.0.0.1:8765`; verifier PASS; accepted hashes unchanged; evidence `VALID_EMPTY / 0`; accepted routes restored; Elite `200`; Node/tunnel/local-port/LIVE01 residue `0`.

Operational non-blocking note: read-only Windows SSH observation wrappers demonstrated avoidable hanging behavior. Future orchestration should use stdin-detached SSH invocation from first dispatch, explicit process timeout, and deterministic owned-child cleanup. LIVE01 exact lifecycle/provider counts were unaffected. This is operational tooling evidence, not Provider Behavior.

Resulting state: `P1-T08-F11 = DONE / ACCEPTED — EVENT OBSERVED, DATA-BEARING CORRELATION INCOMPLETE`; parent `P1-T08 = UNRESOLVED / NOT DONE`; Analytics Webhook = `EVENT OBSERVED / DATA-BEARING CORRELATION INCOMPLETE — DIAGNOSTIC PENDING`; current blocker/question = `DATA_BEARING_ANALYTICS_SYNC_CORRELATION_NOT_ESTABLISHED`.

Bounded plan: safe receiver infrastructure `COMPLETED`; Provider-free rehearsal `COMPLETED`; one authorized F11 live experiment `COMPLETED`; one final diagnostic/cross-check round `AVAILABLE / NOT STARTED`; no additional live experiment permitted. A separately authorized `P1-T08-F11-DIAG01 — Existing-Evidence Provider Diagnostic / Cross-Check` may use existing IDs/timestamps/request IDs/event evidence plus bounded Provider-side diagnostics if necessary, but this closeout does **not** authorize DIAG01 execution.

Closeout itself was documentation-only: Provider/Zernio `0`; credentials `0`; Analytics/Delta `0`; publish `0`; webhook mutations `0`; VPS/lifecycle `0`; tunnel `0`.

### P1-T08-F11-DIAG01 — Final Existing-Evidence Provider Diagnostic (2026-10-22)

Status: **`EXECUTED / AWAITING TEAM LEADER REVIEW`**.

Final classification: **`DIAGNOSTIC_TECHNICAL_BLOCKER`**.

This was the final bounded P1-T08 Provider probing round. It was not another F11 experiment. It created no content, no webhook, no Analytics sync, and no Provider mutation.

#### Direct observed diagnostic evidence

The diagnostic used the fixed window `2026-10-22T16:55:30Z` through `2026-10-22T16:57:30Z` and issued exactly three GET requests.

**Query A — API request logs.** `GET /v1/logs` with `type=api_request`, exact from/to, and `limit=100` was attempted at `2026-10-22T17:26:21.233Z`. Provider returned HTTP `200`, request ID `ec03c626-afb7-42a0-ac85-8517df3daf12`, `13` log records, and pagination metadata. The safe allowlisted projection did not identify an exact `POST /v1/posts` record (`matchedRecordCount=0`). Raw log/request/response bodies were not retained, so no stronger publish-completion claim is made from Query A.

**Query B — webhook logs.** `GET /v1/logs` with `type=webhooks`, `event=analytics.synced`, exact account `6ac64f8740364f4695dd3077`, exact from/to, and `limit=100` was attempted at `2026-10-22T17:26:21.860Z`. Provider returned HTTP `400`, request ID `d78725e8-c073-4b6d-a6a8-a2245e1ae867`, zero retained log records, and no pagination evidence. The required bounded webhook-log cross-check could therefore not be completed. No altered-filter retry was sent.

**Query C — publishing logs.** `GET /v1/logs` with `type=publishing`, `platform=facebook`, exact account, exact from/to, and `limit=100` was attempted at `2026-10-22T17:26:22.095Z`. Provider returned HTTP `200`, request ID `09470997-88c9-430b-9c82-322862212458`, one log record, and pagination metadata. The single safe matched record contained the exact approved F11 fixture identifier and reported `action=post.published`, `status=success`, `platform=facebook`, with Provider log request/correlation ID `16c4ec20-651f-453c-914c-ec4d08eb6580`. The bounded safe projection did not expose a Provider timestamp or explicit post-ID field for that record; none is invented.

Optional Query D was **not sent**. A/B/C did not identify one exact missing correlation key whose one additional read could resolve Analytics-fixture correlation. The Query C publishing correlation ID is direct publishing evidence but is not a direct key tying the `analytics.synced` event to fixture incorporation; using request 4 would therefore have been exploratory.

#### Correlation interpretation

**Proven by DIAG01:** Provider publishing logs contain a successful `post.published` record associated with the exact F11 fixture. This corroborates the existing LIVE01 evidence that the reconciled F11 post reached a successful publishing lifecycle state.

**Not proven by DIAG01:** the publishing log caused, was included in, or directly correlates to the observed `analytics.synced` sync. Query B failed with HTTP `400`, and Query A did not yield a safely matched exact publish-request record. No direct changed-post set or exact F11 post identifier was observed in Analytics webhook-log evidence.

The existing LIVE01 timing evidence remains direct historical evidence only: publish attempt `2026-10-22T16:56:04.614Z`; `sync.syncedAt=2026-10-22T16:56:04.981Z`; event timestamp `2026-10-22T16:56:04.998Z`; receiver `receivedAt=2026-10-22T16:56:11.524Z`; Provider-returned post `createdAt=2026-10-22T16:56:11.713Z`; follow-up Analytics request `2026-10-22T16:56:11.923Z`; webhook cleanup began `2026-10-22T16:56:12.398Z`. Timing adjacency/order is not treated as causality and does not by itself prove inclusion or exclusion of the fixture.

Because the bounded required webhook-log diagnostic could not be completed, the result is **`DIAGNOSTIC_TECHNICAL_BLOCKER`**, not A, B, or C. Per the stop rule, this does not authorize further probing.

#### Documented-contract fallback / defensive design direction

Because final classification is D, the already-registered fallback is active for Team Leader disposition. This section distinguishes design direction from observed Provider Behavior.

`analytics.synced` is treated as a **wake-up/change signal**, not as the sole durable analytics truth. The defensive production direction remains:

```text
verified webhook signal
→ internal ownership validation
→ dedupe
→ enqueue reconciliation
→ Analytics/Delta read from durable stored cursor
→ validate target scope
→ persist durable analytics state/cursor
→ audit
```

A bounded periodic reconciliation path remains required independently of webhook delivery. The webhook can improve latency; it must not be the only correctness mechanism.

Future production Delta constraint: a durable Delta consumer captures and stores its bootstrap cursor **before** loading its baseline, then resumes from that cursor. DIAG01 performed no Delta call and implemented no production subsystem.

#### Safety / stop state

Provider requests: `3`; GET: `3`; Provider mutations: `0`; publish: `0`; webhook mutation/test/redelivery: `0`; posts created: `0`; Analytics/Delta: `0`; sync triggers: `0`; receiver/VPS/tunnel actions: `0`; credentials exposed: `0`. Original F11 authorization remains permanently `CONSUMED`.

**NO MORE P1-T08 PROVIDER PROBING.** No repeat diagnostic round, no expanded log exploration, no second live post, no experimental webhook, no Delta probe, and no sync trigger are authorized by this result.

`P1-T08-F11-DIAG01 = EXECUTED / AWAITING TEAM LEADER REVIEW`. Parent `P1-T08 = UNRESOLVED / NOT DONE`; DIAG01 does not self-accept or self-close P1-T08.


## P1-T08 Final Team Leader Conclusion — Analytics Webhook Provider Behavior

Final P1-T08 disposition: `DONE / ACCEPTED WITH PROVIDER LIMITATION`.

Accepted DIAG01 classification: `DIAGNOSTIC_TECHNICAL_BLOCKER` at evidence HEAD `41a182af81bcb3d51af0be7675e007dd02d3eb70`.

### Observed Provider Facts

- Zernio accepted configuration of an `analytics.synced` webhook scoped to the exact test Profile.
- One valid signed exact-target `analytics.synced` event was delivered and accepted by the controlled receiver.
- HMAC verification passed; header/body event identity passed; exact Profile/account/platform validation passed; duplicate=false; receiver response HTTP `204`.
- Analytics `overview.lastSync` advanced to exactly the event's `sync.syncedAt`.
- The F11 publish path reconciled exactly one authorized post after an ambiguous publish transport outcome, with no publish retry.
- DIAG01 Query A (`type=api_request`, fixed window) returned HTTP `200`, `13` logs, pagination present, and zero safely exact-matched `POST /v1/posts` records. Raw request/response bodies were not interpreted.
- DIAG01 Query B (`type=webhooks`, `event=analytics.synced`, exact account, fixed window) returned HTTP `400`; no usable webhook-log evidence was obtained and no altered-filter retry occurred.
- DIAG01 Query C (`type=publishing`, `platform=facebook`, exact account, fixed window) returned one exact fixture-associated publishing record with `action=post.published`, `status=success`, platform `facebook`, correlation/request ID `16c4ec20-651f-453c-914c-ec4d08eb6580`, and an exact F11 fixture identifier present.
- The bounded safe Query C projection did not expose a trustworthy Provider timestamp or explicit post-ID field; neither is inferred.
- F11 cleanup and infrastructure restoration were completed and accepted.

### Unresolved / Not Proven

- The F11 post is not proven to have caused the observed `analytics.synced` event.
- The F11 post is not proven to have been included in that Analytics sync.
- The observed event is not proven to represent a new post-fixture sync event.
- Query C's publishing lifecycle evidence does not directly tie the exact fixture to the Analytics sync; log adjacency/timing is not treated as causality.
- The final bounded webhook-log cross-check could not be completed because the approved Query B returned HTTP `400`. This is a diagnostic limitation, not proof that the webhook log is absent or that `analytics.synced` is broken/unrelated.
- `analytics.synced` alone is not proven sufficient as durable analytics truth or as the sole correctness mechanism.
- Webhook delivery is not proven guaranteed/lossless.
- No business outcome is proven.

Therefore Analytics Webhook Provider Behavior is **`PARTIALLY VERIFIED`**: event existence/delivery/validation is verified; direct data-bearing fixture correlation is not verified; the final bounded diagnostic ended `DIAGNOSTIC_TECHNICAL_BLOCKER`; P1-T08 Provider probing is closed.

### Product Integration Consequence

Commercial V1 must treat `analytics.synced` as an authenticated/deduplicated **wake-up/change signal**, not durable analytics authority.

Accepted defensive flow:

```text
analytics.synced webhook
→ verify signature/event
→ resolve trusted internal ownership
→ reject wrong tenant/brand/account/profile
→ dedupe
→ enqueue analytics reconciliation
→ read Analytics/Delta from durable stored cursor
→ validate returned target scope
→ atomically persist analytics state + next cursor
→ audit
```

Durable analytics state and cursor belong in PostgreSQL. The production consumer preserves D-016 bootstrap order: `capture cursor → import baseline → consume Delta from captured cursor`.

A bounded reconciliation safety net independent of webhook arrival is required so correctness can recover from missed, delayed, duplicate, retried webhook delivery or temporary consumer failure. Exact reconciliation cadence, cost controls, and production failure handling are not Provider facts and are not implemented by P1-T08.

This integration consequence is a defensive product/system design choice grounded in the evidence above. It must not be re-labeled as observed Zernio behavior.

Provider probing cutoff is final for P1-T08: no second F11, no second diagnostic, no expanded historical log exploration, no new test webhook/post, no historical Delta probe, and no manufactured engagement without genuinely new evidence plus separate explicit scope/authorization.


## P1-T09 — Existing Data-Bearing Historical Analytics Fixture

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

This was a minimal read-only Provider Behavior spike against the already-authorized frozen target only. It did not create or modify Provider resources and did not manufacture Analytics data.

### Observed Provider Facts

- Trusted identity verification succeeded: `GET /v1/auth/verify`, HTTP `200`, request `c58ba1d8-5949-4ee1-9a18-6adc7f3abd06`, expected identity match=true.
- Exact account ownership read succeeded: request `64c4dd51-02cd-442d-9060-54c2d34e0a25`; account `6ac64f8740364f4695dd3077` belongs to Profile `6ac5a45a8e4ca44f355033ae`, platform `facebook`.
- Account health read succeeded: HTTP `200`, request `6608efbc-d34b-4d55-8024-03301ef2e98f`; status `healthy`; token valid=true; `canFetchAnalytics=true`; Analytics permissions observed granted for `pages_read_engagement` and `read_insights`.
- Historical Analytics page 1 succeeded: HTTP `200`, request `7c8ac019-4611-4bdb-b0e3-4a3e7dde0443`.
- Exact Analytics filters: Profile `6ac5a45a8e4ca44f355033ae`; account `6ac64f8740364f4695dd3077`; platform `facebook`; source `all`; range `2026-07-25` through `2026-10-22`; limit `100`; page `1`.
- The Analytics response exposed top-level fields `accounts`, `hasAnalyticsAccess`, `overview`, `pagination`, and `posts`.
- `hasAnalyticsAccess=true`.
- Returned `posts` rows = `0`; usable rows = `0`; qualifying non-F11 rows = `0`.
- Pagination reported total=`0`, pages=`1`; safe `hasMore` was not exposed. No additional page was justified, so Page 2 was not requested.
- No F11 row was observed in the empty result and no F11 identifier was selected or reinterpreted.
- Provider traffic was exactly `4` GET requests; no automatic retry occurred.

### Unresolved / Not Proven

- No non-empty Historical Analytics row was observed.
- No reusable data-bearing analytics fixture was established.
- No stable analytics-row post identifier, row-level target-attribution shape, metric field name/type/nullability, or numeric metric sample could be observed because the Provider returned zero rows.
- This result does not prove Historical Analytics is unsupported or broken. Access and the exact read succeeded; the authorized dataset was simply still empty for the bounded query.
- P1-T09 does not establish any Delta changed-snapshot behavior or derived Analytics signal shape; those endpoints were not called.

### Classification / Recommendation

Final classification = **`AUTHORIZED_ANALYTICS_DATASET_STILL_EMPTY`**.

Historical Analytics capability remains **`SPIKE_PENDING`**. No `SPIKE_PASS` promotion is recommended from this evidence because no qualifying non-empty analytics row exists.

A future non-empty fixture-acquisition strategy, if desired, requires separate Team Leader review. P1-T09 itself does not authorize publishing, engagement manufacturing, `sync-external`, intentional sync triggering, another Brand/account, Delta, derived signals, or any successor Provider task.

Safety totals: Provider GETs `4`; Provider mutations `0`; publish `0`; webhook operations `0`; Delta `0`; sync-external `0`; derived-signal calls `0`; Analytics writes/triggers `0`; Ads/media/community `0`; cross-Profile leakage `0`; secrets exposed `0`.


## P1-T09-CLOSEOUT-01 — Team Leader Acceptance

Status: `DONE / ACCEPTED`.

Accepted classification: `AUTHORIZED_ANALYTICS_DATASET_STILL_EMPTY`.

Accepted evidence HEAD: `ebcaf5cc7510881f477d0da610eab900bb45b6fd`.

Observed and accepted: the authorized frozen target passed trusted identity verification, exact Profile/account ownership, and account health; Historical Analytics page 1 returned HTTP `200` for the exact bounded filters. The dataset was empty: `hasAnalyticsAccess=true`, `posts=[]`, rows `0`, usable rows `0`, qualifying non-F11 rows `0`, pagination total `0`, total pages `1`, and no additional page was required. No retry was performed.

Not observed / not proven: any non-empty Historical Analytics row; reusable data-bearing fixture; stable analytics-row post identifier; row-level target attribution; metric field names/types/nullability; numeric metric sample; non-empty pagination; data-bearing Delta behavior; or derived Analytics signal behavior with sufficient data.

Accepted interpretation: this is an empty authorized dataset, not Provider failure and not evidence that Historical Analytics is unsupported or that permissions are broken.

Historical Analytics remains `SPIKE_PENDING`; no `SPIKE_PASS` promotion is made and `PROVIDER_CAPABILITIES.md` is unchanged.

P1-T08 remains closed; F11 correlation is not reopened; historical F11 identifiers were not selected as the fixture; D-042 and the accepted Analytics webhook conclusion remain unchanged.

Closeout itself performed Provider requests `0`, credential access `0`, Analytics calls `0`, Delta `0`, publish `0`, webhook mutation `0`, sync trigger `0`, source/test changes `0`, and infrastructure actions `0`.

## P1-T10 — Controlled Organic Facebook Comments Create → Read → Reply

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `ORGANIC_COMMENTS_CREATE_READ_REPLY_VERIFIED`.

Recommendation: `Organic Comments → SPIKE_PASS — AWAITING TEAM LEADER REVIEW`; canonical `PROVIDER_CAPABILITIES.md` remains `SPIKE_PENDING` pending Team Leader acceptance.

### Current documented contract used

Before live mutation, current Zernio documentation supported the exact organic Facebook flow used by the spike: `POST /v1/inbox/comments/{postId}` with required `accountId` + `message` and optional `commentId` (omitted for the top-level controlled comment; exact owned comment ID supplied for the reply); bounded `GET /v1/inbox/comments`; thread read `GET /v1/inbox/comments/{postId}` including exact `commentId` for replies; and owned comment/reply deletion by exact `accountId` + `commentId`. No `metaads` or Ads comments endpoint was used.

### Observed Provider Behavior

- Trusted identity PASS — HTTP `200`, request `00979d56-3671-45c0-9be0-067d2d58e83b`.
- Exact Profile/account ownership PASS — HTTP `200`, request `a2df8ea8-2ad1-44f0-896b-f20a5bd6c792`.
- Exact Facebook Page ownership PASS — HTTP `200`, request `f4f586ee-a1e8-43df-b19b-7cbb0cf09d5b`.
- Account health/canPost PASS — HTTP `200`, request `d0a7e3e8-5ebe-480f-a4c8-254880711efe`; health healthy; token valid; canPost=true. No recognized comment-specific permission boolean was exposed in the safe projection.
- One exact temporary post was created — HTTP `201`, request `576ab75f-834d-4870-b591-bf4f95b7b9ff`; Provider ID `6ada5bc404775bbecc763501`; platform ID `1387424501114639_122110940457502015`. Exact target/Page/platform/content read-back then returned HTTP `200`, request `5da5af2b-c948-47bb-8f18-c353146ecb36`.
- One exact top-level controlled comment was created — HTTP `200`, request `4f608e89-e400-4a18-bd83-ad84b86e2a36`; stable comment ID `122110940457502015_1097949062827339`.
- Thread read returned HTTP `200`, request `05b496ef-5d6b-431a-afc7-9a0367b915f6`; exactly one matching controlled comment, Facebook scope, owner/from-self=true, duplicate=false.
- Organic Inbox list returned HTTP `200`, request `f6158d4b-9f53-4006-8d39-51521e21e9c6`; the exact controlled fixture was visible once (`cacheObservation=VISIBLE`). The safe row did not expose an ad flag, so no `isAd=false` claim is made.
- One exact controlled reply was created — HTTP `200`, request `384e12e8-aa1a-4316-9c15-9924111eaed2`; stable reply ID `122110940457502015_944970255025536`.
- Reply/thread read returned HTTP `200`, request `50394aee-c840-4fd9-8e0b-a9e73a2cefb4`; exactly one matching controlled reply under the exact controlled parent, Facebook scope, duplicate=false.
- No second post/comment/reply write occurred and no automatic retry occurred.

### Cleanup / Residual Resource

- Reply delete: HTTP `200`, request `b5302bc3-e116-430e-8644-5d7fe4d72502`.
- Parent comment delete: HTTP `200`, request `514b630a-afa6-46ec-ad7f-a3e0ce299f6d`.
- Bounded thread verification: HTTP `200`, request `1202cc83-fc60-4986-bf6a-d297f9d30647`; controlled parent/reply absent from the thread result.
- Post unpublish attempt: HTTP `500`; Provider did not expose a request ID.
- Exact post read-back after failed unpublish: HTTP `200`, request `368f3e3f-efcd-4b27-ae99-809812cd3a8b`; post remained published.

Cleanup is incomplete but precisely bounded. Remaining owned synthetic resource: Provider post `6ada5bc404775bbecc763501`, platform post `1387424501114639_122110940457502015`. Its ownership/target/content were proven. Cleanup allowance was exhausted at `5 / 5`; no blind repeated unpublish/delete was attempted.

### Safety / Limits

Normal requests `11 / 12`; cleanup requests `5 / 5`; absolute requests `16 / 17`. The preferred normal target `<=10` was exceeded by one but the hard ceiling was not. Provider mutation attempts `6` including cleanup. Publish attempts `1`; controlled comments created/proven `1`; controlled replies created/proven `1`; Likes `0`; DMs `0`; Ads `0`; private replies `0`; webhook mutations `0`; unrelated-resource mutations `0`; PII leakage `0`; secret exposure `0`.

Only the frozen synthetic fixture content and its stable owned IDs are retained. No unrelated comment/author content is retained.

### Remaining limitation

P1-T10 proves controlled Organic Facebook comment create/read/reply behavior on the frozen internal test target. It does not prove Likes, private replies, DMs, Ads comments, automation behavior, or general production Community architecture. Cleanup of the temporary post was not completed because the one authorized unpublish attempt returned HTTP `500` and the bounded post read-back showed it still published. That cleanup limitation is visible to Team Leader review and is not hidden by the capability recommendation.


## P1-T10-CLEANUP-01 — Exact Residual P1-T10 Post Cleanup

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `RESIDUAL_POST_CLEANUP_PROVIDER_BLOCKED`.

The cleanup-only run did not reopen or repeat Organic Comments behavior. Accepted parent classification remains `ORGANIC_COMMENTS_CREATE_READ_REPLY_VERIFIED`; Team Leader recommendation remains `Organic Comments → SPIKE_PASS`; canonical `PROVIDER_CAPABILITIES.md` remains unchanged at `SPIKE_PENDING` pending later closeout.

Observed Provider behavior:
- trusted identity: HTTP `200`, request `10281b72-8a3e-4fe1-be24-f0d4b3af5f54`, exact expected identity matched;
- exact pre-cleanup post read: HTTP `200`, request `5b607a12-92bd-4d12-a74f-3e0de2f76553`; Provider ID `6ada5bc404775bbecc763501`; Facebook platform ID `1387424501114639_122110940457502015`; account `6ac64f8740364f4695dd3077`; Page `1387424501114639`; platform `facebook`; frozen content SHA matched; state `published`;
- exactly one documented unpublish request was sent with `platform=facebook`: HTTP `400`, request `63eb1b5d-bfe9-40b1-9a9b-98252f132584`; no retry;
- mandatory final exact read: HTTP `200`, request `329cd53e-3ef0-4d00-a2bf-14c8f946cb2b`; exact fixture still had Facebook platform state `published`.

The HTTP `400` response alone was not treated as the cleanup outcome; the final read-back established the authoritative observed state for this experiment. The residual exact owned synthetic post therefore remains published.

Residual resource: Provider post `6ada5bc404775bbecc763501` / Facebook platform post `1387424501114639_122110940457502015`, state `published`.

No second unpublish, alternate delete, broad list/reconciliation loop, post creation, comment/reply creation, Likes, DMs, Ads, or webhook operation was performed. No more automatic or unreviewed cleanup attempts are authorized by this task.

Safety totals: Provider GETs `3`; Provider mutations `1`; unpublish attempts `1`; post creates `0`; comment creates `0`; reply creates `0`; Likes `0`; DMs `0`; Ads `0`; webhook mutations `0`; unrelated-resource mutations `0`; secrets exposed `0`.
