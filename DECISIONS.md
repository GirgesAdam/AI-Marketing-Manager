# DECISIONS.md

## D-001 — Commercial V1 Scope Locked
**Status:** Accepted

Commercial V1 will be completed and internally validated before customer launch. New provider features do not enter V1 automatically.

---

## D-002 — Provider Abstraction
**Status:** Accepted

Provider SDKs must not be used directly in business logic. Use provider interfaces/adapters such as `LLMProvider`, `SocialProvider`, `MediaProvider`, `StorageProvider`, and `EmailProvider`.

---

## D-003 — Zernio Responsibility Boundary
**Status:** Accepted

Zernio is used for connection infrastructure, social execution, inbox, analytics/provider data, Meta Ads execution, webhooks, media transfer, and usage attribution.

Zernio is not tenant authority, policy authority, marketing brain, or durable product state.

---

## D-004 — One Zernio Profile Per Brand
**Status:** Accepted

Each internal Brand maps to one Zernio Profile. Profiles help with grouping, scoped access, and usage attribution. Server-side ownership validation remains mandatory.

---

## D-005 — Scheduling Authority
**Status:** Accepted

PostgreSQL is the durable source of truth for schedules. BullMQ executes schedules. Provider-side scheduling is not the primary scheduling authority for Commercial V1.

---

## D-006 — Approval vs Limited Autopilot
**Status:** Accepted

Approval Mode: final text + final media + target account + scheduled time → human approval → scheduling.

Limited Autopilot requires explicit prior delegation by an authorized user. AI cannot grant or expand its own delegation. Out-of-scope actions fall back to human approval.

---

## D-007 — Cost Protection
**Status:** Accepted

Basic cost protection begins before the first paid API call. Full cost control later includes `UsageLimiter`, `CostEstimator`, `BudgetReservation`, `CostSettlement`, and `Pending Settlement`.

Failed requests are not assumed to cost zero.

---

## D-008 — Separate Ad Spend and API Service Budgets
**Status:** Accepted

Advertising spend budgets and API/service usage budgets are separate control systems.

---

## D-009 — Publishing Reliability
**Status:** Accepted

Publishing must support per-target state, idempotency, `schedule_version`, atomic execution claim, worker lease, Unknown state, reconciliation, and downtime recovery.

---

## D-010 — Emergency Controls
**Status:** Accepted

Pause/Kill Switch scopes: System, Organization, Account, Capability. Ads emergency stop must also attempt to pause active system-managed campaigns and verify provider state.

---

## D-011 — External Inputs Are Untrusted
**Status:** Accepted

Documents, comments, DMs, websites, webhook payloads, and product descriptions are data only. They cannot change tenant, permission, policy, budget, target account, or tool authority.

---

## D-012 — AI Production-Parity Evals
**Status:** Accepted

Production-quality AI evaluations must use the same production model, prompt version, model settings, structured schemas, and tool contracts.

Critical failures require root cause, fix, regression test, and affected-suite rerun.

---

## D-013 — Provider Behavior Tests vs System Integration Tests
**Status:** Accepted

Phase 1 proves provider behavior using a minimal harness. Later phases test our production subsystems against that proven behavior.

---

## D-014 — Native Comment Automation Safety
**Status:** Accepted

Native Zernio Comment-to-DM automations are included in Commercial V1 but disabled by default.

Activation sequence: create disabled → verify → reserve internal scope → ENABLING → activate provider → verify.

Uncertain enable/disable state keeps the scope reserved from AI automatic replies.

`isActive=false` is not assumed to cancel previously scheduled delayed responses until proven by Provider Spike.

---

## D-015 — Webhook Durability
**Status:** Accepted

`webhook_event` and `outbox_event` must be durably stored in the same database transaction before returning 2xx.

Automatic recovery includes PENDING, due FAILED_RETRYABLE, and stale PROCESSING. FAILED_TERMINAL requires explicit/manual replay.

---

## D-016 — Analytics Bootstrap
**Status:** Accepted

Order: capture cursor → import historical baseline → consume delta from captured cursor. Data changes and next cursor are persisted atomically when the production sync engine is built.

---

## D-017 — Media Ownership
**Status:** Accepted

Our Storage is the master archive. Zernio temporary uploads are publish-time transfer assets only. Track upload URL expiry separately from temporary asset expiry.

---

## D-018 — Meta Ads V1
**Status:** Accepted

Commercial V1 Ads scope is limited to Meta Ads (Facebook/Instagram) capabilities explicitly defined in Product/Provider specifications. No additional ad networks enter V1 without Scope Change.

---

## D-019 — No Customer Beta Before Commercial V1 Completion
**Status:** Accepted

Core Loop completion is an internal milestone only. Customer launch occurs only after full Commercial V1, internal QA, security/failure testing, continuous soak, capacity validation, and Release Readiness.

---

## D-020 — Commercial V1 Multi-Industry Scope Expansion
**Status:** Accepted

Commercial V1 launch scope is expanded from Fashion/Small E-commerce only to the following seven supported Verticals:

1. E-commerce / Fashion
2. Restaurants / Cafes
3. Beauty / Salons
4. Fitness / Gyms
5. Real Estate
6. Healthcare / Clinics
7. Marketing Agencies

This is an explicit approved Scope Change. All seven must satisfy their required V1 validation before Commercial Launch.

---

## D-021 — Industry-Agnostic Core + Vertical Packs
**Status:** Accepted

The core AI Marketing Manager must not hard-code E-commerce/Fashion assumptions.

Vertical-specific behavior is expressed through approved Industry Definitions / Vertical Packs containing structured facts, onboarding requirements, policies, metrics, optional tools, and eval requirements.

Core workflows such as planning, generation, approval, publishing, analytics, community management, feedback, policy enforcement, usage control, audit, and provider execution remain shared wherever possible.

---

## D-022 — Healthcare Commercial V1 Safety Boundary
**Status:** Accepted

Healthcare/Clinics are supported for marketing workflows only. Commercial V1 does not provide diagnosis, treatment plans, personalized clinical advice, clinical decision support, or EMR/EHR functionality.

Medical/sensitive questions must follow the approved healthcare policy and human-handoff rules. Unapproved medical claims are prohibited.

---

## D-023 — Marketing Agency V1 Boundary
**Status:** Accepted

A Marketing Agency organization may manage multiple client Brands using existing multi-brand/multi-tenant architecture.

Each client Brand must keep isolated knowledge, accounts, media, approvals, policies, usage, costs, and audit history. Permissions are mandatory at Brand scope for client data/actions. Cross-client leakage has zero tolerance.

Commercial V1 agency support does not automatically include a white-label client portal, full agency CRM, or agency accounting/billing suite.

---

## D-024 — Vertical Certification Before Launch
**Status:** Accepted

A supported Vertical is not considered release-ready merely because the generic Agent can generate content for it.

Each approved V1 Vertical requires completed schema/onboarding rules, relevant policies, required business flows, Vertical AI evals, security/tenant tests, and Release Criteria evidence.

Commercial Launch requires all seven approved Verticals to meet their applicable release criteria.

---

## D-025 — Agency Organization and Client Brand Model
**Status:** Accepted

A Marketing Agency is an Organization operating multiple client Brands. Each Brand has its own Vertical Pack. Agency employee permissions must be enforceable at Brand scope, including knowledge retrieval, media, reports, workers/jobs, social/ad resources, budgets, approvals, usage/cost visibility and audit access.

---

## D-026 — Shared Meta Ad Account Does Not Imply Shared Brand Authority
**Status:** Accepted

One Meta ad account may contain ads for multiple Pages/Brands. `adAccountId` or provider account membership alone is not sufficient authorization for mutation. Every managed campaign/ad set/ad must be mapped to an owning Brand and validated server-side before reads or actions. Page filtering is attribution/reporting assistance, not an execution authorization boundary.

---

## D-027 — Verified External Transaction Boundary
**Status:** Accepted

Without a trusted integration result, the Agent may provide verified information, send approved destination links, capture inquiries/leads, or hand off. It may not state that a reservation, appointment, order, property availability, viewing, enrollment or other external transaction is confirmed. Stale/uncertain mutable facts require disclosure or human handoff instead of guessing.

---

## D-028 — Typed Generic Offerings Model
**Status:** Accepted

Commercial V1 uses a shared minimal Offering model plus validated type-specific extensions for PRODUCT, SERVICE, MENU_ITEM, PROPERTY, MEMBERSHIP, CLASS and PACKAGE. Price and availability semantics are typed; a universal `available` boolean is not authoritative. Mutable facts store source/provenance, freshness/verification time and location scope.

---

## D-029 — Vertical Privacy and Media Truthfulness
**Status:** Accepted

Vertical policies apply to text, media and data handling. Sensitive healthcare inbound content is minimized, access-controlled and excluded from marketing knowledge/embeddings. Potentially health-sensitive free-form body/attachments are not sent to the LLM in Commercial V1; only approved administrative/marketing intents use LLM automation. Synthetic/edited media cannot be presented as factual evidence of treatment results, body transformations, property characteristics or other material facts that are not verified. Human approval does not override factual-truth requirements.

---

## D-030 — Vertical-Specific Meta Ads Validation
**Status:** Accepted

Provider Spike and system validation must cover Meta special-ad-category requirements where applicable to launch Verticals/markets, especially Real Estate/Housing, including `specialAdCategories`, `specialAdCategoryCountry`, targeting restrictions, paused-first behavior where supported, and provider read-back verification.

---

## D-031 — Vertical Certification Is Scenario-Based
**Status:** Accepted

Each supported Vertical requires measurable eval scenarios covering at least missing facts, stale facts, location mismatch, expired offers, out-of-scope questions, prompt injection and unsafe/unsupported actions, plus sector-specific safety cases. Reported business outcomes must be backed by a trusted data source; proxy events must not be mislabeled as confirmed outcomes.

---

## D-032 — Timeline and Cost Estimate Reset
**Status:** Accepted

Any schedule/cost estimate created before the seven-Vertical scope amendment is obsolete. The current initial planning baseline is **56–74 calendar weeks** for one hands-on Senior Engineer plus one non-coding Team Leader, based on the amended workstreams and seven Vertical certification effort. It is not a commitment and must be refined after Phase 1 and Phase 2 using actual task velocity/provider behavior. Cash cost is tracked from actual Coding LLM, provider, infrastructure and capped ad-test usage rather than fabricated without billing inputs.


## D-033 — Closed Meta Ads Commercial V1 Actions
**Status:** Accepted

Commercial V1 Ads is Meta-only. Allowed objectives are Engagement, Traffic, Awareness and Video Views. Allowed creative paths are single image, single video and eligible organic-post boost. V1 permits approved create/preview/read-back/activate/pause/resume, bounded budget modification, schedule modification through re-approval, analytics/status reads and emergency stop. Provider capabilities outside this list do not enter V1 automatically.

Budget increases use a persisted **human-approved budget baseline**. The <=20% no-reapproval allowance is cumulative from the last amount explicitly approved by a human, not from each immediately previous automated amount. Example: `100 → 120` may be allowed under valid delegation; `120 → 144` requires new Human Approval because `144` is 44% above the last human-approved baseline `100`. After new Human Approval, the approved amount becomes the new baseline. All spend ceilings remain independently enforceable.

Catalog, lead, app, advanced conversion, dynamic creative, carousel-create, audience automation, delete/duplicate and unrestricted autonomous campaigns are out of V1.

---

## D-034 — Commercial V1 Launch Market, Languages and Currencies
**Status:** Accepted

Commercial V1 release certification is limited to Egypt. Supported languages are Arabic (`ar-EG`, with Egyptian/Modern Standard style selection) and English. Supported business/ad execution currencies are EGP and USD, with no automatic FX rewriting of business facts or approved budgets. Other markets/languages/currencies require later certification or explicit Scope Change.

---

## D-035 — Quantitative Release Quality Gates
**Status:** Accepted

Critical release cases require 0 critical failures / 100% pass. Production-parity non-critical AI quality initially requires >=92% aggregate, >=90% per Vertical and no non-critical rubric dimension below 85%. Required deterministic Acceptance Criteria tests must all pass. These percentages are initial acceptance gates whose evidentiary value depends on the quality, coverage and scoring reliability of the eval set; they are not standalone proof of readiness and cannot override critical, deterministic, security, provider, soak or Vertical-certification gates.

---

## D-036 — Mutable Fact Freshness Defaults
**Status:** Accepted

Commercial V1 defaults: REFERENCE 30 days; OPERATING 7 days; COMMERCIAL 7 days; VOLATILE 15 minutes only when backed by a trusted live source; EXPLICIT_VALIDITY follows explicit source validity/expiry. Stale facts trigger uncertainty/block/handoff rather than confident current claims. Vertical rules may be stricter.

---

## D-037 — Healthcare Sensitive-Inbox Retention and LLM Boundary
**Status:** Accepted

Potentially health-sensitive free-form content and clinical attachments are human-routed and their body/attachments are not sent to the LLM in Commercial V1. Access requires Brand assignment plus `health_sensitive_inbox`. Raw sensitive content is purged within 7 days of receipt; temporary processing copies/caches within 24 hours or sooner; audit metadata may remain for 365 days only without sensitive body/media/clinical detail. Deletion must include derived copies/indexes/caches/summaries and is tested.

---

## D-038 — Phase-1 Test VPS Public Ingress Ownership
**Status:** Accepted

For the current Phase-1 shared test VPS recovery/readiness path, Nginx is the canonical public HTTP/HTTPS ingress and owns public TCP/80 and TCP/443. The existing Elite WordPress workload remains supported by Apache, but Apache runs behind Nginx on a loopback-only backend listener. Nginx routes `elite.restartorg.com` to that backend while preserving MarketlyAI routing/TLS responsibilities.

Apache must not retain public TCP/80 or TCP/443 ownership after the completed cutover. The cutover must be bounded, reversible, preserve the Elite workload and unrelated hosts, and include explicit rollback.

This decision is scoped only to the current Phase-1 test VPS recovery/readiness path. It does not mandate Apache, Nginx, or this exact topology for Commercial V1 production deployments.


---

## D-039 — Django/Python Production Backend Stack
**Status:** Accepted

Commercial V1 production backend uses Python, Django, and Django REST Framework. Next.js, React, and TypeScript remain the frontend stack. PostgreSQL and pgvector remain the durable database and vector-search foundation.

Django ORM and Django Migrations replace Drizzle ORM for the production backend. Django authentication with a Custom User model replaces Better Auth as the production authentication foundation. Django authentication does not itself define Organization or Brand authority: Organization, Brand, Membership, Role, Permission, and mandatory server-side ownership validation remain explicit product security boundaries. Django Groups/permissions alone are not sufficient proof of Brand authority, and Django Admin is an internal operational interface only; it must not bypass Brand isolation, policy, money controls, healthcare restrictions, or external-action authority.

Redis and Celery replace BullMQ as the production asynchronous execution mechanism. PostgreSQL remains the durable source of truth for schedules, business/action state, idempotency state, leases/claims, and reconciliation state. Celery and Redis are execution mechanisms only and are not durable scheduling or business authority. Existing reliability requirements remain mandatory, including `schedule_version`, atomic claims, worker leases, stable `action_id`, stable `idempotency_key`, Unknown state, reconciliation, downtime recovery, ScheduleRebuilder-equivalent recovery, and the outbox pattern. Celery automatic retry behavior must never replace business-level idempotency/reconciliation: an external action that may already have reached the Provider cannot be blindly retried solely because a Celery task was redelivered or a worker crashed.

Pydantic is the preferred structured contract layer for AI structured outputs, Provider adapter contracts, tool inputs/outputs, and internal typed non-ORM contracts. DRF serializers/OpenAPI define the HTTP API contract to the Next.js frontend, with generated or validated TypeScript contracts used to prevent frontend/backend schema drift.

The accepted Phase-1 TypeScript Provider Spike Harness and its historical Provider Behavior evidence remain valid; no Python rewrite is required merely because the production backend changed. D-005 is superseded only where it names BullMQ as the execution mechanism; its PostgreSQL durable-scheduling-authority decision remains valid. D-038 remains unchanged and continues to apply only to the current Phase-1 test VPS recovery/readiness path. Caddy remains the planned Commercial V1 production reverse proxy unless superseded by a later explicit decision.

This architecture amendment changes implementation technology only. It does not add or remove Commercial V1 product capabilities.

---

## D-040 — Phase-1 MarketlyAI Dedicated Test Receiver Routing Scope

**Status:** Accepted

For the current `P1-T08` `analytics.synced` Provider Behavior experiment, a completed Commercial V1 production application deployment or production application upstream is not required merely to expose the bounded temporary webhook receiver used by the experiment.

This decision records the Owner-approved Phase-1 Option B only. It removes the production-application-upstream prerequisite for this specific test path. It does not establish that the Commercial V1 application is deployed, that the receiver is currently reachable, or that any routing, service, TLS configuration, or cutover is already operational.

`marketlyai.restartorg.com` remains the intended future platform hostname. Its generic `/` route must retain its existing safe HTTP 404 behavior unless a separate explicit decision changes that behavior.

For the current Phase-1 experiment, only the exact path:

`/p1-t08-f11/analytics-synced`

is eligible for temporary receiver routing.

After a separately authorized operational cutover/readiness task, Nginx may route that exact path to a temporary loopback-only receiver.

This decision does not authorize:

- a prefix route
- wildcard routing
- catch-all routing
- a generic MarketlyAI reverse proxy
- invention of a production application upstream, runtime, repository, service, or port
- deployment of the Commercial V1 application
- receiver creation
- infrastructure modification
- public HTTPS cutover
- Provider/Zernio execution
- F11 execution or consumption of its one-run authorization

D-038 remains fully applicable to the Phase-1 shared test VPS: Nginx remains the canonical public ingress, the existing Elite workload remains preserved behind its approved loopback topology, Apache must not regain public TCP/80 or TCP/443 ownership after completed cutover, unrelated hosts must remain unaffected, and any cutover must remain bounded and reversible with explicit rollback.

D-039 remains unchanged. The current Commercial V1 production target remains VPS hosting with Caddy as the planned production reverse proxy, as defined by the existing architecture and D-039. This decision does not change the approved production hosting architecture or make any new hosting-platform decision. D-040 does not establish that the target production runtime has been implemented.

Any later operational task implementing the temporary Phase-1 route must verify, before Provider execution:

- the route matches only `/p1-t08-f11/analytics-synced`
- the backend receiver is loopback-only
- generic `marketlyai.restartorg.com/` retains the safe existing 404 behavior
- `elite.restartorg.com` continues to work
- unrelated virtual hosts remain unchanged
- Apache does not own public TCP/80 or TCP/443 after completed cutover
- Nginx configuration validation passes
- effective routing configuration is reviewed
- MarketlyAI TLS/HTTPS readiness is explicitly verified
- rollback is bounded and tested or demonstrably ready
- receiver readiness is proven before any Provider/Zernio call

D-040 does not execute, consume, expand, or renew F11 authorization.

F11 remains `AUTHORIZED / UNCONSUMED` and `UNCONSUMED / BLOCKED PRE-PROVIDER` until a separately authorized operational task satisfies its prerequisites.

P1-T08 remains unresolved and `analytics.synced` remains `SPIKE_PENDING`.

## D-041 — Phase-1 F11 Least-Privilege Receiver Handoff

**Status:** Accepted

For the bounded P1-T08/F11 Phase-1 experiment, the accepted receiver handoff design is `Candidate B — Exact lifecycle grants + fixed verifier`.

Automation privilege is limited to exactly:
1. `/usr/bin/systemctl stop marketly-r02-receiver.service`
2. `/usr/bin/systemctl start marketly-r02-receiver.service`
3. `/usr/local/sbin/marketly-f11-receiver-verify`

RunAs is `root` only. No restart privilege is included.

The fixed verifier is a zero-argument read-only capability. It may inspect only:
- `/opt/marketly-r02/receiver.py`
- `/etc/systemd/system/marketly-r02-receiver.service`
- `/var/lib/marketly-r02/f11-evidence`

It may emit only bounded hash/count/state evidence. It must not expose evidence contents, evidence filenames, webhook payloads, headers, credentials/secrets, or arbitrary filesystem contents. Incomplete verification must fail closed/nonzero.

Explicitly prohibited: `NOPASSWD: ALL`; unrestricted or wildcard `systemctl`; arbitrary shell/root; arbitrary RunAs; unrestricted interpreter execution; caller-controlled paths; arbitrary filesystem reads/writes; unrelated service control.

The verifier must be `root:root`, mode `0755`, in a root-owned/non-writable parent; accept zero arguments and zero caller-selected paths; use a fixed/sanitized environment; perform no shell evaluation or caller-controlled execution behavior; reject symlink fixed inputs; avoid following symlinks; verify opened file type/identity; treat the evidence directory as a fixed real directory; inspect direct children only with no recursion; and fail closed on symlink/special/unexpected evidence entries.

`evidenceCount` counts direct regular evidence files only. Accepted evidence states are `MISSING`, `UNREADABLE_OR_INTERNAL_ERROR`, `VALID_EMPTY`, `VALID_NONEMPTY`, and `INVALID_STRUCTURE`; the count is numeric only for valid states and `null` otherwise.

This design remains valid only while the systemd unit, interpreter, receiver parent path, unit/drop-ins, ExecStart target, EnvironmentFile dependencies, service WorkingDirectory dependencies, verifier, and verifier parent preserve the accepted non-writability/ownership invariants; the service must continue to run under the accepted distinct service account. Any implementation-time drift is a hard blocker.

Failure/recovery policy: no blind lifecycle retry; never kill an unknown listener automatically; do not create the reverse tunnel until exact stop + inactive + port-free gates pass; restoration failure requires STOP/human escalation; post-restoration hash mismatch means the receiver is not safely restored; evidence-count drift fails closed; F11 authorization consumption depends only on whether the first trusted Provider request occurred.

This decision is scoped only to the Phase-1 P1-T08/F11 test infrastructure. It does not define Commercial V1 production deployment architecture.

Implementation remains separately gated. Before activation, a separately authorized task must prove exact installed sudoers syntax, ownership/mode invariants, verifier path safety, fail-closed behavior, absence of a privilege-escalation path, exact privilege-surface behavior, and safe recovery/restoration behavior. That implementation task must make zero Provider/Zernio requests.

This decision does not authorize F11 execution and does not consume F11 authorization.


## D-042 — Analytics Webhook Is a Signal, Reconciliation Owns Correctness

**Status:** Accepted

For Commercial V1 analytics integration, `analytics.synced` may be used as an authenticated/deduplicated wake-up signal.

It is not durable analytics authority and must not be the only correctness mechanism.

After trusted tenant/brand/account ownership validation, the signal schedules reconciliation against the supported Analytics/Delta provider interface.

Durable analytics state and cursor live in PostgreSQL.

The production consumer follows D-016:

`capture cursor → load baseline → resume Delta from captured cursor`.

Webhook duplicates/retries are idempotently deduplicated.

A bounded reconciliation safety net independent of webhook arrival is required.

This decision is grounded in P1-T08 evidence:

- valid exact-target `analytics.synced` event observed;
- Analytics sync timestamp alignment observed;
- direct F11 fixture correlation not established;
- final bounded Provider diagnostic could not close the correlation gap.

This does not claim Zernio webhook unreliability.

It deliberately removes webhook delivery from being a single point of correctness failure.


---

## D-043 — Controlled Parallel Wait Lanes

**Status:** Accepted

The normal Senior Engineer execution model remains one actively executing task. A second Senior task may remain open only when it is formally classified `WAITING_EXTERNAL` or `WAITING_TIME_GATE` and all currently authorized implementation work for that waiting task is complete.

Maximum open Senior tasks = `2`.

Maximum simultaneously executing Senior tasks = `1`.

Allowed lanes:

```text
EXECUTING = max 1
WAITING_EXTERNAL / WAITING_TIME_GATE = max 1
```

This is controlled parallel waiting, not unrestricted parallel development. When no legitimate external/time-gated wait exists, the default remains single-task execution.

A task may enter the waiting lane only when further progress depends solely on a real external condition such as a Provider retention window, scheduled observation, external approval, external fixture availability, third-party response, or unavoidable time-based Provider behavior. A task must not enter the waiting lane merely because implementation is difficult, tests are failing, review is incomplete, an internal blocker is solvable, or the Senior wants to switch tasks.

While a task is in the waiting lane, there is no speculative implementation expansion, unauthorized Provider polling, retry beyond its Task Contract, unrelated mutation, or successor work on its branch. Only the explicitly authorized future observation/action may resume it. Existing task-specific request ceilings, one-run authorization, safety boundaries, and evidence rules remain unchanged.

A new executing task may start while one task waits only after Team Leader confirmation that the new task has no dependency on the unfinished waiting-task outcome; no shared mutable Provider fixture; no conflicting external resource ownership; no overlapping budget/spend authority; no conflicting publishing/social target; no incompatible infrastructure mutation; no requirement to assume the waiting task's result; and its own complete Task Contract.

Every concurrently open task uses its own branch. The waiting branch remains frozen except for its authorized scheduled observation/action and resulting evidence/documentation. Successor work must not be implemented on the waiting branch.

Shared documentation must preserve both open lanes. Each branch records only facts known to that task; one lane must not erase another; later integration must preserve both histories; documentation conflicts require Team Leader review and must not be resolved blindly.

Each open task retains its own lifecycle: `Implementation → Tests → Review → Accept/Reject`. A waiting task is not DONE. Completion of the executing task does not change the waiting task, and each task requires separate Team Leader acceptance.

Parallel wait lanes do not permit premature Phase transition. Phase 1 cannot close while any mandatory Phase-1 task or material Provider assumption remains unresolved; a mandatory waiting task remains an open Phase blocker where applicable.

Parallel lanes never weaken tenant/Brand isolation, approval, policy, Usage Limiter, budget controls, emergency controls, Provider request ceilings, idempotency, or task-specific one-run authorization. Authorization cannot be borrowed or transferred between lanes.

Dependency-gated successor tasks remain blocked until their dependency is accepted. Never execute two Senior tasks simultaneously.

P1-T14 is the initial waiting-lane case under this decision. It remains `WAITING_TIME_GATE` and remains fully bound to its existing Observation A/B contract, timestamps, request ceiling, and zero-credential/no-presign/no-upload authorization boundary.
