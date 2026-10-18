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