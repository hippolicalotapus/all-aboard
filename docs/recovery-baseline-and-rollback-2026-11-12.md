# Recovery baseline and rollback procedure (2026-11-12)

This is a **new recovery procedure**, not the original V33 rollback archive or V35 checksum manifest. It does not certify historical equivalence.

## Generate a verified source inventory

From a clean clone with Python 3 and Git:

```sh
git fetch origin
git switch development
python3 tools/recovery_sha256_baseline.py --revision HEAD --output recovery-baseline.json
```

The inventory records the resolved commit, tracked file paths, file lengths, and SHA-256 digests of the exact Git blob contents. Keep the JSON as a release artifact or in a separate archive; generating it does not modify application source. Verify its revision matches the intended commit.

## Create a reversible rollback snapshot

Before any application changes, record the known-good commit:

```sh
git rev-parse HEAD
git branch recovery/known-good-20261112 HEAD
git bundle create all-aboard-known-good-20261112.bundle --all
git bundle verify all-aboard-known-good-20261112.bundle
```

Keep the bundle outside the repository in protected storage. Do **not** force-push or reset a shared development branch. To restore safely, create a new branch from the saved commit and open a reviewed pull request:

```sh
git switch -c recovery/restore-test recovery/known-good-20261112
```

Run the repository's current test suite and GitHub Actions on the recovery branch before any merge. Verify the bundle by cloning it into a temporary directory if an independent restore test is required.

## Outstanding verification

- Execute the checksum tool and inspect its output on a real checkout.
- Run regression tests and validate a bundle restore in an isolated clone.
- Preserve original V35/V33 artifacts if they surface; never claim a regenerated manifest proves equivalence.
- No deployment or publishing is authorized by this procedure.
