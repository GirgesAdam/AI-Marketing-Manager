# PROGRESS.md

## Project
Autonomous AI Marketing Agent SaaS

## Execution-State Authority
**This file is the only authoritative source for the current execution Phase and Task.**
Other documents define phase content but must not declare current execution state.

## Commercial V1 Scope
**LOCKED — Seven-Vertical Scope Amendment ACCEPTED.**

## Supported Commercial V1 Verticals
1. E-commerce / Fashion
2. Restaurants / Cafes
3. Beauty / Salons
4. Fitness / Gyms
5. Real Estate
6. Healthcare / Clinics
7. Marketing Agencies

## Commercial V1 Launch Certification Scope
- Country: Egypt
- Languages: Arabic (`ar-EG`, Egyptian/Modern Standard style modes) + English
- Currencies: EGP + USD

## Phase 0 Scope Amendment Result
`P0-SC01 — Finalize Seven-Vertical Commercial V1 Specification`

**Status: DONE / ACCEPTED**

Closed definitions include:
- industry-agnostic core + seven fixed Vertical Packs
- typed Generic Offerings model
- mandatory Agency Brand-scoped permissions
- shared Meta ad-account Brand ownership mapping
- verified-action boundary for bookings/orders/availability
- measurable fact-freshness policy
- Healthcare LLM/privacy/retention/deletion boundary
- media truthfulness rules
- closed Meta Ads V1 action/objective list
- Egypt + Arabic/English + EGP/USD launch scope
- quantitative critical/non-critical quality gates, explicitly treated as initial eval acceptance targets rather than standalone readiness proof
- cumulative Ads budget-increase baseline anchored to the last human-approved budget
- scenario-based Vertical certification

## Current Execution State
**PHASE 1 — Provider Feasibility & Basic Cost Safety**

## P1-T01 Result
`P1-T01 — Build Minimal Provider Spike Harness`

**Status: DONE / ACCEPTED**

Accepted implementation HEAD: `d6ea34572862f740a0e8550c0b118bb7ead801ff`

Accepted fix: `P1-T01-F01 — Harden Provider Spike Harness Runtime Safety Validation`

Final validation evidence:
- Targeted F01 regressions: 7 passed / 0 failed
- Full harness suite: 33 passed / 0 failed / 0 skipped
- `npm run typecheck`: PASS
- `npm run build`: PASS
- Real Provider API calls: NO
- Paid Provider/API cost: NO
- Provider capabilities marked `SPIKE_PASS`: NONE

## P1-T02 Result
`P1-T02 — Create Zernio Profile A + Profile B`

**Status: DONE / ACCEPTED**

Accepted implementation HEAD: `1d782052bb29e4d2529b03d59b58120850884968`

Accepted fix: `P1-T02-F01 — Bind Zernio Live Execution to Trusted Expected Identity`

Final accepted evidence:
- Trusted independently supplied Zernio identity verification: PASS
- `GET /v1/auth/verify` identity match: PASS
- Profile A exact-name verification: PASS
- Profile A ID: `6ac5a45a8e4ca44f355033ae`
- Profile B exact-name verification: PASS
- Profile B ID: `6ac5a45b243a942b74bdbaa0`
- Profile A ID != Profile B ID
- Initial Profile creation behavior: HTTP 201 for each Profile
- P1-T02-F01 live mutations: 0
- Targeted P1-T02-F01 regressions: 11 passed / 0 failed
- Full regression suite: 62 passed / 0 failed / 0 skipped
- `npm run typecheck`: PASS
- `npm run build`: PASS
- P1-T03 implementation started: NO

## P1-T03 Result
`P1-T03 — Verify Scoped API Key Isolation`

**Status: DONE / ACCEPTED**

Accepted implementation HEAD: `dab0d967950e4f2f251a7b8573408288476db776`

Accepted fix: `P1-T03-F01 — Guarantee Cleanup After Malformed Scoped-Key Create Response`

Final accepted evidence:
- Trusted control-plane identity verification: PASS.
- Scoped Key A created with Profile A-only read scope.
- Scoped Key B created with Profile B-only read scope.
- Key A saw Profile A only.
- Key A exposed Profile B: NO.
- Key A exposed unrelated Profiles: NO.
- Key B saw Profile B only.
- Key B exposed Profile A: NO.
- Key B exposed unrelated Profiles: NO.
- Cross-Profile leakage observed: NO.
- Both temporary real scoped keys revoked.
- Both post-revoke authentication checks returned HTTP 401.
- Historical real P1-T03 execution: 13 calls / hard ceiling 16.
- P1-T03-F01 real Zernio calls: 0.
- P1-T03-F01 focused regressions: 17 passed / 0 failed.
- Parent P1-T03 regressions: 27 passed / 0 failed.
- Full regression suite: 106 passed / 0 failed / 0 skipped.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- No next Provider task started.
- Profiles: `SPIKE_PASS`.
- Scoped Keys: `SPIKE_PASS`.
- Publishing: `SPIKE_PASS`.

## P1-T04 Result

`P1-T04 — Verify Zernio Publishing Behavior`

**Status: DONE / ACCEPTED**

Accepted implementation HEAD: `b780a5cbb87293b28a62427b351d455443cc6382`

Accepted fix: `P1-T04-F01 — Harden Exact Page Target Attestation and Failure Cleanup`

Final accepted evidence:

### Real Provider Behavior evidence
- Real Provider Behavior publishing run: PASS / ACCEPTED.
- Historical task base: `d87a5103a3f2b67f87abb3c0965e15d949c0307b`; branch: `p1-t04-zernio-publishing`.
- Trusted control-plane identity verification: PASS; expected identity match = true.
- Frozen target verified: Profile A `6ac5a45a8e4ca44f355033ae`, Zernio Facebook account `6ac64f8740364f4695dd3077`, Facebook Page `1387424501114639` (`Clothing Brand`).
- Temporary publishing key: Profile-A-only, `scope=profiles`, `permission=read-write`, bounded 1-day expiry; raw key not persisted/exposed.
- Account/Page/health preflight: PASS; platform `facebook`, selected expected Page matched, account status `healthy`, `canPost=true`.
- Account health / `canPost`: PASS.
- Draft lifecycle: PASS.
- Historical draft create/read/idempotency replay: PASS; same logical Zernio post ID; draft cleanup/read-back: PASS.
- Same-key / same-body idempotency: PASS.
- Duplicate confirmed publish observed: NO.
- Scheduled lifecycle: PASS.
- Historical scheduled create/read: PASS; requested `Africa/Cairo` schedule `2026-10-10T17:39:51`, provider returned `2026-10-10T14:39:51.000Z`; scheduled cleanup/read-back: PASS.
- `Africa/Cairo` schedule normalization: PASS.
- One immediate Facebook text-only test publication: PASS.
- Published-state read-back for the immediate post: PASS.
- Wrong publishing target observed: NO.
- Public publication cleanup: PASS.
- Historical public test cleanup/unpublish + read-back: PASS.
- Temporary publishing key revoke: PASS.
- Post-revoke authentication: HTTP 401.
- Historical live execution: 20 calls / ceiling 22.
- Exact historical live call accounting: 20 normal / 0 cleanup allowance / 20 total.
- Historical P1-T04 real Provider Behavior classification: `OBSERVED_PASS`.
- Historical run performed no Ads, ad spend, OpenAI, fal.ai, media generation/upload, new account connection, reconnect, comments/DMs, or webhooks.
- Historical live Provider Behavior evidence and Provider Request IDs remain preserved in `docs/PROVIDER_SPIKE_RESULTS.md`; no historical evidence was regenerated during finalization.
- Known limitation: Core publishing lifecycle verified on Facebook text-only only. Instagram/media/platform-specific publishing remains separately unverified.

### Deterministic regression / failure-recovery evidence
- Historical Team Leader verdict before F01: REJECTED — FIX REQUIRED.
- P1-T04-F01: ACCEPTED.
- Review gaps addressed deterministically: incomplete exact-Page attestation and incomplete emergency draft/scheduled cleanup verification.
- Correct account alone can no longer prove the Facebook Page; explicit Page ID is required for draft/scheduled create/read-back.
- Immediate published posts may use only strict deterministic `PAGEID_POSTID` attestation from `platformPostId` or an exact Facebook public URL path when explicit Page ID is absent; wrong Page is Critical and unparseable/missing evidence is BLOCKED.
- Emergency draft/scheduled cleanup requires DELETE followed by GET read-back; DELETE 200/204 alone is insufficient.
- Cleanup uncertainty takes precedence as `DRAFT_TEST_POST_CLEANUP_UNCONFIRMED` or `SCHEDULED_TEST_POST_CLEANUP_UNCONFIRMED`.
- Cleanup DELETE + GET still run via the safety allowance after normal request ceiling exhaustion.
- P1-T04-F01 real provider calls: 0.
- Exact Page attestation hardening: ACCEPTED.
- Emergency draft/scheduled DELETE + GET cleanup verification: ACCEPTED.
- P1-T04-F01 focused regressions: 15 / 15.
- Parent P1-T04 regressions: 44 / 44.
- Historical pre-F01 full regression suite: 150 passed / 0 failed / 0 skipped.
- Full suite: 165 / 165.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- Historical P1-T04 Provider Behavior evidence preserved: YES; historical live post re-published: NO.
- No live provider calls, publishing actions, scheduling actions, API-key operations, account connection/reconnection, or webhook actions were performed during P1-T04-F01 or acceptance finalization.

Final review wording:
- P1-T04: DONE / ACCEPTED.
- P1-T04-F01: ACCEPTED.
- Profiles: `SPIKE_PASS`.
- Scoped Keys: `SPIKE_PASS`.
- Publishing: `SPIKE_PASS`.

## P1-T05 Result

`P1-T05 — Verify Zernio Webhook Delivery Contract`

**Status: DONE / ACCEPTED**

Team Leader verdict: `ACCEPTED WITH NON-BLOCKING NOTES`.
Accepted F03 evidence/review HEAD: `23a09352b977853178cccb432893f542d6c3d2e3`.
Last code-bearing implementation checkpoint: `fb71179edf51a1830472b88bd505520d585934e0`.

Implementation branch: `p1-t05-zernio-webhook-contract`.
P1-T05-F01 starting/reviewed HEAD: `e87447bf2c58e85d01bbc41841980ba1549fdbf6`.
P1-T05-F01 implementation checkpoint: `d658f701bf3f2f4400251994324b7a3358442b61`.

### P1-T05-F01 deterministic fix / validation
- Team Leader verdict on parent P1-T05: REJECTED — FIX REQUIRED; historical first live run remains preserved separately and is not reinterpreted as PASS.
- webhook.test failure path now performs exactly one bounded read-only `GET /v1/webhooks/logs` before webhook deletion.
- Failure-log query is narrowed by temporary `webhookId`, `event=webhook.test`, and `limit=5`; returned logs are filtered again to the exact temporary webhook/event before sanitized evidence is retained.
- Diagnostic evidence may retain only safe status/request IDs, matching attempt count, attemptNumber, delivery status, endpoint response status, delivery timestamp, and sanitized provider error category/message.
- No second `POST /v1/webhooks/test` occurs in one logical run.
- Exact-live-URL readiness structurally gates the provider callback: failure to obtain receiver HTTP 401 prevents all Zernio API calls.
- Focused P1-T05-F01 regressions: `13 passed / 0 failed`.
- Existing P1-T05 regressions: `46 passed / 0 failed`.
- Full suite after F01: `224 passed / 0 failed / 0 skipped` across 9 test files.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.

### Historical P1-T05 live run #1 — preserved evidence
- Trusted control-plane identity: PASS.
- Temporary webhook create/read-back: PASS; webhook ID `6ac68919c5da8c7698cc9e83`; Profile A only; event `post.scheduled` only.
- `POST /v1/webhooks/test`: BLOCKED by provider 5xx; controlled receiver observed 0 inbound deliveries.
- No scheduled trigger or temporary publishing key was created.
- Webhook cleanup and receiver/tunnel cleanup: PASS.
- Historical call count: 6 total = 4 normal + 2 cleanup.
- Historical first-run details and request IDs remain in `docs/PROVIDER_SPIKE_RESULTS.md`.

### P1-T05-F01 live rerun #2 — only authorized rerun
- Exactly one additional `npm run p1-t05 -- --live` invocation was performed after all deterministic gates passed.
- Result: `BLOCKED — CONTROLLED_WEBHOOK_TEST_RECEIVER_NOT_AVAILABLE`.
- The project-controlled local Node receiver + temporary Cloudflare Quick Tunnel started, but the exact final HTTPS URL did not produce the required unsigned-request HTTP 401 within the bounded readiness probe.
- The failure-path runner did not persist/emit the ephemeral URL or individual non-401 probe statuses, so those values are not invented in documentation.
- Zernio calls before readiness PASS: 0.
- Trusted identity preflight in rerun #2: NOT RUN because readiness did not pass.
- Temporary webhook in rerun #2: NOT CREATED.
- `webhook.test` in rerun #2: NOT CALLED.
- Failure diagnostic webhook-log query in rerun #2: N/A because no webhook/provider test existed; the diagnostic flow remains deterministically verified for a provider test failure after readiness.
- Scheduled retry trigger / publishing key / real webhook delivery attempts / provider attempt logs: NOT RUN.
- Public publication / media / Ads / ad spend / OpenAI / fal.ai / comments / DMs / analytics ingestion: 0.
- Local copied `.env`, temporary cloudflared binary, receiver/tunnel process state: cleaned; cloudflared process count after cleanup = 0.
- No third live run was authorized or performed under P1-T05-F01. P1-T05-F02 later received a separate Team Leader authorization and is documented below.

### P1-T05-F02 VPS receiver implementation / validation
- Team Leader explicitly authorized P1-T05-F02 from starting HEAD `dd1ea010a275ec998017822e87572b44be92d79f` and prohibited Railway, Cloudflare Quick Tunnel, other temporary hosting providers, capability promotion, and P1-T06.
- Minimal VPS-only receiver support was added without a production webhook subsystem: exact dedicated path, fixed localhost listen port behind the intended VPS HTTPS reverse proxy, in-memory fresh webhook secret generation, and no webhook body persistence beyond existing sanitized evidence.
- External readiness requires HTTPS, no redirect, exact HTTP 401, a receiver-specific marker, and a second confirmation hit observed by the same receiver process before the provider callback can execute.
- Readiness 404, 502/503, redirects, TLS/network errors, and wrong-handler 401 responses fail closed before provider execution.
- F02 focused regressions: `12 passed / 0 failed`.
- P1-T05-F01 regressions after F02: `13 passed / 0 failed`.
- Existing parent P1-T05 regressions after F02: `46 passed / 0 failed`.
- Full suite after F02: `236 passed / 0 failed / 0 skipped` across 10 test files.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- F02 implementation checkpoint: `7b8e5738191854fb67443607188e53ff389920ed`.
- F02 Nginx receiver evidence-label correction checkpoint: `fb71179edf51a1830472b88bd505520d585934e0`.

### P1-T05-F02 VPS readiness + authorized live invocation result — zero-call BLOCK
- Earlier Oracle/TIA candidate notes are superseded and invalid as project evidence; no infrastructure or credential from another project is part of the accepted F02 execution path.
- Controlled project VPS endpoint: `marketlyai.restartorg.com` resolving to project VPS `82.29.177.121`, with dedicated Nginx routing and project-controlled TLS for the F02 path.
- Exact public readiness: PASS — trusted HTTPS/TLS, exact path, HTTP `401`, receiver marker match, same-process confirmation, no redirect.
- Readiness evidence timestamp: `2026-10-12T18:22:19.109Z`; observed readiness latency: `1249 ms`.
- Exactly one separately authorized F02 `--live` invocation was performed after deterministic gates and readiness PASS.
- Live result: `BLOCKED — MISSING_LIVE_CREDENTIAL` before the first Zernio request.
- Safe credential diagnosis: the current F02 working clone `.env` exists but does not define `ZERNIO_API_KEY` or `ZERNIO_EXPECTED_USER_EMAIL`; the original accepted workspace contains those variable names. Secret values were not read, copied, printed, logged, or documented.
- F02 Zernio API calls: `0 normal / 0 cleanup / 0 total`.
- Trusted identity preflight: NOT RUN because provider transport was blocked before request 1.
- Temporary webhook / publishing key / scheduled post: NOT CREATED.
- `webhook.test` / real retry attempts / provider delivery logs: NOT RUN.
- Provider cleanup: N/A because no provider artifact existed.
- Temporary receiver stopped and SSH reverse tunnel stopped; operator completed temporary route cleanup and confirmed dedicated port `18085` clear.
- Incremental VPS infrastructure cost observed for F02: `0`.
- Ads/ad spend/media/OpenAI/fal.ai/comments/DMs/public publication/unexpected paid action: `0`.
- No further F02 live rerun is authorized under the current contract; Team Leader authorization is required before any retry.


### P1-T05-F03 final authorized live verification
- Exactly one authorized F03 live invocation was performed; no rerun is authorized or performed.
- Existing project VPS HTTPS/Nginx/SSH-reverse-tunnel receiver architecture was reused; no transport redesign occurred.
- Zernio credentials were injected from the original ignored `.env` into process memory only; values were not printed, copied into the working clone, committed, or documented.
- Trusted identity preflight: PASS; expected identity match = true; HTTP 200; run `d7b58414-24f0-4582-a991-5ba8bd4388c4`; request `2da21db4-b38d-483d-b173-c4782bc8c8a4`.
- Temporary Profile-A webhook create/read-back: PASS; webhook `6acda866ce92dc3eec124667`; event `post.scheduled`; Profile A only.
- `webhook.test`: PASS at the controlled receiver; HMAC signature valid; header/body event ID match; receiver HTTP 204; event ID `c6354814-7742-44f9-b7db-a4d43e0cb522`.
- Temporary Profile-A read-write publishing key was created, revoked, and rejected with HTTP 401 after revoke; cleanup confirmed.
- Synthetic scheduled post `6acda8697c472b7066436771` remained scheduled; no public publication occurred; cleanup GET returned HTTP 404.
- First real `post.scheduled` delivery used event ID `a6e9cbae-5bfb-42b3-9b0f-1c9aeb67d178`; signature/Profile attribution PASS; receiver intentionally returned HTTP 500.
- Automatic retry arrived about `10.959 s` later with the same event ID and raw-body SHA-256; duplicate=true; receiver returned HTTP 204.
- Stable event ID across retry: YES; logical unique real event count: 1; foreign Profile delivery observed: NO.
- Provider-log validation did not PASS. The harness performs one `GET /v1/webhooks/logs` after a fixed 500 ms wait; safe final evidence exposed `logs=null` and `BLOCKED — WEBHOOK_LOGS_INCOMPLETE`, without enough detail to prove whether the cause was missing rows, eventual consistency, or another provider/log-shape condition.
- No provider-log cause is promoted from assumption to fact. No extra provider query or live rerun was performed.
- Request accounting: `11 normal / 6 cleanup / 17 total`, within the `24 normal + 6 cleanup` contract.
- Provider cleanup confirmed for scheduled post, publishing key, and webhook.
- Observed F03 harness result remains `BLOCKED — WEBHOOK_LOGS_INCOMPLETE`; this evidence is preserved and is not rewritten as successful provider-log verification.
- Team Leader classified that incomplete log evidence as a non-blocking provider-observability limitation because the required generic webhook delivery/retry behaviors were independently proven by direct controlled-receiver evidence.
- Known limitation: `Zernio /v1/webhooks/logs delivery-attempt correlation/timing remains unverified; F03's single bounded query returned insufficient evidence. Direct receiver evidence independently proved delivery and retry behavior.`
- Do not record eventual consistency, broken provider logs, a specific propagation delay, or logs as verified.

Generic Webhook Delivery Contract: **`SPIKE_PASS`**.

Analytics Webhook: **`SPIKE_PENDING`**.

Do not infer analytics-event support from the generic `post.scheduled` webhook test.

P1-T06 implementation started historically: NO at P1-T05 acceptance.

## P1-T06 Result

`P1-T06 — Verify Zernio Analytics Bootstrap & Cursor Behavior`

**Status: DONE / ACCEPTED WITH NON-BLOCKING NOTES**

Accepted implementation HEAD: `513e9505de115d5a39f30964d2d5aca7594ef708`.
Starting HEAD: `e75591272aa8e58dfd4be7619d3364c3c874ef73`.
Implementation branch: `p1-t06-zernio-analytics-bootstrap`.

### P1-T06 implementation / deterministic validation
- Provider Behavior spike only; no production Analytics subsystem, database schema, worker, queue, dashboard, report, outbox, or production adapter was built.
- Required order is enforced: initial opaque cursor capture -> bounded historical baseline -> delta consumption from the exact pre-baseline cursor.
- Temporary Provider mutation is limited to one Profile-A-only read-only scoped key using accepted P1-T03 creation/revocation behavior.
- Focused P1-T06 regressions: `20 / 20 PASS`.
- Affected provider-spike suites: `194 / 194 PASS` across 8 files.
- Full regression suite: `256 / 256 PASS` across 11 files.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.

### P1-T06 single authorized live Provider run
- Exactly one authorized live run was performed; no second run was performed or authorized.
- Trusted identity preflight: PASS; HTTP 200; run `5c079041-8da4-4d28-8998-5f7c0ef30d18`; request `e1a6e31f-7227-4228-8821-cadc221f4c52`.
- Temporary key: Profile A `6ac5a45a8e4ca44f355033ae` only, permission `read`, bounded expiry; raw secret not emitted or persisted.
- Exact account preflight: PASS for Facebook account `6ac64f8740364f4695dd3077`; foreign Profile/account observed: NO.
- Initial delta cursor capture happened before baseline: HTTP 200; data count 0; `nextCursor` present; `hasMore=false`; only safe cursor fingerprint `3c6554c117d389a3` retained.
- Baseline window: `2026-07-16` through `2026-10-13`; page 1 and page 2 explicitly read with small page size; both HTTP 200; total records 0; provider pagination reported total 0 / pages 1; `hasAnalyticsAccess=true`; valid empty analytics dataset, not unavailable analytics.
- Delta resumed from the exact pre-baseline cursor: HTTP 200; one page; 0 items; `hasMore=false`; returned cursor fingerprint unchanged; no natural change occurred during baseline import, recorded as `CHANGES_DURING_IMPORT_NOT_OBSERVED`.
- Invalid cursor negative test: exactly one request; HTTP 400; safe code `invalid_field_value`; no `nextCursor`; no retry.
- Expired cursor: `EXPIRED_CURSOR_BEHAVIOR_UNVERIFIED`; no fake cursor, waiting, or TTL inference was used.
- Natural analytics rate-limit headers observed: limit `6` for analytics/delta requests and limit `60` for account preflight; no HTTP 429 occurred.
- Temporary key cleanup: revoke HTTP 200; post-revoke auth HTTP 401; cleanup confirmed.
- Provider calls: `8 normal / 2 cleanup / 10 total`, within `20 + 4` bounds.
- Public publication / scheduled or draft post / media / Ads / ad spend / comments / DMs / OpenAI / fal.ai: 0.
- Accepted canonical capability: Analytics Bootstrap & Cursor Contract = `SPIKE_PASS`.
- Historical Analytics = `SPIKE_PENDING`.
- Analytics Delta = `SPIKE_PENDING`.
- Best Times = `SPIKE_PENDING`.
- Performance Decay = `SPIKE_PENDING`.
- Frequency Analysis = `SPIKE_PENDING`.
- Analytics Webhook = `SPIKE_PENDING`.
- Unresolved Provider behavior preserved exactly: `EXPIRED_CURSOR_BEHAVIOR_UNVERIFIED`.
- Unresolved Provider behavior preserved exactly: `CHANGES_DURING_IMPORT_NOT_OBSERVED`.
- Non-empty Analytics Delta pagination was not observed live.
- Actual historical analytics metric-record field shapes were not observed because the valid baseline was empty.
- Natural HTTP 429 was not observed.
- These limitations are non-blocking for P1-T06 acceptance and are not promoted into Provider facts.

P1-T06 Team Leader verdict: **ACCEPTED WITH NON-BLOCKING NOTES**.
Analytics Bootstrap & Cursor Contract: **`SPIKE_PASS`**.

## Current Task

`P1-T08 - Verify Zernio analytics.synced Webhook Behavior`

**Status: IMPLEMENTED - BLOCKED BEFORE LIVE / AWAITING TEAM LEADER REVIEW**

Starting HEAD: `d2e12882b96d04395b92c944735ebf8bc860b211`.
Implementation branch: `p1-t08-zernio-analytics-webhook`.

### P1-T08 Provider contract discovery - DOC_CONFIRMED
- Current Zernio Analytics Webhooks documentation identifies `analytics.synced` as the Analytics sync event.
- Current request-body schema requires top-level `id`, `event`, `account`, `sync`, and `timestamp`; optional top-level fields include `profiles` and `test`.
- Documented account attribution fields are `accountId`, `profileId`, `platform`, and `username`.
- Documented sync metadata fields are `syncedAt` and `postsUpdated`.
- Current schema text describes the event as poll-driven, roughly hourly per connected account, after a successful analytics sync cycle; this wording is documentation guidance, not a Provider SLA.
- Current request-body schema describes `analytics.synced` as a trigger rather than metrics transport and says metrics/cursor are not expected in that event. Current introductory prose on the same page contains conflicting cursor wording, so this is recorded as documentation drift and live Provider observation remains authoritative.
- Documentation recommends a dedicated Analytics webhook subscription because of event volume/shared failure-count concerns.
- Documentation evidence is `DOC_CONFIRMED` only; no live Provider payload fact is claimed by P1-T08 yet.

### P1-T08 deterministic implementation / validation
- Provider Behavior spike only; no production Analytics webhook subsystem, database table, durable inbox/outbox, queue, worker, reconciliation engine, dashboard, or report was built.
- Focused P1-T08 regressions: `24 / 24 PASS` (all required T08-01 through T08-20 plus four contract-drift/recommendation cases).
- Affected Provider-spike suites: `199 / 199 PASS` across 9 files.
- Full regression suite: `302 / 302 PASS` across 13 files.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- Final implementation enforces exact Profile-A-only / `analytics.synced`-only webhook scope, raw-body HMAC before JSON parse, canonical event identity checks, exact target attribution, in-memory dedupe, HTTP 204 acknowledgement, no Provider polling during passive observation, request ceilings, and DELETE -> absent-read-back cleanup.
- `/v1/webhooks/logs` is not used as a PASS requirement; the existing P1-T05 provider-log limitation remains unchanged.

### P1-T08 pre-live VPS blocker
- Required project VPS topology remains the accepted P1-T05 approach: project hostname + Nginx + SSH reverse tunnel + controlled Node receiver; no alternate hosting provider was introduced.
- Candidate dedicated local port `18086` was verified clear.
- TCP/22 connectivity to project VPS `82.29.177.121` was reachable.
- The project-specific SSH key exists locally, but the current execution context could not authenticate non-interactively with it. No private-key material, passphrase, password, expected identity, API key, or webhook secret was read or exposed.
- An already-established human SSH session to the project VPS was observed but was not hijacked, scripted, or modified.
- Because the temporary dedicated Nginx route and SSH reverse tunnel could not be safely established from this execution context, the exact final HTTPS readiness contract could not be satisfied.
- P1-T08 authorized live Provider invocation: `NOT RUN`.
- P1-T08 Zernio API calls: `0 normal / 0 cleanup / 0 total`.
- Temporary webhook created: NO.
- Inbound `analytics.synced` observation window: NOT STARTED.
- Provider/social/public mutations: 0.
- Posts / media / Ads / spend / comments / DMs / native automation / temporary publishing keys: 0.
- OpenAI / fal.ai: 0.
- Local receiver on port 18086 after blocker: NOT LISTENING.
- VPS route/tunnel changes made by P1-T08: 0.

P1-T08 recommendation: **Analytics Webhook recommendation: REMAIN PENDING - FIX/BLOCKER REQUIRED**.

Canonical capability remains:
- Analytics Webhook = `SPIKE_PENDING`.

Other Analytics capabilities remain unchanged:
- Historical Analytics = `SPIKE_PENDING`.
- Analytics Delta = `SPIKE_PENDING`.
- Best Times = `SPIKE_PENDING`.
- Performance Decay = `SPIKE_PENDING`.
- Frequency Analysis = `SPIKE_PENDING`.

P1-T06/P1-T07 unresolved Provider behavior remains unchanged: `EXPIRED_CURSOR_BEHAVIOR_UNVERIFIED`; `CHANGES_DURING_IMPORT_NOT_OBSERVED`; non-empty Analytics Delta pagination not observed live; historical analytics metric-record field shapes not observed live; non-empty derived signal shapes/target attribution remain unverified; natural HTTP 429 not observed.

Next Task: **NOT_STARTED**. No next-task identifier is invented.
## Phase 1 Rules
- Work one Task at a time.
- Provider Behavior Tests remain separate from System Integration Tests.
- No additional V1 Vertical/Feature without explicit Scope Change.
- Basic cost protection before first paid API call.
- Zernio capability existence does not expand the closed product scope.
- No customer exposure before complete V1 + internal validation + Release Readiness.

## Estimate Status
The previous single-Vertical estimate is obsolete. The 56–74 week figure remains only an initial human-team planning reference, **not a Coding-LLM delivery commitment**. Re-estimate after Phase 1 and Phase 2 from actual task throughput, review/fix cycles, provider blockers, eval work and measured costs.

Cash cost must be tracked from actual Coding LLM/provider/infrastructure/ad-test usage; do not invent a fixed forecast before measurements exist.

## Immediate Next Action

Team Leader reviews the P1-T08 implementation and the pre-live infrastructure blocker. Senior Engineer does not consume the authorized P1-T08 live run, does not create a Zernio webhook, does not change Analytics capability status, and does not start another Task unless the Team Leader resolves/authorizes the VPS access dependency.