# V39 — task deadlines and attention view

Checklist steps now support a saved calendar deadline. Views distinguish overdue, due today, upcoming, acknowledged and undated tasks. Users can filter the current checklist, review overdue/due-today steps across all saved plans, and open the relevant plan from that queue. Each attention entry shows the task's owner role and work setting. Owners remain template labels, not authenticated assignments.

Deadlines use local calendar days, without converting entered dates to UTC instants. Refresh deadline status or reopen the company workspace to recompute the current day. Completing a step removes it from the attention queue; reopening it retains its date and restores its deadline status. Undated tasks are explicitly excluded from the attention queue. No email, push or background reminder is sent.

## Preservation and validation

Existing checklist backup format/storage identifiers are retained. Old V1 backups without deadlines still load and preserve their acknowledgements. New optional `dueDates` maps accept only known task IDs and real calendar dates between 1900 and 2200. Invalid deadline imports are rejected before replacing data. Date edits preserve completion state; checkbox edits preserve dates. The certificate wallet is unchanged.

New backups with deadlines should be restored using V39 or later: older app versions ignore the new optional deadline field and would discard it when saving or exporting. Keep a V39 backup before reverting to an earlier app.

## Verification

All offline checks passed: 10 legacy regression assertions, 9 wallet runtime scenarios, 10 workflow model scenarios, 14 persistence scenarios, 15 full-page-script DOM integration scenarios and 11 deadline scenarios. The DOM suite executes actual event handlers and checks deadline save/reload, reopening, filters, attention navigation and invalid import preservation. Embedded model/store equality and inline JavaScript syntax passed. The self-contained test build passed section/ID/external-script checks.

These are 69 offline checks/scenarios, not 69 real-browser tests. Browser E2E remains blocked as documented at V37/V38; real Samsung testing and visual QA remain unverified. No production deployment, customer records or paid services were used. Final branding remains pending.

## Run and next milestone

Run `python3 tests/run_all.py`, `python3 tests/check_inline_js.py source/all-aboard-personal.html`, and `python3 tools/build_test_release.py`.

Output: `dist/Employee_Onboarding_Test_v39.html`. Use fictional records and download separate certificate/checklist backups. The next development step is structured task review/status and evidence links; real employer workspaces still need authenticated users, permissions and secure shared storage.
