# All Aboard / Onboard to Work — fictional-data business pilot gate

**Planning milestone, not a release.** Preserve V39 checklist storage, deadline behavior, certificate-wallet records and legacy backup compatibility. Work on `development`; `main` remains stable.

## Next implementation: V40 task review and evidence
- Add optional per-task review state: `not_requested`, `pending`, `approved`, `changes_requested`.
- Keep acknowledgements separate from approvals. No fake authenticated signatures.
- Attach only local, non-sensitive fictional evidence references (label, source type, optional nonsecret URL), not uploaded personal documents.
- Import old V39 backups without review fields; default to `not_requested`.
- Reject malformed V40 review data without changing saved checklists.
- Preserve existing deadlines and completion when editing reviews; preserve review state when editing deadlines.
- Ensure old backups still round-trip with their original semantics; warn when older versions would discard new optional data.

## Pilot readiness gates
1. Confirm business name availability; **Onboard to Work** is not legally cleared.
2. Test V39 regression suite before and after V40 changes.
3. Validate fictional onboarding/reboarding/transfer/offboarding scenarios and task owner labels.
4. Verify accessible mobile layout and real Android browser behavior; offline DOM tests alone are insufficient.
5. Do not use real employee records until authentication, permissions, audit history, encrypted shared storage and privacy controls are complete.
6. Offer only a supervised fictional-data demonstration until business terms, support and liability are reviewed.

**Status:** specification committed; V40 implementation and tests remain pending. No release or spending authorized.
