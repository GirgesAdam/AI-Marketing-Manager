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
