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
- Publishing: `SPIKE_PENDING`.

## Current Task
`P1-T04 — Verify Zernio Publishing Behavior`

**Status: IMPLEMENTED — AWAITING TEAM LEADER REVIEW**

Completion evidence:
- Approved base: `d87a5103a3f2b67f87abb3c0965e15d949c0307b`.
- Branch: `p1-t04-zernio-publishing`.
- Frozen target verified: Profile A `6ac5a45a8e4ca44f355033ae`, Zernio Facebook account `6ac64f8740364f4695dd3077`, Facebook Page `1387424501114639` (`Clothing Brand`).
- Trusted control-plane identity verification: PASS; expected identity match = true.
- Temporary publishing key: Profile-A-only, `scope=profiles`, `permission=read-write`, bounded 1-day expiry; raw key not persisted/exposed.
- Account/Page/health preflight: PASS; platform `facebook`, selected expected Page matched, account status `healthy`, `canPost=true`.
- Draft create/read/idempotency replay: PASS; same logical Zernio post ID, duplicate = NO; draft cleanup/read-back: PASS.
- Scheduled create/read: PASS; requested `Africa/Cairo` schedule `2026-10-10T17:39:51`, provider returned `2026-10-10T14:39:51.000Z`; scheduled cleanup/read-back: PASS.
- Exactly one immediate public Facebook text-only test post created: PASS; published-state read-back: PASS.
- Public test post cleanup/unpublish + read-back: PASS.
- Wrong publishing target observed: NO.
- Duplicate confirmed publish observed: NO.
- Temporary publishing key revoked: PASS; post-revoke auth returned HTTP 401 and credential valid = NO.
- One bounded live P1-T04 run only; exact provider call count: 20 normal / 0 cleanup allowance / 20 total, within normal ceiling 22.
- Targeted P1-T04 regressions: 44 passed / 0 failed.
- Full regression suite: 150 passed / 0 failed / 0 skipped.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- No Ads, ad spend, OpenAI, fal.ai, media generation/upload, new account connection, reconnect, comments/DMs, or webhooks.
- Publishing observed recommendation: `SPIKE_PASS`, pending Team Leader acceptance.
- Canonical Publishing remains `SPIKE_PENDING`.
- Known limitation: Core publishing lifecycle verified on Facebook text-only only. Instagram/media/platform-specific publishing remains separately unverified.
- P1-T05 implementation started: NO.

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
Team Leader reviews P1-T04 implementation, deterministic regressions, one bounded real Provider Behavior run, exact-target evidence, draft/scheduled/public cleanup, temporary-key cleanup, and capability recommendation. Senior Engineer does not mark P1-T04 DONE / ACCEPTED, does not change Publishing from `SPIKE_PENDING`, and does not start P1-T05 without explicit Team Leader verdict and assignment.
