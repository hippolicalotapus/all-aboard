# Daily operations quantity corrections

Baseline: `391a6e1ea2a11bd291e21a62958deeddeb3e30a0` on `development`.

The fictional daily-operations pilot now exposes the existing report lifecycle's correction action for verified time, production and equipment entries while the foreman is reviewing a draft. A correction requires a valid non-negative quantity and a reason of 5–500 characters. The audit history records the original and corrected quantity and the reason. Cancel discards uncommitted editor values. Approved reports require reopening before editing; planned/unverified entries remain excluded from actuals; Accounting has no edit controls.

`python3 tests/run_all.py` passed all 77 offline regression modules, including the correction UI regression. The separately built V39 wallet SHA256 remains `e54afe5ee6df8bdfbc99aadd5033c38d63328fc5ce949975c29221da4fb97bf0`; that wallet artifact does not include the separate daily pilot.

Native Chromium at 390px rejected a correction without a reason, accepted 8 → 7.5 hours with a reason, retained that event in history, allowed approval only after dismissing the fictional planned exception, and showed 7.5 hours with zero action buttons in Accounting. This is an in-memory fictional demonstration, not server authorization or payroll processing. No deployment, Actions, spending or real employee data was involved.
