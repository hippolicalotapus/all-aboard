# All Aboard development method — adopted at V35

## Source of truth
- `source/all-aboard-personal.html` is the current verified prototype, not a production credential vault.
- Keep `source/previous-v33.html` as rollback. Never silently change the localStorage key or backup format.
- One project and one current source; no parallel divergent numbered prototypes.

## Work loop (each development session)
1. Inspect current source, tests, and prior checkpoint; identify highest-risk blocker.
2. Make a cohesive batch of changes in a working copy, not in the only saved original.
3. Run `python3 tests/run_all.py`. Fix failures before advancing.
4. Document test evidence, unverified areas, and next blocker in README.
5. Package all sources/tests/docs with SHA256 checksums and validate archive contents.
6. Make a durable checkpoint available for resumption. Do not imply chat runtime files persist forever.

## Git and release strategy
- Preserve user's rule: no remote GitHub commit/push/PR without approval; only final approved production commit.
- Intermediate local file snapshots and portable ZIP checkpoints are allowed, not GitHub commits.
- When repository is confirmed, compare its code against this checkpoint before any merge or push.
- Release gates: passing automated checks, browser integration in permitted environment, real Samsung verification, secure native credential storage, native OCR and APK build, security/privacy review, recovery test, and user approval.
- Never claim test completion when tests are blocked; record as BLOCKED.

## Scope and costs
- Offline/free tests first. No deployment, Netlify, paid OCR, paid credits, or external service use without explicit approval.
- Use fictional certificate data until encrypted storage and privacy controls are validated.
- Minimize user requests; ask only for credentials, approvals, and actual device testing when necessary.