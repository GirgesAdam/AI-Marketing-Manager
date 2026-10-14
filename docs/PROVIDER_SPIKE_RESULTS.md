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
