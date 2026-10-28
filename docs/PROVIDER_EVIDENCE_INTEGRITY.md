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

**Current state:** `OFFLINE LANE DONE / ACCEPTED - NO R08 LIVE ARTIFACT CREATED`.

- Reserved R08 live evidence path: `artifacts/provider-spike/p1-t15-r08-evidence.jsonl`.
- Dedicated R08 test evidence path: `artifacts/provider-spike/p1-t15-r08-test-evidence.jsonl`.
- Historical R06/R03 path `artifacts/provider-spike/p1-t15-r03-evidence.jsonl` remains unavailable under `EVID-INC-001` and is forbidden to R08.
- Current R08 live-artifact availability: `NOT CREATED — LIVE INVOCATION NOT AUTHORIZED`.

D-044 isolation applies: offline tests may physically operate only on the R08 test path. They must not create a sentinel at the R08 live path or touch the historical R06/R03 path.

For a future **separately Team Leader-authorized single R08 live invocation**, immediately after the live evidence file is closed and **before any offline test is run**, the operator must add a tracked safe integrity-ledger row containing: task/run ID, exact evidence path identifier, SHA-256, byte length, safe checkpoint count, capture timestamp, classification, and availability state. The raw JSONL remains gitignored/outside Git and must never be copied into the ledger.

The future integrity capture is mandatory post-run metadata bookkeeping only. It does not itself authorize Provider traffic and does not create a generalized evidence-management subsystem. Secrets, expected identity, PII, raw Provider bodies, raw audience objects, signed URLs, tokens, or credentials must not enter the tracked integrity ledger.

### P1-T15-R08 Offline Lane Acceptance Integrity Note

Team Leader accepted the offline R08 lane at reviewed HEAD `cfce8ca6c7d8cbea14df3b686c9499530e0197bd`. During independent review, the historical R06 evidence path was absent before and after review, the R08 live evidence path was absent before and after review, and the R08 test evidence path was absent after cleanup. R03 and R08 live authorization variables were absent.

No new live artifact exists and no integrity ledger row for a live R08 run is created by this acceptance. Historical R06 remains `LOST / BYTE-FAITHFUL CONTENT NOT RECOVERED` under `EVID-INC-001`. Acceptance does not authorize Provider traffic or the future R08 live invocation; the existing separately-authorized post-live integrity procedure remains unchanged.


## P1-T15-R09 — Authorized Live Attempt Integrity Record

**Integrity state: `R08 LIVE EVIDENCE FILE MISSING AFTER AUTHORIZED INVOCATION`.**

- Task: `P1-T15-R09`.
- Run identity: `P1-T15-R09-20261028T1417Z`.
- Live-execution HEAD: `096ff634aba0e13e6fdc6e8fa65a90a6ee108845`.
- Evidence path: `artifacts/provider-spike/p1-t15-r08-evidence.jsonl`.
- Command launch-attempt count: `1`.
- Authorized command: `npm run p1-t15-r08 -- --live`.
- Process exit code: `1`.
- Availability: `MISSING AFTER AUTHORIZED INVOCATION`.
- SHA-256: `NOT AVAILABLE — FILE MISSING`.
- Byte length: `NOT AVAILABLE — FILE MISSING`.
- Safe checkpoint count: `NOT AVAILABLE — FILE MISSING`.
- Integrity capture timestamp: `2026-10-28T14:17:13.3050590Z`.
- Result: `UNKNOWN / NOT CAPTURED`.
- Classification: `EVIDENCE_INTEGRITY_BLOCKER` (`SYSTEM_INTERPRETATION`, not Provider behavior).
- Provider traffic: `UNVERIFIED`; the missing R08 artifact means no Provider request sequence may be asserted as `LIVE_PROVIDER_OBSERVED` from this run.
- Create occurrence: `UNKNOWN`.
- Cleanup status: `UNKNOWN`.
- Automation ID: `NOT AVAILABLE`.
- Safe console evidence: the bounded launcher reported one launch attempt and exit code `1`; no npm/R08 runner result payload was emitted before control returned.
- Post-attempt process state: no P1-T15 R08/R03 runner process remained active.
- `P1_T15_R08_LIVE_AUTHORIZED`: absent from the parent process after the attempt; authorization is treated as `CONSUMED / NO RERUN AUTHORIZED`.
- `P1_T15_R03_LIVE_AUTHORIZED`: absent.
- Historical R06 evidence path remains absent under `EVID-INC-001`.
- R08 test evidence path remains absent.
- Raw R08 JSONL was not created and therefore was not modified, normalized, reconstructed, copied, or committed.

### Evidence disposition

`LIVE_PROVIDER_OBSERVED`: **none can be established from this invocation because the required durable R08 evidence artifact is missing.**

`SYSTEM_INTERPRETATION`: the authorized single launch attempt is an evidence-integrity blocker. The authorization is consumed. No second live invocation, retry, or rerun is authorized. Team Leader review is required before any further Provider execution or repair task.

## P1-T15-R09-R01 — Offline Forensic / Evidence-Path Protection Record

R01 does not alter the historical R09 integrity disposition. R09 live evidence remains missing; R09 authorization remains consumed; no reconstruction or substitute evidence was created.

- Parent R09 status: `REJECTED — FIX REQUIRED`.
- R09 authorization: `CONSUMED / NO RERUN AUTHORIZED`.
- New `LIVE_PROVIDER_OBSERVED` facts from R01: none.
- Root-cause classification: `ROOT_CAUSE_NOT_FULLY_PROVEN — LAUNCHER/NPM BOUNDARY FAILURE CONFIRMED`.
- Historical R06 evidence path `artifacts/provider-spike/p1-t15-r03-evidence.jsonl`: absent under `EVID-INC-001` throughout R01.
- R08 live evidence path `artifacts/provider-spike/p1-t15-r08-evidence.jsonl`: absent throughout R01.
- R08 test evidence path `artifacts/provider-spike/p1-t15-r08-test-evidence.jsonl`: absent after R01 probes and verification.
- No sentinel was created at a live evidence path; no R06/R09 evidence was reconstructed.
- Provider credentials were not loaded during R01. R03/R08 live authorization variables were not set.
- Provider requests during R01: `0`; external mutations: `0`.
- The corrected offline launcher proof generates only ordinary npm cache/debug logs and captured safe console metadata; these are not Provider evidence and do not change the immutable R09 evidence-integrity blocker.

The deterministic future launcher procedure is now proven offline, but it confers no live authorization. Any future Provider attempt requires a new explicit Team Leader authorization after R01 acceptance.

### P1-T15-R09-R01 Final Acceptance Integrity Disposition

`P1-T15-R09-R01 = DONE / ACCEPTED` at reviewed HEAD `690635c518ff5441f3b5ef3443f9913f09a01288`.

This acceptance does not alter R09 history: `P1-T15-R09 = CLOSED — REJECTED / AUTHORIZATION CONSUMED / LIVE DIAGNOSTIC NOT ESTABLISHED`; historical verdict remains `REJECTED — FIX REQUIRED`; authorization remains `CONSUMED / NO RERUN AUTHORIZED`; no accepted `LIVE_PROVIDER_OBSERVED` evidence exists from R09.

The forensic classification remains `ROOT_CAUSE_NOT_FULLY_PROVEN — LAUNCHER/NPM BOUNDARY FAILURE CONFIRMED`; npm/R08 startup is not proven and the failure appears to have occurred at or before the launcher-to-npm boundary. The PowerShell 5.1 `ArgumentList` compatibility finding remains R01 tooling evidence only and is not assigned retroactively as the historical R09 cause.

Team Leader review confirmed Provider credentials absent, R03/R08 auth absent, R06 historical evidence absent under `EVID-INC-001`, R08 live evidence absent, and R08 test evidence absent. R01 acceptance creates no Provider evidence artifact and authorizes no future Provider attempt. Any future live diagnostic requires a new task with new explicit authorization.
