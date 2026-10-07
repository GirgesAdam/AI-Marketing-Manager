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
