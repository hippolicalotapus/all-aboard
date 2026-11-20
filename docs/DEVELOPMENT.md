# All Aboard development policy

## Source of truth
- Private GitHub repository, `development` branch for tested milestones, `main` for reviewed releases.
- Baseline application: imported V35 checkpoint on `development`, extended by tested V36/V37 changes. This is still a fictional-data prototype.
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
- V35 source and tests are imported. V37 adds separate checklist persistence and backup/recovery.
- Current README and V37_CHECKLIST_RECOVERY.md describe the current checkpoint.
- Browser automation and Android verification remain incomplete.
