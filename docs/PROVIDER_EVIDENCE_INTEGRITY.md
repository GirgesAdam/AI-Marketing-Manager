# Provider Spike Evidence Integrity

This document is the tracked Phase-1 integrity ledger for safe metadata about live Provider spike evidence. Raw Provider evidence remains outside Git under the existing ignored `artifacts/provider-spike/` area.

## EVID-INC-001 — P1-T15-R06 durable-evidence loss

**Affected task:** `P1-T15-R06`

**Discovery task:** `P1-T15-R07`

**Repair task:** `P1-T15-R07-R01`

**Affected historical path:** `artifacts/provider-spike/p1-t15-r03-evidence.jsonl`

**Recorded pre-loss SHA-256:** `e34f2d3f653a3109ba0c9c885bfd0a020f06d4a5e16f5e0c2f4c677a64d7a33c`

**Availability:** `ORIGINAL FILE LOST / BYTE-FAITHFUL CONTENT NOT RECOVERED`

**Root cause:** the existing R03 test suite used the same fixed filesystem path as live durable evidence and removed that path during test cleanup.

No byte-faithful backup was recovered. No replacement artifact was fabricated, reconstructed, inferred, or written back to the historical path.

### Surviving evidence sources

- accepted R06 closeout documentation;
- accepted Team Leader review record;
- the recorded original SHA-256 above;
- Git history for tracked R06 closeout documentation;
- filesystem/USN incident evidence retained in the authorized workstation/tool history where safely available.

### Historical fact status

`HISTORICALLY ACCEPTED PROVIDER BEHAVIOR — RAW DURABLE ARTIFACT NO LONGER AVAILABLE`

Previously accepted R06 Provider Behavior findings remain historical facts: exactly one live R03 invocation; result `FAIL`; classification `NATIVE_AUTOMATION_SAFETY_FAILURE`; error `SAFETY_DISABLED_READBACK_CONFIG_MISMATCH`; `profileId` missing; `dmDelaySeconds` missing; `audience` present as object; Provider requests `7`; PATCH/comments/DMs/retries `0`; cleanup `DELETE 200 → GET 404`; residual resource `ABSENT`.

Loss of the raw JSONL reduces raw auditability. It does not automatically reverse those previously accepted Provider Behavior findings. No raw field values or additional semantic claims are added here.

### Corrective actions and prevention controls

- R03 offline tests use dedicated test evidence path `artifacts/provider-spike/p1-t15-r03-test-evidence.jsonl`.
- Test filesystem wrappers remap the historical R03 path before delegating `open`, `readFile`, or `rm` to the real filesystem layer.
- Regression coverage records requested and effective paths and proves the real filesystem delegate never receives the historical production/live path.
- Offline test cleanup is permitted only on the test-only path.
- The lost historical path remains absent; tests must not create a sentinel or replacement there.
- D-044 makes live/test evidence isolation and integrity recording mandatory for Phase-1 Provider spikes.

**Current live authorization:** `NOT GRANTED`.

**R06 live authorization:** `CONSUMED / NO RERUN AUTHORIZED`.

## Phase-1 live evidence integrity ledger

| Task / run | Evidence path identifier | SHA-256 | Byte length | Checkpoint count | Capture timestamp | Classification | Availability |
| --- | --- | --- | ---: | ---: | --- | --- | --- |
| `P1-T15-R06` / accepted single R03 invocation | `artifacts/provider-spike/p1-t15-r03-evidence.jsonl` | `e34f2d3f653a3109ba0c9c885bfd0a020f06d4a5e16f5e0c2f4c677a64d7a33c` | unavailable after loss | unavailable after loss | unavailable from surviving safe metadata | `NATIVE_AUTOMATION_SAFETY_FAILURE` | `LOST — HISTORICAL FACTS RETAINED` |

## Bounded future-live integrity workflow

For a future **authorized** Phase-1 live spike, after the durable evidence file is closed and before any offline test cleanup can run, record only safe metadata in this tracked ledger: task/run identifier, evidence path identifier, SHA-256, byte length, safe checkpoint count, capture timestamp, classification, and availability status.

The raw evidence file stays gitignored and must never be copied into this document or Git. Secrets, expected user identity, PII, raw Provider bodies, signed URLs, tokens, or credentials must never enter the integrity ledger.

The integrity record is a post-capture metadata step only; it does not authorize Provider traffic and does not change the spike runner's Provider behavior. If a raw artifact is later unavailable, mark that state explicitly. Never reconstruct bytes and label them as original evidence.

This is intentionally limited to Phase-1 Provider spike evidence governance; it is not a general-purpose evidence storage framework.

## EVID-INC-001 — Final Team Leader disposition

**Acceptance disposition:** `P1-T15-R07-R01 = DONE / ACCEPTED`; `P1-T15-R07 = DONE / ACCEPTED WITH NON-BLOCKING NOTES` on reviewed final HEAD `c0d43381d1c6a8a244eb37dd48bb4276c5b983b3`.

The original accepted R06 raw durable artifact remains `LOST / BYTE-FAITHFUL CONTENT NOT RECOVERED`. It was not restored, recreated, inferred, or replaced. Historical R06 Provider Behavior findings remain accepted under this evidence-governance disposition and D-044, while raw-artifact availability remains explicitly unavailable.

Team Leader independently verified that the historical path stayed absent before and after the acceptance test run, the test-only evidence path was absent after tests, and no historical-path sentinel or reconstructed replacement was created.

## P1-T15-R08 — Reserved Evidence Identity / Future Integrity Handoff

**Current state:** `OFFLINE PREPARATION ONLY — NO R08 LIVE ARTIFACT CREATED`.

- Reserved R08 live evidence path: `artifacts/provider-spike/p1-t15-r08-evidence.jsonl`.
- Dedicated R08 test evidence path: `artifacts/provider-spike/p1-t15-r08-test-evidence.jsonl`.
- Historical R06/R03 path `artifacts/provider-spike/p1-t15-r03-evidence.jsonl` remains unavailable under `EVID-INC-001` and is forbidden to R08.
- Current R08 live-artifact availability: `NOT CREATED — LIVE INVOCATION NOT AUTHORIZED`.

D-044 isolation applies: offline tests may physically operate only on the R08 test path. They must not create a sentinel at the R08 live path or touch the historical R06/R03 path.

For a future **separately Team Leader-authorized single R08 live invocation**, immediately after the live evidence file is closed and **before any offline test is run**, the operator must add a tracked safe integrity-ledger row containing: task/run ID, exact evidence path identifier, SHA-256, byte length, safe checkpoint count, capture timestamp, classification, and availability state. The raw JSONL remains gitignored/outside Git and must never be copied into the ledger.

The future integrity capture is mandatory post-run metadata bookkeeping only. It does not itself authorize Provider traffic and does not create a generalized evidence-management subsystem. Secrets, expected identity, PII, raw Provider bodies, raw audience objects, signed URLs, tokens, or credentials must not enter the tracked integrity ledger.