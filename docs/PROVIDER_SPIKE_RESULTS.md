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

## P1-T10-FINAL-CLOSEOUT-01 — Organic Comments Final Acceptance

P1-T10 status: `DONE / ACCEPTED WITH NON-BLOCKING PROVIDER CLEANUP LIMITATION`.

Accepted Provider Behavior classification: `ORGANIC_COMMENTS_CREATE_READ_REPLY_VERIFIED`.

Accepted P1-T10 evidence HEAD: `d908a4a7440b2e9253d82d52c56325dcf38e5778`.

### PROVEN Provider Behavior

- Trusted identity and exact frozen Profile/account/Facebook Page target validation passed.
- One exact owned synthetic Facebook post was used as the controlled fixture.
- Exact owned top-level organic Facebook comment creation worked and returned stable comment ID `122110940457502015_1097949062827339`.
- Exact comment/thread read-back worked and returned one controlled match with no duplicate.
- The controlled fixture appeared exactly once in the bounded normal Organic Inbox list.
- Exact owned reply creation worked and returned stable reply ID `122110940457502015_944970255025536`.
- Exact reply read-back worked under the controlled parent with no duplicate.
- Controlled reply deletion and controlled parent-comment deletion both returned HTTP `200`; bounded thread verification proved both absent.
- No duplicate post/comment/reply write occurred and no automatic write retry occurred.

P1-T10-CLEANUP-01 status: `DONE / ACCEPTED`.

Accepted cleanup classification: `RESIDUAL_POST_CLEANUP_PROVIDER_BLOCKED`.

Accepted cleanup evidence HEAD: `9865d9bfeac081b8d0b3309d1b5911e26fa50a88`.

Accepted exact sequence: exact owned residual post read → `published` → one new documented unpublish attempt → HTTP `400` → mandatory exact final read → still `published`. No retry occurred.

Provider limitation: `EXACT_TEST_POST_UNPUBLISH_BLOCKED`. The original P1-T10 unpublish attempt returned HTTP `500`, followed by an exact read-back showing the fixture still published. The separately authorized cleanup attempt returned HTTP `400`, followed by another exact read-back showing the same fixture still published. These bounded observations apply only to this exact fixture and do not establish universal Zernio unpublish failure, Facebook removal impossibility, or Provider deletion impossibility.

Residual synthetic owned internal-test resource remains: Provider post `6ada5bc404775bbecc763501`; Facebook post `1387424501114639_122110940457502015`; state `published`; content `MarketlyAI internal organic comments fixture. No action required.` The controlled comment and reply are already deleted. No further automatic or unreviewed P1-T10 Provider cleanup attempt is authorized.

### NOT PROVEN / OUT OF SCOPE

- real-user production reply workflow;
- Comments Agent policy behavior;
- tenant/Brand routing and authorization;
- durable comment ingestion/state;
- worker/idempotency/reconciliation behavior;
- `comment.received` webhook behavior;
- private replies;
- Likes/hide;
- Ad Comments;
- DMs.

Organic Comments canonical capability is promoted to `SPIKE_PASS` for the controlled Facebook organic create/read/list/reply Provider Behavior scope only. Our system still owns tenant/Brand authorization, policy, AI/Human workflow, ownership, durable state, idempotency/reconciliation, and human handoff; Zernio supplies Provider comment fetch/reply execution.

Publishing cleanup observation: exact owned test post remained published after bounded unpublish failures (HTTP 500 then HTTP 400). This observation remains visible Provider Behavior evidence and does not downgrade Organic Comments. This closeout does not automatically modify canonical Publishing capability status.

Final-closeout safety boundary: Provider/Zernio calls `0`; credentials `0`; post/comment/reply mutations `0`; cleanup attempts `0`; Ads/DM/webhook operations `0`; source/test/runtime changes `0`; infrastructure `0`.

## P1-T11 — Zernio Facebook DM Read Contract and Controlled Fixture Availability

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `AUTHORIZED_FACEBOOK_DM_DATASET_EMPTY`.

Capability recommendation: `DMs remains SPIKE_PENDING`.

### Current documented contract — DOC_CONFIRMED

Current Zernio documentation checked before live execution documents `GET /v1/inbox/conversations`, `GET /v1/inbox/conversations/{conversationId}`, and `GET /v1/inbox/conversations/{conversationId}/messages`. The current documentation supports Facebook conversation list/read, bounded Facebook/Instagram pre-connect history replay, no historical webhooks for replayed history, opaque message cursors, side-effect-free message GETs that do not mark a conversation read, and failed/skipped-account reporting on conversation aggregation. This documentation evidence is `DOC_CONFIRMED` only and is not substituted for live Provider Behavior.

The documented create-conversation surface was not generalized to Facebook Messenger. P1-T11 performed no `POST /v1/inbox/conversations` and no outbound message operation.

### Deterministic safety evidence

- focused P1-T11 suite: `22 / 22 PASS`;
- full suite: `529 / 529 PASS` across `22` files;
- `npm run typecheck`: PASS;
- `npm run build`: PASS;
- `git diff --check`: PASS;
- live mode defaults OFF;
- Provider surface is GET-only with hard maximum `6` GETs;
- frozen Profile/account/facebook scope is hard-coded and no caller-selected conversation ID is accepted;
- no message/conversation POST, mark-read, reaction, private reply, comments/posts/Ads, or webhook mutation surface exists in the runner;
- raw DM bodies, participant name/username/avatar/IDs, sender PII, and raw conversation IDs are excluded from returned evidence;
- message cursor values are used opaquely and masked from safe evidence;
- foreign account/Profile/conversation/message scope fails closed;
- frozen-account failed/skipped states cannot be mislabeled as trustworthy empty data.

### Single bounded live Provider run

1. Trusted identity — `GET /v1/auth/verify`: HTTP `200`; request `dd7327cb-808c-4bb2-a515-c91ee7ec75ca`; independently expected identity matched.
2. Exact ownership — `GET /v1/accounts?profileId=6ac5a45a8e4ca44f355033ae`: HTTP `200`; request `b333e9d7-bf97-46ac-a899-9a46d1a0298d`; exact frozen Facebook account `6ac64f8740364f4695dd3077` under Profile `6ac5a45a8e4ca44f355033ae` validated; cross-account/Profile leakage observed `NO`.
3. Conversation list — `GET /v1/inbox/conversations` with exact Profile/account/`platform=facebook`/`limit=20`: HTTP `200`; request `b3966925-4207-40d1-990c-56faf6325952`.

Observed conversation-list safe evidence:
- Facebook conversation count: `0`;
- pagination `hasMore=false`;
- `nextCursor` present: `NO`;
- safe pagination total/limit/skip values: not exposed in this response projection;
- meta `accountsQueried=1`;
- meta `accountsFailed=0`;
- failed-account entry count `0`;
- skipped-account entry count `0` in the safe projection;
- frozen account present in failed entries: `NO`;
- frozen account present in skipped entries: `NO`.

Because the exact authorized Facebook conversation dataset was empty, P1-T11 stopped immediately after the list response. Exact conversation read requests: `0`. Message-page requests: `0`. Message count: `0`. No other account/Brand was queried merely to obtain a fixture.

Controlled send fixture available: `NO`. The bounded authorized dataset contained no Facebook conversation, so there is no existing conversation to qualify. No participant identity was inspected/persisted or inferred from content/name/recency.

### Interpretation / capability discipline

`AUTHORIZED_FACEBOOK_DM_DATASET_EMPTY` is a successful exact scoped read with an empty dataset; it is not Provider failure and does not establish that Facebook DM read is unsupported. It also does not live-verify exact conversation/message payload behavior because there was no existing conversation to read.

DMs therefore remain canonical `SPIKE_PENDING`. P1-T11 does not recommend `PARTIALLY_VERIFIED` because the contract's A/B read-verification conditions require live conversation/message reads. Full `SPIKE_PASS` remains dependent on separately reviewed send/reply evidence after a controlled fixture exists.

### Safety totals

Provider GETs `3 / 6`; Provider mutations `0`; outbound messages `0`; conversations created `0`; mark-read calls `0`; reactions `0`; private replies `0`; comment/post mutations `0`; Ads `0`; webhook mutations `0`; unrelated PII persisted `0`; raw DM bodies persisted `0`; secrets exposed `0`; automatic retries `0`.

## P1-T11-CLOSEOUT-01 — Team Leader Acceptance

P1-T11 status: `DONE / ACCEPTED`.

Accepted classification: `AUTHORIZED_FACEBOOK_DM_DATASET_EMPTY`.

Accepted evidence HEAD: `7f77c827916c009aa1cccefa0ae17d94b85dc288`.

Activation commit: `d129d46e6a48712ed601e0fcf81bda3b67e8640c`.

Implementation/test commit: `84dea71fef8e55d5eedbc69ce9fb5d57fd2c7ac8`.

### Proven / OBSERVED Provider Behavior

- Trusted identity verification passed.
- Exact Profile/account ownership passed for Profile `6ac5a45a8e4ca44f355033ae` and Facebook account `6ac64f8740364f4695dd3077`.
- Exact `GET /v1/inbox/conversations` against the frozen Facebook account returned HTTP `200`.
- Exact list filters were Profile `6ac5a45a8e4ca44f355033ae`, account `6ac64f8740364f4695dd3077`, platform `facebook`, limit `20`.
- Conversation count was `0`.
- Pagination/meta evidence: `hasMore=false`; `nextCursor` absent; `accountsQueried=1`; `accountsFailed=0`; failed-account entries `0`; skipped-account entries `0`; frozen account failed=`false`; frozen account skipped=`false`.
- Because the exact authorized dataset was empty, exact conversation reads=`0`, message reads=`0`, message count=`0`, pagination continuation=`0`.

### DOC_CONFIRMED — not live evidence

Current Zernio documentation describes Facebook conversation listing/reads, message reads, opaque cursors, failed/skipped-account reporting, and read-only message GET semantics. These remain documentation-contract facts only. P1-T11 did not convert them into observed conversation/message payload behavior.

### Accepted interpretation

`AUTHORIZED_FACEBOOK_DM_DATASET_EMPTY` means the exact-scoped Facebook conversation-list read succeeded, the frozen account was not failed/skipped, and no conversations were present. It does not mean Facebook DMs are unsupported, conversation reads are verified end-to-end, message payloads are verified, outbound DM send is verified, or Provider permissions are broken.

### Controlled fixture / blocker

Controlled Facebook DM fixture = `NOT AVAILABLE`.

Limitation: no existing authorized Facebook DM conversation currently exists on the frozen test account. P1-T11 did not query another Brand/account, did not use a real-user participant as a test fixture, did not perform participant search, and did not use undocumented Facebook conversation creation.

P1-T11 did not use `POST /v1/inbox/conversations`. A future task must not generalize another platform's conversation-create API to Facebook Messenger without current documented Provider support.

### Not proven

- exact conversation-read payload behavior;
- message-read payload behavior;
- message pagination behavior beyond documentation;
- controlled outbound send/reply behavior;
- messaging-window behavior;
- ambiguous send outcome/idempotency behavior;
- duplicate-send prevention;
- tenant/Brand routing;
- durable state/reconciliation;
- production policy/handoff behavior.

DMs remain canonical `SPIKE_PENDING`. No `PARTIALLY_VERIFIED` promotion is made because no live conversation/message read occurred. `PROVIDER_CAPABILITIES.md` remains unchanged.

Future separately reviewed work may establish a controlled Facebook DM fixture only after independently proving an authorized internal test participant, valid existing Facebook Messenger conversation, messaging-window constraints, participant ownership/consent, bounded send/reply behavior, and ambiguous-send/idempotency handling. This closeout authorizes none of those actions.

Accepted safety totals: Provider GETs `3 / 6`; Provider mutations `0`; outbound DMs `0`; conversations created `0`; mark-read calls `0`; reactions `0`; private replies `0`; comment/post mutations `0`; Ads `0`; webhook mutations `0`; unrelated PII persisted `0`; raw DM bodies persisted `0`; secrets exposed `0`; automatic retries `0`.

Closeout execution was documentation-only: Provider/Zernio calls `0`; credentials `0`; outbound messages `0`; conversation creation `0`; mark-read/reactions `0`; source/test/runtime changes `0`.


## P1-T12 — Zernio Temporary Media Presign / Upload / Public Read / Upload-URL Expiry

Status: `DONE / ACCEPTED VIA P1-T12-R01`.

Original execution classification: `MEDIA_PROVIDER_BEHAVIOR_BLOCKED`.

Original execution evidence limitation: `LIVE_FINAL_EVIDENCE_CAPTURE_UNAVAILABLE`.

Interpretation: `internal evidence-capture limitation; not proven Provider media failure`. The separately authorized P1-T12-R01 supplied the missing authoritative expiry evidence.

Final capability status: `Media Upload = PARTIALLY_VERIFIED`.

### DOC_CONFIRMED — not live evidence

Before the live run, current Zernio media documentation was reviewed. It documents `POST /v1/media/presign`, direct PUT to the returned signed upload URL with the requested MIME type, a returned public URL/key/expiry value, and temporary-media semantics. The current request contract does not expose the previous `permanent` field. Documentation-only retention/lifetime claims remain `DOC_CONFIRMED`; P1-T12 does not promote them to observed Provider facts.

### Frozen fixture / implementation evidence

- filename: `marketlyai-p1-t12-fixture.png`;
- MIME: `image/png`;
- exact bytes: `68`;
- SHA-256: `431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460`;
- activation commit: `cb5e553e75b6472bcbf862bae9aab7c595d41719`;
- implementation/test commit: `67a244d882987af472200739eb5399a7f1972716`;
- runner default is offline and requires explicit `--live`;
- hard ceilings: Zernio `2`, cloud PUT `2`, public GET `2`, total network `6`;
- no arbitrary filename/URL selector; no permanent-upload option; no social/publishing/DM/comment/Ads/webhook surface; no automatic retry.

### Offline gates

Focused P1-T12 tests: `18 / 18` PASS. Full `npm test`: `547 / 547` PASS across `23` files. `npm run typecheck`, `npm run build`, and `git diff --check`: PASS.

### One live execution — evidence boundary

Exactly one committed live runner invocation was launched. Credentials were isolated to the child process; the parent remained credential-free. No secret, raw signed upload URL, or signed query was intentionally persisted. No rerun and no second presign occurred.

`CONTROL_FLOW_EVIDENCE`: the same Node runner remained active for at least `1919` seconds. Under the committed runner, the long `expiresIn + 60s` sleep is reachable only after all of these gates have succeeded in sequence: trusted identity HTTP `200` + expected identity match; presign HTTP `200` + complete/safe HTTPS upload/public target validation; initial cloud PUT 2xx; public GET 2xx; exact downloaded size `68`; exact downloaded SHA-256 `431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460`. Thus the one live execution demonstrably reached the expiry-wait stage.

This is control-flow evidence, not a substitute for the missing final JSON. Exact request IDs, the exact numeric `expiresIn`, exact pre-expiry HTTP status values within their accepted 2xx ranges, and raw Provider/cloud response bodies were not recovered from the cleaned terminal session and are not invented here.

`NOT CAPTURED`: when the task was resumed, the original terminal session no longer existed and no P1-T12 Node runner was active. The final same-signed-URL PUT result was therefore unavailable. It is not known from preserved evidence whether that PUT returned an expiry/signature rejection, another non-2xx condition, succeeded, or was interrupted before evidence capture. A rerun would violate the one-live-run/no-second-presign boundary, so no rerun was attempted.

### Interpretation

The original P1-T12 execution does not prove upload-URL expiry enforcement. Because its final expiry outcome was not preserved, that original execution remains conservatively classified `MEDIA_PROVIDER_BEHAVIOR_BLOCKED` with `LIVE_FINAL_EVIDENCE_CAPTURE_UNAVAILABLE`. At that point in time Media Upload remained `SPIKE_PENDING`; this historical record is not retroactively rewritten by the later accepted R01 evidence.

Known live bounds: Zernio API requests `2 / 2` before expiry wait; initial cloud PUT `1`; public GET `1`; expiry PUT outcome `NOT CAPTURED`; total network requests at least `4` and at most committed ceiling `6`; Provider/social mutations `0`; posts `0`; DMs `0`; comments `0`; Ads `0`; webhook mutations `0`; permanent uploads `0`; automatic retries `0`; second presign `0`.

## P1-T12-R01 — Durable Media Expiry Evidence

Status: `DONE / ACCEPTED`.

Accepted classification: `TEMP_MEDIA_PRESIGN_UPLOAD_PUBLIC_READ_AND_UPLOAD_URL_EXPIRY_VERIFIED`.

Accepted evidence HEAD: `deefccbe84e7fb5841f5e07fe10f7682f739f5ee`.

Accepted capability outcome: `Media Upload → PARTIALLY_VERIFIED`.

`PROVIDER_CAPABILITIES.md` is updated by this Team-Leader-authorized documentation-only closeout.

### Separation from original P1-T12

The original P1-T12 execution remains recorded as `MEDIA_PROVIDER_BEHAVIOR_BLOCKED / LIVE_FINAL_EVIDENCE_CAPTURE_UNAVAILABLE`. It reached the expiry wait by control-flow evidence but did not preserve the final expiry-PUT outcome. R01 is a separate one-run authorization and does not retroactively rewrite that first execution.

### Offline evidence

Activation commit: `bec7555f659a5b764e8fea3a3beae697c75f5a47`. Implementation/test commit: `6455214c88028cbb6d397ba96987d412c908baef`.

Focused R01 suite `22 / 22` PASS. Full `npm test` `569 / 569` PASS across `24` files. `npm run typecheck`, `npm run build`, and `git diff --check`: PASS.

Durable journal: `artifacts/provider-spike/p1-t12-r01-evidence.jsonl`, fixed and gitignored. Live child PID `21456`; wrapper PID `11888`. Exactly one live invocation occurred; no duplicate launch or relaunch.

Checkpoint sequence: `RUN_STARTED`, `IDENTITY_VERIFIED`, `PRESIGN_RECEIVED`, `INITIAL_UPLOAD_COMPLETED`, `PUBLIC_READ_VERIFIED`, `EXPIRY_WAIT_STARTED`, `EXPIRY_DEADLINE_REACHED`, `EXPIRED_PUT_COMPLETED`, `RUN_FINALIZED`.

### OBSERVED Provider / cloud behavior

| Stage | Result |
|---|---|
| Trusted identity | HTTP `200`, request ID `890bd9a9-752b-4f7e-bb24-4433ec07a703`, expected identity matched |
| Media presign | HTTP `200`, request ID `65be44ab-eb22-44e5-81c4-0215004f849d` |
| `expiresIn` | `3600` seconds |
| Issued at | `2026-10-23T12:14:34.725Z` |
| Initial upload | HTTP `200` |
| Initial public read | HTTP `200`, `68` bytes, exact SHA-256 match |
| Expiry+margin deadline | `2026-10-23T13:15:34.725Z` |
| Deadline checkpoint | elapsed `3,660,020 ms` vs required `3,660,000 ms`, reached=`true` |
| Same-URL expired PUT | HTTP `403`, `SIGNED_REQUEST_EXPIRED`, rejected=`true` |
| Final classification | `TEMP_MEDIA_PRESIGN_UPLOAD_PUBLIC_READ_AND_UPLOAD_URL_EXPIRY_VERIFIED` |

Frozen binary SHA-256: `431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460`.

### Safety / boundedness

Zernio API `2 / 2`; presigns `1`; cloud PUTs `2 / 2`; public GETs `1 / 2`; total network `5 / 6`; second presign `0`; retries `0`; social/publishing/DM/comment/Ads/webhook mutations `0`; permanent uploads `0`; optional final GET `0`.

Live evidence persisted no signed upload URL, query string, AWS/R2 signature, API key, bearer token, or Authorization header. Structural scan found `uploadUrl=false`, `X-Amz-=false`, `Authorization=false`, `Bearer=false`, `apiKey=false`, query marker=false. Result records `signedUrlsPersisted=0` and `secretsPersisted=0`.

### Interpretation

R01 verifies the bounded temporary upload flow through initial upload/public binary read and verifies signed upload-URL expiry enforcement after the actual Provider `expiresIn` plus the required 60-second margin. Team Leader acceptance promotes the canonical capability to `Media Upload = PARTIALLY_VERIFIED`; `Media Upload != SPIKE_PASS`.

Durable evidence survived the long wait and finalized with all nine required checkpoints in exact order. No duplicate live launch occurred. Persisted signed URLs `0`; signed queries `0`; API keys `0`; Authorization/Bearer secrets `0`.

Accepted safety totals: Zernio API `2 / 2`; presigns `1`; initial PUTs `1`; expired PUTs `1`; cloud PUT total `2 / 2`; public GET `1 / 2`; total network `5 / 6`; second presign `0`; automatic retries `0`; social/publishing mutations `0`; DMs `0`; comments `0`; Ads `0`; webhooks `0`; permanent uploads `0`; signed URLs persisted `0`; secrets persisted `0`.

Remaining Phase-1 Media limitations: `TEMPORARY_MEDIA_RETENTION_DELETION_UNVERIFIED` and `APPROVED_ORIGINAL_REUPLOAD_UNVERIFIED`. Temporary object lifetime/deletion remains `DOC_CONFIRMED / LIVE RETENTION BEHAVIOR UNVERIFIED`. `APPROVED_ORIGINAL_REUPLOAD = SPIKE_PENDING`; successful first upload is not treated as proof of a new-presign re-upload flow.

This closeout itself is documentation-only: Provider calls `0`; credentials `0`; presigns `0`; media PUTs `0`; public GETs `0`; social mutations `0`; source/test/runtime changes `0`.

## P1-T13 — Approved-Original Fresh-Presign Re-upload

Status: `DONE / ACCEPTED`.

Accepted classification: `APPROVED_ORIGINAL_FRESH_PRESIGN_REUPLOAD_VERIFIED`.

Accepted evidence HEAD: `f31eb4a0dd171d4524862152ffe64cab2a813b49`.

Accepted capability outcome: `APPROVED_ORIGINAL_REUPLOAD = VERIFIED`; `Media Upload = PARTIALLY_VERIFIED`.

Only remaining Phase-1 Media gap: `TEMPORARY_MEDIA_RETENTION_DELETION_UNVERIFIED`.

### Approved original / scope

The task reused only the retained frozen approved original bytes: filename `marketlyai-p1-t12-fixture.png`, MIME `image/png`, exact size `68`, SHA-256 `431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460`. The old P1-T12/R01 expired signed upload URL was not reused. The prior temporary public object was not used as source. No arbitrary file/URL input or media regeneration path exists in the runner.

This task did not test retention/deletion, publishing, permanent media, DMs, comments, Ads, webhooks, or production MediaProvider behavior.

### Offline gates

Activation commit: `7b600c381011a4ee1f345eddc4a81fdbf7de82a5`. Implementation/test commit: `cab4607b9d2ab0fb7ed3774a9b1f7baae99a783a`.

Focused P1-T13 suite: `20 / 20` PASS. Full `npm test`: `589 / 589` PASS across `25` files. `npm run typecheck`, `npm run build`, and `git diff --check`: PASS.

### Live execution boundary

One ignored Windows PowerShell 5.1 launcher compatibility attempt failed because `ProcessStartInfo.ArgumentList` was unavailable. Before that failure: Node child creation `0`; evidence journal absent; PID file absent; Provider calls `0`; cloud calls `0`. This was local orchestration evidence, not a Provider/live experiment, and does not count as a retry. After correcting the ignored launcher, exactly one actual P1-T13 live runner invocation executed.

Durable journal: `artifacts/provider-spike/p1-t13-evidence.jsonl`, fixed and gitignored. Six checkpoints persisted in exact order: `RUN_STARTED`, `IDENTITY_VERIFIED`, `FRESH_PRESIGN_RECEIVED`, `REUPLOAD_COMPLETED`, `PUBLIC_READ_VERIFIED`, `RUN_FINALIZED`. Live child PID `16492` was not alive after `RUN_FINALIZED`.

### OBSERVED Provider / cloud behavior

| Stage | Result |
|---|---|
| Trusted identity | HTTP `200`; request ID `20aafe3d-8976-4c23-a653-4cf6d3466c20`; expected identity matched |
| Fresh media presign | HTTP `200`; request ID `d47acb02-aaa9-459a-885f-8a0540c22faa` |
| Fresh authorization issued at | `2026-10-23T15:01:20.023Z` |
| `expiresIn` | `3600` seconds |
| Safe key | `temp/1792767679997_dncsau4l_marketlyai-p1-t12-fixture.png` |
| Upload target evidence | HTTPS; `late-media.613d73a46130ed0083c059a837d6511b.r2.cloudflarestorage.com`; signed query present |
| Public target evidence | HTTPS; `media.zernio.com`; path `/temp/1792767679997_dncsau4l_marketlyai-p1-t12-fixture.png` |
| Re-upload PUT | exactly one; HTTP `200`; source bytes = retained approved original |
| Public GET | exactly one; HTTP `200`; downloaded `68` bytes |
| Downloaded SHA-256 | `431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460` |
| Exact binary equality | `true` |
| Final classification | `APPROVED_ORIGINAL_FRESH_PRESIGN_REUPLOAD_VERIFIED` |

A successful fresh `POST /v1/media/presign` after the previously accepted expiry experiment is evidence of newly issued Provider authorization. No claim is made that the fresh signed URL string differs from the old one because the full signed URL is intentionally never persisted.

### Safety / boundedness

Zernio API `2 / 2`; fresh presigns `1`; cloud PUTs `1 / 1`; public GETs `1 / 1`; total network `4 / 4`; second presign `0`; automatic retries `0`; social/publishing/DM/comment/Ads/webhook mutations `0`; permanent uploads `0`.

Durable evidence persisted no full signed URL, signed query, `X-Amz-*` material, API key, expected identity value, Authorization/Bearer secret, or query marker. Safe scan results: `uploadUrl=false`, `X-Amz-=false`, Authorization header=false, Bearer=false, API-key value=false, expected-identity value=false, query marker=false. Result records `fullSignedUrlPersisted=0`, `signedQueryPersisted=0`, `secretsPersisted=0`, `permanentUploads=0`.

### Interpretation

Observed Provider Behavior proves that the independently retained approved original can be reproduced locally from the frozen bytes, one fresh Zernio temporary authorization can be requested later, those exact bytes can be transferred again, and the newly public object contains the exact approved binary.

P1-T13 does not establish automatic production re-upload, durable production media storage, tenant/Brand ownership logic, production MediaProvider implementation, temporary object retention/deletion, publishing success, public-media lifetime beyond the observed read, or permanent storage.

Team Leader acceptance sets `APPROVED_ORIGINAL_REUPLOAD = VERIFIED`. Canonical `Media Upload` remains `PARTIALLY_VERIFIED`; `Media Upload != SPIKE_PASS`. The only remaining Phase-1 Media gap is `TEMPORARY_MEDIA_RETENTION_DELETION_UNVERIFIED`, which remains `DOC_CONFIRMED / LIVE RETENTION BEHAVIOR UNVERIFIED`.

Provider Behavior is limited to the observed fresh authorization, transfer, and exact binary read-back above. Not proven: production MediaProvider implementation; tenant/Brand authorization; durable production storage; automated production re-upload; publishing; temporary retention/deletion; permanent storage.

P1-T13-CLOSEOUT-01 safety boundary: Provider calls `0`; credentials `0`; presigns `0`; media PUTs `0`; public GETs `0`; source/test/runtime changes `0`; external mutations `0`. Documentation only.

## P1-T14 — Temporary Media Retention / Auto-Deletion

Status: `ACTIVATED — WAITING FOR OBSERVATION A ELIGIBILITY`.

Starting HEAD: `6cca879cc923eb4e43292575ed6b1bfdf27b8f80`. Branch: `p1-t14-zernio-media-retention`. Activation commit: `f5c43aba6a618511ac262da4b7532ea2e454ce2e`. Implementation/test commit: `0461f9b1b6271738e5e9f9e37a297058bc10323b`.

### Accepted baseline

The only authorized target is the existing P1-T13 temporary object at `media.zernio.com` path `/temp/1792767679997_dncsau4l_marketlyai-p1-t12-fixture.png`. The accepted local gitignored P1-T13 journal contains exactly six checkpoints and records `REUPLOAD_COMPLETED` at `2026-10-23T15:01:20.743Z`; this is `fixtureUploadedAt` and the retention baseline. P1-T13 had already verified HTTP `200`, `68` bytes, SHA-256 `431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460`, exactMatch=`true`.

Observation A is not permitted before `2026-10-30T16:01:20.743Z`. Observation B is not permitted before `2026-10-31T21:01:20.743Z` and may occur only if Observation A returns HTTP 2xx with the exact original binary. No pre-retention baseline GET is used.

### Documentation contract — DOC_CONFIRMED

Current Zernio documentation states that temporary media is automatically deleted after 7 days. This is recorded only as `DOC_CONFIRMED`; no live retention/deletion behavior is inferred from documentation.

### Pre-observation implementation evidence

The bounded runner exposes only explicit `--observe-a` / `--observe-b` modes and one hard-coded HTTPS public target. It has no credential/Authorization path, no arbitrary URL input, no presign, no PUT/upload, and no publishing/DM/comment/Ads/webhook surface. It rejects early execution, enforces one GET per observation and two GETs total, requires exact 68-byte/SHA-256 equality for any 2xx, accepts 404/410 as definitive absence, treats 403/redirect/timeout/5xx conservatively, and persists only sanitized fixed-path evidence.

Offline gates: focused P1-T14 `24 / 24` PASS; full `npm test` `613 / 613` PASS across `26` files; `npm run typecheck` PASS; `npm run build` PASS; `git diff --check` PASS.

Current Provider/network evidence for P1-T14: authenticated API calls `0`; credentials `0`; presigns `0`; PUTs `0`; public GETs `0 / 2`; uploads `0`; Provider mutations `0`; retries `0`. No retention observation has executed yet.


## P1-T15 — Safe Native Comment-to-DM Automation Lifecycle

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Primary classification: `NATIVE_AUTOMATION_SAFETY_FAILURE`.

Error category: `SAFETY_FROZEN_POST_MISMATCH`.

Capability recommendation: `Comment-to-DM remains SPIKE_PENDING`.

### Scope and Provider contract boundary

P1-T15 was limited to the configuration/state lifecycle required by D-014: safe disabled creation, disabled read-back, enable/read-back, disable/read-back, no-trigger verification, and exact owned cleanup. It did not authorize creation of a triggering comment, intentional DM delivery, public auto-reply delivery, delayed actions, delayed-action cancellation, or AI/native race testing.

At task start, current public Provider documentation established the create/read/update/delete Comment Automation endpoints. The documented update path exposes `isActive`; the public create request contract did not establish `isActive` as a supported create input. P1-T15 therefore required the one authorized create request, if reached, to include explicit `isActive=false` and prohibited any fallback active-create attempt. This documentation fact is not treated as live Provider behavior.

Frozen target: Profile `6ac5a45a8e4ca44f355033ae`; Facebook account `6ac64f8740364f4695dd3077`; Page `1387424501114639`; Zernio post `6ada5bc404775bbecc763501`; Facebook platform post `1387424501114639_122110940457502015`; frozen content SHA-256 `db58ab9f9a09803d402dfe975d204baaeec1f9dc828c0f3c541833a84fc03113`.

### Implementation / offline evidence

Activation commit: `d53912f70f4e7fcb073dfb5fab0fb5dd5daea371`. Implementation/test commit: `6e44049340d94726b03e8b147897d5ff67b61786`.

The runner is fail-closed to the frozen Profile/account/post/configuration, explicit `isActive=false`, one automation create maximum, one enable PATCH maximum, one disable-or-emergency-disable PATCH maximum, one DELETE maximum, and an absolute Provider request ceiling of `12`. No comment-create, DM-send, conversation-create, Ads, media, webhook, or P1-T14 retention surface is callable from the runner.

Focused P1-T15 suite: `30 / 30` PASS. Full `npm test`: `643 / 643` PASS across `27` files. `npm run typecheck`, `npm run build`, and `git diff --check`: PASS before live execution.

### Single authorized live execution

Exactly one live P1-T15 runner invocation occurred. Its durable fixed-path journal is `artifacts/provider-spike/p1-t15-evidence.jsonl`, gitignored. Reached checkpoint sequence was exactly:

`RUN_STARTED → IDENTITY_VERIFIED → RUN_FINALIZED`.

Observed safe request evidence:

| Request | Result |
|---|---|
| Trusted identity `GET /v1/auth/verify` | HTTP `200`; request `fa0d0710-5b87-4ba3-b2d0-6eed4582bf5c`; expected identity matched |
| Profile/account ownership `GET /v1/accounts` | HTTP `200`; request `696ca39b-cfac-45a7-a34a-93841d1d517a`; gate passed sufficiently for the frozen-post read to execute |
| Exact frozen-post `GET /v1/posts/6ada5bc404775bbecc763501` | HTTP `200`; request `9253161a-ad49-44cc-83ba-85ebf3416a70`; exact frozen-post identity/content/target attestation did not pass |

The evidence journal does not retain a field-level post mismatch projection. Therefore P1-T15 does **not** claim which Provider field differed, that the residual post was deleted, that its content changed, or that Provider ownership changed. Historical accepted P1-T10 evidence remains historical evidence only and is not used to override this P1-T15 fail-closed preflight result.

Because target attestation failed, the runner stopped before mutation exactly as required. The create-disabled probe was **not reached**. No automation ID exists from this task, and no enable/disable lifecycle state was exercised.

### Safety / boundedness

Provider requests: `3 / 12`. Automation create attempts: `0`. Enable PATCH: `0`. Disable/emergency-disable PATCH: `0`. DELETE: `0`. Comments created: `0`. Intentional DMs: `0`. Conversations created: `0`. Ads/media/webhook mutations: `0`. Retries: `0`. Secrets persisted: `0`. Private PII persisted: `0`.

Cleanup is `NOT_APPLICABLE` because no automation was created. No second live run, alternate target, broader post lookup, active-create fallback, or additional Provider read was performed.

### Interpretation

Primary classification is `NATIVE_AUTOMATION_SAFETY_FAILURE` because the exact frozen-post precondition could not be established by the bounded live runner. This classification is a safety stop, not proof of a specific Provider post mutation or of a Comment Automation API defect.

P1-T15 therefore does **not** establish whether `POST /v1/comment-automations` honors or rejects explicit `isActive=false`; safe create-disabled support remains unverified. The create-disabled → enable → disable lifecycle, actual trigger matching, DM delivery, delayed DM/public reply behavior, already-queued delayed-action behavior, and AI/native reply race behavior all remain unresolved Provider Behavior work.

Canonical capability state is unchanged pending Team Leader review: `Comment-to-DM = SPIKE_PENDING`; `Delayed Native DM = SPIKE_PENDING`; `Delayed Native Reply = SPIKE_PENDING`. `PROVIDER_CAPABILITIES.md` is intentionally unchanged.

D-043 parallel waiting state is preserved: P1-T14 remains `WAITING_TIME_GATE`; P1-T15 made no P1-T14 request, did not access the retention object, did not create P1-T14 evidence, and did not alter the P1-T14 Observation A/B timestamps or `0 / 2` GET budget.

## P1-T15-R01 — Read-Only Frozen Post Attestation Diagnostic

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Parent disposition remains separate: `P1-T15 safety stop = ACCEPTED — fail-closed behavior correct`; `P1-T15 = UNRESOLVED / FIX REQUIRED`. The parent stopped at `SAFETY_FROZEN_POST_MISMATCH` before any Comment Automation mutation. P1-T15-R01 did not rerun the lifecycle and does not reinterpret the parent result as a Provider automation failure.

Starting HEAD: `fccd095a8701419c8b0941c90af5f43412d44c75`. Branch: `p1-t15-r01-frozen-post-diagnostic`. Activation commit: `d9ba0169d421d9f0dc07560c313a84ac85c1b725`. Implementation/test commit: `54f210432f32642c2eddd84a51a782f2416a6d8b`.

### Offline gates

Focused P1-T15-R01 suite: `25 / 25` PASS. Full `npm test`: `668 / 668` PASS across `28` files. `npm run typecheck`, `npm run build`, and `git diff --check`: PASS before the live diagnostic. An initial local typecheck/build pass exposed only TypeScript narrowing on the bounded Facebook entry; it was corrected before live execution, followed by the complete successful gate rerun. Provider requests consumed during that correction: `0`.

### Authorized live diagnostic

Exactly one read-only diagnostic run executed. The request sequence was exactly:

| Ordinal | Request | Status | Request ID |
|---|---|---:|---|
| 1 | `GET /v1/auth/verify` | `200` | `1921037c-98c5-4da7-b6b2-86b266a00b46` |
| 2 | `GET /v1/accounts?profileId=<frozen-profile>` | `200` | `c56e41bc-e5c7-40c7-b176-c7d90fb80fef` |
| 3 | `GET /v1/posts/<frozen-zernio-post-id>` | `200` | `e4ecbe71-7a16-469a-8178-aefa64908e72` |

Provider requests `3 / 3`; retries `0`. No list-post exploration, alternate post lookup, Comment Automation endpoint, P1-T14 request, or additional Provider read occurred.

### Safe normalized attestation projection

No raw Provider post body or returned post text was persisted. The bounded diagnostic projection was:

| Field | Safe observed value |
|---|---|
| `httpStatus` | `200` |
| `requestId` | `e4ecbe71-7a16-469a-8178-aefa64908e72` |
| `postEnvelopeSource` | `post` |
| `postIdFieldPresent` | `true` |
| `postIdMatch` | `true` |
| `postIdSource` | `post._id` |
| `contentFieldPresent` | `true` |
| `contentUtf8Bytes` | `65` |
| `contentSha256` | `db58ab9f9a09803d402dfe975d204baaeec1f9dc828c0f3c541833a84fc03113` |
| `contentHashMatch` | `true` |
| `contentSource` | `post.content` |
| `facebookPlatformEntryCount` | `1` |
| `facebookPlatformEntryPresent` | `true` |
| `accountIdFieldPresent` | `true` |
| `accountIdMatch` | `true` |
| `accountIdSource` | `platform.accountId._id` |
| `platformPostIdFieldPresent` | `true` |
| `platformPostIdMatch` | `true` |
| `platformPostIdSource` | `platform.platformPostId` |
| `pageIdDirectFieldPresent` | `false` |
| `pageIdNestedFieldPresent` | `true` |
| `pageIdDerivableFromPlatformPostId` | `true` |
| `pageIdMatch` | `true` |
| `pageIdSource` | `platform.platformSpecificData.pageId` |
| `platformFieldPresent` | `true` |
| `platformFacebookMatch` | `true` |
| `platformSource` | `platform.platform` |
| `legacyP1T15AttestationWouldPass` | `false` |

Account-scope projection: HTTP `200`; request ID `c56e41bc-e5c7-40c7-b176-c7d90fb80fef`; frozen account match count `1`; frozen Profile match `true`; Facebook platform match `true`; ownership gate PASS.

### Classification and interpretation

Final classification: `FROZEN_POST_RESPONSE_SHAPE_DRIFT_CONFIRMED`.

All underlying controlled target/content facts still match: exact post identity, expected content hash, Facebook account, platform post ID, Page, and platform. The field that explains the prior P1-T15 rejection is the Facebook platform account identifier response shape: the accepted diagnostic found the expected account value at bounded path `platform.accountId._id`, while the legacy P1-T15 attestation treated `platform.accountId` as a direct scalar string. Therefore the earlier `SAFETY_FROZEN_POST_MISMATCH` was a correct fail-closed safety response to parser/attestation-shape drift, not evidence of content drift or target-identity drift.

The frozen fixture remains safely usable for a corrected bounded attestation parser. A parser/attestation fix appears sufficient to remediate this diagnosed P1-T15 preflight mismatch, subject to Team Leader review. This does not establish Comment Automation create-disabled behavior, enable/disable lifecycle behavior, DM delivery, or delay behavior. Comment-to-DM remains `SPIKE_PENDING`, and no P1-T15 lifecycle rerun occurred.

### Safety / evidence boundary

Durable evidence: fixed gitignored `artifacts/provider-spike/p1-t15-r01-evidence.jsonl`. Checkpoint order: `RUN_STARTED → IDENTITY_VERIFIED → ACCOUNT_SCOPE_VERIFIED → POST_DIAGNOSTIC_CAPTURED → RUN_FINALIZED`.

Mutations `0`; automation calls `0`; comments `0`; DMs `0`; Ads/media/webhook mutations `0`; P1-T14 requests `0`; retries `0`; secrets persisted `0`; raw Provider payloads persisted `0`; lifecycle reruns `0`.

## P1-T15-R02 — Correct Proven Account-ID Response Shape and One Reauthorized Lifecycle Run

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`. Parent `P1-T15` remains `UNRESOLVED / FIX REQUIRED`. `P1-T15-R01 = DONE / ACCEPTED` with classification `FROZEN_POST_RESPONSE_SHAPE_DRIFT_CONFIRMED`.

Starting HEAD: `6b4b36fbc84a17c7fbdc30bd4cc793faea008d3e`. Branch: `p1-t15-r02-automation-lifecycle-retry`. Activation commit: `272fcc1e0abee66fafdd302528db530dfcd0c358`. Parser/test commit: `226a65e3bde9b20469e9a96ecea7285392e4f9aa`.

### Parser remediation

The original P1-T15 frozen-post attestation assumed `platform.accountId` was a scalar string. Accepted P1-T15-R01 evidence proved the controlled Provider response exposes the expected account ID at `platform.accountId._id`. R02 changed only this frozen-post attestation to use the already-existing bounded `valueId()` helper on the exact `accountId` field, accepting scalar or exact object identifiers (`_id`, `id`, `accountId`) without recursive traversal. R02 also requires exactly one Facebook platform entry. Exact post ID, content/hash, account, platform post ID, Page, and `facebook` platform gates remain mandatory.

Regression coverage proves the observed nested `_id` form passes; wrong nested ID, missing account ID, unrelated nested occurrence, duplicate Facebook entries, content mismatch, platform-post mismatch, and Page mismatch fail closed before automation create. No Comment Automation response parser was expanded speculatively.

### Offline gates

Focused P1-T15 + R02 suite: `43 / 43` PASS across `2` files. Full `npm test`: `681 / 681` PASS across `29` files. `npm run typecheck`, `npm run build`, and `git diff --check`: PASS before live execution.

### Exactly one reauthorized live execution

Exactly one P1-T15-R02 live invocation occurred. The original P1-T15 run and R01 diagnostic remain historical and separate. No second R02 invocation occurred.

| Ordinal | Request | Status | Request ID | Safe interpretation |
|---|---|---:|---|---|
| 1 | `GET /v1/auth/verify` | `200` | `2405117a-433f-4de2-bcfb-a45a0bd86d6b` | trusted identity verified |
| 2 | `GET /v1/accounts?profileId=<frozen-profile>` | `200` | `9540584e-d3fa-4036-aa42-6b6fe7a2cf21` | frozen ownership scope verified |
| 3 | `GET /v1/posts/<frozen-post>` | `200` | `62527f3b-3501-43ba-93e4-042343e8f979` | corrected exact frozen target attestation PASS |
| 4 | `POST /v1/comment-automations` | `200` | `9ae7cb32-5964-45cf-8e2a-cce7891e9094` | one create only; requested `isActive=false`; returned state `false`; owned automation `6adca6359828998e85c0ab50` |
| 5 | exact automation `GET` | `200` | `b9f61ec6-183d-408d-9acf-4f3738294fbe` | mandatory exact config attestation failed; `CREATED_DISABLED_VERIFIED` not reached |
| 6 | exact automation `DELETE` | `200` | `bec07323-5659-4d3a-93ab-a12cba15f879` | bounded cleanup of exact owned automation |
| 7 | final exact automation `GET` | `404` | `629a0889-dd97-493b-802f-a4dc54a6ec98` | cleanup verified; residual absent |

The create response establishes only that Provider accepted the explicit disabled-create request and reported `isActive=false` in that response. The immediate exact automation read-back did not satisfy the existing accepted `exactConfig` contract. The safe durable journal does not retain a field-level mismatch projection, so R02 does not claim which automation field differed or that a particular undocumented response shape caused the mismatch. Per contract, code was not patched after the live finding and the lifecycle was not rerun.

Normal enable was never attempted. Active read-back, normal disable, final disabled read-back, and bounded trigger/send verification were therefore not reached. No comment, reply, intentional DM, conversation, or external keyword trigger was created.

### Classification, cleanup, and safety

Primary classification: `NATIVE_AUTOMATION_SAFETY_FAILURE`. Error category: `SAFETY_DISABLED_READBACK_CONFIG_MISMATCH`. Cleanup: `CLEANUP_VERIFIED`.

Provider requests `7 / 12`; creates `1`; enable PATCH `0`; disable/emergency-disable PATCH `0`; DELETE `1`; retries `0`; comments `0`; intentional DMs `0`; conversations `0`; Ads/media/webhook mutations `0`; P1-T14 requests `0`; secrets persisted `0`; private PII persisted `0`.

Durable evidence path: fixed gitignored `artifacts/provider-spike/p1-t15-r02-evidence.jsonl`. Reached checkpoints: `RUN_STARTED → IDENTITY_VERIFIED → TARGET_VERIFIED → CREATE_ATTEMPT_COMPLETED → CLEANUP_COMPLETED → RUN_FINALIZED`. No raw Provider body, API key, Authorization value, commenter/recipient identity, or real-user DM content was persisted.

Canonical capability state is unchanged pending Team Leader review: `Comment-to-DM = SPIKE_PENDING`; `Delayed Native DM = SPIKE_PENDING`; `Delayed Native Reply = SPIKE_PENDING`. Classification A was not reached, so no `PARTIALLY_VERIFIED` recommendation is made. The remaining native-automation gaps include a trustworthy exact disabled automation read-back/config contract, the complete enable/active-read/disable/disabled-read lifecycle, actual trigger/delivery behavior, and delayed behavior.

P1-T14 preservation remains exact: `WAITING_TIME_GATE`, `fixtureUploadedAt = 2026-10-23T15:01:20.743Z`, Observation A earliest `2026-10-30T16:01:20.743Z`, Observation B earliest `2026-10-31T21:01:20.743Z`, public GET budget `0 / 2`, and no retention evidence/request.


## P1-T15-R03 — Initial Implementation (REJECTED; Historical Evidence)

Task state for this initial implementation: `REJECTED — FIX REQUIRED` by Team Leader for lifecycle enable/PATCH reachability and non-reserved cleanup budget. The counts and behavior notes in this historical section describe the rejected version only; the corrected implementation and its fresh evidence are recorded in `P1-T15-R03-RFIX` below. No live Provider request was authorized or executed during the remediation. Parent `P1-T15` remains `UNRESOLVED / FIX REQUIRED`; `Comment-to-DM`, `Delayed Native DM`, and `Delayed Native Reply` remain `SPIKE_PENDING`.

Starting HEAD: `ef5e1890ff2279e5df4c6ed4e52fc5061aa5e3b3`. Branch: `p1-t15-r03-automation-readback-diagnostic`.

### Documentation and existing-evidence review

Reviewed the official [Get automation details API reference](https://docs.zernio.com/comment-automations/get-comment-automation) and [Update automation settings API reference](https://docs.zernio.com/comment-automations/update-comment-automation), alongside `PROVIDER_CAPABILITIES.md`, the existing R01/R02 implementation/tests, and the fixed R02 evidence journal.

The GET reference's illustrative response documents fields including `id`, `name`, `platform`, `trigger`, `accountId`, `platformPostId`, `postId`, `keywords`, `matchMode`, `dmMessage`, `buttons`, `template`, `commentReply`, `dmDelaySeconds`, `audience`, `followGate`, `alsoMatchInDms`, `isActive`, stats, and recent logs. Its example does **not** document `profileId` on the returned automation object. The response example includes illustrative non-empty values for several optional configuration fields; it does not establish the actual default values returned for this frozen create request. The PATCH reference describes update fields and clearing semantics but likewise does not establish the R02 read-back values.

R02's only retained read-back facts are HTTP `200`, request ID `b9f61ec6-183d-408d-9acf-4f3738294fbe`, and failure of the existing `exactConfig` attestation. The response's field values were not persisted. Neither the public schema example nor the safe R02 evidence identifies the actual field that failed. The real Provider mismatch therefore remains **UNKNOWN**, not diagnosed by the synthetic tests below.

### Existing validator predicate map

The new exported `diagnoseP1T15ExactConfig` projection mirrors the current validator rather than changing which configurations it accepts.

| Predicate / exact path | Existing implementation behavior |
|---|---|
| `id` then `_id` | Uses the first non-empty scalar string; if present, it must equal the invocation's automation ID. Missing or non-string identifiers are not rejected by this predicate today. |
| `name`, `trigger`, `accountId`, `platformPostId`, `postId` | Required exact non-empty strings equal to frozen expected values. |
| `profileId` | Optional only when undefined/absent; if present, bounded `valueId()` must equal the frozen Profile ID. Bounded object keys are `_id`, `id`, and `accountId`; no recursive search. Explicit null fails. |
| `platform` | Optional when absent; if present, must equal `facebook`. |
| `keywords` | Required array with exactly one item equal to the frozen keyword. |
| `matchMode`, `dmMessage` | Required exact values; diagnostic output never contains the message or keyword value. |
| `alsoMatchInDms`, `dmDelaySeconds` | Must be boolean `false` and finite number `0`, respectively. |
| `buttons` | Current predicate rejects a non-empty array; absent, null, and non-array values are not rejected by this predicate. |
| `commentReply` | Current predicate rejects a non-empty string; absent, null, empty string, and non-string values are not rejected by this predicate. |
| `template`, `audience`, `followGate` | Must be absent/undefined or explicit null; any other non-null value fails. |
| `isActive` | Not part of `exactConfig`; the runner validates activation state separately after the configuration gate. |

These are descriptions of current code predicates, **not** claims that Zernio guarantees those response shapes. In particular, the optional identifier handling and accepted wrong-type cases above are preserved for faithful diagnosis; this task does not silently tighten or relax the accepted configuration contract.

### Diagnostic implementation

- Added `diagnoseP1T15ExactConfig`; `exactConfig` now delegates to the same projection so diagnosis and acceptance cannot drift.
- Each fixed known field records its path, missing/null/wrong-type/present state, JSON type, whether the predicate was evaluated, whether the existing predicate accepts it, and a safe mismatch category.
- Identifier checks report bounded source and comparison outcome only; no raw identifier values are included in the projection.
- No arbitrary nested traversal, raw Provider response persistence, message content, credentials, commenter/recipient details, or unknown response fields are included.
- R03 uses its own fixed gitignored evidence path: `artifacts/provider-spike/p1-t15-r03-evidence.jsonl`.
- R03 live mode is OFF by default and additionally requires `P1_T15_R03_LIVE_AUTHORIZED=true` with the explicit `--live` CLI argument. The R03 runner calls the separate `runP1T15ReadbackDiagnostic` mode, never the lifecycle wrapper. A mode-enforced send guard rejects every PATCH and rejects DELETE unless cleanup has explicitly started. The request budget is capped at 9, requires at least 7 before any Provider request, permits at most `maxRequests - 2` non-cleanup requests, and permits at most two cleanup requests (exact-resource DELETE plus final GET). At the minimum budget of 7, the normal diagnostic path uses 5 pre-cleanup requests and reserves exactly 2 for cleanup. This environment gate was not enabled for this work.

### Offline verification

Focused regression command:

```text
npm test -- tests/provider-spike/p1-t15.test.ts tests/provider-spike/p1-t15-r02.test.ts tests/provider-spike/p1-t15-r03.test.ts
60 passed / 0 failed across 3 files
```

Full suite:

```text
npm test
698 passed / 0 failed across 30 files
```

Additional gates: `npm run typecheck` PASS; `npm run build` PASS; `git diff --check` PASS; `git show --format= --check HEAD` PASS at the implementation commit. Implementation commit `8abe2b3055de87b21ab884b45d5ed33a33ec90a8` was pushed to `origin/p1-t15-r03-automation-readback-diagnostic`; remote-tracking HEAD matched and the working tree was clean after push.

R03 synthetic mock tests exercise deterministic field projection, missing/null/wrong-type/value mismatch distinctions, bounded identifier semantics, optional-field behavior, parity with the pre-R03 exactConfig predicate across synthetic shape variants, multiple independent mismatches, value/PII redaction, default-off behavior, explicit authorization gating, matching and mismatching read-back cleanup, active-create and active-read-back immediate DELETE paths with zero PATCH, the minimum seven-request budget, a hard two-request cleanup allowance, the nine-request cap, failed DELETE even when a later GET returns 404, unresolved final GET, and cleanup failure classification. These tests use an injected mock transport only and are not Provider observations.

### Live execution and safety boundary

- R03 live authorization: **NOT ISSUED**.
- Actual Zernio requests during R03: `0`.
- Actual automation creates / PATCHes / deletes: `0 / 0 / 0`.
- Actual comments / DMs / conversations: `0 / 0 / 0`.
- Actual Ads/media/webhook mutations: `0`.
- R02 evidence was not overwritten, and no R02 or lifecycle rerun occurred.
- The mock mismatch test's create/read-back/delete sequence is synthetic; it does not establish cleanup of any real Provider resource.
- The frozen target and create body remain unchanged. No normal enable, trigger, comment, DM, delayed action, P1-T14 request, or unrelated endpoint was exercised.

### R03 conclusion / remaining blocker

The diagnostic implementation is ready for Team Leader review, but the actual R02 read-back mismatch remains unresolved because live field-level evidence is unavailable and no R03 live authorization was issued. No Provider capability state is promoted. Stop here pending review and, if desired, explicit separate authorization for the single bounded R03 live diagnostic. Do not start R04.


## P1-T15-R03-RFIX — Diagnostic-Only Execution and Reserved Cleanup

Status: `IMPLEMENTED OFFLINE / RESUBMITTED FOR TEAM LEADER REVIEW`. This section supersedes the initial R03 implementation details above. The Team Leader rejection identified two blockers: R03 could reach the lifecycle enable/disable PATCH path, and the 9-request ceiling did not reserve cleanup requests on the normal path.

### Enforcement changes

- R03 now calls the separate `runP1T15ReadbackDiagnostic` execution mode. The ordinary `runP1T15` entrypoint retains lifecycle behavior for its already-scoped task; R03 does not call it.
- The shared internal request sender enforces the execution mode: any PATCH is rejected with `SAFETY_R03_PATCH_FORBIDDEN`; DELETE is rejected until cleanup explicitly starts; once cleanup starts, only the exact automation DELETE and exact automation-detail GET are allowed. The cleanup phase permits at most two requests.
- R03's total request budget is capped at 9. A requested budget below 7 returns `BLOCKED` before transport. Before cleanup starts, no more than `maxRequests - 2` requests can be sent. At the minimum budget of 7, the standard path is identity GET, account GET, frozen-post GET, one create POST, one configuration read-back GET, then exact DELETE and final GET.
- A create response reporting `isActive=true` takes the immediate exact-resource DELETE/final-read path; it never PATCHes and never reports diagnostic PASS. A read-back reporting active state likewise fails and cleans up without PATCH.
- For the ordinary successful diagnostic, PASS requires a passing exact-config projection, read-back `isActive=false`, a successful 2xx DELETE, and final GET `404`. A failed DELETE remains `CLEANUP_UNSAFE_OR_UNKNOWN` even if a later GET returns 404; the evidence records `residualState=UNKNOWN`. A final GET with a non-404/200 status or a transport error remains unresolved and fails.
- If create returns success without an addressable automation ID, R03 fails with `CLEANUP_UNSAFE_OR_UNKNOWN`; it does not claim absence or success. An uncertain create transport outcome without an ID is also classified as cleanup unknown.
- R03's RUN_STARTED evidence omits the raw automation name and keyword; the field-level projection never contains raw field values, the DM message, commenter/recipient data, or arbitrary response fields. The create body and all frozen target constants remain unchanged.

### Required offline verification

Focused command:

```text
npm test -- tests/provider-spike/p1-t15.test.ts tests/provider-spike/p1-t15-r02.test.ts tests/provider-spike/p1-t15-r03.test.ts
65 passed / 0 failed across 3 files
```

Full suite:

```text
npm test
703 passed / 0 failed across 30 files
```

Additional gates: `npm run typecheck` PASS; `npm run build` PASS; `git diff --check` PASS; `git show --format= --check HEAD` PASS at implementation commit. Implementation commit `1339c2765da7a38ef60d764f7b63187e86ac9702` was pushed to `origin/p1-t15-r03-automation-readback-diagnostic`; local and remote-tracking HEAD matched and the working tree was clean after push. The final documentation closeout commit and HEAD are reported in the handoff summary.

R03 mock coverage now explicitly proves: matching configuration never PATCHes and only passes after DELETE plus final 404; mismatch logs the safe projection before cleanup; active create/read-back paths never PATCH; budget 6 blocks before any request; budget 7 preserves both cleanup slots; failed DELETE cannot claim absence even if final GET returns 404; unresolved final GET cannot pass; create-success-without-ID fails without claiming cleanup; and the frozen create body is unchanged. All tests use an injected mock transport.

### Live/provider boundary

- Live R03 authorization: **NOT ISSUED**.
- CLI gate smoke test: `npm run p1-t15-r03 -- --live` with `P1_T15_R03_LIVE_AUTHORIZED` unset returned `R03_LIVE_AUTHORIZATION_REQUIRED`, exit code `2`, and `providerRequests=0`.
- Actual Zernio requests: `0`.
- Actual create / PATCH / DELETE: `0 / 0 / 0`.
- Actual comments / DMs / conversations / Ads / media / webhook mutations: `0`.
- No R02 rerun or R02 evidence modification occurred.
- No trigger traffic, DM, lifecycle enable, P1-T14 request, or R04 work occurred.

Canonical state remains `P1-T15 = UNRESOLVED / FIX REQUIRED`; `Comment-to-DM`, `Delayed Native DM`, and `Delayed Native Reply` remain `SPIKE_PENDING`. The implementation is resubmitted for Team Leader review only; no live authorization is implied.


## P1-T15-R03-RFIX2 — Execution-Boundary Authorization & Evidence Isolation

Status: `IMPLEMENTED OFFLINE / RESUBMITTED FOR TEAM LEADER REVIEW`. This section supersedes the R03-RFIX execution-boundary authorization and journal handling. It does not replace or convert the historical rejection record into acceptance.

### Root cause

The prior R03 wrapper treated caller-provided `liveAuthorized` as the authorization gate, but the exported `runP1T15ReadbackDiagnostic` could be called directly. The shared diagnostic path also inherited the generic `FixedP1T15Journal` fallback when no journal was supplied. A caller could therefore bypass the wrapper or allow R03 evidence to route to the parent P1-T15 journal.

### Enforcement

- Both the R03 wrapper and the shared diagnostic execution boundary require actual process-level `P1_T15_R03_LIVE_AUTHORIZED=true` for `live=true`. The shared check is before live transport construction, evidence initialization, and Provider requests. Caller-provided `liveAuthorized` and an authorization value present only in injected `options.env` are not authoritative.
- The diagnostic core has no generic-journal fallback. Missing R03 journal returns `BLOCKED / R03_JOURNAL_REQUIRED`; an unscoped journal returns `BLOCKED / SAFETY_R03_JOURNAL_SCOPE_INVALID`, before journal initialization or transport calls.
- Added a dedicated R03 journal brand. The fixed R03 journal is marked `fixed`; injected in-memory journals are marked `test-memory` and accepted only with a transport whose kind is `mock`. Test-memory journals are rejected for live-kind transports. The normal R03 wrapper supplies `FixedP1T15R03Journal`; the parent lifecycle runner is unchanged.
- R03's existing diagnostic-only controls remain unchanged: no PATCH, DELETE only after cleanup starts, request ceiling 9, budget below 7 blocks before requests, final two request slots reserved for DELETE/final GET, and PASS requires successful DELETE plus final GET 404. Frozen target and exact create body remain unchanged.

### Offline verification

Focused command:

```text
npm test -- tests/provider-spike/p1-t15.test.ts tests/provider-spike/p1-t15-r02.test.ts tests/provider-spike/p1-t15-r03.test.ts
exit code: 0
73 passed / 0 failed across 3 files; skipped: 0
```

Full suite:

```text
npm test
exit code: 0
711 passed / 0 failed across 30 files; skipped: 0
```

Additional commands and results, after the final implementation changes:
- `npm run typecheck` — exit code 0, PASS.
- `npm run build` — exit code 0, PASS.
- `git diff --check` — exit code 0, PASS.
- `git show --format= --check HEAD` — exit code 0, PASS at implementation commit.

Implementation commit: `17d9e1e2f5de8504e17c3dd857d5504f62d29fda`.

New tests: AUTH-01 direct diagnostic authorization; AUTH-02 caller-controlled boolean rejection; AUTH-03 injected-env authorization rejection; AUTH-04 authorized direct diagnostic with mock transport; JOURNAL-01 missing-journal fail-closed; JOURNAL-02 generic parent journal rejected before init/transport; JOURNAL-02b test-memory journal rejected for live-kind transport; JOURNAL-03 default R03 journal isolation. Existing R03 cleanup/configuration/privacy tests and parent P1-T15/R02 regressions remain green.

### Live Provider boundary

No live R03 CLI command was run. The process authorization variable was absent in the execution shell; tests set it only within isolated mock-test helpers and restore its prior value in `finally`. No real Provider request or external mutation occurred: Provider requests `0`; create/PATCH/DELETE `0 / 0 / 0`; comments/DMs/conversations/Ads/media/webhook mutations `0`. All transport execution tests used injected mocks. R02 and its preserved evidence were not touched; no P1-T14 request, trigger traffic, DM, R04, or later task occurred.

Canonical states remain unchanged: `P1-T15 = UNRESOLVED / FIX REQUIRED`; `Comment-to-DM`, `Delayed Native DM`, and `Delayed Native Reply` remain `SPIKE_PENDING`. No acceptance or live authorization is implied.


## P1-T15-R03-RFIX3 — Trusted Journal Provenance

Team Leader decision: `ACCEPTED WITH NON-BLOCKING NOTES`. This is the current RFIX3 closeout decision for the reviewed offline implementation and regression coverage only; it does not accept or resolve parent `P1-T15`. The historical rejection and prior submission records above remain historical records.

### Root cause

The previous implementation accepted a journal when the caller-controlled exported `P1_T15_R03_JOURNAL_BRAND` property equaled `'fixed'`. It also accepted `'test-memory'` when the caller-controlled transport declared `kind: 'mock'`. Neither value proves journal provenance.

### Implementation

- Moved `FixedP1T15R03Journal` and `P1_T15_R03_EVIDENCE_PATH` into `src/provider-spike/p1-t15-runner.ts`, shared with the R03 execution boundary. The wrapper re-exports them and retains the default fixed-journal behavior.
- A module-private `WeakSet<object>` is now the only journal-trust authority. The genuine fixed-journal constructor registers its own instance. The execution guard checks exact object identity and never uses the exported marker or `transport.kind`.
- The fixed journal constructor disallows subclass construction and freezes the instance, prototype, and constructor; its evidence path and sensitive-data sanitizer remain fixed.
- A custom object with the exported marker `'fixed'` is rejected before journal initialization or transport. A test-memory journal with its marker changed to `'fixed'` is rejected for both `kind: 'mock'` and `kind: 'live'`. A missing journal remains fail-closed. The actual fixed R03 journal remains accepted.
- The process authorization gate remains unchanged and checks actual `process.env.P1_T15_R03_LIVE_AUTHORIZED?.trim() === 'true'` before journal validation, evidence initialization, or transport. Injected `options.env` and `liveAuthorized` cannot grant authorization.
- The exact target, create body, no-PATCH rule, cleanup reservation, request ceiling, and final DELETE + GET-404 cleanup criterion remain unchanged.

### Exact offline verification

Focused command:

```text
npm test -- tests/provider-spike/p1-t15-r03.test.ts tests/provider-spike/p1-t15.test.ts tests/provider-spike/p1-t15-r02.test.ts
exit code: 0
76 passed / 0 failed across 3 files; skipped: 0
```

Full suite:

```text
npm test
exit code: 0
714 passed / 0 failed across 30 files; skipped: 0
```

Additional gates after final implementation/test changes:
- `npm run typecheck` — exit code 0, PASS.
- `npm run build` — exit code 0, PASS.
- `git diff --check` — exit code 0, PASS.
- `git show --format= --check HEAD` — exit code 0, PASS at implementation commit.

Implementation/test commit: `cb9129a6235176ea5d74ffcfdac8d797ba81f995`.

### New and preserved regression coverage

- `AUTH-01`–`AUTH-04` all pass.
- `JOURNAL-01`–`JOURNAL-04` all pass, including generic parent-journal rejection, default R03 isolation, and sensitive-field rejection.
- `JOURNAL-05` rejects a custom journal with the exported fixed marker.
- `JOURNAL-06` rejects test-memory marker spoofing regardless of caller-controlled transport kind.
- `JOURNAL-07` verifies that the genuine fixed R03 journal is accepted and cleanup is verified.
- All tests used mock transports only. The actual process authorization variable was absent outside test helpers. No live R03 CLI command was run; real Provider requests and external mutations were all zero. R02 evidence was not touched.

Canonical states remain unchanged: `P1-T15 = UNRESOLVED / FIX REQUIRED`; `Comment-to-DM`, `Delayed Native DM`, and `Delayed Native Reply` remain `SPIKE_PENDING`. At the time this implementation submission was recorded, it awaited Team Leader review; the subsequent RFIX3 closeout section records the current decision as `ACCEPTED WITH NON-BLOCKING NOTES`.


## P1-T15-R03-RFIX3 — Team Leader Acceptance and Closeout

**Team Leader decision: `ACCEPTED WITH NON-BLOCKING NOTES`.** RFIX3 is closed for the reviewed offline trusted-journal implementation and regression coverage only. This acceptance does not resolve or accept parent `P1-T15`. Earlier rejection and resubmission records remain historical and have not been rewritten as accepted at the time.

- Branch: `p1-t15-r03-automation-readback-diagnostic`.
- Reviewed HEAD: `cec600ec52e808560d32cbdb7718cb23eb916296`.
- Implementation/regression-test commit: `cb9129a6235176ea5d74ffcfdac8d797ba81f995`.
- Documentation closeout starting HEAD: `cec600ec52e808560d32cbdb7718cb23eb916296`.

### Non-blocking review notes

1. **CI evidence:** The Team Leader's GitHub review found no associated CI status checks or workflow runs for the reviewed final HEAD. This is a limitation in available evidence, not evidence that CI failed.
2. **Independent verification:** Team Leader reviewed the remote source diff, regression-test definitions, and documentation, but did not independently rerun the local test commands or verify the local working tree. All counts/results below remain Senior Engineer-reported.
3. **Live behavior:** No live Provider execution was authorized or performed as part of RFIX3. Acceptance is limited to the reviewed offline implementation and regression coverage; it is not evidence of live Provider behavior and does not resolve the parent P1-T15 objective.

### Senior-reported verification evidence

The following results were reported by the Senior Engineer after the final implementation/test changes. They were not independently rerun by Team Leader and were not rerun as part of this documentation-only closeout.

```text
npm test -- tests/provider-spike/p1-t15-r03.test.ts tests/provider-spike/p1-t15.test.ts tests/provider-spike/p1-t15-r02.test.ts
exit code: 0 — 76 passed / 0 failed across 3 files; skipped: 0

npm test
exit code: 0 — 714 passed / 0 failed across 30 files; skipped: 0

npm run typecheck
exit code: 0 — PASS

npm run build
exit code: 0 — PASS

git diff --check
exit code: 0 — PASS at implementation verification

git show --format= --check HEAD
exit code: 0 — PASS at implementation commit
```

The documentation closeout `git diff --check` was executed after all final documentation edits and exited `0` (PASS). No Provider tests, R02 rerun, live CLI invocation, or live Provider request is required or permitted for this closeout.

### State preservation

- Parent `P1-T15 = UNRESOLVED / FIX REQUIRED`.
- `Comment-to-DM`, `Delayed Native DM`, and `Delayed Native Reply` remain `SPIKE_PENDING`.
- `P1-T14 = WAITING_TIME_GATE — OBSERVATION A NOT YET ELIGIBLE`; no P1-T14 request, fixture access, timing-gate change, or evidence change occurred.
- No live authorization was granted. No live R03 CLI or Provider request occurred; R02 evidence remains unchanged.
- Current execution state is maintained only in `PROGRESS.md`: no task is executing, and the next Phase-1 task remains unassigned pending explicit Team Leader task assignment. No R04 or other successor task was started.


## P1-T15-R04 — Prepare Live Diagnostic Authorization Packet

**Status: `IMPLEMENTED OFFLINE / AUTHORIZATION PACKET READY / AWAITING TEAM LEADER REVIEW`.** This is documentation-only preparation for a possible separately authorized R03 diagnostic. It is not live authorization and does not resolve parent `P1-T15`.

### Starting point and inspected source

- Required starting branch verified: `p1-t15-r03-automation-readback-diagnostic`.
- Required starting HEAD verified: `4c4ca21d6f918915919e0547487993b343e9370a`.
- Starting working tree verified clean.
- Task branch created from that exact HEAD: `p1-t15-r04-live-diagnostic-authorization-packet`.
- Source inspected: `src/provider-spike/p1-t15-r03-runner.ts`, `src/provider-spike/p1-t15-runner.ts`, `src/provider-spike/p1-t02-zernio.ts`, `tests/provider-spike/p1-t15-r03.test.ts`, and `package.json`.
- Source/test/package comparison against the starting HEAD returned no differences. No source, test, package, configuration, or evidence file was changed.
- Existing R03 evidence path `artifacts/provider-spike/p1-t15-r03-evidence.jsonl` was absent at inspection time. No evidence file was created or modified.

### Purpose and expected result

The diagnostic is intended to record safe field-level evidence from the exact disabled-automation read-back and distinguish a confirmed field mismatch from an unverified hypothesis. It must not persist raw configuration values or response bodies. A mismatch observation is not proof of the underlying Provider implementation's defaults beyond the exact response observed in that separately authorized run.

- Expected mismatch finding: `SAFETY_DISABLED_READBACK_CONFIG_MISMATCH`, with `READBACK_DIAGNOSTIC_CAPTURED` containing field metadata only; cleanup must still be independently verified.
- If the exact configuration is accepted and the read-back explicitly reports `isActive: false`, the diagnostic can classify `COMMENT_AUTOMATION_READBACK_DIAGNOSTIC_COMPLETED` / `PASS`, but only after verified cleanup.
- No field-level live observation exists from this task. The exact mismatch remains unresolved until a separate authorization is granted and a live observation actually occurs.

### Frozen target and create configuration derived from source

| Field | Source-defined value / rule |
|---|---|
| Profile ID | `6ac5a45a8e4ca44f355033ae` |
| Account ID | `6ac64f8740364f4695dd3077` |
| Facebook Page ID | `1387424501114639` |
| Zernio post ID | `6ada5bc404775bbecc763501` |
| Facebook platform post ID | `1387424501114639_122110940457502015` |
| Platform | `facebook` |
| Frozen post integrity | SHA-256 `db58ab9f9a09803d402dfe975d204baaeec1f9dc828c0f3c541833a84fc03113`; raw post text is intentionally not copied here |
| `trigger` | `comment` |
| `name` | `P1_T15_AUTOMATION_NAME` source constant; literal intentionally not duplicated |
| `keywords` | `[P1_T15_KEYWORD]` source constant; literal intentionally not duplicated |
| `matchMode` | `exact` |
| `dmMessage` | `P1_T15_DM_MESSAGE` source constant; raw message text intentionally not copied |
| `buttons` | `[]` |
| `alsoMatchInDms` | `false` |
| `dmDelaySeconds` | `0` |
| `isActive` | `false` |
| `profileId`, `accountId`, `postId`, `platformPostId` | The exact fixed IDs listed above |

The create body is built only by `p1T15CreateBody()`; the request sender checks that the body exactly matches that function's output. These source constants, the frozen target, and the body are unchanged from the verified starting HEAD. The R03 path does not send a `platform` field in the create body and does not enable the automation.

### Authorization and non-Provider preflight

The CLI accepts no arguments (non-live) or exactly `--live`. The documented future live command is not authorized by this task.

1. The wrapper and shared diagnostic core both require `live: true` and the actual process environment value `process.env.P1_T15_R03_LIVE_AUTHORIZED?.trim() === 'true'`. Caller-provided `liveAuthorized` and `options.env` cannot grant this authorization.
2. The shared core requires the genuine `FixedP1T15R03Journal` instance registered in its private `WeakSet`; a missing or untrusted journal blocks before transport or journal initialization.
3. The effective request budget must be at least `7`; otherwise the runner blocks before transport with `R03_REQUEST_BUDGET_INSUFFICIENT_FOR_CLEANUP_RESERVATION`.
4. The hard-coded frozen post content must hash to the source constant. Credential variables `ZERNIO_API_KEY` and `ZERNIO_EXPECTED_USER_EMAIL` must be non-empty. Values must never be printed or copied into the packet.
5. The fixed journal creates `artifacts/provider-spike/p1-t15-r03-evidence.jsonl` with exclusive `open(..., 'wx')`. An existing file blocks with `SAFETY_EVIDENCE_FILE_ALREADY_EXISTS`; it is not overwritten. The path was absent during this task. Journal initialization occurs before the first Provider request.
6. The live transport uses API base `https://zernio.com/api`, a Bearer credential header, JSON request bodies, and a 7,000 ms abort timeout per request. The transport parses response JSON in memory but the R03 journal does not persist raw response bodies.


### Exact R03 request sequence derived from the diagnostic branch

The transport's base URL is `https://zernio.com/api`; paths below are the exact request paths passed by the runner. Requests are sequential; no automatic retry is implemented.

| Ordinal | Method and endpoint | Purpose / gate |
|---:|---|---|
| 1 | `GET /v1/auth/verify` | Requires HTTP 200, `valid === true`, and normalized returned email equal to the configured expected identity. Failure stops before mutation. |
| 2 | `GET /v1/accounts?profileId=6ac5a45a8e4ca44f355033ae` (profile ID URL-encoded by source) | Requires HTTP 200 and an `accounts` array; exactly one target account must match the fixed account ID, profile ID, and Facebook platform. A returned account with a non-null profile ID different from the fixed profile also fails. |
| 3 | `GET /v1/posts/6ada5bc404775bbecc763501` | Requires HTTP 200, exact provider post ID, exact frozen content and hash, exactly one Facebook platform entry, exact account ID and platform post ID, and the derived Page ID to match the fixed Page ID. Only then is `targetVerified` set. |
| 4 | `POST /v1/comment-automations` | One create attempt only, with the exact source-defined body above and `isActive: false`. A sender guard rejects any body that differs from `p1T15CreateBody()`. |
| 5 | `GET /v1/comment-automations/{returnedAutomationId}` | Issued only when create returned a 2xx response with an addressable ID and the create response did not already report `isActive: true`. The response is projected into safe field-level diagnostic metadata. |
| 6 | `DELETE /v1/comment-automations/{returnedAutomationId}` | Exact-resource cleanup only; entered immediately after a stop condition or after the diagnostic decision when an ID is known. |
| 7 | `GET /v1/comment-automations/{returnedAutomationId}` | Final exact-resource cleanup verification. No other request is permitted once cleanup starts. |

**Diagnostic mode never issues `PATCH`.** The shared sender rejects it with `SAFETY_R03_PATCH_FORBIDDEN`. The `GET /v1/comment-automations/{id}/logs?limit=1&skip=0` helper exists for the separate lifecycle path but is not called by `runP1T15ReadbackDiagnostic`; R03 does not inspect logs or send trigger traffic.

### Request budget and possible branch counts

| Control | Source-derived value |
|---|---|
| Wrapper hard request ceiling | `9` requests maximum |
| Minimum budget accepted before transport | `7`; any smaller value blocks before requests |
| Cleanup reservation | Final `2` slots reserved for exact-resource `DELETE` and final `GET` |
| Maximum requests on the current R03 diagnostic control flow | `7` (three preflight GETs + one POST + optional read-back GET + two cleanup requests) |
| Early stop before create | `1`, `2`, or `3` requests, depending on which preflight fails |
| Create rejection / ambiguous create without ID | `4` requests; cleanup cannot safely address an unknown ID |
| Create response non-2xx with an addressable ID, or create reports active | At most `6` requests: the first four followed by cleanup DELETE + final GET |
| Addressable create followed by read-back or configuration decision | At most `7` requests: first five followed by cleanup DELETE + final GET |
| Retries / PATCH / comment / DM / trigger requests in diagnostic mode | `0` |

The hard ceiling is `9`, but current R03 diagnostic control flow returns after at most `7` requests because it does not call the optional log-read helper. Do not infer permission to add requests from the unused two-request headroom. The last two slots remain reserved, and the cleanup-only guard blocks any request other than the exact-resource DELETE/final GET pair.


### Stop conditions, cleanup and failure handling

- **Before mutation:** Any authorization/journal/budget/hash/credential gate failure stops before Provider transport. Identity failure stops before account/post checks; account failure stops before post check; any account or frozen-post mismatch stops before POST. The sender independently refuses a mutation before `targetVerified`.
- **Create returns HTTP 400 without an ID:** stop as `R03_READBACK_UNAVAILABLE_CREATE_REJECTED`; no resource ID exists to clean up.
- **Create returns another non-2xx status without an ID:** stop. For timeout/no status or HTTP 5xx, report `R03_CREATE_OUTCOME_UNKNOWN_NO_AUTOMATION_ID` and `CLEANUP_UNSAFE_OR_UNKNOWN`; for other non-2xx responses report the corresponding create status/block. Do not retry and do not guess an ID.
- **Create returns 2xx without an addressable `id` or `_id`:** fail closed as `SAFETY_CREATE_SUCCEEDED_WITHOUT_AUTOMATION_ID`, cleanup unknown; no safe exact-resource DELETE can be constructed. If POST times out or has an ambiguous outcome without an ID, the resource state is unknown. Do not retry POST or use broad listing/deletion to guess.
- **Create returns a non-2xx response but includes an ID:** perform only the exact-resource cleanup pair; the overall result remains blocked/failed as classified.
- **Create response says `isActive: true`:** immediately enter cleanup; no read-back or PATCH is attempted first.
- **Malformed/non-200 read-back, config mismatch, read-back reports active, or disabled state is not explicitly `false`:** immediately enter cleanup. A status-200 response without a valid automation envelope becomes an `AUTOMATION_ENVELOPE_MISSING` diagnostic and cleanup is attempted for the known exact ID.
- **Timeout/network error before create:** stop without mutation. Timeout/ambiguous POST without an ID leaves create outcome unknown. Timeout after an addressable ID is known enters the existing bounded cleanup path when no DELETE has yet been sent.
- **Cleanup:** send one `DELETE /v1/comment-automations/{id}`, then one final `GET /v1/comment-automations/{id}`, even if DELETE fails. Confirm cleanup only if DELETE is 2xx **and** final exact-resource GET is 404. A failed DELETE followed by GET 404 is still `R03_CLEANUP_DELETE_FAILED` / residual `UNKNOWN`; a successful DELETE followed by GET 200 means the resource remains or its state is not safely absent; a failed/unavailable final GET is `R03_CLEANUP_FINAL_READBACK_UNRESOLVED` unless DELETE failure takes precedence. No third cleanup request or retry is allowed.
- If cleanup cannot be confirmed, report `CLEANUP_UNSAFE_OR_UNKNOWN` and residual state `UNKNOWN`; never report `CLEANUP_VERIFIED` merely because final GET is 404.
- R03 does not send a disable PATCH if an active resource is observed. It uses immediate exact DELETE/final GET cleanup. No comments, DMs, trigger traffic, or log reads are part of this diagnostic.

### Field-level diagnostic and evidence privacy

The R03 journal path is `artifacts/provider-spike/p1-t15-r03-evidence.jsonl`. Each row is JSONL with sequence, UTC timestamp, stage, and approved metadata. The source-defined checkpoints include:

- `RUN_STARTED`: fixed target IDs, frozen post hash, DM-message hash, and request maximum; diagnostic mode omits raw automation name and keyword.
- `IDENTITY_VERIFIED`: HTTP status, request ID, and Boolean expected-identity match only.
- `TARGET_VERIFIED`: account/post statuses and request IDs, fixed IDs, and frozen post hash.
- `CREATE_ATTEMPT_COMPLETED`: create status/request ID, returned automation ID, requested inactive state, and returned active Boolean; no raw response body.
- `READBACK_DIAGNOSTIC_CAPTURED`: read-back status/request ID and diagnostic metadata only.
- `CREATED_DISABLED_VERIFIED`: status/request ID, `isActive: false`, accepted Boolean, and mismatch count.
- `CLEANUP_COMPLETED`: DELETE/final-GET statuses and request IDs plus residual state (`ABSENT` only on confirmed cleanup; otherwise `UNKNOWN`).
- `RUN_FINALIZED`: result/classification/error category/cleanup state and request counters.

Each diagnostic field reports `path`, `requiredness`, `fieldState`, `jsonType`, `evaluated`, `accepted`, and `mismatchCategory` where applicable. Safe shape metadata may include `valueSource`, `arrayLength`, and `firstElementType`. It does not store actual field values. The runner result includes request ordinal, method, path without query string, status, and safe request/correlation ID, but not response bodies. The fixed journal rejects credential/expected-email leakage and known person-data patterns; raw credentials and raw message content must never be copied to notes, console transcripts, or evidence.

### Known source limitations to present to Team Leader (historical R04 snapshot; partially superseded by accepted R05)

**Historical/superseded note:** this section records the validator behavior as it existed during R04 packet preparation. Accepted R05 later changed the validator contract for `profileId`, `buttons`, and `commentReply`; therefore R04 items describing those three fields as permissive are historical only and must not be read as current behavior. The remaining R04 limitations that R05 did not change remain historical context. No historical evidence is deleted or rewritten.

These were limitations of the implementation at the R04 snapshot, not verified Provider behavior:

1. Frozen-post attestation checks the fixed post ID, exact content/hash, one Facebook platform entry, account ID, platform-post ID, and derived Page ID. It does **not** assert the post's current `status` or the platform entry's publication status.
2. Account ownership requires exactly one target account matching the fixed account/profile/Facebook tuple and rejects any returned account with a different non-null profile ID. Other account entries whose profile ID cannot be resolved are not independently rejected by that last predicate.
3. The read-back diagnostic treats `id` and `_id` as optional metadata; a present chosen string ID must match the created ID, but missing IDs do not themselves fail the projection. The separate `isActive` gate is checked after the projection and is not one of its diagnostic field entries.
4. **Historical R04 behavior, superseded by accepted R05 for `profileId`:** at the R04 snapshot, `profileId` and `platform` were optional in the projection. R05 later made `profileId` required for acceptance; `platform` remains optional but must match Facebook when present.
5. **Historical R04 behavior, superseded by accepted R05 for `buttons`:** at the R04 snapshot, non-array `buttons` values could be accepted. R05 later made any present non-array value fail closed; only absence or an empty array is accepted.
6. **Historical R04 behavior, superseded by accepted R05 for `commentReply`:** at the R04 snapshot, non-string values could be accepted. R05 later accepts only absence, null, or an empty string; other values fail closed. `template`, `audience`, and `followGate` remain governed by their separate absent/null contract.
7. The credential preflight checks non-empty API key and expected-email strings but does not independently validate the expected email's syntax. Actual identity is checked against the Provider response before any mutation.

Team Leader should explicitly decide whether these bounded implementation limitations are acceptable for a one-shot diagnostic or require a separate implementation task before any live authorization. This task does not silently repair them, alter source behavior, or grant authorization.


### Future operator runbook — NOT AUTHORIZED / DO NOT EXECUTE

**The command below is documented for a possible future, separately authorized run only. It was not executed for P1-T15-R04. No authorization is granted by this packet.**

```text
npm run p1-t15-r03 -- --live
```

Required process environment names (values must never be printed): `ZERNIO_API_KEY`, `ZERNIO_EXPECTED_USER_EMAIL`, and — only after an explicit separate Team Leader decision — `P1_T15_R03_LIVE_AUTHORIZED=true`. This task did not set the authorization variable. Do not use `liveAuthorized` or an injected `options.env` as an authorization substitute.

Before any future authorized run, the operator must:

1. Confirm the exact Team Leader authorization scope, branch/HEAD, target IDs, request budget, run window, and cleanup responsibility. Re-check the reviewed source has not changed.
2. Run offline checks approved for that execution (typecheck/build and the existing mock-only R03 regressions) before considering Provider access. Never use a test helper's process-variable changes as live authorization.
3. Confirm the required credentials and expected identity are available in the process environment without echoing them. The runner itself must verify the authenticated Provider email before mutation.
4. Confirm `Test-Path artifacts/provider-spike/p1-t15-r03-evidence.jsonl` is `False`. If it is `True`, stop; do not delete, truncate, overwrite, or rename the existing evidence without a separate decision. The runner's exclusive-create check remains the final no-overwrite guard.
5. Confirm the frozen target/source constants and create body are unchanged, and that the account/post preflight is expected to pass. Do not modify the target or body to get past a failed gate.
6. Execute only the exact command above after authorization; do not add a retry, alternate endpoint, PATCH, trigger, log-read, or cleanup request.
7. Review sanitized stdout and the dedicated JSONL evidence for ordered request metadata, preflight checkpoints, diagnostic field metadata, and exact cleanup statuses. Do not seek, dump, or persist raw response bodies or secrets.
8. Before Team Leader review, reconcile the reported request count with the request list and ensure the final two calls were the exact-resource DELETE and GET. Accept cleanup as confirmed only for DELETE 2xx plus final GET 404. Otherwise record residual/unknown state and stop; do not rerun automatically.

No command in this runbook is authorized by R04. Any live execution requires a separate explicit Team Leader authorization and must stop immediately on a failed preflight or uncertain resource state.


### Complete safe field diagnostic inventory

The `diagnoseP1T15ExactConfig` projection contains these field paths; values are compared in memory and are not written to the journal:

| Path | Current source rule |
|---|---|
| `id`, `_id` | Optional metadata entries; string type/presence is reported. They do not independently require presence. |
| `identity` | Uses a non-empty string `id` first, otherwise a non-empty string `_id`; absent identity is accepted, but a selected present identifier must equal the returned create ID. |
| `name` | Required exact source-constant string. |
| `trigger` | Required exact string `comment`. |
| `accountId` | Required exact fixed account ID. |
| `platformPostId` | Required exact fixed Facebook platform-post ID. |
| `postId` | Required exact fixed Zernio post ID. |
| `profileId` | Optional; if present, the source's scalar/object ID resolver must equal the fixed profile ID. |
| `platform` | Optional; if present, exact string `facebook`. |
| `keywords` | Required array with exactly one item equal to the fixed keyword constant; only array length and first-item JSON type are emitted. |
| `matchMode` | Required exact string `exact`. |
| `dmMessage` | Required exact source-constant message; the message value is never emitted. |
| `alsoMatchInDms` | Required Boolean `false`. |
| `dmDelaySeconds` | Required number `0`. |
| `buttons` | Optional; absent or empty array is accepted; a non-empty array is rejected. Non-array values have the implementation limitation documented above. |
| `commentReply` | Optional; a non-empty string is rejected. Other values are handled as described in the known limitations above. |
| `template`, `audience`, `followGate` | Optional; absent or `null` accepted, non-null values rejected. |

The separate state gate requires `isActive === false` after the projection accepts. No `isActive` value is included as a field entry in `diagnoseP1T15ExactConfig`. The projection's `mismatchCount` counts entries with `accepted === false`; a mismatch category is one of the source-generated safe labels (for example, missing/null required field, wrong type, value mismatch, identifier mismatch, array length/value mismatch, or missing automation envelope). This table documents current source behavior, including the limitations above; it does not broaden the diagnostic contract.


## Team Leader Decision — P1-T15-R04 (2026-10-25)

**R04 task decision: `ACCEPTED WITH NON-BLOCKING NOTES` for offline packet preparation only. Live authorization decision: OPTION B — NOT GRANTED.**

Source review confirmed the current read-back projection can accept an absent `profileId`, a non-array `buttons` value, or a non-string `commentReply` value without recording a mismatch. These are sufficient to prevent authorizing the proposed live diagnostic: the exact-configuration diagnostic must not classify incomplete or malformed configuration as accepted.

At the time of the R04 decision, a separate Senior Engineer task, `P1-T15-R05 — Fail-Closed R03 Read-Back Validation`, was assigned but had not started; that historical state is superseded by the R05 acceptance record below. It must require an exact `profileId`, fail closed on unexpected `buttons`/`commentReply` types, add mock-only regression coverage, update the test matrix and progress record, and stop for Team Leader review. The full contract is recorded in `PROGRESS.md`.

The remaining documented limitations are accepted only for this fixed-target, disabled-create/read-back/delete diagnostic: current post status is not checked because exact post/account/platform IDs and content are attested and no trigger traffic is sent; unresolved profile identifiers on non-target account rows do not select the target, whose own account/profile/platform must match; missing `id`/`_id` in detail read-back is acceptable because the GET addresses the exact ID returned by create and any present ID must match; expected-email syntax validation is non-blocking because actual Provider identity must match exactly before mutation. `platform` may remain absent in automation read-back because it is not sent in the create body, but any present value must match Facebook.

No live run is authorized. Do not set `P1_T15_R03_LIVE_AUTHORIZED=true`, execute `npm run p1-t15-r03 -- --live`, or send Provider requests. Parent `P1-T15` remains `UNRESOLVED / FIX REQUIRED`; `P1-T14` remains `WAITING_TIME_GATE`.


## P1-T15-R05 — Fail-Closed R03 Read-Back Validation

**Status: `DONE / ACCEPTED WITH NON-BLOCKING NOTES`.** Team Leader accepted the offline R05 implementation and regression evidence. This acceptance does not grant live authorization or resolve parent `P1-T15`.

### Starting point and changed implementation

- Latest reviewed R04 base: `cdeec307630ed8d13381d8cbd18171d3c3cbba96`, from `p1-t15-r04-live-diagnostic-authorization-packet`.
- Dedicated task branch: `p1-t15-r05-fail-closed-readback-validation`.
- Implementation commit: `3230145b29eae783947d0eeb44d03c12d409ee62`.
- Production change is limited to `src/provider-spike/p1-t15-runner.ts`, function `diagnoseP1T15ExactConfig`.
- Test changes: `tests/provider-spike/p1-t15-r03.test.ts` adds strict shape and mock end-to-end cases; `tests/provider-spike/p1-t15.test.ts` adds the required `profileId` to its shared lifecycle mock read-back/create fixture because the fixed create body already includes that field. No lifecycle production code was changed.
- `platform` remains optional in read-back; when present it must equal `facebook`. `id`/`_id` remain optional metadata; any selected present identifier must match the create ID. The fixed target and create body are unchanged.

### Corrected validation contract

| Field | Accepted shapes | Rejected shapes and safe categories |
|---|---|---|
| `profileId` | Exact non-empty scalar profile ID, or object resolving to the exact ID via existing bounded `valueId` semantics (`_id`, `id`, or `accountId`) | Missing → `MISSING_REQUIRED_FIELD`; null → `NULL_IDENTIFIER`; primitive/array wrong type → `WRONG_TYPE`; unresolved object/empty scalar → `UNRESOLVED_IDENTIFIER`; resolved mismatch → `IDENTIFIER_MISMATCH`. Requiredness is now `required`. |
| `buttons` | Missing, or an empty array | Non-empty array → `UNEXPECTED_NON_EMPTY_ARRAY`; present null → `UNEXPECTED_NULL`; any other present non-array type → `WRONG_TYPE`. |
| `commentReply` | Missing, null, or empty string | Non-empty string → `UNEXPECTED_NON_EMPTY_STRING`; Boolean/number/array/object/other non-string non-null type → `WRONG_TYPE`. |

The field-level diagnostic still emits metadata only (path, requiredness, state, JSON type, evaluation/acceptance, safe mismatch category and safe shape/source metadata); it does not emit raw field values. Missing or malformed required configuration cannot be accepted.

### PASS contract and preserved controls

R03 returns `PASS` only when the projected configuration is accepted, the read-back explicitly has `isActive === false`, and cleanup is verified by exact-resource `DELETE` returning 2xx followed by final exact-resource `GET` returning 404. Missing `isActive` is `BLOCKED`; active state/config mismatch fails closed; uncertain cleanup cannot become PASS.

Preserved without production changes: process-environment authorization guard; genuine `FixedP1T15R03Journal` identity validation; fixed target and exact create-body validation; request ceiling and final-two-request cleanup reservation; no-`PATCH` restriction in R03 diagnostic mode; exact-resource cleanup/final read-back; secret/PII filtering and durable evidence path. No change was made to the target, create body, authorization mechanism, request budget, cleanup contract, or P1-T14.

### Regression coverage

- R03-04: exact scalar ID and supported object ID forms; missing, null, empty scalar, wrong type, unresolved object and mismatched identifier.
- R03-06: missing/empty/non-empty-array/null/string/number/object/Boolean `buttons`; missing/null/empty/non-empty-string/Boolean/number/array/object `commentReply`.
- R03-10c: mock-only end-to-end missing/wrong-type `profileId`, null/string `buttons`, and number/object `commentReply`; every case fails, captures safe mismatch metadata, performs the bounded DELETE/final GET pair, and never PATCHes or persists sentinels.
- R03-10d: accepted field configuration with missing `isActive` is BLOCKED, never PASS, and still cleans up.
- Existing R03 tests continue to cover authorization bypass attempts, genuine journal identity, no-PATCH, request budget, create ambiguity, cleanup uncertainty, failed DELETE plus final 404, and PII/secret filtering.
- The P1-T15 lifecycle fixture now reflects the existing fixed create contract by including `profileId`; no production lifecycle implementation changed.

### Exact verification commands and actual results

- `npm test -- tests/provider-spike/p1-t15-r03.test.ts` — final exit code `0`; `40 passed / 0 failed` (1 file). An earlier run exited `1` with `38 passed / 1 failed` because the empty-string test expected `valueSource: scalar` while the existing bounded resolver reports `none`; the test expectation was corrected. An intermediate rerun passed `39/39` before R03-10d was added.
- `npm test` — final exit code `0`; `721 passed / 0 failed` across `30` files. An earlier full-suite run exited `1` with `707 passed / 13 failed`: lifecycle mocks omitted `profileId` and therefore correctly failed the tightened shared validator. The lifecycle mock fixture was updated to match the fixed create body; the final full suite passed. An intermediate rerun before R03-10d passed `720/720`.
- `npm run typecheck` — final exit code `0`, PASS.
- `npm run build` — final exit code `0`, PASS.
- `git diff --check` — code/test-only pre-documentation check exited `0`, PASS. A final check after the documentation edits is recorded in the R05 handoff in `PROGRESS.md`.
- `git show --format= --check HEAD` on implementation commit `3230145b29eae783947d0eeb44d03c12d409ee62` — exit code `0`, PASS.

### Remaining blockers and safety status

No live Provider requests or external mutations occurred; all diagnostic transport cases were mock-only. `P1_T15_R03_LIVE_AUTHORIZED` remains absent from the operator process environment. No live R03 command, automation activation, PATCH, trigger traffic, comment, DM, log read, or Provider cleanup was run by R05. No R02 evidence was changed.

Parent `P1-T15 = UNRESOLVED / FIX REQUIRED`. `Comment-to-DM`, `Delayed Native DM`, and `Delayed Native Reply` remain `SPIKE_PENDING`. R05 only tightens offline validation and regression coverage; actual Provider read-back behavior remains unverified. Stop for Team Leader review; do not start a successor task.

## Team Leader Decision - P1-T15-R05 (2026-10-26)

**Decision: `ACCEPTED WITH NON-BLOCKING NOTES`.** R05 is closed. The reviewed final Senior HEAD was `aa0eb9cfc7b58d7e95b9a98d091731f4bcc11a80` on `p1-t15-r05-fail-closed-readback-validation`.

Senior-reported evidence preserved for acceptance: focused R03 tests `40 / 40`; full suite `721 / 721`; typecheck, build, and diff checks PASS. Team Leader did not independently re-execute those test/typecheck/build commands. GitHub had no CI/workflow result attached to the reviewed final HEAD; this records missing attached CI evidence, not a CI failure.

Acceptance is limited to the reviewed offline validation fix and regression coverage. Live Provider Authorization remains `NOT GRANTED`; no live R03 diagnostic or Provider automation lifecycle action is authorized. Parent `P1-T15` remains `UNRESOLVED / FIX REQUIRED`; `Comment-to-DM`, `Delayed Native DM`, and `Delayed Native Reply` remain `SPIKE_PENDING`. `P1-T14` remains independently `WAITING_TIME_GATE` and unchanged.


## P1-T15-R06 — Activation Record

**Status: `ACTIVATED / ONE LIVE R03 DIAGNOSTIC AUTHORIZED`.** No live request has occurred at this activation checkpoint.

- Base HEAD: `3d1bb6e763e8747b5fc39a51146cc47e9f4e05af`.
- Branch: `p1-t15-r06-live-readback-diagnostic`.
- Exact authorized command after all gates pass: `npm run p1-t15-r03 -- --live`, one invocation only.
- Authorized mutation scope: one unchanged disabled Comment Automation create (`isActive=false`) and one exact cleanup DELETE for the created automation ID.
- Existing safe read path only: trusted identity → exact Profile/account ownership → exact frozen post → exact created-automation read-back → exact cleanup DELETE → final exact-resource GET.
- No PATCH, activation, trigger traffic, comment, DM, automation-log read, alternate endpoint, retry, second create, or third cleanup request is authorized.
- Existing R03 bounds remain authoritative: request ceiling `9`; minimum budget `7`; final two request slots reserved for cleanup; no cleanup is confirmed unless DELETE returns 2xx and final exact-resource GET returns 404.
- Evidence path is fixed to `artifacts/provider-spike/p1-t15-r03-evidence.jsonl` and must not exist before execution. Pre-existing evidence is a hard STOP and must not be modified.
- Credentials and expected identity may be loaded only into process memory without printing values. `P1_T15_R03_LIVE_AUTHORIZED=true` is authorized only for the single live child process after every preflight gate passes and must not be persisted.
- P1-T14 remains independently frozen in `WAITING_TIME_GATE`; no request, evidence, branch, fixture, timing or budget change is authorized by R06.
- Parent `P1-T15` remains unresolved. R06 is diagnostic evidence only and does not prove enable/disable lifecycle, trigger/delivery behavior, delayed actions, or capability status.


## P1-T15-R06 — Single Authorized Live R03 Read-Back Diagnostic

**Status: `DONE / ACCEPTED WITH NON-BLOCKING NOTES`.** Team Leader accepted the R06 execution/evidence quality for the exact bounded disabled-create/read-back/delete diagnostic only. Exactly one live invocation occurred at activation HEAD `8b7048521ab7c2eac4da4c76f8af3269de0d0761` on branch `p1-t15-r06-live-readback-diagnostic`; live authorization is `CONSUMED / NO RERUN AUTHORIZED`.

### Offline/evidence gates
- Accepted R05 source/tests/package were unchanged from base `3d1bb6e763e8747b5fc39a51146cc47e9f4e05af` (diff exit `0`).
- Focused R03: `40 / 40 PASS`, exit `0`; typecheck exit `0`; build exit `0`; pre-live `git diff --check` exit `0`.
- Dedicated evidence file did not exist before execution. Required credential names were available from the accepted ignored historical `.env`; values were not printed or persisted. Process authorization was injected only for the one child execution and was absent again afterward.

### Live result
- Command invocation count: `1` — `npm run p1-t15-r03 -- --live`; CLI exit `1`.
- Result/classification/error: `FAIL / NATIVE_AUTOMATION_SAFETY_FAILURE / SAFETY_DISABLED_READBACK_CONFIG_MISMATCH`.
- Created automation: `6adeb03f3f68ec46a12a5395`; requested inactive; create response reported inactive.
- Requests exactly `7`:
  1. `GET /v1/auth/verify` → `200`, request `d70ad242-e029-4f07-a152-ad8cbb4b12e0`.
  2. `GET /v1/accounts` → `200`, request `085ac6e7-cad0-4051-87b9-f520c6e807d8`.
  3. `GET /v1/posts/6ada5bc404775bbecc763501` → `200`, request `b5957be3-cdb1-4935-8285-d8eebcb2df9f`.
  4. `POST /v1/comment-automations` → `200`, request `4353dfd6-b978-47ca-b426-a1722c0b7fef`.
  5. Exact automation GET → `200`, request `6284f5df-f7a6-4456-b63b-58496bac6a7e`.
  6. Exact automation DELETE → `200`, request `7ce6f54b-4cb6-4e46-a20c-47bc3caa84ac`.
  7. Final exact automation GET → `404`, request `284b0761-466d-4528-bea6-5f1402f54741`.

### LIVE_PROVIDER_OBSERVED read-back mismatch
Safe diagnostic mismatch count = `3`:
- `profileId`: `missing`, type `missing`, required, `MISSING_REQUIRED_FIELD`, value source `absent`.
- `dmDelaySeconds`: `missing`, type `missing`, required, `MISSING_REQUIRED_FIELD`.
- `audience`: `present`, type `object`, optional, `UNEXPECTED_NON_NULL_VALUE`.

Only the safe diagnostic metadata above is retained. No raw Provider body or field value is promoted from assumption to fact.

### Cleanup and safety
- `CLEANUP_VERIFIED`: DELETE `200` AND final exact GET `404`; residual `ABSENT`.
- Provider requests `7 / 9`; create `1`; DELETE `1`; PATCH `0`; comments `0`; DMs `0`; conversations `0`; Ads/media/webhook mutations `0`; retries `0`; log reads `0`.
- Evidence stages exactly: `RUN_STARTED → IDENTITY_VERIFIED → TARGET_VERIFIED → CREATE_ATTEMPT_COMPLETED → READBACK_DIAGNOSTIC_CAPTURED → CLEANUP_COMPLETED → RUN_FINALIZED`.
- P1-T14 was untouched.

### Interpretation
This proves only the one disabled-create/read-back/delete diagnostic and the exact mismatch metadata above. It does not verify lifecycle enable/disable, trigger behavior, Comment-to-DM delivery, delayed DM, or delayed reply. Team Leader accepted this bounded evidence with non-blocking notes, while parent `P1-T15` remains `UNRESOLVED / FIX REQUIRED` and all three downstream Native Automation capability items remain `SPIKE_PENDING`.

## P1-T15-R06 — Team Leader Acceptance Closeout

**Decision: `ACCEPTED WITH NON-BLOCKING NOTES`.** Acceptance applies to the exact bounded Provider Behavior evidence from the single disabled-create/read-back/delete diagnostic. It does not accept or complete parent `P1-T15`, and it does not authorize a rerun or any lifecycle execution.

Preserved live facts: exactly one live invocation; final harness result `FAIL`; classification `NATIVE_AUTOMATION_SAFETY_FAILURE`; error `SAFETY_DISABLED_READBACK_CONFIG_MISMATCH`; Provider requests `7`; PATCH `0`; comments `0`; DMs `0`; retries `0`; cleanup `DELETE 200 → final exact GET 404`; residual resource `ABSENT`. Safe read-back diagnostic metadata identified only these failed field observations: `profileId` missing, `dmDelaySeconds` missing, and `audience` present with JSON type `object`.

No raw Provider values or semantic interpretation is inferred for those three fields. In particular, the evidence does not establish why the Provider omitted `profileId` or `dmDelaySeconds`, what the contents or business meaning of the `audience` object are, or whether these shapes apply outside this exact diagnostic.

R06 live authorization is `CONSUMED / NO RERUN AUTHORIZED`. Parent `P1-T15 = UNRESOLVED / FIX REQUIRED`; `Comment-to-DM`, `Delayed Native DM`, and `Delayed Native Reply` remain `SPIKE_PENDING`. The evidence does not verify enable/disable lifecycle, trigger behavior, Comment-to-DM delivery, delayed DM, or delayed reply. No successor task is selected or started by this closeout.


## P1-T15-R07 — Safe Read-Back Contract Reconciliation (OFFLINE)

**Result: `IMPLEMENTED OFFLINE / TESTED / BLOCKED ON R06 EVIDENCE INTEGRITY`.** Implementation/tests commit: `ac80a852dd6b5a3152dc43111c39e13773741d91`. R07 made no Zernio request and creates no new `LIVE_PROVIDER_OBSERVED` facts.

### Historical live evidence retained as facts, not reinterpreted
The accepted R06 record remains the historical Provider Behavior observation: one disabled-create diagnostic invocation returned read-back with `profileId` missing, `dmDelaySeconds` missing, and `audience` present as an object; total Provider requests were `7`, with PATCH/comments/DMs/retries all `0`, and cleanup was confirmed by DELETE `200` followed by exact GET `404`. R07 changes future verification reasoning only.

### `DOC_CONFIRMED` findings reviewed for R07
Current official Zernio Comment Automation documentation describes `dmDelaySeconds` with default/example value `0`, and documents an `audience` object with `followerStatus`, `minFollowerCount`, and `whenUnknown`; the current create/read examples show the neutral-looking values `any`, `0`, and `send`. The 2026-08-07 changelog documents delayed sends and audience targeting fields and states audience targeting is Instagram-only. These are documentation facts only; they do not prove what Facebook read-back returned in R06, and R06 did not persist the raw audience values.

### Bounded reconciliation implemented
- Present `profileId` is accepted only as the exact fixed ID in the supported scalar or single-key bounded identifier shapes. Mismatch, null, wrong type, unresolved/extra/nested/multiple-key object shape fails closed. Missing `profileId` requires trusted same-run exact account/profile/facebook ownership evidence plus exact read-back account; provenance is `ACCOUNT_OWNERSHIP_PREFLIGHT`.
- Present `dmDelaySeconds` must be numeric `0`. If omitted from read-back, only the exact create response for the exact created automation may attest numeric `0`; provenance is `CREATE_RESPONSE`. Missing/wrong/non-zero/unbound create evidence remains unverified.
- `audience` missing/null remains safe under the existing optional semantics. A non-null object may normalize only when it has exactly the bounded documented keys and exact neutral/default values `{ followerStatus:any, minFollowerCount:0, whenUnknown:send }`; provenance is `PROVIDER_DEFAULT_NORMALIZATION`. Any unknown key/nesting/type or known non-neutral value fails closed. No raw nested Provider object is durable evidence.
- Direct GET-backed accepted fields use `READBACK`; failed fallback verification uses `UNVERIFIED`.

### R06 durable-evidence integrity blocker discovered during R07 tests
At the accepted R07 starting gate, `artifacts/provider-spike/p1-t15-r03-evidence.jsonl` existed and its recorded SHA-256 was `e34f2d3f653a3109ba0c9c885bfd0a020f06d4a5e16f5e0c2f4c677a64d7a33c`. The existing R03 test suite was discovered to use that same fixed path and to delete it during test cleanup. The first R07 focused test run therefore removed the ignored historical artifact. NTFS USN history confirmed the deletion/test-create sequence. No byte-faithful backup was found; the artifact has not been approximately recreated or misrepresented as recovered.

The tests were corrected to remap only the R03 filesystem operations to `artifacts/provider-spike/p1-t15-r03-test-evidence.jsonl` under Vitest. Production journal code and the production/live evidence path remain unchanged. This prevents recurrence but does not repair the already-lost historical file. Consequently the contract requirement that R06 durable evidence remain immutable is currently unmet and blocks R07 Acceptance despite successful offline behavior tests.

### Safety / capability state
- External Provider requests in R07: `0`.
- External mutations in R07: `0`.
- Live Provider Authorization: `NOT GRANTED`.
- No R03 live run, lifecycle run, PATCH, comment, DM, or R06 retry occurred.
- `P1-T15 = UNRESOLVED / FIX REQUIRED`.
- `Comment-to-DM = SPIKE_PENDING`; `Delayed Native DM = SPIKE_PENDING`; `Delayed Native Reply = SPIKE_PENDING`.
- P1-T14 remained untouched in `WAITING_TIME_GATE`.


## P1-T15-R07-R01 — R06 Evidence Integrity Recovery & Test Isolation Hardening

**Result: `IMPLEMENTED OFFLINE / TESTED / READY FOR TEAM LEADER REVIEW`.** Parent `P1-T15-R07` remains `REJECTED — FIX REQUIRED` until Team Leader disposition of this repair.

### Integrity incident disposition
- Incident record: `docs/PROVIDER_EVIDENCE_INTEGRITY.md`, identifier `EVID-INC-001`.
- Historical R06 path: `artifacts/provider-spike/p1-t15-r03-evidence.jsonl`.
- Recorded pre-loss SHA-256 preserved exactly: `e34f2d3f653a3109ba0c9c885bfd0a020f06d4a5e16f5e0c2f4c677a64d7a33c`.
- Current artifact state: `ABSENT — KNOWN INCIDENT`; original bytes remain unavailable.
- No reconstructed, approximate, fixture-derived, or inferred replacement was written to the historical path.
- Previously accepted R06 Provider Behavior remains classified `HISTORICALLY ACCEPTED PROVIDER BEHAVIOR — RAW DURABLE ARTIFACT NO LONGER AVAILABLE`.

### Isolation hardening
Vitest's R03 filesystem mock retains the dedicated test path `artifacts/provider-spike/p1-t15-r03-test-evidence.jsonl` and now audits each requested path versus the effective path passed to the real `node:fs/promises` delegate. Regression `R07-R01-EVIDENCE-ISOLATION real fs open/read/remove resolve only to the dedicated test path` proves initialization `open(...,'wx')`, append `open(...,'a')`, `readFile`, and `rm` are all physically delegated only to the test-only path. The historical live path is never passed to the real filesystem layer and no sentinel is created there. Test evidence is removed at completion.

### Evidence governance
`D-044 — Provider Spike Live/Test Evidence Isolation` records the Team Leader-authorized rule that live evidence is immutable input to offline tests, test cleanup cannot target live evidence, and accepted future Phase-1 live evidence receives a tracked safe integrity record. `docs/PROVIDER_EVIDENCE_INTEGRITY.md` provides the bounded tracked ledger strategy for task/run identifier, evidence path identifier, SHA-256, byte length, safe checkpoint count, capture timestamp, classification, and availability status; raw Provider evidence remains gitignored.

### Safety state
R01 executed no Provider transport. Provider requests = `0`; external mutations = `0`; Live Provider Authorization = `NOT GRANTED`; R06 live authorization remains `CONSUMED / NO RERUN AUTHORIZED`. No R03/R06 live rerun, lifecycle, PATCH, comment, DM, or successor task occurred. P1-T14 remains unchanged in `WAITING_TIME_GATE — OBSERVATION A NOT YET ELIGIBLE`.

R07 reconciliation semantics and runner source were not modified by R01. Parent `P1-T15 = UNRESOLVED / FIX REQUIRED`; `Comment-to-DM`, `Delayed Native DM`, and `Delayed Native Reply` remain `SPIKE_PENDING`.

## P1-T15-R07-R01 / P1-T15-R07 — Team Leader Acceptance Disposition

**Reviewed final HEAD:** `c0d43381d1c6a8a244eb37dd48bb4276c5b983b3`.

Team Leader decision: `P1-T15-R07-R01 = DONE / ACCEPTED`; `P1-T15-R07 = DONE / ACCEPTED WITH NON-BLOCKING NOTES`.

The non-blocking evidence note remains permanent: the original accepted R06 raw durable artifact at `artifacts/provider-spike/p1-t15-r03-evidence.jsonl` is `LOST / BYTE-FAITHFUL CONTENT NOT RECOVERED`, recorded as `EVID-INC-001`. No restoration is claimed. Historical R06 Provider Behavior findings remain accepted under the documented evidence-governance disposition and D-044, while raw-artifact availability remains explicitly unavailable.

Team Leader independently executed the required local verification on the reviewed final HEAD: focused R03 `48 / 48 PASS`; parent P1-T15 `37 / 37 PASS`; full suite `30 files / 729 tests PASS`; typecheck PASS; build PASS; `git diff --check` PASS. The working tree was clean before and after verification; the historical R06 path remained absent before and after tests; the test evidence path was absent after tests; no sentinel or reconstructed historical replacement was created.

GitHub combined commit status contained no attached status checks; this is informational only because the required local verification was independently executed by the Team Leader.

No Provider call or external mutation was performed by this documentation-only closeout. Live Provider Authorization remains `NOT GRANTED`; R06 authorization remains `CONSUMED / NO RERUN AUTHORIZED`. Parent `P1-T15 = UNRESOLVED / FIX REQUIRED`; `Comment-to-DM`, `Delayed Native DM`, and `Delayed Native Reply` remain `SPIKE_PENDING`; P1-T14 remains `WAITING_TIME_GATE — OBSERVATION A NOT YET ELIGIBLE`. No successor task is selected.

## P1-T15-R08 — Dedicated Reconciled Live-Diagnostic Lane (OFFLINE)

**Result: `DONE / ACCEPTED` (offline lane only).** R08 prepares a dedicated future live diagnostic lane only; it performed no Provider traffic and establishes no new `LIVE_PROVIDER_OBSERVED` fact. Acceptance does not authorize the future live diagnostic.

- Starting HEAD: `acbaf2a4a675520310abdaf919f263dd754c9bd4`.
- Branch: `p1-t15-r08-dedicated-live-diagnostic-lane`.
- Activation commit: `66a4ecc64e1b160ec1e1b74cfdaca0ee43c429d9`.
- Implementation/tests commit: `8a74b38f63abe51ad4e14724cd673390de1675b4`.
- Dedicated live evidence path: `artifacts/provider-spike/p1-t15-r08-evidence.jsonl`.
- Dedicated offline-test evidence path: `artifacts/provider-spike/p1-t15-r08-test-evidence.jsonl`.
- Historical R06/R03 path `artifacts/provider-spike/p1-t15-r03-evidence.jsonl` remains absent under `EVID-INC-001`; R08 does not reuse, reconstruct, or stage through it.

### Dedicated authorization / command surface
Future R08 live execution is bound to the real process environment gate `P1_T15_R08_LIVE_AUTHORIZED=true` and the exact CLI command `npm run p1-t15-r08 -- --live`. A caller boolean or injected environment object cannot grant authorization. `P1_T15_R03_LIVE_AUTHORIZED=true` cannot authorize R08, and R08 authorization cannot authorize historical R03. Unknown CLI arguments fail closed; no caller-selectable target, endpoint, URL, automation ID, or evidence path was added.

### Bounded future Provider sequence
The R08 mock lane preserves the accepted diagnostic sequence: trusted identity read → exact Profile/account ownership read → exact frozen-post read → exactly one disabled Comment Automation create → exact created-automation read-back → accepted R07 reconciliation → exact DELETE → final exact-resource GET. The successful mock diagnostic consumes `7` requests under a fixed ceiling of `9`, leaving two-request cleanup capacity. No PATCH, lifecycle activation, comment, DM, trigger traffic, automation-log read, retry, alternate endpoint, or second create is permitted.

R07 reconciliation semantics were reused rather than redesigned. In the R06-shaped accepted mock scenario, missing `profileId` is proven only by same-run ownership attestation, missing `dmDelaySeconds` only by the exact create response for the exact automation, and the non-null audience only by the exact bounded neutral/default projection. Safe provenance is recorded without persisting the raw audience object.

### Offline behavior coverage
- Scenario A: R06-shaped reconciled configuration accepted only after exact cleanup (`DELETE 2xx` + final exact GET `404`).
- Scenario B: missing create-delay proof fails closed and still cleans exactly.
- Scenario C: unsafe/non-neutral audience fails closed and still cleans exactly.
- Scenario D: insufficient ownership/read-back binding fails closed and still cleans exactly.
- Scenario E: Provider-reported active create is a safety failure followed by immediate exact DELETE/final GET; never PATCH.
- Scenario F: cleanup uncertainty, including failed DELETE followed by final `404`, is never PASS.

D-044 isolation regression proves R08 test filesystem operations physically delegate only to `artifacts/provider-spike/p1-t15-r08-test-evidence.jsonl`. No effective filesystem operation reaches the R08 live path, and no requested/effective operation touches the historical R06/R03 path. The trusted R08 journal also rejects configured secrets/forbidden identity material before persistence.

### Final safety state
Provider requests in R08 implementation/testing: `0`; external mutations: `0`; Live Provider Authorization: `NOT GRANTED`. The R08 live evidence file was not created. Parent `P1-T15 = UNRESOLVED / FIX REQUIRED`; `Comment-to-DM`, `Delayed Native DM`, and `Delayed Native Reply` remain `SPIKE_PENDING`. P1-T14 remains `WAITING_TIME_GATE — OBSERVATION A NOT YET ELIGIBLE` and untouched. No live R08 invocation or successor task is authorized by this handoff.

### P1-T15-R08 Team Leader Acceptance Closeout

Team Leader decision: `P1-T15-R08 = DONE / ACCEPTED`, reviewed at HEAD `cfce8ca6c7d8cbea14df3b686c9499530e0197bd`.

Independent review evidence: R03 focused `48 / 48 PASS`; P1-T15 `37 / 37 PASS`; R08 focused `17 / 17 PASS`; full suite `31 files / 746 tests PASS`; typecheck PASS; build PASS; `git diff --check` PASS. Working tree was clean before and after review. R03 authorization and R08 authorization were absent. Historical R06 evidence was absent before and after review; R08 live evidence was absent before and after review; R08 test evidence was absent after cleanup.

Acceptance is limited to the dedicated reconciled diagnostic lane being safe enough for a **separately authorized future single live diagnostic**. It does not set or authorize `P1_T15_R08_LIVE_AUTHORIZED`, does not authorize `npm run p1-t15-r08 -- --live`, and authorizes no Provider traffic. Closeout Provider requests/external mutations: `0 / 0`.

Canonical parent state remains: `P1-T15 = UNRESOLVED / FIX REQUIRED`; `Comment-to-DM = SPIKE_PENDING`; `Delayed Native DM = SPIKE_PENDING`; `Delayed Native Reply = SPIKE_PENDING`; Live Provider Authorization `NOT GRANTED`; R06 live authorization `CONSUMED / NO RERUN AUTHORIZED`; P1-T14 `WAITING_TIME_GATE — OBSERVATION A NOT YET ELIGIBLE`; no successor task selected. Historical R06 artifact remains `LOST / BYTE-FAITHFUL CONTENT NOT RECOVERED` under `EVID-INC-001`.


## P1-T15-R09 — Single Authorized Live R08 Diagnostic

**Result: `EVIDENCE-INTEGRITY BLOCKER / AUTHORIZATION CONSUMED / AWAITING TEAM LEADER REVIEW`.**

### Pre-live gates

- Starting HEAD: `3526f2810f31f2725ba0b07be2f0c87565d478b1`.
- Branch: `p1-t15-r09-single-live-r08-diagnostic`.
- Activation commit/live-execution HEAD: `096ff634aba0e13e6fdc6e8fa65a90a6ee108845`.
- R03 focused: `48 / 48 PASS`.
- P1-T15 parent: `37 / 37 PASS`.
- R08 focused: `17 / 17 PASS`.
- Typecheck: PASS.
- Build: PASS.
- `git diff --check`: PASS.
- Accepted R08 source/tests/package were unchanged before invocation.
- Historical R06 evidence, R08 live evidence, and R08 test evidence were absent before the live attempt.
- Boolean-only child credential delivery probe confirmed the approved API key and expected identity were populated in the child environment; values were not printed or copied. R08 authorization was absent from that probe and from the parent environment.

### Authorized live attempt

- Authorized command surface: `npm run p1-t15-r08 -- --live`.
- Launch-attempt count: `1`; authorization consumed immediately and no rerun is authorized.
- Process exit code: `1`.
- Safe console result payload from npm/R08 runner: not emitted/captured.
- Required evidence file `artifacts/provider-spike/p1-t15-r08-evidence.jsonl`: `MISSING AFTER AUTHORIZED INVOCATION`.
- No post-live tests were run before or after integrity disposition; only the contract-permitted non-mutating Git/state checks are used for closeout.

### LIVE_PROVIDER_OBSERVED

**None established.** Because the required durable R08 live evidence file is missing, this task does not assert a Provider request count, ordered Provider request sequence, create/delete occurrence, automation ID, cleanup result, reconciliation provenance, or any Provider response behavior from the attempted invocation.

Provider traffic status = `UNVERIFIED / NOT CAPTURED`.

### DOC_CONFIRMED

No new Provider documentation claim was established by R09. Existing accepted R07/R08 documented contract and safety boundaries remain unchanged; this section adds no new Provider capability fact.

### SYSTEM_INTERPRETATION

The single authorized launch attempt returning exit code `1` without the required durable evidence artifact is an `EVIDENCE_INTEGRITY_BLOCKER`. Absence of evidence must not be converted into zero request/mutation counts or a Provider PASS/BLOCKED/FAIL classification. The R09 authorization is `CONSUMED / NO RERUN AUTHORIZED`; any launcher repair or further Provider attempt requires a new Team Leader task.

Post-attempt safe state: no P1-T15 live runner process remained active; parent R03/R08 authorization variables were absent; R08 test evidence remained absent; historical R06 evidence remained absent under `EVID-INC-001`. P1-T14 remained untouched.

Capability state is unchanged: `P1-T15 = UNRESOLVED / FIX REQUIRED`; `Comment-to-DM = SPIKE_PENDING`; `Delayed Native DM = SPIKE_PENDING`; `Delayed Native Reply = SPIKE_PENDING`.

## P1-T15-R09-R01 — Offline Launcher Forensics / Deterministic Invocation Proof

**Result: `OFFLINE REPAIR VERIFIED / AWAITING TEAM LEADER REVIEW`.** No Provider credential was loaded, no R03/R08 live authorization was set, and no Provider request or external mutation occurred.

### Forensic classification

`ROOT_CAUSE_NOT_FULLY_PROVEN — LAUNCHER/NPM BOUNDARY FAILURE CONFIRMED`.

`LIVE_PROVIDER_OBSERVED`: no new fact. Parent R09 remains `REJECTED — FIX REQUIRED`; its authorization remains `CONSUMED / NO RERUN AUTHORIZED`.

Surviving evidence proves a Desktop Commander `start_process` call in the R09 launch window at `2026-10-28T14:16:17Z`, followed by post-attempt tooling at `14:17:13Z`. The Senior Engineer execution note reports the outer shell as PowerShell and wrapper exit `1`. However the remote audit does not retain the historical command payload/argv, PSReadLine has no matching record, Security process-creation evidence was unavailable, no surviving temp/Desktop launcher artifact exists, and no npm debug log exists for the R09 attempt. Therefore npm/R08 startup is not proven and the failure appears to have occurred at or before the launcher-to-npm boundary. The exact historical launcher-to-child mechanics and precise origin of exit `1` are not claimed.

Pre-live npm traces remain independently present for R03 focused, parent P1-T15 focused, R08 focused, typecheck, and build between `2026-10-28T14:14:54Z` and `14:15:10Z`, confirming npm logging was functioning immediately before the incident.

### Corrected operational launcher procedure

No production/tooling source change was required. The proven procedure uses Windows PowerShell 5.1 `System.Diagnostics.ProcessStartInfo` with:

- absolute `C:\Windows\system32\cmd.exe` as launcher;
- absolute `C:\Program Files\nodejs\npm.cmd` as npm shim;
- working directory `C:\Users\USER\Desktop\AI-Marketing-Manager-R04-Clean`;
- `UseShellExecute=false`;
- deterministic stdout/stderr redirection;
- child PID captured after successful `Start()`;
- exact child exit code captured;
- Provider credentials and R03/R08 auth explicitly removed from inherited child environment by default;
- future task-specific live auth/credentials, if separately authorized later, restricted to that child environment only with no shell-global export and no authorization persisted to `.env`.

The first R01 implementation attempt used `ProcessStartInfo.ArgumentList`, which is not usable in the installed Windows PowerShell 5.1 runtime and failed before any child started. The compatible `Arguments` property was then used successfully. This compatibility finding is not retroactively asserted as the R09 root cause.

### Offline proof

Harmless environment probe: child PID `18900`, exit `0`; child reported launch-probe present and API key / expected identity / R03 auth / R08 auth all absent; stdout captured, stderr empty; parent environment remained unchanged.

`npm run p1-t15-r08` offline: child PID `22508`, exit `2`; npm and build ran, R08 runner emitted `BLOCKED / LIVE_OPT_IN_REQUIRED`, counters reported `providerRequests=0`, and no R08 live evidence was created.

Invalid-argument probe: `npm run p1-t15-r08 -- --r09-r01-invalid-probe`; child PID `25324`, exit `2`; R08 CLI emitted `INVALID_P1_T15_R08_ARGUMENTS` with `providerRequests=0`; no evidence file was created.

npm startup has two independent proof signals for both probes: captured npm/script console output plus npm debug traces. `2026-10-28T14_38_24_818Z-debug-0.log` records title `npm run p1-t15-r08`, expected argv/cwd, exit `2`. `2026-10-28T14_38_27_484Z-debug-0.log` records the invalid argument in title/argv, same cwd, exit `2`.

### Safety state

Provider credentials during R01: absent. R03/R08 live authorization during R01: absent. Provider requests: `0`. External mutations: `0`. R06 historical evidence path: absent under `EVID-INC-001`. R08 live evidence path: absent. R08 test evidence path: absent after verification. P1-T14 untouched. Parent/capability states remain unchanged.
