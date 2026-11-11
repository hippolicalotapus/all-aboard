#!/usr/bin/env python3
"""Run offline regression checks; do not misrepresent blocked browser tests."""
from pathlib import Path
import subprocess,sys
root=Path(__file__).resolve().parents[1]
checks=[['python3','tests/check_v33.py'],['node','tests/runtime_checks.js'],['node','tests/workflow_checks.js']]
failed=False
for cmd in checks:
    print('RUN:', ' '.join(cmd),flush=True)
    p=subprocess.run(cmd,cwd=root)
    if p.returncode: failed=True
print('BROWSER E2E: NOT RUN (requires unrestricted Chromium and Android validation)',flush=True)
sys.exit(1 if failed else 0)
