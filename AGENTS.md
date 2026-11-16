# AI Marketing Manager — Team Working Instructions

## Canonical workspace (mandatory)
- The canonical local project workspace is `F:\AI-Marketing-Manager`.
- The only canonical Git repository/working tree is `F:\AI-Marketing-Manager\repository`.
- Before starting any task, verify the F: drive is available and read this file plus the repository's current `PROGRESS.md` and `DECISIONS.md`.
- All project work, generated files, reports, evidence, backups, and deliverables must use the canonical F: workspace and the established folder map below. Do not create project files or generated outputs on C:, Desktop, Downloads, the repository root, or arbitrary temporary locations.
- The former checkout `C:\Users\USER\Desktop\AI-Marketing-Manager-R04-Clean` is retired and was verified absent on 2026-11-16. Never recreate or use this retired C: checkout.
- Its archived historical copy is `F:\AI-Marketing-Manager\08_Archive\Legacy-C-Project-Workspaces\2026-11-16\AI-Marketing-Manager-R04-Clean`. This is read-only historical reference material, not an active working tree. Do not modify, delete, move, or clean it without separate explicit Team Leader approval.
- Use the established folder map below. Create a task-specific subfolder when needed; do not scatter files in the workspace root.

## Folder map
- `00_Inbox` — incoming files awaiting classification.
- `01_Working` — working copies and task-local materials that are not source-controlled.
- `02_Generated` — build outputs, test output, generated intermediates, and temporary generated artifacts.
- `03_Deliverables` — final handoffs, release packages, and user-requested deliverables.
- `04_Reports` — task reports, verification reports, and review summaries.
- `05_Evidence` — durable task evidence, provider-spike evidence, test evidence, and integrity ledgers.
- `06_Backups` — dated repository snapshots and documentation backups. Backups do not replace source-of-truth files.
- `07_Temporary` — disposable scratch data only; clean up only when the owning task permits it.
- `08_Archive` — superseded deliverables and closed-task material retained for traceability.
- `repository` — the only canonical local Git working tree; source code, tests, migrations, and versioned documentation live here.

## Git and source-of-truth rules
- GitHub and the current accepted Git branch/commit remain the version-control source of truth for code and versioned documentation. The F: workspace is the canonical local storage location, not a replacement for Git.
- Do not create a second Git working tree or silently switch to another clone. All task commands must run from `F:\AI-Marketing-Manager\repository` unless a Team Leader-approved recovery task explicitly says otherwise.
- The former checkout `C:\Users\USER\Desktop\AI-Marketing-Manager-R04-Clean` is retired and was verified absent on 2026-11-16. Never recreate or use it. Its archived copy at `F:\AI-Marketing-Manager\08_Archive\Legacy-C-Project-Workspaces\2026-11-16\AI-Marketing-Manager-R04-Clean` is read-only historical reference material, not an active working tree; do not modify, delete, move, or clean it without separate explicit Team Leader approval.
- Do not create project files, generated outputs, or a second checkout on C:; the F: repository is the only canonical local working tree.
- Do not store credentials, API keys, tokens, passwords, private keys, or secret-bearing `.env` files in generated folders, reports, deliverables, or Git. Use approved local secret storage and never print secret values.
- Provider evidence must follow the task's exact path, immutability, hashing, and integrity-ledger contract. Do not relocate, reconstruct, overwrite, or clean evidence merely to fit this folder map. If a task specifies a fixed path under `repository\artifacts`, that exact path takes precedence and remains unchanged.
- Generated outputs should be written outside the Git repository by default. Only task-required, reviewed source/tests/docs/evidence metadata belong in Git. Never add raw live evidence or secrets to Git unless an explicit accepted policy requires it.
- Use task-specific names, e.g. `P1-T14-R01`, and include a date in backup/report filenames where useful. Preserve original files; do not overwrite an existing deliverable without an explicit instruction.

## Mandatory task-start checklist
1. Confirm `F:\AI-Marketing-Manager` exists and is accessible; if not, STOP and notify the Team Leader. Do not silently fall back to C: or Desktop.
2. Confirm current directory is `F:\AI-Marketing-Manager\repository`.
3. Read this `AGENTS.md`, `PROGRESS.md`, and `DECISIONS.md`; use `PROGRESS.md` for Current Phase, Current Task, and Blockers.
4. Verify branch, HEAD, and `git status`; preserve dirty/untracked work. Never reset, clean, checkout over, or discard changes without explicit approval.
5. Read the active Task Contract and required source-of-truth documents before implementation.
6. Respect role boundaries, one-task-at-a-time, authorization gates, tenant/brand isolation, and all provider/evidence safety constraints.
7. Save new generated files to the correct F: workspace folder and report their exact paths in the handoff.

## Scope and safety
- Commercial V1 scope is locked. Do not add capabilities or redesign architecture without explicit approval.
- Team Leader plans/reviews/accepts and does not write production code. Senior Engineer implements only the active task and does not start a successor task before review.
- No live Provider call, external mutation, credential loading, deployment, or authorization use unless the active task contract and separate explicit authorization permit it.
- Missing evidence is a blocker. Never fabricate, reconstruct, infer, or relabel missing raw evidence as recovered.
- Task completion requires implementation, required tests, acceptance criteria, documentation, `PROGRESS.md` update, and Team Leader acceptance.

## Change control for this instruction file
- Treat this file as mandatory team operating guidance.
- Any change to the canonical workspace path or storage policy requires explicit Team Leader approval and an update here before the team uses the new location.
