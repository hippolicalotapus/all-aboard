# Daily report reopen reason checkpoint

Base: `1cdb546fa3605998f20e490310c6a4fc877eb414` on `development`. All 110 baseline source blobs were verified against the complete GitHub tree in an isolated copy.

The daily operations pilot previously reopened approved reports with a canned reason. An approved foreman view now presents a labeled reason field and passes exactly what the user entered to the existing lifecycle validator. Missing, whitespace and short reasons cannot change approval or add audit events. Domain authorization, workflow identity, revisions, storage and audit semantics are unchanged. A subsequent approval starts with an empty reason field; draft and read-only views hide it.

The shipped-script interaction regression failed against the previous behavior, then passed after the change. It exercises the real lifecycle module and checks exact audit text, rejection without events, visibility and fresh values between cycles. The optional browser smoke now enters a reason; it was not executed for this patch.

Full `python3 tests/run_all.py` passes all 77 documented modules. Explicit inline-JavaScript verification and the build also pass. The lead independently reran the complete suite. Independent review passed for scope and quality. Wallet build SHA256 remains `e54afe5ee6df8bdfbc99aadd5033c38d63328fc5ce949975c29221da4fb97bf0`.

Actual Chromium/Android verification remains outstanding: this environment prevents Chromium socket/ptrace operations. No browser result is inferred from the script fixture tests.

Prepared on a separate development branch to avoid workflows restricted to `development`. No workflow configuration, deployment, publication or spending changes. Commit includes skip markers and no pull request is opened.
