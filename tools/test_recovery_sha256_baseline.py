#!/usr/bin/env python3
"""Offline smoke test for recovery_sha256_baseline.py; no external packages."""
import hashlib
import json
import pathlib
import subprocess
import sys
import tempfile

TOOL = pathlib.Path(__file__).with_name("recovery_sha256_baseline.py")

def run(*args, cwd=None):
    return subprocess.check_output(args, cwd=cwd, stderr=subprocess.PIPE)

def main():
    with tempfile.TemporaryDirectory() as tmp:
        root = pathlib.Path(tmp)
        run("git", "init", "-q", str(root))
        run("git", "config", "user.email", "test@example.invalid", cwd=root)
        run("git", "config", "user.name", "Recovery Test", cwd=root)
        payload = b"recovery test\x00\xff\n"
        (root / "binary.dat").write_bytes(payload)
        unusual_name = "résumé report.txt"
        unusual_payload = "Unicode filename verified\n".encode("utf-8")
        (root / unusual_name).write_bytes(unusual_payload)
        run("git", "add", "binary.dat", unusual_name, cwd=root)
        run("git", "commit", "-qm", "Fixture", cwd=root)
        head = run("git", "rev-parse", "HEAD", cwd=root).decode().strip()
        output = run(sys.executable, str(TOOL), "--revision", "HEAD", cwd=root)
        record = json.loads(output)
        assert record["revision"] == head
        assert record["historical_v35_equivalence_verified"] is False
        assert {entry["path"]: entry for entry in record["files"]} == {
            "binary.dat": {"path": "binary.dat", "sha256": hashlib.sha256(payload).hexdigest(), "bytes": len(payload)},
            unusual_name: {"path": unusual_name, "sha256": hashlib.sha256(unusual_payload).hexdigest(), "bytes": len(unusual_payload)},
        }
        # Uncommitted changes must not alter the committed inventory.
        (root / "binary.dat").write_bytes(b"changed working tree")
        again = json.loads(run(sys.executable, str(TOOL), cwd=root))
        assert again["files"] == record["files"]
    print("Recovery baseline smoke test passed")

if __name__ == "__main__":
    main()
