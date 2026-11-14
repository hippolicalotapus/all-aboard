# V40 fictional-data pilot acceptance checklist

This is an internal test plan, not release approval. Preserve V39 backups and all existing V40 review overlays.

## Acceptance scenarios
1. Create fictional onboarding tasks with owners, deadlines and acknowledgements. Confirm completion and acknowledgement are not mistaken for manager approval.
2. Request review and attach a non-sensitive fictional evidence label. Confirm review status changes independently from task completion.
3. Edit a deadline after review. Confirm evidence and review state remain unchanged.
4. Import an unmodified V39 backup. Confirm no review fields are required and every task defaults to not_requested.
5. Attempt malformed review state, unknown task ID, invalid URL and more than ten evidence references. Reject each without altering saved data.
6. Generate a fictional daily report. Confirm incomplete tasks, review-pending tasks and evidence references are visible without claiming approvals.
7. Test browser keyboard navigation and narrow-screen layout before any human pilot.

## Required evidence
Record exact commit SHA, test command, exit code, mobile-browser observations and any failures. A successful CI run does not establish privacy, authentication or real-user readiness.

## Restrictions
No real employee information, deployment, paid services, or release. Review sign-off and secure shared storage are prerequisites to a real pilot.
