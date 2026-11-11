# V37 — saved checklists and recovery

## Changed behavior

Previously, checklist acknowledgements were lost on reload. All 24 lifecycle/role/site combinations can now save independent progress in browser storage. Switching a selector does not replace another plan.

Checklist progress uses `onboarding-fictional-workflows-v1`; existing certificate storage and backup formats are unchanged. The self-contained HTML embeds the canonical model/store sources; automated checks ensure those copies match the tested files.

The interface adds a separate JSON checklist download, a 64 KB import limit, validation, an inspected plan/step count, and explicit confirmation before replacement. Cancelling or rejecting an import preserves saved progress. A generation counter prevents a slow earlier import from replacing the latest preview. Unknown tasks, invalid combinations, duplicate plans and duplicate steps are rejected; unrelated imported fields are discarded.

Resetting the selected checklist retains other plans. Resetting all checklists requires a separate explicit confirmation and retains certificate records. These resets are destructive to checklist progress; the interface advises downloading a backup first.

Writes are accepted only after successful readback. Failed writes attempt to restore prior bytes. If recovery cannot be confirmed, editing and export are blocked instead of presenting untrusted state as saved. Corrupt stored data is retained on load failure until the user explicitly restores or resets it. Browser storage can still be cleared by Android; backup downloads remain necessary.

## Validation evidence

- Existing 10 regression assertions and JavaScript syntax passed.
- Existing 9 wallet runtime scenarios passed.
- Existing 10 workflow scenarios and embedded model consistency passed.
- New 14 persistence scenarios and embedded store consistency passed, including fresh-instance reload, failed/quota/dropped writes, corruption, schema rejection, isolated resets and all 24 plan combinations.
- Inline JavaScript and optional browser-test JavaScript syntax passed.
- Browser integration test was authored and attempted. Playwright's bundled executable was absent; system Chromium was found but could not start because socket creation was denied by this environment. No browser scenario ran. No browser pass or screenshot is claimed.
- Real Samsung testing has not run.

## How to verify

Run `python3 tests/run_all.py` and `python3 tests/check_inline_js.py source/all-aboard-personal.html`.

In an environment with Playwright and Chromium, run `node tests/browser_workflow_checks.js`. Optionally set `WORKFLOW_CHROMIUM_PATH`. That suite exercises reload, independent lifecycle progress, export, inspected restore, rejected imports and corruption recovery in a 390 px viewport. It is not included in the offline runner and is not counted as passed here.

## Limits and next milestone

All data must remain fictional. Checkmarks do not authenticate an approver or verify training. No employee directory, server sync, encryption, cross-device access, deadlines or authenticated employer approvals exist yet. The next milestone should add task deadlines and overdue/blocked views, followed by secure employer workspaces and real task assignments. Branding and name clearance remain pending; no deployment or paid service was used.
