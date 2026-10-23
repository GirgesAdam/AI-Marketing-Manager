# PROVIDER_CAPABILITIES.md

## Zernio Integration Specification
### Commercial V1
### FINAL — Approved for Provider Spike

---

# 1. Document Status

```text
Commercial V1 Provider Scope = APPROVED FOR SPIKE
Zernio Integration Design = APPROVED
```

**Current execution Phase/Task is declared only in `PROGRESS.md`.**

هذه الوثيقة تحدد كيفية استخدام Zernio داخل Commercial V1.

وجود Capability في الوثائق لا يعني أنها Production Ready.
الحالة النهائية لكل Capability يتم إثباتها بالاختبار.

---

# 2. Responsibility Boundary

## Zernio مسؤول عن

- Social account connection
- Social publishing execution
- Provider delivery status
- Social analytics
- Historical analytics access
- Inbox integration
- Organic comments
- Ad comments
- Meta Ads execution
- Meta Ad previews
- Platform webhooks
- Publish-time media transfer
- Native Comment-to-DM automations
- Provider usage reporting

## نظامنا مسؤول عن

- Tenant isolation
- Business facts
- Marketing strategy
- AI decisions
- Content generation
- Scheduling authority
- Permissions
- Policies
- Approval workflows
- Autopilot delegation
- Usage quotas
- API budgets
- Advertising spend controls
- Comment ownership
- Human handoff
- Durable state
- Audit trail

---

# 3. One Zernio Profile Per Brand

كل Brand تحصل على One Zernio Profile.

Mapping:

```text
organization_id
brand_id
zernio_profile_id
```

Profile تستخدم للتجميع، scoped access، وusage attribution، لكنها ليست Tenant Security Boundary.

---

# 4. Scoped API Key Architecture

## Control Plane Key

Team-level credential تستخدم Server-side فقط في:
- Profile provisioning
- Scoped key administration
- Webhook administration
- Team operations
- Usage reporting

ممنوع وصولها إلى Browser / Client / LLM / Logs.

## Brand Runtime Keys

لكل Brand مفاتيح مقيدة بالـProfile وبأقل صلاحيات لازمة.

---

# 5. Credential Security

كل Credential:
- encrypted at rest
- never sent to LLM
- never returned to frontend
- never logged
- rotatable
- auditable

---

# 6. Connected Account Accounting

نفصل:
- `social_accounts_count`
- `ad_accounts_count`

Facebook Page + Instagram + Meta Ad Account = 3 Connected Accounts.

---

# 7. Historical Analytics Bootstrap

الترتيب الإلزامي:

```text
Capture Analytics Cursor
↓
Import Historical Baseline
↓
Read Delta From Captured Cursor
```

تحديث البيانات والـCursor يتم ذرّيًا عند بناء النظام.

إذا انتهت صلاحية Cursor:
Capture new cursor → rebuild/refresh baseline → resume delta.

---

# 8. Analytics Capabilities to Verify

- Historical analytics
- Best Times to Post
- Performance Decay
- Frequency vs Engagement
- Analytics delta/cursor
- `analytics.synced`

هذه Signals للاستراتيجية، وليست Strategy Authority.

---

# 9. Shared Team Rate Limiting

Scoped keys لا تعني quota مستقلة لكل Brand.

كل Zernio calls يجب لاحقًا أن تمر عبر `ZernioTeamRateLimiter`.

Priority concept:
- P0 Safety Critical
- P1 User-Facing Execution
- P2 Operational Sync
- P3 Bulk Background

احترام `Retry-After` عند 429 إلزامي.

---

# 10. Webhook Architecture

عند بناء النظام:

```text
Receive webhook
↓
Verify signature
↓
Extract stable provider event ID
↓
BEGIN DB TRANSACTION
↓
Persist webhook_event
↓
Persist/ensure outbox_event
↓
COMMIT
↓
Return 2xx
↓
Outbox Dispatcher
↓
Background Processing
```

نفصل:
- `receipt_status`
- `processing_status`

Processing states:
- PENDING
- PROCESSING
- PROCESSED
- FAILED_RETRYABLE
- FAILED_TERMINAL

Recovery يشمل:
- PENDING
- due FAILED_RETRYABLE
- stale PROCESSING lease

ولا يشمل FAILED_TERMINAL تلقائيًا.

---

# 11. Community Model

Organic Comments + Ad Comments توحّد داخليًا إلى `CommunityComment` مع:

```text
source = organic | ad
```

Dark Post comments لها provider path مستقلة ولا نفترض ظهورها في organic stream.

---

# 12. Native Comment-to-DM

Commercial V1:
Included, disabled by default.

Native Automation path مستقلة عن AI Agent.

كل automation لها internal mirror مثل:
- internal_rule_id
- zernio_automation_id
- brand_id
- scope
- keywords
- audience_conditions
- delays
- desired_state
- provider_state
- ownership_state

Ownership states:
- INACTIVE
- ENABLING
- ACTIVE
- DISABLING
- DISABLED_CONFIRMED
- ENABLE_UNCONFIRMED
- DISABLE_UNCONFIRMED

---

# 13. Native Automation Activation — Safe Order

```text
Create at Zernio with isActive=false
↓
Read back & verify configuration
↓
Reserve matching scope internally
↓
ownership_state=ENABLING
↓
AI Agent stops automatic handling for reserved scope
↓
Activate at Zernio
↓
Read back provider state
↓
ACTIVE or ENABLE_UNCONFIRMED
```

لو التفعيل غير مؤكد، النطاق يظل محجوزًا ولا يعود للـAI تلقائيًا.

---

# 14. Native Automation Disable

```text
ownership_state=DISABLING
↓
PATCH isActive=false
↓
Read back provider state
↓
DISABLED_CONFIRMED
or
DISABLE_UNCONFIRMED
```

لو غير مؤكد، النطاق يظل محجوزًا ويبدأ Reconciliation.

لا نفترض أن `isActive=false` يلغي delayed actions سبق جدولتها.

---

# 15. No Double Reply Invariant

```text
One inbound comment
→ maximum one automated response path
```

أي AI response + Native Automation response لنفس Event = Critical Bug.

---

# 16. Media Ownership

Zernio ليس Master Media Archive.

الأصل يبقى في Our Storage.

Publish-time flow:

```text
Approved Original
↓
Our Storage
↓
Near Publish Time
↓
Request Fresh Provider Upload
↓
Upload
↓
Validate Asset
↓
Publish
```

نفصل:
- `upload_url_expires_at`
- `temporary_asset_expires_at`
- `public_media_url`

ولا نخلط صلاحية رابط PUT بعمر الملف المؤقت.

---

# 17. Ads

Commercial V1 يستخدم Meta Ads فقط.

Provider Spike must validate only the closed product scope: Engagement, Traffic, Awareness, Video Views; single-image/single-video simple create paths; eligible-post boost; preview/read-back; paused-first where supported; activation; pause/resume; bounded budget update; schedule change behavior; emergency stop. Provider support for other objectives/formats/actions is recorded but remains Post-V1.

Launch-market certification for Ads is Egypt with EGP/USD ad-account currencies. Real Estate and any applicable regulated path must test `specialAdCategories`, `specialAdCategoryCountry`, provider targeting restrictions and read-back behavior.

Zernio roles:
- Ad account integration
- Ad analytics
- Preview
- Boost
- supported V1 campaign actions
- budget updates
- pause/resume
- ad comments

Default safety عندما يثبت الدعم:
Create PAUSED → verify → approve/delegate → activate.

Ads Emergency Stop يجب أن يحاول إيقاف الحملات النشطة التي يديرها النظام والتأكد من حالتها.

API-service budgets منفصلة عن Ad Spend budgets.

---

# 18. Shared Meta Ad Account / Brand Ownership

A Meta ad account may serve multiple Facebook Pages and therefore multiple internal Brands.

Zernio `pageId` filtering may assist read/report attribution where supported, but it is not an authorization boundary.

Our durable mapping must identify the owning Brand for every system-managed campaign, ad set and ad. Before mutation, backend ownership validation must pass even when multiple Brands share one `adAccountId`.

Provider Spike must verify which provider identifiers are available on create/read/list paths and whether they are sufficient to reconcile this ownership mapping.

---

# 19. Vertical-Specific Meta Ads Provider Tests

In addition to generic Ads tests, Phase 1 verifies Meta regulated/special-category behavior needed by target launch Verticals/markets.

At minimum for Real Estate/Housing where applicable:
- `specialAdCategories` accepted/rejected behavior.
- `specialAdCategoryCountry` requirements.
- targeting restrictions returned/enforced by Meta/Zernio.
- PAUSED-first creation where supported, followed by read-back of category/targeting/status before activation.
- invalid/unsupported combinations fail safely.

Equivalent tests are required for any other launch Vertical/market that triggers a Meta special-ad-category rule.

---

# 20. Profile-Level Usage Attribution

نستخدم usage attribution حسب Profile عندما تثبت في Provider Spike.

Mapping:

```text
zernio_profile_id
↓
brand_id
↓
organization_id
```

لاستخدامها في Cost Settlement وUnit Economics.

---

# 21. Capability Verification Status

القيم:

```text
DOC_CONFIRMED
SPIKE_PENDING
SPIKE_PASS
PARTIALLY_VERIFIED
SPIKE_FAIL
BLOCKED
NOT_APPLICABLE
```

لكل capability نحفظ evidence:
- verified_at
- provider_environment
- account_type
- permissions
- provider_request_ids
- test_case_ids
- known_limitations
- notes

---

# 22. Capability Matrix

| Capability | Commercial V1 | Verification | Requirements | Our Responsibility | Zernio Responsibility |
|---|---|---|---|---|---|
| Profiles | Yes | SPIKE_PASS | Zernio Team | Brand mapping | Provider grouping |
| Scoped Keys | Yes | SPIKE_PASS | API key permissions | Secret management | Scope enforcement |
| FB Connect | Yes | SPIKE_PENDING | Supported Page | Tenant validation | Connection |
| IG Connect | Yes | SPIKE_PENDING | Supported professional account | Tenant validation | Connection |
| Publishing | Yes | SPIKE_PASS | Connected account | Schedule/policies | Execution |
| Historical Analytics | Yes | SPIKE_PENDING | Analytics support | Baseline | Collection |
| Analytics Delta | Yes | SPIKE_PENDING | Analytics support | Durable synchronization | Delta feed |
| Best Times | Yes | SPIKE_PENDING | Sufficient data | Decision signal | Calculation |
| Performance Decay | Yes | SPIKE_PENDING | Analytics | Strategy signal | Calculation |
| Frequency Analysis | Yes | SPIKE_PENDING | History | Strategy signal | Calculation |
| Analytics Webhook | Yes | PARTIALLY_VERIFIED | Webhooks + durable Analytics/Delta reconciliation | Signal validation + ownership + reconciliation | Change/wake-up signal |
| Organic Comments | Yes | SPIKE_PASS | Inbox support | AI/Human workflow | Fetch/reply |
| Ad Comments | Yes | SPIKE_PENDING | Meta Ads | Unified workflow | Dark-post access |
| DMs | Yes | SPIKE_PENDING | Inbox support | Agent/handoff | Messaging |
| Ad Preview | Yes | SPIKE_PENDING | Meta Ads | Approval UI | Preview |
| Boost | Yes | SPIKE_PENDING | Eligible post | Policy/approval | Ads execution |
| Paused-First Ads | Yes | SPIKE_PENDING | Provider support | Safety workflow | Ads execution |
| Media Upload | Yes | PARTIALLY_VERIFIED | Media API | Original ownership | Temporary transfer |
| Profile Usage | Yes | SPIKE_PENDING | Usage access | Unit economics | Attribution |
| Comment-to-DM | Yes | SPIKE_PENDING | Supported automation | Ownership coordination | Native execution |
| Delayed Native DM | Yes* | SPIKE_PENDING | Automation support | Safety coordination | Delayed action |
| Delayed Native Reply | Yes* | SPIKE_PENDING | Automation support | Safety coordination | Delayed action |

Organic Comments observed scope: `SPIKE_PASS — controlled Facebook organic create/read/list/reply behavior verified; production tenant/Brand authorization, ownership, policy, AI/Human workflow, durable state, idempotency, and reconciliation remain system responsibilities.` Zernio supplies Provider comment fetch/reply execution. This does not verify DMs, Ad Comments, private replies, Likes/hide, or `comment.received` webhook behavior.

Media Upload observed scope: `PARTIALLY_VERIFIED — temporary presign, exact upload, public binary retrieval, and signed upload-URL expiry enforcement verified.` This does not promote Media Upload to `SPIKE_PASS`. Remaining Phase-1 Media gaps are temporary object retention/deletion behavior and re-upload of an approved original using a new presign. Temporary object lifetime/deletion remains `DOC_CONFIRMED / LIVE RETENTION BEHAVIOR UNVERIFIED`; `APPROVED_ORIGINAL_REUPLOAD = SPIKE_PENDING`.

`Yes*` يعني أنها ضمن الـV1 الوظيفي، لكن تمكينها في Production يعتمد على اجتياز Safety Spike.

---

# 23. Provider Behavior Tests vs System Integration Tests

## Phase 1 — Provider Behavior

تثبت ماذا يفعل Zernio فعليًا:
- scoped key isolation
- 429 / Retry-After
- analytics cursor behavior
- native automation disable/delay behavior
- webhook contract
- media expiry
- ads API behavior
- profile usage attribution

## Later — System Integration

تثبت أن نظامنا يتعامل مع السلوك:
- outbox recovery
- cursor transaction recovery
- rate-limit fairness
- worker crash recovery
- atomic claims
- comment ownership race handling

لا نبني Production subsystem كامل لتنفيذ Provider Spike.

---

# 24. Minimal Provider Spike Harness

Phase 1 تستخدم minimal harness لتسجيل:
- Test ID
- Provider
- Capability
- Timestamp
- Safe request metadata
- Status
- Safe response headers
- Provider request ID
- Latency
- PASS / FAIL / BLOCKED
- Error category
- Notes

Secrets لا تُسجل.

النتائج تحفظ في:
`PROVIDER_SPIKE_RESULTS.md`

---

# 25. Phase 1 Priority Order

1. Profiles & Scoped Keys
2. Publishing
3. Webhooks
4. Analytics
5. Community
6. Native Automation
7. Media
8. Ads
9. Usage Attribution

---

# 26. Required Native Automation Provider Tests

- Create disabled automation
- Verify config
- Activate
- Comment during activation boundary
- Delayed DM then disable
- Delayed public reply then disable
- Human handoff during pending delayed action
- System/organization kill switch
- Provider timeout during enable
- Provider timeout during disable
- Read-back after state update
- Determine whether pending delayed responses survive disabling

حتى يتم إثبات behavior، delayed native automation تظل SPIKE_PENDING.

---

# 27. Analytics Provider Tests

- Capture initial cursor
- Import baseline
- Changes during import
- Consume delta
- Pagination
- Invalid cursor
- Expired cursor
- Best Time
- Performance Decay
- Frequency analysis
- `analytics.synced`

---

# 28. Webhook Provider Tests

Phase 1 تختبر:
- signature format
- stable event ID
- duplicate deliveries
- retry behavior
- event payloads
- timeout expectations
- event categories

ولا تتطلب بناء Outbox production system.

---

# 29. Media Provider Tests

- presign
- returned upload expiry
- upload
- public media URL
- temporary retention
- expired PUT URL
- temporary asset expiration
- re-upload approved original

---

# 30. Ads Provider Tests

- Ad account discovery
- Analytics
- Preview
- Ad comments
- Boost
- Paused creation
- Activation
- Budget update
- Pause
- Emergency pause
- Provider timeout
- Reconciliation behavior

---

# 31. Usage Attribution Test

Verify usage can be mapped by Profile back to the correct Brand/Organization.

---

# 32. Phase 1 Acceptance Criteria

Phase 1 مكتملة عندما:

1. كل Zernio Capability مطلوبة للـCommercial V1 تم اختبار behavior الخاص بها بما يكفي.
2. Native Automation race behavior معروف.
3. Delayed Automation disable behavior معروف.
4. Scoped key behavior معروف.
5. Webhook delivery contract مثبت.
6. Analytics bootstrap/cursor behavior مثبت.
7. Team rate-limit behavior مفهوم.
8. Media expiry behavior مثبت.
9. Ads V1 APIs مثبتة أو لها fallback approved.
10. Usage attribution مثبتة أو لها fallback.
11. كل النتائج موثقة.
12. لا يوجد Provider assumption جوهري غير محسوم.

---

# 33. No Feature Expansion Rule

أي Capability جديدة تظهر أثناء Spike:
→ Post-V1 Backlog

إلا لو كانت ضرورية لتنفيذ Feature موجودة أصلًا في Commercial V1.

---

# 34. Next Task

First task when Phase 1 starts:

```text
P1-T01 — Build Minimal Provider Spike Harness
```

بعد نجاحها:
- P1-T02 Create Zernio Profile A + Profile B
- P1-T03 Verify Scoped API Key Isolation
- ثم بقية Provider Behavior tests حسب الأولوية

---

# 35. Final Zernio Design Principle

Zernio هو:

```text
Connection Infrastructure
+
Social Execution Infrastructure
+
Ads Execution Infrastructure
+
Inbox Infrastructure
+
Provider Data Infrastructure
```

لكنه ليس:

```text
Tenant Authority
Policy Authority
Marketing Brain
Durable Product State
```


---

# 36. P1-T08 — Bounded Provider Probing and Documented-Contract Fallback Plan

## Purpose

The objective of P1-T08 is to determine, with reasonable direct evidence, whether Zernio `analytics.synced` behavior is suitable for the Commercial V1 analytics integration.

P1-T08 must **not** become an open-ended provider investigation.

The project will perform a bounded number of controlled attempts. If those attempts do not produce conclusive Provider Behavior evidence, the project will stop further probing and proceed using the documented Zernio contract with defensive reconciliation behavior.

This section records an **operating plan**, not a proven Provider Behavior result.

## Current-State Authority

Current Phase / Current Task / blockers / authorization-consumption state remain declared only in `PROGRESS.md`. This section does not redefine or self-clear current execution state.

## Bounded Investigation Plan

The investigation is intentionally limited to the following stages.

### Stage 1 — Establish Safe Receiver Infrastructure

Complete and verify a deterministic least-privilege mechanism for:

- stopping the static receiver;
- restoring the static receiver;
- verifying the accepted receiver source;
- verifying F11 evidence state/count.

The mechanism must not provide broad root, shell, arbitrary `systemctl`, or arbitrary filesystem access.

No Provider request is required for this stage.

### Stage 2 — Infrastructure Rehearsal Without Zernio

Before consuming the F11 live authorization, perform one controlled rehearsal of the receiver handoff:

```text
static receiver
→ stop
→ reverse tunnel
→ local F10/F11 Node receiver
→ readiness verification
→ close tunnel
→ restore static receiver
```

The rehearsal must verify that:

- the static receiver can be stopped safely;
- `127.0.0.1:8765` becomes available;
- the reverse tunnel can bind correctly;
- the local Node receiver is reachable through the accepted public route;
- readiness succeeds;
- the tunnel can be removed;
- the accepted static receiver can be restored;
- the final VPS state matches the accepted baseline.

No Zernio/Provider request is made during this rehearsal.

If the rehearsal fails, stop and repair the infrastructure path before F11.

### Stage 3 — One Authorized F11 Data-Bearing Live Experiment

After infrastructure readiness is proven, execute the already-authorized single F11 experiment under its separately authorized task boundary.

The experiment must preserve the existing one-run authorization constraints.

Expected evidence chain:

1. capture pre-experiment Analytics state/cursor;
2. establish the exact F11 webhook receiver;
3. publish the single authorized F11 post;
4. observe for `analytics.synced`;
5. capture webhook evidence if received;
6. read follow-up Analytics / Delta state;
7. correlate the Provider event, analytics change, target identity, and experiment timing;
8. restore infrastructure;
9. classify the result.

No automatic second data-bearing post is authorized.

## Evidence Cross-Check

F11 must not classify the Provider solely from whether the local receiver observed a webhook.

Where available, evaluate together:

- local receiver evidence;
- Zernio webhook/delivery evidence;
- Analytics state;
- Delta/cursor state;
- exact profile/account/target identity;
- event ID;
- timestamps;
- publish result/readback.

This is required to distinguish Provider Behavior from local delivery/infrastructure failure.

## Result Interpretation

### Case 1 — Webhook and Analytics Confirmed

If the expected analytics change is observed and the expected `analytics.synced` event is observed and correctly correlated, record the corresponding Provider Behavior as verified.

### Case 2 — Analytics Changed and Provider Delivery Exists, but Local Receiver Missed It

Treat this primarily as an integration/delivery-path issue.

Do not classify Zernio webhook capability as absent solely because the local receiver failed to capture a Provider-side delivery.

Repair the system integration path separately if required.

### Case 3 — Analytics Changed but No Event Is Observed

If analytics changes are confirmed but no correlated `analytics.synced` event can be established, perform only the bounded Provider-side diagnostic stage below.

Do not automatically publish another F11 post.

### Case 4 — Fixture Did Not Reach Analytics

If the F11 post exists but the relevant analytics state never reflects the fixture within the accepted observation window, classify the result as fixture/analytics inconclusive rather than falsely concluding that the webhook does not exist.

Do not create repeated engagement or repeated data-bearing posts merely to force analytics activity.

## Stage 4 — One Final Provider-Side Diagnostic Round

If F11 remains inconclusive, allow one final diagnostic round using existing evidence only.

The diagnostic may include, where available:

- webhook delivery logs;
- event IDs;
- request IDs;
- timestamps;
- profile/account/post IDs;
- Analytics/Delta evidence;
- provider documentation;
- targeted Provider clarification/support.

This stage must not automatically create a second live data-bearing experiment.

After this diagnostic round:

**STOP further P1-T08 Provider probing unless the Team Leader explicitly authorizes a new scope based on genuinely new evidence.**

## Provider-Probing Cutoff

The planned sequence is:

1. safe infrastructure path;
2. one infrastructure rehearsal without Provider;
3. one authorized F11 live experiment;
4. one evidence cross-check / Provider diagnostic round if necessary;
5. STOP.

Repeated materially equivalent live experiments are not part of the plan.

The project must avoid spending unbounded Phase-1 time attempting to force a perfectly observable Provider event.

## Documented-Contract Fallback

If the bounded investigation does not produce conclusive Provider Behavior evidence, the project may proceed using the documented Zernio analytics contract as an **integration assumption**, clearly distinguished from proven spike behavior.

The fallback must be designed defensively.

The production system must not require `analytics.synced` delivery to be perfectly reliable for correctness.

### Defensive Analytics Model

Preferred fallback model:

```text
analytics.synced = wake-up / change signal
```

not:

```text
analytics.synced = durable source of truth
```

When the signal is received, the system should obtain authoritative analytics changes from the supported Analytics/Delta interface and persist durable state internally.

Conceptual flow:

```text
Webhook
→ authenticate/validate
→ tenant/brand/target ownership validation
→ deduplicate event
→ enqueue reconciliation
→ read Analytics/Delta from last durable cursor
→ validate returned scope
→ persist analytics state and next cursor
→ audit outcome
```

### Reconciliation Safety Net

Production design should include bounded reconciliation independent of webhook delivery.

If the webhook is delayed, duplicated, retried, or temporarily missed, durable analytics state can still converge from the Provider Analytics/Delta interface.

Webhook delivery improves freshness/latency but must not become the sole mechanism required for analytics correctness.

Exact production reconciliation cadence, limits, failure behavior, and cost controls must be defined in the appropriate later production task.

### Duplicate / Retry Handling

The system must assume webhook delivery may occur more than once unless proven otherwise.

Webhook handling must therefore be idempotent and support deduplication using Provider event identity and internal durable processing state.

A duplicate webhook must not duplicate analytics state, jobs, reports, or downstream business actions.

### Authority Boundary

Provider webhook payloads are signals from an external integration.

They do not become tenant authority, organization authority, brand authority, permission authority, or durable product state by themselves.

Tenant/brand/resource ownership must be resolved through trusted internal mappings before any downstream processing.

### Failure Philosophy

The system must distinguish:

```text
Provider signal observed
```

from:

```text
Provider business fact confirmed
```

Likewise:

```text
webhook received
```

does not mean:

```text
analytics successfully reconciled
```

Analytics reconciliation must explicitly record success, failure, retryable state, or Unknown where applicable.

## Decision After the Bounded Plan

At the end of the bounded investigation, P1-T08 must reach one of these directions:

### Direction A — Direct Provider Behavior Verified

Record proven behavior in `docs/PROVIDER_SPIKE_RESULTS.md` and design the production integration around the verified behavior plus normal defensive controls.

### Direction B — Documented Contract Used With Defensive Fallback

Record clearly that direct behavior remained inconclusive after the bounded spike.

Do not mislabel documentation as observed Provider Behavior.

Proceed with:

- documented contract;
- webhook-as-signal semantics;
- durable Delta/Analytics reconciliation;
- deduplication;
- periodic safety reconciliation;
- monitoring/audit;
- defensive failure handling.

### Direction C — Explicit Provider Limitation Discovered

If evidence contradicts required capability, record the limitation and adapt the system design before building dependent production subsystems.

## Scope Discipline

This plan does not authorize:

- additional F11 posts;
- repeated Provider experiments;
- new social/analytics capabilities;
- production Analytics implementation;
- Provider SDK use outside adapters;
- broad privilege/bootstrap changes;
- bypassing tenant/brand authority;
- treating Provider documentation as observed Provider Behavior.

Any implementation remains subject to its own Task Contract and Team Leader review.

## Working Principle

The purpose of P1-T08 is not to prove that an external Provider is perfect.

The purpose is to learn enough, early enough, to build a Commercial V1 integration that remains correct when the Provider is delayed, duplicated, retried, temporarily unavailable, or incompletely observable.

The spike is bounded.

The production system must be defensive.


# 37. P1-T08 Final Analytics Webhook Capability Conclusion

Analytics Webhook capability status = **`PARTIALLY VERIFIED / DEFENSIVE INTEGRATION REQUIRED`**.

### Observed

- Zernio accepted configuration of an `analytics.synced` webhook scoped to the exact test Profile.
- A valid signed `analytics.synced` event was delivered.
- HMAC, header/body event identity, exact Profile/account/platform validation, non-duplicate handling, and receiver HTTP `204` all passed for the observed event.
- Analytics `overview.lastSync` advanced to exactly the event's `sync.syncedAt`.
- Provider publishing logs separately confirmed a successful `post.published` lifecycle record associated with the exact F11 fixture.

### Limitation

- Direct data-bearing fixture correlation was not established: the Phase-1 evidence does not prove that the F11 post caused or was incorporated into the observed Analytics sync.
- The final bounded Provider webhook-log cross-check could not be completed because the approved `GET /v1/logs` webhook query returned HTTP `400`.
- This limitation does not prove that `analytics.synced` is broken, absent, unreliable, or unrelated to the F11 post.

### Commercial V1 integration rule

Use `analytics.synced` as an authenticated/deduplicated **change/wake-up signal** that schedules trusted-scope Analytics/Delta reconciliation.

Do **not** use webhook delivery as the sole durable analytics source of truth or sole correctness mechanism.

Durable analytics state/cursor remains internal. Production must include bounded reconciliation independent of webhook arrival and preserve D-016 bootstrap order: `capture cursor → import baseline → consume Delta from captured cursor`.

No further P1-T08 Provider probing is planned or authorized. Any future Provider test requires genuinely new evidence plus a separate explicit scope/authorization decision.
