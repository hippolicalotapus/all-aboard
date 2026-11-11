#!/usr/bin/env python3
"""Run every checked-in offline regression module.

Browser end-to-end and real Android tests are separate release gates.
"""
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
TESTS = ROOT / "tests"
REQUIRED = ("check_v33.py", "runtime_checks.js", "check_inline_js.py")
for name in REQUIRED:
    if not (TESTS / name).is_file():
        print(f"FAIL: required regression module missing: {name}", flush=True)
        sys.exit(1)

checks = [["python3", "tests/check_v33.py"],
          ["python3", "tests/check_inline_js.py", "source/all-aboard-personal.html"],
          ]
# Syntax-check every standalone source module, including newly added ones.
source_modules = sorted((ROOT / "source").glob("*.js"))
if not source_modules:
    print("FAIL: no standalone JavaScript source modules found", flush=True)
    sys.exit(1)
checks.extend(["node", "--check", str(path.relative_to(ROOT))] for path in source_modules)
checks.extend(["node", str(path.relative_to(ROOT))] for path in sorted(TESTS.glob("*_checks.js")))
if not any("runtime_checks.js" in cmd for cmd in checks):
    print("FAIL: runtime_checks.js was not discovered", flush=True)
    sys.exit(1)

failed = []
for cmd in checks:
    print("RUN:", " ".join(cmd), flush=True)
    result = subprocess.run(cmd, cwd=ROOT, check=False)
    if result.returncode:
        failed.append((" ".join(cmd), result.returncode))

if not failed:
    build = ["python3", "tools/build_test_release.py"]
    print("RUN:", " ".join(build), flush=True)
    result = subprocess.run(build, cwd=ROOT, check=False)
    if result.returncode:
        failed.append((" ".join(build), result.returncode))
else:
    print("SKIP: release build because regression checks failed", flush=True)

print(f"Offline regression modules executed: {len(checks)}", flush=True)
print("Browser E2E and Android device tests: NOT RUN", flush=True)
for name, code in failed:
    print(f"FAIL: {name} (exit {code})", flush=True)
sys.exit(1 if failed else 0)
