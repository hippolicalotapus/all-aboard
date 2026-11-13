# All Aboard — Complete Product Specification
Date: 2026-11-13
Status: approved product direction; source of truth for future milestones.

## Mission
A complete, accessible, multi-company workforce, safety, field-operations and business administration platform. Every role must be able to complete its authorized work end to end. Eliminate redundant paperwork, manual report filing and repeated entry. Preserve legally required safety decisions, approvals, evidence and accountability.

## Non-negotiable usability
- Enter a fact once at its authoritative source and reuse it in reports, dashboards, payroll preparation and cost tracking.
- Automate repetitive administration for every role, not only foremen. Present exceptions and required decisions, not unnecessary forms or alerts.
- Mobile-first field experience, efficient desktop office workflows, offline draft/save/resume and conflict-aware synchronization.
- Accessible interfaces: plain language, keyboard and screen-reader support, adjustable text, and optional voice-assisted entry subject to confirmation.
- No decorative-only buttons, dead ends, or claims of completed functionality without end-to-end tests.

## Role-specific jobs and permissions
- Employees: hiring, onboarding, safety documents, qualifications, FLHA, assignments, own time and records; no company financials or others' wages.
- Foremen: crew scheduling, FLHA revision review, daily production, time and resources, exceptions and shift approval; no automatic wage/rate visibility.
- Superintendents: multi-crew staffing, operations, production, safety and project oversight; finances only when granted.
- Safety: approved JSA/SOP/SWP/policy/orientation library, incidents, inspections, qualifications, controlled revisions and human approval.
- HR: hiring, onboarding, personnel and certifications; not automatically budgets.
- Payroll: verified hours, overtime and corrections, final approval and export; separate submitter/approver.
- Accounting/project controls: cost codes, equipment/material/labour allocation, budgets, costing and exports; not automatically HR records.
- Management: authorized company/project performance, staffing, profitability and risk dashboards.
- Administrators: company setup, role grants, integrations and audit settings with separation of duties.

## Integrated workflows
1. Company safety library: bulk document intake, review, approval, versioning, role assignment, mobile reading and revision-specific acknowledgement with identity/time evidence.
2. Safety/FLHA: simple No Changes or Update flows; meaningful hazard/control changes create revisions, worker review and exact-revision foreman approval or return; AI cannot silently approve.
3. Crew field operations: assignments, verified hours, breaks, job changes, equipment, materials, fuel, production, rentals, subcontractors and evidence.
4. Daily reporting: generate drafts from verified actuals, flag missing/conflicting records, and let foremen review/approve exceptions. Planned FLHA work must never become actual hours, quantities or charges automatically.
5. Payroll preparation: verified hours and applicable rules, foreman approval, office approval and export; full statutory payroll is a later compliance project.
6. Job costing: company cost codes, approved rates, allocations, duplicate-charge prevention, budget versus actual and unit production.
7. Office and management dashboards: role-scoped progress, safety and compliance exceptions, qualifications, approvals and authorized financials.
8. Optional future AI Focus and AI Exec adapters, secure and versioned; each app remains independently usable.

## Shared architecture
Tenant isolation and least privilege enforced in APIs/data, not only hidden UI. Auditable changes, revision and source provenance, encryption of sensitive data, retention, backup and recovery. Offline edits remain pending until validated; synchronize idempotently and resolve conflicts. Reuse verified facts across modules without duplicate payroll, costs or audit events. Human safety and payroll approvals remain mandatory.

## Development and reuse policy
Research before building. Reuse only useful, narrow, maintained and legally compatible components after license, security, dependencies and attribution checks. Do not copy proprietary or GPL/AGPL code without legal review. Keep existing useful functionality and data through explicit tested migrations and rollback; V39/V40 labels are NOT blanket compatibility constraints. This specification supersedes legacy-version requirements in older planning documents.

Priority: verify current CI; build a fictional enter-once daily-report and exception-review foundation with tests; establish real browser E2E; then authenticated multi-tenant storage/offline sync and complete cross-module flows. No deployment, publication, spending or live-data changes without approval. Always distinguish planned, committed, tested and production-ready.
