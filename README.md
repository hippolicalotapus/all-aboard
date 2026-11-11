# Employee onboarding and certificate management — replacement brand pending

Former working name: All Aboard. That name overlaps existing onboarding products and is being retired. **Onboard to Work** is the leading screened candidate, not a legally cleared or adopted brand.

## Current development milestone: V36

The fictional-data certificate-wallet prototype and tests are imported on `development`. V36 adds onboarding, reboarding, role-transfer and offboarding checklists tailored to role and work setting. Tasks show owners and remaining steps. Checklist acknowledgements are simulated and session-only, not authenticated approvals; they are excluded from wallet backups.

Open `source/all-aboard-personal.html` for the self-contained prototype. The legacy filename preserves development continuity. Do not enter real employee records or certificates.

## Validation

Run `python3 tests/run_all.py` and `python3 tests/check_inline_js.py source/all-aboard-personal.html`.

Current local result: 10 existing regression assertions, 9 wallet runtime checks and 10 workflow scenarios passed; embedded workflow source consistency and inline JavaScript syntax passed. Browser integration and Android device testing remain unverified.

## Product and name decisions

See [name screening and feature parity register](docs/NAME_AND_FEATURE_REVIEW_2026-11-11.md) for researched competitors, advertised capabilities, implementation status, remaining name checks and prioritized development milestones. No candidate domain or email account has been created.

## Working rules

- Commit tested milestones to `development`; keep `main` stable.
- No deployment, paid service or release without explicit approval.
- Never commit employee data, credentials, certificate records, secrets or private backups.
- Preserve existing storage keys, backup format and recovery behavior.
- Record blocked or unexecuted checks honestly.
- Existing historical V35 documents describe the earlier checkpoint; this README and the current review record reflect the latest status.
