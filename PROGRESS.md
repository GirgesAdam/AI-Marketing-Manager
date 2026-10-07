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

**Status: IMPLEMENTED — AWAITING TEAM LEADER REVIEW**

Implementation branch: `p1-t05-zernio-webhook-contract`.
Approved base: `4ac9bc2aeda3f0563e49ffd3886bd3ac99a9081f`.

### Deterministic implementation / validation evidence
- Minimal controlled receiver implemented only for the Provider Spike; no production webhook subsystem, durable dedupe, database tables, Redis, BullMQ, or production tenant routing added.
- Raw-body HMAC-SHA256 verification is performed before JSON parsing; signature length/hex are validated before `timingSafeEqual`.
- T05-01 through T05-38: PASS.
- Additional safety regressions include webhook.test one-shot distinction, retry absence, unstable event ID, incomplete logs, publishing-key ambiguous/malformed create cleanup, and exact live receiver HTTPS readiness probes.
- Final focused P1-T05 regressions: `46 passed / 0 failed`.
- Final full regression suite: `211 passed / 0 failed / 0 skipped`.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- Post-blocker hardening requires the exact public HTTPS URL for the live receiver to reach the project-controlled receiver and return the expected unsigned-request HTTP 401 before any provider call is allowed.

### Real Provider Behavior evidence — one bounded live run
- Exactly one authorized bounded live P1-T05 run was attempted; no live rerun was performed after the blocker.
- Trusted control-plane identity verification: PASS; identity match = true.
- Identity preflight run ID: `4246fa47-05a9-4749-be46-263d900ed416`; HTTP 200; Provider Request ID `c9b21a9c-b437-41bc-93f7-769192033d1b`; latency 619 ms.
- Controlled receiver type: local Node HTTP receiver exposed temporarily through a Cloudflare Quick Tunnel; generic third-party request-bin service used: NO.
- Temporary webhook creation: PASS; provider webhook ID `6ac68919c5da8c7698cc9e83`.
- Synthetic webhook name: `aimm-p1-t05-webhook-9afc94a25d3f4c40a192d08a`.
- Webhook scope: Profile A `6ac5a45a8e4ca44f355033ae` only; event subscription: `post.scheduled` only; active state observed: true.
- Webhook create HTTP 200, request `b6c52985-4a06-4610-98f4-739ba0958d2b`.
- Webhook exact read-back: PASS, request `e71cfe67-bc65-4dbe-b268-ababbca3bbc0`.
- `POST /v1/webhooks/test`: BLOCKED by provider 5xx classification; the project-controlled receiver observed zero inbound `webhook.test` deliveries.
- Live signature/HMAC correctness: NOT VERIFIED because no inbound test delivery reached the receiver.
- Live body/header event-ID equality: NOT VERIFIED.
- Real `post.scheduled` retry trigger: NOT CREATED because execution stopped at `webhook.test`.
- Temporary publishing key: NOT CREATED.
- Automatic retry / stable event identity / duplicate delivery / delivery-log attempt 1+2 behavior: NOT VERIFIED LIVE.
- Foreign Profile delivery observed: no inbound webhook event was observed; therefore no positive live isolation conclusion is claimed.
- Temporary webhook cleanup: PASS; DELETE HTTP 200 request `ba0732b9-8f17-4d86-9d3c-204bc7bb8d45`; cleanup read-back HTTP 200 request `db1757db-cf8f-439f-8c73-999e16a2724c`; synthetic webhook absent after cleanup.
- Temporary receiver/tunnel shutdown: PASS; local execution `.env` copy and temporary cloudflared binary removed; no cloudflared process left running.
- Exact live Zernio API-call count: 6 = 4 normal + 2 cleanup; inbound webhook delivery count: 0.
- Public publication: 0. Scheduled posts created: 0. Temporary publishing keys created: 0. Ads/ad spend/OpenAI/fal.ai/media/comments/DMs/analytics ingestion: 0.

### Blocker / diagnosis
- Provider documentation states a webhook-test 500 means the endpoint did not return a successful 2xx response; in this run the receiver recorded no inbound request at all.
- A separate pre-live smoke test had proven the controlled receiver/tunnel pattern could receive an external request and return HTTP 401, but that smoke used a different ephemeral tunnel URL.
- Engineering diagnosis: the exact live quick-tunnel URL may not yet have been routable when the provider test was sent. This is a likely harness-readiness explanation, not a proven Zernio behavior fact.
- The harness was hardened after the run to probe the exact same live HTTPS URL before any provider API call. No second live run was performed because the Task Contract authorized exactly one bounded live run.

Webhook delivery contract recommendation: **REMAIN PENDING — FIX/BLOCKER REQUIRED**.

Canonical webhook-related capability statuses remain unchanged at `SPIKE_PENDING`; in particular Analytics Webhook remains `SPIKE_PENDING`.

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

Team Leader reviews P1-T05 implementation, deterministic evidence, the single blocked live Provider Behavior run, cleanup evidence, and post-blocker receiver-readiness hardening. Senior Engineer does not mark P1-T05 DONE / ACCEPTED, does not change webhook capability statuses, does not rerun live verification without explicit authorization, and does not start P1-T06.
