# Reopen reason implementation plan

> Execute inline in this isolated copy. Source: development `1cdb546fa3605998f20e490310c6a4fc877eb414`, verified against all 110 Git blobs.

**Goal:** Collect a visible, user-entered reason before reopening an approved daily report.

**Architecture:** Keep the current standalone HTML and domain lifecycle. Add a labeled reason input and status message only for an approved foreman view. Pass the input unchanged to `DailyReportLifecycle.action`; its existing minimum of five trimmed characters stays authoritative. No canned reason or domain changes.

**Tech stack:** Existing JavaScript, DOM, Node VM interaction checks.

**Spec:** Parent task decision: visible nonempty user reason, reject whitespace, retain exact supplied reason and current validation/authorization. No remote changes, Actions, deployment or spending.

## Approach and constraints

A visible field next to the existing reopen button fits the current page and supports correction after validation errors. A prompt would hide context and make error recovery worse. Reuse the existing lifecycle validator instead of duplicating its rule in UI. Preserve company/project identity, revision checks, role restrictions, audit events, workflows and wallet build.

## Review focus

Empty, whitespace and shorter-than-five reasons must retain approved state and event count. A valid reason including leading/trailing whitespace must be recorded exactly. Draft/read-only views must not expose reopen input. Repeated approve/reopen must require a fresh reason. Existing correction controls must remain usable.

### Task 1: Reopen reason input and regression

Files: `pilot/daily-operations.html`, `tests/daily_operations_pilot_checks.js`, `tests/browser_cdp_smoke.js`.

- [x] Extend shipped-script VM interaction checks: empty/whitespace/short reasons reject without audit events; exact valid reason is preserved; draft and read-only states have no reopen UI; repeat cycles begin empty.
- [x] Run `node tests/daily_operations_pilot_checks.js` and record expected failure against canned-reason behavior.
- [x] Add labeled visible field and status; pass entered reason to existing lifecycle validator; retain input and focus it on validation error.
- [x] Update optional browser smoke interaction to enter a valid reason before clicking reopen.
- [x] Run the targeted check, full `python3 tests/run_all.py`, explicit inline JS check and build. Save logs, diff and report outside source. Do not run a browser again; existing environment blocker is known.
- [x] Review full diff and confirm only planned paths changed. Leave local changes available for review; do not push.
