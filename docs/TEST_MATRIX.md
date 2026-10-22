# Test Matrix

## P1-T01 — Minimal Provider Spike Harness

Automated harness suite: `tests/provider-spike/harness.test.ts`

| ID | Coverage | Result |
|---|---|---|
| T01 | Valid evidence schema | PASS |
| T02 | Invalid evidence rejected | PASS |
| T03 | PASS semantics | PASS |
| T04 | FAIL semantics | PASS |
| T05 | BLOCKED semantics | PASS |
| T06 | Stable test_id across reruns | PASS |
| T07 | Unique run_id per execution | PASS |
| T08 | Authorization redaction | PASS |
| T09 | API-key redaction | PASS |
| T10 | Cookie/token redaction | PASS |
| T11 | Nested-secret redaction | PASS |
| T12 | Sentinel-secret leakage prevention | PASS |
| T13 | Request N+1 blocked before transport | PASS |
| T14 | Finite timeout terminates hanging mock | PASS |
| T15 | HTTP 429 visible, Retry-After captured, no retry | PASS |
| T16 | HTTP 4xx classification | PASS |
| T17 | HTTP 5xx classification | PASS |
| T18 | Network/transport failure classification | PASS |
| T19 | Configurable Provider Request ID extraction | PASS |
| T20 | Missing Provider Request ID is safe | PASS |
| T21 | Default offline mode sends no request | PASS |
| T22 | Live mode missing safeguards fails closed | PASS |
| T23 | Machine-readable evidence sanitization | PASS |
| T24 | `npm run typecheck` | PASS (exit 0) |
| T25 | `npm run build` | PASS (exit 0) |
| T26 | Full `npm test` suite | PASS — 1 file, 33 tests, 0 failed, 0 skipped |

## P1-T01-F01 — Runtime Safety Hardening

| ID | Coverage | Result |
|---|---|---|
| F01-T01 | Invalid runtime mode returns BLOCKED / INVALID_TEST_CONFIGURATION before prerequisite or transport | PASS |
| F01-T02 | NaN development cost ceiling rejected before transport | PASS |
| F01-T03 | NaN estimated cost rejected before transport | PASS |
| F01-T04 | +Infinity development cost ceiling rejected before transport | PASS |
| F01-T05 | +Infinity estimated cost rejected before transport | PASS |
| F01-T06 | -Infinity cost values rejected before transport | PASS |
| F01-T07 | Valid finite cost configuration permits configured mock live transport | PASS |

Targeted regression command: `npm test -- -t "P1-T01-F01 runtime safety regressions"`.
Targeted result: 7 passed, 26 skipped, 0 failed.

Additional deterministic cases in the same suite cover invalid harness configuration, malformed provider response, and development cost-safety rejection before live transport.

These are harness tests, not Zernio Provider Behavior tests.

## P1-T02 — Zernio Profile Provisioning

Status: `ACCEPTED`

### Offline / harness-system regression tests

Automated offline suite: `tests/provider-spike/p1-t02.test.ts`

| ID | Coverage | Result |
|---|---|---|
| T02-01 | Default/non-live execution makes zero external requests | PASS |
| T02-02 | Missing credential blocks before live transport | PASS |
| T02-03 | Failed authorized-team preflight prevents Profile creation | PASS |
| T02-04 | Exact-name preflight finds existing Profile and does not POST | PASS |
| T02-05 | Absent Profile triggers exactly one idempotent create POST | PASS |
| T02-06 | Successful create is followed by read-back verification | PASS |
| T02-07 | Profile A and Profile B must resolve to distinct IDs | PASS |
| T02-08 | Natural 409 reconciles by exact name without renamed duplicate | PASS |
| T02-09 | Timed-out create is not blindly retried and reconciles by GET | PASS |
| T02-10 | Unresolved ambiguous create becomes BLOCKED / UNKNOWN | PASS |
| T02-11 | 429 remains observable and is not automatically retried | PASS |
| T02-12 | 401/403 remain BLOCKED setup/provider evidence, not capability FAIL | PASS |
| T02-13 | API-key sentinel does not leak into output/errors/evidence | PASS |
| T02-14 | Provider Request ID capture | PASS |
| T02-15 | Unsafe response headers excluded | PASS |
| Extra | Duplicate exact-name state blocks before mutation | PASS |
| Extra | Missing provider Profile ID blocks as malformed evidence | PASS |
| Extra | Same A/B provider ID fails distinctness guard | PASS |
| T02-16 | Existing P1-T01/F01 suite remains green | PASS — full suite 51/51 |

Targeted command: `npm test -- -t "P1-T02 Zernio profile provisioning offline regressions"`.
Targeted result: 18 passed, 0 failed; 33 unrelated tests skipped by the name filter.

Full result: 2 test files, 51 tests passed, 0 failed, 0 skipped.

### Real Zernio Provider Behavior evidence

Provider Behavior evidence is intentionally separated from the offline harness/system regression results above.

| Test ID | Provider behavior | Result | Evidence |
|---|---|---|---|
| P1-T02-AUTH-PREFLIGHT | Team credential read-only verification using `GET /v1/users` | PASS | final run `026b271e-8153-4069-b664-0d850f21f40e`, HTTP 200, request ID `c704ae83-713d-4b3d-9aa5-2f36f2fbc670` |
| P1-T02-PROFILE-A | Exact-name Profile A exists and read-back resolves provider ID | PASS | run `ac860138-ae6e-4f8b-83d6-34198500f032`, Profile ID `6ac5a45a8e4ca44f355033ae`, HTTP 200/200 final reconciliation |
| P1-T02-PROFILE-B | Exact-name Profile B exists and read-back resolves provider ID | PASS | run `d3cf6996-9365-46ba-9690-d81b6b5834eb`, Profile ID `6ac5a45b243a942b74bdbaa0`, HTTP 200/200 final reconciliation |
| P1-T02-DISTINCT-IDS | Profile A ID differs from Profile B ID | PASS | `6ac5a45a8e4ca44f355033ae` != `6ac5a45b243a942b74bdbaa0` |

Initial provisioning also observed one intended `POST /v1/profiles` per Profile, each returning HTTP 201 between exact-name preflight and read-back GETs. No timeout, 409, 429, 5xx, UNKNOWN outcome, or automatic retry occurred during live execution.

Profiles capability final accepted status: `SPIKE_PASS`. Scoped Keys remains `SPIKE_PENDING`.

## P1-T02-F01 — Trusted Zernio Expected Identity Binding

Status: `ACCEPTED`

### Deterministic offline regressions

Automated suite: `tests/provider-spike/p1-t02-f01.test.ts`

| ID | Coverage | Result |
|---|---|---|
| F01-T01 | Missing `ZERNIO_EXPECTED_USER_EMAIL` fails closed before transport | PASS |
| F01-T02 | Authenticated email mismatch returns BLOCKED / `PROVIDER_TARGET_IDENTITY_MISMATCH` with zero mutations | PASS |
| F01-T03 | Case-insensitive/trim-normalized authenticated email match passes identity preflight | PASS |
| F01-T04 | HTTP 200 from a different authenticated identity is not authorization | PASS |
| F01-T05 | Missing/malformed provider email is BLOCKED / malformed provider response | PASS |
| F01-T06 | Actual and expected email values do not appear in normal result/evidence output | PASS |
| F01-T07 | API key and expected-email secret values are redacted from errors/evidence | PASS |
| F01-T08 | Verified identity allows read-only Profile A recorded-ID verification | PASS |
| F01-T09 | Verified identity allows read-only Profile B recorded-ID verification and distinct-ID check | PASS |
| F01-T10 | Profile ID mismatch fails closed and performs zero mutations | PASS |
| F01-T11 | Mutation-capable P1-T02 path cannot proceed after identity mismatch | PASS |

Targeted command: `npm test -- -t "P1-T02-F01 trusted Zernio expected identity regressions"`.
Targeted result: `11 passed / 0 failed`; unrelated tests skipped only by the name filter.

Full regression result after the fix: `3` test files, `62 passed / 0 failed / 0 skipped`.
`npm run typecheck`: PASS.
`npm run build`: PASS.
`git diff --check`: PASS.

### Read-only live Provider Behavior verification

Provider Behavior evidence is separate from deterministic mock regression evidence.

| Test | Provider behavior | Result | Safe evidence |
|---|---|---|---|
| P1-T02-F01 identity | `GET /v1/auth/verify` authenticated identity matches independently supplied expected identity | PASS | run `ea446326-5d53-4576-8e0c-1f99cea552c4`, HTTP 200, request ID `bd9eb306-2679-4c1a-a318-61f87b5cc940`, `expected_identity_match=true` |
| P1-T02-F01 Profile A | Exact-name read returns recorded Profile A ID | PASS | run `f995edce-dadb-4ea3-aaaa-709d1a85390e`, HTTP 200, ID `6ac5a45a8e4ca44f355033ae`, request ID `e4feea4e-90e3-4863-9f8c-c21cd4fb8c3e` |
| P1-T02-F01 Profile B | Exact-name read returns recorded Profile B ID | PASS | run `6352b4bd-7b41-41ef-a20e-ea7af7f4b489`, HTTP 200, ID `6ac5a45b243a942b74bdbaa0`, request ID `0ce2d3e2-1de7-4cf6-aea5-865bf02dfed6` |
| P1-T02-F01 mutations | F01 live execution issues no Profile write requests | PASS | POST=0, PUT/PATCH=0, DELETE=0, scoped-key operations=0 |

Expected and actual email values are intentionally absent from evidence and documentation. P1-T02 and P1-T02-F01 are accepted; canonical Profiles capability is `SPIKE_PASS`.

## P1-T03 — Zernio Scoped API Key Isolation

Status: `ACCEPTED`

### Deterministic offline / harness-system regressions

Automated suite: `tests/provider-spike/p1-t03.test.ts`

| ID | Coverage | Result |
|---|---|---|
| T03-01 | Default execution is offline and performs zero external requests | PASS |
| T03-02 | Missing control-plane credential blocks before mutation | PASS |
| T03-03 | Missing trusted expected identity blocks before mutation | PASS |
| T03-04 | Control-plane identity mismatch blocks before scoped-key creation | PASS |
| T03-05 | Key A creation body has exactly Profile A scope, read permission, bounded expiry | PASS |
| T03-06 | Key B creation body has exactly Profile B scope, read permission, bounded expiry | PASS |
| T03-07 | Scoped-key raw values do not appear in result/evidence/errors | PASS |
| T03-08 | Malformed create response fails closed; returned provider key ID is revoked when available | PASS |
| T03-09 | Key A full visible list contains only Profile A | PASS |
| T03-10 | Key A exact own lookup matches accepted Profile A ID | PASS |
| T03-11 | Key A cross-name lookup cannot expose Profile B | PASS |
| T03-12 | Key B full visible list contains only Profile B | PASS |
| T03-13 | Key B exact own lookup matches accepted Profile B ID | PASS |
| T03-14 | Key B cross-name lookup cannot expose Profile A | PASS |
| T03-15 | Unrelated Profile visibility becomes critical leakage FAIL and cleanup runs | PASS |
| T03-16 | Ambiguous API-key creation is never blindly retried | PASS |
| T03-17 | Reconciled orphan from ambiguous create is revoked without needing its lost secret | PASS |
| T03-18 | Cleanup runs after partial isolation failure once temporary keys exist | PASS |
| T03-19 | Successful revocation is followed by rejected post-revoke authentication | PASS |
| T03-20 | Cleanup-not-confirmed prevents PASS | PASS |
| T03-21 | Aggregate request ceiling blocks excess calls | PASS |
| T03-22 | Existing P1-T01 / P1-T02 / P1-T02-F01 regressions remain green | PASS |
| Extra | Cross-Profile foreign exposure is classified as critical leakage | PASS |
| Extra | Same provider key IDs fail closed when cleanup cannot be confirmed | PASS |
| Extra | Trusted expected identity sentinel remains absent from evidence | PASS |
| Extra | Scoped credential sentinel is redacted from transport errors | PASS |
| Extra | Direct create case does not serialize the returned raw scoped key | PASS |

Targeted command: `npm test -- -t "P1-T03 scoped API key isolation offline regressions"`.
Targeted result: `27 passed / 0 failed`; 62 unrelated tests skipped only by the name filter.

Full command: `npm test`.
Full result: `4` test files, `89 passed / 0 failed / 0 skipped`.

`npm run typecheck`: PASS.
`npm run build`: PASS.
`git diff --check`: PASS.

These are deterministic harness/system tests. They do not by themselves prove Zernio scoped-key isolation.

### Real Zernio Provider Behavior evidence

Provider Behavior evidence is intentionally separate from deterministic test results.

| Test | Provider behavior | Result | Safe evidence |
|---|---|---|---|
| P1-T03 control preflight | Trusted expected identity matched `GET /v1/auth/verify` before API-key creation | PASS | run `96a5cf55-0d97-43aa-b004-359c414fddac`, HTTP 200, request ID `b2f0b7b6-60cf-443a-9551-1a10fbf40914` |
| P1-T03 Key A create | Provider created read-only key scoped exactly to Profile A | PASS | key ID `6ac638e8cc8ba8b85bdd473d`, HTTP 201, request ID `35d8e086-8423-4c4d-a027-97936f067d12` |
| P1-T03 Key B create | Provider created read-only key scoped exactly to Profile B | PASS | key ID `6ac638e8cc8ba8b85bdd473f`, HTTP 201, request ID `e1bb0dd9-a063-4cd8-94fb-dbc8b18f4659` |
| P1-T03 Key A list | Key A sees exactly Profile A and no foreign/unrelated Profile | PASS | count 1, HTTP 200, request ID `ffdc6ae3-2194-42fa-9c80-be3f1a58fa9c` |
| P1-T03 Key A own lookup | Exact A lookup matches accepted A ID | PASS | HTTP 200, request ID `b8456174-66c4-45cf-b22f-aa32fd9615c2` |
| P1-T03 Key A cross lookup | Exact B lookup exposes zero Profiles | PASS | count 0, HTTP 200, request ID `eaa69e95-ecf3-49e1-a7a4-25f9f9c7489a` |
| P1-T03 Key B list | Key B sees exactly Profile B and no foreign/unrelated Profile | PASS | count 1, HTTP 200, request ID `604095ff-6437-4cf5-9b6d-90c2f02bb86a` |
| P1-T03 Key B own lookup | Exact B lookup matches accepted B ID | PASS | HTTP 200, request ID `a435d299-5005-4059-99a5-b9609aca826f` |
| P1-T03 Key B cross lookup | Exact A lookup exposes zero Profiles | PASS | count 0, HTTP 200, request ID `bcee4a5e-fdae-4d82-ae6e-4918eff46f3b` |
| P1-T03 Key A revoke | Temporary Key A revoked; credential then rejected | PASS | DELETE 200 `4c4e2cde-9834-4ad5-97a2-6186f1d03012`; post-revoke auth 401 `83c41b2e-5cc6-426e-8da2-d32e54981e64` |
| P1-T03 Key B revoke | Temporary Key B revoked; credential then rejected | PASS | DELETE 200 `f2878126-9180-426e-93ec-9dc3185bfbd8`; post-revoke auth 401 `1a120253-0214-4bae-8cae-1b02495b4fb7` |
| P1-T03 request bound | Successful live path stayed within aggregate request ceiling | PASS | 13 actual calls <= 16 ceiling |

Cross-Profile leakage observed: `NO`.
Both temporary keys were cleaned up and are no longer valid.
Raw scoped-key values and key previews are intentionally absent from tests, evidence, logs, and documentation.

Scoped Keys capability observed status: `OBSERVED_PASS`.

Team Leader verdict: `ACCEPTED`. Scoped Keys capability recommendation was accepted as `SPIKE_PASS`.
Canonical capability state: Profiles = `SPIKE_PASS`; Scoped Keys = `SPIKE_PASS`; Publishing = `SPIKE_PENDING`.

## P1-T03-F01 — Malformed Scoped-Key Create Cleanup Recovery

Status: `ACCEPTED`

Automated deterministic suite: `tests/provider-spike/p1-t03-f01.test.ts`

| ID | Coverage | Result |
|---|---|---|
| F01-T01 | HTTP 201 missing `apiKey`: exact-name reconciliation, single exact match revoke, final malformed classification | PASS |
| F01-T02 | HTTP 201 missing provider key ID: exact-name reconciliation + revoke; raw key remains secret | PASS |
| F01-T03 | Missing raw key with trusted returned provider ID: direct revoke, no unnecessary list GET | PASS |
| F01-T04 | Malformed 201 + zero exact-name matches → `SCOPED_KEY_CLEANUP_UNCONFIRMED`; no POST retry | PASS |
| F01-T05 | Malformed 201 + multiple exact-name matches → ambiguous BLOCKED; no arbitrary DELETE | PASS |
| F01-T06 | Reconciled exact match missing provider ID → cleanup unconfirmed | PASS |
| F01-T07 | Reconciled exact-match DELETE failure → cleanup unconfirmed takes precedence | PASS |
| F01-T08 | Raw scoped-key and `keyPreview` sentinels absent from result/evidence/errors/serialization | PASS |
| F01-T09 | Every malformed-success path issues exactly one create POST | PASS |
| F01-T10 | Well-formed create path remains compatible; existing P1-T03 suite verified separately | PASS |
| Extra | Malformed reconciliation list body becomes `SCOPED_KEY_CLEANUP_UNCONFIRMED` | PASS |
| Extra | Failed reconciliation list request becomes `SCOPED_KEY_CLEANUP_UNCONFIRMED` | PASS |
| Extra | Known-ID scope mismatch is directly revoked | PASS |
| Extra | Known-ID Profile-scope mismatch is directly revoked | PASS |
| Extra | Known-ID permission mismatch is directly revoked | PASS |
| Extra | Known-ID missing expiry is directly revoked | PASS |
| Extra | Known-ID invalid/unparseable expiry is directly revoked | PASS |

Focused command: `npm test -- -t "P1-T03-F01 malformed scoped-key cleanup regressions"`.
Focused result: `17 passed / 0 failed`; unrelated tests skipped only by the name filter.

Parent P1-T03 command: `npm test -- -t "P1-T03 scoped API key isolation offline regressions"`.
Parent result: `27 passed / 0 failed`; all T03-01 through T03-22 plus five prior safety regressions remain green.

Full command: `npm test`.
Full result: `5` test files, `106 passed / 0 failed / 0 skipped`.

`npm run typecheck`: PASS.
`npm run build`: PASS.
`git diff --check`: PASS.

These are deterministic failure-recovery tests only. P1-T03-F01 intentionally performed zero real Zernio calls and created zero live scoped keys. Historical P1-T03 Provider Behavior evidence was preserved without repeating the live isolation run. Team Leader accepted P1-T03-F01; Scoped Keys is now `SPIKE_PASS`, while Publishing remains `SPIKE_PENDING`.

## P1-T04 — Zernio Publishing Behavior

Status: `IMPLEMENTED — AWAITING TEAM LEADER REVIEW`

### Deterministic harness/regression tests

Automated suite: `tests/provider-spike/p1-t04.test.ts`

| ID | Coverage | Result |
|---|---|---|
| T04-01 | Default execution offline; zero provider calls | PASS |
| T04-02 | Missing control-plane credential blocks before mutation | PASS |
| T04-03 | Missing expected identity blocks before mutation | PASS |
| T04-04 | Identity mismatch blocks before mutation | PASS |
| T04-05 | Missing frozen expected account blocks | PASS |
| T04-06 | Missing frozen expected Page blocks | PASS |
| T04-07 | Public-test authorization not true blocks | PASS |
| T04-08 | Temporary key is Profile-A-only read-write with bounded expiry | PASS |
| T04-09 | Temporary key secret never leaks | PASS |
| T04-10 | Account response _id normalized | PASS |
| T04-11 | profileId object normalized | PASS |
| T04-12 | Exact frozen account required | PASS |
| T04-13 | Exact Profile A required | PASS |
| T04-14 | Wrong Profile/account blocks as Critical before post create | PASS |
| T04-15 | Exact frozen Page required | PASS |
| T04-16 | No first/default Page fallback | PASS |
| T04-17 | Draft create validates provider post ID/state | PASS |
| T04-18 | Draft read-back validates exact target/content | PASS |
| T04-19 | Same body + same Idempotency-Key returns same logical post | PASS |
| T04-20 | Duplicate logical post classified Critical | PASS |
| T04-21 | Idempotency conflict/different-body failure is fail-closed | PASS |
| T04-22 | Draft cleanup confirmed | PASS |
| T04-23 | Scheduled create is >=48h in future | PASS |
| T04-24 | Schedule uses Africa/Cairo semantics | PASS |
| T04-25 | Scheduled read-back normalized schedule matches | PASS |
| T04-26 | Scheduled cleanup required before public test | PASS |
| T04-27 | Immediate public create happens at most once | PASS |
| T04-28 | Published response requires platform-level published state | PASS |
| T04-29 | Wrong target classified Critical | PASS |
| T04-30 | Published read-back matches exact post | PASS |
| T04-31 | Public cleanup executes | PASS |
| T04-32 | Public cleanup read-back required | PASS |
| T04-33 | Cleanup failure prevents PASS | PASS |
| T04-34 | Timeout/network/5xx preserve same logical Idempotency-Key | PASS |
| T04-35 | 429 has no automatic retry | PASS |
| T04-36 | Normal request ceiling enforced | PASS |
| T04-37 | Safety cleanup allowed after normal ceiling | PASS |
| T04-38 | Temporary publishing key revoked | PASS |
| T04-39 | Revoked key authentication fails | PASS |
| T04-40 | Existing P1-T01/P1-T02/P1-T03 regressions remain green | PASS |
| Extra | Uncertain 5xx create uses the same Idempotency-Key | PASS |
| Extra | Unhealthy account blocks before post mutation | PASS |
| Extra | Selected Page mismatch blocks with no fallback | PASS |
| Extra | Publishing-key cleanup failure prevents PASS | PASS |

Targeted command: `npm test -- -t "P1-T04 Zernio publishing offline regressions"`.
Targeted result: `44 passed / 0 failed`; unrelated tests skipped only by the name filter.

Full command: `npm test`.
Full result: `6` test files, `150 passed / 0 failed / 0 skipped`.

`npm run typecheck`: PASS.
`npm run build`: PASS.
`git diff --check`: PASS.

These are deterministic harness/failure-path tests and do not by themselves prove Zernio publishing behavior.

### Real Zernio Provider Behavior evidence

Provider Behavior evidence is intentionally separate from deterministic test results.

| Test | Provider behavior | Result | Safe evidence |
|---|---|---|---|
| P1-T04 identity | Trusted expected identity matched before mutation | PASS | run `d7aec8fa-dbfe-4480-b42f-47ec378edcbb`, HTTP 200, request `3c9a9146-69dd-4bb3-b2eb-a4bb86e46551` |
| Publishing key | Profile-A-only read-write key with 1-day expiry | PASS | key ID `6ac659b6cf071cd03e7e0d69`, HTTP 201, request `bbb3e152-6eec-4a67-9899-cf96ffbe8fb7` |
| Account target | Exact frozen Facebook account under Profile A | PASS | request `3d851e3f-262f-432d-a4ca-98d24f8d3649` |
| Page target | Exact Page `1387424501114639` selected/available | PASS | request `f0ce2164-727d-4d0e-87fa-c032bc58372f` |
| Account health | Healthy and canPost=true | PASS | request `5c56ace3-b5b8-4326-a60f-8a048a34eb5e` |
| Draft create/read/replay | Same logical post; duplicate NO | PASS | post `6ac659b8401610c088daa8ab`; requests `d3fca111-1d65-4cb5-b467-fd57ec4c3da4`, `eff0c870-3412-4bfc-a2de-93870abe84f1`, `77d4fa1e-026c-4f24-be8e-0152e3a81171` |
| Draft cleanup | Delete confirmed; read-back 404 | PASS | requests `27178f2f-361e-45a9-829f-9954476db8ce`, `ee78ed9e-77e6-401d-a5eb-8c96638ffbab` |
| Scheduled create/read | Cairo schedule normalized correctly | PASS | post `6ac659b932a50814b268fc05`; requests `9e233469-ff95-47da-a299-4913e79b8384`, `8ccfb627-f83d-4382-be42-8650852d55f8` |
| Scheduled cleanup | Delete confirmed; read-back 404 | PASS | requests `38cdacd4-e9fb-4b90-925f-90fe0e670ead`, `40c56c66-a356-49f9-ab5d-e9f2b575b3da` |
| Immediate public publish | Exactly one public Facebook text-only publication | PASS | post `6ac659ba401610c088daa8b2`, Facebook ID `1387424501114639_122100171927502015`, requests `f5e1ab58-c438-475a-b16e-6ad6241359e2`, `e12b0ec4-fc33-4627-b17b-5c8c21c51f99` |
| Public cleanup | Unpublish + read-back confirmed no longer published | PASS | requests `da04f7de-54b8-478e-b554-52ecab9cb03c`, `bb70fe87-e811-43df-b5de-b984e551d358` |
| Key cleanup | Key revoked; post-revoke auth HTTP 401 | PASS | requests `22837d9f-0579-42fa-8205-3a9a0511743f`, `db58dd21-f461-4a1f-a14d-6eca807cd949` |
| Request bound | One live run stayed within normal ceiling | PASS | 20 total calls <= 22 normal ceiling; cleanup allowance used 0 |

Wrong publishing target observed: `NO`.
Duplicate confirmed publish observed: `NO`.
Raw control/scoped key values and identity values are absent from tests/evidence/docs.

Publishing capability observed status: `OBSERVED_PASS`.
Publishing capability recommendation: `SPIKE_PASS`.
Known limitation: Core publishing lifecycle verified on Facebook text-only only. Instagram/media/platform-specific publishing remains separately unverified.
Canonical Publishing remains `SPIKE_PENDING` pending Team Leader acceptance.
## P1-T04-F01 — Exact Page Target Attestation and Emergency Cleanup Regressions

Status: `IMPLEMENTED — AWAITING TEAM LEADER RE-REVIEW`

Automated deterministic suite: `tests/provider-spike/p1-t04-f01.test.ts`

| ID | Deterministic coverage | Result |
|---|---|---|
| F01-T01 | Correct account + explicit wrong Page is Critical; cleanup executes | PASS |
| F01-T02 | Wrong Page appearing only on read-back is Critical | PASS |
| F01-T03 | Correct account + missing Page evidence is BLOCKED, never PASS | PASS |
| F01-T04 | Published immediate post can attest expected Page from strict platformPostId | PASS |
| F01-T05 | Wrong Page prefix in platformPostId is Critical | PASS |
| F01-T06 | Wrong Page prefix in strict Facebook public URL is Critical | PASS |
| F01-T07 | Draft missing Page attestation blocks scheduled/immediate stages | PASS |
| F01-T08 | Scheduled missing Page attestation blocks immediate stage | PASS |
| F01-T09 | Emergency draft DELETE 200 + still-active GET is cleanup-unconfirmed | PASS |
| F01-T10 | Emergency scheduled DELETE 200 + still-scheduled GET is cleanup-unconfirmed | PASS |
| F01-T11 | Emergency cleanup confirms DELETE + terminal GET/404 | PASS |
| F01-T12 | Cleanup DELETE + GET still execute after normal ceiling exhaustion | PASS |
| F01-T13 | Strengthened target/cleanup semantics preserve existing happy path | PASS |
| F01-T14 | Full historical suite remains green; validated by required full `npm test` | PASS |
| Extra | Deterministic fix result/evidence does not expose configured secrets | PASS |
| Extra | Alternate Page fallback is rejected while immediate provider state is still publishing | PASS |

Focused command: `npm test -- -t "P1-T04-F01 exact Page attestation and emergency cleanup regressions"`.
Focused result: `15 passed / 0 failed` (F01-T01 through F01-T13 plus two additional safety cases); unrelated tests skipped only by name filter. F01-T14 is the separate full-suite gate below.

Parent command: `npm test -- -t "P1-T04 Zernio publishing offline regressions"`.
Parent result: `44 passed / 0 failed`.

Full command: `npm test`.
Full result: `7` test files, `165 passed / 0 failed / 0 skipped`.

`npm run typecheck`: PASS.
`npm run build`: PASS.
`git diff --check`: PASS.

These are deterministic harness safety regressions only. P1-T04-F01 performed zero real Zernio calls and did not create or re-publish any live post, schedule, or scoped key. Historical P1-T04 real Provider Behavior evidence remains separate and preserved. Publishing remains `SPIKE_PENDING`.

## P1-T05 — Generic Webhook Delivery Contract

Status: `IMPLEMENTED — AWAITING TEAM LEADER REVIEW`.

### Deterministic receiver / harness tests

| ID | Coverage | Result |
|---|---|---|
| T05-01 | Default execution offline; zero provider calls | PASS |
| T05-02 | Missing control credential blocks before mutation | PASS |
| T05-03 | Missing trusted expected identity blocks | PASS |
| T05-04 | Identity mismatch blocks before webhook creation | PASS |
| T05-05 | Missing controlled HTTPS receiver blocks creation | PASS |
| T05-06 | Webhook body contains only Profile A | PASS |
| T05-07 | Webhook body subscribes only to post.scheduled | PASS |
| T05-08 | Webhook secret absent from output/evidence/errors | PASS |
| T05-09 | Unknown webhook create never blindly retried | PASS |
| T05-10 | Unknown create reconciles exact unique synthetic name | PASS |
| T05-11 | Duplicate exact-name webhook state blocks ambiguity | PASS |
| T05-12 | Broader Profile scope is Critical | PASS |
| T05-13 | Valid raw-body HMAC-SHA256 passes | PASS |
| T05-14 | Missing signature rejects | PASS |
| T05-15 | Wrong signature rejects | PASS |
| T05-16 | Wrong secret rejects | PASS |
| T05-17 | Modified raw body rejects | PASS |
| T05-18 | Malformed signature rejects safely | PASS |
| T05-19 | JSON parse occurs only after signature acceptance | PASS |
| T05-20 | payload.id must equal X-Zernio-Event-Id | PASS |
| T05-21 | X-Zernio-Event must equal parsed event | PASS |
| T05-22 | Duplicate canonical event ID => unique logical count 1 | PASS |
| T05-23 | Retry keeps canonical event ID | PASS |
| T05-24 | Foreign Profile payload becomes Critical | PASS |
| T05-25 | Missing Profile attribution blocks safe routing | PASS |
| T05-26 | First matching real delivery returns 500 exactly once | PASS |
| T05-27 | Second same-event delivery returns 204 | PASS |
| T05-28 | No third intentional failure | PASS |
| T05-29 | Logs parser handles attemptNumber 1/2 | PASS |
| T05-30 | Deterministic receiver ack under 5 seconds | PASS |
| T05-31 | Scheduled trigger uses exact Profile/account/Page | PASS |
| T05-32 | Scheduled post cleanup requires DELETE + read-back | PASS |
| T05-33 | Temporary publishing key revoke + invalid after revoke | PASS |
| T05-34 | Webhook cleanup verified | PASS |
| T05-35 | Normal ceiling blocks non-cleanup excess | PASS |
| T05-36 | Cleanup works after normal ceiling exhaustion | PASS |
| T05-37 | Cleanup allowance cannot create webhook/post/key | PASS |
| T05-38 | Existing P1-T01 through P1-T04 suites remain compatible | PASS |
| Extra | webhook.test one-shot delivery count enforcement | PASS |
| Extra | retry absence yields bounded blocker | PASS |
| Extra | event ID change across retry fails | PASS |
| Extra | incomplete delivery logs block certification | PASS |
| Extra | ambiguous publishing-key create reconciles/revokes without retry | PASS |
| Extra | malformed publishing-key create missing ID reconciles/revokes | PASS |
| Extra | exact public HTTPS receiver readiness probe waits for receiver HTTP 401 | PASS |
| Extra | exact public HTTPS receiver readiness probe fails closed when unreachable | PASS |

Focused command: `npm test -- -t "P1-T05 Zernio webhook delivery contract offline regressions"`.
Final focused result: `46 passed / 0 failed`; unrelated tests skipped only by the name filter.

Full command: `npm test`.
Final full result: `8` test files, `211 passed / 0 failed / 0 skipped`.

`npm run typecheck`: PASS.
`npm run build`: PASS.
`git diff --check`: PASS.

These deterministic tests prove receiver/harness behavior only. They do not substitute for real Provider Behavior evidence.

### Real Zernio Provider Behavior tests

| Test | Actual observed behavior | Result | Safe evidence |
|---|---|---|---|
| Trusted identity | Independently trusted identity matched before mutation | PASS | run `4246fa47-05a9-4749-be46-263d900ed416`, HTTP 200, request `c9b21a9c-b437-41bc-93f7-769192033d1b` |
| Webhook create | One active Profile-A-only webhook subscribed only to post.scheduled | PASS | webhook `6ac68919c5da8c7698cc9e83`, request `b6c52985-4a06-4610-98f4-739ba0958d2b` |
| Webhook read-back | Exact webhook/provider ID/name/URL/event/Profile scope observed | PASS | request `e71cfe67-bc65-4dbe-b268-ababbca3bbc0` |
| webhook.test | Provider returned 5xx; receiver observed zero inbound deliveries | BLOCKED | no live signature/event-ID evidence obtained |
| Raw-body HMAC | No inbound test event reached receiver | NOT VERIFIED | deterministic verification PASS only |
| Header/body event ID | No inbound test event reached receiver | NOT VERIFIED | deterministic verification PASS only |
| Real post.scheduled trigger | Not attempted after webhook.test blocker | NOT RUN | zero scheduled posts created |
| Automatic retry / stable event ID | No real trigger created | NOT VERIFIED | no attempt 1/2 evidence |
| Delivery logs attempt 1/2 | No real retry event created | NOT VERIFIED | no certification claim |
| Webhook cleanup | Delete + read-back confirmed synthetic webhook absent | PASS | requests `ba0732b9-8f17-4d86-9d3c-204bc7bb8d45`, `db1757db-cf8f-439f-8c73-999e16a2724c` |
| Receiver cleanup | Tunnel/receiver stopped and temporary local execution artifacts removed | PASS | no cloudflared process / temp binary / copied .env remains |
| Request bound | Single live run stopped safely | PASS | 4 normal + 2 cleanup = 6 Zernio calls; 0 inbound deliveries |

Real Provider Behavior result: **BLOCKED** at `webhook.test`; the Provider Behavior PASS criteria for signature/retry/event identity/logs are not satisfied.

Webhook delivery contract recommendation: **REMAIN PENDING — FIX/BLOCKER REQUIRED**.

Canonical webhook-related capabilities remain `SPIKE_PENDING`; Analytics Webhook remains `SPIKE_PENDING`.

## P1-T05-F01 — webhook.test Failure Diagnostics and Exact-URL Readiness

Status: `IMPLEMENTED — AWAITING TEAM LEADER RE-REVIEW`.

### Focused deterministic regressions

| ID | Coverage | Result |
|---|---|---|
| F01-T01 | webhook.test provider failure queries logs before webhook deletion/read-back | PASS |
| F01-T02 | webhook.test failure never performs a second test POST | PASS |
| F01-T03 | Failure log query is scoped to temporary webhook/test event and ignores unrelated logs | PASS |
| F01-T04 | Endpoint non-2xx delivery log evidence retained as sanitized diagnostics | PASS |
| F01-T05 | Connection/timeout evidence => WEBHOOK_TEST_DELIVERY_PATH_UNRESOLVED | PASS |
| F01-T06 | No matching delivery-log entry => WEBHOOK_TEST_DELIVERY_PATH_UNRESOLVED | PASS |
| F01-T07 | Failure-log API unavailable => WEBHOOK_TEST_FAILURE_DIAGNOSTICS_UNAVAILABLE | PASS |
| F01-T08 | Webhook cleanup + read-back still run after diagnostic collection | PASS |
| F01-T09 | Webhook secret/control key/expected identity absent from diagnostic result/evidence/errors | PASS |
| F01-T10 | Exact final HTTPS readiness passes before provider callback executes | PASS |
| F01-T11 | Failed exact-URL readiness invokes zero provider callbacks | PASS |
| F01-T12 | Existing accepted P1-T05 regression inventory remains 46 tests | PASS |
| F01-T13 | Full-suite gate remains unfiltered npm test | PASS |

Focused command: `npm test -- -t "P1-T05-F01 webhook.test failure diagnostics regressions"`.
Focused result: `13 passed / 0 failed`.

Existing P1-T05 command: `npm test -- -t "P1-T05 Zernio webhook delivery contract offline regressions"`.
Existing P1-T05 result: `46 passed / 0 failed`.

Full command: `npm test`.
Full result: `9` test files, `224 passed / 0 failed / 0 skipped`.

`npm run typecheck`: PASS.
`npm run build`: PASS.
`git diff --check`: PASS.

These are deterministic harness/failure-path results and are separate from live Provider Behavior evidence.

### P1-T05-F01 authorized live rerun #2

| Test | Actual observed behavior | Result | Safe evidence |
|---|---|---|---|
| Exact final HTTPS readiness | Required receiver HTTP 401 was not obtained within bounded gate | BLOCKED | `CONTROLLED_WEBHOOK_TEST_RECEIVER_NOT_AVAILABLE` |
| Provider calls before readiness | Provider callback was never invoked | PASS | 0 Zernio calls |
| Trusted identity | Not reached after readiness failure | NOT RUN | 0 calls |
| Temporary webhook | Not created | NOT RUN | 0 mutations |
| webhook.test | Not called | NOT RUN | diagnostic failure-log flow not applicable to this rerun |
| Scheduled retry trigger | Not created | NOT RUN | no key/post created |
| Real delivery attempt 1/2 | No event generated | NOT RUN | 0 inbound deliveries |
| Provider attempt logs 1/2 | No event/test call existed | NOT RUN | no log claim |
| Provider cleanup | No provider resources created | N/A | none required |
| Receiver/tunnel cleanup | Local execution artifacts removed; zero cloudflared processes remain | PASS | local cleanup confirmed |
| F01 rerun bound | Exactly one additional live invocation performed; no third run | PASS | one `--live` rerun only |

The failure-path runner does not persist the ephemeral exact URL or individual non-401 readiness statuses when readiness fails. Those values are therefore unavailable and are not invented.

Provider Behavior result for rerun #2: **BLOCKED before first Zernio API call**.
Webhook delivery contract recommendation: **REMAIN PENDING — FIX/BLOCKER REQUIRED**.
Canonical webhook-related capabilities remain `SPIKE_PENDING`; Analytics Webhook remains `SPIKE_PENDING`.


## P1-T05-F02 — VPS HTTPS Receiver Readiness

Status: `IMPLEMENTED — AWAITING TEAM LEADER RE-REVIEW`.

### Deterministic tests

| ID | Coverage | Result |
|---|---|---|
| F02-T01 | VPS readiness confirmation must pass before provider callback executes | PASS |
| F02-T02 | Exact receiver HTTP 401 + receiver marker + confirmation allows provider execution | PASS |
| F02-T03 | HTTP 404 readiness blocks with zero provider callback | PASS |
| F02-T04 | HTTP 502/503 readiness blocks with zero provider callback | PASS |
| F02-T05 | Redirected readiness cannot count as exact endpoint PASS | PASS |
| F02-T06 | TLS/network readiness failure blocks with zero provider callback | PASS |
| F02-T07 | HTTP 401 from wrong handler cannot PASS | PASS |
| F02-T08 | F02 live source has no Railway/Quick-Tunnel/temporary-hosting dependency | PASS |
| F02-T09 | webhook.test remains maximum one POST | PASS |
| F02-T10 | Existing P1-T05-F01 diagnostics remain green | PASS |
| F02-T11 | Existing parent P1-T05 suite remains green | PASS |
| F02-T12 | Full historical suite gate remains unfiltered npm test | PASS |

Focused F02 command: `npm test -- tests/provider-spike/p1-t05-f02.test.ts`.
Focused F02 result: `12 passed / 0 failed`.

Focused F01 command: `npm test -- tests/provider-spike/p1-t05-f01.test.ts`.
Focused F01 result: `13 passed / 0 failed`.

Parent P1-T05 command: `npm test -- tests/provider-spike/p1-t05.test.ts`.
Parent P1-T05 result: `46 passed / 0 failed`.

Full command: `npm test`.
Full result: `10` test files, `236 passed / 0 failed / 0 skipped`.

`npm run typecheck`: PASS.
`npm run build`: PASS.
`git diff --check`: PASS.

### Real Provider Behavior / VPS readiness + authorized invocation

| Test | Actual observed behavior | Result | Safe evidence |
|---|---|---|---|
| Project VPS control path | Dedicated AI Marketing Manager VPS and hostname were prepared without using other-project infrastructure | PASS | `marketlyai.restartorg.com` → `82.29.177.121`; dedicated Nginx route |
| Trusted TLS + exact path readiness | Exact HTTPS path reached the controlled receiver with trusted TLS, HTTP 401, marker match, same-process confirmation, and no redirect | PASS | latency `1249 ms`; timestamp `2026-10-12T18:22:19.109Z` |
| F02 live invocation bound | Exactly one separately authorized F02 live invocation was started after readiness PASS | PASS | no second F02 invocation performed |
| Provider credential gate | Current F02 working clone lacked the two required Zernio env variable names, so execution failed closed before provider transport | BLOCKED | `MISSING_LIVE_CREDENTIAL`; secret values not read/exposed |
| Zernio request count | Provider transport was never reached | PASS | `0 normal / 0 cleanup / 0 total` Zernio calls |
| Trusted identity preflight | Not reached because the credential gate blocked before request 1 | NOT RUN | 0 provider requests |
| Temporary webhook/key/post | None created | NOT RUN | 0 provider mutations |
| webhook.test / retry attempts / logs | Not reached | NOT RUN | 0 inbound provider deliveries |
| Cleanup | Receiver/tunnel stopped; temporary route cleanup completed; dedicated port 18085 confirmed clear | PASS | provider cleanup N/A because no provider artifact existed |

F02 Provider Behavior result: **BLOCKED after VPS readiness PASS but before the first Zernio API call** — `MISSING_LIVE_CREDENTIAL`.

The earlier Oracle/TIA VPS-candidate note is superseded and invalid as project evidence. No other-project infrastructure or credential is part of this F02 result.

Webhook delivery contract recommendation: **REMAIN PENDING — FIX/BLOCKER REQUIRED**.
Canonical webhook-related capabilities remain `SPIKE_PENDING`; Analytics Webhook remains `SPIKE_PENDING`.
## P1-T05-F03 — Final Authorized Live Verification

Status: `DONE / ACCEPTED`.

Team Leader verdict: `ACCEPTED WITH NON-BLOCKING NOTES`.
Accepted F03 evidence/review HEAD: `23a09352b977853178cccb432893f542d6c3d2e3`.

Deterministic gates before live execution: F02 `12/12`, F01 `13/13`, parent P1-T05 `46/46`, full suite `236/236`, typecheck PASS, build PASS, diff-check PASS.

| Test | Result | Evidence |
|---|---|---|
| Controlled HTTPS receiver readiness | PASS | gated provider stage reached same project receiver |
| Trusted identity | PASS | HTTP 200; run `d7b58414-24f0-4582-a991-5ba8bd4388c4` |
| Profile-A webhook scope/read-back | PASS | webhook `6acda866ce92dc3eec124667` |
| `webhook.test` signed delivery | PASS | HTTP 204; event `c6354814-7742-44f9-b7db-a4d43e0cb522` |
| Real attempt 1 | PASS | same F03 event; intentional HTTP 500 |
| Automatic retry | PASS | same event ID/body about 10.959 s later; duplicate HTTP 204 |
| Cross-Profile observation | PASS | no foreign Profile delivery |
| Provider delivery-log validation | BLOCKED | `WEBHOOK_LOGS_INCOMPLETE`; `logs=null` |
| Scheduled trigger remained non-public | PASS | create/read scheduled; no publication |
| Post/key/webhook cleanup | PASS | all temporary provider artifacts confirmed cleaned |
| Request bounds | PASS | 11 normal / 6 cleanup / 17 total |
| F03 invocation bound | PASS | exactly one live invocation; no rerun |

Observed F03 harness result: **BLOCKED — WEBHOOK_LOGS_INCOMPLETE**. Delivery/retry behavior was observed directly and accepted; provider-log correlation/timing remains unverified and is a non-blocking provider-observability limitation.

Known limitation: `Zernio /v1/webhooks/logs delivery-attempt correlation/timing remains unverified; F03's single bounded query returned insufficient evidence. Direct receiver evidence independently proved delivery and retry behavior.`

P1-T05 canonical status: **DONE / ACCEPTED**.
Earlier `SPIKE_PENDING` recommendations in historical P1-T05/F01/F02 sections are preserved as point-in-time evidence and are superseded by this final acceptance.
Generic Webhook Delivery Contract: **`SPIKE_PASS`**.
Analytics Webhook: **`SPIKE_PENDING`**.
P1-T06: **`NOT_STARTED`**.

## P1-T06 — Analytics Bootstrap & Cursor

Status: `DONE / ACCEPTED WITH NON-BLOCKING NOTES`.

Accepted implementation HEAD: `513e9505de115d5a39f30964d2d5aca7594ef708`.

### Deterministic regressions

| ID | Coverage | Result |
|---|---|---|
| T06-01 | Default execution is offline | PASS |
| T06-02 | Missing control credential blocks before mutation | PASS |
| T06-03 | Trusted identity mismatch blocks key creation | PASS |
| T06-04 | Temporary key is Profile-A-only read-only | PASS |
| T06-05 | Temporary key secret never leaks | PASS |
| T06-06 | Exact expected account is required | PASS |
| T06-07 | Initial delta capture occurs before baseline | PASS |
| T06-08 | Baseline uses exact Profile/account/platform/source filters | PASS |
| T06-09 | Baseline pagination is bounded to 4 pages | PASS |
| T06-10 | Foreign account/Profile result is Critical | PASS |
| T06-11 | Delta consumes original pre-baseline cursor | PASS |
| T06-12 | hasMore advances only with provider nextCursor | PASS |
| T06-13 | Delta pagination is bounded to 5 pages | PASS |
| T06-14 | Cursor remains opaque; safe fingerprint only | PASS |
| T06-15 | Invalid cursor classified with exactly one request/no retry | PASS |
| T06-16 | Invalid cursor not mislabeled expired | PASS |
| T06-17 | Empty analytics distinguished from unavailable analytics | PASS |
| T06-18 | Natural 429 evidence observable with no auto retry | PASS |
| T06-19 | N+1 request blocked pre-transport; cleanup allowance preserved | PASS |
| T06-20 | Key revoke + rejected post-revoke auth required | PASS |

Focused result: `20 / 20 PASS`. Affected provider-spike suites: `194 / 194 PASS`. Full suite: `256 / 256 PASS`. Typecheck/build/diff-check: PASS.

### Live Provider Behavior

| Test | Result | Safe evidence |
|---|---|---|
| Trusted identity | PASS | HTTP 200; run `5c079041-8da4-4d28-8998-5f7c0ef30d18`; request `e1a6e31f-7227-4228-8821-cadc221f4c52` |
| Profile-A read-only scoped key | PASS | Profile A only; permission read; bounded expiry |
| Exact Facebook account target | PASS | account `6ac64f8740364f4695dd3077`; foreign target NO |
| Initial cursor before baseline | PASS | HTTP 200; data 0; nextCursor present; hasMore false |
| Baseline page 1 | PASS | HTTP 200; records 0; total 0/pages 1 |
| Baseline page 2 explicit probe | PASS | HTTP 200; records 0 |
| Empty vs unavailable | PASS | valid empty baseline with `hasAnalyticsAccess=true` |
| Delta from original cursor | PASS | HTTP 200; original cursor used; items 0; hasMore false |
| Changes during import | NOT OBSERVED | `CHANGES_DURING_IMPORT_NOT_OBSERVED` |
| Invalid cursor | PASS | exactly one HTTP 400; `invalid_field_value`; no retry |
| Expired cursor | UNVERIFIED | `EXPIRED_CURSOR_BEHAVIOR_UNVERIFIED` |
| Cross-Profile/account leakage | PASS | none observed |
| Natural rate headers | PASS | account limit 60; analytics limit 6 |
| Natural HTTP 429 | NOT OBSERVED | no forced rate-limit test |
| Key cleanup | PASS | revoke 200; post-revoke auth 401 |
| Request bounds | PASS | 8 normal / 2 cleanup / 10 total |
| Public/social mutation | PASS | 0 posts/media/Ads/comments/DMs |

Team Leader verdict: **ACCEPTED WITH NON-BLOCKING NOTES**.

Analytics Bootstrap & Cursor Contract: **`SPIKE_PASS`**.
Historical Analytics: **`SPIKE_PENDING`**.
Analytics Delta: **`SPIKE_PENDING`**.
Best Times: **`SPIKE_PENDING`**.
Performance Decay: **`SPIKE_PENDING`**.
Frequency Analysis: **`SPIKE_PENDING`**.
Analytics Webhook: **`SPIKE_PENDING`**.

Non-blocking unresolved Provider behaviors remain: `EXPIRED_CURSOR_BEHAVIOR_UNVERIFIED`; `CHANGES_DURING_IMPORT_NOT_OBSERVED`; non-empty Analytics Delta pagination not observed live; historical metric-record field shapes not observed because the valid baseline was empty; natural HTTP 429 not observed. No unresolved item is converted into a Provider fact.

## P1-T07 - Derived Analytics Signals

Status: `DONE / ACCEPTED WITH NON-BLOCKING NOTES`.

Automated deterministic suite: `tests/provider-spike/p1-t07.test.ts`.

| ID | Coverage | Result |
|---|---|---|
| T07-01 | Default execution is offline | PASS |
| T07-02 | Missing credential blocks before mutation | PASS |
| T07-03 | Trusted identity mismatch blocks temporary-key creation | PASS |
| T07-04 | Temporary key is Profile-A-only and read-only | PASS |
| T07-05 | Control/scoped key and trusted identity secrets never appear in result/evidence | PASS |
| T07-06 | Exact expected account/platform is required | PASS |
| T07-07 | Foreign Profile/account is Critical | PASS |
| T07-08 | Undocumented/missing Best Times capability is not guessed | PASS |
| T07-09 | Best Times insufficient-data behavior is distinct from unsupported | PASS |
| T07-10 | Best Times non-empty target attribution is validated | PASS |
| T07-11 | Performance Decay insufficient-data behavior is preserved | PASS |
| T07-12 | Performance Decay formulas are not invented | PASS |
| T07-13 | Frequency Analysis insufficient-data behavior is preserved | PASS |
| T07-14 | Frequency signal is not converted into a causal/optimal claim | PASS |
| T07-15 | Entitlement unavailable is distinct from empty data | PASS |
| T07-16 | Naturally observed 429 is captured with no automatic retry | PASS |
| T07-17 | Normal request ceiling blocks N+1 before transport | PASS |
| T07-18 | Temporary key revoke + post-revoke rejection is required | PASS |
| Extra | Exact documented Profile/account/platform/source filters used for all three signals | PASS |
| Extra | Explicit foreign account in non-empty signal becomes Critical | PASS |
| Extra | Malformed derived-signal response blocks without invented semantics | PASS |
| Extra | Cleanup uncertainty overrides an otherwise valid run | PASS |

Pre-live validation results:
- focused command: `npm test -- tests/provider-spike/p1-t07.test.ts` -> `22 passed / 0 failed`;
- affected command: `npm test -- tests/provider-spike/harness.test.ts tests/provider-spike/p1-t02.test.ts tests/provider-spike/p1-t02-f01.test.ts tests/provider-spike/p1-t03.test.ts tests/provider-spike/p1-t03-f01.test.ts tests/provider-spike/p1-t04.test.ts tests/provider-spike/p1-t06.test.ts tests/provider-spike/p1-t07.test.ts` -> `192 passed / 0 failed` across 8 files;
- full command: `npm test` -> `278 passed / 0 failed / 0 skipped` across 12 files;
- `npm run typecheck`: PASS;
- `npm run build`: PASS;
- `git diff --check`: PASS.

### Live Provider Behavior

| Test | Result | Safe evidence |
|---|---|---|
| Trusted identity | PASS | HTTP 200; run `1f26a94e-88e9-466f-a163-68732dc771f5`; request `a56dad53-3511-4914-89a3-4bb2fe6eca2a` |
| Profile-A read-only scoped key | PASS | Profile A only; `permission=read`; one-day bounded expiry; secret not exposed |
| Exact target preflight | PASS | Profile `6ac5a45a8e4ca44f355033ae`; account `6ac64f8740364f4695dd3077`; facebook; foreign target NO |
| Best Times documented endpoint | PASS | `GET /v1/analytics/best-time` identified before live; exact filters used |
| Best Times live read | PASS - EMPTY SIGNAL CONTAINER | HTTP 200; request `eb60dff1-3848-4cb8-b563-205a750f661d`; `slots=[]`; internal `SUCCESS_INSUFFICIENT_DATA` classification does not assert a Provider threshold/cause |
| Performance Decay documented endpoint | PASS | `GET /v1/analytics/content-decay` identified before live; exact filters used |
| Performance Decay live read | PASS - EMPTY SIGNAL CONTAINER | HTTP 200; request `e69b12ec-c5ea-49d7-a7cf-37c5513f6148`; `buckets=[]`; internal `SUCCESS_INSUFFICIENT_DATA` classification does not assert a Provider threshold/cause |
| Frequency Analysis documented endpoint | PASS | `GET /v1/analytics/posting-frequency` identified before live; exact filters used |
| Frequency Analysis live read | PASS - EMPTY SIGNAL CONTAINER | HTTP 200; request `d8567070-2cc7-4065-8f7d-e0e8e7059357`; `frequency=[]`; internal `SUCCESS_INSUFFICIENT_DATA` classification does not assert a Provider threshold/cause |
| Cross-Profile/account leakage | PASS | none observed |
| Natural rate headers | PASS | account limit 60; derived Analytics limit 6 |
| Natural HTTP 429 | NOT OBSERVED | no forced 429; no automatic retry |
| Key cleanup | PASS | revoke 200; post-revoke auth 401 |
| Request bounds | PASS | 6 normal / 2 cleanup / 8 total <= 16 + 4 |
| Social/public mutation | PASS | 0 posts/media/Ads/comments/DMs/webhooks |
| Live invocation bound | PASS | exactly one P1-T07 live run; no rerun |

Team Leader verdict: **ACCEPTED WITH NON-BLOCKING NOTES**.
Accepted implementation HEAD: `a2ed6f4e37f1919784a00cce1449a5889f8bf5d8`.

Canonical capability states remain:
- Best Times: `SPIKE_PENDING`;
- Performance Decay: `SPIKE_PENDING`;
- Frequency Analysis: `SPIKE_PENDING`;
- Historical Analytics: `SPIKE_PENDING`;
- Analytics Delta: `SPIKE_PENDING`;
- Analytics Webhook: `SPIKE_PENDING`.

Non-empty live record/value shapes and explicit target-attribution fields on non-empty signals remain `UNVERIFIED`; minimum sample/data thresholds remain `UNVERIFIED`; formulas / weighting / confidence methods / detailed calculation semantics remain `PROVIDER_OPAQUE / UNVERIFIED`; natural HTTP 429 remains `NOT OBSERVED`. P1-T06 unresolved behaviors remain unchanged: `EXPIRED_CURSOR_BEHAVIOR_UNVERIFIED`; `CHANGES_DURING_IMPORT_NOT_OBSERVED`; non-empty Analytics Delta pagination not observed live; historical metric-record field shapes not observed because the valid baseline was empty; natural HTTP 429 not observed.
## P1-T08 - analytics.synced Webhook Behavior

Status: `IMPLEMENTED — AWAITING TEAM LEADER RE-REVIEW`.

Automated deterministic suite: `tests/provider-spike/p1-t08.test.ts`.

| ID | Coverage | Result |
|---|---|---|
| T08-01 | Default execution is offline | PASS |
| T08-02 | Missing control credential blocks before mutation | PASS |
| T08-03 | Trusted identity mismatch blocks webhook creation | PASS |
| T08-04 | VPS exact URL readiness gates Provider mutation | PASS |
| T08-05 | Webhook contains Profile A only | PASS |
| T08-06 | Webhook contains analytics.synced only | PASS |
| T08-07 | Broader Profile scope is Critical | PASS |
| T08-08 | Broader event scope cannot PASS | PASS |
| T08-09 | Raw-body signature verified before JSON parse | PASS |
| T08-10 | Missing/wrong signature rejected | PASS |
| T08-11 | payload.id must equal X-Zernio-Event-Id | PASS |
| T08-12 | Event header/body must equal analytics.synced | PASS |
| T08-13 | Explicit foreign Profile/account is Critical | PASS |
| T08-14 | Missing required target attribution blocks certification | PASS |
| T08-15 | Naturally duplicated canonical event ID remains one logical event | PASS |
| T08-16 | Valid Analytics event returns HTTP 204 under receiver timeout | PASS |
| T08-17 | Request ceiling blocks N+1 before transport | PASS |
| T08-18 | Webhook cleanup requires DELETE + absent read-back | PASS |
| T08-19 | Webhook secret/control credentials never leak | PASS |
| T08-20 | No Provider polling occurs during passive observation | PASS |
| Extra | Current documentation contract stored as DOC_CONFIRMED separately from live evidence | PASS |
| Extra | Additive metrics/cursor fields are recorded as contract drift, not silently rejected/trusted | PASS |
| Extra | Valid live-shape fixture recommends SPIKE_PASS without canonical promotion | PASS |
| Extra | No-event fixture is non-critical and recommends pending | PASS |

Final deterministic gates before the live infrastructure blocker:
- `npm test -- tests/provider-spike/p1-t08.test.ts` -> `24 passed / 0 failed`;
- affected Provider-spike command covering harness, P1-T02/F01, P1-T05/F01/F02, P1-T06, P1-T07, P1-T08 -> `199 passed / 0 failed` across 9 files;
- `npm test` -> `302 passed / 0 failed / 0 skipped` across 13 files;
- `npm run typecheck` -> PASS;
- `npm run build` -> PASS;
- `git diff --check` -> PASS.

### Historical initial Live Provider Behavior gate
| Test | Result | Safe evidence |
|---|---|---|
| Project VPS TCP/22 reachability | PASS | `82.29.177.121:22` reachable |
| Candidate local receiver port 18086 | PASS | clear before attempted setup |
| Non-interactive project SSH authentication in current execution context | BLOCKED | project key could not authenticate non-interactively; no secret extraction attempted |
| Temporary dedicated Nginx route | NOT RUN | no safe SSH control path available |
| SSH reverse tunnel | NOT RUN | no safe SSH control path available |
| Exact final HTTPS readiness | NOT RUN | route/tunnel not established |
| P1-T08 live Provider invocation | NOT RUN | authorization intentionally not consumed on an unprepared receiver path |
| Zernio API calls | PASS / zero side effects | `0 normal / 0 cleanup / 0 total` |
| Temporary webhook | NOT CREATED | 0 webhook mutations |
| analytics.synced passive observation | NOT RUN | no webhook existed |
| Public/social/Ads/media/community/native-automation mutation | PASS / zero | 0 |

### P1-T08-F01 resumed readiness gate
| Test | Result | Safe evidence |
|---|---|---|
| Human project SSH preflight | PASS | existing authorized credential; BatchMode + IdentitiesOnly; harmless marker returned; no secret exposure |
| Human-assisted local receiver | PASS | controlled receiver active on port `18086` before readiness |
| Human-assisted reverse tunnel | PASS | accepted P1-T05 topology active before readiness |
| Temporary P1-T08 Nginx route | PASS / temporary | one narrow route active before readiness |
| Pre-Provider focused P1-T08 suite | PASS | `24 / 24` |
| Pre-Provider affected suites | PASS | `199 / 199` across 9 files |
| Pre-Provider full suite | PASS | `302 / 302` across 13 files |
| Typecheck / build / diff-check | PASS | all green |
| Exact HTTPS target | INFO | `https://marketlyai.restartorg.com/p1-t08-f01/analytics-synced` |
| Trusted TLS / network readiness | FAIL | `VPS_READINESS_TLS_OR_NETWORK_FAILURE`; TLS success false |
| Readiness latency | INFO | `378 ms` |
| Unsigned exact-path HTTP 401 | NOT REACHED | no HTTP status returned |
| Receiver marker / same-process confirmation | NOT CONFIRMED | readiness stopped at TLS/network failure |
| Redirect | NOT OBSERVED | HTTP layer not reached |
| P1-T08 F01 Provider invocation | NOT RUN | first Zernio request never occurred; single live run remains unconsumed |
| Zernio API calls | PASS / zero side effects | `0 normal / 0 cleanup / 0 total` |
| Temporary webhook | NOT CREATED | 0 webhook mutations |
| analytics.synced passive observation | NOT RUN | observation window not started |
| Local receiver cleanup | PASS | receiver stopped; local port `18086` clear; no P1-T08 Node process |
| VPS route/tunnel cleanup | PASS / human-confirmed | human operator confirmed rollback after interactive sudo path |
| Public/social/Ads/media/community/native-automation mutation | PASS / zero | 0 |

Analytics Webhook recommendation: **REMAIN PENDING - FIX/BLOCKER REQUIRED**.
Analytics Webhook canonical state remains `SPIKE_PENDING`.
Other pending Analytics capabilities and all P1-T06/P1-T07 unresolved behavior remain unchanged.
## P1-T08-F02 — Public HTTPS Readiness

Status: `DONE / ACCEPTED`.
Accepted evidence HEAD: `5856591832093ea62a1dbf703cede7cad34e1bfb`.
Infrastructure Readiness: `PROVEN`.
This section records infrastructure/readiness evidence only; it does not establish Provider Behavior.

| Gate | Result | Safe evidence |
|---|---|---|
| Public DNS | PASS | A `82.29.177.121`, TTL `14400`; no effective AAAA/CNAME |
| TCP 443 | PASS | `82.29.177.121:443` reachable |
| Initial TLS diagnosis | FAIL / DIAGNOSED | clinic cert served; hostname mismatch + expired |
| Precise root cause | PASS / PROVEN | `NGINX_HTTPS_VHOST_MISCONFIGURED` |
| Permanent marketlyai vhost repair | PASS | enabled existing-hostname vhost; base HTTPS `404` |
| Trusted TLS after repair | PASS | CN/SAN marketlyai; Let's Encrypt YR2; valid 2026-10-13 to 2027-01-11 |
| Local receiver | PASS | `127.0.0.1:18086`; exact path; `401`; marker + confirmation |
| Reverse tunnel | PASS | VPS loopback reached same receiver; counters `2/2/0` |
| Temporary exact Nginx route | PASS | exact F02 path only; `nginx -t` PASS |
| VPS-local HTTPS isolation | PASS | trusted TLS; `401`; marker + confirmation; counters `3/3/0` |
| External exact readiness | PASS | TLS=true; HTTP `401`; marker=true; confirmation=true; redirect=false; `1145 ms` |
| Final same-process state | PASS | counters `4/4`; deliveries `0` |
| Temporary route cleanup | PASS / human-confirmed | F02 route removed; permanent vhost/TLS retained |
| Reverse tunnel cleanup | PASS / human-confirmed | tunnel stopped |
| Local receiver cleanup | PASS | `PORT_18086_CLEAR`; `NO_F02_NODE_PROCESS` |
| Zernio calls | PASS / zero | `0 normal / 0 cleanup / 0 total` |
| Provider live run | PASS / unconsumed | no Provider execution in F02 |

P1-T08-F02 recommendation: **INFRASTRUCTURE READINESS PROVEN**.
P1-T08-F02 canonical state: **DONE / ACCEPTED**.
Analytics Webhook canonical state remains `SPIKE_PENDING`.
Parent P1-T08 remains unresolved because no live `analytics.synced` Provider delivery has yet been verified. Provider live run remains **UNCONSUMED**.
## P1-T08-F03 — Live analytics.synced Provider Verification

Status: `IMPLEMENTED — AWAITING TEAM LEADER RE-REVIEW`.
Canonical Analytics Webhook remains `SPIKE_PENDING`.

| Gate / Evidence | Result | Safe evidence |
|---|---|---|
| Approved starting HEAD | PASS | `747e78d365a7cc842089c5713295a6a1944e5cad` |
| Permanent DNS/TCP/TLS sanity | PASS | marketlyai -> `82.29.177.121`; TCP/443; trusted marketlyai cert; no clinic regression |
| Focused P1-T08 pre-run | PASS | `24 / 24` |
| Affected Provider-spike pre-run | PASS | `199 / 199` across 9 files |
| Full pre-run suite | PASS | `302 / 302` across 13 files |
| Typecheck / build / diff-check pre-run | PASS | all PASS |
| Temporary F03 route/tunnel | PASS | exact `/p1-t08-f03/analytics-synced`; tunnel listener established |
| Runner exact readiness | PASS | TLS=true; HTTP `401`; marker=true; same-process=true; redirect=false; `887 ms` |
| F03 live run | CONSUMED | first Provider request sent during identity preflight |
| Trusted identity | PASS | HTTP `200`; exact match; request `a4d4a31c-bb9f-469e-a330-8a8a43c038be`; `616 ms` |
| Webhook create | BLOCKED | exactly one POST; HTTP `400`; request `211cf0c8-6751-4fbb-8e86-5475770e9ca8` |
| Webhook created | NO | no webhook ID; `webhook=null` |
| Root cause | IMPLEMENTATION DEFECT | `HARNESS_WEBHOOK_NAME_LENGTH_EXCEEDS_PROVIDER_LIMIT`: 29-char prefix + 24-char run tag = 53 > Provider max 50 |
| Webhook read-back | NOT RUN | create failed before webhook existed |
| Passive observation | NOT RUN | subscription was not created |
| analytics.synced observed | NO | observation never started |
| Provider cleanup | NOT APPLICABLE | no webhook created/identified; `0` cleanup calls |
| Provider calls | BOUNDED | `2 normal / 0 cleanup / 2 total` |
| Temporary route cleanup | PASS / human-confirmed | F03 route removed; permanent vhost retained |
| Reverse tunnel cleanup | PASS / human-confirmed | tunnel stopped |
| Local receiver/process cleanup | PASS | port `18086` clear; no F03 Node runner |
| Post-cleanup public sanity | PASS | base HTTPS `404`; F03 exact path `404`; no redirect |
| Public/social/Ads/media/community mutation | PASS / zero | 0 |
| Focused P1-T08 post-run | PASS | 24 / 24 |
| Affected Provider-spike post-run | PASS | 199 / 199 across 9 files |
| Full post-run suite | PASS | 302 / 302 across 13 files |
| Typecheck / build / diff-check post-run | PASS | all PASS |

Analytics Webhook recommendation: **REMAIN PENDING — FIX/BLOCKER REQUIRED**.
No rerun is authorized under F03. Parent P1-T08 remains not DONE and awaits Team Leader re-review.
## P1-T08-F04 — Webhook Name Length Safety

Status: `DONE / ACCEPTED`.
Accepted implementation HEAD: `b55bf0713090f5a729ac1f4688f79b692347ce96`.
Team Leader verdict: `ACCEPTED`.
Canonical Analytics Webhook remains `SPIKE_PENDING`; parent P1-T08 remains UNRESOLVED / NOT DONE; F03 live run remains CONSUMED.

| Gate / Regression | Result | Evidence |
|---|---|---|
| Root cause | FIXED IN CODE | `HARNESS_WEBHOOK_NAME_LENGTH_EXCEEDS_PROVIDER_LIMIT`; previous `29 + 24 = 53`, Provider max `50` |
| Construction boundary | PASS | `runP1T08` uses one deterministic builder/guard before webhook create transport |
| F04-01 24-char live-shape tag | PASS | generated name length `50` |
| F04-02 previous 53-char construction | PASS | no longer `53`; now `50` |
| F04-03 overlong tag cap | PASS | 200-char tag capped pre-transport; generated name length `50` |
| F04-04 prefix preserved | PASS | `aimm-p1-t08-analytics-synced-` |
| F04-05 create request name | PASS | mock create transport receives builder-produced Provider-safe name |
| F04-06 Provider bounds | PASS | deterministic names satisfy `1 <= length <= 50` |
| F04-07 Profile scope | PASS | exactly Profile A only |
| F04-08 event scope | PASS | exactly `analytics.synced` only |
| F04-09 receiver URL | PASS | exact URL unchanged |
| F04-10 secret isolation | PASS | API credential / expected identity / webhook secret absent from name/evidence |
| T08-06 strengthened | PASS | validates prefix + Provider max length |
| Focused P1-T08 | PASS | `34 / 34` |
| Affected Provider-spike | PASS | `209 / 209` across 9 files |
| Full suite | PASS | `312 / 312` across 13 files |
| Typecheck | PASS | `npm run typecheck` |
| Build | PASS | `npm run build` |
| Diff check | PASS | `git diff --check` |
| Zernio normal calls | PASS / zero | `0` |
| Zernio cleanup calls | PASS / zero | `0` |
| Webhook mutations | PASS / zero | `0` |
| Live Provider execution | NOT AUTHORIZED | no F04 live-run allowance |
| Infrastructure changes | PASS / zero | no Nginx, SSH tunnel, TLS, or live receiver work |

P1-T08-F04 recommendation: **ACCEPT CODE FIX**.

## P1-T08-F05 — Live analytics.synced Verification After F04 Fix

Status: `DONE / ACCEPTED`.
Accepted evidence HEAD: `65b24386c73f564eb027b4830f025ec3d0d291f7`.
Canonical Analytics Webhook remains `SPIKE_PENDING`; parent P1-T08 remains UNRESOLVED / NOT DONE; F03 and F05 live runs are CONSUMED.

| Gate / Evidence | Result | Safe evidence |
|---|---|---|
| Accepted starting HEAD | PASS | `6cc948b18d0902bf3a6455e4a652ef8ef845cb33` |
| F04 builder live-shape preflight | PASS | prefix `29`; 24-char tag; generated length `50`; max `50` |
| Permanent DNS/TCP/TLS sanity | PASS | `82.29.177.121`; TCP/443 PASS; trusted hostname TLS; base `404`; no redirect |
| Focused pre-Provider | PASS | `34 / 34` |
| Affected pre-Provider | PASS | `209 / 209` across 9 files |
| Full pre-Provider | PASS | `312 / 312` across 13 files |
| Typecheck / build / diff-check pre-Provider | PASS | all PASS |
| Exact F05 readiness | PASS | HTTP `401`; TLS/marker/same-process PASS; no redirect; `962 ms` |
| F05 live run | CONSUMED | first Zernio request sent during trusted identity preflight |
| Trusted identity | PASS | HTTP `200`; exact match; request `68ebfc11-4de9-43ca-bda5-20301afd260d`; `598 ms` |
| Webhook name | PASS | `aimm-p1-t08-analytics-synced-bb6dc95b11fe4332a3d14`, length `50` |
| Webhook create | PASS | HTTP `200`; ID `6acf542502eb51a090c8d14e`; request `fc6ff28e-9b65-42d1-9c36-af9bf9f3fb89` |
| Webhook exact read-back | PASS | HTTP `200`; request `1094c013-ad9a-48d6-a2c2-053312085f2a` |
| Profile scope | PASS | Profile A only `6ac5a45a8e4ca44f355033ae` |
| Event scope | PASS | exactly `analytics.synced` |
| URL / active | PASS | exact F05 URL; active=true |
| Observation window | PASS / NO EVENT | `6000014 ms`; 0 inbound; 0 logical unique; no valid event; bounded test window only, not a Provider SLA |
| Foreign / wrong / unconfirmed / unexpected evidence | NONE OBSERVED | all false; no inbound delivery occurred |
| Live payload/signature/target/ACK contract | UNVERIFIED | no Provider delivery arrived |
| No-event interpretation | BOUNDED EVIDENCE ONLY | does not establish unsupported/broken, Provider delivery failure, or any specific cadence; webhook logs do not prove/disprove delivery |
| Provider cleanup DELETE | PASS | HTTP `200`; request `304f8f1c-6a6c-4371-a2e1-a121114b9ef9` |
| Provider cleanup absent read-back | PASS | HTTP `200`; request `ecc08660-bf87-4ffb-ab9d-8ba5f1fdc7f1`; confirmed=true |
| Provider calls | PASS | `3 normal / 2 cleanup / 5 total` |
| External/social/Ads/media/community actions | PASS / zero | all `0`; OpenAI/fal.ai `0` |
| Infrastructure cleanup | PASS | human route/tunnel cleanup + exact path `404`, base `404`, local `18086` clear |
| F05 outcome | NON-CRITICAL / PENDING | `ANALYTICS_SYNCED_NOT_OBSERVED_WITHIN_BOUNDED_WINDOW` |
| Focused post-run | PASS | 34 / 34 |
| Affected post-run | PASS | 209 / 209 across 9 files |
| Full post-run | PASS | 312 / 312 across 13 files |
| Typecheck / build / diff-check post-run | PASS | all PASS |

Analytics Webhook recommendation: **REMAIN PENDING — ANALYTICS_SYNCED_NOT_OBSERVED**.
## P1-T08-F06 — Trigger Eligibility / Test-Account Preconditions

Historical initial Team Leader review: `REJECTED — FIX REQUIRED`.
Current resolved task state: `DONE / ACCEPTED AFTER F06-F01 CORRECTION`.
Historical F06 live evidence is preserved; F06-F01 corrected the rejected traceability/classification issues, and only the corrected conclusions below are canonical.
Parent P1-T08 remains NOT DONE. Analytics Webhook remains `SPIKE_PENDING`. F05 remains DONE / ACCEPTED with outcome `ANALYTICS_SYNCED_NOT_OBSERVED_WITHIN_BOUNDED_WINDOW`; the 100-minute window is not a Provider SLA.

| Gate / Evidence | Result | Safe evidence |
|---|---|---|
| Approved starting HEAD | PASS | `ac620616608a0b94f56c5cb2c7974127ad074028` |
| F06 task type | PASS | read-only Provider diagnostic; no webhook infrastructure |
| F06-01..F06-13 | PASS | deterministic safety/classification regressions |
| Focused pre-Provider | PASS | `47 / 47` across 2 files |
| Affected pre-Provider | PASS | `222 / 222` across 10 files |
| Full pre-Provider | PASS | `325 / 325` across 14 files |
| Typecheck / build / diff-check pre-Provider | PASS | all PASS |
| Trusted identity | PASS | HTTP `200`; exact match; request `5cac1cab-dfcd-4477-bb65-8a74da70ee15` |
| Exact ownership | PASS | Profile A `6ac5a45a8e4ca44f355033ae`; account `6ac64f8740364f4695dd3077`; `facebook`; request `bcd599a7-e345-4e28-a85c-335eb4ac4c5d` |
| Account-list analytics entitlement | FIELD UNOBSERVED | `hasAnalyticsAccess=null`; no inference from account read |
| Account health | PASS | HTTP `200`; `healthy`; token valid=true; `canFetchAnalytics=true`; request `5fe3cc4c-fb4a-49b6-94e5-c8f4bbd3ff93` |
| Analytics permissions | PASS | `pages_read_engagement=true`; `read_insights=true`; issues/recommendations empty |
| Exact baseline filters | PASS | Profile A + exact account + facebook + source=all + `2026-07-17..2026-10-14` + limit100/page1 |
| Baseline initial read | PASS / EMPTY | HTTP `200`; request `acbf29e9-d03f-4e27-8343-2653507e89c3`; rows=0; total=0; `hasAnalyticsAccess=true` |
| Fifth-read provenance | PROVEN / B | separate bounded GET-only diagnostic after the 4-call harness; request `73b50a74-8637-49c7-b28f-51e178f71cde`; identical page-1 filters; HTTP `200`; rows=0; total=0 |
| Baseline top-level fields | OBSERVED | `accounts`, `hasAnalyticsAccess`, `overview`, `pagination`, `posts` |
| Overview fields | OBSERVED | `dataStaleness`, `lastSync`, `publishedPosts`, `scheduledPosts`, `totalPosts` |
| Explicit sync timestamp | OBSERVED | `overview.lastSync=2026-10-14T15:03:02.584Z` |
| dataStaleness value | NOT RETAINED / NO INFERENCE | field present; nested value not retained in safe evidence |
| syncStatus | NOT OBSERVED | no value observed |
| Analytics entitlement | CONFIRMED | exact baseline `hasAnalyticsAccess=true` |
| Primary classification | PASS | `TEST_ACCOUNT_ANALYTICS_ELIGIBLE_BUT_EMPTY` |
| Sync Cycle State | CORRECTED | canonical `UNRESOLVED`; explicit `lastSync` alone does not prove natural sync, event emission, delivery, cadence, next-sync timing, or SLA |
| Historical F06 Provider calls | RECONCILED | `5 GETs total = 4 committed-harness GETs + 1 separate bounded diagnostic GET`; mutations=0 |
| Provider mutations | PASS / zero | all requests GET; mutations=0 |
| Polling/retries | PASS / zero | no delta polling, observation loop, or automatic retry |
| Forbidden endpoints | PASS / zero | webhook operations, `webhook.test`, `sync-external`, API-key mutations all 0 |
| External actions | PASS / zero | posts/media/community/Ads/spend/account changes/OpenAI/fal.ai all 0 |
| Focused post-run | PASS | 47 / 47 across 2 files |
| Affected post-run | PASS | 222 / 222 across 10 files |
| Full post-run | PASS | 325 / 325 across 14 files |
| Typecheck / build / diff-check post-run | PASS | all PASS |

P1-T08-F06 recommendation: **PROVIDER PRECONDITION UNRESOLVED — CLARIFICATION REQUIRED**.

TEST FIXTURE LIMITATION: the current frozen account has zero usable Analytics rows. This does not prove Analytics data is a required Provider precondition for `analytics.synced`.
## P1-T08-F06-F01 — Evidence Traceability & Classification Correction

Status: `DONE / ACCEPTED`.
Accepted fix HEAD: `a591fdf12f199291b982e519443c7ac72a36d484`.
Team Leader verdict: `ACCEPTED`.
Provider calls during F06-F01: `0 normal / 0 cleanup / 0 total`; live-mode commands `0`; mutations `0`.

| ID | Coverage | Result |
|---|---|---|
| F06-F01-01 | Nested `overview.lastSync` safely captured | PASS |
| F06-F01-02 | Nested `overview.dataStaleness` handled safely without full-object dump | PASS |
| F06-F01-03 | `lastSync` does not imply `analytics.synced` emission | PASS |
| F06-F01-04 | `lastSync` does not imply webhook delivery | PASS |
| F06-F01-05 | `lastSync` does not establish cadence or SLA | PASS |
| F06-F01-06 | Eligible + access=true + zero rows remains `TEST_ACCOUNT_ANALYTICS_ELIGIBLE_BUT_EMPTY` | PASS |
| F06-F01-07 | Eligible-but-empty does not claim Analytics data is required | PASS |
| F06-F01-08 | Recommendation is `PROVIDER PRECONDITION UNRESOLVED — CLARIFICATION REQUIRED` | PASS |
| F06-F01-09 | Normal empty-baseline request count = 4 GETs | PASS |
| F06-F01-10 | Optional fifth harness read requires explicit pagination trigger and identical target/date filters | PASS |
| F06-F01-11 | Normal Provider request ceiling remains max 5 | PASS |
| F06-F01-12 | All transport remains GET-only | PASS |
| F06-F01-13 | No webhook/mutation endpoint can be reached | PASS |
| F06-F01-14 | Profile A/account/facebook isolation remains exact | PASS |
| F06-F01-15 | Foreign Profile/account remains Critical | PASS |
| F06-F01-16 | Secrets and expected identity remain absent from evidence | PASS |

Parser/request-model invariants: allowlisted nested overview fields are `lastSync`, `dataStaleness`, `syncStatus`, `dataAsOf`; safe states are `ABSENT`, `SAFE_SCALAR_RETAINED`, `OBSERVED_NOT_RETAINED`; full/unrelated overview content is not serialized; `lastSync` alone => `UNRESOLVED`; optional page 2 only on explicit `hasMore=true` or `total > rows.length`; request ceiling remains 5.

Fifth-read provenance: `B — FIFTH_READ_EXECUTED_BY_SEPARATE_BOUNDED_DIAGNOSTIC_COMMAND`, proven by persisted local execution history. Separate request: GET-only exact page-1 Analytics filters, HTTP `200`, request `73b50a74-8637-49c7-b28f-51e178f71cde`. Explicit `overview.lastSync=2026-10-14T15:03:02.584Z` remains `EXPLICIT_PROVIDER_SYNC_TIMESTAMP_OBSERVED` only.

Current Phase remains `PHASE 1 — Provider Feasibility & Basic Cost Safety`. Current Task / execution focus is restored to parent `P1-T08 — Verify Zernio analytics.synced Webhook Behavior`, which remains `UNRESOLVED / NOT DONE`. Analytics Webhook remains `SPIKE_PENDING`. F03 live run remains `CONSUMED`; F05 remains `DONE / ACCEPTED`, its live run remains `CONSUMED`, and its outcome remains `ANALYTICS_SYNCED_NOT_OBSERVED_WITHIN_BOUNDED_WINDOW`. Next Task remains `NOT_STARTED`.

Final F06-F01 validation: focused `63 / 63 PASS` across 2 files; affected `238 / 238 PASS` across 10 files; full `341 / 341 PASS` across 14 files; `npm run typecheck` PASS; `npm run build` PASS; `git diff --check` PASS.

## P1-T08-F07 — Stale Analytics Refresh Correlation

Status: `DONE / ACCEPTED`.
Accepted implementation/evidence HEAD: `699ea01911814119b7316a3acaf002ee96d08b59`.
Parent P1-T08 remains `UNRESOLVED / NOT DONE`. Analytics Webhook remains `SPIKE_PENDING`. F07 live run remains `CONSUMED`.

| Gate / Evidence | Result | Safe evidence |
|---|---|---|
| Approved starting HEAD | PASS | `0e7799d254d2d780ba293f454775853042aa8fe9` |
| Stale-window timing gate | PASS | historical `15:03:02.584Z`; consumed-run elapsed `4784323 ms` >= `4500000 ms`; 75-minute gate is test setup only, not Provider SLA |
| Permanent DNS/TLS sanity | PASS | `82.29.177.121`; trusted TLS; base `404`; no redirect |
| Focused pre-live | PASS | `57 / 57` across 2 files |
| Affected pre-live | PASS | `261 / 261` across 11 files |
| Full pre-live | PASS | `364 / 364` across 15 files |
| Typecheck / build / diff-check pre-live | PASS | all PASS |
| Initial credential attempt | SAFE / UNCONSUMED | exact readiness reached; `MISSING_LIVE_CREDENTIAL`; Zernio calls `0` |
| Consumed-run readiness | PASS | HTTP `401`; TLS/marker/same-process PASS; no redirect; `924 ms` |
| Trusted identity | PASS | HTTP `200`; exact match; request `9b003962-1837-44ab-b3fa-e9236df99ef1` |
| Webhook name | PASS | length `50` |
| Webhook create | PASS | HTTP `200`; ID `6acfac57250f5349a8d336ee`; request `db2a4164-b792-4760-8627-fea4c7e994fc` |
| Webhook exact read-back | PASS | HTTP `200`; request `6fe76cf0-bccd-4f82-898e-527f52b3c088`; Profile A/event/URL/active exact |
| Trigger Analytics GET | PASS | exactly one; HTTP `200`; request `2bb1bd75-b08e-4311-b420-07220d5b329a` |
| Trigger target filters | PASS | exact Profile A/account/facebook/source/date/limit/page |
| Trigger rows/access | OBSERVED | rows `0`; `hasAnalyticsAccess=true` |
| Trigger `lastSync` | NOT ADVANCED | `2026-10-14T15:03:02.584Z`; classification `REFRESH_NOT_YET_CONFIRMED` |
| Trigger safe sync metadata | SAFE | `dataStaleness` field observed/value not retained; `syncStatus` absent |
| Passive observation | PASS / NO EVENT | `1800010 ms`; inbound `0`; unique `0`; no polling; 30-minute window is bounded experiment evidence only, not Provider SLA |
| Follow-up Analytics GET | PASS | exactly one; HTTP `200`; request `1762a144-18dc-41a6-9a3e-2482adda0ddb` |
| Follow-up `lastSync` | NOT ADVANCED | unchanged `2026-10-14T15:03:02.584Z`; refresh advanced=false |
| Live analytics.synced delivery | NOT OBSERVED | signature/ID/target payload/ACK contract remains unverified live |
| Correlation outcome | C | `REFRESH_NOT_CONFIRMED_EVENT_NOT_OBSERVED` |
| Provider cleanup DELETE | PASS | HTTP `200`; request `3f0cae4a-96be-4068-85a5-5accfee5163d` |
| Provider cleanup absent read-back | PASS | HTTP `200`; request `24aadf0b-fe5d-44a0-94a0-f4cd19ecc866`; confirmed=true |
| Provider calls | PASS | `5 normal / 2 cleanup / 7 total`; ceilings respected |
| External actions | PASS / zero | posts/publishing/schedules/media/community/Ads/spend/account/Profile/API-key/sync-external/OpenAI/fal.ai all 0 |
| Infrastructure cleanup | PASS | local/VPS `18086` clear; tunnel stopped; route absent; public F07 `404`; permanent TLS/vhost preserved |
| Post-run validation | PASS | focused `57 / 57` across 2; affected `261 / 261` across 11; full `364 / 364` across 15; typecheck/build/diff-check PASS |

Required F07 regressions F07-01 through F07-21 are implemented and pass; additional fail-closed coverage verifies unexpected event delivery handling and trigger classification variants.

Accepted interpretation: no refresh was confirmed; no `analytics.synced` delivery was observed; neither Provider support nor Provider failure was established by F07. Do not promote deterministic signature/ID/target/ACK checks into live Provider facts.

Analytics Webhook recommendation: **REMAIN PENDING — REFRESH CORRELATION INCONCLUSIVE**.
Current Task / execution focus is parent `P1-T08 — Verify Zernio analytics.synced Webhook Behavior`, which remains `UNRESOLVED / NOT DONE`. Analytics Webhook remains `SPIKE_PENDING`. Next Task remains `NOT_STARTED`.

## P1-T08-F08 — Official Provider Contract Clarification

Status: `DONE / ACCEPTED`.
Accepted evidence HEAD: `bb56de898472b2e904345ca5eaf4686b0bafd83e`.
Approved starting HEAD: `60f40a1063a871a29c560517a6647ded1fb42160`.

| F08 Gate / Evidence | Result | Evidence |
|---|---|---|
| Provider calls | PASS / ZERO | `0 normal / 0 cleanup / 0 total` |
| Provider mutations/webhook operations | PASS / ZERO | no Zernio execution |
| External Provider communication | PASS / ZERO | clarification packet NOT SENT |
| Official-source policy | PASS | only official Zernio docs/reference/changelog/OpenAPI-derived material used |
| Q1-Q18 statuses | PASS | 18 / 18 explicitly classified |
| Exact event emission trigger | NOT_DOCUMENTED | availability/purpose documented; emitting condition absent |
| Stale GET -> event linkage | NOT_DOCUMENTED | background refresh explicit; target-event relationship absent |
| `lastSync` semantics | **LASTSYNC_SEMANTICS_NOT_DOCUMENTED** | only freshness/UI usage documented |
| Empty-data semantics | **EMPTY_ANALYTICS_SYNC_BEHAVIOR_NOT_DOCUMENTED** | zero-row sync/event behavior absent |
| Generic webhook test | DOC_CONFIRMED | fixed `webhook.test` |
| `hasAnalyticsAccess` | DOC_CONFIRMED | Analytics add-on access/entitlement |
| Safe qualifying trigger | NO VERIFIED PATH | candidates classified B/C/D/E; none authorized/executed |
| Data-bearing fixture | **DATA_BEARING_FIXTURE_REQUIREMENT_NOT_DOCUMENTED** | no explicit prerequisite |
| Clarification packet | REQUIRED / NOT SENT | eight factual questions prepared |
| Final classification | **PROVIDER_CLARIFICATION_REQUIRED** | material ambiguity remains |
| Recommendation | **DECISION REQUIRED — CONTACT PROVIDER FOR CLARIFICATION** | recommendation only |
| Source/test/package changes | PASS / ZERO | docs-only task |
| Canonical capability | PRESERVED | parent NOT DONE; Analytics Webhook `SPIKE_PENDING`; Next Task NOT_STARTED |

No test-suite rerun is required by the F08 contract because no source/test files changed. Required final validation is docs-only changed-file verification plus `git diff --check`.

Current Task / execution focus is restored to parent `P1-T08 — Verify Zernio analytics.synced Webhook Behavior`, which remains `UNRESOLVED / NOT DONE`. Clarification packet remains **PREPARED / NOT SENT**; recommendation remains **DECISION REQUIRED — CONTACT PROVIDER FOR CLARIFICATION** and is not authorized for execution. Analytics Webhook remains `SPIKE_PENDING`; Current Phase remains `PHASE 1 — Provider Feasibility & Basic Cost Safety`; Next Task remains `NOT_STARTED`.


## P1-T08-F09-S01 - MarketlyAI Sender / Reply Readiness

Status: `BLOCKED - DNS ACCESS REQUIRED`.

| Gate / Evidence | Result | Safe evidence |
|---|---|---|
| Approved starting HEAD / branch | PASS | `a3f9dfebb5b2c8c0e618fe176d57849c416d4cd3`; `p1-t08-zernio-analytics-webhook` |
| Exact sender identity | PASS / fixed | `MarketlyAI Engineering <engineering@marketlyai.restartorg.com>` |
| Unrelated sender isolation | PASS | no Linka/TIA/personal/no-reply sender used |
| Resend MarketlyAI domain config | PASS / created | `marketlyai.restartorg.com`; safe ID `64833ad6-63a9-4fd7-8a00-8c1d3f4edd8d`; eu-west-1; sending+receiving enabled |
| Resend domain verification | BLOCKED | read-back `not_started`; DNS records not installed |
| DKIM / SPF requirements | PASS / exact requirements obtained | DKIM TXT; SPF return-path MX/TXT/CNAME; values sourced from Resend, not guessed |
| Receiving requirement | PASS / exact requirement obtained | receiving MX sourced from Resend |
| Public DNS baseline | PASS | NS `dns-parking.com`; A `82.29.177.121`; no existing MarketlyAI MX/TXT/CNAME answer |
| Authorized DNS access | BLOCKED | no credential/CLI/environment/project DNS binding available on authorized device |
| Public DNS mutation | PASS / zero | no records added, deleted, or changed |
| Existing HTTPS/TLS | PASS | trusted TLS; no redirect; expected base `404`; A record preserved |
| Sender accepted by Resend | NOT PROVEN | requires domain verification |
| Direct inbound reply routing | NOT PROVEN | receiving domain cannot be verified without DNS access; no inbox created |
| Internal routing test | NOT RUN | 0 outbound internal test emails |
| Zernio/Provider contact | PASS / zero | 0 emails; 0 support tickets |
| Provider/Zernio APIs | PASS / zero | 0 calls |
| Secrets | PASS | none exposed or committed |
| Source/test/package changes | PASS / zero | configuration + docs evidence only |
| Final classification | **MARKETLYAI_SENDER_BLOCKED - DNS ACCESS REQUIRED** | exact allowed S01 classification |
| Canonical capability state | PRESERVED | F09 blocked before send; parent NOT DONE; Analytics Webhook `SPIKE_PENDING`; Next Task NOT_STARTED |

No test-suite rerun is required because no source/test/package file changed. Required repository validation is docs-only changed-file verification plus `git diff --check`.

## P1-T08-F10 - Data-Bearing Experiment Harness

Status: `DONE / ACCEPTED`.

| Gate / Regression | Result | Evidence |
|---|---|---|
| Historical starting HEAD | PASS | `73cefbddcc3c7cd7eb24799f038c84c2e981023d` |
| Original F10 implementation HEAD | PASS | `266885dd5e5962e58fe6b2811ecb1c6a54c48ac2` |
| Accepted final implementation/evidence HEAD | PASS | `fbbed9f77293d9a68c594562edb6ab2976f85844` |
| Team Leader verdict | PASS | ACCEPTED after F10-F01 hardening |
| Provider activity during F10 | PASS / ZERO | 0 external calls; mocks/test doubles only |
| Frozen Profile/account/Page/platform | PASS | exact Profile A + Facebook account + Page + facebook; mismatch fails closed |
| Human text approval/hash gate | PASS | exact runtime text + SHA-256 required before publish |
| Retention gate | PASS | explicit bounded future deadline required |
| Webhook before publish | PASS | exact Profile-A-only / analytics.synced-only create + read-back |
| Unknown webhook create | PASS | exact-name reconciliation; no duplicate create |
| Publish exactly once | PASS | one idempotent POST maximum; no blind retry |
| Ambiguous publish | PASS | bounded read-back reconciliation; duplicates Critical, no arbitrary deletion |
| Passive observation | PASS | zero Provider polling |
| HMAC / event ID / target / dedupe | PASS | accepted P1-T08 safety patterns preserved |
| Follow-up Analytics | PASS | one bounded read; provider/platform post ID matching supported |
| Classification A/B/C/D/E | PASS | deterministic and conservative |
| Optional Delta | PASS | disabled by default; dedicated authorization; max one read |
| Webhook cleanup | PASS | delete + absent read-back |
| Post cleanup | PASS | retention-aware unpublish + verification |
| Deferred retained-post cleanup | PASS | cleanup-only mode, no publish/webhook/Analytics path |
| Normal request ceiling | PASS | target <=9; absolute 10 |
| Cleanup / total ceilings | PASS | cleanup <=4; total <=14 |
| Secret/result safety | PASS | credentials/tokens/approved text not serialized |
| Data-bearing assumption | PASS | hypothesis only; requirement not proven |
| Required F10-01..F10-34 + extras | PASS | `39 / 39 PASS` F10 tests |
| Focused F10 + parent | PASS | `73 / 73 PASS across 2 files` |
| Affected Provider-spike | PASS | `297 / 297 PASS across 11 files` |
| Full suite | PASS | `403 / 403 PASS across 16 files` |
| Typecheck / build / diff-check | PASS | all PASS |

P1-T08-F10 and P1-T08-F10-F01 are **DONE / ACCEPTED** at accepted final implementation/evidence HEAD `fbbed9f77293d9a68c594562edb6ab2976f85844`. P1-T08-F09-S01 remains **BLOCKED — DNS ACCESS REQUIRED**; Provider contact remains **AUTHORIZED / NOT SENT**; clarification packet remains **PREPARED / NOT SENT**. Parent P1-T08 remains **UNRESOLVED / NOT DONE**. Analytics Webhook remains `SPIKE_PENDING`. Current Phase remains **PHASE 1 — Provider Feasibility & Basic Cost Safety**. Next Task remains **NOT_STARTED**. Live data-bearing experiment remains **NOT AUTHORIZED YET**.
## P1-T08-F10-F01 - Uncertain Artifact Recovery / Observation Hardening

Status: `DONE / ACCEPTED`. Parent F10 is `DONE / ACCEPTED` after F10-F01 hardening. Team Leader verdict: **ACCEPTED**. Accepted final implementation/evidence HEAD: `fbbed9f77293d9a68c594562edb6ab2976f85844`.

| Gate / Regression | Result | Evidence |
|---|---|---|
| Provider activity | PASS / ZERO | 0 external calls, posts, webhooks, Analytics, emails, DNS changes; mocks/test doubles only |
| F10-F01-01 uncertain publish zero-match evidence | PASS | retained safe post evidence; no approved text serialization |
| F10-F01-02 no second publish | PASS | ambiguous zero-match path keeps one publish attempt maximum |
| F10-F01-03 unknown-ID reconcile-only entry | PASS | bounded post reconciliation without publish |
| F10-F01-04 zero-match semantics | PASS | `UNCERTAIN_ARTIFACT_NOT_FOUND`; artifact remains unresolved, not confirmed absent |
| F10-F01-05 one exact candidate cleanup | PASS | target attested; explicit cleanup auth required; unpublish + verify |
| F10-F01-06 multiple candidates | PASS | `CRITICAL_DUPLICATE_CONFIRMED_PUBLISH`; zero arbitrary deletes |
| F10-F01-07 uncertain webhook zero-match evidence | PASS | retained name/URL/event/Profile/uncertainty evidence |
| F10-F01-08 later webhook recovery | PASS | exact-name recovery; no second webhook create |
| F10-F01-09 webhook recovery attestation | PASS | exact URL + analytics.synced-only + Profile-A-only required before delete |
| F10-F01-10 missing observation authorization | PASS | fails before first Provider request |
| F10-F01-11 below 60m | PASS | precheck rejects |
| F10-F01-12 above 3h | PASS | precheck rejects |
| F10-F01-13 approved 2h | PASS | accepted by precheck; not treated as SLA |
| F10-F01-14 passive logical 2h | PASS | mock wait; zero Provider polling |
| F10-F01-15 reconcile-only side effects | PASS | zero publish, zero webhook create, zero Analytics |
| Existing F10 tests + F01 regressions | PASS | `54 / 54 PASS` |
| Focused F10 + P1-T08 | PASS | `88 / 88 PASS across 2 files` |
| Affected Provider-spike | PASS | `312 / 312 PASS across 11 files` |
| Full regression | PASS | `418 / 418 PASS across 16 files` |
| Typecheck | PASS | `npm run typecheck -- --pretty false` |
| Build | PASS | `npm run build -- --pretty false` |
| Diff check | PASS | `git diff --check` |
| Canonical state | PASS | F10-F01 DONE/ACCEPTED; F10 DONE/ACCEPTED; accepted final HEAD `fbbed9f77293d9a68c594562edb6ab2976f85844`; F09-S01 BLOCKED — DNS ACCESS REQUIRED; Provider contact AUTHORIZED / NOT SENT; clarification packet PREPARED / NOT SENT; parent P1-T08 UNRESOLVED / NOT DONE; Analytics Webhook SPIKE_PENDING; Phase 1; Next Task NOT_STARTED; live experiment NOT AUTHORIZED YET |


## P1-T08-F11-F01 - Pre-Provider Readiness Matrix

Status: **DONE / ACCEPTED**. Result: **PRE_PROVIDER_TOOLING_UNAVAILABLE**. Accepted evidence HEAD: `08de3756e522e773544f9b8034c6e7e5485a7afa`. Readiness: **NOT PROVEN**. Blocking dependency: **AUTHORIZED PRIVILEGED NGINX ACCESS REQUIRED**.

| Gate | Result | Evidence |
|---|---|---|
| Repository HEAD / branch / clean tree | PASS | `aac626468dc3022e8555bbea0d4db98bd4b15b58`; `p1-t08-zernio-analytics-webhook`; remote matched; clean |
| DNS / TCP 443 | PASS | `marketlyai.restartorg.com -> 82.29.177.121`; TCP/443 reachable |
| Trusted HTTPS baseline | PASS | base `404`; exact F11 path pre-setup `404`; no redirect; TLS verification result `0` |
| SSH access to approved VPS | PASS | `marktuser@82.29.177.121`; host `srv822206` |
| Privileged Nginx syntax/control access | BLOCKED | `sudo -n nginx -t` -> `sudo: a password is required` |
| Nginx syntax valid | NOT RUN | required privilege unavailable; no inference made |
| Temporary exact F11 route | NOT RUN | stopped under tooling-failure rule |
| Local receiver / port 18087 | NOT RUN | stopped before receiver setup |
| SSH reverse tunnel | NOT RUN | stopped before tunnel setup |
| External exact-route marker proof | NOT RUN | route/tunnel/receiver were not established |
| Local F11 precheck | NOT RUN | stopped before local precheck; no retention timestamp generated |
| Provider activity | PASS / ZERO | Provider calls `0`; Zernio calls `0`; `/v1/auth/verify` `0`; Accounts `0`; Analytics API `0`; webhook/post API `0`; Provider contact `0` |
| Provider artifacts/actions | PASS / ZERO | webhook created **NO**; post published **NO**; Analytics called **NO** |
| F11 authorization consumption | PASS / NO | one-run authorization remains `AUTHORIZED / UNCONSUMED` |
| Accepted evidence HEAD | PASS | `08de3756e522e773544f9b8034c6e7e5485a7afa` |
| Readiness | NOT PROVEN | Nginx syntax, exact F11 route, tunnel, receiver, and F11 execution readiness were not proven |
| Blocking dependency | BLOCKED | `AUTHORIZED PRIVILEGED NGINX ACCESS REQUIRED` |
| Final classification | ACCEPTED BLOCKER | `PRE_PROVIDER_TOOLING_UNAVAILABLE`; Team Leader accepted this task result; readiness remains NOT PROVEN |
| Canonical parent state | PASS | P1-T08-F11 `UNCONSUMED / BLOCKED PRE-PROVIDER`; parent P1-T08 `UNRESOLVED / NOT DONE`; Analytics Webhook `SPIKE_PENDING` |
| Other blockers/contact | PASS | P1-T08-F09-S01 `BLOCKED — DNS ACCESS REQUIRED`; Provider contact `AUTHORIZED / NOT SENT` |
| Phase / next task | PASS | `PHASE 1 — Provider Feasibility & Basic Cost Safety`; Next Task `NOT_STARTED` |

Post-stop cleanup verification: local `18087` clear; base HTTPS and exact F11 path both remained `404`, no redirect, TLS verification result `0`; no temporary route/tunnel/receiver existed to clean up.


## P1-T08-F11-F02 - Privileged Readiness Matrix

Status: **DONE / ACCEPTED**. Final classification: **PRE_PROVIDER_TOOLING_UNAVAILABLE**. Accepted evidence HEAD: `b1a580debc7c80e5957c77cfb6098dff95d248c1`. Readiness: **NOT PROVEN**.

| Gate | Result | Evidence |
|---|---|---|
| Source-of-Truth activation | PASS | activation commit `d7d6a3d8bac2a9739aeff21c537525367f42f08e` before infrastructure work |
| Historical F11-F02 blocker | ACCEPTED HISTORICAL | `SAFE DIRECT HUMAN PRIVILEGED TERMINAL CHANNEL REQUIRED` |
| Post-F11-F02 prerequisite update | USER-CONFIRMED | `DIRECT HUMAN TERMINAL PASSWORD ENTRY`; confirms only direct human Terminal password entry without exposure to ChatGPT; readiness retry not executed |
| Repository/source integrity | PASS | no source/test/package changes |
| Public DNS / HTTPS baseline | PASS | `marketlyai.restartorg.com -> 82.29.177.121`; base `404`; F11 path `404`; no redirect; TLS verify `0` |
| SSH expected user/host | PASS | `marktuser@srv822206` |
| Human-assisted sudo during accepted evidence run | HISTORICAL BLOCKER | sudo success was not independently proven because the direct human password-entry path had not yet been established/verified; password exposure to ChatGPT `NO` |
| Post-run direct human Terminal password entry | USER-CONFIRMED | password entered directly inside Terminal only; password sent in chat `NO`; password exposure to ChatGPT `NO`; does not prove sudo success/cache or Nginx readiness |
| Activity after human Terminal entry | PASS / ZERO | Provider/Zernio calls `0`; Nginx changes `0`; readiness retry `NO` |
| Pre-change nginx syntax | NOT RUN | privileged access was not established/proven during the accepted evidence run; no later retry has executed |
| Exact vhost / fingerprint | NOT RUN | stopped before privileged inspection |
| Local receiver | NOT RUN | stopped before setup; port `18087` later verified clear |
| Reverse tunnel / VPS loopback proof | NOT RUN | stopped before setup |
| Temporary exact Nginx route | NOT RUN | no config change |
| External marker proof | NOT RUN | no route/tunnel/receiver established |
| Local F11 precheck | NOT RUN | no disposable retention/token generated |
| Provider activity | PASS / ZERO | Zernio, auth/verify, Accounts, Analytics, webhook/post API, contact all `0` |
| F11 authorization consumption | PASS / NO | remains `AUTHORIZED / UNCONSUMED` |
| Cleanup | PASS / NO TEMP INFRA | no F11 SSH process remained; port `18087` clear; base/F11 path `404`; no redirect; TLS verify `0` |
| Final classification | DONE / ACCEPTED | `PRE_PROVIDER_TOOLING_UNAVAILABLE`; accepted evidence HEAD `b1a580debc7c80e5957c77cfb6098dff95d248c1`; readiness remains `NOT PROVEN` |
| Canonical state | PASS | F11-F02 `DONE / ACCEPTED`; F11 `UNCONSUMED / BLOCKED PRE-PROVIDER`; F11 authorization `AUTHORIZED / UNCONSUMED`; parent/current task P1-T08 `UNRESOLVED / NOT DONE`; Analytics Webhook `SPIKE_PENDING`; F11-F03 not activated; Next Task `NOT_STARTED` |


## P1-T08-F11-F03 - Privileged Readiness Matrix

Status: **DONE / ACCEPTED**. Final classification: **PRE_PROVIDER_TOOLING_UNAVAILABLE**. Accepted evidence HEAD: `052e25d03e445914224b7cc65fb40aa2801052c9`. Privileged access: **PROVEN**. Post-entry `sudo -n true`: **PASS**. Readiness: **NOT PROVEN**. Current blocker: **PRIVILEGED NGINX COMMAND DISPATCH PATH UNAVAILABLE**.

| Gate | Result | Evidence |
|---|---|---|
| Source-of-Truth activation | PASS | activation commit `e12e84eb3fd6b1d33645183ff78927b7be20226b` pushed before infrastructure work |
| Repository/source integrity | PASS | starting HEAD `b429f62acccd79b1b510af0ebc7625dc67d01e4a`; no source/test/package changes |
| Public DNS / TCP / HTTPS baseline | PASS | hostname -> `82.29.177.121`; TCP/443 true; base/F11 path `404`; TLS verify `0`; redirects `0` |
| SSH expected user/host | PASS | `marktuser@srv822206` |
| Initial sudo -n true | AUTH REQUIRED | direct human Terminal path required |
| Human password entry | PASS / SAFE | entered directly in visible Terminal only; password sent to/exposed to ChatGPT **NO** |
| Post-entry sudo -n true | PASS | non-secret result marker class `20`; privilege independently verified **YES** |
| Current blocker | BLOCKED | `PRIVILEGED NGINX COMMAND DISPATCH PATH UNAVAILABLE`; tooling/execution-channel blocker, not sudo authorization, credential, Nginx syntax, Provider, or Zernio failure |
| Pre-change nginx syntax | NOT RUN | required privileged Nginx command rejected by execution tooling before dispatch |
| Exact vhost / fingerprint / backup | NOT RUN | stopped before privileged Nginx inspection/change |
| Helper transfer | BLOCKED / NO CHANGE | SCP `Connection closed`; alternative transfer rejected before dispatch; no remote helper/config change |
| Local receiver | NOT RUN | port `18087` remained clear |
| Reverse tunnel / VPS loopback proof | NOT RUN | stopped before setup |
| Temporary exact route | NOT RUN | no Nginx change |
| External marker proof | NOT RUN | no route/tunnel/receiver established |
| Local F11 precheck | NOT RUN | no disposable token/retention generated |
| Provider activity | PASS / ZERO | Zernio/auth/Accounts/Analytics/webhook/post/contact all `0` |
| F11 authorization consumption | PASS / NO | remains `AUTHORIZED / UNCONSUMED` |
| Cleanup | PASS / NO TEMP INFRA | no SSH process; local `18087` clear; base/F11 path `404`; TLS verify `0`; redirects `0`; no route/tunnel/receiver/backup existed |
| Cleanup safety failure | NO | no temporary infrastructure was created |
| Final classification | DONE / ACCEPTED | `PRE_PROVIDER_TOOLING_UNAVAILABLE`; accepted evidence HEAD `052e25d03e445914224b7cc65fb40aa2801052c9`; readiness remains `NOT PROVEN` |
| Canonical state | PASS | F11-F03 `DONE / ACCEPTED`; F11 `UNCONSUMED / BLOCKED PRE-PROVIDER`; authorization `AUTHORIZED / UNCONSUMED`; parent/current task P1-T08 `UNRESOLVED / NOT DONE`; Analytics `SPIKE_PENDING`; P1-T08-F09-S01 `BLOCKED — DNS ACCESS REQUIRED`; Provider contact `AUTHORIZED / NOT SENT`; Next Task `NOT_STARTED` |


## P1-T08-F11-F04 - Operator-Executed Nginx Readiness Matrix

Status: **DONE / ACCEPTED**. Final classification: **HTTPS_OR_NGINX_NOT_READY**. Accepted evidence HEAD: `859e06806899e66e1984f9900fc6cc6960f1b615`. Readiness: **NOT PROVEN**. Current infrastructure blocker: **NGINX_SERVICE_STATE_FAILED_WITH_VALID_CONFIG**.

| Gate | Result | Evidence |
|---|---|---|
| Source-of-Truth activation | PASS | activation commit `10f293ac868d1407af86c7838a9727add1f2b190` pushed before infrastructure work |
| Repository/source integrity | PASS | starting HEAD `dcd17c2cd8566918ee95232949caabb1258e435e`; no source/test/package/PROVIDER_CAPABILITIES changes |
| Initial DNS / TCP / HTTPS baseline | PASS | hostname -> `82.29.177.121`; TCP/443 reachable; base/F11 path `404`; TLS verify `0`; redirects `0` |
| SSH expected user/host | PASS | `marktuser@srv822206` |
| Human password handling | PASS / SAFE | password entered directly in visible Terminal only; sent to/exposed to ChatGPT **NO** |
| Privilege proof | PASS | post-entry `sudo -n true` exit `0` |
| Pre-change Nginx syntax | PASS | `sudo nginx -t`: syntax OK; config test successful; exit `0` |
| Exact enabled vhost | PASS | enabled `/etc/nginx/sites-enabled/marketlyai.restartorg.com` -> real `/etc/nginx/sites-available/marketlyai.restartorg.com`; exact server_name proven |
| Pre-change config fingerprint | PASS | `f4416d9dfbb60ff10ff40cf5dede082dc81aa13868da4299cd5972139ff339d6` |
| Local receiver | PASS | `127.0.0.1:18087`; exact F11 path; readiness + confirmation `401`; marker match; same-process counters |
| Reverse tunnel / VPS loopback | PASS | VPS listener loopback-only `127.0.0.1:18087`; loopback requests reached same receiver marker/process |
| Rollback preparation | PASS | root-owned backup; mode `600`; SHA exactly matched original before any mutation |
| Guarded Nginx route mutation | NOT RUN | temporary F11 route **NEVER INSTALLED**; Nginx mutation `0` |
| Operator workstation interruption recovery | PASS | repo clean/remote matched; transient receiver/tunnel recreated only for readiness recovery |
| Recovery sudo / nginx syntax | PASS | `sudo -n true` exit `0`; recovery `nginx -t` exit `0` |
| Recovery config integrity | PASS | current config and backup still matched original SHA; F11 route grep exit `1`; original fingerprint preserved **YES**; backup `600 root:root` |
| Nginx service state | **FAIL / STOP** | `ActiveState=failed`; `SubState=failed`; `CanReload=yes`; canonical finding `NGINX_SERVICE_STATE_FAILED_WITH_VALID_CONFIG`; root cause **NOT YET DETERMINED** |
| External exact-route marker proof | NOT RUN | readiness stopped before any F11 route installation |
| Local F11 precheck | NOT RUN | external route readiness not established; no F11 Provider precheck executed |
| F11_PRE_PROVIDER_READY | NOT ESTABLISHED | readiness remains NOT PROVEN |
| Provider activity | PASS / ZERO | Zernio/auth/Accounts/Analytics/webhook/post/contact all `0` |
| Provider artifacts/actions | PASS / ZERO | webhook created **NO**; post published **NO**; Analytics called **NO** |
| F11 authorization consumption | PASS / NO | remains `AUTHORIZED / UNCONSUMED` |
| Cleanup transient receiver/tunnel | PASS | receiver stopped **YES**; reverse tunnel stopped **YES**; local `18087` clear **YES** |
| Config rollback requirement | N/A / NO MUTATION | original config restored **NOT REQUIRED — NEVER CHANGED**; original fingerprint preserved **YES** |
| Backup cleanup | PASS | temporary backup removed **YES** after unchanged-config verification; `BACKUP_REMOVED_EXIT=0` |
| Cleanup safety failure | NO | no unresolved temporary Nginx state/artifact remains from F04 |
| Final classification | DONE / ACCEPTED | `HTTPS_OR_NGINX_NOT_READY`; accepted evidence HEAD `859e06806899e66e1984f9900fc6cc6960f1b615` |
| Canonical state | PASS | F11-F04 `DONE / ACCEPTED`; blocker `NGINX_SERVICE_STATE_FAILED_WITH_VALID_CONFIG`; F11 `UNCONSUMED / BLOCKED PRE-PROVIDER`; authorization `AUTHORIZED / UNCONSUMED`; parent P1-T08 `UNRESOLVED / NOT DONE`; Analytics `SPIKE_PENDING`; Current Task parent P1-T08; Next Task `NOT_STARTED` |


## P1-T08-F11-F05 - Nginx Failed Service Diagnostic Matrix

Status: **DONE / ACCEPTED**. Final classification: **NGINX_FAILED_STATE_ROOT_CAUSE_PROVEN**. Accepted evidence HEAD: `b7652550a5f0e131bf00d74bcbdb688aff368ff0`. Root cause: **APACHE_PORT_80_OWNERSHIP_BLOCKS_NGINX_STARTUP_AFTER_REBOOT**. Apache workload intent: **NOT YET VERIFIED**. Evidence: **PRE-PROVIDER INFRASTRUCTURE DIAGNOSTIC EVIDENCE — NOT Provider Behavior evidence**.

| Gate | Result | Evidence |
|---|---|---|
| Activation before diagnosis | PASS | activation HEAD `b068e7ffe7165e441a76e34eb8e507327b7e2a22` |
| Repository/source integrity | PASS | starting HEAD `be3084c795fb71599cac3dfe37c0fd4e3bf91256`; no source/test/package changes |
| Fresh DNS | PASS | `marketlyai.restartorg.com -> 82.29.177.121` |
| Fresh TCP/80 | PASS / REACHABLE | public TCP/80 reachable |
| Fresh TCP/443 | FAIL / NOT REACHABLE | public TCP/443 connection not established |
| Fresh HTTPS base/F11 | NOT REACHED | both timed out before TLS/HTTP; no current HTTPS status/cert inferred |
| HTTP/80 observation | OBSERVED | base `500`; exact F11 path `404`; redirects `0` |
| nginx systemd state | FAIL / OBSERVED | loaded; enabled; ActiveState=failed; SubState=failed; Result=exit-code; MainPID=0; ControlPID=0; CanReload=yes |
| Failed operation metadata | PASS / PROVEN | ExecStart PID `843`; exited status `1`; stopped `2026-10-17 10:11:29 UTC` |
| Bounded nginx journal | PASS | explicit port-80 bind failures, error 98 Address already in use, then still could not bind |
| nginx unit definition | PASS | Type=forking; PIDFile=/run/nginx.pid; ExecStartPre config-test; ExecStart daemon; ExecReload signal reload; Restart=no; no drop-ins |
| nginx processes | PASS / NONE | no nginx master/workers; unmanaged/orphan determination = NO |
| Apache service correlation | PASS / PROVEN | apache2 active since `10:11:26 UTC`; MainPID 852; PPID 1; systemd-managed |
| TCP/80 ownership | PASS / PROVEN | privileged ss maps `*:80` to apache2 process family including MainPID 852 |
| TCP/443 ownership | PASS / NONE | no listener observed on TCP/443 |
| PID file correlation | PASS | /run/nginx.pid exists, root:root 644, size 0, no PID; no live nginx; systemd MainPID=0 |
| Fresh nginx -t | PASS | syntax OK/test successful; exit 0; duplicate staging-admin warnings only |
| MarketlyAI fingerprint | PASS | `f4416d9dfbb60ff10ff40cf5dede082dc81aa13868da4299cd5972139ff339d6` unchanged |
| F11 route | PASS / ABSENT | grep exit 1 |
| Root cause | **PROVEN** | `APACHE_PORT_80_OWNERSHIP_BLOCKS_NGINX_STARTUP_AFTER_REBOOT`; apache2 acquired TCP/80 before nginx bind attempts; nginx failed bind and exited status 1 |
| Non-causes | PASS / EXPLICIT | not Nginx syntax failure; not MarketlyAI config corruption; not F11 route failure; not Provider failure; not Zernio failure |
| Apache workload intent | UNVERIFIED | dependency ownership / intended workload **NOT YET VERIFIED**; no stop/repair decision made |
| Repair executed | NO | diagnostic-only; recommendation documented separately |
| Nginx start/restart/reload/stop | PASS / ZERO | `0` |
| reset-failed / daemon-reload | PASS / ZERO | `0 / 0` |
| config mutation | PASS / ZERO | `0` |
| process signals/kills | PASS / ZERO | `0` |
| receiver/tunnel | PASS / ZERO | `0 / 0` |
| Provider activity | PASS / ZERO | Zernio/auth/Accounts/Analytics/webhook/post/contact all `0` |
| F11 authorization consumption | PASS / NO | remains `AUTHORIZED / UNCONSUMED` |
| Final classification | DONE / ACCEPTED | `NGINX_FAILED_STATE_ROOT_CAUSE_PROVEN`; accepted evidence HEAD `b7652550a5f0e131bf00d74bcbdb688aff368ff0` |
| Canonical state | PASS | F11-F05 `DONE / ACCEPTED`; root cause `APACHE_PORT_80_OWNERSHIP_BLOCKS_NGINX_STARTUP_AFTER_REBOOT`; Apache intent `NOT YET VERIFIED`; F11 blocked pre-provider/unconsumed; authorization unconsumed; parent P1-T08 unresolved; Analytics SPIKE_PENDING; Current Task parent P1-T08; Next Task NOT_STARTED |


## P1-T08-F11-F06 - Apache Workload Attribution Matrix

Status: **DONE / ACCEPTED**. Final classification: **APACHE_DEPENDENT_WORKLOAD_PROVEN**. Accepted evidence HEAD: `3d62dc830500f818dce82df48a0c4f8bf8431b3c`. Workload: **APACHE_SERVES_ACTIVE_ELITE_WORDPRESS_WORKLOAD**. Conflict: **APACHE_AND_NGINX_REQUIRE_TCP_80_UNDER_CURRENT_TOPOLOGY**. Business intent: **NOT FULLY ATTRIBUTED**. Evidence: **PRE-PROVIDER INFRASTRUCTURE ATTRIBUTION EVIDENCE — NOT Provider Behavior evidence**.

| Gate | Result | Evidence |
|---|---|---|
| Activation before attribution | PASS | activation HEAD `c25195be062e269dd6608cba2ef620392d784990` |
| Repository/source integrity | PASS | starting HEAD `85a640d535736433ed38d9f48a857003c87acd7f`; no source/test/package changes |
| Apache service state | PASS / OBSERVED | loaded, active/running, enabled; MainPID 852; ControlPID 0; no drop-ins; active since `10:11:26 UTC` |
| Port ownership | PASS | privileged `ss`: TCP/80 Apache family including PID 852; TCP/443 no listener observed |
| Apache unit definition | PASS | Type=forking; apachectl start/stop/graceful; Restart=on-abort; WantedBy multi-user.target |
| Enabled-site inventory | PASS / COMPLETE | exactly one enabled symlink: `elite.restartorg.com.conf` |
| Site source/provenance | PASS | source in sites-available; root-owned; not owned by a Debian package according to dpkg-query |
| Vhost mapping | PASS | sole observed `*:80` mapping -> `elite.restartorg.com` |
| ServerAlias | NONE OBSERVED | no ServerAlias directive in enabled site |
| DocumentRoot | PASS | `/var/www/elite.restartorg.com/html`, exists, www-data:www-data, mode 755 |
| Proxy/backend target | NONE OBSERVED | no ProxyPass/ProxyPassReverse/WSGI/Alias/FastCGI target in enabled-site directives inspected |
| Relevant modules | PASS | php7_module + rewrite_module enabled |
| Workload markers | PASS | WordPress top-level names/metadata: index.php, wp-admin, wp-content, wp-includes, wp-config.php, etc.; no secret contents read |
| Local Host-header correlation | PASS | HEAD to 127.0.0.1:80 Host elite.restartorg.com -> HTTP 200, Apache server header, WordPress REST/shortlink headers; no body retrieved |
| Public DNS attribution | PASS / CORROBORATING | elite.restartorg.com resolves to 82.29.177.121, same VPS; not used alone to infer intent |
| Sensitive-data boundary | PASS | no .env contents, credentials, DB/customer/patient data, uploads, request bodies, access-log dump, private keys, tokens, or wp-config.php contents read |
| Dependent Apache workload | **PROVEN** | enabled custom vhost -> existing WordPress DocumentRoot -> Apache/PHP runtime -> HTTP 200 Host-header correlation |
| Organizational/business intent | NOT FULLY ATTRIBUTED | active runtime workload proven; elite business ownership/organizational intent not inferred |
| Canonical workload finding | PROVEN | `APACHE_SERVES_ACTIVE_ELITE_WORDPRESS_WORKLOAD` |
| Current topology conflict | PROVEN | `APACHE_AND_NGINX_REQUIRE_TCP_80_UNDER_CURRENT_TOPOLOGY`; accepted root cause remains `APACHE_PORT_80_OWNERSHIP_BLOCKS_NGINX_STARTUP_AFTER_REBOOT` |
| Fresh nginx -t | PASS | privileged syntax/config test successful, exit 0 |
| MarketlyAI fingerprint | PASS | `f4416d9dfbb60ff10ff40cf5dede082dc81aa13868da4299cd5972139ff339d6` unchanged |
| F11 route | PASS / ABSENT | grep exit 1 |
| Apache start/stop/restart/reload | PASS / ZERO | `0` |
| Apache enable/disable | PASS / ZERO | `0` |
| Nginx state/config mutation | PASS / ZERO | `0` |
| Config/port/DNS/firewall/systemd mutation | PASS / ZERO | `0` |
| Process signals/kills | PASS / ZERO | `0` |
| Provider activity | PASS / ZERO | Zernio/auth/Accounts/Analytics/webhook/post/contact all `0` |
| F11 authorization consumption | PASS / NO | remains `AUTHORIZED / UNCONSUMED` |
| Final classification | DONE / ACCEPTED | `APACHE_DEPENDENT_WORKLOAD_PROVEN`; accepted evidence HEAD `3d62dc830500f818dce82df48a0c4f8bf8431b3c` |
| Decision state | DECISION REQUIRED | `PORT OWNERSHIP / REVERSE-PROXY TOPOLOGY`; no repair/topology option selected |
| Canonical state | PASS | F11-F06 `DONE / ACCEPTED`; workload proven; business intent not fully attributed; F11 blocked pre-provider/unconsumed; authorization unconsumed; parent P1-T08 unresolved; Analytics SPIKE_PENDING; Current Task parent P1-T08; Next Task NOT_STARTED |


## P1-T08-F11-F07 - Canonical Decision / Cutover Preflight Gate Matrix

Status: **DONE / ACCEPTED**. Final classification: **CANONICAL_DECISION_DOC_UNAVAILABLE**. Accepted evidence HEAD: `31f4092903c735fb5e39c0c76d6056e916df5a57`. Architecture approval: **YES**. Canonical D-038 registration: **NO**. Architecture decision: **APPROVED BUT NOT YET CANONICALLY REGISTERED**. Evidence: **PRE-PROVIDER INFRASTRUCTURE CUTOVER PREFLIGHT GATE EVIDENCE — NOT Provider Behavior evidence**.

| Gate | Result | Evidence |
|---|---|---|
| Repository starting state | PASS | starting HEAD `e8ee199d11a05bf776ebcd609447a505cda67315`; branch correct; clean; remote matched |
| Activation before preflight | PASS | activation HEAD `03e73a002591281391822b5ac4c48a3f2d31073a`; PROGRESS-only activation committed/pushed |
| Approved topology input | PASS / RECEIVED | Option A: Nginx public edge + Apache loopback backend, current Phase-1 VPS scope only |
| Canonical DECISIONS source located | PASS | Project-backed `DECISIONS.md` readable |
| Current latest accepted decision | PASS / OBSERVED | D-037 present as latest accepted entry |
| D-038 registration | **BLOCKED / NOT PERFORMED** | no safe write-back path to same Project-backed canonical source |
| Duplicate/substitute Source of Truth | PASS / NONE | no replacement `DECISIONS.md` created in spike repo, Library, or local workspace |
| Google Drive canonical candidate | NONE FOUND | connected Drive search returned no writable `DECISIONS.md` |
| Local canonical workspace copy | NONE FOUND | authorized user-workspace search returned no `DECISIONS.md` |
| Infrastructure preflight | NOT STARTED | mandatory stop occurred before VPS inspection |
| Apache/Nginx service/socket inspection | NOT RUN | prerequisite D-038 registration failed |
| Candidate loopback backend port | NOT SELECTED | not inspected/bound |
| Config fingerprints / vhost inventory | NOT RUN | no preflight after stop |
| TLS / ACME / nginx -t F07 checks | NOT RUN | no preflight after stop |
| Patch / cutover / rollback plan | NOT PRODUCED | prerequisite canonical decision registration unavailable |
| Apache mutations | PASS / ZERO | `0` |
| Nginx mutations/state changes | PASS / ZERO | `0` |
| DNS/firewall/systemd/certificate/package mutations | PASS / ZERO | `0` |
| Receiver/tunnel / F11 execution | PASS / ZERO | none; F11 not executed |
| Provider activity | PASS / ZERO | Zernio/auth/Accounts/Analytics/webhook/post/contact all `0` |
| F11 authorization consumption | PASS / NO | remains `AUTHORIZED / UNCONSUMED` |
| Architecture approval | PASS / YES | `OPTION A — NGINX PUBLIC EDGE + APACHE LOOPBACK BACKEND` |
| Canonical D-038 registration | NOT COMPLETED | architecture approved but not yet canonically registered; write-back path unavailable through current tooling |
| Final classification | DONE / ACCEPTED | `CANONICAL_DECISION_DOC_UNAVAILABLE`; accepted evidence HEAD `31f4092903c735fb5e39c0c76d6056e916df5a57` |
| Canonical state | PASS | F11-F07 DONE/ACCEPTED; F11 blocked pre-provider/unconsumed; authorization unconsumed; parent unresolved; Analytics SPIKE_PENDING; Current Task parent P1-T08; Next Task NOT_STARTED |


## P1-T08-F11-F08 - Canonical Replacement Artifact Matrix

Status: **DONE / ACCEPTED**. Final classification: **CANONICAL_REPLACEMENT_ARTIFACT_PREPARED**. Accepted evidence HEAD: `234839de7d602c5dd1238aac4054afde2b5d2ddd`. Candidate integrity: **TEAM LEADER INDEPENDENTLY VERIFIED**. Evidence: **PRE-CANONICAL DOCUMENT REPLACEMENT ARTIFACT EVIDENCE — NOT Provider Behavior evidence**.

| Gate | Result | Evidence |
|---|---|---|
| Starting repository state | PASS | HEAD `7c9fb23f5a117b93d5536730fbd2f7b505c65233`; branch correct; clean/remote matched |
| Activation before artifact preparation | PASS | activation HEAD `9b51597a092f5229a0a4bc30716361f9f77019db`; PROGRESS-only commit/push |
| Canonical source identity | PASS | `DECISIONS.md`; source_kind `project`; ref `file_0000000084d082109bb2da7793c2753b`; version `1` |
| Raw source materialization | PASS | exact raw file available; no reconstruction from snippets |
| Latest original decision | PASS | D-037 — Healthcare Sensitive-Inbox Retention and LLM Boundary |
| Original D-038 absent | PASS | count `0` before append |
| Original bytes | PASS | `14871` |
| Original SHA-256 | PASS | `e179b318e4db3f1cc62b2bf25345ff652923aeb535f4afa622f146bacbe7241c` |
| Candidate outside repo | PASS | `DECISIONS.D-038.candidate.md`; prepared/accepted/not canonical |
| Candidate bytes | PASS | `15743` |
| Byte delta | PASS | `872` |
| Candidate SHA-256 | PASS | `d426c0232ff048bbc0fd0d6918ad955ff7d0daebaebd5df23f5d7a7840d9b237` |
| Original byte prefix preserved | PASS | candidate first `14871` bytes equal original exactly; independently re-verified by Team Leader |
| Diff removed lines | PASS / ZERO | `0` |
| Diff scope | PASS | only D-038 appended at EOF |
| Existing D-001..D-037 modified | PASS / NO | no edits/reorder/reformat/renumber/delete |
| D-038 exact title | PASS | `D-038 — Phase-1 Test VPS Public Ingress Ownership` |
| D-038 status | PASS | `Accepted` |
| Canonical Project mutation | PASS / NO | original Project file not replaced or mutated |
| Canonical D-038 registration | NOT COMPLETED | candidate accepted, but Project replacement not yet performed; D-038 is not canonical |
| Infrastructure activity | PASS / ZERO | Apache/Nginx/systemd/socket/DNS/firewall/certificate/receiver/tunnel all `0` |
| Provider activity | PASS / ZERO | Zernio/auth/Accounts/Analytics/webhook/post/contact all `0` |
| F11 authorization consumption | PASS / NO | remains `AUTHORIZED / UNCONSUMED` |
| Final classification | DONE / ACCEPTED | `CANONICAL_REPLACEMENT_ARTIFACT_PREPARED`; accepted evidence HEAD `234839de7d602c5dd1238aac4054afde2b5d2ddd` |
| Canonical state | PASS | F11-F08 DONE/ACCEPTED; candidate prepared/accepted/not canonical; D-038 not registered; infrastructure preflight not started; F11 blocked pre-provider/unconsumed; authorization unconsumed; parent unresolved; Analytics SPIKE_PENDING; Current Task parent P1-T08; Next Task NOT_STARTED |

## P1-T08-F11-F09 - Nginx-Edge / Apache-Backend Cutover Preflight Matrix

Status: **EXECUTED — AWAITING TEAM LEADER REVIEW**. Final classification: **CUTOVER_PREFLIGHT_READY_OPERATOR_PRIVILEGE_REQUIRED**. Evidence: **INFRASTRUCTURE PREFLIGHT EVIDENCE — NOT PROVIDER BEHAVIOR**.

| Gate | Result | Evidence |
|---|---|---|
| Starting repository state | PASS | HEAD `eeeeaa6c4c8d3d84f7719c993c3292b2f87474a7`; branch correct; clean/remote matched |
| Activation before VPS inspection | PASS | activation HEAD `6e7797ed35aae173d22044a694e426b77345268b`; PROGRESS-only commit/push |
| Canonical D-038 | PASS | `REGISTERED / VERIFIED / ACCEPTED` |
| Fresh host identity | PASS | `marktuser@srv822206`; public IPv4 `82.29.177.121`; boot `2026-10-17 10:11:16 UTC` |
| DNS | PASS | MarketlyAI + Elite both resolve to `82.29.177.121` |
| Apache service | PASS / OBSERVED | enabled + active/running; MainPID `852`; Result success |
| Nginx service | PASS / OBSERVED | enabled + failed/failed; MainPID `0`; Result exit-code |
| Fresh journal detail | PRIVILEGE-LIMITED | current user cannot read system service journal entries |
| Public TCP/80 | PASS / REACHABLE | external workstation succeeds; Apache HTTP response observed |
| Public TCP/443 | PASS / ABSENT CURRENTLY | external workstation fails; VPS socket inventory has no 443 listener |
| Backend `127.0.0.1:18080` | PASS / FREE | no current IPv4/IPv6 listener observed |
| Privileged PID socket map | OPERATOR REQUIRED | non-interactive privilege unavailable |
| Apache vhost inventory | PASS / COMPLETE | only Elite enabled; `*:80`; no unrelated Apache vhost |
| Apache syntax | PASS | `apachectl -t` exit 0 |
| Apache runtime modules | PASS | mod_php 7.4 + rewrite; setenvif available; remoteip module available but not enabled |
| Apache ports.conf fingerprint | PASS | SHA `9d2d53be30cbb4c42af6b25458077db5b5ad1be4f5810fa2fee4a1d53ac604a2` |
| Apache Elite vhost fingerprint | PASS | SHA `85ce3df3c888430cbdd528c7cacded9fe6aa6fcf4c2ec18b99ae8a9580996b59` |
| Elite current HTTP baseline | PASS | HTTP 200 from Apache; WordPress Link headers; REST `url/home` both HTTP |
| MarketlyAI current public baseline | NOT READY / PROVEN | HTTP currently served as Elite by Apache default; public 443 unavailable |
| Host preservation behind proxy | PASS / NO ISSUE FOUND | Nginx proxy params preserve Host |
| Client IP preservation | CONFIG REQUIRED | enable/configure remoteip trusted only for loopback proxy |
| HTTPS detection behind proxy | CONFIG REQUIRED | current Apache ignores XFP; proposed SetEnvIf mapping required |
| Redirect-loop safety | FUTURE VALIDATION GATE | cannot be proven without cutover; no blind assumption |
| .htaccess/rewrite | PASS / NO ISSUE FOUND | rewrite enabled; no current `.htaccess` |
| PHP continuity | PASS / PLANNED | final workload remains Apache mod_php |
| Nginx version | PASS | `1.18.0` |
| Fresh Nginx syntax/effective config | OPERATOR REQUIRED | unprivileged check blocked by root-only Certbot live cert path; not classified as syntax failure |
| MarketlyAI Nginx fingerprint | PASS | SHA `f4416d9dfbb60ff10ff40cf5dede082dc81aa13868da4299cd5972139ff339d6` |
| Elite Nginx fingerprint | PASS | SHA `239a36f957928ec534ac79f06a6516ef495b789c803c43d5944acb5f4b880be6` |
| Shared proxy_params fingerprint | PASS | SHA `7cff43a9768c1112bb074e9f26aaa1173da6ef85a7a20838242e846835c8eeb2` |
| Elite TLS state | `ELITE_HTTPS_ALREADY_CONFIGURED` | enabled Nginx 443/cert refs + renewal metadata; no new cert/HSTS/forced redirect proposed |
| MarketlyAI/Elite cert identity/validity | OPERATOR REQUIRED | live cert directory root-only; privileged pre-gate required |
| ACME renewal metadata | PASS | both use nginx authenticator/installer |
| Unrelated Nginx hosts inventoried | PASS | all enabled configs enumerated; certificate refs have renewal configs |
| Duplicate staging-admin condition | PRE-EXISTING / PRESERVE | `staging-admin.save` duplicates name; no cleanup proposed |
| Proposed final topology | PASS / PRODUCED | Nginx public 80/443; Apache `127.0.0.1:18080`; no Apache public bind |
| Exact proposed patch | PASS / PRODUCED / NOT APPLIED | Apache ports/vhost + Elite Nginx only; MarketlyAI/unrelated files untouched |
| Cutover sequence | PASS / PRODUCED / NOT EXECUTED | drift, backups, config gates, bounded service transition, validation, later reboot plan |
| Rollback plan | PASS / PRODUCED / NOT EXECUTED | exact original file restore/module pre-state and Apache public-80 topology restoration |
| Future validation gates | PASS / DEFINED | syntax/cert/socket/Elite/MarketlyAI/unrelated/reboot objective gates |
| Non-interactive privilege | NOT AVAILABLE | password required; controlled human/operator privilege needed later |
| Config/service/DNS/firewall/cert/package mutations | PASS / ZERO | `0` |
| Provider activity | PASS / ZERO | Zernio/auth/Accounts/Analytics/Delta/webhook/post/contact all `0` |
| F11 execution / auth consumption | PASS | execution NO; authorization remains AUTHORIZED / UNCONSUMED |
| Final classification | PENDING TEAM LEADER REVIEW | `CUTOVER_PREFLIGHT_READY_OPERATOR_PRIVILEGE_REQUIRED` |
| Canonical pending-review state | PASS | F11-F09 executed/awaiting review; cutover not executed; F11 blocked pre-provider/unconsumed; parent unresolved; Analytics SPIKE_PENDING; Django implementation not started; Next Task NOT_STARTED |


## P1-T08-F11-F09-R01 — Privileged Read-Only Nginx/TLS Evidence Matrix

Evidence source: local operator capture `C:\Users\USER\Desktop\R01-privileged-readonly-capture.txt`; capture timestamp `2026-10-18T11:47:26Z`; host `srv822206.hstgr.cloud`; completion marker `R01_READ_ONLY_CAPTURE_COMPLETE`. The capture is outside the repository; no raw capture file was added to the repository. This is infrastructure evidence, not Provider Behavior evidence.

| ID | Check / captured command | Result | Classification / evidence |
|---|---|---|---|
| R01-01 | git branch --show-current; git rev-parse HEAD; git ls-remote; git status --short --branch | branch p1-t08-zernio-analytics-webhook; starting and remote HEAD both f3117c4cae755c2eec6df8638276a3781fcc75f2; working tree clean | **PASS — STARTING STATE VERIFIED** |
| R01-02 | Capture begin/end markers | capture starts 2026-10-18T11:47:26Z; R01_READ_ONLY_CAPTURE_COMPLETE; local tee exit 0 | **PASS — CAPTURE COMPLETE** |
| R01-03 | systemctl show/status nginx.service | Nginx enabled but failed; MainPID=0; Result=exit-code | **FAIL — NGINX NOT RUNNING** |
| R01-04 | systemctl show/status apache2.service | Apache enabled, active/running; MainPID 852; Result success | **PASS — APACHE ACTIVE** |
| R01-05 | journalctl -u nginx.service -u apache2.service --since '2026-10-17 00:00:00 UTC' --no-pager -n 150 -o short-iso-precise | exit 0; Nginx failed binding IPv4 and IPv6 TCP/80 with Address already in use; duplicate staging-admin warnings on ports 80/443 | **FAIL / WARNING — ROOT CAUSE EVIDENCE CAPTURED** |
| R01-06 | ss -ltnp and target-port socket query | Apache owns *:80; no TCP/443 or TCP/18080 listener appears in captured inventory | **FAIL — HTTPS NOT RESTORED; BACKEND ABSENT** |
| R01-07 | ps -eo pid,ppid,user,comm,args filtered for Nginx/Apache | Apache master PID 852 and listed workers; no Nginx process in filtered output | **PASS — PROCESS OWNERSHIP ATTRIBUTED** |
| R01-08 | nginx -t | exit 0; syntax OK / test successful; duplicate staging-admin warnings on 0.0.0.0:443 and 0.0.0.0:80 | **PASS WITH WARNINGS — DOES NOT PROVE SERVICE READINESS** |
| R01-09 | nginx -T | exit 0; 693 raw output lines; effective config directive summary captured; duplicate-name warnings remain | **PASS WITH WARNINGS — EFFECTIVE CONFIG REVIEWED** |
| R01-10 | /etc/nginx/sites-enabled listing, symlink targets, file SHA-256 | relevant enabled entries inventoried; staging-admin.save is a regular file included by wildcard and duplicates staging-admin | **PASS — INVENTORY; EXISTING DUPLICATE PRESERVED** |
| R01-11 | Effective vhost/listen/routing/certificate summary from nginx -T | 13 enabled source entries including staging-admin.save; no explicit default_server observed | **PASS — RELEVANT CONFIG INVENTORY; IMPLICIT DEFAULT ORDER RECORDED** |
| R01-12 | openssl x509 subject/issuer/serial/dates/SAN/fingerprint for MarketlyAI and Elite | exact values recorded in docs/PROVIDER_SPIKE_RESULTS.md | **PASS — BOTH TARGET LEAF CERTIFICATES READ** |
| R01-13 | openssl x509 -checkhost marketlyai.restartorg.com | hostname matches; exit 0 | **PASS — MARKETLYAI IDENTITY** |
| R01-14 | openssl x509 -checkhost elite.restartorg.com | hostname matches; exit 0 | **PASS — ELITE IDENTITY** |
| R01-15 | openssl x509 -checkend 0 for both targets | both report Certificate will not expire; exit 0; not-before checks PASS | **PASS — CURRENT VALIDITY PERIOD** |
| R01-16 | openssl verify using system CA file and configured chain for both targets | each target cert.pem: OK; exit 0 | **PASS — TARGET CHAIN VERIFICATION** |
| R01-17 | apachectl -t | exit 0; Syntax OK | **PASS — APACHE CONFIG SYNTAX** |
| R01-18 | apachectl -S | only enabled Apache vhost is Elite on *:80 | **PASS — APACHE VHOST MAP** |
| R01-19 | Six cutover-relevant file fingerprints and enabled Nginx site target fingerprints | exact SHA-256 values preserved in docs/PROVIDER_SPIKE_RESULTS.md; six primary values match historical F09 preflight values | **PASS — READ-ONLY FINGERPRINTS RECORDED** |
| R01-20 | Review-only patch vs captured effective config and fingerprints | no patch applied; Apache backend 18080 absent; Elite HTTP configured redirect differs from proposed no-forced-redirect proxy behavior; MarketlyAI application route not established | **NOT VERIFIED — CUTOVER MUST NOT PROCEED ON THIS EVIDENCE ALONE** |
| R01-21 | Staging-admin certificate SAN compatibility | staging-admin config points to staging-clinic certificate; R01 target checks did not validate this hostname | **NOT VERIFIED — NOT A PROVEN CERTIFICATE FAILURE** |
| R01-22 | External HTTPS reachability, post-cutover redirects/mixed-scheme behavior, Elite WordPress/PHP, unrelated-host regression | not exercised by this read-only capture | **NOT RUN / FUTURE SEPARATELY AUTHORIZED VALIDATION** |
| R01-23 | Final safety markers in capture | configuration mutations 0; service actions 0; port/listener changes 0; DNS/firewall/systemd changes 0; certificate/package operations 0; Provider calls 0; F11 execution NO; F11 authorization consumed NO | **PASS — ZERO PROHIBITED ACTIONS REPORTED** |

Interpretation gate: nginx -t and nginx -T both exited 0, but the running Nginx service remains failed because its captured startup attempt could not bind TCP/80. Syntax/effective-config success is not a recovery test. Both target certificates passed identity, current validity, and chain checks, but the absence of a TCP/443 listener means those results do not establish live HTTPS.

Final task state after Team Leader review: R01_DOCUMENTATION_FINALIZATION_ACCEPTED_WITH_NON_BLOCKING_NOTES (documentation commit `837a6ae41f10b3154f2f15e7be9ac9035b741f48`). This is not cutover approval, service recovery, F11 authorization consumption, or completion of parent P1-T08. Remaining routing, staging-admin SAN, and runtime regression gaps remain blockers for any future cutover.

### Documentation-only Git scope checks

| ID | Check | Result | Classification |
|---|---|---|---|
| R01-24 | `git diff --check` after final documentation edits | Exit `0` | **PASS — NO WHITESPACE ERRORS** |
| R01-25 | `git diff --name-only` | Only `PROGRESS.md`, `docs/PROVIDER_SPIKE_RESULTS.md`, and `docs/TEST_MATRIX.md` | **PASS — AUTHORIZED DOCUMENTATION FILES ONLY** |
| R01-26 | Source/test/package/infrastructure scope audit | No source, test, package, migration, or infrastructure files changed; no additional VPS commands or Provider calls after the captured read-only run | **PASS — SCOPE PRESERVED** |


### P1-T08-F11-F09-R02 - Remaining Pre-Cutover Evidence Gates

| ID | Check / command | Observed result | Classification |
|---|---|---|---|
| R02-01 | `git fetch origin p1-t08-zernio-analytics-webhook`; branch/HEAD/remote/status; pre-edit `git diff --check` | Branch correct; local and remote HEAD both `412c18dcf2abe91a7b023ec677d5630df82bbe62`; working tree clean; diff check exit 0 | **PASS - ACTIVATION BASELINE VERIFIED** |
| R02-02 | External Windows PowerShell `curl.exe` with 10-second timeout and `Test-NetConnection -Port 443` for MarketlyAI and staging-admin | Both curl attempts timed out (exit 28); TCP/443 to `82.29.177.121` failed for both | **FAIL - EXTERNAL HTTPS UNAVAILABLE** |
| R02-03 | `openssl x509 ... -checkhost staging-admin.restartorg.com` on configured staging-clinic fullchain | Hostname matches certificate; exit 0; SAN includes staging-admin and staging-clinic | **PASS - HOSTNAME/SAN** |
| R02-04 | `openssl x509 ... -checkend 0` | "Certificate will not expire"; exit 0; notAfter 2026-11-30 22:36:52 GMT | **PASS - CURRENT VALIDITY** |
| R02-05 | `openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt -untrusted .../chain.pem .../cert.pem` | Certificate OK; exit 0 | **PASS - TRUST CHAIN** |
| R02-06 | `sudo nginx -T 2>&1 | grep -n -B 4 -A 18 'staging-admin\.restartorg\.com'` | Effective dump includes both `sites-enabled/staging-admin` and `sites-enabled/staging-admin.save`; conflicting-name warnings on ports 80 and 443 say ignored | **PASS WITH WARNINGS - DUPLICATE INCLUDED; PRESERVE UNCHANGED** |
| R02-07 | MarketlyAI vhost directives plus bounded search for deployment/config files under `/etc/nginx`, `/etc/apache2`, `/etc/systemd/system`, `/opt`, `/srv`, `/var/www` | Target vhost returns 404 and has no explicit root/proxy_pass/fastcgi_pass; bounded search printed no matching paths | **NOT VERIFIED - AUTHORITATIVE APPLICATION ROUTE MISSING** |
| R02-08 | Read-only safety audit | No infrastructure/service/config mutations; no receiver/tunnel; Provider/Zernio calls 0; F11 not executed and authorization not consumed | **PASS - SAFETY BOUNDARY PRESERVED** |
| R02-09 | Documentation diff scope and `git diff --check` after edits | git diff --check exit 0; only three authorized documentation files changed; no source/test/package/infrastructure changes | **PASS - DIFF CHECK AND SCOPE VERIFIED** |

Interpretation gate: certificate hostname, validity, and trust-chain checks pass for staging-admin, but public TCP/443 remains unreachable. Effective configuration includes staging-admin.save and emits duplicate-name warnings; the file remains untouched. MarketlyAI intended application routing is still NOT VERIFIED because no authoritative deployment evidence was found in the bounded search and the current target vhost returns 404. Overall R02 result: **CUTOVER_PREFLIGHT_EVIDENCE_INCOMPLETE**. No cutover, repair, service action, or Provider operation is authorized by this evidence.

### P1-T08-F11-F09-R03 - Authoritative MarketlyAI Deployment Route Evidence

| ID | Check / command or source | Observed result | Classification |
|---|---|---|---|
| R03-01 | Activation commit, branch, local HEAD, tracking HEAD, live remote HEAD, working tree, diff check | Activation HEAD 9936921851cac6c55445425b8d12f2fbec9c6269 was pushed before investigation; local/tracking/live remote HEAD matched; working tree clean; diff check exit 0 | PASS - ACTIVATION VERIFIED BEFORE EVIDENCE COLLECTION |
| R03-02 | README.md:3-4 at source commit 804e9dea4b0fdf4e0454923a3f3cc6298dae8521; package.json:2-5, 8-20 | Repository explicitly identifies itself as the internal Provider Spike Harness, not the production application/monorepo; scripts are test/build/provider-runner scripts | PASS - CURRENT REPOSITORY IS NOT AUTHORITATIVE PRODUCTION APP SOURCE |
| R03-03 | Tracked file inventory and deployment-artifact path filter | 56 tracked files; zero paths matching conventional deployment/reverse-proxy/service artifact names | NOT VERIFIED - NO DEPLOYMENT MANIFEST IN THIS REPOSITORY |
| R03-04 | All-ref history path audit | Zero matching deployment-artifact paths in Git history | NOT VERIFIED - DOES NOT RULE OUT EXTERNAL SOURCE |
| R03-05 | Source-only git grep for hostname, proxy, server, and application-runtime markers | Only output was tests/provider-spike/p1-t08-f10.test.ts:8 using marketlyai.example.invalid; no production hostname/upstream was found in source/tests/config | NOT VERIFIED - TEST FIXTURE IS NOT A DEPLOYMENT ROUTE |
| R03-06 | All-ref application-source git log -G query | No matching commit output; exit 0 | NOT VERIFIED - NO AUTHORITATIVE ROUTE SOURCE IDENTIFIED |
| R03-07 | GitHub code search for exact hostname, marketlyai, and MarketlyAI deployment route | No search results in the searched index | BLOCKED / NOT VERIFIED - PRIVATE OR UNINDEXED SOURCES MAY EXIST |
| R03-08 | Vercel project searches (marketlyai, AI-Marketing-Manager, and repository GirgesAdam/AI-Marketing-Manager); Railway project-name inventory | Vercel filters returned zero projects; Railway returned two accessible projects, neither name matched the target identifiers | NOT VERIFIED - BOUNDED PLATFORM DISCOVERY ONLY |
| R03-09 | Existing R02 MarketlyAI vhost evidence, Provider Spike Results lines 2121-2127; R02 Test Matrix lines 1644-1648 | Captured vhost returns 404 and has no explicit root/proxy_pass/fastcgi_pass; intended route was already NOT VERIFIED | BLOCKED - AUTHORITATIVE APPLICATION UPSTREAM MISSING |
| R03-10 | R02 external connectivity results, Provider Spike Results lines 2088-2092 | R02 recorded TCP/443 connection timeouts on 2026-10-18; no R03 external connectivity recheck was performed | NOT RECHECKED - R02 RESULT IS HISTORICAL ONLY |
| R03-11 | Missing-source decision gate | No authoritative production repository/deployment manifest or custom-domain-to-service mapping found in examined sources | NOT VERIFIED — AUTHORITATIVE MARKETLYAI DEPLOYMENT ROUTE NOT FOUND |
| R03-12 | Safety boundary audit | No VPS commands, service actions, infrastructure changes, Provider/Zernio calls, receiver/tunnel setup, or F11 execution during R03 | PASS - READ-ONLY BOUNDARY PRESERVED |
| R03-13 | Documentation scope and final Git validation | Final acceptance commit validation and synchronization recorded in the completion report | PASS - PRE-COMMIT DIFF/SCOPE VALIDATED; POST-PUSH SYNC IN COMPLETION REPORT |
| R03-14 | Team Leader acceptance finalization | Team Leader decision recorded as ACCEPTED WITH NON-BLOCKING NOTES; reviewed R03 HEAD `61ea290706e3101bf9f6c64afacb4808c52f918b`; finalization scope is documentation-only | DONE / ACCEPTED WITH NON-BLOCKING NOTES; technical route result remains NOT VERIFIED |

Exact repository commands and observed results:

    git -C <repo> branch --show-current
    Result: p1-t08-zernio-analytics-webhook

    git -C <repo> rev-parse HEAD
    Result before evidence collection: 9936921851cac6c55445425b8d12f2fbec9c6269

    git -C <repo> ls-files
    Result count: 56 tracked files.

    git -C <repo> log --all --name-only --pretty=format:
    Followed by a PowerShell filename filter for Docker/Compose, Nginx/Apache/Caddy, deploy/release, systemd, Procfile, Vercel/Railway, WSGI/ASGI, Gunicorn/Uvicorn, YAML, and TOML patterns.
    Result: zero matching tracked paths in history.

    git -C <repo> grep -n -I -i -E 'marketlyai\.restartorg\.com|marketlyai|server_name|proxy_pass|manage\.py|gunicorn|uvicorn|docker|compose|caddy|systemd|procfile' HEAD -- src tests README.md package.json
    Exit: 0. Sole output: tests/provider-spike/p1-t08-f10.test.ts:8 with synthetic host marketlyai.example.invalid.

    git -C <repo> log --all --oneline -G 'marketlyai\.restartorg\.com|server_name marketlyai|proxy_pass|docker compose|gunicorn|uvicorn|manage\.py' -- . ':!PROGRESS.md' ':!docs/PROVIDER_SPIKE_RESULTS.md' ':!docs/TEST_MATRIX.md'
    Result: no matching commit output; exit 0.

Interpretation gate: repository and bounded deployment-source searches do not establish the intended MarketlyAI application route. A successful search command or the existence of the historical Nginx vhost is not proof of application correctness. The precise missing input is the authoritative application deployment artifact mapping marketlyai.restartorg.com to its intended service/upstream, plus owner confirmation of hostname purpose if the artifact does not establish intent. Cutover remains BLOCKED. R02 evidence remains historical and unchanged. No successor task is activated.

Additional exact documentation validation commands:

    git -C <repo> diff --check
    Result before commit: exit 0.

    git -C <repo> diff --name-only
    Result before commit:
    PROGRESS.md
    docs/PROVIDER_SPIKE_RESULTS.md
    docs/TEST_MATRIX.md

    git -C <repo> status --short --branch
    Result before evidence commit: only those three authorized documentation files modified; no source/test/package/infrastructure files modified.

### R03 acceptance finalization (2026-10-18)

Task status: **DONE / ACCEPTED WITH NON-BLOCKING NOTES**.

Team Leader disposition: **ACCEPTED WITH NON-BLOCKING NOTES**; reviewed R03 HEAD: `61ea290706e3101bf9f6c64afacb4808c52f918b`; R03 evidence/documentation commit: `dc00d5d42ec0b7506f27b1e22a45bcb77d87a49b`.

Technical result remains exactly: **NOT VERIFIED — AUTHORITATIVE MARKETLYAI DEPLOYMENT ROUTE NOT FOUND**. Acceptance covers evidence/investigation/documentation quality only and does not establish the application route, select an upstream, certify live HTTPS, or authorize cutover.

Canonical state: Parent P1-T08 **UNRESOLVED / NOT DONE**; cutover **BLOCKED**; Analytics Webhook `SPIKE_PENDING`; F11 **UNCONSUMED / BLOCKED PRE-PROVIDER**; one-run authorization **AUTHORIZED / UNCONSUMED**; Next Task **NOT_STARTED**. R02 connectivity evidence remains historical; no R03 external connectivity check, Provider/Zernio action, F11 execution, or infrastructure mutation was performed.

The finalization commit and post-push verification results are recorded in the task completion report. No source code, tests, package configuration, or infrastructure files were changed.
### P1-T08-F11-F09-R04 - deployment mapping evidence

| ID | Read-only check / source | Observed result | Classification |
|---|---|---|---|
| R04-01 | Pre-investigation Git gate | Branch `p1-t08-zernio-analytics-webhook`; local/live HEAD `a9a8cae46e6f056c60e913e290a1cac5d546945e`; working tree clean | PASS |
| R04-02 | Current AI Marketing Manager HEAD: README/package/runtime/deployment path filter | Repository explicitly remains Phase-1 Provider Spike Harness; 56 tracked files; zero production runtime/deployment path matches; no MarketlyAI/Django/Next runtime token matches outside historical evidence docs | REJECTED AS PRODUCTION APP SOURCE |
| R04-03 | GitHub visible/installed repository discovery + serious candidate inspection | `Linka_AI`, `tia`, `flowops-ai-business-agent`, and `securelife-local-ai-assistant` are distinct products/stacks; none links to `marketlyai.restartorg.com` | NO AUTHORITATIVE MARKETLYAI SOURCE FOUND |
| R04-04 | GitHub code searches: `manage.py`, `marketlyai.restartorg.com`, `next.config` | No results; relevant repository code-search indexing unavailable, so no-result is not treated as proof of absence | SUPPORTING / COVERAGE-LIMITED |
| R04-05 | `GirgesAdam/Linka_AI` source revision | `main` = `1f3667c96b5adfe1c4ad97bc5ef334c6dcb21793`; FastAPI + Next.js clinic platform | REJECTED - DIFFERENT PRODUCT |
| R04-06 | `GirgesAdam/tia` source revision | `main` = `8df5845eabf49f6d030dce797bb8c3d790c9db0c`; FastAPI clinic platform | REJECTED - DIFFERENT PRODUCT |
| R04-07 | `GirgesAdam/flowops-ai-business-agent` source revision | `main` = `b91aa75426c66198db972cbb21e04fda8d9e7cde`; separate FastAPI/LangGraph B2B operations product | REJECTED - DIFFERENT PRODUCT |
| R04-08 | `GirgesAdam/securelife-local-ai-assistant` source revision | `main` = `6bcd0b9c2cbd2cb1efe8b60b8b41ff7c4d243f7d`; local/offline insurance demo | REJECTED - DIFFERENT PRODUCT |
| R04-09 | Connected Vercel team project inventory | Exactly two projects: `tia-ai-staging` -> `Linka_AI`; `flowops-ai-business-agent` -> eponymous repo | NO MARKETLYAI PROJECT |
| R04-10 | Vercel domains | Linka/Tia domains and FlowOps `vercel.app` domain only; no `marketlyai.restartorg.com` | NO MARKETLYAI HOSTNAME BINDING |
| R04-11 | Vercel production deployments | Linka latest `READY` at `1f3667c...`; FlowOps latest `READY` at `1791d93...`; neither maps MarketlyAI hostname | REJECTED DEPLOYMENTS |
| R04-12 | Connected Railway workspace project/service inventory | Two projects; only `remarkable-kindness` has five Tia-related services; `surprising-intuition` has none | NO MARKETLYAI PROJECT/SERVICE |
| R04-13 | Railway domain inventory | Tia Railway-generated domains only; no custom domains on `tia-api`; no MarketlyAI hostname | NO MARKETLYAI HOSTNAME BINDING |
| R04-14 | Railway `tia-api` service/deployment metadata | Source `GirgesAdam/Linka_AI` main/root `backend`; Uvicorn/8000; successful deploy commit `1f3667c...` | COMPLETE LINKA CHAIN, REJECTED FOR MARKETLYAI |
| R04-15 | Conditional VPS correlation gate | No concrete MarketlyAI candidate emerged from Stage A/B; VPS not accessed | PASS - NO BROAD R03 REPEAT |
| R04-16 | Final evidence-chain test | No authoritative MarketlyAI source -> deployment -> hostname -> runtime chain established within accessible sources | `NO_AUTHORITATIVE_MARKETLYAI_DEPLOYMENT_FOUND_WITHIN_ACCESSIBLE_SOURCES` |
| R04-17 | Safety boundary | No source/test/package, infrastructure, deployment, service, DNS/TLS, Provider/Zernio, receiver/tunnel, or F11 actions | PASS |

Interpretation: `NO_AUTHORITATIVE_MARKETLYAI_DEPLOYMENT_FOUND_WITHIN_ACCESSIBLE_SOURCES` is bounded to the connected/accessible sources inspected. It is not a global non-existence claim. No specific inaccessible MarketlyAI source was discovered; if another private/unconnected repository or deployment control plane exists, it must be supplied or connected to continue.

Required canonical state remains: Parent P1-T08 `UNRESOLVED / NOT DONE`; Analytics Webhook `SPIKE_PENDING`; Cutover `BLOCKED`; F11 `UNCONSUMED / BLOCKED PRE-PROVIDER`; one-run authorization `AUTHORIZED / UNCONSUMED`; Next Task `NOT_STARTED`.

## P1-T08-F11 - One-Run Data-Bearing Experiment Pre-Provider Result

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `TECHNICAL_BLOCKER — PRE_PROVIDER`.

| Gate | Result | Evidence |
|---|---|---|
| Activation committed/pushed before Provider call | PASS | activation `05f5f1bea03838054162201a2a62a6a4ef8b77fc`; Provider requests remained `0` |
| Accepted ingress topology | PASS | Nginx active on public TCP/80+443; Apache active on loopback-only `127.0.0.1:8080`; receiver active/disabled on `127.0.0.1:8765`; Apache no public 80/443 |
| Public MarketlyAI root | PASS | HTTPS `/` = `404`, no redirect |
| Exact F11 receiver route | PASS | HTTPS `HEAD /p1-t08-f11/analytics-synced` = `200` |
| Near-miss route | PASS | `404` |
| Real F11 evidence files before Provider | PASS | `0` |
| Synthetic webhook POST | PASS / ZERO | none issued |
| Accepted F10/P1-T08 deterministic validation command | BLOCKED BEFORE TEST EXECUTION | `npm test -- tests/provider-spike/p1-t08-f10.test.ts tests/provider-spike/p1-t08.test.ts` reached npm script but `vitest` executable was unavailable |
| Workspace dependency state | BLOCKER CONFIRMED | `node_modules` absent; Vitest binary absent; TSC binary absent; `package-lock.json` present |
| Typecheck | NOT RUN | F11 stop rule applied after harness validation blocker |
| Build | NOT RUN | F11 stop rule applied after harness validation blocker |
| Pre-documentation git diff check | PASS | `git diff --check` exit `0` |
| Provider authorization consumption | NOT CONSUMED | no trusted Zernio request sent |
| Provider requests | PASS / ZERO | `0 normal / 0 cleanup / 0 total` |
| Analytics / Delta | NOT RUN | `0 / 0` calls |
| Webhook create/read/delete | NOT RUN | `0` Provider calls |
| Publish | NOT RUN | `0` attempts; `0` posts |
| Cleanup | N/A | no Provider artifact created |
| Infrastructure mutation under F11 | PASS / ZERO | `0` |

Per the F11 Harness Gate, no dependency installation or harness/production/spike fix was performed inside F11 after validation failed to start. Parent P1-T08 remains `UNRESOLVED / NOT DONE`; Analytics Webhook remains `SPIKE_PENDING`; F11 one-run authorization remains `AUTHORIZED / UNCONSUMED` pending Team Leader review.

## P1-T08-F11-H01 - Harness Dependency Restoration / Pre-Provider Revalidation

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `HARNESS_GATE_RESTORED`.

| Gate | Result | Evidence |
|---|---|---|
| Starting HEAD / clean canonical gate | PASS | `aaffeb7c1a050cc405a7e26608f2ba2d8bedc201`; Local=Tracking=Live Remote; clean tree |
| Activation before install | PASS | `971e87eb9005c4ec7461d9e177123d755f8b70bb` pushed before `npm ci` |
| Package contract | PASS | package + lock exist; lockfileVersion `3`; Vitest test script; TypeScript typecheck script; devDependencies already declared |
| Node / npm | INFO | Node `v24.21.0`; npm `11.19.0` |
| package.json SHA before/after | PASS / unchanged | `4a2f08bfbc1f3ed55eb029cc6f81c3d8c05da6707357becb3ba66d3d47f9b18d` |
| package-lock.json SHA before/after | PASS / unchanged | `33d3de57ba95cf296a4b23f2341f4178b5cf436ee818d06b146d021fdbd37675` |
| Authorized install command | PASS | exactly `npm ci`; exit `0`; 54 packages added / 55 audited; no other install command |
| Local dependency binaries | PASS | node_modules exists; Vitest `3.2.7`; TypeScript `5.9.3` |
| Tracked workspace drift after install | PASS / ZERO | clean tracked tree; node_modules untracked/ignored; package/lock unchanged |
| Focused F10/P1-T08 command | PASS | `npm test -- tests/provider-spike/p1-t08-f10.test.ts tests/provider-spike/p1-t08.test.ts`; `88 / 88` tests; 2 files; exit `0` |
| Typecheck | PASS | `npm run typecheck -- --pretty false`; exit `0` |
| Build | PASS | `npm run build -- --pretty false`; exit `0` |
| Full deterministic suite | PASS | `npm test`; `418 / 418` tests across 16 files; exit `0` |
| Unexpected live Provider transport in suite | NONE | deterministic/offline suite only |
| Git integrity pre-docs | PASS | status empty; diff-check `0`; cached-check `0`; package/lock diff empty |
| Source/test/package/lock fixes | PASS / ZERO | no such edits |
| Provider/Zernio calls | PASS / ZERO | `0` |
| Analytics / Delta | PASS / ZERO | `0 / 0` |
| Webhook operations | PASS / ZERO | create/read/delete all `0` |
| Publish attempts / posts | PASS / ZERO | `0 / 0` |
| F11 authorization consumed | NO | remains `AUTHORIZED / UNCONSUMED` |
| VPS/infrastructure mutation | PASS / ZERO | `0` |

The local harness environment is restored and the accepted pre-Provider Harness Gate is green. `P1-T08-F11` remains **NOT DONE** and is not authorized to resume live execution by H01. Parent P1-T08 remains `UNRESOLVED / NOT DONE`; Analytics Webhook remains `SPIKE_PENDING`.

## P1-T08-F11-H02 - Dependency Vulnerability Security / Readiness Gate

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `CRITICAL_AUDIT_FINDINGS_NOT_RUNTIME_REACHABLE_FOR_F11`.

| Gate | Result | Evidence |
|---|---|---|
| H01 prerequisite | PASS | `DONE / ACCEPTED WITH BLOCKING SECURITY NOTE`; `HARNESS_GATE_RESTORED` |
| H02 activation before audit | PASS | `2ca2ff594a85cef35891db1d1f9c931afb4144b6` pushed before audit |
| Audit command | PASS / findings present | exact `npm audit --json`; exit `1`; npm package-level totals: total `3`, critical `2`, moderate `1`; these package-result counts are distinct from individual GHSA advisory severities |
| Critical dependency chain | REVIEWED | root -> `vitest@3.2.7` -> `tinypool@1.1.1`; Vitest direct devDependency, Tinypool transitive |
| Advisory severities | CORRECTED | Critical: `GHSA-85c8-ppgw-ccpr`; High: `GHSA-5gmw-xhrv-c9v3`; Moderate: `GHSA-82fw-gwwq-j7x9` |
| Tinypool runtime reachability | NOT REFERENCED | compiled F11 runtime trace has no Vitest/Tinypool imports; no worker-pool API path |
| Vitest package-level critical reachability | BUILD_TEST_ONLY | direct dev test runner; absent from F11 source/dist runtime import graph |
| Moderate finding | REVIEWED | `@vitest/mocker@3.2.7`, `GHSA-82fw-gwwq-j7x9`, root -> Vitest -> mocker; dev-server/mock path not exposed by F11 |
| F10 compiled runner trace | PASS | 9 local modules + Node built-ins only; bare npm imports `[]`; vulnerable imports `[]` |
| Parent P1-T08 compiled runner trace | PASS | 8 local modules + Node built-ins only; vulnerable imports `[]` |
| Source/dist vulnerable-package search | PASS / ZERO | no `vitest`, `tinypool`, or `@vitest/mocker` references in `src` or `dist` |
| Build boundary | PASS | `tsconfig.build.json` includes source and excludes tests; build uses TypeScript |
| package.json SHA | PASS / unchanged | `4a2f08bfbc1f3ed55eb029cc6f81c3d8c05da6707357becb3ba66d3d47f9b18d` |
| package-lock.json SHA | PASS / unchanged | `33d3de57ba95cf296a4b23f2341f4178b5cf436ee818d06b146d021fdbd37675` |
| Dependency/source/test/config remediation | ZERO | none performed |
| Provider/Zernio calls | ZERO | `0` |
| Credentials loaded | NO | no live Provider credentials used |
| Publish / webhook / Analytics / Delta | ZERO | all `0` |
| VPS/infrastructure mutation | ZERO | `0` |
| F11 authorization consumed | NO | remains `AUTHORIZED / UNCONSUMED` |

Security triage conclusion: critical audit findings are outside the accepted F11 live runtime dependency/import attack surface. This gate does not self-authorize F11; live resume remains blocked pending Team Leader security review.

## P1-T08-F11-H02-F01 - Advisory Severity Documentation Correction

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `ADVISORY_SEVERITY_DOCUMENTATION_CORRECTED`.

| Correction | Result | Evidence |
|---|---|---|
| npm audit totals semantics | CORRECTED | package-level findings remain total `3`: critical `2`, moderate `1`; not a count of Critical GHSA advisories |
| `GHSA-85c8-ppgw-ccpr` | CORRECTED | severity `Critical`; Tinypool `1.1.1`; affected `<2.1.2`; patched `2.1.2`; reachability `NOT_REFERENCED_BY_F11_RUNTIME / BUILD_TEST_ONLY` |
| `GHSA-5gmw-xhrv-c9v3` | CORRECTED | severity `High`; Tinypool `1.1.1`; affected `<=2.1.0`; patched `2.1.1`; reachability `NOT_REFERENCED_BY_F11_RUNTIME / BUILD_TEST_ONLY` |
| `GHSA-82fw-gwwq-j7x9` | PRESERVED / CLARIFIED | severity `Moderate`; F11 does not start affected Vitest/Vite dev-server/mock path; runtime reachability `NO` |
| H02 technical classification | PRESERVED | `CRITICAL_AUDIT_FINDINGS_NOT_RUNTIME_REACHABLE_FOR_F11`, where critical audit findings means npm package-level critical findings |
| H02 acceptance state | PENDING | `P1-T08-F11-H02 = NOT ACCEPTED YET — PENDING TEAM LEADER RE-REVIEW` |
| F11 live resume | BLOCKED | no authorization change |
| Audit/dependency/Provider/runtime mutation | ZERO | documentation-only correction |


## P1-T08-F11-RCV01 - Live Receiver / Harness Compatibility Gate

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `TEMPORARY_NODE_RECEIVER_HANDOFF_REQUIRED`.

| Gate | Result | Evidence |
|---|---|---|
| Canonical starting state | PASS | starting HEAD `3d981153081a5bc11cd5c99a2f808745fba8b782`; Local=Tracking=Live Remote; clean tree; H01/H02/H02-F01 accepted; F11 authorization `AUTHORIZED / UNCONSUMED`; Provider requests `0` |
| Activation before inspection | PASS | `7aa2972eb2f99bdb03cc80532e9d4705a9cb6a2b` pushed before VPS/receiver inspection |
| Accepted local Node receiver bind/path | REVIEWED | loopback `127.0.0.1`; approved configured local port; receiver path = public F11 URL pathname |
| Public readiness handshake | INCOMPATIBLE WITH STATIC RECEIVER | accepted harness sends two HTTPS `POST`s with readiness/confirmation headers and requires `401` plus matching `x-aimm-p1-t08-receiver` marker from the same Node receiver instance |
| Node receiver HMAC / event validation | REQUIRED | per-run HMAC-SHA256 secret; header/body ID + event equality; profile/account/platform target validation; duplicate tracking |
| Node controller state | REQUIRED | `snapshot()`, `waitForAnalytics(...)`, readiness counters and structured in-memory delivery evidence feed F10 observation/classification |
| Static receiver source | REVIEWED | `/opt/marketly-r02/receiver.py` SHA `f2851eac800b417ec870083f7acb69f0fa231fdea645c96b328736486fa7dcb9` |
| Static receiver unit | REVIEWED | SHA `c0d3c948068ebbd5c315e88d6a305e3dc2a66a18f497470a3ef88c547c9ff1d7`; active; boot `disabled` |
| Static receiver behavior | NOT HARNESS-COMPATIBLE | fixed `127.0.0.1:8765`; exact path; GET/HEAD `200`; POST persists body+metadata then `204`; no readiness protocol/HMAC/target validation/dedup/controller state |
| MarketlyAI Nginx route | PASS / unchanged | config SHA `7a54f35600a606b3e774c70a3bb03f3b01b4b2ec34851a79ea4daa51bc2f1a06`; exact route proxies to `127.0.0.1:8765` |
| Public generic root | PASS | HTTPS `/` = `404` |
| Public exact route | PASS / non-capturing | HTTPS `HEAD /p1-t08-f11/analytics-synced` = `200` |
| Public near-miss | PASS | `404` |
| F11 evidence files | PASS / ZERO | fresh privileged count `0` |
| Nginx listener topology | PASS | public TCP/80 + TCP/443 |
| Apache listener topology | PASS | loopback-only `127.0.0.1:8080`; no public 80/443 |
| Receiver listener topology | PASS | `127.0.0.1:8765` owned by static Python receiver |
| Direct static receiver compatibility (Question A) | NO | cannot satisfy accepted readiness/HMAC/validation/controller semantics unchanged |
| Node handoff required (Question B) | YES | public route must temporarily reach same per-run Node receiver instance before F10 live run can proceed |
| Reverse-tunnel feasibility | PROVEN READ-ONLY | SSHD: `allowtcpforwarding yes`, `disableforwarding no`, `permitopen any`, `gatewayports no`; Nginx can remain unchanged while remote loopback `8765` is handed to tunnel |
| Synthetic/readiness POST in RCV01 | ZERO | none sent; static collector would persist POST evidence |
| Receiver/service/tunnel mutation | ZERO | no restart/reload/start/stop and no SSH tunnel created |
| Provider/Zernio / Analytics / Delta | ZERO | all `0` |
| Webhook / publish | ZERO | create/read/delete and publish all `0` |
| Provider credentials loaded | NO | no live credentials used |
| F11 authorization consumed | NO | remains `AUTHORIZED / UNCONSUMED` |

Future handoff plan is proposal-only: capture pre-state and evidence count, preserve static receiver hashes/state, stop static receiver only if required to free VPS loopback `8765`, bind one reverse tunnel from VPS loopback `8765` to the accepted local Node receiver, prove listener ownership and readiness, allow Provider transport only after readiness PASS under separate authorization, then close tunnel and restore/reverify the static receiver with Nginx unchanged. Pre-Provider tunnel/readiness failure must deterministically roll back to the accepted static receiver and preserve evidence without deletion.

## P1-T08-F11-LR01 - One-Run Live Resume Pre-Provider Stop

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `TECHNICAL_BLOCKER — PRE_PROVIDER`.

Exact blocker stage: `LIVE_CREDENTIAL_SOURCE_UNAVAILABLE_AFTER_HANDOFF_BEFORE_RUNNER`.

| Gate | Result | Evidence |
|---|---|---|
| Canonical starting state | PASS | starting HEAD `1891a8c59fb10a15950ebd01ccdef7b6e6ffca8a`; Local=Tracking=Live Remote; clean tree; H01/H02/H02-F01/RCV01 accepted; F11 authorization `AUTHORIZED / UNCONSUMED`; Provider requests `0` |
| LR01 activation before live/infra action | PASS | activation `5cdfa43c4418c89be52e67175c07bfe11907df59` pushed and live remote verified |
| Focused deterministic validation | PASS | `npm test -- tests/provider-spike/p1-t08-f10.test.ts tests/provider-spike/p1-t08.test.ts`; `88 / 88`; exit `0` |
| Typecheck | PASS | `npm run typecheck -- --pretty false`; exit `0` |
| Build | PASS | `npm run build -- --pretty false`; exit `0` |
| Git diff check pre-handoff | PASS | exit `0` |
| Pre-handoff hashes | PASS | receiver `f2851e...dcb9`; unit `c0d3c9...f1d7`; Nginx `7a54f3...1a06` |
| Pre-handoff topology | PASS | Nginx public 80/443; Apache loopback `127.0.0.1:8080`; static receiver `127.0.0.1:8765`, active, boot disabled |
| Pre-handoff public routes | PASS | root `404`; exact HEAD `200`; near-miss `404` |
| Pre-handoff evidence files | PASS / ZERO | `0` |
| Selected local port | PASS | `18765`; free before use; loopback-only destination |
| Static receiver stop | PASS | one authorized stop; boot remained `disabled`; VPS `8765` proven free |
| Reverse tunnel bind | PASS | exactly one fail-fast reverse forward; VPS loopback `127.0.0.1:8765` owned by `sshd`; local destination `127.0.0.1:18765` |
| Nginx unchanged after bind | PASS | accepted SHA unchanged; no edit/reload |
| Authorized credential mechanism | BLOCKED | repo `.env` absent; required Zernio credential/identity keys absent from process/user/machine env; values never loaded or printed |
| Runner launch | NOT RUN | stopped before launch because previously authorized credential source unavailable |
| Readiness handshake | NOT RUN / ZERO | readiness POSTs `0` |
| Provider authorization consumption | NO | first trusted Zernio request never sent; remains `AUTHORIZED / UNCONSUMED` |
| Provider normal/cleanup/total requests | ZERO | `0 / 0 / 0` |
| Analytics / Delta | ZERO | `0 / 0` |
| Webhook operations | ZERO | create/read/delete all `0` |
| Publish attempts / posts | ZERO | `0 / 0` |
| Tunnel cleanup | PASS | wrapper termination left exact child `ssh.exe`; exact reverse-forward child identified and terminated; no second tunnel created |
| Static receiver restoration | PASS | active; boot disabled; `127.0.0.1:8765` owned by Python static receiver |
| Final hashes | PASS / unchanged | receiver/unit/Nginx all accepted hashes |
| Final evidence files | PASS / ZERO | `0` |
| Final public routes | PASS | root `404`; exact HEAD `200`; near-miss `404` |
| Nginx/Apache/sshd config mutation | ZERO | `0` edits/reloads/config changes |
| DNS/TLS/firewall changes | ZERO | `0` |

No Provider Behavior evidence was generated, so `docs/PROVIDER_SPIKE_RESULTS.md` remains unchanged. No second handoff attempt is authorized inside LR01. Parent P1-T08 remains `UNRESOLVED / NOT DONE`; Analytics Webhook remains `SPIKE_PENDING`.
## P1-T08-F11-CR01 - Credential Source Readiness / Recovery Mapping

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `AUTHORIZED_CREDENTIAL_SOURCE_READY`.

| Gate | Result | Safe evidence |
|---|---|---|
| Canonical starting state | PASS | starting HEAD `43111e2d773a068add1be8a191207a3d04cfadf0`; Local=Tracking=Live Remote; clean tree; LR01 accepted; F11 `NOT DONE / BLOCKED PRE_PROVIDER`; authorization `AUTHORIZED / UNCONSUMED`; Provider requests `0` |
| Runner source contract | PASS | runner SHA `e9b5cba967cccbda4f8f06c6070dbc536e88efaf08f6358ae059202aff299eab`; accepted mechanisms = process env or repo-root `.env` auto-load in live mode when required values absent |
| Provider transport source | PASS | F10 transport SHA `957ffe6a0042c4bf32e0865ab9f57c598d3451e9a4708a4e822f9576044db593`; missing API key fails closed before Provider request |
| Current repo-root `.env` | ABSENT | `.env` intentionally ignored; no `.env.example`; Git history shows real `.env` never tracked |
| Current process env | NOT READY | both required names present/populated = NO/NO |
| Current user env | NOT READY | both required names present/populated = NO/NO |
| Current machine env | NOT READY | both required names present/populated = NO/NO |
| PowerShell profiles / bounded history | NO SOURCE FOUND | no references to either required variable name |
| Previous source type | PROVEN | accepted P1-T02 evidence: authorized team credential sourced from local ignored `.env`; accepted P1-T05-F03 evidence: original ignored local `.env` injected into process memory, identity HTTP 200 |
| Historical local source availability | READY | `AI-Marketing-Manager-P1T01/.env` exists, is ignored, and both required names are present/populated; workspace branch `p1-t02-zernio-profiles`; no values exposed |
| Credential creation/rotation | ZERO | `0 / 0` |
| Provider credential use | NO | CR01 did not load/use credential for runner or Provider validation |
| Provider/Zernio calls | ZERO | `0`; `/v1/auth/verify` = `0` |
| Receiver/tunnel/readiness | ZERO | service actions `0`; tunnels `0`; readiness POSTs `0` |
| Source/test/package mutation | ZERO | documentation only after read-only investigation |
| F11 authorization consumed | NO | remains `AUTHORIZED / UNCONSUMED` |

Future ordering requirement: a separately authorized live retry must prove both required credential names are safely available to the accepted runner process **before** static receiver stop, reverse-tunnel creation, or readiness. CR01 does not clear the parent blocker or authorize credential loading, Provider calls, handoff, or F11 retry.

## P1-T08-F11-LR02 - Authorized Live Retry Pre-Provider Stop

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `TECHNICAL_BLOCKER — PRE_PROVIDER`.

Exact blocker stage: `RUNNER_LAUNCH_BLOCKED_BY_REMOTE_EXECUTION_SURFACE_AFTER_HANDOFF`.

| Gate | Result | Evidence |
|---|---|---|
| Canonical starting state | PASS | starting HEAD `4e52af7b304644ceee1c5a0bcc953a68c537f9c0`; Local=Tracking=Live Remote; clean tree; LR01/CR01 accepted; blocker cleared; F11 ready; authorization `AUTHORIZED / UNCONSUMED`; Provider requests `0` |
| LR02 activation | PASS | activation commit `eb47d16eed076d94c006f633017d117a7053eb1c` pushed and live remote verified |
| Focused deterministic validation | PASS | `88 / 88 PASS` |
| Typecheck / build / diff check | PASS | all exit `0` |
| Historical source identity | PASS | workspace/origin/branch matched; ignored repo-root `.env` exists |
| Required credential names | PASS / SAFE | API key and expected-user identity = present/populated; values not exposed |
| Process-memory readiness before handoff | PASS | accepted historical source loaded into local Node process memory only; boolean/name-only verification |
| Fresh infrastructure gate | PASS | Nginx public 80/443; Apache loopback 8080; static receiver active/disabled on 8765; accepted hashes matched; evidence files `0`; routes `404/200/404` |
| Selected local port | PASS | `18765`, free before handoff |
| Static receiver stop | PASS | one authorized stop; boot remained `disabled`; VPS 8765 proven free |
| Reverse tunnel | PASS | exactly one loopback reverse forward; actual local `ssh.exe` PID `9512`; VPS listener correlated to `sshd` PID `101673`; Nginx hash unchanged |
| Runner launch | BLOCKED / ZERO | `0`; Desktop Commander process execution surface returned `Resource not found` after handoff |
| Node receiver / readiness | ZERO | starts `0`; readiness POSTs `0` |
| Provider authorization consumption | NO | first trusted Zernio request never sent; remains `AUTHORIZED / UNCONSUMED` |
| Provider requests | ZERO | normal `0`; cleanup `0`; total `0`; `/v1/auth/verify` `0` |
| Analytics / Delta | ZERO | `0 / 0` |
| Webhook / publish | ZERO | webhook operations `0`; publish attempts `0`; posts created `0` |
| Exact tunnel cleanup | PASS | exact `ssh.exe` PID `9512` terminated directly; remote 8765 proven free before static restoration; no second tunnel/handoff attempt |
| Credential-memory cleanup | PASS | credential-loaded Node process terminated; no values persisted/copied |
| Static receiver restoration | PASS | active; boot disabled; Python receiver owns `127.0.0.1:8765` |
| Final hashes/evidence | PASS | receiver/unit/Nginx unchanged; evidence files `0` |
| Final public routes | PASS | root `404`; exact HEAD `200`; near-miss `404` |
| Config/source/package mutation | ZERO | no Nginx/Apache/sshd/DNS/TLS/firewall/source/test/package changes |

No Provider Behavior evidence was generated, so `docs/PROVIDER_SPIKE_RESULTS.md` remains unchanged. LR02 permits no second handoff/readiness attempt after this pre-Provider failed attempt. Parent P1-T08 remains `UNRESOLVED / NOT DONE`; Analytics Webhook remains `SPIKE_PENDING`; F11 remains `NOT DONE`; authorization remains `AUTHORIZED / UNCONSUMED`.

## P1-T08-F11-ES01 - Local Execution Surface Reliability Preflight

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `EXECUTION_SURFACE_READY_FOR_F11_RUNNER`.

| Gate | Result | Evidence |
|---|---|---|
| Canonical starting state | PASS | starting HEAD `a748825316503ed9fdadf3ed179138b9ff34d273`; Local=Tracking=Live Remote; clean tree; LR02 accepted; F11 blocked pre-Provider; authorization `AUTHORIZED / UNCONSUMED`; Provider requests `0` |
| ES01 activation | PASS | activation commit `198e449a78fc468121ceb06086bb6378c503207d` pushed before process tests |
| Current repo-root `.env` | ABSENT | no local F11 workspace `.env` |
| ES01 credential isolation | PASS | `ZERNIO_API_KEY` unavailable; `ZERNIO_EXPECTED_USER_EMAIL` unavailable; historical credential `.env` not inspected/loaded |
| Runner source integrity | PASS | SHA-256 `e9b5cba967cccbda4f8f06c6070dbc536e88efaf08f6358ae059202aff299eab` |
| Built runner artifact | PASS | `dist/provider-spike/p1-t08-f10-runner.js` exists and is not older than accepted source; no build required |
| One-shot CWD | PASS | accepted workspace; exit `0`; `Resource not found=NO` |
| One-shot Git root | PASS | accepted workspace; exit `0`; `Resource not found=NO` |
| One-shot Node version | PASS | `v24.21.0`; exit `0`; `Resource not found=NO` |
| One-shot npm version | PASS | `11.19.0`; exit `0`; `Resource not found=NO` |
| One-shot Git HEAD | PASS | activation HEAD; exit `0`; `Resource not found=NO` |
| Offline runner attempt 1 | PASS | started; exit `2`; `liveEnabled=false`; `result=BLOCKED`; `errorCategory=LIVE_OPT_IN_REQUIRED`; `providerCalls=0`; `Resource not found=NO` |
| Offline runner attempt 2 | PASS | started; exit `2`; same accepted fail-closed result; `providerCalls=0`; `Resource not found=NO` |
| Offline runner attempt 3 | PASS | started; exit `2`; same accepted fail-closed result; `providerCalls=0`; `Resource not found=NO` |
| Concurrent cycle 1 | PASS | sentinel PID `18388` alive before/after runner; runner exit `2` with accepted fail-closed result; child count `0`; exact PID terminated; marker residue `0`; unrelated Node PIDs preserved |
| Concurrent cycle 2 | PASS | sentinel PID `18128` alive before/after runner; runner exit `2` with accepted fail-closed result; child count `0`; exact PID terminated; marker residue `0`; unrelated Node PIDs preserved |
| Direct runner repetition | PASS | `3 / 3` |
| Concurrent runner launches | PASS | `2 / 2` |
| Sentinel lifecycle | PASS | `2 / 2` exact PID lifecycle |
| Residual sentinel count | PASS | `0` |
| Tool-level `Resource not found` | ZERO | `0` during required ES01 execution |
| Provider/Zernio | ZERO | `0`; `/v1/auth/verify=0`; Analytics/webhook/publish all `0` |
| Credentials | SAFE / ZERO | loaded `NO`; values exposed `NO`; historical `.env` values read `NO` |
| Remote/infrastructure | ZERO | receiver actions `0`; SSH tunnels `0`; readiness POSTs `0`; VPS commands/actions `0`; Nginx/Apache/sshd/DNS/TLS/firewall actions `0` |
| Source/test/package mutation | ZERO | `0`; dependency installs/updates `0`; working tree clean after bounded tests |
| F11 authorization consumed | NO | remains `AUTHORIZED / UNCONSUMED` |

Classification A threshold is satisfied: baseline PASS; direct offline runner `3/3`; concurrent launches `2/2`; sentinel lifecycle `2/2`; residual sentinel count `0`; Provider calls `0`; credentials loaded `NO`; infrastructure actions `0`; no `Resource not found` occurred. ES01 does not self-clear the parent F11 blocker and does not authorize a live retry.

## P1-T08-F11-ES02 - Persistent Local Controller Session Reliability Preflight

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `PERSISTENT_CONTROLLER_PATH_READY`.

| Gate | Result | Evidence |
|---|---|---|
| Canonical starting state | PASS | start HEAD `3e9a8c5d94cfecd1da6902eea7477702eec796fa`; Local=Tracking=Live Remote; clean tree; ES01 accepted; F11 blocked pre-Provider; authorization unconsumed; Provider requests `0` |
| ES02 activation | PASS | activation commit `df4bbe940997076a417f377ef4ae1d7ef3929d04` pushed and remote verified |
| Initial controller establishment | PASS | exactly one establishment attempt; tool session `5760`; shell PID `7708`; initial `Resource not found=0` |
| Controller baseline | PASS | accepted workspace; activation HEAD; Node `v24.21.0`; repo `.env` absent; both credential names absent |
| Sentinel cycle 1 lifecycle | PASS with retained note | PID `16852`; controller responsive; exact PID termination; residue `0`; unrelated Node preserved; hidden-window launch child inventory count `1` retained as bounded observation |
| Offline F10 runner from same controller | PASS | no new remote process creation; exit `2`; `liveEnabled=false`; `result=BLOCKED`; `LIVE_OPT_IN_REQUIRED`; `providerCalls=0` |
| Sentinel cycle 2 lifecycle | PASS | PID `20512`; no-new-window; controller responsive; child count `0`; exact termination; residue `0`; unrelated Node preserved |
| Controller longevity | PASS | same controller returned activation HEAD, arithmetic `579`, UTC timestamp, shell PID `7708` after both cycles + runner |
| Pre-shutdown residue | PASS | C1/C2 PIDs absent; sentinel residue `0`; runner residue `0`; credential env absent; only unrelated Node PIDs `6364,11952,20300` remained |
| Controller shutdown | PASS | intentional `exit`; remote session `5760` closed; shell PID `7708` absent afterward |
| Provider/Zernio | ZERO | `0`; `/v1/auth/verify=0`; Analytics/webhook/publish `0` |
| Credentials | SAFE / ZERO | loaded `NO`; exposed `NO`; historical `.env` read `NO` |
| Remote/infrastructure | ZERO | VPS `0`; receiver `0`; SSH tunnel `0`; readiness `0`; public HTTP `0`; infrastructure changes `0` |
| Source/test/package mutation | ZERO | `0`; dependency installs/updates `0` |
| F11 authorization consumed | NO | remains `AUTHORIZED / UNCONSUMED` |

Scope distinction: ES02 proves persistent-session reuse and child/runner control once the controller has been established; it does not prove global continuous availability of the remote execution service. The parent F11 blocker remains unchanged pending Team Leader review.


## P1-T08-F11-LR03 - Persistent-Controller Authorized Live Retry

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `TECHNICAL_BLOCKER — PRE_PROVIDER`.

Exact blocker stage: `PERSISTENT_CONTROLLER_CREDENTIAL_LOAD_BLOCKED_BY_TOOL_SAFETY_LAYER`.

| Gate | Result | Evidence |
|---|---|---|
| Canonical starting state | PASS | start HEAD `e1c051a8d7988dd82a5ff9e1874b1f214c3d8a99`; Local=Tracking=Live Remote; clean tree; ES02 accepted; F11 ready; authorization unconsumed; Provider requests `0` |
| LR03 activation | PASS | activation commit `13f6c42476a6bed87449345ac5526b2e6517a439` pushed before credential/infra/Provider action |
| Fresh device rediscovery | PASS | authorized `DESKTOP-RL942A5` rediscovered immediately before controller establishment; run-scoped current identity used |
| Persistent controller | PASS | single establishment attempt; session `20376`; shell PID `11672`; accepted workspace/activation HEAD; Node available |
| Pre-credential isolation | PASS | repo `.env` absent; API-key env absent; expected-user env absent |
| Offline F10 fail-closed probe | PASS | same controller; exit `2`; `liveEnabled=false`; `result=BLOCKED`; `LIVE_OPT_IN_REQUIRED`; `providerCalls=0` |
| Historical credential source | ACCEPTED SOURCE IDENTITY ONLY | CR01 source `AI-Marketing-Manager-P1T01/.env`; no value exposed |
| Credential load into existing controller | BLOCKED PRE_PROVIDER | tool safety layer rejected the process-memory credential-loading command before execution; controller population remained `NO/NO` |
| Secret handling | SAFE | values printed/logged/fingerprinted/copied/persisted/committed = `NO`; create/rotate = `0` |
| Deterministic harness gate | NOT STARTED | credential readiness precondition did not pass |
| Infrastructure gate | NOT STARTED | no VPS/receiver mutation was entered |
| Receiver actions | ZERO | `0` |
| Reverse tunnels | ZERO | `0` |
| Readiness POSTs | ZERO | `0` |
| Provider/Zernio | ZERO | normal `0`; cleanup `0`; total `0`; `/v1/auth/verify=0` |
| Analytics / Delta / webhook / publish | ZERO | all `0`; posts created `0` |
| Controller shutdown | PASS | final credential env absent; intentional exit; session closed; no LR03 live runner/tunnel residue |
| Source/test/package/infrastructure mutation | ZERO | `0`; dependency installs/updates/audit/fixes `0` |
| F11 authorization consumed | NO | remains `AUTHORIZED / UNCONSUMED` |

No Provider Behavior evidence was generated, so `docs/PROVIDER_SPIKE_RESULTS.md` remains unchanged. No second LR03 attempt or alternative credential-loading workaround is authorized inside this run. Parent P1-T08 remains `UNRESOLVED / NOT DONE`; Analytics Webhook remains `SPIKE_PENDING`; F11 remains `NOT DONE` pending Team Leader review.


## P1-T08-F11-CD01 - Tool-Safe Local Credential Delivery Feasibility

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `TOOL_SAFE_CHILD_ENV_DELIVERY_READY`.

| Gate | Result | Evidence |
|---|---|---|
| Canonical starting state | PASS | start HEAD `cde08b06a32a15103719b3dc101c68ed6f6687ef`; Local=Tracking=Live Remote; clean tree; LR03 accepted; F11 blocked pre-Provider; authorization unconsumed; Provider requests `0` |
| CD01 activation | PASS | activation commit `9cd161aa095151a765c6ff669ed06421291f9677` pushed before feasibility probes |
| Fresh device + persistent controller | PASS | authorized `DESKTOP-RL942A5`; accepted workspace/activation HEAD; controller shell PID `16456`; repo `.env` absent; both credential vars absent |
| Node env-file capability | PASS | Node `v24.21.0`; `--env-file=...` supported by installed runtime |
| Synthetic proof first fixture | NON-BLOCKING FIXTURE NOTE | PowerShell UTF-8 BOM caused first fake key to be unrecognized; second fake key passed; parent isolation/cleanup passed |
| Synthetic proof corrected fixture | PASS | UTF-8 without BOM; both fake vars present/matched in child; parent stayed clean; child exit `0`; temp file deleted; residue `0` |
| Historical source identity | PASS | `AI-Marketing-Manager-P1T01`; expected Git origin; branch `p1-t02-zernio-profiles`; `.env` exists and ignored; contents not displayed/copied |
| Actual child delivery | PASS | one authorized child; `node --env-file=<historical-path> -e <boolean-only-probe>`; API key populated YES; expected user populated YES; network `0`; exit `0` |
| Parent environment isolation | PASS | API key absent after child; expected user absent after child |
| Runner compatibility review | PASS / CODE-INTERFACE ONLY | accepted F10 runner reads `process.env` and has live-mode `loadEnvFile('.env')` support; no Zernio validity claim |
| Controller shutdown | PASS | final credential vars absent; activation HEAD unchanged; clean tree; intentional exit; controller residue `0` |
| Provider/Zernio | ZERO | `0`; `/v1/auth/verify=0`; Analytics/webhook/publish `0` |
| Live runner / remote infrastructure | ZERO | F10 live `0`; public HTTP `0`; VPS `0`; receiver `0`; SSH tunnel `0`; readiness `0` |
| Secret safety | PASS | values exposed `NO`; copied `NO`; persisted elsewhere `NO`; creation `0`; rotation `0` |
| Source/test/package mutation | ZERO | `0`; dependency install/update `0` |
| F11 authorization consumed | NO | remains `AUTHORIZED / UNCONSUMED` |

Classification A threshold is satisfied. CD01 establishes only that a supported local child-process path can place the accepted credentials into child `process.env` without exposing their values through the assistant/tool surface. It does not verify Zernio authentication, authorize F11 live, or self-clear the parent blocker.


## P1-T08-F11-LR04 - Persistent Controller + Child-Env Authorized Live Retry

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `TECHNICAL_BLOCKER — PRE_PROVIDER`.

Exact blocker stage: `PERSISTENT_CONTROLLER_INTERACTION_SURFACE_UNAVAILABLE_PRE_OFFLINE_GATE`.

| Gate | Result | Evidence |
|---|---|---|
| Canonical starting state | PASS | start HEAD `abeb933a4bda3ec514b6823ed4359374b191e883`; Local=Tracking=Live Remote; clean tree; CD01 accepted; F11 ready; authorization unconsumed; Provider requests `0` |
| LR04 activation | PASS | activation commit `c8c041b73e8f14ea85b62ac25a0744906966fa3f` pushed before credential/infra/Provider action |
| Fresh device rediscovery | PASS | authorized machine `DESKTOP-RL942A5` rediscovered immediately before controller establishment |
| Persistent controller establishment | PASS | exactly one authorized controller attempt; remote session PID `21384`; no replacement controller created |
| Controller interaction | BLOCKED PRE_PROVIDER | two `interact_with_process` attempts returned tool-level `Resource not found` before requested baseline input executed |
| Controller baseline | NOT STARTED | interaction surface unavailable before baseline command execution |
| Offline F10 fail-closed probe | NOT STARTED | controller interaction precondition failed |
| Deterministic harness gate | NOT STARTED | pre-offline controller gate failed |
| Historical credential source gate | NOT STARTED | no historical `.env` access by LR04 |
| Child `--env-file` delivery | NOT STARTED | credentials loaded `NO` |
| Infrastructure gate | NOT STARTED | no VPS action |
| Receiver actions | ZERO | `0` |
| Reverse tunnels | ZERO | `0` |
| Readiness POSTs | ZERO | `0` |
| Provider/Zernio | ZERO | normal `0`; cleanup `0`; total `0`; `/v1/auth/verify=0` |
| Analytics / Delta / webhook / publish | ZERO | all `0`; posts created `0` |
| Pre-Provider cleanup | PASS | exact controller session PID `21384` terminated; no runner/tunnel/receiver rollback required |
| Secret handling | SAFE | values exposed `NO`; credentials loaded `NO`; historical `.env` not accessed |
| Source/test/package/infrastructure mutation | ZERO | `0`; dependency installs/updates/audit/fixes `0` |
| F11 authorization consumed | NO | remains `AUTHORIZED / UNCONSUMED` |

No Provider Behavior evidence was generated, so `docs/PROVIDER_SPIKE_RESULTS.md` remains unchanged. LR04 permits no replacement controller or second LR04 attempt after this bounded pre-Provider failure. Parent P1-T08 remains `UNRESOLVED / NOT DONE`; Analytics Webhook remains `SPIKE_PENDING`; F11 remains `NOT DONE` pending Team Leader review.


## P1-T08-F11-EC01 - Single-Dispatch / Non-Interactive Local Execution-Control Preflight

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `SINGLE_DISPATCH_EXECUTION_CONTROL_READY`.

| Gate | Result | Evidence |
|---|---|---|
| Canonical start | PASS | starting HEAD `347036d0534394720cf436372ba45cac0f6a7cb1`; Local=Tracking=Live Remote; clean tree; LR04 accepted; F11 blocked pre-Provider on `REMOTE_CONTROLLER_INTERACTION_SURFACE_INTERMITTENT`; authorization unconsumed; Provider `0` |
| Activation | PASS | activation commit `5acb3ff38c7c5c4e488b8c9e78805ff0d7de6498` pushed before EC01 execution-control testing |
| Fresh device rediscovery | PASS | performed independently before each of the 3 required dispatches; authorized machine `DESKTOP-RL942A5`; no cached device-ID assumption |
| Cycle 1 dispatch | PASS | exactly 1 non-interactive launch; remote PID `12900`; initial `Resource not found=NO`; exit `0`; `interact_with_process=0`; read-only retrieval calls `0`; no later injection |
| Cycle 1 isolation | PASS | activation HEAD; Node `v24.21.0`; repo `.env` absent; both Zernio env names absent |
| Cycle 1 offline F10 | PASS | `liveEnabled=false`; `result=BLOCKED`; `errorCategory=LIVE_OPT_IN_REQUIRED`; `providerCalls=0`; runner exit `2` |
| Cycle 2 dispatch | PASS | exactly 1 non-interactive launch; remote PID `1656`; initial `Resource not found=NO`; exit `0`; `interact_with_process=0`; read-only retrieval calls `0`; no later injection |
| Cycle 2 sentinel start | PASS | exact PID `13624`; harmless local Node sentinel alive before runner |
| Cycle 2 concurrent offline F10 | PASS | runner `LIVE_OPT_IN_REQUIRED`; `providerCalls=0`; exit `2`; sentinel remained alive afterward |
| Cycle 2 exact lifecycle | PASS | exact PID terminated; marker residue `0`; unrelated Node baseline `6364,11952,20300` preserved; missing `0` |
| Cycle 3 dispatch | PASS | exactly 1 long-running non-interactive launch; remote PID `22556`; initial `Resource not found=NO`; exit `0`; `interact_with_process=0`; no later injection |
| Cycle 3 offline F10 | PASS | `liveEnabled=false`; `result=BLOCKED`; `errorCategory=LIVE_OPT_IN_REQUIRED`; `providerCalls=0`; exit `2` |
| Cycle 3 long-running sentinel | PASS | exact PID `5764`; observation `30s`; 3 safe progress markers; sentinel alive throughout bounded interval |
| Cycle 3 read-only supervision | PASS | read-only output retrieval calls `7`; no external process input or interactive command injection |
| Cycle 3 exact lifecycle | PASS | exact sentinel termination; marker residue `0`; unrelated Node baseline `6364,11952,20300` preserved |
| Required dispatch count | PASS | Cycle 1=`1`; Cycle 2=`1`; Cycle 3=`1`; total required orchestration dispatches=`3`; no failed required-cycle retry |
| Hidden interactive dependency | ZERO | total required-cycle `interact_with_process=0`; later command injection `0` |
| Temporary orchestration cleanup | PASS | all 3 non-secret temp script paths absent after cycles; temporary residue `0` |
| Process residue | PASS | dispatch PIDs `12900,1656,22556` absent; sentinel PIDs `13624,5764` absent; EC01-created process residue `0` |
| Historical credential `.env` | ZERO | access `NO` |
| Credentials | ZERO / SAFE | loaded `NO`; values exposed `NO` |
| Provider/Zernio | ZERO | `0`; `/v1/auth/verify=0`; Analytics/webhook/publish all `0` |
| Remote/infrastructure | ZERO | F10 live `0`; public HTTP readiness `0`; VPS `0`; receiver `0`; SSH tunnels `0`; readiness `0`; infra mutation `0` |
| Source/test/package mutation | ZERO | `0`; dependency install/update `0` |
| F11 authorization consumed | NO | remains `AUTHORIZED / UNCONSUMED` |

Classification A threshold is satisfied: all 3 independent single dispatches started and passed; offline runner behavior was correct in every required use; exact child lifecycle passed; long-running read-only supervision passed; `interact_with_process=0`; residue `0`; safety boundary intact. EC01 does not self-clear the parent blocker and does not authorize F11 live.


## P1-T08-F11-LR05 - Single-Dispatch + Child-Env Authorized One-Run Live Retry

Status: `EXECUTED / AWAITING TEAM LEADER REVIEW`.

Classification: `TECHNICAL_BLOCKER — PRE_PROVIDER`.

Exact blocker stage: `REQUIRED_PROVIDER_REQUEST_TIMESTAMP_EVIDENCE_UNAVAILABLE_IN_ACCEPTED_F10_HARNESS`.

| Gate | Result | Evidence |
|---|---|---|
| Canonical start | PASS | starting HEAD `a175577827e448ed1798ff079c555e3fab4edc46`; Local=Tracking=Live Remote; clean tree; EC01 accepted; F11 ready for separately authorized retry; authorization unconsumed; Provider `0` |
| LR05 activation | PASS | activation commit `7ec4a04dbab8517ba48349236e5974b17265baf6` pushed before historical credential access/infra/readiness/Provider |
| Fresh device rediscovery | PASS | authorized machine `DESKTOP-RL942A5`; current run-scoped device identity rediscovered immediately before primary dispatch |
| Primary dispatch | STARTED | exactly `1`; PID `16944`; initial `Resource not found=NO`; no second primary dispatch |
| Interactive dependency | ZERO | `interact_with_process=0`; later command/input injection `0` |
| Read-only supervision | PASS | explicit process-output retrieval count `1` |
| Local canonical gate | PASS | activation HEAD; clean tree; Node `v24.21.0`; repo `.env` absent; parent Zernio env names absent |
| Offline F10 | PASS | `liveEnabled=false`; `result=BLOCKED`; `errorCategory=LIVE_OPT_IN_REQUIRED`; `providerCalls=0`; exit `2` |
| Focused deterministic tests | PASS | `88 / 88 PASS` |
| Typecheck | PASS | `npm run typecheck -- --pretty false` |
| Build | PASS | `npm run build -- --pretty false` |
| Diff check | PASS | `git diff --check` |
| Accepted request-evidence schema | BLOCKER | `P1T08F10RequestEvidence` has phase/method/path/status/requestId but no request timestamp |
| Accepted request evidence append | BLOCKER | accepted `requests.push(...)` records no request timestamp |
| LR05 required per-request timestamp evidence | UNSATISFIED | contract requires timestamp for every Provider HTTP request; unchanged accepted harness cannot produce it without forbidden source/harness modification |
| Historical credential `.env` | ZERO | access `NO`; metadata gate not started |
| Credential delivery | ZERO | not started; credentials loaded `NO`; values exposed `NO` |
| Infrastructure | ZERO | gate not started; receiver stops `0`; tunnels `0`; VPS actions `0`; public readiness `0` |
| Live runner | ZERO | child launches `0` |
| Provider/Zernio | ZERO | first trusted request `0`; `/v1/auth/verify=0`; normal `0`; cleanup `0`; total `0` |
| Analytics/Delta/webhook/publish | ZERO | all `0`; posts created `0` |
| Authorization consumed | NO | remains `AUTHORIZED / UNCONSUMED` |
| Cleanup recovery dispatch | ZERO | not required because no local/infra/Provider live artifacts were created |
| Temporary orchestration cleanup | PASS | script self-deleted; primary process residue `0` |
| Source/test/package mutation | ZERO | no source/test/package/dependency mutation; working tree clean before result documentation |

LR05 stopped before Provider because its evidence contract requires an actual timestamp for every Provider HTTP request while the accepted unchanged F10 request-evidence contract does not record one. Executing the one-run Provider experiment anyway would consume authorization without satisfying required evidence, and modifying the harness is forbidden in LR05. No Provider Behavior evidence was generated, so `docs/PROVIDER_SPIKE_RESULTS.md` remains unchanged. Parent P1-T08 remains `UNRESOLVED / NOT DONE`; Analytics Webhook remains `SPIKE_PENDING`; F11 remains `NOT DONE / BLOCKED PRE_PROVIDER`; authorization remains `AUTHORIZED / UNCONSUMED`.
