# Readable checklist review draft — 2026-11-14

Baseline: development 6a892afc1fe64134f5aeb683d88a9a621079306a.

The shipped company checklist now presents a readable review draft instead of raw JSON. It shows workflow scope, task labels and owners, review state, notes and evidence links. Tasks without a requested review remain visible. The draft explicitly distinguishes review from acknowledgement and employer approval. Generating it is read-only and never changes the stored V39 or review backup formats.

Changing checklist scope or saving a review clears the old draft, preventing a report for another workflow or an older note from appearing current. All user notes are displayed through textContent, not interpreted as HTML.

Verification: three new model tests failed before implementation, then passed. The complete shipped-script DOM suite includes a new generation, save-invalidation and scope-change journey (16 scenarios total). python3 tests/run_all.py passed all 77 offline modules and built the self-contained artifact, SHA256 773c52d2708183c744c08a7216a798c75ac02476860215daa4e50e8c03d31a57.

This remains a fictional-data prototype. Browser release verification is recorded separately from offline tests. User authorization now permits spending and deployment; no paid API calls were needed for this change.
