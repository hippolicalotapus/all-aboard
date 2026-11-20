# Workforce integration contract — proposal v0.1

Status: design contract only; no production connection, credentials, shared employee records, deployment or external data transfer.

## Ownership and separation

- **All Aboard** owns employer assignments, role requirements, training eligibility and certificate verification decisions.
- **AI Focus** owns optional camera-guided work, hazard observations and worker-controlled FLHA drafts. An observation is not an employer safety approval.
- **AI Exec** owns personal task execution, interruption recovery and worker-controlled progress.
- **MindPilot** owns optional personal cognitive support. Private cognitive profiles, disability information, attention metrics, prompts and inferences are never part of the employer integration contract.
- All four remain independently installable, independently versioned repositories. Do not copy source between repositories merely to connect them.

## Proposed message envelope (not implemented)

```json
{
  "schema": "workforce.integration.v1",
  "eventId": "fictional-event-001",
  "type": "assignment.offered",
  "origin": "all-aboard",
  "subject": "fictional-user-id",
  "assignmentId": "fictional-assignment-id",
  "occurredAt": "2026-11-12T00:00:00Z",
  "payload": {
    "title": "Review fictional site induction",
    "requiredTrainingIds": ["fictional-training-id"]
  }
}
```

This example contains fictional identifiers only. Do not use this envelope to send real data until authentication, tenant isolation, authorization, encryption, retention/deletion controls and an auditable consent mechanism exist.

## Allowed integration directions

| Direction | Proposed data | Gate |
| --- | --- | --- |
| All Aboard -> AI Focus | Worker-approved assignment, work instructions, qualification requirements | Authenticated user and authorization |
| AI Focus -> All Aboard | Worker-submitted task progress, safety observation or FLHA draft reference | Explicit review/submission; employer verification |
| All Aboard -> AI Exec | Worker-approved assigned task and public work instructions | Authenticated user and authorization |
| AI Exec -> All Aboard | Worker-submitted progress or completion claim | Explicit submission; never automatic employer approval |
| MindPilot <-> worker apps | Optional user-controlled task handoff | Opt-in, local-first, minimum data |
| MindPilot -> employer | **None by default** | No cognitive or disability data export |

## Compatibility rules

1. Preserve existing certificate-wallet and workflow storage keys and V39/V40 backup formats.
2. Do not treat an app-side checkbox, camera detection or AI result as a verified training record or employer authorization.
3. Event IDs must be idempotent, schema-versioned and scoped to one authenticated tenant.
4. Offline work must queue locally until explicitly authorized synchronization is available. Resolve conflicts without overwriting prior evidence.
5. No employer access to personal assistance settings or behavioral telemetry.
6. No network requests, secrets, analytics, deployment or paid infrastructure are authorized by this document.

## Implementation gates

1. Validate this contract against each repository's actual models and security boundaries.
2. Add a fictional-data-only shared contract fixture and schema tests in an isolated development branch.
3. Implement an opt-in adapter in All Aboard, then independently versioned adapters in AI Focus and AI Exec.
4. Evaluate MindPilot only as a user-controlled personal handoff; no employer-facing cognitive profile.
5. Add authorization, audit, secure storage and real-device E2E tests before any pilot with real people.

This file records the approved integration direction, not a claim that cross-app synchronization already works.
