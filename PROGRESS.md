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

## Current Task

`P1-T05 — Verify Zernio Webhook Delivery Contract`

**Status: IMPLEMENTED — AWAITING TEAM LEADER RE-REVIEW**

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

### P1-T05-F02 VPS precondition result — zero-call STOP
- The locally recorded Oracle/project VPS candidate and its historical SSH user/key were checked read-only from the authorized development machine.
- A current operator/control session could not be established; the VPS candidate was not reachable on the expected SSH/HTTP/HTTPS ports from this execution environment.
- Therefore no safe temporary Caddy/reverse-proxy route could be installed or verified, no VPS receiver process could be started, and trusted TLS/exact-path HTTP 401 readiness could not be proven.
- Required precondition result: `BLOCKED — CONTROLLED_VPS_WEBHOOK_RECEIVER_NOT_AVAILABLE`.
- F02 Zernio API calls: 0.
- F02 live Zernio Provider runs: 0; the contract permits the one live Provider run only after VPS readiness PASS, so no live invocation was attempted.
- Temporary webhook / publishing key / scheduled post: NOT CREATED.
- webhook.test / real retry attempts / provider delivery logs: NOT RUN.
- No VPS route/process/config or runtime webhook secret was installed, so provider/VPS cleanup was N/A.
- Incremental VPS infrastructure cost observed for F02: 0.
- Ads/ad spend/media/OpenAI/fal.ai/comments/DMs/public publication/unexpected paid action: 0.

Webhook delivery contract recommendation: **REMAIN PENDING — FIX/BLOCKER REQUIRED**.

Canonical webhook-related capability statuses remain unchanged at `SPIKE_PENDING`; Analytics Webhook remains `SPIKE_PENDING`.

P1-T06 implementation started: NO.

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

Team Leader re-reviews P1-T05-F02 VPS-only receiver implementation, deterministic evidence, the preserved historical live run #1 and F01 rerun #2, and the F02 zero-call VPS precondition blocker. Senior Engineer does not attempt the F02 live Zernio run without a verified safe VPS HTTPS endpoint, does not mark P1-T05 DONE / ACCEPTED, does not change canonical webhook capability statuses, and does not start P1-T06.
