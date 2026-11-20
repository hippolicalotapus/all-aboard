# All Aboard development method

## Source of truth
- The private GitHub `development` branch holds current application work; inspect the latest remote files before any change.
- The V35 ZIP is a historical rollback checkpoint, **not** necessarily the latest branch source.
- Never overwrite newer branch work with older checkpoints or silently change existing localStorage keys or backup formats.
- Keep `main` stable until reviewed release.

## Work loop
1. Inspect latest GitHub source and tests and compare against previous milestone.
2. Implement a cohesive, reversible change.
3. Run relevant tests locally where possible; distinguish actual results from unexecuted checks.
4. Commit tested changes on `development`; verify remote content and commit SHA.
5. Keep release notes and backups sufficient for resuming work without redoing it.
6. Check for concurrent updates before modifying an existing file.

## Git and release policy
- User has authorized routine GitHub commits and pushes at development milestones; no repeated approval is required.
- Do not deploy, incur paid service costs, or publish a release without explicit approval.
- No personal certificate records, credentials, passwords, secrets, or sensitive backups in Git.
- Release gates include browser integration, real Samsung verification, secure credential storage, native OCR/APK where applicable, security review, recovery testing, and user approval.
- The HTML prototype is not a secure production credential vault.

## Test integrity
- The GitHub workflow is manual-only until its actual test coverage and resource use are reviewed.
- A committed test file is not proof the test ran or passed.
- Never report historical V35 results as if they were current-branch test results.
