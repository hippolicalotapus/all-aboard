# All Aboard development policy

## Source of truth
- Private GitHub repository, `development` branch for tested milestones, `main` for reviewed releases.
- Baseline application: local V35 checkpoint ZIP, **not yet imported**. Never mistake this documentation-only branch for the working application.
- Do not overwrite or recreate the existing application from memory. Import the exact checkpoint source and tests, then verify checksums.
- Keep source, tests, handoff, and build instructions together in GitHub.

## Development cycle
1. Inspect the latest branch and existing code before editing.
2. Implement a cohesive batch of changes without unnecessary user interruptions.
3. Run automated tests; record what was actually executed and any blockers.
4. Review for secrets and personal certificate data before every push.
5. Commit the verified milestone on `development` and confirm the remote SHA.
6. Promote to `main` only after release testing.

## Guardrails
- No production deployment, paid service, or release without explicit approval.
- No real certificate records, credentials, secrets, or private backups in Git.
- Preserve legacy localStorage keys and backup format unless migration is tested.
- Do not claim an Android APK or native OCR exists until built and tested.
- GitHub source history does not back up users' on-device certificate data.

## Current status
- GitHub initialized; V35 application source and tests await import.
- V35 local checkpoint is the current verified handoff.
- Browser automation and Android verification remain incomplete.
