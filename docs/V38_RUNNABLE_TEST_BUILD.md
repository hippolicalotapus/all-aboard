# V38 — runnable two-workspace test

The app now opens to a personal certificate wallet with buttons for Company checklist demo and Test tools. Changing views keeps saved data intact. The title is neutral while final brand clearance is pending; storage identifiers and existing backups remain compatible.

## Open the test build

Run `python3 tools/build_test_release.py`, then open `dist/Employee_Onboarding_Test_v38.html` in a JavaScript-enabled browser. The file includes its code and styles and needs no server or install. On Android, download it and open it in Chrome if a file preview does not execute JavaScript. File handling and local storage vary by browser; use fictional records and download backups for each workspace.

Personal wallet: review/save fictional certificate details, find records, inspect expiry and duplicates, and download/restore the existing wallet backup.

Company checklist demo: select a lifecycle, role and work setting, acknowledge steps, switch views or reload, and download/inspect/restore a separate checklist backup. Labels identify required task owners; they do not authenticate an approver. This workspace has no staff accounts, shared employer records, server sync or actual training verification.

## Validation

All prior offline suites passed: 10 regression assertions, 9 wallet runtime scenarios, 10 workflow scenarios and 14 persistence scenarios. Ten new integration scenarios execute the entire shipped inline script against a DOM double. They cover workspace navigation, initialization, save/restart, isolated plans, inspected restore and cancellation, failed saves, corruption recovery and certificate-storage preservation. Canonical model/store equality, inline syntax and self-contained build/section checks passed.

Real browser E2E remains blocked at Chromium startup by this environment's socket restrictions, as recorded in V37. The browser test has been updated for the workspace navigation but was not counted as executed. No real Samsung test or visual inspection is claimed. This is a runnable test deliverable, not a live website, APK or production launch.

## Next work

Finish real-browser and Samsung validation, then add deadlines/overdue views and secure employer accounts with task assignments. Authentication, permissions, secure storage and shared-record handling must be implemented and validated before real employee data is used. Existing name and feature-parity decisions remain in NAME_AND_FEATURE_REVIEW_2026-11-11.md. No domain, mailbox, deployment or paid service was created.
