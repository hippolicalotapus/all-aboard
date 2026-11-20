# Recovery assessment — 2026-11-11

## Verified artifacts
- `recovery/all-aboard-personal-phone-test-v27.html` is the recovered 48 KB single-file phone prototype, preserved in this development branch (commit `5b74b427ff70fa95148efbf5b35651184b7b65bf`).
- Earlier v8, v9, v10, and v11 HTML phone prototypes are discoverable in ChatGPT Library; v11 was inspected for comparison.
- The original V35 checkpoint archive and any claimed v38/v39 full application files have **not** been located or verified. Do not infer that v27 represents v35.
- The repository README still describes the V35 source import as outstanding.

## Source inspection: v11 versus v27
Both versions include a personal certificate wallet, file selection, browser-conditional `BarcodeDetector`/`TextDetector`, manual/pasted-text review, expiry data, backup/restore and Undo references. v27 also describes built-in safety and complete-journey simulations, backup duplicate checks and restore preview/confirmation. These are source-content observations, **not** successful browser/Android test results.

## Functional scope and gaps
- **Recoverable prototype:** offline, fictional-data personal certificate wallet and browser tests.
- **Not established by this prototype:** organization administration, employee onboarding workflows, employer dashboards, training assignments, live credential verification, FLHA workflows, fleet management, production authentication, secure storage, server/API integration, PDF OCR, or reliable Android camera OCR.
- **Data warning:** prototype backups are unencrypted JSON and local browser storage may be cleared; never use real employee or certificate data for testing.

## Recovery/development sequence
1. Preserve original v27 unmodified and keep recovery commits on development branch.
2. Extract a requirements/feature matrix from earlier development records; mark each item verified-in-code, unverified, or missing.
3. Introduce non-destructive automated tests and static validation around the recovered prototype; run them before reporting test success.
4. Build missing employer workflows in separate application code rather than silently representing the personal wallet prototype as the finished platform.
5. Continue searching for V35 and later archives; if recovered, compare/diff before merging and never overwrite newer work blindly.
6. No deployment, real employee data, or paid service without approval.

## Worlds Collide recovery
The Worlds Collide repository README explicitly says Milestone 021's Python rules and Unreal C++ source were local and not fully imported. Its stated 45 Python tests and 14 design checks are historical claims, **not rerun or independently verified here**. Keep searching for the original archive; preserve the existing UE scaffold and do not claim compilation or gameplay verification.
