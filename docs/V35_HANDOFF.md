# All Aboard Personal — V35 development process checkpoint

The latest application source is unchanged from V34. V35 introduces the **adopted development method**, one-command offline regression runner, release gates, and a repeatable recovery process. This is a workflow milestone, not a new app feature.

## Quick start
`python3 tests/run_all.py`

## Files
- `source/all-aboard-personal.html` — current fictional-data prototype.
- `source/previous-v33.html` — previous rollback source.
- `tests/check_v33.py`, `tests/runtime_checks.js` — offline regression checks.
- `tests/browser_integration.py` — drafted browser E2E; previously BLOCKED by environment restrictions, **not** counted as passing.
- `tests/run_all.py` — offline test runner.
- `DEVELOPMENT_METHOD.md` — development protocol, release gates and GitHub policy.
- `SHA256SUMS.txt` — integrity manifest.

## Preservation constraints
Keep `onboardflow-fictional-wallet-v2` localStorage and `onboardflow-fictional-v2` backup format intact. No unapproved GitHub commits/pushes, deployment, or paid credits. GitHub repository identity still unconfirmed. Prototype uses fictional data only. Android native OCR, encryption, APK, and device/browser testing remain incomplete.