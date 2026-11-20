# All Aboard: Approved Product Direction — Integrated Workforce Safety & Field Operations
Date: 2026-11-13
Status: LOCKED PRODUCT REQUIREMENTS / PLANNED, NOT IMPLEMENTED
Scope: All Aboard, with future opt-in integration to AI Focus and AI Exec.

## Non-negotiable architecture
- Keep All Aboard, AI Focus, and AI Exec independently usable; integrate via a secure, versioned adapter rather than merging or modifying the existing apps prematurely.
- All Aboard is the management, onboarding, records and field-operations hub; AI Focus assists with hazard recognition, FLHA and field procedures; AI Exec assists with task sequencing, execution and resumption.
- Preserve V39 data compatibility, V40 recovery and rollback guarantees, and existing wallet isolation. Start integration with fictional data and automated tests. Do not deploy, publish, spend, or change live systems without approval.
- Company isolation, least-privilege access, offline capability, auditability, accessibility and human safety oversight are baseline requirements.

## Digital onboarding and company safety documents
- Company safety department uploads existing approved JSAs (job safety analyses), SOPs (standard operating procedures), SWPs (safe work procedures), orientations, policies and manuals; support bulk upload, document types, versioning and approved translations.
- AI may classify and suggest assignments but must not silently rewrite, approve or publish safety content. Authorized safety personnel approve classification, release and revisions.
- Automatically populate relevant documents in each employee's mobile onboarding package based on position/duties; employees independently read and electronically acknowledge documents, eliminating physical binders and signature queues.
- Save/resume, offline access to synchronized approved documents, completion tracking, revision-specific signatures, identity/time audit evidence, and renewed acknowledgement when relevant revisions are published.
- Document acknowledgement is not proof of training competency or task authorization. Qualifications are established during hiring/onboarding and centrally maintained; do not recheck at every jobsite. Revisit on expiry, changed assignment or mandated retraining.

## Simple FLHA workflow
- One practical FLHA for the applicable work period, with easy updates after breaks or changed work conditions.
- Employee chooses 'No Changes — Continue Work' after reviewing conditions or 'Update FLHA' for new/changed task, hazard or controls. Avoid repetitive forms and unnecessary timestamps.
- Timestamp meaningful new/changed tasks, hazards and controls, preserving immutable revision history; retain minimal acknowledgement evidence for 'No Changes' without forcing a new assessment.
- New hazards/controls require appropriate worker review and acknowledgement before affected work resumes. AI is assistance, not a safety clearance.
- FLHAs completed in the employee/AI Focus experience appear in assigned foreman's All Aboard portal. Foreman reads, signs off on the exact revision or returns for correction; later material revisions require fresh review. Superintendent sees crew-level outstanding/completed status. No end-of-day paper collection.

## Field operations and reporting
- Foremen manage crew assignments, attendance, hours, equipment/tools/materials used, work quantities, and daily reports. Superintendents see multi-crew/project rollups; project managers and office roles see their authorized information.
- Extract planned tasks and candidate resources from completed FLHAs, suggest approved company cost-code matches, and prefill a daily field production report. FLHAs do not prove actual hours, quantities or equipment usage.
- Foreman confirms actual work, labour hours, equipment hours, tool usage, material quantities, vehicle/fuel, rentals, subcontractors and other costs; prevent duplicate shared equipment charges. Report to superintendent/project management.
- Track equipment identifiers, operator, assignment, hour-meter, maintenance, downtime, rentals and jobsite allocation.
- Support cost categories: labour, heavy equipment, tools, materials/consumables, vehicles/fuel, rentals, subcontractors and other direct expenses. Use company-imported job cost codes, configurable charge rates/allocation methods, budget vs actual and unit production costs. Never automatically expense a reusable tool's entire purchase price to one task.

## Timekeeping and payroll
- Employees enter actual work time or clock in/out, including breaks and job changes; foremen may submit/approve crew time; office/payroll finalizes with an audit trail.
- Configurable overtime and travel/shift rules, actual hours by task/project, corrections, approvals, payroll export/integration, employee visibility of their own records.
- FLHA data may suggest tasks but MUST NOT determine payable hours. Pay must be based on verified time and applicable legal rules.
- Phase 1: timekeeping, approvals, job costing and payroll export. Phase 2 (separate compliance/security project): optional full payroll calculations, deductions, pay statements and remittances.

## Role-based access and privacy
- Employee: personal onboarding, approved safety library, own FLHAs, own assignments, own time/pay information; NO cost codes, billing rates, budgets or company financials.
- Foreman: assigned crew, FLHA reviews/signatures, crew hours, operational resource quantities and daily reports; not necessarily monetary rates or wage data.
- Superintendent: authorized multi-crew operations, staffing, productivity, equipment and project summaries; financial visibility only if explicitly granted, without automatically exposing individual wages.
- HR/payroll: employee records and compensation/payroll functions, not automatically project budgets.
- Accounting/project controls: cost codes, budgets, resource rates, job costing, accounting exports, without automatic access to confidential personnel records.
- Company admin: company configuration and delegated permissions, subject to audit and separation of duties.
- Enforce permissions on the server/API and data layer, not just hidden UI; strict tenant isolation, no self-approval of payroll, immutable audit trails.

## Suggested implementation order (future milestones)
1. V40 recovery/browser E2E stabilization first.
2. Company safety library, controlled publication and digital onboarding acknowledgements.
3. FLHA revision model and foreman review/approval integration.
4. Field crew time and resource tracking with company cost codes and production reports.
5. Payroll export and superintendent/project dashboards.
6. Opt-in AI Focus / AI Exec adapters, verified with fictional data and no existing-app regressions.

This document captures approved product direction from the user's November 13 discussion; it is not a claim that these features have been implemented, tested, or deployed.
