# All Aboard — Selective reuse decisions
Date: 2026-11-13
Status: Approved product direction; no third-party source imported.

## Keep only useful capabilities
- Frappe HR (https://github.com/frappe/hrms): onboarding assignment/completion, attendance, shifts, time approval, payroll export and integration patterns.
- ERPNext (https://github.com/frappe/erpnext): project cost codes, resource allocation, materials, equipment, budgets and accounting integration patterns.
- OCA Field Service (https://github.com/OCA/field-service): field assignments, work orders, vehicle/equipment scheduling, time entry and operational reporting patterns.
- Reuse specific maintained permissively licensed components only after confirming exact license, upstream revision, notices, dependency footprint and security.
- Integrate established systems through stable APIs where useful, instead of importing full platforms.

## Discard
- Unrelated HR appraisal, recruiting, sales, CRM, manufacturing and enterprise workflows unless directly needed by approved All Aboard scope.
- Duplicate UI, unnecessary frameworks, heavyweight dependencies, vendor branding, proprietary code, and unmaintained or insecure components.
- Anything that forces employees to see cost codes, billing rates, budgets or payroll administration.
- Any dependency that compromises tenant isolation, offline support, V39/V40 compatibility, wallet isolation or approval workflows.

## Safety and legal gates
- Frappe HR and ERPNext are GPL-3.0; OCA field-service repository is AGPL-3.0 and modules can have individual licenses. Do not copy code into All Aboard until obligations are reviewed.
- Functionality can be independently implemented based on requirements without copying protected expression.
- Track origin, revision, license, security, tests and modification for each adopted component.
- No deployments, spending, live data or unapproved publication.

## Next implementation focus
Keep isolated fictional-data onboarding and foreman FLHA pilot; verify CI; then integrate only narrow document-viewer and signing UI components if license/security/size justify them. Preserve existing test and recovery gates.
