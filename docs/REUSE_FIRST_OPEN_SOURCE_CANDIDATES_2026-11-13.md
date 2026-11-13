# All Aboard — Reuse-first development policy and candidate inventory
Date: 2026-11-13
Status: Research candidates; no third-party code imported or deployed.

## Standing policy
Before building a substantial module from scratch, search for mature, maintained, legally reusable components, existing APIs and established standards. Prefer integration over copying when it reduces cost, maintenance, security and licensing risk. Preserve All Aboard V39/V40 compatibility, wallet isolation and existing user data. No deployment, purchases or paid services without approval.

## Candidate projects (verify upstream license and relevant code at adoption time)
- Frappe HR: https://github.com/frappe/hrms — onboarding, attendance, shift and payroll workflows. GPL-3.0; consider API integration and workflow reference before code copying.
- ERPNext: https://github.com/frappe/erpnext — project accounting, timesheets, purchasing and inventory. GPL-3.0; evaluate integration for job costing.
- Euron Open HRMS: https://github.com/euron-sde-team/euron-open-hrms — MIT-reported multi-tenant HR and role models. Evaluate maintenance, security and test quality before any adaptation.
- OCA Field Service: https://github.com/OCA/field-service — field service workflow; AGPL-3.0 reported, consider integration or concepts.
- OrangeHRM: https://github.com/orangehrm/orangehrm — HR records and workflows; GPL-3.0.

## Adoption checklist
1. Confirm the exact upstream repository, commit, SPDX license, dependencies and attribution requirements.
2. Check maintenance, security advisories, architecture compatibility, code quality, tests and offline/mobile support.
3. Evaluate API integration, reusable independent library, or original implementation inspired by functionality. Never copy proprietary or unlicensed code, branding, artwork or confidential data.
4. Record source URL, commit, license, modification and notices for every imported dependency.
5. Test tenant isolation, role enforcement, document revision binding, audit trails, offline sync and payroll/legal implications with fictional data.
6. Preserve existing V39/V40 regression suite and recovery baseline before release.
7. Avoid importing full ERP/HR suites into the existing app without an explicit migration decision.

## Priority
First examine lightweight licensed components for document upload, PDF viewing, acknowledgements and role-based onboarding; next assess payroll export, job costing and equipment tracking integrations. Build FLHA-specific safety workflows as narrowly scoped custom logic where no suitable maintained licensed component exists.
