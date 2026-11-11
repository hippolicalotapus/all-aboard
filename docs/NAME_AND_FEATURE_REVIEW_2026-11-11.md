# Replacement name and competitor feature requirements

Reviewed 11 November 2026. This is a development decision record, not trademark clearance or a production release.

## Naming decision

Retire All Aboard as a proposed public brand: CloudNow and Cadalys already advertise employee onboarding software under that name. Keep the existing repository, filenames, localStorage keys and backup format until a replacement is selected; these identifiers preserve continuity and do not establish rights in a brand.

| Candidate | Meaning and fit | Preliminary result | Recommendation |
| --- | --- | --- | --- |
| Onboard to Work | Explains the journey from employee onboarding to starting work | Exact-name web queries returned no results; combined CIPO trademark query returned zero results | Leading candidate for further checks; descriptive and may be difficult to protect broadly |
| First Shift Ready | Clear promise for frontline workers preparing for a first shift | Exact-name web queries returned no results; combined CIPO trademark query returned zero results | Alternative if we focus on frontline employers; narrower than the full employee lifecycle |
| Hire to Ready | Describes preparation after hiring | No exact-name web hit and no exact CIPO hit in the combined query, but broader search found HireReady HR products | Reject because of similar existing software names |
| CrewStart | Clear crew onboarding meaning | Existing Sargent-Disc onboarding product | Reject |
| RosterSpring | Employee list plus fresh start | Earlier preliminary screening found no exact match | Retired from shortlist: meaning is unclear for this product |

CIPO live UI search: Trademark field, no Nice-class or status restriction added, query `HireToReady OR "Hire to Ready" OR OnboardToWork OR "Onboard to Work" OR FirstShiftReady OR "First Shift Ready"`, zero entries observed. Database displayed update date 2026-11-11. General web queries used the joined and spaced variants. No name has been selected or applied to the application.

Open checks: confusingly similar trademarks and trade names, Alberta and other relevant business registries, NUANS where appropriate, domain registration availability and price, social/app-store handles, and relevant international markets. No paid report, domain, mailbox, trademark filing or registration has been purchased. A zero-result search is not a legal opinion or a guarantee of availability. Do not advertise a candidate as legally cleared.

## Public evidence reviewed

1. CloudNow All-Aboard, developer's Google Play listing: https://play.google.com/store/apps/details?hl=en&id=com.cloudnowtech.allaboard . Advertises employee records, learning, benefits, performance, onboarding, analytics and check-in/check-out reminders. An earlier retrieved version of the listing also described location-based attendance, leave submission/manager decisions and announcements. Current listing has a shorter release note; historical claims are requirements to confirm in a demo, not verified current behavior.
2. Cadalys launch announcement: https://www.cadalys.com/news-events/cadalys-launches-all-aboard-for-workcom . Covers onboarding, reboarding, transfers and offboarding on Salesforce/Work.com.
3. Cadalys Salesforce listing: https://appexchange.salesforce.com/appxListingDetail?listingId=a0N3u00000MBo3yEAD . Retrieved in the preceding research turn; re-open failed in this turn. Advertises role/location/profile procedures, coordination among departments, reporting to expose delays, audit functions and assigned learning. It is older listing evidence, not a hands-on assessment.
4. Sargent-Disc CrewStart training: https://www.sargent-disc.com/services/training/crewstart/ and tutorials: https://www.sargent-disc.com/2020/03/28/crewstart-tutorials/ . Describes digital forms/contracts, signatures, customizable document packs, approval chains and invitation-to-approval workflow. Additional public documentation describes timesheets and payroll exports.
5. CIPO database: https://ised-isde.canada.ca/cipo/trademark-search/srch . Trademark guidance: https://ised-isde.canada.ca/site/canadian-intellectual-property-office/en/trademarks/trademarks-guide . Clearly descriptive marks and similar existing marks require attention before adopting a name.

Only public descriptions were inspected. No competitor account, private implementation, paid manual or proprietary source was accessed. We will implement original code and wording. Product-level ideas are requirements; third-party assets, text and software need appropriate permission or licensing before reuse. No claim of comparative superiority is established by this review.

## Feature parity register

The user's requirement is to cover every advertised capability of these researched products, plus our existing capabilities. Broad marketing labels must be decomposed into testable workflows before being counted as delivered.

| Capability | Evidence | Our current state | Build milestone |
| --- | --- | --- | --- |
| Employee profile and record management | CloudNow | Certificate wallet prototype only; no employer directory | B: secure employer workspace |
| New hire onboarding | Both | Saved checklist prototype (V37; local fictional data) | A: persist plans, task owners and deadlines |
| Returning employee onboarding | Cadalys | Saved checklist prototype (V37; local fictional data) | A |
| Role transfers | Cadalys | Saved checklist prototype (V37; local fictional data) | A |
| Offboarding | Cadalys | Saved checklist for handover, equipment return, access closure and final review | A; actual account revocation requires integration |
| Role/location/profile-based procedures | Cadalys | Office/field roles and office/remote/jobsite templates; no employee profiles | A/B |
| Cross-department task ownership | Cadalys | Owner labels only; no assignments or authenticated approvers | B |
| Progress and bottleneck dashboards | Both | Saved task deadlines, filters and cross-plan overdue/due-today attention queue (V39); no staff reporting workspace | B |
| Audit history and compliance reporting | Cadalys | Local duplicate review; no employer audit trail | B |
| Training assignments and learning management | CloudNow/Cadalys | Certificate storage; new training-review checklist item | C: course assignment, content, assessments and completion records |
| Benefits administration | CloudNow | Not implemented | D: eligibility, enrolment workflows and administrator review |
| Performance tracking | CloudNow | Not implemented | D: goals, review cycles and manager/employee feedback |
| Attendance check-in/check-out and reminders | CloudNow | Not implemented | D |
| Location-based attendance | CloudNow historical listing | Not implemented; current detail needs confirmation | D: explicit permission, manual correction and location handling |
| Leave requests and manager decisions | CloudNow historical listing | Not implemented; current detail needs confirmation | D |
| Announcements/notifications | CloudNow historical listing | Not implemented; calendar export is separate | B/D |
| Invitations and onboarding document packs | CrewStart | Not implemented | B |
| Digital forms, contracts and signatures | CrewStart | Not implemented | C: document versioning, signing intent, signer identity and evidence |
| Multi-stage approvals, rejection and corrections | CrewStart | Checklist acknowledgements only | B/C |
| Timesheets and payroll exports | CrewStart | Not implemented | D: reviewed exports first; provider integrations later |
| Salesforce/Work.com integration | Cadalys | Not implemented | E: capability parity plus optional integration; no claim of Salesforce compatibility |

Milestone A is a prototype, not full parity with authenticated and persistent employer workflows. No payroll processing, benefits coverage, signature validity, compliance certification or training authenticity is implied.

## Our proposed advantages and acceptance criteria

These are targets to test with customers, not verified gaps in competitors:

- Worker-controlled reusable certificate wallet: share only selected records with a chosen employer, with expiry/revocation and an access trail. Employer records remain separate when a worker leaves.
- Explain readiness: show each missing requirement, its owner and corrective action. Distinguish uploaded, reviewed, expired and issuer-verified evidence. Never infer authenticity from a QR code or a date.
- Repeat assignments without repeat typing: reuse approved evidence subject to current role/site requirements, expiry and employer acceptance. Preserve historical plans.
- Mobile field use: test on S25 Ultra and Z Fold 7, support low connectivity, preserve drafts, queue sync safely and surface conflicts.
- Less administration: prevent duplicate records, group reminders, allow reviewed CSV import/export and provide clear exception queues.

Do not try to outperform complete HR suites by feature count alone. Pilot success should be measured by time to finish onboarding, repeated data entry avoided, missing-evidence rate, overdue tasks and successful mobile completion. Obtain baseline measurements and compare the same tasks before making marketing claims.

## V36 implementation and validation

Added a self-contained checklist interface to the existing HTML prototype and a tested model for four lifecycle processes, two roles and three work settings. Each task names an owner. Incomplete final supervisor acknowledgement remains visible as a missing step. Acknowledgements are simulated, session-only and explicitly excluded from certificate backups; they do not verify a person's identity, authority or training. This is groundwork for the secure employer workspace.

Preserved `onboardflow-fictional-wallet-v2` localStorage, `onboardflow-fictional-v2` backup format, source path and existing certificate behavior. Final branding remains pending selection and further screening.

Executed: existing 10 regression assertions, 9 Node VM runtime checks, 10 new workflow scenarios, embedded model/source equality and inline JavaScript syntax validation. Browser integration and Samsung device testing were not run. No APK, production deployment, paid service, customer outreach or completed name registration is claimed.

## V37 follow-up

Checklist progress now persists separately, with its own backup, inspected restore and confirmed reset. See V37_CHECKLIST_RECOVERY.md for validation and remaining restrictions. The V36 section above is historical evidence, not current persistence behavior.

## V39 follow-up

Task deadlines and a cross-plan attention queue are implemented in the fictional-data prototype. See V39_TASK_DEADLINES.md for tested behavior and limitations. Secure employer assignments, authenticated approvals and server-backed employee records remain unimplemented.
