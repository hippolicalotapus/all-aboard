#!/usr/bin/env python3
"""Generate a reproducible SHA-256 inventory of tracked files at a Git revision.

This is a NEW baseline, not a reconstruction of any historical V35 manifest.
Requires Python 3 and Git. Does not change repository files.
"""
import argparse
import hashlib
import json
import subprocess
from datetime import datetime, timezone

def git(*args):
    return subprocess.check_output(["git", *args])

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--revision", default="HEAD")
    p.add_argument("--output", default="-", help="JSON output path, or - for stdout")
    a = p.parse_args()
    commit = git("rev-parse", "--verify", a.revision + "^{commit}").decode().strip()
    paths = git("ls-tree", "-r", "-z", "--name-only", commit).split(b"\0")
    entries = []
    for raw in paths:
        if not raw:
            continue
        path = raw.decode("utf-8", "surrogateescape")
        data = git("show", commit + ":" + path)
        entries.append({"path": path, "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)})
    result = {"schema": "all-aboard-new-baseline-v1", "historical_v35_equivalence_verified": False,
              "revision": commit, "generated_utc": datetime.now(timezone.utc).isoformat(),
              "files": entries}
    text = json.dumps(result, indent=2, ensure_ascii=True) + "\n"
    if a.output == "-":
        print(text, end="")
    else:
        with open(a.output, "w", encoding="utf-8") as f:
            f.write(text)
    print(f"Inventoried {len(entries)} tracked files from {commit}", file=__import__("sys").stderr)

if __name__ == "__main__":
    main()
