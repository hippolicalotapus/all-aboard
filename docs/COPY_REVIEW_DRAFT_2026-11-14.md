# Copyable review drafts — mobile checkpoint

Source baseline: development 37049e78b58d415d496510f669c5a88f6590109d. Adds a user-initiated Copy review draft action after generation, with a focusable readable report. It copies the visible text locally; it does not submit a report or create an approval. No downloads or remote service are involved.

The button stays disabled without a fresh draft and is invalidated by scope changes or review saves. Clipboard refusal/unavailability preserves the report and explains manual text selection. Asynchronous completion distinguishes a copy requested for an older selection.

Verification: the new shipped-script UI scenarios failed before the control existed, then passed. All 77 offline modules passed, including 18 shipped-script DOM scenarios. Self-contained artifact SHA256 e54afe5ee6df8bdfbc99aadd5033c38d63328fc5ce949975c29221da4fb97bf0. Real Chromium iframe viewport390px generated and copied a draft successfully, showed a375px document width with no horizontal overflow, then disabled copying and cleared the draft on role change. This is narrow-screen browser verification, not a physical Android-device test.
